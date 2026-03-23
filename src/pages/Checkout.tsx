// import { useState } from "react";
// import { motion } from "framer-motion";
// import { useNavigate, Link } from "react-router-dom";
// import { useAuth } from "@/hooks/useAuth";
// import { supabase } from "@/integrations/supabase/client";
// import { toast } from "sonner";
// import { CreditCard, MapPin, User, Phone, Mail, Package, Truck, CheckCircle, ArrowLeft, Lock, Zap } from "lucide-react";
// import { useCart } from "@/contexts/CartContext";

// const Checkout = () => {
//   const navigate = useNavigate();
//   const { user } = useAuth();
//   const { items, total, clearCart } = useCart();
//   const [loading, setLoading] = useState(false);
//   const [paymentMethod, setPaymentMethod] = useState<"razorpay" | "cod">("razorpay");

//   const [shippingInfo, setShippingInfo] = useState({
//     full_name: "",
//     email: user?.email || "",
//     phone: "",
//     address_line1: "",
//     address_line2: "",
//     city: "",
//     state: "",
//     postal_code: "",
//     landmark: "",
//   });

//   const shipping = total > 500 ? 0 : 50;
//   const grandTotal = total + shipping;

//   if (items.length === 0) {
//     return (
//       <>
//         <div className="min-h-screen flex items-center justify-center">
//           <div className="text-center">
//             <h1 className="text-2xl font-bold mb-4">Your cart is empty</h1>
//             <Link to="/products" className="text-primary hover:underline">
//               Continue Shopping
//             </Link>
//           </div>
//         </div>
//       </>
//     );
//   }

//   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const { name, value } = e.target;
//     setShippingInfo((prev) => ({ ...prev, [name]: value }));
//   };

//   const validateForm = () => {
//     const requiredFields = ["full_name", "email", "phone", "address_line1", "city", "state", "postal_code"];
//     for (const field of requiredFields) {
//       if (!shippingInfo[field as keyof typeof shippingInfo]) {
//         toast.error(`Please fill in ${field.replace("_", " ")}`);
//         return false;
//       }
//     }
//     if (!/^\d{6}$/.test(shippingInfo.postal_code)) {
//       toast.error("Please enter a valid 6-digit PIN code");
//       return false;
//     }
//     if (!/^[6-9]\d{9}$/.test(shippingInfo.phone)) {
//       toast.error("Please enter a valid 10-digit mobile number");
//       return false;
//     }
//     return true;
//   };

//   const createOrder = async () => {
//     try {
//       const orderNumber = `ORD${Date.now()}`;
      
//       const orderData = {
//         order_number: orderNumber,
//         user_id: user?.id,
//         status: "pending",
//         payment_status: paymentMethod === "cod" ? "pending" : "pending",
//         fulfillment_status: "pending",
//         subtotal: total,
//         shipping_charge: shipping,
//         installation_total: items.reduce((sum, item) => sum + item.installation_charge, 0),
//         tax_amount: 0, // Can be calculated if needed
//         discount_amount: 0, // Can be calculated if needed
//         total_amount: grandTotal,
//         payment_method: paymentMethod,
//         shipping_address_data: shippingInfo as any,
//         customer_notes: "",
//         ordered_at: new Date().toISOString(),
//       };

//       const { data, error } = await supabase.from("orders").insert([orderData]).select();
//       if (error) throw error;

//       return { orderId: data[0].id, orderNumber, amount: grandTotal };
//     } catch (error) {
//       console.error("Error creating order:", error);
//       throw error;
//     }
//   };

//   const loadRazorpayScript = () => {
//     return new Promise((resolve) => {
//       const script = document.createElement("script");
//       script.src = "https://checkout.razorpay.com/v1/checkout.js";
//       script.onload = () => resolve(true);
//       script.onerror = () => resolve(false);
//       document.body.appendChild(script);
//     });
//   };

//   const handleRazorpayPayment = async (orderNumber: string, amount: number) => {
//     const loaded = await loadRazorpayScript();
//     if (!loaded) {
//       toast.error("Failed to load payment gateway");
//       return false;
//     }

//     // For test mode without backend, we'll create a simple payment request
//     // In production, you should create a Razorpay order from backend first
//     const options = {
//       key: import.meta.env.VITE_RAZORPAY_KEY_ID,
//       amount: Math.round(amount * 100), // Amount in paise
//       currency: "INR",
//       name: "Electroobuddy",
//       description: `Order Payment - ${orderNumber}`,
//       handler: async function (response: any) {
//         try {
//           // Update order with payment details
//           const { error } = await supabase
//             .from("orders")
//             .update({
//               razorpay_payment_id: response.razorpay_payment_id,
//               razorpay_order_id: response.razorpay_order_id,
//               razorpay_signature: response.razorpay_signature,
//               payment_status: "paid",
//               status: "confirmed",
//               confirmed_at: new Date().toISOString(),
//             })
//             .eq("order_number", orderNumber);

//           if (error) throw error;

//           toast.success("Payment successful!");
//           return true;
//         } catch (error) {
//           console.error("Error updating payment:", error);
//           toast.error("Payment verification failed");
//           return false;
//         }
//       },
//       prefill: {
//         name: shippingInfo.full_name,
//         email: shippingInfo.email,
//         contact: shippingInfo.phone,
//       },
//       theme: {
//         color: "#3b82f6",
//       },
//       modal: {
//         ondismiss: () => {
//           toast.error("Payment cancelled by user");
//         },
//       },
//     };

