/**
 * Custom hooks for optimized data fetching with caching
 * Reduces Supabase queries and improves performance
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { cacheManager, fetchWithCache } from '@/lib/cache-manager';
import { CACHE_CONFIG } from '@/lib/optimization-config';

/**
 * Hook for fetching services with caching
 */
export function useServices(limit?: number) {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);
        const cacheKey = limit ? `services-limited-${limit}` : 'services-all';
        const ttl = CACHE_CONFIG.SERVICES;

        const data = await fetchWithCache(
          cacheKey,
          async () => {
            let query = supabase.from('services').select('*').order('sort_order');
            if (limit) {
              query = query.limit(limit);
            }
            const { data, error } = await query;
            if (error) throw error;
            return data || [];
          },
          ttl
        );

        setServices(data);
        setError(null);
      } catch (err: any) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, [limit]);

  return { services, loading, error };
}

/**
 * Hook for fetching team members with caching
 */
export function useTeamMembers() {
  const [team, setTeam] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        setLoading(true);
        
        const data = await fetchWithCache(
          'team-members',
          async () => {
            const { data, error } = await supabase
              .from('team_members')
              .select('*')
              .order('sort_order');
            if (error) throw error;
            return data || [];
          },
          CACHE_CONFIG.TEAM_MEMBERS
        );

        setTeam(data);
        setError(null);
      } catch (err: any) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchTeam();
  }, []);

  return { team, loading, error };
}

/**
 * Hook for fetching testimonials with caching
 */
export function useTestimonials() {
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        setLoading(true);
        
        const data = await fetchWithCache(
          'testimonials',
          async () => {
            const { data, error } = await supabase
              .from('testimonials')
              .select('*')
              .order('created_at', { ascending: false });
            if (error) throw error;
            return data || [];
          },
          CACHE_CONFIG.TESTIMONIALS
        );

        setTestimonials(data);
        setError(null);
      } catch (err: any) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchTestimonials();
  }, []);

  return { testimonials, loading, error };
}

/**
 * Hook for fetching products with pagination and caching
 */
export function useProducts(filters?: {
  category?: string;
  brand?: string;
  searchTerm?: string;
  sortBy?: string;
}) {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);

  const fetchProducts = useCallback(async (pageNum = 1, append = false) => {
    try {
      setLoading(true);
      
      // Build cache key based on filters
      const filterKey = filters 
        ? JSON.stringify(filters)
        : 'all';
      const cacheKey = `products-page-${pageNum}-${filterKey}`;

      const data = await fetchWithCache(
        cacheKey,
        async () => {
          let query = supabase
            .from('products')
            .select('*')
            .eq('is_active', true);

          // Apply filters
          if (filters?.category && filters.category !== 'all') {
            query = query.eq('category', filters.category);
          }
          if (filters?.brand && filters.brand !== 'all') {
            query = query.eq('brand', filters.brand);
          }
          if (filters?.searchTerm) {
            query = query.or(`name.ilike.%${filters.searchTerm}%,short_description.ilike.%${filters.searchTerm}%`);
          }

          // Apply sorting
          if (filters?.sortBy === 'price-low') {
            query = query.order('price', { ascending: true });
          } else if (filters?.sortBy === 'price-high') {
            query = query.order('price', { ascending: false });
          } else if (filters?.sortBy === 'name') {
            query = query.order('name', { ascending: true });
          } else {
            query = query.order('is_featured', { ascending: false })
                        .order('created_at', { ascending: false });
          }

          // Pagination
          const start = (pageNum - 1) * 12;
          const end = start + 11;
          query = query.range(start, end);

          const { data, error } = await query;
          if (error) throw error;
          return data || [];
        },
        CACHE_CONFIG.PRODUCTS
      );

      setProducts(prev => append ? [...prev, ...data] : data);
      setHasMore(data.length === 12);
      setError(null);
    } catch (err: any) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    setPage(1);
    fetchProducts(1, false);
  }, [filters]);

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchProducts(nextPage, true);
  };

  return { products, loading, error, hasMore, loadMore };
}

/**
 * Hook for fetching projects with caching
 */
export function useProjects() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        
        const data = await fetchWithCache(
          'projects',
          async () => {
            const { data, error } = await supabase
              .from('projects')
              .select('*')
              .order('created_at', { ascending: false });
            if (error) throw error;
            return data || [];
          },
          CACHE_CONFIG.PROJECTS || CACHE_CONFIG.TESTIMONIALS // Fallback if PROJECTS not defined
        );

        setProjects(data);
        setError(null);
      } catch (err: any) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  return { projects, loading, error };
}

