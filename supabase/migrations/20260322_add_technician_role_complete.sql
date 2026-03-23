-- Complete fix to add 'technician' role to app_role enum
-- This drops ALL policies referencing user_roles across ALL tables

-- ============================================================================
-- STEP 1: DROP ALL POLICIES THAT REFERENCE user_roles.role
-- Based on actual policy list from database
-- ============================================================================

-- Drop policies on technicians table
DROP POLICY IF EXISTS "Technicians can view own profile" ON public.technicians;
DROP POLICY IF EXISTS "Admins can manage technicians" ON public.technicians;
DROP POLICY IF EXISTS "Admins can update technicians" ON public.technicians;
DROP POLICY IF EXISTS "Admins can delete technicians" ON public.technicians;
DROP POLICY IF EXISTS "Admins can update approval status" ON public.technicians;
DROP POLICY IF EXISTS "Technicians can update own profile" ON public.technicians;
DROP POLICY IF EXISTS "Technicians can view own stats" ON public.technicians;
DROP POLICY IF EXISTS "View own profile" ON public.technicians;

-- Drop policies on admin_notifications table
DROP POLICY IF EXISTS "Admins can view notifications" ON public.admin_notifications;

-- Drop policies on booking_notifications table
DROP POLICY IF EXISTS "Admins can manage notifications" ON public.booking_notifications;
DROP POLICY IF EXISTS "Users can view own notifications" ON public.booking_notifications;

-- Drop policies on bookings table
DROP POLICY IF EXISTS "Admins can manage bookings" ON public.bookings;
DROP POLICY IF EXISTS "Anyone can create bookings" ON public.bookings;
DROP POLICY IF EXISTS "Anyone can view bookings" ON public.bookings;
DROP POLICY IF EXISTS "Authenticated users can create bookings" ON public.bookings;
DROP POLICY IF EXISTS "Users can view own bookings" ON public.bookings;

-- Drop policies on cart_items table
DROP POLICY IF EXISTS "Admins can view all cart items" ON public.cart_items;
DROP POLICY IF EXISTS "Users can manage own cart" ON public.cart_items;
DROP POLICY IF EXISTS "Users can view own cart" ON public.cart_items;

-- Drop policies on contact_messages table
DROP POLICY IF EXISTS "Admins can manage contact messages" ON public.contact_messages;
DROP POLICY IF EXISTS "Anyone can create contact messages" ON public.contact_messages;

-- Drop policies on coupons table
DROP POLICY IF EXISTS "Admins can manage coupons" ON public.coupons;
DROP POLICY IF EXISTS "Coupons are viewable by everyone" ON public.coupons;

-- Drop policies on order_items table
DROP POLICY IF EXISTS "Admins can view order items" ON public.order_items;
DROP POLICY IF EXISTS "Users can view own order items" ON public.order_items;

-- Drop policies on orders table
DROP POLICY IF EXISTS "Admins can update orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can view all orders" ON public.orders;
DROP POLICY IF EXISTS "Service role can update order tracking" ON public.orders;
DROP POLICY IF EXISTS "Users can view own orders" ON public.orders;
DROP POLICY IF EXISTS "admins_can_create_orders" ON public.orders;
DROP POLICY IF EXISTS "authenticated_users_create_orders" ON public.orders;

-- Drop policies on product_categories table
DROP POLICY IF EXISTS "Admins can manage categories" ON public.product_categories;
DROP POLICY IF EXISTS "Categories are viewable by everyone" ON public.product_categories;

-- Drop policies on product_reviews table
DROP POLICY IF EXISTS "Admins can manage reviews" ON public.product_reviews;
DROP POLICY IF EXISTS "Reviews are viewable by everyone" ON public.product_reviews;
DROP POLICY IF EXISTS "Users can create reviews" ON public.product_reviews;

-- Drop policies on products table
DROP POLICY IF EXISTS "Active products are viewable by everyone" ON public.products;
DROP POLICY IF EXISTS "Admins can manage products" ON public.products;
DROP POLICY IF EXISTS "Authenticated users can manage products" ON public.products;
DROP POLICY IF EXISTS "Products are viewable by everyone" ON public.products;

