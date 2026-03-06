import { motion } from "framer-motion";
import { ReactNode } from "react";

interface SectionProps {
  children: ReactNode;
  className?: string;
  id?: string;
}

const Section = ({ children, className = "", id }: SectionProps) => (
  <motion.section
    id={id}
    initial={{ opacity: 0, y: 40 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-80px" }}
    transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
    className={`py-20 ${className}`}
    style={{ background: "hsl(var(--background))", fontFamily: "'DM Sans', sans-serif" }}
  >
    <div className="container mx-auto px-4">{children}</div>
  </motion.section>
);

export default Section;