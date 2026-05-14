// ─── OneSignal Utility ───────────────────────────────────────────────────────
// Uses OneSignal Web SDK (script-based, no npm package required)
// SDK script must be loaded in index.html before this runs

declare global {
  interface Window {
    OneSignal: {
      init(options: { appId: string; serviceWorkerParam?: { scope: string }; serviceWorkerPath?: string; notifyButton?: object; promptOptions?: object }): Promise<void>;
      login(externalId: string): Promise<void>;
      logout(): Promise<void>;
      Notifications: {
        requestPermission(): Promise<string>;
        permission: NotificationPermission;
      };
      User: {
        PushSubscription: {
          optedIn: boolean;
        };
      };
      addTag(key: string, value: string): Promise<void>;
      isPushNotificationsEnabled(): Promise<boolean>;
    };
  }
}

// ── CONFIG — replace with your real OneSignal App ID ─────────────────────────
export const ONESIGNAL_APP_ID = "01fda38a-4a53-4f72-9c10-2d4c9db304f0"; 
// ─────────────────────────────────────────────────────────────────────────────

let initialized = false;

/**
 * Initialize OneSignal once per page load.
 * Call this in your root component (e.g. App.tsx) inside a useEffect.
 */
export async function initOneSignal(): Promise<void> {
  if (initialized || typeof window === "undefined") return;
  
  // Skip on non-production domains during development
  if (!window.location.origin.includes("electroobuddy.com") && !window.location.origin.includes("localhost")) {
    console.log("[OneSignal] Skipping init on:", window.location.origin);
    return;
  }

  // Wait for OneSignal script to load
  if (!window.OneSignal) {
    console.warn("[OneSignal] SDK not loaded yet");
    return;
  }

  try {
    await window.OneSignal.init({
      appId: ONESIGNAL_APP_ID,
      serviceWorkerParam: { scope: "/onesignal/" },
      serviceWorkerPath: "onesignal/OneSignalSDKWorker.js",
      notifyButton: {
        enable: false,
      },
      promptOptions: {
        slidedown: {
          prompts: [],
        },
      },
    });

    initialized = true;
    console.log("[OneSignal] Initialized successfully");
  } catch (err) {
    console.warn("[OneSignal] Init failed (non-fatal):", err);
  }
}

/**
 * Link the OneSignal subscription to your app's user ID.
 * Call this after a user logs in (especially admin).
 *
 * @param userId - Your Supabase user.id (used as External ID)
 */
export async function identifyOneSignalUser(userId: string): Promise<void> {
  if (!initialized || !userId || !window.OneSignal) return;
  try {
    await window.OneSignal.login(userId);
    console.log("[OneSignal] User identified:", userId);
  } catch (err) {
    console.warn("[OneSignal] login() failed:", err);
  }
}

/**
 * Remove the External ID linkage on sign-out.
 */
export async function logoutOneSignalUser(): Promise<void> {
  if (!initialized || !window.OneSignal) return;
  try {
    await window.OneSignal.logout();
    console.log("[OneSignal] User logged out");
  } catch (err) {
    console.warn("[OneSignal] logout() failed:", err);
  }
}

/**
 * Request push notification permission from the browser.
 * Returns true if permission was granted.
 */
export async function requestOneSignalPermission(): Promise<boolean> {
  if (!initialized || !window.OneSignal) return false;
  try {
    await window.OneSignal.Notifications.requestPermission();
    const granted = window.OneSignal.Notifications.permission;
    console.log("[OneSignal] Permission granted:", granted);
    return granted === "granted";
  } catch (err) {
    console.warn("[OneSignal] requestPermission() failed:", err);
    return false;
  }
}

/**
 * Returns current push permission status.
 */
export function getOneSignalPermission(): NotificationPermission {
  if (typeof Notification === "undefined") return "default";
  return Notification.permission;
}

/**
 * Returns true if the user is currently opted-in to push.
 */
export async function isOneSignalSubscribed(): Promise<boolean> {
  if (!initialized || !window.OneSignal) return false;
  try {
    const enabled = await window.OneSignal.isPushNotificationsEnabled();
    return enabled && window.OneSignal.Notifications.permission === "granted";
  } catch {
    return false;
  }
}

/**
 * Add user data tags for segmentation (e.g. role, name).
 * Useful for sending targeted notifications to admins only.
 */
export async function setOneSignalTags(tags: Record<string, string>): Promise<void> {
  if (!initialized || !window.OneSignal) return;
  try {
    for (const [key, value] of Object.entries(tags)) {
      await window.OneSignal.addTag(key, value);
    }
  } catch (err) {
    console.warn("[OneSignal] addTags() failed:", err);
  }
}