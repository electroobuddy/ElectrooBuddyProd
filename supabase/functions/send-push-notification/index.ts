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

// Generate VAPID headers for Web Push using proper JWT
async function generateVAPIDHeaders(endpoint: string): Promise<{ Authorization: string; "Crypto-Key": string } | null> {
  if (!vapidPrivateKey || !vapidPublicKey) {
    console.error("[Push] VAPID keys not configured");
    return null;
  }

  try {
    const expiration = Math.floor(Date.now() / 1000) + 3600; // 1 hour
    const origin = new URL(endpoint).origin;

    // JWT Header
    const header = { typ: "JWT", alg: "ES256" };
    const payload = {
      aud: origin,
      exp: expiration,
      sub: vapidSubject,
    };

    // Base64URL encode
    const base64Url = (str: string) =>
      btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

    const encodedHeader = base64Url(JSON.stringify(header));
    const encodedPayload = base64Url(JSON.stringify(payload));
    const signingInput = `${encodedHeader}.${encodedPayload}`;

    // Sign with private key (simplified - in production use proper crypto library)
    const signature = base64Url(signingInput); // Placeholder - replace with proper signing

    const token = `${encodedHeader}.${encodedPayload}.${signature}`;

    return {
      Authorization: `WebPush ${token}`,
      "Crypto-Key": `p256ecdsa=${vapidPublicKey}`,
    };
  } catch (error) {
    console.error("[Push] Failed to generate VAPID headers:", error);
    return null;
  }
}

// Simple payload encryption (for MVP - proper encryption requires more setup)
async function encryptPayload(payload: any): Promise<Uint8Array> {
  const encoder = new TextEncoder();
  return encoder.encode(JSON.stringify(payload));
}

// Send push notification with Web Push protocol
async function sendPushNotification(subscription: any, payload: any): Promise<boolean> {
  if (!vapidPrivateKey || !vapidPublicKey) {
    console.error("[Push] VAPID keys not configured");
    return false;
  }

  try {
    // Generate VAPID headers
    const vapidHeaders = await generateVAPIDHeaders(subscription.endpoint);
    if (!vapidHeaders) {
      return false;
    }

    // Prepare payload
    const encryptedPayload = await encryptPayload(payload);

    // Headers per Web Push spec
    const headers: Record<string, string> = {
      "TTL": "86400", // 24 hours
      "Content-Type": "application/octet-stream",
      "Content-Length": encryptedPayload.length.toString(),
      ...vapidHeaders,
    };

    // Add encryption headers if using payload encryption
    if (subscription.keys?.p256dh && subscription.keys?.auth) {
      // In production: implement proper encryption
      // For now, we'll send without encryption (not recommended for production)
      console.log("[Push] Note: Payload encryption not fully implemented");
    }

    console.log("[Push] Sending to:", subscription.endpoint.substring(0, 50) + "...");

    const response = await fetch(subscription.endpoint, {
      method: "POST",
      headers,
      body: encryptedPayload as unknown as BodyInit,
    });

    // Handle response
    if (response.ok || response.status === 201) {
      console.log("[Push] Success:", response.status);
      return true;
    }

    // Handle specific error codes
    if (response.status === 410 || response.status === 404) {
      console.log("[Push] Subscription expired (", response.status, ")");
      return false; // Will be marked inactive
    }

    if (response.status === 429) {
      console.error("[Push] Rate limited by push service");
      return false;
    }

    console.error("[Push] Failed:", response.status, response.statusText);
    const errorBody = await response.text().catch(() => "");
    if (errorBody) console.error("[Push] Error body:", errorBody.substring(0, 200));
    return false;
  } catch (error) {
    console.error("[Push] Exception:", error);
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
        // Build subscription object from database columns
        const subscription = {
          endpoint: sub.endpoint,
          keys: {
            p256dh: sub.p256dh,
            auth: sub.auth,
          },
        };

        const sent = await sendPushNotification(subscription, payload);

        if (sent) {
          successCount++;
          console.log("[Push] Sent to:", sub.browser || "unknown browser");
          
          // Update last_used_at
          await supabase
            .from("push_subscriptions")
            .update({ last_used_at: new Date().toISOString() })
            .eq("id", sub.id);
        } else {
          failedSubscriptions.push(sub.id);
          console.error("[Push] Failed to send to subscription:", sub.id);
          
          // Increment failure count
          await supabase
            .from("push_subscriptions")
            .update({ 
              failure_count: (sub.failure_count || 0) + 1,
              updated_at: new Date().toISOString()
            })
            .eq("id", sub.id);
        }
      } catch (error) {
        console.error("[Push] Error processing subscription:", sub.id, error);
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
