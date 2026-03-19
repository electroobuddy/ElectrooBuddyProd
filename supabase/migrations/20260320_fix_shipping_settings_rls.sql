-- Fix RLS Policies for shipping_settings table
-- This ensures admins can properly access the shipping settings

-- Drop existing policies
DROP POLICY IF EXISTS "Admins can view shipping settings" ON public.shipping_settings;
DROP POLICY IF EXISTS "Admins can update shipping settings" ON public.shipping_settings;

-- Create new policies with proper admin role checking using has_role function
CREATE POLICY "Admins can view shipping settings"
ON public.shipping_settings FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update shipping settings"
ON public.shipping_settings FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));
