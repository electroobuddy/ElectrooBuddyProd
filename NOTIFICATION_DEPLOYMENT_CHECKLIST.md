# Notification System - Deployment Checklist

## Pre-Deployment

- [ ] Review all created files
- [ ] Test database migration on local/staging first
- [ ] Backup current database
- [ ] Get Resend API key (or decide to skip email for now)

## Database Setup

- [ ] Run migration: `supabase/migrations/20260412_create_notifications_system.sql`
- [ ] Verify tables created:
  ```sql
  SELECT table_name FROM information_schema.tables 
  WHERE table_name IN ('notifications', 'notification_preferences');
  ```
- [ ] Verify functions created:
  ```sql
  SELECT routine_name FROM information_schema.routines 
  WHERE routine_name LIKE '%notification%';
  ```
- [ ] Test creating a notification:
  ```sql
  SELECT create_notification(
    'your-user-id',
    'test',
    'Test Notification',
    'This is a test',
    NULL,
    NULL
  );
  ```

## Edge Functions

- [ ] Set environment variables in Supabase Dashboard:
  - `SUPABASE_URL`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `RESEND_API_KEY` (optional)
  - `EMAIL_FROM`
  
- [ ] Deploy notify-booking-status:
  ```bash
  supabase functions deploy notify-booking-status
  ```

- [ ] Deploy send-notification-email:
  ```bash
  supabase functions deploy send-notification-email
  ```

- [ ] Test Edge Functions:
  ```bash
  # Test notify-booking-status
  supabase functions serve notify-booking-status --env-file ./supabase/.env
  
  # Test in another terminal
  curl -X POST http://localhost:54321/functions/v1/notify-booking-status \
    -H "Authorization: Bearer YOUR_ANON_KEY" \
    -H "Content-Type: application/json" \
    -d '{"bookingId":"test-id","oldStatus":"pending","newStatus":"confirmed"}'
  ```

## Frontend Testing

- [ ] Start development server: `npm run dev`
- [ ] Test as User:
  - [ ] Login as regular user
  - [ ] Create a booking
  - [ ] Check notification bell appears
  - [ ] Verify notification received
  - [ ] Check email received (if configured)
  - [ ] Mark notification as read
  - [ ] Test mark all as read
  
- [ ] Test as Admin:
  - [ ] Login as admin
  - [ ] Check notification bell shows new booking alert
  - [ ] Update booking status
  - [ ] Verify notifications sent to user
  - [ ] Assign technician to booking
  - [ ] Check both user and technician notified
  
- [ ] Test as Technician:
  - [ ] Login as technician
  - [ ] Check for assigned booking notification
  - [ ] Update booking status to "in_progress"
  - [ ] Update to "completed"
  - [ ] Verify notifications sent to user and admin

## Real-time Testing

- [ ] Open app in two browsers (or incognito)
- [ ] Login as user in one, admin in another
- [ ] Admin updates booking status
- [ ] User should see notification appear in real-time
- [ ] Check badge count updates without refresh

## Notification Preferences

- [ ] Navigate to settings (add route if needed)
- [ ] Toggle email preferences
- [ ] Toggle in-app notifications
- [ ] Save and verify in database
- [ ] Test that preferences are respected

## Mobile Testing

- [ ] Test on mobile device or Chrome DevTools mobile view
- [ ] Notification bell visible in mobile header
- [ ] Dropdown works on mobile
- [ ] Mark as read works
- [ ] Responsive layout correct

## Email Testing (if configured)

- [ ] Create booking → Check confirmation email
- [ ] Confirm booking → Check confirmation email
- [ ] Assign technician → Check assignment emails
- [ ] Complete booking → Check completion email
- [ ] Cancel booking → Check cancellation email
- [ ] Verify email templates render correctly
- [ ] Check emails on different clients (Gmail, Outlook, etc.)

## Performance Testing

- [ ] Create 50+ notifications for a user
- [ ] Check dropdown loads quickly
- [ ] Verify only 20 shown initially
- [ ] Test mark all as read performance
- [ ] Check realtime doesn't lag with multiple updates

## Error Handling

- [ ] Test without Resend API key (should fail gracefully)
- [ ] Test with invalid user ID
- [ ] Test with missing booking ID
- [ ] Check console for proper error messages
- [ ] Verify UI doesn't break on notification errors

## Production Deployment

- [ ] Update `.env` with production Resend API key
- [ ] Update `EMAIL_FROM` to production domain
- [ ] Deploy Edge Functions to production
- [ ] Run migration on production database
- [ ] Test complete flow in production
- [ ] Monitor Edge Function logs
- [ ] Check email deliverability rates

## Post-Deployment Monitoring

- [ ] Monitor Supabase Edge Function logs
- [ ] Check for failed email deliveries
- [ ] Monitor notification creation rate
- [ ] Check for any user complaints
- [ ] Review database size growth
- [ ] Set up alerts for failed notifications (optional)

## Documentation

- [ ] Update user documentation (if applicable)
- [ ] Train admin team on notification system
- [ ] Create FAQ for common notification questions
- [ ] Document email templates for future customization

## Rollback Plan

If issues occur:
1. Edge Functions can be reverted to previous version
2. Database migration can be rolled back (carefully)
3. Frontend can remove NotificationBell component temporarily
4. System falls back to old booking_notifications table

---

**Deployment Date:** _____________  
**Deployed By:** _____________  
**Status:** [ ] Success [ ] Issues Found [ ] Rolled Back

**Notes:**
_______________________________________
_______________________________________
_______________________________________
