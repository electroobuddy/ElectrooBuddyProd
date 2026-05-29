-- Add technician_name and technician_phone columns to bookings table
-- These store the assigned technician's details directly on the booking
-- so that non-admin users can see them (technicians table RLS restricts SELECT
-- to only the technician themselves and admins)

ALTER TABLE bookings ADD COLUMN IF NOT EXISTS technician_name TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS technician_phone TEXT;

-- Backfill existing bookings that have assigned_technician_id
UPDATE bookings
SET
  technician_name = t.name,
  technician_phone = t.phone
FROM technicians t
WHERE bookings.assigned_technician_id = t.id
  AND bookings.technician_name IS NULL;
