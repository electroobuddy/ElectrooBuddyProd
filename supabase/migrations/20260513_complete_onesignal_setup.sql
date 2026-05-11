-- =============================================================================
-- COMPLETE ONESIGNAL SETUP MIGRATION
-- This migration sets up the entire database for OneSignal push notifications
-- =============================================================================

-- =============================================================================
-- STEP 1: Ensure push_subscriptions table has all required columns
-- =============================================================================

-- Add subscription_type column if missing
ALTER TABLE public.push_subscriptions 
ADD COLUMN IF NOT EXISTS subscription_type VARCHAR(20) DEFAULT 'onesignal';

-- Ensure subscription_type is not null
UPDATE public.push_subscriptions 
SET subscription_type = 'onesignal' 
WHERE subscription_type IS NULL;

ALTER TABLE public.push_subscriptions 
ALTER COLUMN subscription_type SET NOT NULL;

-- Add endpoint column if missing (for OneSignal subscription ID)
ALTER TABLE public.push_subscriptions 
ADD COLUMN IF NOT EXISTS endpoint TEXT;

-- Add subscription JSONB column if missing
ALTER TABLE public.push_subscriptions 
ADD COLUMN IF NOT EXISTS subscription JSONB DEFAULT '{}';

-- Add user_agent column if missing
ALTER TABLE public.push_subscriptions 
ADD COLUMN IF NOT EXISTS user_agent TEXT;

-- Add browser column if missing
ALTER TABLE public.push_subscriptions 
ADD COLUMN IF NOT EXISTS browser TEXT;

-- Add device_type column if missing
ALTER TABLE public.push_subscriptions 
ADD COLUMN IF NOT EXISTS device_type VARCHAR(20) DEFAULT 'desktop';

-- Add is_active column if missing
ALTER TABLE public.push_subscriptions 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- =============================================================================
-- STEP 2: Create indexes for performance
-- =============================================================================

-- Index for OneSignal type queries
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_onesignal 
ON public.push_subscriptions(subscription_type) 
WHERE subscription_type = 'onesignal';

-- Index for active subscriptions by user
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user_active 
ON public.push_subscriptions(user_id, is_active) 
WHERE is_active = true;

-- Index for endpoint lookups
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_endpoint 
ON public.push_subscriptions(endpoint) 
WHERE endpoint IS NOT NULL;

-- =============================================================================
-- STEP 3: Update RLS policies for OneSignal
-- =============================================================================

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can manage own push subscriptions" ON public.push_subscriptions;
DROP POLICY IF EXISTS "Service role can manage all push subscriptions" ON public.push_subscriptions;
DROP POLICY IF EXISTS "Users can insert own push subscriptions" ON public.push_subscriptions;
DROP POLICY IF EXISTS "Users can update own push subscriptions" ON public.push_subscriptions;
DROP POLICY IF EXISTS "Users can view own push subscriptions" ON public.push_subscriptions;

-- Create comprehensive RLS policy
CREATE POLICY "Users can manage own push subscriptions"
  ON public.push_subscriptions FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Service role can manage all (for edge functions)
CREATE POLICY "Service role can manage all push subscriptions"
  ON public.push_subscriptions FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- =============================================================================
-- STEP 4: Create function to get OneSignal subscriptions
-- =============================================================================

CREATE OR REPLACE FUNCTION public.get_onesignal_subscriptions(p_user_id UUID)
RETURNS TABLE (
  subscription_id TEXT,
  browser TEXT,
  device_type TEXT,
  is_active BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ps.endpoint::TEXT,
    ps.browser,
    ps.device_type,
    ps.is_active
  FROM public.push_subscriptions ps
  WHERE ps.user_id = p_user_id 
    AND ps.subscription_type = 'onesignal'
    AND ps.is_active = true;
END;
$$;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION public.get_onesignal_subscriptions TO authenticated;

-- =============================================================================
-- STEP 5: Update existing records for OneSignal compatibility
-- =============================================================================

-- Update all existing active subscriptions to be OneSignal type
UPDATE public.push_subscriptions 
SET 
  subscription_type = 'onesignal',
  is_active = true
WHERE subscription_type NOT IN ('onesignal', 'fcm', 'vapid') 
   OR subscription_type IS NULL;

-- =============================================================================
-- STEP 6: Comments for documentation
-- =============================================================================

COMMENT ON TABLE public.push_subscriptions IS 'Stores push notification subscriptions for Web Push (VAPID), Firebase (FCM), and OneSignal';
COMMENT ON COLUMN public.push_subscriptions.subscription_type IS 'Type of push subscription: onesignal, fcm, or vapid';
COMMENT ON COLUMN public.push_subscriptions.endpoint IS 'Subscription endpoint ID (OneSignal subscription ID, FCM token, or VAPID endpoint)';
COMMENT ON COLUMN public.push_subscriptions.subscription IS 'JSONB containing subscription details';

-- =============================================================================
-- DONE! OneSignal database setup complete
-- =============================================================================

-- Verify the setup
SELECT 
  'OneSignal setup complete' as status,
  COUNT(*) as total_subscriptions,
  COUNT(*) FILTER (WHERE subscription_type = 'onesignal') as onesignal_subscriptions,
  COUNT(*) FILTER (WHERE is_active = true) as active_subscriptions
FROM public.push_subscriptions;
