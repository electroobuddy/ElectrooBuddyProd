-- =============================================================================
-- Complete Notification System Migration
-- Run this in Supabase SQL Editor to set up the full notification infrastructure
-- =============================================================================

-- =============================================================================
-- 1. DROP OLD TABLES (if they exist with issues)
-- =============================================================================
DROP TABLE IF EXISTS public.push_subscriptions CASCADE;
DROP TABLE IF EXISTS public.notification_logs CASCADE;

-- =============================================================================
-- 2. NOTIFICATIONS TABLE (Main table for all notifications)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Notification content
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50) NOT NULL DEFAULT 'general',
  
  -- Related entities (optional)
  booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE,
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  
  -- Status tracking
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  read_at TIMESTAMP WITH TIME ZONE,
  is_pushed BOOLEAN NOT NULL DEFAULT FALSE,
  pushed_at TIMESTAMP WITH TIME ZONE,
  
  -- Metadata for flexible data
  metadata JSONB DEFAULT '{}',
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  
  -- Index for performance
  CONSTRAINT valid_type CHECK (type IN (
    'general', 'new_booking', 'booking_update', 'technician_assigned',
    'order_status', 'payment_received', 'reminder', 'promotion',
    'system', 'welcome', 'offer'
  ))
);

-- Indexes for notifications table
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON public.notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON public.notifications(user_id, is_read, created_at DESC);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can delete own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Admins can manage all notifications" ON public.notifications;

CREATE POLICY "Users can view own notifications"
  ON public.notifications
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
  ON public.notifications
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own notifications"
  ON public.notifications
  FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all notifications"
  ON public.notifications
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- =============================================================================
-- 3. NOTIFICATION PREFERENCES TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Channel toggles
  in_app_notifications BOOLEAN NOT NULL DEFAULT TRUE,
  push_notifications BOOLEAN NOT NULL DEFAULT TRUE,
  email_notifications BOOLEAN NOT NULL DEFAULT FALSE,
  sms_notifications BOOLEAN NOT NULL DEFAULT FALSE,
  
  -- Type-specific preferences (JSONB for flexibility)
  type_preferences JSONB DEFAULT '{
    "new_booking": { "push": true, "email": false, "sms": false },
    "booking_update": { "push": true, "email": true, "sms": false },
    "technician_assigned": { "push": true, "email": false, "sms": true },
    "order_status": { "push": true, "email": true, "sms": false },
    "payment_received": { "push": true, "email": true, "sms": false },
    "promotion": { "push": true, "email": false, "sms": false },
    "system": { "push": true, "email": true, "sms": false }
  }',
  
  -- Quiet hours
  quiet_hours_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  quiet_hours_start TIME DEFAULT '22:00',
  quiet_hours_end TIME DEFAULT '08:00',
  quiet_hours_timezone TEXT DEFAULT 'Asia/Kolkata',
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_notification_preferences_user_id ON public.notification_preferences(user_id);

-- Enable RLS
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Users can view own preferences" ON public.notification_preferences;
DROP POLICY IF EXISTS "Users can manage own preferences" ON public.notification_preferences;

CREATE POLICY "Users can view own preferences"
  ON public.notification_preferences
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own preferences"
  ON public.notification_preferences
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- =============================================================================
-- 4. PUSH SUBSCRIPTIONS TABLE (Web Push)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Web Push subscription data
  endpoint TEXT NOT NULL,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  
  -- Browser/Device info
  user_agent TEXT,
  device_type VARCHAR(50), -- 'desktop', 'mobile', 'tablet'
  browser VARCHAR(50), -- 'chrome', 'firefox', 'safari', 'edge'
  
  -- Status
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  last_used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  failure_count INTEGER NOT NULL DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  
  -- Unique constraint per endpoint
  CONSTRAINT unique_endpoint UNIQUE (endpoint)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user_id ON public.push_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_active ON public.push_subscriptions(is_active);

-- Enable RLS
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Users can manage own push subscriptions" ON public.push_subscriptions;

