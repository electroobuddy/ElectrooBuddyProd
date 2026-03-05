import { MessageCircle } from "lucide-react";
import { WHATSAPP_NUMBER } from "@/data/services";
import { motion } from "framer-motion";

const WhatsAppFloat = () => (
  <motion.a
    href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Hello Electroobuddy, I need electrical services. Please provide details.")}`}
    target="_blank"
    rel="noopener noreferrer"
    initial={{ scale: 0 }}
    animate={{ scale: 1 }}
    transition={{ delay: 1, type: "spring", stiffness: 200 }}
    whileHover={{ scale: 1.1 }}
    className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-emerald-500 text-primary-foreground flex items-center justify-center shadow-lg shadow-emerald-500/30"
    aria-label="Chat on WhatsApp"
  >
    <MessageCircle className="w-7 h-7" />
  </motion.a>
);

export default WhatsAppFloat;
