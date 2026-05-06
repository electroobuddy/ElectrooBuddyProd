-- ============================================================================
-- Add approval_status column to technicians table
-- Date: 2026-05-06
-- Purpose: Add missing approval_status column for technician approval workflow
-- ============================================================================

-- Add approval_status column to technicians table
ALTER TABLE public.technicians 
ADD COLUMN IF NOT EXISTS approval_status TEXT DEFAULT 'approved' 
CHECK (approval_status IN ('pending', 'approved', 'rejected'));

-- Update existing technicians to have 'approved' status
UPDATE public.technicians 
SET approval_status = 'approved' 
WHERE approval_status IS NULL;

-- Add index for better performance on approval_status queries
CREATE INDEX IF NOT EXISTS idx_technicians_approval_status 
ON public.technicians(approval_status);

-- Add comment for documentation
COMMENT ON COLUMN public.technicians.approval_status IS 'Approval status for technician applications: pending, approved, or rejected';
