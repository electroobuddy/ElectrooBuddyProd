import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

    // Get user from token
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    // Check if user is admin
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError || profile?.role !== 'admin') {
      throw new Error('Admin access required');
    }

    // Parse request body
    const { order_id } = await req.json();
    
    if (!order_id) {
      throw new Error('Order ID required');
    }

    // Fetch order details
    const { data: order, error: orderError } = await supabaseClient
      .from('orders')
      .select('*')
      .eq('id', order_id)
      .single();

    if (orderError || !order) {
      throw new Error('Order not found');
    }

    // Authenticate with Shiprocket
    const shiprocketEmail = Deno.env.get('SHIPROCKET_EMAIL');
    const shiprocketPassword = Deno.env.get('SHIPROCKET_PASSWORD');

    if (!shiprocketEmail || !shiprocketPassword) {
      throw new Error('Shiprocket credentials not configured');
    }

    // Login to Shiprocket
    const loginResponse = await fetch('https://apiv2.shiprocket.in/v1/external/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: shiprocketEmail,
        password: shiprocketPassword,
      }),
    });

    const loginData = await loginResponse.json();
    
    if (!loginData.token) {
      throw new Error('Shiprocket authentication failed');
    }

    const shiprocketToken = loginData.token;

    // Prepare order data for Shiprocket
    const shippingAddress = order.shipping_address_data || {};
    
    const shiprocketOrder = {
      order_id: order.order_number,
      order_date: order.ordered_at,
      billing_customer_name: shippingAddress.full_name || 'Customer',
      billing_last_name: '',
      billing_address: shippingAddress.address_line1 || '',
      billing_address_2: shippingAddress.address_line2 || '',
      billing_city: shippingAddress.city || '',
      billing_pincode: shippingAddress.postal_code || '',
      billing_state: shippingAddress.state || '',
      billing_country: 'India',
      billing_email: order.customer_email || shippingAddress.email || '',
      billing_phone: shippingAddress.phone || '',
      shipping_is_billing: true,
      order_items: [],
      payment_method: order.payment_method === 'cod' ? 'COD' : 'Prepaid',
      sub_total: order.subtotal || order.total_amount,
      length: 10,
      breadth: 10,
      height: 10,
      weight: 1, // Default weight, should be calculated from products
    };

    // Add order items (you may need to fetch from order_items table)
    // For now, using basic info from order
    shiprocketOrder.order_items = [{
      name: `Order Items - ${order.order_number}`,
      sku: `SKU-${order.order_number}`,
      units: 1,
      selling_price: order.total_amount,
      price: order.total_amount,
      tax: order.tax_amount || 0,
      hsn: 8517, // Default HSN code for electronics
    }];

    // Create order in Shiprocket
    const createOrderResponse = await fetch('https://apiv2.shiprocket.in/v1/external/orders/create/adhoc', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${shiprocketToken}`,
      },
      body: JSON.stringify(shiprocketOrder),
    });

    const createOrderData = await createOrderResponse.json();

    if (!createOrderData.order_id && !createOrderData.shipment_id) {
      console.error('Shiprocket order creation failed:', createOrderData);
      throw new Error('Failed to create Shiprocket order');
    }

    // Update order with Shiprocket details
    const { error: updateError } = await supabaseClient
      .from('orders')
      .update({
        shiprocket_order_id: createOrderData.order_id || order.order_number,
        shiprocket_shipment_id: createOrderData.shipment_id,
        tracking_number: createOrderData.awb_code,
        courier_name: 'Shiprocket',
        updated_at: new Date().toISOString(),
      })
      .eq('id', order_id);

    if (updateError) {
      console.error('Failed to update order:', updateError);
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        shiprocket_order_id: createOrderData.order_id,
        shipment_id: createOrderData.shipment_id,
        awb_code: createOrderData.awb_code,
        message: 'Order created successfully in Shiprocket'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Shiprocket order creation error:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message || 'Failed to create Shiprocket order'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
