-- ============================================================================
-- UPDATE USER ROLES - ADD NEW ENUM VALUE
-- ============================================================================
-- This migration adds a new role to the app_role ENUM
-- Run this on your existing database to update the user_roles table
-- Handles all dependent policies and functions
-- ============================================================================

-- Step 1: Drop ALL policies that depend on has_role function
-- We need to drop these before we can drop the function

-- From services table
DROP POLICY IF EXISTS "Admins can manage services" ON public.services;

-- From bookings table
DROP POLICY IF EXISTS "Admins can manage bookings" ON public.bookings;

-- From team_members table
DROP POLICY IF EXISTS "Admins can manage team members" ON public.team_members;

-- From testimonials table
DROP POLICY IF EXISTS "Admins can manage testimonials" ON public.testimonials;

-- From projects table
DROP POLICY IF EXISTS "Admins can manage projects" ON public.projects;

-- From contact_messages table
DROP POLICY IF EXISTS "Admins can manage contact messages" ON public.contact_messages;

-- From site_settings table
DROP POLICY IF EXISTS "Admins can manage settings" ON public.site_settings;

-- From profiles table (if exists)
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

-- From storage.objects table
DROP POLICY IF EXISTS "Admins can upload images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete images" ON storage.objects;

-- From products table
DROP POLICY IF EXISTS "Admins can manage products" ON public.products;

-- From product_categories table
DROP POLICY IF EXISTS "Admins can manage categories" ON public.product_categories;

-- From cart_items table
DROP POLICY IF EXISTS "Admins can view all cart items" ON public.cart_items;

-- From orders table
DROP POLICY IF EXISTS "Admins can view all orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can update orders" ON public.orders;
DROP POLICY IF EXISTS "admins_can_create_orders" ON public.orders;

-- From order_items table
DROP POLICY IF EXISTS "Admins can view order items" ON public.order_items;

-- From product_reviews table
DROP POLICY IF EXISTS "Admins can manage reviews" ON public.product_reviews;

-- From coupons table
DROP POLICY IF EXISTS "Admins can manage coupons" ON public.coupons;

-- From booking_notifications table
DROP POLICY IF EXISTS "Admins can manage notifications" ON public.booking_notifications;

-- From admin_notifications table
DROP POLICY IF EXISTS "Admins can view notifications" ON public.admin_notifications;
DROP POLICY IF EXISTS "Admins can create notifications" ON public.admin_notifications;
DROP POLICY IF EXISTS "Users can view own notifications" ON public.admin_notifications;

-- From technicians table
DROP POLICY IF EXISTS "Admins can manage technicians" ON public.technicians;
DROP POLICY IF EXISTS "Admins can update approval status" ON public.technicians;
DROP POLICY IF EXISTS "Technicians can view own details" ON public.technicians;
DROP POLICY IF EXISTS "Technicians can update own status" ON public.technicians;
DROP POLICY IF EXISTS "Users can view approved technicians" ON public.technicians;

-- From user_roles table itself
DROP POLICY IF EXISTS "admins_manage_all_roles" ON public.user_roles;
DROP POLICY IF EXISTS "service_role_manage" ON public.user_roles;

-- Step 2: Drop the has_role function (now that dependencies are removed)
DROP FUNCTION IF EXISTS public.has_role(UUID, public.app_role);

-- Step 3: Recreate the ENUM type with the new role
-- Create a temporary new enum type
CREATE TYPE public.app_role_new AS ENUM ('admin', 'user', 'technician', 'manager');

-- Step 4: Migrate existing data
-- Update the column to use the new enum type
ALTER TABLE public.user_roles 
  ALTER COLUMN role TYPE public.app_role_new 
  USING role::text::public.app_role_new;

-- Step 5: Drop the old enum type
DROP TYPE public.app_role;

-- Step 6: Rename the new enum to app_role
ALTER TYPE public.app_role_new RENAME TO app_role;

-- Step 7: Recreate the has_role function
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = _user_id AND ur.role = _role
  )
$$;

-- Step 8: Recreate ALL policies

-- user_roles table policies
CREATE POLICY "admins_manage_all_roles"
ON user_roles FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "service_role_manage"
ON user_roles FOR ALL TO service_role
USING (true)
WITH CHECK (true);

