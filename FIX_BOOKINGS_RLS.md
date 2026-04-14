# Fix for Bookings RLS Policy Violation

## Problem
When users (especially guest users) try to create a booking, they get the error:
```
"new row violates row-level security policy for table bookings"
```

## Root Cause
Multiple conflicting Row Level Security (RLS) policies exist on the `bookings` table from different migrations. Some policies require `auth.uid() = user_id`, which fails when:
- Guest users (not logged in) try to create bookings
- The `user_id` field is `null`

## Solution

### Option 1: Apply Migration via Supabase Dashboard (RECOMMENDED - Quick Fix)

1. **Go to your Supabase Dashboard**: https://app.supabase.com
2. **Select your project**: `izgwlqxmafdxwewmasak`
3. **Navigate to SQL Editor**: Click on "SQL Editor" in the left sidebar
4. **Create a new query** and paste the following SQL:

```sql
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
```

5. **Click "Run"** to execute the SQL
6. **Verify success**: You should see "Success. No rows returned"

### Option 2: Use Supabase CLI (If you have database credentials)

1. Set your database password:
```bash
export SUPABASE_DB_PASSWORD=your_database_password
```

2. Run the migration:
```bash
npx supabase db push
```

The migration file is already created at:
`supabase/migrations/20260412_fix_bookings_rls_policy.sql`

## Frontend Fix (Already Applied)

The BookingForm.tsx has been updated to always include `user_id` in the insert data:

```typescript
const insertData: any = {
  // ... other fields
  user_id: user?.id || null, // Always include user_id (null for guests, UUID for authenticated users)
};
```

This ensures the field is properly set for both authenticated and guest users.

## What This Fix Does

1. **INSERT Policy**: `WITH CHECK (true)` allows **anyone** (authenticated or guest) to create bookings
2. **SELECT Policy**: Users can only see their own bookings; admins/technicians can see all
3. **UPDATE Policy**: Only admins and technicians can update bookings
4. **DELETE Policy**: Only admins can delete bookings

## Testing

After applying the fix:

1. **Test as guest user**:
   - Go to `/booking` without logging in
   - Fill out the form and submit
   - Should succeed without RLS error

2. **Test as authenticated user**:
   - Login and go to `/booking`
   - Fill out the form and submit
   - Should succeed and booking should be linked to your user_id

3. **Verify in Supabase Dashboard**:
   - Go to Table Editor → bookings
   - You should see both guest bookings (user_id = null) and user bookings (user_id = UUID)

## Files Changed

1. **Created**: `supabase/migrations/20260412_fix_bookings_rls_policy.sql` - Database migration
2. **Updated**: `src/pages/BookingForm.tsx` - Frontend code to always include user_id

## Need Help?

If you still encounter issues:
1. Check the browser console for detailed error messages
2. Verify the RLS policies in Supabase Dashboard → Authentication → Policies → bookings table
3. Ensure only the 4 policies from the migration above exist (delete any duplicates)
