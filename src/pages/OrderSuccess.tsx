// import { useEffect } from "react";
// import { useLocation, Link, useNavigate } from "react-router-dom";
// import { motion } from "framer-motion";
// import { CheckCircle, Package, Mail, ArrowRight, Home, ShoppingCart } from "lucide-react";
// import Navbar from "@/components/Navbar";
// import Footer from "@/components/Footer";
// import WhatsAppFloat from "@/components/WhatsAppFloat";

// const OrderSuccess = () => {
//   const location = useLocation();
//   const navigate = useNavigate();
//   const { orderId, amount, paymentMethod } = location.state || {};

//   useEffect(() => {
//     // Redirect to home if no order data
//     if (!orderId) {
//       navigate("/");
//     }
//   }, [orderId, navigate]);

//   return (
//     <>
//       <Navbar />
//       <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
//         <div className="container mx-auto px-4 py-16">
//           <motion.div
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.5 }}
//             className="max-w-2xl mx-auto"
//           >
//             {/* Success Icon */}
//             <div className="text-center mb-8">
//               <motion.div
//                 initial={{ scale: 0 }}
//                 animate={{ scale: 1 }}
//                 transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
//                 className="w-32 h-32 mx-auto mb-6 bg-green-100 rounded-full flex items-center justify-center"
//               >
//                 <CheckCircle className="w-20 h-20 text-green-600" />
//               </motion.div>
//               <h1 className="text-4xl md:text-5xl font-heading font-bold mb-4">
//                 Order Placed Successfully!
//               </h1>
//               <p className="text-lg text-muted-foreground">
//                 Thank you for your purchase
//               </p>
//             </div>

//             {/* Order Confirmation Card */}
//             <motion.div
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ delay: 0.3 }}
//               className="bg-card border border-border rounded-xl p-8 mb-6 shadow-sm"
//             >
//               <div className="flex items-start justify-between mb-6 pb-6 border-b border-border">
//                 <div>
//                   <h2 className="text-xl font-heading font-semibold mb-2">Order Confirmation</h2>
//                   <p className="text-muted-foreground">Your order has been confirmed</p>
//                 </div>
//                 <Package className="w-8 h-8 text-primary" />
//               </div>

//               <div className="space-y-4">
//                 <div className="flex justify-between">
//                   <span className="text-muted-foreground">Order Number:</span>
//                   <span className="font-semibold font-mono">{orderId}</span>
//                 </div>
//                 <div className="flex justify-between">
//                   <span className="text-muted-foreground">Payment Method:</span>
//                   <span className="font-medium">
//                     {paymentMethod === "razorpay" ? "Online Payment" : "Cash on Delivery"}
//                   </span>
//                 </div>
//                 <div className="flex justify-between">
//                   <span className="text-muted-foreground">Total Amount:</span>
//                   <span className="font-bold text-primary text-lg">₹{amount?.toFixed(2) || "0.00"}</span>
//                 </div>
//               </div>
//             </motion.div>

//             {/* Next Steps */}
//             <motion.div
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ delay: 0.4 }}
//               className="bg-card border border-border rounded-xl p-6 mb-6"
//             >
//               <h3 className="font-heading font-semibold text-lg mb-4">What's Next?</h3>
//               <div className="space-y-3">
//                 <div className="flex items-start gap-3">
//                   <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
//                     <span className="text-primary text-xs font-bold">1</span>
//                   </div>
//                   <p className="text-sm text-muted-foreground">
//                     A confirmation email has been sent to your registered email address
//                   </p>
//                 </div>
//                 <div className="flex items-start gap-3">
//                   <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
//                     <span className="text-primary text-xs font-bold">2</span>
//                   </div>
//                   <p className="text-sm text-muted-foreground">
//                     We'll send you a tracking number once your order is shipped
//                   </p>
//                 </div>
//                 <div className="flex items-start gap-3">
//                   <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
//                     <span className="text-primary text-xs font-bold">3</span>
//                   </div>
//                   <p className="text-sm text-muted-foreground">
//                     Estimated delivery time is 5-7 business days
//                   </p>
//                 </div>
//               </div>
//             </motion.div>

