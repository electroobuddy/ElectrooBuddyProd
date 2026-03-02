import Section from "@/components/Section";
import { Zap, ChevronDown } from "lucide-react";
import { useState } from "react";

const faqs = [
  { q: "What areas do you serve?", a: "We currently serve all major cities and surrounding areas. Contact us to check if we cover your location." },
  { q: "Are your electricians licensed?", a: "Yes, all our electricians are fully licensed, insured, and certified with years of professional experience." },
  { q: "Do you offer emergency services?", a: "Absolutely! We provide 24/7 emergency electrical services. Call us anytime and we'll be there as soon as possible." },
  { q: "How much do your services cost?", a: "Our pricing varies based on the service type and complexity. We provide transparent quotes before starting any work with no hidden fees." },
  { q: "Do you provide warranties?", a: "Yes, we offer warranties on all our work. The duration depends on the type of service performed." },
  { q: "How do I book a service?", a: "You can book through our website using the Book Now button, call us directly, or send us a WhatsApp message." },
];

const FAQ = () => {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  return (
    <>
      <section className="bg-hero py-20">
        <div className="container mx-auto px-4 text-center">
          <Zap className="w-10 h-10 text-secondary mx-auto mb-4" />
          <h1 className="text-3xl md:text-5xl font-heading font-extrabold text-primary-foreground">FAQs</h1>
          <p className="text-primary-foreground/70 mt-3 max-w-lg mx-auto">Answers to commonly asked questions</p>
        </div>
      </section>
      <Section>
        <div className="max-w-2xl mx-auto space-y-3">
          {faqs.map((f, i) => (
            <div key={i} className="bg-card border border-border rounded-xl overflow-hidden">
              <button
                onClick={() => setOpenIdx(openIdx === i ? null : i)}
                className="w-full flex items-center justify-between p-5 text-left"
              >
                <span className="font-heading font-semibold text-foreground">{f.q}</span>
                <ChevronDown className={`w-5 h-5 text-muted-foreground shrink-0 transition-transform ${openIdx === i ? "rotate-180" : ""}`} />
              </button>
              {openIdx === i && (
                <div className="px-5 pb-5 text-sm text-muted-foreground leading-relaxed">{f.a}</div>
              )}
            </div>
          ))}
        </div>
      </Section>
    </>
  );
};

export default FAQ;
