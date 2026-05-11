-- Add missing columns to notification_preferences table

-- Check if column exists before adding
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'notification_preferences' 
    AND column_name = 'push_notifications'
  ) THEN
    ALTER TABLE public.notification_preferences 
    ADD COLUMN push_notifications BOOLEAN DEFAULT TRUE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'notification_preferences' 
    AND column_name = 'push_booking_created'
  ) THEN
    ALTER TABLE public.notification_preferences 
    ADD COLUMN push_booking_created BOOLEAN DEFAULT TRUE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'notification_preferences' 
    AND column_name = 'push_booking_confirmed'
  ) THEN
    ALTER TABLE public.notification_preferences 
    ADD COLUMN push_booking_confirmed BOOLEAN DEFAULT TRUE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'notification_preferences' 
    AND column_name = 'push_booking_assigned'
  ) THEN
    ALTER TABLE public.notification_preferences 
    ADD COLUMN push_booking_assigned BOOLEAN DEFAULT TRUE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'notification_preferences' 
    AND column_name = 'push_booking_completed'
  ) THEN
    ALTER TABLE public.notification_preferences 
    ADD COLUMN push_booking_completed BOOLEAN DEFAULT TRUE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'notification_preferences' 
    AND column_name = 'push_booking_cancelled'
  ) THEN
    ALTER TABLE public.notification_preferences 
    ADD COLUMN push_booking_cancelled BOOLEAN DEFAULT TRUE;
  END IF;

  RAISE NOTICE 'Notification preferences columns added successfully';
END $$;