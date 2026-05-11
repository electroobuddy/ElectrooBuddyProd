// Supabase client for React Native

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://izgwlqxmafdxwewmasak.supabase.co';
const SUPABASE_ANON_KEY = 'your-supabase-anon-key'; // Replace with your anon key

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: {
      getItem: (key: string) => {
        // AsyncStorage would be used here
        return Promise.resolve(null);
      },
      setItem: (key: string, value: string) => {
        // AsyncStorage would be used here
        return Promise.resolve();
      },
      removeItem: (key: string) => {
        // AsyncStorage would be used here
        return Promise.resolve();
      },
    },
    persistSession: true,
    autoRefreshToken: true,
  },
});

// Types for your database
export interface Booking {
  id: string;
  name: string;
  phone: string;
  email: string;
  service_type: string;
  address: string;
  preferred_date: string;
  preferred_time: string;
  status: string;
  created_at: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  booking_id: string | null;
  is_read: boolean;
  created_at: string;
}

// API functions
export const bookingsApi = {
  getAll: async (): Promise<Booking[]> => {
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) throw error;
    return data || [];
  },

  getById: async (id: string): Promise<Booking | null> => {
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', id)
      .single();

    if (error) return null;
    return data;
  },

  updateStatus: async (id: string, status: string): Promise<void> => {
    const { error } = await supabase
      .from('bookings')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) throw error;
  },

  subscribeToNew: (callback: (booking: Booking) => void) => {
    return supabase
      .channel('bookings')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'bookings',
        },
        (payload) => callback(payload.new as Booking)
      )
      .subscribe();
  },
};

export const notificationsApi = {
  getAll: async (): Promise<Notification[]> => {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) throw error;
    return data || [];
  },

  markAsRead: async (id: string): Promise<void> => {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq('id', id);

    if (error) throw error;
  },

  subscribe: (callback: (notification: Notification) => void) => {
    return supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
        },
        (payload) => callback(payload.new as Notification)
      )
      .subscribe();
  },
};

export const pushApi = {
  saveSubscription: async (
    userId: string,
    playerId: string,
    appId: string
  ): Promise<void> => {
    const { error } = await supabase
      .from('push_subscriptions')
      .upsert(
        {
          user_id: userId,
          endpoint: playerId,
          subscription_type: 'onesignal',
          subscription: {
            onesignal: true,
            subscription_id: playerId,
            app_id: appId,
          },
          is_active: true,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'endpoint' }
      );

    if (error) throw error;
  },

  getActiveSubscription: async (
    userId: string
  ): Promise<{ endpoint: string } | null> => {
    const { data, error } = await supabase
      .from('push_subscriptions')
      .select('endpoint')
      .eq('user_id', userId)
      .eq('is_active', true)
      .limit(1)
      .maybeSingle();

    if (error) return null;
    return data;
  },
};
