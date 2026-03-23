import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import Section from "@/components/Section";
import SEO from "@/components/SEO";
import ServiceCard from "@/components/ServiceCard";
import { Zap, Loader2 } from "lucide-react";
import { services as defaultServices } from "@/data/services";
import { useServices } from "@/hooks/useOptimizedData";

const Services = () => {
  // Use optimized hook with caching instead of direct Supabase query
  const { services: dbServices, loading: servicesLoading } = useServices();
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Use cached services from hook, fallback to static data if empty
    if (dbServices && dbServices.length > 0) {
      setServices(dbServices);
    } else {
      setServices(defaultServices);
    }
    setLoading(false);
  }, [dbServices]);

  return (
    <>
      <SEO
        title="Electrical Services in Ujjain | Installation, Repair & Maintenance"
        description="Comprehensive electrical services including installation, repair, maintenance for residential, commercial and industrial properties. Emergency services available 24/7 with certified professionals."
        keywords="electrical services, electrical installation, electrical repair, wiring services, maintenance services, emergency electrician, panel upgrade, lighting installation, ceiling fan installation, electrical troubleshooting"
        canonical="/services"
        structuredData={{
          "@context": "https://schema.org",
          "@type": "Service",
          "serviceType": "Electrical Services",
          "provider": {
            "@type": "LocalBusiness",
            "name": "Electroo Buddy"
          },
          "areaServed": {
            "@type": "City",
            "name": "Ujjain"
          },
          "hasOfferCatalog": {
            "@type": "OfferCatalog",
            "name": "Electrical Services",
            "itemListElement": [
              {
                "@type": "Offer",
                "itemOffered": {
                  "@type": "Service",
                  "name": "Electrical Installation",
                  "description": "Professional electrical installation services for homes and businesses"
                }
              },
              {
                "@type": "Offer",
                "itemOffered": {
                  "@type": "Service",
                  "name": "Electrical Repair",
                  "description": "Fast and reliable electrical repair services"
                }
              },
              {
                "@type": "Offer",
                "itemOffered": {
                  "@type": "Service",
                  "name": "Maintenance Services",
                  "description": "Regular electrical maintenance to prevent issues"
                }
              }
            ]
          }
        }}
      />
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700;800&family=DM+Sans:wght@400;500&display=swap');

        .services-hero {
          position: relative;
          padding: 112px 0 96px;
          overflow: hidden;
          background: hsl(var(--background));
          text-align: center;
          font-family: 'DM Sans', sans-serif;
        }

        .services-hero-grid {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(hsl(var(--primary) / 0.035) 1px, transparent 1px),
            linear-gradient(90deg, hsl(var(--primary) / 0.035) 1px, transparent 1px);
          background-size: 60px 60px;
          mask-image: radial-gradient(ellipse 80% 80% at 50% 50%, black 20%, transparent 100%);
        }

        .services-hero-glow-1,
        .services-hero-glow-2 {
          position: absolute;
          border-radius: 50%;
          pointer-events: none;
        }

        .services-hero-glow-1 {
          bottom: -80px; left: 25%;
          width: 400px; height: 400px;
          background: radial-gradient(ellipse, hsl(var(--primary) / 0.08) 0%, transparent 70%);
        }

        .services-hero-glow-2 {
          top: -60px; right: 25%;
          width: 350px; height: 350px;
          background: radial-gradient(ellipse, hsl(var(--secondary) / 0.06) 0%, transparent 70%);
        }

        .services-badge {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 9px 20px;
          border: 1px solid hsl(var(--border) / 0.3);
          border-radius: 100px;
          background: hsl(var(--primary) / 0.07);
          backdrop-filter: blur(8px);
          margin-bottom: 28px;
          font-size: 13px;
          font-weight: 600;
          color: hsl(var(--foreground));
          letter-spacing: 0.3px;
          text-transform: uppercase;
        }

        .services-badge span {
          color: hsl(var(--secondary));
        }

        .services-title {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: clamp(48px, 7vw, 88px);
          font-weight: 900;
          line-height: 0.92;
          color: hsl(var(--foreground));
          text-transform: uppercase;
          letter-spacing: -1px;
          margin-bottom: 16px;
        }

        .services-title span {
          background: linear-gradient(135deg, hsl(var(--secondary)) 0%, hsl(var(--electric-yellow-light)) 50%, hsl(var(--electric-blue-dark)) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .services-subtitle {
          color: hsl(var(--muted-foreground) / 0.5);
          font-size: 16px;
          max-width: 500px;
          margin: 0 auto;
          line-height: 1.6;
        }
      `}</style>

      <section className="services-hero">
        <div className="services-hero-grid" />
        <div className="services-hero-glow-1" />
        <div className="services-hero-glow-2" />
        
        <div className="container mx-auto px-4 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 30 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.7 }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.4 }}
              className="services-badge"
            >
              <Zap className="w-4 h-4" />
              Professional Electrical Solutions
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="services-title"
            >
              Our <span>Services</span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="services-subtitle"
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
