-- ============================================================================
-- Fix Bookings RLS Policy - Allow Anonymous Users to Book Services
-- Date: 2026-05-14
-- Purpose: Ensure anonymous users can create bookings without login
-- ============================================================================

-- Make user_id nullable to support guest bookings
ALTER TABLE public.bookings 
ALTER COLUMN user_id DROP NOT NULL;

-- Drop all existing policies on bookings table to start fresh
DROP POLICY IF EXISTS "Users can create bookings" ON public.bookings;
DROP POLICY IF EXISTS "Anyone can create bookings" ON public.bookings;
DROP POLICY IF EXISTS "Authenticated users can create bookings" ON public.bookings;
DROP POLICY IF EXISTS "Users can view own bookings" ON public.bookings;
DROP POLICY IF EXISTS "Admins can manage bookings" ON public.bookings;
DROP POLICY IF EXISTS "Admins and technicians can update bookings" ON public.bookings;
DROP POLICY IF EXISTS "Admins can delete bookings" ON public.bookings;

-- Create INSERT policy: Allow anyone (including anonymous) to create bookings
CREATE POLICY "Anyone can create bookings"
    ON public.bookings
    FOR INSERT
    WITH CHECK (true);

-- Create SELECT policy: Users can view their own bookings, admins can view all
CREATE POLICY "Users can view own bookings"
    ON public.bookings
    FOR SELECT
    TO authenticated
    USING (
        user_id = auth.uid() 
        OR 
        EXISTS (
            SELECT 1 FROM public.user_roles 
            WHERE user_roles.user_id = auth.uid() 
            AND user_roles.role IN ('admin', 'technician')
        )
    );

-- Create UPDATE policy: Only admins and assigned technicians can update
CREATE POLICY "Admins and technicians can update bookings"
    ON public.bookings
    FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.user_roles 
            WHERE user_roles.user_id = auth.uid() 
            AND user_roles.role IN ('admin', 'technician')
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.user_roles 
            WHERE user_roles.user_id = auth.uid() 
            AND user_roles.role IN ('admin', 'technician')
        )
    );

-- Create DELETE policy: Only admins can delete
CREATE POLICY "Admins can delete bookings"
    ON public.bookings
    FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.user_roles 
            WHERE user_roles.user_id = auth.uid() 
            AND user_roles.role = 'admin'
        )
    );

-- ============================================================================
-- Migration Complete
-- ============================================================================

COMMENT ON POLICY "Anyone can create bookings" ON public.bookings IS 'Allows both authenticated and guest users to create bookings without any restrictions';
COMMENT ON POLICY "Users can view own bookings" ON public.bookings IS 'Users can view their own bookings, admins/technicians can view all';
