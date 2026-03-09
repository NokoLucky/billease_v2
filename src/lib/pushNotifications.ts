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
export const initialisePushNotifications = async (userId: string): Promise<void> => {
  // Only run on real devices (iOS/Android) — not in browser
  if (!Capacitor.isNativePlatform()) return;

  try {
    // ── 1. Request permission ──────────────────────────────────────
    const permResult = await PushNotifications.requestPermissions();

    if (permResult.receive !== 'granted') {
      console.log('Push notification permission denied');
      return;
    }

    // ── 2. Register with FCM / APNs ────────────────────────────────
    await PushNotifications.register();

    // ── 3. Save token to Firestore ─────────────────────────────────
    PushNotifications.addListener('registration', async (token) => {
      console.log('FCM token:', token.value);
      try {
        // Get current tokens to avoid duplicates
        const { getUserProfile } = await import('./firestore');
        const profile = await getUserProfile(userId);
        const existing = profile.fcmTokens ?? [];

        if (!existing.includes(token.value)) {
          await updateUserProfile(userId, {
            fcmTokens: [...existing, token.value],
          });
        }
      } catch (e) {
        console.error('Failed to save FCM token:', e);
      }
    });

    // ── 4. Handle registration errors ─────────────────────────────
    PushNotifications.addListener('registrationError', (err) => {
      console.error('Push registration error:', err);
    });

    // ── 5. Handle foreground notifications ────────────────────────
    // When app is open, show a local alert since iOS suppresses banners
    PushNotifications.addListener('pushNotificationReceived', (notification) => {
      console.log('Foreground notification:', notification);
      // You can show an IonToast or IonAlert here if needed
      // For now we just log — background/killed state is handled by the OS
    });

    // ── 6. Handle notification tap ────────────────────────────────
    PushNotifications.addListener('pushNotificationActionPerformed', (action) => {
      console.log('Notification tapped:', action);
      const type = action.notification.data?.type;
      // Route based on notification type
      if (type === 'due_soon') {
        window.location.href = '/bills';
      }
    });

  } catch (e) {
    console.error('Push notification setup failed:', e);
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
