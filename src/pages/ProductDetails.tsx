// import { useState, useEffect } from "react";
// import { useParams, useNavigate, Link } from "react-router-dom";
// import { supabase } from "@/integrations/supabase/client";
// import { motion } from "framer-motion";
// import { 
//   ShoppingCart, 
//   Zap, 
//   Star, 
//   ChevronRight, 
//   Package, 
//   Truck, 
//   Shield,
//   ArrowLeft,
//   Plus,
//   Minus
// } from "lucide-react";

// import { toast } from "sonner";
// import { useCart } from "@/contexts/CartContext";
// import type { Json } from "@/integrations/supabase/types";

// interface Product {
//   id: string;
//   name: string;
//   slug: string;
//   description: string;
//   short_description?: string;
//   price: number;
//   compare_at_price?: number;
//   cost_per_item?: number;
//   main_image_url?: string;
//   gallery_images?: string[];
//   category?: string;
//   subcategory?: string;
//   brand?: string;
//   tags?: string[];
//   specifications?: Json;
//   is_active: boolean;
//   is_featured: boolean;
//   is_bestseller: boolean;
//   inventory_quantity: number;
//   track_inventory: boolean;
//   allow_backorder: boolean;
//   installation_available: boolean;
//   installation_charge: number;
//   installation_description?: string;
//   weight?: number;
//   weight_unit?: string;
//   length?: number;
//   width?: number;
//   height?: number;
//   dimension_unit?: string;
//   sku?: string;
//   meta_title?: string;
//   meta_description?: string;
//   sort_order?: number;
// }

// const ProductDetails = () => {
//   const { slug } = useParams<{ slug: string }>();
//   const navigate = useNavigate();
//   const { addToCart } = useCart();
//   const [product, setProduct] = useState<Product | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [quantity, setQuantity] = useState(1);
//   const [selectedImage, setSelectedImage] = useState(0);
//   const [activeTab, setActiveTab] = useState("description");
//   const [addingToCart, setAddingToCart] = useState(false);
//   const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);

//   useEffect(() => {
//     fetchProduct();
//   }, [slug]);

//   useEffect(() => {
//     if (product) {
//       fetchRelatedProducts();
//     }
//   }, [product]);

//   const fetchProduct = async () => {
//     try {
//       const { data, error } = await supabase
//         .from("products")
//         .select("*")
//         .eq("slug", slug)
//         .eq("is_active", true)
//         .single();

//       if (error) throw error;
//       setProduct(data);
//     } catch (error) {
//       console.error("Error fetching product:", error);
//       toast.error("Product not found");
//       navigate("/products");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fetchRelatedProducts = async () => {
//     try {
//       let query = supabase
//         .from("products")
//         .select("*")
//         .eq("is_active", true)
//         .neq("id", product!.id)
//         .limit(4);

//       // Prioritize same category
//       if (product?.category) {
//         query = query.eq("category", product.category);
//       }
      
//       // If not enough in same category, get from same brand
//       const { data, error } = await query;
      
//       if (error) throw error;
      
//       // If we have less than 4, fill with products from same brand
//       if (data && data.length < 4 && product?.brand) {
//         const { data: brandProducts } = await supabase
//           .from("products")
//           .select("*")
//           .eq("is_active", true)
//           .neq("id", product.id)
//           .neq("category", product.category || "")
//           .eq("brand", product.brand)
//           .limit(4 - data.length);
        
//         if (brandProducts) {
//           setRelatedProducts([...data, ...brandProducts]);
//           return;
//         }
//       }
      
//       setRelatedProducts(data || []);
//     } catch (error) {
//       console.error("Error fetching related products:", error);
//     }
//   };

//   const handleAddToCart = async () => {
//     setAddingToCart(true);
//     try {
//       if (product) {
//         addToCart(product, quantity, false);
//       }
//     } catch (error) {
//       toast.error("Failed to add to cart");
//     } finally {
//       setAddingToCart(false);
//     }
//   };

//   const handleBuyNow = async () => {
//     try {
//       if (product) {
//         // Add to cart
//         addToCart(product, quantity, false);
//         // Redirect to checkout
//         setTimeout(() => {
//           navigate("/checkout");
//         }, 500);
//       }
//     } catch (error) {
//       toast.error("Failed to proceed to checkout");
//     }
//   };

//   if (loading) {
//     return (
//       <>
        
//         <div className="min-h-screen flex items-center justify-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
//         </div>
//       </>
//     );
//   }

//   if (!product) {
//     return null;
//   }

//   const allImages = [product.main_image_url, ...(product.gallery_images || [])].filter(Boolean) as string[];

//   return (
//     <>
     
