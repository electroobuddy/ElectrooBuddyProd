-- Allow authenticated users to create/manage their own subscription orders.
-- This removes hard dependency on service-role key for user-initiated flows.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'subscription_orders'
      AND policyname = 'Users can insert own subscription orders'
  ) THEN
    CREATE POLICY "Users can insert own subscription orders"
      ON public.subscription_orders
      FOR INSERT
      TO authenticated
      WITH CHECK (user_id = auth.uid());
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'subscription_orders'
      AND policyname = 'Users can update own subscription orders'
  ) THEN
    CREATE POLICY "Users can update own subscription orders"
      ON public.subscription_orders
      FOR UPDATE
      TO authenticated
      USING (user_id = auth.uid())
      WITH CHECK (user_id = auth.uid());
  END IF;
END $$;
