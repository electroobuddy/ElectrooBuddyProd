import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import Section from "@/components/Section";
import { teamMembers as staticTeam } from "@/data/team";
import { Zap, Target, Eye, CheckCircle, Users } from "lucide-react";

const About = () => {
  const [team, setTeam] = useState<any[]>([]);

  useEffect(() => {
    supabase.from("team_members").select("*").order("sort_order").then(({ data }) => setTeam(data && data.length > 0 ? data : staticTeam));
  }, []);

  return (
    <>
      {/* Page Header */}
      <section className="bg-hero-premium py-24 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 right-1/4 w-64 h-64 rounded-full bg-primary/5 blur-3xl" />
        </div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <Zap className="w-10 h-10 text-secondary mx-auto mb-4 electric-pulse" />
            <h1 className="text-3xl md:text-5xl font-heading font-extrabold text-primary-foreground">
              About <span className="gradient-text">Electroobuddy</span>
            </h1>
            <p className="text-primary-foreground/50 mt-4 max-w-lg mx-auto">Your Trusted Electrical Service Partner since 2012</p>
          </motion.div>
        </div>
      </section>

      <Section>
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-heading font-bold text-foreground mb-6">Who We Are</h2>
          <p className="text-muted-foreground leading-relaxed text-lg">
            Electroobuddy is a leading electrical services company dedicated to providing top-notch electrical solutions for residential, commercial, and industrial clients. With over 12 years of experience and a team of certified master electricians, we deliver safe, reliable, and cost-effective services that exceed expectations.
          </p>
        </div>
      </Section>

      <Section className="bg-muted/50">
        <div className="grid md:grid-cols-2 gap-8">
          {[
            { icon: Target, title: "Our Mission", text: "To provide exceptional electrical services that prioritize safety, quality, and customer satisfaction while making professional electrical expertise accessible and affordable for everyone.", color: "primary" },
            { icon: Eye, title: "Our Vision", text: "To become the most trusted name in electrical services, known for innovation, reliability, and an unwavering commitment to excellence in every project we undertake.", color: "secondary" },
          ].map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, x: i === 0 ? -30 : 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="group bg-card border border-border rounded-2xl p-8 hover-lift hover-glow"
            >
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-500">
                <item.icon className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-xl font-heading font-bold text-foreground mb-3">{item.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{item.text}</p>
            </motion.div>
          ))}
        </div>
      </Section>

      <Section>
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-heading font-bold text-foreground">
            Why Choose <span className="text-gradient-blue">Electroobuddy?</span>
          </h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-4xl mx-auto">
          {["Licensed & insured professionals", "Transparent, upfront pricing", "24/7 emergency support", "Quality materials & workmanship", "100% satisfaction guarantee", "On-time service delivery"].map((item, i) => (
            <motion.div
              key={item}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.4 }}
              className="flex items-center gap-3 p-4 bg-card border border-border rounded-xl hover-glow transition-all"
            >
              <CheckCircle className="w-5 h-5 text-secondary shrink-0" />
              <span className="text-sm font-medium text-foreground">{item}</span>
            </motion.div>
          ))}
        </div>
      </Section>

      <Section className="bg-muted/50">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-heading font-bold text-foreground">
            Our <span className="text-gradient">Team</span>
          </h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {team.map((m, i) => (
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
    </>
  );
};

export default About;
