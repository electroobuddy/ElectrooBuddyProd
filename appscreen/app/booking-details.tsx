// Booking Details Screen - View and update booking status

import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Booking, bookingsApi } from "../src/services/supabase";
import { sendStatusUpdateNotification } from "../src/utils/pushNotifications";

export default function BookingDetailsScreen() {
  const router = useRouter();
  const { booking } = useLocalSearchParams();
  const bookingData: Booking = JSON.parse(booking as string);

  const [updating, setUpdating] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(bookingData.status);

  const updateStatus = async (newStatus: string) => {
    if (newStatus === currentStatus) return;

    Alert.alert(
      "Update Status",
      `Are you sure you want to mark this booking as "${newStatus}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Confirm",
          onPress: async () => {
            setUpdating(true);
            try {
              await bookingsApi.updateStatus(bookingData.id, newStatus);
              setCurrentStatus(newStatus);

              // Send notification to customer
              await sendStatusNotification(newStatus);

              Alert.alert("Success", "Booking status updated");
              router.back();
            } catch (error) {
              console.error("Update error:", error);
              Alert.alert("Error", "Failed to update status");
            } finally {
              setUpdating(false);
            }
          },
        },
      ],
    );
  };

  const sendStatusNotification = async (status: string) => {
    try {
      // Use the new push notification utility
      if (bookingData.user_id) {
        const result = await sendStatusUpdateNotification(
          bookingData.user_id,
          bookingData.id,
          status,
          bookingData.service_type,
        );

        if (!result.success) {
          console.error("Failed to send status notification:", result.error);
        }
      } else {
        console.warn("No user_id available for status notification");
      }
    } catch (error) {
      console.error("Notification error:", error);
    }
  };

  const callCustomer = () => {
    Linking.openURL(`tel:${bookingData.phone}`);
  };

  const whatsappCustomer = () => {
    const message = encodeURIComponent(
      `Hi ${bookingData.name}, this is Electroo Buddy regarding your ${bookingData.service_type} booking.`,
    );
    Linking.openURL(
      `https://wa.me/${bookingData.phone.replace(/[^0-9]/g, "")}?text=${message}`,
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "#f59e0b";
      case "confirmed":
        return "#10b981";
      case "in_progress":
        return "#3b82f6";
      case "completed":
        return "#8b5cf6";
      case "cancelled":
        return "#ef4444";
      default:
        return "#6b7280";
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Status */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Current Status</Text>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(currentStatus) },
          ]}
        >
          <Text style={styles.statusText}>{currentStatus}</Text>
        </View>
      </View>

      {/* Customer Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Customer Information</Text>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Name:</Text>
          <Text style={styles.value}>{bookingData.name}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Phone:</Text>
          <Text style={styles.value}>{bookingData.phone}</Text>
        </View>
        {bookingData.email && (
          <View style={styles.infoRow}>
            <Text style={styles.label}>Email:</Text>
            <Text style={styles.value}>{bookingData.email}</Text>
          </View>
        )}

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.quickAction} onPress={callCustomer}>
            <Text style={styles.quickActionText}>📞 Call</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickAction}
            onPress={whatsappCustomer}
          >
            <Text style={styles.quickActionText}>💬 WhatsApp</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Service Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Service Details</Text>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Service:</Text>
          <Text style={styles.value}>{bookingData.service_type}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Address:</Text>
          <Text style={styles.value}>{bookingData.address}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Preferred:</Text>
          <Text style={styles.value}>
            {bookingData.preferred_date} at {bookingData.preferred_time}
          </Text>
        </View>
        {bookingData.exact_location && (
          <View style={styles.infoRow}>
            <Text style={styles.label}>Location:</Text>
            <Text style={styles.value}>{bookingData.exact_location}</Text>
          </View>
        )}
      </View>

      {/* Additional Details */}
      {(bookingData.custom_service_demand ||
        bookingData.is_switch_working !== null) && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Additional Details</Text>
          {bookingData.custom_service_demand && (
            <View style={styles.infoRow}>
              <Text style={styles.label}>Demand:</Text>
              <Text style={styles.value}>
                {bookingData.custom_service_demand}
              </Text>
            </View>
          )}
          {bookingData.is_switch_working !== null && (
            <View style={styles.infoRow}>
              <Text style={styles.label}>Switch:</Text>
              <Text style={styles.value}>
                {bookingData.is_switch_working === "yes"
                  ? "Working"
                  : "Not Working"}
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Actions */}
      <View style={styles.actionsSection}>
        <Text style={styles.sectionTitle}>Update Status</Text>
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[
              styles.actionButton,
              { backgroundColor: "#10b981" },
              currentStatus === "confirmed" && styles.actionButtonDisabled,
            ]}
            onPress={() => updateStatus("confirmed")}
            disabled={updating || currentStatus === "confirmed"}
          >
            <Text style={styles.actionButtonText}>✅ Confirm</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.actionButton,
              { backgroundColor: "#3b82f6" },
              currentStatus === "in_progress" && styles.actionButtonDisabled,
            ]}
            onPress={() => updateStatus("in_progress")}
            disabled={updating || currentStatus === "in_progress"}
          >
            <Text style={styles.actionButtonText}>🔧 In Progress</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.actionButton,
              { backgroundColor: "#8b5cf6" },
              currentStatus === "completed" && styles.actionButtonDisabled,
            ]}
            onPress={() => updateStatus("completed")}
            disabled={updating || currentStatus === "completed"}
          >
            <Text style={styles.actionButtonText}>✅ Completed</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.actionButton,
              { backgroundColor: "#ef4444" },
              currentStatus === "cancelled" && styles.actionButtonDisabled,
            ]}
            onPress={() => updateStatus("cancelled")}
            disabled={updating || currentStatus === "cancelled"}
          >
            <Text style={styles.actionButtonText}>❌ Cancel</Text>
          </TouchableOpacity>
        </View>

        {updating && (
          <ActivityIndicator
            size="small"
            color="#2563eb"
            style={styles.loadingIndicator}
          />
        )}
      </View>

      {/* Meta Info */}
      <View style={styles.metaSection}>
        <Text style={styles.metaText}>Booking ID: {bookingData.id}</Text>
        <Text style={styles.metaText}>
          Created: {new Date(bookingData.created_at).toLocaleString()}
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f0f1a",
  },
  section: {
    backgroundColor: "#1a1a2e",
    padding: 16,
    marginVertical: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#2563eb",
    marginBottom: 12,
    textTransform: "uppercase",
  },
  infoRow: {
    flexDirection: "row",
    marginBottom: 8,
  },
  label: {
    width: 80,
    fontSize: 14,
    color: "#9ca3af",
  },
  value: {
    flex: 1,
    fontSize: 14,
    color: "#fff",
  },
  statusBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  statusText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  quickActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 16,
  },
  quickAction: {
    flex: 1,
    backgroundColor: "#0f0f1a",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#374151",
  },
  quickActionText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  actionsSection: {
    backgroundColor: "#1a1a2e",
    padding: 16,
  },
  actionButtons: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  actionButton: {
    flex: 1,
    minWidth: "45%",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  actionButtonDisabled: {
    opacity: 0.5,
  },
  actionButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  loadingIndicator: {
    marginTop: 16,
  },
  metaSection: {
    padding: 16,
    marginBottom: 32,
  },
  metaText: {
    fontSize: 12,
    color: "#6b7280",
    marginBottom: 4,
  },
});
