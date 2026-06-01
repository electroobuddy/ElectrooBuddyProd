-- Track subscription benefit usage (free service calls, discounts, etc.)
CREATE TABLE IF NOT EXISTS public.subscription_benefits_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_subscription_id UUID REFERENCES public.user_subscriptions(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    benefit_type TEXT NOT NULL, -- 'service_call', 'parts_discount', 'priority_support'
    booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
    description TEXT,
    used_at TIMESTAMPTZ DEFAULT now(),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for performance
CREATE INDEX idx_subscription_benefits_usage_sub_id ON public.subscription_benefits_usage(user_subscription_id);
CREATE INDEX idx_subscription_benefits_usage_user_id ON public.subscription_benefits_usage(user_id);
CREATE INDEX idx_subscription_benefits_usage_benefit_type ON public.subscription_benefits_usage(benefit_type);

-- RLS for subscription_benefits_usage
ALTER TABLE public.subscription_benefits_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own benefit usage"
  ON public.subscription_benefits_usage FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Service role can manage all benefit usage"
  ON public.subscription_benefits_usage FOR ALL TO service_role
  USING (TRUE) WITH CHECK (TRUE);

-- Add user_subscription_id to bookings table to link bookings to subscriptions
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS user_subscription_id UUID REFERENCES public.user_subscriptions(id) ON DELETE SET NULL;

-- Add subscription_discount column to track subscription-specific discounts
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS subscription_discount NUMERIC DEFAULT 0;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS subscription_benefit_used TEXT; -- e.g., 'free_service_call', 'parts_discount'

-- Add max_service_calls and max_parts_discount to subscription_plans for better tracking
ALTER TABLE public.subscription_plans ADD COLUMN IF NOT EXISTS max_service_calls INTEGER DEFAULT 0;
ALTER TABLE public.subscription_plans ADD COLUMN IF NOT EXISTS parts_discount_percent NUMERIC DEFAULT 0;
ALTER TABLE public.subscription_plans ADD COLUMN IF NOT EXISTS has_priority_support BOOLEAN DEFAULT FALSE;

-- Update existing plans with parsed values
UPDATE public.subscription_plans 
SET max_service_calls = 1, parts_discount_percent = 5
WHERE name = 'Basic Annual Maintenance';

UPDATE public.subscription_plans 
SET max_service_calls = 3, parts_discount_percent = 15, has_priority_support = TRUE
WHERE name = 'Premium Annual Maintenance';
