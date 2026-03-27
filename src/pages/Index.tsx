import React, { useState, useEffect } from 'react';
import { 

  Award, 
  Smile, 
  Wrench, 
  SatelliteDish, 
  Tv, 
  Zap, 
  Fan, 
  Snowflake, 
  Phone,
  MapPin,
  Mail,
  Clock,
  Instagram,
  Linkedin,
  Star,
  ChevronDown,
  ChevronUp,
  Check,
  ArrowRight,
  MessageCircle
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { PHONE_NUMBER } from "@/data/services";
import RequestServiceSection from '@/components/Requestservicesection';
import VideoSection from '@/components/VideoSection';
import ServiceCard2 from '@/components/ServiceCard2';
import WhatsAppFloat from '@/components/WhatsAppFloat';
import { useServices } from '@/hooks/useOptimizedData';

// Import images
import heroImage from '../images/hero.png';
import aboutImage from '../images/about.png';
import portfolio1 from '../images/portfolio-1.jpg';
import portfolio2 from '../images/portfolio-2.jpg';
import portfolio3 from '../images/portfolio-3.jpg';
import portfolio4 from '../images/portfolio-4.jpg';
import portfolio5 from '../images/portfolio-5.jpg';
import portfolio6 from '../images/portfolio-6.jpg';
import testimonial1 from '../images/testimonial-1.jpg';
import testimonial2 from '../images/testimonial-2.jpg';
import testimonial3 from '../images/testimonial-3.jpg';
import testimonial4 from '../images/testimonial-4.jpg';
import testimonial5 from '../images/testimonial-5.jpg';
import team1 from '../images/team-1.jpg';
import team2 from '../images/dilip.jpeg';
import team3 from '../images/team-3.jpg';

const Index: React.FC = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [backToTopVisible, setBackToTopVisible] = useState(false);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);
  const [counters, setCounters] = useState({ experience: 0, clients: 0, projects: 0 });
  const [counterAnimated, setCounterAnimated] = useState(false);
  const [preselectedService, setPreselectedService] = useState<string>("");
  const { services: dbServices, loading: servicesLoading } = useServices();
  const [services, setServices] = useState<any[]>([]);

  // Dark mode effect
  useEffect(() => {
    const isDark = localStorage.getItem('darkMode') === 'true' || 
      (!localStorage.getItem('darkMode') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    setDarkMode(isDark);
    if (isDark) document.documentElement.classList.add('dark');
  }, []);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
    localStorage.setItem('darkMode', String(!darkMode));
  };

  // Scroll effects
  useEffect(() => {
    const handleScroll = () => {
      setBackToTopVisible(window.pageYOffset > 300);
      
      // Counter animation trigger
      const statsSection = document.querySelector('.stats-counter');
      if (statsSection && !counterAnimated) {
        const rect = statsSection.getBoundingClientRect();
        if (rect.top < window.innerHeight) {
          setCounterAnimated(true);
          animateCounters();
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [counterAnimated]);

  const animateCounters = () => {
    const duration = 2000;
    const start = performance.now();
    
    const tick = () => {
      const now = performance.now();
      const progress = Math.min((now - start) / duration, 1);
      const ease = progress < 0.5 ? 4 * Math.pow(progress, 3) : 1 - Math.pow(-2 * progress + 2, 3) / 2;
      
      setCounters({
        experience: Math.floor(33 * ease),
        clients: Math.floor(36127 * ease),
        projects: Math.floor(36500 * ease)
      });
      
      if (progress < 1) requestAnimationFrame(tick);
    };
    
    tick();
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setMobileMenuOpen(false);
    }
  };

  const testimonials = [
    { name: 'Rahul Sharma', location: 'Ujjain', image: testimonial1, rating: 5, text: 'ElectrooBuddy fixed my AC within an hour of calling them. The technician was professional and explained everything clearly.' },
    { name: 'Priya Patel', location: 'Ujjain', image: testimonial2, rating: 5, text: 'I called ElectrooBuddy for an emergency electrical issue at midnight. They arrived in 30 minutes and fixed the problem safely.' },
    { name: 'Vikram Singh', location: 'Ujjain', image: testimonial3, rating: 5, text: 'Their team installed my new 65-inch TV perfectly on the wall. They handled everything from unpacking to cable management.' },
    { name: 'Anjali Verma', location: 'Ujjain', image: testimonial4, rating: 5, text: 'The technician arrived exactly on time and fixed our refrigerator quickly. Very reasonable pricing compared to other services.' },
    { name: 'Rajesh Gupta', location: 'Ujjain', image: testimonial5, rating: 5, text: 'I\'ve used ElectrooBuddy multiple times for different appliances. Always professional, and their work comes with a warranty.' }
  ];

  const faqs = [
    { question: 'How quickly can you respond to service requests?', answer: 'Our average response time is 45 minutes within Ujjain city. For emergency services, we aim to arrive within 30 minutes.' },
    { question: 'What are your service charges?', answer: 'We charge a standard diagnostic fee of ₹200 which is waived if you proceed with the repair. Our technicians provide a transparent cost estimate before starting any work.' },
    { question: 'Do you offer warranties on repairs?', answer: 'Yes, we offer a 90-day warranty on all repairs and a 1-year warranty on parts we install.' },
    { question: 'What payment methods do you accept?', answer: 'We accept cash, UPI payments (PhonePe, Google Pay, Paytm), and credit/debit cards.' },
    { question: 'Do you service appliances still under manufacturer warranty?', answer: 'We recommend first contacting the manufacturer for appliances under warranty, as unauthorized repairs may void it. However, we can assist with diagnostics.' }
  ];

  // const services = [
  //   { icon: SatelliteDish, title: 'DTH Installation & Reset', description: 'Professional installation and troubleshooting for all major DTH providers.' },
  //   { icon: Tv, title: 'LCD/LED TV Installation', description: 'Expert mounting and setup for your new television including wall mounting and complete AV setup.' },
  //   { icon: Zap, title: 'Short Circuit Repairs', description: '24/7 emergency electrical repairs by certified electricians.' },
  //   { icon: Fan, title: 'Fan Installation', description: 'Professional ceiling fan installation and repair with proper wiring and secure mounting.' },
  //   { icon: Snowflake, title: 'AC Maintenance', description: 'Seasonal AC servicing including cleaning, gas refill, and performance check.' },
  //   { icon: Wrench, title: 'Appliance Repairs', description: 'Comprehensive repair services for all major home appliances including refrigerators, washing machines, and more.' }
  // ];

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

  // Load services from database or fallback to static
  useEffect(() => {
    if (dbServices && dbServices.length > 0) {
      setServices(dbServices);
    } else {
      setServices(services.map(s => ({
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
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
        
        .index-page {
          font-family: 'Poppins', sans-serif;
        }

        .index-page h1,
        .index-page h2,
        .index-page h3,
        .index-page h4,
        .index-page h5,
        .index-page h6 {
          font-weight: 700;
        }
      `}</style>
    

  {/* Hero Section */}
      <section id="home" className="hero-gradient text-white py-20 md:py-32 slide-up">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-10 md:mb-0">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">India's Trusted Appliance Care & Repair Service</h1>
              <p className="text-xl mb-8 opacity-90">With over 30 years of experience, we provide quick, reliable, and professional appliance repair services at your doorstep.</p>
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <button onClick={() => scrollToSection('request-service')} className="bg-white text-blue-800 hover:bg-gray-100 px-8 py-4 rounded-lg font-semibold text-lg text-center transition duration-300">Request Service Now</button>
                <button onClick={() => scrollToSection('contact')} className="border-2 border-white hover:bg-white hover:text-blue-800 px-8 py-4 rounded-lg font-semibold text-lg text-center transition duration-300">Contact Us</button>
              </div>
            </div>
            <div className="md:w-1/2 relative">
              <img src={heroImage} alt="Professional appliance repair technician at work" className="rounded-lg shadow-2xl floating-button" loading="eager" />
              <div className="absolute -bottom-5 -left-5 bg-blue-700 dark:bg-blue-600 text-white px-6 py-3 rounded-lg shadow-lg">
                <div className="flex items-center">
                  <Zap className="text-2xl mr-2" />
                  <span className="font-bold">24/7 Emergency Service Available</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-white dark:bg-gray-800 py-16 fade-in">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="stats-counter bg-blue-50 dark:bg-gray-700 p-8 rounded-xl text-center transition duration-300">
              <div className="text-blue-800 dark:text-blue-400 text-5xl font-bold mb-2">{counters.experience}</div>
              <div className="text-gray-700 dark:text-gray-300 text-xl font-medium">Years of Experience</div>
              <Award className="mt-4 h-8 w-8 text-blue-600 dark:text-blue-400 mx-auto" />
            </div>
            <div className="stats-counter bg-blue-50 dark:bg-gray-700 p-8 rounded-xl text-center transition duration-300">
              <div className="text-blue-800 dark:text-blue-400 text-5xl font-bold mb-2">{counters.clients.toLocaleString()}</div>
              <div className="text-gray-700 dark:text-gray-300 text-xl font-medium">Satisfied Clients</div>
              <Smile className="mt-4 h-8 w-8 text-blue-600 dark:text-blue-400 mx-auto" />
            </div>
            <div className="stats-counter bg-blue-50 dark:bg-gray-700 p-8 rounded-xl text-center transition duration-300">
              <div className="text-blue-800 dark:text-blue-400 text-5xl font-bold mb-2">{counters.projects.toLocaleString()}+</div>
              <div className="text-gray-700 dark:text-gray-300 text-xl font-medium">Completed Projects</div>
              <Wrench className="mt-4 h-8 w-8 text-blue-600 dark:text-blue-400 mx-auto" />
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 bg-gray-50 dark:bg-gray-900 slide-up">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">About ElectrooBuddy</h2>
            <div className="w-20 h-1 bg-blue-600 mx-auto"></div>
          </div>
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-10 md:mb-0 md:pr-10">
              <img src={aboutImage} alt="ElectrooBuddy team working on appliance repair" className="rounded-lg shadow-lg" loading="lazy" />
            </div>
            <div className="md:w-1/2">
              <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Serving Ujjain Since 1992</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">Founded in 1992, ElectrooBuddy has grown from a small local repair shop to Ujjain's most trusted appliance care and repair service.</p>
              <div className="mb-6 space-y-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-1"><div className="flex items-center justify-center h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300"><Check className="h-4 w-4" /></div></div>
                  <div className="ml-3"><p className="text-gray-700 dark:text-gray-300 font-medium">30+ years of trusted service</p></div>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-1"><div className="flex items-center justify-center h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300"><Check className="h-4 w-4" /></div></div>
                  <div className="ml-3"><p className="text-gray-700 dark:text-gray-300 font-medium">Certified and experienced technicians</p></div>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-1"><div className="flex items-center justify-center h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300"><Check className="h-4 w-4" /></div></div>
                  <div className="ml-3"><p className="text-gray-700 dark:text-gray-300 font-medium">Quick response time (average 45 minutes)</p></div>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-1"><div className="flex items-center justify-center h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300"><Check className="h-4 w-4" /></div></div>
                  <div className="ml-3"><p className="text-gray-700 dark:text-gray-300 font-medium">Expanding nationwide with the same quality service</p></div>
                </div>
              </div>
              <button onClick={() => scrollToSection('services')} className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 transition duration-300">
                Explore Our Services <ArrowRight className="ml-2 h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 bg-white dark:bg-gray-800 fade-in">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">Our Services</h2>
            <div className="w-20 h-1 bg-blue-600 mx-auto"></div>
            <p className="mt-6 text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">We offer comprehensive appliance repair and maintenance services to keep your home running smoothly.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {servicesLoading ? (
              <div className="col-span-full flex justify-center py-12">
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
          <div className="mt-16 text-center">
            <a href={`tel:${PHONE_NUMBER}`} className="inline-flex items-center px-8 py-4 border border-transparent text-lg font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 transition duration-300">
              <Phone className="mr-2 h-5 w-5" /> Emergency Service: Call {PHONE_NUMBER}
            </a>
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section id="gallery" className="py-20 bg-gray-50 dark:bg-gray-900 fade-in">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">Our Work Gallery</h2>
            <div className="w-20 h-1 bg-blue-600 mx-auto"></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { img: portfolio1, title: 'Professional TV Mounting' },
              { img: portfolio2, title: 'AC Maintenance Service' },
              { img: portfolio3, title: 'Electrical Circuit Repair' },
              { img: portfolio4, title: 'DTH Satellite Setup' },
              { img: portfolio5, title: 'Refrigerator Maintenance' },
              { img: portfolio6, title: 'Ceiling Fan Installation' }
            ].map((item, index) => (
              <div key={index} className="overflow-hidden rounded-lg shadow-lg">
                <img src={item.img} alt={item.title} className="w-full h-64 object-cover transition duration-500 hover:scale-105" loading="lazy" />
                <div className="px-6 py-4 bg-white dark:bg-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{item.title}</h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Video Section - Using Component */}
      <VideoSection />

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 bg-white dark:bg-gray-800 slide-up">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">What Our Clients Say</h2>
            <div className="w-20 h-1 bg-blue-600 mx-auto"></div>
          </div>
          <div className="relative">
            <div className="flex overflow-x-auto pb-6 scrollbar-hide" style={{ scrollSnapType: 'x mandatory' }}>
              {testimonials.map((testimonial, index) => (
                <div key={index} className="testimonial-slide bg-gray-50 dark:bg-gray-700 p-8 rounded-lg shadow-md mx-4 flex-shrink-0" style={{ width: '320px', scrollSnapAlign: 'start' }}>
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
            <button onClick={prevTestimonial} className="absolute left-0 top-1/2 -translate-y-1/2 bg-white dark:bg-gray-700 p-2 rounded-full shadow-md hover:bg-gray-100 transition duration-300">
              <ChevronUp className="h-6 w-6 text-gray-700 dark:text-gray-300 rotate-[-90deg]" />
            </button>
            <button onClick={nextTestimonial} className="absolute right-0 top-1/2 -translate-y-1/2 bg-white dark:bg-gray-700 p-2 rounded-full shadow-md hover:bg-gray-100 transition duration-300">
              <ChevronUp className="h-6 w-6 text-gray-700 dark:text-gray-300 rotate-[90deg]" />
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
                <a href="https://g.page/r/CfQ3QZ4XJj5EEB0/review" target="_blank" rel="noopener noreferrer" className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition duration-300">
                  <MessageCircle className="mr-2 h-4 w-4" /> Leave a Review
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900 fade-in">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">Frequently Asked Questions</h2>
            <div className="w-20 h-1 bg-blue-600 mx-auto"></div>
          </div>
          <div className="max-w-3xl mx-auto space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                <button onClick={() => toggleFAQ(index)} className="w-full flex justify-between items-center p-6 text-left focus:outline-none">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">{faq.question}</h3>
                  <ChevronDown className={`h-5 w-5 text-blue-600 dark:text-blue-400 transition-transform duration-300 ${openFAQ === index ? 'rotate-180' : ''}`} />
                </button>
                {openFAQ === index && (
                  <div className="px-6 pb-6">
                    <p className="text-gray-600 dark:text-gray-300">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section id="team" className="py-20 bg-gray-50 dark:bg-gray-900 slide-up">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">Meet Our Team</h2>
            <div className="w-20 h-1 bg-blue-600 mx-auto"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              { name: 'Dilip Parihar', role: 'Founder & Chairman', image: team2, description: 'With over 30 years in the industry, Dilip built ElectrooBuddy from the ground up with a vision for quality service.' },
              { name: 'Viraj Parihar', role: 'Co-founder & CEO', image: team1, description: 'Viraj leads the company\'s expansion and digital transformation, bringing modern solutions to traditional services.' },
              { name: 'Karan Parihar', role: 'Co-founder & COO', image: team3, description: 'Karan oversees daily operations and technician training, ensuring consistent service quality.' }
            ].map((member, index) => (
              <div key={index} className="team-member text-center">
                <div className="overflow-hidden rounded-full h-48 w-48 mx-auto mb-6">
                  <img src={member.image} alt={member.name} className="h-full w-full object-cover transition duration-300 hover:scale-105" loading="lazy" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">{member.name}</h3>
                <p className="text-blue-600 dark:text-blue-400 font-medium mb-2">{member.role}</p>
                <p className="text-gray-600 dark:text-gray-300">{member.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Request Service Section - Using Component */}
      <RequestServiceSection preselectedService={preselectedService} />
         
      {/* Contact Section */}
      <section id="contact" className="py-20 bg-gray-50 dark:bg-gray-900 fade-in">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">Contact Us</h2>
            <div className="w-20 h-1 bg-blue-600 mx-auto"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Contact Information</h3>
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0 bg-blue-100 dark:bg-blue-900 p-3 rounded-lg"><MapPin className="text-blue-600 dark:text-blue-400 h-5 w-5" /></div>
                  <div className="ml-4">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Our Office</h4>
                    <a href="https://maps.app.goo.gl/X16Z1kxCfBUsKE9R9" target="_blank" rel="noopener noreferrer" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 transition duration-300">05, Nagziri Dewas Road, Ujjain(456010), India</a>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0 bg-blue-100 dark:bg-blue-900 p-3 rounded-lg"><Phone className="text-blue-600 dark:text-blue-400 h-5 w-5" /></div>
                  <div className="ml-4">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Phone</h4>
                    {/* <a href={`tel:${PHONE_NUMBER}`} className="text-gray-600 dark:text-gray-300 hover:text-blue-600 transition duration-300 block"></a> */}
                    <a href={`tel:${PHONE_NUMBER}`} className="text-gray-600 dark:text-gray-300 hover:text-blue-600 transition duration-300 block">{PHONE_NUMBER}</a>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0 bg-blue-100 dark:bg-blue-900 p-3 rounded-lg"><Mail className="text-blue-600 dark:text-blue-400 h-5 w-5" /></div>
                  <div className="ml-4">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Email</h4>
                    <a href="mailto:info@electroobuddy.com" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 transition duration-300 block">electroobuddy@gmail.com</a>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0 bg-blue-100 dark:bg-blue-900 p-3 rounded-lg"><Clock className="text-blue-600 dark:text-blue-400 h-5 w-5" /></div>
                  <div className="ml-4">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Working Hours</h4>
                    <p className="text-gray-600 dark:text-gray-300">Mon - Sat: 8:00 AM - 9:00 PM</p>
                    <p className="text-gray-600 dark:text-gray-300">Sunday: 24/7 Emergency Support Only</p>
                  </div>
                </div>
              </div>
              <div className="mt-8 flex space-x-4">
                <a href="#" className="bg-blue-100 dark:bg-gray-700 p-3 rounded-full text-blue-600 dark:text-blue-400 hover:bg-blue-200 transition duration-300"><Instagram className="h-5 w-5" /></a>
                <a href="#" className="bg-blue-100 dark:bg-gray-700 p-3 rounded-full text-blue-600 dark:text-blue-400 hover:bg-blue-200 transition duration-300"><Linkedin className="h-5 w-5" /></a>
              </div>
            </div>

            <div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Send Us a Message</h3>
              <form className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Full Name <span className="text-red-500">*</span></label>
                  <input type="text" className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:bg-gray-700 dark:text-white" placeholder="Rahul Sharma" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email Address <span className="text-red-500">*</span></label>
                  <input type="email" className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:bg-gray-700 dark:text-white" placeholder="rahul@example.com" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Subject <span className="text-red-500">*</span></label>
                  <input type="text" className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:bg-gray-700 dark:text-white" placeholder="AC not cooling" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Message <span className="text-red-500">*</span></label>
                  <textarea rows={4} className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:bg-gray-700 dark:text-white" placeholder="Tell us more about your issue..."></textarea>
                </div>
                <div>
                  <button type="submit" className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-300">
                    Send Message
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-16 bg-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Subscribe to Our Newsletter</h2>
          <p className="mb-8 max-w-2xl mx-auto">Get maintenance tips, special offers, and updates about our services directly to your inbox.</p>
          <form className="max-w-md mx-auto flex flex-col sm:flex-row gap-4">
            <input type="email" placeholder="Your email address" className="flex-grow px-4 py-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300 text-gray-900" />
            <button type="submit" className="px-6 py-3 bg-white text-blue-800 font-medium rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-white transition duration-300">
              Subscribe
            </button>
          </form>
        </div>
      </section>
    </div>
  );
};

export default Index;
