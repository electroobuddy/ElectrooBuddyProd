// @ts-nocheck
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

declare const Deno: { env: { get(key: string): string | undefined } };

const supabaseUrl        = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const FIREBASE_PROJECT_ID   = Deno.env.get("FIREBASE_PROJECT_ID")   || "electroobuddy-561f5";
const FIREBASE_CLIENT_EMAIL = Deno.env.get("FIREBASE_CLIENT_EMAIL") || "firebase-adminsdk-fbsvc@electroobuddy-561f5.iam.gserviceaccount.com";
const FIREBASE_PRIVATE_KEY  = Deno.env.get("FIREBASE_PRIVATE_KEY")  || "";

const corsHeaders = {
  "Access-Control-Allow-Origin":  "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// ── base64url (JWT-safe) ───────────────────────────────────────────────────
function toBase64Url(input: string | Uint8Array): string {
  let bytes: Uint8Array;
  if (typeof input === "string") bytes = new TextEncoder().encode(input);
  else bytes = input;
  let binary = "";
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

function parsePrivateKey(raw: string): Uint8Array {
  const clean = raw
    .replace(/-----BEGIN PRIVATE KEY-----/g, "")
    .replace(/-----END PRIVATE KEY-----/g, "")
    .replace(/\\n/g, "\n")
    .replace(/[\n\s]/g, "");
  console.log(`[FCM] Key clean length: ${clean.length}`);
  if (clean.length < 500) console.error("[FCM] Key looks too short — check FIREBASE_PRIVATE_KEY secret");
  const binary = atob(clean);
  const buf    = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) buf[i] = binary.charCodeAt(i);
  return buf;
}

async function getAccessToken(): Promise<string | null> {
  if (!FIREBASE_CLIENT_EMAIL || !FIREBASE_PRIVATE_KEY) {
    console.error("[FCM] Missing credentials");
    return null;
  }
  try {
    const now     = Math.floor(Date.now() / 1000);
    const header  = toBase64Url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
    const payload = toBase64Url(JSON.stringify({
      iss:   FIREBASE_CLIENT_EMAIL,
      sub:   FIREBASE_CLIENT_EMAIL,
      aud:   "https://oauth2.googleapis.com/token",
      iat:   now,
      exp:   now + 3600,
      scope: "https://www.googleapis.com/auth/firebase.messaging",
    }));

    const keyBuffer  = parsePrivateKey(FIREBASE_PRIVATE_KEY);
    const signingKey = await crypto.subtle.importKey(
      "pkcs8", keyBuffer,
      { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
      false, ["sign"]
    );
    const signature    = await crypto.subtle.sign(
      "RSASSA-PKCS1-v1_5", signingKey,
      new TextEncoder().encode(`${header}.${payload}`)
    );
    const jwt = `${header}.${payload}.${toBase64Url(new Uint8Array(signature))}`;

    const resp = await fetch("https://oauth2.googleapis.com/token", {
      method:  "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body:    new URLSearchParams({
        grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
        assertion:  jwt,
      }),
    });
    const data = await resp.json();
    if (data.error) {
      console.error("[FCM] OAuth error:", data.error, data.error_description ?? "");
      return null;
    }
    if (!data.access_token) {
      console.error("[FCM] No access_token:", JSON.stringify(data));
      return null;
    }
    console.log("[FCM] Access token obtained ✓");
    return data.access_token;
  } catch (err) {
    console.error("[FCM] getAccessToken exception:", err);
    return null;
  }
}

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: { ...corsHeaders, "Access-Control-Allow-Methods": "POST, OPTIONS", "Access-Control-Max-Age": "86400" },
    });
  }
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  let body: any;
  try { body = await req.json(); } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const { userId, title, body: msgBody, url, type, notificationId } = body;
  console.log(`[FCM] Request — userId:${userId} title:"${title}"`);

  if (!userId || !title || !msgBody) {
    return new Response(JSON.stringify({ error: "Missing required fields: userId, title, body" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // ── Fetch active FCM tokens for user ───────────────────────────────────
  const { data: subs, error: subError } = await supabase
    .from("push_subscriptions")
    .select("id, fcm_token, endpoint, browser, device_type")
    .eq("user_id", userId)
    .eq("is_active", true)
    .not("fcm_token", "is", null);

  if (subError) {
    console.error("[FCM] Subscription query error:", subError.message);
    return new Response(JSON.stringify({ success: false, sent: 0, reason: "db_error" }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  if (!subs?.length) {
    console.log(`[FCM] No active FCM tokens for user: ${userId}`);
    return new Response(JSON.stringify({ success: false, sent: 0, reason: "no_tokens" }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  console.log(`[FCM] Found ${subs.length} token(s) for user ${userId}`);

  // ── Obtain OAuth token ─────────────────────────────────────────────────
  const accessToken = await getAccessToken();
  if (!accessToken) {
    return new Response(JSON.stringify({ success: false, sent: 0, reason: "auth_failed" }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const fcmEndpoint  = `https://fcm.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/messages:send`;
  let   successCount = 0;
  const invalidIds: string[] = [];
  const failedIds:  string[] = [];

  for (const sub of subs) {
    const token = sub.fcm_token || sub.endpoint;
    console.log(`[FCM] Sending to sub ${sub.id} (${sub.browser}/${sub.device_type})`);

    try {
      const fcmPayload = {
        message: {
          token,
          notification: { title, body: msgBody },
          data: {
            url:            url            || "/dashboard/bookings",
            type:           type           || "notification",
            notificationId: notificationId || "",
          },
          webpush: {
            fcmOptions: {
              link: url || "/dashboard/bookings",
            },
            headers:      { Urgency: "high" },
            notification: {
              title,
              body:               msgBody,
              icon:               "https://electroobuddy.com/favicon_io/android-chrome-192x192.png",
              badge:              "https://electroobuddy.com/favicon_io/android-chrome-192x192.png",
              image:              "https://electroobuddy.com/favicon_io/android-chrome-192x192.png",
              requireInteraction: false,
              vibrate:            [200, 100, 200],
            },
          },
          android: {
            priority:     "high",
            notification: { icon: "ic_notification", color: "#2563eb" },
          },
          apns: {
            payload: { aps: { sound: "default", badge: 1 } },
          },
        },
      };

      const resp     = await fetch(fcmEndpoint, {
        method:  "POST",
        headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
        body:    JSON.stringify(fcmPayload),
      });
      const respText = await resp.text();
      console.log(`[FCM] HTTP ${resp.status} for sub ${sub.id}:`, respText.substring(0, 500));

      if (resp.ok) {
        successCount++;
        supabase.from("push_subscriptions")
          .update({ last_used_at: new Date().toISOString() })
          .eq("id", sub.id)
          .then(() => {});
      } else {
        let parsed: any = {};
        try { parsed = JSON.parse(respText); } catch {}
        const fcmCode = parsed?.error?.details?.[0]?.errorCode
                     ?? parsed?.error?.status
                     ?? "";

        console.error(`[FCM] Send failed sub ${sub.id} — HTTP:${resp.status} code:${fcmCode} msg:${parsed?.error?.message ?? ""}`);

        // Invalid/unregistered token → mark inactive so we don't retry it
        const isInvalid =
          fcmCode === "INVALID_ARGUMENT"  ||
          fcmCode === "UNREGISTERED"       ||
          resp.status === 404              ||
          respText.includes("not a valid FCM registration token") ||
          respText.includes("Requested entity was not found");

        if (isInvalid) {
          console.warn(`[FCM] Token for sub ${sub.id} is invalid — marking inactive`);
          invalidIds.push(sub.id);
        } else {
          failedIds.push(sub.id);
        }
      }
    } catch (err) {
      console.error(`[FCM] Exception for sub ${sub.id}:`, err);
      failedIds.push(sub.id);
    }
  }

  // Mark dead tokens inactive
  if (invalidIds.length) {
    await supabase
      .from("push_subscriptions")
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .in("id", invalidIds);
    console.log(`[FCM] Invalidated ${invalidIds.length} dead token(s)`);
  }

  const result = {
    success:     successCount > 0,
    sent:        successCount,
    failed:      failedIds.length,
    invalidated: invalidIds.length,
  };
  console.log("[FCM] DONE:", JSON.stringify(result));
  return new Response(JSON.stringify(result), {
    status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});