//       <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
//         <div className="container mx-auto px-4 py-8">
//           {/* Breadcrumb */}
//           <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
//             <Link to="/" className="hover:text-foreground transition">Home</Link>
//             <ChevronRight className="w-4 h-4" />
//             <Link to="/products" className="hover:text-foreground transition">Products</Link>
//             <ChevronRight className="w-4 h-4" />
//             <span className="text-foreground">{product.name}</span>
//           </div>

//           <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
//             {/* Product Images */}
//             <motion.div
//               initial={{ opacity: 0, x: -20 }}
//               animate={{ opacity: 1, x: 0 }}
//               className="space-y-4"
//             >
//               {/* Main Image */}
//               <div className="aspect-square bg-card border border-border rounded-xl overflow-hidden">
//                 {allImages.length > 0 ? (
//                   <img
//                     src={allImages[selectedImage]}
//                     alt={product.name}
//                     className="w-full h-full object-cover"
//                   />
//                 ) : (
//                   <div className="w-full h-full flex items-center justify-center bg-muted">
//                     <Zap className="w-32 h-32 text-muted-foreground opacity-20" />
//                   </div>
//                 )}
//               </div>

//               {/* Thumbnail Gallery */}
//               {allImages.length > 1 && (
//                 <div className="grid grid-cols-4 gap-2">
//                   {allImages.map((img, index) => (
//                     <button
//                       key={index}
//                       onClick={() => setSelectedImage(index)}
//                       className={`aspect-square rounded-lg border-2 overflow-hidden transition-all ${
//                         selectedImage === index
//                           ? "border-primary ring-2 ring-primary/20"
//                           : "border-border hover:border-primary/50"
//                       }`}
//                     >
//                       <img src={img} alt={`${product.name} ${index + 1}`} className="w-full h-full object-cover" />
//                     </button>
//                   ))}
//                 </div>
//               )}
//             </motion.div>

//             {/* Product Info */}
//             <motion.div
//               initial={{ opacity: 0, x: 20 }}
//               animate={{ opacity: 1, x: 0 }}
//               className="space-y-6"
//             >
//               <div>
//                 <div className="flex items-center gap-2 mb-2 flex-wrap">
//                   {product.category && (
//                     <span className="text-xs font-medium bg-primary/10 text-primary px-3 py-1 rounded-full">
//                       {product.category}
//                     </span>
//                   )}
//                   {product.subcategory && (
//                     <span className="text-xs font-medium bg-secondary/10 text-secondary px-3 py-1 rounded-full">
//                       {product.subcategory}
//                     </span>
//                   )}
//                   {product.brand && (
//                     <span className="text-xs font-medium bg-violet/10 text-violet px-3 py-1 rounded-full">
//                       {product.brand}
//                     </span>
//                   )}
//                   {product.is_featured && (
//                     <span className="text-xs font-medium bg-yellow-500/10 text-yellow-600 px-3 py-1 rounded-full flex items-center gap-1">
//                       <Star className="w-3 h-3" /> Featured
//                     </span>
//                   )}
//                   {product.is_bestseller && (
//                     <span className="text-xs font-medium bg-red-500/10 text-red-600 px-3 py-1 rounded-full flex items-center gap-1">
//                       🔥 Bestseller
//                     </span>
//                   )}
//                 </div>

//                 <h1 className="text-3xl md:text-4xl font-heading font-bold mb-3">
//                   {product.name}
//                 </h1>

//                 {product.short_description && (
//                   <p className="text-muted-foreground text-lg mb-4">
//                     {product.short_description}
//                   </p>
//                 )}

//                 {/* Rating Placeholder */}
//                 <div className="flex items-center gap-2 mb-4">
//                   <div className="flex items-center gap-0.5">
//                     {[1, 2, 3, 4, 5].map((star) => (
//                       <Star key={star} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
//                     ))}
//                   </div>
//                   <span className="text-sm text-muted-foreground">(0 reviews)</span>
//                 </div>
//               </div>

//               {/* Price */}
//               <div className="bg-card border border-border rounded-xl p-6">
//                 <div className="flex items-baseline gap-3 mb-2">
//                   <span className="text-4xl font-bold text-primary">
//                     ₹{product.price.toFixed(2)}
//                   </span>
//                   {product.compare_at_price && (
//                     <span className="text-xl text-muted-foreground line-through">
//                       ₹{product.compare_at_price.toFixed(2)}
//                     </span>
//                   )}
//                 </div>
//                 {product.compare_at_price && (
//                   <span className="text-sm text-green-600 font-medium">
//                     Save ₹{(product.compare_at_price - product.price).toFixed(2)} ({Math.round((1 - product.price / product.compare_at_price) * 100)}% off)
//                   </span>
//                 )}
//               </div>

