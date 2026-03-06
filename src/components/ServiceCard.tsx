// import { useEffect, useState } from "react";
// import { supabase } from "@/integrations/supabase/client";
// import { type Service as StaticService, WHATSAPP_NUMBER, PHONE_NUMBER } from "@/data/services";
// import { Phone, MessageCircle, CalendarDays } from "lucide-react";
// import { Link } from "react-router-dom";
// import * as LucideIcons from "lucide-react";

// interface DbService {
//   id: string;
//   title: string;
//   description: string;
//   icon_name: string;
//   whatsapp_enabled: boolean;
//   call_enabled: boolean;
//   book_now_enabled: boolean;
// }

// const ServiceCard = ({ service }: { service: DbService }) => {
//   const [settings, setSettings] = useState({ whatsapp: WHATSAPP_NUMBER, phone: PHONE_NUMBER });

//   useEffect(() => {
//     supabase.from("site_settings").select("*").then(({ data }) => {
//       if (data) {
//         const phone = data.find((s: any) => s.key === "phone_number")?.value || PHONE_NUMBER;
//         const wa = data.find((s: any) => s.key === "whatsapp_number")?.value || WHATSAPP_NUMBER;
//         setSettings({ whatsapp: wa, phone });
//       }
//     });
//   }, []);

//   const Icon = (LucideIcons as any)[service.icon_name] || LucideIcons.Zap;
//   const whatsappMsg = encodeURIComponent(
//     `Hello Electroobuddy, I would like to book the service: ${service.title}. Please provide details.`
//   );

//   return (
//     <div className="group relative bg-card border-2 border-border/50 rounded-2xl p-8 hover-lift hover-glow-premium flex flex-col overflow-hidden shadow-lg shadow-foreground/5">
//       {/* Animated gradient border on hover */}
//       <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-secondary/5 to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl" />
      
//       {/* Corner accent */}
//       <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-tr-2xl" />

//       <div className="relative z-10 flex flex-col h-full">
//         {/* Enhanced icon container */}
//         <div className="relative mb-6">
//           <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/15 to-secondary/15 flex items-center justify-center group-hover:scale-110 group-hover:from-primary group-hover:to-electric-blue-dark transition-all duration-500 shadow-lg shadow-primary/15 group-hover:shadow-xl group-hover:shadow-primary/30">
//             <Icon className="w-8 h-8 text-primary group-hover:text-primary-foreground transition-colors duration-500" />
//           </div>
//           {/* Decorative ring */}
//           <div className="absolute inset-0 rounded-2xl border-2 border-primary/20 scale-110 opacity-0 group-hover:scale-125 group-hover:opacity-100 transition-all duration-500" />
//         </div>
        
//         {/* Service title */}
//         <h3 className="text-xl font-heading font-bold text-foreground mb-3 tracking-tight">{service.title}</h3>
        
//         {/* Service description */}
//         <p className="text-base text-muted-foreground leading-relaxed mb-6 flex-1">{service.description}</p>
        
//         {/* Action buttons with better hierarchy */}
//         <div className="flex flex-wrap gap-2.5 pt-4 border-t border-border/50">
//           {service.whatsapp_enabled && (
//             <a
//               href={`https://wa.me/${settings.whatsapp}?text=${whatsappMsg}`}
//               target="_blank"
//               rel="noopener noreferrer"
//               className="flex-1 min-w-[120px] flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:shadow-lg hover:shadow-emerald-500/30 hover:-translate-y-0.5 transition-all duration-300"
//             >
//               <MessageCircle className="w-4 h-4" /> 
//               <span>WhatsApp</span>
//             </a>
//           )}
//           {service.call_enabled && (
//             <a
//               href={`tel:${settings.phone}`}
//               className="flex-1 min-w-[120px] flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-xl bg-gradient-to-r from-primary to-electric-blue-dark text-primary-foreground hover:shadow-lg hover:shadow-primary/30 hover:-translate-y-0.5 transition-all duration-300"
//             >
//               <Phone className="w-4 h-4" /> 
//               <span>Call</span>
//             </a>
//           )}
//           {service.book_now_enabled && (
//             <Link
//               to={`/booking?service=${encodeURIComponent(service.title)}`}
//               className="flex-1 min-w-[120px] flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-xl bg-gradient-to-r from-secondary/90 to-secondary text-secondary-foreground hover:shadow-lg hover:shadow-secondary/30 hover:-translate-y-0.5 transition-all duration-300"
//             >
//               <CalendarDays className="w-4 h-4" /> 
//               <span>Book Now</span>
//             </Link>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ServiceCard;

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
          background: #0a0f1e;
          border: 1px solid rgba(255, 200, 0, 0.15);
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
          background: radial-gradient(ellipse at 20% 0%, rgba(255, 200, 0, 0.08) 0%, transparent 60%),
                      radial-gradient(ellipse at 80% 100%, rgba(59, 130, 246, 0.06) 0%, transparent 60%);
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
          background: linear-gradient(90deg, transparent, #ffc800, transparent);
          opacity: 0;
          transition: opacity 0.4s ease;
        }

        .service-card:hover {
          transform: translateY(-6px);
          border-color: rgba(255, 200, 0, 0.45);
          box-shadow:
            0 0 0 1px rgba(255, 200, 0, 0.1),
            0 20px 60px rgba(0, 0, 0, 0.5),
            0 0 40px rgba(255, 200, 0, 0.08);
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
          background: linear-gradient(135deg, rgba(255, 200, 0, 0.15), rgba(255, 200, 0, 0.05));
          clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
          transition: all 0.5s ease;
        }

        .service-card:hover .icon-hex {
          background: linear-gradient(135deg, rgba(255, 200, 0, 0.9), rgba(255, 160, 0, 0.8));
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
          color: #ffc800;
          transition: color 0.4s ease;
        }

        .service-card:hover .icon-svg {
          color: #0a0f1e;
          filter: drop-shadow(0 0 4px rgba(0,0,0,0.3));
        }

        .service-title {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 22px;
          font-weight: 700;
          color: #f0f4ff;
          margin-bottom: 10px;
          letter-spacing: 0.3px;
          text-transform: uppercase;
          line-height: 1.1;
        }

        .service-desc {
          font-size: 13.5px;
          color: rgba(180, 195, 230, 0.7);
          line-height: 1.65;
          margin-bottom: 24px;
          flex: 1;
        }

        .divider {
          height: 1px;
          background: linear-gradient(90deg, rgba(255,200,0,0.3), transparent);
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
          background: rgba(16, 185, 129, 0.1);
          color: #34d399;
          border-color: rgba(52, 211, 153, 0.25);
        }
        .cta-wa:hover {
          background: rgba(16, 185, 129, 0.2);
          border-color: rgba(52, 211, 153, 0.5);
          box-shadow: 0 0 12px rgba(52, 211, 153, 0.2);
        }

        .cta-call {
          background: rgba(255, 200, 0, 0.1);
          color: #ffc800;
          border-color: rgba(255, 200, 0, 0.25);
        }
        .cta-call:hover {
          background: rgba(255, 200, 0, 0.2);
          border-color: rgba(255, 200, 0, 0.5);
          box-shadow: 0 0 12px rgba(255, 200, 0, 0.2);
        }

        .cta-book {
          background: rgba(99, 102, 241, 0.12);
          color: #a5b4fc;
          border-color: rgba(99, 102, 241, 0.25);
        }
        .cta-book:hover {
          background: rgba(99, 102, 241, 0.22);
          border-color: rgba(99, 102, 241, 0.5);
          box-shadow: 0 0 12px rgba(99, 102, 241, 0.2);
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