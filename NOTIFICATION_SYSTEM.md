# Notification System - Implementation Guide

## Overview

The ElectroBuddy notification system provides real-time in-app notifications and email notifications for all user roles (Admin, User, Technician) across the entire booking lifecycle.

## Features

✅ **Real-time in-app notifications** with Supabase Realtime  
✅ **Email notifications** via Resend API  
✅ **Notification preferences** - users can customize what they receive  
✅ **Unread count badge** on notification bell  
✅ **Mark as read/unread** functionality  
✅ **Notification history** - view past notifications  
✅ **Role-based notifications** - different notifications for Admin, User, Technician  
✅ **Toast notifications** for new arrivals  
✅ **Mobile responsive** notification dropdown  

## Notification Types

### For Users (Customers)
- **Booking Created** - Confirmation when they submit a booking
- **Booking Confirmed** - When admin confirms their booking
- **Technician Assigned** - When a technician is assigned to their booking
- **Service In Progress** - When technician starts working
- **Service Completed** - When service is finished
- **Booking Cancelled** - If booking is cancelled

### For Admins
- **New Booking Received** - Alert for every new booking
- **Booking Status Changes** - Track all status updates
- **Technician Assigned** - When admin assigns a technician

### For Technicians
- **New Booking Assigned** - When they receive a new assignment
- **Booking Updates** - Status changes on their bookings

## Files Created/Modified

### Database
- `supabase/migrations/20260412_create_notifications_system.sql` - Complete notification schema

### Edge Functions
- `supabase/functions/notify-booking-status/index.ts` - Enhanced with notifications
- `supabase/functions/send-notification-email/index.ts` - Email sending via Resend

### Frontend Components
- `src/hooks/useNotifications.ts` - Hook with realtime subscriptions
- `src/components/NotificationBell.tsx` - Bell icon with dropdown
- `src/components/NotificationSettings.tsx` - User preferences UI

### Layout Integrations
- `src/pages/admin/AdminLayout.tsx` - Added notification bell
- `src/pages/user/UserLayout.tsx` - Added notification bell
- `src/pages/technician/TechnicianLayout.tsx` - Added notification bell

### Booking Flow Integrations
- `src/pages/user/UserBookings.tsx` - Triggers on booking creation
- `src/pages/admin/AdminBookings.tsx` - Triggers on status update
- `src/pages/technician/TechnicianBookings.tsx` - Triggers on status update

### Configuration
- `.env` - Added email configuration variables

## Setup Instructions

### 1. Apply Database Migration

Run the migration in your Supabase project:

```bash
# Using Supabase CLI
supabase db push

# Or manually run the SQL file in Supabase Dashboard
# File: supabase/migrations/20260412_create_notifications_system.sql
```

### 2. Configure Email Service (Optional but Recommended)

#### Option A: Using Resend (Recommended)

