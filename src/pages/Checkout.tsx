import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { CreditCard, MapPin, User, Phone, Mail, Package, Truck, CheckCircle, ArrowLeft, Lock, Zap } from "lucide-react";
import { useCart } from "@/contexts/CartContext";

const Checkout = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { items, total, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"razorpay" | "cod">("razorpay");

  const [shippingInfo, setShippingInfo] = useState({
    full_name: "",
    email: user?.email || "",
    phone: "",
    address_line1: "",
    address_line2: "",
    city: "",
    state: "",
    postal_code: "",
    landmark: "",
  });

  const shipping = total > 500 ? 0 : 50;
  const grandTotal = total + shipping;

  if (items.length === 0) {
    return (
      <>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Your cart is empty</h1>
            <Link to="/products" className="text-primary hover:underline">
              Continue Shopping
            </Link>
          </div>
        </div>
      </>
    );
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setShippingInfo((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    const requiredFields = ["full_name", "email", "phone", "address_line1", "city", "state", "postal_code"];
    for (const field of requiredFields) {
      if (!shippingInfo[field as keyof typeof shippingInfo]) {
        toast.error(`Please fill in ${field.replace("_", " ")}`);
        return false;
      }
    }
    if (!/^\d{6}$/.test(shippingInfo.postal_code)) {
      toast.error("Please enter a valid 6-digit PIN code");
      return false;
    }
    if (!/^[6-9]\d{9}$/.test(shippingInfo.phone)) {
      toast.error("Please enter a valid 10-digit mobile number");
      return false;
    }
    return true;
  };

  const createOrder = async () => {
    try {
      const orderNumber = `ORD${Date.now()}`;
      
      const orderData = {
        order_number: orderNumber,
        user_id: user?.id,
        status: "pending",
        payment_status: paymentMethod === "cod" ? "pending" : "pending",
        fulfillment_status: "pending",
        subtotal: total,
        shipping_charge: shipping,
        installation_total: items.reduce((sum, item) => sum + item.installation_charge, 0),
        tax_amount: 0, // Can be calculated if needed
        discount_amount: 0, // Can be calculated if needed
        total_amount: grandTotal,
        payment_method: paymentMethod,
        shipping_address_data: shippingInfo as any,
        customer_notes: "",
        ordered_at: new Date().toISOString(),
      };

      const { data, error } = await supabase.from("orders").insert([orderData]).select();
      if (error) throw error;

      return { orderId: data[0].id, orderNumber, amount: grandTotal };
    } catch (error) {
      console.error("Error creating order:", error);
      throw error;
    }
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleRazorpayPayment = async (orderNumber: string, amount: number) => {
    const loaded = await loadRazorpayScript();
    if (!loaded) {
      toast.error("Failed to load payment gateway");
      return false;
    }

    // For test mode without backend, we'll create a simple payment request
    // In production, you should create a Razorpay order from backend first
    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount: Math.round(amount * 100), // Amount in paise
      currency: "INR",
      name: "Electroobuddy",
      description: `Order Payment - ${orderNumber}`,
      handler: async function (response: any) {
        try {
          // Update order with payment details
          const { error } = await supabase
            .from("orders")
            .update({
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
              payment_status: "paid",
              status: "confirmed",
              confirmed_at: new Date().toISOString(),
            })
            .eq("order_number", orderNumber);

          if (error) throw error;

          toast.success("Payment successful!");
          return true;
        } catch (error) {
          console.error("Error updating payment:", error);
          toast.error("Payment verification failed");
          return false;
        }
      },
      prefill: {
        name: shippingInfo.full_name,
        email: shippingInfo.email,
        contact: shippingInfo.phone,
      },
      theme: {
        color: "#3b82f6",
      },
      modal: {
        ondismiss: () => {
          toast.error("Payment cancelled by user");
        },
      },
    };

    try {
      const rzp = new (window as any).Razorpay(options);
      rzp.on("payment.failed", function (response: any) {
        toast.error(`Payment failed: ${response.error.description}`);
      });
      rzp.open();
      return true;
    } catch (error) {
      console.error("Razorpay error:", error);
      toast.error("Payment initialization failed");
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);

    try {
      // Create order in database
      const { orderId, orderNumber, amount } = await createOrder();

      if (paymentMethod === "razorpay") {
        // Process Razorpay payment (without backend order for test mode)
        const paymentSuccess = await handleRazorpayPayment(orderNumber, amount);
        if (!paymentSuccess) {
          setLoading(false);
          return;
        }
      } else {
        // COD - Order stays as pending payment
        toast.success("Order placed successfully! Pay when you receive.");
      }

      // Clear cart and redirect to success page
      clearCart();
      navigate("/order-success", { 
        state: { 
          orderId: orderNumber, 
          amount: grandTotal,
          paymentMethod 
        } 
      });
      
    } catch (error) {
      console.error("Checkout error:", error);
      toast.error("Failed to place order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
        <div className="container mx-auto px-4 py-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4 transition"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
            <h1 className="text-3xl md:text-4xl font-heading font-bold">Checkout</h1>
            <p className="text-muted-foreground mt-1">Complete your order</p>
          </motion.div>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Checkout Form */}
              <div className="lg:col-span-2 space-y-6">
                {/* Contact Information */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-card border border-border rounded-xl p-6"
                >
                  <h2 className="text-xl font-heading font-semibold mb-4 flex items-center gap-2">
                    <Mail className="w-5 h-5 text-primary" />
                    Contact Information
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1.5">Email Address</label>
                      <input
                        type="email"
                        name="email"
                        value={shippingInfo.email}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-2.5 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
                        placeholder="your@email.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1.5">Phone Number</label>
                      <input
                        type="tel"
                        name="phone"
                        value={shippingInfo.phone}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-2.5 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
                        placeholder="9876543210"
                      />
                    </div>
                  </div>
                </motion.div>

                {/* Shipping Address */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-card border border-border rounded-xl p-6"
                >
                  <h2 className="text-xl font-heading font-semibold mb-4 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-primary" />
                    Shipping Address
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1.5">Full Name</label>
                      <input
                        type="text"
                        name="full_name"
                        value={shippingInfo.full_name}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-2.5 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1.5">Address Line 1</label>
                      <input
                        type="text"
                        name="address_line1"
                        value={shippingInfo.address_line1}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-2.5 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
                        placeholder="House/Flat No., Building Name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1.5">Address Line 2</label>
                      <input
                        type="text"
                        name="address_line2"
                        value={shippingInfo.address_line2}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2.5 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
                        placeholder="Street, Area (Optional)"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1.5">City</label>
                        <input
                          type="text"
                          name="city"
                          value={shippingInfo.city}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-2.5 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
                          placeholder="Mumbai"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1.5">State</label>
                        <input
                          type="text"
                          name="state"
                          value={shippingInfo.state}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-2.5 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
                          placeholder="Maharashtra"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1.5">PIN Code</label>
                        <input
                          type="text"
                          name="postal_code"
                          value={shippingInfo.postal_code}
                          onChange={handleInputChange}
                          required
                          maxLength={6}
                          className="w-full px-4 py-2.5 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
                          placeholder="400001"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1.5">Landmark (Optional)</label>
                        <input
                          type="text"
                          name="landmark"
                          value={shippingInfo.landmark}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2.5 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
                          placeholder="Nearby landmark"
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Payment Method */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-card border border-border rounded-xl p-6"
                >
                  <h2 className="text-xl font-heading font-semibold mb-4 flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-primary" />
                    Payment Method
                  </h2>
                  <div className="space-y-3">
                    <label className="flex items-center gap-3 p-4 border border-border rounded-lg cursor-pointer hover:bg-muted/50 transition">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="razorpay"
                        checked={paymentMethod === "razorpay"}
                        onChange={() => setPaymentMethod("razorpay")}
                        className="w-4 h-4"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <CreditCard className="w-5 h-5 text-primary" />
                          <span className="font-semibold">Pay Online (Razorpay)</span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          UPI, Credit/Debit Card, Net Banking
                        </p>
                      </div>
                    </label>
                    <label className="flex items-center gap-3 p-4 border border-border rounded-lg cursor-pointer hover:bg-muted/50 transition">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="cod"
                        checked={paymentMethod === "cod"}
                        onChange={() => setPaymentMethod("cod")}
                        className="w-4 h-4"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Package className="w-5 h-5 text-primary" />
                          <span className="font-semibold">Cash on Delivery</span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          Pay when you receive your order
                        </p>
                      </div>
                    </label>
                  </div>
                </motion.div>
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-card border border-border rounded-xl p-6 sticky top-24"
                >
                  <h2 className="text-xl font-heading font-bold mb-6">Order Summary</h2>

                  {/* Items */}
                  <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
                    {items.map((item) => (
                      <div key={item.id} className="flex gap-3">
                        <div className="relative w-16 h-16 bg-muted rounded overflow-hidden flex-shrink-0">
                          {item.product_image ? (
                            <img
                              src={item.product_image}
                              alt={item.product_name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Zap className="w-6 h-6 text-muted-foreground opacity-20" />
                            </div>
                          )}
                          <span className="absolute bottom-0 right-0 bg-primary text-white text-xs px-1.5 py-0.5 rounded-tl">
                            {item.quantity}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{item.product_name}</p>
                          <p className="text-xs text-muted-foreground">₹{item.price.toFixed(2)}</p>
                          {item.installation_service && (
                            <p className="text-xs text-green-600">+ Installation</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-border pt-4 space-y-2 mb-6">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span className="font-medium">₹{total.toFixed(2)}</span>
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
                    <div className="border-t border-border pt-2">
                      <div className="flex justify-between text-lg font-bold">
                        <span>Total</span>
                        <span className="text-primary">₹{grandTotal.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-primary text-primary-foreground py-3.5 rounded-xl font-semibold hover:bg-primary/90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>Processing...</>
                    ) : (
                      <>
                        <Lock className="w-4 h-4" />
                        Place Order Securely
                      </>
                    )}
                  </button>

                  <div className="mt-4 flex items-center justify-center gap-2 text-xs text-muted-foreground">
                    <Lock className="w-3 h-3" />
                    <span>SSL Encrypted & Secure Payment</span>
                  </div>
                </motion.div>
              </div>
            </div>
          </form>
        </div>

      </div>
    </>
  );
};

export default Checkout;
