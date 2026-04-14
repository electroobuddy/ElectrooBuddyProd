import { useState, useEffect } from "react";
import { Bell, Mail, Smartphone, Loader2, Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { isPushSupported, getNotificationPermission } from "@/utils/pushNotifications";

interface NotificationSettingsProps {
  userId: string | null;
}

interface NotificationPreferences {
  email_booking_created: boolean;
  email_booking_confirmed: boolean;
  email_booking_assigned: boolean;
  email_booking_completed: boolean;
  email_booking_cancelled: boolean;
  in_app_notifications: boolean;
  push_notifications: boolean;
  push_booking_created: boolean;
  push_booking_confirmed: boolean;
  push_booking_assigned: boolean;
  push_booking_completed: boolean;
  push_booking_cancelled: boolean;
}

const NotificationSettings = ({ userId }: NotificationSettingsProps) => {
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!userId) return;

    const fetchPreferences = async () => {
      try {
        const { data, error } = await supabase
          .from("notification_preferences")
          .select("*")
          .eq("user_id", userId)
          .single();

        if (error) throw error;

        // Cast to any to handle new push notification columns not in TypeScript types yet
        const prefs = data as any;
        
        setPreferences({
          email_booking_created: prefs?.email_booking_created ?? true,
          email_booking_confirmed: prefs?.email_booking_confirmed ?? true,
          email_booking_assigned: prefs?.email_booking_assigned ?? true,
          email_booking_completed: prefs?.email_booking_completed ?? true,
          email_booking_cancelled: prefs?.email_booking_cancelled ?? true,
          in_app_notifications: prefs?.in_app_notifications ?? true,
          push_notifications: prefs?.push_notifications ?? true,
          push_booking_created: prefs?.push_booking_created ?? true,
          push_booking_confirmed: prefs?.push_booking_confirmed ?? true,
          push_booking_assigned: prefs?.push_booking_assigned ?? true,
          push_booking_completed: prefs?.push_booking_completed ?? true,
          push_booking_cancelled: prefs?.push_booking_cancelled ?? true,
        });
      } catch (error: any) {
        console.error("Error fetching preferences:", error);
        // Set defaults if no preferences found
        setPreferences({
          email_booking_created: true,
          email_booking_confirmed: true,
          email_booking_assigned: true,
          email_booking_completed: true,
          email_booking_cancelled: true,
          in_app_notifications: true,
          push_notifications: true,
          push_booking_created: true,
          push_booking_confirmed: true,
          push_booking_assigned: true,
          push_booking_completed: true,
          push_booking_cancelled: true,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPreferences();
  }, [userId]);

  const handleSave = async () => {
    if (!userId || !preferences) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from("notification_preferences")
        .upsert({
          user_id: userId,
          ...preferences,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;

      toast.success("Notification preferences saved");
    } catch (error: any) {
      console.error("Error saving preferences:", error);
      toast.error("Failed to save preferences");
    } finally {
      setSaving(false);
    }
  };

  const updatePreference = (key: keyof NotificationPreferences, value: boolean) => {
    if (!preferences) return;
    setPreferences({ ...preferences, [key]: value });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!preferences) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Notification Preferences
          </h2>
          <p className="text-sm text-zinc-500 mt-1">
            Customize how you receive notifications
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Preferences"
          )}
        </button>
      </div>

      {/* In-App Notifications */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/30 flex items-center justify-center">
            <Smartphone className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="font-bold text-zinc-900 dark:text-white">In-App Notifications</h3>
            <p className="text-xs text-zinc-500">Notifications within the application</p>
          </div>
        </div>
        <div className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-800 rounded-xl">
          <div>
            <p className="font-semibold text-zinc-900 dark:text-white text-sm">Enable In-App Notifications</p>
            <p className="text-xs text-zinc-500 mt-0.5">Show notifications in the app</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={preferences.in_app_notifications}
              onChange={(e) => updatePreference("in_app_notifications", e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-zinc-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-zinc-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
          </label>
        </div>
      </div>

      {/* Email Notifications */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/30 flex items-center justify-center">
            <Mail className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <h3 className="font-bold text-zinc-900 dark:text-white">Email Notifications</h3>
            <p className="text-xs text-zinc-500">Receive notifications via email</p>
          </div>
        </div>
        <div className="space-y-3">
          {[
            { key: "email_booking_created", label: "Booking Created", desc: "When a new booking is created" },
            { key: "email_booking_confirmed", label: "Booking Confirmed", desc: "When your booking is confirmed" },
            { key: "email_booking_assigned", label: "Technician Assigned", desc: "When a technician is assigned" },
            { key: "email_booking_completed", label: "Booking Completed", desc: "When service is completed" },
            { key: "email_booking_cancelled", label: "Booking Cancelled", desc: "When booking is cancelled" },
          ].map(({ key, label, desc }) => (
            <div key={key} className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-800 rounded-xl">
              <div>
                <p className="font-semibold text-zinc-900 dark:text-white text-sm">{label}</p>
                <p className="text-xs text-zinc-500 mt-0.5">{desc}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences[key as keyof NotificationPreferences] as boolean}
                  onChange={(e) => updatePreference(key as keyof NotificationPreferences, e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-zinc-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 dark:peer-focus:ring-emerald-800 rounded-full peer dark:bg-zinc-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-emerald-600"></div>
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Push Notifications */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950/30 flex items-center justify-center">
            <Send className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-zinc-900 dark:text-white">Push Notifications</h3>
            <p className="text-xs text-zinc-500">Browser notifications (works when app is closed)</p>
            {!isPushSupported() && (
              <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">⚠️ Not supported in your browser</p>
            )}
          </div>
        </div>
        
        {/* Master toggle */}
        <div className="flex items-center justify-between p-4 bg-purple-50 dark:bg-purple-950/20 rounded-xl mb-3">
          <div>
            <p className="font-semibold text-zinc-900 dark:text-white text-sm">Enable Push Notifications</p>
            <p className="text-xs text-zinc-500 mt-0.5">Receive browser push notifications</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={preferences.push_notifications}
              onChange={(e) => updatePreference("push_notifications", e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-zinc-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer dark:bg-zinc-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600"></div>
          </label>
        </div>

        {/* Individual push toggles */}
        {preferences.push_notifications && (
          <div className="space-y-3">
            {[
              { key: "push_booking_created", label: "Booking Created", desc: "When a new booking is created" },
              { key: "push_booking_confirmed", label: "Booking Confirmed", desc: "When your booking is confirmed" },
              { key: "push_booking_assigned", label: "Technician Assigned", desc: "When a technician is assigned" },
              { key: "push_booking_completed", label: "Booking Completed", desc: "When service is completed" },
              { key: "push_booking_cancelled", label: "Booking Cancelled", desc: "When booking is cancelled" },
            ].map(({ key, label, desc }) => (
              <div key={key} className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-800 rounded-xl">
                <div>
                  <p className="font-semibold text-zinc-900 dark:text-white text-sm">{label}</p>
                  <p className="text-xs text-zinc-500 mt-0.5">{desc}</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences[key as keyof NotificationPreferences] as boolean}
                    onChange={(e) => updatePreference(key as keyof NotificationPreferences, e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-zinc-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer dark:bg-zinc-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600"></div>
                </label>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationSettings;
