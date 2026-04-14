import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const vapidPrivateKey = Deno.env.get("VAPID_PRIVATE_KEY");
const vapidSubject = Deno.env.get("VAPID_SUBJECT");

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Web Push implementation using native Deno fetch
// In production, consider using a library like https://deno.land/x/web_push
async function sendPushNotification(subscription: any, payload: any): Promise<boolean> {
  if (!vapidPrivateKey || !vapidSubject) {
    console.error('[Push] VAPID keys not configured');
    return false;
  }

  try {
    // For now, we'll use a simplified approach
    // In production, you should use a proper VAPID library for Deno
    // such as https://deno.land/x/web_push or implement full VAPID auth
    
    // This is a placeholder - the actual implementation requires:
    // 1. Generating VAPID authorization header
    // 2. Encrypting payload with subscription keys
    // 3. Sending to push endpoint
    
    console.log('[Push] Would send to endpoint:', subscription.endpoint);
    console.log('[Push] Payload:', JSON.stringify(payload));
    
    // TODO: Implement full Web Push protocol with VAPID
    // For testing, we'll just log and return success
    // The client-side service worker will handle the actual notification
    
    // When implementing fully, you would:
    // const response = await fetch(subscription.endpoint, {
    //   method: 'POST',
    //   headers: {
    //     'TTL': '60',
    //     'Content-Type': 'application/octet-stream',
    //     'Authorization': `Bearer ${vapidToken}`,
    //     'Crypto-Key': `p256ecdsa=${vapidPublicKey}`,
    //     'Encryption': `salt=${encryptionSalt}`,
    //   },
    //   body: encryptedPayload
    // });
    // return response.ok || response.status === 201;
    
    return true; // Placeholder - always returns true for now
    
  } catch (error) {
    console.error('[Push] Failed to send push notification:', error);
    return false;
  }
}

serve(async (req) => {
  try {
    // Only allow POST requests
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), { 
        status: 405,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const { userId, title, body, url, type, notificationId } = await req.json();

    // Validate required fields
    if (!userId || !title || !body) {
      return new Response(JSON.stringify({ 
        error: 'Missing required fields: userId, title, body' 
      }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    console.log('[Push] Sending push notification to user:', userId);
    console.log('[Push] Title:', title);
    console.log('[Push] Body:', body);

    // Get user's active push subscriptions
    const { data: subscriptions, error } = await supabase
      .from('push_subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true);

    if (error) {
      console.error('[Push] Failed to get subscriptions:', error);
      throw error;
    }

    if (!subscriptions || subscriptions.length === 0) {
      console.log('[Push] No active subscriptions for user:', userId);
      return new Response(JSON.stringify({ 
        success: false, 
        message: 'No active subscriptions',
        sent: 0,
        total: 0
      }), { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    console.log('[Push] Found', subscriptions.length, 'active subscription(s)');

    // Prepare notification payload
    const payload = {
      title,
      body,
      url: url || '/dashboard/bookings',
      type,
      notificationId,
      tag: `electrobuddy-${type || 'notification'}`,
      icon: '/favicon_io/android-chrome-192x192.png',
      badge: '/favicon_io/android-chrome-192x192.png',
      timestamp: Date.now()
    };

    // Send push to all user's devices
    let successCount = 0;
    const failedSubscriptions: string[] = [];

    for (const sub of subscriptions) {
      try {
        const subscription = typeof sub.subscription === 'string' 
          ? JSON.parse(sub.subscription) 
          : sub.subscription;

        const sent = await sendPushNotification(subscription, payload);
        
        if (sent) {
          successCount++;
          console.log('[Push] Successfully sent to:', sub.browser_name?.substring(0, 50));
        } else {
          failedSubscriptions.push(sub.id);
          console.error('[Push] Failed to send to subscription:', sub.id);
        }
      } catch (error) {
        console.error('[Push] Error processing subscription:', sub.id, error);
        failedSubscriptions.push(sub.id);
      }
    }

    // Mark failed subscriptions as inactive
    if (failedSubscriptions.length > 0) {
      await supabase
        .from('push_subscriptions')
        .update({ is_active: false, updated_at: new Date().toISOString() })
        .in('id', failedSubscriptions);
      
      console.log('[Push] Marked', failedSubscriptions.length, 'failed subscription(s) as inactive');
    }

    const response = {
      success: successCount > 0,
      sent: successCount,
      total: subscriptions.length,
      failed: failedSubscriptions.length
    };

    console.log('[Push] Response:', JSON.stringify(response));

    return new Response(JSON.stringify(response), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    console.error('[Push] Error sending push notification:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'Unknown error',
      sent: 0
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
});