/**
 * Invalidate cache when data changes
 */
export function useCacheInvalidation() {
  const invalidateProducts = useCallback(() => {
    cacheManager.clearByPattern('products-*');
  }, []);

  const invalidateServices = useCallback(() => {
    cacheManager.remove('services-all');
    cacheManager.clearByPattern('services-limited-*');
  }, []);

  const invalidateTeam = useCallback(() => {
    cacheManager.remove('team-members');
  }, []);

  const invalidateTestimonials = useCallback(() => {
    cacheManager.remove('testimonials');
  }, []);

  const invalidateProjects = useCallback(() => {
    cacheManager.remove('projects');
  }, []);

  return {
    invalidateProducts,
    invalidateServices,
    invalidateTeam,
    invalidateTestimonials,
    invalidateProjects,
  };
}

/**
 * Hook for admin dashboard statistics with caching
 */
export function useAdminDashboardStats() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        
        const data = await fetchWithCache(
          'admin-dashboard-stats',
          async () => {
            // Fetch table counts
            const tables = [
              'products', 'orders', 'bookings', 
              'services', 'projects', 'testimonials', 'contact_messages'
            ] as const;

            const counts: Record<string, number> = {};

            for (const table of tables) {
              try {
                const { count, error } = await supabase
                  .from(table)
                  .select('*', { count: 'exact', head: true });
                
                if (!error && count !== null) {
                  counts[table] = count;
                }
              } catch (tableError) {
                console.warn(`Failed to fetch count for table ${table}:`, tableError);
                // Continue with other tables even if one fails
              }
            }

            return counts;
          },
          CACHE_CONFIG.ADMIN_STATS
        );

        setStats(data);
        setError(null);
      } catch (err: any) {
        console.error('Error fetching admin dashboard stats:', err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return { stats, loading, error };
}

/**
 * Hook for admin orders with caching and pagination
 */
export function useAdminOrders(pageSize = 50) {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);

  const fetchOrders = useCallback(async (pageNum = 1, append = false) => {
    try {
      setLoading(true);
      
      const cacheKey = `admin-orders-page-${pageNum}`;
      
      const data = await fetchWithCache(
        cacheKey,
        async () => {
          const start = (pageNum - 1) * pageSize;
          const end = start + pageSize - 1;
          
          const { data, error } = await supabase
            .from('orders')
            .select('*')
            .order('ordered_at', { ascending: false })
            .range(start, end);
          
          if (error) throw error;
          return data || [];
        },
        CACHE_CONFIG.ADMIN_ORDERS
      );

      setOrders(prev => append ? [...prev, ...data] : data);
      setHasMore(data.length === pageSize);
      setError(null);
    } catch (err: any) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [pageSize]);

  useEffect(() => {
    setPage(1);
    fetchOrders(1, false);
  }, []);

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchOrders(nextPage, true);
  };

  return { orders, loading, error, hasMore, loadMore };
}

/**
 * Hook for admin bookings with caching and pagination
 */
export function useAdminBookings(pageSize = 50) {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);

  const fetchBookings = useCallback(async (pageNum = 1, append = false) => {
    try {
      setLoading(true);
      
      const cacheKey = `admin-bookings-page-${pageNum}`;
      
      const data = await fetchWithCache(
        cacheKey,
        async () => {
          const start = (pageNum - 1) * pageSize;
          const end = start + pageSize - 1;
          
          const { data, error } = await supabase
            .from('bookings')
            .select('*')
            .order('created_at', { ascending: false })
            .range(start, end);
          
          if (error) throw error;
          return data || [];
        },
        CACHE_CONFIG.ADMIN_BOOKINGS
      );

      setBookings(prev => append ? [...prev, ...data] : data);
      setHasMore(data.length === pageSize);
      setError(null);
    } catch (err: any) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [pageSize]);

  useEffect(() => {
    setPage(1);
    fetchBookings(1, false);
  }, []);

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchBookings(nextPage, true);
  };

  return { bookings, loading, error, hasMore, loadMore };
}

/**
 * Hook for admin products with caching and pagination
 */
