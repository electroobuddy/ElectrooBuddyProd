import Section from "@/components/Section";
import { Zap } from "lucide-react";

const Privacy = () => (
  <>
    <section className="bg-hero py-20">
      <div className="container mx-auto px-4 text-center">
        <Zap className="w-10 h-10 text-secondary mx-auto mb-4" />
        <h1 className="text-3xl md:text-5xl font-heading font-extrabold text-primary-foreground">Privacy Policy</h1>
      </div>
    </section>
    <Section>
      <div className="max-w-3xl mx-auto prose prose-sm text-muted-foreground">
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-heading font-bold text-foreground">Information We Collect</h2>
            <p>We collect personal information such as your name, phone number, email address, and service details when you fill out our booking or contact forms. This information is used solely to provide our services and communicate with you.</p>
          </div>
          <div>
            <h2 className="text-xl font-heading font-bold text-foreground">How We Use Your Information</h2>
            <p>Your information is used to process bookings, respond to inquiries, improve our services, and send relevant updates. We do not sell or share your personal data with third parties without your consent.</p>
          </div>
          <div>
            <h2 className="text-xl font-heading font-bold text-foreground">Data Security</h2>
            <p>We implement appropriate security measures to protect your personal information from unauthorized access, alteration, or disclosure.</p>
          </div>
          <div>
            <h2 className="text-xl font-heading font-bold text-foreground">Contact Us</h2>
            <p>If you have any questions about this Privacy Policy, please contact us at hello@electroobuddy.com.</p>
          </div>
        </div>
      </div>
    </Section>
  </>
);

export default Privacy;
