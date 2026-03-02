import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import Section from "@/components/Section";
import { services, PHONE_NUMBER } from "@/data/services";
import { Zap, CalendarDays } from "lucide-react";
import { toast } from "sonner";

const BookingForm = () => {
  const [params] = useSearchParams();
  const preselected = params.get("service") || "";

  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
    service: preselected,
    date: "",
    time: "",
    description: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Booking submitted successfully! We'll confirm your appointment shortly.");
    setForm({ name: "", phone: "", address: "", service: "", date: "", time: "", description: "" });
  };

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
                value={form.service}
                onChange={(e) => setForm({ ...form, service: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">Select a service</option>
                {services.map((s) => (
                  <option key={s.id} value={s.title}>{s.title}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Preferred Date</label>
                <input
                  type="date"
                  required
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Preferred Time</label>
                <input
                  type="time"
                  required
                  value={form.time}
                  onChange={(e) => setForm({ ...form, time: e.target.value })}
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
              className="w-full py-3 bg-secondary text-secondary-foreground font-bold rounded-lg hover:brightness-110 transition-all text-base"
            >
              Submit Booking
            </button>

            <p className="text-center text-sm text-muted-foreground">
              Or call us directly at{" "}
              <a href={`tel:${PHONE_NUMBER}`} className="text-primary font-medium hover:underline">{PHONE_NUMBER}</a>
            </p>
          </form>
        </div>
      </Section>
    </>
  );
};

export default BookingForm;