//             {/* Action Buttons */}
//             <motion.div
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ delay: 0.5 }}
//               className="grid grid-cols-1 sm:grid-cols-2 gap-4"
//             >
//               <Link
//                 to="/dashboard/orders"
//                 className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-6 py-3.5 rounded-xl font-semibold hover:bg-primary/90 transition"
//               >
//                 <Package className="w-5 h-5" />
//                 Track Your Order
//               </Link>
//               <Link
//                 to="/products"
//                 className="inline-flex items-center justify-center gap-2 bg-secondary text-secondary-foreground px-6 py-3.5 rounded-xl font-semibold hover:bg-secondary/90 transition"
//               >
//                 <ShoppingCart className="w-5 h-5" />
//                 Continue Shopping
//               </Link>
//             </motion.div>

//             {/* Additional Info */}
//             <motion.div
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ delay: 0.6 }}
//               className="mt-8 text-center"
//             >
//               <p className="text-sm text-muted-foreground mb-4">
//                 Need help? We're here for you!
//               </p>
//               <div className="flex items-center justify-center gap-4 text-sm">
//                 <a
//                   href="mailto:support@electroobuddy.com"
//                   className="flex items-center gap-2 text-primary hover:underline"
//                 >
//                   <Mail className="w-4 h-4" />
//                   support@electroobuddy.com
//                 </a>
//               </div>
//             </motion.div>
//           </motion.div>
//         </div>

//         <Footer />
//         <WhatsAppFloat />
//       </div>
//     </>
//   );
// };

// export default OrderSuccess;


import { useEffect, useRef } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  CheckCircle,
  Package,
  Mail,
  ShoppingCart,
  Share2,
  Copy,
  Printer,
} from "lucide-react";
import { toast } from "sonner";

/* ─── mini confetti canvas ────────────────────────────────────── */
const Confetti = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const COLORS = ["#3b82f6", "#22c55e", "#f59e0b", "#ec4899", "#8b5cf6"];
    const particles = Array.from({ length: 120 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * -canvas.height,
      r: Math.random() * 6 + 3,
      d: Math.random() * 2 + 1,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      tilt: Math.random() * 10 - 10,
      tiltAngle: 0,
      tiltAngleInc: Math.random() * 0.07 + 0.05,
    }));

    let frame: number;
    let elapsed = 0;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.tiltAngle += p.tiltAngleInc;
        p.y += p.d + 1;
        p.tilt = Math.sin(p.tiltAngle) * 15;
        if (p.y > canvas.height) {
          p.y = -10;
          p.x = Math.random() * canvas.width;
        }
        ctx.beginPath();
        ctx.lineWidth = p.r / 2;
        ctx.strokeStyle = p.color;
        ctx.moveTo(p.x + p.tilt + p.r / 4, p.y);
        ctx.lineTo(p.x + p.tilt, p.y + p.tilt + p.r / 4);
        ctx.stroke();
      });
      elapsed++;
      if (elapsed < 220) frame = requestAnimationFrame(draw);
    };

    frame = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-50"
      aria-hidden="true"
    />
  );
};

