# OneSignal Complete Setup Guide

## Overview
This guide provides complete instructions to set up OneSignal push notifications across all layers.

## ✅ Completed Fixes

### 1. Database Layer (SQL Migration Created)
**File:** `supabase/migrations/20260513_complete_onesignal_setup.sql`

**What it does:**
- Adds/updates `subscription_type` column (set to 'onesignal')
- Adds `endpoint` column for OneSignal subscription IDs
- Adds `subscription` JSONB column for metadata
- Adds `user_agent`, `browser`, `device_type` columns
- Creates performance indexes
- Updates RLS policies for authenticated and service roles
- Creates `get_onesignal_subscriptions()` function

### 2. Edge Function (Fixed)
**File:** `supabase/functions/send-onesignal-notification/index.ts`

**Features:**
- Sends notifications via OneSignal REST API
- Can send by `playerIds` (direct subscription IDs)
- Can send by `userIds` (fetches from database automatically)
- Fetches active OneSignal subscriptions from database
- Comprehensive error handling and logging

### 3. Frontend Utilities (Fixed)
**File:** `src/utils/oneSignalNotifications.ts`

**Functions:**
- `initializeOneSignal()` - Initializes SDK and gets subscription ID
- `subscribeToOneSignal(userId)` - Subscribes user and saves to database
- `unsubscribeFromOneSignal(userId)` - Unsubscribes user
- `isOneSignalSupported()` - Checks browser support

### 4. Frontend Components (Updated)
**File:** `src/components/PushNotificationPrompt.tsx`

**Changes:**
- Now uses `subscribeToOneSignal` instead of `subscribeToPush`
- Uses `unsubscribeFromOneSignal` instead of `unsubscribeFromPush`
- Uses `isOneSignalSupported` instead of `isPushSupported`
- Checks database for subscription status

### 5. Frontend Pages (Created)
**Files:**
- `src/pages/TestOneSignalNotifications.tsx` - Test page for OneSignal
- `src/pages/OneSignalDebug.tsx` - Debug console for troubleshooting

### 6. Notification System (Updated)
**File:** `src/utils/notificationUtils.ts`

**Functions:**
- `sendAdminNotificationAsync()` - Sends to admins via OneSignal
- `writePushNotification()` - Sends push via OneSignal edge function
- `writeInAppNotification()` - Saves to database

## 🚀 Next Steps to Complete Setup

### Step 1: Run Database Migration
Execute this SQL in Supabase SQL Editor:

```sql
-- Run the complete migration
\i supabase/migrations/20260513_complete_onesignal_setup.sql
```

Or run these commands separately:

```sql
-- Ensure push_subscriptions table has all required columns
ALTER TABLE public.push_subscriptions 
ADD COLUMN IF NOT EXISTS subscription_type VARCHAR(20) DEFAULT 'onesignal';

ALTER TABLE public.push_subscriptions 
ADD COLUMN IF NOT EXISTS endpoint TEXT;

ALTER TABLE public.push_subscriptions 
ADD COLUMN IF NOT EXISTS subscription JSONB DEFAULT '{}';

ALTER TABLE public.push_subscriptions 
ADD COLUMN IF NOT EXISTS user_agent TEXT;

ALTER TABLE public.push_subscriptions 
ADD COLUMN IF NOT EXISTS browser TEXT;

ALTER TABLE public.push_subscriptions 
ADD COLUMN IF NOT EXISTS device_type VARCHAR(20) DEFAULT 'desktop';

-- Update existing records
UPDATE public.push_subscriptions 
SET subscription_type = 'onesignal', is_active = true
WHERE subscription_type IS NULL OR subscription_type NOT IN ('onesignal', 'fcm', 'vapid');

-- Create index
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_onesignal 
ON public.push_subscriptions(subscription_type) 
WHERE subscription_type = 'onesignal';
```

### Step 2: Set Supabase Secrets

Run these commands in your terminal:

```bash
# Set OneSignal App ID
supabase secrets set ONESIGNAL_APP_ID=01fda38a-4a53-4f72-9c10-2d4c9db304f0

# Set OneSignal REST API Key (get from OneSignal Dashboard → Settings → Keys & IDs)
supabase secrets set ONESIGNAL_API_KEY=Nz...

# Verify secrets are set
supabase secrets list
```

### Step 3: Deploy Edge Function

```bash
# Deploy the OneSignal edge function
supabase functions deploy send-onesignal-notification

# Verify deployment
supabase functions list
```

### Step 4: Test the Setup

