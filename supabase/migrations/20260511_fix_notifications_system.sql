-- ============================================
-- FIX NOTIFICATIONS SYSTEM
-- ============================================
-- Purpose: Create missing notifications table and RPC function
-- Created: May 11, 2026
-- ============================================

-- Create notifications table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL DEFAULT 'info',
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON public.notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read);

-- Create notification preferences table
CREATE TABLE IF NOT EXISTS public.notification_preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  in_app_notifications BOOLEAN DEFAULT true,
  push_notifications BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Drop existing functions if they exist (to avoid return type conflicts)
DROP FUNCTION IF EXISTS create_notification(uuid,text,text,text,uuid,jsonb);
DROP FUNCTION IF EXISTS mark_notification_read(uuid,uuid);
DROP FUNCTION IF EXISTS mark_notifications_read(uuid[],uuid);

-- Create RPC function for creating notifications
CREATE OR REPLACE FUNCTION create_notification(
  p_user_id UUID,
  p_type TEXT,
  p_title TEXT,
  p_message TEXT,
  p_booking_id UUID DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'
)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  type TEXT,
  title TEXT,
  message TEXT,
  is_read BOOLEAN,
  booking_id UUID,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_notification_id UUID;
BEGIN
  -- Insert notification
  INSERT INTO public.notifications (
    user_id,
    type,
    title,
    message,
    booking_id,
    metadata,
    created_at
  ) VALUES (
    p_user_id,
    p_type,
    p_title,
    p_message,
    p_booking_id,
    p_metadata,
    now()
  ) RETURNING id INTO v_notification_id;
  
  -- Return the created notification
  RETURN QUERY
  SELECT 
    n.id,
    n.user_id,
    n.type,
    n.title,
    n.message,
    n.is_read,
    n.booking_id,
    n.metadata,
    n.created_at
  FROM public.notifications n
  WHERE n.id = v_notification_id;
END;
$$;

-- Create RPC function for marking notifications as read
CREATE OR REPLACE FUNCTION mark_notification_read(
  p_notification_id UUID,
  p_user_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.notifications 
  SET is_read = true, updated_at = now()
  WHERE id = p_notification_id 
  AND user_id = p_user_id;
  
  RETURN FOUND;
END;
$$;

-- Create RPC function for bulk marking notifications as read
CREATE OR REPLACE FUNCTION mark_notifications_read(
  p_notification_ids UUID[],
  p_user_id UUID
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_count INTEGER := 0;
BEGIN
  UPDATE public.notifications 
  SET is_read = true, updated_at = now()
  WHERE id = ANY(p_notification_ids) 
  AND user_id = p_user_id;
  
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$;

-- Enable RLS on notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for notifications
CREATE POLICY "Users can view their own notifications" ON public.notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own notifications" ON public.notifications
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" ON public.notifications
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all notifications" ON public.notifications
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role = 'admin'
    )
  );

-- Enable RLS on notification preferences
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for notification preferences
CREATE POLICY "Users can manage their own preferences" ON public.notification_preferences
  FOR ALL USING (auth.uid() = user_id);

-- Grant permissions to authenticated users
GRANT SELECT, INSERT, UPDATE ON public.notifications TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notification_preferences TO authenticated;

-- Grant execute permissions on RPC functions
GRANT EXECUTE ON FUNCTION create_notification TO authenticated;
GRANT EXECUTE ON FUNCTION mark_notification_read TO authenticated;
GRANT EXECUTE ON FUNCTION mark_notifications_read TO authenticated;

-- Add helpful comments
COMMENT ON TABLE public.notifications IS 'Stores in-app and push notifications for users';
COMMENT ON TABLE public.notification_preferences IS 'User notification preferences for in-app and push notifications';
COMMENT ON FUNCTION create_notification IS 'Creates a new notification and returns the created record';
COMMENT ON FUNCTION mark_notification_read IS 'Marks a notification as read for a user';
COMMENT ON FUNCTION mark_notifications_read IS 'Marks multiple notifications as read for a user';
