import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Zap, ArrowRight, Shield, Clock, BadgeDollarSign, HeartHandshake, Users } from "lucide-react";
import Section from "@/components/Section";
import ServiceCard from "@/components/ServiceCard";
import AnimatedCounter from "@/components/AnimatedCounter";
import ProcessTimeline from "@/components/ProcessTimeline";
import TestimonialSlider from "@/components/TestimonialSlider";
import { supabase } from "@/integrations/supabase/client";
import { services as staticServices } from "@/data/services";
import { teamMembers as staticTeam } from "@/data/team";
import { testimonials as staticTestimonials } from "@/data/testimonials";

const whyChooseUs = [
  { icon: Shield, title: "Certified Electricians", description: "All our professionals are licensed, insured, and certified with rigorous training." },
  { icon: Clock, title: "Fast Response", description: "24/7 availability with average response time under 30 minutes for emergencies." },
  { icon: BadgeDollarSign, title: "Affordable Pricing", description: "Transparent, competitive pricing with no hidden fees. Get quotes upfront." },
  { icon: HeartHandshake, title: "Safe & Reliable", description: "100% satisfaction guarantee with industry-leading safety standards." },
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
      <section className="relative bg-hero-premium min-h-screen flex items-center overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 -left-32 w-96 h-96 rounded-full bg-primary/5 blur-3xl float-animation" />
          <div className="absolute bottom-1/4 -right-32 w-96 h-96 rounded-full bg-secondary/5 blur-3xl float-animation" style={{ animationDelay: '3s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border border-primary/5" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full border border-primary/3" />
          {/* Grid pattern */}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMiI+PHBhdGggZD0iTTM2IDE0djJoLTJ2LTJoMnptMCAyMHYyaC0ydi0yaDJ6bS0yMC0yMHYyaC0ydi0yaDJ6bTAgMjB2MmgtMnYtMmgyek0zNiAzNHYyaC0ydi0yaDJ6TTE2IDM0djJoLTJ2LTJoMnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-50" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/20 bg-primary/10 text-primary-foreground/90 text-sm font-medium mb-8"
              >
                <Zap className="w-4 h-4 text-secondary" /> Trusted by 1000+ Customers
              </motion.div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-extrabold text-primary-foreground leading-[1.1] mb-6">
                Professional{" "}
                <span className="gradient-text">Electricians</span>{" "}
                at Your Doorstep
              </h1>

              <p className="text-lg text-primary-foreground/60 mb-10 max-w-lg leading-relaxed">
                Book trusted electricians for installation, repair, and maintenance. Fast, reliable, and affordable electrical services.
              </p>

              <div className="flex flex-wrap gap-4">
                <Link
                  to="/booking"
                  className="group inline-flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground font-semibold rounded-xl hover:shadow-lg hover:shadow-primary/25 transition-all duration-300"
                >
                  Book Service
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  to="/services"
                  className="inline-flex items-center gap-2 px-8 py-4 border border-primary-foreground/20 text-primary-foreground font-semibold rounded-xl hover:bg-primary-foreground/5 transition-all duration-300"
                >
                  View Services
                </Link>
              </div>
            </motion.div>

            {/* Hero visual */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
              className="hidden lg:flex items-center justify-center"
            >
              <div className="relative">
                <div className="w-80 h-80 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <div className="w-56 h-56 rounded-full bg-primary/15 border border-primary/20 flex items-center justify-center">
                    <Zap className="w-24 h-24 text-secondary electric-pulse" />
                  </div>
                </div>
                {/* Floating badges */}
                <motion.div
                  animate={{ y: [-5, 5, -5] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute -top-4 right-0 glass-card-dark px-4 py-2 rounded-xl"
                >
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-secondary" />
                    <span className="text-xs text-primary-foreground/80 font-medium">Licensed & Insured</span>
                  </div>
                </motion.div>
                <motion.div
                  animate={{ y: [5, -5, 5] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                  className="absolute -bottom-4 left-0 glass-card-dark px-4 py-2 rounded-xl"
                >
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-primary" />
                    <span className="text-xs text-primary-foreground/80 font-medium">24/7 Available</span>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="relative -mt-16 z-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="glass-card rounded-2xl p-8 md:p-10"
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <AnimatedCounter end={500} suffix="+" label="Happy Customers" />
              <AnimatedCounter end={1000} suffix="+" label="Repairs Done" />
              <AnimatedCounter end={10} suffix="+" label="Expert Electricians" />
              <AnimatedCounter end={5} suffix="+" label="Years Experience" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Services */}
      <Section>
        <div className="text-center mb-14">
          <motion.span
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-4"
          >
            What We Offer
          </motion.span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-foreground">
            Our Professional <span className="text-gradient-blue">Services</span>
          </h2>
          <p className="text-muted-foreground mt-4 max-w-xl mx-auto leading-relaxed">
            From simple repairs to complex installations, our certified electricians handle it all with precision and care.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {displayServices.map((s, i) => (
            <motion.div
              key={s.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
            >
              <ServiceCard service={s} />
            </motion.div>
          ))}
        </div>
        <div className="text-center mt-12">
          <Link
            to="/services"
            className="group inline-flex items-center gap-2 px-6 py-3 border border-border rounded-xl text-foreground font-semibold hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-300"
          >
            View All Services <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </Section>

      {/* Why Choose Us */}
      <Section className="bg-muted/50">
        <div className="text-center mb-14">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-secondary/10 text-secondary-foreground text-sm font-semibold mb-4">
            Why Choose Us
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-foreground">
            Reliable Solutions <span className="text-gradient">You Can Trust</span>
          </h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {whyChooseUs.map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="group bg-card border border-border rounded-2xl p-7 hover-lift hover-glow cursor-default"
            >
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-5 group-hover:bg-primary group-hover:scale-110 transition-all duration-500">
                <item.icon className="w-7 h-7 text-primary group-hover:text-primary-foreground transition-colors duration-500" />
              </div>
              <h3 className="font-heading font-bold text-foreground text-lg mb-2">{item.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* Process */}
      <Section>
        <div className="text-center mb-14">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-4">
            How It Works
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-foreground">
            Our Simple <span className="text-gradient-blue">Process</span>
          </h2>
          <p className="text-muted-foreground mt-4 max-w-xl mx-auto">
            Getting your electrical issues resolved is easy with our streamlined process.
          </p>
        </div>
        <ProcessTimeline />
      </Section>

      {/* Team */}
      <Section className="bg-muted/50">
        <div className="text-center mb-14">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-secondary/10 text-secondary-foreground text-sm font-semibold mb-4">
            Our Experts
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-foreground">
            Meet Our <span className="text-gradient">Team</span>
          </h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {displayTeam.map((m, i) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="group bg-card border border-border rounded-2xl p-7 text-center hover-lift hover-glow"
            >
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform duration-500">
                <Users className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-heading font-bold text-foreground">{m.name}</h3>
              <p className="text-sm text-primary font-medium mt-1">{m.role}</p>
              <p className="text-xs text-muted-foreground mt-3 leading-relaxed">{m.bio}</p>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* Testimonials */}
      <Section>
        <div className="text-center mb-14">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-4">
            Testimonials
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-foreground">
            What Our <span className="text-gradient-blue">Clients Say</span>
          </h2>
        </div>
        <TestimonialSlider testimonials={displayTestimonials} />
      </Section>

      {/* CTA */}
      <section className="relative overflow-hidden">
        <div className="bg-hero-premium py-24">
          <div className="absolute inset-0">
            <div className="absolute top-0 left-1/4 w-64 h-64 rounded-full bg-primary/10 blur-3xl" />
            <div className="absolute bottom-0 right-1/4 w-64 h-64 rounded-full bg-secondary/10 blur-3xl" />
          </div>
          <div className="container mx-auto px-4 text-center relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <Zap className="w-12 h-12 text-secondary mx-auto mb-6 electric-pulse" />
              <h2 className="text-3xl md:text-5xl font-heading font-bold text-primary-foreground mb-4">
                Need an Electrician Today?
              </h2>
              <p className="text-primary-foreground/60 mb-10 max-w-lg mx-auto text-lg">
                Book a professional electrician and get your electrical issues resolved quickly and safely.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link
                  to="/booking"
                  className="group inline-flex items-center gap-2 px-8 py-4 bg-secondary text-secondary-foreground font-bold rounded-xl hover:shadow-lg hover:shadow-secondary/25 transition-all duration-300"
                >
                  Book Now <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  to="/contact"
                  className="inline-flex items-center gap-2 px-8 py-4 border border-primary-foreground/20 text-primary-foreground font-bold rounded-xl hover:bg-primary-foreground/5 transition-all duration-300"
                >
                  Contact Us
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Index;
