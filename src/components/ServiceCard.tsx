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
    <div className="group bg-card border border-border rounded-xl p-6 hover-lift flex flex-col">
      <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-secondary/20 transition-colors">
        <Icon className="w-7 h-7 text-primary" />
      </div>
      <h3 className="text-lg font-heading font-bold text-foreground mb-2">{service.title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed mb-5 flex-1">{service.description}</p>
      <div className="flex flex-wrap gap-2">
        {service.whatsapp_enabled && (
          <a
            href={`https://wa.me/${settings.whatsapp}?text=${whatsappMsg}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg bg-[hsl(142,70%,45%)]/10 text-[hsl(142,70%,35%)] hover:bg-[hsl(142,70%,45%)]/20 transition-colors"
          >
            <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
          </a>
        )}
        {service.call_enabled && (
          <a
            href={`tel:${settings.phone}`}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
          >
            <Phone className="w-3.5 h-3.5" /> Call
          </a>
        )}
        {service.book_now_enabled && (
          <Link
            to={`/booking?service=${encodeURIComponent(service.title)}`}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg bg-secondary/20 text-secondary-foreground hover:bg-secondary/30 transition-colors"
          >
            <CalendarDays className="w-3.5 h-3.5" /> Book Now
          </Link>
        )}
      </div>
    </div>
  );
};

export default ServiceCard;
