// Browser Notification Utilities - Real-time in-browser notifications for admin

import { supabase } from '@/integrations/supabase/client';

// Admin user ID - replace with actual admin ID
const ADMIN_USER_ID = '78a311b1-168c-4676-b1c1-c6445fefd201';

export interface BrowserNotificationData {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: Record<string, any>;
  url?: string;
}

let notificationPermission: NotificationPermission = 'default';
let realtimeSubscription: any = null;

export function isNotificationSupported(): boolean {
  return 'Notification' in window && 'serviceWorker' in navigator;
}

export function getNotificationPermission(): NotificationPermission {
  if (isNotificationSupported()) {
    return Notification.permission;
  }
  return 'denied';
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (!isNotificationSupported()) {
    console.log('[BrowserNotify] Notifications not supported');
    return false;
  }

  if (Notification.permission === 'granted') {
    notificationPermission = 'granted';
    return true;
  }

  if (Notification.permission === 'denied') {
    console.log('[BrowserNotify] Notification permission denied');
    return false;
  }

  try {
    const permission = await Notification.requestPermission();
    notificationPermission = permission;
    console.log('[BrowserNotify] Permission result:', permission);
    return permission === 'granted';
  } catch (error) {
    console.error('[BrowserNotify] Permission request error:', error);
    return false;
  }
}

export async function showBrowserNotification(data: BrowserNotificationData): Promise<Notification | null> {
  if (!isNotificationSupported()) {
    console.log('[BrowserNotify] Not supported');
    return null;
  }

  if (Notification.permission !== 'granted') {
    console.log('[BrowserNotify] Permission not granted');
    return null;
  }

  try {
    const options: NotificationOptions = {
      body: data.body,
      icon: data.icon || '/favicon_io/android-chrome-192x192.png',
      badge: data.badge || '/favicon_io/favicon-32x32.png',
      tag: data.tag || 'electroobuddy-notification',
      data: data.data,
      requireInteraction: false,
      silent: false,
    };

    const notification = new Notification(data.title, options);

    // Handle notification click
    notification.onclick = (event) => {
      event.preventDefault();
      notification.close();
      
      if (data.url) {
        window.focus();
        window.location.href = data.url;
      } else if (data.data?.bookingId) {
        window.focus();
        window.location.href = `/admin/bookings/${data.data.bookingId}`;
      } else {
        window.focus();
      }
    };

    // Auto close after 10 seconds
    setTimeout(() => notification.close(), 10000);

    console.log('[BrowserNotify] Notification shown:', data.title);
    return notification;
  } catch (error) {
    console.error('[BrowserNotify] Error showing notification:', error);
    return null;
  }
}

export async function initializeBrowserNotifications(): Promise<void> {
  console.log('[BrowserNotify] Initializing...');

  // Check if supported
  if (!isNotificationSupported()) {
    console.log('[BrowserNotify] Not supported in this browser');
    return;
  }

  // Request permission if not already granted
  if (Notification.permission !== 'granted') {
    console.log('[BrowserNotify] Requesting permission...');
    const granted = await requestNotificationPermission();
    if (!granted) {
      console.log('[BrowserNotify] Permission not granted');
      return;
    }
  }

  console.log('[BrowserNotify] Permission granted, setting up realtime...');

  // Set up Supabase realtime subscription for new bookings
  setupRealtimeSubscription();
}

export function setupRealtimeSubscription(): void {
  // Clean up existing subscription
  if (realtimeSubscription) {
    realtimeSubscription.unsubscribe();
  }

  realtimeSubscription = supabase
    .channel('admin-booking-notifications')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'bookings',
      },
      async (payload) => {
        console.log('[BrowserNotify] New booking detected:', payload.new);
        
        const booking = payload.new as any;
        
        // Show browser notification
        await showBrowserNotification({
          title: '🔔 New Booking Received!',
          body: `${booking.name} - ${booking.service_type}\n📍 ${booking.address}`,
          tag: `booking-${booking.id}`,
          data: {
            type: 'new_booking',
            bookingId: booking.id,
            customerName: booking.name,
            serviceType: booking.service_type,
          },
          url: `/admin/bookings/${booking.id}`,
        });

        // Also save to notifications table for persistence
        await saveNotificationToDatabase(booking);
      }
    )
    .subscribe();

  console.log('[BrowserNotify] Realtime subscription active');
}

async function saveNotificationToDatabase(booking: any): Promise<void> {
  try {
    await (supabase as any).rpc('create_notification_v2', {
      p_user_id: ADMIN_USER_ID,
      p_type: 'new_booking',
      p_title: 'New Booking Received',
      p_message: `${booking.name} - ${booking.service_type}`,
      p_booking_id: booking.id,
      p_metadata: {
        customer_name: booking.name,
        customer_phone: booking.phone,
        service_type: booking.service_type,
        address: booking.address,
        preferred_date: booking.preferred_date,
        preferred_time: booking.preferred_time,
      },
    });
    console.log('[BrowserNotify] Notification saved to database');
  } catch (error) {
    console.error('[BrowserNotify] Failed to save notification:', error);
  }
}

export function cleanup(): void {
  if (realtimeSubscription) {
    realtimeSubscription.unsubscribe();
    realtimeSubscription = null;
  }
  console.log('[BrowserNotify] Cleanup complete');
}

// ============================================================
// Hook for React components
// ============================================================

export function useBrowserNotifications() {
  const initialize = async () => {
    await initializeBrowserNotifications();
  };

  const notify = async (data: BrowserNotificationData) => {
    await showBrowserNotification(data);
  };

  return {
    isSupported: isNotificationSupported(),
    permission: getNotificationPermission(),
    initialize,
    notify,
    requestPermission: requestNotificationPermission,
  };
}