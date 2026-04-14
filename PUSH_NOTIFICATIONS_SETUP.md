# Push Notifications Setup Guide

## Overview

This guide will help you set up **Web Push Notifications** for ElectroBuddy, enabling real-time notifications that work **even when the website is closed**.

## Architecture

The push notification system consists of:

1. **Service Worker** (`public/sw.js`) - Background script that receives push notifications
2. **Web Push API** - Browser native push notification system  
3. **VAPID Protocol** - Secure authentication for push subscriptions
4. **Supabase Realtime** - WebSocket-based in-app notifications (already working)
5. **Edge Functions** - Server-side push notification delivery

## Prerequisites

- Node.js installed
- Supabase project set up
- Access to Supabase dashboard
- Modern browser (Chrome, Firefox, Edge, Safari)

---

## Step 1: Generate VAPID Keys

VAPID (Voluntary Application Server Identification) keys are required for web push notifications.

### Run the Key Generation Script:

```bash
node scripts/generate-vapid-keys.js
```

### Output Example:

```
================================================================================
VAPID KEYS GENERATED SUCCESSFULLY
================================================================================

Add these to your .env file:

VITE_VAPID_PUBLIC_KEY=BGxXz...
VAPID_PRIVATE_KEY=abc123...
VAPID_SUBJECT=mailto:admin@electroobuddy.com

================================================================================
IMPORTANT: Keep your VAPID_PRIVATE_KEY secure and never commit it to Git!
================================================================================
```

### Add to `.env`:

Copy the generated keys to your `.env` file:

```env
VITE_VAPID_PUBLIC_KEY=BGxXz... (your actual public key)
VAPID_PRIVATE_KEY=abc123... (your actual private key)
VAPID_SUBJECT=mailto:admin@electroobuddy.com
```

**⚠️ Security Warning:**
- Never commit `VAPID_PRIVATE_KEY` to version control
- Add `.env` to `.gitignore` (already done)
- Regenerate keys if they are ever exposed

---

## Step 2: Run Database Migration

Apply the push notifications schema to your Supabase database.

### Option A: Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy the contents of `supabase/migrations/20260412_add_push_subscriptions.sql`
4. Paste and run the SQL
5. Verify success (no errors)

### Option B: Supabase CLI

```bash
supabase db push
```

### What the Migration Does:

1. Creates `push_subscriptions` table to store user push tokens
2. Adds push notification columns to `notification_preferences`
3. Updates `create_notification` function to support push
4. Creates helper functions for managing subscriptions
5. Sets up Row Level Security (RLS) policies

### Verify Migration:

Run this query in Supabase SQL Editor:

```sql
-- Check if tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('push_subscriptions', 'notification_preferences');

-- Check columns in notification_preferences
SELECT column_name FROM information_schema.columns
WHERE table_name = 'notification_preferences'
AND column_name LIKE 'push_%';
```

Expected output should show:
- `push_subscriptions` table
- `push_notifications`, `push_booking_created`, `push_booking_confirmed`, etc. columns

---

## Step 3: Deploy Edge Function

Deploy the `send-push-notification` edge function to Supabase.

### Option A: Supabase Dashboard

1. Navigate to **Edge Functions** in Supabase dashboard
2. Click **Create Function**
3. Name it: `send-push-notification`
4. Copy contents of `supabase/functions/send-push-notification/index.ts`
5. Save and deploy

### Option B: Supabase CLI

```bash
supabase functions deploy send-push-notification
```

### Set Environment Variables:

In Supabase dashboard → Edge Functions → Settings, add:

```
VAPID_PRIVATE_KEY=<your_private_key>
VAPID_SUBJECT=mailto:admin@electroobuddy.com
```

---

## Step 4: Build and Test

### Development Mode:

```bash
npm run dev
```

### Production Build:

```bash
npm run build
npm run preview
```

### Test Service Worker Registration:

1. Open your app in browser
2. Open DevTools (F12)
3. Go to **Application** tab → **Service Workers**
4. Verify `sw.js` is registered and activated
5. Check console for: `[Push] Service Worker registered`

---

## Step 5: Test Push Notifications

### Test Permission Flow:

1. Login to any panel (Admin, User, or Technician)
2. Wait 3 seconds for the permission prompt to appear
3. Click **"Enable Notifications"**
4. Browser will show permission dialog
5. Click **"Allow"**
6. You should see: "🔔 Push notifications enabled!"

### Test Notification Delivery:

#### With App Open (In-App Notifications):
1. Keep the app open
2. Create a new booking (or update status as admin)
3. You should see:
   - Toast notification in-app
   - Notification bell badge update
   - Browser console logs

#### With App Closed (Push Notifications):
1. Close all tabs of your app
2. As admin, create or update a booking
3. You should receive a **browser notification** (system-level)
4. Click notification to open the app

### Check Subscription in Database:

```sql
SELECT 
  user_id,
  browser_name,
  is_active,
  created_at
FROM push_subscriptions
ORDER BY created_at DESC
LIMIT 10;
```

---

## Browser Compatibility

| Browser | Desktop Push | Mobile Push | Notes |
|---------|-------------|-------------|-------|
| Chrome  | ✅ Yes       | ✅ Yes       | Full support |
| Firefox | ✅ Yes       | ✅ Yes       | Full support |
| Edge    | ✅ Yes       | ✅ Yes       | Full support |
| Safari  | ✅ Yes       | ⚠️ Limited   | Requires PWA on iOS 16.4+ |
| Opera   | ✅ Yes       | ✅ Yes       | Full support |
| Samsung Internet | ✅ Yes | ✅ Yes    | Full support |

### iOS Safari Notes:

Push notifications on iOS require:
- iOS 16.4 or later
- Website added to home screen as PWA
- User must grant permission

---

## Troubleshooting

### Issue: Permission Prompt Doesn't Appear

**Solutions:**
1. Check if `VITE_VAPID_PUBLIC_KEY` is set in `.env`
2. Verify service worker is registered (DevTools → Application → Service Workers)
3. Check browser console for errors
4. Try in incognito/private mode
5. Clear site data and reload

### Issue: Push Subscription Fails

**Common Errors:**

**"VAPID public key not configured"**
```bash
# Check .env file has the key
cat .env | grep VITE_VAPID_PUBLIC_KEY

# Restart dev server
npm run dev
```

**"Service Worker registration failed"**
```bash
# Ensure sw.js exists in public folder
ls public/sw.js

# Check for syntax errors in sw.js
node --check public/sw.js
```

### Issue: Notifications Not Received When App Closed

**Checklist:**
1. ✅ User granted notification permission
2. ✅ Push subscription exists in database
3. ✅ Edge function deployed with VAPID keys
4. ✅ Service worker is active
5. ✅ Browser supports push notifications

**Debug Steps:**
```javascript
// In browser console:
// Check permission
Notification.permission // Should be "granted"

// Check service worker
navigator.serviceWorker.ready.then(reg => {
  console.log('SW ready:', reg);
  reg.pushManager.getSubscription().then(sub => {
    console.log('Subscription:', sub);
  });
});

// Check subscriptions in database
// Run in Supabase SQL Editor:
SELECT * FROM push_subscriptions WHERE is_active = true;
```

### Issue: TypeScript Errors in NotificationSettings

**Error:** `Property 'push_notifications' does not exist on type...`

**Cause:** Supabase TypeScript types haven't been regenerated after migration.

**Solution:**
```bash
# Regenerate Supabase types
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/integrations/supabase/types.ts
```

Or temporarily ignore the error (it will work at runtime).

---

## Production Deployment

### Before Deploying to Production:

1. **Generate Production VAPID Keys:**
   ```bash
   node scripts/generate-vapid-keys.js
   ```
   Use different keys for production!

2. **Update Environment Variables:**
   - Set VAPID keys in your hosting platform (Vercel, Netlify, etc.)
   - Update Supabase edge function secrets

3. **Run Migration on Production Database:**
   ```bash
   supabase db push --db-url YOUR_PRODUCTION_DB_URL
   ```

4. **Deploy Edge Function to Production:**
   ```bash
   supabase functions deploy send-push-notification --project-ref YOUR_PROJECT_REF
   ```

5. **Test Thoroughly:**
   - Test permission flow
   - Test with app open and closed
   - Test on multiple browsers
   - Test on mobile devices

---

## Advanced Configuration

### Customize Notification Appearance

Edit `public/sw.js` to modify:

```javascript
const options = {
  body: data.body,
  icon: '/favicon_io/android-chrome-192x192.png',  // Change icon
  badge: '/favicon_io/android-chrome-192x192.png', // Change badge
  image: data.image || null,                       // Add image support
  vibrate: [200, 100, 200],                        // Vibration pattern
  tag: data.tag,                                   // Group notifications
  requireInteraction: false,                       // Keep notification open
  actions: [                                       // Action buttons
    { action: 'view', title: '👁️ View Details' },
    { action: 'close', title: '✕ Dismiss' }
  ]
};
```

### Notification Sound

Add custom sound to service worker:

```javascript
const options = {
  // ... other options
  sound: '/sounds/notification.mp3',
  renotify: true,
};
```

### Badge Count (Android)

Show notification count in app badge:

```javascript
// In sw.js notificationclick handler
if (navigator.setAppBadge) {
  navigator.setAppBadge(unreadCount);
}
```

---

## Monitoring & Analytics

### Track Subscription Rate

```sql
-- Daily subscription count
SELECT 
  DATE(created_at) as date,
  COUNT(*) as new_subscriptions
FROM push_subscriptions
GROUP BY DATE(created_at)
ORDER BY date DESC;
```

### Track Active Subscriptions

```sql
-- Active vs inactive
SELECT 
  is_active,
  COUNT(*) as count
FROM push_subscriptions
GROUP BY is_active;
```

### Monitor Push Failures

Check Supabase edge function logs:
1. Go to Supabase Dashboard → Edge Functions
2. Click `send-push-notification`
3. View **Logs** tab
4. Look for error patterns

---

## Security Best Practices

1. **Never expose VAPID private key** in client-side code
2. **Use HTTPS** in production (required for service workers)
3. **Implement rate limiting** on edge function
4. **Regularly rotate VAPID keys** (every 6-12 months)
5. **Clean up inactive subscriptions** periodically
6. **Monitor for abuse** (unusual subscription patterns)

### Cleanup Old Subscriptions:

```sql
-- Deactivate subscriptions older than 90 days
UPDATE push_subscriptions
SET is_active = false,
    updated_at = now()
WHERE created_at < now() - INTERVAL '90 days'
AND is_active = true;
```

---

## Resources

- [Web Push Protocol (RFC 8030)](https://tools.ietf.org/html/rfc8030)
- [VAPID Specification](https://tools.ietf.org/html/rfc8292)
- [MDN Web Push API](https://developer.mozilla.org/en-US/docs/Web/API/Push_API)
- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)

---

## Support

If you encounter issues:

1. Check browser console for errors
2. Verify all environment variables are set
3. Ensure migration ran successfully
4. Test in different browsers
5. Check Supabase edge function logs
6. Review this troubleshooting guide

---

**Last Updated:** April 12, 2026  
**Version:** 1.0.0  
**Status:** ✅ Production Ready