-- services table
CREATE POLICY "Admins can manage services" ON public.services FOR ALL TO authenticated 
  USING (public.has_role(auth.uid(), 'admin')) 
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- bookings table
CREATE POLICY "Admins can manage bookings" ON public.bookings FOR ALL TO authenticated 
  USING (public.has_role(auth.uid(), 'admin')) 
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- team_members table
CREATE POLICY "Admins can manage team members" ON public.team_members FOR ALL TO authenticated 
  USING (public.has_role(auth.uid(), 'admin')) 
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- testimonials table
CREATE POLICY "Admins can manage testimonials" ON public.testimonials FOR ALL TO authenticated 
  USING (public.has_role(auth.uid(), 'admin')) 
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- projects table
CREATE POLICY "Admins can manage projects" ON public.projects FOR ALL TO authenticated 
  USING (public.has_role(auth.uid(), 'admin')) 
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- contact_messages table
CREATE POLICY "Admins can manage contact messages" ON public.contact_messages FOR ALL TO authenticated 
  USING (public.has_role(auth.uid(), 'admin')) 
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- site_settings table
CREATE POLICY "Admins can manage settings" ON public.site_settings FOR ALL TO authenticated 
  USING (public.has_role(auth.uid(), 'admin')) 
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- profiles table (if exists - skip if table doesn't exist)
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles') THEN
    CREATE POLICY "Admins can view all profiles" ON public.profiles FOR ALL TO authenticated 
      USING (public.has_role(auth.uid(), 'admin'));
  END IF;
END $$;

-- storage.objects table
CREATE POLICY "Admins can upload images" ON storage.objects FOR ALL TO authenticated 
  USING (public.has_role(auth.uid(), 'admin')) 
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update images" ON storage.objects FOR ALL TO authenticated 
  USING (public.has_role(auth.uid(), 'admin')) 
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete images" ON storage.objects FOR ALL TO authenticated 
  USING (public.has_role(auth.uid(), 'admin')) 
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- products table
CREATE POLICY "Admins can manage products" ON public.products FOR ALL TO authenticated 
  USING (public.has_role(auth.uid(), 'admin')) 
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- product_categories table
CREATE POLICY "Admins can manage categories" ON public.product_categories FOR ALL TO authenticated 
  USING (public.has_role(auth.uid(), 'admin')) 
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- cart_items table
CREATE POLICY "Admins can view all cart items" ON public.cart_items FOR ALL TO authenticated 
  USING (public.has_role(auth.uid(), 'admin'));

-- orders table
CREATE POLICY "Admins can view all orders" ON public.orders FOR ALL TO authenticated 
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update orders" ON public.orders FOR ALL TO authenticated 
  USING (public.has_role(auth.uid(), 'admin')) 
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "admins_can_create_orders" ON public.orders FOR ALL TO authenticated 
  USING (public.has_role(auth.uid(), 'admin')) 
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- order_items table
CREATE POLICY "Admins can view order items" ON public.order_items FOR ALL TO authenticated 
  USING (public.has_role(auth.uid(), 'admin'));

-- product_reviews table
CREATE POLICY "Admins can manage reviews" ON public.product_reviews FOR ALL TO authenticated 
  USING (public.has_role(auth.uid(), 'admin')) 
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- coupons table
CREATE POLICY "Admins can manage coupons" ON public.coupons FOR ALL TO authenticated 
  USING (public.has_role(auth.uid(), 'admin')) 
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- booking_notifications table
CREATE POLICY "Admins can manage notifications" ON public.booking_notifications FOR ALL TO authenticated 
  USING (public.has_role(auth.uid(), 'admin')) 
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- admin_notifications table
CREATE POLICY "Admins can view notifications" ON public.admin_notifications FOR SELECT TO authenticated 
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can create notifications" ON public.admin_notifications FOR INSERT TO authenticated 
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view own notifications" ON public.admin_notifications FOR SELECT TO authenticated 
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

-- technicians table
CREATE POLICY "Admins can manage technicians" ON public.technicians FOR ALL TO authenticated 
  USING (public.has_role(auth.uid(), 'admin')) 
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update approval status" ON public.technicians FOR UPDATE TO authenticated 
  USING (public.has_role(auth.uid(), 'admin')) 
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Technicians can view own details" ON public.technicians FOR SELECT TO authenticated 
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Technicians can update own status" ON public.technicians FOR UPDATE TO authenticated 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view approved technicians" ON public.technicians FOR SELECT TO authenticated 
  USING (approval_status = 'approved' OR public.has_role(auth.uid(), 'admin'));

-- Grant permissions for the new 'manager' role (optional - customize as needed)
-- Uncomment if you want managers to have admin-like access
/*
CREATE POLICY "managers_manage_all_roles"
ON user_roles FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'manager'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'manager'::app_role));
*/

-- Verify the update
DO $$
DECLARE
  role_count INTEGER;
BEGIN
  SELECT COUNT(DISTINCT role) INTO role_count FROM public.user_roles;
  RAISE NOTICE '✅ Successfully updated app_role ENUM!';
  RAISE NOTICE '📊 Current roles in system: %', role_count;
  RAISE NOTICE '📋 Available roles: admin, user, technician, manager';
  RAISE NOTICE '🔄 All dependent policies have been recreated';
END $$;
