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
    <div className="group relative bg-card border border-border rounded-2xl p-7 hover-lift hover-glow flex flex-col overflow-hidden">
      {/* Subtle gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl" />

      <div className="relative z-10">
        <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-5 group-hover:bg-primary group-hover:scale-110 transition-all duration-500">
          <Icon className="w-7 h-7 text-primary group-hover:text-primary-foreground transition-colors duration-500" />
        </div>
        <h3 className="text-lg font-heading font-bold text-foreground mb-2">{service.title}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed mb-6 flex-1">{service.description}</p>
        <div className="flex flex-wrap gap-2">
          {service.whatsapp_enabled && (
            <a
              href={`https://wa.me/${settings.whatsapp}?text=${whatsappMsg}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 transition-colors"
            >
              <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
            </a>
          )}
          {service.call_enabled && (
            <a
              href={`tel:${settings.phone}`}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
            >
              <Phone className="w-3.5 h-3.5" /> Call
            </a>
          )}
          {service.book_now_enabled && (
            <Link
              to={`/booking?service=${encodeURIComponent(service.title)}`}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-lg bg-secondary/15 text-secondary-foreground hover:bg-secondary/25 transition-colors"
            >
              <CalendarDays className="w-3.5 h-3.5" /> Book Now
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default ServiceCard;
