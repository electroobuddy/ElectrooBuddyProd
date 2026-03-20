import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import {
  Package, Truck, CheckCircle, Clock, XCircle, Copy, AlertCircle,
  ShoppingBag, Search, Filter, X, MapPin, Phone, CreditCard,
  ChevronRight, ExternalLink, RotateCcw, Eye, Loader2
} from "lucide-react";
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
  shiprocket_order_id?: number | null;
  shiprocket_shipment_id?: number | null;
  estimated_delivery_date?: string | null;
  tracking_history?: Array<{ location?: string; message?: string; timestamp?: string; }>;
}

// ─── Status config ────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<string, { label: string; icon: React.ReactNode; pill: string; dot: string }> = {
  pending:    { label: "Pending",    icon: <Clock size={13} />,       pill: "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950/30 dark:text-yellow-400 dark:border-yellow-800",  dot: "bg-yellow-400" },
  confirmed:  { label: "Confirmed",  icon: <CheckCircle size={13} />, pill: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-800",              dot: "bg-blue-500" },
  processing: { label: "Processing", icon: <Package size={13} />,     pill: "bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950/30 dark:text-violet-400 dark:border-violet-800", dot: "bg-violet-500" },
  shipped:    { label: "Shipped",    icon: <Truck size={13} />,       pill: "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/30 dark:text-indigo-400 dark:border-indigo-800",  dot: "bg-indigo-500" },
  delivered:  { label: "Delivered",  icon: <CheckCircle size={13} />, pill: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800", dot: "bg-emerald-500" },
  cancelled:  { label: "Cancelled",  icon: <XCircle size={13} />,     pill: "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-800",                    dot: "bg-red-400" },
};

const PAYMENT_CONFIG: Record<string, string> = {
  paid:    "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800",
  pending: "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950/30 dark:text-yellow-400 dark:border-yellow-800",
  failed:  "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-800",
};

const StatusPill = ({ status }: { status: string }) => {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${cfg.pill}`}>
      {cfg.icon}{cfg.label}
    </span>
  );
};

const SectionCard = ({ title, icon, children, accent = "slate" }: {
  title: string; icon: React.ReactNode; children: React.ReactNode; accent?: string;
}) => {
  const accents: Record<string, string> = {
    blue:  "border-blue-100 dark:border-blue-900/40",
    green: "border-emerald-100 dark:border-emerald-900/40",
    slate: "border-zinc-200 dark:border-zinc-700",
    red:   "border-red-100 dark:border-red-900/40",
  };
  const dots: Record<string, string> = {
    blue: "bg-blue-500", green: "bg-emerald-500", slate: "bg-zinc-400", red: "bg-red-400",
  };
  return (
    <div className={`rounded-2xl border-2 bg-white dark:bg-zinc-900 overflow-hidden ${accents[accent]}`}>
      <div className="flex items-center gap-3 px-4 py-3 border-b border-inherit bg-zinc-50/60 dark:bg-zinc-800/40">
        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${dots[accent]}`} />
        <span className="text-zinc-400">{icon}</span>
        <h3 className="font-semibold text-xs tracking-wide text-zinc-600 dark:text-zinc-300 uppercase">{title}</h3>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
};

// ─── Timeline ─────────────────────────────────────────────────────────────────

