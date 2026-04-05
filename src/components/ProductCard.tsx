import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ShoppingCart, Star, Plus, Check } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  compare_at_price?: number;
  main_image_url?: string;
  is_featured?: boolean;
  track_inventory?: boolean;
  inventory_quantity?: number;
  category?: string;
  short_description?: string;
}

interface ProductCardProps {
  product: Product;
  index?: number;
}

const ProductCard = ({ product, index = 0 }: ProductCardProps) => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);

  const discount =
    product.compare_at_price && product.compare_at_price > product.price
      ? Math.round((1 - product.price / product.compare_at_price) * 100)
      : null;

  const outOfStock = product.track_inventory && product.inventory_quantity === 0;

  const handleBuyNow = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/products/${product.slug}`);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (outOfStock) return;
    try {
      addToCart(product, 1, false);
      toast.success(`${product.name} added to cart`);
      setAdded(true);
      setTimeout(() => setAdded(false), 1500);
    } catch {
      toast.error("Failed to add to cart");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: Math.min(index * 0.06, 0.3), duration: 0.4 }}
      className="h-full w-full"
    >
      <Link to={`/products/${product.slug}`} className="block group h-full">
        <div className="h-full bg-card border border-border/40 rounded-xl overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col">

          {/* ── Image ── */}
          <div className="aspect-square overflow-hidden bg-muted relative flex-shrink-0">
            {product.main_image_url ? (
              <img
                src={product.main_image_url}
                alt={product.name}
                loading="lazy"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <ShoppingCart size={24} className="w-6 h-6 xs:w-7 xs:h-7 sm:w-8 sm:h-8 text-muted-foreground opacity-20" />
              </div>
            )}

            {/* Top-left badges */}
            <div className="absolute top-1 left-1 xs:top-1.5 xs:left-1.5 sm:top-2 sm:left-2 flex flex-col gap-0.5 xs:gap-1">
              {product.is_featured && (
                <span className="bg-yellow-500 text-white text-[8px] xs:text-[9px] sm:text-[10px] font-bold px-1.5 xs:px-2 py-0.5 xs:py-1 rounded-full flex items-center gap-0.5 shadow-sm">
                  <Star size={7} className="w-2 h-2 xs:w-2.5 xs:h-2.5 sm:w-3 sm:h-3 fill-current" />
                  <span className="hidden xs:inline">Featured</span>
                  <span className="xs:hidden">★</span>
                </span>
              )}
              {discount && (
                <span className="bg-green-600 text-white text-[8px] xs:text-[9px] sm:text-[10px] font-bold px-1.5 xs:px-2 py-0.5 xs:py-1 rounded-full shadow-sm">
                  {discount}% OFF
                </span>
              )}
            </div>

            {/* Out of stock overlay */}
            {outOfStock && (
              <div className="absolute inset-0 bg-background/60 backdrop-blur-[1px] flex items-center justify-center">
                <span className="bg-red-500 text-white text-[9px] xs:text-[10px] sm:text-xs font-bold px-2 xs:px-2.5 sm:px-3 py-0.5 xs:py-1 sm:py-1.5 rounded-full shadow-md">
                  Out of Stock
                </span>
              </div>
            )}
          </div>

          {/* ── Info ── */}
          <div className="p-2.5 xs:p-3 sm:p-4 flex flex-col flex-1 gap-1.5 sm:gap-2">

            {/* Name */}
            <h3 className="font-semibold text-[11px] xs:text-xs sm:text-sm md:text-base line-clamp-2 leading-snug flex-1 text-foreground">
              {product.name}
            </h3>

            {/* Category tag */}
            {product.category && (
              <span className="text-[8px] xs:text-[9px] sm:text-[10px] text-muted-foreground bg-muted px-1.5 xs:px-2 py-0.5 rounded inline-block w-fit">
                {product.category}
              </span>
            )}

            {/* Price */}
            <div className="flex items-baseline gap-1 xs:gap-1.5 sm:gap-2 flex-wrap">
              <span className="text-xs xs:text-sm sm:text-base md:text-lg font-bold text-primary">
                ₹{product.price.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </span>
              {product.compare_at_price && (
                <span className="text-[9px] xs:text-[10px] sm:text-xs text-muted-foreground line-through">
                  ₹{product.compare_at_price.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </span>
              )}
            </div>

            {/* ── Buttons ── */}
            {!outOfStock ? (
              <div className="flex gap-1 xs:gap-1.5 sm:gap-2 mt-auto pt-1.5 xs:pt-2">
                {/* Add to Cart */}
                <button
                  onClick={handleAddToCart}
                  className={`flex-1 flex items-center justify-center gap-1 py-1.5 xs:py-2 sm:py-2.5 rounded-lg text-[9px] xs:text-[10px] sm:text-xs font-semibold transition-all duration-200 min-h-[36px] xs:min-h-[40px] ${
                    added
                      ? "bg-green-500 text-white"
                      : "bg-muted hover:bg-green-600 hover:text-white text-foreground border border-border"
                  }`}
                  title="Add to Cart"
                >
                  {added ? (
                    <>
                      <Check size={10} className="w-2.5 h-2.5 xs:w-3 xs:h-3 sm:w-3.5 sm:h-3.5" /> 
                      <span className="hidden xs:inline">Added</span>
                      <span className="xs:hidden">✓</span>
                    </>
                  ) : (
                    <>
                      <Plus size={10} className="w-2.5 h-2.5 xs:w-3 xs:h-3 sm:w-3.5 sm:h-3.5" /> 
                      <span className="hidden xs:inline">Add to Cart</span>
                      <span className="xs:hidden">Cart</span>
                    </>
                  )}
                </button>

                {/* Buy Now */}
                <button
                  onClick={handleBuyNow}
                  className="flex-1 flex items-center justify-center gap-1 py-1.5 xs:py-2 sm:py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[9px] xs:text-[10px] sm:text-xs font-semibold transition-colors min-h-[36px] xs:min-h-[40px]"
                >
                  <ShoppingCart size={10} className="w-2.5 h-2.5 xs:w-3 xs:h-3 sm:w-3.5 sm:h-3.5" />
                  <span className="hidden xs:inline">Buy Now</span>
                  <span className="xs:hidden">Buy</span>
                </button>
              </div>
            ) : (
              <div className="mt-auto pt-1.5 xs:pt-2">
                <div className="w-full py-1.5 xs:py-2 sm:py-2.5 bg-muted text-muted-foreground rounded-lg text-[9px] xs:text-[10px] sm:text-xs font-semibold text-center min-h-[36px] xs:min-h-[40px] flex items-center justify-center">
                  Out of Stock
                </div>
              </div>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default ProductCard;