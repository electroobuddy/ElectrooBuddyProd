import { Link } from "react-router-dom";
import { Zap, Phone, Mail, MapPin, ArrowRight } from "lucide-react";
import { PHONE_NUMBER } from "@/data/services";

const Footer = () => (
  <footer className="bg-hero-premium text-primary-foreground relative overflow-hidden">
    {/* Background decoration */}
    <div className="absolute inset-0 overflow-hidden">
      <div className="absolute -top-32 -right-32 w-64 h-64 rounded-full bg-primary/5 blur-3xl" />
      <div className="absolute -bottom-32 -left-32 w-64 h-64 rounded-full bg-secondary/5 blur-3xl" />
    </div>

    <div className="container mx-auto px-4 py-16 relative z-10">
      <div className="grid md:grid-cols-4 gap-10">
        <div>
          <div className="flex items-center gap-2.5 mb-5">
            <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
              <Zap className="w-5 h-5 text-secondary" />
            </div>
            <span className="text-xl font-heading font-bold">Electroobuddy</span>
          </div>
          <p className="text-primary-foreground/50 text-sm leading-relaxed mb-6">
            Your trusted electrical service partner. Professional electricians for all your residential and commercial needs.
          </p>
          <Link
            to="/booking"
            className="inline-flex items-center gap-2 text-sm text-secondary font-semibold hover:gap-3 transition-all"
          >
            Book a Service <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div>
          <h4 className="font-heading font-semibold mb-5 text-sm uppercase tracking-wider text-primary-foreground/70">Quick Links</h4>
          <ul className="space-y-3 text-sm text-primary-foreground/50">
            {[
              { label: "Home", to: "/" },
              { label: "About Us", to: "/about" },
              { label: "Services", to: "/services" },
              { label: "Projects", to: "/projects" },
              { label: "Contact", to: "/contact" },
            ].map((l) => (
              <li key={l.to}>
                <Link to={l.to} className="hover:text-primary-foreground transition-colors">{l.label}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="font-heading font-semibold mb-5 text-sm uppercase tracking-wider text-primary-foreground/70">Services</h4>
          <ul className="space-y-3 text-sm text-primary-foreground/50">
            {["Electrical Servicing", "Device Installation", "Equipment Repair", "Wiring & Maintenance", "Home Troubleshooting"].map((s) => (
              <li key={s}>
                <Link to="/services" className="hover:text-primary-foreground transition-colors">{s}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="font-heading font-semibold mb-5 text-sm uppercase tracking-wider text-primary-foreground/70">Contact Info</h4>
          <ul className="space-y-4 text-sm text-primary-foreground/50">
            <li className="flex items-start gap-3">
              <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-secondary" />
              <span>123 Electrical Ave, Tech City, India 400001</span>
            </li>
            <li className="flex items-center gap-3">
              <Phone className="w-4 h-4 shrink-0 text-secondary" />
              <a href={`tel:${PHONE_NUMBER}`} className="hover:text-primary-foreground transition-colors">{PHONE_NUMBER}</a>
            </li>
            <li className="flex items-center gap-3">
              <Mail className="w-4 h-4 shrink-0 text-secondary" />
              <a href="mailto:hello@electroobuddy.com" className="hover:text-primary-foreground transition-colors">hello@electroobuddy.com</a>
            </li>
          </ul>
        </div>
      </div>

      <div className="mt-14 pt-8 border-t border-primary-foreground/10 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-primary-foreground/30">
        <p>&copy; {new Date().getFullYear()} Electroobuddy. All rights reserved.</p>
        <div className="flex gap-6">
          <Link to="/privacy" className="hover:text-primary-foreground/60 transition-colors">Privacy Policy</Link>
          <Link to="/terms" className="hover:text-primary-foreground/60 transition-colors">Terms & Conditions</Link>
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;
