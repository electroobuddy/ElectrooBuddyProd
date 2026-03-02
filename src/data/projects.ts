export interface Project {
  id: string;
  title: string;
  description: string;
  category: string;
}

export const projects: Project[] = [
  { id: "1", title: "Modern Office Wiring", description: "Complete electrical overhaul of a 5000 sq ft office space with smart lighting controls.", category: "Commercial" },
  { id: "2", title: "Residential Smart Home", description: "Full smart home automation including lighting, HVAC control, and security systems.", category: "Residential" },
  { id: "3", title: "Industrial Panel Upgrade", description: "Upgraded main electrical panels for a manufacturing unit to handle increased power loads.", category: "Industrial" },
  { id: "4", title: "Restaurant Lighting Design", description: "Custom ambient lighting design and installation for a fine dining restaurant.", category: "Commercial" },
  { id: "5", title: "Villa Power Backup", description: "Installed seamless power backup system with automatic changeover for a luxury villa.", category: "Residential" },
  { id: "6", title: "Warehouse LED Retrofit", description: "Replaced all conventional lighting with energy-efficient LED systems, reducing power costs by 60%.", category: "Industrial" },
];

export const projectCategories = ["All", "Residential", "Commercial", "Industrial"];
