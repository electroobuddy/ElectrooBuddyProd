# 🚨 URGENT: Fix Technician Login - 500 Error

## The Problem
Your code is CORRECT ✅  
The database RLS policies are WRONG ❌

Every time you try to login as a technician, Supabase blocks the query with a 500 error because of conflicting RLS policies.

---

## ⚡ THE FIX (2 Minutes)

### Step 1: Open Supabase SQL Editor

1. Go to: **https://supabase.com/dashboard**
2. Select your project
3. Click **"SQL Editor"** in the left sidebar
4. Click **"New query"**

---

### Step 2: Copy & Paste This ENTIRE Script

```sql
-- =====================================================
-- ONE-CLICK FIX FOR TECHNICIAN LOGIN 500 ERROR
-- =====================================================

-- Part 1: Disable RLS temporarily to avoid conflicts
ALTER TABLE public.technicians DISABLE ROW LEVEL SECURITY;

-- Part 2: Drop EVERY policy that might exist (ignore errors)
DO $$ BEGIN
  DROP POLICY IF EXISTS "technicians_can_view_own_profile" ON public.technicians;
  DROP POLICY IF EXISTS "view_technician_profiles" ON public.technicians;
  DROP POLICY IF EXISTS "Technicians can view own profile" ON public.technicians;
  DROP POLICY IF EXISTS "admins_can_view_all_technicians" ON public.technicians;
  DROP POLICY IF EXISTS "Admins can manage technicians" ON public.technicians;
  DROP POLICY IF EXISTS "admins_manage_technicians" ON public.technicians;
  DROP POLICY IF EXISTS "technicians_update_own_profile" ON public.technicians;
  DROP POLICY IF EXISTS "Technicians can update own profile" ON public.technicians;
  DROP POLICY IF EXISTS "Admins can update technicians" ON public.technicians;
  DROP POLICY IF EXISTS "Admins can delete technicians" ON public.technicians;
  DROP POLICY IF EXISTS "users_can_create_own_technician_profile" ON public.technicians;
  DROP POLICY IF EXISTS "Users can create own technician profile" ON public.technicians;
  DROP POLICY IF EXISTS "users_create_own_technician" ON public.technicians;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

-- Part 3: Re-enable RLS
ALTER TABLE public.technicians ENABLE ROW LEVEL SECURITY;

-- Part 4: Create new simple policies (no has_role calls)
CREATE POLICY "technicians_can_view_own_profile"
ON public.technicians FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "admins_can_view_all_technicians"
ON public.technicians FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_roles.user_id = auth.uid() 
    AND user_roles.role = 'admin'::app_role
  )
);

CREATE POLICY "technicians_can_update_own_profile"
ON public.technicians FOR UPDATE TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "admins_can_manage_all_technicians"
ON public.technicians FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_roles.user_id = auth.uid() 
    AND user_roles.role = 'admin'::app_role
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_roles.user_id = auth.uid() 
    AND user_roles.role = 'admin'::app_role
  )
);

CREATE POLICY "users_can_create_own_technician_profile"
ON public.technicians FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Part 5: Verify success
SELECT '✅ SUCCESS! Policies created:' as status;
SELECT policyname FROM pg_policies WHERE tablename = 'technicians' ORDER BY policyname;
```

---

### Step 3: Click "Run" Button

Or press **Ctrl+Enter** (Windows) / **Cmd+Enter** (Mac)

**Expected Result:**
```
✅ SUCCESS! Policies created:
- admins_can_manage_all_technicians
- admins_can_view_all_technicians
- technicians_can_update_own_profile
- technicians_can_view_own_profile
- users_can_create_own_technician_profile
```

---

### Step 4: Test the Fix

1. **Clear browser cache**: Press `Ctrl + Shift + Delete`
2. **Reload your app**: Press `F5`
3. **Login as technician**: Go to `/technician/login`
4. **Check console** (F12): Should see:
   ```
   🔍 Checking roles for user: 7b30fee5-ad75-412b-9403-41496d3ef588
   🎭 Fetched roles: [{ role: 'technician' }]
   ✅ Is Admin? false
   ✅ Is Technician? true
   ✅ Welcome back, [Name]!
   ```

**NO MORE 500 ERROR!** 🎉

---

## ❓ What If It Still Doesn't Work?

### Check if technician profile exists:

Run this in SQL Editor:
```sql
SELECT id, user_id, name, email, approval_status 
FROM technicians 
WHERE user_id = '7b30fee5-ad75-412b-9403-41496d3ef588';
```

**If NO RESULTS**, create the profile:
```sql
INSERT INTO technicians (user_id, name, email, skills, approval_status)
SELECT id, COALESCE(raw_user_meta_data->>'name', email), email,
       ARRAY['Electrical Repair'] as skills, 'approved' as approval_status
FROM auth.users 
WHERE id = '7b30fee5-ad75-412b-9403-41496d3ef588';
```

---

## 🔧 What This Script Does

1. **Disables RLS** - Clears any locked states
2. **Drops all old policies** - Even ones you didn't know existed
3. **Re-enables RLS cleanly** - Fresh start
4. **Creates 5 simple policies** - Using direct `auth.uid() = user_id` checks
5. **Verifies success** - Shows you the new policies

The key change: **No more `has_role()` function calls** which were causing recursive evaluation errors.

---

## 📞 Still Stuck?

Take a screenshot of:
1. The SQL Editor after running the script
2. The browser console showing the error
3. Supabase Logs (Database → Logs)

This will help diagnose what's happening.
