-- Migration: Add subscription_type column to push_subscriptions
-- Date: 2026-06-01
-- Description: Adds subscription_type column to distinguish between FCM and OneSignal subscriptions

-- Add subscription_type column to push_subscriptions table
ALTER TABLE public.push_subscriptions 
ADD COLUMN IF NOT EXISTS subscription_type text DEFAULT 'fcm';

-- Update existing records to have proper subscription_type
UPDATE public.push_subscriptions 
SET subscription_type = 'fcm' 
WHERE subscription_type IS NULL;

-- Add index for faster queries on subscription_type
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_type 
ON public.push_subscriptions(subscription_type);

-- Add composite index for user_id + subscription_type queries
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user_type 
ON public.push_subscriptions(user_id, subscription_type);
