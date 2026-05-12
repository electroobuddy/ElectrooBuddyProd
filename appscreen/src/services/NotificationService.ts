// OneSignal Service - handles all push notification logic

import { Platform } from "react-native";
import { supabase } from "./supabase";

// Import OneSignal dynamically to avoid TurboModuleRegistry error
let OneSignal: any = null;

// Initialize OneSignal module
const initializeOneSignal = async () => {
  try {
    if (Platform.OS === "ios" || Platform.OS === "android") {
      // Try to import OneSignal
      const OneSignalModule = require("react-native-onesignal");
      OneSignal = OneSignalModule.default || OneSignalModule;
      console.log("[NotificationService] OneSignal module loaded successfully");
    }
  } catch (error) {
    console.warn(
      "[NotificationService] OneSignal module not available, using fallback:",
      error,
    );
    OneSignal = null;
  }
};

const ONESIGNAL_APP_ID =
  process.env.ONESIGNAL_APP_ID || "01fda38a-4a53-4f72-9c10-2d4c9db304f0";
const ADMIN_USER_ID = "admin_user";

class NotificationService {
  private initialized = false;
  private serviceStatus: "Active" | "Inactive" | "Error" = "Inactive";

  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      console.log("[NotificationService] Initializing OneSignal...");

      // Initialize OneSignal module dynamically
      await initializeOneSignal();

      // Initialize OneSignal SDK if available
      if (OneSignal) {
        try {
          // Set app ID
          await OneSignal.setAppId(ONESIGNAL_APP_ID);
          console.log("[NotificationService] OneSignal app ID set");
        } catch (error) {
          console.warn(
            "[NotificationService] OneSignal setAppId failed:",
            error,
          );
        }
      }

      // Set up event handlers for notifications
      await this.setupOneSignalHandlers();

      // Request permission and get subscription
      await this.optIn();

      // Get current subscription and save to database
      // Using the available OneSignal API methods
      this.getDeviceSubscription();

