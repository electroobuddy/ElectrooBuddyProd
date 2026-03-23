
-- Extend bookings table with assignment fields
ALTER TABLE public.bookings 
ADD COLUMN IF NOT EXISTS assigned_technician_id uuid REFERENCES public.technicians(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS assignment_date date,
ADD COLUMN IF NOT EXISTS assigned_at timestamptz;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_bookings_assigned_technician ON public.bookings(assigned_technician_id);
CREATE INDEX IF NOT EXISTS idx_bookings_assignment_date ON public.bookings(assignment_date);
CREATE INDEX IF NOT EXISTS idx_bookings_status_assigned ON public.bookings(status, assigned_technician_id);

-- Update existing pending bookings to have status 'pending' explicitly (if not already set)
UPDATE public.bookings SET status = 'pending' WHERE status IS NULL;

-- Add comment
COMMENT ON COLUMN public.bookings.assigned_technician_id IS 'Assigned technician for this booking';
COMMENT ON COLUMN public.bookings.assignment_date IS 'Date when the booking is scheduled for the technician';
COMMENT ON COLUMN public.bookings.assigned_at IS 'Timestamp when the booking was assigned to technician';

