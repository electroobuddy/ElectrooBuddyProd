import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import Section from "@/components/Section";
import { CalendarDays, Loader2, Zap, Phone, CheckCircle, MapPin, UserCheck, Sun, Moon } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

const BookingForm = () => {
  const [params] = useSearchParams();
  const preselected = params.get("service") || "";
  const [services, setServices] = useState<any[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [assigningTechnician, setAssigningTechnician] = useState(false);
  const [done, setDone] = useState(false);
  const { user } = useAuth();
  const [darkMode, setDarkMode] = useState(false);

  // Dark mode effect
  useEffect(() => {
    const isDark = localStorage.getItem('darkMode') === 'true' || 
      (!localStorage.getItem('darkMode') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    setDarkMode(isDark);
    if (isDark) document.documentElement.classList.add('dark');
  }, []);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
    localStorage.setItem('darkMode', String(!darkMode));
  };

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
  
  const [gettingLocation, setGettingLocation] = useState(false);

  useEffect(() => {
    supabase.from("services").select("title").order("sort_order").then(({ data }) => {
      setServices(data || []);
    });
  }, []);

  // Add Custom Service option to services list
  const servicesWithOptions = [
    ...services,
    { title: "Custom Service" }
  ];

  useEffect(() => {
    if (preselected) setForm((f) => ({ ...f, service_type: preselected }));
  }, [preselected]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const insertData: any = {
      name: form.name,
      phone: form.phone,
      email: form.email,
      address: form.address,
      service_type: form.service_type === "Custom Service" ? `Custom: ${form.custom_service_demand}` : form.service_type,
      preferred_date: form.preferred_date,
      preferred_time: form.preferred_time,
      description: form.service_type === "Custom Service" ? form.custom_service_demand : (form.description || null),
      exact_location: form.exact_location || null,
      custom_service_demand: form.service_type === "Custom Service" ? form.custom_service_demand : null,
      is_switch_working: form.is_switch_working || null,
      has_old_fan: form.has_old_fan || null,
      is_electricity_supply_on: form.is_electricity_supply_on || null,
    };
    if (user) {
      insertData.user_id = user.id;
    }
    
    try {
      // Insert booking
      const { data: bookingData, error } = await supabase.from("bookings").insert(insertData).select().single();
      
      if (error) throw error;
      
      const bookingId = bookingData.id;
      toast.success("Booking submitted! Assigning technician...");
      
      // Call auto-assign function
      try {
        const response = await supabase.functions.invoke("auto-assign-technician", {
          body: { bookingId },
        });
        
        if (response.error) {
          console.error("Auto-assign error:", response.error);
          toast.info("Booking submitted but no technician available right now. Admin will assign manually.");
        } else if (response.data?.success) {
          toast.success(`Technician assigned: ${response.data.technician.name} (${response.data.technician.phone})`);
        } else {
          toast.info("Booking submitted. No technician available at the moment. Admin will contact you soon.");
        }
      } catch (funcError) {
        console.error("Failed to call auto-assign function:", funcError);
        // Don't show error to user - booking was successful
      }
      
      setDone(true);
      setForm({ 
        name: "", 
        phone: "", 
        email: "", 
        address: "", 
        service_type: "", 
        preferred_date: "", 
        preferred_time: "", 
        description: "",
        exact_location: "",
        custom_service_demand: "",
        is_switch_working: "",
        has_old_fan: "",
        is_electricity_supply_on: "",
      });
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Failed to submit booking. Please try again.");
    } finally {
      setSubmitting(false);
      setAssigningTechnician(false);
    }
  };

  const phoneFromSettings = "+918109308287";

  const fields = [
    { name: "name", label: "Full Name", type: "text", placeholder: "John Doe" },
    { name: "phone", label: "Phone Number", type: "tel", placeholder: "+91 98765 43210" },
    { name: "email", label: "Email Address", type: "email", placeholder: "your@email.com" },
  ];
  
const handleGetCurrentLocation = () => {
  setGettingLocation(true);
  if (!navigator.geolocation) {
    setGettingLocation(false);
    toast.error("Geolocation is not supported by your browser.");
    return;
  }

  navigator.geolocation.getCurrentPosition(
    async (position) => {
      const { latitude, longitude } = position.coords;

      const buildAddress = (a: any): string => {
        // Most granular → least granular
        const level1 = [
          a.house_number,
          a.house_name,
          a.building,
          a.amenity,
          a.shop,
          a.office,
          a.tourism,
          a.leisure,
        ].filter(Boolean).join(", ");

        const level2 = [
          a.road,
          a.pedestrian,
          a.footway,
          a.street,
          a.path,
          a.residential,
        ].filter(Boolean)[0] || "";

        const level3 = [
          a.neighbourhood,
          a.quarter,
          a.suburb,
          a.hamlet,
          a.village,
        ].filter(Boolean)[0] || "";

        const level4 = [
          a.city_district,
          a.district,
          a.town,
          a.city,
          a.county,
          a.state_district,
        ].filter(Boolean)[0] || "";

        const level5 = a.state || "";
        const level6 = a.postcode || "";

        const parts = [level1, level2, level3, level4, level5, level6].filter(Boolean);
        return parts.join(", ");
      };

      // Try Nominatim first with zoom=18 (street level)
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1&zoom=18&accept-language=en`,
          { headers: { "Accept-Language": "en" } }
        );
        const data = await res.json();
        const a = data.address || {};
        let address = buildAddress(a);

        // If result is still vague (no road/street found), use display_name first 4 parts
        if (!a.road && !a.pedestrian && !a.footway && !a.street && !a.residential) {
          const displayParts = (data.display_name || "").split(",").map((s: string) => s.trim());
          // Take up to first 5 meaningful parts (skip country)
          address = displayParts.slice(0, 5).join(", ");
        }

        if (address) {
          setForm((prev) => ({ ...prev, address, exact_location: address }));
          toast.success("Address fetched successfully!");
          setGettingLocation(false);
          return;
        }
      } catch (_) {}

      // Fallback: try OpenCage (no key needed for low usage)
      try {
        const res = await fetch(
          `https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=YOUR_OPENCAGE_KEY&language=en&pretty=1&no_annotations=1`
        );
        const data = await res.json();
        const formatted = data.results?.[0]?.formatted;
        if (formatted) {
          setForm((prev) => ({ ...prev, address: formatted, exact_location: formatted }));
          toast.success("Address fetched!");
          setGettingLocation(false);
          return;
        }
      } catch (_) {}

      // Last fallback: BigDataCloud (free, no key)
      try {
        const res = await fetch(
          `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
        );
        const data = await res.json();
        const parts = [
          data.locality,
          data.localityInfo?.administrative?.find((x: any) => x.adminLevel === 6)?.name,
          data.localityInfo?.administrative?.find((x: any) => x.adminLevel === 4)?.name,
          data.city || data.principalSubdivision,
          data.postcode,
        ].filter(Boolean);

        const address = parts.join(", ");
        if (address) {
          setForm((prev) => ({ ...prev, address, exact_location: address }));
          toast.success("Address fetched!");
          setGettingLocation(false);
          return;
        }
      } catch (_) {}

      // All APIs failed
      toast.error("Couldn't resolve address. Please type it manually.");
      setGettingLocation(false);
    },
    (error) => {
      setGettingLocation(false);
      if (error.code === error.PERMISSION_DENIED) {
        toast.error("Location permission denied. Please allow access or enter address manually.");
      } else if (error.code === error.TIMEOUT) {
        toast.error("Location request timed out. Please try again.");
      } else {
        toast.error("Unable to get location. Please enter manually.");
      }
    },
    { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
  );
};

  return (
    <div className="booking-page bg-gray-50 dark:bg-gray-900 min-h-screen">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');

        .booking-page {
          font-family: 'Poppins', sans-serif;
        }

        .booking-page h1,
        .booking-page h2,
        .booking-page h3,
        .booking-page h4,
        .booking-page h5,
        .booking-page h6 {
          font-weight: 700;
        }

        .booking-hero {
          position: relative;
          padding: 112px 0 96px;
          overflow: hidden;
          text-align: center;
        }

        /* Form Card */
        .booking-card {
          position: relative;
          background: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 24px;
          padding: 48px 44px;
          overflow: hidden;
          font-family: 'Poppins', sans-serif;
          max-width: 680px;
          margin: 0 auto;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
          transition: background-color 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease;
        }

        .dark .booking-card {
          background: #1f2937;
          border-color: #374151;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
        }

        @media (max-width: 640px) {
          .booking-card { padding: 32px 20px; }
        }

        .card-tl-corner {
          position: absolute;
          top: 0; left: 0;
          width: 80px; height: 80px;
          border-top: 2px solid rgba(59, 130, 246, 0.35);
          border-left: 2px solid rgba(59, 130, 246, 0.35);
          border-radius: 24px 0 0 0;
          pointer-events: none;
        }

        .card-br-corner {
          position: absolute;
          bottom: 0; right: 0;
          width: 80px; height: 80px;
          border-bottom: 2px solid rgba(59, 130, 246, 0.15);
          border-right: 2px solid rgba(59, 130, 246, 0.15);
          border-radius: 0 0 24px 0;
          pointer-events: none;
        }

        .card-bolt {
          position: absolute;
          top: -20px; right: -10px;
          width: 140px; height: 140px;
          opacity: 0.03;
          pointer-events: none;
        }

        /* ─── FIELD STYLES ─── */
        .field-group {
          margin-bottom: 20px;
        }

        .field-label {
          display: block;
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.5px;
          text-transform: uppercase;
          color: #6b7280;
          margin-bottom: 8px;
          font-family: 'Poppins', sans-serif;
        }

        .dark .field-label {
          color: #9ca3af;
        }

        .field-input,
        .field-select,
        .field-textarea {
          width: 100%;
          padding: 13px 16px;
          background: #f9fafb;
          border: 1.5px solid #e5e7eb;
          border-radius: 12px;
          color: #111827;
          font-size: 14px;
          font-family: 'Poppins', sans-serif;
          outline: none;
          transition: all 0.25s ease;
          appearance: none;
          -webkit-appearance: none;
          box-sizing: border-box;
        }

        .dark .field-input,
        .dark .field-select,
        .dark .field-textarea {
          background: #374151;
          border-color: #4b5563;
          color: #f9fafb;
        }

        .field-input::placeholder,
        .field-textarea::placeholder {
          color: #9ca3af;
        }

        .field-input:focus,
        .field-select:focus,
        .field-textarea:focus {
          border-color: #3b82f6;
          background: #fff;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .dark .field-input:focus,
        .dark .field-select:focus,
        .dark .field-textarea:focus {
          background: #4b5563;
          border-color: #60a5fa;
          box-shadow: 0 0 0 3px rgba(96, 165, 250, 0.2);
        }

        .field-select option {
          background: #ffffff;
          color: #111827;
        }

        .dark .field-select option {
          background: #374151;
          color: #f9fafb;
        }

        .field-textarea {
          resize: none;
          min-height: 110px;
        }

        .grid-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        @media (max-width: 480px) {
          .grid-2 { grid-template-columns: 1fr; }
        }

        /* ─── SUBMIT BUTTON ─── */
        .submit-btn {
          width: 100%;
          padding: 16px;
          background: linear-gradient(135deg, #3b82f6, #2563eb);
          color: #ffffff;
          font-family: 'Poppins', sans-serif;
          font-size: 16px;
          font-weight: 600;
          letter-spacing: 0.5px;
          text-transform: uppercase;
          border: none;
          border-radius: 14px;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          margin-top: 28px;
          position: relative;
          overflow: hidden;
          box-shadow: 0 4px 16px rgba(59, 130, 246, 0.35);
        }

        .submit-btn:hover:not(:disabled) {
          background: linear-gradient(135deg, #2563eb, #1d4ed8);
          box-shadow: 0 8px 24px rgba(59, 130, 246, 0.45);
          transform: translateY(-2px);
        }

        .submit-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .form-divider {
          height: 1px;
          background: linear-gradient(90deg, transparent, #e5e7eb, transparent);
          margin: 24px 0;
        }

        .dark .form-divider {
          background: linear-gradient(90deg, transparent, #4b5563, transparent);
        }

        .call-link-row {
          text-align: center;
          font-size: 14px;
          color: #6b7280;
          font-family: 'Poppins', sans-serif;
        }

        .dark .call-link-row {
          color: #9ca3af;
        }

        .call-link {
          color: #3b82f6;
          font-weight: 600;
          text-decoration: none;
          transition: opacity 0.2s;
        }

        .call-link:hover { opacity: 0.75; }

        /* Success State */
        .success-box {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          padding: 40px 0;
          gap: 16px;
          font-family: 'Poppins', sans-serif;
        }

        .success-icon {
          width: 72px;
          height: 72px;
          border-radius: 50%;
          background: #dcfce7;
          border: 2px solid #86efac;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #16a34a;
          box-shadow: 0 0 32px rgba(22, 163, 74, 0.2);
          animation: successPop 0.5s cubic-bezier(0.23, 1, 0.32, 1);
        }

        .dark .success-icon {
          background: #14532d;
          border-color: #166534;
          color: #4ade80;
        }

        @keyframes successPop {
          0% { transform: scale(0.5); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }

        .success-title {
          font-family: 'Poppins', sans-serif;
          font-size: 28px;
          font-weight: 700;
          color: #111827;
        }

        .dark .success-title {
          color: #f9fafb;
        }

        .success-sub {
          font-size: 14px;
          color: #6b7280;
          max-width: 320px;
          line-height: 1.6;
          font-family: 'Poppins', sans-serif;
        }

        .dark .success-sub {
          color: #9ca3af;
        }

        .success-reset {
          margin-top: 8px;
          padding: 10px 28px;
          border: 1px solid #e5e7eb;
          border-radius: 100px;
          background: #f9fafb;
          color: #3b82f6;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.25s;
          font-family: 'Poppins', sans-serif;
        }

        .dark .success-reset {
          border-color: #4b5563;
          background: #374151;
          color: #60a5fa;
        }

        .success-reset:hover {
          background: #f3f4f6;
          border-color: #d1d5db;
        }

        .dark .success-reset:hover {
          background: #4b5563;
          border-color: #6b7280;
        }
      `}</style>

      {/* Dark Mode Toggle Button */}
      <button
        onClick={toggleDarkMode}
        className="fixed top-24 right-4 z-50 bg-white dark:bg-gray-800 p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700"
        aria-label="Toggle dark mode"
      >
        {darkMode ? (
          <Sun className="w-6 h-6 text-yellow-500" />
        ) : (
          <Moon className="w-6 h-6 text-gray-700" />
        )}
      </button>

      {/* Hero */}
      {/* Hero */}
      <section className="hero-gradient text-white booking-hero slide-up">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 30 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.7 }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.4 }}
              className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-6 py-3 rounded-full mb-8"
            >
              <CalendarDays className="w-5 h-5" />
              <span className="font-semibold text-sm uppercase tracking-wide">Appointments</span>
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6"
            >
              Book a Service
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="text-xl max-w-3xl mx-auto opacity-90"
            >
              Fill in the details below and we'll confirm your slot shortly
            </motion.p>
          </motion.div>
        </div>
      </section>

      <Section>
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <div className="booking-card">
            <div className="card-tl-corner" />
            <div className="card-br-corner" />

            {done ? (
              <div className="success-box">
                <div className="success-icon"><CheckCircle size={32} /></div>
                <div className="success-title">Booking Received!</div>
                <p className="success-sub">We'll reach out to confirm your appointment. Expect a call or message soon.</p>
                <div className="flex gap-3 mt-4">
                  <a href="/track-booking" className="success-reset">Track Your Booking</a>
                  <button className="success-reset" onClick={() => setDone(false)}>Book Another</button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                {/* Basic fields */}
                {fields.map((f) => (
                  <div className="field-group" key={f.name}>
                    <label className="field-label">{f.label}</label>
                    <input
                      type={f.type}
                      required
                      placeholder={f.placeholder}
                      className="field-input"
                      value={(form as any)[f.name]}
                      onChange={(e) => setForm({ ...form, [f.name]: e.target.value })}
                    />
                  </div>
                ))}

                {/* Address with Location Picker */}
                <div className="field-group">
                  <div className="flex items-center justify-between mb-2">
                    <label className="field-label mb-0">Service Address *</label>
                    <button
                      type="button"
                      onClick={handleGetCurrentLocation}
                      disabled={gettingLocation}
                      className="text-xs px-3 py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 font-medium transition-colors flex items-center gap-1.5 disabled:opacity-50"
                    >
                      {gettingLocation ? (
                        <><Loader2 size={12} className="animate-spin" /> Getting Location...</>
                      ) : (
                        <><MapPin size={12} /> Use Current Location</>
                      )}
                    </button>
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="123 Main St, City or use location picker"
                    className="field-input"
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                  />
                </div>

                {/* Service select */}
                <div className="field-group">
                  <label className="field-label">Service Type</label>
                  <select
                    required
                    className="field-select"
                    value={form.service_type}
                    onChange={(e) => setForm({ ...form, service_type: e.target.value })}
                  >
                    <option value="">Select a service...</option>
                    {servicesWithOptions.map((s) => (
                      <option key={s.title} value={s.title}>{s.title}</option>
                    ))}
                  </select>
                </div>

                {/* Custom Service Demand Input - Show only when Custom Service is selected */}
                {form.service_type === "Custom Service" && (
                  <div className="field-group">
                    <label className="field-label">Describe Your Custom Service Requirement *</label>
                    <textarea
                      required
                      rows={4}
                      placeholder="Please describe the specific electrical work you need done..."
                      className="field-textarea"
                      value={form.custom_service_demand}
                      onChange={(e) => setForm({ ...form, custom_service_demand: e.target.value })}
                    />
                  </div>
                )}

                {/* Date + Time */}
                <div className="grid-2">
                  <div className="field-group">
                    <label className="field-label">Preferred Date</label>
                    <input
                      type="date"
                      required
                      className="field-input"
                      value={form.preferred_date}
                      onChange={(e) => setForm({ ...form, preferred_date: e.target.value })}
                    />
                  </div>
                  <div className="field-group">
                    <label className="field-label">Preferred Time</label>
                    <input
                      type="time"
                      required
                      className="field-input"
                      value={form.preferred_time}
                      onChange={(e) => setForm({ ...form, preferred_time: e.target.value })}
                    />
                  </div>
                </div>

                {/* Description */}
                <div className="field-group">
                  <label className="field-label">Description <span style={{ color: "hsl(var(--muted-foreground) / 0.3)", textTransform: "lowercase", letterSpacing: 0 }}>(optional)</span></label>
                  <textarea
                    className="field-textarea"
                    placeholder="Describe your electrical issue or requirement..."
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                  />
                </div>

                {/* Exact Location */}
                <div className="field-group">
                  <label className="field-label">Exact Location / Landmark</label>
                  <input
                    type="text"
                    placeholder="Near temple, Behind shopping mall, etc."
                    className="field-input"
                    value={form.exact_location}
                    onChange={(e) => setForm({ ...form, exact_location: e.target.value })}
                  />
                </div>

                {/* Fan Installation Questions - Only show if service is Fan Installation */}
                {form.service_type.toLowerCase().includes('fan') && (
                  <>
                    <div className="field-group">
                      <label className="field-label">Is Your Switch Working? *</label>
                      <select
                        required
                        className="field-select"
                        value={form.is_switch_working}
                        onChange={(e) => setForm({ ...form, is_switch_working: e.target.value })}
                      >
                        <option value="">Select...</option>
                        <option value="yes">Yes</option>
                        <option value="no">No</option>
                      </select>
                    </div>

                    <div className="field-group">
                      <label className="field-label">Is There an Old Fan at Installation Location? *</label>
                      <select
                        required
                        className="field-select"
                        value={form.has_old_fan}
                        onChange={(e) => setForm({ ...form, has_old_fan: e.target.value })}
                      >
                        <option value="">Select...</option>
                        <option value="yes">Yes</option>
                        <option value="no">No</option>
                      </select>
                    </div>

                    <div className="field-group">
                      <label className="field-label">Is Electricity Supply On at Switch Location? *</label>
                      <select
                        required
                        className="field-select"
                        value={form.is_electricity_supply_on}
                        onChange={(e) => setForm({ ...form, is_electricity_supply_on: e.target.value })}
                      >
                        <option value="">Select...</option>
                        <option value="yes">Yes</option>
                        <option value="no">No</option>
                      </select>
                    </div>
                  </>
                )}

                <button type="submit" className="submit-btn" disabled={submitting || assigningTechnician}>
                  {submitting || assigningTechnician ? (
                    <><Loader2 size={18} className="animate-spin" /> {assigningTechnician ? "Assigning Technician..." : "Processing..."}</>
                  ) : (
                    <><Zap size={16} /> Submit Booking</>
                  )}
                </button>

                <div className="form-divider" />

                <div className="call-link-row">
                  Prefer to call? Reach us at{" "}
                  <a href={`tel:${phoneFromSettings}`} className="call-link">
                    <Phone size={12} style={{ display: "inline", marginRight: 4, verticalAlign: "middle" }} />
                    {phoneFromSettings}
                  </a>
                </div>
              </form>
            )}
          </div>
        </motion.div>
      </Section>
    </div>
  );
};

export default BookingForm;