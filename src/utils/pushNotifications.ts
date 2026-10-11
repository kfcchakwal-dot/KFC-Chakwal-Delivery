import { doc, setDoc, deleteDoc, getDoc } from 'firebase/firestore';
import { getMessaging, getToken, deleteToken } from 'firebase/messaging';
import { app, db } from '../lib/firebase';
import firebaseConfig from '../../firebase-applet-config.json';

const PUSH_TOKEN_STORAGE_KEY = 'kfc_customer_fcm_token';
const PUSH_DECLINED_KEY = 'kfc_push_declined_explicitly';

export interface PushSubscriptionStatus {
  isSupported: boolean;
  permission: NotificationPermission;
  isSubscribed: boolean;
  token: string | null;
  hasDeclined: boolean;
}

/**
 * Checks whether Web Push and Service Workers are supported in the current browser.
 */
export function isPushNotificationSupported(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    'Notification' in window &&
    'serviceWorker' in navigator &&
    'PushManager' in window
  );
}

/**
 * Returns current customer push notification state.
 */
export function getPushSubscriptionStatus(): PushSubscriptionStatus {
  if (!isPushNotificationSupported()) {
    return {
      isSupported: false,
      permission: 'denied',
      isSubscribed: false,
      token: null,
      hasDeclined: false,
    };
  }

  const permission = Notification.permission;
  const token = localStorage.getItem(PUSH_TOKEN_STORAGE_KEY);
  const hasDeclined = localStorage.getItem(PUSH_DECLINED_KEY) === 'true';

  return {
    isSupported: true,
    permission,
    isSubscribed: permission === 'granted' && Boolean(token),
    token,
    hasDeclined: hasDeclined || permission === 'denied',
  };
}

/**
 * Helper to compute safe Firestore doc ID from token.
 */
function getTokenDocId(token: string): string {
  // Use safe base64 or sanitized string
  return token.replace(/[^a-zA-Z0-9_-]/g, '_').slice(-64);
}

/**
 * Subscribes the current customer device to FCM push notifications.
 * Called ONLY upon deliberate user action (e.g. clicking "Enable Notifications").
 */
export async function subscribeCustomerToPush(options?: {
  vapidKey?: string;
  customerId?: string | null;
}): Promise<{ success: boolean; token?: string; error?: string }> {
  if (!isPushNotificationSupported()) {
    return { success: false, error: 'Push notifications are not supported by this browser.' };
  }

  try {
    // 1. Request user permission
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      localStorage.setItem(PUSH_DECLINED_KEY, 'true');
      return { success: false, error: 'Notification permission was not granted by user.' };
    }

    localStorage.removeItem(PUSH_DECLINED_KEY);

    // 2. Ensure Service Worker is ready
    const registration = await navigator.serviceWorker.ready;

    // 3. Resolve VAPID public key
    const vapidKey =
      options?.vapidKey ||
      firebaseConfig.messagingVapidKey ||
      (window as any).__KFC_VAPID_KEY__ ||
      '';

    const messaging = getMessaging(app);

    const token = await getToken(messaging, {
      serviceWorkerRegistration: registration,
      vapidKey: vapidKey || undefined,
    });

    if (!token) {
      return { success: false, error: 'Failed to retrieve FCM push token from browser.' };
    }

    // 4. Register token in Firestore customerPushTokens collection
    const docId = getTokenDocId(token);
    const tokenDocRef = doc(db, 'customerPushTokens', docId);

    await setDoc(
      tokenDocRef,
      {
        id: docId,
        token,
        active: true,
        customerId: options?.customerId || null,
        platform: 'web',
        userAgent: navigator.userAgent.slice(0, 200),
        updatedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      },
      { merge: true }
    );

    // 5. Save in localStorage
    localStorage.setItem(PUSH_TOKEN_STORAGE_KEY, token);

    return { success: true, token };
  } catch (err: any) {
    console.error('Customer push subscription error:', err);
    return {
      success: false,
      error: err?.message || 'Failed to complete push notification subscription.',
    };
  }
}

/**
 * Unsubscribes current device from customer push notifications.
 */
export async function unsubscribeCustomerFromPush(): Promise<{ success: boolean; error?: string }> {
  try {
    const token = localStorage.getItem(PUSH_TOKEN_STORAGE_KEY);
    if (token) {
      const docId = getTokenDocId(token);
      try {
        await setDoc(doc(db, 'customerPushTokens', docId), { active: false, updatedAt: new Date().toISOString() }, { merge: true });
      } catch (dbErr) {
        console.warn('Deactivating token doc in Firestore notice:', dbErr);
      }

      try {
        const messaging = getMessaging(app);
        await deleteToken(messaging);
      } catch {}
    }

    localStorage.removeItem(PUSH_TOKEN_STORAGE_KEY);
    localStorage.setItem(PUSH_DECLINED_KEY, 'true');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to unsubscribe.' };
  }
}

/**
 * Returns currently stored FCM token on this device if any.
 */
export function getCurrentDeviceFcmToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(PUSH_TOKEN_STORAGE_KEY);
}

export interface SendPushPayload {
  title: string;
  message: string;
  imageUrl?: string;
  targetUrl?: string;
  type?: 'announcement' | 'discount' | 'promotion' | 'menu_update';
  testToken?: string;
}

export interface SendPushResult {
  success: boolean;
  isTest?: boolean;
  sentCount?: number;
  failureCount?: number;
  totalTokens?: number;
  prunedCount?: number;
  message?: string;
  error?: string;
  errors?: string[];
}

/**
 * Securely triggers server-side FCM push notification dispatch via /api/admin/send-push-notification.
 * No server keys are ever exposed in client code.
 */
export async function sendPushNotificationViaServer(
  payload: SendPushPayload,
  adminToken: string
): Promise<SendPushResult> {
  try {
    const res = await fetch('/api/admin/send-push-notification', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return {
        success: false,
        error: data.error || `Server responded with status ${res.status}`,
      };
    }

    return data;
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || 'Failed to communicate with push notification server',
    };
  }
}

/**
 * Loads recent notification dispatch history.
 */
export async function fetchNotificationHistory(adminToken: string): Promise<any[]> {
  try {
    const res = await fetch('/api/admin/notifications', {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

/**
 * Loads current count of active subscribed customer devices.
 */
export async function fetchSubscribersCount(adminToken: string): Promise<number> {
  try {
    const res = await fetch('/api/admin/subscribers-count', {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    if (!res.ok) return 0;
    const data = await res.json();
    return Number(data.activeCount || 0);
  } catch {
    return 0;
  }
}
