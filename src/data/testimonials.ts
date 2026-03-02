export interface Testimonial {
  id: string;
  name: string;
  rating: number;
  text: string;
  service: string;
}

export const testimonials: Testimonial[] = [
  { id: "1", name: "Ananya M.", rating: 5, text: "Electroobuddy fixed our entire wiring system in just one day. Professional, punctual, and affordable!", service: "Wiring & Maintenance" },
  { id: "2", name: "Suresh R.", rating: 5, text: "Amazing service! They installed all our smart home devices perfectly. Highly recommended.", service: "Device Installation" },
  { id: "3", name: "Meera K.", rating: 4, text: "Quick response time and very knowledgeable team. They diagnosed our electrical issue within minutes.", service: "Home Troubleshooting" },
  { id: "4", name: "Deepak J.", rating: 5, text: "The safety inspection was thorough and they provided a detailed report. Feel much safer now.", service: "Safety Inspection" },
];
