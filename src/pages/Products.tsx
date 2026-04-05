import { useState, useEffect, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  ChevronDown,
  SlidersHorizontal,
  X,
  AlertCircle,
  Zap,
} from "lucide-react";
import SEO from "@/components/SEO";
import { useProducts } from "@/hooks/useOptimizedData";
import ProductCard from "@/components/ProductCard";

/* ─── debounce hook ─────────────────────────────────────────── */
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
    <div className="p-3 sm:p-4 space-y-2 sm:space-y-3">
      <div className="h-3 sm:h-4 bg-muted rounded w-3/4" />
      <div className="h-2.5 sm:h-3 bg-muted rounded w-full" />
      <div className="h-2.5 sm:h-3 bg-muted rounded w-2/3" />
      <div className="flex gap-2 pt-1">
        <div className="h-7 sm:h-8 bg-muted rounded-lg flex-1" />
        <div className="h-7 sm:h-8 bg-muted rounded-lg flex-1" />
      </div>
    </div>
  </div>
));

/* ─── main component ─────────────────────────────────────────── */
const Products = () => {
  const [searchInput, setSearchInput] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedBrand, setSelectedBrand] = useState<string>("all");
  const [priceMin, setPriceMin] = useState<number>(0);
  const [priceMax, setPriceMax] = useState<number>(100000);
  const [sortBy, setSortBy] = useState("featured");
  const [showFilters, setShowFilters] = useState(false);

  const searchTerm = useDebounce(searchInput, 400);
  const filters = { category: selectedCategory, brand: selectedBrand, searchTerm, sortBy };
  const { products, loading, error, hasMore, loadMore } = useProducts(filters);

  const categories = ["all", ...Array.from(new Set(products.map((p) => p.category).filter(Boolean)))];
  const brands = ["all", ...Array.from(new Set(products.map((p) => p.brand).filter(Boolean)))];

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

  useEffect(() => {
    document.title = "Products | Electrobuddy – Electrical Components & Accessories";
  }, []);

  return (
    <div className="products-page bg-gray-50 dark:bg-gray-900 min-h-screen">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
        .products-page { font-family: 'Poppins', sans-serif; }
        .products-page h1,.products-page h2,.products-page h3,
        .products-page h4,.products-page h5,.products-page h6 { font-weight: 700; }
        .products-hero {
          position: relative;
          padding: 100px 0 80px;
          overflow: hidden;
          text-align: center;
        }
        @media (max-width: 640px) {
          .products-hero { padding: 80px 0 56px; }
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
              className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-5 py-2.5 sm:px-6 sm:py-3 rounded-full mb-6 sm:mb-8"
            >
              <Zap className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="font-semibold text-xs sm:text-sm uppercase tracking-wide">
                Quality Electrical Products
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-4 sm:mb-6"
            >
              Our Products
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="text-base sm:text-xl max-w-3xl mx-auto opacity-90 px-2"
            >
              Discover our wide range of high-quality electrical products and accessories
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* ── Content: full-width max-w container ── */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-10">

        {/* ── Filter card — full width ── */}
        <div className="bg-card border border-border rounded-2xl p-4 sm:p-6 mb-6 sm:mb-8 shadow-sm w-full">

          {/* Row 1: Search + Sort + Filter + Clear */}
          <div className="flex flex-col sm:flex-row gap-3">

            {/* Search — flex-1 takes remaining space */}
            <div className="relative flex-1 min-w-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4 pointer-events-none" />
              <input
                type="text"
                placeholder="Search products…"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full pl-10 pr-9 py-2.5 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary transition text-sm"
                aria-label="Search products"
              />
              {searchInput && (
                <button
                  onClick={() => setSearchInput("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Right controls: sort + filter toggle + clear */}
            <div className="flex gap-2 sm:gap-3 flex-shrink-0">

              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="flex-1 sm:flex-none sm:w-52 px-3 py-2.5 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/25 text-sm"
                aria-label="Sort by"
              >
                <option value="featured">Featured</option>
                <option value="price-low">Price: Low → High</option>
                <option value="price-high">Price: High → Low</option>
                <option value="name">Name: A–Z</option>
              </select>

              {/* Filter toggle */}
              <button
                onClick={() => setShowFilters((v) => !v)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition whitespace-nowrap ${
                  showFilters
                    ? "bg-primary text-primary-foreground border-primary"
                    : "border-border bg-background hover:bg-muted"
                }`}
                aria-expanded={showFilters}
              >
                <SlidersHorizontal className="w-4 h-4" />
                Filters
                {hasActiveFilters && (
                  <span className="w-2 h-2 rounded-full bg-yellow-400 flex-shrink-0" />
                )}
              </button>

              {/* Clear — shown on sm+ */}
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="hidden sm:flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-border bg-background hover:bg-muted text-sm text-muted-foreground hover:text-foreground transition whitespace-nowrap"
                >
                  <X className="w-3.5 h-3.5" />
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Row 2: Advanced filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                key="adv"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.22 }}
                className="overflow-hidden"
              >
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-5 mt-4 border-t border-border">

                  {/* Category */}
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground mb-1.5 block uppercase tracking-wide">
                      Category
                    </label>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/25"
                    >
                      {categories.map((c) => (
                        <option key={c} value={c}>
                          {c === "all" ? "All Categories" : c}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Brand */}
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground mb-1.5 block uppercase tracking-wide">
                      Brand
                    </label>
                    <select
                      value={selectedBrand}
                      onChange={(e) => setSelectedBrand(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/25"
                    >
                      {brands.map((b) => (
                        <option key={b} value={b}>
                          {b === "all" ? "All Brands" : b}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Price range */}
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground mb-1.5 block uppercase tracking-wide">
                      Price: ₹{priceMin.toLocaleString()} –{" "}
                      {priceMax >= 100000 ? "Any" : `₹${priceMax.toLocaleString()}`}
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        min={0}
                        placeholder="Min ₹"
                        value={priceMin || ""}
                        onChange={(e) => setPriceMin(Number(e.target.value) || 0)}
                        className="w-1/2 px-3 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/25"
                        aria-label="Minimum price"
                      />
                      <input
                        type="number"
                        min={0}
                        placeholder="Max ₹"
                        value={priceMax >= 100000 ? "" : priceMax}
                        onChange={(e) => setPriceMax(Number(e.target.value) || 100000)}
                        className="w-1/2 px-3 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/25"
                        aria-label="Maximum price"
                      />
                    </div>
                  </div>
                </div>

                {/* Clear all — mobile only, inside panel */}
                {hasActiveFilters && (
                  <div className="flex justify-end mt-4 pt-3 border-t border-border sm:hidden">
                    <button
                      onClick={clearFilters}
                      className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-600 font-semibold"
                    >
                      <X className="w-3.5 h-3.5" /> Clear all filters
                    </button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Result count */}
        {!loading && (
          <p className="text-xs sm:text-sm text-muted-foreground mb-4 sm:mb-6">
            {visible.length === 0
              ? "No products found"
              : `Showing ${visible.length} product${visible.length !== 1 ? "s" : ""}`}
            {hasActiveFilters && " (filtered)"}
          </p>
        )}

        {/* ── Grid ── */}
        {loading && products.length === 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5 lg:gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-24 flex flex-col items-center gap-4">
            <AlertCircle className="w-12 h-12 text-red-500" />
            <p className="text-red-500 text-lg font-semibold">Failed to load products</p>
            <button
              onClick={() => window.location.reload()}
              className="text-sm text-primary hover:underline"
            >
              Retry
            </button>
          </div>
        ) : visible.length === 0 ? (
          <div className="text-center py-24 flex flex-col items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center">
              <Search className="w-8 h-8 text-muted-foreground opacity-40" />
            </div>
            <p className="text-lg font-semibold">No products found</p>
            <p className="text-muted-foreground text-sm">
              Try adjusting your filters or search term
            </p>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-primary hover:underline text-sm font-medium"
              >
                Clear all filters
              </button>
            )}
          </div>
        ) : (
          <>
            {/* 2-col mobile → 3-col tablet → 4-col desktop */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5 lg:gap-6">
              {visible.map((product, index) => (
                <ProductCard key={product.id} product={product} index={index} />
              ))}
            </div>

            {/* Load more */}
            {hasMore && (
              <div className="flex justify-center mt-10 sm:mt-14">
                <button
                  onClick={loadMore}
                  disabled={loading}
                  className="px-8 py-3 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm sm:text-base shadow-sm"
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
      </div>
    </div>
  );
};

export default Products;