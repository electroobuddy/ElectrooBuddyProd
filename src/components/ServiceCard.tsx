import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { type Service as StaticService, WHATSAPP_NUMBER, PHONE_NUMBER } from "@/data/services";
import { Phone, MessageCircle, CalendarDays } from "lucide-react";
import { Link } from "react-router-dom";
import * as LucideIcons from "lucide-react";

interface DbService {
  id: string;
  title: string;
  description: string;
  icon_name: string;
  image_url?: string | null;
  whatsapp_enabled: boolean;
  call_enabled: boolean;
  book_now_enabled: boolean;
}

const ServiceCard = ({ service }: { service: DbService }) => {
  const [settings, setSettings] = useState({ whatsapp: WHATSAPP_NUMBER, phone: PHONE_NUMBER });

  useEffect(() => {
    supabase.from("site_settings").select("*").then(({ data }) => {
      if (data) {
        const phone = data.find((s: any) => s.key === "phone_number")?.value || PHONE_NUMBER;
        const wa = data.find((s: any) => s.key === "whatsapp_number")?.value || WHATSAPP_NUMBER;
        setSettings({ whatsapp: wa, phone });
      }
    });
  }, []);

  const Icon = (LucideIcons as any)[service.icon_name] || LucideIcons.Zap;
  const whatsappMsg = encodeURIComponent(
    `Hello Electroobuddy, I would like to book the service: ${service.title}. Please provide details.`
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700;800&family=DM+Sans:wght@400;500&display=swap');

        .service-card {
          position: relative;
          background: hsl(var(--card));
          border: 1px solid hsl(var(--border) / 0.3);
          border-radius: 20px;
          padding: 32px 28px 28px;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          transition: all 0.4s cubic-bezier(0.23, 1, 0.32, 1);
          cursor: default;
          font-family: 'DM Sans', sans-serif;
        }

        .service-card::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 20px;
          background: radial-gradient(ellipse at 20% 0%, hsl(var(--primary) / 0.08) 0%, transparent 60%),
                      radial-gradient(ellipse at 80% 100%, hsl(var(--secondary) / 0.06) 0%, transparent 60%);
          opacity: 0;
          transition: opacity 0.5s ease;
        }

        .service-card::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 2px;
          background: linear-gradient(90deg, transparent, hsl(var(--primary)), transparent);
          opacity: 0;
          transition: opacity 0.4s ease;
        }

        .service-card:hover {
          transform: translateY(-6px);
          border-color: hsl(var(--border) / 0.5);
          box-shadow:
            0 0 0 1px hsl(var(--primary) / 0.1),
            0 20px 60px hsl(var(--foreground) / 0.1),
            0 0 40px hsl(var(--primary) / 0.08);
        }

        .service-card:hover::before { opacity: 1; }
        .service-card:hover::after { opacity: 1; }

        .card-noise {
          position: absolute;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E");
          border-radius: 20px;
          pointer-events: none;
          opacity: 0.4;
        }

        .card-bolt-bg {
          position: absolute;
          top: -10px;
          right: -10px;
          width: 120px;
          height: 120px;
          opacity: 0.04;
          transition: opacity 0.4s ease, transform 0.4s ease;
        }

        .service-card:hover .card-bolt-bg {
          opacity: 0.09;
          transform: rotate(10deg) scale(1.1);
        }

        .icon-shell {
          position: relative;
          width: 60px;
          height: 60px;
          margin-bottom: 22px;
          flex-shrink: 0;
        }

        .icon-hex {
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, hsl(var(--primary) / 0.15), hsl(var(--primary) / 0.05));
          clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
          transition: all 0.5s ease;
        }

        .service-card:hover .icon-hex {
          background: linear-gradient(135deg, hsl(var(--primary)), hsl(var(--electric-blue-dark)));
        }

        .icon-inner {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.5s cubic-bezier(0.23, 1, 0.32, 1);
        }

        .service-card:hover .icon-inner {
          transform: scale(1.1);
        }

        .icon-svg {
          width: 26px;
          height: 26px;
          color: hsl(var(--secondary));
          transition: color 0.4s ease;
        }

        .service-card:hover .icon-svg {
          color: hsl(var(--card-foreground));
          filter: drop-shadow(0 0 4px hsl(var(--foreground) / 0.3));
        }

        .service-title {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 22px;
          font-weight: 700;
          color: hsl(var(--foreground));
          margin-bottom: 10px;
          letter-spacing: 0.3px;
          text-transform: uppercase;
          line-height: 1.1;
        }

        .service-desc {
          font-size: 13.5px;
          color: hsl(var(--muted-foreground) / 0.7);
          line-height: 1.65;
          margin-bottom: 24px;
          flex: 1;
        }

        .divider {
          height: 1px;
          background: linear-gradient(90deg, hsl(var(--primary) / 0.3), transparent);
          margin-bottom: 18px;
        }

        .cta-row {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .cta-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 8px 14px;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 600;
          font-family: 'DM Sans', sans-serif;
          letter-spacing: 0.3px;
          text-decoration: none;
          transition: all 0.25s ease;
          border: 1px solid transparent;
          position: relative;
          overflow: hidden;
        }

        .cta-btn::before {
          content: '';
          position: absolute;
          inset: 0;
          opacity: 0;
          transition: opacity 0.25s;
          background: rgba(255,255,255,0.06);
        }

        .cta-btn:hover::before { opacity: 1; }
        .cta-btn:hover { transform: translateY(-1px); }

        .cta-wa {
          background: hsl(var(--success) / 0.1);
          color: hsl(var(--success));
          border-color: hsl(var(--success) / 0.25);
        }
        .cta-wa:hover {
          background: hsl(var(--success) / 0.2);
          border-color: hsl(var(--success) / 0.5);
          box-shadow: 0 0 12px hsl(var(--success) / 0.2);
        }

        .cta-call {
          background: hsl(var(--primary) / 0.1);
          color: hsl(var(--secondary));
          border-color: hsl(var(--primary) / 0.25);
        }
        .cta-call:hover {
          background: hsl(var(--primary) / 0.2);
          border-color: hsl(var(--primary) / 0.5);
          box-shadow: 0 0 12px hsl(var(--primary) / 0.2);
        }

        .cta-book {
          background: hsl(var(--info) / 0.12);
          color: hsl(var(--info));
          border-color: hsl(var(--info) / 0.25);
        }
        .cta-book:hover {
          background: hsl(var(--info) / 0.22);
          border-color: hsl(var(--info) / 0.5);
          box-shadow: 0 0 12px hsl(var(--info) / 0.2);
        }
      `}</style>

      <div className="service-card">
        <div className="card-noise" />

        {/* Decorative bolt background */}
        <svg className="card-bolt-bg" viewBox="0 0 100 100" fill="none">
          <path d="M60 5L20 55h30L35 95l45-55H50L60 5z" fill="#ffc800" />
        </svg>

        <div className="icon-shell">
          <div className="icon-hex" />
          <div className="icon-inner">
            <Icon className="icon-svg" />
          </div>
        </div>

        <div className="service-title">{service.title}</div>
        <p className="service-desc">{service.description}</p>

        <div className="divider" />

        <div className="cta-row">
          {service.whatsapp_enabled && (
            <a
              href={`https://wa.me/${settings.whatsapp}?text=${whatsappMsg}`}
              target="_blank"
              rel="noopener noreferrer"
              className="cta-btn cta-wa"
            >
              <MessageCircle size={13} /> WhatsApp
            </a>
          )}
          {service.call_enabled && (
            <a href={`tel:${settings.phone}`} className="cta-btn cta-call">
              <Phone size={13} /> Call Now
            </a>
          )}
          {service.book_now_enabled && (
            <Link
              to={`/booking?service=${encodeURIComponent(service.title)}`}
              className="cta-btn cta-book"
            >
              <CalendarDays size={13} /> Book Now
            </Link>
          )}
        </div>
      </div>
    </>
  );
};

export default ServiceCard;