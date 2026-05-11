// OneSignal Service - handles all push notification logic

import { OneSignal } from '@onesignal/react-native';
import notifee, { AndroidImportance, EventType } from '@notifee/react-native';
import { supabase } from './supabase';

const ONESIGNAL_APP_ID = 'YOUR_ONESIGNAL_APP_ID';
const ADMIN_USER_ID = 'YOUR_ADMIN_USER_ID';

class NotificationService {
  private initialized = false;

  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      // Initialize OneSignal
      await OneSignal.init(ONESIGNAL_APP_ID);
      console.log('[NotificationService] OneSignal initialized');

      // Set up OneSignal event handlers
      this.setupOneSignalHandlers();

      // Set up Notifee
      await this.setupNotifee();

      // Set external user ID
      await OneSignal.User.setExternalUserId(ADMIN_USER_ID);

      // Opt in to push notifications
      await this.optIn();

      this.initialized = true;
    } catch (error) {
      console.error('[NotificationService] Initialization error:', error);
    }
  }

  private setupOneSignalHandlers(): void {
    // Handle notification clicks
    OneSignal.Notifications.addEventListener('click', (event) => {
      console.log('[NotificationService] Notification clicked:', event);
      
      if (event.notification?.data?.booking_id) {
        // Handle navigation to booking details
        // This would be handled by your navigation service
      }
    });

    // Handle notification foreground display
    OneSignal.Notifications.addEventListener('foregroundWillDisplay', (event) => {
      console.log('[NotificationService] Foreground notification:', event);
      // Prevent default to show custom UI
      event.preventDefault();
    });
  }

  private async setupNotifee(): Promise<void> {
    // Request permissions
    await notifee.requestPermission();

    // Create notification channel
    await notifee.createChannel({
      id: 'bookings',
      name: 'Booking Notifications',
      importance: AndroidImportance.HIGH,
      sound: 'default',
      vibration: true,
    });

    // Set background handler
    notifee.setBackgroundMessageHandler(async ({ notification }) => {
      console.log('[NotificationService] Background notification:', notification);
    });

    // Foreground event handler
    notifee.onForegroundEvent(({ type, detail }) => {
      console.log('[NotificationService] Foreground event:', type, detail);
      
      if (type === EventType.PRESS && detail.notification?.data?.booking_id) {
        // Navigate to booking details
      }
    });
  }

  async optIn(): Promise<void> {
    try {
      const deviceState = await OneSignal.User.PushSubscription.optIn();
      console.log('[NotificationService] Opt-in result:', deviceState);

      if (deviceState) {
        const pushSubscription = await OneSignal.User.PushSubscription.getState();
        console.log('[NotificationService] Push subscription state:', pushSubscription);

        if (pushSubscription.id) {
          await this.saveSubscription(pushSubscription.id);
        }
      }
    } catch (error) {
      console.error('[NotificationService] Opt-in error:', error);
    }
  }

  async saveSubscription(playerId: string): Promise<void> {
    try {
      await supabase.from('push_subscriptions').upsert(
        {
          user_id: ADMIN_USER_ID,
          endpoint: playerId,
          subscription_type: 'onesignal',
          subscription: {
            onesignal: true,
            subscription_id: playerId,
            app_id: ONESIGNAL_APP_ID,
          },
          is_active: true,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'endpoint' }
      );
      console.log('[NotificationService] Subscription saved');
    } catch (error) {
      console.error('[NotificationService] Save subscription error:', error);
    }
  }

  async displayLocalNotification(
    title: string,
    body: string,
    data?: Record<string, any>
  ): Promise<void> {
    try {
      await notifee.displayNotification({
        title,
        body,
        android: {
          channelId: 'bookings',
          importance: AndroidImportance.HIGH,
          pressAction: { id: 'default' },
        },
        data,
      });
    } catch (error) {
      console.error('[NotificationService] Display notification error:', error);
    }
  }

  async unsubscribe(): Promise<void> {
    try {
      await OneSignal.User.PushSubscription.optOut();
      console.log('[NotificationService] Unsubscribed');
    } catch (error) {
      console.error('[NotificationService] Unsubscribe error:', error);
    }
  }
}

export const notificationService = new NotificationService();