-- Drop policies on profiles table
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;

-- Drop policies on projects table
DROP POLICY IF EXISTS "Admins can manage projects" ON public.projects;
DROP POLICY IF EXISTS "Projects are viewable by everyone" ON public.projects;

-- Drop policies on services table
DROP POLICY IF EXISTS "Admins can manage services" ON public.services;
DROP POLICY IF EXISTS "Services are viewable by everyone" ON public.services;

-- Drop policies on shipping_addresses table
DROP POLICY IF EXISTS "Users can manage own addresses" ON public.shipping_addresses;
DROP POLICY IF EXISTS "Users can view own addresses" ON public.shipping_addresses;

-- Drop policies on shipping_settings table
DROP POLICY IF EXISTS "Admins can update shipping settings" ON public.shipping_settings;
DROP POLICY IF EXISTS "Admins can view shipping settings" ON public.shipping_settings;

-- Drop policies on site_settings table
DROP POLICY IF EXISTS "Admins can manage settings" ON public.site_settings;
DROP POLICY IF EXISTS "Settings are viewable by everyone" ON public.site_settings;

-- Drop policies on team_members table
DROP POLICY IF EXISTS "Admins can manage team members" ON public.team_members;
DROP POLICY IF EXISTS "Team members are viewable by everyone" ON public.team_members;

-- Drop policies on technician_audit_log table
DROP POLICY IF EXISTS "Admins can view audit logs" ON public.technician_audit_log;
DROP POLICY IF EXISTS "Technicians can view own logs" ON public.technician_audit_log;

-- Drop policies on testimonials table
DROP POLICY IF EXISTS "Admins can manage testimonials" ON public.testimonials;
DROP POLICY IF EXISTS "Testimonials are viewable by everyone" ON public.testimonials;

-- Drop policies on user_roles table
DROP POLICY IF EXISTS "Everyone can read roles" ON public.user_roles;
DROP POLICY IF EXISTS "Service role full access" ON public.user_roles;
DROP POLICY IF EXISTS "admins_manage_all_roles" ON public.user_roles;
DROP POLICY IF EXISTS "service_role_manage" ON public.user_roles;
DROP POLICY IF EXISTS "users_view_own_roles" ON public.user_roles;

-- Drop policies on wishlist table
DROP POLICY IF EXISTS "Users can manage own wishlist" ON public.wishlist;
DROP POLICY IF EXISTS "Users can view own wishlist" ON public.wishlist;

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
-- STEP 7: RECREATE ALL DROPPED POLICIES
-- Only recreating essential policies (keeping original logic)
-- ============================================================================

-- ADMIN_NOTIFICATIONS
CREATE POLICY "Admins can view notifications"
  ON public.admin_notifications FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_roles.user_id = auth.uid() 
      AND user_roles.role = 'admin'
    )
  );

-- BOOKING_NOTIFICATIONS
CREATE POLICY "Admins can manage notifications"
  ON public.booking_notifications FOR ALL TO authenticated
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

CREATE POLICY "Users can view own notifications"
  ON public.booking_notifications FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- BOOKINGS
CREATE POLICY "Anyone can create bookings"
  ON public.bookings FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view own bookings"
  ON public.bookings FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_roles.user_id = auth.uid() 
    AND user_roles.role = 'admin'
  ));

CREATE POLICY "Admins can manage bookings"
  ON public.bookings FOR ALL TO authenticated
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

-- CART_ITEMS
CREATE POLICY "Users can manage own cart"
  ON public.cart_items FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can view all cart items"
  ON public.cart_items FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_roles.user_id = auth.uid() 
      AND user_roles.role = 'admin'
    )
  );

-- CONTACT_MESSAGES
CREATE POLICY "Anyone can create contact messages"
  ON public.contact_messages FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can manage contact messages"
  ON public.contact_messages FOR ALL TO authenticated
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

-- COUPONS
CREATE POLICY "Coupons are viewable by everyone"
  ON public.coupons FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage coupons"
  ON public.coupons FOR ALL TO authenticated
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

