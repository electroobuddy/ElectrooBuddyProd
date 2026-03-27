import { Phone, MessageCircle, ArrowRight } from "lucide-react";
import { PHONE_NUMBER } from "@/data/services";
import * as LucideIcons from "lucide-react";

interface DbService {
  id: string;
  title: string;
  description: string;
  icon_name?: string;
  image_url?: string | null;
  whatsapp_enabled?: boolean;
  call_enabled?: boolean;
  book_now_enabled?: boolean;
}

interface StaticService {
  icon: React.ElementType;
  title: string;
  description: string;
}

type ServiceType = DbService | StaticService;

interface ServiceCard2Props {
  service?: DbService;
  icon?: React.ElementType;
  title?: string;
  description?: string;
  onBookNow?: (title: string) => void;
}

const ServiceCard2 = ({ service, icon: IconProp, title: titleProp, description: descriptionProp, onBookNow }: ServiceCard2Props) => {
  // Determine if we're using database service or static service
  const isDbService = service && 'id' in service;
  
  const title = isDbService ? service.title : titleProp;
  const description = isDbService ? service.description : descriptionProp;
  let Icon;
  if (isDbService) {
    const dbService = service as DbService;
    Icon = dbService.icon_name ? (LucideIcons as any)[dbService.icon_name] || LucideIcons.Zap : LucideIcons.Zap;
  } else {
    Icon = IconProp || LucideIcons.Zap;
  }
  
  const handleBookClick = () => {
    if (onBookNow && title) {
      onBookNow(title);
    }
  };

  if (!title || !description) {
    return null;
  }

  return (
    <div className="service-card bg-white dark:bg-gray-700 rounded-xl shadow-md overflow-hidden transition duration-300">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');

        .service-card {
          font-family: 'Poppins', sans-serif;
        }
      `}</style>
      
      <div className="p-6">
        <div className="flex items-center mb-4">
          <div className="flex-shrink-0 bg-blue-100 dark:bg-blue-900 p-3 rounded-lg">
            <Icon className="text-blue-600 dark:text-blue-400 h-8 w-8" />
          </div>
          <h3 className="ml-4 text-xl font-semibold text-gray-900 dark:text-white">{title}</h3>
        </div>
        <p className="text-gray-600 dark:text-gray-300 mb-4">{description}</p>
        
        {/* Action Buttons */}
        <div className="flex flex-col gap-3">
          <div className="flex gap-2">
            <a 
              href={`tel:${PHONE_NUMBER}`} 
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-lg transition duration-300 font-medium text-sm"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Phone size={16} /> Call Now
            </a>
            <a 
              href={`https://wa.me/91${PHONE_NUMBER}?text=Hi, I'm interested in ${title} service`}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg transition duration-300 font-medium text-sm"
              target="_blank"
              rel="noopener noreferrer"
            >
              <MessageCircle size={16} /> WhatsApp
            </a>
          </div>
          <button 
            onClick={handleBookClick}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition duration-300 font-medium text-sm"
          >
            Book Now <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ServiceCard2;
