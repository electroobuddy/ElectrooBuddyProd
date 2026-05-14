import { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import Section from "@/components/Section";
import {
  CalendarDays, Loader2, Zap, Phone, CheckCircle, MapPin,
  Tag, Check, ArrowRight, Clock, Shield, Star,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useServicesStore } from "@/stores/servicesStore";
import { sendAdminNotificationAsync } from "@/utils/notificationUtils";

function withTimeout<T>(promise: PromiseLike<T>, ms: number, label: string): Promise<T> {
  return Promise.race([
    Promise.resolve(promise),
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`TIMEOUT: ${label}`)), ms)
    ),
  ]);
}

// Returns today's date string in YYYY-MM-DD (local timezone, not UTC)
function getTodayString(): string {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

const BookingForm = () => {
  const [params] = useSearchParams();
  const preselected = params.get("service") || "";
  const preselectedOffer = params.get("offer") || "";

  const { bookingServices, getServiceCharge, fetchBookingServices } = useServicesStore();
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const { user } = useAuth();
  const abortControllerRef = useRef<AbortController | null>(null);
  const [selectedServiceCharge, setSelectedServiceCharge] = useState<{
    amount: string; label: string; show: boolean;
  } | null>(null);

  const [couponCode, setCouponCode] = useState(preselectedOffer);
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [gettingLocation, setGettingLocation] = useState(false);
  const [dateError, setDateError] = useState("");

  const todayStr = getTodayString();

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    service_type: preselected,
    preferred_date: "",
    preferred_time: "",
    description: "",
    exact_location: "",
    custom_service_demand: "",
    is_switch_working: "",
    has_old_fan: "",
    is_electricity_supply_on: "",
  });

  useEffect(() => { fetchBookingServices(); }, [fetchBookingServices]);

  useEffect(() => {
    if (preselected) setForm((f) => ({ ...f, service_type: preselected }));
  }, [preselected]);

  useEffect(() => {
    if (form.service_type && form.service_type !== "Custom Service") {
      setSelectedServiceCharge(getServiceCharge(form.service_type));
    } else {
      setSelectedServiceCharge(null);
    }
  }, [form.service_type, getServiceCharge]);

  // ── Date validation: reject any date before today ──
  const handleDateChange = (val: string) => {
    if (val < todayStr) {
      setDateError("Please select today or a future date.");
      setForm((f) => ({ ...f, preferred_date: val }));
    } else {
      setDateError("");
      setForm((f) => ({ ...f, preferred_date: val }));
    }
  };

  const calculateDiscount = () => {
    const baseAmount = selectedServiceCharge ? parseFloat(selectedServiceCharge.amount) : 0;
    if (!appliedCoupon?.success || !baseAmount) return { original: baseAmount, discount: 0, final: baseAmount };
    const discount = Math.min(appliedCoupon?.discount_amount || 0, baseAmount);
    return { original: baseAmount, discount, final: baseAmount - discount };
  };

  const { original, discount, final } = calculateDiscount();

  const servicesWithOptions = [...bookingServices, { title: "Custom Service" }];

  const handleApplyCoupon = useCallback(async () => {
    if (!couponCode.trim()) { toast.error("Please enter a coupon code"); return; }
    if (!user) { toast.error("Please login to apply coupon"); return; }
    const baseAmount = selectedServiceCharge ? parseFloat(selectedServiceCharge.amount) : 0;
    if (!baseAmount) { toast.error("Please select a service first"); return; }

    setApplyingCoupon(true);
    const tid = toast.loading("Validating coupon...");
    try {
      const rpcPromise = supabase.rpc("apply_coupon", {
        p_coupon_code: couponCode.toUpperCase().trim(),
        p_user_id: user.id,
        p_cart_total: baseAmount,
        p_cart_items: [] as any,
      }) as unknown as Promise<any>;

      const result = await withTimeout(rpcPromise, 6000, "coupon-validation");

      if (result.error) {
        toast.error(result.error.message || "Failed to apply coupon", { id: tid });
        setAppliedCoupon(null);
        return;
      }
      if (!result.data?.length) {
        toast.error("Invalid coupon code", { id: tid });
        setAppliedCoupon(null);
        return;
      }
      const couponResult = result.data[0];
      if (couponResult?.success && typeof couponResult.discount_amount === "number") {
        setAppliedCoupon(couponResult);
        toast.success(`Coupon applied! Save ₹${couponResult.discount_amount.toFixed(2)}`, { id: tid });
      } else {
        toast.error(couponResult?.message || "Cannot apply this coupon", { id: tid });
        setAppliedCoupon(null);
      }
    } catch (err: any) {
      toast.error(
        err?.message?.includes("TIMEOUT") ? "Coupon check timed out. Try again." : "Failed to apply coupon.",
        { id: tid }
      );
      setAppliedCoupon(null);
    } finally {
      setApplyingCoupon(false);
    }
  }, [couponCode, user, selectedServiceCharge]);

  useEffect(() => {
    if (preselectedOffer && user) {
      const t = setTimeout(() => handleApplyCoupon(), 100);
      return () => clearTimeout(t);
    }
  }, [preselectedOffer, user]);

  const handleGetCurrentLocation = () => {
    setGettingLocation(true);
    if (!navigator.geolocation) {
      setGettingLocation(false);
      toast.error("Geolocation not supported by your browser.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async ({ coords: { latitude, longitude } }) => {
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1&zoom=18&accept-language=en`
          );
          const data = await res.json();
          const a = data.address || {};
          const parts = [
            a.house_number, a.road || a.pedestrian || a.footway,
            a.neighbourhood || a.suburb, a.city || a.town, a.state, a.postcode,
          ].filter(Boolean);
          const address = parts.join(", ") || data.display_name?.split(",").slice(0, 5).join(", ");
          if (address) {
            setForm((f) => ({ ...f, address, exact_location: address }));
            toast.success("Location fetched!");
          } else throw new Error("No address");
        } catch {
          toast.error("Couldn't resolve address. Please type it manually.");
        }
        setGettingLocation(false);
      },
      (err) => {
        setGettingLocation(false);
        toast.error(
          err.code === err.PERMISSION_DENIED
            ? "Location permission denied. Enter address manually."
            : "Unable to get location. Enter manually."
        );
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    // Guard: reject past dates
    if (form.preferred_date && form.preferred_date < todayStr) {
      toast.error("Please select today or a future date.");
      return;
    }

    abortControllerRef.current?.abort();
    abortControllerRef.current = new AbortController();
    setSubmitting(true);

    const { original, discount, final } = calculateDiscount();
    const tid = toast.loading("Submitting your booking...");

    const insertData: any = {
      name: form.name.trim(),
      phone: form.phone.trim(),
      email: form.email.trim() || null,
      address: form.address.trim(),
      service_type:
        form.service_type === "Custom Service"
          ? `Custom: ${form.custom_service_demand.trim()}`
          : form.service_type,
      preferred_date: form.preferred_date || todayStr,
      preferred_time: form.preferred_time || "09:00",
      description:
        form.service_type === "Custom Service"
          ? form.custom_service_demand.trim()
          : form.description.trim() || null,
      exact_location: form.exact_location?.trim() || null,
      custom_service_demand:
        form.service_type === "Custom Service" ? form.custom_service_demand.trim() : null,
      is_switch_working: form.is_switch_working || null,
      has_old_fan: form.has_old_fan || null,
      is_electricity_supply_on: form.is_electricity_supply_on || null,
      user_id: user?.id || null,
      coupon_code: couponCode?.trim()?.toUpperCase() || null,
      offer_id: null,
      discount_amount: discount > 0 ? discount : null,
      original_amount: original > 0 ? original : null,
      final_amount: final > 0 ? final : null,
      offer_applied: appliedCoupon?.success || false,
    };

    try {
      const { data: bookingData, error } = await withTimeout(
        supabase.from("bookings").insert(insertData).select("id, name, service_type, preferred_date").single(),
        8000,
        "booking-insert"
      );

      if (error) throw error;
      if (!bookingData?.id) throw new Error("Failed to create booking");

      const bookingId = bookingData.id;

      toast.success("Booking submitted! We'll contact you soon.", { id: tid, duration: 5000 });
      setDone(true);

      setForm({
        name: "", phone: "", email: "", address: "", service_type: preselected,
        preferred_date: "", preferred_time: "", description: "", exact_location: "",
        custom_service_demand: "", is_switch_working: "", has_old_fan: "", is_electricity_supply_on: "",
      });

      Promise.allSettled([
        withTimeout(
          sendAdminNotificationAsync({
            title: "🔔 New Booking Received",
            message: `New booking from ${form.name.trim()} for ${form.service_type}`,
            type: "new_booking",
            bookingId,
            customerName: form.name.trim(),
            service: form.service_type,
            metadata: {
              customer_name: form.name.trim(), customer_phone: form.phone.trim(),
              customer_email: form.email.trim(), service_type: form.service_type,
              preferred_date: form.preferred_date, preferred_time: form.preferred_time,
              address: form.address.trim(), exact_location: form.exact_location?.trim(),
              is_guest: !user,
            },
          }, user),
          6000, "admin-notification"
        ).catch(() => {}),

        withTimeout(
          supabase.functions.invoke("auto-assign-technician", { body: { bookingId } }) as Promise<any>,
          8000, "auto-assign"
        ).then(({ data: result }: any) => {
          if (result?.success)
            toast.info(`Technician ${result.technician?.name} assigned.`, { duration: 4000 });
        }).catch(() => {}),
      ]).catch(() => {});

    } catch (error: any) {
      const isTimeout = error?.message?.includes("TIMEOUT");
      const isDuplicate = error?.code === "23505";
      toast.error(
        isDuplicate ? "This booking already exists." :
        isTimeout ? "Request timed out. Please retry." :
        error?.message || "Failed to submit. Please try again.",
        { id: tid, duration: 7000 }
      );
    } finally {
      setSubmitting(false);
      abortControllerRef.current = null;
    }
  };

  const phoneFromSettings = "+918109308287";
  const isFanService = form.service_type.toLowerCase().includes("fan");

  // ── Shared input classes ──
  const inputCls =
    "w-full px-4 py-3 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 " +
    "text-zinc-900 dark:text-zinc-100 text-sm placeholder-zinc-400 dark:placeholder-zinc-500 " +
    "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent " +
    "transition-all duration-200";

  const labelCls =
    "block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1.5";

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">

      {/* ── Hero ── */}
      <section className="relative hero-gradient text-white overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800" />
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: "radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)", backgroundSize: "60px 60px" }} />
        <div className="relative max-w-3xl mx-auto px-4 py-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm px-5 py-2 rounded-full mb-6 text-sm font-semibold">
              <CalendarDays className="w-4 h-4" />
              Book a Service
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">
              Schedule Your Appointment
            </h1>
            <p className="text-lg text-blue-100 max-w-xl mx-auto">
              Fill in the details below and we'll confirm your slot right away.
            </p>

            {/* Trust badges */}
            <div className="flex flex-wrap justify-center gap-4 mt-8">
              {[
                { icon: <Shield className="w-4 h-4" />, label: "Verified Technicians" },
                { icon: <Clock className="w-4 h-4" />, label: "24/7 Booking" },
                { icon: <Star className="w-4 h-4" />, label: "4.9★ Rated Service" },
              ].map((b) => (
                <div key={b.label} className="flex items-center gap-1.5 bg-white/10 px-4 py-1.5 rounded-full text-sm">
                  {b.icon} {b.label}
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Form ── */}
      <div className="max-w-2xl mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xl shadow-zinc-100 dark:shadow-none overflow-hidden"
        >
          <AnimatePresence mode="wait">
            {done ? (
              /* ── Success State ── */
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center text-center p-12 gap-5"
              >
                <div className="w-20 h-20 rounded-full bg-emerald-50 dark:bg-emerald-900/20 border-2 border-emerald-200 dark:border-emerald-700 flex items-center justify-center">
                  <CheckCircle className="w-10 h-10 text-emerald-500" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">
                    Booking Received!
                  </h2>
                  <p className="text-zinc-500 dark:text-zinc-400 max-w-sm text-sm leading-relaxed">
                    We'll reach out to confirm your appointment. Expect a call or message soon.
                  </p>
                </div>
                <div className="flex flex-wrap gap-3 mt-2">
                  <a
                    href="/track-booking"
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors flex items-center gap-2"
                  >
                    Track Booking <ArrowRight className="w-4 h-4" />
                  </a>
                  <button
                    onClick={() => setDone(false)}
                    className="px-6 py-2.5 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 text-sm font-semibold rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                  >
                    Book Another
                  </button>
                </div>
              </motion.div>
            ) : (
              /* ── Form ── */
              <motion.form
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onSubmit={handleSubmit}
                className="p-6 md:p-8 space-y-5"
              >
                {/* Section header */}
                <div className="pb-1">
                  <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Personal Details</h2>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">We'll use this to contact you</p>
                </div>

                {/* Name + Phone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Full Name *</label>
                    <input
                      type="text" required placeholder="John Doe"
                      className={inputCls}
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Phone Number *</label>
                    <input
                      type="tel" required placeholder="+91 98765 43210"
                      className={inputCls}
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className={labelCls}>Email Address *</label>
                  <input
                    type="email" required placeholder="you@example.com"
                    className={inputCls}
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                  />
                </div>

                {/* Divider */}
                <div className="border-t border-zinc-100 dark:border-zinc-800 pt-2">
                  <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Service Details</h2>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">Tell us what you need</p>
                </div>

                {/* Address */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className={labelCls + " mb-0"}>Service Address *</label>
                    <button
                      type="button"
                      onClick={handleGetCurrentLocation}
                      disabled={gettingLocation}
                      className="text-xs px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40 font-semibold transition-colors flex items-center gap-1.5 disabled:opacity-50"
                    >
                      {gettingLocation
                        ? <><Loader2 className="w-3 h-3 animate-spin" /> Locating...</>
                        : <><MapPin className="w-3 h-3" /> Use Location</>
                      }
                    </button>
                  </div>
                  <input
                    type="text" required placeholder="123 Main St, City"
                    className={inputCls}
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                  />
                </div>

                {/* Service Type */}
                <div>
                  <label className={labelCls}>Service Type *</label>
                  <select
                    required
                    className={inputCls + " cursor-pointer"}
                    value={form.service_type}
                    onChange={(e) => setForm({ ...form, service_type: e.target.value })}
                  >
                    <option value="">Select a service...</option>
                    {servicesWithOptions.map((s) => (
                      <option key={s.title} value={s.title}>{s.title}</option>
                    ))}
                  </select>

                  {/* Service charge badge */}
                  <AnimatePresence>
                    {selectedServiceCharge && (
                      <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        className="mt-3 flex items-center justify-between px-4 py-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-xl"
                      >
                        <span className="text-sm font-semibold text-amber-700 dark:text-amber-400">
                          {selectedServiceCharge.label}
                        </span>
                        <span className="text-xl font-bold text-amber-800 dark:text-amber-300">
                          ₹{selectedServiceCharge.amount}
                        </span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Custom Service textarea */}
                <AnimatePresence>
                  {form.service_type === "Custom Service" && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                    >
                      <label className={labelCls}>Describe Your Requirement *</label>
                      <textarea
                        required rows={4}
                        placeholder="Describe the specific electrical work you need..."
                        className={inputCls + " resize-none"}
                        value={form.custom_service_demand}
                        onChange={(e) => setForm({ ...form, custom_service_demand: e.target.value })}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Fan-specific fields */}
                <AnimatePresence>
                  {isFanService && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-4 p-4 bg-blue-50 dark:bg-blue-900/10 rounded-xl border border-blue-100 dark:border-blue-900/30"
                    >
                      <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                        Fan Installation Details
                      </p>
                      {[
                        { field: "is_switch_working", label: "Is Your Switch Working?" },
                        { field: "has_old_fan", label: "Old Fan at Installation Location?" },
                        { field: "is_electricity_supply_on", label: "Electricity Supply On at Switch?" },
                      ].map(({ field, label }) => (
                        <div key={field}>
                          <label className={labelCls}>{label} *</label>
                          <select
                            required
                            className={inputCls + " cursor-pointer"}
                            value={(form as any)[field]}
                            onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                          >
                            <option value="">Select...</option>
                            <option value="yes">Yes</option>
                            <option value="no">No</option>
                          </select>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Coupon */}
                <div>
                  <label className={labelCls + " flex items-center gap-1.5"}>
                    <Tag className="w-3.5 h-3.5" /> Coupon Code
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="E.g. SUMMER20"
                      className={inputCls + " flex-1"}
                      value={couponCode}
                      onChange={(e) => { setCouponCode(e.target.value.toUpperCase()); setAppliedCoupon(null); }}
                    />
                    <button
                      type="button"
                      onClick={handleApplyCoupon}
                      disabled={applyingCoupon || !couponCode.trim()}
                      className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 whitespace-nowrap
                        ${appliedCoupon?.success
                          ? "bg-emerald-500 text-white"
                          : "bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                        }`}
                    >
                      {applyingCoupon ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        : appliedCoupon?.success ? <Check className="w-3.5 h-3.5" /> : null}
                      {appliedCoupon?.success ? "Applied" : "Apply"}
                    </button>
                  </div>

                  <AnimatePresence>
                    {appliedCoupon?.success && (
                      <motion.p
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-2 text-sm text-emerald-600 dark:text-emerald-400 flex items-center gap-1"
                      >
                        <Check className="w-3.5 h-3.5" />
                        Coupon applied! ₹{appliedCoupon.discount_amount?.toFixed(2)} off
                      </motion.p>
                    )}
                    {appliedCoupon && !appliedCoupon.success && (
                      <motion.p
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-2 text-sm text-red-500"
                      >
                        {appliedCoupon.message || "Invalid coupon code"}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>

                {/* Discount summary */}
                <AnimatePresence>
                  {appliedCoupon?.success && discount > 0 && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="p-4 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-800 rounded-xl space-y-2"
                    >
                      <div className="flex justify-between text-sm text-zinc-500 dark:text-zinc-400">
                        <span>Original Amount</span>
                        <span className="line-through">₹{original.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                        <span>Discount</span>
                        <span>−₹{discount.toFixed(2)}</span>
                      </div>
                      <div className="border-t border-emerald-200 dark:border-emerald-800 pt-2 flex justify-between">
                        <span className="font-bold text-zinc-900 dark:text-white">Final Amount</span>
                        <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">₹{final.toFixed(2)}</span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Divider */}
                <div className="border-t border-zinc-100 dark:border-zinc-800 pt-2">
                  <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Appointment</h2>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                    Choose any date from today · We're available 24 hours
                  </p>
                </div>

                {/* Date + Time */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Preferred Date *</label>
                    <input
                      type="date"
                      required
                      min={todayStr}
                      className={`${inputCls} ${dateError ? "border-red-400 focus:ring-red-400" : ""}`}
                      value={form.preferred_date}
                      onChange={(e) => handleDateChange(e.target.value)}
                    />
                    <AnimatePresence>
                      {dateError && (
                        <motion.p
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          className="mt-1.5 text-xs text-red-500 flex items-center gap-1"
                        >
                          {dateError}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>

                  <div>
                    <label className={labelCls}>
                      Preferred Time *
                      <span className="ml-1 text-zinc-400 normal-case font-normal tracking-normal">(24hrs available)</span>
                    </label>
                    <input
                      type="time"
                      required
                      className={inputCls}
                      value={form.preferred_time}
                      onChange={(e) => setForm({ ...form, preferred_time: e.target.value })}
                    />
                    <p className="mt-1.5 text-xs text-zinc-400 dark:text-zinc-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Book any time — we operate round the clock
                    </p>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className={labelCls}>
                    Description{" "}
                    <span className="text-zinc-400 font-normal normal-case tracking-normal">(optional)</span>
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Describe your electrical issue or requirement..."
                    className={inputCls + " resize-none"}
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                  />
                </div>

                {/* Landmark */}
                <div>
                  <label className={labelCls}>Landmark / Exact Location</label>
                  <input
                    type="text"
                    placeholder="Near temple, behind mall, etc."
                    className={inputCls}
                    value={form.exact_location}
                    onChange={(e) => setForm({ ...form, exact_location: e.target.value })}
                  />
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={submitting || !!dateError}
                  className="w-full mt-2 py-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold text-sm uppercase tracking-wider rounded-xl transition-all duration-200 flex items-center justify-center gap-2.5 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:-translate-y-0.5 active:translate-y-0"
                >
                  {submitting
                    ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</>
                    : <><Zap className="w-4 h-4" /> Submit Booking</>
                  }
                </button>

                {/* Call link */}
                <p className="text-center text-sm text-zinc-500 dark:text-zinc-400 pt-1">
                  Prefer to call?{" "}
                  <a
                    href={`tel:${phoneFromSettings}`}
                    className="text-blue-600 dark:text-blue-400 font-semibold hover:underline inline-flex items-center gap-1"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    {phoneFromSettings}
                  </a>
                </p>
              </motion.form>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
};

export default BookingForm;