//     try {
//       const rzp = new (window as any).Razorpay(options);
//       rzp.on("payment.failed", function (response: any) {
//         toast.error(`Payment failed: ${response.error.description}`);
//       });
//       rzp.open();
//       return true;
//     } catch (error) {
//       console.error("Razorpay error:", error);
//       toast.error("Payment initialization failed");
//       return false;
//     }
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
    
//     if (!validateForm()) return;
    
//     setLoading(true);

//     try {
//       // Create order in database
//       const { orderId, orderNumber, amount } = await createOrder();

//       if (paymentMethod === "razorpay") {
//         // Process Razorpay payment (without backend order for test mode)
//         const paymentSuccess = await handleRazorpayPayment(orderNumber, amount);
//         if (!paymentSuccess) {
//           setLoading(false);
//           return;
//         }
//       } else {
//         // COD - Order stays as pending payment
//         toast.success("Order placed successfully! Pay when you receive.");
//       }

//       // Clear cart and redirect to success page
//       clearCart();
      
//       // For paid orders or COD, auto-create Shiprocket shipment if enabled
//       if (paymentMethod === "razorpay" || paymentMethod === "cod") {
//         try {
//           // Attempt to create Shiprocket order in background
//           const { data: shiprocketData, error: srError } = await supabase.functions.invoke(
//             'create-shiprocket-order',
//             { body: { order_id: orderId } }
//           );
          
//           if (!srError && shiprocketData?.success) {
//             toast.success(`Shipment created! AWB: ${shiprocketData.awb_code}`);
//           }
//         } catch (srErr) {
//           console.error('Shiprocket creation failed:', srErr);
//           // Don't block checkout - admin can create manually later
//         }
//       }
      
//       navigate("/order-success", { 
//         state: { 
//           orderId: orderNumber, 
//           amount: grandTotal,
//           paymentMethod 
//         } 
//       });
      
//     } catch (error) {
//       console.error("Checkout error:", error);
//       toast.error("Failed to place order. Please try again.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <>
//       <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
//         <div className="container mx-auto px-4 py-8">
//           <motion.div
//             initial={{ opacity: 0, y: -20 }}
//             animate={{ opacity: 1, y: 0 }}
//             className="mb-8"
//           >
//             <button
//               onClick={() => navigate(-1)}
//               className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4 transition"
//             >
//               <ArrowLeft className="w-4 h-4" />
//               Back
//             </button>
//             <h1 className="text-3xl md:text-4xl font-heading font-bold">Checkout</h1>
//             <p className="text-muted-foreground mt-1">Complete your order</p>
//           </motion.div>

//           <form onSubmit={handleSubmit}>
//             <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
//               {/* Checkout Form */}
//               <div className="lg:col-span-2 space-y-6">
//                 {/* Contact Information */}
//                 <motion.div
//                   initial={{ opacity: 0, y: 20 }}
//                   animate={{ opacity: 1, y: 0 }}
//                   className="bg-card border border-border rounded-xl p-6"
//                 >
//                   <h2 className="text-xl font-heading font-semibold mb-4 flex items-center gap-2">
//                     <Mail className="w-5 h-5 text-primary" />
//                     Contact Information
//                   </h2>
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                     <div>
//                       <label className="block text-sm font-medium mb-1.5">Email Address</label>
//                       <input
//                         type="email"
//                         name="email"
//                         value={shippingInfo.email}
//                         onChange={handleInputChange}
//                         required
//                         className="w-full px-4 py-2.5 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
//                         placeholder="your@email.com"
//                       />
//                     </div>
//                     <div>
//                       <label className="block text-sm font-medium mb-1.5">Phone Number</label>
//                       <input
//                         type="tel"
//                         name="phone"
//                         value={shippingInfo.phone}
//                         onChange={handleInputChange}
//                         required
//                         className="w-full px-4 py-2.5 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
//                         placeholder="9876543210"
//                       />
//                     </div>
//                   </div>
//                 </motion.div>

