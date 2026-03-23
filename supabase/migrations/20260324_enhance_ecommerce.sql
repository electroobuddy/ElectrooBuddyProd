-- ============================================================================
-- ELECTROOBUDDY - E-COMMERCE ENHANCEMENTS v2.0
-- Coupon & Category Management + Shipping & Tax System
-- ============================================================================
-- Description: Enhanced e-commerce features with Amazon/Flipkart-style fields
-- Features: Advanced coupons, categories, shipping rules, tax configuration
-- Created: 2026-03-24
-- ============================================================================

-- ============================================================================
-- STEP 1: ENHANCED COUPON SYSTEM
-- ============================================================================

-- Drop existing coupons table if exists (will recreate with enhanced fields)
DROP TABLE IF EXISTS public.coupons CASCADE;

-- Enhanced coupons table
CREATE TABLE public.coupons (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    code TEXT NOT NULL UNIQUE,
    description TEXT,
    
    -- Discount Configuration
    discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed', 'free_shipping')),
    discount_value DECIMAL(10, 2) NOT NULL DEFAULT 0,
    min_order_value DECIMAL(10, 2) DEFAULT 0,
    max_discount_amount DECIMAL(10, 2),
    
    -- Usage Limits
    usage_limit INTEGER,
    used_count INTEGER NOT NULL DEFAULT 0,
    usage_limit_per_user INTEGER,
    
    -- Validity
    valid_from TIMESTAMPTZ NOT NULL DEFAULT now(),
    valid_until TIMESTAMPTZ,
    
    -- Applicability
    applicable_categories UUID[] DEFAULT '{}',
    applicable_products UUID[] DEFAULT '{}',
    excluded_products UUID[] DEFAULT '{}',
    applicable_to_all BOOLEAN NOT NULL DEFAULT false,
    
    -- User Restrictions
    applicable_to_new_users_only BOOLEAN NOT NULL DEFAULT false,
    minimum_cart_items INTEGER NOT NULL DEFAULT 1,
    
    -- Status
    is_active BOOLEAN NOT NULL DEFAULT true,
    auto_apply BOOLEAN NOT NULL DEFAULT false,
    
    -- Metadata
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- STEP 2: ENHANCED CATEGORY MANAGEMENT
-- ============================================================================

-- Drop and recreate product_categories with enhanced fields
DROP TABLE IF EXISTS public.product_categories CASCADE;

CREATE TABLE public.product_categories (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    parent_id UUID REFERENCES public.product_categories(id) ON DELETE CASCADE,
    
    -- Visual
    image_url TEXT,
    banner_image_url TEXT,
    icon_name TEXT DEFAULT 'Package',
    
    -- Display
    sort_order INTEGER NOT NULL DEFAULT 0,
    is_featured BOOLEAN NOT NULL DEFAULT false,
    is_active BOOLEAN NOT NULL DEFAULT true,
    
    -- SEO
    meta_title TEXT,
    meta_description TEXT,
    
    -- Commission (for future marketplace features)
    commission_rate DECIMAL(5, 2) DEFAULT 0,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- STEP 3: SHIPPING CONFIGURATION
-- ============================================================================

-- Shipping zones
CREATE TABLE public.shipping_zones (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    states TEXT[] NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Shipping rates by zone
CREATE TABLE public.shipping_rates (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    zone_id UUID NOT NULL REFERENCES public.shipping_zones(id) ON DELETE CASCADE,
    
    -- Weight/Price based
    min_order_value DECIMAL(10, 2) NOT NULL DEFAULT 0,
    max_order_value DECIMAL(10, 2),
    min_weight DECIMAL(10, 2) DEFAULT 0,
    max_weight DECIMAL(10, 2),
    
    -- Charges
    base_charge DECIMAL(10, 2) NOT NULL DEFAULT 0,
    per_kg_charge DECIMAL(10, 2) DEFAULT 0,
    
    -- Free shipping threshold
    free_shipping_threshold DECIMAL(10, 2),
    
    -- Delivery time
    estimated_days_min INTEGER,
    estimated_days_max INTEGER,
    
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- STEP 4: TAX CONFIGURATION
-- ============================================================================

-- Tax slabs (GST rates)
CREATE TABLE public.tax_slabs (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    rate DECIMAL(5, 2) NOT NULL,
    description TEXT,
    
    -- Applicable categories
    applicable_categories UUID[] DEFAULT '{}',
    applicable_to_all BOOLEAN NOT NULL DEFAULT false,
    
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- STEP 5: UPDATE ORDERS TABLE
-- ============================================================================

-- Add additional fields to orders table
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS coupon_id UUID REFERENCES public.coupons(id),
ADD COLUMN IF NOT EXISTS coupon_code TEXT,
ADD COLUMN IF NOT EXISTS coupon_discount DECIMAL(10, 2) NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS shipping_zone_id UUID REFERENCES public.shipping_zones(id),
ADD COLUMN IF NOT EXISTS tax_rate DECIMAL(5, 2) DEFAULT 18,
ADD COLUMN IF NOT EXISTS cgst_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS sgst_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS igst_amount DECIMAL(10, 2) NOT NULL DEFAULT 0;

-- ============================================================================
-- STEP 6: INDEXES FOR PERFORMANCE
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_coupons_code ON public.coupons(code);
CREATE INDEX IF NOT EXISTS idx_coupons_active ON public.coupons(is_active);
CREATE INDEX IF NOT EXISTS idx_coupons_validity ON public.coupons(valid_from, valid_until);
CREATE INDEX IF NOT EXISTS idx_product_categories_slug ON public.product_categories(slug);
CREATE INDEX IF NOT EXISTS idx_product_categories_parent ON public.product_categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_product_categories_featured ON public.product_categories(is_featured);
CREATE INDEX IF NOT EXISTS idx_shipping_zones_active ON public.shipping_zones(is_active);
CREATE INDEX IF NOT EXISTS idx_shipping_rates_zone ON public.shipping_rates(zone_id);
CREATE INDEX IF NOT EXISTS idx_tax_slabs_active ON public.tax_slabs(is_active);

-- ============================================================================
-- STEP 7: TRIGGERS
-- ============================================================================

-- Updated_at triggers for new tables
CREATE TRIGGER update_coupons_updated_at BEFORE UPDATE ON public.coupons 
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_product_categories_updated_at BEFORE UPDATE ON public.product_categories 
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================================
-- STEP 8: RLS POLICIES
-- ============================================================================

ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipping_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipping_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tax_slabs ENABLE ROW LEVEL SECURITY;

-- Coupons: Active coupons viewable by everyone
CREATE POLICY "Active coupons are viewable by everyone"
    ON public.coupons FOR SELECT
    USING (is_active = true AND valid_from <= NOW() AND (valid_until IS NULL OR valid_until >= NOW()));

-- Categories: Active categories viewable by everyone
CREATE POLICY "Active categories are viewable by everyone"
    ON public.product_categories FOR SELECT
    USING (is_active = true);

-- Shipping zones and rates: Viewable by everyone
CREATE POLICY "Shipping zones are viewable by everyone"
    ON public.shipping_zones FOR SELECT
    USING (is_active = true);

CREATE POLICY "Shipping rates are viewable by everyone"
    ON public.shipping_rates FOR SELECT
    USING (is_active = true);

-- Tax slabs: Viewable by everyone
CREATE POLICY "Tax slabs are viewable by everyone"
    ON public.tax_slabs FOR SELECT
    USING (is_active = true);

-- Admin policies
CREATE POLICY "Admins can manage coupons"
    ON public.coupons FOR ALL
    USING (public.has_role(auth.uid(), 'admin'))
    WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage categories"
    ON public.product_categories FOR ALL
    USING (public.has_role(auth.uid(), 'admin'))
    WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage shipping zones"
    ON public.shipping_zones FOR ALL
    USING (public.has_role(auth.uid(), 'admin'))
    WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage shipping rates"
    ON public.shipping_rates FOR ALL
    USING (public.has_role(auth.uid(), 'admin'))
    WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage tax slabs"
    ON public.tax_slabs FOR ALL
    USING (public.has_role(auth.uid(), 'admin'))
    WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ============================================================================
-- STEP 9: FUNCTIONS
-- ============================================================================

-- Function to validate and apply coupon
CREATE OR REPLACE FUNCTION public.apply_coupon(
    p_coupon_code TEXT,
    p_user_id UUID,
    p_cart_total DECIMAL,
    p_cart_items JSONB DEFAULT '[]'::jsonb
)
RETURNS TABLE (
    success BOOLEAN,
    discount_amount DECIMAL,
    message TEXT,
    coupon_data JSONB
) AS $$
DECLARE
    v_coupon RECORD;
    v_user_order_count INTEGER;
    v_cart_items_count INTEGER;
BEGIN
    -- Get coupon details
    SELECT * INTO v_coupon
    FROM public.coupons
    WHERE code = p_coupon_code
    AND is_active = true
    AND valid_from <= NOW()
    AND (valid_until IS NULL OR valid_until >= NOW());
    
    -- Check if coupon exists
    IF NOT FOUND THEN
        RETURN QUERY SELECT false, 0::DECIMAL, 'Invalid coupon code'::TEXT, NULL::JSONB;
        RETURN;
    END IF;
    
    -- Check minimum order value
    IF p_cart_total < v_coupon.min_order_value THEN
        RETURN QUERY SELECT false, 0::DECIMAL, 
            format('Minimum order value of ₹%s required', v_coupon.min_order_value)::TEXT, 
            NULL::JSONB;
        RETURN;
    END IF;
    
    -- Check minimum cart items
    SELECT COUNT(*) INTO v_cart_items_count FROM jsonb_array_elements(p_cart_items);
    IF v_cart_items_count < v_coupon.minimum_cart_items THEN
        RETURN QUERY SELECT false, 0::DECIMAL, 
            format('Minimum %d items required in cart', v_coupon.minimum_cart_items)::TEXT, 
            NULL::JSONB;
        RETURN;
    END IF;
    
    -- Check if new user only
    IF v_coupon.applicable_to_new_users_only THEN
        SELECT COUNT(*) INTO v_user_order_count
        FROM public.orders
        WHERE user_id = p_user_id AND status != 'cancelled';
        
        IF v_user_order_count > 0 THEN
            RETURN QUERY SELECT false, 0::DECIMAL, 
                'This coupon is for new users only'::TEXT, 
                NULL::JSONB;
            RETURN;
        END IF;
    END IF;
    
    -- Check usage limit
    IF v_coupon.usage_limit IS NOT NULL AND v_coupon.used_count >= v_coupon.usage_limit THEN
        RETURN QUERY SELECT false, 0::DECIMAL, 
            'Coupon usage limit reached'::TEXT, 
            NULL::JSONB;
        RETURN;
    END IF;
    
    -- Calculate discount
    DECLARE
        v_discount DECIMAL := 0;
    BEGIN
        IF v_coupon.discount_type = 'percentage' THEN
            v_discount := p_cart_total * (v_coupon.discount_value / 100);
            
            -- Apply max discount cap
            IF v_coupon.max_discount_amount IS NOT NULL THEN
                v_discount := LEAST(v_discount, v_coupon.max_discount_amount);
            END IF;
            
        ELSIF v_coupon.discount_type = 'fixed' THEN
            v_discount := v_coupon.discount_value;
            
        ELSIF v_coupon.discount_type = 'free_shipping' THEN
            v_discount := 0; -- Will be handled in checkout
        END IF;
        
        -- Increment usage count
        UPDATE public.coupons
        SET used_count = used_count + 1
        WHERE id = v_coupon.id;
        
        RETURN QUERY SELECT true, v_discount, 'Coupon applied successfully'::TEXT, 
            row_to_json(v_coupon)::JSONB;
    END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Function to calculate shipping charge
CREATE OR REPLACE FUNCTION public.calculate_shipping_charge(
    p_state TEXT,
    p_order_value DECIMAL,
    p_total_weight DECIMAL DEFAULT 0
)
RETURNS TABLE (
    shipping_charge DECIMAL,
    zone_name TEXT,
    estimated_days TEXT,
    free_shipping BOOLEAN
) AS $$
DECLARE
    v_zone_id UUID;
    v_zone_name TEXT;
    v_rate RECORD;
    v_charge DECIMAL := 0;
BEGIN
    -- Find matching zone
    SELECT z.id, z.name INTO v_zone_id, v_zone_name
    FROM public.shipping_zones z
    WHERE p_state = ANY(z.states)
    AND z.is_active = true
    LIMIT 1;
    
    IF v_zone_id IS NULL THEN
        -- Default zone (other states)
        SELECT id, name INTO v_zone_id, v_zone_name
        FROM public.shipping_zones
        WHERE name = 'Other States'
        LIMIT 1;
    END IF;
    
    -- Find applicable rate
    SELECT * INTO v_rate
    FROM public.shipping_rates
    WHERE zone_id = v_zone_id
    AND is_active = true
    AND (min_order_value IS NULL OR p_order_value >= min_order_value)
    AND (max_order_value IS NULL OR p_order_value <= max_order_value)
    AND (min_weight IS NULL OR p_total_weight >= min_weight)
    AND (max_weight IS NULL OR p_total_weight <= max_weight)
    ORDER BY min_order_value DESC NULLS LAST
    LIMIT 1;
    
    IF FOUND THEN
        -- Calculate charge
        v_charge := v_rate.base_charge;
        
        IF p_total_weight > 1 AND v_rate.per_kg_charge > 0 THEN
            v_charge := v_charge + ((p_total_weight - 1) * v_rate.per_kg_charge);
        END IF;
        
        -- Check free shipping threshold
        IF v_rate.free_shipping_threshold IS NOT NULL AND p_order_value >= v_rate.free_shipping_threshold THEN
            v_charge := 0;
        END IF;
        
        RETURN QUERY SELECT v_charge, v_zone_name, 
            CASE 
                WHEN v_rate.estimated_days_min IS NOT NULL AND v_rate.estimated_days_max IS NOT NULL 
                THEN format('%d-%d days', v_rate.estimated_days_min, v_rate.estimated_days_max)
                ELSE '3-5 days'
            END,
            (v_charge = 0);
    ELSE
        -- Default charge
        RETURN QUERY SELECT 50::DECIMAL, 'Standard'::TEXT, '3-5 days'::TEXT, false;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Function to calculate tax
CREATE OR REPLACE FUNCTION public.calculate_tax(
    p_category_id UUID,
    p_taxable_amount DECIMAL
)
RETURNS TABLE (
    tax_rate DECIMAL,
    tax_amount DECIMAL,
    cgst DECIMAL,
    sgst DECIMAL,
    igst DECIMAL
) AS $$
DECLARE
    v_tax_slab RECORD;
    v_rate DECIMAL := 18; -- Default GST rate
BEGIN
    -- Find applicable tax slab
    SELECT * INTO v_tax_slab
    FROM public.tax_slabs
    WHERE is_active = true
    AND (applicable_to_all = true OR p_category_id = ANY(applicable_categories))
    LIMIT 1;
    
    IF FOUND THEN
        v_rate := v_tax_slab.rate;
    END IF;
    
    -- Calculate tax
    DECLARE
        v_tax_amount DECIMAL := p_taxable_amount * (v_rate / 100);
        v_cgst DECIMAL := v_tax_amount / 2;
        v_sgst DECIMAL := v_tax_amount / 2;
        v_igst DECIMAL := 0;
    BEGIN
        -- For inter-state, IGST applies (will be determined during checkout)
        -- For now, return CGST + SGST
        RETURN QUERY SELECT v_rate, v_tax_amount, v_cgst, v_sgst, v_igst;
    END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ============================================================================
-- STEP 10: SEED DATA
-- ============================================================================

-- Insert default tax slabs (GST rates)
INSERT INTO public.tax_slabs (name, rate, description, applicable_to_all) VALUES
    ('0% GST', 0.00, 'Essential items exempt from GST', false),
    ('5% GST', 5.00, 'Lower rate for essential goods', false),
    ('12% GST', 12.00, 'Standard rate for most goods', false),
    ('18% GST', 18.00, 'Higher rate for luxury items', true),
    ('28% GST', 28.00, 'Highest rate for premium products', false)
ON CONFLICT DO NOTHING;

-- Insert default shipping zones
INSERT INTO public.shipping_zones (name, states) VALUES
    ('Metro Cities', ARRAY['Delhi', 'Mumbai', 'Bangalore', 'Chennai', 'Kolkata', 'Hyderabad']),
    ('North India', ARRAY['Punjab', 'Haryana', 'Uttar Pradesh', 'Rajasthan', 'Jammu & Kashmir', 'Ladakh', 'Chandigarh']),
    ('South India', ARRAY['Karnataka', 'Kerala', 'Tamil Nadu', 'Andhra Pradesh', 'Telangana', 'Puducherry']),
    ('East India', ARRAY['West Bengal', 'Odisha', 'Jharkhand', 'Bihar', 'Assam', 'Meghalaya', 'Manipur', 'Mizoram', 'Nagaland', 'Tripura', 'Arunachal Pradesh']),
    ('West India', ARRAY['Maharashtra', 'Gujarat', 'Goa']),
    ('Central India', ARRAY['Madhya Pradesh', 'Chhattisgarh']),
    ('Other States', ARRAY['Sikkim', 'Lakshadweep'])
ON CONFLICT DO NOTHING;

-- Insert default shipping rates
DO $$
DECLARE
    v_metro_id UUID;
    v_north_id UUID;
    v_default_id UUID;
BEGIN
    SELECT id INTO v_metro_id FROM public.shipping_zones WHERE name = 'Metro Cities' LIMIT 1;
    SELECT id INTO v_north_id FROM public.shipping_zones WHERE name = 'North India' LIMIT 1;
    SELECT id INTO v_default_id FROM public.shipping_zones WHERE name = 'Other States' LIMIT 1;
    
    -- Metro cities - Free shipping above ₹500
    INSERT INTO public.shipping_rates (zone_id, min_order_value, base_charge, per_kg_charge, free_shipping_threshold, estimated_days_min, estimated_days_max) VALUES
        (v_metro_id, 0, 40, 20, 500, 1, 2),
        (v_metro_id, 500, 0, 0, NULL, 1, 2);
    
    -- North India - Free shipping above ₹750
    INSERT INTO public.shipping_rates (zone_id, min_order_value, base_charge, per_kg_charge, free_shipping_threshold, estimated_days_min, estimated_days_max) VALUES
        (v_north_id, 0, 60, 25, 750, 2, 4),
        (v_north_id, 750, 0, 0, NULL, 2, 4);
    
    -- Other states - Free shipping above ₹1000
    INSERT INTO public.shipping_rates (zone_id, min_order_value, base_charge, per_kg_charge, free_shipping_threshold, estimated_days_min, estimated_days_max) VALUES
        (v_default_id, 0, 80, 30, 1000, 3, 5),
        (v_default_id, 1000, 0, 0, NULL, 3, 5);
END $$;

-- Insert sample coupons
INSERT INTO public.coupons (code, description, discount_type, discount_value, min_order_value, max_discount_amount, valid_until, applicable_to_all, is_active) VALUES
    ('WELCOME10', 'Welcome discount for new customers', 'percentage', 10.00, 500, 100, NOW() + INTERVAL '30 days', true, true),
    ('FIRST50', 'Flat ₹50 off on first order', 'fixed', 50.00, 300, 50, NOW() + INTERVAL '60 days', true, true),
    ('FREESHIP', 'Free shipping on your order', 'free_shipping', 0, 499, NULL, NOW() + INTERVAL '90 days', true, true),
    ('SAVE20', 'Save 20% on electronics', 'percentage', 20.00, 1000, 200, NOW() + INTERVAL '45 days', true, true)
ON CONFLICT (code) DO NOTHING;

-- Grant permissions
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- ============================================================================
-- END OF MIGRATION
-- ============================================================================
