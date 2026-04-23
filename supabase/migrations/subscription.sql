CREATE TABLE IF NOT EXISTS public.subscription_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    price NUMERIC(10, 2) NOT NULL,
    currency TEXT NOT NULL DEFAULT 'INR',
    duration_days INTEGER NOT NULL DEFAULT 365,
    description TEXT,
    features JSONB DEFAULT '[]'::jsonb, -- e.g., ['2 free service calls', '10% discount on parts']
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Insert initial plans
INSERT INTO public.subscription_plans (name, price, description, features)
VALUES
    ('Basic Annual Maintenance', 999.00, 'Essential annual maintenance for your electrical systems.', '["1 free service call", "5% discount on parts"]'::jsonb),
    ('Premium Annual Maintenance', 2999.00, 'Comprehensive annual maintenance with priority support.', '["3 free service calls", "15% discount on parts", "Priority support"]'::jsonb)
ON CONFLICT (name) DO NOTHING;

-- RLS for subscription_plans (read-only for authenticated users, full for service_role)
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to subscription plans"
  ON public.subscription_plans FOR SELECT TO authenticated, anon
  USING (TRUE);

CREATE POLICY "Allow service role full access to subscription plans"
  ON public.subscription_plans FOR ALL TO service_role
  USING (TRUE) WITH CHECK (TRUE);


CREATE TABLE IF NOT EXISTS public.user_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    plan_id UUID REFERENCES public.subscription_plans(id) ON DELETE RESTRICT NOT NULL,
    start_date TIMESTAMPTZ NOT NULL DEFAULT now(),
    end_date TIMESTAMPTZ NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'active', 'cancelled', 'expired'
    payment_id TEXT UNIQUE, -- Reference to payment gateway transaction ID
    amount NUMERIC(10, 2) NOT NULL,
    currency TEXT NOT NULL DEFAULT 'INR',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for performance
CREATE INDEX idx_user_subscriptions_user_id ON public.user_subscriptions(user_id);
CREATE INDEX idx_user_subscriptions_status ON public.user_subscriptions(status);

-- RLS for user_subscriptions
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view and manage their own subscriptions"
  ON public.user_subscriptions FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Service role can manage all user subscriptions"
  ON public.user_subscriptions FOR ALL TO service_role
  USING (TRUE) WITH CHECK (TRUE);
