import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { Package, Truck, CheckCircle, Clock, XCircle, ChevronRight, Eye } from "lucide-react";
import { Link } from "react-router-dom";

interface Order {
  id: string;
  order_number: string;
  status: string;
  payment_status: string;
  fulfillment_status: string;
  total_amount: number;
  ordered_at: string;
  items?: any[];
  shipping_address?: any;
}

const UserOrders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (!user) return;
    fetchOrders();
  }, [user]);

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("user_id", user.id)
        .order("ordered_at", { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case "confirmed":
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case "processing":
        return <Package className="w-5 h-5 text-blue-600" />;
      case "shipped":
        return <Truck className="w-5 h-5 text-purple-600" />;
      case "delivered":
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case "cancelled":
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Clock className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "confirmed":
        return "bg-green-100 text-green-800";
      case "processing":
        return "bg-blue-100 text-blue-800";
      case "shipped":
        return "bg-purple-100 text-purple-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-heading font-bold text-foreground mb-1">My Orders</h1>
        <p className="text-sm text-muted-foreground mb-8">Track and manage your orders</p>
      </motion.div>

      {orders.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card border border-border rounded-xl p-12 text-center"
        >
          <Package className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-20" />
          <h3 className="text-xl font-heading font-semibold mb-2">No Orders Yet</h3>
          <p className="text-muted-foreground mb-6">You haven't placed any orders yet</p>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition"
          >
            Browse Products
            <ChevronRight className="w-4 h-4" />
          </Link>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-4"
        >
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    {getStatusIcon(order.status)}
                    <h3 className="font-heading font-semibold text-lg">
                      Order #{order.order_number}
                    </h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Placed on {new Date(order.ordered_at).toLocaleDateString('en-IN', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    order.payment_status === "paid" 
                      ? "bg-green-100 text-green-800" 
                      : "bg-yellow-100 text-yellow-800"
                  }`}>
                    Payment: {order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1)}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 pb-4 border-b border-border">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Total Amount</p>
                  <p className="text-lg font-bold text-primary">₹{order.total_amount.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Fulfillment</p>
                  <p className="text-sm font-medium">{order.fulfillment_status?.charAt(0).toUpperCase() + order.fulfillment_status?.slice(1) || "Pending"}</p>
                </div>
                <div className="md:text-right">
                  <button
                    onClick={() => setSelectedOrder(selectedOrder?.id === order.id ? null : order)}
                    className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition font-medium"
                  >
                    <Eye className="w-4 h-4" />
                    {selectedOrder?.id === order.id ? "Hide Details" : "View Details"}
                  </button>
                </div>
              </div>

              {selectedOrder?.id === order.id && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="space-y-4 pt-4"
                >
                  {/* Order Items */}
                  <div>
                    <h4 className="font-semibold mb-3">Order Items</h4>
                    <div className="space-y-2">
                      {order.items?.map((item, index) => (
                        <div key={index} className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
                          {item.product_image && (
                            <img
                              src={item.product_image}
                              alt={item.product_name}
                              className="w-16 h-16 object-cover rounded"
                            />
                          )}
                          <div className="flex-1">
                            <p className="font-medium">{item.product_name}</p>
                            <p className="text-sm text-muted-foreground">
                              Quantity: {item.quantity} × ₹{item.price?.toFixed(2)}
                            </p>
                          </div>
                          <p className="font-semibold">₹{(item.quantity * item.price).toFixed(2)}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Shipping Address */}
                  {order.shipping_address && (
                    <div>
                      <h4 className="font-semibold mb-3">Shipping Address</h4>
                      <div className="p-4 bg-muted/50 rounded-lg">
                        <p className="text-sm">{order.shipping_address.full_name}</p>
                        <p className="text-sm">{order.shipping_address.address_line1}</p>
                        {order.shipping_address.address_line2 && (
                          <p className="text-sm">{order.shipping_address.address_line2}</p>
                        )}
                        <p className="text-sm">
                          {order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.postal_code}
                        </p>
                        {order.shipping_address.phone && (
                          <p className="text-sm mt-2">Phone: {order.shipping_address.phone}</p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Order Timeline (Placeholder) */}
                  <div>
                    <h4 className="font-semibold mb-3">Order Timeline</h4>
                    <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                      <div className="text-center">
                        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-1">
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        </div>
                        <p className="text-xs font-medium">Order Placed</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(order.ordered_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex-1 h-1 bg-muted mx-4"></div>
                      <div className="text-center">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-1 ${
                          ['confirmed', 'processing', 'shipped', 'delivered'].includes(order.status)
                            ? "bg-green-100"
                            : "bg-gray-100"
                        }`}>
                          <CheckCircle className={`w-5 h-5 ${
                            ['confirmed', 'processing', 'shipped', 'delivered'].includes(order.status)
                              ? "text-green-600"
                              : "text-gray-400"
                          }`} />
                        </div>
                        <p className="text-xs font-medium">Confirmed</p>
                      </div>
                      <div className="flex-1 h-1 bg-muted mx-4"></div>
                      <div className="text-center">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-1 ${
                          ['processing', 'shipped', 'delivered'].includes(order.status)
                            ? "bg-blue-100"
                            : "bg-gray-100"
                        }`}>
                          <Package className={`w-5 h-5 ${
                            ['processing', 'shipped', 'delivered'].includes(order.status)
                              ? "text-blue-600"
                              : "text-gray-400"
                          }`} />
                        </div>
                        <p className="text-xs font-medium">Processing</p>
                      </div>
                      <div className="flex-1 h-1 bg-muted mx-4"></div>
                      <div className="text-center">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-1 ${
                          ['shipped', 'delivered'].includes(order.status)
                            ? "bg-purple-100"
                            : "bg-gray-100"
                        }`}>
                          <Truck className={`w-5 h-5 ${
                            ['shipped', 'delivered'].includes(order.status)
                              ? "text-purple-600"
                              : "text-gray-400"
                          }`} />
                        </div>
                        <p className="text-xs font-medium">Shipped</p>
                      </div>
                      <div className="flex-1 h-1 bg-muted mx-4"></div>
                      <div className="text-center">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-1 ${
                          order.status === 'delivered'
                            ? "bg-green-100"
                            : "bg-gray-100"
                        }`}>
                          <CheckCircle className={`w-5 h-5 ${
                            order.status === 'delivered'
                              ? "text-green-600"
                              : "text-gray-400"
                          }`} />
                        </div>
                        <p className="text-xs font-medium">Delivered</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          ))}
        </motion.div>
      )}
    </div>
  );
};

export default UserOrders;
