-- ============================================================================
-- ELECTROOBUDDY - OFFER MANAGEMENT SYSTEM v1.0
-- Migration: 20260418_create_offer_system.sql
-- Description: Table and logic for marketing-focused promotional banners
-- ============================================================================

-- 1. Create Enums for Offers
DO $$ BEGIN
    CREATE TYPE public.offer_status AS ENUM ('active', 'inactive', 'scheduled', 'expired');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.offer_type AS ENUM ('percentage', 'flat', 'bogo', 'shipping', 'custom');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Create Offers Table
CREATE TABLE IF NOT EXISTS public.offers (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    subtitle TEXT,
    description TEXT,
    banner_url TEXT, -- Image stored in 'images' bucket (optional)
    
    -- Offer Logic
    type offer_type NOT NULL DEFAULT 'percentage',
    value NUMERIC(10, 2) DEFAULT 0,
    min_purchase NUMERIC(10, 2) DEFAULT 0,
    max_discount NUMERIC(10, 2),
    
    -- Scheduling
    start_date TIMESTAMPTZ NOT NULL DEFAULT now(),
    end_date TIMESTAMPTZ,
    
    -- Display Control
    priority INTEGER NOT NULL DEFAULT 0,
    visibility TEXT[] DEFAULT '{home_hero}' NOT NULL, -- home_hero, products_page, popup
    cta_text TEXT DEFAULT 'Grab Offer',
    cta_link TEXT DEFAULT '/#request-service',
    bg_gradient TEXT, -- Optional custom styling (e.g., 'from-blue-600 to-blue-800')
    
    -- Status
    status offer_status NOT NULL DEFAULT 'active',
    is_active BOOLEAN NOT NULL DEFAULT true,
    
    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Create Mapping Tables for Targeting
CREATE TABLE IF NOT EXISTS public.offer_services (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    offer_id UUID NOT NULL REFERENCES public.offers(id) ON DELETE CASCADE,
    service_id UUID NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
    UNIQUE(offer_id, service_id)
);

CREATE TABLE IF NOT EXISTS public.offer_products (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    offer_id UUID NOT NULL REFERENCES public.offers(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    UNIQUE(offer_id, product_id)
);

-- 4. Set up RLS (Row Level Security)
ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offer_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offer_products ENABLE ROW LEVEL SECURITY;

-- Public: Read only
CREATE POLICY "Public can view active offers" ON public.offers
    FOR SELECT USING (is_active = true AND status = 'active' AND (end_date IS NULL OR end_date > now()));

CREATE POLICY "Public can view offer services" ON public.offer_services
    FOR SELECT USING (true);

CREATE POLICY "Public can view offer products" ON public.offer_products
    FOR SELECT USING (true);

-- Admin: Full access
-- Note: Assuming 'admin' role exists in user_roles
CREATE POLICY "Admins can manage offers" ON public.offers
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_roles 
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Admins can manage offer services" ON public.offer_services
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_roles 
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Admins can manage offer products" ON public.offer_products
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_roles 
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- 5. Performance Indexes
CREATE INDEX IF NOT EXISTS idx_offers_status ON public.offers(status, is_active);
CREATE INDEX IF NOT EXISTS idx_offers_priority ON public.offers(priority DESC);
CREATE INDEX IF NOT EXISTS idx_offers_validity ON public.offers(start_date, end_date);

-- 6. Trigger for updated_at
CREATE TRIGGER update_offers_updated_at
    BEFORE UPDATE ON public.offers
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 7. Helper RPC function to get active offers
CREATE OR REPLACE FUNCTION public.get_active_offers(p_visibility TEXT)
RETURNS SETOF public.offers AS $$
BEGIN
    RETURN QUERY
    SELECT *
    FROM public.offers
    WHERE is_active = true
      AND status = 'active'
      AND (start_date <= now())
      AND (end_date IS NULL OR end_date > now())
      AND p_visibility = ANY(visibility)
    ORDER BY priority DESC, created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
