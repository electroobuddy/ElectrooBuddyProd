// deno-lint-ignore-file no-explicit-any
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Type declarations for Deno runtime
declare const Deno: {
  env: {
    get(key: string): string | undefined;
  };
};

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') || '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    const { email, password, name, phone, address, skills, experience, daily_limit, priority, status, profile_url } = await req.json()

    // Validate required fields
    if (!email || !name) {
      throw new Error('Email and name are required')
    }

    // Step 1: Create auth user using admin API
    const { data: authData, error: authError } = await supabaseClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name }
    })

    if (authError) throw authError
    if (!authData.user) throw new Error('Failed to create user')

    const userId = authData.user.id

    // Step 2: Assign technician role
    const { error: roleError } = await supabaseClient
      .from('user_roles')
      .insert({
        user_id: userId,
        role: 'technician'
      })

    if (roleError && !roleError.message.includes('duplicate key')) {
      throw roleError
    }

    // Step 3: Create technician record
    const { error: techError } = await supabaseClient
      .from('technicians')
      .insert({
        user_id: userId,
        name,
        email,
        phone,
        address,
        skills,
        experience,
        daily_limit,
        priority,
        status,
        profile_url,
        approval_status: 'approved'
      })

    if (techError) throw techError

    return new Response(
      JSON.stringify({ 
        success: true, 
        userId,
        email 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message || 'An error occurred' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      }
    )
  }
})
