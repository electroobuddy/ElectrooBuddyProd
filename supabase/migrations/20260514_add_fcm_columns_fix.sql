-- =============================================================================
-- Add FCM Push Subscription Columns
-- Required for Firebase Cloud Messaging support
-- =============================================================================

-- Add fcm_token column
ALTER TABLE public.push_subscriptions 
ADD COLUMN IF NOT EXISTS fcm_token TEXT;

-- Add subscription_type column
ALTER TABLE public.push_subscriptions 
ADD COLUMN IF NOT EXISTS subscription_type VARCHAR(20) DEFAULT 'fcm';

-- Add browser column
ALTER TABLE public.push_subscriptions 
ADD COLUMN IF NOT EXISTS browser VARCHAR(20);

-- Add device_type column
ALTER TABLE public.push_subscriptions 
ADD COLUMN IF NOT EXISTS device_type VARCHAR(20);

-- Add failure_count column
ALTER TABLE public.push_subscriptions 
ADD COLUMN IF NOT EXISTS failure_count INTEGER DEFAULT 0;

-- Add last_used_at column
ALTER TABLE public.push_subscriptions 
ADD COLUMN IF NOT EXISTS last_used_at TIMESTAMPTZ;

-- Add p256dh for web push compatibility (optional)
ALTER TABLE public.push_subscriptions 
ADD COLUMN IF NOT EXISTS p256dh TEXT;

-- Add auth for web push compatibility (optional)
ALTER TABLE public.push_subscriptions 
ADD COLUMN IF NOT EXISTS auth TEXT;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_fcm_token 
ON public.push_subscriptions(fcm_token) 
WHERE fcm_token IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_push_subscriptions_type 
ON public.push_subscriptions(subscription_type);

CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user_type 
ON public.push_subscriptions(user_id, subscription_type);

-- Add unique constraint on endpoint for upsert compatibility
-- Note: This may fail if there are duplicates - handle separately if needed

-- Comments
COMMENT ON COLUMN public.push_subscriptions.fcm_token IS 'Firebase Cloud Messaging token';
COMMENT ON COLUMN public.push_subscriptions.subscription_type IS 'Type: vapid, fcm, onesignal';
COMMENT ON COLUMN public.push_subscriptions.browser IS 'Browser name: chrome, firefox, safari, edge';
COMMENT ON COLUMN public.push_subscriptions.device_type IS 'Device type: desktop, mobile, tablet';

-- =============================================================================
-- DONE!
-- =============================================================================