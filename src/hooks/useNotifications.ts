import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  booking_id: string | null;
  order_id: string | null;
  is_read: boolean;
  read_at: string | null;
  email_sent: boolean;
  email_sent_at: string | null;
  created_at: string;
  metadata: any;
}

const MAX_RETRIES     = 3;
const RETRY_BASE_MS   = 2_000;
const FETCH_LIMIT     = 50;

// Disable real-time on free tier if experiencing CHANNEL_ERROR spam
// Set VITE_DISABLE_REALTIME=true in .env to use polling only
const DISABLE_REALTIME = import.meta.env.VITE_DISABLE_REALTIME === "true";

export const useNotifications = (userId: string | null) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount]     = useState(0);
  const [loading, setLoading]             = useState(true);

  // Keep a stable ref to the current channel so cleanup is always accurate
  const channelRef  = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const retryRef    = useRef(0);
  const retryTimer  = useRef<NodeJS.Timeout | null>(null);
  const mountedRef  = useRef(true);

  // ── Fetch ────────────────────────────────────────────────────────────────
  const fetchNotifications = useCallback(async () => {
    if (!userId) return;

    try {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(FETCH_LIMIT);

      if (error) throw error;
      if (!mountedRef.current) return;

      setNotifications(data ?? []);
      setUnreadCount(data?.filter(n => !n.is_read).length ?? 0);
    } catch (err: any) {
      console.error("[useNotifications] fetch error:", err);
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, [userId]);

  // ── Mark one as read ─────────────────────────────────────────────────────
  const markAsRead = useCallback(async (notificationId: string) => {
    if (!userId) return;

    // Optimistic update — no waiting
    setNotifications(prev =>
      prev.map(n =>
        n.id === notificationId
          ? { ...n, is_read: true, read_at: new Date().toISOString() }
          : n
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));

    try {
      const { error } = await supabase.rpc("mark_notification_read", {
        p_notification_id: notificationId,
        p_user_id:         userId,
      });
      if (error) throw error;
    } catch (err: any) {
      console.error("[useNotifications] markAsRead error:", err);
      // Rollback optimistic update
      setNotifications(prev =>
        prev.map(n =>
          n.id === notificationId
            ? { ...n, is_read: false, read_at: null }
            : n
        )
      );
      setUnreadCount(prev => prev + 1);
      toast.error("Failed to mark notification as read");
    }
  }, [userId]);

  // ── Mark all as read ─────────────────────────────────────────────────────
  const markAllAsRead = useCallback(async () => {
    if (!userId) return;

    const prev = notifications;
    const now  = new Date().toISOString();

    // Optimistic update
    setNotifications(ns => ns.map(n => ({ ...n, is_read: true, read_at: now })));
    setUnreadCount(0);

    try {
      const { data: count, error } = await supabase.rpc("mark_all_notifications_read", {
        p_user_id: userId,
      });
      if (error) throw error;
      toast.success(`Marked ${count ?? 0} notifications as read`);
    } catch (err: any) {
      console.error("[useNotifications] markAllAsRead error:", err);
      // Rollback
      setNotifications(prev);
      setUnreadCount(prev.filter(n => !n.is_read).length);
      toast.error("Failed to mark all notifications as read");
    }
  }, [userId, notifications]);

  // ── Delete ───────────────────────────────────────────────────────────────
  const deleteNotification = useCallback(async (notificationId: string) => {
    if (!userId) return;

    // Optimistic removal
    setNotifications(prev => {
      const target = prev.find(n => n.id === notificationId);
      if (target && !target.is_read) setUnreadCount(c => Math.max(0, c - 1));
      return prev.filter(n => n.id !== notificationId);
    });

    try {
      const { error } = await supabase
        .from("notifications")
        .delete()
        .eq("id", notificationId)
        .eq("user_id", userId);
      if (error) throw error;
    } catch (err: any) {
      console.error("[useNotifications] deleteNotification error:", err);
      toast.error("Failed to delete notification");
      fetchNotifications(); // re-sync from server
    }
  }, [userId, fetchNotifications]);

  // ── Realtime subscription ────────────────────────────────────────────────
  useEffect(() => {
    if (!userId) return;
    mountedRef.current = true;

    fetchNotifications();

    const teardown = () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
      if (retryTimer.current) {
        clearTimeout(retryTimer.current);
        retryTimer.current = null;
      }
    };

    const subscribe = () => {
      // Skip real-time if disabled (free tier optimization)
      if (DISABLE_REALTIME) {
        console.log("[useNotifications] Real-time disabled, using polling only");
        return;
      }

      // Always tear down before creating a new channel (prevents leaks on retry)
      teardown();

      const channel = supabase
        .channel(`notifications:${userId}:${Date.now()}`)
        .on(
          "postgres_changes",
          {
            event:  "INSERT",
            schema: "public",
            table:  "notifications",
            filter: `user_id=eq.${userId}`,
          },
          (payload) => {
            if (!mountedRef.current) return;
            const n = payload.new as Notification;

            setNotifications(prev => [n, ...prev]);
            setUnreadCount(c => c + 1);

            toast.info(n.title, { description: n.message, duration: 5000 });
          }
        )
        .on(
          "postgres_changes",
          {
            event:  "UPDATE",
            schema: "public",
            table:  "notifications",
            filter: `user_id=eq.${userId}`,
          },
          (payload) => {
            if (!mountedRef.current) return;
            const updated = payload.new as Notification;
            setNotifications(prev =>
              prev.map(n => (n.id === updated.id ? updated : n))
            );
          }
        )
        .subscribe((status, err) => {
          if (status === "SUBSCRIBED") {
            retryRef.current = 0; // reset backoff on clean connect
          }

          if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
            console.warn(`[useNotifications] channel ${status}`, err ?? "");

            if (retryRef.current < MAX_RETRIES && mountedRef.current) {
              const delay = RETRY_BASE_MS * Math.pow(2, retryRef.current);
              retryRef.current += 1;
              console.log(`[useNotifications] retry ${retryRef.current}/${MAX_RETRIES} in ${delay}ms`);
              retryTimer.current = setTimeout(subscribe, delay);
            } else if (mountedRef.current) {
              toast.error("Real-time updates lost. Refresh to reconnect.", {
                duration: 0, // persist until dismissed
                action: { label: "Refresh", onClick: () => window.location.reload() },
              });
            }
          }

          if (status === "CLOSED") {
            console.warn("[useNotifications] channel closed");
          }
        });

      channelRef.current = channel;
    };

    subscribe();

    return () => {
      mountedRef.current = false;
      teardown();
    };
  }, [userId, fetchNotifications]);

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refreshNotifications: fetchNotifications,
  };
};