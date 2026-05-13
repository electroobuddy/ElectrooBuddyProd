import OneSignal from "react-onesignal";

const ONESIGNAL_APP_ID = import.meta.env.VITE_ONESIGNAL_APP_ID || "ah62hcskknhxfhaqfvgj3mye6dkhif3gzpoeinvfmbjlw3syhuwdlvllx7brghjqxviuka4gh6wsjqurychr36zjexuacteflaalmhi";
const ONESIGNAL_API_KEY = import.meta.env.VITE_ONESIGNAL_API_KEY || "os_v2_app_ah62hcskknhxfhaqfvgj3mye6dkhif3gzpoeinvfmbjlw3syhuwdlvllx7brghjqxviuka4gh6wsjqurychr36zjexuacteflaamlhi";

export const initializeOneSignal = async (
  userId?: string
) => {
  try {
    await OneSignal.init({
      appId: ONESIGNAL_APP_ID,
      allowLocalhostAsSecureOrigin: true,
      notifyButton: {
        enable: false,
      },
    });

    console.log("✅ OneSignal initialized");

    // Ask notification permission
    const permission =
      await OneSignal.Notifications.requestPermission();

    console.log(
      "🔔 Notification permission:",
      permission
    );

    // Login user
    if (userId) {
      await OneSignal.login(userId);

      console.log(
        "✅ OneSignal user linked:",
        userId
      );
    }

    // Get Push Subscription ID
    const pushSubscriptionId =
      OneSignal.User.PushSubscription.id;

    console.log(
      "📱 Push Subscription ID:",
      pushSubscriptionId
    );

    return pushSubscriptionId;
  } catch (error) {
    console.error(
      "❌ OneSignal initialization failed:",
      error
    );
  }
};

// Send OneSignal notification to admin users
export const sendOneSignalNotification = async (
  userIds: string[],
  title: string,
  message: string,
  data?: Record<string, any>
): Promise<void> => {
  try {
    console.log("📡 Sending OneSignal notification to admins:", userIds);
    
    const response = await fetch(
      "https://api.onesignal.com/notifications",
      {
        method: "POST",
        headers: {
          Authorization: `Key ${ONESIGNAL_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          app_id: ONESIGNAL_APP_ID,
          include_external_user_ids: userIds,
          headings: {
            en: title,
          },
          contents: {
            en: message,
          },
          data: data || {},
          priority: 10,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error("❌ OneSignal API error:", errorData);
      throw new Error(`OneSignal API error: ${response.status}`);
    }

    const result = await response.json();
    console.log("✅ OneSignal notification sent successfully:", result);
  } catch (error) {
    console.error("❌ Failed to send OneSignal notification:", error);
    // Don't throw - notification failure should not block booking submission
  }
};