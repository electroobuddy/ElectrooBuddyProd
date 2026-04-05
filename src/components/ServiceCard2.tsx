import { Phone, MessageCircle, ArrowRight } from "lucide-react";
import { PHONE_NUMBER } from "@/data/services";
import * as LucideIcons from "lucide-react";
import clsx from "clsx";

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

const ServiceCard2 = ({
  service,
  icon: IconProp,
  title: titleProp,
  description: descriptionProp,
  onBookNow,
}: ServiceCard2Props) => {
  const isDbService = service && "id" in service;

  const title = isDbService ? service.title : titleProp;
  const description = isDbService ? service.description : descriptionProp;

  let Icon;
  if (isDbService) {
    const dbService = service as DbService;
    Icon =
      dbService.icon_name &&
      (LucideIcons as any)[dbService.icon_name]
        ? (LucideIcons as any)[dbService.icon_name]
        : LucideIcons.Zap;
  } else {
    Icon = IconProp || LucideIcons.Zap;
  }

  const handleBookClick = () => {
    if (onBookNow && title) onBookNow(title);
  };

  if (!title || !description) return null;

  return (
    <div
      className={clsx(
        "group flex flex-col justify-between",
        "bg-white dark:bg-gray-800",
        "rounded-2xl shadow-sm hover:shadow-xl",
        "transition-all duration-300",
        "border border-gray-100 dark:border-gray-700",
        "p-4 sm:p-5 lg:p-6",
        "h-full"
      )}
    >
      {/* Top Content */}
      <div>
        <div className="flex items-start gap-3 mb-4">
          <div className="flex-shrink-0 bg-blue-100 dark:bg-blue-900 p-3 rounded-xl">
            <Icon className="text-blue-600 dark:text-blue-400 w-6 h-6 sm:w-7 sm:h-7" />
          </div>

          <h3 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-900 dark:text-white leading-snug line-clamp-2">
            {title}
          </h3>
        </div>

        <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base leading-relaxed line-clamp-3">
          {description}
        </p>
      </div>

      {/* Actions */}
      <div className="mt-5 space-y-2">
        <div className="grid grid-cols-2 gap-2">
          {/* Call */}
          {(isDbService ? service.call_enabled !== false : true) && (
            <a
              href={`tel:${PHONE_NUMBER}`}
              className="flex items-center justify-center gap-2 px-3 py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-green-400"
            >
              <Phone size={16} />
              <span className=" sm:inline">Call</span>
            </a>
          )}

          {/* WhatsApp */}
          {(isDbService ? service.whatsapp_enabled !== false : true) && (
            <a
              href={`https://wa.me/91${PHONE_NUMBER}?text=Hi, I'm interested in ${title}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 px-3 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <MessageCircle size={16} />
              <span className=" sm:inline">WhatsApp</span>
            </a>
          )}
        </div>

        {/* Book */}
        {(isDbService ? service.book_now_enabled !== false : true) && (
          <button
            onClick={handleBookClick}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <span>Book Now</span>
            <ArrowRight size={16} />
          </button>
        )}
      </div>
    </div>
  );
};

export default ServiceCard2;