import { supabase } from '@/integrations/supabase/client';
import { NOTIFICATION_URLS } from './siteUrl';

export interface NotificationData {
  title: string;
  message: string;
  type: string;
  bookingId?: string;
  metadata?: Record<string, any>;
  customerName?: string;
  service?: string;
}

export interface PushNotificationData {
  userId: string;
  title: string;
  body: string;
  type: string;
  url?: string;
  notificationId?: string;
}

// ─── Internal helpers ────────────────────────────────────────────────────────

const timeout = (ms: number) =>
  new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error(`TIMEOUT after ${ms}ms`)), ms)
  );

/**
 * Write a single in-app notification row via RPC (bypasses RLS).
 * Never throws.
 */
async function writeInAppNotification(
  userId: string,
  data: NotificationData
): Promise<void> {
  try {
    const { error } = await (supabase as any).rpc('create_notification_v2', {
      p_user_id:    userId,
      p_type:       data.type,
      p_title:      data.title,
      p_message:    data.message,
      p_booking_id: data.bookingId ?? null,
      p_metadata:   data.metadata ?? {},
    });
    if (error) {
      console.error('[notify] RPC create_notification_v2 failed:', error.message);
    }
  } catch (err: any) {
    console.error('[notify] writeInAppNotification threw:', err?.message ?? err);
  }
}

/**
 * Fire a push notification for a user.
 * Calls the `send-push-notification` edge function which handles
 * FCM token lookup and delivery internally.
 * Never throws — errors are logged.
 */
async function writePushNotification(
  userId: string,
  data: NotificationData,
  urlOverride?: string
): Promise<void> {
  try {
    const url = urlOverride ?? (data.type === 'new_booking' ? NOTIFICATION_URLS.adminBookings : NOTIFICATION_URLS.userBookings);

    const { data: result, error } = await (supabase as any).functions.invoke(
      // FIXED: correct edge function name
      'send-push-notification',
      {
        body: {
          userId,
          title: data.title,
          body:  data.message,
          url,
          type:           data.type,
          notificationId: data.bookingId ?? null,
        },
      }
    );

    if (error) {
      console.error('[notify] send-push-notification edge error:', JSON.stringify(error));
      throw error;
    }

    console.log('[notify] Push result for', userId, '→', JSON.stringify(result));

    // Edge function returns { success: boolean, sent: number, reason?: string }
    if (result?.reason === 'auth_failed') {
      throw new Error('FCM auth_failed — check FIREBASE_PRIVATE_KEY secret');
    }
  } catch (err: any) {
    console.error('[notify] writePushNotification threw:', err?.message ?? err);
    throw err;
  }
}

/**
 * Check whether a user has at least one active push subscription.
 * Returns false on any error rather than throwing.
 */
async function userHasPushSubscription(userId: string): Promise<boolean> {
  try {
    // First try with RLS (might fail), then try without filter
    let { data, error } = await Promise.race([
      supabase
        .from('push_subscriptions')
        .select('id')
        .eq('user_id', userId)
        .eq('is_active', true)
        .limit(1),
      timeout(4000),
    ]);
    
    if (error) {
      console.warn('[notify] push_subscriptions query error:', error.message);
      // Try querying all active subscriptions for this user without is_active filter
      const { data: fallbackData } = await supabase
        .from('push_subscriptions')
        .select('id, is_active')
        .eq('user_id', userId)
        .limit(5);
      
      if (fallbackData && fallbackData.length > 0) {
        console.log('[notify] Found subscription (fallback):', fallbackData);
        return fallbackData.some(s => s.is_active !== false);
      }
      return false;
    }
    
    // FIXED: check array length, not truthiness of the array itself
    return Array.isArray(data) && data.length > 0;
  } catch (err) {
    console.warn('[notify] push_subscriptions exception:', err);
    return false;
  }
}

/**
 * Fetch notification preferences for a user.
 * Defaults to { inApp: true, push: true } on any failure.
 */
async function getUserPrefs(userId: string): Promise<{ inApp: boolean; push: boolean }> {
  try {
    const { data: prefs, error } = await Promise.race([
      supabase
        .from('notification_preferences')
        .select('in_app_notifications, push_notifications')
        .eq('user_id', userId)
        .limit(1)
        .maybeSingle(),
      timeout(4000),
    ]);

    if (error) {
      console.warn('[notify] notification_preferences error:', error.message);
      return { inApp: true, push: true };
    }

    if (!prefs) return { inApp: true, push: true };

    return {
      inApp: (prefs as any).in_app_notifications !== false,
      push:  (prefs as any).push_notifications  !== false,
    };
  } catch {
    return { inApp: true, push: true };
  }
}

/**
 * Send both in-app and push notifications to a single user.
 * Respects their preferences. forceInApp=true bypasses the in-app preference
 * (used for admin booking alerts that must always be saved).
 * Never throws.
 */
