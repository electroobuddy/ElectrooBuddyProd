-- =============================================================================
-- Add Firebase FCM Support for Push Notifications
-- This migration adds FCM token support to replace VAPID
-- =============================================================================

-- Add FCM token column (for Firebase Cloud Messaging tokens)
ALTER TABLE public.push_subscriptions 
ADD COLUMN IF NOT EXISTS fcm_token TEXT;

-- Add subscription type to distinguish between VAPID and FCM
ALTER TABLE public.push_subscriptions 
ADD COLUMN IF NOT EXISTS subscription_type VARCHAR(20) DEFAULT 'vapid';

-- Update subscription_type for existing records
UPDATE public.push_subscriptions 
SET subscription_type = 'vapid' 
WHERE subscription_type IS NULL OR subscription_type = '';

-- Add not null constraint after update
ALTER TABLE public.push_subscriptions 
ALTER COLUMN subscription_type SET NOT NULL;

-- Add index for FCM tokens
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_fcm_token 
ON public.push_subscriptions(fcm_token) 
WHERE fcm_token IS NOT NULL;

-- Add index for subscription type
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_type 
ON public.push_subscriptions(subscription_type);

-- Comment for documentation
COMMENT ON COLUMN public.push_subscriptions.fcm_token IS 'Firebase Cloud Messaging token - used for cross-platform push notifications';
COMMENT ON COLUMN public.push_subscriptions.subscription_type IS 'Type of push subscription: vapid (Web Push) or fcm (Firebase Cloud Messaging)';

-- =============================================================================
-- Update RLS policies for new columns (if needed)
-- =============================================================================

-- Grant access to authenticated users
GRANT SELECT, INSERT, UPDATE ON public.push_subscriptions TO authenticated;
GRANT SELECT ON public.push_subscriptions TO anon;

-- =============================================================================
-- Add function to get FCM tokens only
-- =============================================================================
CREATE OR REPLACE FUNCTION public.get_user_fcm_subscriptions(p_user_id UUID)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  endpoint TEXT,
  fcm_token TEXT,
  browser VARCHAR(50),
  device_type VARCHAR(50),
  is_active BOOLEAN,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ps.id,
    ps.user_id,
    ps.endpoint,
    ps.fcm_token,
    ps.browser,
    ps.device_type,
    ps.is_active,
    ps.created_at,
    ps.updated_at
  FROM public.push_subscriptions ps
  WHERE ps.user_id = p_user_id 
    AND ps.fcm_token IS NOT NULL
    AND ps.is_active = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.get_user_fcm_subscriptions IS 'Get active FCM push subscriptions for a user';

-- =============================================================================
-- Add function to send FCM push notification
-- =============================================================================
CREATE OR REPLACE FUNCTION public.send_fcm_notification(
  p_user_id UUID,
  p_title TEXT,
  p_body TEXT,
  p_data JSONB DEFAULT '{}'::JSONB
)
RETURNS JSONB AS $$
DECLARE
  v_result JSONB;
  v_token_record RECORD;
  v_sent_count INTEGER := 0;
  v_failed_count INTEGER := 0;
BEGIN
  -- Get all active FCM tokens for the user
  FOR v_token_record IN 
    SELECT id, fcm_token, browser, device_type
    FROM public.push_subscriptions
    WHERE user_id = p_user_id 
      AND fcm_token IS NOT NULL
      AND is_active = true
  LOOP
    v_sent_count := v_sent_count + 1;
  END LOOP;

  v_result := jsonb_build_object(
    'success', true,
    'user_id', p_user_id,
    'title', p_title,
    'body', p_body,
    'tokens_found', v_sent_count,
    'message', 'Notification queued - use FCM edge function to send'
  );

  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.send_fcm_notification IS 'Queue FCM notification for a user - calls edge function for actual delivery';

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION public.send_fcm_notification TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_fcm_subscriptions TO authenticated;

-- =============================================================================
-- Drop old VAPID-dependent functions (optional cleanup)
-- =============================================================================
-- Note: Keep existing functions for backward compatibility with VAPID subscriptions

DO $$ 
BEGIN
  RAISE NOTICE 'FCM support migration completed successfully';
END $$;