-- ============================================================================
-- Create Fresh Technicians Table with Proper Structure
-- Date: 2026-05-07
-- Purpose: Drop old table and create new clean technicians table
-- ============================================================================

-- Drop existing technicians table and all dependent objects
DROP TABLE IF EXISTS public.technicians CASCADE;

-- Create new technicians table with proper structure and constraints
CREATE TABLE public.technicians (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone TEXT,
    address TEXT,
    skills TEXT[] DEFAULT '{}',
    experience INTEGER DEFAULT 0,
    daily_limit INTEGER DEFAULT 5,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'busy', 'offline')),
    priority INTEGER DEFAULT 1,
    profile_url TEXT,
    approval_status TEXT DEFAULT 'approved' CHECK (approval_status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes for optimal performance
CREATE INDEX idx_technicians_user_id ON public.technicians(user_id);
CREATE INDEX idx_technicians_email ON public.technicians(email);
CREATE INDEX idx_technicians_status ON public.technicians(status);
CREATE INDEX idx_technicians_approval_status ON public.technicians(approval_status);

-- Enable Row Level Security
ALTER TABLE public.technicians ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for technicians table
-- 1. Technicians can view their own profile
CREATE POLICY "Technicians can view own profile"
ON public.technicians FOR SELECT
USING (auth.uid() = user_id);

-- 2. Technicians can update their own profile
CREATE POLICY "Technicians can update own profile"
ON public.technicians FOR UPDATE
USING (auth.uid() = user_id);

-- 3. Admins can view all technicians
CREATE POLICY "Admins can view all technicians"
ON public.technicians FOR SELECT
USING (EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
));

-- 4. Admins can manage all technicians
CREATE POLICY "Admins can manage all technicians"
ON public.technicians FOR ALL
USING (EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
));

-- Add comments for documentation
COMMENT ON TABLE public.technicians IS 'Technicians table with approval workflow and proper constraints';
COMMENT ON COLUMN public.technicians.approval_status IS 'Approval status: pending, approved, or rejected';
COMMENT ON COLUMN public.technicians.status IS 'Current availability status: active, busy, or offline';
COMMENT ON COLUMN public.technicians.priority IS 'Assignment priority for automatic technician selection';
COMMENT ON COLUMN public.technicians.daily_limit IS 'Maximum number of assignments per day';

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Fresh technicians table created successfully with all constraints, indexes, and RLS policies';
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Error creating technicians table: %', SQLERRM;
END $$;
