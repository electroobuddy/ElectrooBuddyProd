// import { useState, useEffect } from "react";
// import { useSearchParams } from "react-router-dom";
// import Section from "@/components/Section";
// import { supabase } from "@/integrations/supabase/client";
// import { CalendarDays, Loader2, Phone, CheckCircle } from "lucide-react";
// import { toast } from "sonner";

// const BookingForm = () => {
//   const [params] = useSearchParams();
//   const preselected = params.get("service") || "";
//   const [services, setServices] = useState<any[]>([]);

//   const [form, setForm] = useState({
//     name: "",
//     phone: "",
//     address: "",
//     service_type: preselected,
//     preferred_date: "",
//     preferred_time: "",
//     description: "",
//   });
//   const [submitting, setSubmitting] = useState(false);

//   useEffect(() => {
//     supabase.from("services").select("title").order("sort_order").then(({ data }) => {
//       setServices(data || []);
//     });
//   }, []);

//   useEffect(() => {
//     if (preselected) setForm((f) => ({ ...f, service_type: preselected }));
//   }, [preselected]);

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setSubmitting(true);
//     const { error } = await supabase.from("bookings").insert({
//       name: form.name,
//       phone: form.phone,
//       address: form.address,
//       service_type: form.service_type,
//       preferred_date: form.preferred_date,
//       preferred_time: form.preferred_time,
//       description: form.description || null,
//     });
//     if (error) {
//       toast.error("Failed to submit booking. Please try again.");
//     } else {
//       toast.success("Booking submitted successfully! We'll confirm your appointment shortly.");
//       setForm({ name: "", phone: "", address: "", service_type: "", preferred_date: "", preferred_time: "", description: "" });
//     }
//     setSubmitting(false);
//   };

//   const phoneFromSettings = "+911234567890"; // fallback

//   return (
//     <>
//       <section className="bg-hero-premium py-28 relative overflow-hidden">
//         {/* Enhanced background */}
//         <div className="absolute inset-0">
//           <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full bg-primary/10 blur-3xl float-animation" />
//           <div className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full bg-secondary/10 blur-3xl float-animation" style={{ animationDelay: '2s' }} />
//           <div className="absolute inset-0 bg-circuit-pattern opacity-20" />
//         </div>
        
//         <div className="container mx-auto px-4 text-center relative z-10">
//           <motion.div 
//             initial={{ opacity: 0, y: 30 }} 
//             animate={{ opacity: 1, y: 0 }} 
//             transition={{ duration: 0.7 }}
//           >
//             {/* Trust badge */}
//             <motion.div
//               initial={{ opacity: 0, scale: 0.9 }}
//               animate={{ opacity: 1, scale: 1 }}
//               transition={{ delay: 0.2, duration: 0.4 }}
//               className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full bg-primary/15 backdrop-blur-sm border border-primary/30 text-primary-foreground/90 text-sm font-semibold mb-6 shadow-lg shadow-primary/10"
//             >
//               <CheckCircle className="w-4 h-4 text-secondary" />
//               Quick & Easy Booking
//             </motion.div>
            
//             <motion.h1 
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ delay: 0.3, duration: 0.6 }}
//               className="text-4xl md:text-5xl lg:text-6xl font-heading font-extrabold text-primary-foreground mb-6 tracking-tight"
//             >
//               Book a <span className="gradient-text">Service</span>
//             </motion.h1>
            
//             <motion.p 
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ delay: 0.4, duration: 0.6 }}
//               className="text-primary-foreground/70 mt-5 max-w-2xl mx-auto text-lg leading-relaxed"
//             >
//               Fill in the details below and our expert electricians will contact you shortly
//             </motion.p>
//           </motion.div>
//         </div>
//       </section>

//       <Section>
//         <div className="max-w-3xl mx-auto">
//           <form onSubmit={handleSubmit} className="space-y-6 bg-card border-2 border-border/50 rounded-3xl p-8 md:p-10 shadow-2xl shadow-primary/5">
//             {/* Section title */}
//             <div className="mb-8 pb-6 border-b border-border/50">
//               <h3 className="text-2xl font-heading font-bold text-foreground">Your Information</h3>
//               <p className="text-sm text-muted-foreground mt-1">Please provide your contact details</p>
//             </div>
            
//             {/* Personal info fields */}
//             <div className="grid md:grid-cols-2 gap-6">
//               {[
//                 { name: "name", label: "Full Name", type: "text", placeholder: "John Doe" },
//                 { name: "phone", label: "Phone Number", type: "tel", placeholder: "+91 1234567890" },
//               ].map((f) => (
//                 <div key={f.name}>
//                   <label className="block text-sm font-semibold text-foreground mb-2">{f.label}</label>
//                   <input
//                     type={f.type}
//                     required
//                     placeholder={f.placeholder}
//                     value={(form as any)[f.name]}
//                     onChange={(e) => setForm({ ...form, [f.name]: e.target.value })}
//                     className="w-full px-4 py-3 rounded-xl border-2 border-input bg-background text-foreground text-base focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-300"
//                   />
//                 </div>
//               ))}
//             </div>
            
//             <div>
//               <label className="block text-sm font-semibold text-foreground mb-2">Service Address</label>
//               <input
//                 type="text"
//                 required
//                 placeholder="Enter your complete address"
//                 value={form.address}
//                 onChange={(e) => setForm({ ...form, address: e.target.value })}
//                 className="w-full px-4 py-3 rounded-xl border-2 border-input bg-background text-foreground text-base focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-300"
//               />
//             </div>

//             {/* Service selection */}
//             <div>
//               <label className="block text-sm font-semibold text-foreground mb-2">Select Service</label>
//               <select
//                 required
//                 value={form.service_type}
//                 onChange={(e) => setForm({ ...form, service_type: e.target.value })}
//                 className="w-full px-4 py-3 rounded-xl border-2 border-input bg-background text-foreground text-base focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-300"
//               >
//                 <option value="">Choose a service...</option>
//                 {services.map((s) => (
//                   <option key={s.title} value={s.title}>{s.title}</option>
//                 ))}
//               </select>
//             </div>

//             {/* Date and time */}
//             <div className="grid md:grid-cols-2 gap-6">
//               <div>
//                 <label className="block text-sm font-semibold text-foreground mb-2">Preferred Date</label>
//                 <input
//                   type="date"
//                   required
//                   value={form.preferred_date}
//                   onChange={(e) => setForm({ ...form, preferred_date: e.target.value })}
//                   className="w-full px-4 py-3 rounded-xl border-2 border-input bg-background text-foreground text-base focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-300"
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-semibold text-foreground mb-2">Preferred Time</label>
//                 <input
//                   type="time"
//                   required
//                   value={form.preferred_time}
//                   onChange={(e) => setForm({ ...form, preferred_time: e.target.value })}
//                   className="w-full px-4 py-3 rounded-xl border-2 border-input bg-background text-foreground text-base focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-300"
//                 />
//               </div>
//             </div>

//             {/* Description */}
//             <div>
//               <label className="block text-sm font-semibold text-foreground mb-2">Problem Description</label>
//               <textarea
//                 rows={5}
//                 value={form.description}
//                 onChange={(e) => setForm({ ...form, description: e.target.value })}
//                 className="w-full px-4 py-3 rounded-xl border-2 border-input bg-background text-foreground text-base focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-300 resize-none"
//                 placeholder="Please describe your electrical issue in detail..."
//               />
//             </div>

//             {/* Submit button */}
//             <button
//               type="submit"
//               disabled={submitting}
//               className="w-full py-4 bg-gradient-to-r from-secondary to-electric-yellow-dark text-secondary-foreground font-bold rounded-xl hover:shadow-2xl hover:shadow-secondary/30 hover:-translate-y-1 transition-all duration-300 text-base disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none flex items-center justify-center gap-2 ripple"
//             >
//               {submitting && <Loader2 className="w-5 h-5 animate-spin" />}
//               {submitting ? "Submitting..." : "Submit Booking Request"}
//             </button>

//             {/* Alternative contact */}
//             <div className="relative my-8">
//               <div className="absolute inset-0 flex items-center">
//                 <div className="w-full border-t border-border/50"></div>
//               </div>
//               <div className="relative flex justify-center">
//                 <span className="bg-card px-4 text-sm text-muted-foreground">OR</span>
//               </div>
//             </div>

