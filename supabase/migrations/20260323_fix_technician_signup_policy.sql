-- ============================================================================
-- FIX TECHNICIAN SIGNUP RLS POLICY
-- Allow technicians to create their own profiles during signup
-- ============================================================================
-- Description: Fix overly restrictive RLS policy that prevents technician signup
-- Issue: The "Admins can manage technicians" policy with FOR ALL blocks self-signup
-- Solution: Replace with granular policies allowing self-registration
-- Created: 2026-03-23
-- ============================================================================

-- Drop the overly restrictive policy
DROP POLICY IF EXISTS "Admins can manage technicians" ON public.technicians;

-- Create granular policies for proper access control

-- 1. Allow users to create their own technician profile during signup
CREATE POLICY "Users can create own technician profile"
  ON public.technicians FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- 2. Allow technicians to view their own profile
-- Also allow admins to view all profiles
CREATE POLICY "Technicians can view own profile"
  ON public.technicians FOR SELECT TO authenticated
  USING (
    auth.uid() = user_id OR 
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_roles.user_id = auth.uid() 
      AND user_roles.role = 'admin'
    )
  );

-- 3. Allow admins to update technician profiles
CREATE POLICY "Admins can update technicians"
  ON public.technicians FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_roles.user_id = auth.uid() 
      AND user_roles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_roles.user_id = auth.uid() 
      AND user_roles.role = 'admin'
    )
  );

-- 4. Allow admins to delete technician profiles
CREATE POLICY "Admins can delete technicians"
  ON public.technicians FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_roles.user_id = auth.uid() 
      AND user_roles.role = 'admin'
    )
  );

-- Add documentation
COMMENT ON POLICY "Users can create own technician profile" ON public.technicians IS 
  'Allows authenticated users to create their own technician profile during signup. User must match the auth user ID.';

COMMENT ON POLICY "Technicians can view own profile" ON public.technicians IS 
  'Allows technicians to view their own profile and admins to view all profiles';

COMMENT ON POLICY "Admins can update technicians" ON public.technicians IS 
  'Allows admins to update any technician profile';

COMMENT ON POLICY "Admins can delete technicians" ON public.technicians IS 
  'Allows admins to delete any technician profile';
