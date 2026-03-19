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
    // Verify webhook authenticity (Shiprocket sends specific headers)
    const webhookToken = req.headers.get('X-Shiprocket-Webhook-Token');
    
    // You can add token verification here if configured in Shiprocket dashboard
    
    const { data, error: parseError } = await req.json();
    
    if (parseError) {
      throw new Error('Invalid JSON payload');
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization') || '' },
        },
      }
    );

    // Extract tracking information from webhook payload
    const awbCode = data.awb_code;
    const status = data.status;
    const courierName = data.courier_name;
    const trackingDetails = data.tracking_details;
    const deliveredAt = data.delivered_at;

    if (!awbCode) {
      throw new Error('AWB code required');
    }

    // Find order by tracking number
    const { data: order, error: orderError } = await supabaseClient
      .from('orders')
      .select('id')
      .eq('tracking_number', awbCode)
      .single();

    if (orderError || !order) {
      console.error('Order not found for AWB:', awbCode);
      return new Response(
        JSON.stringify({ success: false, message: 'Order not found' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 404,
        }
      );
    }

    // Map Shiprocket status to order status
    let orderStatus = 'shipped';
    let fulfillmentStatus = 'in_transit';

    if (status === 'delivered' || status === 'Delivered') {
      orderStatus = 'delivered';
      fulfillmentStatus = 'delivered';
    } else if (status === 'cancelled' || status === 'Cancelled') {
      orderStatus = 'cancelled';
      fulfillmentStatus = 'cancelled';
    } else if (status === 'out_for_delivery' || status === 'Out for Delivery') {
      orderStatus = 'out_for_delivery';
      fulfillmentStatus = 'out_for_delivery';
    }

    // Update order with tracking information
    const updateData: any = {
      status: orderStatus,
      fulfillment_status: fulfillmentStatus,
      courier_name: courierName || 'Shiprocket',
      updated_at: new Date().toISOString(),
    };

    if (deliveredAt) {
      updateData.delivered_at = deliveredAt;
    }

    // Store detailed tracking history if available
    if (trackingDetails && Array.isArray(trackingDetails)) {
      // You could create a separate order_tracking_history table
      // For now, we'll store as JSONB
      updateData.tracking_history = trackingDetails;
    }

    const { error: updateError } = await supabaseClient
      .from('orders')
      .update(updateData)
      .eq('id', order.id);

    if (updateError) {
      console.error('Failed to update order:', updateError);
      throw new Error('Failed to update order tracking');
    }

    // Optionally: Send notification to customer about status update
    // This could trigger a Supabase function to send email/SMS

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Tracking updated successfully',
        order_id: order.id,
        new_status: orderStatus,
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Webhook processing error:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message || 'Failed to process webhook'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
