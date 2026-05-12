// Push Notification Utilities - Helper functions for sending notifications

import { supabase } from '../services/supabase';

export interface PushNotificationData {
  playerIds: string[];
  title: string;
  message: string;
  url?: string;
  data?: Record<string, any>;
}

/**
 * Send push notification via OneSignal edge function
 */
export async function sendPushNotification(data: PushNotificationData): Promise<{ success: boolean; error?: string }> {
  try {
    const { playerIds, title, message, url, data: notificationData } = data;

    console.log('📤 Sending push notification:', {
      playerIds: playerIds.length,
      title,
      message,
    });

    const response = await supabase.functions.invoke('send-onesignal-notification', {
      body: {
        playerIds,
        title,
        message,
        url,
        data: notificationData,
      },
    });

    if (response.error) {
      console.error('❌ Push notification failed:', response.error);
      return { success: false, error: response.error.message };
    }

    console.log('✅ Push notification sent successfully:', response.data);
    return { success: true };
  } catch (error) {
    console.error('❌ Push notification error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Get active push subscriptions for a user
 */
export async function getUserPushSubscriptions(userId: string): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from('push_subscriptions')
      .select('endpoint')
      .eq('user_id', userId)
      .eq('is_active', true);

    if (error) {
      console.error('❌ Error fetching subscriptions:', error);
      return [];
    }

    return data?.map(sub => sub.endpoint) || [];
  } catch (error) {
    console.error('❌ Error fetching user subscriptions:', error);
    return [];
  }
}

/**
 * Send notification to all admin users
 */
export async function sendToAdmins(title: string, message: string, data?: Record<string, any>): Promise<{ success: boolean; error?: string }> {
  try {
    // Get all admin user push subscriptions
    const { data: adminSubscriptions, error } = await supabase
      .from('push_subscriptions')
      .select('endpoint')
      .eq('is_active', true)
      .in('user_id', ['admin_user']); // Add more admin user IDs as needed

    if (error) {
      console.error('❌ Error fetching admin subscriptions:', error);
      return { success: false, error: error.message };
    }

    const playerIds = adminSubscriptions?.map(sub => sub.endpoint) || [];
    
    if (playerIds.length === 0) {
      console.log('⚠️ No admin devices registered for push notifications');
      return { success: true }; // Not an error, just no devices
    }

    return await sendPushNotification({
      playerIds,
      title,
      message,
      data,
    });
  } catch (error) {
    console.error('❌ Error sending to admins:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Send notification to specific user
 */
export async function sendToUser(userId: string, title: string, message: string, data?: Record<string, any>): Promise<{ success: boolean; error?: string }> {
  try {
    const playerIds = await getUserPushSubscriptions(userId);
    
    if (playerIds.length === 0) {
      console.log(`⚠️ No devices registered for user: ${userId}`);
      return { success: true }; // Not an error, just no devices
    }

    return await sendPushNotification({
      playerIds,
      title,
      message,
      data,
    });
  } catch (error) {
    console.error('❌ Error sending to user:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Send booking notification to admins
 */
export async function sendBookingNotification(booking: {
  id: string;
  name: string;
  service_type: string;
  phone: string;
  email?: string;
}): Promise<{ success: boolean; error?: string }> {
  const title = '🔔 New Booking Received';
  const message = `${booking.name} - ${booking.service_type}`;
  
  return await sendToAdmins(title, message, {
    type: 'new_booking',
    bookingId: booking.id,
    customerName: booking.name,
    service: booking.service_type,
    customerPhone: booking.phone,
    customerEmail: booking.email,
    url: '/admin',
  });
}

/**
 * Send status update notification to customer
 */
export async function sendStatusUpdateNotification(
  userId: string,
  bookingId: string,
  status: string,
  serviceType: string
): Promise<{ success: boolean; error?: string }> {
  const statusMessages: Record<string, { title: string; message: string }> = {
    confirmed: {
      title: '✅ Booking Confirmed',
      message: `Your ${serviceType} booking has been confirmed!`,
    },
    in_progress: {
      title: '🔧 Work Started',
      message: `Your ${serviceType} service is now in progress.`,
    },
    completed: {
      title: '✅ Service Completed',
      message: `Your ${serviceType} service has been completed.`,
    },
    cancelled: {
      title: '❌ Booking Cancelled',
      message: `Your ${serviceType} booking has been cancelled.`,
    },
  };

  const statusMessage = statusMessages[status];
  if (!statusMessage) {
    console.warn(`⚠️ Unknown status: ${status}`);
    return { success: true };
  }

  return await sendToUser(userId, statusMessage.title, statusMessage.message, {
    type: 'status_update',
    bookingId,
    status,
    url: '/track-booking',
  });
}
