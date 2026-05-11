// @ts-nocheck
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

declare const Deno: {
  env: {
    get(key: string): string | undefined;
  };
};

interface FCMMessage {
  token: string;
  notification: {
    title: string;
    body: string;
  };
  data?: Record<string, string>;
  webpush?: {
    fcmOptions?: {
      imageUrl?: string;
    };
  };
}

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const fcmServerKey = Deno.env.get("FIREBASE_SERVER_KEY");

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function sendFCMNotification(message: FCMMessage): Promise<boolean> {
  console.log("[FCM] Server key exists:", !!fcmServerKey);
  console.log("[FCM] Server key prefix:", fcmServerKey?.substring(0, 10) + "...");
  
  if (!fcmServerKey) {
    console.error("[FCM] Server key not configured");
    return false;
  }

  try {
    const payload = {
      to: message.token,
      notification: message.notification,
      data: message.data,
      webpush: {
        fcmOptions: {
          imageUrl: message.webpush?.fcmOptions?.imageUrl,
        },
        headers: {
          "Urgency": "high",
        },
      },
    };
    
    console.log("[FCM] Sending to token:", message.token.substring(0, 20) + "...");
    console.log("[FCM] Payload:", JSON.stringify(payload, null, 2));

    const response = await fetch("https://fcm.googleapis.com/fcm/send", {
      method: "POST",
      headers: {
        "Authorization": `key=${fcmServerKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    console.log("[FCM] Response status:", response.status);
    console.log("[FCM] Response headers:", Object.fromEntries(response.headers.entries()));

    const responseText = await response.text();
    console.log("[FCM] Response body:", responseText);

    if (response.ok) {
      const result = JSON.parse(responseText);
      console.log("[FCM] Send result:", result);
      
      if (result.failure === 0) {
        return true;
      } else if (result.results?.[0]?.error) {
        console.error("[FCM] Error:", result.results[0].error);
        return false;
      }
    }

    console.error("[FCM] Failed:", response.status, response.statusText);
    return false;
  } catch (error) {
    console.error("[FCM] Exception:", error);
    return false;
  }
}

serve(async (req: Request): Promise<Response> => {
  try {
    // Handle CORS preflight
    if (req.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let requestBody: any;
    try {
      requestBody = await req.json();
    } catch {
      return new Response(
        JSON.stringify({ error: "Invalid JSON in request body" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { userId, title, body, url, type, notificationId, imageUrl } = requestBody;

    if (!userId || !title || !body) {
      return new Response(
        JSON.stringify({
          error: "Missing required fields: userId, title, body",
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("[FCM] Sending notification to user:", userId);
    console.log("[FCM] Title:", title);

    const { data: subscriptions, error } = await supabase
      .from("push_subscriptions")
      .select("id, fcm_token, endpoint, browser, device_type")
      .eq("user_id", userId)
      .eq("is_active", true)
      .not("fcm_token", "is", null);

    if (error) {
      console.error("[FCM] Failed to get subscriptions:", error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!subscriptions || subscriptions.length === 0) {
      console.log("[FCM] No FCM tokens for user:", userId);
      return new Response(
        JSON.stringify({
          success: false,
          message: "No active FCM subscriptions",
          sent: 0,
          total: 0,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("[FCM] Found", subscriptions.length, "FCM token(s)");

    let successCount = 0;
    const failedTokens: string[] = [];

    for (const sub of subscriptions) {
      try {
        const fcmToken = sub.fcm_token || sub.endpoint;
        
        const sent = await sendFCMNotification({
          token: fcmToken,
          notification: {
            title,
            body,
          },
          data: {
            url: url || "/dashboard/bookings",
            type: type || "notification",
            notificationId: notificationId || "",
            click_action: url || "/dashboard/bookings",
          },
          webpush: {
            fcmOptions: {
              imageUrl: imageUrl || undefined,
            },
          },
        });

        if (sent) {
          successCount++;
          console.log("[FCM] Sent to:", sub.browser || "unknown");

          await supabase
            .from("push_subscriptions")
            .update({ last_used_at: new Date().toISOString() })
            .eq("id", sub.id);
        } else {
          failedTokens.push(sub.id);
        }
      } catch (error) {
        console.error("[FCM] Error sending to token:", sub.id, error);
        failedTokens.push(sub.id);
      }
    }

    if (failedTokens.length > 0) {
      await supabase
        .from("push_subscriptions")
        .update({ is_active: false, updated_at: new Date().toISOString() })
        .in("id", failedTokens);

      console.log("[FCM] Marked", failedTokens.length, "failed token(s) as inactive");
    }

    const response = {
      success: successCount > 0,
      sent: successCount,
      total: subscriptions.length,
      failed: failedTokens.length,
    };

    console.log("[FCM] Response:", JSON.stringify(response));

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("[FCM] Error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "Unknown error",
        sent: 0,
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});