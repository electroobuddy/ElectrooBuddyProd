// Booking Details Screen - View and update booking status

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Linking,
  Alert,
} from 'react-native';
import { Booking, bookingsApi, supabase } from '../services/supabase';
import { notificationService } from '../services/NotificationService';

interface BookingDetailsScreenProps {
  route: {
    params: {
      booking: Booking;
    };
  };
  navigation: any;
}

export default function BookingDetailsScreen({
  route,
  navigation,
}: BookingDetailsScreenProps) {
  const { booking } = route.params;
  const [updating, setUpdating] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(booking.status);

  const updateStatus = async (newStatus: string) => {
    if (newStatus === currentStatus) return;

    Alert.alert(
      'Update Status',
      `Are you sure you want to mark this booking as "${newStatus}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            setUpdating(true);
            try {
              await bookingsApi.updateStatus(booking.id, newStatus);
              setCurrentStatus(newStatus);

              // Send notification to customer
              await sendStatusNotification(newStatus);

              Alert.alert('Success', 'Booking status updated');
              navigation.goBack();
            } catch (error) {
              console.error('Update error:', error);
              Alert.alert('Error', 'Failed to update status');
            } finally {
              setUpdating(false);
            }
          },
        },
      ]
    );
  };

  const sendStatusNotification = async (status: string) => {
    try {
      // Get customer's push subscription
      const { data: subscription } = await supabase
        .from('push_subscriptions')
        .select('endpoint')
        .eq('user_id', booking.user_id)
        .eq('is_active', true)
        .limit(1)
        .maybeSingle();

      if (subscription) {
        // Get status message
        const statusMessages: Record<string, { title: string; body: string }> = {
          confirmed: {
            title: '✅ Booking Confirmed',
            body: `Your ${booking.service_type} booking has been confirmed!`,
          },
          in_progress: {
            title: '🔧 Work Started',
            body: `Your ${booking.service_type} service is now in progress.`,
          },
          completed: {
            title: '✅ Service Completed',
            body: `Your ${booking.service_type} service has been completed.`,
          },
          cancelled: {
            title: '❌ Booking Cancelled',
            body: `Your ${booking.service_type} booking has been cancelled.`,
          },
        };

        const message = statusMessages[status];
        if (message) {
          // Send via OneSignal edge function
          await supabase.functions.invoke('send-onesignal-notification', {
            body: {
              playerIds: [subscription.endpoint],
              title: message.title,
              message: message.body,
              url: '/track-booking',
              data: { bookingId: booking.id, status },
            },
          });
        }
      }
    } catch (error) {
      console.error('Notification error:', error);
    }
  };

  const callCustomer = () => {
    Linking.openURL(`tel:${booking.phone}`);
  };

  const whatsappCustomer = () => {
    const message = encodeURIComponent(
      `Hi ${booking.name}, this is Electroo Buddy regarding your ${booking.service_type} booking.`
    );
    Linking.openURL(`https://wa.me/${booking.phone.replace(/[^0-9]/g, '')}?text=${message}`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return '#f59e0b';
      case 'confirmed':
        return '#10b981';
      case 'in_progress':
        return '#3b82f6';
      case 'completed':
        return '#8b5cf6';
      case 'cancelled':
        return '#ef4444';
      default:
        return '#6b7280';
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
          <Text style={styles.value}>{booking.name}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Phone:</Text>
          <Text style={styles.value}>{booking.phone}</Text>
        </View>
        {booking.email && (
          <View style={styles.infoRow}>
            <Text style={styles.label}>Email:</Text>
            <Text style={styles.value}>{booking.email}</Text>
          </View>
        )}

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.quickAction} onPress={callCustomer}>
            <Text style={styles.quickActionText}>📞 Call</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickAction} onPress={whatsappCustomer}>
            <Text style={styles.quickActionText}>💬 WhatsApp</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Service Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Service Details</Text>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Service:</Text>
          <Text style={styles.value}>{booking.service_type}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Address:</Text>
          <Text style={styles.value}>{booking.address}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Preferred:</Text>
          <Text style={styles.value}>
            {booking.preferred_date} at {booking.preferred_time}
          </Text>
        </View>
        {booking.exact_location && (
          <View style={styles.infoRow}>
            <Text style={styles.label}>Location:</Text>
            <Text style={styles.value}>{booking.exact_location}</Text>
          </View>
        )}
      </View>

      {/* Additional Details */}
      {(booking.custom_service_demand || booking.is_switch_working !== null) && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Additional Details</Text>
          {booking.custom_service_demand && (
            <View style={styles.infoRow}>
              <Text style={styles.label}>Demand:</Text>
              <Text style={styles.value}>{booking.custom_service_demand}</Text>
            </View>
          )}
          {booking.is_switch_working !== null && (
            <View style={styles.infoRow}>
              <Text style={styles.label}>Switch:</Text>
              <Text style={styles.value}>
                {booking.is_switch_working === 'yes' ? 'Working' : 'Not Working'}
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
              { backgroundColor: '#10b981' },
              currentStatus === 'confirmed' && styles.actionButtonDisabled,
            ]}
            onPress={() => updateStatus('confirmed')}
            disabled={updating || currentStatus === 'confirmed'}
          >
            <Text style={styles.actionButtonText}>✅ Confirm</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.actionButton,
              { backgroundColor: '#3b82f6' },
              currentStatus === 'in_progress' && styles.actionButtonDisabled,
            ]}
            onPress={() => updateStatus('in_progress')}
            disabled={updating || currentStatus === 'in_progress'}
          >
            <Text style={styles.actionButtonText}>🔧 In Progress</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.actionButton,
              { backgroundColor: '#8b5cf6' },
              currentStatus === 'completed' && styles.actionButtonDisabled,
            ]}
            onPress={() => updateStatus('completed')}
            disabled={updating || currentStatus === 'completed'}
          >
            <Text style={styles.actionButtonText}>✅ Completed</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.actionButton,
              { backgroundColor: '#ef4444' },
              currentStatus === 'cancelled' && styles.actionButtonDisabled,
            ]}
            onPress={() => updateStatus('cancelled')}
            disabled={updating || currentStatus === 'cancelled'}
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
        <Text style={styles.metaText}>Booking ID: {booking.id}</Text>
        <Text style={styles.metaText}>
          Created: {new Date(booking.created_at).toLocaleString()}
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f1a',
  },
  section: {
    backgroundColor: '#1a1a2e',
    padding: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2563eb',
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  label: {
    width: 80,
    fontSize: 14,
    color: '#9ca3af',
  },
  value: {
    flex: 1,
    fontSize: 14,
    color: '#fff',
  },
  statusBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  statusText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  quickAction: {
    flex: 1,
    backgroundColor: '#0f0f1a',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#374151',
  },
  quickActionText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  actionsSection: {
    backgroundColor: '#1a1a2e',
    padding: 16,
  },
  actionButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    minWidth: '45%',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionButtonDisabled: {
    opacity: 0.5,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
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
    color: '#6b7280',
    marginBottom: 4,
  },
});
