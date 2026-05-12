import { DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import OneSignal from "react-native-onesignal";
import "react-native-reanimated";
import LoginWrapper from "../src/components/LoginWrapper";
import { AuthProvider } from "../src/contexts/AuthContext";
import { notificationService } from "../src/services/NotificationService";

export const unstable_settings = {
  anchor: "(tabs)",
};

export default function RootLayout() {
  useEffect(() => {
    // Initialize OneSignal with correct API
    const initializeOneSignal = async () => {
      try {
        // Use the correct OneSignal API methods for React Native
        const ONESIGNAL_APP_ID = "01fda38a-4a53-4f72-9c10-2d4c9db304f0";

        // Initialize OneSignal using the correct method
        // The React Native OneSignal SDK uses different method names
        const oneSignalModule = OneSignal as any;

        if (oneSignalModule.setAppId) {
          oneSignalModule.setAppId(ONESIGNAL_APP_ID);
          console.log("✅ OneSignal app ID set");
        } else {
          console.warn("⚠️ OneSignal.setAppId not available");
        }

        // Request permission using available methods
        if (oneSignalModule.promptForPushNotificationsWithUserResponse) {
          await oneSignalModule.promptForPushNotificationsWithUserResponse();
          console.log("✅ Notification permission requested");
        } else if (oneSignalModule.requestPermission) {
          await oneSignalModule.requestPermission(true);
          console.log("✅ Notification permission requested");
        } else {
          console.warn("⚠️ OneSignal permission methods not available");
        }

        // Initialize notification service
        await notificationService.initialize();
        console.log("🔔 Notification service initialized successfully");

        // Register device for push notifications
        const deviceId = await notificationService.registerDevice();
        if (deviceId) {
          console.log(`📱 Device registered: ${deviceId}`);
        }
      } catch (error) {
        console.error("❌ Failed to initialize OneSignal:", error);
      }
    };

    initializeOneSignal();
  }, []);

  return (
    <AuthProvider>
      <LoginWrapper>
        <ThemeProvider value={DefaultTheme}>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          </Stack>
          <StatusBar style="auto" />
        </ThemeProvider>
      </LoginWrapper>
    </AuthProvider>
  );
}
