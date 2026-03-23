import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { Package, Truck, CheckCircle, Clock, XCircle, ChevronRight, Eye, Download, FileText, Gift, CreditCard, MapPin, Phone } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

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
  coupon_code?: string | null;
  payment_method?: string | null;
  ordered_at: string;
  confirmed_at?: string | null;
  shipped_at?: string | null;
  delivered_at?: string | null;
  items?: any[];
  customer_name?: string | null;
  customer_email?: string | null;
  customer_phone?: string | null;
  shipping_address_data?: any;
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
      // Fetch orders with items using a proper join
      const { data: ordersData, error: ordersError } = await supabase
        .from("orders")
        .select(`
          *,
          items:order_items(
            id,
            product_id,
            product_name,
            product_sku,
            product_image,
            quantity,
            unit_price,
            total_price,
            installation_service,
            installation_charge
          )
        `)
        .eq("user_id", user.id)
        .order("ordered_at", { ascending: false });

      if (ordersError) {
        console.error('Supabase error fetching orders:', ordersError);
        throw ordersError;
      }
      
      // Transform data to match Order interface with proper defaults
      const transformedOrders: Order[] = (ordersData || []).map((item: any) => {
        // Extract customer info from shipping_address_data
        const shippingAddress = item.shipping_address_data || {};
        
        return {
          ...item,
          coupon_code: item.coupon_code ?? null,
          customer_name: shippingAddress.full_name ?? item.customer_name ?? null,
          customer_email: shippingAddress.email ?? item.customer_email ?? null,
          customer_phone: shippingAddress.phone ?? item.customer_phone ?? null,
          shipping_address_data: item.shipping_address_data ?? null,
          items: Array.isArray(item.items) ? item.items : []
        };
      });
      
      console.log('✅ Fetched user orders:', transformedOrders.length);
      setOrders(transformedOrders);
    } catch (error: any) {
      console.error("❌ Error fetching orders:", error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      });
      toast.error('Failed to load your orders. Please refresh and try again.');
    } finally {
      setLoading(false);
    }
  };

  // Generate Invoice PDF
  const generateInvoice = async (order: Order) => {
    try {
      // Ensure items array exists and is valid
      const orderItems = Array.isArray(order.items) && order.items.length > 0 
        ? order.items 
        : [];
      
      console.log('Generating invoice for order:', order.order_number);
      console.log('Order items:', orderItems);
      
      // Create invoice content
      const invoiceContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>Invoice - #${order.order_number}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; }
            .header { text-align: center; border-bottom: 3px solid #3b82f6; padding-bottom: 20px; margin-bottom: 30px; }
            .company-name { font-size: 28px; font-weight: bold; color: #1e40af; }
            .invoice-title { font-size: 24px; margin-top: 10px; }
            .invoice-details { display: flex; justify-content: space-between; margin-bottom: 30px; }
            .detail-box { background: #f3f4f6; padding: 15px; border-radius: 8px; width: 48%; }
            .section { margin-bottom: 25px; }
            .section-title { font-size: 16px; font-weight: bold; color: #1f2937; border-bottom: 2px solid #e5e7eb; padding-bottom: 8px; margin-bottom: 12px; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th { background: #3b82f6; color: white; padding: 12px; text-align: left; }
            td { padding: 10px; border-bottom: 1px solid #e5e7eb; }
            .totals { float: right; width: 300px; margin-top: 20px; }
            .total-row { display: flex; justify-content: space-between; padding: 8px 12px; }
            .total-row.final { background: #dbeafe; font-weight: bold; font-size: 18px; border-radius: 4px; }
            .footer { margin-top: 50px; padding-top: 20px; border-top: 2px solid #e5e7eb; text-align: center; color: #6b7280; font-size: 12px; }
            .status-badge { display: inline-block; padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; }
            .no-items { text-align: center; padding: 20px; color: #6b7280; font-style: italic; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="company-name">Electroobuddy</div>
            <div class="invoice-title">TAX INVOICE</div>
          </div>
          
          <div class="invoice-details">
            <div class="detail-box">
              <strong>Invoice Details:</strong><br/>
              Invoice #: ${order.order_number}<br/>
              Order Date: ${new Date(order.ordered_at).toLocaleDateString('en-IN')}<br/>
              Payment: ${order.payment_method === 'razorpay' ? 'Online (Razorpay)' : 'Cash on Delivery'}<br/>
              Status: <span class="status-badge" style="background: ${getStatusColor(order.status)}">${order.status}</span>
            </div>
            <div class="detail-box">
              <strong>Billing Address:</strong><br/>
              ${order.customer_name || 'Customer'}<br/>
              ${order.customer_email || ''}<br/>
              ${order.customer_phone || ''}
            </div>
          </div>
          
          ${order.shipping_address_data ? `
          <div class="section">
            <div class="section-title">Shipping Address</div>
            <p><strong>${order.shipping_address_data.full_name || ''}</strong></p>
            <p>${order.shipping_address_data.address_line1 || ''}</p>
            ${order.shipping_address_data.address_line2 ? `<p>${order.shipping_address_data.address_line2}</p>` : ''}
            <p>${order.shipping_address_data.city || ''}, ${order.shipping_address_data.state || ''} ${order.shipping_address_data.postal_code || ''}</p>
            <p>Phone: ${order.shipping_address_data.phone || 'N/A'}</p>
          </div>
          ` : ''}
          
          <div class="section">
            <div class="section-title">Order Items</div>
            ${orderItems.length > 0 ? `
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Item</th>
                  <th>Price</th>
                  <th>Qty</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                ${orderItems.map((item: any, index: number) => `
                <tr>
                  <td>${index + 1}</td>
                  <td>
                    <strong>${item.product_name || 'Product'}</strong>
                    ${item.product_sku ? `<br/><small style="color: #6b7280;">SKU: ${item.product_sku}</small>` : ''}
                  </td>
                  <td>₹${(parseFloat(item.unit_price) || 0).toFixed(2)}</td>
                  <td>${parseInt(item.quantity) || 1}</td>
                  <td>₹${((parseFloat(item.unit_price) || 0) * (parseInt(item.quantity) || 1)).toFixed(2)}</td>
                </tr>
                `).join('')}
              </tbody>
            </table>
            ` : '<p class="no-items">No items in this order</p>'}
          </div>
          
          <div class="totals">
            <div class="total-row">
              <span>Subtotal:</span>
              <span>₹${(parseFloat(String(order.subtotal || 0)) || 0).toFixed(2)}</span>
            </div>
            <div class="total-row">
              <span>Shipping:</span>
              <span>₹${(parseFloat(String(order.shipping_charge || 0)) || 0).toFixed(2)}</span>
            </div>
            ${order.installation_total ? `
            <div class="total-row">
              <span>Installation:</span>
              <span>₹${(parseFloat(String(order.installation_total)) || 0).toFixed(2)}</span>
            </div>
            ` : ''}
            ${order.tax_amount ? `
            <div class="total-row">
              <span>Tax (GST 18%):</span>
              <span>₹${(parseFloat(String(order.tax_amount)) || 0).toFixed(2)}</span>
            </div>
            ` : ''}
            ${order.discount_amount ? `
            <div class="total-row" style="color: #059669;">
              <span>Discount${order.coupon_code ? ` (${order.coupon_code})` : ''}:</span>
              <span>-₹${(parseFloat(String(order.discount_amount)) || 0).toFixed(2)}</span>
            </div>
            ` : ''}
            <div class="total-row final">
              <span>TOTAL PAID:</span>
              <span>₹${(parseFloat(String(order.total_amount)) || 0).toFixed(2)}</span>
            </div>
          </div>
          
          <div style="clear: both;"></div>
          
          <div class="footer">
            <p><strong>Thank you for shopping with Electroobuddy!</strong></p>
            <p>For any queries, contact us at support@electroobuddy.com</p>
            <p>This is a computer-generated invoice and does not require a signature.</p>
            <p style="margin-top: 15px;"><strong>Electroobuddy - Your Trusted Electronics Partner</strong></p>
          </div>
        </body>
        </html>
      `;
      
      // Open in new window for printing/saving as PDF
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(invoiceContent);
        printWindow.document.close();
        setTimeout(() => {
          printWindow.print();
        }, 250); // Small delay to ensure content is loaded
      } else {
        toast.error('Unable to open invoice. Please allow popups for this site.');
      }
      
      toast.success('Invoice generated! Use "Save as PDF" in print dialog.');
    } catch (error) {
      console.error('Error generating invoice:', error);
      toast.error('Failed to generate invoice');
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
                <div className="md:text-right space-y-2">
                  <button
                    onClick={() => setSelectedOrder(selectedOrder?.id === order.id ? null : order)}
                    className="w-full inline-flex items-center justify-center gap-2 text-primary hover:text-primary/80 transition font-medium"
                  >
                    <Eye className="w-4 h-4" />
                    {selectedOrder?.id === order.id ? "Hide Details" : "View Details"}
                  </button>
                  <button
                    onClick={() => generateInvoice(order)}
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-semibold transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Download Invoice
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
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <Package className="w-4 h-4" />
                      Order Items
                    </h4>
                    <div className="space-y-2">
                      {order.items?.map((item, index) => (
                        <div key={index} className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg border border-border">
                          {item.product_image && (
                            <img
                              src={item.product_image}
                              alt={item.product_name}
                              className="w-16 h-16 object-cover rounded"
                            />
                          )}
                          <div className="flex-1">
                            <p className="font-medium">{item.product_name}</p>
                            {item.product_sku && (
                              <p className="text-xs text-muted-foreground">
                                SKU: {item.product_sku}
                              </p>
                            )}
                            <p className="text-sm text-muted-foreground">
                              Quantity: {item.quantity} × ₹{(item.unit_price || 0).toFixed(2)}
                            </p>
                            {item.installation_service && (
                              <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                                <CheckCircle className="w-3 h-3" /> Installation included
                              </p>
                            )}
                          </div>
                          <p className="font-semibold">₹{(item.quantity * item.price).toFixed(2)}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Order Summary with Coupon */}
                  <div className="bg-muted/30 rounded-xl p-4 border border-border">
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Order Summary
                    </h4>
                    <div className="space-y-2 max-w-md">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span className="font-medium">₹{(order.subtotal || 0).toFixed(2)}</span>
                      </div>
                      {order.shipping_charge !== undefined && order.shipping_charge !== null && (
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Shipping</span>
                          <span className="font-medium">
                            {order.shipping_charge === 0 ? (
                              <span className="text-green-600 font-semibold">FREE</span>
                            ) : (
                              `₹${order.shipping_charge.toFixed(2)}`
                            )}
                          </span>
                        </div>
                      )}
                      {order.installation_total ? (
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Installation</span>
                          <span className="font-medium">₹{order.installation_total.toFixed(2)}</span>
                        </div>
                      ) : null}
                      {order.tax_amount ? (
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Tax (GST 18%)</span>
                          <span className="font-medium">₹{order.tax_amount.toFixed(2)}</span>
                        </div>
                      ) : null}
                      {order.discount_amount ? (
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Discount</span>
                          <span className="font-medium text-emerald-600">
                            −₹{order.discount_amount.toFixed(2)}
                          </span>
                        </div>
                      ) : null}
                      {order.coupon_code && (
                        <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg px-3 py-2 flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <Gift className="w-3 h-3 text-blue-600" />
                            <span className="text-xs font-medium text-blue-700 dark:text-blue-300">Coupon Applied</span>
                          </div>
                          <span className="font-mono font-bold text-blue-900 dark:text-blue-200 text-sm">{order.coupon_code}</span>
                        </div>
                      )}
                      <div className="border-t border-border pt-2 mt-2">
                        <div className="flex justify-between text-base font-bold">
                          <span>Total Paid</span>
                          <span className="text-primary">₹{order.total_amount.toFixed(2)}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Payment via {order.payment_method === 'razorpay' ? 'Online (Razorpay)' : 'Cash on Delivery'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Shipping Address */}
                  {order.shipping_address_data && (
                    <div>
                      <h4 className="font-semibold mb-3">Shipping Address</h4>
                      <div className="p-4 bg-muted/50 rounded-lg border border-border">
                        <div className="flex items-start gap-2 mb-2">
                          <MapPin className="w-4 h-4 text-primary mt-0.5" />
                          <div>
                            <p className="text-sm font-medium">{order.shipping_address_data.full_name}</p>
                            <p className="text-sm">{order.shipping_address_data.address_line1}</p>
                            {order.shipping_address_data.address_line2 && (
                              <p className="text-sm">{order.shipping_address_data.address_line2}</p>
                            )}
                            <p className="text-sm">
                              {order.shipping_address_data.city}, {order.shipping_address_data.state} {order.shipping_address_data.postal_code}
                            </p>
                            {order.shipping_address_data.phone && (
                              <p className="text-sm mt-2 flex items-center gap-1">
                                <Phone className="w-3 h-3" />{order.shipping_address_data.phone}
                              </p>
                            )}
                          </div>
                        </div>
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
