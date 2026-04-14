-- ============================================================================
-- Push Notifications System Migration
-- Date: 2026-04-12
-- Purpose: Add push notification subscriptions and preferences
-- ============================================================================

-- STEP 1: Create Push Subscriptions Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.push_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    subscription JSONB NOT NULL,
    browser_name TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user_id ON public.push_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_active ON public.push_subscriptions(is_active);
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_created_at ON public.push_subscriptions(created_at);

-- Enable RLS
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can manage own push subscriptions"
  ON public.push_subscriptions FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Service role can manage all push subscriptions"
  ON public.push_subscriptions FOR ALL TO service_role
  USING (true);

-- STEP 2: Add Push Notification Preferences
-- ============================================================================

ALTER TABLE public.notification_preferences 
ADD COLUMN IF NOT EXISTS push_notifications BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS push_booking_created BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS push_booking_confirmed BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS push_booking_assigned BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS push_booking_completed BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS push_booking_cancelled BOOLEAN DEFAULT true;

-- STEP 3: Update Notification Helper Function to Support Push
-- ============================================================================

-- Update create_notification function to check push preferences
CREATE OR REPLACE FUNCTION public.create_notification(
    p_user_id UUID,
    p_type TEXT,
    p_title TEXT,
    p_message TEXT,
    p_booking_id UUID DEFAULT NULL,
    p_metadata JSONB DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_notification_id UUID;
    v_send_notification BOOLEAN;
    v_send_push BOOLEAN;
BEGIN
    -- Check user preferences for in-app notifications (default to true if no preferences set)
    SELECT COALESCE(in_app_notifications, true)
    INTO v_send_notification
    FROM public.notification_preferences
    WHERE user_id = p_user_id;
    
    -- Check push notification preferences
    SELECT COALESCE(push_notifications, true)
    INTO v_send_push
    FROM public.notification_preferences
    WHERE user_id = p_user_id;
    
    -- Create notification if in-app is enabled
    IF v_send_notification THEN
        INSERT INTO public.notifications (
            user_id,
            type,
            title,
            message,
            booking_id,
            metadata,
            is_read,
            email_sent,
            created_at
        ) VALUES (
            p_user_id,
            p_type,
            p_title,
            p_message,
            p_booking_id,
            p_metadata,
            false,
            false,
            now()
        ) RETURNING id INTO v_notification_id;
        
        -- Mark push_send flag in metadata if push is enabled
        IF v_send_push AND v_notification_id IS NOT NULL THEN
            UPDATE public.notifications
            SET metadata = jsonb_set(
                COALESCE(metadata, '{}'::jsonb),
                '{push_enabled}',
                'true'
            )
            WHERE id = v_notification_id;
        END IF;
    END IF;
    
    RETURN v_notification_id;
END;
$$;

-- STEP 4: Create Function to Get User Push Subscriptions
-- ============================================================================

CREATE OR REPLACE FUNCTION public.get_user_push_subscriptions(p_user_id UUID)
RETURNS TABLE (
    id UUID,
    subscription JSONB,
    browser_name TEXT,
    is_active BOOLEAN,
    created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ps.id,
        ps.subscription,
        ps.browser_name,
        ps.is_active,
        ps.created_at
    FROM public.push_subscriptions ps
    WHERE ps.user_id = p_user_id
    AND ps.is_active = true
    ORDER BY ps.created_at DESC;
END;
$$;

-- STEP 5: Add Comments for Documentation
-- ============================================================================

COMMENT ON TABLE public.push_subscriptions IS 'Stores web push notification subscriptions for users';
COMMENT ON COLUMN public.push_subscriptions.subscription IS 'JSON object containing push subscription details (endpoint, keys, etc.)';
COMMENT ON COLUMN public.push_subscriptions.is_active IS 'Whether this subscription is still valid and should receive notifications';
COMMENT ON COLUMN public.notification_preferences.push_notifications IS 'Master toggle for all push notifications';
COMMENT ON COLUMN public.notification_preferences.push_booking_created IS 'Receive push when booking is created';
COMMENT ON COLUMN public.notification_preferences.push_booking_confirmed IS 'Receive push when booking is confirmed';
COMMENT ON COLUMN public.notification_preferences.push_booking_assigned IS 'Receive push when technician is assigned';
COMMENT ON COLUMN public.notification_preferences.push_booking_completed IS 'Receive push when booking is completed';
COMMENT ON COLUMN public.notification_preferences.push_booking_cancelled IS 'Receive push when booking is cancelled';
