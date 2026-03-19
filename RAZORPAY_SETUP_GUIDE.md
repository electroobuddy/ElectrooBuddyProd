# 🔴 Razorpay Integration Setup Guide

## ⚠️ IMPORTANT: You're Using LIVE Keys Incorrectly!

The errors you're seeing (404 and 400 Bad Request) are because:
1. **Live keys require backend order creation** - You can't use them directly from frontend
2. **Missing proper order ID format** - Live mode needs server-side verification

---

## ✅ SOLUTION: Use TEST Mode for Development

### Step 1: Get Your TEST Keys

1. **Login to Razorpay Dashboard**: https://dashboard.razorpay.com/app/keys
2. **Switch to TEST Mode** (toggle at top of dashboard)
3. **Copy Test Key ID** and **Test Key Secret**
4. **Update `.env` file**:

```env
VITE_RAZORPAY_KEY_ID="rzp_test_xxxxxxxxxxxxx"
VITE_RAZORPAY_KEY_SECRET="xxxxxxxxxxxxxxxxxxxxx"
```

### Step 2: Restart Your Development Server

After updating `.env`, restart:
```bash
# Stop the server (Ctrl+C)
npm run dev
```

### Step 3: Test with Test Card Details

Use these test cards in Razorpay modal:
- **Card Number**: `4111 1111 1111 1111`
- **Expiry**: Any future date (e.g., `12/25`)
- **CVV**: Any 3 digits (e.g., `123`)
- **OTP**: Not required in test mode

---

## 🚀 When Ready for PRODUCTION (Live Mode)

### Prerequisites for Live Mode:

1. **Complete Razorpay KYC** - Ensure your account is fully verified
2. **Activate Payment Gateway** - Go live status must be approved
3. **Backend Required** - Must create orders from server-side

### Production Integration Steps:

#### Option A: Simple Frontend-Only (NOT Recommended for Live)

If you want to test live payments without backend:

1. **Update `.env` with live keys**:
```env
VITE_RAZORPAY_KEY_ID="rzp_live_LW0PsPBjCOnKsC"
VITE_RAZORPAY_KEY_SECRET="JjZj36e4eyvdXTpVeMVk10hu"
```

2. **Modify Checkout.tsx** - Remove order_id requirement:

```typescript
const handleRazorpayPayment = async (orderId, orderNumber, amount) => {
  const loaded = await loadRazorpayScript();
  if (!loaded) {
    toast.error("Failed to load payment gateway");
    return false;
  }

  const options = {
    key: import.meta.env.VITE_RAZORPAY_KEY_ID,
    amount: Math.round(amount * 100),
    currency: "INR",
    name: "Electroobuddy",
    description: `Order Payment - ${orderNumber}`,
    // REMOVE order_id line - don't pass it
    handler: async function (response) {
      // Verify payment signature here
      // Update order with payment details
    },
    prefill: {
      name: shippingInfo.full_name,
      email: shippingInfo.email,
      contact: shippingInfo.phone,
    },
    theme: {
      color: "#3b82f6",
    },
  };

  const rzp = new (window as any).Razorpay(options);
  rzp.open();
};
```

⚠️ **WARNING**: This approach is NOT secure for production! Anyone can manipulate the amount.

---

#### Option B: Proper Backend Integration (RECOMMENDED)

Create a Supabase Edge Function to generate Razorpay orders:

**File: `supabase/functions/create-razorpay-order/index.ts`**

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Razorpay from "https://esm.sh/razorpay@2.8.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { amount } = await req.json();
    
    const razorpay = new Razorpay({
      key_id: Deno.env.get('RAZORPAY_KEY_ID')!,
      key_secret: Deno.env.get('RAZORPAY_KEY_SECRET')!,
    });

    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100), // Convert to paise
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
    });

    return new Response(
      JSON.stringify({ 
        orderId: order.id,
        amount: order.amount,
        currency: order.currency 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
```

**Update Checkout.tsx to use backend:**

```typescript
const createRazorpayOrder = async (amount: number) => {
  const { data, error } = await supabase.functions.invoke('create-razorpay-order', {
    body: { amount },
  });

  if (error) throw error;
  return data.orderId;
};

// In handleSubmit:
if (paymentMethod === "razorpay") {
  const razorpayOrderId = await createRazorpayOrder(grandTotal);
  const paymentSuccess = await handleRazorpayPayment(
    razorpayOrderId,
    orderNumber,
    grandTotal
  );
}
```

---

## 🔍 Understanding Your Errors

### Error 1: 404 on `/v2/standard_checkout/preferences`
**Cause**: Invalid or missing order ID format
**Solution**: Create proper Razorpay order first

### Error 2: 400 Bad Request on `/v1/standard_checkout/preferences`
**Causes**:
- Missing required parameters
- Invalid amount format (must be in paise)
- Currency mismatch
- Order ID doesn't exist

**Solution**: Follow proper integration flow

---

## 📋 Quick Checklist

### For TEST Mode ✅
- [ ] Get test keys from Razorpay dashboard
- [ ] Update `.env` with test keys
- [ ] Restart development server
- [ ] Test with test card (4111 1111 1111 1111)
- [ ] Verify payments appear in admin panel

### For LIVE Mode 🚀
- [ ] Complete Razorpay KYC
- [ ] Get live keys approved
- [ ] Set up backend (Supabase Edge Function)
- [ ] Implement payment signature verification
- [ ] Test with small real amount first
- [ ] Add webhook handlers
- [ ] Enable logging and monitoring

---

## 🎯 Current Recommendation

**For now, use TEST mode** to develop and test your application:

1. Get test keys from: https://dashboard.razorpay.com/app/keys
2. Update `.env` file
3. Test thoroughly
4. Switch to live mode only when ready for production

**Your current live keys will work once you:**
- Complete Razorpay onboarding
- Set up proper backend order creation
- Implement payment verification

---

## 📞 Need Help?

- **Razorpay Test Keys**: https://razorpay.com/docs/payments/payments/test-card-upi-netbanking/
- **Integration Docs**: https://razorpay.com/docs/payment-gateway/web-integration/
- **API Reference**: https://razorpay.com/docs/api/

---

**Remember**: Never expose your secret key in frontend code for production apps!
