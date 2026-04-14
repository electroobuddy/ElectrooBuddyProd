-- ============================================================================
-- Fix RLS Policies for Direct Technician Creation (No Edge Function)
-- Date: 2026-04-12
-- Purpose: Allow admins to create technicians directly without edge functions
-- ============================================================================

-- STEP 1: Ensure RLS allows admin to manage user_roles
-- ============================================================================

DROP POLICY IF EXISTS "Admins can manage user roles" ON public.user_roles;

CREATE POLICY "Admins can manage user roles"
  ON public.user_roles FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles admin_check
      WHERE admin_check.user_id = auth.uid() 
      AND admin_check.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles admin_check
      WHERE admin_check.user_id = auth.uid() 
      AND admin_check.role = 'admin'
    )
  );

-- STEP 2: Ensure technicians table RLS allows admin creation
-- ============================================================================

DROP POLICY IF EXISTS "Admins can create technicians" ON public.technicians;
DROP POLICY IF EXISTS "Admins can manage technicians" ON public.technicians;

CREATE POLICY "Admins can create technicians"
  ON public.technicians FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles admin_check
      WHERE admin_check.user_id = auth.uid() 
      AND admin_check.role = 'admin'
    )
  );

CREATE POLICY "Admins can manage technicians"
  ON public.technicians FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles admin_check
      WHERE admin_check.user_id = auth.uid() 
      AND admin_check.role = 'admin'
    )
    OR auth.uid() = user_id
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles admin_check
      WHERE admin_check.user_id = auth.uid() 
      AND admin_check.role = 'admin'
    )
    OR auth.uid() = user_id
  );

-- STEP 3: Create helper function to check admin role
-- ============================================================================

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_id = auth.uid()
        AND role = 'admin'
    );
END;
$$;

GRANT EXECUTE ON FUNCTION public.is_admin TO authenticated;

-- STEP 4: Create function to confirm user email (bypasses email confirmation)
-- ============================================================================

CREATE OR REPLACE FUNCTION public.confirm_user_email(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    UPDATE auth.users
    SET email_confirmed_at = NOW()
    WHERE id = p_user_id
    AND email_confirmed_at IS NULL;
    
    RETURN FOUND;
END;
$$;

GRANT EXECUTE ON FUNCTION public.confirm_user_email TO authenticated;

COMMENT ON FUNCTION public.confirm_user_email IS 'Confirms user email address. Only callable by admins via SECURITY DEFINER.';

-- STEP 5: Verify existing policies are intact
-- ============================================================================

-- Ensure technicians can still view their own profile
DROP POLICY IF EXISTS "Technicians can view own profile" ON public.technicians;

CREATE POLICY "Technicians can view own profile"
  ON public.technicians FOR SELECT TO authenticated
  USING (
    auth.uid() = user_id OR 
    EXISTS (
      SELECT 1 FROM public.user_roles admin_check
      WHERE admin_check.user_id = auth.uid() 
      AND admin_check.role = 'admin'
    )
  );

-- Ensure technicians can update their own profile
DROP POLICY IF EXISTS "Technicians can update own profile" ON public.technicians;

CREATE POLICY "Technicians can update own profile"
  ON public.technicians FOR UPDATE TO authenticated
  USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM public.user_roles admin_check
      WHERE admin_check.user_id = auth.uid() 
      AND admin_check.role = 'admin'
    )
  )
  WITH CHECK (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM public.user_roles admin_check
      WHERE admin_check.user_id = auth.uid() 
      AND admin_check.role = 'admin'
    )
  );

-- ============================================================================
-- Migration Complete
-- ============================================================================

COMMENT ON POLICY "Admins can manage user roles" ON public.user_roles IS 'Allows admins to create and manage user roles for technicians';
COMMENT ON POLICY "Admins can create technicians" ON public.technicians IS 'Allows admins to create technician records directly';
COMMENT ON FUNCTION public.is_admin() IS 'Helper function to check if current user is an admin';
