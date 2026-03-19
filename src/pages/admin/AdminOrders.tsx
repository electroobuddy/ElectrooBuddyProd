import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { Package, Truck, CheckCircle, Clock, XCircle } from "lucide-react";

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
  updated_at?: string | null;
  customer_email?: string;
  customer_notes?: string;
  shipping_address_data?: any;
  tracking_number?: string | null;
  courier_name?: string | null;
  tracking_url?: string | null;
}

const AdminOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
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

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      const updateData: any = { 
        status, 
        updated_at: new Date().toISOString() 
      };

      // Update timestamp based on status
      if (status === 'confirmed') {
        updateData.confirmed_at = new Date().toISOString();
      } else if (status === 'shipped') {
        updateData.shipped_at = new Date().toISOString();
      } else if (status === 'delivered') {
        updateData.delivered_at = new Date().toISOString();
      } else if (status === 'cancelled') {
        updateData.cancelled_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from("orders")
        .update(updateData)
        .eq("id", orderId);

      if (error) throw error;
      
      fetchOrders();
    } catch (error) {
      console.error("Error updating order:", error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending": return <Clock className="text-yellow-500" />;
      case "confirmed": return <CheckCircle className="text-blue-500" />;
      case "processing": return <Package className="text-purple-500" />;
      case "shipped": return <Truck className="text-indigo-500" />;
      case "delivered": return <CheckCircle className="text-green-500" />;
      case "cancelled": return <XCircle className="text-red-500" />;
      default: return <Clock />;
    }
  };

  return (
    <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Orders</h1>
          <p className="text-muted-foreground">Manage customer orders</p>
        </div>

        <div className="bg-card border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase">Order #</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase">Payment</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase">Total</th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-muted/50">
                  <td className="px-6 py-4 font-medium">{order.order_number}</td>
                  <td className="px-6 py-4 text-sm">
                    {new Date(order.ordered_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(order.status)}
                      <span className="capitalize">{order.status}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs rounded ${
                      order.payment_status === "paid" ? "bg-green-100 text-green-700" :
                      order.payment_status === "failed" ? "bg-red-100 text-red-700" :
                      "bg-yellow-100 text-yellow-700"
                    }`}>
                      {order.payment_status}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-medium">₹{order.total_amount.toFixed(2)}</td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="text-primary hover:underline text-sm"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Order Detail Modal */}
        {selectedOrder && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => setSelectedOrder(null)}
          >
            <div 
              className="bg-card rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Order #{selectedOrder.order_number}</h2>
                <button onClick={() => setSelectedOrder(null)} className="text-muted-foreground hover:text-foreground">
                  <XCircle size={24} />
                </button>
              </div>

              <div className="space-y-4">
                {/* Status Updates */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold mb-2">Order Status</h3>
                    <select
                      value={selectedOrder.status}
                      onChange={(e) => {
                        updateOrderStatus(selectedOrder.id, e.target.value);
                        setSelectedOrder({ ...selectedOrder, status: e.target.value });
                      }}
                      className="input w-full"
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Payment Status</h3>
                    <div className="text-sm capitalize">{selectedOrder.payment_status}</div>
                  </div>
                </div>
              
                {/* Payment Information */}
                {selectedOrder.razorpay_payment_id && (
                  <div className="bg-muted/50 rounded p-4 space-y-2">
                    <h3 className="font-semibold">Razorpay Payment Details</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Payment ID:</span>
                        <div className="font-mono">{selectedOrder.razorpay_payment_id}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Order ID:</span>
                        <div className="font-mono">{selectedOrder.razorpay_order_id}</div>
                      </div>
                      <div className="col-span-2">
                        <span className="text-muted-foreground">Signature:</span>
                        <div className="font-mono text-xs break-all">{selectedOrder.razorpay_signature}</div>
                      </div>
                      {selectedOrder.confirmed_at && (
                        <div>
                          <span className="text-muted-foreground">Confirmed At:</span>
                          <div>{new Date(selectedOrder.confirmed_at).toLocaleString()}</div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              
                {/* Order Summary */}
                <div>
                  <h3 className="font-semibold mb-2">Order Summary</h3>
                  <div className="bg-muted rounded p-4 space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>₹{(selectedOrder.subtotal || selectedOrder.total_amount - 100).toFixed(2)}</span>
                    </div>
                    {selectedOrder.shipping_charge !== undefined && (
                      <div className="flex justify-between">
                        <span>Shipping:</span>
                        <span>₹{selectedOrder.shipping_charge.toFixed(2)}</span>
                      </div>
                    )}
                    {selectedOrder.installation_total && (
                      <div className="flex justify-between">
                        <span>Installation:</span>
                        <span>₹{selectedOrder.installation_total.toFixed(2)}</span>
                      </div>
                    )}
                    {selectedOrder.tax_amount && (
                      <div className="flex justify-between">
                        <span>Tax:</span>
                        <span>₹{selectedOrder.tax_amount.toFixed(2)}</span>
                      </div>
                    )}
                    {selectedOrder.discount_amount && (
                      <div className="flex justify-between">
                        <span>Discount:</span>
                        <span>-₹{selectedOrder.discount_amount.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="border-t pt-2 flex justify-between font-bold">
                      <span>Total:</span>
                      <span className="text-primary">₹{selectedOrder.total_amount.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                  {/* Shipping Address */}
                  {selectedOrder.shipping_address_data && (
                    <div>
                      <h3 className="font-semibold mb-2">Shipping Address</h3>
                      <div className="text-sm bg-muted/50 rounded p-3">
                        <div className="font-medium mb-1">{selectedOrder.shipping_address_data.full_name || 'Customer'}</div>
                        <div>{selectedOrder.shipping_address_data.address_line1}</div>
                        {selectedOrder.shipping_address_data.address_line2 && (
                          <div>{selectedOrder.shipping_address_data.address_line2}</div>
                        )}
                        <div>
                          {selectedOrder.shipping_address_data.city}, {selectedOrder.shipping_address_data.state} {selectedOrder.shipping_address_data.postal_code}
                        </div>
                        {selectedOrder.shipping_address_data.phone && (
                          <div className="mt-1">📞 {selectedOrder.shipping_address_data.phone}</div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Customer Notes */}
                  {selectedOrder.customer_notes && (
                    <div>
                      <h3 className="font-semibold mb-2">Customer Notes</h3>
                      <div className="text-sm bg-muted/50 rounded p-3 italic">
                        {selectedOrder.customer_notes}
                      </div>
                    </div>
                  )}

                  {/* Tracking Information */}
                  {selectedOrder.tracking_number && (
                    <div>
                      <h3 className="font-semibold mb-2">Tracking Information</h3>
                      <div className="text-sm bg-muted/50 rounded p-3 space-y-1">
                        <div><strong>Courier:</strong> {selectedOrder.courier_name || 'Not specified'}</div>
                        <div><strong>Tracking #:</strong> {selectedOrder.tracking_number}</div>
                        {selectedOrder.tracking_url && (
                          <a 
                            href={selectedOrder.tracking_url} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-primary hover:underline inline-block mt-1"
                          >
                            🚚 Track Order →
                          </a>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Timestamps */}
                  <div>
                    <h3 className="font-semibold mb-2">Order Timeline</h3>
                    <div className="text-sm bg-muted/50 rounded p-3 space-y-1">
                      <div><strong>Ordered:</strong> {new Date(selectedOrder.ordered_at).toLocaleString()}</div>
                      {selectedOrder.confirmed_at && (
                        <div><strong>Confirmed:</strong> {new Date(selectedOrder.confirmed_at).toLocaleString()}</div>
                      )}
                      {selectedOrder.shipped_at && (
                        <div><strong>Shipped:</strong> {new Date(selectedOrder.shipped_at).toLocaleString()}</div>
                      )}
                      {selectedOrder.delivered_at && (
                        <div><strong>Delivered:</strong> {new Date(selectedOrder.delivered_at).toLocaleString()}</div>
                      )}
                      {selectedOrder.cancelled_at && (
                        <div><strong>Cancelled:</strong> {new Date(selectedOrder.cancelled_at).toLocaleString()}</div>
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

export default AdminOrders;
