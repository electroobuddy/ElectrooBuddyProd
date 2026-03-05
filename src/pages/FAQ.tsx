import { motion } from "framer-motion";
import Section from "@/components/Section";
import { Zap, ChevronDown } from "lucide-react";
import { useState } from "react";
import { AnimatePresence } from "framer-motion";

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
      <section className="bg-hero-premium py-24 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/3 w-64 h-64 rounded-full bg-primary/5 blur-3xl" />
        </div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <Zap className="w-10 h-10 text-secondary mx-auto mb-4 electric-pulse" />
            <h1 className="text-3xl md:text-5xl font-heading font-extrabold text-primary-foreground">
              Frequently Asked <span className="gradient-text">Questions</span>
            </h1>
            <p className="text-primary-foreground/50 mt-4 max-w-lg mx-auto">Answers to commonly asked questions</p>
          </motion.div>
        </div>
      </section>
      <Section>
        <div className="max-w-2xl mx-auto space-y-3">
          {faqs.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.4 }}
              className="bg-card border border-border rounded-2xl overflow-hidden hover-glow transition-all"
            >
              <button
                onClick={() => setOpenIdx(openIdx === i ? null : i)}
                className="w-full flex items-center justify-between p-6 text-left"
              >
                <span className="font-heading font-semibold text-foreground pr-4">{f.q}</span>
                <ChevronDown className={`w-5 h-5 text-muted-foreground shrink-0 transition-transform duration-300 ${openIdx === i ? "rotate-180" : ""}`} />
              </button>
              <AnimatePresence>
                {openIdx === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 pb-6 text-sm text-muted-foreground leading-relaxed">{f.a}</div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </Section>
    </>
  );
};

export default FAQ;