//                 {/* Shipping Address */}
//                 <motion.div
//                   initial={{ opacity: 0, y: 20 }}
//                   animate={{ opacity: 1, y: 0 }}
//                   transition={{ delay: 0.1 }}
//                   className="bg-card border border-border rounded-xl p-6"
//                 >
//                   <h2 className="text-xl font-heading font-semibold mb-4 flex items-center gap-2">
//                     <MapPin className="w-5 h-5 text-primary" />
//                     Shipping Address
//                   </h2>
//                   <div className="space-y-4">
//                     <div>
//                       <label className="block text-sm font-medium mb-1.5">Full Name</label>
//                       <input
//                         type="text"
//                         name="full_name"
//                         value={shippingInfo.full_name}
//                         onChange={handleInputChange}
//                         required
//                         className="w-full px-4 py-2.5 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
//                         placeholder="John Doe"
//                       />
//                     </div>
//                     <div>
//                       <label className="block text-sm font-medium mb-1.5">Address Line 1</label>
//                       <input
//                         type="text"
//                         name="address_line1"
//                         value={shippingInfo.address_line1}
//                         onChange={handleInputChange}
//                         required
//                         className="w-full px-4 py-2.5 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
//                         placeholder="House/Flat No., Building Name"
//                       />
//                     </div>
//                     <div>
//                       <label className="block text-sm font-medium mb-1.5">Address Line 2</label>
//                       <input
//                         type="text"
//                         name="address_line2"
//                         value={shippingInfo.address_line2}
//                         onChange={handleInputChange}
//                         className="w-full px-4 py-2.5 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
//                         placeholder="Street, Area (Optional)"
//                       />
//                     </div>
//                     <div className="grid grid-cols-2 gap-4">
//                       <div>
//                         <label className="block text-sm font-medium mb-1.5">City</label>
//                         <input
//                           type="text"
//                           name="city"
//                           value={shippingInfo.city}
//                           onChange={handleInputChange}
//                           required
//                           className="w-full px-4 py-2.5 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
//                           placeholder="Mumbai"
//                         />
//                       </div>
//                       <div>
//                         <label className="block text-sm font-medium mb-1.5">State</label>
//                         <input
//                           type="text"
//                           name="state"
//                           value={shippingInfo.state}
//                           onChange={handleInputChange}
//                           required
//                           className="w-full px-4 py-2.5 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
//                           placeholder="Maharashtra"
//                         />
//                       </div>
//                     </div>
//                     <div className="grid grid-cols-2 gap-4">
//                       <div>
//                         <label className="block text-sm font-medium mb-1.5">PIN Code</label>
//                         <input
//                           type="text"
//                           name="postal_code"
//                           value={shippingInfo.postal_code}
//                           onChange={handleInputChange}
//                           required
//                           maxLength={6}
//                           className="w-full px-4 py-2.5 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
//                           placeholder="400001"
//                         />
//                       </div>
//                       <div>
//                         <label className="block text-sm font-medium mb-1.5">Landmark (Optional)</label>
//                         <input
//                           type="text"
//                           name="landmark"
//                           value={shippingInfo.landmark}
//                           onChange={handleInputChange}
//                           className="w-full px-4 py-2.5 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
//                           placeholder="Nearby landmark"
//                         />
//                       </div>
//                     </div>
//                   </div>
//                 </motion.div>

//                 {/* Payment Method */}
//                 <motion.div
//                   initial={{ opacity: 0, y: 20 }}
//                   animate={{ opacity: 1, y: 0 }}
//                   transition={{ delay: 0.2 }}
//                   className="bg-card border border-border rounded-xl p-6"
//                 >
//                   <h2 className="text-xl font-heading font-semibold mb-4 flex items-center gap-2">
//                     <CreditCard className="w-5 h-5 text-primary" />
//                     Payment Method
//                   </h2>
//                   <div className="space-y-3">
//                     <label className="flex items-center gap-3 p-4 border border-border rounded-lg cursor-pointer hover:bg-muted/50 transition">
//                       <input
//                         type="radio"
//                         name="paymentMethod"
//                         value="razorpay"
//                         checked={paymentMethod === "razorpay"}
//                         onChange={() => setPaymentMethod("razorpay")}
//                         className="w-4 h-4"
//                       />
//                       <div className="flex-1">
//                         <div className="flex items-center gap-2">
//                           <CreditCard className="w-5 h-5 text-primary" />
//                           <span className="font-semibold">Pay Online (Razorpay)</span>
//                         </div>
//                         <p className="text-sm text-muted-foreground mt-1">
//                           UPI, Credit/Debit Card, Net Banking
//                         </p>
//                       </div>
//                     </label>
//                     <label className="flex items-center gap-3 p-4 border border-border rounded-lg cursor-pointer hover:bg-muted/50 transition">
//                       <input
//                         type="radio"
//                         name="paymentMethod"
//                         value="cod"
//                         checked={paymentMethod === "cod"}
//                         onChange={() => setPaymentMethod("cod")}
//                         className="w-4 h-4"
//                       />
//                       <div className="flex-1">
//                         <div className="flex items-center gap-2">
//                           <Package className="w-5 h-5 text-primary" />
//                           <span className="font-semibold">Cash on Delivery</span>
//                         </div>
//                         <p className="text-sm text-muted-foreground mt-1">
//                           Pay when you receive your order
//                         </p>
//                       </div>
//                     </label>
//                   </div>
//                 </motion.div>
//               </div>

//               {/* Order Summary */}
//               <div className="lg:col-span-1">
//                 <motion.div
//                   initial={{ opacity: 0, x: 20 }}
//                   animate={{ opacity: 1, x: 0 }}
//                   transition={{ delay: 0.3 }}
//                   className="bg-card border border-border rounded-xl p-6 sticky top-24"
//                 >
//                   <h2 className="text-xl font-heading font-bold mb-6">Order Summary</h2>

//                   {/* Items */}
//                   <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
//                     {items.map((item) => (
//                       <div key={item.id} className="flex gap-3">
//                         <div className="relative w-16 h-16 bg-muted rounded overflow-hidden flex-shrink-0">
//                           {item.product_image ? (
//                             <img
//                               src={item.product_image}
//                               alt={item.product_name}
//                               className="w-full h-full object-cover"
//                             />
//                           ) : (
//                             <div className="w-full h-full flex items-center justify-center">
//                               <Zap className="w-6 h-6 text-muted-foreground opacity-20" />
//                             </div>
//                           )}
//                           <span className="absolute bottom-0 right-0 bg-primary text-white text-xs px-1.5 py-0.5 rounded-tl">
//                             {item.quantity}
//                           </span>
//                         </div>
//                         <div className="flex-1 min-w-0">
//                           <p className="text-sm font-medium truncate">{item.product_name}</p>
//                           <p className="text-xs text-muted-foreground">₹{item.price.toFixed(2)}</p>
//                           {item.installation_service && (
//                             <p className="text-xs text-green-600">+ Installation</p>
//                           )}
//                         </div>
//                       </div>
//                     ))}
//                   </div>

