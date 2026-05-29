import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import {
  Loader2, ArrowLeft, Calendar, Clock, Phone, MapPin, User, Wrench,
  AlignLeft, Check, CheckCircle, Tag, MessageCircle, PhoneCall, Pencil,
  Trash2, UserCheck, X, FileText
} from "lucide-react";
import { toast } from "sonner";
import { generateBookingInvoice } from "@/utils/generateBookingInvoice";

const STATUS_CONFIG: Record<string, { label: string; pill: string; dot: string }> = {
  pending:   { label: "Pending",   pill: "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950/30 dark:text-yellow-400 dark:border-yellow-800",  dot: "bg-yellow-400" },
  confirmed: { label: "Confirmed", pill: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-800",              dot: "bg-blue-500" },
  assigned:  { label: "Assigned",  pill: "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/30 dark:text-indigo-400 dark:border-indigo-800", dot: "bg-indigo-500" },
  in_progress: { label: "In Progress", pill: "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/30 dark:text-purple-400 dark:border-purple-800", dot: "bg-purple-500" },
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

const BookingDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAdmin, isTechnician } = useAuth();
  const [booking, setBooking] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [technician, setTechnician] = useState<any | null>(null);
  const [availableTechnicians, setAvailableTechnicians] = useState<any[]>([]);
  const [assigningTech, setAssigningTech] = useState(false);

  useEffect(() => {
    if (!id) return;
    const fetch = async () => {
      const { data } = await supabase.from("bookings").select("*").eq("id", id).single();
      if (data) {
        setBooking(data);
        if (data.assigned_technician_id) {
          const { data: tech } = await supabase.from("technicians").select("*").eq("id", data.assigned_technician_id).maybeSingle();
          if (tech) setTechnician(tech);
        }
      }
      setLoading(false);
    };
    fetch();
  }, [id]);

  const fetchAvailableTechnicians = async () => {
    const today = new Date().toISOString().split("T")[0];
    const { data: techs } = await supabase.from("technicians" as any).select("*").eq("status", "active").order("priority", { ascending: false });
    if (!techs) return;
    const withCount = await Promise.all(
      techs.map(async (t: any) => {
        const { count } = await supabase.from("bookings").select("*", { count: "exact", head: true }).eq("assigned_technician_id", t.id).eq("assignment_date", today);
        return { ...t, todayCount: count || 0 };
      })
    );
    setAvailableTechnicians(withCount.filter((t: any) => t.todayCount < (t.daily_limit || 5)));
  };

  useEffect(() => { if (isAdmin && booking) fetchAvailableTechnicians(); }, [isAdmin, booking]);

  const handleStatusUpdate = async (newStatus: string) => {
    if (!booking) return;
    const oldStatus = booking.status;
    const { error } = await supabase.from("bookings").update({ status: newStatus }).eq("id", booking.id);
    if (error) return toast.error(error.message);
    supabase.functions.invoke("notify-booking-status", { body: { bookingId: booking.id, oldStatus, newStatus, technicianId: booking.assigned_technician_id } }).catch(() => {});
    toast.success("Status updated");
    setBooking({ ...booking, status: newStatus });
  };

  const handleAssignTechnician = async (technicianId: string) => {
    if (!technicianId || !booking) return;
    setAssigningTech(true);
    const today = new Date().toISOString().split("T")[0];
    const { data: tech } = await supabase.from("technicians").select("*").eq("id", technicianId).maybeSingle();
    const { error } = await supabase.from("bookings").update({
      assigned_technician_id: technicianId, status: "assigned",
      assigned_at: new Date().toISOString(), assignment_date: today,
      technician_name: tech?.name || null,
      technician_phone: tech?.phone || null,
    }).eq("id", booking.id);
    if (error) { toast.error(error.message); setAssigningTech(false); return; }
    toast.success("Technician assigned");
    setBooking({ ...booking, assigned_technician_id: technicianId, status: "assigned", assigned_at: new Date().toISOString(), assignment_date: today, technician_name: tech?.name || null, technician_phone: tech?.phone || null });
    if (tech) setTechnician(tech);
    setAssigningTech(false);
  };

  const handleUnassignTechnician = async () => {
    if (!booking || !confirm("Unassign technician from this booking?")) return;
    const { error } = await supabase.from("bookings").update({ assigned_technician_id: null, status: "pending", assigned_at: null, assignment_date: null }).eq("id", booking.id);
    if (error) return toast.error(error.message);
    toast.success("Technician unassigned");
    setTechnician(null);
    setBooking({ ...booking, assigned_technician_id: null, status: "pending", assigned_at: null, assignment_date: null });
  };

  const handleDelete = async () => {
    if (!booking || !confirm("Delete this booking?")) return;
    const { error } = await supabase.from("bookings").delete().eq("id", booking.id);
    if (error) return toast.error(error.message);
    toast.success("Booking deleted");
    navigate(-1);
  };

  const handleCancelByUser = async () => {
    if (!booking || !confirm("Cancel this booking?")) return;
    await handleStatusUpdate("cancelled");
  };

  if (loading) return (
    <div className="flex items-center justify-center py-24">
      <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
    </div>
  );

  if (!booking) return (
    <div className="p-6 text-center">
      <p className="text-zinc-500 text-lg">Booking not found</p>
      <button onClick={() => navigate(-1)} className="mt-4 text-blue-600 hover:underline">Go back</button>
    </div>
  );

  const b = booking;

  return (
    <div className="p-4 sm:p-6 max-w-3xl mx-auto space-y-5">
      {/* Back + Title */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)}
            className="w-9 h-9 flex items-center justify-center rounded-xl border border-zinc-200 dark:border-zinc-700 text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
            <ArrowLeft size={16} />
          </button>
          <div>
            <h1 className="text-xl font-bold text-zinc-900 dark:text-white">Booking Details</h1>
            <p className="text-xs text-zinc-400 mt-0.5">{new Date(b.created_at).toLocaleString("en-IN")}</p>
          </div>
        </div>
        <StatusPill status={b.status} />
      </div>

      {/* Customer Info */}
      <SectionCard title="Customer" icon={<User size={13} />}>
        <div className="space-y-3 text-sm">
          <div className="flex items-center gap-3 p-3 bg-zinc-50 dark:bg-zinc-800 rounded-xl">
            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-950/30 flex items-center justify-center flex-shrink-0">
              <User size={18} className="text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1">
              <p className="font-bold text-zinc-900 dark:text-white">{b.name}</p>
              <p className="text-zinc-500 flex items-center gap-1"><Phone size={11} />{b.phone}</p>
              {b.email && (
                <p className="text-zinc-500 flex items-center gap-1 mt-0.5"><MapPin size={11} style={{transform: "rotate(90deg)"}} />{b.email}</p>
              )}
            </div>
            <div className="flex gap-1.5">
              <a href={`https://wa.me/${b.phone.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer"
                className="p-2 rounded-xl hover:bg-emerald-100 dark:hover:bg-emerald-950/30 text-zinc-400 hover:text-emerald-600 transition-colors border border-transparent hover:border-emerald-200">
                <MessageCircle size={14} />
              </a>
              <a href={`tel:${b.phone}`}
                className="p-2 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-950/30 text-zinc-400 hover:text-blue-600 transition-colors border border-transparent hover:border-blue-200">
                <PhoneCall size={14} />
              </a>
            </div>
          </div>
          <div className="p-3 bg-zinc-50 dark:bg-zinc-800 rounded-xl">
            <p className="text-xs text-zinc-400 mb-1 flex items-center gap-1"><MapPin size={11} />Address</p>
            <p className="text-zinc-700 dark:text-zinc-200">{b.address}</p>
          </div>
          {b.exact_location && (
            <div className="p-3 bg-zinc-50 dark:bg-zinc-800 rounded-xl">
              <p className="text-xs text-zinc-400 mb-1 flex items-center gap-1"><MapPin size={11} />Exact Location</p>
              <p className="text-zinc-700 dark:text-zinc-200">{b.exact_location}</p>
            </div>
          )}
        </div>
      </SectionCard>

      {/* Booking Details */}
      <SectionCard title="Service Details" icon={<Wrench size={13} />}>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="p-3 bg-zinc-50 dark:bg-zinc-800 rounded-xl">
            <p className="text-xs text-zinc-400 mb-1">Service</p>
            <p className="font-semibold text-zinc-800 dark:text-zinc-100">{b.service_type}</p>
          </div>
          <div className="p-3 bg-zinc-50 dark:bg-zinc-800 rounded-xl">
            <p className="text-xs text-zinc-400 mb-1">Date</p>
            <p className="font-semibold text-zinc-800 dark:text-zinc-100">{b.preferred_date}</p>
          </div>
          <div className="p-3 bg-zinc-50 dark:bg-zinc-800 rounded-xl">
            <p className="text-xs text-zinc-400 mb-1">Time</p>
            <p className="font-semibold text-zinc-800 dark:text-zinc-100">{b.preferred_time}</p>
          </div>
        </div>
        {b.description && (
          <div className="mt-3 p-3 bg-zinc-50 dark:bg-zinc-800 rounded-xl">
            <p className="text-xs text-zinc-400 mb-1 flex items-center gap-1"><AlignLeft size={11} />Description</p>
            <p className="text-sm text-zinc-700 dark:text-zinc-200 leading-relaxed">{b.description}</p>
          </div>
        )}
        {b.custom_service_demand && (
          <div className="mt-3 p-3 bg-zinc-50 dark:bg-zinc-800 rounded-xl">
            <p className="text-xs text-zinc-400 mb-1 flex items-center gap-1"><Wrench size={11} />Custom Service Demand</p>
            <p className="text-sm text-zinc-700 dark:text-zinc-200 leading-relaxed">{b.custom_service_demand}</p>
          </div>
        )}
        {(b.is_switch_working || b.has_old_fan || b.is_electricity_supply_on) && (
          <div className="mt-3 p-3 bg-zinc-50 dark:bg-zinc-800 rounded-xl">
            <p className="text-xs font-semibold text-zinc-400 mb-2 uppercase tracking-wide">Fan Installation Details</p>
            <div className="grid grid-cols-2 gap-2 text-sm">
              {b.is_switch_working && (
                <div className="flex items-center gap-2">
                  <CheckCircle size={12} className="text-blue-500" />
                  <span className="text-zinc-600 dark:text-zinc-300">Switch Working: <strong>{b.is_switch_working === 'yes' ? 'Yes' : 'No'}</strong></span>
                </div>
              )}
              {b.has_old_fan && (
                <div className="flex items-center gap-2">
                  <CheckCircle size={12} className="text-blue-500" />
                  <span className="text-zinc-600 dark:text-zinc-300">Old Fan Present: <strong>{b.has_old_fan === 'yes' ? 'Yes' : 'No'}</strong></span>
                </div>
              )}
              {b.is_electricity_supply_on && (
                <div className="flex items-center gap-2">
                  <CheckCircle size={12} className="text-blue-500" />
                  <span className="text-zinc-600 dark:text-zinc-300">Electricity On: <strong>{b.is_electricity_supply_on === 'yes' ? 'Yes' : 'No'}</strong></span>
                </div>
              )}
            </div>
          </div>
        )}
      </SectionCard>

      {/* Technician Assignment - Admin only */}
      {isAdmin && (
        <SectionCard title="Technician Assignment" icon={<UserCheck size={13} />}>
          <div className="space-y-3">
            {technician ? (
              <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl border border-emerald-200 dark:border-emerald-800">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-950/50 flex items-center justify-center">
                      <UserCheck size={18} className="text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-emerald-900 dark:text-emerald-300">{technician.name}</p>
                      {technician.phone && (
                        <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-0.5 flex items-center gap-1">
                          <Phone size={10} />{technician.phone}
                        </p>
                      )}
                      <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-0.5">
                        {b.assigned_at ? new Date(b.assigned_at).toLocaleString("en-IN") : "Assigned"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {technician.phone && (
                      <>
                        <a href={`https://wa.me/${technician.phone.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer"
                          className="p-2 rounded-xl hover:bg-emerald-200 dark:hover:bg-emerald-800 text-emerald-500 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors">
                          <MessageCircle size={14} />
                        </a>
                        <a href={`tel:${technician.phone}`}
                          className="p-2 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-950/30 text-emerald-500 hover:text-blue-600 transition-colors">
                          <PhoneCall size={14} />
                        </a>
                      </>
                    )}
                    <button onClick={handleUnassignTechnician}
                      className="px-3 py-1.5 text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-950/30 rounded-lg transition-colors">
                      Unassign
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <label className="text-xs font-medium text-zinc-500 block">Assign a Technician</label>
                <select
                  value=""
                  disabled={assigningTech}
                  onChange={(e) => { const v = e.target.value; if (v) handleAssignTechnician(v); }}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
                >
                  <option value="">Select a technician…</option>
                  {availableTechnicians.map((t: any) => (
                    <option key={t.id} value={t.id}>{t.name} - {t.todayCount}/{t.daily_limit} today (Priority: {t.priority})</option>
                  ))}
                </select>
                <p className="text-[10px] text-zinc-400">Only active technicians with available capacity</p>
              </div>
            )}
          </div>
        </SectionCard>
      )}

      {/* Technician Details - non-admin view */}
      {!isAdmin && b.assigned_technician_id && (
        <SectionCard title="Technician" icon={<UserCheck size={13} />}>
          <div className="flex items-center gap-3 p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl border border-emerald-200 dark:border-emerald-800">
            <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-950/50 flex items-center justify-center">
              <UserCheck size={18} className="text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-sm text-emerald-900 dark:text-emerald-300">
                {b.technician_name || technician?.name || "Technician Assigned"}
              </p>
              {(b.technician_phone || technician?.phone) && (
                <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-0.5 flex items-center gap-1">
                  <Phone size={10} />{b.technician_phone || technician?.phone}
                </p>
              )}
              <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-0.5">
                {b.assigned_at ? new Date(b.assigned_at).toLocaleString("en-IN") : "Assigned"}
              </p>
            </div>
            {(b.technician_phone || technician?.phone) && (
              <div className="flex gap-1.5">
                <a href={`https://wa.me/${(b.technician_phone || technician?.phone).replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer"
                  className="p-2 rounded-xl hover:bg-emerald-100 dark:hover:bg-emerald-950/30 text-zinc-400 hover:text-emerald-600 transition-colors border border-transparent hover:border-emerald-200">
                  <MessageCircle size={14} />
                </a>
                <a href={`tel:${b.technician_phone || technician?.phone}`}
                  className="p-2 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-950/30 text-zinc-400 hover:text-blue-600 transition-colors border border-transparent hover:border-blue-200">
                  <PhoneCall size={14} />
                </a>
              </div>
            )}
          </div>
        </SectionCard>
      )}

      {/* Pricing */}
      {(b.original_amount > 0 || b.final_amount > 0) && (
        <SectionCard title={b.offer_applied ? "Offer Applied" : "Amount"} icon={<Tag size={13} />}>
          {b.offer_applied && (
            <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-950/20 rounded-xl border border-green-200 dark:border-green-800 mb-3">
              <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-950/30 flex items-center justify-center">
                <Tag size={18} className="text-green-600 dark:text-green-400" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-green-900 dark:text-green-300">{b.coupon_code || 'Offer Applied'}</p>
                {b.discount_amount > 0 && <p className="text-xs text-green-700 dark:text-green-400">Saved ₹{b.discount_amount}</p>}
              </div>
            </div>
          )}
          <div className="grid grid-cols-3 gap-2 text-sm">
            {b.original_amount > 0 && (
              <div className="p-2 bg-zinc-50 dark:bg-zinc-800 rounded-xl text-center">
                <p className="text-xs text-zinc-400">Original</p>
                <p className="font-semibold text-zinc-600 line-through">₹{b.original_amount}</p>
              </div>
            )}
            {b.discount_amount > 0 && (
              <div className="p-2 bg-zinc-50 dark:bg-zinc-800 rounded-xl text-center">
                <p className="text-xs text-zinc-400">Discount</p>
                <p className="font-semibold text-green-600">-₹{b.discount_amount}</p>
              </div>
            )}
            <div className="p-2 bg-zinc-50 dark:bg-zinc-800 rounded-xl text-center">
              <p className="text-xs text-zinc-400">Final</p>
              <p className="font-semibold text-green-700">₹{b.final_amount}</p>
            </div>
          </div>
        </SectionCard>
      )}

      {/* Invoice Download - restricted by role + status */}
      {(isAdmin || b.status === "completed") && (
        <button onClick={() => generateBookingInvoice(b)}
          className="w-full py-3 rounded-xl bg-white dark:bg-zinc-900 border-2 border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/20 font-semibold text-sm transition-colors flex items-center justify-center gap-2">
          <FileText size={15} /> Download Invoice
        </button>
      )}

      {/* ── Role-Based Actions ── */}

      {/* Admin Actions */}
      {isAdmin && (
        <div className="space-y-3">
          <SectionCard title="Update Status" icon={<Check size={13} />}>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(STATUS_CONFIG).filter(([k]) => k !== "assigned" && k !== "in_progress").map(([key, cfg]) => (
                <button key={key}
                  onClick={() => handleStatusUpdate(key)}
                  className={`flex items-center gap-2 p-3 rounded-xl border-2 text-sm font-semibold transition-all ${
                    b.status === key
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300"
                      : "border-zinc-200 dark:border-zinc-700 text-zinc-500 hover:border-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800"
                  }`}>
                  <span className={`w-2 h-2 rounded-full flex-shrink-0 ${cfg.dot}`} />{cfg.label}
                </button>
              ))}
            </div>
          </SectionCard>
          <div className="flex gap-3">
            <button onClick={() => navigate(`/admin/bookings`)}
              className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-colors flex items-center justify-center gap-2">
              <Pencil size={14} /> Back to Bookings
            </button>
            <button onClick={handleDelete}
              className="px-4 py-2.5 rounded-xl border-2 border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 font-semibold text-sm transition-colors">
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Technician Actions */}
      {isTechnician && !isAdmin && (
        <div className="space-y-3">
          {(b.status === "assigned" || b.status === "pending") && (
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => handleStatusUpdate("in_progress")}
                className="py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-colors flex items-center justify-center gap-2">
                <Clock size={14} /> Start Work
              </button>
              <button onClick={() => handleStatusUpdate("completed")}
                className="py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm transition-colors flex items-center justify-center gap-2">
                <Check size={14} /> Mark Complete
              </button>
            </div>
          )}
          {b.status === "in_progress" && (
            <button onClick={() => handleStatusUpdate("completed")}
              className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm transition-colors flex items-center justify-center gap-2">
              <Check size={14} /> Mark Complete
            </button>
          )}
          <button onClick={() => navigate(`/technician/bookings`)}
            className="w-full py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 font-semibold text-sm transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800 flex items-center justify-center gap-2">
            <ArrowLeft size={14} /> Back to Bookings
          </button>
        </div>
      )}

      {/* User Actions */}
      {!isAdmin && !isTechnician && (
        <div className="space-y-3">
          {(b.status === "pending" || b.status === "confirmed") && (
            <button onClick={handleCancelByUser}
              className="w-full py-3 rounded-xl border-2 border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 font-semibold text-sm transition-colors flex items-center justify-center gap-2">
              <X size={14} /> Cancel Booking
            </button>
          )}
          <button onClick={() => navigate(`/dashboard/bookings`)}
            className="w-full py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 font-semibold text-sm transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800 flex items-center justify-center gap-2">
            <ArrowLeft size={14} /> Back to Bookings
          </button>
        </div>
      )}
    </div>
  );
};

export default BookingDetails;