//               {/* Stock Status */}
//               <div className="flex items-center gap-2">
//                 {product.track_inventory ? (
//                   product.inventory_quantity > 0 || product.allow_backorder ? (
//                     <span className="text-green-600 font-medium flex items-center gap-2">
//                       <Package className="w-5 h-5" />
//                       {product.allow_backorder 
//                         ? "Available for Backorder" 
//                         : `In Stock (${product.inventory_quantity} available)`}
//                     </span>
//                   ) : (
//                     <span className="text-red-600 font-medium flex items-center gap-2">
//                       <Package className="w-5 h-5" />
//                       Out of Stock
//                     </span>
//                   )
//                 ) : (
//                   <span className="text-green-600 font-medium flex items-center gap-2">
//                     <Package className="w-5 h-5" />
//                     Available for Order
//                   </span>
//                 )}
//                 {product.sku && (
//                   <span className="text-xs text-muted-foreground font-mono ml-2">SKU: {product.sku}</span>
//                 )}
//               </div>

//               {/* Quantity Selector */}
//               {(product.track_inventory && product.inventory_quantity > 0) || product.allow_backorder ? (
//                 <div>
//                   <label className="block text-sm font-medium mb-2">Quantity</label>
//                   <div className="flex items-center gap-3">
//                     <button
//                       onClick={() => setQuantity(Math.max(1, quantity - 1))}
//                       className="p-3 rounded-lg border border-border hover:bg-muted transition"
//                     >
//                       <Minus className="w-5 h-5" />
//                     </button>
//                     <span className="w-16 text-center text-lg font-semibold">{quantity}</span>
//                     <button
//                       onClick={() => setQuantity(product.track_inventory ? Math.min(product.inventory_quantity, quantity + 1) : quantity + 1)}
//                       className="p-3 rounded-lg border border-border hover:bg-muted transition"
//                     >
//                       <Plus className="w-5 h-5" />
//                     </button>
//                   </div>
//                   {product.track_inventory && (
//                     <p className="text-xs text-muted-foreground mt-2">
//                       {product.allow_backorder 
//                         ? "Backorders allowed" 
//                         : `Max ${product.inventory_quantity} per order`}
//                     </p>
//                   )}
//                 </div>
//               ) : null}

//               {/* Action Buttons */}
//               <div className="flex gap-3">
//                 <button
//                   onClick={handleAddToCart}
//                   disabled={addingToCart || (!product.allow_backorder && product.track_inventory && product.inventory_quantity === 0)}
//                   className="flex-1 bg-primary text-primary-foreground py-4 rounded-xl font-semibold hover:bg-primary/90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
//                 >
//                   <ShoppingCart className="w-5 h-5" />
//                   {addingToCart ? "Adding..." : "Add to Cart"}
//                 </button>
//                 <button
//                   onClick={handleBuyNow}
//                   disabled={!product.allow_backorder && product.track_inventory && product.inventory_quantity === 0}
//                   className="flex-1 bg-secondary text-secondary-foreground py-4 rounded-xl font-semibold hover:bg-secondary/90 transition disabled:opacity-50 disabled:cursor-not-allowed"
//                 >
//                   Buy Now
//                 </button>
//               </div>

//               {/* Features */}
//               <div className="grid grid-cols-3 gap-4 pt-6 border-t border-border">
//                 <div className="text-center">
//                   <Truck className="w-8 h-8 mx-auto mb-2 text-primary" />
//                   <p className="text-xs font-medium">Free Shipping</p>
//                   <p className="text-xs text-muted-foreground">On orders above ₹500</p>
//                 </div>
//                 <div className="text-center">
//                   <Shield className="w-8 h-8 mx-auto mb-2 text-primary" />
//                   <p className="text-xs font-medium">Secure Payment</p>
//                   <p className="text-xs text-muted-foreground">100% protected</p>
//                 </div>
//                 {product.weight && (
//                   <div className="text-center">
//                     <Shield className="w-8 h-8 mx-auto mb-2 text-primary" />
//                     <p className="text-xs font-medium">Weight</p>
//                     <p className="text-xs text-muted-foreground">{product.weight} {product.weight_unit || 'kg'}</p>
//                   </div>
//                 )}
//                 {product.length && product.width && product.height && (
//                   <div className="text-center">
//                     <Package className="w-8 h-8 mx-auto mb-2 text-primary" />
//                     <p className="text-xs font-medium">Dimensions</p>
//                     <p className="text-xs text-muted-foreground">
//                       {product.length} × {product.width} × {product.height} {product.dimension_unit || 'cm'}
//                     </p>
//                   </div>
//                 )}
//               </div>
//             </motion.div>
//           </div>

