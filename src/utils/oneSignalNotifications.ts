import { supabase } from '@/integrations/supabase/client';

declare global {
  interface Window {
    OneSignalDeferred: Array<() => void>;
    OneSignal: {
      isPushNotificationsEnabled: boolean;
      Notifications: {
        requestPermission(): Promise<string>;
        getUserId(appId: string): Promise<string>;
      };
    };
  }
}

/**
 * Initialize OneSignal and get the player ID (subscription ID)
 */
export async function initializeOneSignal(): Promise<string | null> {
  try {
    if (!window.OneSignal) {
      console.error('[OneSignal] SDK not loaded - check if script is in index.html');
      return null;
    }

    console.log('[OneSignal] SDK loaded, initializing...');

    // Wait for OneSignal to be ready
    await new Promise((resolve) => {
      if (window.OneSignal.isPushNotificationsEnabled) {
        resolve(undefined);
      } else {
        window.OneSignalDeferred.push(resolve);
      }
    });

    // Request permission and get subscription
    const permission = await window.OneSignal.Notifications.requestPermission();
    console.log('[OneSignal] Permission result:', permission);

    if (permission !== 'granted') {
      console.log('[OneSignal] Permission denied:', permission);
      return null;
    }

    // Get the player ID (subscription ID)
    const appId = "01fda38a-4a53-4f72-9c10-2d4c9db304f0";
    
    // Try multiple times to get player ID
    let player_id = null;
    for (let i = 0; i < 3; i++) {
      try {
        player_id = await window.OneSignal.getUserId(appId);
        if (player_id) {
          console.log('[OneSignal] Player ID retrieved on attempt', i + 1, ':', player_id);
          break;
        }
        await new Promise<void>(resolve => setTimeout(resolve, 500));
      } catch (e) {
        console.log('[OneSignal] Attempt', i + 1, 'failed:', e);
        await new Promise<void>(resolve => setTimeout(resolve, 500));
      }
    }

    if (!player_id) {
      console.error('[OneSignal] Failed to get player ID after 3 attempts');
      return null;
    }

    return player_id;
  } catch (error) {
    console.error('[OneSignal] Initialization error:', error);
    return null;
  }
}

/**
 * Subscribe user to OneSignal and save to database
 */
export async function subscribeToOneSignal(userId: string): Promise<boolean> {
  try {
    const playerId = await initializeOneSignal();
    
    if (!playerId) {
      console.error('[OneSignal] Failed to get player ID');
      return false;
    }

    // Get user agent info
    const ua = navigator.userAgent;
    const browser = getBrowserName(ua);

    // Save subscription to database
    const { error } = await supabase
      .from("push_subscriptions")
      .upsert({
        user_id: userId,
        endpoint: playerId,
        subscription_type: 'onesignal',
        subscription: { 
          onesignal: true, 
          player_id: playerId,
          app_id: "01fda38a-4a53-4f72-9c10-2d4c9db304f0"
        },
        user_agent: ua,
        browser,
        device_type: /Mobile/.test(ua) ? 'mobile' : /Tablet/.test(ua) ? 'tablet' : 'desktop',
        is_active: true,
        updated_at: new Date().toISOString()
      }, { 
        onConflict: 'endpoint' 
      });

    if (error) {
      console.error('[OneSignal] Failed to save subscription:', error);
      return false;
    }

    console.log('[OneSignal] Successfully subscribed');
    return true;
  } catch (error) {
    console.error('[OneSignal] Subscription error:', error);
    return false;
  }
}

/**
 * Unsubscribe from OneSignal
 */
export async function unsubscribeFromOneSignal(userId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("push_subscriptions")
      .update({ 
        is_active: false,
        updated_at: new Date().toISOString()
      })
      .eq("user_id", userId)
      .eq("subscription_type", "onesignal");

    if (error) {
      console.error('[OneSignal] Failed to unsubscribe:', error);
      return false;
    }

    console.log('[OneSignal] Successfully unsubscribed');
    return true;
  } catch (error) {
    console.error('[OneSignal] Unsubscribe error:', error);
    return false;
  }
}

/**
 * Send notification via OneSignal REST API
 */
export async function sendOneSignalNotification(
  playerIds: string[],
  title: string,
  message: string,
  url?: string,
  data?: Record<string, string>
): Promise<boolean> {
  try {
    // This would typically be called from an edge function
    // For now, we'll use a simple implementation
    const payload = {
      app_id: "01fda38a-4a53-4f72-9c10-2d4c9db304f0",
      include_player_ids: playerIds,
      headings: { en: title },
      contents: { en: message },
      url: url || window.location.origin,
      data: data || {},
      chrome_web_image: "/favicon_io/android-chrome-192x192.png",
      firefox_web_image: "/favicon_io/android-chrome-192x192.png",
      safari_web_image: "/favicon_io/android-chrome-192x192.png",
    };

    console.log('[OneSignal] Sending notification:', payload);
    
    // In production, this should be sent via edge function
    // For now, just log it
    return true;
  } catch (error) {
    console.error('[OneSignal] Send notification error:', error);
    return false;
  }
}

/**
 * Get browser name from user agent
 */
function getBrowserName(ua: string): string {
  if (ua.includes('Chrome')) return 'Chrome';
  if (ua.includes('Firefox')) return 'Firefox';
  if (ua.includes('Safari')) return 'Safari';
  if (ua.includes('Edge')) return 'Edge';
  return 'Unknown';
}

/**
 * Check if OneSignal is supported
 */
export function isOneSignalSupported(): boolean {
  return 'Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window;
}
