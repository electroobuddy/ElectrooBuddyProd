import { useState } from "react";
import { motion } from "framer-motion";
import { Search, ShoppingCart, Zap, Package } from "lucide-react";
import { Link } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";
import { useProducts } from "@/hooks/useOptimizedData";

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

const UserProducts = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState("featured");
  const { addToCart } = useCart();
  
  // Use optimized hook with caching and pagination
  const filters = {
    category: selectedCategory !== "all" ? selectedCategory : undefined,
    searchTerm: searchTerm || undefined,
    sortBy,
  };
  
  const { products, loading, error, hasMore, loadMore } = useProducts(filters);

  const handleAddToCart = (product: Product) => {
    if (product.inventory_quantity === 0 && product.track_inventory) {
      toast.error("Out of stock");
      return;
    }
    addToCart(product, 1);
  };

  // Get unique categories from loaded products
  const categories = ["all", ...Array.from(new Set(products.map(p => p.category).filter(Boolean)))];

  // Filter and search products
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.short_description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || product.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case "price-low":
        return a.price - b.price;
      case "price-high":
        return b.price - a.price;
      case "name":
        return a.name.localeCompare(b.name);
      case "featured":
      default:
        return (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0);
    }
  });

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-3xl font-heading font-bold mb-2">Browse Products</h1>
        <p className="text-muted-foreground">Explore our wide range of high-quality electrical products</p>
      </div>

      {/* Filters and Search */}
      <div className="bg-card border border-border rounded-xl p-4 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
              />
            </div>
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>
                  {cat === "all" ? "All Categories" : cat}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
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
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : sortedProducts.length === 0 ? (
        <div className="text-center py-20">
          <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground text-lg">No products found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {sortedProducts.map((product, index) => (
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
                    <button 
                      onClick={(e) => {
                        e.preventDefault();
                        handleAddToCart(product);
                      }}
                      className="p-2 rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
                    >
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
      )}
    </div>
  );
};

export default UserProducts;
