# Real-Time Push Notifications with Background Support

## Overview

This plan implements a complete push notification system that delivers notifications even when the website is not open, using:

1. **Service Worker** - Background script that receives push notifications
2. **Web Push API** - Browser native push notification system
3. **VAPID Protocol** - Secure push subscription authentication
4. **Enhanced Supabase Realtime** - Improved WebSocket connection (already in place)
5. **Permission Management** - User-controlled notification preferences

## Architecture

```
Booking Status Change
  ↓
Edge Function (notify-booking-status)
  ↓
Creates notification in Supabase database
  ↓
┌─────────────────────────────┬──────────────────────────┐
│  If website is OPEN:        │  If website is CLOSED:   │
│  Supabase Realtime (WS)     │  Web Push API            │
│  → In-app toast             │  → Service Worker        │
│  → Notification Bell update │  → Browser notification  │
└─────────────────────────────┴──────────────────────────┘
```

## Implementation Steps

### Step 1: Install Required Dependencies

**File:** `package.json`

Add the `web-push` library for generating VAPID keys and handling push subscriptions:

```bash
npm install web-push
```

### Step 2: Generate VAPID Keys

**New File:** `scripts/generate-vapid-keys.js`

Create a script to generate VAPID (Voluntary Application Server Identification) keys needed for web push:

```javascript
import webpush from 'web-push';
const vapidKeys = webpush.generateVAPIDKeys();
console.log('PUBLIC_KEY:', vapidKeys.publicKey);
console.log('PRIVATE_KEY:', vapidKeys.privateKey);
```

Run: `node scripts/generate-vapid-keys.js`

Store the keys in `.env`:
```env
VAPID_PUBLIC_KEY=your_generated_public_key
VAPID_PRIVATE_KEY=your_generated_private_key
VAPID_SUBJECT=mailto:admin@electroobuddy.com
```

### Step 3: Database Migration for Push Subscriptions

**New File:** `supabase/migrations/20260412_add_push_subscriptions.sql`

Add table to store user push subscriptions:

```sql
CREATE TABLE IF NOT EXISTS public.push_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    subscription JSONB NOT NULL,
    browser_name TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX idx_push_subscriptions_user_id ON public.push_subscriptions(user_id);
CREATE INDEX idx_push_subscriptions_active ON public.push_subscriptions(is_active);

-- RLS
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own subscriptions"
  ON public.push_subscriptions FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Service role can manage all subscriptions"
  ON public.push_subscriptions FOR ALL TO service_role
  USING (true);
```

Update `notification_preferences` table to include push notification preferences:

```sql
ALTER TABLE public.notification_preferences 
ADD COLUMN IF NOT EXISTS push_notifications BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS push_booking_created BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS push_booking_confirmed BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS push_booking_assigned BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS push_booking_completed BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS push_booking_cancelled BOOLEAN DEFAULT true;
```

### Step 4: Create Service Worker

**New File:** `public/sw.js`

Service worker handles push events when the app is closed:

```javascript
const BASE_URL = self.location.origin;

self.addEventListener('push', function(event) {
  const data = event.data?.json() || {};
  
  const options = {
    body: data.body || 'You have a new notification',
    icon: '/favicon_io/android-chrome-192x192.png',
    badge: '/favicon_io/android-chrome-192x192.png',
    image: data.image || null,
    data: {
      url: data.url || '/dashboard/bookings',
      notificationId: data.notificationId,
      type: data.type
    },
    actions: [
      { action: 'view', title: 'View Details' },
      { action: 'close', title: 'Dismiss' }
    ],
    tag: data.tag || 'default',
    renotify: true,
    requireInteraction: data.requireInteraction || false,
    vibrate: [200, 100, 200],
    silent: false
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'ElectroBuddy', options)
  );
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();

  if (event.action === 'close') return;

  const urlToOpen = event.notification.data?.url || BASE_URL;

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then(windowClients => {
        // Check if there's already a window open
        for (let client of windowClients) {
          if (client.url.includes(urlToOpen) && 'focus' in client) {
            return client.focus();
          }
        }
        // No window open, open a new one
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});

self.addEventListener('pushsubscriptionchange', function(event) {
  // Handle subscription changes
  console.log('Push subscription changed');
});
```

### Step 5: Create Push Notification Utilities

**New File:** `src/utils/pushNotifications.ts`

Utility functions for managing push subscriptions:

