import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ShoppingCart, Star, Plus } from "lucide-react";

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
}

interface ProductCardProps {
  product: Product;
  index?: number;
}

const ProductCard = ({ product, index = 0 }: ProductCardProps) => {
  const navigate = useNavigate();
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
    // TODO: Implement cart functionality
    console.log('Added to cart:', product);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.08, duration: 0.45 }}
    >
      <Link to={`/products/${product.slug}`} className="block group h-full">
        <div className="h-full bg-card border border-border/40 rounded-xl overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col">
          {/* image */}
          <div className="aspect-square overflow-hidden bg-muted relative">
            {product.main_image_url ? (
              <img
                src={product.main_image_url}
                alt={product.name}
                loading="lazy"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <ShoppingCart size={32} className="text-muted-foreground opacity-20" />
              </div>
            )}

            {/* badges */}
            <div className="absolute top-2 left-2 flex flex-col gap-1">
              {product.is_featured && (
                <span className="bg-yellow-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5">
                  <Star size={9} className="fill-current" /> Featured
                </span>
              )}
            </div>

            {outOfStock && (
              <span className="absolute top-2 right-2 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                Out of Stock
              </span>
            )}

            {discount && (
              <span className="absolute bottom-2 right-2 bg-green-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                {discount}% OFF
              </span>
            )}
          </div>

          {/* info */}
          <div className="p-3 sm:p-4 flex flex-col flex-1">
            <h3 className="font-heading font-semibold text-sm sm:text-base line-clamp-2 leading-snug mb-2 flex-1">
              {product.name}
            </h3>

            <div className="flex items-center justify-between mt-auto gap-2">
              <div className="min-w-0 flex-1">
                <span className="text-base sm:text-lg font-bold text-primary block">
                  ₹{product.price.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </span>
                {product.compare_at_price && (
                  <span className="text-xs text-muted-foreground line-through">
                    ₹{product.compare_at_price.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </span>
                )}
              </div>
              {!outOfStock && (
                <>
                  <button
                    onClick={handleAddToCart}
                    className="flex-shrink-0 px-2.5 py-2 bg-green-600 hover:bg-green-700 text-white text-xs sm:text-sm font-semibold rounded-lg transition-colors flex items-center gap-1"
                    title="Add to Cart"
                  >
                    <Plus size={14} />
                  </button>
                  <button
                    onClick={handleBuyNow}
                    className="flex-shrink-0 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold rounded-lg transition-colors flex items-center gap-1.5"
                  >
                    <ShoppingCart size={14} /> Buy Now
                  </button>
                </>
              )}
            </div>

            {product.category && (
              <span className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded mt-2 inline-block w-fit">
                {product.category}
              </span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default ProductCard;