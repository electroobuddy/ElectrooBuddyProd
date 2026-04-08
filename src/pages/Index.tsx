import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Zap, ArrowRight, Shield, Clock, BadgeDollarSign, HeartHandshake,
  Users, X, Phone, CheckCircle, Loader2, Calendar, MapPin, Wrench,
  AlignLeft, ChevronRight, Star, ShoppingCart, Instagram, Linkedin,
  Mail, ChevronDown, MessageCircle, Award, Smile, ChevronUp,
  SatelliteDish, Tv, Fan, Snowflake, Check, ShoppingBag, Send
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import Section from "@/components/Section";
import ServiceCard from "@/components/ServiceCard";
import ServiceCard2 from "@/components/ServiceCard2";
import ProductCard from "@/components/ProductCard";
import AnimatedCounter, { COUNTER_DATA } from "@/components/AnimatedCounter";
import ProcessTimeline from "@/components/ProcessTimeline";
import VideoSection from "@/components/VideoSection";
import TestimonialSlider from "@/components/TestimonialSlider";
import ProductsSection from "@/components/ProductsSection";
import SEO from "@/components/SEO";
import RequestServiceSection from "@/components/Requestservicesection";
import { services as staticServices } from "@/data/services";
import { teamMembers as staticTeam } from "@/data/team";
import { testimonials as staticTestimonials } from "@/data/testimonials";
import { useServices, useTeamMembers, useTestimonials, useProducts } from "@/hooks/useOptimizedData";
import { PHONE_NUMBER } from "@/data/services";

// Image importss
import heroImage from "@/images/hero.jpg";
import aboutImage from "@/images/about.png";
import testimonial1 from "@/images/testimonial-1.jpg";
import testimonial2 from "@/images/testimonial-2.jpg";
import testimonial3 from "@/images/testimonial-3.jpg";
import testimonial4 from "@/images/no-profile.png";
import testimonial5 from "@/images/no-profile.png";
import portfolio1 from "@/images/portfolio-1.jpg";
import portfolio2 from "@/images/portfolio-2.jpg";
import portfolio3 from "@/images/portfolio-3.jpg";
import portfolio4 from "@/images/portfolio-4.jpg";
import portfolio5 from "@/images/portfolio-5.jpg";
import portfolio6 from "@/images/portfolio-6.jpg";
import team1 from "@/images/team-1.png";
import team2 from "@/images/dilip.jpeg";
import team3 from "@/images/no-profile.png";