```typescript
import { supabase } from "@/integrations/supabase/client";

// Convert base64 URL-safe to Uint8Array
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map(char => char.charCodeAt(0)));
}

// Register service worker
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!('serviceWorker' in navigator)) {
    console.warn('Service workers not supported');
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js');
    console.log('Service Worker registered');
    return registration;
  } catch (error) {
    console.error('Service Worker registration failed:', error);
    return null;
  }
}

// Request notification permission
export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) {
    console.warn('Notifications not supported');
    return false;
  }

  const permission = await Notification.requestPermission();
  return permission === 'granted';
}

// Subscribe to push notifications
export async function subscribeToPush(userId: string): Promise<boolean> {
  try {
    const registration = await registerServiceWorker();
    if (!registration) return false;

    const permission = await requestNotificationPermission();
    if (!permission) return false;

    const vapidPublicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;
    if (!vapidPublicKey) {
      console.error('VAPID public key not configured');
      return false;
    }

    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidPublicKey)
    });

    // Save subscription to database
    const { error } = await supabase
      .from('push_subscriptions')
      .upsert({
        user_id: userId,
        subscription: JSON.stringify(subscription),
        browser_name: navigator.userAgent,
        is_active: true
      });

    if (error) {
      console.error('Failed to save push subscription:', error);
      return false;
    }

    console.log('Push subscription successful');
    return true;
  } catch (error) {
    console.error('Push subscription failed:', error);
    return false;
  }
}

// Unsubscribe from push notifications
export async function unsubscribeFromPush(userId: string): Promise<boolean> {
  try {
    const registration = await registerServiceWorker();
    if (!registration) return false;

    const subscription = await registration.pushManager.getSubscription();
    if (subscription) {
      await subscription.unsubscribe();
    }

    // Remove from database
    await supabase
      .from('push_subscriptions')
      .update({ is_active: false })
      .eq('user_id', userId);

    console.log('Push unsubscription successful');
    return true;
  } catch (error) {
    console.error('Push unsubscription failed:', error);
    return false;
  }
}

// Check current notification permission status
export function getNotificationPermission(): NotificationPermission {
  if (!('Notification' in window)) return 'denied';
  return Notification.permission;
}

// Check if push is supported
export function isPushSupported(): boolean {
  return (
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window
  );
}
```

### Step 6: Create Push Notification Edge Function

**New File:** `supabase/functions/send-push-notification/index.ts`

