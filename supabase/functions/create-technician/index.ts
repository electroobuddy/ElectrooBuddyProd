import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface RequestBody {
  name: string;
  email: string;
  password?: string;
  phone?: string;
  address?: string;
  skills?: string[];
  experience?: number;
  daily_limit?: number;
  priority?: number;
  status?: string;
  profile_url?: string;
}

serve(async (req: Request) => {
  console.log("Received request:", req.method, req.url);
  
  // Handle CORS preflight requests FIRST - return empty response
  if (req.method === "OPTIONS") {
    console.log("CORS preflight request - returning immediately");
    return new Response(null, { 
      status: 200, 
      headers: corsHeaders 
    });
  }

  try {
    // Only allow POST requests
    if (req.method !== "POST") {
      console.error("Invalid method:", req.method);
      throw new Error("Method not allowed");
    }

    // Get authorization header
    const authHeader = req.headers.get("Authorization");
    console.log("Auth header present:", !!authHeader);
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.error("Missing or invalid auth header");
      throw new Error("Missing or invalid authorization header");
    }

    const token = authHeader.replace("Bearer ", "");
    console.log("Token extracted successfully");
    
    // Create Supabase client with service role
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    
    console.log("Supabase URL configured:", !!supabaseUrl);
    console.log("Service key configured:", !!supabaseServiceKey);
    
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Verify the calling user has admin privileges
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);
    
    if (userError || !user) {
      console.error("User validation failed:", userError?.message || "No user returned");
      throw new Error("Unauthorized: Invalid token");
    }

    console.log("User authenticated:", user.email);

    // Check if user has admin role using the has_role function
    const { data: hasRoleData, error: hasRoleError } = await supabaseAdmin.rpc('has_role', {
      _user_id: user.id,
      _role: 'admin' as any
    });

    if (hasRoleError) {
      console.error("Error checking role:", hasRoleError.message);
    } else {
      console.log("Has admin role:", hasRoleData);
    }

    if (!hasRoleData) {
      console.error("User not authorized - not an admin");
      throw new Error("Forbidden: Admin access required");
    }

    console.log("User authorized as admin");

    // Parse request body
    const body: RequestBody = await req.json();
    
    if (!body.name || !body.email) {
      throw new Error("Name and email are required");
    }

    // Generate random password if not provided
    const password = body.password || Math.random().toString(36).slice(-8);

    // Create auth user
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: body.email,
      password: password,
      email_confirm: true,
    });

    if (authError) {
      console.error("Auth error:", authError);
      throw new Error(authError.message || "Failed to create auth user");
    }

    // Create technician record
    const { error: techError } = await supabaseAdmin
      .from("technicians")
      .insert({
        user_id: authData.user.id,
        name: body.name,
        email: body.email,
        phone: body.phone || null,
        address: body.address || null,
        skills: body.skills || [],
        experience: body.experience || 0,
        daily_limit: body.daily_limit || 5,
        priority: body.priority || 1,
        status: body.status || "active",
        profile_url: body.profile_url || null,
      });

    if (techError) {
      console.error("Technician error:", techError);
      // Rollback: delete the auth user
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
      throw new Error(techError.message || "Failed to create technician record");
    }

    // Assign user role
    const { error: roleError } = await supabaseAdmin
      .from("user_roles")
      .insert({
        user_id: authData.user.id,
        role: "user",
      });

    if (roleError) {
      console.error("Role error:", roleError);
      // Don't fail completely, just log it
    }

    return new Response(
      JSON.stringify({
        success: true,
        userId: authData.user.id,
        password: password,
        message: "Technician created successfully",
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Error creating technician:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "Failed to create technician",
      }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
