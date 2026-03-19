import { useEffect } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle, Package, Mail, ArrowRight, Home, ShoppingCart } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppFloat from "@/components/WhatsAppFloat";

const OrderSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { orderId, amount, paymentMethod } = location.state || {};

  useEffect(() => {
    // Redirect to home if no order data
    if (!orderId) {
      navigate("/");
    }
  }, [orderId, navigate]);

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
        <div className="container mx-auto px-4 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-2xl mx-auto"
          >
            {/* Success Icon */}
            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="w-32 h-32 mx-auto mb-6 bg-green-100 rounded-full flex items-center justify-center"
              >
                <CheckCircle className="w-20 h-20 text-green-600" />
              </motion.div>
              <h1 className="text-4xl md:text-5xl font-heading font-bold mb-4">
                Order Placed Successfully!
              </h1>
              <p className="text-lg text-muted-foreground">
                Thank you for your purchase
              </p>
            </div>

            {/* Order Confirmation Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-card border border-border rounded-xl p-8 mb-6 shadow-sm"
            >
              <div className="flex items-start justify-between mb-6 pb-6 border-b border-border">
                <div>
                  <h2 className="text-xl font-heading font-semibold mb-2">Order Confirmation</h2>
                  <p className="text-muted-foreground">Your order has been confirmed</p>
                </div>
                <Package className="w-8 h-8 text-primary" />
              </div>

              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Order Number:</span>
                  <span className="font-semibold font-mono">{orderId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Payment Method:</span>
                  <span className="font-medium">
                    {paymentMethod === "razorpay" ? "Online Payment" : "Cash on Delivery"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Amount:</span>
                  <span className="font-bold text-primary text-lg">₹{amount?.toFixed(2) || "0.00"}</span>
                </div>
              </div>
            </motion.div>

            {/* Next Steps */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-card border border-border rounded-xl p-6 mb-6"
            >
              <h3 className="font-heading font-semibold text-lg mb-4">What's Next?</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-primary text-xs font-bold">1</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    A confirmation email has been sent to your registered email address
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-primary text-xs font-bold">2</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    We'll send you a tracking number once your order is shipped
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-primary text-xs font-bold">3</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Estimated delivery time is 5-7 business days
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="grid grid-cols-1 sm:grid-cols-2 gap-4"
            >
              <Link
                to="/dashboard/orders"
                className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-6 py-3.5 rounded-xl font-semibold hover:bg-primary/90 transition"
              >
                <Package className="w-5 h-5" />
                Track Your Order
              </Link>
              <Link
                to="/products"
                className="inline-flex items-center justify-center gap-2 bg-secondary text-secondary-foreground px-6 py-3.5 rounded-xl font-semibold hover:bg-secondary/90 transition"
              >
                <ShoppingCart className="w-5 h-5" />
                Continue Shopping
              </Link>
            </motion.div>

            {/* Additional Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="mt-8 text-center"
            >
              <p className="text-sm text-muted-foreground mb-4">
                Need help? We're here for you!
              </p>
              <div className="flex items-center justify-center gap-4 text-sm">
                <a
                  href="mailto:support@electroobuddy.com"
                  className="flex items-center gap-2 text-primary hover:underline"
                >
                  <Mail className="w-4 h-4" />
                  support@electroobuddy.com
                </a>
              </div>
            </motion.div>
          </motion.div>
        </div>

        <Footer />
        <WhatsAppFloat />
      </div>
    </>
  );
};

export default OrderSuccess;
