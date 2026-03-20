import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { Search, Filter, ShoppingCart, Star, Zap, ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";
import { useProducts, useCacheInvalidation } from "@/hooks/useOptimizedData";
import { CACHE_CONFIG } from "@/lib/optimization-config";


interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  short_description?: string;
  price: number;
  compare_at_price?: number;
  main_image_url?: string;
  category?: string;
  brand?: string;
  is_active: boolean;
  is_featured: boolean;
  inventory_quantity: number;
  track_inventory: boolean;
}

const Products = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedBrand, setSelectedBrand] = useState<string>("all");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  const [sortBy, setSortBy] = useState("featured");
  
  // Use optimized hook with caching and pagination
  const filters = {
    category: selectedCategory,
    brand: selectedBrand,
    searchTerm,
    sortBy,
  };
  
  const { products, loading, error, hasMore, loadMore } = useProducts(filters);
  const { invalidateProducts } = useCacheInvalidation();

  // Get unique categories and brands from loaded products
  const categories = ["all", ...Array.from(new Set(products.map(p => p.category).filter(Boolean)))];
  const brands = ["all", ...Array.from(new Set(products.map(p => p.brand).filter(Boolean)))];

  return (
    <>
  
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 py-16 border-b border-border">
          <div className="container mx-auto px-4 text-center">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-5xl font-heading font-bold mb-4"
            >
              Our Products
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-lg text-muted-foreground max-w-2xl mx-auto"
            >
              Discover our wide range of high-quality electrical products and accessories
            </motion.p>
          </div>
        </section>

        {/* Filters and Search */}
        <section className="container mx-auto px-4 py-8">
          <div className="bg-card border border-border rounded-xl p-6 mb-8 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* Search */}
              <div className="lg:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
                  />
                </div>
              </div>

              {/* Category Filter */}
              <div>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>
                      {cat === "all" ? "All Categories" : cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Brand Filter */}
              <div>
                <select
                  value={selectedBrand}
                  onChange={(e) => setSelectedBrand(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
                >
                  {brands.map(brand => (
                    <option key={brand} value={brand}>
                      {brand === "all" ? "All Brands" : brand}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort By */}
              <div>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
                >
                  <option value="featured">Featured</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="name">Name: A to Z</option>
                </select>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          {loading && products.length === 0 ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : error ? (
            <div className="text-center py-20">
              <p className="text-red-500 text-lg">Error loading products. Please try again.</p>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-muted-foreground text-lg">No products found</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {products.map((product, index) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-card border border-border rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 group"
                  >
                    <Link to={`/products/${product.slug}`}>
                    {/* Product Image */}
                    <div className="aspect-square overflow-hidden bg-muted relative">
                      {product.main_image_url ? (
                        <img
                          src={product.main_image_url}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                          <Zap className="w-16 h-16 opacity-20" />
                        </div>
                      )}
                      {product.is_featured && (
                        <span className="absolute top-2 left-2 bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                          Featured
                        </span>
                      )}
                      {product.inventory_quantity === 0 && product.track_inventory && (
                        <span className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                          Out of Stock
                        </span>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="p-4">
                      <h3 className="font-heading font-semibold text-lg mb-1 truncate">
                        {product.name}
                      </h3>
                      {product.short_description && (
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                          {product.short_description}
                        </p>
                      )}
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-xl font-bold text-primary">
                            ₹{product.price.toFixed(2)}
                          </span>
                          {product.compare_at_price && (
                            <span className="text-sm text-muted-foreground line-through ml-2">
                              ₹{product.compare_at_price.toFixed(2)}
                            </span>
                          )}
                        </div>
                        <button className="p-2 rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-colors">
                          <ShoppingCart className="w-5 h-5" />
                        </button>
                      </div>

                      {product.category && (
                        <div className="mt-3 flex items-center gap-2">
                          <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                            {product.category}
                          </span>
                          {product.brand && (
                            <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                              {product.brand}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
              
              {/* Load More Button */}
              {hasMore && (
                <div className="flex justify-center mt-12">
                  <button
                    onClick={loadMore}
                    disabled={loading}
                    className="px-8 py-3 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        Loading...
                      </>
                    ) : (
                      <>
                        Load More Products
                        <ChevronDown className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              )}
            </>
          )}
        </section>

      </div>
    </>
  );
};

export default Products;
