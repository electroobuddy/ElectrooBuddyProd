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
 * Write a single in-app notification row, trying the RPC first then
 * falling back to a direct insert.  Never throws — errors are console-logged.
 */
async function writeInAppNotification(
  userId: string,
  data: NotificationData
): Promise<void> {
  try {
    // Try RPC (preferred — runs server-side validations / triggers)
    const { error: rpcError } = await supabase.rpc("create_notification", {
      p_user_id:   userId,
      p_type:      data.type,
      p_title:     data.title,
      p_message:   data.message,
      p_booking_id: data.bookingId ?? null,
      p_metadata:  data.metadata ?? {},
    });

    if (!rpcError) return;

    // Fallback: direct insert (handles the case where the RPC doesn't exist yet)
    const { error: insertError } = await supabase.from("notifications").insert({
      user_id:    userId,
      type:       data.type,
      title:      data.title,
      message:    data.message,
      booking_id: data.bookingId ?? null,
      metadata:   data.metadata ?? {},
    });

    if (insertError) {
      console.error("[notify] direct insert failed:", insertError.message);
    }
  } catch (err) {
    console.error("[notify] writeInAppNotification threw:", err);
  }
}

/**
 * Fire a push notification via the edge function.
 * Never throws — errors are console-logged.
 */
async function writePushNotification(
  userId: string,
  data: NotificationData
): Promise<void> {
  try {
    const { error } = await supabase.functions.invoke("send-push-notification", {
      body: {
        userId,
        title:          data.title,
        body:           data.message,
        type:           data.type,
        notificationId: data.bookingId,
        url:            data.type === "new_booking" ? "/admin/bookings" : undefined,
      },
    });
    if (error) console.error("[notify] push invoke error:", error.message);
  } catch (err) {
    console.error("[notify] writePushNotification threw:", err);
  }
}

/**
 * Send a single notification (in-app + push) to one user.
 * Runs both writes concurrently; each has an individual 6-second timeout.
 * Never throws.
 */
async function notifyUser(userId: string, data: NotificationData): Promise<void> {
  // Check preferences quickly — default to true on any failure
  let inApp = true;
  let push  = true;

  try {
    const { data: prefs } = await Promise.race([
      supabase
        .from("notification_preferences")
        .select("in_app_notifications, push_notifications")
        .eq("user_id", userId)
        .single(),
      timeout(3000),
    ]);

    if (prefs) {
      inApp = prefs.in_app_notifications !== false;
      push  = prefs.push_notifications  !== false;
    }
  } catch {
    // preference fetch timed out or column missing — use defaults
  }

  await Promise.allSettled([
    inApp
      ? Promise.race([writeInAppNotification(userId, data), timeout(6000)])
      : Promise.resolve(),
    push
      ? Promise.race([writePushNotification(userId, data), timeout(6000)])
      : Promise.resolve(),
  ]);
}

// ─── Public API ──────────────────────────────────────────────────────────────

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
 */
export function sendAdminNotificationAsync(
  data: NotificationData,
  user?: { id: string } | null
): Promise<void> {
  // Return (but don't await) the inner async work so callers CAN await if needed.
  return (async () => {
    try {
      // 1. Fetch admin user IDs with a short timeout
      const adminResult = await Promise.race([
        supabase
          .from("user_roles")
          .select("user_id")
          .eq("role", "admin"),
        timeout(3000),
      ]);

      const adminIds: string[] = (adminResult as any)?.data?.map(
        (r: { user_id: string }) => r.user_id
      ) ?? [];

      // 2. Build the list of recipients
      const recipientMap: Record<string, NotificationData> = {};

      for (const id of adminIds) {
        recipientMap[id] = data;
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
      await Promise.allSettled(
        Object.entries(recipientMap).map(([uid, notifData]) =>
          notifyUser(uid, notifData)
        )
      );
    } catch (err) {
      // Top-level catch — log but never throw so caller is unaffected
      console.error("[notify] sendAdminNotificationAsync error:", err);
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
    await supabase.functions.invoke("send-push-notification", { body: pushData });
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