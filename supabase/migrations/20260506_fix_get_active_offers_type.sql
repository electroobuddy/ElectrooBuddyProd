-- Fix type mismatch in get_active_offers RPC function
-- The issue is that the function returns an ENUM type but the function signature expects text

-- Drop existing functions first to avoid return type conflicts
DROP FUNCTION IF EXISTS public.get_active_offers(p_visibility TEXT);
DROP FUNCTION IF EXISTS public.get_active_offers_cached(p_visibility TEXT);

CREATE OR REPLACE FUNCTION public.get_active_offers(p_visibility TEXT)
RETURNS TABLE (
    id UUID,
    title TEXT,
    subtitle TEXT,
    description TEXT,
    banner_url TEXT,
    offer_type TEXT,  -- Cast enum to text
    value NUMERIC,
    min_purchase NUMERIC,
    max_discount NUMERIC,
    start_date TIMESTAMPTZ,
    end_date TIMESTAMPTZ,
    priority INTEGER,
    visibility TEXT[],
    cta_text TEXT,
    cta_link TEXT,
    bg_gradient TEXT,
    status TEXT,
    is_active BOOLEAN,
    coupon_code TEXT,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        o.id,
        o.title,
        o.subtitle,
        o.description,
        o.banner_url,
        o.type::text as offer_type,  -- Cast enum to text
        o.value,
        o.min_purchase,
        o.max_discount,
        o.start_date,
        o.end_date,
        o.priority,
        o.visibility,
        o.cta_text,
        o.cta_link,
        o.bg_gradient,
        o.status::text as status,  -- Cast enum to text
        o.is_active,
        o.coupon_code,
        o.created_at,
        o.updated_at
    FROM public.offers o
    WHERE o.is_active = true
      AND o.status = 'active'
      AND (o.start_date <= now())
      AND (o.end_date IS NULL OR o.end_date > now())
      AND p_visibility = ANY(o.visibility)
    ORDER BY o.priority DESC, o.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Also create the cached version if it doesn't exist
CREATE OR REPLACE FUNCTION public.get_active_offers_cached(p_visibility TEXT)
RETURNS TABLE (
    id UUID,
    title TEXT,
    subtitle TEXT,
    description TEXT,
    banner_url TEXT,
    offer_type TEXT,  -- Cast enum to text
    value NUMERIC,
    min_purchase NUMERIC,
    max_discount NUMERIC,
    start_date TIMESTAMPTZ,
    end_date TIMESTAMPTZ,
    priority INTEGER,
    visibility TEXT[],
    cta_text TEXT,
    cta_link TEXT,
    bg_gradient TEXT,
    status TEXT,
    is_active BOOLEAN,
    coupon_code TEXT,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        o.id,
        o.title,
        o.subtitle,
        o.description,
        o.banner_url,
        o.type::text as offer_type,  -- Cast enum to text
        o.value,
        o.min_purchase,
        o.max_discount,
        o.start_date,
        o.end_date,
        o.priority,
        o.visibility,
        o.cta_text,
        o.cta_link,
        o.bg_gradient,
        o.status::text as status,  -- Cast enum to text
        o.is_active,
        o.coupon_code,
        o.created_at,
        o.updated_at
    FROM public.offers o
    WHERE o.is_active = true
      AND o.status = 'active'
      AND (o.start_date <= now())
      AND (o.end_date IS NULL OR o.end_date > now())
      AND p_visibility = ANY(o.visibility)
    ORDER BY o.priority DESC, o.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
