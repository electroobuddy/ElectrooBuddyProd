-- Function to get all admin user IDs
-- Returns table of user_id for users with admin role

CREATE OR REPLACE FUNCTION public.get_admin_users()
RETURNS TABLE(user_id UUID)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Get users with admin role from user_roles table
  RETURN QUERY
  SELECT ur.user_id
  FROM public.user_roles ur
  WHERE ur.role = 'admin' AND ur.is_active = true
  UNION
  -- Also get from auth.users where email matches admin pattern
  SELECT au.id
  FROM auth.users au
  WHERE au.email LIKE '%admin%' OR au.email LIKE '%electrobuddy%'
  LIMIT 10;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_admin_users() TO authenticated;