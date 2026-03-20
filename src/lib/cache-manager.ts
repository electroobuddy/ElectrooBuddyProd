/**
 * Client-Side Cache Manager
 * 
 * Provides intelligent caching to reduce Supabase queries
 * and improve performance on the free tier (500MB limit)
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiry: number;
}

class CacheManager {
  private cache = new Map<string, CacheEntry<any>>();
  
  /**
   * Get data from cache if valid
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }
    
    // Check if expired
    if (Date.now() > entry.expiry) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data as T;
  }
  
  /**
   * Set data in cache with expiry
   */
  set<T>(key: string, data: T, ttlMs: number): void {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      expiry: Date.now() + ttlMs,
    };
    
    this.cache.set(key, entry);
    
    // Log cache size for monitoring
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Cache] Set "${key}", Size: ${this.cache.size} entries`);
    }
  }
  
  /**
   * Remove item from cache
   */
  remove(key: string): void {
    this.cache.delete(key);
  }
  
  /**
   * Clear all cache
   */
  clear(): void {
    this.cache.clear();
  }
  
  /**
   * Clear cache by pattern (e.g., "products-*")
   */
  clearByPattern(pattern: string): void {
    const regex = new RegExp(`^${pattern.replace('*', '.*')}$`);
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
      }
    }
  }
  
  /**
   * Get cache statistics
   */
  getStats() {
    const now = Date.now();
    let valid = 0;
    let expired = 0;
    
    for (const entry of this.cache.values()) {
      if (now > entry.expiry) {
        expired++;
      } else {
        valid++;
      }
    }
    
    return {
      total: this.cache.size,
      valid,
      expired,
      memoryUsage: this.getMemoryUsage(),
    };
  }
  
  /**
   * Estimate memory usage (in KB)
   */
  private getMemoryUsage(): number {
    try {
      const cacheStr = JSON.stringify(Array.from(this.cache.entries()));
      return Math.round(cacheStr.length / 1024);
    } catch {
      return 0;
    }
  }
  
  /**
   * Cleanup expired entries
   */
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiry) {
        this.cache.delete(key);
      }
    }
    
    if (process.env.NODE_ENV === 'development') {
      console.log('[Cache] Cleanup completed');
    }
  }
}

// Singleton instance
export const cacheManager = new CacheManager();

// Auto-cleanup every 10 minutes
if (typeof window !== 'undefined') {
  setInterval(() => {
    cacheManager.cleanup();
  }, 10 * 60 * 1000);
}

/**
 * Hook for cached data fetching
 */
export async function fetchWithCache<T>(
  key: string,
  fetchFn: () => Promise<T>,
  ttlMs: number
): Promise<T> {
  // Try cache first
  const cached = cacheManager.get<T>(key);
  if (cached) {
    return cached;
  }
  
  // Fetch fresh data
  const data = await fetchFn();
  
  // Store in cache
  cacheManager.set(key, data, ttlMs);
  
  return data;
}
