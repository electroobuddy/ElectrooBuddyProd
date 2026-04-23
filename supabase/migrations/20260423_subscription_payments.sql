-- Subscription payment lifecycle hardening for Razorpay

CREATE TABLE IF NOT EXISTS public.subscription_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES public.subscription_plans(id) ON DELETE RESTRICT,
  amount NUMERIC(10, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'INR',
  duration_days INTEGER NOT NULL DEFAULT 365,
  status TEXT NOT NULL DEFAULT 'created' CHECK (status IN ('created', 'paid', 'failed', 'cancelled')),
  razorpay_order_id TEXT UNIQUE,
  razorpay_payment_id TEXT UNIQUE,
  razorpay_signature TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.subscription_orders ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'subscription_orders'
      AND policyname = 'Users can view own subscription orders'
  ) THEN
    CREATE POLICY "Users can view own subscription orders"
      ON public.subscription_orders
      FOR SELECT
      TO authenticated
      USING (user_id = auth.uid());
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'subscription_orders'
      AND policyname = 'Service role can manage subscription orders'
  ) THEN
    CREATE POLICY "Service role can manage subscription orders"
      ON public.subscription_orders
      FOR ALL
      TO service_role
      USING (TRUE)
      WITH CHECK (TRUE);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_subscription_orders_user_id ON public.subscription_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_subscription_orders_status ON public.subscription_orders(status);
CREATE INDEX IF NOT EXISTS idx_subscription_orders_created_at ON public.subscription_orders(created_at DESC);

ALTER TABLE public.user_subscriptions
  ADD COLUMN IF NOT EXISTS subscription_order_id UUID REFERENCES public.subscription_orders(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_user_subscriptions_plan_id ON public.user_subscriptions(plan_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_end_date ON public.user_subscriptions(end_date DESC);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_trigger
    WHERE tgname = 'update_subscription_orders_updated_at'
  ) THEN
    CREATE TRIGGER update_subscription_orders_updated_at
      BEFORE UPDATE ON public.subscription_orders
      FOR EACH ROW
      EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;
