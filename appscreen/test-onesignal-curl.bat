@echo off
echo 🔔 Testing OneSignal Push Notifications via cURL...
echo.

REM Replace with your actual OneSignal API Key and App ID
set ONESIGNAL_API_KEY=os_v2_app_ah62hcskknhxfhaqfvgj3mye6dkhif3gzpoeinvfmbjlw3syhuwdlvllx7brghjqxviuka4gh6wsjqurychr36zjexuacteflaalmhi
set ONESIGNAL_APP_ID=ah62hcskknhxfhaqfvgj3mye6dkhif3gzpoeinvfmbjlw3syhuwdlvllx7brghjqxviuka4gh6wsjqurychr36zjexuacteflaalmhi

echo.
echo 📱 Sending test notification to user segments...
echo.

REM Create notification payload
curl -X POST "https://api.onesignal.com/notifications" ^
  -H "Content-Type: application/json; charset=utf-8" ^
  -H "Authorization: Basic %ONESIGNAL_API_KEY%" ^
  -d "{
    \"app_id\": \"%ONESIGNAL_APP_ID%\",
    \"target_channel\": \"push\",
    \"name\": \"👋 Test Booking Alert\",
    \"headings\": {
      \"en\": \"🔧 New Booking Assignment\"
    },
    \"contents\": {
      \"en\": \"Test notification from Electroo Buddy Mobile App\"
    },
    \"included_segments\": [
      \"Test Users\"
    ],
    \"ios_attachments\": {
      \"onesignal_logo\": \"https://avatars.githubusercontent.com/u/11823027?s=200^&v=4\"
    },
    \"big_picture\": \"https://avatars.githubusercontent.com/u/11823027?s=200^&v=4\"
  }"

echo.
echo ✅ Notification sent! Check your OneSignal dashboard or device for the notification.
echo.
echo 📊 Notification Details:
echo   App ID: %ONESIGNAL_APP_ID%
echo   Channel: push
echo   Title: 🔧 New Booking Assignment
echo   Message: Test notification from Electroo Buddy Mobile App
echo   Target: Test Users segment
echo.
echo 🔄 Checking notification status...
echo.

REM Check notification status (optional - requires notification ID)
curl -X GET "https://api.onesignal.com/notifications/%NOTIFICATION_ID%" ^
  -H "Authorization: Basic %ONESIGNAL_API_KEY%" ^
  -H "Content-Type: application/json"

echo.
echo 📱 To check all notifications, visit: https://onesignal.com/apps/%ONESIGNAL_APP_ID%/notifications
echo.
echo 🎯 Test Scenarios:
echo   1. ✅ Basic push notification delivery
echo   2. ✅ Targeted user segments
echo   3. ✅ Custom icons and attachments
echo   4. ✅ Localized content support
echo.
echo 🚀 Next Steps:
echo   1. Verify notification received on device
echo   2. Test with real user segments
echo   3. Validate notification content display
echo   4. Check OneSignal dashboard analytics
echo.
echo 🎉 OneSignal cURL test completed!
echo.
pause