//           {/* Tabs Section */}
//           <motion.div
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ delay: 0.2 }}
//             className="bg-card border border-border rounded-xl overflow-hidden mb-12"
//           >
//             <div className="border-b border-border">
//               <div className="flex flex-wrap">
//                 <button
//                   onClick={() => setActiveTab("description")}
//                   className={`px-6 py-4 font-medium transition ${
//                     activeTab === "description"
//                       ? "text-primary border-b-2 border-primary"
//                       : "text-muted-foreground hover:text-foreground"
//                   }`}
//                 >
//                   Description
//                 </button>
//                 {product.installation_available && (
//                   <button
//                     onClick={() => setActiveTab("installation")}
//                     className={`px-6 py-4 font-medium transition ${
//                       activeTab === "installation"
//                         ? "text-primary border-b-2 border-primary"
//                         : "text-muted-foreground hover:text-foreground"
//                     }`}
//                   >
//                     Installation Service
//                   </button>
//                 )}
//                 {product.specifications && Object.keys(product.specifications).length > 0 && (
//                   <button
//                     onClick={() => setActiveTab("specifications")}
//                     className={`px-6 py-4 font-medium transition ${
//                       activeTab === "specifications"
//                         ? "text-primary border-b-2 border-primary"
//                         : "text-muted-foreground hover:text-foreground"
//                     }`}
//                   >
//                     Specifications
//                   </button>
//                 )}
//               </div>
//             </div>

//             <div className="p-6">
//               {activeTab === "description" && (
//                 <div className="prose max-w-none">
//                   <h3 className="text-xl font-semibold mb-4">Product Details</h3>
//                   <p className="text-foreground whitespace-pre-line">{product.description}</p>
                  
//                   {product.short_description && (
//                     <div className="mt-6 p-4 bg-muted rounded-lg">
//                       <h4 className="font-semibold mb-2">Quick Summary</h4>
//                       <p className="text-muted-foreground">{product.short_description}</p>
//                     </div>
//                   )}
//                 </div>
//               )}

//               {activeTab === "specifications" && product.specifications && (
//                 <div className="space-y-4">
//                   <h3 className="text-xl font-semibold">Technical Specifications</h3>
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                     {Object.entries(product.specifications).map(([key, value]) => (
//                       <div key={key} className="flex justify-between p-3 bg-muted rounded-lg">
//                         <span className="font-medium text-muted-foreground capitalize">{key.replace(/_/g, ' ')}</span>
//                         <span className="text-foreground">{String(value)}</span>
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               )}

//               {activeTab === "installation" && product.installation_available && (
//                 <div className="space-y-4">
//                   <div className="flex items-center justify-between p-4 bg-primary/5 rounded-lg">
//                     <div>
//                       <h3 className="font-semibold text-lg">Professional Installation</h3>
//                       <p className="text-muted-foreground">{product.installation_description}</p>
//                     </div>
//                     <div className="text-right">
//                       <p className="text-2xl font-bold text-primary">₹{product.installation_charge.toFixed(2)}</p>
//                       <p className="text-xs text-muted-foreground">One-time charge</p>
//                     </div>
//                   </div>
//                 </div>
//               )}
//             </div>
//           </motion.div>

//           {/* Related Products */}
//           <motion.div
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ delay: 0.3 }}
//           >
//             <h2 className="text-2xl font-heading font-bold mb-6">Related Products</h2>
//             {relatedProducts.length > 0 ? (
//               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
//                 {relatedProducts.map((relatedProduct) => (
//                   <Link
//                     key={relatedProduct.id}
//                     to={`/products/${relatedProduct.slug}`}
//                     className="group"
//                   >
//                     <div className="bg-card border border-border rounded-xl overflow-hidden hover:shadow-lg transition-all">
//                       <div className="aspect-square bg-muted relative overflow-hidden">
//                         {relatedProduct.main_image_url ? (
//                           <img
//                             src={relatedProduct.main_image_url}
//                             alt={relatedProduct.name}
//                             className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
//                           />
//                         ) : (
//                           <div className="w-full h-full flex items-center justify-center">
//                             <Zap className="w-16 h-16 text-muted-foreground opacity-20" />
//                           </div>
//                         )}
//                         <div className="absolute top-2 left-2 flex flex-col gap-1">
//                           {relatedProduct.is_featured && (
//                             <span className="text-xs bg-yellow-500/90 text-white px-2 py-0.5 rounded-full flex items-center gap-0.5">
//                               <Star className="w-2.5 h-2.5" /> Featured
//                             </span>
//                           )}
//                           {relatedProduct.is_bestseller && (
//                             <span className="text-xs bg-red-500/90 text-white px-2 py-0.5 rounded-full">
//                               🔥
//                             </span>
//                           )}
//                         </div>
//                       </div>
//                       <div className="p-3">
//                         <h3 className="font-medium text-sm line-clamp-2 mb-2">{relatedProduct.name}</h3>
//                         <div className="flex items-center justify-between">
//                           <div>
//                             <span className="text-lg font-bold text-primary">₹{relatedProduct.price.toFixed(2)}</span>
//                             {relatedProduct.compare_at_price && (
//                               <span className="text-xs text-muted-foreground line-through ml-1">
//                                 ₹{relatedProduct.compare_at_price.toFixed(2)}
//                               </span>
//                             )}
//                           </div>
//                         </div>
//                         {relatedProduct.track_inventory && (
//                           <p className={`text-xs mt-1 ${relatedProduct.inventory_quantity > 0 ? 'text-green-600' : 'text-red-500'}`}>
//                             {relatedProduct.inventory_quantity > 0 ? `${relatedProduct.inventory_quantity} left` : 'Out of stock'}
//                           </p>
//                         )}
//                       </div>
//                     </div>
//                   </Link>
//                 ))}
//               </div>
//             ) : (
//               <div className="text-center py-12 bg-card border border-border rounded-xl">
//                 <p className="text-muted-foreground">No related products found</p>
//                 <Link to="/products" className="text-primary hover:underline mt-2 inline-block">
//                   Browse all products
//                 </Link>
//               </div>
//             )}
//           </motion.div>
//         </div>

