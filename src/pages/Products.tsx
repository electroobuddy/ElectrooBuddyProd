import { useState, useEffect, useCallback, useRef, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  ShoppingCart,
  Zap,
  ChevronDown,
  SlidersHorizontal,
  X,
  Tag,
  Star,
  AlertCircle,
} from "lucide-react";
import { Link } from "react-router-dom";
import SEO from "@/components/SEO";
import { useProducts, useCacheInvalidation } from "@/hooks/useOptimizedData";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";

/* ─── helpers ─────────────────────────────────────────────── */
function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

/* ─── skeleton card ─────────────────────────────────────────── */
const SkeletonCard = memo(() => (
  <div className="bg-card border border-border rounded-xl overflow-hidden animate-pulse">
    <div className="aspect-square bg-muted" />
    <div className="p-4 space-y-3">
      <div className="h-4 bg-muted rounded w-3/4" />
      <div className="h-3 bg-muted rounded w-full" />
      <div className="h-3 bg-muted rounded w-2/3" />
      <div className="flex justify-between items-center pt-1">
        <div className="h-6 bg-muted rounded w-1/3" />
        <div className="h-8 w-8 bg-muted rounded-lg" />
      </div>
    </div>
  </div>
));

/* ─── component ─────────────────────────────────────────────── */
const Products = () => {
  const { addToCart } = useCart();

  const [searchInput, setSearchInput] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedBrand, setSelectedBrand] = useState<string>("all");
  const [priceMin, setPriceMin] = useState<number>(0);
  const [priceMax, setPriceMax] = useState<number>(100000);
  const [sortBy, setSortBy] = useState("featured");
  const [showFilters, setShowFilters] = useState(false);
  const [addingId, setAddingId] = useState<string | null>(null);

  const searchTerm = useDebounce(searchInput, 400);

  const filters = { category: selectedCategory, brand: selectedBrand, searchTerm, sortBy };
  const { products, loading, error, hasMore, loadMore } = useProducts(filters);

  /* derive filter options from loaded products */
  const categories = ["all", ...Array.from(new Set(products.map((p) => p.category).filter(Boolean)))];
  const brands = ["all", ...Array.from(new Set(products.map((p) => p.brand).filter(Boolean)))];

  /* client-side price filter on top of server results */
  const visible = products.filter(
    (p) => p.price >= priceMin && (priceMax >= 100000 || p.price <= priceMax)
  );

  const hasActiveFilters =
    selectedCategory !== "all" ||
    selectedBrand !== "all" ||
    searchInput !== "" ||
    priceMin > 0 ||
    priceMax < 100000;

  const clearFilters = () => {
    setSearchInput("");
    setSelectedCategory("all");
    setSelectedBrand("all");
    setPriceMin(0);
    setPriceMax(100000);
    setSortBy("featured");
  };

  const handleQuickAdd = async (product: (typeof products)[0]) => {
    if (product.track_inventory && product.inventory_quantity === 0) return;
    setAddingId(product.id);
    try {
      addToCart(product, 1, false);
      toast.success(`${product.name} added to cart`);
    } catch {
      toast.error("Failed to add to cart");
    } finally {
      setTimeout(() => setAddingId(null), 800);
    }
  };

  /* ── SEO: update document title ── */
  useEffect(() => {
    document.title = "Products | Electrobuddy – Electrical Components & Accessories";
  }, []);

  return (
    <div className="products-page bg-gray-50 dark:bg-gray-900 min-h-screen">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');

        .products-page {
          font-family: 'Poppins', sans-serif;
        }

        .products-page h1,
        .products-page h2,
        .products-page h3,
        .products-page h4,
        .products-page h5,
        .products-page h6 {
          font-weight: 700;
        }

        .products-hero {
          position: relative;
          padding: 112px 0 96px;
          overflow: hidden;
          text-align: center;
        }
      `}</style>
      <SEO
        title="Electrical Products Online | Switches, Lighting & Accessories in Ujjain"
        description="Shop quality electrical products online - switches, sockets, lighting, wiring accessories and more. Best prices in Ujjain with fast delivery and warranty."
        keywords="electrical products, buy switches online, electrical accessories, lighting products, wiring materials, electrical supplies, MCB, distribution boards, electrical tools"
        canonical="/products"
        structuredData={{
          "@context": "https://schema.org",
          "@type": "Store",
          "name": "Electroo Buddy Products",
          "description": "Quality electrical products and accessories at competitive prices",
          "url": "https://electroobuddy.com/products",
          "telephone": "+91-81093-08287",
          "priceRange": "₹",
          "address": {
            "@type": "PostalAddress",
            "addressLocality": "Ujjain",
            "addressRegion": "Madhya Pradesh",
            "addressCountry": "IN"
          }
        }}
      />
      {/* ── Hero ── */}
      <section className="hero-gradient text-white products-hero slide-up">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 30 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.7 }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.4 }}
              className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-6 py-3 rounded-full mb-8"
            >
              <Zap className="w-5 h-5" />
              <span className="font-semibold text-sm uppercase tracking-wide">Quality Electrical Products</span>
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6"
            >
              Our Products
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="text-xl max-w-3xl mx-auto opacity-90"
            >
              Discover our wide range of high-quality electrical products and accessories
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* ── Filters ── */}
      <section className="container mx-auto px-4 py-6">
        <div className="bg-card border border-border rounded-xl p-5 mb-6 shadow-sm">
          {/* top row */}
          <div className="flex flex-wrap gap-3">
            {/* search */}
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <input
                type="text"
                placeholder="Search products…"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full pl-10 pr-9 py-2.5 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition text-sm"
                aria-label="Search products"
              />
              {searchInput && (
                <button
                  onClick={() => setSearchInput("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label="Clear search"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2.5 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm min-w-[160px]"
              aria-label="Sort by"
            >
              <option value="featured">Featured</option>
              <option value="price-low">Price: Low → High</option>
              <option value="price-high">Price: High → Low</option>
              <option value="name">Name: A–Z</option>
            </select>

            {/* toggle advanced */}
            <button
              onClick={() => setShowFilters((v) => !v)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium transition ${
                showFilters
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border bg-background hover:bg-muted"
              }`}
              aria-expanded={showFilters}
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
              {hasActiveFilters && (
                <span className="w-2 h-2 rounded-full bg-yellow-400" aria-label="Active filters" />
              )}
            </button>

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition"
                aria-label="Clear all filters"
              >
                <X className="w-3.5 h-3.5" />
                Clear all
              </button>
            )}
          </div>

          {/* advanced row */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                key="adv"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 mt-4 border-t border-border">
                  {/* category */}
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Category</label>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                    >
                      {categories.map((c) => (
                        <option key={c} value={c}>
                          {c === "all" ? "All Categories" : c}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* brand */}
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Brand</label>
                    <select
                      value={selectedBrand}
                      onChange={(e) => setSelectedBrand(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                    >
                      {brands.map((b) => (
                        <option key={b} value={b}>
                          {b === "all" ? "All Brands" : b}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* price range */}
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                      Price Range: ₹{priceMin.toLocaleString()} – {priceMax >= 100000 ? "Any" : `₹${priceMax.toLocaleString()}`}
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        min={0}
                        placeholder="Min"
                        value={priceMin || ""}
                        onChange={(e) => setPriceMin(Number(e.target.value) || 0)}
                        className="w-1/2 px-3 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                        aria-label="Minimum price"
                      />
                      <input
                        type="number"
                        min={0}
                        placeholder="Max"
                        value={priceMax >= 100000 ? "" : priceMax}
                        onChange={(e) => setPriceMax(Number(e.target.value) || 100000)}
                        className="w-1/2 px-3 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                        aria-label="Maximum price"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* result count */}
        {!loading && (
          <p className="text-sm text-muted-foreground mb-5">
            {visible.length === 0 ? "No products" : `Showing ${visible.length} product${visible.length !== 1 ? "s" : ""}`}
            {hasActiveFilters && " (filtered)"}
          </p>
        )}

        {/* ── Grid ── */}
        {loading && products.length === 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-20 flex flex-col items-center gap-3">
            <AlertCircle className="w-10 h-10 text-red-500" />
            <p className="text-red-500 text-lg font-medium">Failed to load products</p>
            <button
              onClick={() => window.location.reload()}
              className="text-sm text-primary hover:underline"
            >
              Retry
            </button>
          </div>
        ) : visible.length === 0 ? (
          <div className="text-center py-20 flex flex-col items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center">
              <Search className="w-8 h-8 text-muted-foreground opacity-40" />
            </div>
            <p className="text-lg font-medium">No products found</p>
            <p className="text-muted-foreground text-sm">Try adjusting your filters or search term</p>
            {hasActiveFilters && (
              <button onClick={clearFilters} className="text-primary hover:underline text-sm">
                Clear all filters
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {visible.map((product, index) => {
                const outOfStock =
                  product.track_inventory && product.inventory_quantity === 0;
                const discount =
                  product.compare_at_price && product.compare_at_price > product.price
                    ? Math.round((1 - product.price / product.compare_at_price) * 100)
                    : null;

                return (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(index * 0.04, 0.3) }}
                    className="bg-card border border-border rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 group flex flex-col"
                    style={{ willChange: 'transform, opacity' }}
                  >
                    <Link to={`/products/${product.slug}`} className="flex flex-col flex-1">
                      {/* image */}
                      <div className="aspect-square overflow-hidden bg-muted relative">
                        {product.main_image_url ? (
                          <img
                            src={product.main_image_url}
                            alt={product.name}
                            loading="lazy"
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Zap className="w-16 h-16 opacity-10 text-muted-foreground" />
                          </div>
                        )}

                        {/* badges */}
                        <div className="absolute top-2 left-2 flex flex-col gap-1">
                          {product.is_featured && (
                            <span className="bg-yellow-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5">
                              <Star className="w-2.5 h-2.5" /> Featured
                            </span>
                          )}
                          {discount && (
                            <span className="bg-green-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                              {discount}% OFF
                            </span>
                          )}
                        </div>
                        {outOfStock && (
                          <div className="absolute inset-0 bg-background/60 flex items-center justify-center backdrop-blur-[1px]">
                            <span className="bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                              Out of Stock
                            </span>
                          </div>
                        )}
                      </div>

                      {/* info */}
                      <div className="p-4 flex flex-col flex-1">
                        <h3 className="font-heading font-semibold text-base mb-1 line-clamp-2 leading-snug">
                          {product.name}
                        </h3>
                        {product.short_description && (
                          <p className="text-xs text-muted-foreground mb-3 line-clamp-2 leading-relaxed flex-1">
                            {product.short_description}
                          </p>
                        )}

                        <div className="flex items-center justify-between mt-auto">
                          <div>
                            <span className="text-lg font-bold text-primary">
                              ₹{product.price.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                            </span>
                            {product.compare_at_price && (
                              <span className="text-xs text-muted-foreground line-through ml-1.5">
                                ₹{product.compare_at_price.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                              </span>
                            )}
                          </div>

                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              handleQuickAdd(product);
                            }}
                            disabled={outOfStock || addingId === product.id}
                            className="p-2 rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                            aria-label={`Add ${product.name} to cart`}
                          >
                            {addingId === product.id ? (
                              <motion.span
                                key="check"
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="block w-5 h-5 text-green-500"
                              >
                                ✓
                              </motion.span>
                            ) : (
                              <ShoppingCart className="w-4 h-4" />
                            )}
                          </button>
                        </div>

                        {/* tags */}
                        {(product.category || product.brand) && (
                          <div className="mt-2.5 flex items-center gap-1.5 flex-wrap">
                            {product.category && (
                              <span className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded flex items-center gap-0.5">
                                <Tag className="w-2.5 h-2.5" />
                                {product.category}
                              </span>
                            )}
                            {product.brand && (
                              <span className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded">
                                {product.brand}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>

            {/* Load more */}
            {hasMore && (
              <div className="flex justify-center mt-12">
                <button
                  onClick={loadMore}
                  disabled={loading}
                  className="px-8 py-3 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  aria-busy={loading}
                >
                  {loading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      Loading…
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
  );
};

export default Products;