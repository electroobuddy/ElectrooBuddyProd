-- ============================================
-- DEBUG & CLEANUP SCRIPT FOR ORDERS
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. Check orders WITHOUT items (orphans)
SELECT 
    o.id,
    o.order_number,
    o.user_id,
    o.total_amount,
    o.status,
    COUNT(oi.id) as item_count
FROM orders o
LEFT JOIN order_items oi ON o.id = oi.order_id
GROUP BY o.id, o.order_number, o.user_id, o.total_amount, o.status
HAVING COUNT(oi.id) = 0
ORDER BY o.ordered_at DESC;

-- 2. Check ALL orders with their item counts
SELECT 
    o.order_number,
    o.total_amount,
    o.status,
    COUNT(oi.id) as items_count,
    o.ordered_at
FROM orders o
LEFT JOIN order_items oi ON o.id = oi.order_id
GROUP BY o.id, o.order_number, o.total_amount, o.status, o.ordered_at
ORDER BY o.ordered_at DESC;

-- 3. Delete orphaned orders (orders with no items)
-- WARNING: This will delete orders that don't have any items
-- Only run this if you're sure you want to clean up test data
DELETE FROM orders 
WHERE id IN (
    SELECT o.id 
    FROM orders o
    LEFT JOIN order_items oi ON o.id = oi.order_id
    WHERE oi.id IS NULL
);

-- 4. Verify RLS policies exist for order_items
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'order_items';

-- 5. Manually add INSERT policy if missing (RUN THIS IF STEP 4 SHOWS NO INSERT POLICY)
-- Check if policy already exists first
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'order_items' 
        AND policyname = 'Users can insert own order items'
    ) THEN
        -- Create INSERT policy for regular users
        CREATE POLICY "Users can insert own order items" ON public.order_items 
        FOR INSERT TO authenticated 
        WITH CHECK (
            EXISTS (
                SELECT 1 
                FROM public.orders 
                WHERE orders.id = order_items.order_id 
                AND orders.user_id = auth.uid()
            )
        );
        RAISE NOTICE 'Created INSERT policy for order_items';
    ELSE
        RAISE NOTICE 'INSERT policy already exists';
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'order_items' 
        AND policyname = 'Admins can insert order items'
    ) THEN
        -- Create INSERT policy for admins
        CREATE POLICY "Admins can insert order items" ON public.order_items 
        FOR INSERT TO authenticated 
        WITH CHECK (public.has_role(auth.uid(), 'admin'));
        RAISE NOTICE 'Created admin INSERT policy for order_items';
    ELSE
        RAISE NOTICE 'Admin INSERT policy already exists';
    END IF;
END $$;

-- 6. Test the fix - Insert a test order item
-- Uncomment only AFTER applying the RLS policy above
-- DO NOT RUN THIS IN PRODUCTION - FOR TESTING ONLY
/*
DO $$
DECLARE
    test_order_id UUID;
BEGIN
    -- Get the most recent order ID
    SELECT id INTO test_order_id 
    FROM orders 
    ORDER BY ordered_at DESC 
    LIMIT 1;
    
    -- Try to insert a test item
    INSERT INTO order_items (
        order_id,
        product_id,
        product_name,
        quantity,
        unit_price,
        total_price
    ) VALUES (
        test_order_id,
        (SELECT id FROM products LIMIT 1), -- Get first product
        'Test Item',
        1,
        100.00,
        100.00
    );
    
    RAISE NOTICE 'Successfully inserted test item into order %', test_order_id;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Failed to insert test item: %', SQLERRM;
END $$;
*/
