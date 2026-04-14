-- ============================================================================
-- FIX: user_roles RLS Policy - Allow Users to View Their Own Roles
-- Date: 2026-04-12
-- Purpose: Fix 500 error when users try to fetch their roles during login
-- ============================================================================

-- PROBLEM: The previous migration only allowed admins to query user_roles
-- This broke the authentication flow where ALL users need to read their own roles

-- SOLUTION: Create two separate policies
-- 1. Users can view their own roles (SELECT)
-- 2. Admins can manage all roles (INSERT, UPDATE, DELETE)

-- Drop the overly restrictive policies
DROP POLICY IF EXISTS "Admins can manage user roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view own user roles" ON public.user_roles;

-- Policy 1: ALL authenticated users can view their own roles
CREATE POLICY "Users can view own roles"
  ON public.user_roles FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- Policy 2: Admins can insert/update/delete any role
CREATE POLICY "Admins can manage user roles"
  ON public.user_roles FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles admin_check
      WHERE admin_check.user_id = auth.uid() 
      AND admin_check.role = 'admin'
    )
  );

CREATE POLICY "Admins can update user roles"
  ON public.user_roles FOR UPDATE TO authenticated
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

CREATE POLICY "Admins can delete user roles"
  ON public.user_roles FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles admin_check
      WHERE admin_check.user_id = auth.uid() 
      AND admin_check.role = 'admin'
    )
  );

-- ============================================================================
-- Migration Complete
-- ============================================================================

COMMENT ON POLICY "Users can view own roles" ON public.user_roles IS 'Allows all authenticated users to view their own roles (required for authentication flow)';
COMMENT ON POLICY "Admins can manage user roles" ON public.user_roles IS 'Allows admins to create new roles for technicians';
