import { useState } from "react";
import { motion } from "framer-motion";
import Section from "@/components/Section";
import { supabase } from "@/integrations/supabase/client";
import { Zap, Phone, Mail, MapPin, Send, Loader2, CheckCircle } from "lucide-react";
import { PHONE_NUMBER } from "@/data/services";
import { toast } from "sonner";

const Contact = () => {
  const [form, setForm] = useState({ name: "", phone: "", email: "", service: "", message: "" });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const { error } = await supabase.from("contact_messages").insert({
      name: form.name,
      phone: form.phone,
      email: form.email,
      service: form.service || null,
      message: form.message,
    });
    if (error) {
      toast.error("Failed to send message. Please try again.");
    } else {
      setDone(true);
      toast.success("Message sent! We'll get back to you shortly.");
      setForm({ name: "", phone: "", email: "", service: "", message: "" });
    }
    setSubmitting(false);
  };

  const contactItems = [
    { icon: MapPin, label: "Address", value: "05, Nagziri Dewas Road, Ujjain(456010)", href: undefined },
    { icon: Phone, label: "Phone", value: PHONE_NUMBER, href: `tel:${PHONE_NUMBER}` },
    { icon: Mail, label: "Email", value: "electroobuddy@gmail.com", href: "mailto:electroobuddy@gmail.com" },
  ];

  const inputFields = [
    { name: "name", label: "Full Name", type: "text", placeholder: "John Doe" },
    { name: "phone", label: "Phone Number", type: "tel", placeholder: "+91 98765 43210" },
    { name: "email", label: "Email Address", type: "email", placeholder: "you@email.com" },
    { name: "service", label: "Service Required", type: "text", placeholder: "e.g. Wiring, Panel Install..." },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700;800;900&family=DM+Sans:wght@400;500&display=swap');

        /* ─── HERO ─── */
        .contact-hero {
          position: relative;
          padding: 96px 0 80px;
          overflow: hidden;
          background: hsl(var(--background));
          text-align: center;
          font-family: 'DM Sans', sans-serif;
        }

        .ch-grid {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(hsl(var(--primary) / 0.035) 1px, transparent 1px),
            linear-gradient(90deg, hsl(var(--primary) / 0.035) 1px, transparent 1px);
          background-size: 60px 60px;
          mask-image: radial-gradient(ellipse 80% 80% at 50% 50%, black 20%, transparent 100%);
        }

        .ch-glow {
          position: absolute;
          top: -80px; left: 50%;
          transform: translateX(-50%);
          width: 500px; height: 350px;
          background: radial-gradient(ellipse, hsl(var(--primary) / 0.09) 0%, transparent 70%);
          pointer-events: none;
        }

        .ch-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 7px 18px;
          border: 1px solid hsl(var(--primary) / 0.3);
          border-radius: 100px;
          background: hsl(var(--primary) / 0.06);
          margin-bottom: 20px;
          font-size: 12px;
          font-weight: 600;
          color: hsl(var(--secondary));
          letter-spacing: 1px;
          text-transform: uppercase;
          font-family: 'Barlow Condensed', sans-serif;
        }

        .ch-title {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: clamp(48px, 7vw, 84px);
          font-weight: 900;
          line-height: 0.92;
          color: hsl(var(--foreground));
          text-transform: uppercase;
          letter-spacing: -1px;
        }

        .ch-title span {
          background: linear-gradient(135deg, hsl(var(--secondary)), hsl(var(--electric-yellow-light)) 50%, hsl(var(--electric-blue-dark)));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .ch-sub {
          color: hsl(var(--muted-foreground) / 0.45);
          font-size: 15px;
          margin-top: 14px;
          max-width: 380px;
          margin-left: auto;
          margin-right: auto;
        }

        /* ─── LAYOUT ─── */
        .contact-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 40px;
        }

        @media (min-width: 1024px) {
          .contact-grid { grid-template-columns: 1fr 1fr; gap: 56px; }
        }

        /* ─── FORM PANEL ─── */
        .form-panel {
          position: relative;
          background: hsl(var(--card));
          border: 1px solid hsl(var(--border) / 0.3);
          border-radius: 24px;
          padding: 44px 40px;
          overflow: hidden;
          font-family: 'DM Sans', sans-serif;
        }

        @media (max-width: 640px) {
          .form-panel { padding: 28px 20px; }
        }

        .fp-corner-tl {
          position: absolute;
          top: 0; left: 0;
          width: 72px; height: 72px;
          border-top: 2px solid hsl(var(--primary) / 0.35);
          border-left: 2px solid hsl(var(--primary) / 0.35);
          border-radius: 24px 0 0 0;
          pointer-events: none;
        }

        .fp-corner-br {
          position: absolute;
          bottom: 0; right: 0;
          width: 72px; height: 72px;
          border-bottom: 2px solid hsl(var(--primary) / 0.12);
          border-right: 2px solid hsl(var(--primary) / 0.12);
          border-radius: 0 0 24px 0;
          pointer-events: none;
        }

        .fp-bolt {
          position: absolute;
          top: -16px; right: -8px;
          width: 120px; height: 120px;
          opacity: 0.03;
          pointer-events: none;
        }

        .panel-heading {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 28px;
          font-weight: 800;
          text-transform: uppercase;
          color: hsl(var(--foreground));
          letter-spacing: 0.5px;
          margin-bottom: 28px;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .panel-heading::after {
          content: '';
          flex: 1;
          height: 1px;
          background: linear-gradient(90deg, hsl(var(--primary) / 0.3), transparent);
        }

        /* ─── FIELD ─── */
        .field-group { margin-bottom: 18px; }

        .field-label {
          display: block;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.9px;
          text-transform: uppercase;
          color: hsl(var(--muted-foreground) / 0.55);
          margin-bottom: 8px;
          font-family: 'Barlow Condensed', sans-serif;
        }

        .field-opt {
          color: hsl(var(--muted-foreground) / 0.3);
          font-weight: 400;
          text-transform: lowercase;
          letter-spacing: 0;
        }

        .field-input,
        .field-textarea {
          width: 100%;
          padding: 13px 16px;
          background: hsl(var(--primary) / 0.025);
          border: 1px solid hsl(var(--border) / 0.3);
          border-radius: 12px;
          color: hsl(var(--foreground));
          font-size: 14px;
          font-family: 'DM Sans', sans-serif;
          outline: none;
          transition: all 0.25s ease;
          box-sizing: border-box;
        }

        .field-input::placeholder,
        .field-textarea::placeholder { color: hsl(var(--muted-foreground) / 0.2); }

        .field-input:focus,
        .field-textarea:focus {
          border-color: hsl(var(--primary) / 0.5);
          background: hsl(var(--primary) / 0.025);
          box-shadow: 0 0 0 3px hsl(var(--primary) / 0.07), inset 0 0 0 1px hsl(var(--primary) / 0.08);
        }

        .field-textarea { resize: none; min-height: 110px; }

        /* ─── SUBMIT ─── */
        .submit-btn {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 14px 36px;
          background: linear-gradient(135deg, hsl(var(--secondary)), hsl(var(--electric-blue-dark)));
          color: hsl(var(--primary-foreground));
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 17px;
          font-weight: 800;
          letter-spacing: 0.8px;
          text-transform: uppercase;
          border: none;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.3s ease;
          margin-top: 8px;
        }

        .submit-btn:hover:not(:disabled) {
          box-shadow: 0 0 28px hsl(var(--primary) / 0.4), 0 6px 20px hsl(var(--secondary) / 0.3);
          transform: translateY(-2px);
        }

        .submit-btn:disabled { opacity: 0.6; cursor: not-allowed; }

        /* ─── SUCCESS ─── */
        .success-box {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          padding: 32px 0;
          gap: 14px;
        }

        .success-icon-ring {
          width: 68px;
          height: 68px;
          border-radius: 50%;
          border: 2px solid hsl(var(--primary) / 0.3);
          background: hsl(var(--primary) / 0.08);
          display: flex;
          align-items: center;
          justify-content: center;
          color: hsl(var(--secondary));
          box-shadow: 0 0 28px hsl(var(--primary) / 0.18);
          animation: popIn 0.45s cubic-bezier(0.23, 1, 0.32, 1);
        }

        @keyframes popIn {
          0% { transform: scale(0.5); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }

        .success-title {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 28px;
          font-weight: 800;
          text-transform: uppercase;
          color: hsl(var(--foreground));
        }

        .success-sub {
          font-size: 13.5px;
          color: hsl(var(--muted-foreground) / 0.5);
          max-width: 280px;
          line-height: 1.6;
          font-family: 'DM Sans', sans-serif;
        }

        .success-reset {
          padding: 9px 24px;
          border: 1px solid hsl(var(--primary) / 0.3);
          border-radius: 100px;
          background: hsl(var(--primary) / 0.05);
          color: hsl(var(--secondary));
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.25s;
          font-family: 'DM Sans', sans-serif;
          margin-top: 6px;
        }

        .success-reset:hover {
          background: hsl(var(--primary) / 0.12);
          border-color: hsl(var(--primary) / 0.55);
        }

        /* ─── INFO PANEL ─── */
        .info-panel { display: flex; flex-direction: column; gap: 16px; }

        .info-card {
          display: flex;
          align-items: flex-start;
          gap: 16px;
          padding: 20px 22px;
          background: hsl(var(--card));
          border: 1px solid hsl(var(--border) / 0.3);
          border-radius: 16px;
          transition: all 0.3s ease;
          font-family: 'DM Sans', sans-serif;
          text-decoration: none;
        }

        .info-card:hover {
          border-color: hsl(var(--primary) / 0.5);
          background: hsl(var(--primary) / 0.03);
          transform: translateX(4px);
          box-shadow: -3px 0 0 hsl(var(--secondary)), 0 8px 28px hsl(var(--foreground) / 0.1);
        }

        .info-icon-box {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          background: hsl(var(--primary) / 0.08);
          border: 1px solid hsl(var(--border) / 0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          color: hsl(var(--secondary));
          flex-shrink: 0;
          transition: all 0.3s;
        }

        .info-card:hover .info-icon-box {
          background: hsl(var(--primary) / 0.15);
          box-shadow: 0 0 14px hsl(var(--primary) / 0.2);
        }

        .info-label {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 12px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.8px;
          color: hsl(var(--primary) / 0.6);
          margin-bottom: 4px;
        }

        .info-value {
          font-size: 14px;
          font-weight: 500;
          color: hsl(var(--muted-foreground));
          line-height: 1.4;
        }

        /* ─── MAP ─── */
        .map-wrap {
          position: relative;
          border-radius: 18px;
          overflow: hidden;
          border: 1px solid hsl(var(--border) / 0.3);
          height: 240px;
          margin-top: 8px;
        }

        .map-wrap::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 18px;
          box-shadow: inset 0 0 0 2px hsl(var(--primary) / 0.08);
          z-index: 2;
          pointer-events: none;
        }
      `}</style>

      {/* Hero */}
      <section className="contact-hero">
        <div className="ch-grid" />
        <div className="ch-glow" />
        <div className="container mx-auto px-4 relative z-10">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="ch-badge"><Zap size={12} /> Get In Touch</div>
            <h1 className="ch-title">Contact <span>Us</span></h1>
            <p className="ch-sub">We'd love to hear from you — reach out any time</p>
          </motion.div>
        </div>
      </section>

      <Section>
        <div className="contact-grid">
          {/* Form */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="form-panel">
              <div className="fp-corner-tl" />
              <div className="fp-corner-br" />
              <svg className="fp-bolt" viewBox="0 0 100 100" fill="none">
                <path d="M60 5L20 55h30L35 95l45-55H50L60 5z" fill="#ffc800" />
              </svg>

              <div className="panel-heading">Send a Message</div>

              {done ? (
                <div className="success-box">
                  <div className="success-icon-ring"><CheckCircle size={30} /></div>
                  <div className="success-title">Message Sent!</div>
                  <p className="success-sub">Thanks for reaching out. We'll get back to you very shortly.</p>
                  <button className="success-reset" onClick={() => setDone(false)}>Send Another</button>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  {inputFields.map((f) => (
                    <div className="field-group" key={f.name}>
                      <label className="field-label">
                        {f.label}
                        {f.name === "service" && <span className="field-opt"> (optional)</span>}
                      </label>
                      <input
                        type={f.type}
                        required={f.name !== "service"}
                        placeholder={f.placeholder}
                        className="field-input"
                        value={(form as any)[f.name]}
                        onChange={(e) => setForm({ ...form, [f.name]: e.target.value })}
                      />
                    </div>
                  ))}

                  <div className="field-group">
                    <label className="field-label">Message</label>
                    <textarea
                      required
                      placeholder="Tell us how we can help..."
                      className="field-textarea"
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                    />
                  </div>

                  <button type="submit" className="submit-btn" disabled={submitting}>
                    {submitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={15} />}
                    {submitting ? "Sending..." : "Send Message"}
                  </button>
                </form>
              )}
            </div>
          </motion.div>

          {/* Info */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="panel-heading" style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 28, fontWeight: 800, textTransform: "uppercase", color: "hsl(var(--foreground))", letterSpacing: 0.5, marginBottom: 24, display: "flex", alignItems: "center", gap: 10 }}>
              Contact Details
              <span style={{ flex: 1, height: 1, background: "linear-gradient(90deg, hsl(var(--primary) / 0.3), transparent)", display: "block" }} />
            </div>

            <div className="info-panel">
              {contactItems.map((c) => {
                const Wrapper = c.href ? "a" : "div";
                return (
                  <Wrapper
                    key={c.label}
                    className="info-card"
                    {...(c.href ? { href: c.href } : {})}
                  >
                    <div className="info-icon-box">
                      <c.icon size={18} />
                    </div>
                    <div>
                      <div className="info-label">{c.label}</div>
                      <div className="info-value">{c.value}</div>
                    </div>
                  </Wrapper>
                );
              })}
            </div>

            <div className="map-wrap" style={{ marginTop: 28 }}>
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d241317.11609823277!2d72.74109995709657!3d19.08219783958221!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be7c6306644edc1%3A0x5da4ed8f8d648c69!2sMumbai%2C%20Maharashtra!5e0!3m2!1sen!2sin!4v1600000000000!5m2!1sen!2sin"
                width="100%"
                height="100%"
                style={{ border: 0, filter: "invert(90%) hue-rotate(180deg) brightness(0.85) contrast(0.9)" }}
                allowFullScreen
                loading="lazy"
                title="Office Location"
              />
            </div>
          </motion.div>
        </div>
      </Section>
    </>
  );
};

export default Contact;