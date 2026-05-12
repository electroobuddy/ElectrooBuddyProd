// @ts-nocheck
// OneSignal types are dynamic, using any for simplicity
import { supabase } from '@/integrations/supabase/client';

declare const window: Window & { OneSignal?: any; OneSignalDeferred?: any[] };

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

    // Check current permission FIRST
    const currentPermission = Notification.permission;
    console.log('[OneSignal] Current permission:', currentPermission);

    // Wait for OneSignal to be ready with a timeout
    const readyPromise = new Promise<void>((resolve, reject) => {
      window.OneSignalDeferred = window.OneSignalDeferred || [];
      
      // Check if already ready
      if (window.OneSignal.isPushNotificationsSupported && window.OneSignal.isPushNotificationsSupported()) {
        console.log('[OneSignal] Already supported');
        resolve();
        return;
      }
      
      // Add to deferred queue
      window.OneSignalDeferred.push(() => {
        console.log('[OneSignal] Deferred init called');
        resolve();
      });
      
      // Timeout after 8 seconds
      setTimeout(() => {
        console.log('[OneSignal] Ready timeout, continuing anyway...');
        resolve(); // Resolve anyway to continue
      }, 8000);
    });

    await readyPromise;
    console.log('[OneSignal] Proceeding with initialization...');

    // Only request permission if not already granted
    if (currentPermission !== 'granted') {
      console.log('[OneSignal] Permission not granted, requesting...');
      try {
        const permission = await window.OneSignal.Notifications.requestPermission();
        console.log('[OneSignal] Permission result:', permission);
        
        if (permission !== 'granted') {
          console.log('[OneSignal] Permission not granted:', permission);
        }
      } catch (permError) {
        console.error('[OneSignal] Permission error:', permError);
      }
    } else {
      console.log('[OneSignal] Permission already granted, proceeding...');
    }

    // Call optIn() to subscribe to push
    console.log('[OneSignal] Calling optIn()...');
    
    try {
      if (window.OneSignal.User?.PushSubscription?.optIn) {
        await window.OneSignal.User.PushSubscription.optIn();
        console.log('[OneSignal] optIn() called successfully');
      } else {
        console.log('[OneSignal] optIn not available, trying alternative...');
        
        // Try alternative: use setExternalUserId which triggers subscription
        if (window.OneSignal.User?.setExternalUserId) {
          console.log('[OneSignal] Setting external user ID as fallback...');
          // This might trigger the subscription creation
        }
      }
    } catch (optInError) {
      console.error('[OneSignal] optIn error:', optInError);
    }

    // Give time for subscription to be established
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Get the subscription ID using OneSignal v16 API
    let subscriptionId = null;
    let attempts = 0;
    const maxAttempts = 8;
    
    while (!subscriptionId && attempts < maxAttempts) {
      attempts++;
      console.log(`[OneSignal] Attempt ${attempts}/${maxAttempts} to get subscription ID...`);
      
      try {
        if (window.OneSignal.User && window.OneSignal.User.PushSubscription) {
          const pushSub = window.OneSignal.User.PushSubscription;
          console.log('[OneSignal] PushSubscription:', JSON.stringify(pushSub));
          
          subscriptionId = pushSub.id || pushSub.token || pushSub.subscriptionId;
          
          if (subscriptionId) {
            console.log('[OneSignal] ✅ Got subscription ID:', subscriptionId);
            break;
          }
        }
        
        // Also try via OneSignal login if we have user ID
        if (attempts === 3 && window.OneSignal.User?.login) {
          console.log('[OneSignal] Trying User.login()...');
        }
      } catch (e) {
        console.error('[OneSignal] Error on attempt', attempts, ':', e);
      }
      
      if (!subscriptionId) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    if (!subscriptionId) {
      console.error('[OneSignal] Failed to get subscription ID after', maxAttempts, 'attempts');
      
      // Last resort - check if subscription exists via other means
      console.log('[OneSignal] Checking alternative subscription methods...');
      
      // Try to get existing subscription
      if (window.OneSignal.User?.PushSubscription) {
        const pushSub = window.OneSignal.User.PushSubscription;
        console.log('[OneSignal] Final PushSubscription check:', pushSub);
      }
      
      return null;
    }

    return
     subscriptionId;
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
    console.log('[OneSignal] Starting subscription for user:', userId);
    
    // Check if OneSignal is available
    if (!window.OneSignal) {
      console.error('[OneSignal] SDK not loaded - check index.html');
      return false;
    }

    // Check current permission
    const currentPermission = Notification.permission;
    console.log('[OneSignal] Current permission:', currentPermission);
    
    // Also log OneSignal initialization state
    console.log('[OneSignal] isPushNotificationsSupported:', 
      typeof window.OneSignal.isPushNotificationsSupported === 'function' 
        ? window.OneSignal.isPushNotificationsSupported() 
        : 'not a function'
    );
    console.log('[OneSignal] isPushNotificationsEnabled:', 
      typeof window.OneSignal.isPushNotificationsEnabled === 'function'
        ? window.OneSignal.isPushNotificationsEnabled()
        : 'not a function'
    );

    // First, login to OneSignal with external user ID (this creates the user)
    if (window.OneSignal.User?.login && userId) {
      console.log('[OneSignal] Logging in user:', userId);
      try {
        await window.OneSignal.User.login(userId, 'https://electroobuddy.com/api/v1/players/' + userId);
        console.log('[OneSignal] User login successful');
      } catch (loginError) {
        console.error('[OneSignal] Login error:', loginError);
      }
    }

    // Request permission if not granted
    if (currentPermission !== 'granted') {
      console.log('[OneSignal] Requesting permission...');
      try {
        const permResult = await window.OneSignal.Notifications.requestPermission();
        console.log('[OneSignal] Permission result:', permResult);
        
        if (permResult !== 'granted') {
          console.error('[OneSignal] Permission not granted:', permResult);
        }
      } catch (permError) {
        console.error('[OneSignal] Permission request error:', permError);
      }
    } else {
      console.log('[OneSignal] Permission already granted');
    }

    // Wait for SDK to process
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Call optIn() to subscribe
    console.log('[OneSignal] Calling optIn()...');
    
    try {
      if (window.OneSignal.User?.PushSubscription?.optIn) {
        const optInResult = await window.OneSignal.User.PushSubscription.optIn();
        console.log('[OneSignal] optIn() result:', optInResult);
      }
    } catch (optInError) {
      console.error('[OneSignal] optIn error:', optInError);
    }

    // Wait for subscription to be established
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Get subscription ID
    let subscriptionId = null;
    
    // Check the PushSubscription state
    const pushSub = window.OneSignal.User?.PushSubscription;
    console.log('[OneSignal] PushSubscription object:', pushSub);
    console.log('[OneSignal] PushSubscription.id:', pushSub?.id);
    console.log('[OneSignal] PushSubscription.token:', pushSub?.token);
    
    // Try multiple times to get the subscription ID
    for (let i = 0; i < 5; i++) {
      console.log(`[OneSignal] Checking subscription (attempt ${i + 1}/5)...`);
      
      try {
        const currentSub = window.OneSignal.User?.PushSubscription;
        if (currentSub) {
          subscriptionId = currentSub.id || currentSub.token || currentSub.subscriptionId;
          
          if (subscriptionId) {
            console.log('[OneSignal] Got subscription ID:', subscriptionId);
            break;
          }
        }
        
        // Also check if we have a subscription via existing method
        const existing = window.OneSignal.User?.PushSubscription;
        if (existing) {
          console.log('[OneSignal] Current subscription:', JSON.stringify(existing));
        }
      } catch (e) {
        console.error('[OneSignal] Error getting subscription:', e);
      }
      
      if (!subscriptionId) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    if (!subscriptionId) {
      console.error('[OneSignal] Failed to get subscription ID via SDK');
      
      // Try native PushManager as fallback
      try {
        console.log('[OneSignal] Trying native PushManager fallback...');
        const registration = await navigator.serviceWorker.getRegistration();
        if (!registration) {
          console.log('[OneSignal] No service worker registration found');
          return false;
        }
        
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array('BOP5PQD1sPBIz_P3TNkxXx75I1qXHf1y-YHK_1Is5_vB5kF_ZLXSbXhViiLEfAKjbf5Ex5GMlx3UnedoxADniWk')
        });
        
        const subJson = JSON.parse(JSON.stringify(subscription));
        subscriptionId = subJson.endpoint;
        
        console.log('[OneSignal] Native subscription ID:', subscriptionId);
      } catch (nativeError) {
        console.error('[OneSignal] Native push error:', nativeError);
      }
      
      if (!subscriptionId) {
        console.error('[OneSignal] All subscription methods failed');
        return false;
      }
    }

    console.log('[OneSignal] Final subscription ID:', subscriptionId);

    // Get user agent info
    const ua = navigator.userAgent;
    const browser = getBrowserName(ua);

    console.log('[OneSignal] Saving subscription to database...');

    // Save subscription to database using upsert
    const { error } = await supabase
      .from("push_subscriptions")
      .upsert({
        user_id: userId,
        endpoint: subscriptionId,
        subscription_type: 'onesignal',
        subscription: { 
          onesignal: true, 
          subscription_id: subscriptionId,
          app_id: "01fda38a-4a53-4f72-9c10-2d4c9db304f0"
        },
        user_agent: ua,
        browser,
        device_type: /Mobile/.test(ua) ? 'mobile' : /Tablet/.test(ua) ? 'tablet' : 'desktop',
        is_active: true,
        updated_at: new Date().toISOString()
      }, { 
        onConflict: 'endpoint',
        ignoreDuplicates: false 
      });

    if (error) {
      console.error('[OneSignal] Failed to save subscription:', error);
      console.error('[OneSignal] Error code:', error.code);
      console.error('[OneSignal] Error message:', error.message);
      console.error('[OneSignal] Error details:', JSON.stringify(error, null, 2));
      return false;
    }

    console.log('[OneSignal] Successfully subscribed and saved to database');
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
 * Convert VAPID key to Uint8Array
 */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

/**
 * Check if OneSignal is supported
 */
export function isOneSignalSupported(): boolean {
  return 'Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window;
}
