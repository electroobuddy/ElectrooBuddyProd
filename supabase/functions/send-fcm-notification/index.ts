// @ts-nocheck
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

declare const Deno: {
  env: { get(key: string): string | undefined };
};

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const SITE_URL = Deno.env.get("SITE_URL") || "https://electroobuddy.com";

const FIREBASE_PROJECT_ID = Deno.env.get("FIREBASE_PROJECT_ID") || "electroobuddy-561f5";
const FIREBASE_CLIENT_EMAIL = Deno.env.get("FIREBASE_CLIENT_EMAIL") || "firebase-adminsdk-fbsvc@electroobuddy-561f5.iam.gserviceaccount.com";
const FIREBASE_PRIVATE_KEY = Deno.env.get("FIREBASE_PRIVATE_KEY") || "";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(supabaseUrl, supabaseServiceKey);

function parsePrivateKey(raw: string): Uint8Array {
  // Handle multiple possible formats of the private key
  let clean = raw;
  
  // If key still has header/footer, remove them
  if (clean.includes("-----BEGIN")) {
    clean = clean
      .replace(/-----BEGIN PRIVATE KEY-----/g, "")
      .replace(/-----END PRIVATE KEY-----/g, "");
  }
  
  // Handle escaped newlines (from CLI secrets)
  clean = clean.replace(/\\n/g, "\n");
  
  // Remove all whitespace and newlines for base64 decoding
  clean = clean.replace(/[\n\s]/g, "");

  console.log("[FCM v1] Raw key length:", raw.length, "Clean length:", clean.length);
  
  if (clean.length < 500) {
    console.error("[FCM v1] Key too short! Raw:", raw.substring(0, 100));
  }

  try {
    const binary = atob(clean);
    const buf = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) buf[i] = binary.charCodeAt(i);
    return buf;
  } catch (e) {
    console.error("[FCM v1] Failed to decode base64 key:", e);
    throw e;
  }
}

