import Section from "@/components/Section";
import { teamMembers } from "@/data/team";
import { Zap, Target, Eye, CheckCircle, Users } from "lucide-react";

const About = () => (
  <>
    <section className="bg-hero py-20">
      <div className="container mx-auto px-4 text-center">
        <Zap className="w-10 h-10 text-secondary mx-auto mb-4" />
        <h1 className="text-3xl md:text-5xl font-heading font-extrabold text-primary-foreground">About Electroobuddy</h1>
        <p className="text-primary-foreground/70 mt-3 max-w-lg mx-auto">Your Trusted Electrical Service Partner since 2012</p>
      </div>
    </section>

    <Section>
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="text-2xl md:text-3xl font-heading font-bold text-foreground mb-4">Who We Are</h2>
        <p className="text-muted-foreground leading-relaxed">
          Electroobuddy is a leading electrical services company dedicated to providing top-notch electrical solutions for residential, commercial, and industrial clients. With over 12 years of experience and a team of certified master electricians, we deliver safe, reliable, and cost-effective services that exceed expectations.
        </p>
      </div>
    </Section>

    <Section className="bg-muted/50">
      <div className="grid md:grid-cols-2 gap-10">
        <div className="bg-card border border-border rounded-xl p-8">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
            <Target className="w-6 h-6 text-primary" />
          </div>
          <h3 className="text-xl font-heading font-bold text-foreground mb-3">Our Mission</h3>
          <p className="text-muted-foreground leading-relaxed">
            To provide exceptional electrical services that prioritize safety, quality, and customer satisfaction while making professional electrical expertise accessible and affordable for everyone.
          </p>
        </div>
        <div className="bg-card border border-border rounded-xl p-8">
          <div className="w-12 h-12 rounded-xl bg-secondary/20 flex items-center justify-center mb-4">
            <Eye className="w-6 h-6 text-secondary-foreground" />
          </div>
          <h3 className="text-xl font-heading font-bold text-foreground mb-3">Our Vision</h3>
          <p className="text-muted-foreground leading-relaxed">
            To become the most trusted name in electrical services, known for innovation, reliability, and an unwavering commitment to excellence in every project we undertake.
          </p>
        </div>
      </div>
    </Section>

    <Section>
      <div className="text-center mb-10">
        <h2 className="text-2xl md:text-3xl font-heading font-bold text-foreground">Why Choose Electroobuddy?</h2>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
        {[
          "Licensed & insured professionals",
          "Transparent, upfront pricing",
          "24/7 emergency support",
          "Quality materials & workmanship",
          "100% satisfaction guarantee",
          "On-time service delivery",
        ].map((item) => (
          <div key={item} className="flex items-center gap-3 p-4 bg-card border border-border rounded-xl">
            <CheckCircle className="w-5 h-5 text-secondary shrink-0" />
            <span className="text-sm font-medium text-foreground">{item}</span>
          </div>
        ))}
      </div>
    </Section>

    <Section className="bg-muted/50">
      <div className="text-center mb-10">
        <h2 className="text-2xl md:text-3xl font-heading font-bold text-foreground">Our Team</h2>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {teamMembers.map((m) => (
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
  </>
);

export default About;