Edge function to send push notifications via Web Push API:

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const vapidPrivateKey = Deno.env.get("VAPID_PRIVATE_KEY");
const vapidSubject = Deno.env.get("VAPID_SUBJECT");

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Simple web-push implementation (since web-push npm package isn't available in Deno)
async function sendPushNotification(subscription: any, payload: any) {
  if (!vapidPrivateKey || !vapidSubject) {
    console.error('VAPID keys not configured');
    return false;
  }

  // Call a webhook or use a Deno-compatible push library
  // For now, we'll use a simple fetch to a push service
  try {
    const response = await fetch(subscription.endpoint, {
      method: 'POST',
      headers: {
        'TTL': '60',
        'Content-Type': 'application/octet-stream',
        // VAPID authorization headers would go here
        // Use a library like web-push for production
      },
      body: JSON.stringify(payload)
    });

    return response.ok;
  } catch (error) {
    console.error('Failed to send push notification:', error);
    return false;
  }
}

serve(async (req) => {
  try {
    const { userId, title, body, url, type, notificationId } = await req.json();

    // Get user's active push subscriptions
    const { data: subscriptions, error } = await supabase
      .from('push_subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true);

    if (error) throw error;
    if (!subscriptions || subscriptions.length === 0) {
      return new Response(JSON.stringify({ 
        success: false, 
        message: 'No active subscriptions' 
      }), { status: 200 });
    }

    // Send push to all user's devices
    const payload = {
      title,
      body,
      url,
      type,
      notificationId,
      tag: `booking-${type}`,
      icon: '/favicon_io/android-chrome-192x192.png',
      badge: '/favicon_io/android-chrome-192x192.png'
    };

    let successCount = 0;
    for (const sub of subscriptions) {
      const subscription = typeof sub.subscription === 'string' 
        ? JSON.parse(sub.subscription) 
        : sub.subscription;

      const sent = await sendPushNotification(subscription, payload);
      if (sent) successCount++;
    }

    return new Response(JSON.stringify({
      success: true,
      sent: successCount,
      total: subscriptions.length
    }), { status: 200 });

  } catch (error) {
    console.error('Error sending push notification:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), { status: 500 });
  }
});
```

### Step 7: Update Notification Creation to Trigger Push

**File:** `supabase/migrations/20260412_create_notifications_system.sql` (update function)

Update the `create_notification` function to also trigger push notifications:

Add after creating the in-app notification:

```sql
-- Check if user has push notifications enabled
SELECT COALESCE(push_notifications, true)
INTO v_send_push
FROM public.notification_preferences
WHERE user_id = p_user_id;

-- If push enabled, we'll handle it via database trigger
-- (Edge functions can't be called directly from SQL functions efficiently)
```

**New File:** `supabase/migrations/20260412_add_notification_trigger.sql`

Create a database trigger that calls the edge function when a notification is created:

```sql
-- Note: Supabase doesn't support calling edge functions from triggers directly
-- Instead, we'll use Supabase Realtime to listen for new notifications
-- and send push notifications from the client-side when app is in background
-- OR use a separate background worker service

-- For simplicity, we'll enhance the client-side to send push notifications
-- when the app detects a new notification while in background
```

**Alternative Approach (Recommended):**

Update the edge functions that create notifications to also send push:

**File:** `supabase/functions/notify-booking-status/index.ts`

After creating the in-app notification, add:

```typescript
// Send push notification if user has subscriptions
const { data: pushSubscriptions } = await supabase
  .from('push_subscriptions')
  .select('*')
  .eq('user_id', booking.user_id)
  .eq('is_active', true);

if (pushSubscriptions && pushSubscriptions.length > 0) {
  await supabase.functions.invoke('send-push-notification', {
    body: {
      userId: booking.user_id,
      title: statusMsg.title,
      body: statusMsg.message,
      url: `/dashboard/bookings`,
      type: `booking_${newStatus}`,
      notificationId: notificationId
    }
  });
}
```

### Step 8: Create Push Notification Permission Component

**New File:** `src/components/PushNotificationPrompt.tsx`

User-friendly permission request component:

```tsx
import { useState, useEffect } from "react";
import { Bell, BellOff, X, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  subscribeToPush, 
  unsubscribeFromPush, 
  getNotificationPermission,
  isPushSupported 
} from "@/utils/pushNotifications";
import { toast } from "sonner";

interface PushNotificationPromptProps {
  userId: string | null;
}

const PushNotificationPrompt = ({ userId }: PushNotificationPromptProps) => {
  const [showPrompt, setShowPrompt] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!userId) return;
    
    const perm = getNotificationPermission();
    setPermission(perm);
    
    // Show prompt if permission is default (not granted or denied)
    if (perm === 'default' && isPushSupported()) {
      const hasSeenPrompt = localStorage.getItem('push_prompt_seen');
      if (!hasSeenPrompt) {
        setShowPrompt(true);
      }
    }
  }, [userId]);

  const handleSubscribe = async () => {
    if (!userId) return;
    setLoading(true);

    try {
      const success = await subscribeToPush(userId);
      if (success) {
        setIsSubscribed(true);
        setPermission('granted');
        toast.success('Push notifications enabled!');
      } else {
        toast.error('Failed to enable push notifications');
      }
    } catch (error) {
      toast.error('Failed to subscribe to notifications');
    } finally {
      setLoading(false);
      setShowPrompt(false);
      localStorage.setItem('push_prompt_seen', 'true');
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('push_prompt_seen', 'true');
  };

  if (!showPrompt || !userId || !isPushSupported()) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50"
      >
        <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 p-5">
          <button
            onClick={handleDismiss}
            className="absolute top-3 right-3 p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg"
          >
            <X className="w-4 h-4 text-zinc-500" />
          </button>

          <div className="flex items-start gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/30 flex items-center justify-center flex-shrink-0">
              <Bell className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="font-semibold text-zinc-900 dark:text-white mb-1">
                Never Miss an Update
              </h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Get instant notifications about your bookings, even when the app is closed.
              </p>
            </div>
          </div>

          <div className="space-y-2 mb-4">
            <div className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
              <Check className="w-4 h-4 text-emerald-500" />
              <span>Booking status updates</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
              <Check className="w-4 h-4 text-emerald-500" />
              <span>Technician assignments</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
              <Check className="w-4 h-4 text-emerald-500" />
              <span>Works in background</span>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleSubscribe}
              disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors disabled:opacity-50"
            >
              {loading ? 'Enabling...' : 'Enable Notifications'}
            </button>
            <button
              onClick={handleDismiss}
              className="px-4 py-2 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors"
            >
              Not Now
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PushNotificationPrompt;
```

### Step 9: Update NotificationSettings Component

**File:** `src/components/NotificationSettings.tsx`

Add push notification toggles to the settings UI:

Add these new fields to the preferences state and UI:

```tsx
// Add to interface
push_notifications: boolean;
push_booking_created: boolean;
push_booking_confirmed: boolean;
push_booking_assigned: boolean;
push_booking_completed: boolean;
push_booking_cancelled: boolean;

// Add to UI after email notification toggles
<div className="space-y-4">
  <div className="flex items-center justify-between p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50">
    <div>
      <p className="text-sm font-medium text-zinc-900 dark:text-white">Push Notifications</p>
      <p className="text-xs text-zinc-500 mt-0.5">Browser notifications (works when app is closed)</p>
    </div>
    <Switch
      checked={preferences.push_notifications}
      onCheckedChange={(checked) => handleUpdate('push_notifications', checked)}
    />
  </div>
  
  {/* Add individual push notification type toggles */}
</div>
```

### Step 10: Integrate Push Prompt into Layouts

**File:** `src/pages/admin/AdminLayout.tsx`
**File:** `src/pages/user/UserLayout.tsx`
**File:** `src/pages/technician/TechnicianLayout.tsx`

Add the PushNotificationPrompt component to each layout:

```tsx
import PushNotificationPrompt from "@/components/PushNotificationPrompt";

// Inside the layout component, after other components:
<PushNotificationPrompt userId={user?.id || null} />
```

### Step 11: Enhance useNotifications Hook with Background Detection

**File:** `src/hooks/useNotifications.ts`

Add visibility change detection to send push when app goes to background:

```typescript
// Add to the useEffect that sets up realtime
useEffect(() => {
  // Track if app is in background
  const handleVisibilityChange = () => {
    if (document.visibilityState === 'hidden') {
      // App is in background, subsequent notifications will be push
      console.log('App moved to background');
    }
  };

  document.addEventListener('visibilitychange', handleVisibilityChange);
  
  return () => {
    document.removeEventListener('visibilitychange', handleVisibilityChange);
  };
}, []);
```

### Step 12: Update .env Configuration

**File:** `.env`

Add VAPID configuration:

```env
# Web Push Configuration
VITE_VAPID_PUBLIC_KEY=your_vapid_public_key_here
VAPID_PRIVATE_KEY=your_vapid_private_key_here
VAPID_SUBJECT=mailto:admin@electroobuddy.com
```

### Step 13: Update vite.config.ts for Service Worker

**File:** `vite.config.ts`

Ensure service worker is copied to dist:

```typescript
export default defineConfig({
  // ... existing config
  build: {
    rollupOptions: {
      // Ensure sw.js is not processed by Vite
      input: {
        main: resolve(__dirname, 'index.html'),
      },
    },
  },
});
```

### Step 14: Create Setup Documentation

**New File:** `PUSH_NOTIFICATIONS_SETUP.md`

Comprehensive guide covering:
- VAPID key generation
- Service worker registration
- Browser compatibility
- Testing push notifications
- Troubleshooting common issues
- Production deployment notes

## Testing Strategy

1. **Permission Flow**
   - Test permission request prompt
   - Test granted/denied states
   - Test permission change handling

2. **Service Worker**
   - Verify registration in Chrome DevTools
   - Test push event handling
   - Test notification click handling

3. **Real-time Updates**
   - Create booking with website open (should show toast)
   - Create booking with website closed (should show push notification)
   - Update booking status in both scenarios

4. **Cross-browser Testing**
   - Chrome (full support)
   - Firefox (full support)
   - Safari (partial support - requires macOS/iOS)
   - Edge (full support)

5. **Mobile Testing**
   - Android Chrome (full support)
   - iOS Safari (requires PWA installation)

## Browser Compatibility

| Browser | Desktop Push | Mobile Push | Notes |
|---------|-------------|-------------|-------|
| Chrome  | ✅ Yes       | ✅ Yes       | Full support |
| Firefox | ✅ Yes       | ✅ Yes       | Full support |
| Edge    | ✅ Yes       | ✅ Yes       | Full support |
| Safari  | ✅ Yes       | ⚠️ Limited   | Requires PWA on iOS |
| Opera   | ✅ Yes       | ✅ Yes       | Full support |

## Security Considerations

1. VAPID keys must be kept secure (private key in .env only)
2. Push subscriptions are tied to authenticated users
3. RLS policies prevent unauthorized subscription access
4. Service worker only receives notifications for subscribed user

## Deployment Steps

1. Generate VAPID keys
2. Add keys to .env
3. Run database migration
4. Deploy service worker (public/sw.js)
5. Deploy send-push-notification edge function
6. Test permission flow
7. Test push notifications with app closed
8. Monitor push subscription storage

## Expected Outcome

After implementation:
- Users see a permission prompt on first visit
- With permission granted, they receive browser push notifications
- Notifications work even when the website is closed
- Existing Supabase Realtime continues for in-app notifications
- Users can manage preferences in settings
- All three panels (Admin, User, Technician) support push notifications
