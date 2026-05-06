import { create } from 'zustand';
import { supabase } from '@/integrations/supabase/client';
import { services as defaultServices } from '@/data/services';

export interface Service {
  id: string;
  title: string;
  description: string;
  icon_name?: string;
  image_url?: string;
  service_charge?: string;
  show_visit_charge?: boolean;
  visit_charge_label?: string;
  whatsapp_enabled?: boolean;
  call_enabled?: boolean;
  book_now_enabled?: boolean;
  sort_order?: number;
  created_at?: string;
  updated_at?: string;
}

// Simplified service data for booking forms (only charge-related fields)
export interface BookingService {
  title: string;
  service_charge?: string;
  show_visit_charge?: boolean;
  visit_charge_label?: string;
}

export interface ServicesState {
  // Data
  services: Service[];
  bookingServices: BookingService[]; // Simplified services for booking forms (with charge info)

  // Loading states
  loading: boolean;
  bookingServicesLoading: boolean;

  // Error states
  error: Error | null;
  bookingServicesError: Error | null;

  // Actions
  fetchServices: () => Promise<void>;
  fetchBookingServices: () => Promise<void>;
  refreshServices: () => Promise<void>;
  getServiceByTitle: (title: string) => Service | undefined;
  getServiceCharge: (title: string) => { amount: string; label: string; show: boolean } | null;
}

// Helper to get icon name based on service title
const getIconNameForService = (title: string): string => {
  const iconMap: Record<string, string> = {
    'DTH': 'SatelliteDish',
    'TV': 'Tv',
    'Short Circuit': 'Zap',
    'Fan': 'Fan',
    'AC': 'Snowflake',
    'Appliance': 'Wrench',
    'Wiring': 'Cable',
    'Switch': 'ToggleLeft',
    'Light': 'Lightbulb',
    'Motor': 'Cog',
    'Panel': 'LayoutGrid'
  };
  for (const [key, iconName] of Object.entries(iconMap)) {
    if (title.includes(key)) return iconName;
  }
  return 'Zap';
};

// Transform static services to Service interface
const transformStaticServices = (): Service[] => {
  return defaultServices.map(s => ({
    id: s.title.toLowerCase().replace(/\s+/g, '-'),
    icon_name: getIconNameForService(s.title),
    title: s.title,
    description: s.description,
    whatsapp_enabled: true,
    call_enabled: true,
    book_now_enabled: true
  }));
};

export const useServicesStore = create<ServicesState>((set, get) => ({
  // Initial state
  services: [],
  bookingServices: [],
  loading: false,
  bookingServicesLoading: false,
  error: null,
  bookingServicesError: null,

  // Fetch full services for display
  fetchServices: async () => {
    // Prevent multiple simultaneous fetches
    if (get().loading) return;

    set({ loading: true, error: null });

    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .order('sort_order');

      if (error) throw error;

      const services = data && data.length > 0 ? data : transformStaticServices();
      set({ services, loading: false });
    } catch (err: any) {
      console.error('Error fetching services:', err);
      // Fallback to static services on error
      set({
        services: transformStaticServices(),
        loading: false,
        error: err
      });
    }
  },

  // Fetch simplified services for booking forms (with charge info)
  fetchBookingServices: async () => {
    // Prevent multiple simultaneous fetches
    if (get().bookingServicesLoading) return;

    set({ bookingServicesLoading: true, bookingServicesError: null });

    try {
      const { data, error } = await supabase
        .from('services')
        .select('title, service_charge, show_visit_charge, visit_charge_label')
        .order('sort_order');

      if (error) {
        // If columns don't exist, fallback to just titles
        const { data: basicData } = await supabase
          .from('services')
          .select('title')
          .order('sort_order');
        const bookingServices = (basicData || []) as unknown as BookingService[];
        set({ bookingServices, bookingServicesLoading: false });
        return;
      }

      const bookingServices = (data || []) as unknown as BookingService[];
      set({ bookingServices, bookingServicesLoading: false });
    } catch (err: any) {
      console.error('Error fetching booking services:', err);
      set({
        bookingServices: [],
        bookingServicesLoading: false,
        bookingServicesError: err
      });
    }
  },

  // Refresh both service types
  refreshServices: async () => {
    await Promise.all([
      get().fetchServices(),
      get().fetchBookingServices()
    ]);
  },

  // Get a service by title
  getServiceByTitle: (title: string) => {
    return get().services.find(s => s.title === title);
  },

  // Get service charge info for a specific service
  getServiceCharge: (title: string) => {
    const service = get().bookingServices.find(s => s.title === title);
    if (service && service.show_visit_charge && service.service_charge) {
      return {
        amount: service.service_charge,
        label: service.visit_charge_label || 'Visit Charge',
        show: service.show_visit_charge
      };
    }
    return null;
  }
}));

export default useServicesStore;
