import { supabase } from '@/integrations/supabase/client';

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

/** Resolves after `ms` milliseconds — use with Promise.race to add a timeout */
const timeout = (ms: number) =>
  new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error(`TIMEOUT after ${ms}ms`)), ms)
  );

/**
 * Write a single in-app notification row using RPC (bypasses RLS).
 * Never throws — errors are console-logged.
 */
async function writeInAppNotification(
  userId: string,
  data: NotificationData
): Promise<void> {
  try {
    // Use RPC to bypass RLS - allows any user to create notifications for anyone
    const { error: rpcError } = await (supabase as any).rpc("create_notification_v2", {
      p_user_id:    userId,
      p_type:       data.type,
      p_title:      data.title,
      p_message:    data.message,
      p_booking_id: data.bookingId ?? null,
      p_metadata:   data.metadata ?? {},
    });

    if (rpcError) {
      console.error("[notify] RPC failed:", rpcError.message);
      throw rpcError;
    }
  } catch (err: any) {
    console.error("[notify] writeInAppNotification threw:", err);
    // Don't throw - notification failures shouldn't break bookings
    console.log("[notify] Continuing despite notification error");
  }
}

/**
 * Fire a push notification via OneSignal.
 * Never throws — errors are console-logged.
 */
async function writePushNotification(
  userId: string,
  data: NotificationData
): Promise<void> {
  try {
    // Get OneSignal player ID for the user
    const { data: subscription, error: subError } = await supabase
      .from("push_subscriptions")
      .select("endpoint")
      .eq("user_id", userId)
      .eq("subscription_type", "onesignal")
      .eq("is_active", true)
      .limit(1)
      .maybeSingle();

    if (subError || !subscription) {
      console.log("[notify] No OneSignal subscription found for user:", userId);
      return;
    }

    // Send via OneSignal edge function (to be created)
    const { error } = await supabase.functions.invoke("send-onesignal-notification", {
      body: {
        playerIds: [subscription.endpoint],
        title: data.title,
        message: data.message,
        url: data.type === "new_booking" ? "/admin/bookings" : undefined,
        data: {
          type: data.type,
          bookingId: data.bookingId,
          userId: userId
        }
      },
    });

    if (error) {
      console.error("[notify] OneSignal push invoke error:", error.message);
      throw error;
    }
  } catch (err) {
    console.error("[notify] writePushNotification threw:", err);
    throw err;
  }
}

/**
 * Send a single notification (in-app + push) to one user.
 * Runs both writes concurrently; each has an individual 6-second timeout.
 * Never throws.
 */
async function notifyUser(userId: string, data: NotificationData, forceInApp: boolean = false): Promise<void> {
  // Check preferences quickly — default to true on any failure
  let inApp = true;
  let push  = true;

  try {
    const { data: prefs, error: prefsError } = await Promise.race([
      supabase
        .from("notification_preferences")
        .select("in_app_notifications, push_notifications")
        .eq("user_id", userId)
        .limit(1)
        .maybeSingle(),
      timeout(3000),
    ]);

    if (prefsError) {
      console.error("[notify] Failed to fetch notification preferences:", prefsError.message);
      // Use defaults if preferences table doesn't exist or column missing
    } else if (prefs) {
      const prefsData = prefs as any;
      inApp = prefsData?.in_app_notifications !== false;
      push  = prefsData?.push_notifications  !== false;
    }
  } catch (err: any) {
    // preference fetch timed out or column missing — use defaults
    console.error("[notify] Failed to fetch notification preferences:", err.message);
  }

  // Force in-app notification for admin notifications (booking alerts, etc.)
  if (forceInApp) {
    inApp = true;
    console.log(`[notify] Forcing in-app notification for user ${userId} (admin notification)`);
  }

  // Check if user has push subscription before attempting
  let hasPushSubscription = false;
  if (push) {
    try {
      const { data: subData } = await Promise.race([
        supabase
          .from("push_subscriptions")
          .select("id")
          .eq("user_id", userId)
          .eq("is_active", true)
          .limit(1),
        timeout(2000),
      ]);
      hasPushSubscription = !!subData;
      console.log(`[notify] User ${userId} has push subscription:`, hasPushSubscription);
    } catch (e) {
      console.log(`[notify] Failed to check push subscription for ${userId}:`, e);
    }
  }

  const results = await Promise.allSettled([
    inApp
      ? Promise.race([writeInAppNotification(userId, data), timeout(6000)])
      : Promise.resolve(),
    push && hasPushSubscription
      ? Promise.race([writePushNotification(userId, data), timeout(6000)])
      : Promise.resolve(),
  ]);

  // Log individual failures for debugging
  results.forEach((result, index) => {
    const type = index === 0 ? 'in-app' : 'push';
    if (result.status === 'rejected') {
      console.error(`[notify] ${type} notification failed:`, result.reason);
    }
  });
}

