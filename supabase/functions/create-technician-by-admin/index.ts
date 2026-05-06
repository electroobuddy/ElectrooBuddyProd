// @ts-nocheck
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
    // Log request details for debugging
    console.log('Request method:', req.method)
    console.log('Request headers:', Object.fromEntries(req.headers.entries()))
    
    // Validate environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    
    if (!supabaseUrl || !serviceKey) {
      throw new Error('Missing required environment variables')
    }
    
    // Create admin client with service role key (bypasses RLS)
    const supabaseClient = createClient(
      supabaseUrl,
      serviceKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    )

    console.log('Supabase client created successfully')
    
    const { email, password, name, phone, address, skills, experience, daily_limit, priority, status, profile_url } = await req.json()
    
    console.log('Parsed request data:', { email, name, phone, address, skills, experience, daily_limit, priority, status, profile_url })

    // Validate required fields
    if (!email || !name) {
      console.log('Validation error: Missing email or name')
      throw new Error('Email and name are required')
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      console.log('Validation error: Invalid email format')
      throw new Error('Invalid email format')
    }
    
    // Validate password
    if (password && password.length < 6) {
      console.log('Validation error: Password too short')
      throw new Error('Password must be at least 6 characters')
    }

    // Step 1: Create auth user using admin API
    console.log('Creating auth user for email:', email)
    
    const { data: authData, error: authError } = await supabaseClient.auth.admin.createUser({
      email,
      password: password || Math.random().toString(36).slice(-8),
      email_confirm: true,
      user_metadata: { name }
    })

    if (authError) {
      console.log('Auth user creation error:', authError)
      throw authError
    }
    
    if (!authData.user) {
      console.log('Auth user creation failed: No user data returned')
      throw new Error('Failed to create user')
    }

    const userId = authData.user.id
    console.log('Auth user created successfully with ID:', userId)

    // Step 2 & 3: Create role and technician record in parallel
    console.log('Creating role and technician records for user:', userId)
    
    const [roleResult, techResult] = await Promise.all([
      supabaseClient
        .from('user_roles')
        .insert({
          user_id: userId,
          role: 'technician'
        }),
      supabaseClient
        .from('technicians')
        .insert({
          user_id: userId,
          name,
          email,
          phone: phone || null,
          address: address || null,
          skills: skills || [],
          experience: experience || 0,
          daily_limit: daily_limit || 5,
          priority: priority || 1,
          status: status || 'active',
          profile_url: profile_url || null,
          approval_status: 'approved'
        })
    ])

    console.log('Role creation result:', roleResult)
    console.log('Technician creation result:', techResult)
    
    // Check for errors
    if (roleResult.error && !roleResult.error.message?.includes('duplicate key')) {
      console.log('Role creation error:', roleResult.error)
      throw roleResult.error
    }
    if (techResult.error) {
      console.log('Technician creation error:', techResult.error)
      throw techResult.error
    }
    
    console.log('All records created successfully')

    return new Response(
      JSON.stringify({ 
        success: true, 
        userId,
        email,
        password
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )
  } catch (error: any) {
    console.error('Edge function error:', error)
    return new Response(
      JSON.stringify({ error: error.message || 'An error occurred' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})
