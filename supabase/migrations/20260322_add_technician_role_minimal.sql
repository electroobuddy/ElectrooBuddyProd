-- Minimal fix to add 'technician' role to app_role enum
-- Only drops the 4 policies that actually reference user_roles.role

-- ============================================================================
-- STEP 1: DROP ONLY THE POLICIES THAT DEPEND ON user_roles.role
-- Based on actual database query results
-- ============================================================================

DROP POLICY IF EXISTS "Admins can view notifications" ON public.admin_notifications;
DROP POLICY IF EXISTS "Admins can view audit logs" ON public.technician_audit_log;
DROP POLICY IF EXISTS "View own profile" ON public.technicians;
DROP POLICY IF EXISTS "Admins can update approval status" ON public.technicians;

-- ============================================================================
-- STEP 2: CREATE NEW ENUM WITH TECHNICIAN ROLE
-- ============================================================================

CREATE TYPE public.app_role_new AS ENUM ('admin', 'user', 'technician');

-- ============================================================================
-- STEP 3: ALTER USER_ROLES TABLE TO USE NEW ENUM
-- ============================================================================

ALTER TABLE public.user_roles 
  ALTER COLUMN role TYPE public.app_role_new 
  USING role::text::public.app_role_new;

-- ============================================================================
-- STEP 4: UPDATE HAS_ROLE FUNCTION
-- ============================================================================

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role_new)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- ============================================================================
-- STEP 5: DROP OLD ENUM
-- ============================================================================

DROP TYPE public.app_role;

-- ============================================================================
-- STEP 6: RENAME NEW ENUM
-- ============================================================================

ALTER TYPE public.app_role_new RENAME TO app_role;

-- ============================================================================
-- STEP 7: RECREATE THE 4 DROPPED POLICIES
-- ============================================================================

-- admin_notifications: Admins can view notifications
CREATE POLICY "Admins can view notifications"
  ON public.admin_notifications FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_roles.user_id = auth.uid() 
      AND user_roles.role = 'admin'
    )
  );

-- technician_audit_log: Admins can view audit logs
CREATE POLICY "Admins can view audit logs"
  ON public.technician_audit_log FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_roles.user_id = auth.uid() 
      AND user_roles.role = 'admin'
    )
  );

-- technicians: View own profile (technicians OR admins)
CREATE POLICY "View own profile"
  ON public.technicians FOR SELECT TO authenticated
  USING (
    auth.uid() = user_id OR 
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_roles.user_id = auth.uid() 
      AND user_roles.role = 'admin'
    )
  );

-- technicians: Admins can update approval status
CREATE POLICY "Admins can update approval status"
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

-- ============================================================================
-- STEP 8: ADD COMMENT
-- ============================================================================

COMMENT ON TYPE public.app_role IS 'Application roles: admin (full access), user (customer), technician (service provider)';
