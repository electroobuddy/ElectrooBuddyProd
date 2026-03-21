-- Run this SQL in your Supabase SQL Editor at:
-- https://skfpcuiwrcmeiyhvuniv.supabase.co/project/_/sql

-- Add missing columns to bookings table for enhanced booking forms

-- Add email column (nullable first to handle existing data)
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS email TEXT;

-- Update existing bookings with a placeholder email if needed
UPDATE public.bookings SET email = CONCAT('user_', id::text, '@placeholder.com') WHERE email IS NULL;

-- Now make email NOT NULL
ALTER TABLE public.bookings ALTER COLUMN email SET NOT NULL;

-- Add exact_location column for precise location details
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS exact_location TEXT;

-- Add custom_service_demand column for custom service requests
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS custom_service_demand TEXT;

-- Add fan installation specific fields
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS is_switch_working TEXT;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS has_old_fan TEXT;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS is_electricity_supply_on TEXT;

-- Add comment explaining these fields
COMMENT ON COLUMN public.bookings.exact_location IS 'Detailed location or landmark for service';
COMMENT ON COLUMN public.bookings.custom_service_demand IS 'Custom service requirement description';
COMMENT ON COLUMN public.bookings.is_switch_working IS 'Fan installation: Is switch working (yes/no)';
COMMENT ON COLUMN public.bookings.has_old_fan IS 'Fan installation: Is there an old fan at location (yes/no)';
COMMENT ON COLUMN public.bookings.is_electricity_supply_on IS 'Fan installation: Is electricity supply on (yes/no)';
