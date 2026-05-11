-- =============================================================================
-- Fix FCM Push Subscriptions Schema
-- Makes p256dh and auth nullable for FCM support
-- Adds missing FCM columns
-- =============================================================================

-- Make p256dh and auth nullable (FCM doesn't need these)
ALTER TABLE public.push_subscriptions 
ALTER COLUMN p256dh DROP NOT NULL;

ALTER TABLE public.push_subscriptions 
ALTER COLUMN auth DROP NOT NULL;

-- Add fcm_token column if missing
ALTER TABLE public.push_subscriptions 
ADD COLUMN IF NOT EXISTS fcm_token TEXT;

-- Add subscription_type column if missing
ALTER TABLE public.push_subscriptions 
ADD COLUMN IF NOT EXISTS subscription_type VARCHAR(20) DEFAULT 'vapid';

-- Add subscription JSONB column if missing (for compatibility)
ALTER TABLE public.push_subscriptions 
ADD COLUMN IF NOT EXISTS subscription JSONB;

-- Make subscription_type not null with default
ALTER TABLE public.push_subscriptions 
ALTER COLUMN subscription_type SET NOT NULL;

-- Create indexes for FCM queries
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_fcm_token 
ON public.push_subscriptions(fcm_token) 
WHERE fcm_token IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_push_subscriptions_type 
ON public.push_subscriptions(subscription_type);

-- Update existing FCM records
UPDATE public.push_subscriptions 
SET subscription_type = 'fcm' 
WHERE fcm_token IS NOT NULL AND subscription_type = 'vapid';

-- Comments
COMMENT ON COLUMN public.push_subscriptions.fcm_token IS 'Firebase Cloud Messaging token';
COMMENT ON COLUMN public.push_subscriptions.subscription_type IS 'Type: vapid (Web Push) or fcm (Firebase)';
COMMENT ON COLUMN public.push_subscriptions.p256dh IS 'VAPID public key (nullable for FCM)';
COMMENT ON COLUMN public.push_subscriptions.auth IS 'VAPID auth secret (nullable for FCM)';

-- =============================================================================
-- DONE!
-- =============================================================================
