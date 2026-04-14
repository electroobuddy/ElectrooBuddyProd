-- ============================================================================
-- Fix Bookings RLS Policy - Allow Both Authenticated and Guest Bookings
-- Date: 2026-04-12
-- Purpose: Fix RLS policy violation when guest users create bookings
-- ============================================================================

-- Drop all existing conflicting policies on bookings table
DROP POLICY IF EXISTS "Users can create bookings" ON public.bookings;
DROP POLICY IF EXISTS "Anyone can create bookings" ON public.bookings;
DROP POLICY IF EXISTS "Authenticated users can create bookings" ON public.bookings;
DROP POLICY IF EXISTS "Users can view own bookings" ON public.bookings;
DROP POLICY IF EXISTS "Admins can manage bookings" ON public.bookings;

-- Create unified INSERT policy: Anyone can create bookings (authenticated or not)
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

COMMENT ON POLICY "Anyone can create bookings" ON public.bookings IS 'Allows both authenticated and guest users to create bookings';
COMMENT ON POLICY "Users can view own bookings" ON public.bookings IS 'Users can view their own bookings, admins/technicians can view all';
