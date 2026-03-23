-- Add INSERT policy for order_items
-- This allows authenticated users to insert order items when creating orders

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

-- Policy for admins to insert order items (for manual order creation)
CREATE POLICY "Admins can insert order items" ON public.order_items 
FOR INSERT TO authenticated 
WITH CHECK (public.has_role(auth.uid(), 'admin'));