//                   <div className="border-t border-border pt-4 space-y-2 mb-6">
//                     <div className="flex justify-between text-sm">
//                       <span className="text-muted-foreground">Subtotal</span>
//                       <span className="font-medium">₹{total.toFixed(2)}</span>
//                     </div>
//                     <div className="flex justify-between text-sm">
//                       <span className="text-muted-foreground">Shipping</span>
//                       <span className="font-medium">
//                         {shipping === 0 ? (
//                           <span className="text-green-600 font-semibold">FREE</span>
//                         ) : (
//                           `₹${shipping.toFixed(2)}`
//                         )}
//                       </span>
//                     </div>
//                     <div className="border-t border-border pt-2">
//                       <div className="flex justify-between text-lg font-bold">
//                         <span>Total</span>
//                         <span className="text-primary">₹{grandTotal.toFixed(2)}</span>
//                       </div>
//                     </div>
//                   </div>

//                   <button
//                     type="submit"
//                     disabled={loading}
//                     className="w-full bg-primary text-primary-foreground py-3.5 rounded-xl font-semibold hover:bg-primary/90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
//                   >
//                     {loading ? (
//                       <>Processing...</>
//                     ) : (
//                       <>
//                         <Lock className="w-4 h-4" />
//                         Place Order Securely
//                       </>
//                     )}
//                   </button>

//                   <div className="mt-4 flex items-center justify-center gap-2 text-xs text-muted-foreground">
//                     <Lock className="w-3 h-3" />
//                     <span>SSL Encrypted & Secure Payment</span>
//                   </div>
//                 </motion.div>
//               </div>
//             </div>
//           </form>
//         </div>

//       </div>
//     </>
//   );
// };

// export default Checkout;

import { useState, useId, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  CreditCard,
  MapPin,
  Phone,
  Mail,
  Package,
  Truck,
  Lock,
  Zap,
  ChevronRight,
  CheckCircle,
  Gift,
} from "lucide-react";
import { useCart } from "@/contexts/CartContext";

/* ─── types ──────────────────────────────────────────────────── */
type Step = "address" | "payment" | "review";
type PaymentMethod = "razorpay" | "cod";

interface ShippingInfo {
  full_name: string;
  email: string;
  phone: string;
  address_line1: string;
  address_line2: string;
  city: string;
  state: string;
  postal_code: string;
  landmark: string;
}

interface FieldError {
  [key: string]: string;
}

/* ─── field helpers ──────────────────────────────────────────── */
const INDIAN_STATES = [
  "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh","Goa",
  "Gujarat","Haryana","Himachal Pradesh","Jharkhand","Karnataka","Kerala",
  "Madhya Pradesh","Maharashtra","Manipur","Meghalaya","Mizoram","Nagaland",
  "Odisha","Punjab","Rajasthan","Sikkim","Tamil Nadu","Telangana","Tripura",
  "Uttar Pradesh","Uttarakhand","West Bengal","Chandigarh","Delhi","Jammu & Kashmir",
  "Ladakh","Lakshadweep","Puducherry",
];

const FREE_SHIPPING = 500;

