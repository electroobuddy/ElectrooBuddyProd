import { supabase } from "@/integrations/supabase/client";

/**
 * Push Notification Utilities
 * Handles service worker registration, push subscriptions, and permission management
 */

// Convert base64 URL-safe string to Uint8Array
function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map(char => char.charCodeAt(0))) as Uint8Array<ArrayBuffer>;
}

/**
 * Register service worker
 */
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!('serviceWorker' in navigator)) {
    console.warn('[Push] Service workers not supported');
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/'
    });
    console.log('[Push] Service Worker registered:', registration.scope);
    return registration;
  } catch (error) {
    console.error('[Push] Service Worker registration failed:', error);
    return null;
  }
}

/**
 * Request notification permission from user
 */
export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) {
    console.warn('[Push] Notifications not supported');
    return false;
  }

  try {
    const permission = await Notification.requestPermission();
    console.log('[Push] Permission status:', permission);
    return permission === 'granted';
  } catch (error) {
    console.error('[Push] Permission request failed:', error);
    return false;
  }
}

/**
 * Subscribe to push notifications
 */
export async function subscribeToPush(userId: string): Promise<boolean> {
  try {
    // Register service worker
    const registration = await registerServiceWorker();
    if (!registration) {
      console.error('[Push] Service worker registration failed');
      return false;
    }

    // Request permission
    const permission = await requestNotificationPermission();
    if (!permission) {
      console.error('[Push] Permission denied');
      return false;
    }

    // Get VAPID public key
    const vapidPublicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;
    if (!vapidPublicKey) {
      console.error('[Push] VAPID public key not configured');
      return false;
    }

    // Subscribe to push
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidPublicKey)
    });

    console.log('[Push] Subscription created:', subscription.endpoint);

    // Save subscription to database
    const { error } = await supabase
      .from('push_subscriptions')
      .upsert({
        user_id: userId,
        subscription: JSON.stringify(subscription),
        browser_name: navigator.userAgent,
        is_active: true,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,subscription'
      });

    if (error) {
      console.error('[Push] Failed to save subscription:', error);
      return false;
    }

    console.log('[Push] Subscription saved to database');
    return true;
  } catch (error) {
    console.error('[Push] Subscription failed:', error);
    return false;
  }
}

/**
 * Unsubscribe from push notifications
 */
export async function unsubscribeFromPush(userId: string): Promise<boolean> {
  try {
    const registration = await registerServiceWorker();
    if (!registration) {
      console.error('[Push] Service worker not available');
      return false;
    }

    // Get current subscription
    const subscription = await registration.pushManager.getSubscription();
    
    if (subscription) {
      // Unsubscribe from push service
      const success = await subscription.unsubscribe();
      console.log('[Push] Unsubscribed from push service:', success);
    }

    // Mark as inactive in database
    const { error } = await supabase
      .from('push_subscriptions')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('user_id', userId);

    if (error) {
      console.error('[Push] Failed to update subscription in database:', error);
      return false;
    }

    console.log('[Push] Subscription deactivated in database');
    return true;
  } catch (error) {
    console.error('[Push] Unsubscription failed:', error);
    return false;
  }
}

/**
 * Check current notification permission status
 */
export function getNotificationPermission(): NotificationPermission {
  if (!('Notification' in window)) {
    return 'denied';
  }
  return Notification.permission;
}

/**
 * Check if push notifications are supported
 */
export function isPushSupported(): boolean {
  return (
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window
  );
}

/**
 * Check if user has active push subscription
 */
export async function hasActiveSubscription(userId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('push_subscriptions')
      .select('id')
      .eq('user_id', userId)
      .eq('is_active', true)
      .limit(1);

    if (error) {
      console.error('[Push] Failed to check subscription:', error);
      return false;
    }

    return (data?.length || 0) > 0;
  } catch (error) {
    console.error('[Push] Error checking subscription:', error);
    return false;
  }
}

/**
 * Refresh push subscription (useful when subscription expires)
 */
export async function refreshPushSubscription(userId: string): Promise<boolean> {
  try {
    // First unsubscribe
    await unsubscribeFromPush(userId);
    
    // Then subscribe again
    return await subscribeToPush(userId);
  } catch (error) {
    console.error('[Push] Failed to refresh subscription:', error);
    return false;
  }
}

/**
 * Get all active push subscriptions for a user
 */
export async function getUserSubscriptions(userId: string): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('push_subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[Push] Failed to get subscriptions:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('[Push] Error getting subscriptions:', error);
    return [];
  }
}

/**
 * Listen for service worker messages
 */
export function onServiceWorkerMessage(callback: (event: MessageEvent) => void): void {
  if ('serviceWorker' in navigator && navigator.serviceWorker) {
    navigator.serviceWorker.addEventListener('message', callback);
  }
}

/**
 * Send message to service worker
 */
export function sendMessageToServiceWorker(message: any): void {
  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage(message);
  }
}