//             <p className="text-center text-base text-muted-foreground">
//               Need immediate assistance? Call us at{" "}
//               <a href={`tel:${phoneFromSettings}`} className="text-primary font-bold hover:underline inline-flex items-center gap-1">
//                 <Phone className="w-4 h-4" />
//                 {phoneFromSettings}
//               </a>
//             </p>
//           </form>
//         </div>
//       </Section>
//     </>
//   );
// };

// export default BookingForm;

import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Section from "@/components/Section";
import { CalendarDays, Loader2, Zap, Phone, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

const BookingForm = () => {
  const [params] = useSearchParams();
  const preselected = params.get("service") || "";
  const [services, setServices] = useState<any[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
    service_type: preselected,
    preferred_date: "",
    preferred_time: "",
    description: "",
  });

  useEffect(() => {
    supabase.from("services").select("title").order("sort_order").then(({ data }) => {
      setServices(data || []);
    });
  }, []);

  useEffect(() => {
    if (preselected) setForm((f) => ({ ...f, service_type: preselected }));
  }, [preselected]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const { error } = await supabase.from("bookings").insert({
      name: form.name,
      phone: form.phone,
      address: form.address,
      service_type: form.service_type,
      preferred_date: form.preferred_date,
      preferred_time: form.preferred_time,
      description: form.description || null,
    });
    if (error) {
      toast.error("Failed to submit booking. Please try again.");
    } else {
      setDone(true);
      toast.success("Booking submitted! We'll confirm your appointment shortly.");
      setForm({ name: "", phone: "", address: "", service_type: "", preferred_date: "", preferred_time: "", description: "" });
    }
    setSubmitting(false);
  };

  const phoneFromSettings = "+911234567890";

  const fields = [
    { name: "name", label: "Full Name", type: "text", placeholder: "John Doe" },
    { name: "phone", label: "Phone Number", type: "tel", placeholder: "+91 98765 43210" },
    { name: "address", label: "Service Address", type: "text", placeholder: "123 Main St, City" },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700;800;900&family=DM+Sans:wght@400;500&display=swap');

        /* ─── HERO ─── */
        .booking-hero {
          position: relative;
          padding: 96px 0 80px;
          overflow: hidden;
          background: #050b18;
          text-align: center;
          font-family: 'DM Sans', sans-serif;
        }

        .bh-grid {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(255,200,0,0.035) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,200,0,0.035) 1px, transparent 1px);
          background-size: 60px 60px;
          mask-image: radial-gradient(ellipse 80% 80% at 50% 50%, black 20%, transparent 100%);
        }

        .bh-glow {
          position: absolute;
          top: -80px; left: 50%;
          transform: translateX(-50%);
          width: 500px; height: 350px;
          background: radial-gradient(ellipse, rgba(255,200,0,0.09) 0%, transparent 70%);
          pointer-events: none;
        }

        .bh-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 7px 18px;
          border: 1px solid rgba(255,200,0,0.3);
          border-radius: 100px;
          background: rgba(255,200,0,0.06);
          margin-bottom: 20px;
          font-size: 12px;
          font-weight: 600;
          color: #ffc800;
          letter-spacing: 1px;
          text-transform: uppercase;
        }

        .bh-title {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: clamp(48px, 7vw, 84px);
          font-weight: 900;
          line-height: 0.92;
          color: #f0f4ff;
          text-transform: uppercase;
          letter-spacing: -1px;
        }

        .bh-title span {
          background: linear-gradient(135deg, #ffc800, #ffec6e 50%, #ffa000);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .bh-sub {
          color: rgba(180,200,240,0.45);
          font-size: 15px;
          margin-top: 14px;
          max-width: 380px;
          margin-left: auto;
          margin-right: auto;
        }

        /* ─── FORM CARD ─── */
        .booking-card {
          position: relative;
          background: #0a0f1e;
          border: 1px solid rgba(255,200,0,0.15);
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
          border-top: 2px solid rgba(255,200,0,0.35);
          border-left: 2px solid rgba(255,200,0,0.35);
          border-radius: 24px 0 0 0;
          pointer-events: none;
        }

        .card-br-corner {
          position: absolute;
          bottom: 0; right: 0;
          width: 80px; height: 80px;
          border-bottom: 2px solid rgba(255,200,0,0.15);
          border-right: 2px solid rgba(255,200,0,0.15);
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
          color: rgba(180,200,240,0.6);
          margin-bottom: 8px;
          font-family: 'Barlow Condensed', sans-serif;
        }

        .field-input,
        .field-select,
        .field-textarea {
          width: 100%;
          padding: 13px 16px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,200,0,0.12);
          border-radius: 12px;
          color: #f0f4ff;
          font-size: 14px;
          font-family: 'DM Sans', sans-serif;
          outline: none;
          transition: all 0.25s ease;
          appearance: none;
          -webkit-appearance: none;
        }

        .field-input::placeholder,
        .field-textarea::placeholder {
          color: rgba(180,200,240,0.25);
        }

        .field-input:focus,
        .field-select:focus,
        .field-textarea:focus {
          border-color: rgba(255,200,0,0.5);
          background: rgba(255,200,0,0.03);
          box-shadow: 0 0 0 3px rgba(255,200,0,0.08), inset 0 0 0 1px rgba(255,200,0,0.1);
        }

        .field-select option {
          background: #0d1428;
          color: #f0f4ff;
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
          background: linear-gradient(135deg, #ffc800, #ffaa00);
          color: #0a0f1e;
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
          background: rgba(255,255,255,0);
          transition: background 0.3s;
        }

        .submit-btn:hover:not(:disabled) {
          box-shadow: 0 0 32px rgba(255,200,0,0.4), 0 8px 24px rgba(255,160,0,0.3);
          transform: translateY(-2px);
        }

        .submit-btn:hover::before { background: rgba(255,255,255,0.08); }

        .submit-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .form-divider {
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(255,200,0,0.2), transparent);
          margin: 24px 0;
        }

        .call-link-row {
          text-align: center;
          font-size: 13px;
          color: rgba(180,200,240,0.45);
          font-family: 'DM Sans', sans-serif;
        }

        .call-link {
          color: #ffc800;
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
          background: rgba(255,200,0,0.1);
          border: 2px solid rgba(255,200,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #ffc800;
          box-shadow: 0 0 32px rgba(255,200,0,0.2);
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
          color: #f0f4ff;
          letter-spacing: 0.5px;
        }

        .success-sub {
          font-size: 14px;
          color: rgba(180,200,240,0.55);
          max-width: 320px;
          line-height: 1.6;
        }

        .success-reset {
          margin-top: 8px;
          padding: 10px 28px;
          border: 1px solid rgba(255,200,0,0.3);
          border-radius: 100px;
          background: rgba(255,200,0,0.06);
          color: #ffc800;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.25s;
          font-family: 'DM Sans', sans-serif;
        }

        .success-reset:hover {
          background: rgba(255,200,0,0.12);
          border-color: rgba(255,200,0,0.55);
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
              <path d="M60 5L20 55h30L35 95l45-55H50L60 5z" fill="#ffc800" />
            </svg>

            {done ? (
              <div className="success-box">
                <div className="success-icon"><CheckCircle size={32} /></div>
                <div className="success-title">Booking Received!</div>
                <p className="success-sub">We'll reach out to confirm your appointment. Expect a call or message soon.</p>
                <button className="success-reset" onClick={() => setDone(false)}>Book Another</button>
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
                    {services.map((s) => (
                      <option key={s.title} value={s.title}>{s.title}</option>
                    ))}
                  </select>
                </div>

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
                  <label className="field-label">Description <span style={{ color: "rgba(180,200,240,0.3)", textTransform: "lowercase", letterSpacing: 0 }}>(optional)</span></label>
                  <textarea
                    className="field-textarea"
                    placeholder="Describe your electrical issue or requirement..."
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                  />
                </div>

                <button type="submit" className="submit-btn" disabled={submitting}>
                  {submitting ? (
                    <><Loader2 size={18} className="animate-spin" /> Processing...</>
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