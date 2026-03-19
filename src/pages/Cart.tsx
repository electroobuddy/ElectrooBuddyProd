import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { ShoppingCart, Trash2, Plus, Minus, Package, ArrowRight, Zap } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import { useCart } from "@/contexts/CartContext";

const Cart = () => {
  const navigate = useNavigate();
  const { items, updateQuantity, removeFromCart, total, clearCart } = useCart();

  const subtotal = total;
  const shipping = subtotal > 500 ? 0 : 50; // Free shipping above ₹500
  const grandTotal = subtotal + shipping;

  if (items.length === 0) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
          <div className="container mx-auto px-4 py-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-md mx-auto text-center py-12"
            >
              <div className="w-32 h-32 mx-auto mb-6 bg-muted rounded-full flex items-center justify-center">
                <ShoppingCart className="w-16 h-16 text-muted-foreground opacity-20" />
              </div>
              <h1 className="text-3xl font-heading font-bold mb-4">Your Cart is Empty</h1>
              <p className="text-muted-foreground mb-8">
                Looks like you haven't added anything to your cart yet.
              </p>
              <Link
                to="/products"
                className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-3 rounded-lg font-semibold hover:bg-primary/90 transition"
              >
                <Zap className="w-5 h-5" />
                Start Shopping
              </Link>
            </motion.div>
          </div>
        </div>
        <Footer />
        <WhatsAppFloat />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
        <div className="container mx-auto px-4 py-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-3xl md:text-4xl font-heading font-bold mb-2">Shopping Cart</h1>
            <p className="text-muted-foreground">{items.length} item(s) in your cart</p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {items.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-card border border-border rounded-xl p-6"
                >
                  <div className="flex gap-4">
                    {/* Product Image */}
                    <div className="w-24 h-24 flex-shrink-0 bg-muted rounded-lg overflow-hidden">
                      {item.product_image ? (
                        <img
                          src={item.product_image}
                          alt={item.product_name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Zap className="w-8 h-8 text-muted-foreground opacity-20" />
                        </div>
                      )}
                    </div>

                    {/* Product Details */}
                    <div className="flex-1">
                      <Link
                        to={`/products/${item.product_slug}`}
                        className="font-heading font-semibold text-lg hover:text-primary transition"
                      >
                        {item.product_name}
                      </Link>
                      <p className="text-sm text-muted-foreground mt-1">
                        Price: ₹{item.price.toFixed(2)}
                      </p>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-3 mt-3">
                        <button
                          onClick={() => updateQuantity(item.product_id, Math.max(1, item.quantity - 1))}
                          className="p-1.5 rounded-lg border border-border hover:bg-muted transition"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-12 text-center font-semibold">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                          className="p-1.5 rounded-lg border border-border hover:bg-muted transition"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Installation Service */}
                      {item.installation_charge > 0 && (
                        <div className="mt-3 flex items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            id={`installation-${item.id}`}
                            checked={item.installation_service}
                            onChange={() => {}}
                            className="rounded border-border"
                            readOnly
                          />
                          <label htmlFor={`installation-${item.id}`} className="text-muted-foreground">
                            Installation service included (+₹{item.installation_charge.toFixed(2)})
                          </label>
                        </div>
                      )}
                    </div>

                    {/* Price and Actions */}
                    <div className="text-right">
                      <p className="text-xl font-bold text-primary mb-2">
                        ₹{(item.price * item.quantity + item.installation_charge).toFixed(2)}
                      </p>
                      <button
                        onClick={() => removeFromCart(item.product_id)}
                        className="inline-flex items-center gap-1 text-red-600 hover:text-red-700 text-sm font-medium transition"
                      >
                        <Trash2 className="w-4 h-4" />
                        Remove
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}

              {/* Clear Cart Button */}
              <button
                onClick={clearCart}
                className="text-red-600 hover:text-red-700 text-sm font-medium transition flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Clear Cart
              </button>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-card border border-border rounded-xl p-6 sticky top-24"
              >
                <h2 className="text-xl font-heading font-bold mb-6">Order Summary</h2>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium">₹{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className="font-medium">
                      {shipping === 0 ? (
                        <span className="text-green-600 font-semibold">FREE</span>
                      ) : (
                        `₹${shipping.toFixed(2)}`
                      )}
                    </span>
                  </div>
                  {shipping > 0 && (
                    <p className="text-xs text-muted-foreground bg-primary/5 p-2 rounded">
                      Add ₹{(500 - subtotal).toFixed(2)} more for FREE shipping
                    </p>
                  )}
                  <div className="border-t border-border pt-3">
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total</span>
                      <span className="text-primary">₹{grandTotal.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => navigate("/checkout")}
                  className="w-full bg-primary text-primary-foreground py-3.5 rounded-xl font-semibold hover:bg-primary/90 transition flex items-center justify-center gap-2"
                >
                  Proceed to Checkout
                  <ArrowRight className="w-5 h-5" />
                </button>

                <div className="mt-6 space-y-3">
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <Package className="w-4 h-4" />
                    <span>Secure Checkout</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <Zap className="w-4 h-4" />
                    <span>Free shipping on orders above ₹500</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        <Footer />
        <WhatsAppFloat />
      </div>
    </>
  );
};

export default Cart;