CREATE POLICY "Users can manage own push subscriptions"
  ON public.push_subscriptions
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- =============================================================================
-- 5. NOTIFICATION LOGS TABLE (For debugging/monitoring)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.notification_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  notification_id UUID REFERENCES public.notifications(id) ON DELETE SET NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Action details
  action VARCHAR(50) NOT NULL, -- 'created', 'pushed', 'read', 'failed'
  channel VARCHAR(50), -- 'in_app', 'push', 'email', 'sms'
  error_message TEXT,
  metadata JSONB DEFAULT '{}',
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_notification_logs_notification_id ON public.notification_logs(notification_id);
CREATE INDEX IF NOT EXISTS idx_notification_logs_user_id ON public.notification_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_logs_created_at ON public.notification_logs(created_at DESC);

-- Enable RLS
ALTER TABLE public.notification_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can view logs
DROP POLICY IF EXISTS "Admins can view logs" ON public.notification_logs;

CREATE POLICY "Admins can view logs"
  ON public.notification_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- =============================================================================
-- 6. DATABASE FUNCTIONS
-- =============================================================================

-- Function: Create notification with automatic push
DROP FUNCTION IF EXISTS public.create_notification_with_push(UUID, VARCHAR, VARCHAR, TEXT, UUID, UUID, JSONB);
CREATE OR REPLACE FUNCTION public.create_notification_with_push(
  p_user_id UUID,
  p_type VARCHAR(50),
  p_title VARCHAR(255),
  p_message TEXT,
  p_booking_id UUID DEFAULT NULL,
  p_order_id UUID DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_notification_id UUID;
  v_should_push BOOLEAN;
  v_in_quiet_hours BOOLEAN;
  v_current_time TIME;
  v_quiet_start TIME;
  v_quiet_end TIME;
  v_quiet_enabled BOOLEAN;
BEGIN
  -- Check user preferences
  SELECT 
    COALESCE(push_notifications, TRUE),
    COALESCE(quiet_hours_enabled, FALSE),
    COALESCE(quiet_hours_start, '22:00'::TIME),
    COALESCE(quiet_hours_end, '08:00'::TIME)
  INTO v_should_push, v_quiet_enabled, v_quiet_start, v_quiet_end
  FROM public.notification_preferences
  WHERE user_id = p_user_id;
  
  -- Default to true if no preferences found
  IF v_should_push IS NULL THEN
    v_should_push := TRUE;
  END IF;
  
  -- Check quiet hours
  IF v_quiet_enabled THEN
    v_current_time := CURRENT_TIME;
    IF v_quiet_start < v_quiet_end THEN
      v_in_quiet_hours := v_current_time >= v_quiet_start AND v_current_time < v_quiet_end;
    ELSE
      v_in_quiet_hours := v_current_time >= v_quiet_start OR v_current_time < v_quiet_end;
    END IF;
  ELSE
    v_in_quiet_hours := FALSE;
  END IF;
  
  -- Create notification
  INSERT INTO public.notifications (
    user_id, type, title, message,
    booking_id, order_id, metadata,
    is_pushed, pushed_at
  ) VALUES (
    p_user_id, p_type, p_title, p_message,
    p_booking_id, p_order_id, p_metadata,
    FALSE, NULL
  )
  RETURNING id INTO v_notification_id;
  
  -- Log creation
  INSERT INTO public.notification_logs (
    notification_id, user_id, action, channel, metadata
  ) VALUES (
    v_notification_id, p_user_id, 'created', 'in_app',
    jsonb_build_object('should_push', v_should_push, 'quiet_hours', v_in_quiet_hours)
  );
  
  -- Note: Actual push sending happens via Edge Function to avoid blocking
  
  RETURN v_notification_id;
END;
$$;

-- Function: Mark notification as read
DROP FUNCTION IF EXISTS public.mark_notification_read(UUID, UUID);
CREATE OR REPLACE FUNCTION public.mark_notification_read(
  p_notification_id UUID,
  p_user_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.notifications
  SET is_read = TRUE, read_at = NOW()
  WHERE id = p_notification_id AND user_id = p_user_id AND is_read = FALSE;
  
  IF FOUND THEN
    INSERT INTO public.notification_logs (
      notification_id, user_id, action, channel
    ) VALUES (
      p_notification_id, p_user_id, 'read', 'in_app'
    );
    RETURN TRUE;
  END IF;
  
  RETURN FALSE;
END;
$$;

-- Function: Mark all notifications as read
DROP FUNCTION IF EXISTS public.mark_all_notifications_read(UUID);
CREATE OR REPLACE FUNCTION public.mark_all_notifications_read(
  p_user_id UUID
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_count INTEGER;
BEGIN
  UPDATE public.notifications
  SET is_read = TRUE, read_at = NOW()
  WHERE user_id = p_user_id AND is_read = FALSE;
  
  GET DIAGNOSTICS v_count = ROW_COUNT;
  
  IF v_count > 0 THEN
    INSERT INTO public.notification_logs (
      notification_id, user_id, action, channel, metadata
    ) VALUES (
      NULL, p_user_id, 'read_all', 'in_app',
      jsonb_build_object('count', v_count)
    );
  END IF;
  
  RETURN v_count;
END;
$$;

-- Function: Get unread count
DROP FUNCTION IF EXISTS public.get_unread_notification_count(UUID);
CREATE OR REPLACE FUNCTION public.get_unread_notification_count(
  p_user_id UUID
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_count
  FROM public.notifications
  WHERE user_id = p_user_id AND is_read = FALSE;
  
  RETURN v_count;
END;
$$;

-- Function: Clean up old notifications
DROP FUNCTION IF EXISTS public.cleanup_old_notifications(INTEGER);
CREATE OR REPLACE FUNCTION public.cleanup_old_notifications(
  p_days INTEGER DEFAULT 90
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_count INTEGER;
BEGIN
  DELETE FROM public.notifications
  WHERE is_read = TRUE
  AND created_at < NOW() - INTERVAL '1 day' * p_days;
  
  GET DIAGNOSTICS v_count = ROW_COUNT;
  
  RETURN v_count;
END;
$$;

-- =============================================================================
-- 7. TRIGGERS
-- =============================================================================

-- Auto-update updated_at
-- Note: This function already exists and is used by many triggers
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Notifications table
DROP TRIGGER IF EXISTS update_notifications_updated_at ON public.notifications;
CREATE TRIGGER update_notifications_updated_at
  BEFORE UPDATE ON public.notifications
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Notification preferences table
DROP TRIGGER IF EXISTS update_notification_preferences_updated_at ON public.notification_preferences;
CREATE TRIGGER update_notification_preferences_updated_at
  BEFORE UPDATE ON public.notification_preferences
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Push subscriptions table
DROP TRIGGER IF EXISTS update_push_subscriptions_updated_at ON public.push_subscriptions;
CREATE TRIGGER update_push_subscriptions_updated_at
  BEFORE UPDATE ON public.push_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================================================
-- 8. DEFAULT PREFERENCES ON USER CREATION
-- =============================================================================
DROP FUNCTION IF EXISTS public.create_default_notification_preferences();
CREATE OR REPLACE FUNCTION public.create_default_notification_preferences()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.notification_preferences (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- Create preferences for new users
DROP TRIGGER IF EXISTS create_user_notification_preferences ON auth.users;
CREATE TRIGGER create_user_notification_preferences
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.create_default_notification_preferences();

-- =============================================================================
-- 9. REALTIME SETUP
-- =============================================================================
-- Enable Realtime for notifications table
-- Note: This is done via Supabase Dashboard or API, not SQL
-- The table should be added to Realtime publications via:
-- Dashboard → Database → Replication → Add table: notifications

-- Alternative: Use pgsodium if available (for newer Supabase versions)
DO $$
BEGIN
  -- Try to enable realtime via pgsodium if available
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'pgsodium_masks') THEN
    -- Newer Supabase versions use pgsodium for Realtime
    PERFORM pgsodium.create_mask('public', 'notifications');
  END IF;
EXCEPTION WHEN OTHERS THEN
  -- If pgsodium is not available, Realtime must be enabled via Dashboard
  RAISE NOTICE 'Realtime must be enabled via Supabase Dashboard for notifications table';
END $$;

-- =============================================================================
-- 10. SEED ADMIN NOTIFICATIONS (Optional)
-- =============================================================================
-- This would send a welcome notification to all users (run manually if needed)
-- INSERT INTO public.notifications (user_id, type, title, message, metadata)
-- SELECT 
--   id,
--   'welcome',
--   'Welcome to ElectrooBuddy!',
--   'Thanks for joining. You\'ll receive updates about your bookings here.',
--   '{}'
-- FROM auth.users
-- WHERE NOT EXISTS (
--   SELECT 1 FROM public.notifications 
--   WHERE user_id = auth.users.id AND type = 'welcome'
-- );

-- =============================================================================
-- DONE! 
-- =============================================================================
-- To verify: SELECT * FROM information_schema.tables WHERE table_schema = 'public' AND table_name LIKE '%notification%';
