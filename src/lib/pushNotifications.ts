import { PushNotifications } from '@capacitor/push-notifications';
import { Capacitor } from '@capacitor/core';
import { updateUserProfile } from './firestore';

/**
 * Initialises push notifications for the current user.
 * - Requests permission
 * - Registers with FCM/APNs
 * - Saves the device token to Firestore under the user's fcmTokens array
 * - Sets up foreground notification listener
 *
 * Safe to call multiple times — checks platform first.
 */
// Writes a debug log entry to Firestore so we can see it without a Mac
const debugLog = async (userId: string, message: string, data?: any) => {
  try {
    const { db } = await import('./firebase');
    const { doc, setDoc, serverTimestamp } = await import('firebase/firestore');
    await setDoc(doc(db, 'users', userId, 'pushDebug', String(Date.now())), {
      message,
      data: data ? JSON.stringify(data) : null,
      ts: serverTimestamp(),
    });
  } catch (_) {}
};

export const initialisePushNotifications = async (userId: string): Promise<void> => {
  // Only run on real devices (iOS/Android) — not in browser
  if (!Capacitor.isNativePlatform()) {
    return;
  }

  try {
    await debugLog(userId, '1. isNativePlatform = true, starting push init');

    // ── 1. Request permission ──────────────────────────────────────
    const permResult = await PushNotifications.requestPermissions();
    await debugLog(userId, '2. Permission result', permResult);

    if (permResult.receive !== 'granted') {
      await debugLog(userId, '3. Permission DENIED - stopping');
      return;
    }

    await debugLog(userId, '3. Permission granted, adding listeners then calling register()');

    // ── 2. Add listeners BEFORE calling register() ─────────────────
    PushNotifications.addListener('registration', async (token) => {
      await debugLog(userId, '5. GOT TOKEN', { token: token.value });
      try {
        const { getUserProfile } = await import('./firestore');
        const profile = await getUserProfile(userId);
        const existing = profile.fcmTokens ?? [];

        if (!existing.includes(token.value)) {
          await updateUserProfile(userId, {
            fcmTokens: [...existing, token.value],
          });
          await debugLog(userId, '6. Token saved to Firestore successfully');
        } else {
          await debugLog(userId, '6. Token already exists, skipping');
        }
      } catch (e: any) {
        await debugLog(userId, '6. ERROR saving token', { error: e?.message });
      }
    });

    PushNotifications.addListener('registrationError', async (err) => {
      await debugLog(userId, '5. REGISTRATION ERROR', err);
    });

    PushNotifications.addListener('pushNotificationReceived', (notification) => {
      console.log('Foreground notification:', notification);
    });

    PushNotifications.addListener('pushNotificationActionPerformed', (action) => {
      console.log('Notification tapped:', action);
      const type = action.notification.data?.type;
      if (type === 'due_soon') {
        window.location.href = '/bills';
      }
    });

    // ── 3. Now register with APNs/FCM ─────────────────────────────
    await PushNotifications.register();
    await debugLog(userId, '4. register() called, waiting for token...');

  } catch (e: any) {
    await debugLog(userId, 'EXCEPTION in initialisePushNotifications', { error: e?.message });
  }
};

/**
 * Removes the current device's FCM token from Firestore on sign out.
 * This prevents notifications being sent to signed-out devices.
 */
export const removePushToken = async (userId: string): Promise<void> => {
  if (!Capacitor.isNativePlatform()) return;

  try {
    const { getUserProfile, updateUserProfile: update } = await import('./firestore');
    const token = await getCurrentToken();
    if (!token) return;

    const profile = await getUserProfile(userId);
    const filtered = (profile.fcmTokens ?? []).filter(t => t !== token);
    await update(userId, { fcmTokens: filtered });
  } catch (e) {
    console.error('Failed to remove FCM token:', e);
  }
};

const getCurrentToken = async (): Promise<string | null> => {
  return new Promise((resolve) => {
    PushNotifications.addListener('registration', (token) => {
      resolve(token.value);
    });
    PushNotifications.register().catch(() => resolve(null));
  });
};
