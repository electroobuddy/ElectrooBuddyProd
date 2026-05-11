import { supabase } from '@/integrations/supabase/client';
import { 
  initFirebase, 
  requestFirebasePermission, 
  onFirebaseMessage,
  getFirebaseMessaging 
} from '@/integrations/firebase/config';

/**
 * Firebase Push Notification Utilities
 * Works even when website is closed - uses FCM
 */

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
      const notification = new Notification(
        payload.notification.title || 'ElectroBuddy',
        {
          body: payload.notification.body,
          icon: payload.notification.icon || '/favicon_io/android-chrome-192x192.png',
          badge: '/favicon_io/android-chrome-192x192.png',
          data: payload.data || {}
        }
      );
      
      notification.onclick = () => {
        window.focus();
        notification.close();
      };
    }
  });
}

export async function subscribeToPush(userId: string): Promise<boolean> {
  try {
    const success = await initPushNotifications();
    if (!success) {
      console.error('[Firebase] Failed to initialize');
      return false;
    }

    const token = await requestFirebasePermission(userId);
    if (!token) {
      console.error('[Firebase] Failed to get token');
      return false;
    }

    const ua = navigator.userAgent;
    const browser = /Chrome/.test(ua) ? 'chrome' : 
                    /Firefox/.test(ua) ? 'firefox' :
                    /Safari/.test(ua) ? 'safari' :
                    /Edge/.test(ua) ? 'edge' : 'other';
    const deviceType = /Mobile/.test(ua) ? 'mobile' : 
                       /Tablet/.test(ua) ? 'tablet' : 'desktop';

    console.log('[Firebase] Saving token to database');

    const { error } = await supabase
      .from('push_subscriptions')
      .upsert({
        user_id: userId,
        endpoint: token,
        p256dh: null,
        auth: null,
        fcm_token: token,
        user_agent: ua,
        browser: browser,
        device_type: deviceType,
        is_active: true,
        failure_count: 0,
        last_used_at: new Date().toISOString()
      }, {
        onConflict: 'endpoint'
      });

    if (error) {
      console.error('[Firebase] Failed to save token:', error);
      return false;
    }

    console.log('[Firebase] Subscription saved successfully');
    return true;
  } catch (error) {
    console.error('[Firebase] Subscription error:', error);
    return false;
  }
}

export async function unsubscribeFromPush(userId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('push_subscriptions')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('user_id', userId);

    if (error) {
      console.error('[Firebase] Failed to update subscription:', error);
      return false;
    }

    console.log('[Firebase] Unsubscribed successfully');
    return true;
  } catch (error) {
    console.error('[Firebase] Unsubscription error:', error);
    return false;
  }
}

export function getNotificationPermission(): NotificationPermission {
  if (!('Notification' in window)) {
    return 'denied';
  }
  return Notification.permission;
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) {
    console.warn('[Firebase] Notifications not supported');
    return false;
  }

  try {
    const permission = await Notification.requestPermission();
    console.log('[Firebase] Permission status:', permission);
    return permission === 'granted';
  } catch (error) {
    console.error('[Firebase] Permission request failed:', error);
    return false;
  }
}

export function isPushSupported(): boolean {
  return (
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window
  );
}

export async function hasActiveSubscription(userId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('push_subscriptions')
      .select('id')
      .eq('user_id', userId)
      .eq('is_active', true)
      .limit(1);

    if (error) {
      console.error('[Firebase] Failed to check subscription:', error);
      return false;
    }

    return (data?.length || 0) > 0;
  } catch (error) {
    console.error('[Firebase] Error checking subscription:', error);
    return false;
  }
}

export function sendMessageToServiceWorker(message: any): void {
  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage(message);
  }
}