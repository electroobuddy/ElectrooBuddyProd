// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-razorpay-signature",
};

async function hmacHex(message: string, secret: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(message));
  return Array.from(new Uint8Array(signature)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const webhookSecret = Deno.env.get("RAZORPAY_WEBHOOK_SECRET") ?? "";

    if (!serviceRoleKey) throw new Error("Missing service role key");
    if (!webhookSecret) throw new Error("Missing RAZORPAY_WEBHOOK_SECRET");

    const rawBody = await req.text();
    const incomingSignature = req.headers.get("x-razorpay-signature");
    if (!incomingSignature) throw new Error("Missing webhook signature");

    const expectedSignature = await hmacHex(rawBody, webhookSecret);
    if (expectedSignature !== incomingSignature) throw new Error("Invalid webhook signature");

    const payload = JSON.parse(rawBody);
    const event = payload?.event;
    const paymentEntity = payload?.payload?.payment?.entity;
    const orderId = paymentEntity?.order_id;
    const paymentId = paymentEntity?.id;

    if (!event || !orderId) {
      return new Response(JSON.stringify({ success: true, ignored: true }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    const { data: subscriptionOrder, error: orderError } = await adminClient
      .from("subscription_orders")
      .select("id, user_id, plan_id, amount, currency, duration_days, status")
      .eq("razorpay_order_id", orderId)
      .maybeSingle();

    if (orderError || !subscriptionOrder) {
      return new Response(JSON.stringify({ success: true, ignored: true, reason: "order_not_found" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (event === "payment.captured" || event === "order.paid") {
      const { data: existingSub } = await adminClient
        .from("user_subscriptions")
        .select("id")
        .eq("payment_id", paymentId)
        .maybeSingle();

      if (!existingSub) {
        const nowIso = new Date().toISOString();
        const endDateIso = new Date(
          Date.now() + Number(subscriptionOrder.duration_days || 365) * 24 * 60 * 60 * 1000,
        ).toISOString();

        await adminClient
          .from("user_subscriptions")
          .update({ status: "expired" })
          .eq("user_id", subscriptionOrder.user_id)
          .eq("status", "active");

        await adminClient
          .from("user_subscriptions")
          .insert({
            user_id: subscriptionOrder.user_id,
            plan_id: subscriptionOrder.plan_id,
            subscription_order_id: subscriptionOrder.id,
            start_date: nowIso,
            end_date: endDateIso,
            status: "active",
            payment_id: paymentId,
            amount: subscriptionOrder.amount,
            currency: subscriptionOrder.currency || "INR",
            verified_at: nowIso,
          });
      }

      await adminClient
        .from("subscription_orders")
        .update({
          status: "paid",
          razorpay_payment_id: paymentId,
          paid_at: new Date().toISOString(),
          metadata: payload,
        })
        .eq("id", subscriptionOrder.id);
    } else if (event === "payment.failed") {
      await adminClient
        .from("subscription_orders")
        .update({
          status: "failed",
          metadata: payload,
        })
        .eq("id", subscriptionOrder.id);
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("razorpay-subscription-webhook error:", error);
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
