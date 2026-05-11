# Electroo Buddy Admin App

A React Native Expo app for admin to receive real-time booking notifications and manage bookings using OneSignal and Notifee.

## Features

- 🔔 Real-time push notifications for new bookings
- 📋 View and manage all bookings
- 📱 OneSignal integration for cross-platform push notifications
- 🔔 Notifee for local notifications (Android)
- 📊 Dashboard with booking statistics
- 🔄 Real-time updates via Supabase

## Prerequisites

- Node.js 18+
- Expo CLI (`npm install -g expo-cli`)
- OneSignal account with App ID
- Supabase project

## Setup

### 1. Install Dependencies

```bash
cd appscreen
npm install
```

### 2. Configure OneSignal

1. Go to [OneSignal](https://onesignal.com) and create a new app
2. Copy your **OneSignal App ID**
3. Update `ONESIGNAL_APP_ID` in `App.tsx`

### 3. Configure Supabase

1. Get your Supabase URL and anon key
2. Update `SUPABASE_URL` and `SUPABASE_ANON_KEY` in `App.tsx`
3. Update `ADMIN_USER_ID` with your admin user ID

### 4. Set up Supabase Database

Run these SQL statements in Supabase SQL Editor:

```sql
-- Push subscriptions table
CREATE TABLE public.push_subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  endpoint TEXT NOT NULL,
  subscription_type TEXT DEFAULT 'onesignal',
  subscription JSONB DEFAULT '{}',
  user_agent TEXT,
  browser TEXT,
  device_type TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Create policy for authenticated users
CREATE POLICY "Users can manage own subscription" ON public.push_subscriptions
  FOR ALL USING (auth.uid() = user_id);

-- Create policy for service role (edge functions)
CREATE POLICY "Service role can manage all" ON public.push_subscriptions
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Notifications table
CREATE TABLE public.notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  booking_id UUID,
  order_id UUID,
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  metadata JSONB DEFAULT '{}'
);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Policy for admins to see all notifications
CREATE POLICY "Admins can view all notifications" ON public.notifications
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_roles.user_id = auth.uid() 
      AND user_roles.role = 'admin'
    )
  );
```

### 5. Add OneSignal Edge Function Secrets

```bash
supabase secrets set ONESIGNAL_APP_ID=your-app-id
supabase secrets set ONESIGNAL_API_KEY=your-api-key
```

### 6. Run the App

```bash
npx expo start
# Press 'a' for Android or 'i' for iOS
```

## Project Structure

```
appscreen/
├── App.tsx          # Main app with all screens
├── app.json         # Expo configuration
├── package.json      # Dependencies
├── tsconfig.json     # TypeScript config
└── babel.config.js  # Babel config
```

## Screens

1. **Login Screen** - Simple admin authentication
2. **Dashboard** - View all bookings with real-time updates
3. **Booking Details** - Update booking status
4. **Notifications** - View all notifications

## How It Works

1. Admin logs in to the app
2. OneSignal requests push permission and saves subscription to Supabase
3. When a new booking is created on the website:
   - Supabase triggers real-time update to all connected admins
   - OneSignal sends push notification to all admin devices
4. Admin can update booking status, which notifies the customer

## Troubleshooting

### Push notifications not working?

1. Check if permission is granted
2. Verify OneSignal App ID is correct
3. Check Supabase edge function logs

### Real-time updates not working?

1. Enable Supabase realtime in your project settings
2. Check if RLS policies allow the subscription

## Support

For issues, contact support@electroobuddy.com
