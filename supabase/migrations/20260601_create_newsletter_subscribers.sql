-- Migration: Create newsletter_subscribers table with RLS
-- Date: 2026-06-01
-- Description: Creates newsletter_subscribers table and adds RLS policies

-- Create newsletter_subscribers table if not exists
CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  email text NOT NULL UNIQUE,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert (subscribe to newsletter)
CREATE POLICY "Allow anonymous newsletter inserts" 
ON public.newsletter_subscribers 
FOR INSERT 
WITH CHECK (true);

-- Allow authenticated users to read subscribers (for admin)
CREATE POLICY "Allow authenticated read subscribers" 
ON public.newsletter_subscribers 
FOR SELECT 
USING (auth.role() = 'authenticated');

-- Allow authenticated users to delete subscribers (for admin)
CREATE POLICY "Allow authenticated delete subscribers" 
ON public.newsletter_subscribers 
FOR DELETE 
USING (auth.role() = 'authenticated');

-- Add index for faster email lookups
CREATE INDEX IF NOT EXISTS idx_newsletter_email 
ON public.newsletter_subscribers(email);