1. **Debug Page** (check if SDK loads):
   - Go to: `http://localhost:8080/onesignal-debug`
   - Check console logs for SDK status
   - Click "Request Permission" if needed

2. **Test Page** (subscribe and send test):
   - Go to: `http://localhost:8080/test-onesignal`
   - Click "Subscribe to Push Notifications"
   - Allow browser permission
   - Check if subscription saves to database
   - Click "Send Test Notification"

3. **Push Notification Prompt** (in-app):
   - Log in as a user
   - Wait for the push notification prompt to appear
   - Click "Enable Notifications"

## 🔧 Troubleshooting

### Issue: "SDK Not Loaded"
**Solution:** Check if OneSignal script is in `public/index.html`:
```html
<script src="https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js" defer></script>
<script>
  window.OneSignalDeferred = window.OneSignalDeferred || [];
  OneSignalDeferred.push(async function(OneSignal) {
    await OneSignal.init({
      appId: "01fda38a-4a53-4f72-9c10-2d4c9db304f0",
      safari_web_id: "web.onesignal.auto.1b5ff574-1f63-4acf-ab26-dadb313db610",
      notifyButton: { enable: true },
    });
  });
</script>
```

### Issue: "Permission Denied"
**Solution:** 
- Check browser notification settings
- Click the lock/info icon in address bar
- Allow notifications for your site

### Issue: "Subscription ID Undefined"
**Solution:**
- OneSignal v16 uses `window.OneSignal.User.PushSubscription.id`
- Check debug page console for the actual object structure
- The SDK may need more time to initialize

### Issue: "Failed to Save to Database"
**Solution:**
- Check RLS policies: `SELECT * FROM pg_policies WHERE tablename = 'push_subscriptions'`
- Verify user is authenticated
- Check if `endpoint` column exists
- Check console for detailed error messages

### Issue: "Edge Function Returns 500"
**Solution:**
- Check if `ONESIGNAL_APP_ID` and `ONESIGNAL_API_KEY` are set
- Check edge function logs: `supabase functions logs send-onesignal-notification`
- Verify the function deployed successfully

## 📊 Database Schema

### push_subscriptions table:
```sql
CREATE TABLE public.push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint TEXT, -- OneSignal subscription ID
  subscription_type VARCHAR(20) DEFAULT 'onesignal',
  subscription JSONB DEFAULT '{}',
  user_agent TEXT,
  browser TEXT,
  device_type VARCHAR(20) DEFAULT 'desktop',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 🎯 Complete Flow

1. **User visits site** → OneSignal SDK loads from `index.html`
2. **User clicks "Enable Notifications"** → `subscribeToOneSignal()` called
3. **Permission requested** → Browser shows notification permission dialog
4. **Permission granted** → OneSignal creates subscription
5. **Subscription ID obtained** → `window.OneSignal.User.PushSubscription.id`
6. **Saved to database** → `push_subscriptions` table updated
7. **Booking created** → `sendAdminNotificationAsync()` called
8. **In-app notification** → Saved to `notifications` table
9. **Push notification** → Edge function sends via OneSignal API
10. **Admin receives** → Push notification on their device

## 🔐 Security Notes

- **RLS Policies**: Users can only manage their own subscriptions
- **Edge Function**: Uses service role to fetch subscriptions
- **OneSignal API Key**: Keep secret, never expose in frontend
- **Subscription IDs**: Tied to specific devices/users

## 📝 Files Modified/Created

### New Files:
- `src/utils/oneSignalNotifications.ts`
- `src/pages/TestOneSignalNotifications.tsx`
- `src/pages/OneSignalDebug.tsx`
- `supabase/migrations/20260513_complete_onesignal_setup.sql`
- `supabase/functions/send-onesignal-notification/index.ts`

### Modified Files:
- `src/utils/notificationUtils.ts` - Uses OneSignal for push
- `src/components/PushNotificationPrompt.tsx` - Uses OneSignal functions
- `src/App.tsx` - Added routes for test pages
- `public/index.html` - Added OneSignal SDK script

## ✅ Success Checklist

- [ ] Database migration executed successfully
- [ ] Supabase secrets set (ONESIGNAL_APP_ID, ONESIGNAL_API_KEY)
- [ ] Edge function deployed
- [ ] OneSignal SDK loads (check debug page)
- [ ] Permission can be requested
- [ ] Subscription ID is obtained
- [ ] Subscription saves to database
- [ ] Test notification sends successfully
- [ ] Admin receives push notification on booking

---

**Need Help?** Check the debug page (`/onesignal-debug`) for detailed console logs to identify any issues.
