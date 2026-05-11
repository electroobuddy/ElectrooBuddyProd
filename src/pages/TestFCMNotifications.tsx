import { useState, useEffect } from "react";
import { Bell, CheckCircle, XCircle, Loader2, Send, Copy, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { initFirebase, getFirebaseMessaging } from "@/integrations/firebase/config";
import { toast } from "sonner";
import { getToken } from 'firebase/messaging';

export default function TestFCMNotifications() {
  const [status, setStatus] = useState<{
    firebaseInit: boolean;
    permission: NotificationPermission | null;
    token: string | null;
    subscribed: boolean;
  }>({
    firebaseInit: false,
    permission: null,
    token: null,
    subscribed: false,
  });
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = async () => {
    // Check Firebase initialization
    const firebaseInit = initFirebase();
    setStatus(s => ({ ...s, firebaseInit }));

    // Check permission
    if ("Notification" in window) {
      setStatus(s => ({ ...s, permission: Notification.permission }));
    }

    // Check if token exists in database
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: sub } = await supabase
        .from("push_subscriptions")
        .select("endpoint, fcm_token, is_active")
        .eq("user_id", user.id)
        .eq("is_active", true)
        .maybeSingle();

      if (sub) {
        setStatus(s => ({ 
          ...s, 
          token: sub.fcm_token || sub.endpoint,
          subscribed: true 
        }));
      }
    }
  };

  const handleSubscribe = async () => {
    setLoading(true);
    console.log("Starting subscription...");
    
    try {
      // First check Firebase config
      const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;
      const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;
      const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;
      
      console.log("Firebase config:", { apiKey: apiKey?.substring(0, 10), projectId, vapidKey: vapidKey?.substring(0, 10) });
      
      if (!apiKey || !projectId) {
        toast.error("Firebase config missing. Check .env file");
        setLoading(false);
        return;
      }
      
      if (!vapidKey) {
        toast.error("VITE_FIREBASE_VAPID_KEY not set in .env");
        setLoading(false);
        return;
      }

      // Check browser support
      if (!('serviceWorker' in navigator)) {
        toast.error("Service workers not supported in this browser");
        setLoading(false);
        return;
      }
      
      if (!('PushManager' in window)) {
        toast.error("Push API not supported in this browser");
        setLoading(false);
        return;
      }

      // Request permission
      console.log("Requesting notification permission...");
      const perm = await Notification.requestPermission();
      console.log("Permission result:", perm);
      
      if (perm !== "granted") {
        toast.error("Notification permission denied: " + perm);
        setLoading(false);
        return;
      }
      setStatus(s => ({ ...s, permission: perm }));

      // Initialize Firebase
      console.log("Initializing Firebase...");
      const firebaseInit = initFirebase();
      console.log("Firebase init result:", firebaseInit);
      
      if (!firebaseInit) {
        toast.error("Firebase initialization failed. Check console for details.");
        setLoading(false);
        return;
      }

      const messaging = getFirebaseMessaging();
      console.log("Messaging object:", messaging);
      
      if (!messaging) {
        toast.error("Failed to get messaging instance");
        setLoading(false);
        return;
      }

      // Get token using Firebase v11+ API
      console.log("Getting FCM token with vapidKey:", vapidKey.substring(0, 15) + "...");
      
      try {
        const token = await getToken(messaging, { vapidKey });
        console.log("FCM Token received:", token.substring(0, 20) + "...");
        
        if (!token) {
          toast.error("Got empty FCM token");
          setLoading(false);
          return;
        }

        setStatus(s => ({ ...s, token, subscribed: true }));

        // Save to database
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const ua = navigator.userAgent;
          const browser = /Chrome/.test(ua) ? 'chrome' : 
                          /Firefox/.test(ua) ? 'firefox' :
                          /Safari/.test(ua) ? 'safari' :
                          /Edge/.test(ua) ? 'edge' : 'other';

          await supabase.from("push_subscriptions").upsert({
            user_id: user.id,
            endpoint: token,
            fcm_token: token,
            p256dh: null,
            auth: null,
            user_agent: ua,
            browser,
            device_type: /Mobile/.test(ua) ? 'mobile' : /Tablet/.test(ua) ? 'tablet' : 'desktop',
            is_active: true,
            subscription_type: 'fcm',
            subscription: { fcm: true, token: token.substring(0, 10) + '...' }
          }, { onConflict: 'endpoint' });

          toast.success("Subscribed to push notifications!");
        }
      } catch (tokenErr: any) {
        console.error("getToken error:", tokenErr);
        toast.error("Failed to get token: " + tokenErr.message);
        setLoading(false);
        return;
      }
    } catch (err: any) {
      console.error("Subscribe error:", err);
      toast.error("Failed to subscribe: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleTestNotification = async () => {
    setTesting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Please login first");
        setTesting(false);
        return;
      }

      // Call the edge function
      const { data, error } = await supabase.functions.invoke("send-fcm-notification", {
        body: {
          userId: user.id,
          title: "🔔 Test Notification",
          body: "This is a test notification from ElectroBuddy!",
          url: "/dashboard",
          type: "test",
        },
      });

      if (error) {
        console.error("FCM error:", error);
        toast.error("Failed to send: " + error.message);
      } else {
        console.log("FCM response:", data);
        toast.success(`Notification sent! (${data?.sent || 0}/${data?.total || 0} delivered)`);
      }
    } catch (err: any) {
      console.error("Test error:", err);
      toast.error("Error: " + err.message);
    } finally {
      setTesting(false);
    }
  };

  const copyToken = () => {
    if (status.token) {
      navigator.clipboard.writeText(status.token);
      toast.success("Token copied to clipboard!");
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 flex items-center gap-3">
          <Bell className="w-8 h-8 text-blue-500" />
          FCM Push Notification Test
        </h1>

        {/* Status Cards */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <StatusCard
            label="Firebase Initialized"
            value={status.firebaseInit}
          />
          <StatusCard
            label="Notification Permission"
            value={status.permission === "granted"}
            valueText={status.permission || "unknown"}
          />
          <StatusCard
            label="FCM Token"
            value={!!status.token}
            valueText={status.token ? `${status.token.substring(0, 20)}...` : "Not set"}
          />
          <StatusCard
            label="Subscribed to DB"
            value={status.subscribed}
          />
        </div>

        {/* Actions */}
        <div className="bg-gray-800 rounded-xl p-6 space-y-4">
          {!status.subscribed ? (
            <button
              onClick={handleSubscribe}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg font-semibold transition"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Bell className="w-5 h-5" />
              )}
              {loading ? "Subscribing..." : "Subscribe to Push Notifications"}
            </button>
          ) : (
            <>
              <button
                onClick={handleTestNotification}
                disabled={testing}
                className="w-full flex items-center justify-center gap-2 py-3 bg-green-600 hover:bg-green-700 disabled:opacity-50 rounded-lg font-semibold transition"
              >
                {testing ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
                {testing ? "Sending..." : "Send Test Notification"}
              </button>

              <button
                onClick={checkStatus}
                className="w-full flex items-center justify-center gap-2 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg font-semibold transition"
              >
                <RefreshCw className="w-5 h-5" />
                Refresh Status
              </button>
            </>
          )}

          {status.token && (
            <div className="mt-4 p-4 bg-gray-700 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-gray-300">FCM Token:</span>
                <button
                  onClick={copyToken}
                  className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300"
                >
                  <Copy className="w-3 h-3" /> Copy
                </button>
              </div>
              <p className="text-xs text-gray-400 break-all font-mono">
                {status.token}
              </p>
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-gray-800 rounded-xl p-6">
          <h2 className="text-xl font-bold mb-4">Setup Instructions</h2>
          <ol className="list-decimal list-inside space-y-2 text-gray-300 text-sm">
            <li>Make sure you're logged in</li>
            <li>Click "Subscribe to Push Notifications"</li>
            <li>Allow notification permission when prompted</li>
            <li>Wait for "Subscribed" status to show green</li>
            <li>Click "Send Test Notification" to test</li>
            <li>Check if you receive the notification (even with browser closed!)</li>
          </ol>

          <div className="mt-4 p-4 bg-amber-900/20 border border-amber-700 rounded-lg">
            <h3 className="font-semibold text-amber-400 mb-2">Troubleshooting</h3>
            <ul className="list-disc list-inside text-sm text-gray-300 space-y-1">
              <li>Make sure Supabase project is not paused</li>
              <li>Deploy edge function: <code className="text-gray-400">supabase functions deploy send-fcm-notification</code></li>
              <li>Add FIREBASE_SERVER_KEY to Supabase secrets</li>
              <li>Check Edge Function logs for errors</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusCard({ label, value, valueText }: { label: string; value: boolean; valueText?: string }) {
  return (
    <div className={`p-4 rounded-xl border ${value ? "bg-green-900/20 border-green-700" : "bg-red-900/20 border-red-700"}`}>
      <div className="flex items-center gap-2 mb-1">
        {value ? (
          <CheckCircle className="w-5 h-5 text-green-500" />
        ) : (
          <XCircle className="w-5 h-5 text-red-500" />
        )}
        <span className="text-sm font-semibold text-gray-300">{label}</span>
      </div>
      <div className="text-lg font-bold">
        {value ? (
          <span className="text-green-400">Yes</span>
        ) : (
          <span className="text-red-400">No</span>
        )}
        {valueText && value && <span className="text-gray-500 text-sm ml-2">({valueText})</span>}
      </div>
    </div>
  );
}