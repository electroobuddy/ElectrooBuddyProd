-- ============================================
-- COMPLETE FIX FOR ORDER SYSTEM
-- Run this ENTIRE script in Supabase SQL Editor
-- ============================================

-- Step 1: Drop existing policies if they exist (to avoid conflicts)
DO $$ BEGIN
    DROP POLICY IF EXISTS "Users can insert own order items" ON public.order_items;
EXCEPTION WHEN others THEN NULL;
END $$;

DO $$ BEGIN
    DROP POLICY IF EXISTS "Admins can insert order items" ON public.order_items;
EXCEPTION WHEN others THEN NULL;
END $$;

-- Step 2: Create INSERT policies for order_items
-- Policy for regular users to insert their own order items
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

-- Policy for admins to insert order items
CREATE POLICY "Admins can insert order items" ON public.order_items 
FOR INSERT TO authenticated 
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Step 3: Verify policies were created
SELECT 
    policyname,
    cmd,
    roles,
    CASE 
        WHEN qual IS NOT NULL THEN 'Has USING clause'
        ELSE 'No USING clause'
    END as using_clause,
    CASE 
        WHEN with_check IS NOT NULL THEN 'Has WITH CHECK clause'
        ELSE 'No WITH CHECK clause'
    END as with_check_clause
FROM pg_policies
WHERE tablename = 'order_items'
ORDER BY cmd, policyname;

-- Step 4: Clean up orphaned orders (orders without items)
-- This removes test orders that were created without items
DELETE FROM orders 
WHERE id IN (
    SELECT o.id 
    FROM orders o
    LEFT JOIN order_items oi ON o.id = oi.order_id
    WHERE oi.id IS NULL
);

-- Step 5: Show summary
SELECT 
    'Orders cleanup complete!' as status,
    (SELECT COUNT(*) FROM orders) as total_orders,
    (SELECT COUNT(*) FROM order_items) as total_order_items,
    (SELECT COUNT(*) FROM order_items WHERE order_id NOT IN (SELECT id FROM orders)) as orphaned_items;
