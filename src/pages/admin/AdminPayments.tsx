import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { 
  CreditCard, 
  DollarSign, 
  CheckCircle, 
  Clock, 
  XCircle, 
  Search,
  Filter,
  Download,
  Eye,
  RefreshCw
} from "lucide-react";

interface Order {
  id: string;
  order_number: string;
  user_id: string;
  status: string;
  payment_status: string;
  fulfillment_status: string;
  total_amount: number;
  subtotal?: number;
  shipping_charge?: number;
  installation_total?: number;
  tax_amount?: number;
  discount_amount?: number;
  payment_method: string | null;
  razorpay_payment_id?: string;
  razorpay_order_id?: string;
  razorpay_signature?: string;
  ordered_at: string;
  confirmed_at?: string | null;
  shipped_at?: string | null;
  delivered_at?: string | null;
  cancelled_at?: string | null;
  customer_email?: string;
}

const AdminPayments = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterPayment, setFilterPayment] = useState<string>("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .order("ordered_at", { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.order_number.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || order.status === filterStatus;
    const matchesPayment = filterPayment === "all" || order.payment_status === filterPayment;
    return matchesSearch && matchesStatus && matchesPayment;
  });

  const getTotalRevenue = () => {
    return orders
      .filter(o => o.payment_status === "paid")
      .reduce((sum, o) => sum + o.total_amount, 0);
  };

  const getPendingPayments = () => {
    return orders
      .filter(o => o.payment_status === "pending")
      .reduce((sum, o) => sum + o.total_amount, 0);
  };

  const getStatusIcon = (paymentStatus: string) => {
    switch (paymentStatus) {
      case "paid":
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case "pending":
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case "failed":
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Clock className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusColor = (paymentStatus: string) => {
    switch (paymentStatus) {
      case "paid":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Payment Transactions</h1>
          <p className="text-muted-foreground">View and manage all payment transactions</p>
        </div>
        <button
          onClick={fetchOrders}
          className="btn-secondary flex items-center gap-2"
        >
          <RefreshCw size={20} />
          Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card border rounded-xl p-6"
        >
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-muted-foreground">Total Revenue</h3>
            <DollarSign className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-3xl font-bold text-green-600">₹{getTotalRevenue().toFixed(2)}</p>
          <p className="text-xs text-muted-foreground mt-2">From paid orders</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card border rounded-xl p-6"
        >
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-muted-foreground">Pending Payments</h3>
            <Clock className="w-5 h-5 text-yellow-600" />
          </div>
          <p className="text-3xl font-bold text-yellow-600">₹{getPendingPayments().toFixed(2)}</p>
          <p className="text-xs text-muted-foreground mt-2">Awaiting payment</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card border rounded-xl p-6"
        >
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-muted-foreground">Total Orders</h3>
            <CreditCard className="w-5 h-5 text-primary" />
          </div>
          <p className="text-3xl font-bold">{orders.length}</p>
          <p className="text-xs text-muted-foreground mt-2">All time orders</p>
        </motion.div>
      </div>

      {/* Filters */}
      <div className="bg-card border rounded-xl p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <input
              type="text"
              placeholder="Search by order number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>
          <div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div>
            <select
              value={filterPayment}
              onChange={(e) => setFilterPayment(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            >
              <option value="all">All Payment</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-card border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Order</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Payment Method</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Payment Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Order Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-muted/50">
                  <td className="px-6 py-4">
                    <div className="font-mono text-sm font-medium">{order.order_number}</div>
                    {order.razorpay_payment_id && (
                      <div className="text-xs text-muted-foreground mt-1">
                        P: {order.razorpay_payment_id}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm">{order.customer_email || "Guest"}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-semibold">₹{order.total_amount.toFixed(2)}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm capitalize">{order.payment_method || "N/A"}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(order.payment_status)}
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.payment_status)}`}>
                        {order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <div>{new Date(order.ordered_at).toLocaleDateString()}</div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(order.ordered_at).toLocaleTimeString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => setSelectedOrder(selectedOrder?.id === order.id ? null : order)}
                      className="inline-flex items-center gap-1 text-primary hover:text-primary/80 transition font-medium"
                    >
                      <Eye className="w-4 h-4" />
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedOrder(null)}
        >
          <div
            className="bg-card border rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Order Details</h2>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-muted-foreground hover:text-foreground"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Order Number</p>
                  <p className="font-mono font-medium">{selectedOrder.order_number}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Order Date</p>
                  <p className="font-medium">
                    {new Date(selectedOrder.ordered_at).toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-semibold mb-3">Payment Information</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Payment Method:</span>
                    <span className="font-medium capitalize">{selectedOrder.payment_method}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Payment Status:</span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(selectedOrder.payment_status)}`}>
                      {selectedOrder.payment_status}
                    </span>
                  </div>
                  {selectedOrder.razorpay_payment_id && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Razorpay Payment ID:</span>
                        <span className="font-mono text-sm">{selectedOrder.razorpay_payment_id}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Razorpay Order ID:</span>
                        <span className="font-mono text-sm">{selectedOrder.razorpay_order_id}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Signature:</span>
                        <span className="font-mono text-xs break-all">{selectedOrder.razorpay_signature}</span>
                      </div>
                      {selectedOrder.confirmed_at && (
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Confirmed At:</span>
                          <span className="font-medium">{new Date(selectedOrder.confirmed_at).toLocaleString()}</span>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-semibold mb-3">Order Summary</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Subtotal:</span>
                    <span className="font-medium">₹{selectedOrder.subtotal?.toFixed(2) || "0.00"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Shipping:</span>
                    <span className="font-medium">₹{selectedOrder.shipping_charge?.toFixed(2) || "0.00"}</span>
                  </div>
                  {selectedOrder.installation_total && (
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Installation:</span>
                      <span className="font-medium">₹{selectedOrder.installation_total.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-bold border-t pt-2">
                    <span>Total:</span>
                    <span className="text-primary">₹{selectedOrder.total_amount.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-semibold mb-3">Status Timeline</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Ordered:</span>
                    <span className="font-medium">{selectedOrder.ordered_at ? new Date(selectedOrder.ordered_at).toLocaleString() : "N/A"}</span>
                  </div>
                  {selectedOrder.confirmed_at && (
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Confirmed:</span>
                      <span className="font-medium">{new Date(selectedOrder.confirmed_at).toLocaleString()}</span>
                    </div>
                  )}
                  {selectedOrder.shipped_at && (
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Shipped:</span>
                      <span className="font-medium">{new Date(selectedOrder.shipped_at).toLocaleString()}</span>
                    </div>
                  )}
                  {selectedOrder.delivered_at && (
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Delivered:</span>
                      <span className="font-medium">{new Date(selectedOrder.delivered_at).toLocaleString()}</span>
                    </div>
                  )}
                  {selectedOrder.cancelled_at && (
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Cancelled:</span>
                      <span className="font-medium">{new Date(selectedOrder.cancelled_at).toLocaleString()}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default AdminPayments;
