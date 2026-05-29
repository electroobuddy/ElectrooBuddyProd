-- Allow regular users to update their own orders (needed for payment status update after Razorpay success)
CREATE POLICY "Users can update own orders"
    ON public.orders FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
