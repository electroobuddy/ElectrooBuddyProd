import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Bell, BellOff, Send, Check, X } from "lucide-react";
import { subscribeToOneSignal, unsubscribeFromOneSignal, isOneSignalSupported } from "@/utils/oneSignalNotifications";

const TestOneSignalNotifications = () => {
  const { user } = useAuth();
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<'default' | 'granted' | 'denied'>('default');

  useEffect(() => {
    // Check if OneSignal is supported
    setIsSupported(isOneSignalSupported());
    
    // Check current permission
    if ('Notification' in window) {
      setPermission(Notification.permission);
      
      // Listen for permission changes
      const checkPermission = () => {
        setPermission(Notification.permission);
      };
      
      Notification.requestPermission().then(checkPermission);
    }
  }, []);

  useEffect(() => {
    if (!user) return;
    
    // Check if user is already subscribed
    checkSubscription();
  }, [user]);

  const checkSubscription = async () => {
    if (!user) return;
    
    try {
      const { data } = await supabase
        .from("push_subscriptions")
        .select("is_active")
        .eq("user_id", user.id)
        .eq("subscription_type", "onesignal")
        .limit(1)
        .maybeSingle();
      
      setIsSubscribed(data?.is_active || false);
    } catch (error) {
      console.error("Error checking subscription:", error);
    }
  };

  const handleSubscribe = async () => {
    if (!user) {
      toast.error("Please log in first");
      return;
    }

    if (!isSupported) {
      toast.error("Push notifications are not supported in this browser");
      return;
    }

    setIsLoading(true);
    
    try {
      const success = await subscribeToOneSignal(user.id);
      
      if (success) {
        setIsSubscribed(true);
        toast.success("Successfully subscribed to push notifications!");
      } else {
        toast.error("Failed to subscribe to push notifications");
      }
    } catch (error) {
      console.error("Subscription error:", error);
      toast.error("Failed to subscribe to push notifications");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnsubscribe = async () => {
    if (!user) return;

    setIsLoading(true);
    
    try {
      const success = await unsubscribeFromOneSignal(user.id);
      
      if (success) {
        setIsSubscribed(false);
        toast.success("Successfully unsubscribed from push notifications");
      } else {
        toast.error("Failed to unsubscribe");
      }
    } catch (error) {
      console.error("Unsubscribe error:", error);
      toast.error("Failed to unsubscribe");
    } finally {
      setIsLoading(false);
    }
  };

  const sendTestNotification = async () => {
    if (!user) return;

    setIsLoading(true);
    
    try {
      const { error } = await supabase.functions.invoke("send-onesignal-notification", {
        body: {
          playerIds: [], // Will be filled by edge function
          title: "🧪 Test Notification",
          message: "This is a test from ElectroBuddy OneSignal!",
          url: window.location.href,
          data: {
            type: "test",
            userId: user.id
          }
        }
      });

      if (error) {
        toast.error("Failed to send test notification");
      } else {
        toast.success("Test notification sent!");
      }
    } catch (error) {
      console.error("Test notification error:", error);
      toast.error("Failed to send test notification");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white dark:bg-zinc-800 rounded-2xl shadow-xl p-8">
          <h1 className="text-3xl font-bold mb-2 text-zinc-900 dark:text-white">
            OneSignal Notifications Test
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400 mb-8">
            Test push notifications using OneSignal
          </p>

          {/* Status Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-zinc-50 dark:bg-zinc-700 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Bell className="w-5 h-5 text-blue-600" />
                <span className="font-medium text-zinc-900 dark:text-white">Support</span>
              </div>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                {isSupported ? "Supported" : "Not Supported"}
              </p>
            </div>

            <div className="bg-zinc-50 dark:bg-zinc-700 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                {permission === 'granted' ? (
                  <Check className="w-5 h-5 text-green-600" />
                ) : permission === 'denied' ? (
                  <X className="w-5 h-5 text-red-600" />
                ) : (
                  <Bell className="w-5 h-5 text-yellow-600" />
                )}
                <span className="font-medium text-zinc-900 dark:text-white">Permission</span>
              </div>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 capitalize">
                {permission}
              </p>
            </div>

            <div className="bg-zinc-50 dark:bg-zinc-700 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                {isSubscribed ? (
                  <Check className="w-5 h-5 text-green-600" />
                ) : (
                  <BellOff className="w-5 h-5 text-zinc-400" />
                )}
                <span className="font-medium text-zinc-900 dark:text-white">Status</span>
              </div>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                {isSubscribed ? "Subscribed" : "Not Subscribed"}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-4">
            {!isSubscribed ? (
              <button
                onClick={handleSubscribe}
                disabled={isLoading || !isSupported || permission === 'denied'}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-300 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-colors"
              >
                <Bell className="w-5 h-5" />
                {isLoading ? "Subscribing..." : "Subscribe to Push Notifications"}
              </button>
            ) : (
              <div className="space-y-4">
                <button
                  onClick={handleUnsubscribe}
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 disabled:bg-zinc-300 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-colors"
                >
                  <BellOff className="w-5 h-5" />
                  {isLoading ? "Unsubscribing..." : "Unsubscribe"}
                </button>

                <button
                  onClick={sendTestNotification}
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-zinc-300 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-colors"
                >
                  <Send className="w-5 h-5" />
                  {isLoading ? "Sending..." : "Send Test Notification"}
                </button>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-xl">
            <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
              OneSignal Setup
            </h3>
            <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
              <li>• App ID: 01fda38a-4a53-4f72-9c10-2d4c9db304f0</li>
              <li>• Safari Web ID: web.onesignal.auto.1b5ff574-1f63-4acf-ab26-dadb313db610</li>
              <li>• Works with Chrome, Firefox, Safari</li>
              <li>• Requires HTTPS for production</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestOneSignalNotifications;
