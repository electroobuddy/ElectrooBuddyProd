import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2, Pencil, Trash2, X, Eye, Calendar, Clock, Phone,
  MapPin, Search, Download, User, Wrench, AlignLeft, Check,
  CalendarDays, Filter, ChevronRight, Save, CheckCircle
} from "lucide-react";
import { toast } from "sonner";

// ─── Status config ────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<string, { label: string; pill: string; dot: string }> = {
  pending:   { label: "Pending",   pill: "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950/30 dark:text-yellow-400 dark:border-yellow-800",  dot: "bg-yellow-400" },
  confirmed: { label: "Confirmed", pill: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-800",              dot: "bg-blue-500" },
  completed: { label: "Completed", pill: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800", dot: "bg-emerald-500" },
  cancelled: { label: "Cancelled", pill: "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-800",                    dot: "bg-red-400" },
};

const StatusPill = ({ status }: { status: string }) => {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${cfg.pill}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />{cfg.label}
    </span>
  );
};

const SectionCard = ({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) => (
  <div className="rounded-2xl border-2 border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 overflow-hidden">
    <div className="flex items-center gap-3 px-4 py-3 border-b border-zinc-200 dark:border-zinc-700 bg-zinc-50/60 dark:bg-zinc-800/40">
      <span className="w-2 h-2 rounded-full bg-zinc-400 flex-shrink-0" />
      <span className="text-zinc-400">{icon}</span>
      <h3 className="font-semibold text-xs tracking-wide text-zinc-600 dark:text-zinc-300 uppercase">{title}</h3>
    </div>
    <div className="p-4">{children}</div>
  </div>
);

const inputCls = "w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all";

// ─── Main component ───────────────────────────────────────────────────────────

const AdminBookings = () => {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [viewing, setViewing] = useState<any | null>(null);
  const [editing, setEditing] = useState<any | null>(null);
  const [saving, setSaving] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "", phone: "", email: "", address: "", service_type: "",
    preferred_date: "", preferred_time: "", description: "", status: "pending",
    exact_location: "", custom_service_demand: "", is_switch_working: "",
    has_old_fan: "", is_electricity_supply_on: ""
  });
  const patchEdit = (u: any) => setEditForm(prev => ({ ...prev, ...u }));

  const fetchData = async () => {
    let q = supabase.from("bookings").select("*").order("created_at", { ascending: false });
    if (filter && filter !== "all") q = q.eq("status", filter);
    const { data } = await q;
    setBookings(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [filter]);

  const updateStatus = async (id: string, newStatus: string) => {
    const booking = bookings.find(b => b.id === id);
    const oldStatus = booking?.status;
    const { error } = await supabase.from("bookings").update({ status: newStatus }).eq("id", id);
    if (error) return toast.error(error.message);
    supabase.functions.invoke("notify-booking-status", { body: { bookingId: id, oldStatus, newStatus } }).catch(console.error);
    toast.success("Status updated");
    fetchData();
    if (viewing?.id === id) setViewing({ ...viewing, status: newStatus });
  };

  const handleEdit = (b: any) => {
    setEditing(b);
    setEditForm({ 
      name: b.name, 
      phone: b.phone, 
      email: b.email || "", 
      address: b.address, 
      service_type: b.service_type,
      preferred_date: b.preferred_date, 
      preferred_time: b.preferred_time,
      description: b.description || "", 
      status: b.status,
      exact_location: b.exact_location || "",
      custom_service_demand: b.custom_service_demand || "",
      is_switch_working: b.is_switch_working || "",
      has_old_fan: b.has_old_fan || "",
      is_electricity_supply_on: b.is_electricity_supply_on || ""
    });
  };

  const handleSaveEdit = async () => {
    if (!editing?.id) return;
    setSaving(true);
    const { error } = await supabase.from("bookings").update(editForm).eq("id", editing.id);
    if (error) { toast.error(error.message); setSaving(false); return; }
    toast.success("Booking updated");
    setEditing(null); fetchData();
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this booking?")) return;
    const { error } = await supabase.from("bookings").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Booking deleted");
    fetchData();
  };

  const exportCSV = () => {
    if (!bookings.length) return;
    const headers = ["Name", "Phone", "Address", "Service", "Date", "Time", "Description", "Status"];
    const rows = bookings.map(b => [b.name, b.phone, b.address, b.service_type, b.preferred_date, b.preferred_time, b.description || "", b.status]);
    const csv = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob); a.download = "bookings.csv"; a.click();
  };

  const filtered = bookings.filter(b =>
    b.name.toLowerCase().includes(search.toLowerCase()) ||
    b.service_type.toLowerCase().includes(search.toLowerCase()) ||
    b.phone.includes(search)
  );

  const counts = bookings.reduce((acc, b) => { acc[b.status] = (acc[b.status] || 0) + 1; return acc; }, {} as Record<string, number>);

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
            <CalendarDays size={22} className="text-blue-500" /> Bookings
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">{bookings.length} total bookings</p>
        </div>
        <button onClick={exportCSV}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-200 font-semibold text-sm rounded-xl shadow-sm hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-all">
          <Download size={15} /> Export CSV
        </button>
      </div>

      {/* Status summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
          <button key={key}
            onClick={() => setFilter(filter === key ? "all" : key)}
            className={`p-4 rounded-2xl border-2 text-left transition-all hover:shadow-sm ${
              filter === key ? "border-blue-400 bg-blue-50 dark:bg-blue-950/20" : "border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900"
            }`}>
            <div className="flex items-center gap-2 mb-2">
              <div className={`w-2 h-2 rounded-full ${cfg.dot}`} />
              <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">{cfg.label}</span>
            </div>
            <p className="text-2xl font-bold text-zinc-900 dark:text-white">{counts[key] || 0}</p>
          </button>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, service, or phone…"
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm text-zinc-800 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all" />
        </div>
        <select value={filter} onChange={e => setFilter(e.target.value)}
          className="px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm text-zinc-700 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all">
          <option value="all">All Statuses</option>
          {Object.entries(STATUS_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
      </div>

      {/* Bookings table */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-800/50">
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">Customer</th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider hidden sm:table-cell">Service</th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider hidden md:table-cell">Date & Time</th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3.5 text-right text-xs font-semibold text-zinc-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center">
                    <CalendarDays size={40} className="mx-auto text-zinc-200 dark:text-zinc-700 mb-3" strokeWidth={1.5} />
                    <p className="font-semibold text-zinc-500">No bookings found</p>
                  </td>
                </tr>
              ) : filtered.map(b => (
                <tr key={b.id} className="group hover:bg-blue-50/30 dark:hover:bg-blue-950/10 transition-colors">
                  <td className="px-5 py-4">
                    <p className="font-semibold text-zinc-900 dark:text-white text-sm">{b.name}</p>
                    <p className="text-xs text-zinc-400 mt-0.5 flex items-center gap-1"><Phone size={10} />{b.phone}</p>
                    {b.email && (
                      <p className="text-xs text-zinc-400 mt-0.5 flex items-center gap-1 truncate max-w-[180px]"><MapPin size={10} style={{transform: "rotate(90deg)"}} />{b.email}</p>
                    )}
                  </td>
                  <td className="px-4 py-4 hidden sm:table-cell">
                    <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-2.5 py-1 rounded-lg">
                      {b.service_type}
                    </span>
                  </td>
                  <td className="px-4 py-4 hidden md:table-cell">
                    <p className="text-sm text-zinc-600 dark:text-zinc-300 flex items-center gap-1.5">
                      <Calendar size={12} className="text-zinc-400" />{b.preferred_date}
                    </p>
                    <p className="text-xs text-zinc-400 mt-0.5 flex items-center gap-1.5">
                      <Clock size={10} />{b.preferred_time}
                    </p>
                  </td>
                  <td className="px-4 py-4"><StatusPill status={b.status} /></td>
                  <td className="px-4 py-4">
                    <div className="flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => setViewing(b)}
                        className="p-2 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-950/30 text-zinc-400 hover:text-blue-600 transition-colors border border-transparent hover:border-blue-200">
                        <Eye size={14} />
                      </button>
                      <button onClick={() => handleEdit(b)}
                        className="p-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-700 transition-colors border border-transparent hover:border-zinc-200">
                        <Pencil size={14} />
                      </button>
                      <button onClick={() => handleDelete(b.id)}
                        className="p-2 rounded-xl hover:bg-red-100 dark:hover:bg-red-950/30 text-zinc-400 hover:text-red-600 transition-colors border border-transparent hover:border-red-200">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── View Detail Drawer ── */}
      <AnimatePresence>
        {viewing && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-start justify-end bg-black/50 backdrop-blur-sm"
            onClick={() => setViewing(null)}>
            <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="h-full w-full max-w-lg bg-zinc-50 dark:bg-zinc-950 shadow-2xl overflow-y-auto"
              onClick={e => e.stopPropagation()}>

              {/* Header */}
              <div className="sticky top-0 z-10 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 px-6 py-4 flex items-center justify-between">
                <div>
                  <h2 className="font-bold text-zinc-900 dark:text-white">Booking Details</h2>
                  <p className="text-xs text-zinc-400 mt-0.5">{new Date(viewing.created_at).toLocaleString("en-IN")}</p>
                </div>
                <div className="flex items-center gap-3">
                  <StatusPill status={viewing.status} />
                  <button onClick={() => setViewing(null)}
                    className="w-8 h-8 flex items-center justify-center rounded-xl border border-zinc-200 dark:border-zinc-700 text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
                    <X size={16} />
                  </button>
                </div>
              </div>

              <div className="p-5 space-y-4">
                {/* Status update */}
                <SectionCard title="Update Status" icon={<Check size={13} />}>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                      <button key={key}
                        onClick={() => updateStatus(viewing.id, key)}
                        className={`flex items-center gap-2 p-3 rounded-xl border-2 text-sm font-semibold transition-all ${
                          viewing.status === key
                            ? "border-blue-500 bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300"
                            : "border-zinc-200 dark:border-zinc-700 text-zinc-500 hover:border-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800"
                        }`}>
                        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${cfg.dot}`} />{cfg.label}
                      </button>
                    ))}
                  </div>
                </SectionCard>

                {/* Customer info */}
                <SectionCard title="Customer" icon={<User size={13} />}>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center gap-3 p-3 bg-zinc-50 dark:bg-zinc-800 rounded-xl">
                      <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-950/30 flex items-center justify-center flex-shrink-0">
                        <User size={18} className="text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <p className="font-bold text-zinc-900 dark:text-white">{viewing.name}</p>
                        <p className="text-zinc-500 flex items-center gap-1"><Phone size={11} />{viewing.phone}</p>
                        {viewing.email && (
                          <p className="text-zinc-500 flex items-center gap-1 mt-0.5"><MapPin size={11} style={{transform: "rotate(90deg)"}} />{viewing.email}</p>
                        )}
                      </div>
                    </div>
                    <div className="p-3 bg-zinc-50 dark:bg-zinc-800 rounded-xl">
                      <p className="text-xs text-zinc-400 mb-1 flex items-center gap-1"><MapPin size={11} />Address</p>
                      <p className="text-zinc-700 dark:text-zinc-200">{viewing.address}</p>
                    </div>
                    {viewing.exact_location && (
                      <div className="p-3 bg-zinc-50 dark:bg-zinc-800 rounded-xl">
                        <p className="text-xs text-zinc-400 mb-1 flex items-center gap-1"><MapPin size={11} />Exact Location</p>
                        <p className="text-zinc-700 dark:text-zinc-200">{viewing.exact_location}</p>
                      </div>
                    )}
                  </div>
                </SectionCard>

                {/* Booking details */}
                <SectionCard title="Booking Details" icon={<Wrench size={13} />}>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="p-3 bg-zinc-50 dark:bg-zinc-800 rounded-xl">
                      <p className="text-xs text-zinc-400 mb-1">Service</p>
                      <p className="font-semibold text-zinc-800 dark:text-zinc-100">{viewing.service_type}</p>
                    </div>
                    <div className="p-3 bg-zinc-50 dark:bg-zinc-800 rounded-xl">
                      <p className="text-xs text-zinc-400 mb-1">Date</p>
                      <p className="font-semibold text-zinc-800 dark:text-zinc-100">{viewing.preferred_date}</p>
                    </div>
                    <div className="p-3 bg-zinc-50 dark:bg-zinc-800 rounded-xl">
                      <p className="text-xs text-zinc-400 mb-1">Time</p>
                      <p className="font-semibold text-zinc-800 dark:text-zinc-100">{viewing.preferred_time}</p>
                    </div>
                  </div>
                  {viewing.description && (
                    <div className="mt-3 p-3 bg-zinc-50 dark:bg-zinc-800 rounded-xl">
                      <p className="text-xs text-zinc-400 mb-1 flex items-center gap-1"><AlignLeft size={11} />Description</p>
                      <p className="text-sm text-zinc-700 dark:text-zinc-200 leading-relaxed">{viewing.description}</p>
                    </div>
                  )}
                  {viewing.custom_service_demand && (
                    <div className="mt-3 p-3 bg-zinc-50 dark:bg-zinc-800 rounded-xl">
                      <p className="text-xs text-zinc-400 mb-1 flex items-center gap-1"><Wrench size={11} />Custom Service Demand</p>
                      <p className="text-sm text-zinc-700 dark:text-zinc-200 leading-relaxed">{viewing.custom_service_demand}</p>
                    </div>
                  )}
                  {/* Fan Installation Details */}
                  {(viewing.is_switch_working || viewing.has_old_fan || viewing.is_electricity_supply_on) && (
                    <div className="mt-3 p-3 bg-zinc-50 dark:bg-zinc-800 rounded-xl">
                      <p className="text-xs font-semibold text-zinc-400 mb-2 uppercase tracking-wide">Fan Installation Details</p>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        {viewing.is_switch_working && (
                          <div className="flex items-center gap-2">
                            <CheckCircle size={12} className="text-blue-500" />
                            <span className="text-zinc-600 dark:text-zinc-300">Switch Working: <strong>{viewing.is_switch_working === 'yes' ? 'Yes' : 'No'}</strong></span>
                          </div>
                        )}
                        {viewing.has_old_fan && (
                          <div className="flex items-center gap-2">
                            <CheckCircle size={12} className="text-blue-500" />
                            <span className="text-zinc-600 dark:text-zinc-300">Old Fan Present: <strong>{viewing.has_old_fan === 'yes' ? 'Yes' : 'No'}</strong></span>
                          </div>
                        )}
                        {viewing.is_electricity_supply_on && (
                          <div className="flex items-center gap-2">
                            <CheckCircle size={12} className="text-blue-500" />
                            <span className="text-zinc-600 dark:text-zinc-300">Electricity On: <strong>{viewing.is_electricity_supply_on === 'yes' ? 'Yes' : 'No'}</strong></span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </SectionCard>

                {/* Actions */}
                <div className="flex gap-3">
                  <button onClick={() => { setViewing(null); handleEdit(viewing); }}
                    className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-colors flex items-center justify-center gap-2">
                    <Pencil size={14} /> Edit Booking
                  </button>
                  <button onClick={() => { if (confirm("Delete this booking?")) { handleDelete(viewing.id); setViewing(null); } }}
                    className="px-4 py-2.5 rounded-xl border-2 border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 font-semibold text-sm transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Edit Drawer ── */}
      <AnimatePresence>
        {editing && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-start justify-end bg-black/50 backdrop-blur-sm"
            onClick={() => setEditing(null)}>
            <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="h-full w-full max-w-lg bg-zinc-50 dark:bg-zinc-950 shadow-2xl overflow-y-auto"
              onClick={e => e.stopPropagation()}>

              {/* Header */}
              <div className="sticky top-0 z-10 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 px-6 py-4 flex items-center justify-between">
                <div>
                  <h2 className="font-bold text-zinc-900 dark:text-white">Edit Booking</h2>
                  <p className="text-xs text-zinc-400 mt-0.5">{editing.name}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => setEditing(null)}
                    className="px-4 py-2 text-sm rounded-xl border border-zinc-200 dark:border-zinc-700 text-zinc-600 hover:bg-zinc-50 transition-all font-medium">
                    Discard
                  </button>
                  <button onClick={handleSaveEdit} disabled={saving}
                    className="px-4 py-2 text-sm rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-all flex items-center gap-2 disabled:opacity-60">
                    {saving ? <><span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />Saving…</> : <><Save size={13} />Save</>}
                  </button>
                </div>
              </div>

              <div className="p-5 space-y-4">
                <SectionCard title="Customer Details" icon={<User size={13} />}>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-medium text-zinc-500 mb-1.5 block">Name</label>
                      <input placeholder="Full name" value={editForm.name} onChange={e => patchEdit({ name: e.target.value })} className={inputCls} />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-zinc-500 mb-1.5 block">Email</label>
                      <input placeholder="email@example.com" type="email" value={editForm.email} onChange={e => patchEdit({ email: e.target.value })} className={inputCls} />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-zinc-500 mb-1.5 block">Phone</label>
                      <input placeholder="Phone number" value={editForm.phone} onChange={e => patchEdit({ phone: e.target.value })} className={inputCls} />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-zinc-500 mb-1.5 block">Address</label>
                      <input placeholder="Full address" value={editForm.address} onChange={e => patchEdit({ address: e.target.value })} className={inputCls} />
                    </div>
                  </div>
                </SectionCard>

                <SectionCard title="Booking Details" icon={<Wrench size={13} />}>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-medium text-zinc-500 mb-1.5 block">Service Type</label>
                      <input placeholder="e.g. Electrical Installation" value={editForm.service_type} onChange={e => patchEdit({ service_type: e.target.value })} className={inputCls} />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-medium text-zinc-500 mb-1.5 block">Date</label>
                        <input type="date" value={editForm.preferred_date} onChange={e => patchEdit({ preferred_date: e.target.value })} className={inputCls} />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-zinc-500 mb-1.5 block">Time</label>
                        <input type="time" value={editForm.preferred_time} onChange={e => patchEdit({ preferred_time: e.target.value })} className={inputCls} />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-zinc-500 mb-1.5 block">Description</label>
                      <textarea placeholder="Notes or details…" rows={3} value={editForm.description}
                        onChange={e => patchEdit({ description: e.target.value })}
                        className={`${inputCls} resize-none`} />
                    </div>
                  </div>
                </SectionCard>

                <SectionCard title="Status" icon={<Check size={13} />}>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                      <button key={key} type="button"
                        onClick={() => patchEdit({ status: key })}
                        className={`flex items-center gap-2 p-3 rounded-xl border-2 text-sm font-semibold transition-all ${
                          editForm.status === key
                            ? "border-blue-500 bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300"
                            : "border-zinc-200 dark:border-zinc-700 text-zinc-500 hover:border-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800"
                        }`}>
                        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${cfg.dot}`} />{cfg.label}
                      </button>
                    ))}
                  </div>
                </SectionCard>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminBookings;