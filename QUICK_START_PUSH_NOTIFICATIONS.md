# 🚀 Quick Start: Enable Push Notifications

## 3 Steps to Get Push Notifications Working

### Step 1: Generate VAPID Keys (30 seconds)

```bash
node scripts/generate-vapid-keys.js
```

**Copy the output** to `.env`:
```env
VITE_VAPID_PUBLIC_KEY=<paste_public_key_here>
VAPID_PRIVATE_KEY=<paste_private_key_here>
VAPID_SUBJECT=mailto:admin@electroobuddy.com
```

---

### Step 2: Run Database Migration (1 minute)

1. Open **Supabase Dashboard** → **SQL Editor**
2. Open file: `supabase/migrations/20260412_add_push_subscriptions.sql`
3. **Copy all SQL** and **paste into editor**
4. Click **Run**
5. ✅ Verify no errors

---

### Step 3: Deploy Edge Function (2 minutes)

```bash
# Deploy the function
supabase functions deploy send-push-notification

# Set environment variables in Supabase Dashboard:
# Edge Functions → send-push-notification → Settings
# Add these secrets:
# - VAPID_PRIVATE_KEY (from step 1)
# - VAPID_SUBJECT=mailto:admin@electroobuddy.com
```

---

## ✅ Test It!

```bash
npm run dev
```

1. **Login** to any panel (Admin/User/Technician)
2. **Wait 3 seconds** for permission prompt
3. Click **"Enable Notifications"**
4. Click **"Allow"** in browser dialog
5. **Create or update** a booking
6. **Close the tab** and update another booking
7. ✅ You should see a **browser notification**!

---

## 📖 Need More Help?

- **Detailed Guide:** `PUSH_NOTIFICATIONS_SETUP.md`
- **Implementation Summary:** `PUSH_NOTIFICATIONS_IMPLEMENTATION_SUMMARY.md`
- **Troubleshooting:** See `PUSH_NOTIFICATIONS_SETUP.md` → Troubleshooting section

---

## 🎯 What You Get

✅ **Real-time notifications** when app is open (WebSocket)  
✅ **Push notifications** when app is closed (Web Push API)  
✅ **Works on all devices** (desktop + mobile)  
✅ **User-friendly permission** prompt  
✅ **Settings panel** to manage preferences  
✅ **Zero configuration** for users  

---

**Total Setup Time:** ~5 minutes  
**Status:** ✅ Ready to Deploy
