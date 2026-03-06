import { Link } from "react-router-dom";
import { Zap, Phone, Mail, MapPin, ArrowRight } from "lucide-react";
import { PHONE_NUMBER } from "@/data/services";
import { motion } from "framer-motion";

const quickLinks = [
  { label: "Home", to: "/" },
  { label: "About Us", to: "/about" },
  { label: "Services", to: "/services" },
  { label: "Projects", to: "/projects" },
  { label: "Contact", to: "/contact" },
];

const serviceLinks = [
  "Electrical Servicing",
  "Device Installation",
  "Equipment Repair",
  "Wiring & Maintenance",
  "Home Troubleshooting",
];

const Footer = () => (
  <>
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700;800;900&family=DM+Sans:wght@400;500&display=swap');

      .footer-root {
        position: relative;
        background: hsl(var(--card));
        overflow: hidden;
        font-family: 'DM Sans', sans-serif;
        border-top: 1px solid hsl(var(--border));
      }

      /* Animated grid background */
      .footer-grid-bg {
        position: absolute;
        inset: 0;
        background-image:
          linear-gradient(hsl(var(--foreground) / 0.03) 1px, transparent 1px),
          linear-gradient(90deg, hsl(var(--foreground) / 0.03) 1px, transparent 1px);
        background-size: 60px 60px;
        pointer-events: none;
      }

      /* Glows */
      .footer-glow-tr {
        position: absolute;
        top: -120px; right: -80px;
        width: 400px; height: 400px;
        border-radius: 50%;
        background: radial-gradient(circle, hsl(var(--primary) / 0.06) 0%, transparent 70%);
        pointer-events: none;
      }

      .footer-glow-bl {
        position: absolute;
        bottom: -100px; left: -60px;
        width: 350px; height: 350px;
        border-radius: 50%;
        background: radial-gradient(circle, hsl(var(--secondary) / 0.04) 0%, transparent 70%);
        pointer-events: none;
      }

      .footer-inner {
        position: relative;
        z-index: 2;
        max-width: 1280px;
        margin: 0 auto;
        padding: 72px 24px 0;
      }

      .footer-grid {
        display: grid;
        grid-template-columns: 1fr;
        gap: 48px;
      }

      @media (min-width: 768px) {
        .footer-grid { grid-template-columns: 1.4fr 1fr 1fr 1.2fr; gap: 40px; }
      }

      /* Brand */
      .footer-logo {
        display: flex;
        align-items: center;
        gap: 10px;
        text-decoration: none;
        margin-bottom: 20px;
      }

      .footer-logo-icon {
        width: 42px;
        height: 42px;
        border-radius: 12px;
        background: linear-gradient(135deg, hsl(var(--primary)), hsl(var(--electric-blue-dark)));
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 0 20px hsl(var(--primary) / 0.3);
        flex-shrink: 0;
      }

      .footer-logo-text {
        font-family: 'Barlow Condensed', sans-serif;
        font-size: 24px;
        font-weight: 800;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        color: hsl(var(--foreground));
        line-height: 1;
      }

      .footer-logo-text span {
        background: linear-gradient(135deg, hsl(var(--secondary)), hsl(var(--electric-yellow-light)));
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }

      .footer-brand-desc {
        font-size: 13.5px;
        color: hsl(var(--muted-foreground));
        line-height: 1.75;
        margin-bottom: 24px;
        max-width: 280px;
      }

      .footer-cta-link {
        display: inline-flex;
        align-items: center;
        gap: 7px;
        font-size: 13px;
        font-weight: 600;
        color: hsl(var(--primary));
        text-decoration: none;
        letter-spacing: 0.3px;
        transition: all 0.25s;
      }

      .footer-cta-link:hover { opacity: 0.75; gap: 10px; }

      /* Section headings */
      .footer-col-title {
        font-family: 'Barlow Condensed', sans-serif;
        font-size: 14px;
        font-weight: 800;
        text-transform: uppercase;
        letter-spacing: 1.2px;
        color: hsl(var(--primary));
        margin-bottom: 20px;
        display: flex;
        align-items: center;
        gap: 10px;
      }

      .footer-col-title::after {
        content: '';
        flex: 1;
        height: 1px;
        background: linear-gradient(90deg, hsl(var(--primary) / 0.3), transparent);
      }

      /* Links */
      .footer-link-list {
        list-style: none;
        padding: 0;
        margin: 0;
        display: flex;
        flex-direction: column;
        gap: 10px;
      }

      .footer-link {
        display: inline-flex;
        align-items: center;
        gap: 9px;
        font-size: 13.5px;
        color: hsl(var(--muted-foreground));
        text-decoration: none;
        transition: all 0.25s ease;
        font-family: 'DM Sans', sans-serif;
      }

      .footer-link-dot {
        width: 5px;
        height: 5px;
        border-radius: 50%;
        background: hsl(var(--primary) / 0.3);
        flex-shrink: 0;
        transition: all 0.25s;
      }

      .footer-link:hover {
        color: hsl(var(--primary));
        transform: translateX(4px);
      }

      .footer-link:hover .footer-link-dot {
        background: hsl(var(--primary));
        box-shadow: 0 0 6px hsl(var(--primary) / 0.5);
      }

      /* Contact items */
      .contact-item {
        display: flex;
        align-items: flex-start;
        gap: 12px;
        margin-bottom: 14px;
        text-decoration: none;
        transition: all 0.25s;
      }

      .contact-icon-box {
        width: 36px;
        height: 36px;
        border-radius: 10px;
        background: hsl(var(--primary) / 0.07);
        border: 1px solid hsl(var(--border) / 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        color: hsl(var(--primary));
        flex-shrink: 0;
        transition: all 0.25s;
      }

      .contact-item:hover .contact-icon-box {
        background: hsl(var(--primary) / 0.15);
        box-shadow: 0 0 12px hsl(var(--primary) / 0.2);
      }

      .contact-value {
        font-size: 13.5px;
        color: hsl(var(--muted-foreground));
        line-height: 1.5;
        padding-top: 8px;
        font-family: 'DM Sans', sans-serif;
        transition: color 0.25s;
      }

      .contact-item:hover .contact-value { color: hsl(var(--foreground)); }

      /* Bottom bar */
      .footer-bottom {
        position: relative;
        z-index: 2;
        max-width: 1280px;
        margin: 0 auto;
        padding: 24px 24px;
        margin-top: 56px;
        border-top: 1px solid hsl(var(--border) / 0.5);
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 14px;
      }

      @media (min-width: 768px) {
        .footer-bottom { flex-direction: row; justify-content: space-between; gap: 0; }
      }

      .footer-copy {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 12.5px;
        color: hsl(var(--muted-foreground));
        font-family: 'DM Sans', sans-serif;
      }

      .footer-legal-links {
        display: flex;
        align-items: center;
        gap: 20px;
      }

      .footer-legal-link {
        font-size: 12.5px;
        color: hsl(var(--muted-foreground));
        text-decoration: none;
        display: flex;
        align-items: center;
        gap: 6px;
        transition: color 0.25s;
        font-family: 'DM Sans', sans-serif;
      }

      .footer-legal-link:hover { color: hsl(var(--primary)); }

      .legal-dot {
        width: 4px;
        height: 4px;
        border-radius: 50%;
        background: hsl(var(--primary) / 0.25);
        flex-shrink: 0;
        transition: background 0.25s;
      }

      .footer-legal-link:hover .legal-dot { background: hsl(var(--primary)); }

      /* Animated bottom bolt */
      .footer-bottom-bolt {
        position: absolute;
        bottom: 0; left: 50%;
        transform: translateX(-50%);
        width: 600px;
        height: 2px;
        background: linear-gradient(90deg, transparent, hsl(var(--primary) / 0.15), transparent);
        pointer-events: none;
      }
    `}</style>

    <footer className="footer-root">
      <div className="footer-grid-bg" />
      <div className="footer-glow-tr" />
      <div className="footer-glow-bl" />

      <div className="footer-inner">
        <div className="footer-grid">
          {/* Brand */}
          <div>
            <Link to="/" className="footer-logo">
              <div className="footer-logo-icon">
                <Zap size={20} color="#0a0f1e" strokeWidth={2.5} />
              </div>
              <span className="footer-logo-text">Electro<span>o</span>buddy</span>
            </Link>
            <p className="footer-brand-desc">
              Your trusted electrical service partner. Professional electricians for all residential and commercial needs with 24/7 support.
            </p>
            <Link to="/booking" className="footer-cta-link">
              Book a Service <ArrowRight size={14} />
            </Link>
          </div>

          {/* Quick Links */}
          <div>
            <div className="footer-col-title">Quick Links</div>
            <ul className="footer-link-list">
              {quickLinks.map((l) => (
                <li key={l.to}>
                  <Link to={l.to} className="footer-link">
                    <span className="footer-link-dot" />
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <div className="footer-col-title">Services</div>
            <ul className="footer-link-list">
              {serviceLinks.map((s) => (
                <li key={s}>
                  <Link to="/services" className="footer-link">
                    <span className="footer-link-dot" />
                    {s}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <div className="footer-col-title">Contact Info</div>

            <div className="contact-item">
              <div className="contact-icon-box">
                <MapPin size={16} />
              </div>
              <div className="contact-value">
                123 Electrical Ave, Tech City, India 400001
              </div>
            </div>

            <a href={`tel:${PHONE_NUMBER}`} className="contact-item" style={{ textDecoration: 'none' }}>
              <div className="contact-icon-box">
                <Phone size={16} />
              </div>
              <div className="contact-value">
                {PHONE_NUMBER}
              </div>
            </a>

            <a href="mailto:hello@electroobuddy.com" className="contact-item" style={{ textDecoration: 'none' }}>
              <div className="contact-icon-box">
                <Mail size={16} />
              </div>
              <div className="contact-value">
                hello@electroobuddy.com
              </div>
            </a>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="footer-bottom">
        <div className="footer-copy">
          <Zap size={13} color="#ffc800" />
          &copy; {new Date().getFullYear()} Electroobuddy. All rights reserved.
        </div>
        <div className="footer-legal-links">
          <Link to="/privacy" className="footer-legal-link">
            <span className="legal-dot" />
            Privacy Policy
          </Link>
          <Link to="/terms" className="footer-legal-link">
            <span className="legal-dot" />
            Terms & Conditions
          </Link>
        </div>
        <div className="footer-bottom-bolt" />
      </div>
    </footer>
  </>
);

export default Footer;