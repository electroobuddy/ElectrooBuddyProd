// Technician Screen - Dashboard for technicians with notifications

import { useFocusEffect } from "@react-navigation/native";
import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "../../src/contexts/AuthContext";
import { notificationService } from "../../src/services/NotificationService";
import {
  Booking,
  bookingsApi,
  Notification,
  notificationsApi,
} from "../../src/services/supabase";

const STATUS_COLORS: Record<string, string> = {
  pending: "#f59e0b",
  confirmed: "#10b981",
  in_progress: "#3b82f6",
  completed: "#8b5cf6",
  cancelled: "#ef4444",
};

export default function TechnicianScreen() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<"bookings" | "notifications">(
    "bookings",
  );

  // ─── Data Fetching ────────────────────────────────────────────────────────────
  const fetchBookings = useCallback(async () => {
    try {
      const data = await bookingsApi.getAll();
      const technicianBookings = data.filter(
        (b) => b.assigned_technician_id === user?.id || b.status === "pending",
      );
      setBookings(technicianBookings);
    } catch (error) {
      console.error("Error fetching bookings:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.id]);

  const fetchNotifications = useCallback(async () => {
    try {
      const data = await notificationsApi.getAll();
      setNotifications(data);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    await Promise.all([fetchBookings(), fetchNotifications()]);
  }, [fetchBookings, fetchNotifications]);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [fetchData]),
  );

  // ─── Real-time subscriptions ─────────────────────────────────────────────────
  useEffect(() => {
    const bookingSubscription = bookingsApi.subscribeToNew((booking) => {
      if (
        booking.assigned_technician_id === user?.id ||
        booking.status === "pending"
      ) {
        setBookings((prev) => [booking, ...prev]);
      }
      notificationService.displayLocalNotification(
        "🔧 New Booking Assigned",
        `${booking.name} - ${booking.service_type}`,
        { booking_id: booking.id },
      );
    });

    const notificationSubscription = notificationsApi.subscribe(
      (notification) => {
        setNotifications((prev) => [notification, ...prev]);
      },
    );

    return () => {
      bookingSubscription.unsubscribe();
      notificationSubscription.unsubscribe();
    };
  }, [user?.id]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  // ─── Status Actions ───────────────────────────────────────────────────────────
  const acceptBooking = async (bookingId: string) => {
    try {
      await bookingsApi.updateStatus(bookingId, "confirmed");
      Alert.alert("Success", "Booking accepted successfully");
      fetchBookings();
    } catch {
      Alert.alert("Error", "Failed to accept booking");
    }
  };

  const startWork = async (bookingId: string) => {
    try {
      await bookingsApi.updateStatus(bookingId, "in_progress");
      Alert.alert("Success", "Work started successfully");
      fetchBookings();
    } catch {
      Alert.alert("Error", "Failed to start work");
    }
  };

  const completeBooking = async (bookingId: string) => {
    try {
      await bookingsApi.updateStatus(bookingId, "completed");
      Alert.alert("Success", "Booking completed successfully");
      fetchBookings();
    } catch {
      Alert.alert("Error", "Failed to complete booking");
    }
  };

  const getStatusColor = (status: string) => STATUS_COLORS[status] ?? "#6b7280";

  // ─── Derived counts ───────────────────────────────────────────────────────────
  const unreadCount = notifications.filter((n) => !n.is_read).length;
  const pendingCount = bookings.filter((b) => b.status === "pending").length;
  const inProgressCount = bookings.filter(
    (b) => b.status === "in_progress",
  ).length;

  // ─── Booking Card ─────────────────────────────────────────────────────────────
  const renderBooking = (item: Booking) => (
    <View key={item.id} style={styles.card}>
      {/* Card header */}
      <View style={styles.cardHeader}>
        <Text style={styles.customerName} numberOfLines={1}>
          {item.name}
        </Text>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(item.status) },
          ]}
        >
          <Text style={styles.statusText}>{item.status.replace("_", " ")}</Text>
        </View>
      </View>

      {/* Details */}
      <View style={styles.bookingDetails}>
        <Text style={styles.serviceType}>{item.service_type}</Text>
        <Text style={styles.metaText}>📍 {item.address}</Text>
        <Text style={styles.metaText}>
          📅 {item.preferred_date} &nbsp;⏰ {item.preferred_time}
        </Text>
        {item.phone && <Text style={styles.metaText}>📞 {item.phone}</Text>}
      </View>

      {/* Action buttons */}
      <View style={styles.actionButtons}>
        {item.status === "pending" && (
          <TouchableOpacity
            style={[styles.actionButton, styles.acceptButton]}
            activeOpacity={0.8}
            onPress={() => acceptBooking(item.id)}
          >
            <Text style={styles.actionButtonText}>✔ Accept</Text>
          </TouchableOpacity>
        )}
        {item.status === "confirmed" && (
          <TouchableOpacity
            style={[styles.actionButton, styles.startButton]}
            activeOpacity={0.8}
            onPress={() => startWork(item.id)}
          >
            <Text style={styles.actionButtonText}>▶ Start Work</Text>
          </TouchableOpacity>
        )}
        {item.status === "in_progress" && (
          <TouchableOpacity
            style={[styles.actionButton, styles.completeButton]}
            activeOpacity={0.8}
            onPress={() => completeBooking(item.id)}
          >
            <Text style={styles.actionButtonText}>✔ Complete</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  // ─── Notification Card ────────────────────────────────────────────────────────
  const renderNotification = (item: Notification) => {
    if (!item) return null;
    return (
      <View
        key={item.id}
        style={[styles.card, !item.is_read && styles.unreadCard]}
      >
        <View style={styles.notificationHeader}>
          <Text style={styles.notificationTitle} numberOfLines={1}>
            {item.title ?? "No Title"}
          </Text>
          {!item.is_read && <View style={styles.unreadDot} />}
        </View>
        <Text style={styles.notificationMessage}>
          {item.message ?? "No Message"}
        </Text>
        <Text style={styles.notificationTime}>
          {item.created_at ? new Date(item.created_at).toLocaleString() : "—"}
        </Text>
      </View>
    );
  };

  // ─── Loading ──────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading technician dashboard…</Text>
      </View>
    );
  }

  // ─── Main Render ──────────────────────────────────────────────────────────────
  return (
    <View style={styles.container}>
      {/* ── Header Stats ── */}
      <View style={styles.statsContainer}>
        {[
          { label: "Pending", value: pendingCount },
          { label: "Notifications", value: unreadCount },
          { label: "In Progress", value: inProgressCount },
        ].map(({ label, value }) => (
          <View key={label} style={styles.statCard}>
            <Text style={styles.statNumber}>{value}</Text>
            <Text style={styles.statLabel}>{label}</Text>
          </View>
        ))}
      </View>

      {/* ── Tab Bar ── */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "bookings" && styles.activeTab]}
          onPress={() => setActiveTab("bookings")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "bookings" && styles.activeTabText,
            ]}
          >
            Bookings ({bookings.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === "notifications" && styles.activeTab,
          ]}
          onPress={() => setActiveTab("notifications")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "notifications" && styles.activeTabText,
            ]}
          >
            Notifications ({unreadCount})
          </Text>
        </TouchableOpacity>
      </View>

      {/* ── Content ── */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#2563eb"
          />
        }
      >
        {activeTab === "bookings" ? (
          bookings.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>🔧</Text>
              <Text style={styles.emptyText}>No bookings assigned</Text>
              <Text style={styles.emptySubtext}>
                You'll see bookings here when they're assigned to you.
              </Text>
            </View>
          ) : (
            bookings.map(renderBooking)
          )
        ) : notifications.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🔔</Text>
            <Text style={styles.emptyText}>No notifications</Text>
            <Text style={styles.emptySubtext}>
              You'll receive notifications for new bookings and updates.
            </Text>
          </View>
        ) : (
          notifications.map(renderNotification)
        )}
      </ScrollView>
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
    fontSize: 16,
  },

  // Stats
  statsContainer: {
    flexDirection: "row",
    padding: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#1a1a2e",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#374151",
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2563eb",
  },
  statLabel: {
    fontSize: 11,
    color: "#9ca3af",
    marginTop: 4,
    textAlign: "center",
  },

  // Tabs
  tabContainer: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: "#1a1a2e",
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    borderColor: "#374151",
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: "#2563eb",
  },
  tabText: {
    color: "#9ca3af",
    fontSize: 13,
    fontWeight: "600",
  },
  activeTabText: {
    color: "#fff",
  },

  // Content scroll
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingBottom: 100,
    gap: 10,
  },

  // Card
  card: {
    backgroundColor: "#1a1a2e",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#374151",
  },
  unreadCard: {
    borderColor: "#2563eb",
    borderWidth: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    gap: 8,
  },
  customerName: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#fff",
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
  },
  statusText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  bookingDetails: {
    marginBottom: 14,
    gap: 4,
  },
  serviceType: {
    fontSize: 15,
    color: "#2563eb",
    fontWeight: "600",
    marginBottom: 4,
  },
  metaText: {
    fontSize: 13,
    color: "#9ca3af",
    lineHeight: 20,
  },

  // Action buttons
  actionButtons: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  acceptButton: {
    backgroundColor: "#10b981",
  },
  startButton: {
    backgroundColor: "#3b82f6",
  },
  completeButton: {
    backgroundColor: "#8b5cf6",
  },
  actionButtonText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "700",
  },

  // Notification card
  notificationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  notificationTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#fff",
    flex: 1,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#2563eb",
    flexShrink: 0,
  },
  notificationMessage: {
    fontSize: 13,
    color: "#9ca3af",
    marginBottom: 8,
    lineHeight: 19,
  },
  notificationTime: {
    fontSize: 11,
    color: "#6b7280",
  },

  // Empty state
  emptyContainer: {
    alignItems: "center",
    paddingTop: 60,
    paddingHorizontal: 40,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
  },
  emptySubtext: {
    color: "#6b7280",
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
});
