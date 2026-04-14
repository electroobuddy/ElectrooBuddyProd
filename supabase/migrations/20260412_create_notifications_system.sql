-- ============================================================================
-- Complete Notification System Migration
-- Date: 2026-04-12
-- Purpose: Create comprehensive notification system for Admin, User, and Technician panels
-- ============================================================================

-- STEP 1: Create Enhanced Notifications Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL, -- 'booking_created', 'booking_confirmed', 'booking_assigned', 'booking_status_changed', 'booking_completed', 'booking_cancelled', 'technician_assigned', 'new_booking'
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE,
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMPTZ,
    email_sent BOOLEAN DEFAULT false,
    email_sent_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    metadata JSONB -- For additional context data
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON public.notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_booking_id ON public.notifications(booking_id);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own notifications"
  ON public.notifications FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can update own notifications"
  ON public.notifications FOR UPDATE TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Service role can manage all notifications"
  ON public.notifications FOR ALL TO service_role
  USING (true);

-- STEP 2: Create Notification Preferences Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.notification_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    email_booking_created BOOLEAN DEFAULT true,
    email_booking_confirmed BOOLEAN DEFAULT true,
    email_booking_assigned BOOLEAN DEFAULT true,
    email_booking_completed BOOLEAN DEFAULT true,
    email_booking_cancelled BOOLEAN DEFAULT true,
    in_app_notifications BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can manage own notification preferences"
  ON public.notification_preferences FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- STEP 3: Create Notification Helper Functions
-- ============================================================================

-- Function to create notification
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
BEGIN
    -- Check user preferences (default to true if no preferences set)
    SELECT COALESCE(in_app_notifications, true)
    INTO v_send_notification
    FROM public.notification_preferences
    WHERE user_id = p_user_id;
    
    -- If user has in-app notifications enabled, create notification
    IF v_send_notification THEN
        INSERT INTO public.notifications (user_id, type, title, message, booking_id, metadata)
        VALUES (p_user_id, p_type, p_title, p_message, p_booking_id, p_metadata)
        RETURNING id INTO v_notification_id;
        
        RETURN v_notification_id;
    END IF;
    
    RETURN NULL;
END;
$$;

-- Function to mark notification as read
CREATE OR REPLACE FUNCTION public.mark_notification_read(
    p_notification_id UUID,
    p_user_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    UPDATE public.notifications
    SET is_read = true,
        read_at = now()
    WHERE id = p_notification_id
      AND user_id = p_user_id
      AND is_read = false;
    
    RETURN FOUND;
END;
$$;

-- Function to mark all notifications as read for a user
CREATE OR REPLACE FUNCTION public.mark_all_notifications_read(
    p_user_id UUID
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_count INTEGER;
BEGIN
    UPDATE public.notifications
    SET is_read = true,
        read_at = now()
    WHERE user_id = p_user_id
      AND is_read = false;
    
    GET DIAGNOSTICS v_count = ROW_COUNT;
    RETURN v_count;
END;
$$;

-- Function to get unread notification count
CREATE OR REPLACE FUNCTION public.get_unread_notification_count(
    p_user_id UUID
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_count INTEGER;
BEGIN
    SELECT COUNT(*)
    INTO v_count
    FROM public.notifications
    WHERE user_id = p_user_id
      AND is_read = false;
    
    RETURN v_count;
END;
$$;

-- STEP 4: Create Trigger to Auto-Create Preferences on User Signup
-- ============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user_notification_preferences()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.notification_preferences (user_id)
    VALUES (NEW.id)
    ON CONFLICT (user_id) DO NOTHING;
    
    RETURN NEW;
END;
$$;

-- Trigger on auth.users (this will run when users are created)
-- Note: This requires the trigger to be attached to user creation flow
-- For existing users, we'll need to backfill

-- STEP 5: Backfill Notification Preferences for Existing Users
-- ============================================================================

-- Create preferences for existing users who don't have them
INSERT INTO public.notification_preferences (user_id)
SELECT id FROM auth.users
WHERE id NOT IN (SELECT user_id FROM public.notification_preferences)
ON CONFLICT (user_id) DO NOTHING;

-- STEP 6: Enable Realtime for Notifications Table
-- ============================================================================

-- Enable replication for realtime
ALTER TABLE public.notifications REPLICA IDENTITY FULL;

-- STEP 7: Grant Permissions
-- ============================================================================

GRANT ALL ON public.notifications TO authenticated;
GRANT ALL ON public.notification_preferences TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_notification(UUID, TEXT, TEXT, TEXT, UUID, JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION public.mark_notification_read(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.mark_all_notifications_read(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_unread_notification_count(UUID) TO authenticated;

-- ============================================================================
-- Migration Complete
-- ============================================================================

COMMENT ON TABLE public.notifications IS 'Comprehensive notification system for all user types';
COMMENT ON TABLE public.notification_preferences IS 'User notification preferences and settings';
COMMENT ON FUNCTION public.create_notification IS 'Creates a new notification for a user';
COMMENT ON FUNCTION public.mark_notification_read IS 'Marks a single notification as read';
COMMENT ON FUNCTION public.mark_all_notifications_read IS 'Marks all notifications as read for a user';
COMMENT ON FUNCTION public.get_unread_notification_count IS 'Returns count of unread notifications for a user';