//       </div>
//     </>
//   );
// };

// export default ProductDetails;

import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingCart,
  Zap,
  Star,
  ChevronRight,
  Package,
  Truck,
  Shield,
  Plus,
  Minus,
  Heart,
  Share2,
  Copy,
  ZoomIn,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { useCart } from "@/contexts/CartContext";
import type { Json } from "@/integrations/supabase/types";

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  short_description?: string;
  price: number;
  compare_at_price?: number;
  cost_per_item?: number;
  main_image_url?: string;
  gallery_images?: string[];
  category?: string;
  subcategory?: string;
  brand?: string;
  tags?: string[];
  specifications?: Json;
  is_active: boolean;
  is_featured: boolean;
  is_bestseller: boolean;
  inventory_quantity: number;
  track_inventory: boolean;
  allow_backorder: boolean;
  installation_available: boolean;
  installation_charge: number;
  installation_description?: string;
  weight?: number;
  weight_unit?: string;
  length?: number;
  width?: number;
  height?: number;
  dimension_unit?: string;
  sku?: string;
  meta_title?: string;
  meta_description?: string;
}

/* ─── skeleton ──────────────────────────────────────────────── */
const Skeleton = () => (
  <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="aspect-square bg-muted rounded-xl animate-pulse" />
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className={`h-${i === 1 ? 10 : 4} bg-muted rounded animate-pulse w-${i % 2 === 0 ? "3/4" : "full"}`} />
          ))}
        </div>
      </div>
    </div>
  </div>
);