const Timeline = ({ order }: { order: Order }) => {
  const steps = [
    { key: "ordered",   label: "Order Placed",  time: order.ordered_at,    always: true },
    { key: "confirmed", label: "Confirmed",      time: order.confirmed_at,  always: false },
    { key: "shipped",   label: "Shipped",        time: order.shipped_at,    always: false },
    { key: "delivered", label: "Delivered",      time: order.delivered_at,  always: false },
    { key: "cancelled", label: "Cancelled",      time: order.cancelled_at,  always: false },
  ].filter(s => s.always || s.time);

  return (
    <div className="relative">
      <div className="absolute left-3.5 top-4 bottom-4 w-px bg-zinc-200 dark:bg-zinc-700" />
      <div className="space-y-4">
        {steps.map((step, i) => (
          <div key={step.key} className="flex items-start gap-4 relative">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 z-10 border-2 border-white dark:border-zinc-900 ${
              i === 0 ? "bg-blue-500" : step.key === "cancelled" ? "bg-red-400" : "bg-emerald-500"
            }`}>
              <div className="w-2 h-2 bg-white rounded-full" />
            </div>
            <div className="pt-0.5 pb-1">
              <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">{step.label}</p>
              {step.time && (
                <p className="text-xs text-zinc-400 mt-0.5">{new Date(step.time).toLocaleString("en-IN")}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── Main component ───────────────────────────────────────────────────────────

const AdminOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => { fetchOrders(); }, []);

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase.from("orders").select("*").order("ordered_at", { ascending: false });
      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally { setLoading(false); }
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    setUpdatingStatus(true);
    try {
      const updateData: any = { status, updated_at: new Date().toISOString() };
      if (status === "confirmed") updateData.confirmed_at = new Date().toISOString();
      else if (status === "shipped") updateData.shipped_at = new Date().toISOString();
      else if (status === "delivered") updateData.delivered_at = new Date().toISOString();
      else if (status === "cancelled") updateData.cancelled_at = new Date().toISOString();
      const { error } = await supabase.from("orders").update(updateData).eq("id", orderId);
      if (error) throw error;
      if (selectedOrder?.id === orderId) setSelectedOrder(prev => prev ? { ...prev, ...updateData } : null);
      fetchOrders();
      toast.success("Order status updated");
    } catch (error) {
      console.error(error);
      toast.error("Failed to update status");
    } finally { setUpdatingStatus(false); }
  };

  const createShipment = async (orderId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke("create-shiprocket-order", { body: { order_id: orderId } });
      if (error) throw error;
      if (data?.success) { toast.success(`Shipment created! AWB: ${data.awb_code}`); fetchOrders(); }
      else toast.error("Failed to create shipment");
    } catch (error: any) {
      toast.error(`Failed: ${error.message || "Unknown error"}`);
    }
  };

  const filtered = orders.filter(o => {
    const matchesSearch = o.order_number.toLowerCase().includes(search.toLowerCase()) ||
      (o.customer_email || "").toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Summary counts
  const counts = orders.reduce((acc, o) => {
    acc[o.status] = (acc[o.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  if (loading) return (
    <div className="flex items-center justify-center py-24">
      <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <ShoppingBag size={22} className="text-blue-500" /> Orders
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">{orders.length} total orders</p>
        </div>
      </div>

      {/* Status summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
          <button key={key}
            onClick={() => setStatusFilter(statusFilter === key ? "all" : key)}
            className={`p-3 rounded-2xl border-2 text-left transition-all hover:shadow-sm ${
              statusFilter === key ? "border-blue-400 bg-blue-50 dark:bg-blue-950/20" : "border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900"
            }`}>
            <div className="flex items-center gap-2 mb-1.5">
              <div className={`w-2 h-2 rounded-full ${cfg.dot}`} />
              <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">{cfg.label}</span>
            </div>
            <p className="text-xl font-bold text-zinc-900 dark:text-white">{counts[key] || 0}</p>
          </button>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by order # or email…"
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm text-zinc-800 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all" />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm text-zinc-700 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all">
          <option value="all">All Statuses</option>
          {Object.entries(STATUS_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
      </div>

      {/* Orders table */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-800/50">
                {["Order", "Date", "Status", "Payment", "Amount", "Actions"].map((h, i) => (
                  <th key={h} className={`px-5 py-3.5 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider ${i === 5 ? "text-right" : "text-left"}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center">
                    <ShoppingBag size={40} className="mx-auto text-zinc-200 dark:text-zinc-700 mb-3" strokeWidth={1.5} />
                    <p className="font-semibold text-zinc-500">No orders found</p>
                  </td>
                </tr>
              ) : filtered.map(order => (
                <tr key={order.id} className="group hover:bg-blue-50/30 dark:hover:bg-blue-950/10 transition-colors">
                  <td className="px-5 py-4">
                    <div>
                      <p className="font-bold text-zinc-900 dark:text-white text-sm font-mono">#{order.order_number}</p>
                      {order.customer_email && <p className="text-xs text-zinc-400 mt-0.5">{order.customer_email}</p>}
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <p className="text-sm text-zinc-600 dark:text-zinc-300">
                      {new Date(order.ordered_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      {new Date(order.ordered_at).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </td>
                  <td className="px-5 py-4"><StatusPill status={order.status} /></td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border capitalize ${PAYMENT_CONFIG[order.payment_status] || PAYMENT_CONFIG.pending}`}>
                      {order.payment_status}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <p className="font-bold text-zinc-900 dark:text-white">₹{order.total_amount.toFixed(2)}</p>
                    {order.tracking_number && (
                      <p className="text-xs text-indigo-500 mt-0.5 flex items-center gap-1"><Truck size={10} />Tracking active</p>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => setSelectedOrder(order)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-50 hover:bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:hover:bg-blue-950/50 dark:text-blue-400 border border-blue-200 dark:border-blue-800 transition-colors">
                        <Eye size={12} /> View
                      </button>
                      {!order.tracking_number && order.status !== "cancelled" && (
                        <button onClick={() => createShipment(order.id)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 transition-colors">
                          <Truck size={12} /> Ship
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Order Detail Drawer / Modal ── */}
      <AnimatePresence>
        {selectedOrder && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-start justify-end bg-black/50 backdrop-blur-sm"
            onClick={() => setSelectedOrder(null)}>
            <motion.div
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="relative h-full w-full max-w-2xl bg-zinc-50 dark:bg-zinc-950 shadow-2xl overflow-y-auto"
              onClick={e => e.stopPropagation()}>

              {/* Drawer header */}
              <div className="sticky top-0 z-10 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 px-6 py-4 flex items-center justify-between">
                <div>
                  <h2 className="font-bold text-zinc-900 dark:text-white text-lg font-mono">#{selectedOrder.order_number}</h2>
                  <p className="text-xs text-zinc-400 mt-0.5">{new Date(selectedOrder.ordered_at).toLocaleString("en-IN")}</p>
                </div>
                <div className="flex items-center gap-3">
                  <StatusPill status={selectedOrder.status} />
                  <button onClick={() => setSelectedOrder(null)}
                    className="w-8 h-8 flex items-center justify-center rounded-xl border border-zinc-200 dark:border-zinc-700 text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
                    <X size={16} />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-4">

                {/* Status control */}
                <SectionCard title="Update Status" icon={<RotateCcw size={13} />} accent="blue">
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                    {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                      <button key={key}
                        disabled={updatingStatus}
                        onClick={() => updateOrderStatus(selectedOrder.id, key)}
                        className={`flex flex-col items-center gap-1.5 p-2.5 rounded-xl border-2 text-xs font-semibold transition-all ${
                          selectedOrder.status === key
                            ? "border-blue-500 bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300"
                            : "border-zinc-200 dark:border-zinc-700 text-zinc-500 hover:border-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800"
                        }`}>
                        <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                        {cfg.label}
                      </button>
                    ))}
                  </div>
                </SectionCard>

                {/* Order summary */}
                <SectionCard title="Order Summary" icon={<Package size={13} />} accent="slate">
                  <div className="space-y-2">
                    {[
                      { label: "Subtotal", value: selectedOrder.subtotal },
                      { label: "Shipping", value: selectedOrder.shipping_charge },
                      { label: "Installation", value: selectedOrder.installation_total },
                      { label: "Tax", value: selectedOrder.tax_amount },
                    ].filter(r => r.value !== undefined && r.value !== null).map(row => (
                      <div key={row.label} className="flex justify-between text-sm">
                        <span className="text-zinc-500 dark:text-zinc-400">{row.label}</span>
                        <span className="text-zinc-700 dark:text-zinc-300">₹{(row.value as number).toFixed(2)}</span>
                      </div>
                    ))}
                    {selectedOrder.discount_amount ? (
                      <div className="flex justify-between text-sm">
                        <span className="text-zinc-500 dark:text-zinc-400">Discount</span>
                        <span className="text-emerald-600">−₹{selectedOrder.discount_amount.toFixed(2)}</span>
                      </div>
                    ) : null}
                    <div className="border-t border-zinc-200 dark:border-zinc-700 pt-2 mt-2 flex justify-between">
                      <span className="font-bold text-zinc-900 dark:text-white">Total</span>
                      <span className="font-bold text-blue-600 text-base">₹{selectedOrder.total_amount.toFixed(2)}</span>
                    </div>
                  </div>
                </SectionCard>

                {/* Payment info */}
                <SectionCard title="Payment" icon={<CreditCard size={13} />} accent="green">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Status</span>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border capitalize ${PAYMENT_CONFIG[selectedOrder.payment_status] || PAYMENT_CONFIG.pending}`}>
                        {selectedOrder.payment_status}
                      </span>
                    </div>
                    {selectedOrder.payment_method && (
                      <div className="flex justify-between">
                        <span className="text-zinc-500">Method</span>
                        <span className="text-zinc-700 dark:text-zinc-300 capitalize">{selectedOrder.payment_method}</span>
                      </div>
                    )}
                    {selectedOrder.razorpay_payment_id && (
                      <>
                        <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800">
                          <p className="text-xs text-zinc-400 mb-1">Payment ID</p>
                          <p className="font-mono text-xs text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 px-2 py-1.5 rounded-lg break-all">{selectedOrder.razorpay_payment_id}</p>
                        </div>
                        {selectedOrder.razorpay_order_id && (
                          <div>
                            <p className="text-xs text-zinc-400 mb-1">Razorpay Order ID</p>
                            <p className="font-mono text-xs text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 px-2 py-1.5 rounded-lg break-all">{selectedOrder.razorpay_order_id}</p>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </SectionCard>

                {/* Shipping address */}
                {selectedOrder.shipping_address_data && (
                  <SectionCard title="Shipping Address" icon={<MapPin size={13} />} accent="slate">
                    <div className="text-sm space-y-1">
                      <p className="font-bold text-zinc-800 dark:text-zinc-100">{selectedOrder.shipping_address_data.full_name || "Customer"}</p>
                      <p className="text-zinc-500">{selectedOrder.shipping_address_data.address_line1}</p>
                      {selectedOrder.shipping_address_data.address_line2 && (
                        <p className="text-zinc-500">{selectedOrder.shipping_address_data.address_line2}</p>
                      )}
                      <p className="text-zinc-500">
                        {selectedOrder.shipping_address_data.city}, {selectedOrder.shipping_address_data.state} {selectedOrder.shipping_address_data.postal_code}
                      </p>
                      {selectedOrder.shipping_address_data.phone && (
                        <p className="flex items-center gap-1.5 text-zinc-500 pt-1">
                          <Phone size={12} />{selectedOrder.shipping_address_data.phone}
                        </p>
                      )}
                    </div>
                  </SectionCard>
                )}

                {/* Tracking */}
                {selectedOrder.tracking_number ? (
                  <SectionCard title="Shipment & Tracking" icon={<Truck size={13} />} accent="blue">
                    <div className="space-y-4">
                      {/* AWB row */}
                      <div className="flex items-center justify-between gap-3 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-xl border border-blue-200 dark:border-blue-800">
                        <div>
                          <p className="text-xs text-blue-500 font-medium mb-1">AWB / Tracking Number</p>
                          <p className="font-mono font-bold text-blue-900 dark:text-blue-200 text-base">{selectedOrder.tracking_number}</p>
                        </div>
                        <div className="flex gap-2 flex-shrink-0">
                          <button onClick={() => { navigator.clipboard.writeText(selectedOrder.tracking_number!); toast.success("Copied!"); }}
                            className="p-2 rounded-lg bg-white dark:bg-zinc-800 border border-blue-200 dark:border-blue-700 text-blue-600 hover:bg-blue-50 transition-colors">
                            <Copy size={14} />
                          </button>
                          {selectedOrder.tracking_url && (
                            <a href={selectedOrder.tracking_url} target="_blank" rel="noopener noreferrer"
                              className="p-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors">
                              <ExternalLink size={14} />
                            </a>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="p-3 bg-zinc-50 dark:bg-zinc-800 rounded-xl">
                          <p className="text-xs text-zinc-400 mb-1">Courier</p>
                          <p className="font-semibold text-zinc-800 dark:text-zinc-100">{selectedOrder.courier_name || "Shiprocket"}</p>
                        </div>
                        {selectedOrder.estimated_delivery_date && (
                          <div className="p-3 bg-zinc-50 dark:bg-zinc-800 rounded-xl">
                            <p className="text-xs text-zinc-400 mb-1">Est. Delivery</p>
                            <p className="font-semibold text-zinc-800 dark:text-zinc-100">
                              {new Date(selectedOrder.estimated_delivery_date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                            </p>
                          </div>
                        )}
                        {selectedOrder.shiprocket_order_id && (
                          <div className="p-3 bg-zinc-50 dark:bg-zinc-800 rounded-xl">
                            <p className="text-xs text-zinc-400 mb-1">SR Order ID</p>
                            <p className="font-mono font-semibold text-zinc-800 dark:text-zinc-100">{selectedOrder.shiprocket_order_id}</p>
                          </div>
                        )}
                        {selectedOrder.shiprocket_shipment_id && (
                          <div className="p-3 bg-zinc-50 dark:bg-zinc-800 rounded-xl">
                            <p className="text-xs text-zinc-400 mb-1">SR Shipment ID</p>
                            <p className="font-mono font-semibold text-zinc-800 dark:text-zinc-100">{selectedOrder.shiprocket_shipment_id}</p>
                          </div>
                        )}
                      </div>

                      {/* Tracking history */}
                      {selectedOrder.tracking_history && selectedOrder.tracking_history.length > 0 && (
                        <div>
                          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">Tracking History</p>
                          <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                            {selectedOrder.tracking_history.map((event, i) => (
                              <div key={i} className="flex items-start gap-3 p-2.5 bg-zinc-50 dark:bg-zinc-800 rounded-xl">
                                <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
                                <div>
                                  <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-200">{event.location || event.message}</p>
                                  {event.timestamp && (
                                    <p className="text-xs text-zinc-400 mt-0.5">{new Date(event.timestamp).toLocaleString("en-IN")}</p>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </SectionCard>
                ) : selectedOrder.status !== "cancelled" ? (
                  <div className="rounded-2xl border-2 border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-950/20 p-4">
                    <div className="flex items-start gap-3">
                      <AlertCircle size={18} className="text-yellow-500 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="font-semibold text-yellow-800 dark:text-yellow-300 text-sm">No shipment created yet</p>
                        <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1 mb-3">Create a Shiprocket shipment to enable order tracking for your customer.</p>
                        <button onClick={() => createShipment(selectedOrder.id)}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white text-sm font-semibold rounded-xl transition-colors">
                          <Truck size={14} /> Create Shipment
                        </button>
                      </div>
                    </div>
                  </div>
                ) : null}

                {/* Timeline */}
                <SectionCard title="Order Timeline" icon={<Clock size={13} />} accent="slate">
                  <Timeline order={selectedOrder} />
                </SectionCard>

                {/* Customer notes */}
                {selectedOrder.customer_notes && (
                  <SectionCard title="Customer Notes" icon={<Package size={13} />} accent="slate">
                    <p className="text-sm text-zinc-600 dark:text-zinc-300 italic leading-relaxed">{selectedOrder.customer_notes}</p>
                  </SectionCard>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminOrders;