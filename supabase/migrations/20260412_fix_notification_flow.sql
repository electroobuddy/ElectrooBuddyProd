-- ============================================================================
-- Fix Notification Flow - Database Changes
-- Date: 2026-04-12
-- Purpose: Fix RLS issues, enable Realtime, and support guest bookings
-- ============================================================================

-- STEP 1: Fix Bookings Table RLS Issue
-- ============================================================================

-- Make email column nullable to support guest bookings
ALTER TABLE public.bookings 
ALTER COLUMN email DROP NOT NULL;

-- Add trigger to ensure empty strings are treated as NULL
CREATE OR REPLACE FUNCTION public.sanitize_booking_email()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.email = '' OR TRIM(NEW.email) = '' THEN
    NEW.email := NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS tr_sanitize_booking_email ON public.bookings;

CREATE TRIGGER tr_sanitize_booking_email
  BEFORE INSERT OR UPDATE ON public.bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.sanitize_booking_email();

-- STEP 2: Verify and Enable Real-time for Notifications Table
-- ============================================================================

-- Ensure notifications table has REPLICA IDENTITY FULL
ALTER TABLE public.notifications REPLICA IDENTITY FULL;

-- Enable Realtime publication for notifications table
DO $$
BEGIN
  -- Add to existing supabase_realtime publication if not already there
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND tablename = 'notifications'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
  END IF;
END $$;

-- STEP 3: Verify Indexes Exist
-- ============================================================================

-- Ensure we have proper indexes for notification queries
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON public.notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_booking_id ON public.notifications(booking_id);

-- STEP 4: Verify RLS Policies
-- ============================================================================

-- Ensure RLS policies are correct for notifications table
DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Service role can manage all notifications" ON public.notifications;

CREATE POLICY "Users can view own notifications"
  ON public.notifications FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can update own notifications"
  ON public.notifications FOR UPDATE TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Service role can manage all notifications"
  ON public.notifications FOR ALL TO service_role
  USING (true);

-- ============================================================================
-- Migration Complete
-- ============================================================================

COMMENT ON COLUMN public.bookings.email IS 'Made nullable to support guest bookings';
COMMENT ON TRIGGER tr_sanitize_booking_email ON public.bookings IS 'Converts empty email strings to NULL';
