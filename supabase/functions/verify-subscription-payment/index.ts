// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
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
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ success: false, code: "AUTH_HEADER_MISSING", error: "Missing authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
    const razorpayKeySecret = Deno.env.get("RAZORPAY_KEY_SECRET") ?? "";

    if (!supabaseUrl || !anonKey) {
      return new Response(
        JSON.stringify({ success: false, code: "SUPABASE_CONFIG_MISSING", error: "Supabase env keys are not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }
    if (!razorpayKeySecret) {
      return new Response(
        JSON.stringify({ success: false, code: "RAZORPAY_CONFIG_MISSING", error: "Razorpay secret is not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const {
      data: { user },
      error: authError,
    } = await userClient.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ success: false, code: "UNAUTHORIZED", error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const body = await req.json();
    const razorpayOrderId = body?.razorpay_order_id;
    const razorpayPaymentId = body?.razorpay_payment_id;
    const razorpaySignature = body?.razorpay_signature;

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return new Response(
        JSON.stringify({
          success: false,
          code: "PAYMENT_FIELDS_REQUIRED",
          error: "razorpay_order_id, razorpay_payment_id and razorpay_signature are required",
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const expectedSignature = await hmacHex(`${razorpayOrderId}|${razorpayPaymentId}`, razorpayKeySecret);
    if (expectedSignature !== razorpaySignature) {
      return new Response(
        JSON.stringify({ success: false, code: "INVALID_SIGNATURE", error: "Invalid payment signature" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const { data: existingSub, error: existingSubError } = await userClient
      .from("user_subscriptions")
      .select("id, status, end_date")
      .eq("payment_id", razorpayPaymentId)
      .maybeSingle();

    if (existingSubError) {
      return new Response(
        JSON.stringify({ success: false, code: "FETCH_SUBSCRIPTION_FAILED", error: existingSubError.message }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }
    if (existingSub) {
      return new Response(
        JSON.stringify({ success: true, already_verified: true, subscription_id: existingSub.id }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const { data: subscriptionOrder, error: orderError } = await userClient
      .from("subscription_orders")
      .select("id, user_id, plan_id, amount, currency, duration_days, status")
      .eq("razorpay_order_id", razorpayOrderId)
      .single();

    if (orderError || !subscriptionOrder) {
      return new Response(
        JSON.stringify({ success: false, code: "ORDER_NOT_FOUND", error: "Subscription order not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }
    if (subscriptionOrder.user_id !== user.id) {
      return new Response(
        JSON.stringify({ success: false, code: "ORDER_OWNERSHIP_MISMATCH", error: "Unauthorized for this subscription order" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const nowIso = new Date().toISOString();
    const endDateIso = new Date(Date.now() + Number(subscriptionOrder.duration_days || 365) * 24 * 60 * 60 * 1000).toISOString();

    await userClient
      .from("user_subscriptions")
      .update({ status: "expired" })
      .eq("user_id", user.id)
      .eq("status", "active");

    const { error: updateOrderError } = await userClient
      .from("subscription_orders")
      .update({
        status: "paid",
        razorpay_payment_id: razorpayPaymentId,
        razorpay_signature: razorpaySignature,
        paid_at: nowIso,
      })
      .eq("id", subscriptionOrder.id);

    if (updateOrderError) {
      return new Response(
        JSON.stringify({ success: false, code: "ORDER_UPDATE_FAILED", error: updateOrderError.message }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const { data: newSubscription, error: insertSubError } = await userClient
      .from("user_subscriptions")
      .insert({
        user_id: user.id,
        plan_id: subscriptionOrder.plan_id,
        subscription_order_id: subscriptionOrder.id,
        start_date: nowIso,
        end_date: endDateIso,
        status: "active",
        payment_id: razorpayPaymentId,
        amount: subscriptionOrder.amount,
        currency: subscriptionOrder.currency || "INR",
        verified_at: nowIso,
      })
      .select("id, start_date, end_date, status")
      .single();

    if (insertSubError) {
      return new Response(
        JSON.stringify({ success: false, code: "SUBSCRIPTION_CREATE_FAILED", error: insertSubError.message }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        subscription_id: newSubscription.id,
        start_date: newSubscription.start_date,
        end_date: newSubscription.end_date,
        status: newSubscription.status,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error("verify-subscription-payment error:", error);
    return new Response(
      JSON.stringify({ success: false, code: "UNEXPECTED_ERROR", error: error.message || "Failed to verify payment" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
