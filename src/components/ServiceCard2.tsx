import { Phone, MessageCircle, ArrowRight, ChevronRight } from "lucide-react";
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
  service_charge?: number | string | null;
  show_visit_charge?: boolean;
  visit_charge_label?: string;
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

  // Format charge display
  const showCharge = isDbService && service?.show_visit_charge && service?.service_charge;
  const chargeAmount = showCharge ? Number(service.service_charge) : null;
  const chargeLabel = showCharge ? (service.visit_charge_label || "Visit Charge") : null;

  return (
    <div
      className={clsx(
        "bg-white dark:bg-gray-700",
        "rounded-xl shadow-md overflow-hidden",
        "transition-all duration-300",
        "h-full"
      )}
    >
      <div className="p-6">
        {/* Top Content */}
        <div className="flex items-center mb-4">
          <div className="flex-shrink-0 bg-blue-100 dark:bg-blue-900 p-3 rounded-lg">
            <Icon className="text-blue-600 dark:text-blue-400 text-2xl" />
          </div>
          <h3 className="ml-4 text-xl font-semibold text-gray-900 dark:text-white">
            {title}
          </h3>
        </div>

        <p className="text-gray-600 dark:text-gray-300">
          {description}
        </p>

        {/* Charge Display */}
        {showCharge && chargeAmount && chargeLabel && (
          <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-yellow-800 dark:text-yellow-300">{chargeLabel}</span>
              <span className="text-lg font-bold text-yellow-900 dark:text-yellow-200">₹{chargeAmount}</span>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3">
          {/* Book Now */}
          {(isDbService ? service.book_now_enabled !== false : true) && (
            <button
              onClick={handleBookClick}
              className="text-blue-600 dark:text-blue-400 hover:text-blue-800 font-medium inline-flex items-center transition"
            >
              Book Now <ChevronRight size={16} className="ml-1" />
            </button>
          )}

          {/* WhatsApp */}
          {(isDbService ? service.whatsapp_enabled !== false : true) && (
            <a
              href={`https://wa.me/91${PHONE_NUMBER}?text=Hi, I'm interested in ${title}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:text-blue-800 font-medium inline-flex items-center transition"
            >
              WhatsApp <ChevronRight size={16} className="ml-1" />
            </a>
          )}

          {/* Call */}
          {(isDbService ? service.call_enabled !== false : true) && (
            <a
              href={`tel:${PHONE_NUMBER}`}
              className="text-blue-600 dark:text-blue-400 hover:text-blue-800 font-medium inline-flex items-center transition"
            >
              Call <ChevronRight size={16} className="ml-1" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default ServiceCard2;