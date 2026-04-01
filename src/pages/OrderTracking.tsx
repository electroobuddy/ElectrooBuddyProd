// import { useState, useEffect } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import { supabase } from "@/integrations/supabase/client";
// import { motion } from "framer-motion";
// import { Package, Truck, CheckCircle, Clock, MapPin, Calendar, ArrowLeft, Copy, ExternalLink, RefreshCw, XCircle } from "lucide-react";
// import Navbar from "@/components/Navbar";
// import Footer from "@/components/Footer";
// import WhatsAppFloat from "@/components/WhatsAppFloat";
// import { toast } from "sonner";

// const OrderTracking = () => {
//   const { orderNumber } = useParams<{ orderNumber: string }>();
//   const navigate = useNavigate();
//   const [order, setOrder] = useState<any>(null);
//   const [loading, setLoading] = useState(true);
//   const [refreshing, setRefreshing] = useState(false);

//   useEffect(() => {
//     if (orderNumber) {
//       fetchOrderDetails();
//     }
//   }, [orderNumber]);

//   const fetchOrderDetails = async () => {
//     try {
//       const { data, error } = await supabase
//         .from("orders")
//         .select("*")
//         .eq("order_number", orderNumber!)
//         .single();

//       if (error) throw error;
//       setOrder(data);
//     } catch (error: any) {
//       console.error("Error fetching order:", error);
//       toast.error("Order not found");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const refreshTracking = async () => {
//     setRefreshing(true);
//     await fetchOrderDetails();
//     toast.success("Tracking information updated");
//     setRefreshing(false);
//   };

//   const copyTrackingNumber = () => {
//     if (order?.tracking_number) {
//       navigator.clipboard.writeText(order.tracking_number);
//       toast.success("Tracking number copied to clipboard");
//     }
//   };

//   const getStatusIcon = (status: string) => {
//     switch (status) {
//       case "pending": return <Clock className="w-6 h-6" />;
//       case "confirmed": return <CheckCircle className="w-6 h-6" />;
//       case "processing": return <Package className="w-6 h-6" />;
//       case "shipped": return <Truck className="w-6 h-6" />;
//       case "out_for_delivery": return <MapPin className="w-6 h-6" />;
//       case "delivered": return <CheckCircle className="w-6 h-6 text-green-600" />;
//       case "cancelled": return <XCircle className="w-6 h-6 text-red-600" />;
//       default: return <Clock className="w-6 h-6" />;
//     }
//   };

//   const getStatusColor = (status: string) => {
//     switch (status) {
//       case "pending": return "bg-yellow-100 text-yellow-800 border-yellow-300";
//       case "confirmed": return "bg-blue-100 text-blue-800 border-blue-300";
//       case "processing": return "bg-purple-100 text-purple-800 border-purple-300";
//       case "shipped": return "bg-indigo-100 text-indigo-800 border-indigo-300";
//       case "out_for_delivery": return "bg-orange-100 text-orange-800 border-orange-300";
//       case "delivered": return "bg-green-100 text-green-800 border-green-300";
//       case "cancelled": return "bg-red-100 text-red-800 border-red-300";
//       default: return "bg-gray-100 text-gray-800 border-gray-300";
//     }
//   };

//   const getProgressPercentage = () => {
//     if (!order) return 0;
//     const statusOrder = ["pending", "confirmed", "processing", "shipped", "out_for_delivery", "delivered"];
//     const currentIndex = statusOrder.indexOf(order.status);
//     return ((currentIndex + 1) / statusOrder.length) * 100;
//   };

//   if (loading) {
//     return (
//       <>
//         <Navbar />
//         <div className="min-h-screen flex items-center justify-center">
//           <div className="text-center">
//             <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
//             <p className="text-muted-foreground">Loading tracking details...</p>
//           </div>
//         </div>
//         <Footer />
//       </>
//     );
//   }

