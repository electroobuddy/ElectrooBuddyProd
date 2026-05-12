-- Fix push_subscriptions RLS policies for OneSignal

-- Drop existing policies
DROP POLICY IF EXISTS "Users can manage own push subscriptions" ON public.push_subscriptions;
DROP POLICY IF EXISTS "Users can insert own push subscriptions" ON public.push_subscriptions;
DROP POLICY IF EXISTS "Users can update own push subscriptions" ON public.push_subscriptions;
DROP POLICY IF EXISTS "Users can view own push subscriptions" ON public.push_subscriptions;
DROP POLICY IF EXISTS "Service role can manage all push subscriptions" ON public.push_subscriptions;

-- Enable RLS if not enabled
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Create a simpler policy: anyone authenticated can insert/update/delete their own
CREATE POLICY "push_subscriptions_all" ON public.push_subscriptions
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Service role can do anything
CREATE POLICY "push_subscriptions_service" ON public.push_subscriptions
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Verify the policies
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
WHERE tablename = 'push_subscriptions';

-- Check if table has data
SELECT COUNT(*) as total_subscriptions, 
       COUNT(*) FILTER (WHERE subscription_type = 'onesignal') as onesignal_count,
       COUNT(*) FILTER (WHERE is_active = true) as active_count
FROM public.push_subscriptions;