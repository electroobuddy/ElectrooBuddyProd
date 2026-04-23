-- ============================================================================
-- Fix Push Subscriptions Schema
-- Date: 2026-04-18
-- Purpose: Add endpoint column and unique constraint to support upsert
-- ============================================================================

-- STEP 1: Add endpoint column if it doesn't exist
-- We use this as a unique identifier for each browser/device subscription
ALTER TABLE public.push_subscriptions 
ADD COLUMN IF NOT EXISTS endpoint TEXT;

-- STEP 2: Update existing rows (optional, but good for data integrity)
-- If there are already subscriptions, we try to extract the endpoint from the JSON
DO $$
BEGIN
    UPDATE public.push_subscriptions
    SET endpoint = subscription->>'endpoint'
    WHERE endpoint IS NULL;
EXCEPTION WHEN OTHERS THEN
    -- Ignore errors if subscription JSON format is invalid for some old rows
END $$;

-- STEP 3: Make endpoint NOT NULL after filling existing data
-- Note: If there's no data, this is safe. If there's invalid data, we'll keep it nullable for now
-- but add a comment.

-- STEP 4: Add Unique Constraint to enable 'onConflict' targeting
-- We want a unique subscription per device (endpoint)
-- Sometimes a user might log out and another log in on same device, 
-- or same user logs in again. We want to update the user_id if needed.
ALTER TABLE public.push_subscriptions 
DROP CONSTRAINT IF EXISTS push_subscriptions_endpoint_key;

ALTER TABLE public.push_subscriptions 
ADD CONSTRAINT push_subscriptions_endpoint_key UNIQUE (endpoint);

-- STEP 5: Add Comment
COMMENT ON COLUMN public.push_subscriptions.endpoint IS 'The unique push service endpoint for this subscription';
