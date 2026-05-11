-- ============================================================================
-- Push Notifications System Fix Migration
-- Date: 2026-05-08
-- Purpose: Add push notification support and fix notification system issues
-- ============================================================================

-- STEP 1: Add Push Notification Columns to Notification Preferences
-- ============================================================================

ALTER TABLE public.notification_preferences 
ADD COLUMN IF NOT EXISTS push_notifications BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS push_booking_created BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS push_booking_confirmed BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS push_booking_assigned BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS push_booking_completed BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS push_booking_cancelled BOOLEAN DEFAULT true;

-- STEP 2: Create Push Subscriptions Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.push_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    endpoint TEXT NOT NULL,
    subscription JSONB NOT NULL,
    browser_name TEXT,
    user_agent TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user_id ON public.push_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_is_active ON public.push_subscriptions(is_active);
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_endpoint ON public.push_subscriptions(endpoint);

-- Enable RLS
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies (drop if exists first to avoid errors)
DROP POLICY IF EXISTS "Users can manage own push subscriptions" ON public.push_subscriptions;
DROP POLICY IF EXISTS "Service role can manage all push subscriptions" ON public.push_subscriptions;

CREATE POLICY "Users can manage own push subscriptions"
  ON public.push_subscriptions FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Service role can manage all push subscriptions"
  ON public.push_subscriptions FOR ALL TO service_role
  USING (true);

-- STEP 3: Update Notification Creation Function to Handle Push Notifications
-- ============================================================================

CREATE OR REPLACE FUNCTION public.create_notification_with_push(
    p_user_id UUID,
    p_type TEXT,
    p_title TEXT,
    p_message TEXT,
    p_booking_id UUID DEFAULT NULL,
    p_order_id UUID DEFAULT NULL,
    p_metadata JSONB DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_notification_id UUID;
    v_send_in_app BOOLEAN;
    v_send_email BOOLEAN;
    v_send_push BOOLEAN;
    v_user_email TEXT;
    v_email_enabled BOOLEAN;
    v_push_enabled BOOLEAN;
BEGIN
    -- Get user preferences
    SELECT 
        COALESCE(in_app_notifications, true) as in_app_notifications,
        COALESCE(email_booking_created, true) as email_booking_created,
        COALESCE(email_booking_confirmed, true) as email_booking_confirmed,
        COALESCE(email_booking_assigned, true) as email_booking_assigned,
        COALESCE(email_booking_completed, true) as email_booking_completed,
        COALESCE(email_booking_cancelled, true) as email_booking_cancelled,
        COALESCE(push_notifications, true) as push_notifications,
        COALESCE(push_booking_created, true) as push_booking_created,
        COALESCE(push_booking_confirmed, true) as push_booking_confirmed,
        COALESCE(push_booking_assigned, true) as push_booking_assigned,
        COALESCE(push_booking_completed, true) as push_booking_completed,
        COALESCE(push_booking_cancelled, true) as push_booking_cancelled
    INTO 
        v_send_in_app,
        v_email_enabled,
        v_email_enabled,
        v_email_enabled,
        v_email_enabled,
        v_email_enabled,
        v_push_enabled,
        v_push_enabled,
        v_push_enabled,
        v_push_enabled,
        v_push_enabled,
        v_push_enabled
    FROM public.notification_preferences
    WHERE user_id = p_user_id;
    
    -- Check if email should be sent based on notification type
    v_send_email := CASE 
        WHEN p_type = 'booking_created' THEN v_email_enabled
        WHEN p_type = 'booking_confirmed' THEN v_email_enabled
        WHEN p_type = 'booking_assigned' THEN v_email_enabled
        WHEN p_type = 'booking_completed' THEN v_email_enabled
        WHEN p_type = 'booking_cancelled' THEN v_email_enabled
        ELSE false
    END;
    
    -- Check if push should be sent based on notification type
    v_send_push := CASE 
        WHEN p_type = 'booking_created' THEN v_push_enabled
        WHEN p_type = 'booking_confirmed' THEN v_push_enabled
        WHEN p_type = 'booking_assigned' THEN v_push_enabled
        WHEN p_type = 'booking_completed' THEN v_push_enabled
        WHEN p_type = 'booking_cancelled' THEN v_push_enabled
        ELSE false
    END;
    
    -- Create in-app notification if enabled
    IF v_send_in_app THEN
        INSERT INTO public.notifications (
            user_id, type, title, message, booking_id, order_id, metadata
        )
        VALUES (
            p_user_id, p_type, p_title, p_message, p_booking_id, p_order_id, p_metadata
        )
        RETURNING id INTO v_notification_id;
    END IF;
    
    -- Send push notification if enabled
    IF v_send_push AND v_notification_id IS NOT NULL THEN
        -- Call the push notification edge function
        -- This will be handled by the application layer
        PERFORM net.http_post(
            url := current_setting('app.supabase_url', true) || '/functions/v1/send-push-notification',
            headers := jsonb_build_object(
                'Authorization', 'Bearer ' || current_setting('app.service_role_key', true),
                'Content-Type', 'application/json'
            ),
            body := jsonb_build_object(
                'userId', p_user_id,
                'title', p_title,
                'body', p_message,
                'type', p_type,
                'notificationId', v_notification_id,
                'url', CASE 
                    WHEN p_booking_id IS NOT NULL THEN '/dashboard/bookings'
                    WHEN p_order_id IS NOT NULL THEN '/dashboard/orders'
                    ELSE '/dashboard'
                END
            )
        );
    END IF;
    
    RETURN v_notification_id;
END;
$$;

-- STEP 4: Grant Permissions
-- ============================================================================

GRANT ALL ON public.push_subscriptions TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_notification_with_push(UUID, TEXT, TEXT, TEXT, UUID, UUID, JSONB) TO authenticated;

-- STEP 5: Update existing notification preferences to include push defaults
-- ============================================================================

UPDATE public.notification_preferences 
SET 
    push_notifications = COALESCE(push_notifications, true),
    push_booking_created = COALESCE(push_booking_created, true),
    push_booking_confirmed = COALESCE(push_booking_confirmed, true),
    push_booking_assigned = COALESCE(push_booking_assigned, true),
    push_booking_completed = COALESCE(push_booking_completed, true),
    push_booking_cancelled = COALESCE(push_booking_cancelled, true),
    updated_at = now()
WHERE push_notifications IS NULL;

-- ============================================================================
-- Migration Complete
-- ============================================================================

COMMENT ON TABLE public.push_subscriptions IS 'User push notification subscriptions for browser notifications';
COMMENT ON FUNCTION public.create_notification_with_push IS 'Creates notification and sends push notifications if enabled';