/* ─── lightbox ──────────────────────────────────────────────── */
const Lightbox = ({
  images,
  index,
  onClose,
}: {
  images: string[];
  index: number;
  onClose: () => void;
}) => {
  const [current, setCurrent] = useState(index);
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") setCurrent((c) => (c + 1) % images.length);
      if (e.key === "ArrowLeft") setCurrent((c) => (c - 1 + images.length) % images.length);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [images, onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
      onClick={onClose}
      role="dialog"
      aria-label="Image lightbox"
    >
      <button
        className="absolute top-4 right-4 text-white/70 hover:text-white text-2xl"
        onClick={onClose}
        aria-label="Close lightbox"
      >
        ✕
      </button>
      <img
        src={images[current]}
        alt={`Image ${current + 1}`}
        className="max-h-[90vh] max-w-[90vw] object-contain rounded-lg"
        onClick={(e) => e.stopPropagation()}
      />
      {images.length > 1 && (
        <div className="absolute bottom-6 flex gap-2">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={(e) => { e.stopPropagation(); setCurrent(i); }}
              className={`w-2 h-2 rounded-full transition ${i === current ? "bg-white" : "bg-white/40"}`}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
};

/* ─── main component ─────────────────────────────────────────── */
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
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [wishlisted, setWishlisted] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  /* ── fetch ── */
  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    setProduct(null);

    supabase
      .from("products")
      .select("*")
      .eq("slug", slug)
      .eq("is_active", true)
      .single()
      .then(({ data, error }) => {
        if (error || !data) {
          toast.error("Product not found");
          navigate("/products");
          return;
        }
        setProduct(data);
        setLoading(false);

        /* SEO */
        document.title = data.meta_title || `${data.name} | Electrobuddy`;
        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc) metaDesc.setAttribute("content", data.meta_description || data.short_description || "");
      });
  }, [slug, navigate]);

  useEffect(() => {
    if (!product) return;

    let query = supabase
      .from("products")
      .select("*")
      .eq("is_active", true)
      .neq("id", product.id)
      .limit(4);

    if (product.category) query = query.eq("category", product.category);

    query.then(async ({ data }) => {
      if (data && data.length < 4 && product.brand) {
        const { data: extra } = await supabase
          .from("products")
          .select("*")
          .eq("is_active", true)
          .neq("id", product.id)
          .neq("category", product.category || "")
          .eq("brand", product.brand)
          .limit(4 - (data?.length ?? 0));
        setRelatedProducts([...(data ?? []), ...(extra ?? [])]);
      } else {
        setRelatedProducts(data ?? []);
      }
    });
  }, [product]);

  /* ── actions ── */
  const handleAddToCart = async () => {
    if (!product) return;
    setAddingToCart(true);
    try {
      addToCart(product, quantity, false);
      toast.success(`${product.name} added to cart`);
    } catch {
      toast.error("Failed to add to cart");
    } finally {
      setAddingToCart(false);
    }
  };

  const handleBuyNow = () => {
    if (!product) return;
    addToCart(product, quantity, false);
    setTimeout(() => navigate("/checkout"), 300);
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: product?.name, url });
      } catch {}
    } else {
      navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("Link copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const maxQty = product?.track_inventory ? product.inventory_quantity : 999;
  const canAddToCart =
    !product?.track_inventory ||
    product.inventory_quantity > 0 ||
    product.allow_backorder;

  const discount =
    product?.compare_at_price && product.compare_at_price > product.price
      ? Math.round((1 - product.price / product.compare_at_price) * 100)
      : null;

  if (loading) return <Skeleton />;
  if (!product) return null;

  const allImages = [product.main_image_url, ...(product.gallery_images ?? [])].filter(
    Boolean
  ) as string[];

  /* ── structured data ── */
  const jsonLd = {
    "@context": "https://schema.org/",
    "@type": "Product",
    name: product.name,
    description: product.short_description || product.description,
    sku: product.sku,
    brand: product.brand ? { "@type": "Brand", name: product.brand } : undefined,
    image: allImages,
    offers: {
      "@type": "Offer",
      price: product.price,
      priceCurrency: "INR",
      availability: canAddToCart
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
    },
  };

  return (
    <>
      {/* structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <AnimatePresence>
        {lightboxOpen && (
          <Lightbox images={allImages} index={selectedImage} onClose={() => setLightboxOpen(false)} />
        )}
      </AnimatePresence>

      <div className="product-details-page bg-gray-50 dark:bg-gray-900 min-h-screen">
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');

          .product-details-page {
            font-family: 'Poppins', sans-serif;
          }

          .product-details-page h1,
          .product-details-page h2,
          .product-details-page h3,
          .product-details-page h4,
          .product-details-page h5,
          .product-details-page h6 {
            font-weight: 700;
          }
        `}</style>
        <div className=" px-4 py-8">
          {/* breadcrumb */}
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
            <Link to="/" className="hover:text-foreground transition">Home</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link to="/products" className="hover:text-foreground transition">Products</Link>
            {product.category && (
              <>
                <ChevronRight className="w-3.5 h-3.5" />
                <Link
                  to={`/products?category=${encodeURIComponent(product.category)}`}
                  className="hover:text-foreground transition"
                >
                  {product.category}
                </Link>
              </>
            )}
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-foreground truncate max-w-[200px]">{product.name}</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-14">
            {/* ── Images ── */}
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-3">
              <div
                className="aspect-square bg-card border border-border rounded-xl overflow-hidden relative group cursor-zoom-in"
                onClick={() => allImages.length > 0 && setLightboxOpen(true)}
              >
                {allImages.length > 0 ? (
                  <>
                    <img
                      src={allImages[selectedImage]}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition flex items-center justify-center">
                      <ZoomIn className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition drop-shadow-lg" />
                    </div>
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-muted">
                    <Zap className="w-24 h-24 text-muted-foreground opacity-10" />
                  </div>
                )}
              </div>

              {allImages.length > 1 && (
                <div className="grid grid-cols-5 gap-2">
                  {allImages.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedImage(i)}
                      className={`aspect-square rounded-lg border-2 overflow-hidden transition-all ${
                        selectedImage === i
                          ? "border-primary ring-2 ring-primary/20"
                          : "border-border hover:border-primary/50"
                      }`}
                      aria-label={`Image ${i + 1}`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </motion.div>

            {/* ── Info ── */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
              {/* badges */}
              <div className="flex items-center gap-2 flex-wrap">
                {product.category && (
                  <span className="text-xs font-medium bg-primary/10 text-primary px-3 py-1 rounded-full">
                    {product.category}
                  </span>
                )}
                {product.brand && (
                  <span className="text-xs font-medium bg-muted text-muted-foreground px-3 py-1 rounded-full">
                    {product.brand}
                  </span>
                )}
                {product.is_featured && (
                  <span className="text-xs font-medium bg-blue-500/10 text-blue-600 px-3 py-1 rounded-full flex items-center gap-1">
                    <Star className="w-3 h-3 fill-current" /> Featured
                  </span>
                )}
                {product.is_bestseller && (
                  <span className="text-xs font-medium bg-red-500/10 text-red-600 px-3 py-1 rounded-full">
                    🔥 Bestseller
                  </span>
                )}
              </div>

              {/* title + actions */}
              <div className="flex items-start justify-between gap-4">
                <h1 className="text-3xl font-heading font-bold leading-tight">{product.name}</h1>
                <div className="flex gap-2 flex-shrink-0 mt-1">
                  <button
                    onClick={() => setWishlisted((v) => !v)}
                    className={`p-2 rounded-lg border transition ${
                      wishlisted
                        ? "border-red-300 bg-red-50 text-red-500"
                        : "border-border hover:bg-muted text-muted-foreground"
                    }`}
                    aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
                    aria-pressed={wishlisted}
                  >
                    <Heart className={`w-4 h-4 ${wishlisted ? "fill-current" : ""}`} />
                  </button>
                  <button
                    onClick={handleShare}
                    className="p-2 rounded-lg border border-border hover:bg-muted text-muted-foreground transition"
                    aria-label="Share product"
                  >
                    {copied ? <Copy className="w-4 h-4 text-green-500" /> : <Share2 className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {product.short_description && (
                <p className="text-muted-foreground leading-relaxed">{product.short_description}</p>
              )}

              {product.sku && (
                <p className="text-xs text-muted-foreground font-mono">SKU: {product.sku}</p>
              )}

              {/* price card */}
              <div className="bg-card border border-border rounded-xl p-5">
                <div className="flex items-baseline gap-3">
                  <span className="text-4xl font-bold text-primary">
                    ₹{product.price.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </span>
                  {product.compare_at_price && (
                    <span className="text-xl text-muted-foreground line-through">
                      ₹{product.compare_at_price.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </span>
                  )}
                </div>
                {discount && (
                  <p className="text-sm text-green-600 font-medium mt-1">
                    You save ₹{(product.compare_at_price! - product.price).toLocaleString("en-IN", { minimumFractionDigits: 2 })} ({discount}% off)
                  </p>
                )}
              </div>

              {/* stock */}
              <div className="flex items-center gap-2 text-sm">
                {product.track_inventory ? (
                  product.inventory_quantity > 0 ? (
                    <span className="flex items-center gap-1.5 text-green-600 font-medium">
                      <Package className="w-4 h-4" />
                      {product.inventory_quantity <= 5
                        ? `Only ${product.inventory_quantity} left in stock!`
                        : `In Stock (${product.inventory_quantity} available)`}
                    </span>
                  ) : product.allow_backorder ? (
                    <span className="flex items-center gap-1.5 text-blue-600 font-medium">
                      <Package className="w-4 h-4" />
                      Available for Backorder
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 text-red-600 font-medium">
                      <AlertCircle className="w-4 h-4" />
                      Out of Stock
                    </span>
                  )
                ) : (
                  <span className="flex items-center gap-1.5 text-green-600 font-medium">
                    <Package className="w-4 h-4" />
                    Available to Order
                  </span>
                )}
              </div>

              {/* qty */}
              {canAddToCart && (
                <div>
                  <label className="text-sm font-medium mb-2 block">Quantity</label>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="w-10 h-10 rounded-lg border border-border hover:bg-muted transition flex items-center justify-center"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-12 text-center text-lg font-semibold" aria-live="polite">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity((q) => Math.min(maxQty, q + 1))}
                      disabled={quantity >= maxQty}
                      className="w-10 h-10 rounded-lg border border-border hover:bg-muted transition flex items-center justify-center disabled:opacity-40"
                      aria-label="Increase quantity"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                    {product.track_inventory && (
                      <span className="text-xs text-muted-foreground">
                        {product.allow_backorder ? "Backorders allowed" : `Max ${maxQty}`}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* CTA */}
              <div className="flex gap-3">
                <button
                  onClick={handleAddToCart}
                  disabled={addingToCart || !canAddToCart}
                  className="flex-1 bg-primary text-primary-foreground py-4 rounded-xl font-semibold hover:bg-primary/90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <ShoppingCart className="w-5 h-5" />
                  {addingToCart ? "Adding…" : "Add to Cart"}
                </button>
                <button
                  onClick={handleBuyNow}
                  disabled={!canAddToCart}
                  className="flex-1 bg-secondary text-secondary-foreground py-4 rounded-xl font-semibold hover:bg-secondary/90 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Buy Now
                </button>
              </div>

              {/* trust badges */}
              <div className="grid grid-cols-3 gap-3 pt-4 border-t border-border">
                <div className="text-center">
                  <Truck className="w-6 h-6 mx-auto mb-1.5 text-primary" />
                  <p className="text-xs font-medium">Free Shipping</p>
                  <p className="text-[10px] text-muted-foreground">Orders above ₹500</p>
                </div>
                <div className="text-center">
                  <Shield className="w-6 h-6 mx-auto mb-1.5 text-primary" />
                  <p className="text-xs font-medium">Secure Payment</p>
                  <p className="text-[10px] text-muted-foreground">100% protected</p>
                </div>
                <div className="text-center">
                  <Package className="w-6 h-6 mx-auto mb-1.5 text-primary" />
                  <p className="text-xs font-medium">Easy Returns</p>
                  <p className="text-[10px] text-muted-foreground">7-day policy</p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* ── Tabs ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-card border border-border rounded-xl overflow-hidden mb-14"
          >
            <div className="border-b border-border overflow-x-auto">
              <div className="flex">
                {["description", product.installation_available ? "installation" : null, product.specifications && Object.keys(product.specifications).length > 0 ? "specifications" : null]
                  .filter(Boolean)
                  .map((tab) => (
                    <button
                      key={tab!}
                      onClick={() => setActiveTab(tab!)}
                      className={`px-6 py-4 font-medium whitespace-nowrap transition text-sm ${
                        activeTab === tab
                          ? "text-primary border-b-2 border-primary"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {tab === "description" ? "Description" : tab === "installation" ? "Installation" : "Specifications"}
                    </button>
                  ))}
              </div>
            </div>

            <div className="p-6">
              {activeTab === "description" && (
                <div className="prose prose-sm max-w-none">
                  <h3 className="text-lg font-semibold mb-3">Product Details</h3>
                  <p className="text-foreground whitespace-pre-line leading-relaxed">{product.description}</p>
                  {product.tags && product.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-6">
                      {product.tags.map((tag) => (
                        <span key={tag} className="text-xs bg-muted text-muted-foreground px-2.5 py-1 rounded-full">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === "specifications" && product.specifications && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">Technical Specifications</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {Object.entries(product.specifications as Record<string, unknown>).map(([key, value]) => (
                      <div key={key} className="flex justify-between p-3 bg-muted/50 rounded-lg text-sm">
                        <span className="font-medium text-muted-foreground capitalize">{key.replace(/_/g, " ")}</span>
                        <span>{String(value)}</span>
                      </div>
                    ))}
                  </div>
                  {/* physical specs */}
                  {(product.weight || (product.length && product.width && product.height)) && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                      {product.weight && (
                        <div className="flex justify-between p-3 bg-muted/50 rounded-lg text-sm">
                          <span className="font-medium text-muted-foreground">Weight</span>
                          <span>{product.weight} {product.weight_unit || "kg"}</span>
                        </div>
                      )}
                      {product.length && product.width && product.height && (
                        <div className="flex justify-between p-3 bg-muted/50 rounded-lg text-sm">
                          <span className="font-medium text-muted-foreground">Dimensions (L×W×H)</span>
                          <span>{product.length}×{product.width}×{product.height} {product.dimension_unit || "cm"}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {activeTab === "installation" && product.installation_available && (
                <div className="flex flex-col sm:flex-row items-start gap-6 p-5 bg-primary/5 rounded-xl">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-1">Professional Installation Service</h3>
                    <p className="text-muted-foreground text-sm">{product.installation_description}</p>
                  </div>
                  <div className="text-left sm:text-right flex-shrink-0">
                    <p className="text-2xl font-bold text-primary">₹{product.installation_charge.toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground">One-time charge</p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* ── Related Products ── */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-2xl font-heading font-bold">Related Products</h2>
              {product.category && (
                <Link
                  to={`/products?category=${encodeURIComponent(product.category)}`}
                  className="text-sm text-primary hover:underline"
                >
                  View all →
                </Link>
              )}
            </div>

            {relatedProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {relatedProducts.map((rp) => (
                  <Link
                    key={rp.id}
                    to={`/products/${rp.slug}`}
                    className="group bg-card border border-border rounded-xl overflow-hidden hover:shadow-md transition-all"
                  >
                    <div className="aspect-square bg-muted relative overflow-hidden">
                      {rp.main_image_url ? (
                        <img
                          src={rp.main_image_url}
                          alt={rp.name}
                          loading="lazy"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Zap className="w-12 h-12 text-muted-foreground opacity-10" />
                        </div>
                      )}
                    </div>
                    <div className="p-3">
                      <h3 className="font-medium text-sm line-clamp-2 mb-1.5 leading-snug">{rp.name}</h3>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-base font-bold text-primary">
                          ₹{rp.price.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                        </span>
                        {rp.compare_at_price && (
                          <span className="text-xs text-muted-foreground line-through">
                            ₹{rp.compare_at_price.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                          </span>
                        )}
                      </div>
                      {rp.track_inventory && (
                        <p className={`text-[10px] mt-1 font-medium ${rp.inventory_quantity > 0 ? "text-green-600" : "text-red-500"}`}>
                          {rp.inventory_quantity > 0 ? `${rp.inventory_quantity} in stock` : "Out of stock"}
                        </p>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 bg-card border border-border rounded-xl">
                <p className="text-muted-foreground text-sm">No related products found</p>
                <Link to="/products" className="text-primary hover:underline text-sm mt-2 inline-block">
                  Browse all products →
                </Link>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default ProductDetails;