-- ============================================================================
-- FIX ORDERS RLS POLICY - Allow authenticated users to create orders
-- ============================================================================
-- Run this in Supabase SQL Editor
-- Fixes: "new row violates row-level security policy for table 'orders'"

-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "Users can create own orders" ON public.orders;

-- Create new policy that allows any authenticated user to create orders
CREATE POLICY "authenticated_users_create_orders"
ON public.orders FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Also ensure admins can create orders for customers
CREATE POLICY "admins_can_create_orders"
ON public.orders FOR INSERT TO authenticated
WITH CHECK (
  public.has_role(auth.uid(), 'admin') OR 
  auth.uid() = user_id
);

-- Verify policies
SELECT 
  policyname as "Policy Name",
  cmd as "Command",
  roles::text as "Applies To"
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename = 'orders'
ORDER BY cmd;

-- Should show:
-- 1. Users can view own orders (SELECT)
-- 2. Admins can update orders (UPDATE)  
-- 3. Admins can view all orders (SELECT)
-- 4. authenticated_users_create_orders (INSERT)
-- 5. admins_can_create_orders (INSERT)
