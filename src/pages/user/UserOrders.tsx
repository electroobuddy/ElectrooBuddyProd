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

  const showInvoice = (order: Order) =>
    order.status !== "pending" && order.status !== "cancelled";

  const COMPANY = {
    name: "Electroobuddy",
    address: "05, Nagziri Dewas Road, Ujjain(456010), India",
    phone: "+91 8109308287",
    email: "electroobuddy@gmail.com",
    gst: "23ABCDE1234F1Z5",
    supportEmail: "support@electroobuddy.com",
  };

  // Generate Invoice
  const generateInvoice = (order: Order) => {
    try {
      const orderItems = Array.isArray(order.items) && order.items.length > 0 ? order.items : [];
      const invoiceNumber = `INV-ORD-${(order.order_number || order.id).slice(0, 8).toUpperCase()}`;
      const orderDate = new Date(order.ordered_at).toLocaleDateString("en-IN", {
        year: "numeric", month: "long", day: "numeric",
      });

      const statusColor = (status: string) => {
        const colors: Record<string, string> = {
          pending: "#f59e0b", confirmed: "#3b82f6", processing: "#8b5cf6",
          shipped: "#a855f7", delivered: "#10b981", cancelled: "#ef4444",
        };
        return colors[status] || "#6b7280";
      };

      const invoiceHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Invoice - ${invoiceNumber}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Segoe UI', Arial, sans-serif;
      padding: 40px 48px;
      color: #1f2937;
      background: #f8fafc;
    }
    .invoice-wrapper {
      max-width: 800px;
      margin: 0 auto;
      background: #ffffff;
      border-radius: 16px;
      box-shadow: 0 4px 24px rgba(0,0,0,0.06);
      overflow: hidden;
    }
    .invoice-header {
      background: linear-gradient(135deg, #1e3a8a, #3b82f6);
      padding: 32px 40px;
      color: white;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .invoice-header .company-name {
      font-size: 26px;
      font-weight: 800;
      letter-spacing: -0.5px;
    }
    .invoice-header .company-tagline {
      font-size: 11px;
      opacity: 0.8;
      margin-top: 2px;
    }
    .invoice-header .invoice-title { text-align: right; }
    .invoice-header .invoice-title h1 { font-size: 22px; font-weight: 700; }
    .invoice-header .invoice-title p { font-size: 12px; opacity: 0.85; margin-top: 2px; }
    .invoice-body { padding: 32px 40px; }
    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin-bottom: 28px;
    }
    .info-box {
      background: #f8fafc;
      border-radius: 10px;
      padding: 16px 18px;
      border: 1px solid #e2e8f0;
    }
    .info-box h3 {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      color: #64748b;
      margin-bottom: 8px;
    }
    .info-box p { font-size: 13px; line-height: 1.6; color: #1e293b; }
    .info-box .label { color: #94a3b8; font-size: 12px; }
    .section-title {
      font-size: 14px;
      font-weight: 700;
      color: #1e293b;
      border-bottom: 2px solid #e2e8f0;
      padding-bottom: 8px;
      margin-bottom: 14px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .invoice-meta {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }
    .invoice-meta .label { color: #94a3b8; font-size: 12px; }
    .status-badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 11px;
      font-weight: 700;
      color: white;
      background: ${statusColor(order.status)};
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 14px 0;
    }
    th {
      background: #f1f5f9;
      color: #475569;
      padding: 10px 14px;
      text-align: left;
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      border-bottom: 2px solid #e2e8f0;
    }
    td {
      padding: 10px 14px;
      font-size: 13px;
      border-bottom: 1px solid #f1f5f9;
    }
    td:last-child, th:last-child { text-align: right; }
    td:nth-child(3), th:nth-child(3) { text-align: center; }
    .pricing-box {
      margin-top: 20px;
      margin-left: auto;
      width: 320px;
      background: #f8fafc;
      border-radius: 10px;
      border: 1px solid #e2e8f0;
    }
    .pricing-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 16px;
      font-size: 13px;
    }
    .pricing-row .lbl { color: #64748b; }
    .pricing-row .val { font-weight: 600; }
    .pricing-row.discount .val { color: #059669; }
    .pricing-row.final {
      border-top: 2px solid #3b82f6;
      padding: 12px 16px;
      font-size: 17px;
      font-weight: 800;
      color: #1e3a8a;
    }
    .coupon-badge {
      display: inline-block;
      background: #dbeafe;
      color: #1e40af;
      padding: 2px 10px;
      border-radius: 20px;
      font-size: 10px;
      font-weight: 600;
      margin-left: 6px;
    }
    .address-detail {
      background: #f8fafc;
      border-radius: 10px;
      padding: 16px 18px;
      border: 1px solid #e2e8f0;
      margin-bottom: 20px;
      font-size: 13px;
      line-height: 1.7;
    }
    .address-detail strong { color: #1e293b; }
    .no-items {
      text-align: center;
      padding: 24px;
      color: #94a3b8;
      font-style: italic;
      font-size: 13px;
    }
    .invoice-footer {
      padding: 24px 40px;
      border-top: 1px solid #e2e8f0;
      text-align: center;
    }
    .invoice-footer p {
      font-size: 12px;
      color: #94a3b8;
      line-height: 1.8;
    }
    .invoice-footer .thank-you {
      font-size: 16px;
      font-weight: 700;
      color: #1e3a8a;
      margin-bottom: 6px;
    }
    .invoice-footer .company-foot {
      font-weight: 600;
      color: #64748b;
      margin-top: 10px;
    }
    @media print {
      body { background: white; padding: 0; }
      .invoice-wrapper { box-shadow: none; border-radius: 0; }
    }
  </style>
</head>
<body>
  <div class="invoice-wrapper">
    <div class="invoice-header">
      <div>
        <div class="company-name">${COMPANY.name}</div>
        <div class="company-tagline">Your Trusted Electronics Partner</div>
      </div>
      <div class="invoice-title">
        <h1>TAX INVOICE</h1>
        <p>#${invoiceNumber}</p>
      </div>
    </div>

    <div class="invoice-body">
      <div class="invoice-meta">
        <div>
          <span class="label">Invoice Date:</span>
          <span style="font-size:13px;font-weight:600;margin-left:6px;">${orderDate}</span>
        </div>
        <div>
          <span class="label">Order #:</span>
          <span style="font-size:13px;font-weight:600;margin-left:6px;">${order.order_number}</span>
          <span style="margin-left:12px;" class="status-badge">${order.status.toUpperCase()}</span>
        </div>
      </div>

      <div class="info-grid">
        <div class="info-box">
          <h3>From</h3>
          <p><strong>${COMPANY.name}</strong><br/>
          ${COMPANY.address}<br/>
          Phone: ${COMPANY.phone}<br/>
          Email: ${COMPANY.email}<br/>
          GST: ${COMPANY.gst}</p>
        </div>
        <div class="info-box">
          <h3>Bill To</h3>
          <p><strong>${order.customer_name || "Customer"}</strong><br/>
          ${order.customer_email ? `Email: ${order.customer_email}<br/>` : ""}
          ${order.customer_phone ? `Phone: ${order.customer_phone}` : ""}</p>
        </div>
      </div>

      ${order.shipping_address_data ? `
      <div class="section-title">Shipping Address</div>
      <div class="address-detail">
        <strong>${order.shipping_address_data.full_name || ""}</strong><br/>
        ${order.shipping_address_data.address_line1 || ""}
        ${order.shipping_address_data.address_line2 ? `<br/>${order.shipping_address_data.address_line2}` : ""}
        <br/>${[order.shipping_address_data.city, order.shipping_address_data.state, order.shipping_address_data.postal_code].filter(Boolean).join(", ")}
        ${order.shipping_address_data.phone ? `<br/>Phone: ${order.shipping_address_data.phone}` : ""}
      </div>` : ""}

      <div class="section-title">Order Items</div>
      ${orderItems.length > 0 ? `
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Item</th>
            <th style="text-align:center;">Price</th>
            <th style="text-align:center;">Qty</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          ${orderItems.map((item: any, index: number) => `
          <tr>
            <td>${index + 1}</td>
            <td>
              <strong>${item.product_name || "Product"}</strong>
              ${item.product_sku ? `<br/><span style="color:#94a3b8;font-size:11px;">SKU: ${item.product_sku}</span>` : ""}
              ${item.installation_service ? `<br/><span style="color:#059669;font-size:11px;">✓ Installation: ₹${(parseFloat(item.installation_charge) || 0).toFixed(2)}</span>` : ""}
            </td>
            <td style="text-align:center;">₹${(parseFloat(item.unit_price) || 0).toFixed(2)}</td>
            <td style="text-align:center;">${parseInt(item.quantity) || 1}</td>
            <td>₹${((parseFloat(item.unit_price) || 0) * (parseInt(item.quantity) || 1)).toFixed(2)}</td>
          </tr>
          `).join("")}
        </tbody>
      </table>` : '<p class="no-items">No items in this order</p>'}

      <div class="pricing-box">
        <div class="pricing-row">
          <span class="lbl">Subtotal</span>
          <span class="val">₹${(parseFloat(String(order.subtotal || 0)) || 0).toFixed(2)}</span>
        </div>
        <div class="pricing-row">
          <span class="lbl">Shipping</span>
          <span class="val">${order.shipping_charge === 0 ? "FREE" : "₹" + (parseFloat(String(order.shipping_charge || 0)) || 0).toFixed(2)}</span>
        </div>
        ${order.installation_total ? `
        <div class="pricing-row">
          <span class="lbl">Installation</span>
          <span class="val">₹${(parseFloat(String(order.installation_total)) || 0).toFixed(2)}</span>
        </div>` : ""}
        ${order.tax_amount ? `
        <div class="pricing-row">
          <span class="lbl">Tax (GST 18%)</span>
          <span class="val">₹${(parseFloat(String(order.tax_amount)) || 0).toFixed(2)}</span>
        </div>` : ""}
        ${order.discount_amount ? `
        <div class="pricing-row discount">
          <span class="lbl">Discount${order.coupon_code ? ` (${order.coupon_code})` : ""}</span>
          <span class="val">-₹${(parseFloat(String(order.discount_amount)) || 0).toFixed(2)}</span>
        </div>` : ""}
        <div class="pricing-row final">
          <span>TOTAL PAID</span>
          <span>₹${(parseFloat(String(order.total_amount)) || 0).toFixed(2)}</span>
        </div>
        ${order.coupon_code ? `<div style="padding:4px 16px 12px;"><span class="coupon-badge">${order.coupon_code}</span> <span style="font-size:11px;color:#64748b;">applied</span></div>` : ""}
      </div>

      <div style="clear:both;"></div>

      <div style="margin-top:20px;font-size:12px;color:#94a3b8;">
        Payment: ${order.payment_method === "razorpay" ? "Online (Razorpay)" : "Cash on Delivery"} &middot;
        Status: ${order.payment_status === "paid" ? "Paid" : "Unpaid"}
      </div>
    </div>

    <div class="invoice-footer">
      <p class="thank-you">Thank you for shopping with ${COMPANY.name}!</p>
      <p>For queries, contact ${COMPANY.supportEmail} or call ${COMPANY.phone}</p>
      <p>${COMPANY.address} &middot; GST: ${COMPANY.gst}</p>
      <p>This is a computer-generated invoice and does not require a signature.</p>
      <p class="company-foot">${COMPANY.name} — Your Trusted Electronics Partner</p>
    </div>
  </div>
</body>
</html>`;

      const printWindow = window.open("", "_blank");
      if (printWindow) {
        printWindow.document.write(invoiceHtml);
        printWindow.document.close();
        setTimeout(() => printWindow.print(), 300);
      } else {
        toast.error("Unable to open invoice. Please allow popups for this site.");
      }
      toast.success("Invoice generated! Use 'Save as PDF' in print dialog.");
    } catch (error) {
      console.error("Error generating invoice:", error);
      toast.error("Failed to generate invoice");
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
                  {showInvoice(order) && (
                    <button
                      onClick={() => generateInvoice(order)}
                      className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-semibold transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      Download Invoice
                    </button>
                  )}
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
