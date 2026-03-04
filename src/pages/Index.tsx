import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Zap, ArrowRight, Star, CheckCircle, Users } from "lucide-react";
import Section from "@/components/Section";
import ServiceCard from "@/components/ServiceCard";
import { supabase } from "@/integrations/supabase/client";
import { services as staticServices } from "@/data/services";
import { teamMembers as staticTeam } from "@/data/team";
import { testimonials as staticTestimonials } from "@/data/testimonials";

const stats = [
  { value: "500+", label: "Projects Completed" },
  { value: "12+", label: "Years Experience" },
  { value: "1000+", label: "Happy Clients" },
  { value: "24/7", label: "Support Available" },
];

const Index = () => {
  const [dbServices, setDbServices] = useState<any[]>([]);
  const [dbTeam, setDbTeam] = useState<any[]>([]);
  const [dbTestimonials, setDbTestimonials] = useState<any[]>([]);

  useEffect(() => {
    supabase.from("services").select("*").order("sort_order").limit(4).then(({ data }) => setDbServices(data || []));
    supabase.from("team_members").select("*").order("sort_order").then(({ data }) => setDbTeam(data || []));
    supabase.from("testimonials").select("*").order("created_at", { ascending: false }).then(({ data }) => setDbTestimonials(data || []));
  }, []);

  const displayServices = dbServices.length > 0 ? dbServices : staticServices.slice(0, 4).map(s => ({ id: s.id, title: s.title, description: s.description, icon_name: "Zap", whatsapp_enabled: true, call_enabled: true, book_now_enabled: true }));
  const displayTeam = dbTeam.length > 0 ? dbTeam : staticTeam;
  const displayTestimonials = dbTestimonials.length > 0 ? dbTestimonials : staticTestimonials;

  return (
    <>
      {/* Hero */}
      <section className="relative bg-hero min-h-[85vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDE0djJoLTJ2LTJoMnptMCAyMHYyaC0ydi0yaDJ6bS0yMC0yMHYyaC0ydi0yaDJ6bTAgMjB2MmgtMnYtMmgyek0zNiAzNHYyaC0ydi0yaDJ6TTE2IDM0djJoLTJ2LTJoMnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-50" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-2xl">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-secondary/20 text-secondary text-sm font-medium mb-6">
                <Zap className="w-4 h-4" /> Trusted Electrical Experts
              </div>
              <h1 className="text-4xl md:text-6xl font-heading font-extrabold text-primary-foreground leading-tight mb-6">
                Your Trusted{" "}
                <span className="text-secondary">Electrical</span> Service Partner
              </h1>
              <p className="text-lg text-primary-foreground/80 mb-8 max-w-lg leading-relaxed">
                Professional electricians for servicing, installation, repair, wiring, and home troubleshooting. Fast, reliable, and affordable.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  to="/booking"
                  className="inline-flex items-center gap-2 px-7 py-3.5 bg-secondary text-secondary-foreground font-semibold rounded-xl hover:brightness-110 transition-all shadow-lg"
                >
                  Book Now <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/services"
                  className="inline-flex items-center gap-2 px-7 py-3.5 border-2 border-primary-foreground/30 text-primary-foreground font-semibold rounded-xl hover:bg-primary-foreground/10 transition-all"
                >
                  Our Services
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="relative -mt-12 z-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.1, duration: 0.5 }}
                className="bg-card border border-border rounded-xl p-5 text-center shadow-lg"
              >
                <div className="text-2xl md:text-3xl font-heading font-extrabold text-primary">{s.value}</div>
                <div className="text-sm text-muted-foreground mt-1">{s.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Services */}
      <Section>
        <div className="text-center mb-12">
          <span className="text-sm font-semibold text-secondary uppercase tracking-wider">What We Offer</span>
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mt-2">Our Professional Services</h2>
          <p className="text-muted-foreground mt-3 max-w-xl mx-auto">From simple repairs to complex installations, our certified electricians handle it all.</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {displayServices.map((s) => (
            <ServiceCard key={s.id} service={s} />
          ))}
        </div>
        <div className="text-center mt-10">
          <Link to="/services" className="inline-flex items-center gap-2 text-primary font-semibold hover:gap-3 transition-all">
            View All Services <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </Section>

      {/* Why Choose Us */}
      <Section className="bg-muted/50">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <span className="text-sm font-semibold text-secondary uppercase tracking-wider">Why Choose Us</span>
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mt-2 mb-6">Reliable Electrical Solutions You Can Trust</h2>
            <div className="space-y-4">
              {[
                "Licensed & certified master electricians",
                "24/7 emergency electrical services",
                "Transparent pricing with no hidden fees",
                "100% satisfaction guarantee on all work",
                "Latest tools and safety equipment",
              ].map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-secondary mt-0.5 shrink-0" />
                  <span className="text-foreground">{item}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-hero rounded-2xl p-10 flex items-center justify-center min-h-[300px]">
            <Zap className="w-24 h-24 text-secondary opacity-80" />
          </div>
        </div>
      </Section>

      {/* Team */}
      <Section>
        <div className="text-center mb-12">
          <span className="text-sm font-semibold text-secondary uppercase tracking-wider">Our Experts</span>
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mt-2">Meet Our Team</h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {displayTeam.map((m) => (
            <div key={m.id} className="bg-card border border-border rounded-xl p-6 text-center hover-lift">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-heading font-bold text-foreground">{m.name}</h3>
              <p className="text-sm text-secondary font-medium mt-1">{m.role}</p>
              <p className="text-xs text-muted-foreground mt-2">{m.bio}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Testimonials */}
      <Section className="bg-muted/50">
        <div className="text-center mb-12">
          <span className="text-sm font-semibold text-secondary uppercase tracking-wider">Testimonials</span>
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mt-2">What Our Clients Say</h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {displayTestimonials.map((t) => (
            <div key={t.id} className="bg-card border border-border rounded-xl p-6 hover-lift">
              <div className="flex gap-0.5 mb-3">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-secondary text-secondary" />
                ))}
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">"{t.text}"</p>
              <div>
                <p className="font-heading font-semibold text-foreground text-sm">{t.name}</p>
                <p className="text-xs text-muted-foreground">{t.service}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* CTA */}
      <section className="bg-hero py-20">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-primary-foreground mb-4">
              Need an Electrician? We're Just a Call Away!
            </h2>
            <p className="text-primary-foreground/70 mb-8 max-w-lg mx-auto">
              Book a professional electrician today and get your electrical issues resolved quickly and safely.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                to="/booking"
                className="inline-flex items-center gap-2 px-8 py-4 bg-secondary text-secondary-foreground font-bold rounded-xl hover:brightness-110 transition-all shadow-lg"
              >
                Book a Service <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 px-8 py-4 border-2 border-primary-foreground/30 text-primary-foreground font-bold rounded-xl hover:bg-primary-foreground/10 transition-all"
              >
                Contact Us
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
};

export default Index;