//   if (!order) {
//     return (
//       <>
//         <Navbar />
//         <div className="min-h-screen flex items-center justify-center">
//           <div className="text-center max-w-md">
//             <h1 className="text-2xl font-bold mb-4">Order Not Found</h1>
//             <p className="text-muted-foreground mb-6">
//               We couldn't find an order with this number. Please check your order number and try again.
//             </p>
//             <button onClick={() => navigate("/")} className="btn-primary">
//               Back to Home
//             </button>
//           </div>
//         </div>
//         <Footer />
//       </>
//     );
//   }

//   return (
//     <>
//       <Navbar />
//       <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-12">
//         <div className="container mx-auto px-4 max-w-4xl">
//           {/* Header */}
//           <motion.div
//             initial={{ opacity: 0, y: -20 }}
//             animate={{ opacity: 1, y: 0 }}
//             className="mb-8"
//           >
//             <button
//               onClick={() => navigate(-1)}
//               className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4"
//             >
//               <ArrowLeft className="w-4 h-4" />
//               Back
//             </button>
            
//             <div className="flex items-center justify-between">
//               <div>
//                 <h1 className="text-4xl font-bold mb-2">Track Your Order</h1>
//                 <p className="text-muted-foreground text-lg">Order #{order.order_number}</p>
//               </div>
//               <button
//                 onClick={refreshTracking}
//                 disabled={refreshing}
//                 className="btn-secondary flex items-center gap-2"
//               >
//                 <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
//                 {refreshing ? 'Updating...' : 'Refresh'}
//               </button>
//             </div>
//           </motion.div>

//           {/* Order Status Card */}
//           <motion.div
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ delay: 0.1 }}
//             className="bg-card border-2 rounded-xl p-6 mb-6 shadow-lg"
//           >
//             <div className="flex items-center justify-between mb-6">
//               <div>
//                 <h2 className="text-2xl font-bold mb-1">Current Status</h2>
//                 <p className="text-muted-foreground">
//                   Last updated: {new Date(order.updated_at).toLocaleString()}
//                 </p>
//               </div>
//               <span className={`px-6 py-3 rounded-full text-lg font-bold border-2 ${getStatusColor(order.status)}`}>
//                 {order.status.replace('_', ' ').toUpperCase()}
//               </span>
//             </div>

//             {/* Progress Bar */}
//             <div className="relative">
//               <div className="h-3 bg-muted rounded-full overflow-hidden">
//                 <motion.div
//                   initial={{ width: 0 }}
//                   animate={{ width: `${getProgressPercentage()}%` }}
//                   transition={{ duration: 1, delay: 0.3 }}
//                   className="h-full bg-gradient-to-r from-primary to-primary/70 rounded-full"
//                 />
//               </div>
//               <div className="flex justify-between mt-3 text-xs text-muted-foreground">
//                 <span>Placed</span>
//                 <span>Confirmed</span>
//                 <span>Processing</span>
//                 <span>Shipped</span>
//                 <span>Out for Delivery</span>
//                 <span>Delivered</span>
//               </div>
//             </div>
//           </motion.div>

//           {/* Tracking Information */}
//           {order.tracking_number && (
//             <motion.div
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ delay: 0.2 }}
//               className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-6 mb-6"
//             >
//               <div className="flex items-center gap-3 mb-4">
//                 <Truck className="w-6 h-6 text-blue-600" />
//                 <h2 className="text-xl font-bold text-blue-900">Tracking Details</h2>
//               </div>

//               <div className="grid md:grid-cols-2 gap-4">
//                 <div>
//                   <p className="text-sm font-medium text-blue-700 mb-1">AWB / Tracking Number:</p>
//                   <div className="flex items-center gap-2">
//                     <code className="text-xl font-bold bg-white px-4 py-2 rounded-lg border border-blue-200 flex-1">
//                       {order.tracking_number}
//                     </code>
//                     <button
//                       onClick={copyTrackingNumber}
//                       className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition"
//                       title="Copy tracking number"
//                     >
//                       <Copy className="w-5 h-5" />
//                     </button>
//                   </div>
//                 </div>

//                 <div>
//                   <p className="text-sm font-medium text-blue-700 mb-1">Courier Partner:</p>
//                   <p className="text-xl font-bold text-blue-900 bg-white px-4 py-2 rounded-lg border border-blue-200">
//                     {order.courier_name || 'Shiprocket'}
//                   </p>
//                 </div>

//                 {order.estimated_delivery_date && (
//                   <div className="md:col-span-2">
//                     <p className="text-sm font-medium text-blue-700 mb-1 flex items-center gap-2">
//                       <Calendar className="w-4 h-4" />
//                       Estimated Delivery:
//                     </p>
//                     <p className="text-2xl font-bold text-blue-900 bg-white px-4 py-2 rounded-lg border border-blue-200 inline-block">
//                       {new Date(order.estimated_delivery_date).toLocaleDateString('en-IN', {
//                         weekday: 'long',
//                         year: 'numeric',
//                         month: 'long',
//                         day: 'numeric'
//                       })}
//                     </p>
//                   </div>
//                 )}
//               </div>

//               {order.shiprocket_order_id && (
//                 <div className="mt-4 pt-4 border-t border-blue-200">
//                   <div className="grid md:grid-cols-2 gap-4 text-sm">
//                     <div>
//                       <span className="text-blue-700 font-medium">Shiprocket Order ID:</span>
//                       <p className="font-mono font-bold text-blue-900">{order.shiprocket_order_id}</p>
//                     </div>
//                     {order.shiprocket_shipment_id && (
//                       <div>
//                         <span className="text-blue-700 font-medium">Shipment ID:</span>
//                         <p className="font-mono font-bold text-blue-900">{order.shiprocket_shipment_id}</p>
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               )}
//             </motion.div>
//           )}

//           {/* Tracking History Timeline */}
//           {order.tracking_history && Array.isArray(order.tracking_history) && order.tracking_history.length > 0 && (
//             <motion.div
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ delay: 0.3 }}
//               className="bg-card border rounded-xl p-6 mb-6"
//             >
//               <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
//                 <MapPin className="w-6 h-6" />
//                 Tracking History
//               </h2>
//               <div className="space-y-3">
//                 {order.tracking_history.map((event: any, index: number) => (
//                   <motion.div
//                     key={index}
//                     initial={{ opacity: 0, x: -20 }}
//                     animate={{ opacity: 1, x: 0 }}
//                     transition={{ delay: 0.4 + (index * 0.1) }}
//                     className="flex items-start gap-4 p-4 bg-muted/50 rounded-lg"
//                   >
//                     <div className="w-3 h-3 rounded-full bg-primary mt-1.5 flex-shrink-0" />
//                     <div className="flex-1">
//                       <p className="font-semibold text-lg">{event.message || event.location || 'Status update'}</p>
//                       {event.timestamp && (
//                         <p className="text-sm text-muted-foreground mt-1">
//                           {new Date(event.timestamp).toLocaleString('en-IN', {
//                             dateStyle: 'medium',
//                             timeStyle: 'short'
//                           })}
//                         </p>
//                       )}
//                     </div>
//                   </motion.div>
//                 ))}
//               </div>
//             </motion.div>
//           )}

