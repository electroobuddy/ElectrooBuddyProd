import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { Package, Truck, CheckCircle, Clock, MapPin, Calendar, ArrowLeft, Copy, ExternalLink, RefreshCw, XCircle } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import { toast } from "sonner";

const OrderTracking = () => {
  const { orderNumber } = useParams<{ orderNumber: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (orderNumber) {
      fetchOrderDetails();
    }
  }, [orderNumber]);

  const fetchOrderDetails = async () => {
    try {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("order_number", orderNumber!)
        .single();

      if (error) throw error;
      setOrder(data);
    } catch (error: any) {
      console.error("Error fetching order:", error);
      toast.error("Order not found");
    } finally {
      setLoading(false);
    }
  };

  const refreshTracking = async () => {
    setRefreshing(true);
    await fetchOrderDetails();
    toast.success("Tracking information updated");
    setRefreshing(false);
  };

  const copyTrackingNumber = () => {
    if (order?.tracking_number) {
      navigator.clipboard.writeText(order.tracking_number);
      toast.success("Tracking number copied to clipboard");
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending": return <Clock className="w-6 h-6" />;
      case "confirmed": return <CheckCircle className="w-6 h-6" />;
      case "processing": return <Package className="w-6 h-6" />;
      case "shipped": return <Truck className="w-6 h-6" />;
      case "out_for_delivery": return <MapPin className="w-6 h-6" />;
      case "delivered": return <CheckCircle className="w-6 h-6 text-green-600" />;
      case "cancelled": return <XCircle className="w-6 h-6 text-red-600" />;
      default: return <Clock className="w-6 h-6" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "confirmed": return "bg-blue-100 text-blue-800 border-blue-300";
      case "processing": return "bg-purple-100 text-purple-800 border-purple-300";
      case "shipped": return "bg-indigo-100 text-indigo-800 border-indigo-300";
      case "out_for_delivery": return "bg-orange-100 text-orange-800 border-orange-300";
      case "delivered": return "bg-green-100 text-green-800 border-green-300";
      case "cancelled": return "bg-red-100 text-red-800 border-red-300";
      default: return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const getProgressPercentage = () => {
    if (!order) return 0;
    const statusOrder = ["pending", "confirmed", "processing", "shipped", "out_for_delivery", "delivered"];
    const currentIndex = statusOrder.indexOf(order.status);
    return ((currentIndex + 1) / statusOrder.length) * 100;
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading tracking details...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (!order) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center max-w-md">
            <h1 className="text-2xl font-bold mb-4">Order Not Found</h1>
            <p className="text-muted-foreground mb-6">
              We couldn't find an order with this number. Please check your order number and try again.
            </p>
            <button onClick={() => navigate("/")} className="btn-primary">
              Back to Home
            </button>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
            
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold mb-2">Track Your Order</h1>
                <p className="text-muted-foreground text-lg">Order #{order.order_number}</p>
              </div>
              <button
                onClick={refreshTracking}
                disabled={refreshing}
                className="btn-secondary flex items-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                {refreshing ? 'Updating...' : 'Refresh'}
              </button>
            </div>
          </motion.div>

          {/* Order Status Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-card border-2 rounded-xl p-6 mb-6 shadow-lg"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold mb-1">Current Status</h2>
                <p className="text-muted-foreground">
                  Last updated: {new Date(order.updated_at).toLocaleString()}
                </p>
              </div>
              <span className={`px-6 py-3 rounded-full text-lg font-bold border-2 ${getStatusColor(order.status)}`}>
                {order.status.replace('_', ' ').toUpperCase()}
              </span>
            </div>

            {/* Progress Bar */}
            <div className="relative">
              <div className="h-3 bg-muted rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${getProgressPercentage()}%` }}
                  transition={{ duration: 1, delay: 0.3 }}
                  className="h-full bg-gradient-to-r from-primary to-primary/70 rounded-full"
                />
              </div>
              <div className="flex justify-between mt-3 text-xs text-muted-foreground">
                <span>Placed</span>
                <span>Confirmed</span>
                <span>Processing</span>
                <span>Shipped</span>
                <span>Out for Delivery</span>
                <span>Delivered</span>
              </div>
            </div>
          </motion.div>

          {/* Tracking Information */}
          {order.tracking_number && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-6 mb-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <Truck className="w-6 h-6 text-blue-600" />
                <h2 className="text-xl font-bold text-blue-900">Tracking Details</h2>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-blue-700 mb-1">AWB / Tracking Number:</p>
                  <div className="flex items-center gap-2">
                    <code className="text-xl font-bold bg-white px-4 py-2 rounded-lg border border-blue-200 flex-1">
                      {order.tracking_number}
                    </code>
                    <button
                      onClick={copyTrackingNumber}
                      className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition"
                      title="Copy tracking number"
                    >
                      <Copy className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium text-blue-700 mb-1">Courier Partner:</p>
                  <p className="text-xl font-bold text-blue-900 bg-white px-4 py-2 rounded-lg border border-blue-200">
                    {order.courier_name || 'Shiprocket'}
                  </p>
                </div>

                {order.estimated_delivery_date && (
                  <div className="md:col-span-2">
                    <p className="text-sm font-medium text-blue-700 mb-1 flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Estimated Delivery:
                    </p>
                    <p className="text-2xl font-bold text-blue-900 bg-white px-4 py-2 rounded-lg border border-blue-200 inline-block">
                      {new Date(order.estimated_delivery_date).toLocaleDateString('en-IN', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                )}
              </div>

              {order.shiprocket_order_id && (
                <div className="mt-4 pt-4 border-t border-blue-200">
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-blue-700 font-medium">Shiprocket Order ID:</span>
                      <p className="font-mono font-bold text-blue-900">{order.shiprocket_order_id}</p>
                    </div>
                    {order.shiprocket_shipment_id && (
                      <div>
                        <span className="text-blue-700 font-medium">Shipment ID:</span>
                        <p className="font-mono font-bold text-blue-900">{order.shiprocket_shipment_id}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* Tracking History Timeline */}
          {order.tracking_history && Array.isArray(order.tracking_history) && order.tracking_history.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-card border rounded-xl p-6 mb-6"
            >
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <MapPin className="w-6 h-6" />
                Tracking History
              </h2>
              <div className="space-y-3">
                {order.tracking_history.map((event: any, index: number) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + (index * 0.1) }}
                    className="flex items-start gap-4 p-4 bg-muted/50 rounded-lg"
                  >
                    <div className="w-3 h-3 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="font-semibold text-lg">{event.message || event.location || 'Status update'}</p>
                      {event.timestamp && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {new Date(event.timestamp).toLocaleString('en-IN', {
                            dateStyle: 'medium',
                            timeStyle: 'short'
                          })}
                        </p>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Order Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-card border rounded-xl p-6 mb-6"
          >
            <h2 className="text-xl font-bold mb-4">Order Summary</h2>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal:</span>
                <span className="font-medium">₹{(order.subtotal || order.total_amount - 100).toFixed(2)}</span>
              </div>
              {order.shipping_charge !== undefined && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping:</span>
                  <span className="font-medium">₹{order.shipping_charge.toFixed(2)}</span>
                </div>
              )}
              {order.installation_total && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Installation:</span>
                  <span className="font-medium">₹{order.installation_total.toFixed(2)}</span>
                </div>
              )}
              <div className="border-t pt-3 flex justify-between text-lg font-bold">
                <span>Total Paid:</span>
                <span className="text-primary">₹{order.total_amount.toFixed(2)}</span>
              </div>
            </div>
          </motion.div>

          {/* Shipping Address */}
          {order.shipping_address_data && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-card border rounded-xl p-6"
            >
              <h2 className="text-xl font-bold mb-4">Shipping Address</h2>
              <div className="text-muted-foreground space-y-1">
                <p className="font-medium text-foreground">{order.shipping_address_data.full_name || 'Customer'}</p>
                <p>{order.shipping_address_data.address_line1}</p>
                {order.shipping_address_data.address_line2 && (
                  <p>{order.shipping_address_data.address_line2}</p>
                )}
                <p>
                  {order.shipping_address_data.city}, {order.shipping_address_data.state} {order.shipping_address_data.postal_code}
                </p>
                {order.shipping_address_data.phone && (
                  <p className="pt-2">📞 {order.shipping_address_data.phone}</p>
                )}
              </div>
            </motion.div>
          )}
        </div>
      </div>
      <Footer />
      <WhatsAppFloat />
    </>
  );
};

export default OrderTracking;