/* ─── input component ─────────────────────────────────────────── */
const Field = ({
  label,
  error,
  required,
  children,
}: {
  label: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}) => (
  <div>
    <label className="block text-sm font-medium mb-1.5">
      {label}
      {required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
    {children}
    {error && (
      <p className="text-xs text-red-500 mt-1" role="alert">
        {error}
      </p>
    )}
  </div>
);

const inputClass = (error?: string) =>
  `w-full px-4 py-2.5 rounded-lg border text-sm bg-background focus:outline-none focus:ring-2 transition ${
    error
      ? "border-red-400 focus:ring-red-200"
      : "border-border focus:ring-primary/20 focus:border-primary"
  }`;

/* ─── step indicator ──────────────────────────────────────────── */
const StepIndicator = ({ current }: { current: Step }) => {
  const steps: { id: Step; label: string }[] = [
    { id: "address", label: "Address" },
    { id: "payment", label: "Payment" },
    { id: "review", label: "Review" },
  ];
  const idx = steps.findIndex((s) => s.id === current);

  return (
    <div className="flex items-center gap-0 mb-8">
      {steps.map((s, i) => (
        <div key={s.id} className="flex items-center">
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition ${
              i < idx
                ? "text-green-600"
                : i === idx
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground"
            }`}
          >
            {i < idx ? <CheckCircle className="w-4 h-4" /> : <span className="w-5 h-5 rounded-full border-2 flex items-center justify-center text-xs">{i + 1}</span>}
            {s.label}
          </div>
          {i < steps.length - 1 && <ChevronRight className="w-4 h-4 text-muted-foreground mx-1" />}
        </div>
      ))}
    </div>
  );
};

/* ─── main ───────────────────────────────────────────────────── */
const Checkout = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { items, total, clearCart } = useCart();

  // Redirect to login if not authenticated
  if (!authLoading && !user) {
    toast.error('Please login to checkout');
    navigate('/login', { state: { from: '/checkout' } });
    return null;
  }

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  const [step, setStep] = useState<Step>("address");
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("razorpay");
  const [fieldErrors, setFieldErrors] = useState<FieldError>({});
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  const [shippingCharge, setShippingCharge] = useState(50);
  const [taxAmount, setTaxAmount] = useState(0);
  const [estimatedDelivery, setEstimatedDelivery] = useState("3-5 days");

  const infoState = useState<ShippingInfo>({
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

  const [info, setInfo] = infoState;

  // Calculate totals with coupon and tax
  const calculateTotals = async () => {
    const subtotal = total;
    
    // Calculate shipping based on state (simplified - will use default for now)
    if (info.state) {
      try {
        // For now, use simple logic - in production call the RPC function
        // Metro cities get free shipping above ₹500, others above ₹750
        const metroCities = ['Delhi', 'Mumbai', 'Bangalore', 'Chennai', 'Kolkata', 'Hyderabad'];
        const isMetro = metroCities.includes(info.state);
        
        if (subtotal >= (isMetro ? 500 : 750)) {
          setShippingCharge(0);
        } else {
          setShippingCharge(isMetro ? 40 : 60);
        }
        
        setEstimatedDelivery(isMetro ? "1-2 days" : "2-4 days");
      } catch (error) {
        console.error('Error calculating shipping:', error);
        setShippingCharge(50);
      }
    }
    
    // Calculate tax (18% GST by default)
    const taxableAmount = subtotal - (appliedCoupon?.discount_amount || 0);
    const tax = taxableAmount * 0.18;
    setTaxAmount(tax);
  };

  useEffect(() => {
    calculateTotals();
  }, [info.state, appliedCoupon, total]);

  const discount = appliedCoupon?.discount_amount || 0;
  const shipping = shippingCharge;
  const grandTotal = total + shipping + taxAmount - discount;

  /* ── empty cart guard ── */
  if (items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-3">
          <h1 className="text-2xl font-bold">Your cart is empty</h1>
          <Link to="/products" className="text-primary hover:underline text-sm">
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  /* ── coupon handler ── */
  const handleApplyCoupon = async () => {
    if (!couponCode.trim() || !user) return;
    
    setApplyingCoupon(true);
    
    // Add timeout for better UX
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Request timeout')), 10000)
    );
    
    try {
      const applyPromise = supabase.rpc('apply_coupon', {
        p_coupon_code: couponCode.toUpperCase(),
        p_user_id: user.id,
        p_cart_total: total,
        p_cart_items: [] as any
      });
      
      // Race between apply and timeout
      const { data, error } = await Promise.race([applyPromise, timeoutPromise]) as any;
      
      if (error || !data || data.length === 0) {
        toast.error("Invalid coupon code");
        setAppliedCoupon(null);
        return;
      }
      
      const result = data[0];
      if (result.success) {
        setAppliedCoupon(result);
        const couponCodeValue = typeof result.coupon_data === 'object' && result.coupon_data !== null ? 
          (result.coupon_data as any).code || '' : '';
        toast.success(`Coupon applied! ${couponCodeValue}`);
      } else {
        toast.error(result.message || "Cannot apply this coupon");
        setAppliedCoupon(null);
      }
    } catch (error: any) {
      console.error('Error applying coupon:', error);
      const errorMsg = error.message === 'Request timeout' 
        ? 'Request timed out. Please try again.'
        : 'Failed to apply coupon. Please try again.';
      toast.error(errorMsg);
    } finally {
      setApplyingCoupon(false);
    }
  };
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setInfo((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: "" }));
  };

  /* ── validation ── */
  const validateAddress = (): boolean => {
    const errors: FieldError = {};
    if (!info.full_name.trim()) errors.full_name = "Full name is required";
    if (!info.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(info.email))
      errors.email = "Valid email is required";
    if (!info.phone.trim() || !/^[6-9]\d{9}$/.test(info.phone))
      errors.phone = "Valid 10-digit mobile number starting with 6–9";
    if (!info.address_line1.trim()) errors.address_line1 = "Address is required";
    if (!info.city.trim()) errors.city = "City is required";
    if (!info.state) errors.state = "Please select your state";
    if (!info.postal_code || !/^\d{6}$/.test(info.postal_code))
      errors.postal_code = "Valid 6-digit PIN code required";

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  /* ── create order ── */
  const createOrder = async () => {
    if (!user) {
      throw new Error('User not authenticated. Please login to place an order.');
    }

    const orderNumber = `ORD${Date.now()}`;
    
    try {
      // First, create the order
      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .insert([
          {
            order_number: orderNumber,
            user_id: user.id,
            status: "pending",
            payment_status: "pending",
            fulfillment_status: "pending",
            subtotal: total,
            shipping_charge: shipping,
            installation_total: items.reduce((s, i) => s + i.installation_charge, 0),
            tax_amount: taxAmount,
            discount_amount: discount,
            total_amount: grandTotal,
            payment_method: paymentMethod,
            shipping_address_data: info as any,
            coupon_code: appliedCoupon?.coupon_data?.code || appliedCoupon?.code || null,
            ordered_at: new Date().toISOString(),
          },
        ])
        .select();
      
      if (orderError) {
        console.error('Database error creating order:', orderError);
        throw new Error(`Failed to create order: ${orderError.message}`);
      }

      const orderId = orderData[0].id;

      // Then, insert order items
      if (items.length > 0) {
        const orderItems = items.map((item) => ({
          order_id: orderId,
          product_id: item.product_id,
          product_name: item.product_name,
          product_image: item.product_image || null,
          quantity: item.quantity,
          unit_price: item.price,
          total_price: item.price * item.quantity,
          installation_service: item.installation_service || false,
          installation_charge: item.installation_charge || 0,
        }));

        const { error: itemsError } = await supabase
          .from("order_items")
          .insert(orderItems);

        if (itemsError) {
          console.error('Error inserting order items:', itemsError);
          // Rollback: delete the order since items failed
          await supabase.from("orders").delete().eq("id", orderId);
          throw new Error(`Failed to add order items: ${itemsError.message}`);
        }
      }

      return { orderId, orderNumber };
    } catch (error: any) {
      console.error('Order creation failed:', error);
      throw error;
    }
  };

  /* ── razorpay ── */
  const processRazorpay = async (orderNumber: string): Promise<boolean> => {
    await new Promise<void>((resolve, reject) => {
      const s = document.createElement("script");
      s.src = "https://checkout.razorpay.com/v1/checkout.js";
      s.onload = () => resolve();
      s.onerror = () => reject(new Error("Failed to load Razorpay"));
      document.body.appendChild(s);
    });

    return new Promise((resolve) => {
      const rzp = new (window as any).Razorpay({
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: Math.round(grandTotal * 100),
        currency: "INR",
        name: "Electrobuddy",
        description: `Order ${orderNumber}`,
        prefill: { name: info.full_name, email: info.email, contact: info.phone },
        theme: { color: "#3b82f6" },
        handler: async (response: any) => {
          await supabase
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
          toast.success("Payment successful!");
          resolve(true);
        },
        modal: {
          ondismiss: () => {
            toast.error("Payment cancelled");
            resolve(false);
          },
        },
      });
      rzp.on("payment.failed", () => {
        toast.error("Payment failed. Please try again.");
        resolve(false);
      });
      rzp.open();
    });
  };

  /* ── submit ── */
  const handleSubmit = async () => {
    setLoading(true);
    try {
      console.log('🛒 Starting checkout process...');
      console.log('📦 Cart items:', items.length);
      console.log('💰 Total amount:', grandTotal);
      
      const { orderId, orderNumber } = await createOrder();

      console.log('✅ Order created successfully:', { orderId, orderNumber });

      if (paymentMethod === "razorpay") {
        const ok = await processRazorpay(orderNumber);
        if (!ok) { 
          setLoading(false); 
          return; 
        }
      } else {
        toast.success("Order placed! Pay on delivery.");
      }

      // Increment coupon usage if coupon was applied (after successful order)
      if (appliedCoupon && (appliedCoupon.coupon_data as any)?.code) {
        try {
          await supabase.rpc('increment_coupon_usage', {
            p_coupon_code: (appliedCoupon.coupon_data as any).code
          });
        } catch (couponErr) {
          console.error('Failed to increment coupon usage:', couponErr);
          // Don't block checkout - this is non-critical
        }
      }

      /* background: shiprocket */
      supabase.functions
        .invoke("create-shiprocket-order", { body: { order_id: orderId } })
        .then(({ data: sr, error: sre }) => {
          if (!sre && sr?.success) toast.success(`Shipment created – AWB: ${sr.awb_code}`);
        })
        .catch(() => {});

      clearCart();
      navigate("/order-success", {
        state: { orderId: orderNumber, amount: grandTotal, paymentMethod },
      });
    } catch (err: any) {
      console.error('❌ Checkout failed:', err);
      console.error('Error details:', {
        message: err.message,
        stack: err.stack,
      });
      toast.error(err.message || "Failed to place order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  /* ── render ── */
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <h1 className="text-3xl font-heading font-bold mb-1">Checkout</h1>
          <p className="text-muted-foreground text-sm">Complete your order securely</p>
        </motion.div>

        <StepIndicator current={step} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* ── left panel ── */}
          <div className="lg:col-span-2 space-y-5">
            <AnimatePresence mode="wait">
              {/* ── STEP 1: Address ── */}
              {step === "address" && (
                <motion.div
                  key="address"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-5"
                >
                  {/* contact */}
                  <div className="bg-card border border-border rounded-xl p-6">
                    <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <Mail className="w-5 h-5 text-primary" />
                      Contact Information
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Field label="Email Address" error={fieldErrors.email} required>
                        <input
                          type="email"
                          name="email"
                          value={info.email}
                          onChange={handleChange}
                          className={inputClass(fieldErrors.email)}
                          placeholder="you@example.com"
                          autoComplete="email"
                        />
                      </Field>
                      <Field label="Mobile Number" error={fieldErrors.phone} required>
                        <div className="flex">
                          <span className="px-3 py-2.5 bg-muted border border-r-0 border-border rounded-l-lg text-sm text-muted-foreground">
                            +91
                          </span>
                          <input
                            type="tel"
                            name="phone"
                            value={info.phone}
                            onChange={handleChange}
                            maxLength={10}
                            className={`${inputClass(fieldErrors.phone)} rounded-l-none`}
                            placeholder="9876543210"
                            autoComplete="tel"
                          />
                        </div>
                      </Field>
                    </div>
                  </div>

                  {/* shipping */}
                  <div className="bg-card border border-border rounded-xl p-6">
                    <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-primary" />
                      Shipping Address
                    </h2>
                    <div className="space-y-4">
                      <Field label="Full Name" error={fieldErrors.full_name} required>
                        <input
                          type="text"
                          name="full_name"
                          value={info.full_name}
                          onChange={handleChange}
                          className={inputClass(fieldErrors.full_name)}
                          placeholder="John Doe"
                          autoComplete="name"
                        />
                      </Field>
                      <Field label="Address Line 1" error={fieldErrors.address_line1} required>
                        <input
                          type="text"
                          name="address_line1"
                          value={info.address_line1}
                          onChange={handleChange}
                          className={inputClass(fieldErrors.address_line1)}
                          placeholder="Flat / House No., Building Name"
                          autoComplete="address-line1"
                        />
                      </Field>
                      <Field label="Address Line 2">
                        <input
                          type="text"
                          name="address_line2"
                          value={info.address_line2}
                          onChange={handleChange}
                          className={inputClass()}
                          placeholder="Street, Area (optional)"
                          autoComplete="address-line2"
                        />
                      </Field>
                      <div className="grid grid-cols-2 gap-4">
                        <Field label="City" error={fieldErrors.city} required>
                          <input
                            type="text"
                            name="city"
                            value={info.city}
                            onChange={handleChange}
                            className={inputClass(fieldErrors.city)}
                            placeholder="Mumbai"
                            autoComplete="address-level2"
                          />
                        </Field>
                        <Field label="State" error={fieldErrors.state} required>
                          <select
                            name="state"
                            value={info.state}
                            onChange={handleChange}
                            className={inputClass(fieldErrors.state)}
                          >
                            <option value="">Select state</option>
                            {INDIAN_STATES.map((s) => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                          </select>
                        </Field>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <Field label="PIN Code" error={fieldErrors.postal_code} required>
                          <input
                            type="text"
                            name="postal_code"
                            value={info.postal_code}
                            onChange={handleChange}
                            maxLength={6}
                            className={inputClass(fieldErrors.postal_code)}
                            placeholder="400001"
                            autoComplete="postal-code"
                            inputMode="numeric"
                          />
                        </Field>
                        <Field label="Landmark">
                          <input
                            type="text"
                            name="landmark"
                            value={info.landmark}
                            onChange={handleChange}
                            className={inputClass()}
                            placeholder="Near station (optional)"
                          />
                        </Field>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => { if (validateAddress()) setStep("payment"); }}
                    className="w-full bg-primary text-primary-foreground py-3.5 rounded-xl font-semibold hover:bg-primary/90 transition flex items-center justify-center gap-2"
                  >
                    Continue to Payment
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </motion.div>
              )}

              {/* ── STEP 2: Payment ── */}
              {step === "payment" && (
                <motion.div
                  key="payment"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-5"
                >
                  <div className="bg-card border border-border rounded-xl p-6">
                    <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <CreditCard className="w-5 h-5 text-primary" />
                      Payment Method
                    </h2>
                    <div className="space-y-3">
                      {([
                        {
                          id: "razorpay" as PaymentMethod,
                          label: "Pay Online (Razorpay)",
                          desc: "UPI · Credit/Debit Card · Net Banking · Wallets",
                          icon: <CreditCard className="w-5 h-5" />,
                        },
                        {
                          id: "cod" as PaymentMethod,
                          label: "Cash on Delivery",
                          desc: "Pay when your order arrives",
                          icon: <Package className="w-5 h-5" />,
                        },
                      ] as const).map((pm) => (
                        <label
                          key={pm.id}
                          className={`flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer transition ${
                            paymentMethod === pm.id
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-primary/30"
                          }`}
                        >
                          <input
                            type="radio"
                            name="paymentMethod"
                            value={pm.id}
                            checked={paymentMethod === pm.id}
                            onChange={() => setPaymentMethod(pm.id)}
                            className="w-4 h-4 accent-primary"
                          />
                          <span className={`${paymentMethod === pm.id ? "text-primary" : "text-muted-foreground"}`}>
                            {pm.icon}
                          </span>
                          <div>
                            <p className="font-semibold text-sm">{pm.label}</p>
                            <p className="text-xs text-muted-foreground">{pm.desc}</p>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setStep("address")}
                      className="flex-1 py-3.5 rounded-xl font-semibold border border-border hover:bg-muted transition text-sm"
                    >
                      ← Back
                    </button>
                    <button
                      onClick={() => setStep("review")}
                      className="flex-1 bg-primary text-primary-foreground py-3.5 rounded-xl font-semibold hover:bg-primary/90 transition flex items-center justify-center gap-2 text-sm"
                    >
                      Review Order
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              )}

              {/* ── STEP 3: Review ── */}
              {step === "review" && (
                <motion.div
                  key="review"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-5"
                >
                  {/* coupon section */}
                  <div className="bg-card border border-border rounded-xl p-5">
                    <h3 className="font-semibold flex items-center gap-2 text-sm mb-3">
                      <Gift className="w-4 h-4 text-primary" />
                      Apply Coupon
                    </h3>
                    {appliedCoupon ? (
                      <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
                        <div>
                          <p className="text-sm font-semibold text-green-700 dark:text-green-400">
                            {appliedCoupon.coupon_data?.code || appliedCoupon.code}
                          </p>
                          <p className="text-xs text-green-600 dark:text-green-500">
                            {appliedCoupon.message} - ₹{appliedCoupon.discount_amount?.toFixed(2)} off
                          </p>
                        </div>
                        <button
                          onClick={() => setAppliedCoupon(null)}
                          className="text-red-500 hover:text-red-700 text-sm font-medium"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                          placeholder="Enter coupon code"
                          className="flex-1 px-3 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                        <button
                          onClick={handleApplyCoupon}
                          disabled={applyingCoupon || !couponCode.trim()}
                          className="px-4 py-2.5 bg-primary text-primary-foreground rounded-lg font-semibold text-sm hover:bg-primary/90 transition disabled:opacity-50"
                        >
                          {applyingCoupon ? "Applying..." : "Apply"}
                        </button>
                      </div>
                    )}
                  </div>

                  {/* address summary */}
                  <div className="bg-card border border-border rounded-xl p-5">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold flex items-center gap-2 text-sm">
                        <MapPin className="w-4 h-4 text-primary" /> Delivering to
                      </h3>
                      <button
                        onClick={() => setStep("address")}
                        className="text-xs text-primary hover:underline"
                      >
                        Edit
                      </button>
                    </div>
                    <p className="text-sm font-medium">{info.full_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {info.address_line1}
                      {info.address_line2 ? `, ${info.address_line2}` : ""}, {info.city}, {info.state} – {info.postal_code}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">📞 +91 {info.phone}</p>
                  </div>

                  {/* payment summary */}
                  <div className="bg-card border border-border rounded-xl p-5">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold flex items-center gap-2 text-sm">
                        <CreditCard className="w-4 h-4 text-primary" /> Payment
                      </h3>
                      <button onClick={() => setStep("payment")} className="text-xs text-primary hover:underline">
                        Edit
                      </button>
                    </div>
                    <p className="text-sm">
                      {paymentMethod === "razorpay" ? "Online Payment (Razorpay)" : "Cash on Delivery"}
                    </p>
                  </div>

                  {/* items */}
                  <div className="bg-card border border-border rounded-xl p-5">
                    <h3 className="font-semibold text-sm mb-3">Items ({items.length})</h3>
                    <div className="space-y-3 max-h-52 overflow-y-auto pr-1">
                      {items.map((item) => (
                        <div key={item.id} className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-muted rounded overflow-hidden flex-shrink-0">
                            {item.product_image ? (
                              <img src={item.product_image} alt={item.product_name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Zap className="w-4 h-4 opacity-20" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium truncate">{item.product_name}</p>
                            <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                          </div>
                          <p className="text-xs font-semibold">
                            ₹{(item.price * item.quantity).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setStep("payment")}
                      className="flex-1 py-3.5 rounded-xl font-semibold border border-border hover:bg-muted transition text-sm"
                    >
                      ← Back
                    </button>
                    <button
                      onClick={handleSubmit}
                      disabled={loading}
                      className="flex-1 bg-primary text-primary-foreground py-3.5 rounded-xl font-semibold hover:bg-primary/90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
                      aria-busy={loading}
                    >
                      {loading ? (
                        <>
                          <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                          Processing…
                        </>
                      ) : (
                        <>
                          <Lock className="w-4 h-4" />
                          Place Order · ₹{grandTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                        </>
                      )}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ── right: order summary (sticky) ── */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-card border border-border rounded-xl p-6 sticky top-24"
            >
              <h2 className="text-lg font-bold mb-5">Order Summary</h2>

              <div className="space-y-3 mb-4 max-h-56 overflow-y-auto pr-1">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-3 items-start">
                    <div className="relative w-12 h-12 bg-muted rounded overflow-hidden flex-shrink-0">
                      {item.product_image ? (
                        <img src={item.product_image} alt={item.product_name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Zap className="w-4 h-4 opacity-20" />
                        </div>
                      )}
                      <span className="absolute -top-1 -right-1 bg-primary text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                        {item.quantity}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium line-clamp-2 leading-snug">{item.product_name}</p>
                      <p className="text-xs text-muted-foreground">₹{item.price.toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-border pt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>₹{total.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>
                    {shipping === 0 ? (
                      <span className="text-green-600 font-semibold">FREE</span>
                    ) : (
                      `₹${shipping.toFixed(2)}`
                    )}
                  </span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span className="font-medium">Coupon Discount</span>
                    <span>-₹{discount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tax (GST 18%)</span>
                  <span>₹{taxAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="border-t border-border pt-3 flex justify-between font-bold text-base">
                  <span>Total</span>
                  <span className="text-primary">
                    ₹{grandTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </span>
                </div>
                {estimatedDelivery && (
                  <p className="text-xs text-muted-foreground text-center pt-2">
                    📦 Estimated delivery: {estimatedDelivery}
                  </p>
                )}
              </div>

              <div className="mt-4 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                <Lock className="w-3 h-3" />
                SSL Encrypted · Secure Checkout
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;