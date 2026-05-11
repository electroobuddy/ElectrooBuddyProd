// @ts-nocheck
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

declare const Deno: {
  env: {
    get(key: string): string | undefined;
  };
};

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

interface OneSignalNotification {
  playerIds?: string[];
  userIds?: string[]; // Alternative: send by user IDs
  title: string;
  message: string;
  url?: string;
  data?: Record<string, string>;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function fetchSubscriptionIds(userIds: string[]): Promise<string[]> {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const { data, error } = await supabase
      .from("push_subscriptions")
      .select("endpoint")
      .in("user_id", userIds)
      .eq("subscription_type", "onesignal")
      .eq("is_active", true);
    
    if (error) {
      console.error("[OneSignal] Error fetching subscriptions:", error);
      return [];
    }
    
    const subscriptionIds = data?.map(sub => sub.endpoint).filter(Boolean) || [];
    console.log("[OneSignal] Fetched subscription IDs:", subscriptionIds);
    return subscriptionIds;
  } catch (error) {
    console.error("[OneSignal] Exception fetching subscriptions:", error);
    return [];
  }
}

async function sendOneSignalNotification(notification: OneSignalNotification): Promise<boolean> {
  const appId = Deno.env.get("ONESIGNAL_APP_ID");
  const apiKey = Deno.env.get("ONESIGNAL_API_KEY");

  if (!appId || !apiKey) {
    console.error("[OneSignal] App ID or API key not configured");
    return false;
  }

  try {
    const payload = {
      app_id: appId,
      include_player_ids: notification.playerIds,
      headings: { en: notification.title },
      contents: { en: notification.message },
      url: notification.url,
      data: notification.data || {},
      chrome_web_image: "https://electroobuddy.com/favicon_io/android-chrome-192x192.png",
      firefox_web_image: "https://electroobuddy.com/favicon_io/android-chrome-192x192.png",
      safari_web_image: "https://electroobuddy.com/favicon_io/android-chrome-192x192.png",
    };

    console.log("[OneSignal] Sending notification:", JSON.stringify(payload, null, 2));

    const response = await fetch("https://onesignal.com/api/v1/notifications", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Basic ${apiKey}`,
      },
      body: JSON.stringify(payload),
    });

    const responseText = await response.text();
    console.log("[OneSignal] Response status:", response.status);
    console.log("[OneSignal] Response body:", responseText);

    if (response.ok) {
      const result = JSON.parse(responseText);
      console.log("[OneSignal] Send result:", result);
      return true;
    }

    console.error("[OneSignal] Failed:", response.status, response.statusText);
    return false;
  } catch (error) {
    console.error("[OneSignal] Exception:", error);
    return false;
  }
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { playerIds, userIds, title, message, url, data } = body;

    if (!title || !message) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: title, message" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Determine subscription IDs to use
    let subscriptionIds: string[] = [];
    
    if (playerIds && playerIds.length > 0) {
      // Use provided player IDs directly
      subscriptionIds = playerIds;
    } else if (userIds && userIds.length > 0) {
      // Fetch subscription IDs from database by user IDs
      console.log("[OneSignal] Fetching subscriptions for users:", userIds);
      subscriptionIds = await fetchSubscriptionIds(userIds);
    } else {
      return new Response(
        JSON.stringify({ error: "Missing required fields: playerIds or userIds" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (subscriptionIds.length === 0) {
      return new Response(
        JSON.stringify({ error: "No active OneSignal subscriptions found" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("[OneSignal] Sending to subscription IDs:", subscriptionIds);

    const success = await sendOneSignalNotification({
      playerIds: subscriptionIds,
      title,
      message,
      url,
      data
    });

    if (success) {
      return new Response(
        JSON.stringify({ success: true, sent: subscriptionIds.length }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } else {
      return new Response(
        JSON.stringify({ error: "Failed to send notification" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  } catch (error) {
    console.error("[OneSignal] Edge function error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
