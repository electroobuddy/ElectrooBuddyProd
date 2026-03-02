import { Zap, Plug, Wrench, Cable, Home, ShieldCheck, Lightbulb, BatteryCharging } from "lucide-react";

export interface Service {
  id: string;
  title: string;
  description: string;
  icon: any;
  image: string;
  whatsappEnabled: boolean;
  callEnabled: boolean;
  bookNowEnabled: boolean;
}

export const services: Service[] = [
  {
    id: "electrical-servicing",
    title: "Electrical Servicing",
    description: "Comprehensive electrical maintenance and servicing for residential and commercial properties. Regular inspections to keep your systems running safely.",
    icon: Zap,
    image: "",
    whatsappEnabled: true,
    callEnabled: true,
    bookNowEnabled: true,
  },
  {
    id: "device-installation",
    title: "Device Installation",
    description: "Professional installation of all electronic devices including fans, lights, air conditioners, water heaters, and smart home systems.",
    icon: Plug,
    image: "",
    whatsappEnabled: true,
    callEnabled: true,
    bookNowEnabled: true,
  },
  {
    id: "equipment-repair",
    title: "Equipment Repair",
    description: "Expert diagnosis and repair of faulty electrical equipment. We fix it right the first time with quality parts and workmanship.",
    icon: Wrench,
    image: "",
    whatsappEnabled: true,
    callEnabled: true,
    bookNowEnabled: true,
  },
  {
    id: "wiring-maintenance",
    title: "Wiring & Maintenance",
    description: "Complete wiring solutions for new builds and renovations. Safe, code-compliant installations with durable materials.",
    icon: Cable,
    image: "",
    whatsappEnabled: true,
    callEnabled: true,
    bookNowEnabled: true,
  },
  {
    id: "home-troubleshooting",
    title: "Home Troubleshooting",
    description: "Quick diagnosis of electrical problems in your home. From tripping breakers to flickering lights, we find and fix the issue.",
    icon: Home,
    image: "",
    whatsappEnabled: true,
    callEnabled: true,
    bookNowEnabled: true,
  },
  {
    id: "safety-inspection",
    title: "Safety Inspection",
    description: "Thorough electrical safety audits to identify hazards and ensure compliance with local regulations and standards.",
    icon: ShieldCheck,
    image: "",
    whatsappEnabled: true,
    callEnabled: true,
    bookNowEnabled: true,
  },
  {
    id: "lighting-solutions",
    title: "Lighting Solutions",
    description: "Design and installation of modern lighting systems. Energy-efficient LED upgrades, accent lighting, and outdoor illumination.",
    icon: Lightbulb,
    image: "",
    whatsappEnabled: true,
    callEnabled: true,
    bookNowEnabled: true,
  },
  {
    id: "power-backup",
    title: "Power Backup Systems",
    description: "Installation and maintenance of inverters, UPS systems, and generators to keep your power running during outages.",
    icon: BatteryCharging,
    image: "",
    whatsappEnabled: true,
    callEnabled: true,
    bookNowEnabled: true,
  },
];

export const PHONE_NUMBER = "+911234567890";
export const WHATSAPP_NUMBER = "911234567890";
