import { Link } from "react-router-dom";
import { Zap, Phone, Mail, MapPin } from "lucide-react";
import { PHONE_NUMBER } from "@/data/services";

const Footer = () => (
  <footer className="bg-primary text-primary-foreground">
    <div className="container mx-auto px-4 py-16">
      <div className="grid md:grid-cols-4 gap-10">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center">
              <Zap className="w-5 h-5 text-secondary-foreground" />
            </div>
            <span className="text-xl font-heading font-bold">Electroobuddy</span>
          </div>
          <p className="text-primary-foreground/70 text-sm leading-relaxed">
            Your Trusted Electrical Service Partner. Professional electricians for all your residential and commercial needs.
          </p>
        </div>

        <div>
          <h4 className="font-heading font-semibold mb-4">Quick Links</h4>
          <ul className="space-y-2.5 text-sm text-primary-foreground/70">
            {[
              { label: "Home", to: "/" },
              { label: "About Us", to: "/about" },
              { label: "Services", to: "/services" },
              { label: "Projects", to: "/projects" },
              { label: "Contact", to: "/contact" },
            ].map((l) => (
              <li key={l.to}>
                <Link to={l.to} className="hover:text-secondary transition-colors">{l.label}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="font-heading font-semibold mb-4">Services</h4>
          <ul className="space-y-2.5 text-sm text-primary-foreground/70">
            {["Electrical Servicing", "Device Installation", "Equipment Repair", "Wiring & Maintenance", "Home Troubleshooting"].map((s) => (
              <li key={s}>
                <Link to="/services" className="hover:text-secondary transition-colors">{s}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="font-heading font-semibold mb-4">Contact Info</h4>
          <ul className="space-y-3 text-sm text-primary-foreground/70">
            <li className="flex items-start gap-2">
              <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-secondary" />
              <span>123 Electrical Ave, Tech City, India 400001</span>
            </li>
            <li className="flex items-center gap-2">
              <Phone className="w-4 h-4 shrink-0 text-secondary" />
              <a href={`tel:${PHONE_NUMBER}`} className="hover:text-secondary transition-colors">{PHONE_NUMBER}</a>
            </li>
            <li className="flex items-center gap-2">
              <Mail className="w-4 h-4 shrink-0 text-secondary" />
              <a href="mailto:hello@electroobuddy.com" className="hover:text-secondary transition-colors">hello@electroobuddy.com</a>
            </li>
          </ul>
        </div>
      </div>

      <div className="mt-12 pt-8 border-t border-primary-foreground/10 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-primary-foreground/50">
        <p>&copy; {new Date().getFullYear()} Electroobuddy. All rights reserved.</p>
        <div className="flex gap-6">
          <Link to="/privacy" className="hover:text-secondary transition-colors">Privacy Policy</Link>
          <Link to="/terms" className="hover:text-secondary transition-colors">Terms & Conditions</Link>
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;
