import { motion } from "framer-motion";
import { ClipboardList, UserCheck, Wrench, CreditCard } from "lucide-react";

const steps = [
  {
    icon: ClipboardList,
    title: "Request Service",
    description: "Submit your service request online or via WhatsApp with details of your electrical needs.",
  },
  {
    icon: UserCheck,
    title: "Technician Assigned",
    description: "We assign a certified electrician matched to your specific requirement and location.",
  },
  {
    icon: Wrench,
    title: "Work Completed",
    description: "Our expert completes the job efficiently with quality materials and safety compliance.",
  },
  {
    icon: CreditCard,
    title: "Payment & Feedback",
    description: "Pay securely and share your feedback to help us maintain our service quality.",
  },
];

const ProcessTimeline = () => {
  return (
    <div className="relative">
      {/* Connecting line */}
      <div className="absolute left-1/2 top-0 bottom-0 w-px bg-border hidden lg:block" />

      <div className="grid lg:grid-cols-4 gap-8 relative">
        {steps.map((step, i) => (
          <motion.div
            key={step.title}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.15, duration: 0.5 }}
            className="relative text-center"
          >
            {/* Step number */}
            <div className="relative z-10 mx-auto mb-4">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto group hover:bg-primary hover:border-primary transition-all duration-500">
                <step.icon className="w-7 h-7 text-primary group-hover:text-primary-foreground transition-colors duration-500" />
              </div>
              <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-secondary text-secondary-foreground text-xs font-bold flex items-center justify-center shadow-lg">
                {i + 1}
              </div>
            </div>

            <h3 className="font-heading font-bold text-foreground text-lg mb-2">{step.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-[220px] mx-auto">{step.description}</p>

            {/* Connector arrow for desktop */}
            {i < steps.length - 1 && (
              <div className="hidden lg:block absolute top-8 -right-4 w-8">
                <svg viewBox="0 0 32 16" fill="none" className="text-primary/30">
                  <path d="M0 8h28M22 2l6 6-6 6" stroke="currentColor" strokeWidth="2" />
                </svg>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default ProcessTimeline;
