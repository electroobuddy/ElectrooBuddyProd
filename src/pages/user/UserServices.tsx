import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Zap, Loader2, Phone, MessageCircle, Calendar } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

interface Service {
  id: string;
  title: string;
  description: string;
  icon_name: string;
  image_url?: string;
  book_now_enabled: boolean;
  call_enabled: boolean;
  whatsapp_enabled: boolean;
  sort_order: number;
}

const UserServices = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const { data, error } = await supabase
        .from("services")
        .select("*")
        .order("sort_order");

      if (error) throw error;
      setServices(data || []);
    } catch (error) {
      console.error("Error fetching services:", error);
      toast.error("Failed to load services");
    } finally {
      setLoading(false);
    }
  };

  const handleBookNow = (serviceTitle: string) => {
    toast.info(`Booking service: ${serviceTitle}`);
    // Navigate to booking form with service pre-selected
    window.location.href = "/booking";
  };

  const handleCall = () => {
    window.location.href = "tel:+911234567890";
  };

  const handleWhatsApp = (serviceTitle: string) => {
    const message = encodeURIComponent(`Hi, I'm interested in your ${serviceTitle} service`);
    window.open(`https://wa.me/911234567890?text=${message}`, "_blank");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-3xl font-heading font-bold mb-2">Our Services</h1>
        <p className="text-muted-foreground">Professional electrical services tailored to your needs</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((service, index) => (
          <motion.div
            key={service.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-card border border-border rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300"
          >
            {/* Service Image */}
            <div className="aspect-video overflow-hidden bg-muted relative">
              {service.image_url ? (
                <img
                  src={service.image_url}
                  alt={service.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10">
                  <Zap className="w-16 h-16 text-primary opacity-30" />
                </div>
              )}
            </div>

            {/* Service Content */}
            <div className="p-5">
              <h3 className="font-heading font-bold text-xl mb-2">{service.title}</h3>
              <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
                {service.description}
              </p>

              {/* Action Buttons */}
              <div className="flex gap-2 flex-wrap">
                {service.book_now_enabled && (
                  <button
                    onClick={() => handleBookNow(service.title)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
                  >
                    <Calendar className="w-4 h-4" />
                    Book Now
                  </button>
                )}

                {service.call_enabled && (
                  <button
                    onClick={handleCall}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 bg-secondary text-secondary-foreground rounded-lg font-medium hover:bg-secondary/90 transition-colors"
                  >
                    <Phone className="w-4 h-4" />
                    Call
                  </button>
                )}

                {service.whatsapp_enabled && (
                  <button
                    onClick={() => handleWhatsApp(service.title)}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
                  >
                    <MessageCircle className="w-4 h-4" />
                    WhatsApp
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {services.length === 0 && (
        <div className="text-center py-20">
          <Zap className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground text-lg">No services available at the moment</p>
        </div>
      )}
    </div>
  );
};

export default UserServices;
