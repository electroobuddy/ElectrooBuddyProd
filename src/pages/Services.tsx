import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import Section from "@/components/Section";
import ServiceCard from "@/components/ServiceCard";
import { Zap, Loader2 } from "lucide-react";

const Services = () => {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("services").select("*").order("sort_order").then(({ data }) => {
      setServices(data || []);
      setLoading(false);
    });
  }, []);

  return (
    <>
      <section className="bg-hero-premium py-24 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute bottom-0 left-1/4 w-64 h-64 rounded-full bg-primary/5 blur-3xl" />
        </div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <Zap className="w-10 h-10 text-secondary mx-auto mb-4 electric-pulse" />
            <h1 className="text-3xl md:text-5xl font-heading font-extrabold text-primary-foreground">
              Our <span className="gradient-text">Services</span>
            </h1>
            <p className="text-primary-foreground/50 mt-4 max-w-lg mx-auto">Professional electrical solutions for every need</p>
          </motion.div>
        </div>
      </section>
      <Section>
        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
        ) : services.length === 0 ? (
          <p className="text-center text-muted-foreground py-12">No services available yet. Check back soon!</p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {services.map((s, i) => (
              <motion.div
                key={s.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.5 }}
              >
                <ServiceCard service={s} />
              </motion.div>
            ))}
          </div>
        )}
      </Section>
    </>
  );
};

export default Services;
