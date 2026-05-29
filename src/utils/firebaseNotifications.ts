import { supabase } from '@/integrations/supabase/client';
import {
  initFirebase,
  requestFirebasePermission,
  onFirebaseMessage,
} from '@/integrations/firebase/config';

let isInitialized = false;

export async function initPushNotifications(): Promise<boolean> {
  if (isInitialized) return true;
  const success = initFirebase();
  if (success) {
    isInitialized = true;
    listenForForegroundMessages();
  }
  return success;
}

function listenForForegroundMessages(): void {
  onFirebaseMessage((payload) => {
    console.log('[Firebase] Foreground notification:', payload);
    if (payload.notification) {
      const n = new Notification(payload.notification.title || 'ElectroBuddy', {
        body:  payload.notification.body,
        icon:  payload.notification.icon || '/favicon_io/android-chrome-192x192.png',
        badge: '/favicon_io/android-chrome-192x192.png',
        data:  payload.data || {},
      });
      n.onclick = () => { window.focus(); n.close(); };
    }
  });
}

/**
 * Subscribe a user to FCM push notifications.
 *
 * Key fix: we no longer skip if a token already exists in the DB.
 * FCM tokens can expire or become invalid; we always fetch the current
 * token from Firebase and upsert it so the DB stays fresh.
 */
export async function subscribeToPush(userId: string): Promise<boolean> {
  try {
    // 1. Initialise Firebase SDK
    const success = await initPushNotifications();
    if (!success) {
      console.error('[Firebase] Failed to initialize');
      return false;
    }

    // 2. Get the current FCM token (requests permission if needed)
    const token = await requestFirebasePermission(userId);
    if (!token) {
      console.error('[Firebase] Failed to get FCM token');
      return false;
    }

    console.log('[Firebase] Got FCM token, upserting to DB…');

    const ua         = navigator.userAgent;
    const browser    = /Edg/.test(ua)    ? 'edge'
                     : /Chrome/.test(ua)  ? 'chrome'
                     : /Firefox/.test(ua) ? 'firefox'
                     : /Safari/.test(ua)  ? 'safari'
                     : 'other';
    const deviceType = /Mobile/.test(ua)  ? 'mobile'
                     : /Tablet/.test(ua)  ? 'tablet'
                     : 'desktop';

    // 3. Upsert — conflict on user_id + subscription_type so each device gets
    //    its own row, but the same browser session reuses its row.
    const { error } = await supabase
      .from('push_subscriptions')
      .upsert(
        {
          user_id:           userId,
          endpoint:          token,   // token is unique per browser/device
          fcm_token:         token,
          subscription_type: 'fcm',
          user_agent:        ua,
          browser,
          device_type:       deviceType,
          is_active:         true,
          failure_count:     0,
          last_used_at:      new Date().toISOString(),
          updated_at:        new Date().toISOString(),
        },
        { onConflict: 'endpoint' }   // endpoint = fcm_token column
      );

    if (error) {
      console.error('[Firebase] Failed to save token:', error);
      return false;
    }

    console.log('[Firebase] Subscription saved for user:', userId);
    return true;
  } catch (err) {
    console.error('[Firebase] subscribeToPush error:', err);
    return false;
  }
}

export async function unsubscribeFromPush(userId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('push_subscriptions')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('user_id', userId);

    if (error) { console.error('[Firebase] Unsubscribe error:', error); return false; }
    console.log('[Firebase] Unsubscribed:', userId);
    return true;
  } catch (err) {
    console.error('[Firebase] unsubscribeFromPush error:', err);
    return false;
  }
}

export async function forceRefreshPushToken(userId: string): Promise<boolean> {
  try {
    // First delete all existing tokens for this user
    const { error: deleteError } = await supabase
      .from('push_subscriptions')
      .delete()
      .eq('user_id', userId);

    if (deleteError) {
      console.error('[Firebase] Failed to delete old tokens:', deleteError);
    } else {
      console.log('[Firebase] Deleted old tokens for user:', userId);
    }

    // Now get a fresh token
    const success = await subscribeToPush(userId);
    if (success) {
      console.log('[Firebase] Force refresh completed - new token saved');
    }
    return success;
  } catch (err) {
    console.error('[Firebase] forceRefreshPushToken error:', err);
    return false;
  }
}

export function getNotificationPermission(): NotificationPermission {
  return 'Notification' in window ? Notification.permission : 'denied';
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) return false;
  try {
    const p = await Notification.requestPermission();
    return p === 'granted';
  } catch { return false; }
}

export function isPushSupported(): boolean {
  return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
}

export async function hasActiveSubscription(userId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('push_subscriptions')
      .select('id')
      .eq('user_id', userId)
      .eq('is_active', true)
      .limit(1);

    if (error) { console.error('[Firebase] hasActiveSubscription error:', error); return false; }
    return Array.isArray(data) && data.length > 0;
  } catch { return false; }
}

export function sendMessageToServiceWorker(message: any): void {
  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage(message);
  }
}