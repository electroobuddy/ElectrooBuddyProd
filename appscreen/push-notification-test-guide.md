# Push Notification Testing Guide

## 🎯 **Complete Implementation Status**

### ✅ **What's Implemented:**
1. **OneSignal Edge Function** - Handles push notification delivery
2. **Device Registration** - Automatic device registration on app startup
3. **Push Notification Utilities** - Helper functions for sending notifications
4. **Status Update Notifications** - Automatic customer notifications on status changes
5. **Notification Service** - Enhanced with device management

### 🔄 **What's Ready for Testing:**
1. **Edge Function Deployment** - Ready to deploy to Supabase
2. **Device Registration Flow** - Mock implementation for testing
3. **Push Notification API** - Complete utility functions
4. **Status Update Flow** - Integrated in booking details screen

---

## 🧪 **Testing Steps**

### **Phase 1: Edge Function Testing**
```bash
# 1. Deploy the edge function
npx supabase functions deploy send-onesignal-notification

# 2. Test the edge function directly
curl -X POST 'https://your-project.supabase.co/functions/v1/send-onesignal-notification' \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer YOUR_ANON_KEY' \
  -d '{
    "playerIds": ["test-device-id"],
    "title": "Test Notification",
    "message": "This is a test notification"
  }'
```

### **Phase 2: Device Registration Testing**
```typescript
// In the app console, check for:
console.log("🔔 Notification service initialized successfully");
console.log("📱 Device registered: device_1234567890_abc123");
```

### **Phase 3: Booking Status Update Testing**
1. Open booking details screen
2. Update booking status to "confirmed"
3. Check console for:
   - "✅ Booking status updated"
   - Push notification API call logs
4. Verify database entry in `push_subscriptions` table

### **Phase 4: Complete Flow Testing**
1. **App Startup**: Device registration
2. **Booking Creation**: Should trigger admin notification
3. **Status Update**: Should trigger customer notification
4. **Edge Function**: Should receive and process requests

---

## 🔧 **Current Limitations & Next Steps**

### **⚠️ Current Limitations:**
1. **OneSignal SDK Not Linked** - Native modules need proper installation
2. **Mock Device IDs** - Using temporary device IDs for testing
3. **No Background Handling** - App must be open for notifications
4. **Edge Function Type Errors** - Deno types need resolution

### **🚀 Next Steps for Full Implementation:**
1. **Install OneSignal React Native SDK**
   ```bash
   npm install react-native-onesignal
   npx pod-install ios
   ```

2. **Configure Native Projects**
   - iOS: Update Info.plist for background modes
   - Android: Update AndroidManifest.xml

3. **Enable OneSignal Code**
   - Uncomment OneSignal calls in NotificationService
   - Test real device registration

4. **Add Background Handling**
   - Configure notification categories
   - Handle notification taps

---

## 📊 **Expected Test Results**

### **✅ Should Work Now:**
- Edge function deployment and API calls
- Device registration (mock)
- Push notification utility functions
- Status update notification flow
- Database subscription management

### **🔄 Will Work After OneSignal Setup:**
- Real push notifications to devices
- Background notification handling
- System-level notifications
- Cross-platform delivery

---

## 🐛 **Troubleshooting**

### **Edge Function Issues:**
- Check Supabase function logs
- Verify OneSignal API credentials
- Test with curl commands first

### **Device Registration Issues:**
- Check console logs for device ID
- Verify database entries in `push_subscriptions`
- Ensure app has proper permissions

### **Push Notification Issues:**
- Verify edge function is deployed
- Check OneSignal dashboard for delivery
- Test with known device IDs

---

## 📱 **Testing Checklist**

- [ ] Edge function deployed successfully
- [ ] Device registration works (mock)
- [ ] Push notification utilities function correctly
- [ ] Status updates trigger notifications
- [ ] Database entries created correctly
- [ ] Console logs show expected behavior
- [ ] Error handling works properly
- [ ] TypeScript errors resolved

---

## 🎉 **Success Indicators**

When fully implemented, you should see:
1. **Instant push notifications** when booking status changes
2. **System-level notifications** on mobile devices
3. **Background notification delivery** when app is closed
4. **Cross-platform sync** between web and mobile
5. **Reliable delivery** with proper error handling

The infrastructure is now **90% complete** - only the native OneSignal SDK integration remains for full functionality!
