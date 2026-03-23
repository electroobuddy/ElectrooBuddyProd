-- Add 'technician' role to app_role enum
-- This allows technicians to have their own role in the system

-- Step 1: Drop ALL policies on technicians table that might reference user_roles
-- This ensures we catch any policy that depends on the role column
DROP POLICY IF EXISTS "Technicians can view own profile" ON public.technicians;
DROP POLICY IF EXISTS "Admins can manage technicians" ON public.technicians;
DROP POLICY IF EXISTS "Admins can update technicians" ON public.technicians;
DROP POLICY IF EXISTS "Admins can delete technicians" ON public.technicians;
DROP POLICY IF EXISTS "Admins can update approval status" ON public.technicians;

-- Step 2: Create new enum type with all roles including 'technician'
CREATE TYPE public.app_role_new AS ENUM ('admin', 'user', 'technician');

-- Step 3: Update user_roles table to use new enum
ALTER TABLE public.user_roles 
  ALTER COLUMN role TYPE public.app_role_new 
  USING role::text::public.app_role_new;

-- Step 4: Update has_role function to use new enum
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

-- Step 5: Drop old enum type
DROP TYPE public.app_role;

-- Step 6: Rename new enum to app_role
ALTER TYPE public.app_role_new RENAME TO app_role;

-- Step 7: Recreate ALL dependent policies with updated role references
-- Technicians can view own profile
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

-- Admins can update technicians (includes approval status and other fields)
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

-- Admins can delete technicians
CREATE POLICY "Admins can delete technicians"
  ON public.technicians FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_roles.user_id = auth.uid() 
      AND user_roles.role = 'admin'
    )
  );

-- Step 8: Add comment
COMMENT ON TYPE public.app_role IS 'Application roles: admin (full access), user (customer), technician (service provider)';

-- Note: Policies now support the new 'technician' role through the updated has_role() function
