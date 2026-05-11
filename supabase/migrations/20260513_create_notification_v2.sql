-- =============================================================================
-- Create notification_v2 RPC function (bypasses RLS)
-- Allows any authenticated user to create notifications for any user
-- =============================================================================

CREATE OR REPLACE FUNCTION public.create_notification_v2(
  p_user_id UUID,
  p_type TEXT,
  p_title TEXT,
  p_message TEXT,
  p_booking_id UUID DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_notification_id UUID;
BEGIN
  INSERT INTO public.notifications (
    user_id,
    type,
    title,
    message,
    booking_id,
    metadata,
    is_read,
    created_at,
    updated_at
  ) VALUES (
    p_user_id,
    p_type,
    p_title,
    p_message,
    p_booking_id,
    p_metadata,
    false,
    NOW(),
    NOW()
  )
  RETURNING notifications.id INTO v_notification_id;
  
  RETURN v_notification_id;
END;
$$;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION public.create_notification_v2 TO authenticated;

COMMENT ON FUNCTION public.create_notification_v2 IS 'Create a notification for any user (bypasses RLS for admin notifications)';

-- =============================================================================
-- DONE!
-- =============================================================================
