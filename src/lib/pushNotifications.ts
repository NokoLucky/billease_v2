import { FirebaseMessaging } from '@capacitor-firebase/messaging';
import { Capacitor } from '@capacitor/core';
import { updateUserProfile } from './firestore';

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
  if (!Capacitor.isNativePlatform()) return;

  try {
    await debugLog(userId, '1. Starting capacitor-firebase/messaging init');

    // ── 1. Request permission ────────────────────────────────────
    const permResult = await FirebaseMessaging.requestPermissions();
    await debugLog(userId, '2. Permission result', permResult);

    if (permResult.receive !== 'granted') {
      await debugLog(userId, '3. Permission DENIED');
      return;
    }

    await debugLog(userId, '3. Permission granted');

    // ── 2. Get FCM token directly — no listener needed ───────────
    const { token } = await FirebaseMessaging.getToken();
    await debugLog(userId, '4. Got FCM token', { token });

    if (!token) {
      await debugLog(userId, '5. Token was empty');
      return;
    }

    // ── 3. Save token to Firestore ───────────────────────────────
    try {
      const { getUserProfile } = await import('./firestore');
      const profile = await getUserProfile(userId);
      const existing = profile.fcmTokens ?? [];

      if (!existing.includes(token)) {
        await updateUserProfile(userId, {
          fcmTokens: [...existing, token],
        });
        await debugLog(userId, '5. Token saved to Firestore');
      } else {
        await debugLog(userId, '5. Token already exists');
      }
    } catch (e: any) {
      await debugLog(userId, '5. ERROR saving token', { error: e?.message });
    }

    // ── 4. Handle foreground notifications ──────────────────────
    FirebaseMessaging.addListener('notificationReceived', (event) => {
      console.log('Foreground notification:', event.notification);
    });

    // ── 5. Handle notification tap ───────────────────────────────
    FirebaseMessaging.addListener('notificationActionPerformed', (event) => {
      console.log('Notification tapped:', event);
      const type = (event.notification.data as Record<string, string>)?.type;
      if (type === 'due_soon') {
        window.location.href = '/bills';
      }
    });

  } catch (e: any) {
    await debugLog(userId, 'EXCEPTION', { error: e?.message });
  }
};

export const removePushToken = async (userId: string): Promise<void> => {
  if (!Capacitor.isNativePlatform()) return;

  try {
    const { token } = await FirebaseMessaging.getToken();
    if (!token) return;

    const { getUserProfile } = await import('./firestore');
    const profile = await getUserProfile(userId);
    const filtered = (profile.fcmTokens ?? []).filter(t => t !== token);
    await updateUserProfile(userId, { fcmTokens: filtered });

    await FirebaseMessaging.deleteToken();
  } catch (e) {
    console.error('Failed to remove FCM token:', e);
  }
};
