import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Zap, Loader2, Phone, MessageCircle, Calendar, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { useServices } from "@/hooks/useOptimizedData";
import ServiceCard2 from "@/components/ServiceCard2";
import { services as staticServices } from "@/data/services";

const UserServices = () => {
  const { services: dbServices, loading: servicesLoading } = useServices();
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [preselectedService, setPreselectedService] = useState<string>("");

  // Load services from database or fallback to static
  useEffect(() => {
    if (dbServices && dbServices.length > 0) {
      setServices(dbServices);
    } else {
      setServices(staticServices.map(s => ({
        id: s.title.toLowerCase().replace(/\s+/g, '-'),
        icon_name: getIconNameForService(s.title),
        title: s.title,
        description: s.description,
        whatsapp_enabled: true,
        call_enabled: true,
        book_now_enabled: true
      })));
    }
    setLoading(false);
  }, [dbServices]);

  const getIconNameForService = (title: string): string => {
    const iconMap: Record<string, string> = {
      'DTH': 'SatelliteDish',
      'TV': 'Tv',
      'Short Circuit': 'Zap',
      'Fan': 'Fan',
      'AC': 'Snowflake',
      'Appliance': 'Wrench'
    };
    for (const [key, iconName] of Object.entries(iconMap)) {
      if (title.includes(key)) return iconName;
    }
    return 'Zap';
  };

  const handleBookService = (serviceTitle: string) => {
    setPreselectedService(serviceTitle);
    window.location.href = `/booking?service=${encodeURIComponent(serviceTitle)}`;
  };

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-3xl font-heading font-bold mb-2">Our Services</h1>
        <p className="text-muted-foreground">Professional electrical services tailored to your needs</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : services.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No services available yet. Check back soon!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {services.map((service, index) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08, duration: 0.5 }}
            >
              <ServiceCard2 service={service} onBookNow={handleBookService} />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserServices;
