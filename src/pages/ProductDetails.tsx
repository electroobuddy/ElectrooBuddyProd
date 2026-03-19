import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { 
  ShoppingCart, 
  Zap, 
  Star, 
  ChevronRight, 
  Package, 
  Truck, 
  Shield,
  ArrowLeft,
  Plus,
  Minus
} from "lucide-react";

import { toast } from "sonner";
import { useCart } from "@/contexts/CartContext";

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  short_description?: string;
  price: number;
  compare_at_price?: number;
  main_image_url?: string;
  gallery_images?: string[];
  category?: string;
  brand?: string;
  is_active: boolean;
  is_featured: boolean;
  inventory_quantity: number;
  track_inventory: boolean;
  installation_available: boolean;
  installation_charge: number;
  installation_description?: string;
}

const ProductDetails = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [activeTab, setActiveTab] = useState("description");
  const [addingToCart, setAddingToCart] = useState(false);

  useEffect(() => {
    fetchProduct();
  }, [slug]);

  const fetchProduct = async () => {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("slug", slug)
        .eq("is_active", true)
        .single();

      if (error) throw error;
      setProduct(data);
    } catch (error) {
      console.error("Error fetching product:", error);
      toast.error("Product not found");
      navigate("/products");
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    setAddingToCart(true);
    try {
      if (product) {
        addToCart(product, quantity, false);
      }
    } catch (error) {
      toast.error("Failed to add to cart");
    } finally {
      setAddingToCart(false);
    }
  };

  const handleBuyNow = async () => {
    try {
      if (product) {
        // Add to cart
        addToCart(product, quantity, false);
        // Redirect to checkout
        setTimeout(() => {
          navigate("/checkout");
        }, 500);
      }
    } catch (error) {
      toast.error("Failed to proceed to checkout");
    }
  };

  if (loading) {
    return (
      <>
        
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </>
    );
  }

  if (!product) {
    return null;
  }

  const allImages = [product.main_image_url, ...(product.gallery_images || [])].filter(Boolean) as string[];

  return (
    <>
     
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
        <div className="container mx-auto px-4 py-8">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
            <Link to="/" className="hover:text-foreground transition">Home</Link>
            <ChevronRight className="w-4 h-4" />
            <Link to="/products" className="hover:text-foreground transition">Products</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-foreground">{product.name}</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            {/* Product Images */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              {/* Main Image */}
              <div className="aspect-square bg-card border border-border rounded-xl overflow-hidden">
                {allImages.length > 0 ? (
                  <img
                    src={allImages[selectedImage]}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-muted">
                    <Zap className="w-32 h-32 text-muted-foreground opacity-20" />
                  </div>
                )}
              </div>

              {/* Thumbnail Gallery */}
              {allImages.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {allImages.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`aspect-square rounded-lg border-2 overflow-hidden transition-all ${
                        selectedImage === index
                          ? "border-primary ring-2 ring-primary/20"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <img src={img} alt={`${product.name} ${index + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Product Info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div>
                <div className="flex items-center gap-2 mb-2">
                  {product.category && (
                    <span className="text-xs font-medium bg-primary/10 text-primary px-3 py-1 rounded-full">
                      {product.category}
                    </span>
                  )}
                  {product.brand && (
                    <span className="text-xs font-medium bg-secondary/10 text-secondary px-3 py-1 rounded-full">
                      {product.brand}
                    </span>
                  )}
                  {product.is_featured && (
                    <span className="text-xs font-medium bg-yellow-500/10 text-yellow-600 px-3 py-1 rounded-full flex items-center gap-1">
                      <Star className="w-3 h-3" /> Featured
                    </span>
                  )}
                </div>

                <h1 className="text-3xl md:text-4xl font-heading font-bold mb-3">
                  {product.name}
                </h1>

                {product.short_description && (
                  <p className="text-muted-foreground text-lg mb-4">
                    {product.short_description}
                  </p>
                )}

                {/* Rating Placeholder */}
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <span className="text-sm text-muted-foreground">(0 reviews)</span>
                </div>
              </div>

              {/* Price */}
              <div className="bg-card border border-border rounded-xl p-6">
                <div className="flex items-baseline gap-3 mb-2">
                  <span className="text-4xl font-bold text-primary">
                    ₹{product.price.toFixed(2)}
                  </span>
                  {product.compare_at_price && (
                    <span className="text-xl text-muted-foreground line-through">
                      ₹{product.compare_at_price.toFixed(2)}
                    </span>
                  )}
                </div>
                {product.compare_at_price && (
                  <span className="text-sm text-green-600 font-medium">
                    Save ₹{(product.compare_at_price - product.price).toFixed(2)} ({Math.round((1 - product.price / product.compare_at_price) * 100)}% off)
                  </span>
                )}
              </div>

              {/* Stock Status */}
              <div className="flex items-center gap-2">
                {product.track_inventory ? (
                  product.inventory_quantity > 0 ? (
                    <span className="text-green-600 font-medium flex items-center gap-2">
                      <Package className="w-5 h-5" />
                      In Stock ({product.inventory_quantity} available)
                    </span>
                  ) : (
                    <span className="text-red-600 font-medium flex items-center gap-2">
                      <Package className="w-5 h-5" />
                      Out of Stock
                    </span>
                  )
                ) : (
                  <span className="text-green-600 font-medium flex items-center gap-2">
                    <Package className="w-5 h-5" />
                    Available for Order
                  </span>
                )}
              </div>

              {/* Quantity Selector */}
              {product.track_inventory && product.inventory_quantity > 0 && (
                <div>
                  <label className="block text-sm font-medium mb-2">Quantity</label>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="p-3 rounded-lg border border-border hover:bg-muted transition"
                    >
                      <Minus className="w-5 h-5" />
                    </button>
                    <span className="w-16 text-center text-lg font-semibold">{quantity}</span>
                    <button
                      onClick={() => setQuantity(Math.min(product.inventory_quantity, quantity + 1))}
                      className="p-3 rounded-lg border border-border hover:bg-muted transition"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={handleAddToCart}
                  disabled={addingToCart || (product.track_inventory && product.inventory_quantity === 0)}
                  className="flex-1 bg-primary text-primary-foreground py-4 rounded-xl font-semibold hover:bg-primary/90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <ShoppingCart className="w-5 h-5" />
                  {addingToCart ? "Adding..." : "Add to Cart"}
                </button>
                <button
                  onClick={handleBuyNow}
                  disabled={product.track_inventory && product.inventory_quantity === 0}
                  className="flex-1 bg-secondary text-secondary-foreground py-4 rounded-xl font-semibold hover:bg-secondary/90 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Buy Now
                </button>
              </div>

              {/* Features */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-border">
                <div className="text-center">
                  <Truck className="w-8 h-8 mx-auto mb-2 text-primary" />
                  <p className="text-xs font-medium">Free Shipping</p>
                  <p className="text-xs text-muted-foreground">On orders above ₹500</p>
                </div>
                <div className="text-center">
                  <Shield className="w-8 h-8 mx-auto mb-2 text-primary" />
                  <p className="text-xs font-medium">Secure Payment</p>
                  <p className="text-xs text-muted-foreground">100% protected</p>
                </div>
                <div className="text-center">
                  <Package className="w-8 h-8 mx-auto mb-2 text-primary" />
                  <p className="text-xs font-medium">Easy Returns</p>
                  <p className="text-xs text-muted-foreground">7 days return policy</p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Tabs Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-card border border-border rounded-xl overflow-hidden mb-12"
          >
            <div className="border-b border-border">
              <div className="flex">
                <button
                  onClick={() => setActiveTab("description")}
                  className={`px-6 py-4 font-medium transition ${
                    activeTab === "description"
                      ? "text-primary border-b-2 border-primary"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Description
                </button>
                {product.installation_available && (
                  <button
                    onClick={() => setActiveTab("installation")}
                    className={`px-6 py-4 font-medium transition ${
                      activeTab === "installation"
                        ? "text-primary border-b-2 border-primary"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Installation Service
                  </button>
                )}
              </div>
            </div>

            <div className="p-6">
              {activeTab === "description" && (
                <div className="prose max-w-none">
                  <p className="text-foreground whitespace-pre-line">{product.description}</p>
                </div>
              )}

              {activeTab === "installation" && product.installation_available && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-primary/5 rounded-lg">
                    <div>
                      <h3 className="font-semibold text-lg">Professional Installation</h3>
                      <p className="text-muted-foreground">{product.installation_description}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-primary">₹{product.installation_charge.toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground">One-time charge</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* Related Products (Placeholder) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h2 className="text-2xl font-heading font-bold mb-6">Related Products</h2>
            <div className="text-center py-12 bg-card border border-border rounded-xl">
              <p className="text-muted-foreground">More products coming soon...</p>
            </div>
          </motion.div>
        </div>

      </div>
    </>
  );
};

export default ProductDetails;
