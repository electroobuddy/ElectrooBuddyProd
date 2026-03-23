-- Fix technicians RLS policy to allow self-signup
-- This allows authenticated users to create their own technician profile

-- Drop the existing overly restrictive policy
DROP POLICY IF EXISTS "Admins can manage technicians" ON public.technicians;

-- Create new policies that allow self-signup and admin management
CREATE POLICY "Users can create own technician profile"
  ON public.technicians FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

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

CREATE POLICY "Admins can delete technicians"
  ON public.technicians FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_roles.user_id = auth.uid() 
      AND user_roles.role = 'admin'
    )
  );

-- Add comment
COMMENT ON POLICY "Users can create own technician profile" ON public.technicians IS 'Allows authenticated users to create their own technician profile during signup';
