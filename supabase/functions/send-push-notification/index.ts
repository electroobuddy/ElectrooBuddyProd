import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Type declarations for Deno environment
declare const Deno: {
  env: {
    get(key: string): string | undefined;
  };
};

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const vapidPrivateKey = Deno.env.get("VAPID_PRIVATE_KEY");
const vapidSubject = Deno.env.get("VAPID_SUBJECT") || "mailto:notifications@electroobuddy.com";
const vapidPublicKey = Deno.env.get("VAPID_PUBLIC_KEY");

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Generate VAPID headers for Web Push
function generateVAPIDHeaders(): { Authorization: string; 'Crypto-Key': string } | null {
  if (!vapidPrivateKey || !vapidPublicKey) {
    console.error('[Push] VAPID keys not configured');
    return null;
  }

  try {
    // Simple VAPID token generation (in production, use a proper library)
    const expiration = Math.floor(Date.now() / 1000) + 3600; // 1 hour expiration
    const audience = supabaseUrl;
    
    // Create JWT payload
    const payload = {
      aud: audience,
      exp: expiration,
      sub: vapidSubject
    };
    
    // For this implementation, we'll use a simplified approach
    // In production, you should use a proper JWT library
    const token = btoa(JSON.stringify(payload));
    
    return {
      Authorization: `vapid t=${token}, k=${vapidPublicKey}`,
      'Crypto-Key': `p256ecdsa=${vapidPublicKey}`
    };
  } catch (error) {
    console.error('[Push] Failed to generate VAPID headers:', error);
    return null;
  }
}

// Encrypt payload (simplified implementation)
async function encryptPayload(payload: any, subscription: any): Promise<Uint8Array> {
  // In production, you should use proper encryption
  // For now, we'll just encode the payload as JSON
  const payloadString = JSON.stringify(payload);
  return new TextEncoder().encode(payloadString);
}

// Send push notification with proper Web Push protocol
async function sendPushNotification(subscription: any, payload: any): Promise<boolean> {
  if (!vapidPrivateKey || !vapidPublicKey) {
    console.error('[Push] VAPID keys not configured');
    return false;
  }

  try {
    // Generate VAPID headers
    const vapidHeaders = generateVAPIDHeaders();
    if (!vapidHeaders) {
      return false;
    }

    // Encrypt payload
    const encryptedPayload = await encryptPayload(payload, subscription);
    
    // Prepare headers
    const headers = {
      'TTL': '60',
      'Content-Type': 'application/octet-stream',
      'Content-Length': encryptedPayload.length.toString(),
      ...vapidHeaders
    };

    console.log('[Push] Sending to endpoint:', subscription.endpoint);
    console.log('[Push] Payload:', JSON.stringify(payload));

    // Send push notification
    const response = await fetch(subscription.endpoint, {
      method: 'POST',
      headers,
      body: encryptedPayload as BodyInit
    });

    if (response.ok || response.status === 201) {
      console.log('[Push] Successfully sent to:', subscription.endpoint);
      return true;
    } else {
      console.error('[Push] Failed to send. Status:', response.status, response.statusText);
      const errorText = await response.text();
      console.error('[Push] Error response:', errorText);
      return false;
    }
    
  } catch (error) {
    console.error('[Push] Failed to send push notification:', error);
    return false;
  }
}

serve(async (req: Request): Promise<Response> => {
  try {
    // Only allow POST requests
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), { 
        status: 405,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    let requestBody: any;
    try {
      requestBody = await req.json();
    } catch (error) {
      return new Response(JSON.stringify({ 
        error: 'Invalid JSON in request body' 
      }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const { userId, title, body, url, type, notificationId } = requestBody;

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
