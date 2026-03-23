-- ============================================================================
-- ELECTROOBUDDY - CORE DATABASE SCHEMA v2.0
-- Production-Grade Complete Database Migration
-- ============================================================================
-- Description: Comprehensive database schema for multi-role service platform
-- Roles: admin, user, technician
-- Features: Core services, e-commerce, technician management, booking system
-- Created: 2026-03-23
-- ============================================================================

-- ============================================================================
-- STEP 0: ENABLE REQUIRED EXTENSIONS
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ============================================================================
-- STEP 1: CREATE ENUMS AND CUSTOM TYPES
-- ============================================================================

-- Application roles
DO $$ BEGIN
    CREATE TYPE public.app_role AS ENUM ('admin', 'user', 'technician');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Booking status types
DO $$ BEGIN
    CREATE TYPE public.booking_status AS ENUM (
        'pending', 'confirmed', 'assigned', 'in_progress', 
        'completed', 'cancelled', 'rescheduled'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Order status types
DO $$ BEGIN
    CREATE TYPE public.order_status AS ENUM (
        'pending', 'confirmed', 'processing', 'shipped', 
        'delivered', 'cancelled', 'returned'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Payment status types
DO $$ BEGIN
    CREATE TYPE public.payment_status AS ENUM (
        'pending', 'paid', 'failed', 'refunded'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ============================================================================
-- STEP 2: UTILITY FUNCTIONS (MINIMAL - NO TABLE REFERENCES)
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Function to generate unique order number
CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS TEXT AS $$
DECLARE
    order_num TEXT;
BEGIN
    SELECT 'EOB-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 9000 + 1000)::TEXT, 4, '0')
    INTO order_num;
    RETURN order_num;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- STEP 3: USER MANAGEMENT TABLES (Must be created before other tables reference them)
-- ============================================================================

-- User roles table
CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role app_role NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    phone TEXT,
    address TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(user_id)
);

-- Technicians table (must exist before bookings can reference it)
CREATE TABLE IF NOT EXISTS public.technicians (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone TEXT,
    address TEXT,
    skills TEXT[] DEFAULT '{}',
    experience INTEGER DEFAULT 0,
    daily_limit INTEGER DEFAULT 5,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'busy', 'offline')),
    priority INTEGER DEFAULT 1,
    profile_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================================
-- STEP 4: CORE BUSINESS TABLES
-- ============================================================================

-- Services table
CREATE TABLE IF NOT EXISTS public.services (
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

-- Bookings table
CREATE TABLE IF NOT EXISTS public.bookings (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
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
    
    -- Service-specific fields
    has_old_fan TEXT,
    is_electricity_supply_on TEXT,
    is_switch_working TEXT,
    
    -- Assignment fields
    status TEXT NOT NULL DEFAULT 'pending',
    assigned_technician_id UUID REFERENCES public.technicians(id) ON DELETE SET NULL,
    assigned_at TIMESTAMPTZ,
    assignment_date DATE,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Team members table
CREATE TABLE IF NOT EXISTS public.team_members (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    bio TEXT,
    photo_url TEXT,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Testimonials table
CREATE TABLE IF NOT EXISTS public.testimonials (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    rating INTEGER NOT NULL DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
    text TEXT NOT NULL,
    service TEXT,
    image_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Projects table
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    image_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Contact messages table
CREATE TABLE IF NOT EXISTS public.contact_messages (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT NOT NULL,
    service TEXT,
    message TEXT NOT NULL,
    read BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- STEP 5: E-COMMERCE TABLES
-- ============================================================================

-- Product categories table
CREATE TABLE IF NOT EXISTS public.product_categories (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    parent_id UUID REFERENCES public.product_categories(id) ON DELETE CASCADE,
    image_url TEXT,
    sort_order INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Products table
CREATE TABLE IF NOT EXISTS public.products (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT NOT NULL,
    short_description TEXT,
    sku TEXT UNIQUE,
    
    -- Pricing
    price DECIMAL(10, 2) NOT NULL,
    compare_at_price DECIMAL(10, 2),
    cost_per_item DECIMAL(10, 2),
    
    -- Inventory
    inventory_quantity INTEGER NOT NULL DEFAULT 0,
    track_inventory BOOLEAN NOT NULL DEFAULT true,
    allow_backorder BOOLEAN NOT NULL DEFAULT false,
    
    -- Installation Service
    installation_available BOOLEAN NOT NULL DEFAULT false,
    installation_charge DECIMAL(10, 2) DEFAULT 0,
    installation_description TEXT,
    
    -- Images
    main_image_url TEXT,
    gallery_images TEXT[],
    
    -- Categorization
    category TEXT,
    subcategory TEXT,
    brand TEXT,
    tags TEXT[],
    
    -- Specifications
    specifications JSONB DEFAULT '{}'::jsonb,
    
    -- Shipping
    weight DECIMAL(10, 2),
    weight_unit TEXT DEFAULT 'kg',
    length DECIMAL(10, 2),
    width DECIMAL(10, 2),
    height DECIMAL(10, 2),
    dimension_unit TEXT DEFAULT 'cm',
    
    -- SEO
    meta_title TEXT,
    meta_description TEXT,
    
    -- Status
    is_active BOOLEAN NOT NULL DEFAULT true,
    is_featured BOOLEAN NOT NULL DEFAULT false,
    is_bestseller BOOLEAN NOT NULL DEFAULT false,
    
    -- Ordering
    sort_order INTEGER NOT NULL DEFAULT 0,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Cart items table
CREATE TABLE IF NOT EXISTS public.cart_items (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    session_id TEXT,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 1,
    installation_service BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(user_id, product_id, installation_service),
    UNIQUE(session_id, product_id, installation_service)
);

-- Shipping addresses table
CREATE TABLE IF NOT EXISTS public.shipping_addresses (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Contact Info
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT NOT NULL,
    
    -- Address
    address_line1 TEXT NOT NULL,
    address_line2 TEXT,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    postal_code TEXT NOT NULL,
    country TEXT NOT NULL DEFAULT 'India',
    
    -- Additional
    landmark TEXT,
    address_type TEXT DEFAULT 'home',
    is_default BOOLEAN NOT NULL DEFAULT false,
    
    -- Shiprocket Integration
    shiprocket_address_id INTEGER,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Orders table
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    order_number TEXT NOT NULL UNIQUE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Order Status
    status TEXT NOT NULL DEFAULT 'pending',
    payment_status TEXT NOT NULL DEFAULT 'pending',
    fulfillment_status TEXT NOT NULL DEFAULT 'unfulfilled',
    
    -- Pricing
    subtotal DECIMAL(10, 2) NOT NULL,
    shipping_charge DECIMAL(10, 2) NOT NULL DEFAULT 0,
    installation_total DECIMAL(10, 2) NOT NULL DEFAULT 0,
    tax_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
    discount_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
    total_amount DECIMAL(10, 2) NOT NULL,
    
    -- Payment
    payment_method TEXT,
    razorpay_order_id TEXT,
    razorpay_payment_id TEXT,
    razorpay_signature TEXT,
    
    -- Shipping
    shipping_address_id UUID REFERENCES public.shipping_addresses(id),
    shipping_address_data JSONB,
    
    -- Shiprocket Integration
    shiprocket_order_id INTEGER,
    shiprocket_shipment_id INTEGER,
    tracking_number TEXT,
    courier_name TEXT,
    tracking_url TEXT,
    
    -- Notes
    customer_notes TEXT,
    admin_notes TEXT,
    
    -- Timestamps
    ordered_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    confirmed_at TIMESTAMPTZ,
    shipped_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    cancelled_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Order items table
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id),
    
    -- Product snapshot
    product_name TEXT NOT NULL,
    product_sku TEXT,
    product_image TEXT,
    
    -- Pricing
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price DECIMAL(10, 2) NOT NULL,
    installation_service BOOLEAN NOT NULL DEFAULT false,
    installation_charge DECIMAL(10, 2) NOT NULL DEFAULT 0,
    total_price DECIMAL(10, 2) NOT NULL,
    
    -- Fulfillment
    fulfillment_status TEXT NOT NULL DEFAULT 'unfulfilled',
    tracking_number TEXT,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Product reviews table
CREATE TABLE IF NOT EXISTS public.product_reviews (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    order_id UUID REFERENCES public.orders(id),
    
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title TEXT,
    comment TEXT,
    images TEXT[],
    
    is_verified_purchase BOOLEAN NOT NULL DEFAULT false,
    is_approved BOOLEAN NOT NULL DEFAULT false,
    helpful_count INTEGER NOT NULL DEFAULT 0,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    
    UNIQUE(product_id, user_id, order_id)
);

-- Wishlist table
CREATE TABLE IF NOT EXISTS public.wishlist (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(user_id, product_id)
);

-- Coupons table
CREATE TABLE IF NOT EXISTS public.coupons (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    code TEXT NOT NULL UNIQUE,
    description TEXT,
    
    discount_type TEXT NOT NULL,
    discount_value DECIMAL(10, 2) NOT NULL,
    min_order_value DECIMAL(10, 2),
    max_discount_amount DECIMAL(10, 2),
    
    usage_limit INTEGER,
    used_count INTEGER NOT NULL DEFAULT 0,
    valid_from TIMESTAMPTZ NOT NULL DEFAULT now(),
    valid_until TIMESTAMPTZ,
    
    applicable_categories TEXT[],
    applicable_products UUID[],
    
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- STEP 6: SETTINGS AND NOTIFICATIONS
-- ============================================================================

-- Site settings table
CREATE TABLE IF NOT EXISTS public.site_settings (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    key TEXT NOT NULL UNIQUE,
    value TEXT NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Shipping settings table
CREATE TABLE IF NOT EXISTS public.shipping_settings (
    id SERIAL PRIMARY KEY,
    enabled BOOLEAN NOT NULL DEFAULT false,
    email TEXT,
    password TEXT,
    webhook_url TEXT,
    auto_create_shipment BOOLEAN NOT NULL DEFAULT true,
    default_length DECIMAL(10,2),
    default_width DECIMAL(10,2),
    default_height DECIMAL(10,2),
    default_weight DECIMAL(10,2),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Booking notifications table
CREATE TABLE IF NOT EXISTS public.booking_notifications (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
    user_email TEXT,
    old_status TEXT,
    new_status TEXT NOT NULL,
    sent BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================================
-- STEP 7: ENABLE ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.technicians ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipping_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipping_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.booking_notifications ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- STEP 8: CREATE INDEXES FOR PERFORMANCE
-- ============================================================================

-- Core tables
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON public.bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON public.bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_assigned_technician ON public.bookings(assigned_technician_id);
CREATE INDEX IF NOT EXISTS idx_bookings_preferred_date ON public.bookings(preferred_date);

-- User management
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON public.user_roles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_technicians_user_id ON public.technicians(user_id);
CREATE INDEX IF NOT EXISTS idx_technicians_status ON public.technicians(status);
CREATE INDEX IF NOT EXISTS idx_technicians_priority ON public.technicians(priority DESC);

-- E-commerce
CREATE INDEX IF NOT EXISTS idx_products_slug ON public.products(slug);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);
CREATE INDEX IF NOT EXISTS idx_products_brand ON public.products(brand);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON public.products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_is_featured ON public.products(is_featured);
CREATE INDEX IF NOT EXISTS idx_products_sort_order ON public.products(sort_order);
CREATE INDEX IF NOT EXISTS idx_products_name_search ON public.products USING gin (name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_products_tags ON public.products USING gin (tags);
CREATE INDEX IF NOT EXISTS idx_product_categories_parent ON public.product_categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_user_id ON public.cart_items(user_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_session_id ON public.cart_items(session_id);
CREATE INDEX IF NOT EXISTS idx_shipping_addresses_user_id ON public.shipping_addresses(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON public.orders(order_number);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON public.order_items(product_id);
CREATE INDEX IF NOT EXISTS idx_product_reviews_product_id ON public.product_reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_product_reviews_user_id ON public.product_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_user_id ON public.wishlist(user_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_product_id ON public.wishlist(product_id);

-- ============================================================================
-- STEP 9: CREATE TRIGGERS
-- ============================================================================

-- Updated_at triggers
CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON public.services 
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON public.bookings 
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_team_members_updated_at BEFORE UPDATE ON public.team_members 
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_testimonials_updated_at BEFORE UPDATE ON public.testimonials 
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON public.projects 
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles 
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products 
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_cart_items_updated_at BEFORE UPDATE ON public.cart_items 
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_shipping_addresses_updated_at BEFORE UPDATE ON public.shipping_addresses 
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders 
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_product_reviews_updated_at BEFORE UPDATE ON public.product_reviews 
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_shipping_settings_updated_at BEFORE UPDATE ON public.shipping_settings 
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================================
-- STEP 10: AUTO-CREATE PROFILE AND DEFAULT ROLE ON SIGNUP
-- ============================================================================

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user_profile()
RETURNS TRIGGER AS $$
BEGIN
    -- Create profile
    INSERT INTO public.profiles (user_id, full_name, phone, address)
    VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', ''), 
            COALESCE(NEW.raw_user_meta_data->>'phone', ''), 
            COALESCE(NEW.raw_user_meta_data->>'address', ''));
    
    -- Assign default 'user' role ONLY if no other role is being assigned
    -- This prevents conflicts when signing up as technician/admin directly
    IF NOT EXISTS (
        SELECT 1 FROM public.user_roles WHERE user_id = NEW.id
    ) THEN
        INSERT INTO public.user_roles (user_id, role)
        VALUES (NEW.id, 'user');
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger on auth.users creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_profile();

-- ============================================================================
-- STEP 11: CREATE REMAINING FUNCTIONS (WITH TABLE REFERENCES)
-- ============================================================================

-- Function to check if user has specific role (now that user_roles table exists)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
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

-- Function to calculate cart total (now that cart_items and products tables exist)
CREATE OR REPLACE FUNCTION public.calculate_cart_total(_user_id UUID)
RETURNS TABLE (
    subtotal DECIMAL,
    installation_total DECIMAL,
    total_items INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COALESCE(SUM(p.price * ci.quantity), 0) as subtotal,
        COALESCE(SUM(CASE WHEN ci.installation_service THEN p.installation_charge * ci.quantity ELSE 0 END), 0) as installation_total,
        COALESCE(SUM(ci.quantity), 0) as total_items
    FROM cart_items ci
    JOIN products p ON ci.product_id = p.id
    WHERE ci.user_id = _user_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- STEP 12: BASE RLS POLICIES - PUBLIC READ ACCESS
-- ============================================================================

-- Services: Viewable by everyone
CREATE POLICY "Services are viewable by everyone"
    ON public.services FOR SELECT
    USING (true);

-- Team members: Viewable by everyone
CREATE POLICY "Team members are viewable by everyone"
    ON public.team_members FOR SELECT
    USING (true);

-- Testimonials: Viewable by everyone (approved only)
CREATE POLICY "Testimonials are viewable by everyone"
    ON public.testimonials FOR SELECT
    USING (true);

-- Projects: Viewable by everyone
CREATE POLICY "Projects are viewable by everyone"
    ON public.projects FOR SELECT
    USING (true);

-- Products: Active products viewable by everyone
CREATE POLICY "Active products are viewable by everyone"
    ON public.products FOR SELECT
    USING (is_active = true);

-- Product categories: Active categories viewable by everyone
CREATE POLICY "Active categories are viewable by everyone"
    ON public.product_categories FOR SELECT
    USING (is_active = true);

-- Coupons: Active coupons viewable by everyone
CREATE POLICY "Active coupons are viewable by everyone"
    ON public.coupons FOR SELECT
    USING (is_active = true);

-- Site settings: Viewable by everyone
CREATE POLICY "Site settings are viewable by everyone"
    ON public.site_settings FOR SELECT
    USING (true);

-- Product reviews: Approved reviews viewable by everyone, users can see their own
CREATE POLICY "Reviews are viewable by everyone"
    ON public.product_reviews FOR SELECT
    USING (is_approved = true OR user_id = auth.uid());

-- ============================================================================
-- STEP 13: USER-SPECIFIC RLS POLICIES
-- ============================================================================

-- Profiles: Users can manage their own profile
CREATE POLICY "Users can view own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
    ON public.profiles FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- User roles: Users can view their own roles
CREATE POLICY "Users can view own roles"
    ON public.user_roles FOR SELECT
    USING (auth.uid() = user_id);

-- Allow users to insert their own role during signup (for technician self-registration)
CREATE POLICY "Users can insert own role"
    ON public.user_roles FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Cart items: Users can manage their own cart
CREATE POLICY "Users can view own cart"
    ON public.cart_items FOR SELECT
    USING (auth.uid() = user_id OR session_id IS NOT NULL);

CREATE POLICY "Users can manage own cart"
    ON public.cart_items FOR ALL
    USING (auth.uid() = user_id OR session_id IS NOT NULL);

-- Shipping addresses: Users can manage their own addresses
CREATE POLICY "Users can view own addresses"
    ON public.shipping_addresses FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own addresses"
    ON public.shipping_addresses FOR ALL
    USING (auth.uid() = user_id);

-- Orders: Users can view and create their own orders
CREATE POLICY "Users can view own orders"
    ON public.orders FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create own orders"
    ON public.orders FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Order items: Users can view their own order items
CREATE POLICY "Users can view own order items"
    ON public.order_items FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.orders 
            WHERE orders.id = order_items.order_id 
            AND orders.user_id = auth.uid()
        )
    );

-- Wishlist: Users can manage their own wishlist
CREATE POLICY "Users can view own wishlist"
    ON public.wishlist FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own wishlist"
    ON public.wishlist FOR ALL
    USING (auth.uid() = user_id);

-- Bookings: Users can create and view their own bookings
CREATE POLICY "Users can create bookings"
    ON public.bookings FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Users can view own bookings"
    ON public.bookings FOR SELECT
    USING (auth.uid() = user_id OR user_id = auth.uid());

-- Contact messages: Anyone can create
CREATE POLICY "Anyone can create contact messages"
    ON public.contact_messages FOR INSERT
    WITH CHECK (true);

-- Product reviews: Users can create reviews
CREATE POLICY "Users can create reviews"
    ON public.product_reviews FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- STEP 14: TECHNICIAN RLS POLICIES
-- ============================================================================

-- Technicians: Self-signup and profile management
CREATE POLICY "Users can create own technician profile"
    ON public.technicians FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Technicians can view own profile"
    ON public.technicians FOR SELECT
    USING (
        auth.uid() = user_id OR 
        EXISTS (
            SELECT 1 FROM public.user_roles 
            WHERE user_roles.user_id = auth.uid() 
            AND user_roles.role = 'admin'
        )
    );

CREATE POLICY "Technicians can update own profile"
    ON public.technicians FOR UPDATE
    USING (
        auth.uid() = user_id OR
        EXISTS (
            SELECT 1 FROM public.user_roles 
            WHERE user_roles.user_id = auth.uid() 
            AND user_roles.role = 'admin'
        )
    )
    WITH CHECK (
        auth.uid() = user_id OR
        EXISTS (
            SELECT 1 FROM public.user_roles 
            WHERE user_roles.user_id = auth.uid() 
            AND user_roles.role = 'admin'
        )
    );

-- ============================================================================
-- STEP 15: ADMIN RLS POLICIES
-- ============================================================================

-- Admins can manage all core tables
CREATE POLICY "Admins can manage services"
    ON public.services FOR ALL
    USING (public.has_role(auth.uid(), 'admin'))
    WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage bookings"
    ON public.bookings FOR ALL
    USING (public.has_role(auth.uid(), 'admin'))
    WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage team members"
    ON public.team_members FOR ALL
    USING (public.has_role(auth.uid(), 'admin'))
    WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage testimonials"
    ON public.testimonials FOR ALL
    USING (public.has_role(auth.uid(), 'admin'))
    WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage projects"
    ON public.projects FOR ALL
    USING (public.has_role(auth.uid(), 'admin'))
    WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage contact messages"
    ON public.contact_messages FOR ALL
    USING (public.has_role(auth.uid(), 'admin'))
    WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage products"
    ON public.products FOR ALL
    USING (public.has_role(auth.uid(), 'admin'))
    WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage categories"
    ON public.product_categories FOR ALL
    USING (public.has_role(auth.uid(), 'admin'))
    WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can view all cart items"
    ON public.cart_items FOR SELECT
    TO authenticated
    USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can view all orders"
    ON public.orders FOR SELECT
    TO authenticated
    USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update orders"
    ON public.orders FOR UPDATE
    TO authenticated
    USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can view order items"
    ON public.order_items FOR SELECT
    TO authenticated
    USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage reviews"
    ON public.product_reviews FOR ALL
    USING (public.has_role(auth.uid(), 'admin'))
    WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage coupons"
    ON public.coupons FOR ALL
    USING (public.has_role(auth.uid(), 'admin'))
    WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can view all profiles"
    ON public.profiles FOR SELECT
    TO authenticated
    USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage technicians"
    ON public.technicians FOR ALL
    USING (public.has_role(auth.uid(), 'admin'))
    WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage site settings"
    ON public.site_settings FOR ALL
    USING (public.has_role(auth.uid(), 'admin'))
    WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage shipping settings"
    ON public.shipping_settings FOR ALL
    USING (public.has_role(auth.uid(), 'admin'))
    WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can view booking notifications"
    ON public.booking_notifications FOR SELECT
    TO authenticated
    USING (public.has_role(auth.uid(), 'admin'));

-- ============================================================================
-- STEP 16: SEED DATA
-- ============================================================================

-- Insert default site settings
INSERT INTO public.site_settings (key, value) VALUES
    ('phone_number', '+918109308287'),
    ('whatsapp_number', '918109308287')
ON CONFLICT (key) DO NOTHING;

-- Insert default shipping settings
INSERT INTO public.shipping_settings (enabled, auto_create_shipment) VALUES
    (false, true)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- STEP 17: GRANT PERMISSIONS
-- ============================================================================

GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- ============================================================================
-- END OF MIGRATION
-- ============================================================================
