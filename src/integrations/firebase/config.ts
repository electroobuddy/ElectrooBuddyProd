import { initializeApp, FirebaseApp } from 'firebase/app';
import { getMessaging, getToken, onMessage, Messaging } from 'firebase/messaging';
import { supabase } from '@/integrations/supabase/client';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
};

let messaging: Messaging | null = null;
let app: FirebaseApp | null = null;

export function initFirebase(): boolean {
  if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
    console.warn('[Firebase] Configuration missing - check .env file');
    console.warn('[Firebase] VITE_FIREBASE_API_KEY:', firebaseConfig.apiKey ? 'set' : 'MISSING');
    console.warn('[Firebase] VITE_FIREBASE_PROJECT_ID:', firebaseConfig.projectId ? 'set' : 'MISSING');
    return false;
  }

  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.warn('[Firebase] Push notifications not supported in this browser');
    return false;
  }

  if (!('Notification' in window)) {
    console.warn('[Firebase] Notifications API not available');
    return false;
  }

  try {
    if (!app) {
      app = initializeApp(firebaseConfig);
      console.log('[Firebase] App initialized');
    }
    if (!messaging) {
      messaging = getMessaging(app);
      console.log('[Firebase] Messaging initialized');

      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/firebase-messaging-sw.js').then((registration) => {
          console.log('[Firebase] Service worker registered:', registration.scope);
        }).catch((err) => {
          console.warn('[Firebase] Service worker registration failed:', err);
        });
      }
    }
    console.log('[Firebase] Fully initialized');
    return true;
  } catch (error) {
    console.error('[Firebase] Initialization failed:', error);
    return false;
  }
}

export function getFirebaseMessaging(): Messaging | null {
  if (!messaging) {
    initFirebase();
  }
  return messaging;
}

export async function requestFirebasePermission(userId: string): Promise<string | null> {
  try {
    const messaging = getFirebaseMessaging();
    if (!messaging) {
      console.error('[Firebase] Messaging not initialized');
      return null;
    }

    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.warn('[Firebase] Permission denied:', permission);
      return null;
    }

    const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;
    if (!vapidKey) {
      console.error('[Firebase] VAPID key not configured');
      return null;
    }

    const token = await getToken(messaging, { vapidKey }).catch(async (err) => {
      console.error('[Firebase] getToken failed:', err);
      if (String(err).includes('INVALID_ARGUMENT') || String(err).includes('not a valid FCM registration token')) {
        const { error } = await supabase
          .from('push_subscriptions')
          .update({ is_active: false })
          .eq('user_id', userId)
          .eq('subscription_type', 'fcm');
        console.log('[Firebase] Marked invalid tokens inactive');
      }
      return null;
    });
    console.log('[Firebase] FCM Token obtained');
    return token;
  } catch (error) {
    console.error('[Firebase] Failed to get token:', error);
    return null;
  }
}

export function onFirebaseMessage(callback: (payload: any) => void): () => void {
  const messaging = getFirebaseMessaging();
  if (!messaging) {
    console.warn('[Firebase] Cannot listen - messaging not initialized');
    return () => {};
  }

  return onMessage(messaging, (payload) => {
    console.log('[Firebase] Foreground message received:', payload);
    callback(payload);
  });
}

export { messaging };