export default function Index() {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);
  const [preselectedService, setPreselectedService] = useState<string>("");
  const [contactForm, setContactForm] = useState({ name: "", phone: "", email: "", subject: "", message: "" });
  const [contactSubmitting, setContactSubmitting] = useState(false);
  const [contactDone, setContactDone] = useState(false);
  const { services: dbServices, loading: servicesLoading } = useServices();
  const [services, setServices] = useState<any[]>([]);
  const { products, loading: productsLoading } = useProducts();
  const displayProducts = products.slice(0, 4);

  const counters = useMemo(() => ({
    experience: new Date().getFullYear() - 1992,
    clients: 5000,
    projects: 8000
  }), []);

  const whyChooseUs = [
    { icon: Clock, title: 'Fast Response', accent: '#3b82f6' },
    { icon: Shield, title: 'Trusted Service', accent: '#10b981' },
    { icon: BadgeDollarSign, title: 'Affordable Pricing', accent: '#f59e0b' },
    { icon: HeartHandshake, title: 'Customer First', accent: '#ef4444' }
  ];
  const team = [
    { name: 'Dilip Parihar', role: 'Founder & Chairman', image: team2, description: 'With over 30 years in the industry, Mr. Dilip Parihar built ElectrooBuddy from the ground up with a vision for quality service.' },
    { name: 'Viraj Parihar', role: 'Co-founder & CEO', image: team1, description: 'Mr. Viraj leads the company\'s expansion and digital transformation, bringing modern solutions to traditional services.' },
    { name: 'Karan Parihar', role: 'Co-founder & COO', image: team3, description: 'Mr. Karan oversees daily operations and technician training, ensuring consistent service quality.' }
  ];

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const testimonials = [
    { name: 'Kunal Yadav', location: 'Ujjain', image: testimonial1, rating: 5, text: 'ElectrooBuddy fixed my AC within an hour of calling them. The technician was professional and explained everything clearly.' },
    { name: 'Naman Singh', location: 'Ujjain', image: testimonial2, rating: 5, text: 'I called ElectrooBuddy for an emergency electrical issue at midnight. They arrived in 30 minutes and fixed the problem safely.' },
    { name: 'Udit Joshi', location: 'Ujjain', image: testimonial3, rating: 5, text: 'Their team installed my new 65-inch TV perfectly on the wall. They handled everything from unpacking to cable management.' },
    { name: 'Anjali Verma', location: 'Ujjain', image: testimonial4, rating: 5, text: 'The technician arrived exactly on time and fixed our refrigerator quickly. Very reasonable pricing compared to other services.' },
    { name: 'Rajesh Gupta', location: 'Ujjain', image: testimonial5, rating: 5, text: 'I\'ve used ElectrooBuddy multiple times for different appliances. Always professional, and their work comes with a warranty.' }
  ];

  // const faqs = [
  //   { question: 'How quickly can you respond to service requests?', answer: 'Our average response time is 45 minutes within Ujjain city. For emergency services, we aim to arrive within 30 minutes.' },
  //   { question: 'What are your service charges?', answer: 'We charge a standard diagnostic fee of ₹400 which is waived if you proceed with the repair. Our technicians provide a transparent cost estimate before starting any work.' },
  //   { question: 'Do you offer warranties on repairs?', answer: 'Yes, we offer a 90-day warranty on all repairs and a 1-year warranty on parts we install.' },
  //   { question: 'What payment methods do you accept?', answer: 'We accept cash, UPI payments (PhonePe, Google Pay, Paytm), and credit/debit cards.' },
  //   { question: 'Do you service appliances still under manufacturer warranty?', answer: 'We recommend first contacting the manufacturer for appliances under warranty, as unauthorized repairs may void it. However, we can assist with diagnostics.' }
  // ];
  //   const faqs = [
  //   {
  //     question: 'How quickly can you respond to service requests?',
  //     answer: 'Our average response time is 45 minutes within Ujjain city. For emergency services, we aim to arrive within 30 minutes.'
  //   },
  //   {
  //     question: 'Do you provide late night or emergency services?',
  //     answer: 'Yes, we offer emergency services including late night support. Our technicians are available beyond regular hours for urgent electrical issues.'
  //   },
  //   {
  //     question: 'What are your service charges?',
  //     answer: 'We charge a standard diagnostic fee of ₹400 which is waived if you proceed with the repair. Our technicians provide a transparent cost estimate before starting any work.'
  //   },
  //   {
  //     question: 'Are there extra charges for emergency or night services?',
  //     answer: 'Yes, a small additional fee may apply for late night or emergency visits depending on the time and urgency. All charges are communicated clearly before booking confirmation.'
  //   },
  //   {
  //     question: 'Do you offer warranties on repairs?',
  //     answer: 'Yes, we offer a 90-day warranty on all repairs and a 1-year warranty on parts we install.'
  //   },
  //   {
  //     question: 'What payment methods do you accept?',
  //     answer: 'We accept cash, UPI payments (PhonePe, Google Pay, Paytm), and credit/debit cards.'
  //   },
  //   {
  //     question: 'Can I schedule a service for a specific time?',
  //     answer: 'Yes, you can book services in advance and choose a preferred time slot based on availability.'
  //   },
  //   {
  //     question: 'Do you provide same-day service?',
  //     answer: 'Yes, we offer same-day service for most requests depending on technician availability in your area.'
  //   },
  //   {
  //     question: 'What areas do you currently serve?',
  //     answer: 'We currently serve Ujjain city and nearby areas. Expansion to more cities is coming soon.'
  //   },
  //   {
  //     question: 'Do you service appliances still under manufacturer warranty?',
  //     answer: 'We recommend first contacting the manufacturer for appliances under warranty, as unauthorized repairs may void it. However, we can assist with diagnostics.'
  //   },
  //   {
  //     question: 'Is it safe to book services online?',
  //     answer: 'Yes, our platform is secure and all technicians are verified professionals with proper background checks.'
  //   },
  //   {
  //     question: 'What if I am not satisfied with the service?',
  //     answer: 'Customer satisfaction is our priority. You can contact our support team and we will resolve your issue or arrange a revisit if needed.'
  //   }
  // ];
  const faqs = [
    {
      question: 'How quickly can you respond to service requests?',
      answer: 'Our average response time is 45 minutes within Ujjain city. For emergency services, we aim to arrive within 30 minutes.'
    },
    {
      question: 'Do you provide late night or emergency services?',
      answer: 'Yes, we offer both emergency and late night services to handle urgent electrical issues anytime you need.'
    },
    {
      question: 'Are there extra charges for emergency or night services?',
      answer: 'Yes, emergency service charges are ₹350 and late night service charges are ₹500. These are fixed additional fees and will be clearly shown before booking.'
    },
    {
      question: 'What are your service charges?',
      answer: 'We charge a standard diagnostic fee of ₹400 which is waived if you proceed with the repair. Our technicians provide a transparent cost estimate before starting any work.'
    },
    {
      question: 'Do you offer warranties on repairs?',
      answer: 'Yes, we offer a 90-day warranty on all repairs and a 1-year warranty on parts we install.'
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept cash, UPI payments (PhonePe, Google Pay, Paytm), and credit/debit cards.'
    },
    {
      question: 'Can I schedule a service for a specific time?',
      answer: 'Yes, you can book services in advance and choose a preferred time slot based on availability.'
    },
    {
      question: 'Do you provide same-day service?',
      answer: 'Yes, we offer same-day service for most requests depending on technician availability in your area.'
    },
    {
      question: 'What areas do you currently serve?',
      answer: 'We currently serve Ujjain city and nearby areas. Expansion to more cities is coming soon.'
    },
    {
      question: 'Do you service appliances still under manufacturer warranty?',
      answer: 'We recommend first contacting the manufacturer for appliances under warranty, as unauthorized repairs may void it. However, we can assist with diagnostics.'
    },
    {
      question: 'Is it safe to book services online?',
      answer: 'Yes, our platform is secure and all technicians are verified professionals with proper background checks.'
    },
    {
      question: 'What if I am not satisfied with the service?',
      answer: 'Customer satisfaction is our priority. You can contact our support team and we will resolve your issue or arrange a revisit if needed.'
    }
  ];

  const applianceTips = [
    {
      icon: 'fa-wind',
      bgIcon: 'fa-snowflake',
      label: 'Air conditioner maintenance tips',
      title: '5 Essential AC Maintenance Tips',
      description: 'Keep your air conditioner running efficiently and extend its lifespan with these simple maintenance tips.',
      color: 'text-blue-600 dark:text-blue-400'
    },
    {
      icon: 'fa-thermometer-half',
      bgIcon: 'fa-tint',
      label: 'Refrigerator energy saving tips',
      title: 'How to Reduce Your Refrigerator\'s Energy Consumption',
      description: 'Simple adjustments can significantly lower your electricity bill while keeping your food fresh.',
      color: 'text-blue-600 dark:text-blue-400'
    },
    {
      icon: 'fa-shield-alt',
      bgIcon: 'fa-home',
      label: 'Home electrical safety tips',
      title: 'Electrical Safety Tips Every Homeowner Should Know',
      description: 'Protect your home and family from electrical hazards with these important safety measures.',
      color: 'text-blue-600 dark:text-blue-400'
    }
  ];

  const nextTestimonial = () => {
    setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const toggleFAQ = (index: number) => {
    setOpenFAQ(openFAQ === index ? null : index);
  };

  const handleBookService = (serviceTitle: string) => {
    setPreselectedService(serviceTitle);
    scrollToSection('request-service');
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setContactSubmitting(true);

    const { error } = await supabase.from("contact_messages").insert({
      name: contactForm.name,
      phone: contactForm.phone,
      email: contactForm.email,
      service: contactForm.subject || null,
      message: contactForm.message,
    });

    if (error) {
      toast.error("Failed to send message. Please try again.");
    } else {
      setContactDone(true);
      toast.success("Message sent! We'll get back to you shortly.");
      setContactForm({ name: "", phone: "", email: "", subject: "", message: "" });
    }
    setContactSubmitting(false);
  };

  // Load services from database or fallback to static
  useEffect(() => {
    if (dbServices && dbServices.length > 0) {
      setServices(dbServices);
    } else {
      setServices(staticServices.map(s => ({
        id: s.title.toLowerCase().replace(/\s+/g, '-'),
        icon_name: getIconNameForService(s.title),
        title: s.title,
        description: s.description,
        whatsapp_enabled: true,
        call_enabled: true,
        book_now_enabled: true
      })));
    }
  }, [dbServices]);

  const getIconNameForService = (title: string): string => {
    const iconMap: Record<string, string> = {
      'DTH': 'SatelliteDish',
      'TV': 'Tv',
      'Short Circuit': 'Zap',
      'Fan': 'Fan',
      'AC': 'Snowflake',
      'Appliance': 'Wrench'
    };
    for (const [key, iconName] of Object.entries(iconMap)) {
      if (title.includes(key)) return iconName;
    }
    return 'Zap';
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen index-page">
      <style>{`
  @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&family=Playfair+Display:wght@700;800&family=Inter:wght@400;500;600&display=swap');

  .index-page {
    font-family: 'Poppins', sans-serif;
  }

  /* Keep all headings as Poppins except hero */
  .index-page h1,
  .index-page h2,
  .index-page h3,
  .index-page h4,
  .index-page h5,
  .index-page h6 {
    font-family: 'Poppins', sans-serif;
    font-weight: 700;
  }

  /* Hero-only overrides */
  .hero-headline {
    font-family: 'Playfair Display', serif;
    font-weight: 800;
    line-height: 1.15;
    letter-spacing: -0.5px;
  }

  .hero-subtext {
    font-family: 'Inter', sans-serif;
    font-weight: 400;
    line-height: 1.75;
    letter-spacing: 0.1px;
    opacity: 0.88;
  }

  .hero-badge {
    font-family: 'Inter', sans-serif;
    font-size: 13px;
    font-weight: 600;
    letter-spacing: 1.2px;
    text-transform: uppercase;
    opacity: 0.85;
    margin-bottom: 16px;
    display: inline-flex;
    align-items: center;
    gap: 8px;
  }

  .hero-badge::before {
    content: '';
    width: 28px;
    height: 2px;
    background: rgba(255,255,255,0.7);
    display: inline-block;
  }

  .hero-badge::after {
    content: '';
    width: 28px;
    height: 2px;
    background: rgba(255,255,255,0.7);
    display: inline-block;
  }

  /* Hide scrollbar for testimonials */
  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }
`}</style>

      {/* ── HERO SECTION ── */}
      <section id="home" className="hero-gradient text-white py-16 md:py-28 lg:py-32 slide-up">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center gap-10 md:gap-8">

            {/* Left: Text + Buttons */}
            <div className="md:w-1/2 text-center md:text-left">

              {/* Badge */}
              <div className="hero-badge justify-center md:justify-start">
                Ujjain's Most Trusted Since 1992
              </div>

              {/* Tagline */}
              <p className="text-blue-300 dark:text-blue-400 font-semibold text-base sm:text-lg mb-4">
                ElectrooBuddy - Home Appliance Services
              </p>

              {/* Headline */}
              <h1 className="hero-headline text-3xl sm:text-4xl md:text-5xl lg:text-6xl mb-6">
                Expert Appliance{" "}
                <span style={{
                  background: "linear-gradient(135deg, #93c5fd, #bfdbfe)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text"
                }}>
                  Care & Repair
                </span>
                {" "}at Your Doorstep
              </h1>

              {/* Subtext */}
              <p className="hero-subtext text-base sm:text-lg mb-8 max-w-xl mx-auto md:mx-0">
                Over {new Date().getFullYear() - 1992} years of certified expertise — from ACs and fans to TVs and wiring.
                Fast response, transparent pricing, and guaranteed workmanship, right at your home.
              </p>

              {/* Trust indicators */}
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mb-8 text-sm opacity-80">
                <span className="flex items-center gap-1.5">
                  <span style={{ color: "#fbbf24" }}>★★★★★</span> 4.9 Rated
                </span>
                <span className="w-px h-4 bg-white/30" />
                <span>5,000+ Happy Customers</span>
                <span className="w-px h-4 bg-white/30" />
                <span>45-min Response</span>
              </div>

              {/* Buttons */}
              <div className="flex flex-wrap gap-3 items-center justify-center md:justify-start">
                <button
                  onClick={() => scrollToSection('request-service')}
                  className="w-full xs:w-auto bg-white text-blue-800 hover:bg-gray-100 px-6 py-3 sm:px-8 sm:py-4 rounded-lg font-semibold text-base sm:text-lg transition duration-300 text-center"
                  style={{ fontFamily: "'Inter', sans-serif" }}
                >
                  Request Service Now
                </button>
                <Link
                  to="/products"
                  className="w-full xs:w-auto bg-yellow-500 hover:bg-yellow-600 text-gray-900 px-6 py-3 sm:px-8 sm:py-4 rounded-lg font-semibold text-base sm:text-lg transition duration-300 inline-flex items-center justify-center gap-2"
                  style={{ fontFamily: "'Inter', sans-serif" }}
                >
                  <ShoppingBag size={20} /> Buy Products
                </Link>
                <button
                  onClick={() => scrollToSection('contact')}
                  className="w-full xs:w-auto border-2 border-white hover:bg-white hover:text-blue-800 px-6 py-3 sm:px-8 sm:py-4 rounded-lg font-semibold text-base sm:text-lg transition duration-300 text-center"
                  style={{ fontFamily: "'Inter', sans-serif" }}
                >
                  Contact Us
                </button>
              </div>
            </div>

            {/* Right: Image */}
            {/* FIX: added mt-8 md:mt-0 so image has top gap on mobile, max-w-sm centers it on small screens */}
            <div className="md:w-1/2 relative mt-2 md:mt-0">
              <img
                src={heroImage}
                alt="Professional appliance repair technician at work"
                className="rounded-lg shadow-2xl floating-button w-full max-w-sm mx-auto md:max-w-none"
                loading="eager"
              />
              {/* FIX: use bottom-2 left-2 on mobile to avoid overflow; revert to -bottom-5 -left-5 on md+ */}
              <div className="absolute bottom-2 left-2 md:-bottom-5 md:-left-5 bg-blue-700 dark:bg-blue-600 text-white px-3 py-2 md:px-6 md:py-3 rounded-lg shadow-lg max-w-[90%] md:max-w-none">
                <div className="flex items-center gap-2">
                  <Zap className="h-5 w-5 flex-shrink-0" />
                  <span className="font-bold text-xs sm:text-sm md:text-base leading-tight">
                    24/7 Emergency Service Available
                  </span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── STATS SECTION ── */}
      <section className="bg-white dark:bg-gray-800 py-12 md:py-16 fade-in">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* FIX: sm:grid-cols-3 so it goes 3-column at 640px instead of waiting for md (768px) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-8">

            <div className="stats-counter bg-blue-50 dark:bg-gray-700 p-6 md:p-8 rounded-xl text-center transition duration-300">
              <div className="text-blue-800 dark:text-blue-400 text-4xl md:text-5xl font-bold mb-2">
                {counters.experience}+
              </div>
              <div className="text-gray-700 dark:text-gray-300 text-lg md:text-xl font-medium">
                Years of Experience
              </div>
              <Award className="mt-4 h-7 w-7 md:h-8 md:w-8 text-blue-600 dark:text-blue-400 mx-auto" />
            </div>

            <div className="stats-counter bg-blue-50 dark:bg-gray-700 p-6 md:p-8 rounded-xl text-center transition duration-300">
              <div className="text-blue-800 dark:text-blue-400 text-4xl md:text-5xl font-bold mb-2">
                {counters.clients.toLocaleString()}+
              </div>
              <div className="text-gray-700 dark:text-gray-300 text-lg md:text-xl font-medium">
                Satisfied Clients
              </div>
              <Smile className="mt-4 h-7 w-7 md:h-8 md:w-8 text-blue-600 dark:text-blue-400 mx-auto" />
            </div>

            <div className="stats-counter bg-blue-50 dark:bg-gray-700 p-6 md:p-8 rounded-xl text-center transition duration-300">
              <div className="text-blue-800 dark:text-blue-400 text-4xl md:text-5xl font-bold mb-2">
                {counters.projects.toLocaleString()}+
              </div>
              <div className="text-gray-700 dark:text-gray-300 text-lg md:text-xl font-medium">
                Completed Projects
              </div>
              <Wrench className="mt-4 h-7 w-7 md:h-8 md:w-8 text-blue-600 dark:text-blue-400 mx-auto" />
            </div>

          </div>
        </div>
      </section>

      {/* ── ABOUT SECTION ── */}
      <section id="about" className="py-16 md:py-20 bg-gray-50 dark:bg-gray-900 slide-up">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">About ElectrooBuddy</h2>
            <div className="w-20 h-1 bg-blue-600 mx-auto"></div>
          </div>
          <div className="flex flex-col md:flex-row items-center gap-10 md:gap-0">
            <div className="md:w-1/2 md:pr-10">
              <img
                src={aboutImage}
                alt="ElectrooBuddy team working on appliance repair"
                className="rounded-lg shadow-lg w-full"
                loading="lazy"
              />
            </div>
            <div className="md:w-1/2">
              <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Serving Ujjain Since 1992</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Founded in 1992, ElectrooBuddy has grown from a small local repair shop to Ujjain's most trusted appliance care and repair service.
              </p>
              <div className="mb-6 space-y-4">
                {[
                  `${counters.experience}+ years of trusted service`,
                  `Certified and experienced technicians`,
                  `Quick response time (average 45 minutes)`,
                  `Expanding nationwide with the same quality service`
                ].map((point, i) => (
                  <div key={i} className="flex items-start">
                    <div className="flex-shrink-0 mt-1">
                      <div className="flex items-center justify-center h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300">
                        <Check className="h-4 w-4" />
                      </div>
                    </div>
                    <div className="ml-3">
                      <p className="text-gray-700 dark:text-gray-300 font-medium">{point}</p>
                    </div>
                  </div>
                ))}
              </div>
              <button
                onClick={() => scrollToSection('services')}
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 transition duration-300"
              >
                Explore Our Services <ArrowRight className="ml-2 h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── SERVICES SECTION ── */}
      <section id="services" className="py-16 md:py-20 bg-white dark:bg-gray-800 fade-in">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">Our Services</h2>
            <div className="w-20 h-1 bg-blue-600 mx-auto"></div>
            <p className="mt-6 text-base md:text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              We offer comprehensive appliance repair and maintenance services to keep your home running smoothly.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {servicesLoading ? (
              // FIX: explicit colspan values instead of col-span-full (which needs known column count)
              <div className="col-span-1 md:col-span-2 lg:col-span-3 flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              services.map((service, index) => (
                <ServiceCard2
                  key={service.id || index}
                  service={service}
                  onBookNow={handleBookService}
                />
              ))
            )}
          </div>

          <div className="mt-12 md:mt-16 text-center px-4">
            {/* FIX: flex-wrap + text-center so phone number wraps cleanly on narrow screens */}
            <a
              href={`tel:${PHONE_NUMBER}`}
              className="inline-flex flex-wrap items-center justify-center gap-2 px-6 py-3 md:px-8 md:py-4 border border-transparent text-base md:text-lg font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 transition duration-300"
            >
              <Phone className="h-5 w-5 flex-shrink-0" />
              <span>Emergency Service: Call {PHONE_NUMBER}</span>
            </a>
          </div>
        </div>
      </section>
      {/* ── PRODUCTS SECTION ── */}
      <section id="products" className="py-16 md:py-20 bg-gray-50 dark:bg-gray-900 fade-in">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">Our Products</h2>
            <div className="w-20 h-1 bg-blue-600 mx-auto"></div>
            <p className="mt-6 text-base md:text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Quality electrical products and accessories at competitive prices.
            </p>
          </div>

          {productsLoading ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-card border border-border/40 rounded-xl overflow-hidden animate-pulse">
                  <div className="aspect-square bg-muted" />
                  <div className="p-3 sm:p-4 space-y-2">
                    <div className="h-3 bg-muted rounded w-3/4" />
                    <div className="h-4 bg-muted rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : displayProducts.length === 0 ? null : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {displayProducts.map((product, idx) => (
                <ProductCard key={product.id} product={product} index={idx} />
              ))}
            </div>
          )}

          <div className="mt-10 md:mt-12 text-center">
            <Link
              to="/products"
              className="inline-flex items-center px-6 py-3 md:px-8 md:py-4 border border-transparent text-base md:text-lg font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 transition duration-300"
            >
              View All Products <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── GALLERY SECTION ── */}
      <section id="gallery" className="py-16 md:py-20 bg-gray-50 dark:bg-gray-900 fade-in">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">Our Work Gallery</h2>
            <div className="w-20 h-1 bg-blue-600 mx-auto"></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { img: portfolio2, title: 'Professional TV Mounting' },
              { img: portfolio1, title: 'AC Maintenance Service' },
              { img: portfolio3, title: 'Electrical Circuit Repair' },
              { img: portfolio4, title: 'DTH Satellite Setup' },
              { img: portfolio5, title: 'Refrigerator Maintenance' },
              { img: portfolio6, title: 'Ceiling Fan Installation' }
            ].map((item, index) => (
              <div key={index} className="overflow-hidden rounded-lg shadow-lg">
                <img
                  src={item.img}
                  alt={item.title}
                  className="w-full h-56 sm:h-64 object-cover transition duration-500 hover:scale-105"
                  loading="lazy"
                />
                <div className="px-4 py-3 sm:px-6 sm:py-4 bg-white dark:bg-gray-700">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">{item.title}</h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SERVICE AREA MAP SECTION ── */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900 slide-up">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">Our Service Area</h2>
            <div className="w-20 h-1 bg-blue-600 mx-auto"></div>
            <p className="mt-6 text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">Currently serving Ujjain and surrounding areas, with plans to expand nationwide.</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
            <div className="md:flex">
              <div className="md:w-1/2 p-8">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Coverage Areas</h3>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 mt-1">
                      <div className="flex items-center justify-center h-6 w-6 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300">
                        <Check className="text-sm" size={14} />
                      </div>
                    </div>
                    <div className="ml-3">
                      <p className="text-gray-700 dark:text-gray-300 font-medium">Ujjain City (Full Coverage)</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="flex-shrink-0 mt-1">
                      <div className="flex items-center justify-center h-6 w-6 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300">
                        <Check className="text-sm" size={14} />
                      </div>
                    </div>
                    <div className="ml-3">
                      <p className="text-gray-700 dark:text-gray-300 font-medium">Dewas Road Area</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="flex-shrink-0 mt-1">
                      <div className="flex items-center justify-center h-6 w-6 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300">
                        <Check className="text-sm" size={14} />
                      </div>
                    </div>
                    <div className="ml-3">
                      <p className="text-gray-700 dark:text-gray-300 font-medium">Nagziri Region</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="flex-shrink-0 mt-1">
                      <div className="flex items-center justify-center h-6 w-6 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300">
                        <Zap className="text-sm" size={14} />
                      </div>
                    </div>
                    <div className="ml-3">
                      <p className="text-gray-700 dark:text-gray-300 font-medium">Expanding to Indore by 2026</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="md:w-1/2">
                <iframe 
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3668.612100355346!2d75.8147001!3d23.147849700000002!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x396373645886aa75%3A0x8770f5f8e13dc716!2sPragya%20Electric%20Work%20Shop!5e0!3m2!1sen!2sin!4v1773309507219!5m2!1sen!2sin" 
                  className="w-full h-full min-h-[400px]" 
                  style={{ border: 0 }} 
                  allowFullScreen 
                  loading="lazy" 
                  referrerPolicy="no-referrer-when-downgrade"
                  title="ElectrooBuddy Service Location"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── VIDEO SECTION ── */}
      {/* <VideoSection /> */}

      {/* ── APPLIANCE CARE TIPS SECTION ── */}
      <section id="tips" className="py-20 bg-gray-50 dark:bg-gray-900 slide-up">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">Appliance Care Tips</h2>
            <div className="w-20 h-1 bg-blue-600 mx-auto"></div>
            <p className="mt-6 text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">Learn how to maintain your appliances and prevent common issues.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {applianceTips.map((tip, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden transition duration-300 hover:shadow-xl hover:-translate-y-1 transform">
                <div className="bg-blue-50 dark:bg-gray-700 h-48 flex items-center justify-center relative overflow-hidden">
                  <i className={`fas ${tip.bgIcon} text-6xl ${tip.color} opacity-30 absolute`}></i>
                  <i className={`fas ${tip.icon} text-5xl ${tip.color} relative z-10`}></i>
                  <span className="absolute top-3 left-3 text-xs text-gray-500 dark:text-gray-400 font-medium">{tip.label}</span>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{tip.title}</h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">{tip.description}</p>
                  <a href="/tips" className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium inline-flex items-center transition duration-200">
                    Read More <i className="fas fa-chevron-right ml-1 text-sm"></i>
                  </a>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-12 text-center">
            <a href="/tips" className="inline-flex items-center px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition duration-300">
              View All Tips
            </a>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS SECTION ── */}
      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 bg-white dark:bg-gray-800 slide-up">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">What Our Clients Say</h2>
            <div className="w-20 h-1 bg-blue-600 mx-auto"></div>
          </div>
          <div className="relative max-w-5xl mx-auto">
            <div 
              ref={(el) => {
                if (el) {
                  el.scrollTo({
                    left: currentTestimonial * 352,
                    behavior: 'smooth'
                  });
                }
              }}
              className="flex overflow-x-auto pb-6 scrollbar-hide gap-4" 
              style={{ scrollSnapType: 'x mandatory', scrollBehavior: 'smooth' }}
            >
              {testimonials.map((testimonial, index) => (
                <div key={index} className="testimonial-slide bg-gray-50 dark:bg-gray-700 p-8 rounded-lg shadow-md flex-shrink-0" style={{ width: '320px', scrollSnapAlign: 'start' }}>
                  <div className="flex items-center mb-6">
                    <img src={testimonial.image} alt={testimonial.name} className="h-12 w-12 rounded-full" loading="lazy" />
                    <div className="ml-4">
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white">{testimonial.name}</h4>
                      <p className="text-gray-600 dark:text-gray-300">{testimonial.location}</p>
                    </div>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 mb-6">{testimonial.text}</p>
                  <div className="flex">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <button 
              onClick={prevTestimonial} 
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-white dark:bg-gray-700 p-3 rounded-full shadow-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition duration-300 z-10"
              aria-label="Previous testimonial"
            >
              <ChevronRight className="h-6 w-6 text-gray-700 dark:text-gray-300 rotate-180" />
            </button>
            <button 
              onClick={nextTestimonial} 
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 bg-white dark:bg-gray-700 p-3 rounded-full shadow-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition duration-300 z-10"
              aria-label="Next testimonial"
            >
              <ChevronRight className="h-6 w-6 text-gray-700 dark:text-gray-300" />
            </button>
          </div>
          <div className="mt-16 text-center">
            <div className="flex justify-center">
              <div className="bg-white dark:bg-gray-700 p-6 rounded-lg shadow-md max-w-md">
                <div className="flex items-center justify-center mb-4">
                  <MessageCircle className="h-8 w-8 text-blue-600 dark:text-blue-400 mr-2" />
                  <span className="text-xl font-semibold text-gray-900 dark:text-white">4.9</span>
                  <div className="ml-2">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                      ))}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Based on 3 reviews</p>
                  </div>
                </div>
                {/* FIX: flex-wrap so buttons stack on very small screens */}
                <div className="flex flex-wrap justify-center gap-2">
                  {/* <a
                    href="https://g.page/r/CfQ3QZ4XJj5EEB0/review"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-3 py-2 text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition duration-300"
                  >
                    <MessageCircle className="mr-1.5 h-4 w-4" /> Leave a Review
                  </a> */}
                  <Link
                    to="/review"
                    className="inline-flex items-center px-3 py-2 text-sm font-medium rounded-md text-blue-600 border border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition duration-300"
                  >
                    <Star className="mr-1.5 h-4 w-4" /> Share Experience
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ SECTION ── */}
      <section className="py-16 md:py-20 bg-gray-50 dark:bg-gray-900 fade-in">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">Frequently Asked Questions</h2>
            <div className="w-20 h-1 bg-blue-600 mx-auto"></div>
          </div>
          <div className="max-w-3xl mx-auto space-y-4">
            {faqs.slice(0, 5).map((faq, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full flex justify-between items-center p-5 md:p-6 text-left focus:outline-none gap-4"
                >
                  <h3 className="text-base md:text-lg font-medium text-gray-900 dark:text-white">{faq.question}</h3>
                  <ChevronDown
                    className={`h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 transition-transform duration-300 ${openFAQ === index ? 'rotate-180' : ''}`}
                  />
                </button>
                {openFAQ === index && (
                  <div className="px-5 pb-5 md:px-6 md:pb-6">
                    <p className="text-sm md:text-base text-gray-600 dark:text-gray-300">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="mt-10 text-center">
            <Link
              to="/faq"
              className="inline-flex items-center px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition duration-300"
            >
              See All Questions <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>


      {/* ── WHY CHOOSE US ── */}
      <Section>
        <div className="text-center mb-10 sm:mb-14">
          <div className="inline-flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 px-4 py-1.5 rounded-full text-sm font-semibold mb-4">
            <span className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></span>
            Why Choose Us
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Reliable Solutions <span className="text-blue-600">You Can Trust</span>
          </h2>
          <p className="text-base md:text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            We deliver excellence in every service with cutting-edge technology and expert technicians.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 md:gap-6">
          {whyChooseUs.map((item, i) => (
            <motion.div
              key={item.title}
              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              style={{ "--card-accent": item.accent } as React.CSSProperties}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.45 }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="text-3xl md:text-4xl font-bold text-gray-200 dark:text-gray-700">0{i + 1}</div>
                <div
                  className="w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center"
                  style={{ background: `linear-gradient(135deg, ${item.accent}, ${item.accent}dd)` }}
                >
                  <item.icon size={22} className="text-white" />
                </div>
              </div>
              <h3 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-white">{item.title}</h3>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* ── TEAM SECTION ── */}
      <section id="team" className="py-20 bg-gray-50 dark:bg-gray-900 slide-up">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">Meet Our Team</h2>
            <div className="w-20 h-1 bg-blue-600 mx-auto"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {team.map((member, index) => (
              <div key={index} className="team-member text-center">
                <div className="overflow-hidden rounded-full h-48 w-48 mx-auto mb-6">
                  <img src={member.image} alt={member.name} className="h-full w-full object-cover bg-white rounded-full transition duration-300 hover:scale-105" loading="lazy" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">{member.name}</h3>
                <p className="text-blue-600 dark:text-blue-400 font-medium mb-2">{member.role}</p>
                <p className="text-gray-600 dark:text-gray-300">{member.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── REQUEST SERVICE ── */}
      <RequestServiceSection preselectedService={preselectedService} />

      {/* ── CONTACT SECTION ── */}
      <section id="contact" className="py-16 md:py-20 bg-gray-50 dark:bg-gray-900 fade-in">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">Contact Us</h2>
            <div className="w-20 h-1 bg-blue-600 mx-auto"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-12">
            <div>
              <h3 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-6">Contact Information</h3>
              <div className="space-y-5 md:space-y-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 bg-blue-100 dark:bg-blue-900 p-3 rounded-lg">
                    <MapPin className="text-blue-600 dark:text-blue-400 h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-base md:text-lg font-semibold text-gray-900 dark:text-white">Our Office</h4>
                    <a
                      href="https://maps.app.goo.gl/X16Z1kxCfBUsKE9R9"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm md:text-base text-gray-600 dark:text-gray-300 hover:text-blue-600 transition duration-300"
                    >
                      05, Nagziri Dewas Road, Ujjain (456010), India
                    </a>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 bg-blue-100 dark:bg-blue-900 p-3 rounded-lg">
                    <Phone className="text-blue-600 dark:text-blue-400 h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-base md:text-lg font-semibold text-gray-900 dark:text-white">Phone</h4>
                    <a
                      href={`tel:${PHONE_NUMBER}`}
                      className="text-sm md:text-base text-gray-600 dark:text-gray-300 hover:text-blue-600 transition duration-300 block"
                    >
                      {PHONE_NUMBER}
                    </a>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 bg-blue-100 dark:bg-blue-900 p-3 rounded-lg">
                    <Mail className="text-blue-600 dark:text-blue-400 h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-base md:text-lg font-semibold text-gray-900 dark:text-white">Email</h4>
                    <a
                      href="mailto:electroobuddy@gmail.com"
                      className="text-sm md:text-base text-gray-600 dark:text-gray-300 hover:text-blue-600 transition duration-300 block"
                    >
                      electroobuddy@gmail.com
                    </a>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 bg-blue-100 dark:bg-blue-900 p-3 rounded-lg">
                    <Clock className="text-blue-600 dark:text-blue-400 h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-base md:text-lg font-semibold text-gray-900 dark:text-white">Working Hours</h4>
                    <p className="text-sm md:text-base text-gray-600 dark:text-gray-300">Mon - Sat: 8:00 AM - 9:00 PM</p>
                    <p className="text-sm md:text-base text-gray-600 dark:text-gray-300">Sunday: 24/7 Emergency Support Only</p>
                  </div>
                </div>
              </div>
              <div className="mt-8 flex gap-4">
                <a
                  href="#"
                  className="bg-blue-100 dark:bg-gray-700 p-3 rounded-full text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-gray-600 transition duration-300"
                  aria-label="Instagram"
                >
                  <Instagram className="h-5 w-5" />
                </a>
                <a
                  href="#"
                  className="bg-blue-100 dark:bg-gray-700 p-3 rounded-full text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-gray-600 transition duration-300"
                  aria-label="LinkedIn"
                >
                  <Linkedin className="h-5 w-5" />
                </a>
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Send Us a Message</h3>
              <form className="space-y-6" onSubmit={handleContactSubmit}>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={contactForm.name}
                    onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:bg-gray-700 dark:text-white"
                    placeholder="Rahul Sharma"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={contactForm.phone}
                    onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:bg-gray-700 dark:text-white"
                    placeholder="+91 98765 43210"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={contactForm.email}
                    onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:bg-gray-700 dark:text-white"
                    placeholder="rahul@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Subject <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={contactForm.subject}
                    onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:bg-gray-700 dark:text-white"
                    placeholder="AC not cooling"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Message <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={contactForm.message}
                    onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:bg-gray-700 dark:text-white"
                    placeholder="Tell us more about your issue..."
                  ></textarea>
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={contactSubmitting}
                    className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {contactSubmitting
                      ? <><Loader2 size={16} className="animate-spin" /> Sending...</>
                      : <><Send size={15} /> Send Message</>
                    }
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* ── NEWSLETTER ── */}
      <section className="py-12 md:py-16 bg-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-xl md:text-2xl lg:text-3xl font-bold mb-4">Subscribe to Our Newsletter</h2>
          <p className="mb-8 max-w-2xl mx-auto text-sm md:text-base opacity-90">
            Get maintenance tips, special offers, and updates about our services directly to your inbox.
          </p>
          {/* FIX: flex-col on mobile, flex-row on sm+ for the newsletter form */}
          <form className="max-w-md mx-auto flex flex-col sm:flex-row gap-3">
            <input
              type="email"
              placeholder="Your email address"
              className="flex-grow px-4 py-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300 text-gray-900 text-sm md:text-base"
            />
            <button
              type="submit"
              className="px-6 py-3 bg-white text-blue-800 font-medium rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-white transition duration-300 flex-shrink-0"
            >
              Subscribe
            </button>
          </form>
        </div>
      </section>

    </div>
  );
}