//           {/* Order Summary */}
//           <motion.div
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ delay: 0.4 }}
//             className="bg-card border rounded-xl p-6 mb-6"
//           >
//             <h2 className="text-xl font-bold mb-4">Order Summary</h2>
//             <div className="space-y-3">
//               <div className="flex justify-between text-sm">
//                 <span className="text-muted-foreground">Subtotal:</span>
//                 <span className="font-medium">₹{(order.subtotal || order.total_amount - 100).toFixed(2)}</span>
//               </div>
//               {order.shipping_charge !== undefined && (
//                 <div className="flex justify-between text-sm">
//                   <span className="text-muted-foreground">Shipping:</span>
//                   <span className="font-medium">₹{order.shipping_charge.toFixed(2)}</span>
//                 </div>
//               )}
//               {order.installation_total && (
//                 <div className="flex justify-between text-sm">
//                   <span className="text-muted-foreground">Installation:</span>
//                   <span className="font-medium">₹{order.installation_total.toFixed(2)}</span>
//                 </div>
//               )}
//               <div className="border-t pt-3 flex justify-between text-lg font-bold">
//                 <span>Total Paid:</span>
//                 <span className="text-primary">₹{order.total_amount.toFixed(2)}</span>
//               </div>
//             </div>
//           </motion.div>

//           {/* Shipping Address */}
//           {order.shipping_address_data && (
//             <motion.div
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ delay: 0.5 }}
//               className="bg-card border rounded-xl p-6"
//             >
//               <h2 className="text-xl font-bold mb-4">Shipping Address</h2>
//               <div className="text-muted-foreground space-y-1">
//                 <p className="font-medium text-foreground">{order.shipping_address_data.full_name || 'Customer'}</p>
//                 <p>{order.shipping_address_data.address_line1}</p>
//                 {order.shipping_address_data.address_line2 && (
//                   <p>{order.shipping_address_data.address_line2}</p>
//                 )}
//                 <p>
//                   {order.shipping_address_data.city}, {order.shipping_address_data.state} {order.shipping_address_data.postal_code}
//                 </p>
//                 {order.shipping_address_data.phone && (
//                   <p className="pt-2">📞 {order.shipping_address_data.phone}</p>
//                 )}
//               </div>
//             </motion.div>
//           )}
//         </div>
//       </div>
//       <Footer />
//       <WhatsAppFloat />
//     </>
//   );
// };

// export default OrderTracking;


import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import {
  Package,
  Truck,
  CheckCircle,
  Clock,
  MapPin,
  Calendar,
  ArrowLeft,
  Copy,
  ExternalLink,
  RefreshCw,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";

/* ─── types ──────────────────────────────────────────────────── */
type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "out_for_delivery"
  | "delivered"
  | "cancelled";

const STATUS_STEPS: OrderStatus[] = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "out_for_delivery",
  "delivered",
];

const STATUS_META: Record<
  OrderStatus,
  { label: string; icon: React.ReactNode; color: string; bg: string }
> = {
  pending: {
    label: "Pending",
    icon: <Clock className="w-4 h-4" />,
    color: "text-yellow-700",
    bg: "bg-yellow-50 border-yellow-300",
  },
  confirmed: {
    label: "Confirmed",
    icon: <CheckCircle className="w-4 h-4" />,
    color: "text-blue-700",
    bg: "bg-blue-50 border-blue-300",
  },
  processing: {
    label: "Processing",
    icon: <Package className="w-4 h-4" />,
    color: "text-purple-700",
    bg: "bg-purple-50 border-purple-300",
  },
  shipped: {
    label: "Shipped",
    icon: <Truck className="w-4 h-4" />,
    color: "text-indigo-700",
    bg: "bg-indigo-50 border-indigo-300",
  },
  out_for_delivery: {
    label: "Out for Delivery",
    icon: <MapPin className="w-4 h-4" />,
    color: "text-orange-700",
    bg: "bg-orange-50 border-orange-300",
  },
  delivered: {
    label: "Delivered",
    icon: <CheckCircle className="w-4 h-4" />,
    color: "text-green-700",
    bg: "bg-green-50 border-green-300",
  },
  cancelled: {
    label: "Cancelled",
    icon: <XCircle className="w-4 h-4" />,
    color: "text-red-700",
    bg: "bg-red-50 border-red-300",
  },
};

