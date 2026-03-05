import { useState } from "react";
import { motion } from "framer-motion";
import Section from "@/components/Section";
import { supabase } from "@/integrations/supabase/client";
import { Zap, Phone, Mail, MapPin, Send, Loader2 } from "lucide-react";
import { PHONE_NUMBER } from "@/data/services";
import { toast } from "sonner";

const Contact = () => {
  const [form, setForm] = useState({ name: "", phone: "", email: "", service: "", message: "" });
  const [submitting, setSubmitting] = useState(false);

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
      toast.success("Message sent! We'll get back to you shortly.");
      setForm({ name: "", phone: "", email: "", service: "", message: "" });
    }
    setSubmitting(false);
  };

  return (
    <>
      <section className="bg-hero-premium py-24 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute bottom-0 right-1/4 w-64 h-64 rounded-full bg-primary/5 blur-3xl" />
        </div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <Zap className="w-10 h-10 text-secondary mx-auto mb-4 electric-pulse" />
            <h1 className="text-3xl md:text-5xl font-heading font-extrabold text-primary-foreground">
              Contact <span className="gradient-text">Us</span>
            </h1>
            <p className="text-primary-foreground/50 mt-4 max-w-lg mx-auto">Get in touch — we'd love to hear from you</p>
          </motion.div>
        </div>
      </section>

      <Section>
        <div className="grid lg:grid-cols-2 gap-12">
          <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <h2 className="text-2xl font-heading font-bold text-foreground mb-8">Send Us a Message</h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              {[
                { name: "name", label: "Full Name", type: "text" },
                { name: "phone", label: "Phone Number", type: "tel" },
                { name: "email", label: "Email Address", type: "email" },
                { name: "service", label: "Service Required", type: "text" },
              ].map((f) => (
                <div key={f.name}>
                  <label className="block text-sm font-medium text-foreground mb-2">{f.label}</label>
                  <input
                    type={f.type}
                    required={f.name !== "service"}
                    value={(form as any)[f.name]}
                    onChange={(e) => setForm({ ...form, [f.name]: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-input bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                  />
                </div>
              ))}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Message</label>
                <textarea
                  required
                  rows={4}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-input bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none transition-all"
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-2 px-8 py-3.5 bg-primary text-primary-foreground font-semibold rounded-xl hover:shadow-lg hover:shadow-primary/25 transition-all duration-300 disabled:opacity-50"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                Send Message
              </button>
            </form>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="space-y-6">
            <h2 className="text-2xl font-heading font-bold text-foreground mb-8">Contact Details</h2>
            <div className="space-y-4">
              {[
                { icon: MapPin, label: "Address", value: "123 Electrical Ave, Tech City, India 400001" },
                { icon: Phone, label: "Phone", value: PHONE_NUMBER, href: `tel:${PHONE_NUMBER}` },
                { icon: Mail, label: "Email", value: "hello@electroobuddy.com", href: "mailto:hello@electroobuddy.com" },
              ].map((c) => (
                <div key={c.label} className="flex items-start gap-4 p-5 bg-card border border-border rounded-2xl hover-glow transition-all">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <c.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{c.label}</p>
                    {c.href ? (
                      <a href={c.href} className="text-sm text-muted-foreground hover:text-primary transition-colors">{c.value}</a>
                    ) : (
                      <p className="text-sm text-muted-foreground">{c.value}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="rounded-2xl overflow-hidden border border-border h-64">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d241317.11609823277!2d72.74109995709657!3d19.08219783958221!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be7c6306644edc1%3A0x5da4ed8f8d648c69!2sMumbai%2C%20Maharashtra!5e0!3m2!1sen!2sin!4v1600000000000!5m2!1sen!2sin"
                width="100%"
                height="100%"
                style={{ border: 0 }}
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
