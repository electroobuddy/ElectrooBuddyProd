import Section from "@/components/Section";
import ServiceCard from "@/components/ServiceCard";
import { services } from "@/data/services";
import { Zap } from "lucide-react";

const Services = () => (
  <>
    <section className="bg-hero py-20">
      <div className="container mx-auto px-4 text-center">
        <Zap className="w-10 h-10 text-secondary mx-auto mb-4" />
        <h1 className="text-3xl md:text-5xl font-heading font-extrabold text-primary-foreground">Our Services</h1>
        <p className="text-primary-foreground/70 mt-3 max-w-lg mx-auto">Professional electrical solutions for every need</p>
      </div>
    </section>
    <Section>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {services.map((s) => (
          <ServiceCard key={s.id} service={s} />
        ))}
      </div>
    </Section>
  </>
);

export default Services;
