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
    const { to, type, booking, oldStatus, newStatus } = await req.json();

    if (!to || !type) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    const emailFrom = Deno.env.get("EMAIL_FROM") || "noreply@electroobuddy.com";

    // If no Resend API key, just log and return success
    if (!resendApiKey) {
      console.log("Email notification (no API key configured):", { to, type, booking });
      return new Response(JSON.stringify({ 
        success: true, 
        message: "Email logged (API key not configured)",
        email: to,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Email templates
    const emailTemplates = {
      booking_created: {
        subject: "Booking Received - ElectroBuddy",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #2563eb;">Booking Received!</h1>
            <p>Dear ${booking?.name || 'Customer'},</p>
            <p>Thank you for booking with ElectroBuddy. We have received your service request.</p>
            <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0;">Booking Details:</h3>
              <p><strong>Service:</strong> ${booking?.service_type || 'N/A'}</p>
              <p><strong>Date:</strong> ${booking?.preferred_date || 'N/A'}</p>
              <p><strong>Time:</strong> ${booking?.preferred_time || 'N/A'}</p>
              <p><strong>Address:</strong> ${booking?.address || 'N/A'}</p>
            </div>
            <p>We will confirm your booking shortly and assign a technician.</p>
            <p style="margin-top: 30px;">Best regards,<br/>ElectroBuddy Team</p>
          </div>
        `,
      },
      booking_confirmed: {
        subject: "Booking Confirmed - ElectroBuddy",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #10b981;">Booking Confirmed!</h1>
            <p>Dear ${booking?.name || 'Customer'},</p>
            <p>Your booking has been confirmed.</p>
            <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0;">Booking Details:</h3>
              <p><strong>Service:</strong> ${booking?.service_type || 'N/A'}</p>
              <p><strong>Date:</strong> ${booking?.preferred_date || 'N/A'}</p>
              <p><strong>Time:</strong> ${booking?.preferred_time || 'N/A'}</p>
              <p><strong>Address:</strong> ${booking?.address || 'N/A'}</p>
            </div>
            <p>Our technician will arrive at the scheduled time.</p>
            <p style="margin-top: 30px;">Best regards,<br/>ElectroBuddy Team</p>
          </div>
        `,
      },
      booking_assigned: {
        subject: "Technician Assigned - ElectroBuddy",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #3b82f6;">Technician Assigned!</h1>
            <p>Dear ${booking?.name || 'Customer'},</p>
            <p>A technician has been assigned to your booking.</p>
            <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0;">Booking Details:</h3>
              <p><strong>Service:</strong> ${booking?.service_type || 'N/A'}</p>
              <p><strong>Date:</strong> ${booking?.preferred_date || 'N/A'}</p>
              <p><strong>Time:</strong> ${booking?.preferred_time || 'N/A'}</p>
            </div>
            <p>The technician will contact you before arrival.</p>
            <p style="margin-top: 30px;">Best regards,<br/>ElectroBuddy Team</p>
          </div>
        `,
      },
      booking_completed: {
        subject: "Service Completed - ElectroBuddy",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #10b981;">Service Completed!</h1>
            <p>Dear ${booking?.name || 'Customer'},</p>
            <p>Your service has been completed successfully.</p>
            <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0;">Service Details:</h3>
              <p><strong>Service:</strong> ${booking?.service_type || 'N/A'}</p>
            </div>
            <p>Thank you for choosing ElectroBuddy! We hope you're satisfied with our service.</p>
            <p style="margin-top: 30px;">Best regards,<br/>ElectroBuddy Team</p>
          </div>
        `,
      },
      booking_cancelled: {
        subject: "Booking Cancelled - ElectroBuddy",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #ef4444;">Booking Cancelled</h1>
            <p>Dear ${booking?.name || 'Customer'},</p>
            <p>Your booking has been cancelled.</p>
            <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0;">Booking Details:</h3>
              <p><strong>Service:</strong> ${booking?.service_type || 'N/A'}</p>
              <p><strong>Date:</strong> ${booking?.preferred_date || 'N/A'}</p>
            </div>
            <p>If you have any questions, please contact our support team.</p>
            <p style="margin-top: 30px;">Best regards,<br/>ElectroBuddy Team</p>
          </div>
        `,
      },
      new_booking: {
        subject: "New Booking Alert - ElectroBuddy",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #f59e0b;">New Booking Received!</h1>
            <p>A new booking has been submitted.</p>
            <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0;">Booking Details:</h3>
              <p><strong>Customer:</strong> ${booking?.name || 'N/A'}</p>
              <p><strong>Phone:</strong> ${booking?.phone || 'N/A'}</p>
              <p><strong>Service:</strong> ${booking?.service_type || 'N/A'}</p>
              <p><strong>Date:</strong> ${booking?.preferred_date || 'N/A'}</p>
              <p><strong>Time:</strong> ${booking?.preferred_time || 'N/A'}</p>
              <p><strong>Address:</strong> ${booking?.address || 'N/A'}</p>
            </div>
            <p>Please review and confirm this booking.</p>
            <p style="margin-top: 30px;">ElectroBuddy Admin Panel</p>
          </div>
        `,
      },
    };

    const template = emailTemplates[type] || emailTemplates.booking_confirmed;

    // Send email via Resend
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: emailFrom,
        to: [to],
        subject: template.subject,
        html: template.html,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to send email: ${error}`);
    }

    const result = await response.json();

    // Mark email as sent in notifications table
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    if (booking?.id) {
      await supabase
        .from("notifications")
        .update({ email_sent: true, email_sent_at: new Date().toISOString() })
        .eq("booking_id", booking.id)
        .eq("email_sent", false);
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message: "Email sent successfully",
      email: to,
      resendId: result.id,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error sending email:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
