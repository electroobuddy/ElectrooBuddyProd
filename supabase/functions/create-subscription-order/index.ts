// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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
    const razorpayKeyId = Deno.env.get("RAZORPAY_KEY_ID") ?? "";
    const razorpayKeySecret = Deno.env.get("RAZORPAY_KEY_SECRET") ?? "";

    if (!supabaseUrl || !anonKey) {
      return new Response(
        JSON.stringify({ success: false, code: "SUPABASE_CONFIG_MISSING", error: "Supabase env keys are not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    if (!razorpayKeyId || !razorpayKeySecret) {
      return new Response(
        JSON.stringify({ success: false, code: "RAZORPAY_CONFIG_MISSING", error: "Razorpay keys are not configured" }),
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
    const planId = body?.plan_id;
    if (!planId) {
      return new Response(
        JSON.stringify({ success: false, code: "PLAN_ID_REQUIRED", error: "plan_id is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const { data: plan, error: planError } = await userClient
      .from("subscription_plans")
      .select("id, name, price, currency, duration_days, is_active")
      .eq("id", planId)
      .single();

    if (planError || !plan) {
      return new Response(
        JSON.stringify({ success: false, code: "PLAN_NOT_FOUND", error: "Subscription plan not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }
    if (!plan.is_active) {
      return new Response(
        JSON.stringify({ success: false, code: "PLAN_INACTIVE", error: "Selected subscription plan is inactive" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const receipt = `sub_${Date.now()}_${user.id.slice(0, 8)}`;
    const amountInPaise = Math.round(Number(plan.price) * 100);

    const razorpayOrderResponse = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        Authorization: `Basic ${btoa(`${razorpayKeyId}:${razorpayKeySecret}`)}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: amountInPaise,
        currency: plan.currency || "INR",
        receipt,
        notes: {
          user_id: user.id,
          plan_id: plan.id,
          plan_name: plan.name,
        },
      }),
    });

    if (!razorpayOrderResponse.ok) {
      const errorPayload = await razorpayOrderResponse.text();
      return new Response(
        JSON.stringify({
          success: false,
          code: "RAZORPAY_ORDER_CREATE_FAILED",
          error: "Razorpay order creation failed",
          details: errorPayload,
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const razorpayOrder = await razorpayOrderResponse.json();

    const { data: subscriptionOrder, error: insertError } = await userClient
      .from("subscription_orders")
      .insert({
        user_id: user.id,
        plan_id: plan.id,
        amount: plan.price,
        currency: plan.currency || "INR",
        duration_days: plan.duration_days || 365,
        status: "created",
        razorpay_order_id: razorpayOrder.id,
        metadata: {
          receipt,
          plan_name: plan.name,
          razorpay_amount: razorpayOrder.amount,
        },
      })
      .select("id, razorpay_order_id, amount, currency")
      .single();

    if (insertError) {
      return new Response(
        JSON.stringify({
          success: false,
          code: "ORDER_INSERT_FAILED",
          error: "Failed to save subscription order",
          details: insertError.message,
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        subscription_order_id: subscriptionOrder.id,
        razorpay_order_id: subscriptionOrder.razorpay_order_id,
        amount: Number(subscriptionOrder.amount),
        currency: subscriptionOrder.currency,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error("create-subscription-order error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        code: "UNEXPECTED_ERROR",
        error: error.message || "Failed to create subscription order",
      }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
