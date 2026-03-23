-- Find all policies that reference user_roles table
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE schemaname = 'public'
  AND (qual::text LIKE '%user_roles%' OR with_check::text LIKE '%user_roles%');
