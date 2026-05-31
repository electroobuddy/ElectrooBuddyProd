-- Migration: Add email column to profiles table
-- Date: 2026-06-01
-- Description: Adds email column to profiles and backfills from auth.users

-- Add email column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS email text;

-- Backfill email from auth.users for existing profiles
UPDATE public.profiles p
SET email = au.email
FROM auth.users au
WHERE p.user_id = au.id AND p.email IS NULL;

-- Add index for faster email lookups
CREATE INDEX IF NOT EXISTS idx_profiles_email 
ON public.profiles(email);

-- Create a unique index to prevent duplicate emails
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_email_unique 
ON public.profiles(email) 
WHERE email IS NOT NULL;
