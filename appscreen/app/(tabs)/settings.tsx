// Settings Screen - Manage app preferences and notifications

import React, { useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "../../src/contexts/AuthContext";
import { notificationService } from "../../src/services/NotificationService";

interface SettingsOption {
  title: string;
  description: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
}

export default function SettingsScreen() {
  const { user } = useAuth();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [bookingAlerts, setBookingAlerts] = useState(true);
  const [statusUpdates, setStatusUpdates] = useState(true);
  const [marketingNotifications, setMarketingNotifications] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Initialize OneSignal when settings screen loads
    initializeNotifications();
  }, []);

  const initializeNotifications = async () => {
    try {
      setLoading(true);
      await notificationService.initialize();
      const status = notificationService.getStatus();
      console.log("✅ Notification service initialized with status:", status);

      // Update UI based on current status
      if (status === "Active") {
        console.log("🔔 OneSignal is active and ready");
      } else if (status === "Error") {
        Alert.alert(
          "Warning",
          "Notification service encountered an error. Please check your connection.",
        );
      }
    } catch (error) {
      console.error("❌ Failed to initialize notifications:", error);
      Alert.alert(
        "Error",
        "Failed to initialize notification service. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationPermission = async () => {
    try {
      if (notificationsEnabled) {
        await notificationService.optIn();
        Alert.alert("Success", "Notifications enabled successfully");
      } else {
        await notificationService.unsubscribe();
        Alert.alert("Success", "Notifications disabled");
      }

      // Update service status after change
      const newStatus = notificationService.getStatus();
      console.log("🔔 Notification status changed to:", newStatus);
    } catch (error) {
      console.error("Error toggling notifications:", error);
      Alert.alert("Error", "Failed to update notification settings");
    }
  };

  const renderSettingOption = ({
    title,
    description,
    value,
    onValueChange,
  }: SettingsOption) => (
    <View style={styles.settingItem}>
      <View style={styles.settingContent}>
        <View style={styles.settingInfo}>
          <Text style={styles.settingTitle}>{title}</Text>
          <Text style={styles.settingDescription}>{description}</Text>
        </View>
        <Switch
          value={value}
          onValueChange={onValueChange}
          trackColor={{ true: "#2563eb", false: "#374151" }}
          thumbColor={value ? "#2563eb" : "#6b7280"}
        />
      </View>
    </View>
  );

  const handleSaveSettings = async () => {
    try {
      // Save settings to AsyncStorage (could be expanded later)
      const settings = {
        notificationsEnabled,
        bookingAlerts,
        statusUpdates,
        marketingNotifications,
        lastUpdated: new Date().toISOString(),
      };

      console.log("💾 Saving settings:", settings);
      Alert.alert("Success", "Settings saved successfully");
    } catch (error) {
      console.error("Error saving settings:", error);
      Alert.alert("Error", "Failed to save settings");
    }
  };

  const handleResetSettings = () => {
    Alert.alert(
      "Reset Settings",
      "Are you sure you want to reset all settings to default?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Reset",
          style: "destructive",
          onPress: () => {
            setNotificationsEnabled(true);
            setBookingAlerts(true);
            setStatusUpdates(true);
            setMarketingNotifications(false);
            Alert.alert("Success", "Settings reset to default");
          },
        },
      ],
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading settings...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Settings</Text>
        <Text style={styles.headerSubtitle}>
          Manage your app preferences and notifications
        </Text>
      </View>

      {/* User Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        <View style={styles.userInfo}>
          <Text style={styles.userEmail}>
            📧 {user?.email || "Not logged in"}
          </Text>
          <Text style={styles.userRole}>
            Role: {user ? "Authenticated User" : "Guest"}
          </Text>
        </View>
      </View>

      {/* Notification Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notifications</Text>

        {renderSettingOption({
          title: "Push Notifications",
          description: "Receive booking updates and alerts",
          value: notificationsEnabled,
          onValueChange: setNotificationsEnabled,
        })}

        {renderSettingOption({
          title: "Booking Alerts",
          description: "Get notified when new bookings are assigned",
          value: bookingAlerts,
          onValueChange: setBookingAlerts,
        })}

        {renderSettingOption({
          title: "Status Updates",
          description: "Receive updates when booking status changes",
          value: statusUpdates,
          onValueChange: setStatusUpdates,
        })}

        {renderSettingOption({
          title: "Marketing Notifications",
          description: "Receive promotional offers and updates",
          value: marketingNotifications,
          onValueChange: setMarketingNotifications,
        })}
      </View>

      {/* OneSignal Status */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notification Service</Text>
        <View style={styles.serviceStatus}>
          <View style={styles.statusItem}>
            <Text style={styles.statusLabel}>OneSignal Status</Text>
            <Text
              style={[
                styles.statusValue,
                { color: notificationsEnabled ? "#10b981" : "#ef4444" },
              ]}
            >
              {notificationsEnabled ? "✅ Active" : "❌ Inactive"}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.refreshButton}
            onPress={initializeNotifications}
            disabled={loading}
          >
            <Text style={styles.refreshButtonText}>
              {loading ? "Refreshing..." : "🔄 Refresh"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* App Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>App Settings</Text>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleSaveSettings}
        >
          <Text style={styles.actionButtonText}>💾 Save Settings</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.dangerButton]}
          onPress={handleResetSettings}
        >
          <Text style={styles.actionButtonText}>🔄 Reset All</Text>
        </TouchableOpacity>
      </View>

      {/* Version Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        <View style={styles.versionInfo}>
          <Text style={styles.versionText}>Electroo Buddy Mobile</Text>
          <Text style={styles.versionSubtext}>Version 1.0.0</Text>
          <Text style={styles.versionSubtext}>Build 2024.12.15</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f0f1a",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0f0f1a",
  },
  loadingText: {
    color: "#fff",
    fontSize: 16,
  },
  header: {
    marginTop: 20,
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: "#374151",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#9ca3af",
  },
  section: {
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 16,
  },
  userInfo: {
    backgroundColor: "#1a1a2e",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#374151",
  },
  userEmail: {
    fontSize: 16,
    color: "#2563eb",
    marginBottom: 4,
  },
  userRole: {
    fontSize: 14,
    color: "#9ca3af",
  },
  settingItem: {
    marginBottom: 16,
  },
  settingContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: "#9ca3af",
  },
  serviceStatus: {
    backgroundColor: "#1a1a2e",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#374151",
  },
  statusItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  statusLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  statusValue: {
    fontSize: 14,
    fontWeight: "600",
  },
  refreshButton: {
    backgroundColor: "#2563eb",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: "center",
  },
  refreshButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  actionButton: {
    backgroundColor: "#2563eb",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 8,
  },
  dangerButton: {
    backgroundColor: "#ef4444",
  },
  actionButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  versionInfo: {
    backgroundColor: "#1a1a2e",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#374151",
    alignItems: "center",
  },
  versionText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2563eb",
    marginBottom: 4,
  },
  versionSubtext: {
    fontSize: 14,
    color: "#9ca3af",
    marginBottom: 2,
  },
});
