import Section from "@/components/Section";
import { Zap } from "lucide-react";

const Terms = () => (
  <>
    <section className="bg-hero py-20">
      <div className="container mx-auto px-4 text-center">
        <Zap className="w-10 h-10 text-secondary mx-auto mb-4" />
        <h1 className="text-3xl md:text-5xl font-heading font-extrabold text-primary-foreground">Terms & Conditions</h1>
      </div>
    </section>
    <Section>
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h2 className="text-xl font-heading font-bold text-foreground">Service Agreement</h2>
          <p className="text-muted-foreground mt-2">By booking a service through Electroobuddy, you agree to provide accurate information and be available at the scheduled time. Cancellations must be made at least 2 hours before the appointment.</p>
        </div>
        <div>
          <h2 className="text-xl font-heading font-bold text-foreground">Payment Terms</h2>
          <p className="text-muted-foreground mt-2">Payment is due upon completion of service unless otherwise agreed. We accept cash, bank transfers, and digital payments.</p>
        </div>
        <div>
          <h2 className="text-xl font-heading font-bold text-foreground">Warranty</h2>
          <p className="text-muted-foreground mt-2">All work performed comes with a service warranty. The warranty period varies by service type and will be communicated at the time of booking.</p>
        </div>
        <div>
          <h2 className="text-xl font-heading font-bold text-foreground">Liability</h2>
          <p className="text-muted-foreground mt-2">Electroobuddy is not liable for damages resulting from pre-existing electrical issues. Our team will inform you of any risks before proceeding with work.</p>
        </div>
      </div>
    </Section>
  </>
);

export default Terms;
