# Push Notification Subscription Fix

## Problem
You're getting the error:
```
❌ Failed to subscribe: Registration failed - A subscription with a different applicationServerKey (or gcm_sender_id) already exists
```

## Cause
This happens when:
1. You already have a push subscription registered with a different key
2. The browser tries to register the same endpoint with a new key
3. The service rejects the duplicate subscription

## Solutions

### Option 1: Clear Existing Subscription (Recommended)
1. **Open Browser DevTools** (F12)
2. **Go to Application Tab**
3. **Clear Storage** → Clear site data
4. **Refresh Page** → Try subscribing again

### Option 2: Use Different Browser
1. Try in **Incognito/Private Mode**
2. Try a **different browser** (Chrome/Firefox/Safari)

### Option 3: Check Service Worker
1. **Unregister** existing subscription manually:
   ```javascript
   navigator.serviceWorker.ready.then(registration => {
     registration.unregister().then(() => {
       console.log('Unregistered old subscription');
       // Try subscribing again
     });
   });
   ```

### Option 4: Reset Notification Permissions
1. **Clear Browser Notifications** in browser settings
2. **Re-grant permission** when prompted
3. **Retry subscription**

## Testing Steps
1. Open `test-notifications.html`
2. Click "Request Permission"
3. Click "Subscribe to Push Notifications"
4. If error occurs, clear storage and retry

## Debug Info
The subscription error suggests the service worker is working correctly, but there's a key mismatch. This is usually resolved by clearing existing browser data.

## Next Steps
1. Try Option 1 (Clear Storage) first
2. If still failing, test in a different browser
3. Check if you have multiple extensions interfering

Let me know which solution works for you!