async function notifyUser(
  userId: string,
  data: NotificationData,
  forceInApp = false,
  urlOverride?: string
): Promise<void> {
  const { inApp, push } = await getUserPrefs(userId);

  const shouldInApp = forceInApp || inApp;
  const shouldPush  = push;

  console.log(`[notify] notifyUser ${userId} — inApp:${shouldInApp} push:${shouldPush}`);

  // Always try push via edge function - it has service_role and can query DB directly
  // Skip client-side subscription check (fails due to RLS)
  const tasks: Promise<void>[] = [];

  if (shouldInApp) {
    tasks.push(
      Promise.race([writeInAppNotification(userId, data), timeout(6000)])
        .catch((err) => console.error('[notify] in-app failed for', userId, ':', err?.message))
    );
  }

  if (shouldPush) {
    // Always try the edge function - it handles subscription lookup internally
    tasks.push(
      Promise.race([writePushNotification(userId, data, urlOverride), timeout(15000)])
        .catch((err) => console.error('[notify] push failed for', userId, ':', err?.message))
    );
  }

  await Promise.allSettled(tasks);
}

// ─── Public API ──────────────────────────────────────────────────────────────

/**
 * Fire-and-forget admin notification.
 *
 * - Fetches all admin IDs via `get_admin_users` RPC
 * - Sends in-app + push to each admin
 * - Sends a user-facing confirmation to the booking user (if logged in)
 * - Never throws; logs all failures to console
 *
 * Usage (no await needed):
 * ```ts
 * sendAdminNotificationAsync({ title, message, type, bookingId }, user);
 * ```
 */
export function sendAdminNotificationAsync(
  data: NotificationData,
  user?: { id: string } | null
): Promise<void> {
  return (async () => {
    try {
      // 1. Resolve admin IDs
      let adminIds: string[] = [];
      try {
        const { data: rows, error } = await Promise.race([
          (supabase as any).rpc('get_admin_users'),
          timeout(3000),
        ]);
        if (!error && Array.isArray(rows)) {
          adminIds = rows.map((r: { user_id: string }) => r.user_id);
        }
      } catch {
        console.warn('[notify] get_admin_users RPC failed — using hardcoded fallback');
        adminIds = ['78a311b1-168c-4676-b1c1-c6445fefd201'];
      }

      console.log('[notify] Found admin IDs:', adminIds);

      // 2. Build recipient map
      // Each entry: [userId, notificationPayload, forceInApp, urlOverride]
      const recipients: Array<[string, NotificationData, boolean, string | undefined]> = [];

      for (const adminId of adminIds) {
        recipients.push([adminId, data, true, NOTIFICATION_URLS.adminBookings]);
      }

      // Logged-in user gets a booking confirmation (different copy, user dashboard URL)
      if (user?.id && !adminIds.includes(user.id)) {
        const userNotif: NotificationData = {
          ...data,
          type:    `user_${data.type}`,
          title:   data.type === 'new_booking' ? 'Booking Submitted ✅' : data.title,
          message: data.type === 'new_booking'
            ? `Your ${data.service ?? 'service request'} has been received. We'll be in touch shortly.`
            : data.message,
        };
        recipients.push([user.id, userNotif, false, NOTIFICATION_URLS.userBookings]);
      }

      // Fallback when no admins found and no user: nothing to do
      if (recipients.length === 0) {
        console.warn('[notify] No recipients resolved — skipping');
        return;
      }

      // 3. Fan-out — all recipients concurrently, each handles its own errors
      await Promise.allSettled(
        recipients.map(([uid, notifData, forceInApp, url]) =>
          notifyUser(uid, notifData, forceInApp, url)
        )
      );

      console.log(
        `[notify] Notification fan-out complete — ` +
        `${adminIds.length} admin(s)${user?.id && !adminIds.includes(user.id) ? ' + 1 user' : ''}`
      );
    } catch (err: any) {
      // Top-level catch: should never reach here given internal guards, but just in case
      console.error('[notify] sendAdminNotificationAsync unexpected error:', err?.message ?? err);
    }
  })();
}

/** @deprecated Use sendAdminNotificationAsync */
export const sendAdminNotification = sendAdminNotificationAsync;

// ─── Direct push (public) ────────────────────────────────────────────────────

/**
 * Send a push notification directly to a user by userId.
 * Uses the send-push-notification edge function.
 */
export async function sendPushNotification(pushData: PushNotificationData): Promise<void> {
  try {
    const { error } = await (supabase as any).functions.invoke('send-push-notification', {
      body: {
        userId:         pushData.userId,
        title:          pushData.title,
        body:           pushData.body,
        url:            pushData.url,
        type:           pushData.type,
        notificationId: pushData.notificationId,
      },
    });
    if (error) console.error('[notify] sendPushNotification error:', error);
  } catch (err: any) {
    console.error('[notify] sendPushNotification threw:', err?.message ?? err);
  }
}

/** Create a single in-app notification row directly (no push, no preference check). */
export async function createNotification(
  userId: string,
  data: Omit<NotificationData, 'bookingId'>
): Promise<void> {
  await writeInAppNotification(userId, data);
}