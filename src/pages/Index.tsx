import { Link } from "react-router-dom";
import { useEffect, useState, useMemo, useRef } from "react";
import { motion } from "framer-motion";
import {
  Zap,
  ArrowRight,
  Shield,
  Clock,
  BadgeDollarSign,
  HeartHandshake,
  Users,
  X,
  Phone,
  Loader2,
  MapPin,
  Wrench,
  AlignLeft,
  ChevronRight,
  Star,
  Instagram,
  Linkedin,
  Mail,
  ChevronDown,
  MessageCircle,
  Award,
  Smile,
  Check,
  ShoppingBag,
  Send,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import Section from "@/components/Section";
import ServiceCard2 from "@/components/ServiceCard2";
import ProductCard from "@/components/ProductCard";
import OfferBannerSlider from "@/components/OfferBannerSlider";

import RequestServiceSection from "@/components/Requestservicesection";
import { useServicesStore } from "@/stores/servicesStore";
import {
  useTeamMembers,
  useTestimonials,
  useProducts,
} from "@/hooks/useOptimizedData";
import { BUSINESS, YEARS_OF_EXPERIENCE } from "@/data/business";
import { EMAIL, PHONE_NUMBER } from "@/data/services";
import { teamMembers as staticTeam } from "@/data/team";

// Image imports

import aboutImage from "@/images/about.png";
import portfolio1 from "@/images/portfolio-1.jpg";
import portfolio2 from "@/images/portfolio-2.jpg";
import portfolio3 from "@/images/portfolio-3.jpg";
import portfolio4 from "@/images/portfolio-4.jpg";
import portfolio5 from "@/images/portfolio-5.jpg";
import portfolio6 from "@/images/portfolio-6.jpg";
import team1 from "@/images/team-1.png";
import team2 from "@/images/dilip.jpeg";
import team3 from "@/images/no-profile.png";
import teamDefault from "@/images/team-.jpg";
import { getTeamImage } from "@/components/about/TeamCard";
import { applianceTips, faqs, serviceShowcase } from "@/data/faqs";
import { testimonials as staticTestimonials } from "@/data/testimonials";

// Local team image mapping for fallbacks
const localTeamImageMap: Record<string, string> = {
  "Dilip Parihar": team2,
  "Viraj Parihar": team1,
  "Karan Parihar": team3,
  "Mr. Dilip Parihar": team2,
  "Mr. Viraj Parihar": team1,
  "Mr. Karan Parihar": team3,
};

export default function Index() {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [currentService, setCurrentService] = useState(0);
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);
  const [preselectedService, setPreselectedService] = useState<string>("");
  const [contactForm, setContactForm] = useState({
    name: "",
    phone: "",
    email: "",
    subject: "",
    message: "",
  });
  const [contactSubmitting, setContactSubmitting] = useState(false);
  const [contactDone, setContactDone] = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterSubmitting, setNewsletterSubmitting] = useState(false);
  const [newsletterDone, setNewsletterDone] = useState(false);
  const {
    services,
    loading: servicesLoading,
    fetchServices,
  } = useServicesStore();
  const { products, loading: productsLoading } = useProducts();
  const displayProducts = products.slice(0, 4);
  const [team, setTeam] = useState<any[]>([]);
  const [teamLoading, setTeamLoading] = useState(true);
  const [dbTestimonials, setDbTestimonials] = useState<any[]>([]);
  const [testimonialsLoading, setTestimonialsLoading] = useState(true);
  const [dbStats, setDbStats] = useState({ clients: 0, projects: 0, responseTime: "45min" });
  const touchStartX = useRef<number>(0);

  const counters = useMemo(
    () => ({
      experience: YEARS_OF_EXPERIENCE,
      clients: dbStats.clients+3426,
      projects: dbStats.projects+2151,
    }),
    [dbStats],
  );

  // Auto-rotate service showcase
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentService((prev) => (prev + 1) % serviceShowcase.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const whyChooseUs = [
    { icon: Clock, title: "Fast Response", accent: "#3b82f6" },
    { icon: Shield, title: "Trusted Service", accent: "#10b981" },
    { icon: BadgeDollarSign, title: "Affordable Pricing", accent: "#f59e0b" },
    { icon: HeartHandshake, title: "Customer First", accent: "#ef4444" },
  ];

  // Fetch team data from database
  useEffect(() => {
    let mounted = true;

    const fetchTeam = async () => {
      try {
        setTeamLoading(true);

        const { data, error } = await supabase
          .from("team_members")
          .select("*")
          .order("sort_order");

        if (!mounted) return;

        if (error) {
          console.error("Error fetching team:", error);
          setTeam(staticTeam);
        } else {
          console.log("Team data from DB:", data);
          setTeam(data && data.length > 0 ? data : staticTeam);
        }
      } catch (err) {
        console.error("Failed to load team:", err);
        if (mounted) {
          setTeam(staticTeam);
        }
      } finally {
        if (mounted) {
          setTeamLoading(false);
        }
      }
    };

    fetchTeam();

    return () => {
      mounted = false;
    };
  }, []);

  // Fetch testimonials from database
  useEffect(() => {
    let mounted = true;

    const fetchTestimonials = async () => {
      try {
        setTestimonialsLoading(true);
        const { data, error } = await supabase
          .from("testimonials")
          .select("*")
          .order("created_at", { ascending: false });

        if (!mounted) return;

        if (error) {
          console.error("Error fetching testimonials:", error);
          setDbTestimonials([]);
        } else {
          setDbTestimonials(data || []);
        }
      } catch (err) {
        console.error("Failed to load testimonials:", err);
        if (mounted) setDbTestimonials([]);
      } finally {
        if (mounted) setTestimonialsLoading(false);
      }
    };

    fetchTestimonials();
    return () => { mounted = false; };
  }, []);

  // Fetch dynamic stats from bookings table
  useEffect(() => {
    let mounted = true;

    const fetchStats = async () => {
      try {
        // Count unique clients (by phone)
        const { count: clientCount } = await supabase
          .from("bookings")
          .select("phone", { count: "exact", head: true });

        // Count total completed projects
        const { count: projectCount } = await supabase
          .from("bookings")
          .select("id", { count: "exact", head: true })
          .eq("status", "completed");

        if (!mounted) return;

        setDbStats({
          clients: clientCount || 0,
          projects: projectCount || 0,
          responseTime: "45min",
        });
      } catch (err) {
        console.error("Failed to load stats:", err);
      }
    };

    fetchStats();
    return () => { mounted = false; };
  }, []);

  // Use DB testimonials if available, otherwise fall back to static data
  const displayTestimonials = dbTestimonials.length > 0
    ? dbTestimonials.map((t) => ({
        name: t.name || "Anonymous",
        text: t.text,
        rating: t.rating || 5,
        service: t.service || "",
        location: "Ujjain",
        image: undefined,
      }))
    : staticTestimonials;

  const averageRating = displayTestimonials.length > 0
    ? (displayTestimonials.reduce((s, t) => s + (t.rating || 5), 0) / displayTestimonials.length).toFixed(1)
    : "0.0";

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const nextTestimonial = () => {
    setCurrentTestimonial((prev) => (prev + 1) % displayTestimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentTestimonial(
      (prev) => (prev - 1 + displayTestimonials.length) % displayTestimonials.length,
    );
  };

  const toggleFAQ = (index: number) => {
    setOpenFAQ(openFAQ === index ? null : index);
  };

  const handleBookService = (serviceTitle: string) => {
    setPreselectedService(serviceTitle);
    scrollToSection("request-service");
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
      setContactForm({
        name: "",
        phone: "",
        email: "",
        subject: "",
        message: "",
      });
    }
    setContactSubmitting(false);
  };

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail.trim()) return;
    setNewsletterSubmitting(true);
    try {
      const { error } = await supabase.from("newsletter_subscribers").insert({
        email: newsletterEmail.trim(),
      });
      if (error) {
        // If table doesn't exist or duplicate, still show success to user
        console.warn("Newsletter insert error:", error.message);
      }
      setNewsletterDone(true);
      setNewsletterEmail("");
      toast.success("Subscribed! Check your inbox for updates.");
    } catch (err) {
      console.warn("Newsletter error:", err);
      setNewsletterDone(true);
      setNewsletterEmail("");
      toast.success("Subscribed! Check your inbox for updates.");
    } finally {
      setNewsletterSubmitting(false);
    }
  };

  // Fetch services on mount
  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

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

      <OfferBannerSlider visibility="home_hero" />

      <section
        id="home"
        className="hero-gradient text-white pt-8 pb-12 md:pt-12 md:pb-20 lg:pt-16 lg:pb-24"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 items-center gap-8">
            {/* LEFT CONTENT */}
            <div className="text-center md:text-left">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 text-xs sm:text-sm mb-3">
                ⚡ {BUSINESS.tagline}
              </div>

              {/* Tagline */}
              <p className="text-blue-300 font-medium text-sm sm:text-base mb-3">
                ElectrooBuddy - Home Appliance Services
              </p>

              {/* Heading */}
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold leading-tight mb-4">
                Expert Appliance{" "}
                <span className="bg-gradient-to-r from-blue-300 to-blue-100 bg-clip-text text-transparent">
                  Care & Repair
                </span>{" "}
                at Your Doorstep
              </h1>

              {/* Subtext */}
              <p className="text-sm sm:text-base text-gray-200 mb-6 max-w-lg mx-auto md:mx-0">
                Over {YEARS_OF_EXPERIENCE}+ years of certified
                expertise — from ACs and fans to TVs and wiring. Fast response,
                transparent pricing, and guaranteed workmanship.
              </p>

              {/* Stats Row */}
              <div className="flex items-center justify-center md:justify-start gap-5 mb-6 text-xs sm:text-sm opacity-90">
                <div>
                  <div className="font-bold text-base sm:text-lg">{dbStats.responseTime}</div>
                  <div className="text-gray-300 text-xs">Response</div>
                </div>

                <div className="w-px h-4 bg-white/30" />

                <div>
                  <div className="font-bold text-base sm:text-lg flex items-center gap-1">
                    {averageRating} <span className="text-yellow-400">★</span>
                  </div>
                  <div className="text-gray-300 text-xs">Rating</div>
                </div>

                <div className="w-px h-4 bg-white/30" />

                <div>
                  <div className="font-bold text-base sm:text-lg">
                    {counters.projects > 0 ? `${Math.round(counters.projects / 1000)}K+` : "8K+"}
                  </div>
                  <div className="text-gray-300 text-xs">Jobs Done</div>
                </div>
              </div>

              {/* CTA BUTTONS */}
              <div className="flex flex-col sm:flex-row gap-3 items-center justify-center md:justify-start">
                {/* Primary */}
                <button
                  onClick={() => scrollToSection("request-service")}
                  className="w-full sm:w-auto bg-white text-blue-800 hover:bg-gray-100 px-5 py-2.5 rounded-lg font-semibold text-sm sm:text-base transition shadow-sm hover:shadow-md"
                >
                  Request Service
                </button>

                {/* Secondary */}
                <Link
                  to="/products"
                  className="w-full sm:w-auto border border-white/40 hover:bg-white hover:text-blue-800 px-5 py-2.5 rounded-lg font-semibold text-sm sm:text-base transition flex items-center justify-center gap-2"
                >
                  <ShoppingBag size={18} />
                  Products
                </Link>

                {/* Tertiary */}
                <button
                  onClick={() => scrollToSection("contact")}
                  className="w-full sm:w-auto text-white/80 hover:text-white px-4 py-2 text-sm sm:text-base font-medium transition"
                >
                  Contact →
                </button>
              </div>
            </div>

            {/* RIGHT SERVICE SHOWCASE SLIDER */}
            <div className="relative flex flex-col items-center md:items-end mt-4 md:mt-0">
              <div
                className="w-full max-w-xs sm:max-w-sm md:max-w-md"
                style={{ perspective: "900px" }}
                onMouseMove={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const x = (e.clientX - rect.left) / rect.width - 0.5;
                  const y = (e.clientY - rect.top) / rect.height - 0.5;
                  const el =
                    e.currentTarget.querySelector<HTMLDivElement>(".card-3d");
                  if (el)
                    el.style.transform = `rotateY(${x * 14}deg) rotateX(${-y * 10}deg) translateZ(10px)`;
                }}
                onMouseLeave={(e) => {
                  const el =
                    e.currentTarget.querySelector<HTMLDivElement>(".card-3d");
                  if (el)
                    el.style.transform =
                      "rotateY(0deg) rotateX(0deg) translateZ(0px)";
                }}
                onTouchStart={(e) => {
                  touchStartX.current = e.touches[0].clientX;
                }}
                onTouchEnd={(e) => {
                  const dx = e.changedTouches[0].clientX - touchStartX.current;
                  if (Math.abs(dx) > 40) {
                    if (dx < 0)
                      setCurrentService(
                        (currentService + 1) % serviceShowcase.length,
                      );
                    else
                      setCurrentService(
                        (currentService - 1 + serviceShowcase.length) %
                          serviceShowcase.length,
                      );
                  }
                }}
              >
                {/* 3D Card */}
                <div
                  className="card-3d bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl p-6 border border-white/20 relative"
                  style={{
                    transformStyle: "preserve-3d",
                    transition: "transform 0.15s ease",
                    boxShadow:
                      "0 24px 64px rgba(0,0,0,0.35), 0 4px 16px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.18)",
                  }}
                >
                  {/* Shine overlay */}
                  <div
                    className="absolute inset-0 rounded-2xl pointer-events-none"
                    style={{
                      background:
                        "radial-gradient(circle at 30% 25%, rgba(255,255,255,0.08) 0%, transparent 60%)",
                    }}
                  />

                  {/* ← Prev button — inside card, left side */}
                  <button
                    onClick={() =>
                      setCurrentService(
                        (currentService - 1 + serviceShowcase.length) %
                          serviceShowcase.length,
                      )
                    }
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/15 border border-white/30 hover:bg-white/30 text-white flex items-center justify-center transition-all duration-200 z-10"
                    aria-label="Previous service"
                  >
                    <ChevronRight size={18} className="rotate-180" />
                  </button>

                  {/* → Next button — inside card, right side */}
                  <button
                    onClick={() =>
                      setCurrentService(
                        (currentService + 1) % serviceShowcase.length,
                      )
                    }
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/15 border border-white/30 hover:bg-white/30 text-white flex items-center justify-center transition-all duration-200 z-10"
                    aria-label="Next service"
                  >
                    <ChevronRight size={18} />
                  </button>

                  {/* Card content — padded so arrows don't overlap text */}
                  <div className="px-10">
                    {(() => {
                      const IconComponent =
                        serviceShowcase[currentService].icon;
                      return (
                        <>
                          <div
                            className={`w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br ${serviceShowcase[currentService].color} flex items-center justify-center transition-all duration-500`}
                            style={{
                              boxShadow:
                                "0 8px 24px rgba(0,0,0,0.28), 0 0 0 4px rgba(255,255,255,0.1)",
                            }}
                          >
                            <IconComponent size={40} className="text-white" />
                          </div>
                          <h3 className="text-xl md:text-2xl font-bold text-white text-center mb-2">
                            {serviceShowcase[currentService].title}
                          </h3>
                          <p className="text-sm md:text-base text-gray-200 text-center mb-4">
                            {serviceShowcase[currentService].description}
                          </p>
                          <div className="grid grid-cols-2 gap-2 mb-4">
                            {serviceShowcase[currentService].features.map(
                              (feature, idx) => (
                                <div
                                  key={idx}
                                  className="flex items-center gap-2 bg-white/10 rounded-lg px-3 py-2"
                                >
                                  <Check
                                    size={14}
                                    className="text-green-400 flex-shrink-0"
                                  />
                                  <span className="text-xs md:text-sm text-white">
                                    {feature}
                                  </span>
                                </div>
                              ),
                            )}
                          </div>
                          <button
                            onClick={() =>
                              handleBookService(
                                serviceShowcase[currentService].title,
                              )
                            }
                            className="w-full bg-white text-blue-800 hover:bg-gray-100 px-4 py-2.5 rounded-xl font-semibold text-sm transition shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                          >
                            Book This Service <ArrowRight size={16} />
                          </button>
                        </>
                      );
                    })()}
                  </div>

                  {/* Floating badge */}
                  <div className="absolute bottom-3 left-3 bg-yellow-400 text-black px-3 py-1.5 rounded-md text-xs font-semibold shadow-lg">
                    ⚡ 24/7 Emergency
                  </div>
                </div>

                {/* Dot indicators below card */}
                <div className="flex items-center justify-center gap-2 mt-4">
                  {serviceShowcase.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentService(idx)}
                      className={`h-2 rounded-full transition-all duration-300 ${
                        idx === currentService
                          ? "bg-white w-6"
                          : "w-2 bg-white/40 hover:bg-white/60"
                      }`}
                      aria-label={`Go to service ${idx + 1}`}
                    />
                  ))}
                </div>

                <p className="text-center text-white/40 text-xs mt-2">
                  ← swipe to browse →
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white dark:bg-gray-800 py-12 md:py-16 fade-in">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
      <section
        id="about"
        className="py-16 md:py-20 bg-gray-50 dark:bg-gray-900 slide-up"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              About ElectrooBuddy
            </h2>
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
              <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
                Serving Ujjain Since 1992
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Founded in 1992, ElectrooBuddy has grown from a small local
                repair shop to Ujjain's most trusted appliance care and repair
                service.
              </p>
              <div className="mb-6 space-y-4">
                {[
                  `${counters.experience}+ years of trusted service`,
                  `Certified and experienced technicians`,
                  `Quick response time (average 45 minutes)`,
                  `Expanding nationwide with the same quality service`,
                ].map((point, i) => (
                  <div key={i} className="flex items-start">
                    <div className="flex-shrink-0 mt-1">
                      <div className="flex items-center justify-center h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300">
                        <Check className="h-4 w-4" />
                      </div>
                    </div>
                    <div className="ml-3">
                      <p className="text-gray-700 dark:text-gray-300 font-medium">
                        {point}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <button
                onClick={() => scrollToSection("services")}
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 transition duration-300"
              >
                Explore Our Services <ArrowRight className="ml-2 h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── SERVICES SECTION ── */}
      <section
        id="services"
        className="py-16 md:py-20 bg-white dark:bg-gray-800 fade-in"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Our Services
            </h2>
            <div className="w-20 h-1 bg-blue-600 mx-auto"></div>
            <p className="mt-6 text-base md:text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              We offer comprehensive appliance repair and maintenance services
              to keep your home running smoothly.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {servicesLoading ? (
              // FIX: explicit colspan values instead of col-span-full (which needs known column count)
              <div className="col-span-1 md:col-span-2 lg:col-span-3 flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              services
                .slice(0, 6)
                .map((service, index) => (
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
      <section
        id="products"
        className="py-16 md:py-20 bg-gray-50 dark:bg-gray-900 fade-in"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Our Products
            </h2>
            <div className="w-20 h-1 bg-blue-600 mx-auto"></div>
            <p className="mt-6 text-base md:text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Quality electrical products and accessories at competitive prices.
            </p>
          </div>

          {productsLoading ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-card border border-border/40 rounded-xl overflow-hidden animate-pulse"
                >
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
      <section
        id="gallery"
        className="py-16 md:py-20 bg-gray-50 dark:bg-gray-900 fade-in"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Our Work Gallery
            </h2>
            <div className="w-20 h-1 bg-blue-600 mx-auto"></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { img: portfolio2, title: "Professional TV Mounting" },
              { img: portfolio1, title: "AC Maintenance Service" },
              { img: portfolio3, title: "Electrical Circuit Repair" },
              { img: portfolio4, title: "DTH Satellite Setup" },
              { img: portfolio5, title: "Refrigerator Maintenance" },
              { img: portfolio6, title: "Ceiling Fan Installation" },
            ].map((item, index) => (
              <div key={index} className="overflow-hidden rounded-lg shadow-lg">
                <img
                  src={item.img}
                  alt={item.title}
                  className="w-full h-56 sm:h-64 object-cover transition duration-500 hover:scale-105"
                  loading="lazy"
                />
                <div className="px-4 py-3 sm:px-6 sm:py-4 bg-white dark:bg-gray-700">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                    {item.title}
                  </h3>
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
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Our Service Area
            </h2>
            <div className="w-20 h-1 bg-blue-600 mx-auto"></div>
            <p className="mt-6 text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Currently serving Ujjain and surrounding areas, with plans to
              expand nationwide.
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
            <div className="md:flex">
              <div className="md:w-1/2 p-8">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Coverage Areas
                </h3>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 mt-1">
                      <div className="flex items-center justify-center h-6 w-6 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300">
                        <Check className="text-sm" size={14} />
                      </div>
                    </div>
                    <div className="ml-3">
                      <p className="text-gray-700 dark:text-gray-300 font-medium">
                        Ujjain City (Full Coverage)
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="flex-shrink-0 mt-1">
                      <div className="flex items-center justify-center h-6 w-6 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300">
                        <Check className="text-sm" size={14} />
                      </div>
                    </div>
                    <div className="ml-3">
                      <p className="text-gray-700 dark:text-gray-300 font-medium">
                        Dewas Road Area
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="flex-shrink-0 mt-1">
                      <div className="flex items-center justify-center h-6 w-6 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300">
                        <Check className="text-sm" size={14} />
                      </div>
                    </div>
                    <div className="ml-3">
                      <p className="text-gray-700 dark:text-gray-300 font-medium">
                        Nagziri Region
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="flex-shrink-0 mt-1">
                      <div className="flex items-center justify-center h-6 w-6 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300">
                        <Zap className="text-sm" size={14} />
                      </div>
                    </div>
                    <div className="ml-3">
                      <p className="text-gray-700 dark:text-gray-300 font-medium">
                        Expanding to Indore by 2026
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="md:w-1/2">
                <iframe
                  src={BUSINESS.mapEmbedUrl}
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
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Appliance Care Tips
            </h2>
            <div className="w-20 h-1 bg-blue-600 mx-auto"></div>
            <p className="mt-6 text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Learn how to maintain your appliances and prevent common issues.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {applianceTips.map((tip, index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden transition duration-300 hover:shadow-xl hover:-translate-y-1 transform"
              >
                <div className="bg-blue-50 dark:bg-gray-700 h-48 flex items-center justify-center relative overflow-hidden">
                  <i
                    className={`fas ${tip.bgIcon} text-6xl ${tip.color} opacity-30 absolute`}
                  ></i>
                  <i
                    className={`fas ${tip.icon} text-5xl ${tip.color} relative z-10`}
                  ></i>
                  <span className="absolute top-3 left-3 text-xs text-gray-500 dark:text-gray-400 font-medium">
                    {tip.label}
                  </span>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                    {tip.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    {tip.description}
                  </p>
                  <a
                    href="/tips"
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium inline-flex items-center transition duration-200"
                  >
                    Read More{" "}
                    <i className="fas fa-chevron-right ml-1 text-sm"></i>
                  </a>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-12 text-center">
            <a
              href="/tips"
              className="inline-flex items-center px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition duration-300"
            >
              View All Tips
            </a>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS SECTION ── */}
      {/* Testimonials Section */}
      <section
        id="testimonials"
        className="py-20 bg-white dark:bg-gray-800 slide-up"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              What Our Clients Say
            </h2>
            <div className="w-20 h-1 bg-blue-600 mx-auto"></div>
          </div>
          <div className="relative max-w-5xl mx-auto">
            <div
              ref={(el) => {
                if (el) {
                  el.scrollTo({
                    left: currentTestimonial * 352,
                    behavior: "smooth",
                  });
                }
              }}
              className="flex overflow-x-auto pb-6 scrollbar-hide gap-4"
              style={{
                scrollSnapType: "x mandatory",
                scrollBehavior: "smooth",
              }}
            >
              {displayTestimonials.map((testimonial, index) => (
                <div
                  key={index}
                  className="testimonial-slide bg-gray-50 dark:bg-gray-700 p-8 rounded-lg shadow-md flex-shrink-0"
                  style={{ width: "320px", scrollSnapAlign: "start" }}
                >
                  <div className="flex items-center mb-6">
                    {testimonial.image ? (
                      <img
                        src={testimonial.image}
                        alt={testimonial.name}
                        className="h-12 w-12 rounded-full"
                        loading="lazy"
                      />
                    ) : (
                      <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-400 to-violet-500 flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-bold text-lg">
                          {(testimonial.name || "?")[0].toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div className="ml-4">
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {testimonial.name}
                      </h4>
                      <p className="text-gray-600 dark:text-gray-300">
                        {testimonial.location || testimonial.service || "Ujjain"}
                      </p>
                    </div>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 mb-6">
                    {testimonial.text}
                  </p>
                  <div className="flex">
                    {[...Array(testimonial.rating || 5)].map((_, i) => (
                      <Star
                        key={i}
                        className="h-5 w-5 text-yellow-400 fill-current"
                      />
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
                  <span className="text-xl font-semibold text-gray-900 dark:text-white">
                    {averageRating}
                  </span>
                  <div className="ml-2">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className="h-5 w-5 text-yellow-400 fill-current"
                        />
                      ))}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Based on {displayTestimonials.length} review{displayTestimonials.length !== 1 ? 's' : ''}
                    </p>
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
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Frequently Asked Questions
            </h2>
            <div className="w-20 h-1 bg-blue-600 mx-auto"></div>
          </div>
          <div className="max-w-3xl mx-auto space-y-4">
            {faqs.slice(0, 5).map((faq, index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden"
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full flex justify-between items-center p-5 md:p-6 text-left focus:outline-none gap-4"
                >
                  <h3 className="text-base md:text-lg font-medium text-gray-900 dark:text-white">
                    {faq.question}
                  </h3>
                  <ChevronDown
                    className={`h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 transition-transform duration-300 ${openFAQ === index ? "rotate-180" : ""}`}
                  />
                </button>
                {openFAQ === index && (
                  <div className="px-5 pb-5 md:px-6 md:pb-6">
                    <p className="text-sm md:text-base text-gray-600 dark:text-gray-300">
                      {faq.answer}
                    </p>
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
            Reliable Solutions{" "}
            <span className="text-blue-600">You Can Trust</span>
          </h2>
          <p className="text-base md:text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            We deliver excellence in every service with cutting-edge technology
            and expert technicians.
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
                <div className="text-3xl md:text-4xl font-bold text-gray-200 dark:text-gray-700">
                  0{i + 1}
                </div>
                <div
                  className="w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center"
                  style={{
                    background: `linear-gradient(135deg, ${item.accent}, ${item.accent}dd)`,
                  }}
                >
                  <item.icon size={22} className="text-white" />
                </div>
              </div>
              <h3 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-white">
                {item.title}
              </h3>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* ── TEAM SECTION ── */}
      <section id="team" className="py-20 bg-gray-50 dark:bg-gray-900 slide-up">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Meet Our Team
            </h2>
            <div className="w-20 h-1 bg-blue-600 mx-auto"></div>
          </div>
          {teamLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
              {team.map((member, index) => {
                // Handle image URL - check for empty strings or null values
                const photoUrl = member.photo_url || member.image_url;
                const isValidUrl =
                  photoUrl && photoUrl.trim() && photoUrl.startsWith("http");
                const finalImageUrl = getTeamImage(
                  member.name,
                  isValidUrl ? photoUrl : null,
                );

                return (
                  <div
                    key={member.id || index}
                    className="team-member text-center"
                  >
                    <div className="overflow-hidden rounded-full h-40 w-40 sm:h-48 sm:w-48 mx-auto mb-4 md:mb-6">
                      <img
                        src={finalImageUrl}
                        alt={member.name}
                        className="h-full w-full object-cover bg-white rounded-full transition duration-300 hover:scale-105"
                        loading="lazy"
                        onError={(e) => {
                          const target = e.currentTarget;
                          target.onerror = null; // Prevent infinite loop
                          // Fallback to local image based on name, then to default
                          const fallbackImage =
                            localTeamImageMap[member.name] || teamDefault;
                          if (target.src !== fallbackImage) {
                            target.src = fallbackImage;
                          } else {
                            target.src = team3; // Ultimate fallback to no-profile.png
                          }
                        }}
                      />
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                      {member.name}
                    </h3>
                    <p className="text-blue-600 dark:text-blue-400 font-medium mb-2 text-sm sm:text-base">
                      {member.role}
                    </p>
                    <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base">
                      {member.bio}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* ── REQUEST SERVICE ── */}
      <RequestServiceSection preselectedService={preselectedService} />

      {/* ── CONTACT SECTION ── */}
      <section
        id="contact"
        className="py-16 md:py-20 bg-gray-50 dark:bg-gray-900 fade-in"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Contact Us
            </h2>
            <div className="w-20 h-1 bg-blue-600 mx-auto"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-12">
            <div>
              <h3 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Contact Information
              </h3>
              <div className="space-y-5 md:space-y-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 bg-blue-100 dark:bg-blue-900 p-3 rounded-lg">
                    <MapPin className="text-blue-600 dark:text-blue-400 h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-base md:text-lg font-semibold text-gray-900 dark:text-white">
                      Our Office
                    </h4>
                    <a
                      href={BUSINESS.mapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm md:text-base text-gray-600 dark:text-gray-300 hover:text-blue-600 transition duration-300"
                    >
                      {BUSINESS.address}
                    </a>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 bg-blue-100 dark:bg-blue-900 p-3 rounded-lg">
                    <Phone className="text-blue-600 dark:text-blue-400 h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-base md:text-lg font-semibold text-gray-900 dark:text-white">
                      Phone
                    </h4>
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
                    <h4 className="text-base md:text-lg font-semibold text-gray-900 dark:text-white">
                      Email
                    </h4>
                    <a
                      href={`mailto:${EMAIL}`}
                      className="text-sm md:text-base text-gray-600 dark:text-gray-300 hover:text-blue-600 transition duration-300 block"
                    >
                      {EMAIL}
                    </a>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 bg-blue-100 dark:bg-blue-900 p-3 rounded-lg">
                    <Clock className="text-blue-600 dark:text-blue-400 h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-base md:text-lg font-semibold text-gray-900 dark:text-white">
                      Working Hours
                    </h4>
                    <p className="text-sm md:text-base text-gray-600 dark:text-gray-300">
                      {BUSINESS.hours.weekday}
                    </p>
                    {/* <p className="text-sm md:text-base text-gray-600 dark:text-gray-300">
                      {BUSINESS.hours.sunday}
                    </p> */}
                  </div>
                </div>
              </div>
              <div className="mt-8 flex gap-4">
                <a
                  href={BUSINESS.social.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-blue-100 dark:bg-gray-700 p-3 rounded-full text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-gray-600 transition duration-300"
                  aria-label="Instagram"
                >
                  <Instagram className="h-5 w-5" />
                </a>
                <a
                  href={BUSINESS.social.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-blue-100 dark:bg-gray-700 p-3 rounded-full text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-gray-600 transition duration-300"
                  aria-label="LinkedIn"
                >
                  <Linkedin className="h-5 w-5" />
                </a>
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Send Us a Message
              </h3>
              <form className="space-y-6" onSubmit={handleContactSubmit}>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={contactForm.name}
                    onChange={(e) =>
                      setContactForm({ ...contactForm, name: e.target.value })
                    }
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
                    onChange={(e) =>
                      setContactForm({ ...contactForm, phone: e.target.value })
                    }
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
                    onChange={(e) =>
                      setContactForm({ ...contactForm, email: e.target.value })
                    }
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
                    onChange={(e) =>
                      setContactForm({
                        ...contactForm,
                        subject: e.target.value,
                      })
                    }
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
                    onChange={(e) =>
                      setContactForm({
                        ...contactForm,
                        message: e.target.value,
                      })
                    }
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
                    {contactSubmitting ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />{" "}
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send size={15} /> Send Message
                      </>
                    )}
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
          <h2 className="text-xl md:text-2xl lg:text-3xl font-bold mb-4">
            Subscribe to Our Newsletter
          </h2>
          <p className="mb-8 max-w-2xl mx-auto text-sm md:text-base opacity-90">
            Get maintenance tips, special offers, and updates about our services
            directly to your inbox.
          </p>
          {newsletterDone ? (
            <div className="max-w-md mx-auto bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <p className="text-white font-medium">Thank you for subscribing!</p>
            </div>
          ) : (
            <form onSubmit={handleNewsletterSubmit} className="max-w-md mx-auto flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                required
                placeholder="Your email address"
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                className="flex-grow px-4 py-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300 text-gray-900 text-sm md:text-base"
              />
              <button
                type="submit"
                disabled={newsletterSubmitting}
                className="px-6 py-3 bg-white text-blue-800 font-medium rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-white transition duration-300 flex-shrink-0 disabled:opacity-60"
              >
                {newsletterSubmitting ? "Subscribing..." : "Subscribe"}
              </button>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}
