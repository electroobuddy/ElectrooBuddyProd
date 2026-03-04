import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Section from "@/components/Section";
import { supabase } from "@/integrations/supabase/client";
import { CalendarDays, Loader2 } from "lucide-react";
import { toast } from "sonner";

const BookingForm = () => {
  const [params] = useSearchParams();
  const preselected = params.get("service") || "";
  const [services, setServices] = useState<any[]>([]);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
    service_type: preselected,
    preferred_date: "",
    preferred_time: "",
    description: "",
  });
  const [submitting, setSubmitting] = useState(false);

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
      toast.success("Booking submitted successfully! We'll confirm your appointment shortly.");
      setForm({ name: "", phone: "", address: "", service_type: "", preferred_date: "", preferred_time: "", description: "" });
    }
    setSubmitting(false);
  };

  const phoneFromSettings = "+911234567890"; // fallback

  return (
    <>
      <section className="bg-hero py-20">
        <div className="container mx-auto px-4 text-center">
          <CalendarDays className="w-10 h-10 text-secondary mx-auto mb-4" />
          <h1 className="text-3xl md:text-5xl font-heading font-extrabold text-primary-foreground">Book a Service</h1>
          <p className="text-primary-foreground/70 mt-3 max-w-lg mx-auto">Fill in the details below and we'll get back to you</p>
        </div>
      </section>

      <Section>
        <div className="max-w-2xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-5 bg-card border border-border rounded-2xl p-8">
            {[
              { name: "name", label: "Full Name", type: "text" },
              { name: "phone", label: "Phone Number", type: "tel" },
              { name: "address", label: "Address", type: "text" },
            ].map((f) => (
              <div key={f.name}>
                <label className="block text-sm font-medium text-foreground mb-1.5">{f.label}</label>
                <input
                  type={f.type}
                  required
                  value={(form as any)[f.name]}
                  onChange={(e) => setForm({ ...form, [f.name]: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            ))}

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Service Type</label>
              <select
                required
                value={form.service_type}
                onChange={(e) => setForm({ ...form, service_type: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">Select a service</option>
                {services.map((s) => (
                  <option key={s.title} value={s.title}>{s.title}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Preferred Date</label>
                <input
                  type="date"
                  required
                  value={form.preferred_date}
                  onChange={(e) => setForm({ ...form, preferred_date: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Preferred Time</label>
                <input
                  type="time"
                  required
                  value={form.preferred_time}
                  onChange={(e) => setForm({ ...form, preferred_time: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Description</label>
              <textarea
                rows={4}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                placeholder="Describe your electrical issue or requirement..."
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-secondary text-secondary-foreground font-bold rounded-lg hover:brightness-110 transition-all text-base disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              Submit Booking
            </button>

            <p className="text-center text-sm text-muted-foreground">
              Or call us directly at{" "}
              <a href={`tel:${phoneFromSettings}`} className="text-primary font-medium hover:underline">{phoneFromSettings}</a>
            </p>
          </form>
        </div>
      </Section>
    </>
  );
};

export default BookingForm;