/* ─── main ───────────────────────────────────────────────────── */
const OrderSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { orderId, amount, paymentMethod } = location.state || {};

  useEffect(() => {
    if (!orderId) navigate("/");
  }, [orderId, navigate]);

  useEffect(() => {
    document.title = `Order Confirmed – ${orderId} | Electrobuddy`;
  }, [orderId]);

  const handleShare = async () => {
    const text = `Just placed an order on Electrobuddy! Order #${orderId}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: "Electrobuddy Order", text, url: window.location.origin });
      } catch {}
    } else {
      navigator.clipboard.writeText(text);
      toast.success("Order details copied to clipboard");
    }
  };

  if (!orderId) return null;

  return (
    <>
      <Confetti />

      <div className="order-success-page bg-gray-50 dark:bg-gray-900 min-h-screen">
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');

          .order-success-page {
            font-family: 'Poppins', sans-serif;
          }

          .order-success-page h1,
          .order-success-page h2,
          .order-success-page h3,
          .order-success-page h4,
          .order-success-page h5,
          .order-success-page h6 {
            font-weight: 700;
          }
        `}</style>
        <div className="container mx-auto px-4 py-16 max-w-2xl">
          {/* ── success icon ── */}
          <div className="text-center mb-10">
            <motion.div
              initial={{ scale: 0, rotate: -15 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
              className="w-28 h-28 mx-auto mb-6 bg-green-100 rounded-full flex items-center justify-center"
              aria-hidden="true"
            >
              <CheckCircle className="w-16 h-16 text-green-600" />
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-4xl font-heading font-bold mb-2"
            >
              Order Placed!
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-muted-foreground"
            >
              Thank you for shopping with Electrobuddy
            </motion.p>
          </div>

          {/* ── confirmation card ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="bg-card border border-border rounded-xl p-7 mb-5 shadow-sm"
          >
            <div className="flex items-start justify-between mb-5 pb-5 border-b border-border">
              <div>
                <h2 className="font-semibold text-lg mb-0.5">Order Confirmed</h2>
                <p className="text-sm text-muted-foreground">
                  A confirmation email has been sent to your inbox
                </p>
              </div>
              <Package className="w-7 h-7 text-primary flex-shrink-0" />
            </div>

            <dl className="space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Order Number</dt>
                <dd className="font-semibold font-mono">{orderId}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Payment</dt>
                <dd className="font-medium">
                  {paymentMethod === "razorpay" ? (
                    <span className="text-green-600">✓ Paid Online</span>
                  ) : (
                    "Cash on Delivery"
                  )}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Total Amount</dt>
                <dd className="font-bold text-primary text-base">
                  ₹{Number(amount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Estimated Delivery</dt>
                <dd className="font-medium">5–7 business days</dd>
              </div>
            </dl>
          </motion.div>

          {/* ── next steps ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="bg-card border border-border rounded-xl p-6 mb-5"
          >
            <h3 className="font-semibold mb-4">What happens next?</h3>
            <ol className="space-y-3">
              {[
                { n: 1, text: "A confirmation email will be sent to your registered address." },
                { n: 2, text: "Our team will verify and process your order." },
                { n: 3, text: "You'll receive a tracking number once it's shipped." },
                {
                  n: 4,
                  text:
                    paymentMethod === "cod"
                      ? "Our delivery partner will collect payment on arrival."
                      : "Your payment is secured and confirmed.",
                },
              ].map((s) => (
                <li key={s.n} className="flex items-start gap-3 text-sm">
                  <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                    {s.n}
                  </span>
                  <p className="text-muted-foreground leading-relaxed">{s.text}</p>
                </li>
              ))}
            </ol>
          </motion.div>

          {/* ── actions ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55 }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6"
          >
            <Link
              to="/dashboard/orders"
              className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-6 py-3.5 rounded-xl font-semibold hover:bg-primary/90 transition text-sm"
            >
              <Package className="w-4 h-4" />
              Track Your Order
            </Link>
            <Link
              to="/products"
              className="inline-flex items-center justify-center gap-2 bg-secondary text-secondary-foreground px-6 py-3.5 rounded-xl font-semibold hover:bg-secondary/90 transition text-sm"
            >
              <ShoppingCart className="w-4 h-4" />
              Continue Shopping
            </Link>
          </motion.div>

          {/* ── share + print ── */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.65 }}
            className="flex items-center justify-center gap-4"
          >
            <button
              onClick={handleShare}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition"
              aria-label="Share order"
            >
              <Share2 className="w-4 h-4" />
              Share
            </button>
            <span className="w-px h-4 bg-border" />
            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition"
              aria-label="Print confirmation"
            >
              <Printer className="w-4 h-4" />
              Print
            </button>
          </motion.div>

          {/* ── support ── */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="mt-10 text-center"
          >
            <p className="text-sm text-muted-foreground mb-2">Questions about your order?</p>
            <a
              href="mailto:support@electrobuddy.com"
              className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
            >
              <Mail className="w-3.5 h-3.5" />
              support@electrobuddy.com
            </a>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default OrderSuccess;