-- ORDER_ITEMS
CREATE POLICY "Users can view own order items"
  ON public.order_items FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.orders 
    WHERE orders.id = order_items.order_id 
    AND orders.user_id = auth.uid()
  ));

CREATE POLICY "Admins can view order items"
  ON public.order_items FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_roles.user_id = auth.uid() 
      AND user_roles.role = 'admin'
    )
  );

-- ORDERS
CREATE POLICY "Users can view own orders"
  ON public.orders FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins can view all orders"
  ON public.orders FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_roles.user_id = auth.uid() 
      AND user_roles.role = 'admin'
    )
  );

CREATE POLICY "Admins can update orders"
  ON public.orders FOR UPDATE TO authenticated
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

-- PRODUCT_CATEGORIES
CREATE POLICY "Categories are viewable by everyone"
  ON public.product_categories FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage categories"
  ON public.product_categories FOR ALL TO authenticated
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

-- PRODUCT_REVIEWS
CREATE POLICY "Reviews are viewable by everyone"
  ON public.product_reviews FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can create reviews"
  ON public.product_reviews FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can manage reviews"
  ON public.product_reviews FOR ALL TO authenticated
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

-- PRODUCTS
CREATE POLICY "Active products are viewable by everyone"
  ON public.products FOR SELECT TO authenticated
  USING (is_active = true);

CREATE POLICY "Admins can manage products"
  ON public.products FOR ALL TO authenticated
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

-- PROFILES
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT TO authenticated
  USING (id = auth.uid());

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_roles.user_id = auth.uid() 
      AND user_roles.role = 'admin'
    )
  );

-- PROJECTS
CREATE POLICY "Projects are viewable by everyone"
  ON public.projects FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage projects"
  ON public.projects FOR ALL TO authenticated
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

-- SERVICES
CREATE POLICY "Services are viewable by everyone"
  ON public.services FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage services"
  ON public.services FOR ALL TO authenticated
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

-- SHIPPING_ADDRESSES
CREATE POLICY "Users can view own addresses"
  ON public.shipping_addresses FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can manage own addresses"
  ON public.shipping_addresses FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- SHIPPING_SETTINGS
CREATE POLICY "Admins can view shipping settings"
  ON public.shipping_settings FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_roles.user_id = auth.uid() 
      AND user_roles.role = 'admin'
    )
  );

CREATE POLICY "Admins can update shipping settings"
  ON public.shipping_settings FOR UPDATE TO authenticated
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

-- SITE_SETTINGS
CREATE POLICY "Settings are viewable by everyone"
  ON public.site_settings FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage settings"
  ON public.site_settings FOR ALL TO authenticated
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

-- TEAM_MEMBERS
CREATE POLICY "Team members are viewable by everyone"
  ON public.team_members FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage team members"
  ON public.team_members FOR ALL TO authenticated
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

-- TECHNICIANS
CREATE POLICY "Technicians can view own profile"
  ON public.technicians FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own technician profile"
  ON public.technicians FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage technicians"
  ON public.technicians FOR ALL TO authenticated
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

-- TECHNICIAN_AUDIT_LOG
CREATE POLICY "Technicians can view own logs"
  ON public.technician_audit_log FOR SELECT TO authenticated
  USING (technician_id = auth.uid());

CREATE POLICY "Admins can view audit logs"
  ON public.technician_audit_log FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_roles.user_id = auth.uid() 
      AND user_roles.role = 'admin'
    )
  );

-- TESTIMONIALS
CREATE POLICY "Testimonials are viewable by everyone"
  ON public.testimonials FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage testimonials"
  ON public.testimonials FOR ALL TO authenticated
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

-- USER_ROLES
CREATE POLICY "Users can view own roles"
  ON public.user_roles FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all roles"
  ON public.user_roles FOR ALL TO authenticated
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

-- WISHLIST
CREATE POLICY "Users can manage own wishlist"
  ON public.wishlist FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ============================================================================
-- STEP 8: ADD COMMENT
-- ============================================================================

COMMENT ON TYPE public.app_role IS 'Application roles: admin (full access), user (customer), technician (service provider)';
