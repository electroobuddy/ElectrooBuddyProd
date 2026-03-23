import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import Section from "@/components/Section";
import { CalendarDays, Loader2, Zap, Phone, CheckCircle, MapPin, UserCheck } from "lucide-react";
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
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            // Reverse geocoding using OpenStreetMap Nominatim (free)
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
            const data = await response.json();
            const address = data.display_name || `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
            setForm({ ...form, address, exact_location: address });
            toast.success("Location fetched successfully!");
          } catch (error) {
            setForm({ ...form, address: `${latitude}, ${longitude}`, exact_location: `${latitude}, ${longitude}` });
            toast.success("Coordinates fetched! Please provide more details.");
          }
          setGettingLocation(false);
        },
        (error) => {
          setGettingLocation(false);
          toast.error("Unable to get your location. Please enter manually.");
        }
      );
    } else {
      setGettingLocation(false);
      toast.error("Geolocation is not supported by your browser.");
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700;800;900&family=DM+Sans:wght@400;500&display=swap');

        /* ─── HERO ─── */
        .booking-hero {
          position: relative;
          padding: 8px 0 8px;
          overflow: hidden;
          background: hsl(var(--background));
          text-align: center;
          font-family: 'DM Sans', sans-serif;
        }

        .bh-grid {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(hsl(var(--primary) / 0.035) 1px, transparent 1px),
            linear-gradient(90deg, hsl(var(--primary) / 0.035) 1px, transparent 1px);
          background-size: 60px 60px;
          mask-image: radial-gradient(ellipse 80% 80% at 50% 50%, black 20%, transparent 100%);
        }

        .bh-glow {
          position: absolute;
          top: -80px; left: 50%;
          transform: translateX(-50%);
          width: 500px; height: 350px;
          background: radial-gradient(ellipse, hsl(var(--primary) / 0.09) 0%, transparent 70%);
          pointer-events: none;
        }

        .bh-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 7px 18px;
          border: 1px solid hsl(var(--border) / 0.3);
          border-radius: 100px;
          background: hsl(var(--primary) / 0.06);
          margin-bottom: 20px;
          font-size: 12px;
          font-weight: 600;
          color: hsl(var(--secondary));
          letter-spacing: 1px;
          text-transform: uppercase;
        }

        .bh-title {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: clamp(48px, 7vw, 84px);
          font-weight: 900;
          line-height: 0.92;
          color: hsl(var(--foreground));
          text-transform: uppercase;
          letter-spacing: -1px;
        }

        .bh-title span {
          background: linear-gradient(135deg, hsl(var(--secondary)) 0%, hsl(var(--electric-yellow-light)) 50%, hsl(var(--electric-blue-dark)) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .bh-sub {
          color: hsl(var(--muted-foreground) / 0.5);
          font-size: 15px;
          margin-top: 14px;
          max-width: 380px;
          margin-left: auto;
          margin-right: auto;
        }

        /* ─── FORM CARD ─── */
        .booking-card {
          position: relative;
          background: hsl(var(--card));
          border: 1px solid hsl(var(--border) / 0.3);
          border-radius: 24px;
          padding: 48px 44px;
          overflow: hidden;
          font-family: 'DM Sans', sans-serif;
          max-width: 680px;
          margin: 0 auto;
        }

        @media (max-width: 640px) {
          .booking-card { padding: 32px 20px; }
        }

        .card-tl-corner {
          position: absolute;
          top: 0; left: 0;
          width: 80px; height: 80px;
          border-top: 2px solid hsl(var(--primary) / 0.35);
          border-left: 2px solid hsl(var(--primary) / 0.35);
          border-radius: 24px 0 0 0;
          pointer-events: none;
        }

        .card-br-corner {
          position: absolute;
          bottom: 0; right: 0;
          width: 80px; height: 80px;
          border-bottom: 2px solid hsl(var(--primary) / 0.15);
          border-right: 2px solid hsl(var(--primary) / 0.15);
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
          font-weight: 700;
          letter-spacing: 0.8px;
          text-transform: uppercase;
          color: hsl(var(--muted-foreground) / 0.6);
          margin-bottom: 8px;
          font-family: 'Barlow Condensed', sans-serif;
        }

        .field-input,
        .field-select,
        .field-textarea {
          width: 100%;
          padding: 13px 16px;
          background: hsl(var(--primary) / 0.03);
          border: 1px solid hsl(var(--border) / 0.3);
          border-radius: 12px;
          color: hsl(var(--foreground));
          font-size: 14px;
          font-family: 'DM Sans', sans-serif;
          outline: none;
          transition: all 0.25s ease;
          appearance: none;
          -webkit-appearance: none;
        }

        .field-input::placeholder,
        .field-textarea::placeholder {
          color: hsl(var(--muted-foreground) / 0.3);
        }

        .field-input:focus,
        .field-select:focus,
        .field-textarea:focus {
          border-color: hsl(var(--primary) / 0.5);
          background: hsl(var(--primary) / 0.03);
          box-shadow: 0 0 0 3px hsl(var(--primary) / 0.08), inset 0 0 0 1px hsl(var(--primary) / 0.1);
        }

        .field-select option {
          background: hsl(var(--card));
          color: hsl(var(--foreground));
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
          background: linear-gradient(135deg, hsl(var(--secondary)), hsl(var(--electric-blue-dark)));
          color: hsl(var(--primary-foreground));
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 18px;
          font-weight: 800;
          letter-spacing: 1px;
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
        }

        .submit-btn::before {
          content: '';
          position: absolute;
          inset: 0;
          background: hsl(var(--foreground) / 0);
          transition: background 0.3s;
        }

        .submit-btn:hover:not(:disabled) {
          box-shadow: 0 0 32px hsl(var(--primary) / 0.4), 0 8px 24px hsl(var(--secondary) / 0.3);
          transform: translateY(-2px);
        }

        .submit-btn:hover::before { background: hsl(var(--foreground) / 0.08); }

        .submit-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .form-divider {
          height: 1px;
          background: linear-gradient(90deg, transparent, hsl(var(--border) / 0.2), transparent);
          margin: 24px 0;
        }

        .call-link-row {
          text-align: center;
          font-size: 13px;
          color: hsl(var(--muted-foreground) / 0.5);
          font-family: 'DM Sans', sans-serif;
        }

        .call-link {
          color: hsl(var(--secondary));
          font-weight: 600;
          text-decoration: none;
          transition: opacity 0.2s;
        }

        .call-link:hover { opacity: 0.75; }

        /* ─── SUCCESS STATE ─── */
        .success-box {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          padding: 40px 0;
          gap: 16px;
          font-family: 'DM Sans', sans-serif;
        }

        .success-icon {
          width: 72px;
          height: 72px;
          border-radius: 50%;
          background: hsl(var(--primary) / 0.1);
          border: 2px solid hsl(var(--border) / 0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          color: hsl(var(--secondary));
          box-shadow: 0 0 32px hsl(var(--primary) / 0.2);
          animation: successPop 0.5s cubic-bezier(0.23, 1, 0.32, 1);
        }

        @keyframes successPop {
          0% { transform: scale(0.5); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }

        .success-title {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 32px;
          font-weight: 800;
          text-transform: uppercase;
          color: hsl(var(--foreground));
          letter-spacing: 0.5px;
        }

        .success-sub {
          font-size: 14px;
          color: hsl(var(--muted-foreground) / 0.6);
          max-width: 320px;
          line-height: 1.6;
        }

        .success-reset {
          margin-top: 8px;
          padding: 10px 28px;
          border: 1px solid hsl(var(--border) / 0.3);
          border-radius: 100px;
          background: hsl(var(--primary) / 0.06);
          color: hsl(var(--secondary));
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.25s;
          font-family: 'DM Sans', sans-serif;
        }

        .success-reset:hover {
          background: hsl(var(--primary) / 0.12);
          border-color: hsl(var(--primary) / 0.5);
        }
      `}</style>

      {/* Hero */}
      <section className="booking-hero">
        <div className="bh-grid" />
        <div className="bh-glow" />
        <div className="container mx-auto px-4 relative z-10">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="bh-badge"><CalendarDays size={12} /> Appointments</div>
            <h1 className="bh-title">Book a <span>Service</span></h1>
            <p className="bh-sub">Fill in the details below and we'll confirm your slot shortly</p>
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
            <svg className="card-bolt" viewBox="0 0 100 100" fill="none">
              <path d="M60 5L20 55h30L35 95l45-55H50L60 5z" fill="hsl(var(--secondary))" />
            </svg>

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
    </>
  );
};

export default BookingForm;