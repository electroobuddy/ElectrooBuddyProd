import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { bookingId, oldStatus, newStatus } = await req.json();

    if (!bookingId || !newStatus) {
      return new Response(JSON.stringify({ error: "Missing bookingId or newStatus" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Get booking details with user email
    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .select("*")
      .eq("id", bookingId)
      .single();

    if (bookingError || !booking) {
      return new Response(JSON.stringify({ error: "Booking not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let userEmail = null;
    if (booking.user_id) {
      const { data: userData } = await supabase.auth.admin.getUserById(booking.user_id);
      userEmail = userData?.user?.email || null;
    }

    // Log the notification
    await supabase.from("booking_notifications").insert({
      booking_id: bookingId,
      old_status: oldStatus,
      new_status: newStatus,
      user_email: userEmail,
      sent: !!userEmail,
    });

    // If we have a user email, send notification via Supabase Auth email (or log for now)
    console.log(`Booking ${bookingId} status changed: ${oldStatus} → ${newStatus}. User email: ${userEmail || 'N/A'}`);

    return new Response(JSON.stringify({ 
      success: true, 
      message: `Notification logged for booking ${bookingId}`,
      email: userEmail,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});