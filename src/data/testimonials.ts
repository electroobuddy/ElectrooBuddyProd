import testimonial1 from "@/images/testimonial-1.jpg";
import testimonial2 from "@/images/testimonial-2.jpg";
import testimonial3 from "@/images/testimonial-3.jpg";
import testimonial4 from "@/images/no-profile.png";
import testimonial5 from "@/images/no-profile.png";

export interface Testimonial {
  id?: string;
  image?:string;
  name?: string;
  rating?: number;
  text: string;
  service?: string;
  location?: string;
}

export const testimonials: Testimonial[] = [
    { name: 'Kunal Yadav', location: 'Ujjain', image: testimonial1, rating: 5, text: 'ElectrooBuddy fixed my AC within an hour of calling them. The technician was professional and explained everything clearly.' },
    { name: 'Naman Singh', location: 'Ujjain', image: testimonial2, rating: 5, text: 'I called ElectrooBuddy for an emergency electrical issue at midnight. They arrived in 30 minutes and fixed the problem safely.' },
    { name: 'Udit Joshi', location: 'Ujjain', image: testimonial3, rating: 5, text: 'Their team installed my new 65-inch TV perfectly on the wall. They handled everything from unpacking to cable management.' },
    { name: 'Anjali Verma', location: 'Ujjain', image: testimonial4, rating: 5, text: 'The technician arrived exactly on time and fixed our refrigerator quickly. Very reasonable pricing compared to other services.' },
    { name: 'Rajesh Gupta', location: 'Ujjain', image: testimonial5, rating: 5, text: 'I\'ve used ElectrooBuddy multiple times for different appliances. Always professional, and their work comes with a warranty.' }
  ];