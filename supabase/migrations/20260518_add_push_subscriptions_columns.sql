-- Add missing columns to push_subscriptions table

-- Add is_active column if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'push_subscriptions' AND column_name = 'is_active'
  ) THEN
    ALTER TABLE public.push_subscriptions ADD COLUMN is_active BOOLEAN DEFAULT true;
  END IF;
END $$;

-- Add subscription_type column if not exists  
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'push_subscriptions' AND column_name = 'subscription_type'
  ) THEN
    ALTER TABLE public.push_subscriptions ADD COLUMN subscription_type TEXT DEFAULT 'fcm';
  END IF;
END $$;

-- Add fcm_token column if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'push_subscriptions' AND column_name = 'fcm_token'
  ) THEN
    ALTER TABLE public.push_subscriptions ADD COLUMN fcm_token TEXT;
  END IF;
END $$;

-- Add browser column if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'push_subscriptions' AND column_name = 'browser'
  ) THEN
    ALTER TABLE public.push_subscriptions ADD COLUMN browser TEXT;
  END IF;
END $$;

-- Add device_type column if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'push_subscriptions' AND column_name = 'device_type'
  ) THEN
    ALTER TABLE public.push_subscriptions ADD COLUMN device_type TEXT;
  END IF;
END $$;

-- Add created_at column if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'push_subscriptions' AND column_name = 'created_at'
  ) THEN
    ALTER TABLE public.push_subscriptions ADD COLUMN created_at TIMESTAMPTZ DEFAULT NOW();
  END IF;
END $$;

-- Add updated_at column if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'push_subscriptions' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE public.push_subscriptions ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
  END IF;
END $$;

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user_id ON public.push_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_active ON public.push_subscriptions(is_active);
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_type ON public.push_subscriptions(subscription_type);
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_fcm_token ON public.push_subscriptions(fcm_token);

-- Update existing rows to have default values
UPDATE public.push_subscriptions SET is_active = true WHERE is_active IS NULL;
UPDATE public.push_subscriptions SET subscription_type = 'fcm' WHERE subscription_type IS NULL;

-- Add comments
COMMENT ON COLUMN public.push_subscriptions.is_active IS 'Whether this subscription is active';
COMMENT ON COLUMN public.push_subscriptions.subscription_type IS 'Type of subscription: fcm, onesignal';
COMMENT ON COLUMN public.push_subscriptions.fcm_token IS 'Firebase Cloud Messaging token';
COMMENT ON COLUMN public.push_subscriptions.browser IS 'Browser name: chrome, firefox, safari, edge';
COMMENT ON COLUMN public.push_subscriptions.device_type IS 'Device type: desktop, mobile, tablet';

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.push_subscriptions TO authenticated;
GRANT SELECT ON public.push_subscriptions TO anon;
GRANT ALL ON public.push_subscriptions TO service_role;

-- Update RLS policy if exists
DO $$
DECLARE
  pol_exists boolean;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Users can manage own push subscriptions'
  ) INTO pol_exists;
  
  IF pol_exists THEN
    ALTER POLICY "Users can manage own push subscriptions" ON public.push_subscriptions
      USING (auth.uid() = user_id);
  END IF;
END $$;

-- Insert sample data for admin if table is empty
DO $$
DECLARE
  cnt integer;
BEGIN
  SELECT COUNT(*) INTO cnt FROM public.push_subscriptions WHERE user_id = '78a311b1-168c-4676-b1c1-c6445fefd201';
  
  IF cnt = 0 THEN
    INSERT INTO public.push_subscriptions (user_id, endpoint, fcm_token, subscription_type, is_active, browser, device_type)
    VALUES 
      ('78a311b1-168c-4676-b1c1-c6445fefd201', 'ecuntE925iEzDbm_z0dCYE:APA91bFC7fpPwhBV9jSMd3tJXkCtXYFEQfCWLfCLHw0woZqHM6JyX4E-KnL01usrWyWoB4-Y-UiZoQ1ElAUY9eXH76KyrOXkpjChsnem8IDFsUEbJuuHvlk', 'ecuntE925iEzDbm_z0dCYE:APA91bFC7fpPwhBV9jSMd3tJXkCtXYFEQfCWLfCLHw0woZqHM6JyX4E-KnL01usrWyWoB4-Y-UiZoQ1ElAUY9eXH76KyrOXkpjChsnem8IDFsUEbJuuHvlk', 'fcm', true, 'chrome', 'desktop'),
      ('78a311b1-168c-4676-b1c1-c6445fefd201', 'eAnPfTChhdfD3PB62VPT09:APA91bF8rBN6ETi3q13c3ewZRvzX8_FVVAoZjQkhwpF8ouG0HBe_qn7gqyR2UAENVzF1BsvtIj5CtPlN5FITXE3gJk4vi7jN7yODT88e_nZYFNSfKp01-0s', 'eAnPfTChhdfD3PB62VPT09:APA91bF8rBN6ETi3q13c3ewZRvzX8_FVVAoZjQkhwpF8ouG0HBe_qn7gqyR2UAENVzF1BsvtIj5CtPlN5FITXE3gJk4vi7jN7yODT88e_nZYFNSfKp01-0s', 'fcm', true, 'chrome', 'mobile');
  END IF;
END $$;