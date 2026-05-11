// @ts-nocheck
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

declare const Deno: {
  env: {
    get(key: string): string | undefined;
  };
};

interface OneSignalNotification {
  playerIds: string[];
  title: string;
  message: string;
  url?: string;
  data?: Record<string, string>;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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
    const { playerIds, title, message, url, data } = await req.json();

    if (!playerIds || !title || !message) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: playerIds, title, message" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const success = await sendOneSignalNotification({
      playerIds,
      title,
      message,
      url,
      data
    });

    if (success) {
      return new Response(
        JSON.stringify({ success: true, sent: playerIds.length }),
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
