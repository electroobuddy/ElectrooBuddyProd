# OneSignal Subscription Workflow Guide

## 📱 How Users Subscribe to Notifications

### **1. Initial App Setup**
When users first open the mobile app:
- **App Launch** → `NotificationService.initialize()` called
- **Settings Screen** → User can toggle notifications on/off
- **OneSignal Registration** → Device gets unique player ID

### **2. User Subscription Process**

#### **Settings Screen Subscription**
```typescript
// User enables notifications in settings
await notificationService.optIn();

// This calls OneSignal.User.pushSubscription.optIn()
// User sees native permission dialog
// User grants permission → Device is subscribed
```

#### **Automatic Subscription**
```typescript
// NotificationService automatically handles subscription
await notificationService.saveSubscription(playerId);

// Saves to push_subscriptions table:
{
  user_id: "admin_user",
  endpoint: playerId,
  subscription_type: "onesignal",
  subscription: {
    onesignal: true,
    subscription_id: playerId,
    app_id: "ah62hcskknhxfhaqfvgj3mye6dkhif3gzpoeinvfmbjlw3syhuwdlvllx7brghjqxviuka4gh6wsjqurychr36zjexuacteflaalmhi
  },
  is_active: true,
  updated_at: new Date().toISOString()
}
```

## 🔔 **Web to Mobile Notification Flow**

### **3. Booking Creation (Website)**
When booking is submitted from `BookingForm.tsx` or `RequestServiceSection.tsx`:

```typescript
// 1. Booking inserted into database
const { data: booking } = await supabase.from("bookings").insert(payload);

// 2. Admin notification created
await sendAdminNotificationAsync({
  title: "🔔 New Booking Received",
  message: `New booking from ${name} for ${service}`,
  type: "new_booking",
  bookingId: booking.id,
  customerName: name,
  service: service,
  metadata: {
    customer_name: name,
    customer_phone: phone,
    customer_email: email,
    service_type: service,
    preferred_date: date,
    preferred_time: time,
    address: address,
    is_guest: !user
  }
});

// 3. OneSignal push notification sent
// Via OneSignal API or web dashboard
```

### **4. Mobile App Notification Reception**

#### **Real-time Updates**
```typescript
// Technician dashboard subscribes to new bookings
const subscription = bookingsApi.subscribeToNew((booking) => {
  console.log('New booking received:', booking);
  
  // Show local notification
  notificationService.displayLocalNotification(
    '🔧 New Booking Assigned',
    `${booking.name} - ${booking.service_type}`,
    { booking_id: booking.id }
  );
  
  // Update UI
  setBookings(prev => [booking, ...prev]);
});
```

#### **Push Notification Delivery**
```typescript
// OneSignal sends push to all subscribed devices
// Mobile app receives and displays notification
// User taps notification → Opens technician dashboard
```

## 🔄 **Complete Workflow Diagram**

```
WEBSITE (BookingForm/RequestServiceSection)
         ↓
    1. User submits booking
         ↓
    2. Booking saved to database
         ↓
    3. Admin notification created
         ↓
    4. OneSignal API called
         ↓
    5. Push notification sent
         ↓
MOBILE APP (Technician Dashboard)
         ↓
    6. Real-time subscription receives update
         ↓
    7. Local notification displayed
         ↓
    8. UI updated with new booking
```

## ⚙️ **Settings Screen Integration**

### **Notification Controls**
```typescript
// Settings screen manages user preferences
const [notificationsEnabled, setNotificationsEnabled] = useState(true);

// User toggles notifications
const handleNotificationToggle = async () => {
  if (notificationsEnabled) {
    await notificationService.optIn();
    Alert.alert('Success', 'Notifications enabled');
  } else {
    await notificationService.unsubscribe();
    Alert.alert('Success', 'Notifications disabled');
  }
};
```

### **Service Status Display**
```typescript
// Shows OneSignal connection status
const [serviceStatus, setServiceStatus] = useState('Active');

// Refresh button checks status
const refreshStatus = async () => {
  await notificationService.initialize();
  setServiceStatus('Active'); // or 'Inactive'
};
```

## 📱 **Mobile App Notification Types**

### **1. Push Notifications**
- **Trigger**: New booking assigned to technician
- **Source**: OneSignal push service
- **Display**: System notification + in-app banner

### **2. Real-time Updates**
- **Trigger**: Database changes via Supabase subscriptions
- **Source**: Supabase real-time channels
- **Display**: Live UI updates

### **3. Local Notifications**
- **Trigger**: App events (booking accepted, etc.)
- **Source**: `notificationService.displayLocalNotification()`
- **Display**: In-app notification center

## 🔍 **Testing the Complete Flow**

### **Test 1: User Subscription**
1. Open mobile app
2. Go to Settings tab
3. Enable notifications
4. Grant permission when prompted
5. Check `push_subscriptions` table for record

### **Test 2: Booking Creation**
1. Open website booking form
2. Submit booking with test data
3. Check `bookings` table for new record
4. Check `notifications` table for admin notification
5. Check OneSignal dashboard for push notification

### **Test 3: Mobile Reception**
1. Keep mobile app open on technician dashboard
2. Submit booking from website
3. Verify real-time update appears
4. Check local notification displayed
5. Confirm UI shows new booking

## 🎯 **Key Integration Points**

### **Database Tables**
```sql
-- Bookings table (source of truth)
CREATE TABLE bookings (
  id UUID PRIMARY KEY,
  name TEXT,
  phone TEXT,
  service_type TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP
);

-- Notifications table (admin alerts)
CREATE TABLE notifications (
  id UUID PRIMARY KEY,
  title TEXT,
  message TEXT,
  type TEXT,
  booking_id UUID REFERENCES bookings(id),
  created_at TIMESTAMP
);

-- Push subscriptions table (device tracking)
CREATE TABLE push_subscriptions (
  id UUID PRIMARY KEY,
  user_id TEXT,
  endpoint TEXT,
  subscription JSONB,
  is_active BOOLEAN,
  updated_at TIMESTAMP
);
```

### **API Endpoints**
```typescript
// OneSignal API
POST https://api.onesignal.com/notifications
Headers: {
  "Content-Type": "application/json",
  "Authorization": "Basic YOUR_API_KEY"
}

// Supabase Real-time
bookingsApi.subscribeToNew(callback);
notificationsApi.subscribe(callback);
```

## ✅ **Success Indicators**

### **Working Setup Shows:**
1. ✅ User can toggle notifications in settings
2. ✅ Permission dialog appears when enabling
3. ✅ Subscription saved to database
4. ✅ Booking creation triggers admin notification
5. ✅ Push notifications sent to devices
6. ✅ Real-time updates appear in mobile app
7. ✅ Local notifications displayed on device
8. ✅ Technician dashboard updates immediately

### **Troubleshooting:**
- **No notifications**: Check settings, verify OneSignal subscription
- **Delayed notifications**: Check real-time subscription connection
- **Permission denied**: Guide user to app settings
- **OneSignal errors**: Check API key and app configuration

## 🚀 **Ready for Production**

The complete notification workflow is implemented:
- **Website** → Creates bookings → Triggers notifications
- **OneSignal** → Delivers push notifications to devices
- **Mobile App** → Receives notifications → Updates UI in real-time

Users will receive instant notifications when bookings are created from the website!
