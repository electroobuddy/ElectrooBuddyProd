-- =============================================================================
-- Add RPC function to get admin users (bypasses RLS)
-- =============================================================================

CREATE OR REPLACE FUNCTION public.get_admin_users()
RETURNS TABLE (user_id UUID)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT ur.user_id
  FROM public.user_roles ur
  WHERE ur.role = 'admin'
  AND ur.user_id IN (
    SELECT id FROM auth.users WHERE email_confirmed_at IS NOT NULL
  );
END;
$$;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION public.get_admin_users TO authenticated;

COMMENT ON FUNCTION public.get_admin_users IS 'Get all admin user IDs (bypasses RLS for notifications)';
