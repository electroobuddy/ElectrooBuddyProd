// ─── OneSignal Utility ───────────────────────────────────────────────────────
// Wraps react-onesignal for safe initialization, user identification, and
// permission management across your app.
//
// Install first:
//   npm install react-onesignal
//   # or
//   yarn add react-onesignal
//
// Then drop the OneSignalSDKWorker.js into your /public folder:
//   Download from: https://github.com/OneSignal/OneSignal-Website-SDK/files/11480764/OneSignalSDK-v16-ServiceWorker.zip

import OneSignal from "react-onesignal";

// ── CONFIG — replace with your real OneSignal App ID ─────────────────────────
export const ONESIGNAL_APP_ID = "YOUR_ONESIGNAL_APP_ID"; // 🔴 Replace this
// ─────────────────────────────────────────────────────────────────────────────

let initialized = false;

/**
 * Initialize OneSignal once per page load.
 * Call this in your root component (e.g. App.tsx) inside a useEffect.
 */
export async function initOneSignal(): Promise<void> {
  if (initialized || typeof window === "undefined") return;

  try {
    await OneSignal.init({
      appId: ONESIGNAL_APP_ID,
      // Put OneSignalSDKWorker.js in /public/onesignal/ and set these:
      serviceWorkerParam: { scope: "/onesignal/" },
      serviceWorkerPath: "onesignal/OneSignalSDKWorker.js",
      notifyButton: {
        enable: false, // we handle our own prompt UI
      },
      // Don't auto-prompt — we prompt at the right moment (admin login)
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
  if (!initialized || !userId) return;
  try {
    await OneSignal.login(userId);
    console.log("[OneSignal] User identified:", userId);
  } catch (err) {
    console.warn("[OneSignal] login() failed:", err);
  }
}

/**
 * Remove the External ID linkage on sign-out.
 */
export async function logoutOneSignalUser(): Promise<void> {
  if (!initialized) return;
  try {
    await OneSignal.logout();
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
  if (!initialized) return false;
  try {
    // requestPermission() shows the browser native prompt
    await OneSignal.Notifications.requestPermission();
    const granted = OneSignal.Notifications.permission;
    console.log("[OneSignal] Permission granted:", granted);
    return granted;
  } catch (err) {
    console.warn("[OneSignal] requestPermission() failed:", err);
    return false;
  }
}

/**
 * Returns current push permission status.
 */
export function getOneSignalPermission(): NotificationPermission {
  if (!initialized || typeof Notification === "undefined") return "default";
  return Notification.permission;
}

/**
 * Returns true if the user is currently opted-in to push.
 */
export async function isOneSignalSubscribed(): Promise<boolean> {
  if (!initialized) return false;
  try {
    return OneSignal.Notifications.permission && OneSignal.User.PushSubscription.optedIn === true;
  } catch {
    return false;
  }
}

/**
 * Add user data tags for segmentation (e.g. role, name).
 * Useful for sending targeted notifications to admins only.
 */
export async function setOneSignalTags(tags: Record<string, string>): Promise<void> {
  if (!initialized) return;
  try {
    await OneSignal.User.addTags(tags);
  } catch (err) {
    console.warn("[OneSignal] addTags() failed:", err);
  }
}