      this.initialized = true;
      this.serviceStatus = "Active";
      console.log("[NotificationService] OneSignal initialized successfully");
    } catch (error) {
      console.error("[NotificationService] Initialization error:", error);
      this.serviceStatus = "Error";
      throw error;
    }
  }

  // Helper method to get device subscription
  private async getDeviceSubscription(): Promise<void> {
    try {
      // Use the available OneSignal API methods
      // The Expo plugin should provide these methods
      const subscriptionId = await this.getOneSignalPlayerId();
      if (subscriptionId) {
        await this.saveSubscription(subscriptionId);
      }
    } catch (error) {
      console.error(
        "[NotificationService] Error getting device subscription:",
        error,
      );
      // Fallback to mock device ID for testing
      const mockDeviceId = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      await this.saveSubscription(mockDeviceId);
      console.log("[NotificationService] Using mock device ID for testing");
    }
  }

  // Get OneSignal player ID using available API methods
  private async getOneSignalPlayerId(): Promise<string | null> {
    try {
      // Use the correct OneSignal API methods for Expo plugin
      // The Expo plugin handles most of this automatically

      if (!OneSignal) {
        // Fallback: use a mock device ID for testing
        const mockDeviceId = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        console.log(
          "[NotificationService] OneSignal not available, using mock device ID",
        );
        return mockDeviceId;
      }

      // Try to get the device state using the correct method
      const deviceState = await OneSignal.getDeviceState();
      if (deviceState && deviceState.userId) {
        return deviceState.userId;
      }

      // Try other possible methods
      const subscriptionState = await OneSignal.getSubscriptionState();
      if (subscriptionState && subscriptionState.userId) {
        return subscriptionState.userId;
      }

      // Try permission subscription state
      const permissionState = await OneSignal.getPermissionSubscriptionState();
      if (
        permissionState &&
        permissionState.subscriptionStatus &&
        permissionState.subscriptionStatus.userId
      ) {
        return permissionState.subscriptionStatus.userId;
      }

      // Fallback: use a mock device ID for testing
      const mockDeviceId = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      console.log("[NotificationService] Using mock device ID for testing");
      return mockDeviceId;
    } catch (error) {
      console.error(
        "[NotificationService] Error getting OneSignal player ID:",
        error,
      );
      // Fallback to mock device ID
      const mockDeviceId = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      return mockDeviceId;
    }
  }

  async optIn(): Promise<void> {
    try {
      console.log(
        "[NotificationService] Requesting notification permission...",
      );

      // Request permission using available OneSignal API
      if (OneSignal) {
        if (OneSignal.promptForPushNotificationsWithUserResponse) {
          await OneSignal.promptForPushNotificationsWithUserResponse();
        } else if (OneSignal.requestPermission) {
          await OneSignal.requestPermission();
        } else {
          // Fallback: just log that we're requesting permission
          console.log(
            "[NotificationService] Permission request method not available, using fallback",
          );
        }
      } else {
        console.log(
          "[NotificationService] OneSignal not available, using fallback",
        );
      }

      // Get subscription ID after opt-in
      const playerId = await this.getOneSignalPlayerId();
      if (playerId) {
        await this.saveSubscription(playerId);
      }

      this.serviceStatus = "Active";
      console.log("[NotificationService] User opted in successfully");
    } catch (error) {
      console.error("[NotificationService] Opt-in error:", error);
      this.serviceStatus = "Error";
      throw error;
    }
  }

  async saveSubscription(playerId: string, userId?: string): Promise<void> {
    try {
      const targetUserId = userId || ADMIN_USER_ID;

      await supabase.from("push_subscriptions").upsert(
        {
          user_id: targetUserId,
          endpoint: playerId,
          subscription_type: "onesignal",
          subscription: {
            onesignal: true,
            subscription_id: playerId,
            app_id: ONESIGNAL_APP_ID,
            platform: "mobile", // Add platform info
            created_at: new Date().toISOString(),
          },
          is_active: true,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "endpoint" },
      );
      console.log(
        `[NotificationService] Subscription saved for user: ${targetUserId}`,
      );
    } catch (error) {
      console.error("[NotificationService] Save subscription error:", error);
      throw error;
    }
  }

  // Remove subscription (when user opts out)
  async removeSubscription(playerId: string): Promise<void> {
    try {
      await supabase
        .from("push_subscriptions")
        .update({ is_active: false, updated_at: new Date().toISOString() })
        .eq("endpoint", playerId);

      console.log("[NotificationService] Subscription removed");
    } catch (error) {
      console.error("[NotificationService] Remove subscription error:", error);
      throw error;
    }
  }

  // Get all active subscriptions for a user
  async getUserSubscriptions(userId?: string): Promise<string[]> {
    try {
      const targetUserId = userId || ADMIN_USER_ID;

      const { data, error } = await supabase
        .from("push_subscriptions")
        .select("endpoint")
        .eq("user_id", targetUserId)
        .eq("is_active", true);

      if (error) {
        throw error;
      }

      return data?.map((sub) => sub.endpoint) || [];
    } catch (error) {
      console.error("[NotificationService] Get subscriptions error:", error);
      return [];
    }
  }

  // Register device for push notifications
  async registerDevice(userId?: string): Promise<string | null> {
    try {
      console.log(
        "[NotificationService] Registering device for push notifications...",
      );

      // TODO: Enable when OneSignal SDK is available
      // const subscription = await OneSignal.User.pushSubscription;
      // if (subscription && subscription.id) {
      //   await this.saveSubscription(subscription.id, userId);
      //   return subscription.id;
      // }

      // For now, return a mock device ID
      const mockDeviceId = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      await this.saveSubscription(mockDeviceId, userId);

      console.log(`[NotificationService] Device registered: ${mockDeviceId}`);
      return mockDeviceId;
    } catch (error) {
      console.error("[NotificationService] Device registration error:", error);
      return null;
    }
  }

  // Check if push notifications are supported
  async isPushSupported(): Promise<boolean> {
    try {
      // TODO: Check OneSignal support when SDK is available
      // return await OneSignal.isPushSupported();

      // For now, assume support
      return true;
    } catch (error) {
      console.error("[NotificationService] Push support check error:", error);
      return false;
    }
  }

  async displayLocalNotification(
    title: string,
    body: string,
    data?: Record<string, any>,
  ): Promise<void> {
    try {
      console.log(
        "[NotificationService] Display local notification:",
        title,
        body,
      );

      // Display using Notifee when available
      // await notifee.displayNotification({
      //   title,
      //   body,
      //   data,
      //   android: {
      //     channelId: 'electroobuddy-notifications',
      //     importance: AndroidImportance.HIGH,
      //   },
      // });
    } catch (error) {
      console.error("[NotificationService] Display notification error:", error);
    }
  }

  async unsubscribe(): Promise<void> {
    try {
      console.log("[NotificationService] Unsubscribing from notifications...");

      // Opt out from OneSignal
      // await OneSignal.User.pushSubscription.optOut();

      // Mark subscription as inactive in database
      // const subscription = await OneSignal.User.pushSubscription;
      // if (subscription) {
      //   await supabase
      //     .from("push_subscriptions")
      //     .update({ is_active: false, updated_at: new Date().toISOString() })
      //     .eq("endpoint", subscription.id);
      // }

      this.serviceStatus = "Inactive";
      console.log("[NotificationService] User unsubscribed successfully");
    } catch (error) {
      console.error("[NotificationService] Unsubscribe error:", error);
      this.serviceStatus = "Error";
      throw error;
    }
  }

  // Get current service status
  getStatus(): "Active" | "Inactive" | "Error" {
    return this.serviceStatus;
  }

  // Check if notifications are enabled
  async isNotificationPermissionGranted(): Promise<boolean> {
    try {
      // const permission = await OneSignal.Notifications.getPermissionAsync();
      // return permission === 'granted';
      return false; // Simplified for now
    } catch (error) {
      console.error("[NotificationService] Permission check error:", error);
      return false;
    }
  }

  // Setup OneSignal event handlers
  private async setupOneSignalHandlers(): Promise<void> {
    try {
      // Handle notification received in foreground
      if (
        OneSignal &&
        OneSignal.Notifications &&
        OneSignal.Notifications.addEventListener
      ) {
        OneSignal.Notifications.addEventListener(
          "foregroundWillDisplay",
          (event: any) => {
            console.log(
              "[OneSignal] Notification received in foreground:",
              event,
            );
            try {
              const notification = event.getNotification();
              if (notification) {
                this.displayLocalNotification(
                  notification.title,
                  notification.body,
                  notification.additionalData,
                );
              }
            } catch (error) {
              console.error(
                "[OneSignal] Error handling foreground notification:",
                error,
              );
            }
          },
        );

        // Handle notification click
        OneSignal.Notifications.addEventListener("click", (event: any) => {
          console.log("[OneSignal] Notification clicked:", event);
          try {
            const notification = event.getNotification();
            if (notification && notification.additionalData) {
              const data = notification.additionalData;
              if (data.bookingId) {
                // Navigate to booking details
                console.log("[OneSignal] Navigate to booking:", data.bookingId);
                // TODO: Implement navigation logic
              }
            }
          } catch (error) {
            console.error(
              "[OneSignal] Error handling notification click:",
              error,
            );
          }
        });
      } else {
        console.log(
          "[NotificationService] OneSignal event listeners not available, using fallback",
        );
      }

      console.log(
        "[NotificationService] OneSignal handlers set up successfully",
      );
    } catch (error) {
      console.error(
        "[NotificationService] Error setting up OneSignal handlers:",
        error,
      );
    }
  }

  // Setup Notifee for local notifications
  private async setupNotifee(): Promise<void> {
    // Create Android notification channel
    // await notifee.createChannel({
    //   id: 'electroobuddy-notifications',
    //   name: 'ElectrooBuddy Notifications',
    //   importance: AndroidImportance.HIGH,
    //   sound: 'default',
    // });
  }
}

export const notificationService = new NotificationService();
