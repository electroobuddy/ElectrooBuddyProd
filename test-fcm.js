// Simple test to verify FCM server key and token
// Run with: node test-fcm.js

const YOUR_SERVER_KEY = "AIzaSyDezipM-tF261v-HZPnixTvvAzKm0jyV34"; // Replace with actual server key
const FCM_TOKEN = "f19Kv-gxhwNwYxmq5dBsTJ:APA91bFLwXD3mkdSRzvsus6_SLH6cjrK68oUPQbUQGD5mzEdFqw480agA2_9nCBDkSw0BuU-qHAtwSOGyxdB4PK1TaetSuzSe160OOUPbcLhJ4e-NhSNTO4"; // Replace with actual token from console

async function testFCM() {
  try {
    const response = await fetch("https://fcm.googleapis.com/fcm/send", {
      method: "POST",
      headers: {
        "Authorization": `key=${YOUR_SERVER_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        to: FCM_TOKEN,
        notification: {
          title: "🔔 Test Notification",
          body: "This is a test from ElectroBuddy!",
        },
        data: {
          url: "/dashboard/bookings",
          type: "test",
          click_action: "/dashboard/bookings",
        },
        webpush: {
          headers: {
            "Urgency": "high",
          },
        },
      }),
    });

    console.log("Status:", response.status);
    console.log("Headers:", Object.fromEntries(response.headers.entries()));
    
    const text = await response.text();
    console.log("Response:", text);
    
  } catch (error) {
    console.error("Error:", error);
  }
}

testFCM();
