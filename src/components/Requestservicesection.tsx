import { useState } from "react";
import { Check, Phone, CheckCircle, Loader2, CalendarDays } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

const PHONE_NUMBER = "+91 98765 43210";

export default function RequestServiceSection() {
  const [serviceFormDone, setServiceFormDone] = useState(false);
  const [serviceFormSubmitting, setServiceFormSubmitting] = useState(false);
  const { user } = useAuth();
  const [serviceForm, setServiceForm] = useState({
    name: "", phone: "", email: "", address: "",
    exact_location: "", service_type: "", preferred_date: "",
    preferred_time: "", description: "",
  });

  const handleServiceFormSubmit = async (e) => {
    e.preventDefault();
    setServiceFormSubmitting(true);
    
    try {
      const insertData: any = {
        name: serviceForm.name,
        phone: serviceForm.phone,
        email: serviceForm.email,
        address: serviceForm.address,
        service_type: serviceForm.service_type,
        preferred_date: serviceForm.preferred_date || null,
        preferred_time: serviceForm.preferred_time || null,
        description: serviceForm.description || null,
        exact_location: serviceForm.exact_location || null,
      };
      
      if (user) {
        insertData.user_id = user.id;
      }
      
      const { data: bookingData, error } = await supabase.from('bookings').insert(insertData).select().single();
      
      if (error) throw error;
      
      const bookingId = bookingData.id;
      
      // Try to auto-assign technician
      try {
        const response = await supabase.functions.invoke('auto-assign-technician', {
          body: { bookingId },
        });
        
        if (response.error) {
          console.error('Auto-assign error:', response.error);
          toast.info('Service request submitted! We\'ll contact you soon.');
        } else if (response.data?.success) {
          toast.success(`Service request submitted! Technician ${response.data.technician.name} will contact you.`);
        } else {
          toast.success('Service request submitted! We\'ll contact you soon.');
        }
      } catch (funcError) {
        console.error('Failed to call auto-assign function:', funcError);
        toast.success('Service request submitted! We\'ll contact you soon.');
      }
      
      setServiceFormDone(true);
      setServiceForm({ 
        name: '', 
        phone: '', 
        email: '', 
        address: '', 
        service_type: '', 
        preferred_date: '', 
        preferred_time: '', 
        description: '', 
        exact_location: '' 
      });
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || 'Failed to submit service request. Please try again.');
    } finally {
      setServiceFormSubmitting(false);
    }
  };

  return (
    <section
      id="request-service"
      style={{
        fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
        background: "linear-gradient(135deg, #1a56db 0%, #1e40af 60%, #1e3a8a 100%)",
        padding: "80px 0",
        width: "100%",
        boxSizing: "border-box",
      }}
      className="dark:bg-gradient-to-br dark:from-blue-900 dark:via-blue-800 dark:to-gray-900"
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=Syne:wght@600;700;800&display=swap');

        .rs-container {
          max-width: 1400px;
          width: 100%;
          margin: 0 auto;
          padding: 0 24px;
          box-sizing: border-box;
        }

        .rs-header {
          text-align: center;
          margin-bottom: 56px;
        }

        .rs-header h2 {
          font-family: 'Syne', sans-serif;
          font-size: clamp(2rem, 4vw, 3.25rem);
          font-weight: 800;
          color: #fff;
          margin: 0 0 16px;
          letter-spacing: -0.02em;
        }

        .rs-header .divider {
          width: 64px;
          height: 4px;
          background: rgba(255,255,255,0.6);
          border-radius: 2px;
          margin: 0 auto 20px;
        }

        .rs-header p {
          font-size: clamp(1rem, 1.5vw, 1.125rem);
          color: rgba(255,255,255,0.82);
          max-width: 560px;
          margin: 0 auto;
          line-height: 1.7;
        }

        .rs-card {
          background: #fff;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 32px 80px rgba(0,0,0,0.28), 0 8px 24px rgba(0,0,0,0.12);
          display: grid;
          grid-template-columns: 1fr 2fr;
          width: 100%;
          max-width: 1200px;
          margin: 0 auto;
          transition: background-color 0.3s ease, box-shadow 0.3s ease;
        }

        .dark .rs-card {
          background: #1f2937;
          box-shadow: 0 32px 80px rgba(0,0,0,0.5), 0 8px 24px rgba(0,0,0,0.3);
        }

        .rs-sidebar {
          background: linear-gradient(160deg, #1e3a8a 0%, #1d4ed8 100%);
          padding: clamp(32px, 4vw, 56px) clamp(28px, 3.5vw, 48px);
          display: flex;
          flex-direction: column;
          justify-content: center;
          position: relative;
          overflow: hidden;
          transition: background 0.3s ease;
        }

        .dark .rs-sidebar {
          background: linear-gradient(160deg, #1e3a8a 0%, #1e40af 100%);
        }

        .rs-sidebar::before {
          content: '';
          position: absolute;
          top: -60px;
          right: -60px;
          width: 200px;
          height: 200px;
          border-radius: 50%;
          background: rgba(255,255,255,0.05);
        }

        .rs-sidebar::after {
          content: '';
          position: absolute;
          bottom: -40px;
          left: -40px;
          width: 160px;
          height: 160px;
          border-radius: 50%;
          background: rgba(255,255,255,0.04);
        }

        .rs-sidebar h3 {
          font-family: 'Syne', sans-serif;
          font-size: clamp(1.25rem, 2.2vw, 1.75rem);
          font-weight: 700;
          color: #fff;
          margin: 0 0 28px;
          line-height: 1.3;
          position: relative;
          z-index: 1;
        }

        .rs-features {
          list-style: none;
          padding: 0;
          margin: 0 0 36px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          position: relative;
          z-index: 1;
        }

        .rs-feature-item {
          display: flex;
          align-items: flex-start;
          gap: 12px;
        }

        .rs-check-icon {
          flex-shrink: 0;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: rgba(255,255,255,0.15);
          border: 1.5px solid rgba(255,255,255,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-top: 1px;
        }

        .rs-feature-item p {
          color: rgba(255,255,255,0.88);
          font-size: clamp(0.875rem, 1.2vw, 1rem);
          line-height: 1.5;
          margin: 0;
        }

        .rs-phone-link {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          background: rgba(255,255,255,0.12);
          border: 1.5px solid rgba(255,255,255,0.25);
          border-radius: 12px;
          padding: 14px 20px;
          color: #fff;
          text-decoration: none;
          transition: background 0.2s;
          position: relative;
          z-index: 1;
        }

        .rs-phone-link:hover {
          background: rgba(255,255,255,0.2);
        }

        .rs-phone-link span {
          font-weight: 600;
          font-size: clamp(0.875rem, 1.1vw, 1rem);
          letter-spacing: 0.01em;
        }

        .rs-form-panel {
          padding: clamp(28px, 4vw, 52px) clamp(24px, 4vw, 52px);
          background: #fff;
          overflow-y: auto;
          transition: background-color 0.3s ease;
        }

        .dark .rs-form-panel {
          background: #1f2937;
        }

        .rs-success {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 40px 20px;
          min-height: 400px;
        }

        .rs-success-icon {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: #dcfce7;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 24px;
        }

        .rs-success h3 {
          font-family: 'Syne', sans-serif;
          font-size: 1.75rem;
          font-weight: 700;
          color: #111827;
          margin: 0 0 12px;
        }

        .dark .rs-success h3 {
          color: #f9fafb;
        }

        .rs-success p {
          color: #6b7280;
          font-size: 1rem;
          margin: 0 0 28px;
          line-height: 1.6;
        }

        .dark .rs-success p {
          color: #9ca3af;
        }

        .rs-success button {
          padding: 12px 28px;
          background: #1d4ed8;
          color: #fff;
          border: none;
          border-radius: 10px;
          font-size: 0.95rem;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s, transform 0.15s;
          font-family: 'DM Sans', sans-serif;
        }

        .rs-success button:hover {
          background: #1e40af;
          transform: translateY(-1px);
        }

        .rs-form {
          display: flex;
          flex-direction: column;
          gap: 0;
        }

        .rs-form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-bottom: 20px;
        }

        .rs-field {
          display: flex;
          flex-direction: column;
          gap: 6px;
          margin-bottom: 20px;
        }

        .rs-field:last-of-type { margin-bottom: 0; }

        .rs-label {
          font-size: 0.8125rem;
          font-weight: 600;
          color: #374151;
          letter-spacing: 0.03em;
          text-transform: uppercase;
        }

        .dark .rs-label {
          color: #d1d5db;
        }

        .rs-required { color: #ef4444; margin-left: 2px; }

        .rs-input, .rs-select, .rs-textarea {
          width: 100%;
          border: 1.5px solid #e5e7eb;
          border-radius: 10px;
          padding: 11px 14px;
          font-size: 0.9375rem;
          color: #111827;
          background: #f9fafb;
          transition: border-color 0.18s, background 0.18s, box-shadow 0.18s;
          outline: none;
          font-family: 'DM Sans', sans-serif;
          box-sizing: border-box;
        }

        .dark .rs-input, .dark .rs-select, .dark .rs-textarea {
          background: #374151;
          border-color: #4b5563;
          color: #f9fafb;
        }

        .dark .rs-input::placeholder, .dark .rs-textarea::placeholder {
          color: #9ca3af;
        }

        .rs-input:focus, .rs-select:focus, .rs-textarea:focus {
          border-color: #1d4ed8;
          background: #fff;
          box-shadow: 0 0 0 3px rgba(29,78,216,0.1);
        }

        .dark .rs-input:focus, .dark .rs-select:focus, .dark .rs-textarea:focus {
          background: #4b5563;
          border-color: #60a5fa;
          box-shadow: 0 0 0 3px rgba(96,165,250,0.2);
        }

        .rs-textarea {
          resize: vertical;
          min-height: 88px;
        }

        .rs-submit-btn {
          margin-top: 24px;
          width: 100%;
          padding: 14px;
          background: linear-gradient(90deg, #1d4ed8, #2563eb);
          color: #fff;
          border: none;
          border-radius: 12px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: opacity 0.2s, transform 0.15s, box-shadow 0.2s;
          box-shadow: 0 4px 16px rgba(29,78,216,0.35);
          font-family: 'DM Sans', sans-serif;
          letter-spacing: 0.01em;
        }

        .rs-submit-btn:hover:not(:disabled) {
          opacity: 0.93;
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(29,78,216,0.45);
        }

        .rs-submit-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        @media (max-width: 1024px) {
          .rs-card {
            grid-template-columns: 5fr 7fr;
          }
        }

        @media (max-width: 768px) {
          .rs-card {
            grid-template-columns: 1fr;
          }

          .rs-form-grid {
            grid-template-columns: 1fr;
          }

          .rs-sidebar {
            padding: 36px 28px;
          }
        }

        @media (max-width: 480px) {
          .rs-container {
            padding: 0 16px;
          }

          .rs-form-panel {
            padding: 24px 20px;
          }
        }
      `}</style>

      <div className="rs-container">
        {/* Header */}
        <div className="rs-header">
          <h2>Request a Service</h2>
          <div className="divider" />
          <p>Fill out the form below and we'll contact you shortly to schedule your service.</p>
        </div>

        {/* Card */}
        <div className="rs-card">
          {/* Sidebar */}
          <div className="rs-sidebar">
            <h3>Why Choose ElectrooBuddy?</h3>
            <ul className="rs-features">
              {[
                "30+ years of trusted service",
                "Certified and experienced technicians",
                "Quick response (avg. 45 minutes)",
                "Affordable pricing, no hidden charges",
              ].map((text, i) => (
                <li key={i} className="rs-feature-item">
                  <div className="rs-check-icon">
                    <Check size={13} color="#fff" strokeWidth={3} />
                  </div>
                  <p>{text}</p>
                </li>
              ))}
            </ul>
            <a href={`tel:${PHONE_NUMBER}`} className="rs-phone-link">
              <Phone size={18} />
              <span>Emergency: {PHONE_NUMBER}</span>
            </a>
          </div>

          {/* Form Panel */}
          <div className="rs-form-panel">
            {serviceFormDone ? (
              <div className="rs-success">
                <div className="rs-success-icon">
                  <CheckCircle size={40} color="#16a34a" />
                </div>
                <h3>Request Submitted!</h3>
                <p>We'll contact you shortly to confirm your service appointment.</p>
                <button onClick={() => setServiceFormDone(false)}>Submit Another Request</button>
              </div>
            ) : (
              <form onSubmit={handleServiceFormSubmit} className="rs-form">
                {/* Row 1: Name + Phone */}
                <div className="rs-form-grid">
                  <div className="rs-field" style={{ marginBottom: 0 }}>
                    <label className="rs-label">Full Name<span className="rs-required">*</span></label>
                    <input className="rs-input" type="text" required placeholder="Rahul Sharma"
                      value={serviceForm.name}
                      onChange={(e) => setServiceForm({ ...serviceForm, name: e.target.value })} />
                  </div>
                  <div className="rs-field" style={{ marginBottom: 0 }}>
                    <label className="rs-label">Phone Number<span className="rs-required">*</span></label>
                    <input className="rs-input" type="tel" required placeholder="9876543210"
                      value={serviceForm.phone}
                      onChange={(e) => setServiceForm({ ...serviceForm, phone: e.target.value })} />
                  </div>
                </div>

                {/* Row 2: Email + Service Type */}
                <div className="rs-form-grid" style={{ marginTop: 20 }}>
                  <div className="rs-field" style={{ marginBottom: 0 }}>
                    <label className="rs-label">Email Address</label>
                    <input className="rs-input" type="email" placeholder="your@email.com"
                      value={serviceForm.email}
                      onChange={(e) => setServiceForm({ ...serviceForm, email: e.target.value })} />
                  </div>
                  <div className="rs-field" style={{ marginBottom: 0 }}>
                    <label className="rs-label">Service Needed<span className="rs-required">*</span></label>
                    <select className="rs-select" required
                      value={serviceForm.service_type}
                      onChange={(e) => setServiceForm({ ...serviceForm, service_type: e.target.value })}>
                      <option value="">Select a service</option>
                      <option>DTH Installation & Reset</option>
                      <option>LCD/LED TV Installation</option>
                      <option>Short Circuit Repairs</option>
                      <option>Fan Installation</option>
                      <option>AC Maintenance</option>
                      <option>Appliance Repairs</option>
                      <option>Other Service</option>
                    </select>
                  </div>
                </div>

                {/* Row 3: Address + Landmark */}
                <div className="rs-form-grid" style={{ marginTop: 20 }}>
                  <div className="rs-field" style={{ marginBottom: 0 }}>
                    <label className="rs-label">Service Address<span className="rs-required">*</span></label>
                    <input className="rs-input" type="text" required placeholder="123 Main St, City"
                      value={serviceForm.address}
                      onChange={(e) => setServiceForm({ ...serviceForm, address: e.target.value })} />
                  </div>
                  <div className="rs-field" style={{ marginBottom: 0 }}>
                    <label className="rs-label">Landmark / Location</label>
                    <input className="rs-input" type="text" placeholder="Near temple, Behind mall…"
                      value={serviceForm.exact_location}
                      onChange={(e) => setServiceForm({ ...serviceForm, exact_location: e.target.value })} />
                  </div>
                </div>

                {/* Row 4: Date + Time */}
                <div className="rs-form-grid" style={{ marginTop: 20 }}>
                  <div className="rs-field" style={{ marginBottom: 0 }}>
                    <label className="rs-label">Preferred Date</label>
                    <input className="rs-input" type="date"
                      value={serviceForm.preferred_date}
                      onChange={(e) => setServiceForm({ ...serviceForm, preferred_date: e.target.value })} />
                  </div>
                  <div className="rs-field" style={{ marginBottom: 0 }}>
                    <label className="rs-label">Preferred Time</label>
                    <input className="rs-input" type="time"
                      value={serviceForm.preferred_time}
                      onChange={(e) => setServiceForm({ ...serviceForm, preferred_time: e.target.value })} />
                  </div>
                </div>

                {/* Description */}
                <div className="rs-field" style={{ marginTop: 20 }}>
                  <label className="rs-label">Additional Details</label>
                  <textarea className="rs-textarea" rows={3} placeholder="Describe the issue briefly..."
                    value={serviceForm.description}
                    onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })} />
                </div>

                <button type="submit" className="rs-submit-btn" disabled={serviceFormSubmitting}>
                  {serviceFormSubmitting ? (
                    <><Loader2 size={17} className="animate-spin" style={{ animation: "spin 1s linear infinite" }} /> Submitting...</>
                  ) : (
                    <><CalendarDays size={17} /> Request Service</>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </section>
  );
}