/* ─── auto-refresh interval (ms) ─────────────────────────────── */
const REFRESH_INTERVAL = 60_000; // 60 s

/* ─── courier tracking URL builders ─────────────────────────── */
const buildCourierLink = (courier: string, awb: string): string | null => {
  const c = (courier || "").toLowerCase();
  if (c.includes("delhivery")) return `https://www.delhivery.com/track/package/${awb}`;
  if (c.includes("bluedart")) return `https://www.bluedart.com/tracking?trackfor=${awb}`;
  if (c.includes("dtdc")) return `https://www.dtdc.in/tracking.asp?Ttype=consignment&cno=${awb}`;
  if (c.includes("ecom")) return `https://ecomexpress.in/tracking/?awb_field=${awb}`;
  if (c.includes("xpressbees")) return `https://www.xpressbees.com/shipment/tracking?trackingNumber=${awb}`;
  return null;
};

/* ─── skeleton ──────────────────────────────────────────────── */
const Skeleton = () => (
  <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-12">
    <div className="container mx-auto px-4 max-w-3xl space-y-5">
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-36 bg-card border border-border rounded-xl animate-pulse" />
      ))}
    </div>
  </div>
);

/* ─── step tracker ───────────────────────────────────────────── */
const StepTracker = ({ status }: { status: OrderStatus }) => {
  const idx = STATUS_STEPS.indexOf(status);
  const isCancelled = status === "cancelled";

  if (isCancelled) {
    return (
      <div className="flex items-center gap-2 text-red-600 font-medium text-sm py-2">
        <XCircle className="w-5 h-5" />
        This order has been cancelled
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <div className="flex items-center gap-1">
        {STATUS_STEPS.map((s, i) => {
          const done = i <= idx;
          const current = i === idx;
          return (
            <div key={s} className="flex items-center flex-1 last:flex-none">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 border-2 transition-all duration-300 ${
                  done
                    ? current
                      ? "border-primary bg-primary text-white scale-110"
                      : "border-green-500 bg-green-500 text-white"
                    : "border-muted-foreground/30 bg-background text-muted-foreground"
                }`}
                title={STATUS_META[s].label}
                aria-label={`${STATUS_META[s].label}: ${done ? "completed" : "pending"}`}
              >
                {done && !current ? (
                  <CheckCircle className="w-3.5 h-3.5" />
                ) : (
                  <span className="text-[10px] font-bold">{i + 1}</span>
                )}
              </div>
              {i < STATUS_STEPS.length - 1 && (
                <div
                  className={`h-0.5 flex-1 mx-0.5 transition-all duration-500 ${
                    i < idx ? "bg-green-500" : "bg-muted"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
      <div className="flex justify-between text-[9px] text-muted-foreground px-0.5 mt-1">
        {STATUS_STEPS.map((s) => (
          <span key={s} className="text-center leading-tight" style={{ width: `${100 / STATUS_STEPS.length}%` }}>
            {STATUS_META[s].label}
          </span>
        ))}
      </div>
    </div>
  );
};

/* ─── main ───────────────────────────────────────────────────── */
const OrderTracking = () => {
  const { orderNumber } = useParams<{ orderNumber: string }>();
  const navigate = useNavigate();

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState(new Date());
  const [notFound, setNotFound] = useState(false);

  const fetchOrder = useCallback(async (silent = false) => {
    if (!orderNumber) return;
    if (!silent) setLoading(true);
    try {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("order_number", orderNumber)
        .single();
      if (error || !data) {
        setNotFound(true);
      } else {
        setOrder(data);
        setLastRefreshed(new Date());
      }
    } catch {
      if (!silent) setNotFound(true);
    } finally {
      setLoading(false);
    }
  }, [orderNumber]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  /* auto-refresh for in-transit orders */
  useEffect(() => {
    if (!order) return;
    const inTransit = ["confirmed", "processing", "shipped", "out_for_delivery"].includes(order.status);
    if (!inTransit) return;
    const t = setInterval(() => fetchOrder(true), REFRESH_INTERVAL);
    return () => clearInterval(t);
  }, [order, fetchOrder]);

  /* SEO */
  useEffect(() => {
    if (order) document.title = `Track Order #${order.order_number} | Electrobuddy`;
  }, [order]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchOrder(true);
    toast.success("Tracking updated");
    setRefreshing(false);
  };

  const copyAWB = () => {
    if (order?.tracking_number) {
      navigator.clipboard.writeText(order.tracking_number);
      toast.success("Tracking number copied");
    }
  };

  /* ── states ── */
  if (loading) return <Skeleton />;

  if (notFound) {
    return (
      <div className="order-tracking-page bg-gray-50 dark:bg-gray-900 min-h-screen flex items-center justify-center px-4">
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
    
          .order-tracking-page {
            font-family: 'Poppins', sans-serif;
          }
        `}</style>
        <div className="text-center max-w-sm">
          <AlertCircle className="w-14 h-14 text-muted-foreground opacity-40 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Order Not Found</h1>
          <p className="text-muted-foreground text-sm mb-6">
            We couldn't find an order with number <strong>{orderNumber}</strong>. Please check and try again.
          </p>
          <button
            onClick={() => navigate("/")}
            className="bg-primary text-primary-foreground px-6 py-2.5 rounded-lg font-medium hover:bg-primary/90 transition text-sm"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  const meta = STATUS_META[order.status as OrderStatus] ?? STATUS_META.pending;
  const courierLink = order.tracking_number
    ? buildCourierLink(order.courier_name ?? "", order.tracking_number)
    : null;

  return (
    <div className="order-tracking-page bg-gray-50 dark:bg-gray-900 min-h-screen py-10">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');

        .order-tracking-page {
          font-family: 'Poppins', sans-serif;
        }

        .order-tracking-page h1,
        .order-tracking-page h2,
        .order-tracking-page h3,
        .order-tracking-page h4,
        .order-tracking-page h5,
        .order-tracking-page h6 {
          font-weight: 700;
        }
      `}</style>
      <div className="container mx-auto px-4 max-w-3xl">
        {/* header */}
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="mb-7">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-heading font-bold mb-0.5">Track Order</h1>
              <p className="text-muted-foreground text-sm font-mono">#{order.order_number}</p>
            </div>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground border border-border px-3 py-2 rounded-lg transition disabled:opacity-50 flex-shrink-0"
              aria-busy={refreshing}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
              {refreshing ? "Updating…" : "Refresh"}
            </button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Last updated: {lastRefreshed.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
          </p>
        </motion.div>

        {/* status card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-card border-2 border-border rounded-xl p-6 mb-5 shadow-sm"
        >
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-lg font-bold mb-0.5">Current Status</h2>
              <p className="text-xs text-muted-foreground">
                Updated {new Date(order.updated_at).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
              </p>
            </div>
            <span
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold border-2 ${meta.color} ${meta.bg}`}
              role="status"
            >
              {meta.icon}
              {meta.label}
            </span>
          </div>

          <StepTracker status={order.status as OrderStatus} />
        </motion.div>

        {/* tracking info */}
        <AnimatePresence>
          {order.tracking_number && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-6 mb-5 overflow-hidden"
            >
              <div className="flex items-center gap-2 mb-4">
                <Truck className="w-5 h-5 text-blue-600" />
                <h2 className="text-lg font-bold text-blue-900">Tracking Details</h2>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-medium text-blue-700 mb-1">AWB / Tracking Number</p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 text-sm font-bold bg-white px-3 py-2 rounded-lg border border-blue-200 truncate">
                      {order.tracking_number}
                    </code>
                    <button
                      onClick={copyAWB}
                      className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition flex-shrink-0"
                      aria-label="Copy tracking number"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div>
                  <p className="text-xs font-medium text-blue-700 mb-1">Courier Partner</p>
                  <div className="flex items-center gap-2">
                    <p className="flex-1 text-sm font-bold bg-white px-3 py-2 rounded-lg border border-blue-200">
                      {order.courier_name || "Shiprocket"}
                    </p>
                    {courierLink && (
                      <a
                        href={courierLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition flex-shrink-0"
                        aria-label="Track on courier website"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>

                {order.estimated_delivery_date && (
                  <div className="sm:col-span-2">
                    <p className="text-xs font-medium text-blue-700 mb-1 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      Estimated Delivery
                    </p>
                    <p className="text-base font-bold text-blue-900 bg-white px-3 py-2 rounded-lg border border-blue-200 inline-block">
                      {new Date(order.estimated_delivery_date).toLocaleDateString("en-IN", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                )}

                {courierLink && (
                  <div className="sm:col-span-2 pt-2 border-t border-blue-200">
                    <a
                      href={courierLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm text-blue-700 font-semibold hover:underline"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Track on {order.courier_name || "Shiprocket"} website
                    </a>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* timeline */}
        {Array.isArray(order.tracking_history) && order.tracking_history.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-card border border-border rounded-xl p-6 mb-5"
          >
            <h2 className="text-base font-bold mb-4 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary" />
              Tracking History
            </h2>
            <ol className="relative border-l border-muted ml-2 space-y-4">
              {(order.tracking_history as any[]).map((event, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + i * 0.06 }}
                  className="ml-5 relative"
                >
                  <span className="absolute -left-[26px] top-1 w-3 h-3 rounded-full bg-primary border-2 border-background" />
                  <p className="text-sm font-medium leading-snug">
                    {event.message || event.location || "Status update"}
                  </p>
                  {event.timestamp && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {new Date(event.timestamp).toLocaleString("en-IN", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </p>
                  )}
                  {event.location && event.message && (
                    <p className="text-xs text-muted-foreground">{event.location}</p>
                  )}
                </motion.li>
              ))}
            </ol>
          </motion.div>
        )}

        {/* order summary */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card border border-border rounded-xl p-6 mb-5"
        >
          <h2 className="text-base font-bold mb-4">Order Summary</h2>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Subtotal</dt>
              <dd>₹{Number(order.subtotal || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</dd>
            </div>
            {order.shipping_charge != null && (
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Shipping</dt>
                <dd>
                  {order.shipping_charge === 0 ? (
                    <span className="text-green-600 font-semibold">FREE</span>
                  ) : (
                    `₹${Number(order.shipping_charge).toFixed(2)}`
                  )}
                </dd>
              </div>
            )}
            {order.installation_total > 0 && (
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Installation</dt>
                <dd>₹{Number(order.installation_total).toFixed(2)}</dd>
              </div>
            )}
            <div className="border-t border-border pt-3 flex justify-between font-bold text-base">
              <dt>Total Paid</dt>
              <dd className="text-primary">
                ₹{Number(order.total_amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </dd>
            </div>
          </dl>
        </motion.div>

        {/* shipping address */}
        {order.shipping_address_data && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="bg-card border border-border rounded-xl p-6"
          >
            <h2 className="text-base font-bold mb-3">Shipping Address</h2>
            <address className="not-italic text-sm text-muted-foreground space-y-0.5">
              <p className="font-medium text-foreground">{order.shipping_address_data.full_name}</p>
              <p>{order.shipping_address_data.address_line1}</p>
              {order.shipping_address_data.address_line2 && (
                <p>{order.shipping_address_data.address_line2}</p>
              )}
              <p>
                {order.shipping_address_data.city}, {order.shipping_address_data.state} –{" "}
                {order.shipping_address_data.postal_code}
              </p>
              {order.shipping_address_data.phone && (
                <p className="pt-1">📞 +91 {order.shipping_address_data.phone}</p>
              )}
            </address>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default OrderTracking;