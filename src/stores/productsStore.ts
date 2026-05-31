import { create } from 'zustand';
import { supabase } from '@/integrations/supabase/client';

export interface Product {
  id: string;
  name: string;
  slug: string;
  description?: string;
  short_description?: string;
  price: number;
  compare_at_price?: number;
  main_image_url?: string;
  category?: string;
  brand?: string;
  is_featured?: boolean;
  is_active?: boolean;
  track_inventory?: boolean;
  inventory_quantity?: number;
  sort_order?: number;
  created_at?: string;
  updated_at?: string;
}

// Cache configuration
const CACHE_DURATION_MS = 5 * 60 * 1000; // 5 minutes
const PRODUCTS_PER_PAGE = 12;

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

export interface ProductFilters {
  category?: string;
  brand?: string;
  searchTerm?: string;
  sortBy?: string;
}

export interface ProductsState {
  // Data
  products: Product[];
  allProducts: Product[]; // Full unfiltered list for categories/brands extraction

  // Loading states
  loading: boolean;
  loadingMore: boolean;

  // Error states
  error: Error | null;

  // Pagination
  hasMore: boolean;
  page: number;

  // Cache
  productsCache: CacheEntry<Product[]> | null;
  allProductsCache: CacheEntry<Product[]> | null;

  // Actions
  fetchProducts: (filters?: ProductFilters, reset?: boolean) => Promise<void>;
  fetchAllProducts: () => Promise<void>;
  loadMore: (filters?: ProductFilters) => Promise<void>;
  refreshProducts: () => Promise<void>;
  getProductBySlug: (slug: string) => Product | undefined;
  getFeaturedProducts: () => Product[];
  clearCache: () => void;
}

// Check if cache is valid
const isCacheValid = <T>(cache: CacheEntry<T> | null): boolean => {
  if (!cache) return false;
  return Date.now() - cache.timestamp < CACHE_DURATION_MS;
};

// Build query with filters
const buildProductQuery = (filters?: ProductFilters, page: number = 1) => {
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
  const start = (page - 1) * PRODUCTS_PER_PAGE;
  const end = start + PRODUCTS_PER_PAGE - 1;
  query = query.range(start, end);

  return query;
};

export const useProductsStore = create<ProductsState>((set, get) => ({
  // Initial state
  products: [],
  allProducts: [],
  loading: false,
  loadingMore: false,
  error: null,
  hasMore: true,
  page: 1,
  productsCache: null,
  allProductsCache: null,

  // Fetch products with filters and pagination
  fetchProducts: async (filters?: ProductFilters, reset = true) => {
    const state = get();
    
    // Build cache key based on filters
    const filterKey = filters ? JSON.stringify(filters) : 'all';
    const cacheKey = `products-${filterKey}`;
    
    // Check cache for first page only
    if (reset && isCacheValid(state.productsCache)) {
      set({ 
        products: state.productsCache!.data, 
        loading: false, 
        hasMore: state.productsCache!.data.length === PRODUCTS_PER_PAGE 
      });
      return;
    }

    // Prevent multiple simultaneous fetches
    if (state.loading) return;

    set({ loading: true, error: null });

    try {
      const { data, error } = await buildProductQuery(filters, 1);

      if (error) throw error;

      const products = (data || []) as Product[];
      
      set({ 
        products, 
        loading: false,
        hasMore: products.length === PRODUCTS_PER_PAGE,
        page: 1,
        productsCache: { data: products, timestamp: Date.now() }
      });
    } catch (err: any) {
      console.error('Error fetching products:', err);
      set({
        loading: false,
        error: err
      });
    }
  },

  // Fetch all products (for admin or full list)
  fetchAllProducts: async () => {
    const state = get();
    
    // Check cache
    if (isCacheValid(state.allProductsCache)) {
      set({ allProducts: state.allProductsCache!.data });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const allProducts = (data || []) as Product[];
      
      set({ 
        allProducts,
        allProductsCache: { data: allProducts, timestamp: Date.now() }
      });
    } catch (err: any) {
      console.error('Error fetching all products:', err);
    }
  },

  // Load more products
  loadMore: async (filters?: ProductFilters) => {
    const state = get();
    
    // Prevent multiple simultaneous fetches
    if (state.loadingMore || !state.hasMore) return;

    set({ loadingMore: true });

    try {
      const nextPage = state.page + 1;
      const { data, error } = await buildProductQuery(filters, nextPage);

      if (error) throw error;

      const newProducts = (data || []) as Product[];
      
      set({ 
        products: [...state.products, ...newProducts],
        loadingMore: false,
        hasMore: newProducts.length === PRODUCTS_PER_PAGE,
        page: nextPage,
        // Update cache with all loaded products
        productsCache: { 
          data: [...state.products, ...newProducts], 
          timestamp: Date.now() 
        }
      });
    } catch (err: any) {
      console.error('Error loading more products:', err);
      set({
        loadingMore: false,
        error: err
      });
    }
  },

  // Refresh products (bypass cache)
  refreshProducts: async () => {
    set({ productsCache: null, allProductsCache: null });
    await get().fetchProducts(undefined, true);
  },

  // Get a product by slug
  getProductBySlug: (slug: string) => {
    return get().products.find(p => p.slug === slug) || 
           get().allProducts.find(p => p.slug === slug);
  },

  // Get featured products
  getFeaturedProducts: () => {
    return get().products.filter(p => p.is_featured);
  },

  // Clear cache
  clearCache: () => {
    set({ productsCache: null, allProductsCache: null });
  }
}));

export default useProductsStore;
