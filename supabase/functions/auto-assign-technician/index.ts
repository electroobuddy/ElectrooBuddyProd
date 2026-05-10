// @ts-nocheck - Deno runtime, TypeScript checks as Node
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import {
  createClient,
  SupabaseClient,
} from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface RequestBody {
  bookingId: string;
}

interface Technician {
  id: string;
  name: string;
  email: string;
  phone: string;
  skills: string[];
  daily_limit: number;
  priority: number;
  todayCount?: number;
}

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Only accept POST requests
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Create Supabase client with admin privileges
    // Deno.env for production, (globalThis as any).process.env for local testing
    const supabaseUrl =
      (globalThis as any).Deno?.env?.get("SUPABASE_URL") ??
      (globalThis as any).process?.env?.SUPABASE_URL ??
      "";
    const supabaseServiceRoleKey =
      (globalThis as any).Deno?.env?.get("SUPABASE_SERVICE_ROLE_KEY") ??
      (globalThis as any).process?.env?.SUPABASE_SERVICE_ROLE_KEY ??
      "";

    if (!supabaseUrl || !supabaseServiceRoleKey) {
      throw new Error("Missing Supabase environment variables");
    }

    const supabase: SupabaseClient = createClient(
      supabaseUrl,
      supabaseServiceRoleKey,
    );

    // Parse request body
    const { bookingId }: RequestBody = await req.json();

    if (!bookingId) {
      return new Response(JSON.stringify({ error: "Booking ID is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`[Auto-Assign] Starting assignment for booking: ${bookingId}`);

    // Fetch the booking to ensure it exists and is still pending
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

    // Check if booking is already assigned
    if (booking.assigned_technician_id) {
      return new Response(
        JSON.stringify({
          message: "Booking already assigned",
          technician_id: booking.assigned_technician_id,
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Fetch all active technicians
    const { data: technicians, error: techError } = await supabase
      .from("technicians")
      .select("*")
      .eq("status", "active")
      .order("priority", { ascending: false });

    if (techError) {
      throw techError;
    }

    if (!technicians || technicians.length === 0) {
      console.log("[Auto-Assign] No active technicians available");
      return new Response(
        JSON.stringify({
          success: false,
          message: "No active technicians available",
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    console.log(`[Auto-Assign] Found ${technicians.length} active technicians`);

    // Get today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split("T")[0];

    // OPTIMIZED: Single aggregation query instead of N parallel queries
    // This reduces free tier timeout risk significantly
    const technicianIds = technicians.map((t: Technician) => t.id);
    const { data: assignmentCounts, error: countError } = await supabase
      .from("bookings")
      .select("assigned_technician_id, count:assigned_technician_id.count()", {
        count: "exact",
      })
      .eq("assignment_date", today)
      .in("assigned_technician_id", technicianIds)
      .not("assigned_technician_id", "is", null);

    if (countError) {
      console.error("[Auto-Assign] Error fetching counts:", countError);
    }

    // Build a map of technician_id -> count
    const countMap: Record<string, number> = {};
    assignmentCounts?.forEach((row: any) => {
      countMap[row.assigned_technician_id] = parseInt(row.count) || 0;
    });

    // Merge counts with technicians
    const techniciansWithCount = technicians.map((tech: Technician) => ({
      ...tech,
      todayCount: countMap[tech.id] || 0,
    }));

    console.log(
      "[Auto-Assign] Technician counts:",
      techniciansWithCount.map((t: Technician) => ({
        name: t.name,
        count: t.todayCount,
        limit: t.daily_limit,
      })),
    );

    // Filter technicians who have capacity
    const availableTechnicians = techniciansWithCount.filter(
      (tech: Technician) => tech.todayCount! < (tech.daily_limit || 5),
    );

    if (availableTechnicians.length === 0) {
      console.log("[Auto-Assign] All technicians are at capacity");
      return new Response(
        JSON.stringify({
          success: false,
          message: "All technicians are at capacity today",
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Sort by priority (DESC) then by today's count (ASC - least loaded first)
    availableTechnicians.sort((a: Technician, b: Technician) => {
      // First by priority (higher is better)
      if (b.priority !== a.priority) {
        return b.priority - a.priority;
      }
      // Then by load (less is better)
      return (a.todayCount || 0) - (b.todayCount || 0);
    });

    const selectedTechnician = availableTechnicians[0];
    console.log(
      `[Auto-Assign] Selected technician: ${selectedTechnician.name}`,
    );

    // Assign the booking
    const { error: updateError } = await supabase
      .from("bookings")
      .update({
        assigned_technician_id: selectedTechnician.id,
        status: "assigned",
        assigned_at: new Date().toISOString(),
        assignment_date: today,
      })
      .eq("id", bookingId);

    if (updateError) {
      throw updateError;
    }

    console.log(
      `[Auto-Assign] Successfully assigned booking to ${selectedTechnician.name}`,
    );

    return new Response(
      JSON.stringify({
        success: true,
        message: "Technician assigned successfully",
        technician: {
          id: selectedTechnician.id,
          name: selectedTechnician.name,
          email: selectedTechnician.email,
          phone: selectedTechnician.phone,
          skills: selectedTechnician.skills,
        },
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (error: any) {
    console.error("[Auto-Assign] Error:", error);
    return new Response(
      JSON.stringify({
        error: error.message || "Unknown error occurred",
        message: "Failed to assign technician",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
