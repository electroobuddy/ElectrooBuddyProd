// @ts-nocheck
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
    const { bookingId, oldStatus, newStatus, technicianId } = await req.json();

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

    // Log the notification in legacy table
    await supabase.from("booking_notifications").insert({
      booking_id: bookingId,
      old_status: oldStatus,
      new_status: newStatus,
      user_email: userEmail,
      sent: !!userEmail,
    });

    // Define statusMessages before using it
    const statusMessages = {
      confirmed: {
        title: "Booking Confirmed",
        message: `Your booking for ${booking.service_type} has been confirmed. Date: ${booking.preferred_date}, Time: ${booking.preferred_time}`,
      },
      assigned: {
        title: "Technician Assigned",
        message: `A technician has been assigned to your booking for ${booking.service_type}.`,
      },
      in_progress: {
        title: "Service In Progress",
        message: `Your technician has started working on your ${booking.service_type} booking.`,
      },
      completed: {
        title: "Service Completed",
        message: `Your booking for ${booking.service_type} has been completed. Thank you for using our service!`,
      },
      cancelled: {
        title: "Booking Cancelled",
        message: `Your booking for ${booking.service_type} has been cancelled.`,
      },
    };

    // Create in-app notification for user
    let createdNotificationId = null;
    let statusMsg = null;
    
    if (booking.user_id) {
      statusMsg = statusMessages[newStatus] || {
        title: "Booking Status Updated",
        message: `Your booking status has been changed to ${newStatus}.`,
      };

      const { data: notifId } = await supabase.rpc("create_notification", {
        p_user_id: booking.user_id,
        p_type: `booking_${newStatus}`,
        p_title: statusMsg.title,
        p_message: statusMsg.message,
        p_booking_id: bookingId,
        p_metadata: { old_status: oldStatus, new_status: newStatus },
      });
      
      createdNotificationId = notifId;
    }

    // If booking is assigned, notify the technician
    if (newStatus === "assigned" && booking.assigned_technician_id) {
      const { data: technician } = await supabase
        .from("technicians")
        .select("user_id, name")
        .eq("id", booking.assigned_technician_id)
        .single();

      if (technician?.user_id) {
        await supabase.rpc("create_notification", {
          p_user_id: technician.user_id,
          p_type: "technician_assigned",
          p_title: "New Booking Assigned",
          p_message: `You have been assigned a new booking: ${booking.service_type} for ${booking.name} on ${booking.preferred_date} at ${booking.preferred_time}.`,
          p_booking_id: bookingId,
          p_metadata: { customer_name: booking.name, service: booking.service_type },
        });
        
        // Send push notification to technician
        try {
          await supabase.functions.invoke("send-push-notification", {
            body: {
              userId: technician.user_id,
              title: "👨‍🔧 New Booking Assigned",
              body: `${booking.service_type} for ${booking.name} on ${booking.preferred_date}`,
              url: `/technician/bookings`,
              type: "technician_assigned",
            },
          });
        } catch (pushError) {
          console.error("Failed to send push to technician:", pushError);
        }
      }
    }

    // Send email notification if email is available
    if (userEmail) {
      try {
        await supabase.functions.invoke("send-notification-email", {
          body: {
            to: userEmail,
            type: `booking_${newStatus}`,
            booking: booking,
            oldStatus: oldStatus,
            newStatus: newStatus,
          },
        });
      } catch (emailError) {
        console.error("Failed to send email notification:", emailError);
      }
    }

    // Send push notification if user has subscriptions
    if (booking.user_id && createdNotificationId) {
      try {
        await supabase.functions.invoke("send-push-notification", {
          body: {
            userId: booking.user_id,
            title: statusMsg.title,
            body: statusMsg.message,
            url: `/dashboard/bookings`,
            type: `booking_${newStatus}`,
            notificationId: createdNotificationId,
          },
        });
      } catch (pushError) {
        console.error("Failed to send push notification:", pushError);
      }
    }

    console.log(`Booking ${bookingId} status changed: ${oldStatus} → ${newStatus}. User email: ${userEmail || 'N/A'}`);

    return new Response(JSON.stringify({ 
      success: true, 
      message: `Notification sent for booking ${bookingId}`,
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