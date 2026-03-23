-- Fix user_roles RLS to allow technician self-signup
-- This adds the missing INSERT policy for user_roles table
-- Migration Date: 2026-03-24

-- Drop any existing conflicting policies
DROP POLICY IF EXISTS "Users can insert own role" ON public.user_roles;
DROP POLICY IF EXISTS "users_can_insert_own_role" ON public.user_roles;

-- Create new policy that allows authenticated users to assign themselves roles during signup
CREATE POLICY "Users can insert own role"
    ON public.user_roles FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- Add documentation
COMMENT ON POLICY "Users can insert own role" ON public.user_roles IS 
  'Allows authenticated users to assign themselves roles during signup (e.g., technician role). User ID must match the auth user ID.';

-- Verify the policy exists
SELECT '✅ SUCCESS: Policy created for user_roles INSERT' as status;
SELECT policyname, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename = 'user_roles' AND cmd = 'INSERT';
