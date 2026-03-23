-- ============================================================================
-- ELECTROBUDDY - COMPLETE DATABASE SETUP
-- ============================================================================
-- This is the MAIN migration file to run first when setting up the database
-- It includes all core tables, RLS policies, and essential functions
-- Run this ONCE during initial setup
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- CORE HELPER FUNCTIONS
-- ============================================================================

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Role checking function (SECURITY DEFINER to avoid RLS recursion)
CREATE TYPE public.app_role AS ENUM ('admin', 'user', 'technician');

CREATE TABLE public.user_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- has_role function with proper table alias to avoid ambiguity
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

-- Simple RLS policies for user_roles (non-recursive)
CREATE POLICY "users_view_own_roles"
ON user_roles FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "admins_manage_all_roles"
ON user_roles FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "service_role_manage"
ON user_roles FOR ALL TO service_role
USING (true)
WITH CHECK (true);

-- ============================================================================
-- SERVICES TABLE
-- ============================================================================

CREATE TABLE public.services (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  icon_name TEXT NOT NULL DEFAULT 'Zap',
  image_url TEXT,
  whatsapp_enabled BOOLEAN NOT NULL DEFAULT true,
  call_enabled BOOLEAN NOT NULL DEFAULT true,
  book_now_enabled BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Services are viewable by everyone" ON public.services FOR SELECT USING (true);
CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON public.services 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================================
-- BOOKINGS TABLE
-- ============================================================================

CREATE TABLE public.bookings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  address TEXT NOT NULL,
  exact_location TEXT,
  service_type TEXT NOT NULL,
  custom_service_demand TEXT,
  preferred_date DATE NOT NULL,
  preferred_time TIME NOT NULL,
  description TEXT,
  
  -- Fan installation specific fields
  is_switch_working TEXT,
  has_old_fan TEXT,
  is_electricity_supply_on TEXT,
  
  -- Assignment fields
  assigned_technician_id UUID,
  technician_status TEXT DEFAULT 'unassigned',
  admin_notes TEXT,
  
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can create bookings" ON public.bookings FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can view own bookings" ON public.bookings FOR SELECT 
  USING (auth.uid() IN (SELECT id FROM auth.users));
CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON public.bookings 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Add comments for new fields
COMMENT ON COLUMN public.bookings.exact_location IS 'Detailed location or landmark for service';
COMMENT ON COLUMN public.bookings.custom_service_demand IS 'Custom service requirement description';
COMMENT ON COLUMN public.bookings.is_switch_working IS 'Fan installation: Is switch working (yes/no)';
COMMENT ON COLUMN public.bookings.has_old_fan IS 'Fan installation: Is there an old fan at location (yes/no)';
COMMENT ON COLUMN public.bookings.is_electricity_supply_on IS 'Fan installation: Is electricity supply on (yes/no)';

-- ============================================================================
-- TEAM MEMBERS TABLE
-- ============================================================================

CREATE TABLE public.team_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  bio TEXT,
  photo_url TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Team members are viewable by everyone" ON public.team_members FOR SELECT USING (true);
CREATE TRIGGER update_team_members_updated_at BEFORE UPDATE ON public.team_members 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================================
-- TESTIMONIALS TABLE
-- ============================================================================

CREATE TABLE public.testimonials (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  rating INTEGER NOT NULL DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
  text TEXT NOT NULL,
  service TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Testimonials are viewable by everyone" ON public.testimonials FOR SELECT USING (true);
CREATE TRIGGER update_testimonials_updated_at BEFORE UPDATE ON public.testimonials 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================================
-- PROJECTS TABLE
-- ============================================================================

CREATE TABLE public.projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Projects are viewable by everyone" ON public.projects FOR SELECT USING (true);
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON public.projects 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================================
-- CONTACT MESSAGES TABLE
-- ============================================================================

CREATE TABLE public.contact_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  service TEXT,
  message TEXT NOT NULL,
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can create contact messages" ON public.contact_messages FOR INSERT WITH CHECK (true);

-- ============================================================================
-- SITE SETTINGS TABLE
-- ============================================================================

CREATE TABLE public.site_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Settings are viewable by everyone" ON public.site_settings FOR SELECT USING (true);

-- Insert default settings
INSERT INTO public.site_settings (key, value) VALUES 
  ('phone_number', '+918109308287'), 
  ('whatsapp_number', '918109308287')
ON CONFLICT (key) DO NOTHING;

-- ============================================================================
-- ADMIN HELPER FUNCTION
-- ============================================================================

CREATE OR REPLACE FUNCTION assign_admin_role(user_email text)
RETURNS void AS $$
DECLARE
  target_user_id uuid;
BEGIN
  SELECT id INTO target_user_id FROM auth.users WHERE email = user_email;
  
  IF target_user_id IS NULL THEN
    RAISE EXCEPTION 'User with email % not found in auth.users', user_email;
  END IF;
  
  DELETE FROM user_roles WHERE user_id = target_user_id;
  
  INSERT INTO user_roles (user_id, role)
  VALUES (target_user_id, 'admin')
  ON CONFLICT (user_id, role) DO UPDATE SET role = 'admin';
  
  RAISE NOTICE '✅ User % is now an admin!', user_email;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- GRANT ADMIN POLICIES (using has_role function)
-- ============================================================================

CREATE POLICY "Admins can manage services" ON public.services FOR ALL TO authenticated 
  USING (public.has_role(auth.uid(), 'admin')) 
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage bookings" ON public.bookings FOR ALL TO authenticated 
  USING (public.has_role(auth.uid(), 'admin')) 
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage team members" ON public.team_members FOR ALL TO authenticated 
  USING (public.has_role(auth.uid(), 'admin')) 
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage testimonials" ON public.testimonials FOR ALL TO authenticated 
  USING (public.has_role(auth.uid(), 'admin')) 
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage projects" ON public.projects FOR ALL TO authenticated 
  USING (public.has_role(auth.uid(), 'admin')) 
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage contact messages" ON public.contact_messages FOR ALL TO authenticated 
  USING (public.has_role(auth.uid(), 'admin')) 
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage settings" ON public.site_settings FOR ALL TO authenticated 
  USING (public.has_role(auth.uid(), 'admin')) 
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ============================================================================
-- SETUP COMPLETE
-- ============================================================================
-- Next: Run 002-ecommerce-setup.sql for e-commerce features
-- Then: Run 003-technicians-setup.sql for technician management
-- Finally: Run 004-seed-data-and-admin.sql to create admin user
-- ============================================================================
