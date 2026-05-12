// Admin Screen - Enhanced booking management with full details

import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { notificationService } from "../../src/services/NotificationService";
import { Booking, bookingsApi } from "../../src/services/supabase";

type FilterType =
  | "all"
  | "pending"
  | "confirmed"
  | "in_progress"
  | "completed"
  | "cancelled";

const STATUS_COLORS: Record<string, string> = {
  pending: "#f59e0b",
  confirmed: "#10b981",
  in_progress: "#3b82f6",
  completed: "#8b5cf6",
  cancelled: "#ef4444",
};

const FILTERS: FilterType[] = [
  "all",
  "pending",
  "confirmed",
  "in_progress",
  "completed",
  "cancelled",
];

export default function AdminScreen() {
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [filter, setFilter] = useState<FilterType>("all");

  const fetchBookings = useCallback(async () => {
    try {
      const data = await bookingsApi.getAll();
      setBookings(data);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      Alert.alert("Error", "Failed to fetch bookings");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchBookings();
    }, [fetchBookings]),
  );

  useEffect(() => {
    const subscription = bookingsApi.subscribeToNew((booking) => {
      setBookings((prev) => [booking, ...prev]);
      notificationService.displayLocalNotification(
        "🔔 New Booking Received",
        `${booking.name} - ${booking.service_type}`,
        { booking_id: booking.id },
      );
    });
    return () => subscription.unsubscribe();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchBookings();
  };

  const updateBookingStatus = async (bookingId: string, newStatus: string) => {
    try {
      await bookingsApi.updateStatus(bookingId, newStatus);
      Alert.alert("Success", `Booking status updated to ${newStatus}`);
      fetchBookings();
      setModalVisible(false);
    } catch (error) {
      console.error("Error updating booking:", error);
      Alert.alert("Error", "Failed to update booking status");
    }
  };

  const getStatusColor = (status: string) => STATUS_COLORS[status] ?? "#6b7280";

  const filteredBookings =
    filter === "all" ? bookings : bookings.filter((b) => b.status === filter);

  // ─── Booking Card ────────────────────────────────────────────────────────────
  const renderBooking = ({ item }: { item: Booking }) => (
    <TouchableOpacity
      style={styles.bookingCard}
      activeOpacity={0.75}
      onPress={() => {
        setSelectedBooking(item);
        setModalVisible(true);
      }}
    >
      <View style={styles.bookingHeader}>
        <Text style={styles.customerName}>{item.name}</Text>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(item.status) },
          ]}
        >
          <Text style={styles.statusText}>{item.status.replace("_", " ")}</Text>
        </View>
      </View>

      <Text style={styles.serviceType}>{item.service_type}</Text>
      <Text style={styles.contactInfo}>📱 {item.phone}</Text>
      <Text style={styles.contactInfo}>✉️ {item.email}</Text>
      <Text style={styles.contactInfo}>📍 {item.address}</Text>

      <View style={styles.bookingFooter}>
        <Text style={styles.dateTime}>
          📅 {item.preferred_date} at {item.preferred_time}
        </Text>
        <Text style={styles.createdAt}>
          Created: {new Date(item.created_at).toLocaleDateString()}
        </Text>
      </View>
    </TouchableOpacity>
  );

  // ─── Status Update Button ────────────────────────────────────────────────────
  const renderStatusButton = (status: string) => (
    <TouchableOpacity
      key={status}
      style={[styles.statusButton, { backgroundColor: getStatusColor(status) }]}
      activeOpacity={0.8}
      onPress={() =>
        selectedBooking && updateBookingStatus(selectedBooking.id, status)
      }
    >
      <Text style={styles.statusButtonText}>{status.replace("_", " ")}</Text>
    </TouchableOpacity>
  );

  // ─── Loading ─────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={styles.loadingText}>Loading bookings…</Text>
      </View>
    );
  }

  // ─── Main Render ─────────────────────────────────────────────────────────────
  return (
    <View style={styles.container}>
      {/* ── Filter Tabs ── */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterContainer}
        contentContainerStyle={styles.filterContent}
      >
        {FILTERS.map((status) => (
          <TouchableOpacity
            key={status}
            style={[
              styles.filterTab,
              filter === status && styles.filterTabActive,
            ]}
            onPress={() => setFilter(status)}
          >
            <Text
              style={[
                styles.filterTabText,
                filter === status && styles.filterTabTextActive,
              ]}
            >
              {status.replace("_", " ").toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* ── Stats Row ── */}
      <View style={styles.statsContainer}>
        {[
          { label: "Total", value: filteredBookings.length },
          {
            label: "Pending",
            value: filteredBookings.filter((b) => b.status === "pending")
              .length,
          },
          {
            label: "In Progress",
            value: filteredBookings.filter((b) => b.status === "in_progress")
              .length,
          },
          {
            label: "Completed",
            value: filteredBookings.filter((b) => b.status === "completed")
              .length,
          },
        ].map(({ label, value }) => (
          <View key={label} style={styles.statCard}>
            <Text style={styles.statNumber}>{value}</Text>
            <Text style={styles.statLabel}>{label}</Text>
          </View>
        ))}
      </View>

      {/* ── Bookings List ── */}
      <FlatList
        data={filteredBookings}
        renderItem={renderBooking}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#2563eb"
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>📋 No bookings found</Text>
          </View>
        }
      />

      {/* ── Booking Details Modal ── */}
      <Modal
        animationType="slide"
        transparent
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Booking Details</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>

            {selectedBooking && (
              <ScrollView style={styles.modalBody}>
                <DetailSection label="Customer Name">
                  <Text style={styles.detailValue}>{selectedBooking.name}</Text>
                </DetailSection>

                <DetailSection label="Contact">
                  <Text style={styles.detailValue}>
                    📱 {selectedBooking.phone}
                  </Text>
                  <Text style={styles.detailValue}>
                    ✉️ {selectedBooking.email}
                  </Text>
                </DetailSection>

                <DetailSection label="Service">
                  <Text style={styles.detailValue}>
                    {selectedBooking.service_type}
                  </Text>
                </DetailSection>

                <DetailSection label="Address">
                  <Text style={styles.detailValue}>
                    📍 {selectedBooking.address}
                  </Text>
                </DetailSection>

                <DetailSection label="Preferred Schedule">
                  <Text style={styles.detailValue}>
                    📅 {selectedBooking.preferred_date}
                  </Text>
                  <Text style={styles.detailValue}>
                    ⏰ {selectedBooking.preferred_time}
                  </Text>
                </DetailSection>

                <DetailSection label="Current Status">
                  <View
                    style={[
                      styles.statusBadge,
                      {
                        backgroundColor: getStatusColor(selectedBooking.status),
                      },
                    ]}
                  >
                    <Text style={styles.statusText}>
                      {selectedBooking.status.replace("_", " ")}
                    </Text>
                  </View>
                </DetailSection>

                <DetailSection label="Update Status">
                  <View style={styles.statusButtonContainer}>
                    {[
                      "pending",
                      "confirmed",
                      "in_progress",
                      "completed",
                      "cancelled",
                    ].map(renderStatusButton)}
                  </View>
                </DetailSection>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

// ─── Small helper component ───────────────────────────────────────────────────
function DetailSection({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.detailSection}>
      <Text style={styles.detailLabel}>{label}</Text>
      {children}
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
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
    marginTop: 12,
    fontSize: 16,
  },

  // Filter bar
  filterContainer: {
    backgroundColor: "#1a1a2e",
    borderBottomWidth: 1,
    borderBottomColor: "#374151",
  },
  filterContent: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#374151",
  },
  filterTabActive: {
    backgroundColor: "#2563eb",
  },
  filterTabText: {
    color: "#9ca3af",
    fontSize: 12,
    fontWeight: "600",
  },
  filterTabTextActive: {
    color: "#fff",
  },

  // Stats
  statsContainer: {
    flexDirection: "row",
    padding: 12,
    gap: 8,
    backgroundColor: "#1a1a2e",
    borderBottomWidth: 1,
    borderBottomColor: "#374151",
  },
  statCard: {
    flex: 1,
    backgroundColor: "#0f0f1a",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  statNumber: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2563eb",
  },
  statLabel: {
    fontSize: 10,
    color: "#9ca3af",
    marginTop: 2,
    textAlign: "center",
  },

  // List
  listContainer: {
    padding: 12,
    paddingBottom: 100,
    gap: 12,
  },

  // Booking card
  bookingCard: {
    backgroundColor: "#1a1a2e",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#374151",
  },
  bookingHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  customerName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  serviceType: {
    fontSize: 16,
    color: "#2563eb",
    fontWeight: "600",
    marginBottom: 8,
  },
  contactInfo: {
    fontSize: 14,
    color: "#9ca3af",
    marginBottom: 4,
  },
  bookingFooter: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#374151",
  },
  dateTime: {
    fontSize: 14,
    color: "#fff",
  },
  createdAt: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 4,
  },

  // Empty
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 100,
  },
  emptyText: {
    color: "#6b7280",
    fontSize: 18,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#1a1a2e",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "85%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#374151",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
  },
  closeButton: {
    fontSize: 24,
    color: "#9ca3af",
  },
  modalBody: {
    padding: 20,
  },
  detailSection: {
    marginBottom: 20,
  },
  detailLabel: {
    fontSize: 11,
    color: "#9ca3af",
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  detailValue: {
    fontSize: 15,
    color: "#fff",
    marginBottom: 4,
    lineHeight: 22,
  },
  statusButtonContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  statusButton: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 8,
    minWidth: 90,
    alignItems: "center",
  },
  statusButtonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
    textTransform: "capitalize",
  },
});