async function getAccessToken(): Promise<string | null> {
  console.log("[FCM v1] Env check — EMAIL:", FIREBASE_CLIENT_EMAIL ? "SET" : "MISSING", "KEY:", FIREBASE_PRIVATE_KEY ? "SET" : "MISSING", "PROJECT:", FIREBASE_PROJECT_ID);
  console.log("[FCM v1] DEBUG - Key starts with:", FIREBASE_PRIVATE_KEY.substring(0, 50));
  console.log("[FCM v1] DEBUG - Key ends with:", FIREBASE_PRIVATE_KEY.substring(FIREBASE_PRIVATE_KEY.length - 50));
  console.log("[FCM v1] DEBUG - Key length:", FIREBASE_PRIVATE_KEY.length);

  if (!FIREBASE_CLIENT_EMAIL || !FIREBASE_PRIVATE_KEY) {
    console.error("[FCM v1] MISSING credentials — check secrets");
    return null;
  }

  try {
    const now = Math.floor(Date.now() / 1000);
    
    // Create JWT header and payload
    const header = btoa(JSON.stringify({ alg: "RS256", typ: "JWT" }));
    const payload = btoa(JSON.stringify({
      iss: FIREBASE_CLIENT_EMAIL,
      sub: FIREBASE_CLIENT_EMAIL,
      aud: "https://oauth2.googleapis.com/v1/token",
      iat: now,
      exp: now + 3600,
    }));

    // Parse the private key
    let keyBuffer: Uint8Array;
    try {
      keyBuffer = parsePrivateKey(FIREBASE_PRIVATE_KEY);
    } catch (e) {
      console.error("[FCM v1] Failed to parse private key:", e);
      return null;
    }

    // Import the key for signing
    let signingKey: CryptoKey;
    try {
      signingKey = await crypto.subtle.importKey(
        "pkcs8", 
        keyBuffer,
        { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
        false, 
        ["sign"]
      );
      console.log("[FCM v1] Key imported successfully");
    } catch (e) {
      console.error("[FCM v1] Failed to import key:", e);
      return null;
    }

    // Sign the JWT
    let signature: ArrayBuffer;
    try {
      signature = await crypto.subtle.sign(
        "RSASSA-PKCS1-v1_5", 
        signingKey,
        new TextEncoder().encode(`${header}.${payload}`)
      );
    } catch (e) {
      console.error("[FCM v1] Failed to sign JWT:", e);
      return null;
    }

    // Encode signature to base64url
    const signatureBase64 = btoa(String.fromCharCode(...new Uint8Array(signature)))
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=/g, "");
    
    const jwt = `${header}.${payload}.${signatureBase64}`;
    console.log("[FCM v1] JWT created, length:", jwt.length);

    // Exchange JWT for access token
    const resp = await fetch("https://oauth2.googleapis.com/v1/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
        assertion: jwt,
        scope: "https://www.googleapis.com/auth/firebase.messaging",
      }),
    });

    const data = await resp.json();
    console.log("[FCM v1] OAuth resp status:", resp.status);
    
    if (data.error) {
      console.error("[FCM v1] OAuth error:", data.error, data.error_description || "");
    }
    console.log("[FCM v1] OAuth response:", JSON.stringify(data).substring(0, 300));

    if (data.access_token) {
      console.log("[FCM v1] Access token OK, length:", data.access_token.length);
      return data.access_token;
    }
    
    console.error("[FCM v1] OAuth FAILED - no access_token");
    return null;
  } catch (err) {
    console.error("[FCM v1] getAccessToken EXCEPTION:", err);
    return null;
  }
}

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        'Access-Control-Max-Age': '86400',
      },
    });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  let body: any;
  try { body = await req.json(); } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const { userId, title, body: msgBody, url, type, notificationId } = body;
  console.log("[FCM v1] Request — userId:", userId, "title:", title);

  if (!userId || !title || !msgBody) {
    return new Response(JSON.stringify({ error: "Missing fields" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const { data: subs, error } = await supabase
    .from("push_subscriptions")
    .select("id, fcm_token, endpoint")
    .eq("user_id", userId)
    .eq("is_active", true)
    .not("fcm_token", "is", null);

  if (error || !subs?.length) {
    console.log("[FCM v1] No tokens for user:", userId);
    return new Response(JSON.stringify({ success: false, sent: 0 }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  console.log("[FCM v1] Tokens found:", subs.length);

  const accessToken = await getAccessToken();
  if (!accessToken) {
    console.error("[FCM v1] No access token — aborting send");
    return new Response(JSON.stringify({ success: false, sent: 0, reason: "auth_failed" }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const endpoint = `https://fcm.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/messages:send`;
  let successCount = 0;
  const failedIds: string[] = [];

  for (const sub of subs) {
    const token = sub.fcm_token || sub.endpoint;
    console.log("[FCM v1] Sending to token:", token.substring(0, 20) + "...");

    try {
      const resp = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: {
            token,
            notification: { title, body: msgBody },
            data: { url: url || `${SITE_URL}/dashboard/bookings`, type: type || "notification", notificationId: notificationId || "" },
            webpush: {
              fcmOptions: { link: url || `${SITE_URL}/dashboard/bookings` },
              headers: { Urgency: "high" },
              notification: {
                icon: `${SITE_URL}/favicon_io/android-chrome-192x192.png`,
                badge: `${SITE_URL}/favicon_io/android-chrome-192x192.png`,
              },
            },
            android: { priority: "high", notification: { icon: "ic_notification", color: "#2563eb" } },
          },
        }),
      });

      const respText = await resp.text();
      console.log("[FCM v1] FCM resp:", resp.status, respText.substring(0, 300));

      if (resp.ok) {
        successCount++;
        await supabase.from("push_subscriptions").update({ last_used_at: new Date().toISOString() }).eq("id", sub.id);
      } else {
        failedIds.push(sub.id);
      }
    } catch (err) {
      console.error("[FCM v1] Send exception:", err);
      failedIds.push(sub.id);
    }
  }

  if (failedIds.length) {
    await supabase.from("push_subscriptions").update({ is_active: false, updated_at: new Date().toISOString() }).in("id", failedIds);
    console.log("[FCM v1] Marked", failedIds.length, "failed");
  }

  console.log("[FCM v1] FINAL:", { success: successCount > 0, sent: successCount });
  return new Response(JSON.stringify({ success: successCount > 0, sent: successCount }), {
    status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});