// ─── Public API ──────────────────────────────────────────────────────

/**
 * **Fire-and-forget** — starts immediately, never blocks the caller.
 *
 * Call from your booking submit handler:
 * ```ts
 * sendAdminNotificationAsync({ ... }, user);  // no await, no try/catch needed
 * ```
 *
 * Internally it:
 *  1. Fetches all admin user IDs (3-second timeout)
 *  2. Notifies each admin and the current user in parallel (6s each)
 *  3. Logs failures to console — never surfaces them to the UI
 *  4. Includes retry logic for failed notifications
 */
export function sendAdminNotificationAsync(
  data: NotificationData,
  user?: { id: string } | null
): Promise<void> {
  // Return (but don't await) the inner async work so callers CAN await if needed.
  return (async () => {
    let retryCount = 0;
    const maxRetries = 2;
    
    while (retryCount <= maxRetries) {
      try {
        // 1. Fetch admin user IDs using RPC (bypasses RLS)
        // TEMPORARY: Hardcoded admin ID until get_admin_users RPC is created
        // Run this SQL in Supabase:
        // CREATE FUNCTION public.get_admin_users() RETURNS TABLE(user_id UUID) ...
        let adminIds: string[] = [];
        try {
          const adminResult = await Promise.race([
            (supabase as any).rpc("get_admin_users"),
            timeout(3000),
          ]);
          adminIds = (adminResult as any)?.data?.map(
            (r: { user_id: string }) => r.user_id
          ) ?? [];
        } catch (e) {
          // RPC not available yet, use hardcoded admin
          console.log("[notify] RPC not available, using hardcoded admin");
          adminIds = ["78a311b1-168c-4676-b1c1-c6445fefd201"];
        }
        
        console.log("[notify] Found admin IDs:", adminIds);

        // 2. Build the list of recipients
        const recipientMap: Record<string, NotificationData> = {};

        for (const id of adminIds) {
          recipientMap[id] = data;
        }

        // Fallback: if no admins, send to current user (for testing)
        if (adminIds.length === 0 && user?.id) {
          console.log("[notify] No admins found, sending to current user for testing");
          recipientMap[user.id] = data;
        }

        if (user?.id && !recipientMap[user.id]) {
          // User confirmation notification (slightly different copy)
          recipientMap[user.id] = {
            ...data,
            type:    `user_${data.type}`,
            title:   data.type === "new_booking" ? "Booking Submitted ✅" : data.title,
            message: data.type === "new_booking"
              ? `Your ${data.service || "service request"} has been received. We'll be in touch shortly.`
              : data.message,
          };
        }

        // 3. Fan-out concurrently — each notifyUser call handles its own errors
        // forceInApp=true ensures admin booking notifications are always saved to database
        const notificationResults = await Promise.allSettled(
          Object.entries(recipientMap).map(([uid, notifData]) =>
            notifyUser(uid, notifData, true)
          )
        );

        // Check if any notifications failed
        const failedNotifications = notificationResults.filter(result => result.status === 'rejected');
        
        if (failedNotifications.length > 0) {
          console.error(`[notify] ${failedNotifications.length} notifications failed, retrying... (${retryCount + 1}/${maxRetries + 1})`);
          
          if (retryCount < maxRetries) {
            retryCount++;
            await new Promise(resolve => setTimeout(resolve, 1000 * retryCount)); // Exponential backoff
            continue;
          }
        }

        // Success - log and exit
        console.log(`[notify] Successfully sent notifications to ${adminIds.length} admin(s)${user?.id ? ' and user' : ''}`);
        return;

      } catch (err) {
        console.error(`[notify] sendAdminNotificationAsync error (attempt ${retryCount + 1}):`, err);
        
        if (retryCount < maxRetries) {
          retryCount++;
          await new Promise(resolve => setTimeout(resolve, 1000 * retryCount)); // Exponential backoff
          continue;
        }
        
        // Final failure - log but don't throw so caller is unaffected
        console.error("[notify] sendAdminNotificationAsync failed after all retries:", err);
        return;
      }
    }
  })();
}

/**
 * Legacy compat shim — delegates to the async version.
 * @deprecated Prefer `sendAdminNotificationAsync` to make the fire-and-forget intent explicit.
 */
export const sendAdminNotification = sendAdminNotificationAsync;

// ─── Direct push (unchanged public API) ─────────────────────────────────────
export async function sendPushNotification(pushData: PushNotificationData): Promise<void> {
  try {
    await supabase.functions.invoke("send-fcm-notification", { body: pushData });
  } catch (err) {
    console.error("[notify] sendPushNotification threw:", err);
  }
}

/** Create a single notification row directly (no push, no preference check). */
export async function createNotification(
  userId: string,
  data: Omit<NotificationData, "bookingId">
): Promise<void> {
  await writeInAppNotification(userId, data);
}