1. Sign up at [https://resend.com](https://resend.com)
2. Get your API key from [https://resend.com/api-keys](https://resend.com/api-keys)
3. Add to `.env`:

```env
RESEND_API_KEY=re_your_actual_api_key_here
EMAIL_FROM=noreply@yourdomain.com
```

4. Verify your domain in Resend dashboard for better deliverability

#### Option B: Without Email (Notifications Still Work)

If you don't configure email, in-app notifications will still work perfectly. The system will log email attempts to console.

### 3. Deploy Edge Functions

```bash
# Deploy notify-booking-status function
supabase functions deploy notify-booking-status

# Deploy send-notification-email function
supabase functions deploy send-notification-email
```

### 4. Set Supabase Environment Variables for Edge Functions

In your Supabase Dashboard → Edge Functions → Settings:

```
SUPABASE_URL=https://izgwlqxmafdxwewmasak.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
RESEND_API_KEY=your_resend_api_key
EMAIL_FROM=noreply@electroobuddy.com
```

## Database Schema

### Tables

#### `notifications`
Stores all in-app notifications:
- `id` - UUID primary key
- `user_id` - Reference to auth.users
- `type` - Notification type (booking_created, booking_confirmed, etc.)
- `title` - Notification title
- `message` - Notification message
- `booking_id` - Related booking (optional)
- `order_id` - Related order (optional)
- `is_read` - Read status
- `read_at` - When marked as read
- `email_sent` - Whether email was sent
- `email_sent_at` - When email was sent
- `created_at` - Creation timestamp
- `metadata` - Additional JSONB data

#### `notification_preferences`
User preferences for notifications:
- `user_id` - Reference to auth.users (unique)
- `email_booking_created` - Email on booking creation
- `email_booking_confirmed` - Email on booking confirmation
- `email_booking_assigned` - Email on technician assignment
- `email_booking_completed` - Email on completion
- `email_booking_cancelled` - Email on cancellation
- `in_app_notifications` - Enable/disable in-app notifications

### Helper Functions

- `create_notification()` - Creates a new notification
- `mark_notification_read()` - Marks single notification as read
- `mark_all_notifications_read()` - Marks all as read for user
- `get_unread_notification_count()` - Returns unread count

## Usage Examples

### Creating a Notification (Backend)

```typescript
// In Edge Function or Database Function
await supabase.rpc("create_notification", {
  p_user_id: "user-uuid-here",
  p_type: "booking_confirmed",
  p_title: "Booking Confirmed",
  p_message: "Your booking has been confirmed for March 15, 2026",
  p_booking_id: "booking-uuid-here",
  p_metadata: { service: "Fan Installation", date: "2026-03-15" }
});
```

### Using Notification Hook (Frontend)

```typescript
import { useNotifications } from "@/hooks/useNotifications";

const { 
  notifications,
  unreadCount,
  loading,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  refreshNotifications
} = useNotifications(userId);
```

### Sending Email Notification

```typescript
await supabase.functions.invoke("send-notification-email", {
  body: {
    to: "user@example.com",
    type: "booking_confirmed",
    booking: bookingData,
    oldStatus: "pending",
    newStatus: "confirmed"
  }
});
```

## Notification Flow

### 1. User Creates Booking
```
User submits booking form
  ↓
Notification created for user: "Booking Submitted"
  ↓
Email sent to user (if configured)
  ↓
Notifications created for all admins: "New Booking Received"
  ↓
Real-time update shows notification bell badge
```

### 2. Admin Updates Booking Status
```
Admin changes status to "confirmed"
  ↓
Edge Function: notify-booking-status triggered
  ↓
Notification created for user: "Booking Confirmed"
  ↓
Email sent to user (if configured)
  ↓
Real-time update to user's notification bell
```

### 3. Admin Assigns Technician
```
Admin assigns technician to booking
  ↓
Edge Function triggered
  ↓
Notification created for user: "Technician Assigned"
  ↓
Notification created for technician: "New Booking Assigned"
  ↓
Emails sent to both user and technician
  ↓
Real-time updates to both notification bells
```

### 4. Technician Completes Service
```
Technician marks booking as "completed"
  ↓
Edge Function triggered
  ↓
Notification created for user: "Service Completed"
  ↓
Notification created for admin: "Booking Completed"
  ↓
Emails sent to user and admin
  ↓
Real-time updates
```

## Customization

### Adding New Notification Types

1. Add to `notification_preferences` table (if email preference needed)
2. Create email template in `send-notification-email/index.ts`
3. Use `create_notification()` function in your code

### Styling Notifications

Edit `src/components/NotificationBell.tsx`:
- Change icons in `getNotificationIcon()` function
- Modify colors in the dropdown
- Adjust animations in motion.div components

### Adding Notification Sounds

1. Add sound file to `public/notification-sound.mp3`
2. Update `useNotifications.ts` hook to play sound on new notification:

```typescript
const playSound = () => {
  const audio = new Audio('/notification-sound.mp3');
  audio.play().catch(() => {});
};

// In the realtime subscription:
playSound();
```

## Troubleshooting

### Notifications Not Appearing

1. Check browser console for errors
2. Verify migration was applied: `SELECT * FROM notifications LIMIT 5;`
3. Check RLS policies are correct
4. Ensure user has notification preferences: `SELECT * FROM notification_preferences WHERE user_id = 'uuid';`

### Emails Not Sending

1. Verify `RESEND_API_KEY` is set in Edge Function secrets
2. Check Edge Function logs in Supabase Dashboard
3. Test API key with Resend directly
4. Check email deliverability (spam folder)

### Real-time Not Working

1. Verify table has `REPLICA IDENTITY FULL` set
2. Check Supabase Realtime is enabled in dashboard
3. Verify user is authenticated
4. Check browser network tab for WebSocket connection

## Performance Considerations

- Notifications are limited to 50 per fetch (adjust in `useNotifications.ts`)
- Realtime subscription automatically cleans up on unmount
- Indexes on `user_id`, `is_read`, `created_at` for fast queries
- Email sending is non-blocking (doesn't delay UI)

## Future Enhancements

- [ ] Push notifications (Service Workers)
- [ ] SMS notifications (Twilio integration)
- [ ] Notification scheduling/quiet hours
- [ ] Advanced filtering and search
- [ ] Bulk actions (mark multiple as read)
- [ ] Notification categories/tags
- [ ] Export notification history
- [ ] Analytics on notification engagement

## Support

For issues or questions:
- Check Supabase Edge Function logs
- Review browser console errors
- Verify database migration status
- Test with different user roles

---

**Last Updated:** April 12, 2026  
**Version:** 1.0.0
