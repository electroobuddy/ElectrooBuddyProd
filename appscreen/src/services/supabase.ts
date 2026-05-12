// Supabase service for React Native - using updated client and types

import { supabase } from "../../src/integrations/supabase/client";
import { Database } from "../../src/integrations/supabase/types";

// Export the supabase client for use in other components
export { supabase };

// Type definitions matching the database schema
export type Booking = Database["public"]["Tables"]["bookings"]["Row"];
export type Notification = Database["public"]["Tables"]["notifications"]["Row"];
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];

// Error handling utility
const handleSupabaseError = (error: any, operation: string) => {
  console.error(`Supabase ${operation} error:`, error);

  if (error?.code === "PGRST116") {
    throw new Error("No data found");
  } else if (error?.code === "PGRST301") {
    throw new Error(
      "Connection timeout. Please check your internet connection.",
    );
  } else if (error?.message?.includes("JWT")) {
    throw new Error("Authentication error. Please login again.");
  } else if (error?.message?.includes("network")) {
    throw new Error("Network error. Please check your connection.");
  } else {
    throw new Error(
      error?.message || `Failed to ${operation}. Please try again.`,
    );
  }
};

// Retry utility
const retryOperation = async <T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000,
): Promise<T> => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      console.log(`Retry ${i + 1}/${maxRetries} after error:`, error);
      await new Promise((resolve) => setTimeout(resolve, delay * (i + 1)));
    }
  }
  throw new Error("Max retries exceeded");
};

// API functions
export const bookingsApi = {
  getAll: async (): Promise<Booking[]> => {
    return retryOperation(async () => {
      const { data, error } = await supabase
        .from("bookings")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) handleSupabaseError(error, "fetch bookings");
      return data || [];
    });
  },

  getById: async (id: string): Promise<Booking | null> => {
    return retryOperation(async () => {
      const { data, error } = await supabase
        .from("bookings")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        if (error.code === "PGRST116") return null;
        handleSupabaseError(error, "fetch booking");
      }
      return data;
    });
  },

  updateStatus: async (id: string, status: string): Promise<void> => {
    return retryOperation(async () => {
      const { data, error } = await supabase
        .from("bookings")
        .update({ status, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single();

      if (error) handleSupabaseError(error, "update booking status");
      if (!data) throw new Error("Failed to update booking - no data returned");
    });
  },

  subscribeToNew: (
    callback: (booking: Booking) => void,
    channelName?: string,
  ) => {
    const uniqueChannelName =
      channelName || `bookings-${Date.now()}-${Math.random()}`;
    const channel = supabase
      .channel(uniqueChannelName)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "bookings",
        },
        (payload) => {
          try {
            callback(payload.new as Booking);
          } catch (error) {
            console.error("Error in subscription callback:", error);
          }
        },
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          console.log(
            `Successfully subscribed to new bookings (${uniqueChannelName})`,
          );
        } else if (status === "CHANNEL_ERROR") {
          console.error(
            `Failed to subscribe to bookings channel (${uniqueChannelName})`,
          );
        }
      });

    return channel;
  },
};

export const notificationsApi = {
  getAll: async (): Promise<Notification[]> => {
    return retryOperation(async () => {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) handleSupabaseError(error, "fetch notifications");
      return data || [];
    });
  },

  markAsRead: async (id: string): Promise<void> => {
    return retryOperation(async () => {
      const { data, error } = await supabase
        .from("notifications")
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single();

      if (error) handleSupabaseError(error, "mark notification as read");
      if (!data)
        throw new Error(
          "Failed to mark notification as read - no data returned",
        );
    });
  },

  subscribe: (
    callback: (notification: Notification) => void,
    channelName?: string,
  ) => {
    const uniqueChannelName =
      channelName || `notifications-${Date.now()}-${Math.random()}`;
    const channel = supabase
      .channel(uniqueChannelName)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
        },
        (payload) => {
          try {
            callback(payload.new as Notification);
          } catch (error) {
            console.error(
              "Error in notification subscription callback:",
              error,
            );
          }
        },
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          console.log(
            `Successfully subscribed to notifications (${uniqueChannelName})`,
          );
        } else if (status === "CHANNEL_ERROR") {
          console.error(
            `Failed to subscribe to notifications channel (${uniqueChannelName})`,
          );
        }
      });

    return channel;
  },
};

export const pushApi = {
  saveSubscription: async (
    userId: string,
    playerId: string,
    appId: string,
  ): Promise<void> => {
    return retryOperation(async () => {
      const { data, error } = await supabase
        .from("push_subscriptions")
        .upsert(
          {
            user_id: userId,
            endpoint: playerId,
            subscription_type: "onesignal",
            subscription: {
              onesignal: true,
              subscription_id: playerId,
              app_id: appId,
            },
            is_active: true,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "endpoint" },
        )
        .select()
        .single();

      if (error) handleSupabaseError(error, "save push subscription");
      if (!data)
        throw new Error("Failed to save push subscription - no data returned");
    });
  },

  getActiveSubscription: async (
    userId: string,
  ): Promise<{ endpoint: string } | null> => {
    return retryOperation(async () => {
      const { data, error } = await supabase
        .from("push_subscriptions")
        .select("endpoint")
        .eq("user_id", userId)
        .eq("is_active", true)
        .limit(1)
        .maybeSingle();

      if (error) {
        if (error.code === "PGRST116") return null;
        handleSupabaseError(error, "get active subscription");
      }
      return data;
    });
  },
};
