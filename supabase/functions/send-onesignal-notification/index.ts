// @ts-nocheck
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

declare const Deno: {
  env: {
    get(key: string): string | undefined;
  };
};

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function sendViaOneSignal(playerIds: string[], title: string, message: string, url?: string, data?: Record<string, string>): Promise<{ ok: boolean; details: string }> {
  const appId = Deno.env.get("ONESIGNAL_APP_ID");
  const apiKey = Deno.env.get("ONESIGNAL_API_KEY");

  if (!appId || !apiKey) {
    return { ok: false, details: "ONESIGNAL_APP_ID or ONESIGNAL_API_KEY env var not set" };
  }
  if (!playerIds?.length) {
    return { ok: false, details: "No playerIds provided" };
  }

  try {
    const payload = {
      app_id: appId,
      include_player_ids: playerIds,
      headings: { en: title },
      contents: { en: message },
      url,
      data: data || {},
      chrome_web_image: "https://electroobuddy.com/favicon_io/android-chrome-192x192.png",
    };

    console.log("[OneSignal] Sending:", JSON.stringify(payload));

    const response = await fetch("https://onesignal.com/api/v1/notifications", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Basic ${apiKey}`,
      },
      body: JSON.stringify(payload),
    });

    const responseText = await response.text();
    console.log("[OneSignal] Response:", response.status, responseText);

    return { ok: response.ok, details: responseText };
  } catch (error) {
    console.error("[OneSignal] Exception:", error);
    return { ok: false, details: String(error) };
  }
}

async function sendViaFCM(fcmTokens: string[], title: string, message: string, data?: Record<string, string>): Promise<{ ok: boolean; details: string }> {
  const serverKey = Deno.env.get("FCM_SERVER_KEY");

  if (!serverKey) {
    return { ok: false, details: "FCM_SERVER_KEY env var not set — FCM disabled" };
  }
  if (!fcmTokens?.length) {
    return { ok: false, details: "No fcmTokens provided" };
  }

  try {
    const notificationPayload = {
      registration_ids: fcmTokens,
      notification: {
        title,
        body: message,
        icon: "https://electroobuddy.com/favicon_io/android-chrome-192x192.png",
        click_action: data?.url || "https://electroobuddy.com",
      },
      data: { ...(data || {}), body: message },
      priority: "high",
    };

    console.log("[FCM] Sending to", fcmTokens.length, "token(s)");

    const response = await fetch("https://fcm.googleapis.com/fcm/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `key=${serverKey}`,
      },
      body: JSON.stringify(notificationPayload),
    });

    const result = await response.json();
    console.log("[FCM] Response:", JSON.stringify(result));

    return {
      ok: result.success > 0,
      details: JSON.stringify(result),
    };
  } catch (error) {
    console.error("[FCM] Exception:", error);
    return { ok: false, details: String(error) };
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  let body: Record<string, unknown> = {};
  try {
    body = await req.json();
    console.log("[Edge] Received body:", JSON.stringify(body));
  } catch (e) {
    console.error("[Edge] Failed to parse body:", e);
    return new Response(
      JSON.stringify({ error: "Invalid JSON body" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const { playerIds, fcmTokens, title, message, url, data } = body as any;
  const errors: string[] = [];

  if (!title) errors.push("title is required");
  if (!message) errors.push("message is required");
  if (!playerIds?.length && !fcmTokens?.length) errors.push("at least one of playerIds or fcmTokens is required");

  if (errors.length > 0) {
    console.error("[Edge] Validation failed:", errors.join(", "));
    return new Response(
      JSON.stringify({ error: errors.join(", ") }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const [oneSignalResult, fcmResult] = await Promise.all([
    sendViaOneSignal(playerIds || [], title, message, url, data),
    sendViaFCM(fcmTokens || [], title, message, data),
  ]);

  console.log("[Edge] OneSignal:", oneSignalResult);
  console.log("[Edge] FCM:", fcmResult);

  const success = oneSignalResult.ok || fcmResult.ok;
  const responseBody = {
    success,
    oneSignal: oneSignalResult,
    fcm: fcmResult,
    sent: (playerIds?.length || 0) + (fcmTokens?.length || 0),
  };

  return new Response(
    JSON.stringify(responseBody),
    { status: success ? 200 : 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
});