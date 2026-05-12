-- Notification Management RPC Functions
-- These functions handle notification creation, marking as read, and admin user management

-- Function to create notifications (bypasses RLS)
CREATE OR REPLACE FUNCTION public.create_notification_v2(
  p_user_id UUID,
  p_type TEXT,
  p_title TEXT,
  p_message TEXT,
  p_booking_id UUID DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
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
    NOW()
  );
  
  -- Log for debugging
  RAISE LOG '[RPC] Created notification: user_id=%, type=%, title=%', 
    p_user_id, p_type, p_title;
END;
$$;

-- Function to get admin user IDs
CREATE OR REPLACE FUNCTION public.get_admin_users()
RETURNS TABLE(user_id UUID)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT ur.user_id::UUID
  FROM public.user_roles ur
  WHERE ur.role = 'admin';
END;
$$;

-- Function to mark a single notification as read
CREATE OR REPLACE FUNCTION public.mark_notification_read(
  p_notification_id UUID,
  p_user_id UUID
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.notifications 
  SET 
    is_read = true,
    read_at = NOW()
  WHERE 
    id = p_notification_id 
    AND user_id = p_user_id;
    
  -- Log for debugging
  RAISE LOG '[RPC] Marked notification as read: id=%, user_id=%', 
    p_notification_id, p_user_id;
END;
$$;

-- Function to mark all notifications as read for a user
CREATE OR REPLACE FUNCTION public.mark_all_notifications_read(
  p_user_id UUID
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  marked_count INTEGER;
BEGIN
  UPDATE public.notifications 
  SET 
    is_read = true,
    read_at = NOW()
  WHERE 
    user_id = p_user_id 
    AND is_read = false;
    
  GET DIAGNOSTICS marked_count = ROW_COUNT;
  
  -- Log for debugging
  RAISE LOG '[RPC] Marked % notifications as read for user: %', 
    marked_count, p_user_id;
    
  RETURN marked_count;
END;
$$;

-- Function to register/update push subscription
CREATE OR REPLACE FUNCTION public.register_push_subscription(
  p_user_id TEXT,
  p_endpoint TEXT,
  p_subscription_type TEXT DEFAULT 'onesignal',
  p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.push_subscriptions (
    user_id,
    endpoint,
    subscription_type,
    subscription,
    is_active,
    created_at,
    updated_at
  ) VALUES (
    p_user_id,
    p_endpoint,
    p_subscription_type,
    p_metadata,
    true,
    NOW(),
    NOW()
  )
  ON CONFLICT (endpoint)
  DO UPDATE SET
    user_id = EXCLUDED.user_id,
    subscription_type = EXCLUDED.subscription_type,
    subscription = EXCLUDED.subscription,
    is_active = true,
    updated_at = NOW();
    
  -- Log for debugging
  RAISE LOG '[RPC] Registered push subscription: user_id=%, endpoint=%', 
    p_user_id, LEFT(p_endpoint, 50) || '...';
    
  RETURN true;
END;
$$;

-- Function to deactivate push subscription
CREATE OR REPLACE FUNCTION public.deactivate_push_subscription(
  p_endpoint TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.push_subscriptions 
  SET 
    is_active = false,
    updated_at = NOW()
  WHERE 
    endpoint = p_endpoint;
    
  -- Log for debugging
  RAISE LOG '[RPC] Deactivated push subscription: endpoint=%', 
    LEFT(p_endpoint, 50) || '...';
    
  RETURN true;
END;
$$;

-- Function to get active push subscriptions for users
CREATE OR REPLACE FUNCTION public.get_active_push_subscriptions(
  p_user_ids TEXT[]
)
RETURNS TABLE(
  user_id TEXT,
  endpoint TEXT,
  subscription_type TEXT,
  is_active BOOLEAN,
  updated_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ps.user_id,
    ps.endpoint,
    ps.subscription_type,
    ps.is_active,
    ps.updated_at
  FROM public.push_subscriptions ps
  WHERE 
    ps.user_id = ANY(p_user_ids)
    AND ps.is_active = true
    AND ps.subscription_type = 'onesignal'
  ORDER BY ps.updated_at DESC;
END;
$$;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION public.create_notification_v2 TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.get_admin_users TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.mark_notification_read TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.mark_all_notifications_read TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.register_push_subscription TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.deactivate_push_subscription TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.get_active_push_subscriptions TO authenticated, service_role;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user_id_active 
ON public.push_subscriptions(user_id, is_active) 
WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_push_subscriptions_endpoint 
ON public.push_subscriptions(endpoint);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id_created_at 
ON public.notifications(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_notifications_type_created_at 
ON public.notifications(type, created_at DESC);
