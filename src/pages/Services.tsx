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
      <section className="bg-hero-premium py-28 relative overflow-hidden">
        {/* Enhanced background */}
        <div className="absolute inset-0">
          <div className="absolute bottom-0 left-1/4 w-96 h-96 rounded-full bg-primary/10 blur-3xl float-animation" />
          <div className="absolute top-0 right-1/4 w-96 h-96 rounded-full bg-secondary/10 blur-3xl float-animation" style={{ animationDelay: '2s' }} />
          <div className="absolute inset-0 bg-circuit-pattern opacity-20" />
        </div>
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 30 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.7 }}
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.4 }}
              className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full bg-primary/15 backdrop-blur-sm border border-primary/30 text-primary-foreground/90 text-sm font-semibold mb-6 shadow-lg shadow-primary/10"
            >
              <Zap className="w-4 h-4 text-secondary electric-pulse" />
              Professional Electrical Solutions
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-4xl md:text-5xl lg:text-6xl font-heading font-extrabold text-primary-foreground mb-6 tracking-tight"
            >
              Our <span className="gradient-text">Services</span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="text-primary-foreground/70 mt-5 max-w-2xl mx-auto text-lg leading-relaxed"
            >
              Professional electrical solutions for residential, commercial, and industrial needs with certified experts
            </motion.p>
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
