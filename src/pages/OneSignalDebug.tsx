// @ts-nocheck
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Bell, CheckCircle, XCircle, AlertCircle, RefreshCw, Database } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const OneSignalDebug = () => {
  const { user } = useAuth();
  const [logs, setLogs] = useState<string[]>([]);
  const [sdkLoaded, setSdkLoaded] = useState(false);
  const [permission, setPermission] = useState<string>('default');
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [dbSubscription, setDbSubscription] = useState<any>(null);
  const [pushSubObject, setPushSubObject] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const log = (message: string) => {
    console.log(message);
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`]);
  };

  useEffect(() => {
    log('Starting OneSignal debug...');
    checkSDKStatus();
    checkPermission();
    
    // Delay subscription check to allow SDK to initialize
    const timer = setTimeout(() => {
      checkSubscriptionStatus();
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const checkSDKStatus = () => {
    log(`Window.OneSignal exists: ${!!window.OneSignal}`);
    log(`OneSignalDeferred exists: ${!!window.OneSignalDeferred}`);

    if (window.OneSignal) {
      setSdkLoaded(true);
      log('✅ OneSignal SDK loaded successfully');
      
      // Log SDK structure
      log(`OneSignal.User exists: ${!!window.OneSignal.User}`);
      log(`OneSignal.Notifications exists: ${!!window.OneSignal.Notifications}`);
      
      if (window.OneSignal.User) {
        log(`OneSignal.User.PushSubscription exists: ${!!window.OneSignal.User.PushSubscription}`);
      }
    } else {
      log('❌ OneSignal SDK not loaded - check index.html');
    }
  };

  const checkPermission = () => {
    if ('Notification' in window) {
      const perm = Notification.permission;
      setPermission(perm);
      log(`🔔 Current permission: ${perm}`);
    } else {
      log('❌ Notifications API not supported');
    }
  };

  const checkSubscriptionStatus = async () => {
    log('🔍 Checking subscription status...');
    
    if (!window.OneSignal) {
      log('❌ OneSignal SDK not available');
      return;
    }

    try {
      // Import the initialization function
      const { initializeOneSignal } = await import('@/utils/oneSignalNotifications');
      
      // Try using the proper initialization flow
      log('🔄 Running proper OneSignal initialization...');
      const subscriptionId = await initializeOneSignal();
      
      if (subscriptionId) {
        setPlayerId(subscriptionId);
        log(`✅ Subscription ID obtained: ${subscriptionId}`);
        await checkDatabaseStatus(subscriptionId);
      } else {
        log('⚠️ Failed to get subscription ID');
        
        // Log additional diagnostic info
        if (window.OneSignal.User) {
          log('OneSignal.User structure: ' + JSON.stringify(Object.keys(window.OneSignal.User)));
        }
        if (window.OneSignal.User?.PushSubscription) {
          const ps = window.OneSignal.User.PushSubscription;
          log('PushSubscription keys: ' + JSON.stringify(Object.keys(ps)));
          log('PushSubscription values: ' + JSON.stringify(ps, null, 2));
        }
      }
    } catch (error) {
      log(`❌ Error checking subscription: ${error.message}`);
    }
  };

  const checkDatabaseStatus = async (subscriptionId: string) => {
    if (!user) {
      log('⚠️ Not logged in - skipping database check');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('push_subscriptions')
        .select('*')
        .eq('endpoint', subscriptionId)
        .eq('subscription_type', 'onesignal')
        .limit(1)
        .maybeSingle();

      if (error) {
        log(`❌ Database error: ${error.message}`);
      } else if (data) {
        setDbSubscription(data);
        log(`✅ Database subscription found: ${data.is_active ? 'Active' : 'Inactive'}`);
      } else {
        log('⚠️ No database subscription found - need to save');
      }
    } catch (error) {
      log(`❌ Database check error: ${error.message}`);
    }
  };

  const requestPermission = async () => {
    if (!window.OneSignal) {
      toast.error("OneSignal SDK not loaded");
      return;
    }

    setLoading(true);
    try {
      // Check if already granted
      const perm = Notification.permission;
      if (perm === 'granted') {
        log('✅ Permission already granted');
        
        // Just call optIn if permission is already granted
        if (window.OneSignal.User?.PushSubscription?.optIn) {
          log('Calling optIn()...');
          await window.OneSignal.User.PushSubscription.optIn();
          log('✅ optIn() called successfully');
        }
        
        // Re-check subscription after permission
        setTimeout(() => checkSubscriptionStatus(), 2000);
        return;
      }
      
      log('Requesting notification permission...');
      
      if (window.OneSignal.Notifications?.requestPermission) {
        const result = await window.OneSignal.Notifications.requestPermission();
        setPermission(result);
        log(`Permission result: ${result}`);
        toast.success(`Permission: ${result}`);
        
        // Re-check subscription after permission
        setTimeout(() => checkSubscriptionStatus(), 2000);
      }
    } catch (error) {
      log(`❌ Permission request failed: ${error.message}`);
      toast.error(`Permission request failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const saveToDatabase = async () => {
    if (!user || !playerId) {
      toast.error("Need user and subscription ID");
      return;
    }

    setLoading(true);
    try {
      log('Saving subscription to database...');
      
      const ua = navigator.userAgent;
      const browser = /Chrome/.test(ua) ? 'Chrome' : /Firefox/.test(ua) ? 'Firefox' : /Safari/.test(ua) ? 'Safari' : 'Other';
      
      const { error } = await supabase
        .from('push_subscriptions')
        .upsert({
          user_id: user.id,
          endpoint: playerId,
          subscription_type: 'onesignal',
          subscription: { 
            onesignal: true, 
            subscription_id: playerId,
            app_id: "01fda38a-4a53-4f72-9c10-2d4c9db304f0"
          },
          user_agent: ua,
          browser,
          device_type: /Mobile/.test(ua) ? 'mobile' : /Tablet/.test(ua) ? 'tablet' : 'desktop',
          is_active: true,
          updated_at: new Date().toISOString()
        }, { 
          onConflict: 'endpoint' 
        });

      if (error) {
        log(`❌ Database save error: ${error.message}`);
        toast.error(`Save failed: ${error.message}`);
      } else {
        log('✅ Subscription saved to database');
        toast.success('Subscription saved!');
        await checkDatabaseStatus(playerId);
      }
    } catch (error) {
      log(`❌ Save error: ${error.message}`);
      toast.error(`Save failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const manualOptIn = async () => {
    if (!window.OneSignal) {
      toast.error("OneSignal SDK not loaded");
      return;
    }

    setLoading(true);
    try {
      log('🔄 Attempting manual optIn...');
      
      if (window.OneSignal.User?.PushSubscription?.optIn) {
        await window.OneSignal.User.PushSubscription.optIn();
        log('✅ optIn() called');
        
        // Wait and check
        await new Promise(resolve => setTimeout(resolve, 2000));
        setTimeout(() => checkSubscriptionStatus(), 2000);
      } else {
        log('❌ optIn not available');
      }
    } catch (error) {
      log(`❌ optIn failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const refreshAll = () => {
    setLogs([]);
    checkSDKStatus();
    checkPermission();
    checkSubscriptionStatus();
  };

  const clearLogs = () => {
    setLogs([]);
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-zinc-800 rounded-2xl shadow-xl p-6">
          <h1 className="text-2xl font-bold mb-6 text-zinc-900 dark:text-white">
            OneSignal Debug Console
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-zinc-50 dark:bg-zinc-700 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Bell className="w-5 h-5 text-blue-600" />
                <span className="font-medium text-zinc-900 dark:text-white">SDK Status</span>
              </div>
              <div className="flex items-center gap-2">
                {sdkLoaded ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-600" />
                )}
                <span className="text-sm text-zinc-600 dark:text-zinc-400">
                  {sdkLoaded ? 'Loaded' : 'Not Loaded'}
                </span>
              </div>
            </div>

            <div className="bg-zinc-50 dark:bg-zinc-700 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="w-5 h-5 text-yellow-600" />
                <span className="font-medium text-zinc-900 dark:text-white">Permission</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-zinc-600 dark:text-zinc-400 capitalize">
                  {permission}
                </span>
              </div>
            </div>

            <div className="bg-zinc-50 dark:bg-zinc-700 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-5 h-5 text-purple-600" />
                <span className="font-medium text-zinc-900 dark:text-white">Player ID</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-zinc-600 dark:text-zinc-400">
                  {playerId ? `${playerId.substring(0, 10)}...` : 'Not Set'}
                </span>
              </div>
            </div>
          </div>

          <div className="mb-4 flex flex-wrap gap-4">
            <button
              onClick={refreshAll}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-300 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              {loading ? 'Loading...' : 'Refresh All'}
            </button>
            <button
              onClick={requestPermission}
              disabled={!sdkLoaded || loading}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-zinc-300 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors flex items-center gap-2"
            >
              <Bell className="w-4 h-4" />
              Request Permission
            </button>
            <button
              onClick={manualOptIn}
              disabled={!sdkLoaded || loading}
              className="px-4 py-2 bg-orange-600 hover:bg-orange-700 disabled:bg-zinc-300 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors flex items-center gap-2"
            >
              <Bell className="w-4 h-4" />
              Manual optIn
            </button>
            <button
              onClick={saveToDatabase}
              disabled={!playerId || !user || loading}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-zinc-300 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors flex items-center gap-2"
            >
              <Database className="w-4 h-4" />
              Save to DB
            </button>
            <button
              onClick={clearLogs}
              className="px-4 py-2 bg-zinc-600 hover:bg-zinc-700 text-white font-medium rounded-lg transition-colors"
            >
              Clear Logs
            </button>
          </div>

          {/* Database Status */}
          {user && (
            <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
              <h3 className="font-medium text-blue-900 dark:text-blue-200 mb-2">Database Status</h3>
              <div className="text-sm text-blue-700 dark:text-blue-300">
                {dbSubscription ? (
                  <div>
                    <p>✅ Subscription saved in database</p>
                    <p>Status: {dbSubscription.is_active ? 'Active' : 'Inactive'}</p>
                    <p>Browser: {dbSubscription.browser}</p>
                    <p>Device: {dbSubscription.device_type}</p>
                  </div>
                ) : playerId ? (
                  <p>⚠️ Subscription ID obtained but not saved to database. Click "Save to DB" button.</p>
                ) : (
                  <p>ℹ️ No subscription ID yet. Request permission first.</p>
                )}
              </div>
            </div>
          )}

          {/* PushSubscription Object */}
          {pushSubObject && (
            <div className="mb-4 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
              <h3 className="font-medium text-purple-900 dark:text-purple-200 mb-2">PushSubscription Object</h3>
              <pre className="text-xs text-purple-700 dark:text-purple-300 overflow-x-auto">
                {JSON.stringify(pushSubObject, null, 2)}
              </pre>
            </div>
          )}

          <div className="bg-zinc-900 rounded-xl p-4 max-h-96 overflow-y-auto">
            <h3 className="text-white font-medium mb-3">Console Logs</h3>
            <div className="space-y-2">
              {logs.map((log, index) => (
                <div key={index} className="text-green-400 font-mono text-sm">
                  {log}
                </div>
              ))}
              {logs.length === 0 && (
                <div className="text-zinc-500 text-sm">No logs yet...</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OneSignalDebug;
