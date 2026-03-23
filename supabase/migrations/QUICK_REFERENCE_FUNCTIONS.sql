-- ============================================================================
-- QUICK REFERENCE: Using Enhanced E-Commerce Functions
-- ============================================================================

-- 1. APPLY COUPON
-- ---------------
-- Test applying a coupon code
SELECT * FROM public.apply_coupon(
    p_coupon_code := 'WELCOME10',
    p_user_id := 'YOUR_USER_ID_HERE',
    p_cart_total := 600,
    p_cart_items := '[]'::jsonb
);

-- Expected Result:
-- success: true/false
-- discount_amount: calculated discount
-- message: status message
-- coupon_data: JSON of coupon details


-- 2. CALCULATE SHIPPING
-- ---------------------
-- Calculate shipping charge for a location
SELECT * FROM public.calculate_shipping_charge(
    p_state := 'Delhi',
    p_order_value := 600,
    p_total_weight := 1.5
);

-- Expected Result:
-- shipping_charge: amount to charge
-- zone_name: shipping zone name
-- estimated_days: delivery estimate
-- free_shipping: boolean


-- 3. CALCULATE TAX
-- ----------------
-- Calculate GST for a product category
SELECT * FROM public.calculate_tax(
    p_category_id := 'CATEGORY_UUID_HERE',
    p_taxable_amount := 500
);

-- Expected Result:
-- tax_rate: applied GST rate
-- tax_amount: total tax
-- cgst: central GST (half of total)
-- sgst: state GST (half of total)
-- igst: integrated GST (0 for intra-state)


-- 4. VIEW ALL ACTIVE COUPONS
-- --------------------------
SELECT 
    code,
    description,
    discount_type,
    discount_value,
    min_order_value,
    max_discount_amount,
    used_count,
    usage_limit,
    valid_from,
    valid_until,
    is_active
FROM public.coupons
WHERE is_active = true
  AND valid_from <= NOW()
  AND (valid_until IS NULL OR valid_until >= NOW())
ORDER BY created_at DESC;


-- 5. CREATE NEW COUPON
-- --------------------
INSERT INTO public.coupons (
    code,
    description,
    discount_type,
    discount_value,
    min_order_value,
    max_discount_amount,
    usage_limit,
    valid_from,
    valid_until,
    applicable_to_all,
    is_active
) VALUES (
    'SUMMER25',
    'Summer Sale - 25% Off',
    'percentage',
    25.00,
    1000,          -- Min order ₹1000
    250,           -- Max discount ₹250
    500,           -- 500 uses total
    NOW(),
    NOW() + INTERVAL '30 days',
    true,
    true
);


-- 6. CREATE NEW CATEGORY
-- ----------------------
INSERT INTO public.product_categories (
    name,
    slug,
    description,
    icon_name,
    sort_order,
    is_featured,
    is_active
) VALUES (
    'Lighting Solutions',
    'lighting-solutions',
    'LED bulbs, tube lights, and decorative lighting',
    'Lightbulb',
    5,
    true,
    true
);


-- 7. SETUP SHIPPING ZONE
-- ----------------------
-- Create a new shipping zone
INSERT INTO public.shipping_zones (name, states) VALUES (
    'North East India',
    ARRAY['Assam', 'Meghalaya', 'Manipur', 'Mizoram', 'Nagaland', 'Tripura', 'Arunachal Pradesh']
);

-- Add shipping rates for the zone
INSERT INTO public.shipping_rates (
    zone_id,
    min_order_value,
    base_charge,
    per_kg_charge,
    free_shipping_threshold,
    estimated_days_min,
    estimated_days_max,
    is_active
) VALUES (
    (SELECT id FROM public.shipping_zones WHERE name = 'North East India'),
    0,              -- No minimum order
    100,            -- Base charge ₹100
    40,             -- ₹40 per extra kg
    1500,           -- Free shipping above ₹1500
    5,              -- Min 5 days
    7,              -- Max 7 days
    true
);


-- 8. VIEW COUPON USAGE STATISTICS
-- --------------------------------
SELECT 
    code,
    discount_type,
    discount_value,
    used_count,
    usage_limit,
    CASE 
        WHEN usage_limit IS NULL THEN 'Unlimited'
        ELSE CONCAT(usage_limit - used_count, ' remaining')
    END as remaining_uses,
    ROUND((used_count::DECIMAL / NULLIF(usage_limit, 0)) * 100, 2) as usage_percentage
FROM public.coupons
WHERE usage_limit IS NOT NULL
ORDER BY usage_percentage DESC NULLS LAST;


-- 9. EXPIRE OLD COUPONS
-- ---------------------
-- Automatically expire coupons past their end date
UPDATE public.coupons
SET is_active = false
WHERE valid_until < NOW()
  AND is_active = true;


-- 10. GET CATEGORIES WITH PRODUCT COUNT
-- -------------------------------------
SELECT 
    c.name,
    c.slug,
    c.is_featured,
    c.sort_order,
    COUNT(p.id) as product_count
FROM public.product_categories c
LEFT JOIN public.products p ON p.category = c.name AND p.is_active = true
GROUP BY c.id, c.name, c.slug, c.is_featured, c.sort_order
ORDER BY c.sort_order, c.name;


-- ============================================================================
-- TROUBLESHOOTING QUERIES
-- ============================================================================

-- Check if function exists
SELECT 
    routine_name,
    routine_schema
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name IN ('apply_coupon', 'calculate_shipping_charge', 'calculate_tax');

-- View all shipping zones and their states
SELECT 
    z.name as zone_name,
    z.states,
    COUNT(r.id) as rate_count
FROM public.shipping_zones z
LEFT JOIN public.shipping_rates r ON r.zone_id = z.id
GROUP BY z.id, z.name, z.states;

-- Find coupons applicable to a specific user
SELECT 
    code,
    description,
    discount_type,
    discount_value,
    min_order_value,
    CASE 
        WHEN applicable_to_new_users_only = true THEN 'New Users Only'
        ELSE 'All Users'
    END as user_type,
    valid_until
FROM public.coupons
WHERE is_active = true
  AND valid_from <= NOW()
  AND (valid_until IS NULL OR valid_until >= NOW())
ORDER BY discount_value DESC;


-- ============================================================================
-- PERFORMANCE OPTIMIZATION
-- ============================================================================

-- Analyze table statistics (run periodically)
ANALYZE public.coupons;
ANALYZE public.product_categories;
ANALYZE public.shipping_zones;
ANALYZE public.shipping_rates;

-- Vacuum old notifications
VACUUM ANALYZE public.coupons;


-- ============================================================================
-- BACKUP & RESTORE
-- ============================================================================

-- Backup all active coupons
COPY (
    SELECT * FROM public.coupons 
    WHERE is_active = true
) TO '/tmp/coupons_backup.csv' WITH CSV HEADER;

-- Restore coupons from backup
COPY public.coupons FROM '/tmp/coupons_backup.csv' WITH CSV HEADER;


-- ============================================================================
-- END OF QUICK REFERENCE
-- ============================================================================