export function useAdminProducts() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        
        const data = await fetchWithCache(
          'admin-products',
          async () => {
            const { data, error } = await supabase
              .from('products')
              .select('*')
              .order('created_at', { ascending: false });
            
            if (error) throw error;
            return data || [];
          },
          CACHE_CONFIG.PRODUCTS
        );

        setProducts(data);
        setError(null);
      } catch (err: any) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return { products, loading, error };
}

/**
 * Hook for admin users with optimized parallel queries
 */
export function useAdminUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        
        // Fetch all data in parallel
        const [profilesData, rolesData, bookingsData] = await Promise.all([
          fetchWithCache(
            'admin-users-profiles',
            async () => {
              const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .order('created_at', { ascending: false });
              if (error) throw error;
              return data || [];
            },
            CACHE_CONFIG.ADMIN_STATS
          ),
          fetchWithCache(
            'admin-users-roles',
            async () => {
              const { data, error } = await supabase
                .from('user_roles')
                .select('*');
              if (error) throw error;
              return data || [];
            },
            CACHE_CONFIG.ADMIN_STATS
          ),
          fetchWithCache(
            'admin-users-bookings',
            async () => {
              const { data, error } = await supabase
                .from('bookings')
                .select('user_id, name')
                .not('user_id', 'is', null);
              if (error) throw error;
              return data || [];
            },
            CACHE_CONFIG.ADMIN_STATS
          )
        ]);

        // Process data
        const roleMap: Record<string, string> = {};
        (rolesData || []).forEach((r: any) => { roleMap[r.user_id] = r.role; });

        const nameMap: Record<string, string> = {};
        (bookingsData || []).forEach((b: any) => { if (b.user_id && !nameMap[b.user_id]) nameMap[b.user_id] = b.name; });

        const combined = (profilesData || []).map((p: any) => ({
          ...p,
          role: roleMap[p.user_id] || "user",
          booking_name: nameMap[p.user_id] || "",
        }));

        setUsers(combined);
        setError(null);
      } catch (err: any) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  return { users, loading, error };
}

/**
 * Hook for admin services with caching
 */
export function useAdminServices() {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);
        
        const data = await fetchWithCache(
          'admin-services',
          async () => {
            const { data, error } = await supabase
              .from('services')
              .select('*')
              .order('sort_order');
            
            if (error) throw error;
            return data || [];
          },
          CACHE_CONFIG.SERVICES
        );

        setServices(data);
        setError(null);
      } catch (err: any) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  return { services, loading, error };
}

/**
 * Hook for admin messages with caching
 */
export function useAdminMessages() {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        setLoading(true);
        
        const data = await fetchWithCache(
          'admin-messages',
          async () => {
            const { data, error } = await supabase
              .from('contact_messages')
              .select('*')
              .order('created_at', { ascending: false });
            
            if (error) throw error;
            return data || [];
          },
          CACHE_CONFIG.BOOKINGS // Use similar short cache
        );

        setMessages(data);
        setError(null);
      } catch (err: any) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, []);

  return { messages, loading, error };
}

/**
 * Extended cache invalidation for admin data
 */
export function useAdminCacheInvalidation() {
  const baseInvalidation = useCacheInvalidation();
  
  const invalidateDashboardStats = useCallback(() => {
    cacheManager.remove('admin-dashboard-stats');
  }, []);

  const invalidateOrders = useCallback(() => {
    cacheManager.remove('admin-orders');
  }, []);

  const invalidateBookings = useCallback(() => {
    cacheManager.remove('admin-bookings');
  }, []);

  const invalidateProducts = useCallback(() => {
    cacheManager.remove('admin-products');
  }, []);

  const invalidateUsers = useCallback(() => {
    cacheManager.remove('admin-users-profiles');
    cacheManager.remove('admin-users-roles');
    cacheManager.remove('admin-users-bookings');
  }, []);

  const invalidateServices = useCallback(() => {
    cacheManager.remove('admin-services');
  }, []);

  const invalidateMessages = useCallback(() => {
    cacheManager.remove('admin-messages');
  }, []);

  const invalidateTestimonials = useCallback(() => {
    cacheManager.remove('testimonials');
  }, []);

  const invalidateProjects = useCallback(() => {
    cacheManager.remove('projects');
  }, []);

  return {
    ...baseInvalidation,
    invalidateDashboardStats,
    invalidateOrders,
    invalidateBookings,
    invalidateProducts,
    invalidateUsers,
    invalidateServices,
    invalidateMessages,
    invalidateTestimonials,
    invalidateProjects,
  };
}
