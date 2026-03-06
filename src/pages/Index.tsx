// import { Link } from "react-router-dom";
// import { useEffect, useState } from "react";
// import { motion } from "framer-motion";
// import { Zap, ArrowRight, Shield, Clock, BadgeDollarSign, HeartHandshake, Users } from "lucide-react";
// import Section from "@/components/Section";
// import ServiceCard from "@/components/ServiceCard";
// import AnimatedCounter from "@/components/AnimatedCounter";
// import ProcessTimeline from "@/components/ProcessTimeline";
// import TestimonialSlider from "@/components/TestimonialSlider";
// import { supabase } from "@/integrations/supabase/client";
// import { services as staticServices } from "@/data/services";
// import { teamMembers as staticTeam } from "@/data/team";
// import { testimonials as staticTestimonials } from "@/data/testimonials";

// const whyChooseUs = [
//   { icon: Shield, title: "Certified Electricians", description: "All our professionals are licensed, insured, and certified with rigorous training." },
//   { icon: Clock, title: "Fast Response", description: "24/7 availability with average response time under 30 minutes for emergencies." },
//   { icon: BadgeDollarSign, title: "Affordable Pricing", description: "Transparent, competitive pricing with no hidden fees. Get quotes upfront." },
//   { icon: HeartHandshake, title: "Safe & Reliable", description: "100% satisfaction guarantee with industry-leading safety standards." },
// ];

// const Index = () => {
//   const [dbServices, setDbServices] = useState<any[]>([]);
//   const [dbTeam, setDbTeam] = useState<any[]>([]);
//   const [dbTestimonials, setDbTestimonials] = useState<any[]>([]);

//   useEffect(() => {
//     supabase.from("services").select("*").order("sort_order").limit(4).then(({ data }) => setDbServices(data || []));
//     supabase.from("team_members").select("*").order("sort_order").then(({ data }) => setDbTeam(data || []));
//     supabase.from("testimonials").select("*").order("created_at", { ascending: false }).then(({ data }) => setDbTestimonials(data || []));
//   }, []);

//   const displayServices = dbServices.length > 0 ? dbServices : staticServices.slice(0, 4).map(s => ({ id: s.id, title: s.title, description: s.description, icon_name: "Zap", whatsapp_enabled: true, call_enabled: true, book_now_enabled: true }));
//   const displayTeam = dbTeam.length > 0 ? dbTeam : staticTeam;
//   const displayTestimonials = dbTestimonials.length > 0 ? dbTestimonials : staticTestimonials;

//   return (
//     <>
//       {/* Hero */}
//       <section className="relative bg-hero-premium min-h-screen flex items-center overflow-hidden">
//         {/* Enhanced animated background elements */}
//         <div className="absolute inset-0 overflow-hidden">
//           <div className="absolute top-1/4 -left-32 w-96 h-96 rounded-full bg-primary/10 blur-3xl float-animation" />
//           <div className="absolute bottom-1/4 -right-32 w-96 h-96 rounded-full bg-secondary/10 blur-3xl float-animation" style={{ animationDelay: '3s' }} />
//           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border border-primary/10" />
//           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full border border-primary/5" />
//           {/* Circuit pattern overlay */}
//           <div className="absolute inset-0 bg-circuit-pattern opacity-30" />
//           {/* Mesh gradient */}
//           <div className="absolute inset-0 bg-mesh-gradient opacity-50" />
//         </div>

//         <div className="container mx-auto px-4 relative z-10">
//           <div className="grid lg:grid-cols-2 gap-12 items-center">
//             <motion.div
//               initial={{ opacity: 0, x: -40 }}
//               animate={{ opacity: 1, x: 0 }}
//               transition={{ duration: 0.8, ease: "easeOut" }}
//             >
//               {/* Trust badge */}
//               <motion.div
//                 initial={{ opacity: 0, y: 20 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 transition={{ delay: 0.2 }}
//                 className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full border border-primary/30 bg-primary/15 backdrop-blur-sm text-primary-foreground/90 text-sm font-semibold mb-8 shadow-lg shadow-primary/10"
//               >
//                 <Zap className="w-4 h-4 text-secondary electric-pulse" /> 
//                 <span>Trusted by 1000+ Happy Customers</span>
//               </motion.div>

//               <h1 className="text-4xl md:text-5xl lg:text-7xl font-heading font-extrabold text-primary-foreground leading-tight mb-6 tracking-tight">
//                 Professional{" "}
//                 <span className="gradient-text">Electricians</span>{" "}
//                 at Your Doorstep
//               </h1>

//               <p className="text-lg md:text-xl text-primary-foreground/70 mb-10 max-w-lg leading-relaxed">
//                 Book trusted electricians for installation, repair, and maintenance. Fast, reliable, and affordable electrical services with 24/7 support.
//               </p>

//               <div className="flex flex-wrap gap-4 mb-10">
//                 <Link
//                   to="/booking"
//                   className="group inline-flex items-center gap-2.5 px-8 py-4 bg-gradient-to-r from-primary to-electric-blue-dark text-primary-foreground font-bold rounded-xl hover:shadow-2xl hover:shadow-primary/40 hover:-translate-y-1 transition-all duration-300 ripple text-base"
//                 >
//                   Book Service Now
//                   <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
//                 </Link>
//                 <Link
//                   to="/services"
//                   className="inline-flex items-center gap-2.5 px-8 py-4 border-2 border-primary-foreground/30 text-primary-foreground font-bold rounded-xl hover:bg-primary-foreground/10 hover:border-primary-foreground/50 hover:-translate-y-1 transition-all duration-300 text-base"
//                 >
//                   View All Services
//                 </Link>
//               </div>

//               {/* Trust indicators */}
//               <motion.div
//                 initial={{ opacity: 0, y: 20 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 transition={{ delay: 0.6 }}
//                 className="flex flex-wrap items-center gap-6 pt-6 border-t border-primary-foreground/10"
//               >
//                 <div className="flex items-center gap-2">
//                   <div className="flex -space-x-2">
//                     {[1, 2, 3, 4].map((i) => (
//                       <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 border-2 border-primary-foreground/20 flex items-center justify-center text-xs text-primary-foreground font-bold">
//                         {i}
//                       </div>
//                     ))}
//                   </div>
//                   <div className="text-sm">
//                     <div className="flex items-center gap-1">
//                       <span className="text-secondary font-bold">★</span>
//                       <span className="text-primary-foreground font-semibold">4.9/5</span>
//                     </div>
//                     <p className="text-xs text-primary-foreground/50">from 500+ reviews</p>
//                   </div>
//                 </div>
//                 <div className="h-8 w-px bg-primary-foreground/20" />
//                 <div className="text-sm text-primary-foreground/70">
//                   <span className="font-semibold text-primary-foreground">24/7</span> Emergency Support
//                 </div>
//               </motion.div>
//             </motion.div>

//             {/* Hero visual */}
//             <motion.div
//               initial={{ opacity: 0, scale: 0.9 }}
//               animate={{ opacity: 1, scale: 1 }}
//               transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
//               className="hidden lg:flex items-center justify-center"
//             >
//               <div className="relative">
//                 {/* Enhanced concentric circles with glow */}
//                 <div className="w-96 h-96 rounded-full bg-gradient-to-br from-primary/20 to-secondary/10 border-2 border-primary/30 flex items-center justify-center shadow-2xl shadow-primary/20 backdrop-blur-sm">
//                   <div className="w-72 h-72 rounded-full bg-gradient-to-br from-primary/25 to-secondary/15 border-2 border-primary/40 flex items-center justify-center shadow-xl shadow-primary/15 backdrop-blur-sm">
//                     <div className="w-48 h-48 rounded-full bg-gradient-to-br from-primary/30 to-secondary/20 border-2 border-primary/50 flex items-center justify-center shadow-lg shadow-primary/25 backdrop-blur-sm">
//                       <Zap className="w-28 h-28 text-secondary electric-pulse drop-shadow-2xl" />
//                     </div>
//                   </div>
//                 </div>
                
//                 {/* Enhanced floating badges with better styling */}
//                 <motion.div
//                   animate={{ y: [-5, 5, -5], x: [0, 3, 0] }}
//                   transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
//                   className="absolute -top-6 right-4 glass-card-dark px-5 py-3 rounded-2xl shadow-xl shadow-primary/10 border border-primary/20"
//                 >
//                   <div className="flex items-center gap-2.5">
//                     <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
//                       <Shield className="w-4 h-4 text-secondary" />
//                     </div>
//                     <div>
//                       <p className="text-xs text-primary-foreground/60 font-medium">Certification</p>
//                       <p className="text-sm text-primary-foreground font-bold">Licensed & Insured</p>
//                     </div>
//                   </div>
//                 </motion.div>
                
//                 <motion.div
//                   animate={{ y: [5, -5, 5], x: [0, -3, 0] }}
//                   transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
//                   className="absolute -bottom-6 left-4 glass-card-dark px-5 py-3 rounded-2xl shadow-xl shadow-primary/10 border border-primary/20"
//                 >
//                   <div className="flex items-center gap-2.5">
//                     <div className="w-8 h-8 rounded-lg bg-secondary/20 flex items-center justify-center">
//                       <Clock className="w-4 h-4 text-secondary" />
//                     </div>
//                     <div>
//                       <p className="text-xs text-primary-foreground/60 font-medium">Availability</p>
//                       <p className="text-sm text-primary-foreground font-bold">24/7 Service</p>
//                     </div>
//                   </div>
//                 </motion.div>

//                 {/* Additional badge */}
//                 <motion.div
//                   animate={{ y: [-3, 3, -3] }}
//                   transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
//                   className="absolute top-1/2 -right-8 glass-card-dark px-5 py-3 rounded-2xl shadow-xl shadow-primary/10 border border-primary/20"
//                 >
//                   <div className="flex items-center gap-2.5">
//                     <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
//                       <BadgeDollarSign className="w-4 h-4 text-primary" />
//                     </div>
//                     <div>
//                       <p className="text-xs text-primary-foreground/60 font-medium">Pricing</p>
//                       <p className="text-sm text-primary-foreground font-bold">Transparent</p>
//                     </div>
//                   </div>
//                 </motion.div>
//               </div>
//             </motion.div>
//           </div>
//         </div>
//       </section>

//       {/* Stats */}
//       <section className="relative -mt-20 z-20">
//         <div className="container mx-auto px-4">
//           <motion.div
//             initial={{ opacity: 0, y: 30 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ delay: 0.6, duration: 0.6 }}
//             className="glass-card rounded-3xl p-8 md:p-12 shadow-2xl shadow-primary/10 border border-primary/20"
//           >
//             <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-10">
//               <AnimatedCounter end={500} suffix="+" label="Happy Customers" />
//               <AnimatedCounter end={1000} suffix="+" label="Repairs Done" />
//               <AnimatedCounter end={10} suffix="+" label="Expert Electricians" />
//               <AnimatedCounter end={5} suffix="+" label="Years Experience" />
//             </div>
//           </motion.div>
//         </div>
//       </section>

//       {/* Services */}
//       <Section>
//         <div className="text-center mb-16">
//           <motion.span
//             initial={{ opacity: 0, scale: 0.9 }}
//             whileInView={{ opacity: 1, scale: 1 }}
//             viewport={{ once: true }}
//             transition={{ delay: 0.2, duration: 0.4 }}
//             className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full bg-gradient-to-r from-primary/15 to-secondary/15 text-primary text-sm font-bold mb-6 shadow-lg shadow-primary/10 border border-primary/20"
//           >
//             <Zap className="w-4 h-4" />
//             What We Offer
//           </motion.span>
//           <motion.h2 
//             initial={{ opacity: 0, y: 20 }}
//             whileInView={{ opacity: 1, y: 0 }}
//             viewport={{ once: true }}
//             transition={{ delay: 0.3, duration: 0.5 }}
//             className="text-3xl md:text-4xl lg:text-5xl font-heading font-extrabold text-foreground tracking-tight"
//           >
//             Our Professional <span className="text-gradient-blue">Services</span>
//           </motion.h2>
//           <motion.p 
//             initial={{ opacity: 0, y: 20 }}
//             whileInView={{ opacity: 1, y: 0 }}
//             viewport={{ once: true }}
//             transition={{ delay: 0.4, duration: 0.5 }}
//             className="text-muted-foreground mt-5 max-w-2xl mx-auto leading-relaxed text-lg"
//           >
//             From simple repairs to complex installations, our certified electricians handle it all with precision and care.
//           </motion.p>
//         </div>
//         <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
//           {displayServices.map((s, i) => (
//             <motion.div
//               key={s.id}
//               initial={{ opacity: 0, y: 30 }}
//               whileInView={{ opacity: 1, y: 0 }}
//               viewport={{ once: true }}
//               transition={{ delay: i * 0.1, duration: 0.5 }}
//             >
//               <ServiceCard service={s} />
//             </motion.div>
//           ))}
//         </div>
//         <motion.div 
//           initial={{ opacity: 0, y: 20 }}
//           whileInView={{ opacity: 1, y: 0 }}
//           viewport={{ once: true }}
//           transition={{ delay: 0.5, duration: 0.5 }}
//           className="text-center mt-16"
//         >
//           <Link
//             to="/services"
//             className="group inline-flex items-center gap-2.5 px-8 py-4 border-2 border-primary/30 text-primary font-bold rounded-xl hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/20"
//           >
//             View All Services 
//             <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
//           </Link>
//         </motion.div>
//       </Section>

//       {/* Why Choose Us */}
//       <Section className="bg-muted/50">
//         <div className="text-center mb-16">
//           <motion.span
//             initial={{ opacity: 0, scale: 0.9 }}
//             whileInView={{ opacity: 1, scale: 1 }}
//             viewport={{ once: true }}
//             transition={{ delay: 0.2, duration: 0.4 }}
//             className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full bg-gradient-to-r from-secondary/20 to-primary/10 text-secondary-foreground text-sm font-bold mb-6 shadow-lg shadow-secondary/10 border border-secondary/20"
//           >
//             Why Choose Us
//           </motion.span>
//           <motion.h2
//             initial={{ opacity: 0, y: 20 }}
//             whileInView={{ opacity: 1, y: 0 }}
//             viewport={{ once: true }}
//             transition={{ delay: 0.3, duration: 0.5 }}
//             className="text-3xl md:text-4xl lg:text-5xl font-heading font-extrabold text-foreground tracking-tight"
//           >
//             Reliable Solutions <span className="text-gradient">You Can Trust</span>
//           </motion.h2>
//         </div>
//         <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
//           {whyChooseUs.map((item, i) => (
//             <motion.div
//               key={item.title}
//               initial={{ opacity: 0, y: 30 }}
//               whileInView={{ opacity: 1, y: 0 }}
//               viewport={{ once: true }}
//               transition={{ delay: i * 0.1, duration: 0.5 }}
//               className="group relative bg-card border-2 border-border/50 rounded-2xl p-8 hover-lift hover-glow-premium cursor-default overflow-hidden"
//             >
//               {/* Background gradient on hover */}
//               <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
//               <div className="relative z-10">
//                 {/* Icon with number badge */}
//                 <div className="flex items-start justify-between mb-6">
//                   <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/15 to-secondary/15 flex items-center justify-center group-hover:scale-110 group-hover:from-primary group-hover:to-electric-blue-dark transition-all duration-500 shadow-lg shadow-primary/10 group-hover:shadow-xl group-hover:shadow-primary/25">
//                     <item.icon className="w-8 h-8 text-primary group-hover:text-primary-foreground transition-colors duration-500" />
//                   </div>
//                   <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary border-2 border-primary/20">
//                     {i + 1}
//                   </div>
//                 </div>
                
//                 <h3 className="font-heading font-bold text-foreground text-xl mb-3">{item.title}</h3>
//                 <p className="text-base text-muted-foreground leading-relaxed">{item.description}</p>
//               </div>
//             </motion.div>
//           ))}
//         </div>
//       </Section>

//       {/* Process */}
//       <Section>
//         <div className="text-center mb-14">
//           <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-4">
//             How It Works
//           </span>
//           <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-foreground">
//             Our Simple <span className="text-gradient-blue">Process</span>
//           </h2>
//           <p className="text-muted-foreground mt-4 max-w-xl mx-auto">
//             Getting your electrical issues resolved is easy with our streamlined process.
//           </p>
//         </div>
//         <ProcessTimeline />
//       </Section>

//       {/* Team */}
//       <Section className="bg-muted/50">
//         <div className="text-center mb-16">
//           <motion.span
//             initial={{ opacity: 0, scale: 0.9 }}
//             whileInView={{ opacity: 1, scale: 1 }}
//             viewport={{ once: true }}
//             transition={{ delay: 0.2, duration: 0.4 }}
//             className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full bg-gradient-to-r from-secondary/20 to-primary/10 text-secondary-foreground text-sm font-bold mb-6 shadow-lg shadow-secondary/10 border border-secondary/20"
//           >
//             Our Experts
//           </motion.span>
//           <motion.h2
//             initial={{ opacity: 0, y: 20 }}
//             whileInView={{ opacity: 1, y: 0 }}
//             viewport={{ once: true }}
//             transition={{ delay: 0.3, duration: 0.5 }}
//             className="text-3xl md:text-4xl lg:text-5xl font-heading font-extrabold text-foreground tracking-tight"
//           >
//             Meet Our <span className="text-gradient">Team</span>
//           </motion.h2>
//         </div>
//         <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
//           {displayTeam.map((m, i) => (
//             <motion.div
//               key={m.id}
//               initial={{ opacity: 0, y: 30 }}
//               whileInView={{ opacity: 1, y: 0 }}
//               viewport={{ once: true }}
//               transition={{ delay: i * 0.1, duration: 0.5 }}
//               className="group relative bg-card border-2 border-border/50 rounded-2xl p-8 text-center hover-lift hover-glow-premium overflow-hidden"
//             >
//               {/* Background gradient */}
//               <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
//               <div className="relative z-10">
//                 {/* Enhanced avatar placeholder */}
//                 <div className="relative mb-6 inline-block">
//                   <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary/20 via-secondary/20 to-primary/20 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-500 border-4 border-primary/10 group-hover:border-primary/20 shadow-xl shadow-primary/10">
//                     <Users className="w-10 h-10 text-primary" />
//                   </div>
//                   {/* Decorative ring */}
//                   <div className="absolute inset-0 rounded-full border-2 border-dashed border-primary/30 scale-110 opacity-0 group-hover:scale-125 group-hover:opacity-100 transition-all duration-500 animate-spin-slow" />
//                 </div>
                
//                 <h3 className="font-heading font-bold text-foreground text-xl">{m.name}</h3>
//                 <p className="text-sm text-primary font-bold mt-2 bg-primary/10 inline-block px-3 py-1 rounded-full">{m.role}</p>
//                 <p className="text-sm text-muted-foreground mt-4 leading-relaxed line-clamp-3">{m.bio}</p>
//               </div>
//             </motion.div>
//           ))}
//         </div>
//       </Section>

//       {/* Testimonials */}
//       <Section>
//         <div className="text-center mb-14">
//           <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-4">
//             Testimonials
//           </span>
//           <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-foreground">
//             What Our <span className="text-gradient-blue">Clients Say</span>
//           </h2>
//         </div>
//         <TestimonialSlider testimonials={displayTestimonials} />
//       </Section>

//       {/* CTA */}
//       <section className="relative overflow-hidden">
//         <div className="bg-hero-premium py-24">
//           <div className="absolute inset-0">
//             <div className="absolute top-0 left-1/4 w-64 h-64 rounded-full bg-primary/10 blur-3xl" />
//             <div className="absolute bottom-0 right-1/4 w-64 h-64 rounded-full bg-secondary/10 blur-3xl" />
//           </div>
//           <div className="container mx-auto px-4 text-center relative z-10">
//             <motion.div
//               initial={{ opacity: 0, y: 30 }}
//               whileInView={{ opacity: 1, y: 0 }}
//               viewport={{ once: true }}
//               transition={{ duration: 0.6 }}
//             >
//               <Zap className="w-12 h-12 text-secondary mx-auto mb-6 electric-pulse" />
//               <h2 className="text-3xl md:text-5xl font-heading font-bold text-primary-foreground mb-4">
//                 Need an Electrician Today?
//               </h2>
//               <p className="text-primary-foreground/60 mb-10 max-w-lg mx-auto text-lg">
//                 Book a professional electrician and get your electrical issues resolved quickly and safely.
//               </p>
//               <div className="flex flex-wrap justify-center gap-4">
//                 <Link
//                   to="/booking"
//                   className="group inline-flex items-center gap-2 px-8 py-4 bg-secondary text-secondary-foreground font-bold rounded-xl hover:shadow-lg hover:shadow-secondary/25 transition-all duration-300"
//                 >
//                   Book Now <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
//                 </Link>
//                 <Link
//                   to="/contact"
//                   className="inline-flex items-center gap-2 px-8 py-4 border border-primary-foreground/20 text-primary-foreground font-bold rounded-xl hover:bg-primary-foreground/5 transition-all duration-300"
//                 >
//                   Contact Us
//                 </Link>
//               </div>
//             </motion.div>
//           </div>
//         </div>
//       </section>
//     </>
//   );
// };

// export default Index;

import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Zap, ArrowRight, Shield, Clock, BadgeDollarSign, HeartHandshake, Users } from "lucide-react";
import Section from "@/components/Section";
import ServiceCard from "@/components/ServiceCard";
import AnimatedCounter from "@/components/AnimatedCounter";
import ProcessTimeline from "@/components/ProcessTimeline";
import TestimonialSlider from "@/components/TestimonialSlider";
import { supabase } from "@/integrations/supabase/client";
import { services as staticServices } from "@/data/services";
import { teamMembers as staticTeam } from "@/data/team";
import { testimonials as staticTestimonials } from "@/data/testimonials";

const whyChooseUs = [
  { icon: Shield, title: "Certified Electricians", description: "All our professionals are licensed, insured, and certified with rigorous training.", accent: "#ffc800" },
  { icon: Clock, title: "Fast Response", description: "24/7 availability with average response time under 30 minutes for emergencies.", accent: "#38bdf8" },
  { icon: BadgeDollarSign, title: "Affordable Pricing", description: "Transparent, competitive pricing with no hidden fees. Get quotes upfront.", accent: "#a78bfa" },
  { icon: HeartHandshake, title: "Safe & Reliable", description: "100% satisfaction guarantee with industry-leading safety standards.", accent: "#34d399" },
];

const Index = () => {
  const [dbServices, setDbServices] = useState<any[]>([]);
  const [dbTeam, setDbTeam] = useState<any[]>([]);
  const [dbTestimonials, setDbTestimonials] = useState<any[]>([]);

  useEffect(() => {
    supabase.from("services").select("*").order("sort_order").limit(4).then(({ data }) => setDbServices(data || []));
    supabase.from("team_members").select("*").order("sort_order").then(({ data }) => setDbTeam(data || []));
    supabase.from("testimonials").select("*").order("created_at", { ascending: false }).then(({ data }) => setDbTestimonials(data || []));
  }, []);

  const displayServices = dbServices.length > 0 ? dbServices : staticServices.slice(0, 4).map(s => ({ id: s.id, title: s.title, description: s.description, icon_name: "Zap", whatsapp_enabled: true, call_enabled: true, book_now_enabled: true }));
  const displayTeam = dbTeam.length > 0 ? dbTeam : staticTeam;
  const displayTestimonials = dbTestimonials.length > 0 ? dbTestimonials : staticTestimonials;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700;800;900&family=DM+Sans:wght@400;500;600&display=swap');

        /* ── HERO ── */
        .hero-section {
          position: relative;
          min-height: 100vh;
          display: flex;
          align-items: center;
          overflow: hidden;
          background: #050b18;
          font-family: 'DM Sans', sans-serif;
        }

        .hero-grid {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(255,200,0,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,200,0,0.04) 1px, transparent 1px);
          background-size: 60px 60px;
          mask-image: radial-gradient(ellipse 80% 80% at 30% 50%, black 0%, transparent 100%);
        }

        .hero-glow-1 {
          position: absolute;
          top: 20%; left: -120px;
          width: 500px; height: 500px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(255,200,0,0.08) 0%, transparent 70%);
          animation: floatGlow 6s ease-in-out infinite;
        }

        .hero-glow-2 {
          position: absolute;
          bottom: 10%; right: -80px;
          width: 400px; height: 400px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(56,189,248,0.06) 0%, transparent 70%);
          animation: floatGlow 8s ease-in-out infinite reverse;
          animation-delay: 2s;
        }

        .hero-ring-1 {
          position: absolute;
          top: 50%; left: 60%;
          transform: translate(-50%, -50%);
          width: 700px; height: 700px;
          border-radius: 50%;
          border: 1px solid rgba(255,200,0,0.06);
          pointer-events: none;
        }

        .hero-ring-2 {
          position: absolute;
          top: 50%; left: 60%;
          transform: translate(-50%, -50%);
          width: 500px; height: 500px;
          border-radius: 50%;
          border: 1px solid rgba(255,200,0,0.05);
          pointer-events: none;
        }

        @keyframes floatGlow {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }

        /* Hero content */
        .hero-trust-badge {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 9px 20px;
          border: 1px solid rgba(255,200,0,0.3);
          border-radius: 100px;
          background: rgba(255,200,0,0.07);
          backdrop-filter: blur(8px);
          margin-bottom: 28px;
          font-size: 13px;
          font-weight: 600;
          color: rgba(220,230,255,0.85);
          letter-spacing: 0.3px;
        }

        .hero-trust-badge span { color: #ffc800; }

        .hero-h1 {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: clamp(52px, 8vw, 96px);
          font-weight: 900;
          line-height: 0.9;
          text-transform: uppercase;
          letter-spacing: -2px;
          color: #f0f4ff;
          margin-bottom: 24px;
        }

        .hero-h1-accent {
          background: linear-gradient(135deg, #ffc800 0%, #ffec6e 50%, #ff8c00 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          display: block;
        }

        .hero-desc {
          font-size: 17px;
          color: rgba(180,200,240,0.6);
          line-height: 1.75;
          max-width: 480px;
          margin-bottom: 36px;
        }

        .hero-btns {
          display: flex;
          flex-wrap: wrap;
          gap: 14px;
          margin-bottom: 40px;
        }

        .hero-btn-primary {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 15px 32px;
          background: linear-gradient(135deg, #ffc800, #ffaa00);
          color: #0a0f1e;
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 17px;
          font-weight: 800;
          letter-spacing: 0.6px;
          text-transform: uppercase;
          border-radius: 12px;
          text-decoration: none;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }

        .hero-btn-primary:hover {
          box-shadow: 0 0 36px rgba(255,200,0,0.45), 0 8px 24px rgba(255,160,0,0.3);
          transform: translateY(-2px);
        }

        .hero-btn-secondary {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 15px 32px;
          border: 1.5px solid rgba(255,200,0,0.3);
          color: rgba(220,230,255,0.8);
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 17px;
          font-weight: 700;
          letter-spacing: 0.6px;
          text-transform: uppercase;
          border-radius: 12px;
          text-decoration: none;
          transition: all 0.3s ease;
          background: rgba(255,200,0,0.04);
        }

        .hero-btn-secondary:hover {
          border-color: rgba(255,200,0,0.6);
          color: #ffc800;
          background: rgba(255,200,0,0.08);
        }

        /* Trust strip */
        .hero-trust-strip {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 20px;
          padding-top: 24px;
          border-top: 1px solid rgba(255,200,0,0.1);
        }

        .trust-avatars {
          display: flex;
          align-items: center;
        }

        .trust-avatar {
          width: 34px;
          height: 34px;
          border-radius: 50%;
          background: linear-gradient(135deg, rgba(255,200,0,0.2), rgba(255,140,0,0.1));
          border: 2px solid rgba(255,200,0,0.25);
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 13px;
          font-weight: 700;
          color: #ffc800;
          margin-left: -8px;
        }

        .trust-avatar:first-child { margin-left: 0; }

        .trust-rating-label {
          font-size: 11px;
          color: rgba(180,200,240,0.45);
          margin-top: 2px;
        }

        .trust-rating-val {
          font-size: 14px;
          font-weight: 700;
          color: #f0f4ff;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .trust-star { color: #ffc800; }

        .trust-sep {
          width: 1px;
          height: 28px;
          background: rgba(255,200,0,0.12);
        }

        .trust-text {
          font-size: 13px;
          color: rgba(180,200,240,0.5);
        }

        .trust-text strong { color: #f0f4ff; }

        /* ── HERO VISUAL ── */
        .hero-visual {
          display: none;
          align-items: center;
          justify-content: center;
          position: relative;
        }

        @media (min-width: 1024px) { .hero-visual { display: flex; } }

        .orb-outer {
          position: relative;
          width: 400px;
          height: 400px;
          border-radius: 50%;
          border: 1.5px solid rgba(255,200,0,0.2);
          background: radial-gradient(circle at 40% 40%, rgba(255,200,0,0.07), transparent 60%);
          display: flex;
          align-items: center;
          justify-content: center;
          animation: orbFloat 6s ease-in-out infinite;
        }

        @keyframes orbFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-12px); }
        }

        .orb-mid {
          width: 290px;
          height: 290px;
          border-radius: 50%;
          border: 1.5px solid rgba(255,200,0,0.25);
          background: radial-gradient(circle at 40% 40%, rgba(255,200,0,0.1), transparent 70%);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .orb-inner {
          width: 180px;
          height: 180px;
          border-radius: 50%;
          border: 2px solid rgba(255,200,0,0.4);
          background: radial-gradient(circle, rgba(255,200,0,0.12), rgba(10,15,30,0.95) 70%);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 0 60px rgba(255,200,0,0.15), inset 0 0 40px rgba(255,200,0,0.05);
        }

        .orb-zap {
          color: #ffc800;
          filter: drop-shadow(0 0 20px rgba(255,200,0,0.6));
          animation: zapPulse 2s ease-in-out infinite;
        }

        @keyframes zapPulse {
          0%, 100% { filter: drop-shadow(0 0 20px rgba(255,200,0,0.6)); transform: scale(1); }
          50% { filter: drop-shadow(0 0 36px rgba(255,200,0,0.9)); transform: scale(1.05); }
        }

        /* Floating badges */
        .hero-badge {
          position: absolute;
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 16px;
          background: rgba(10,15,30,0.95);
          border: 1px solid rgba(255,200,0,0.2);
          border-radius: 14px;
          backdrop-filter: blur(12px);
          box-shadow: 0 8px 32px rgba(0,0,0,0.4);
        }

        .badge-icon {
          width: 34px;
          height: 34px;
          border-radius: 10px;
          background: rgba(255,200,0,0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #ffc800;
          flex-shrink: 0;
        }

        .badge-label {
          font-size: 10px;
          color: rgba(180,200,240,0.45);
          font-family: 'DM Sans', sans-serif;
          margin-bottom: 2px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .badge-value {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 15px;
          font-weight: 700;
          color: #f0f4ff;
          line-height: 1;
        }

        /* ── STATS BAR ── */
        .stats-bar {
          position: relative;
          z-index: 20;
          margin-top: -52px;
        }

        .stats-card {
          background: #0a0f1e;
          border: 1px solid rgba(255,200,0,0.18);
          border-radius: 20px;
          padding: 36px 40px;
          box-shadow: 0 24px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,200,0,0.06);
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 24px;
        }

        @media (min-width: 768px) {
          .stats-card { grid-template-columns: repeat(4, 1fr); }
        }

        .stats-sep {
          display: none;
          width: 1px;
          background: linear-gradient(180deg, transparent, rgba(255,200,0,0.15), transparent);
        }

        @media (min-width: 768px) { .stats-sep { display: block; } }

        /* ── SECTION LABELS ── */
        .sec-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 7px 18px;
          border: 1px solid rgba(255,200,0,0.25);
          border-radius: 100px;
          background: rgba(255,200,0,0.06);
          margin-bottom: 16px;
          font-size: 12px;
          font-weight: 700;
          color: #ffc800;
          letter-spacing: 1px;
          text-transform: uppercase;
          font-family: 'Barlow Condensed', sans-serif;
        }

        .sec-title {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: clamp(32px, 4.5vw, 52px);
          font-weight: 900;
          text-transform: uppercase;
          color: #f0f4ff;
          letter-spacing: -0.5px;
          line-height: 1;
          margin-bottom: 16px;
        }

        .sec-title span {
          background: linear-gradient(135deg, #ffc800, #ffec6e);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .sec-desc {
          font-size: 15px;
          color: rgba(180,200,240,0.55);
          line-height: 1.7;
          max-width: 560px;
          margin: 0 auto;
        }

        /* ── WHY CHOOSE US CARDS ── */
        .why-card {
          position: relative;
          background: #0a0f1e;
          border: 1px solid rgba(255,200,0,0.1);
          border-radius: 20px;
          padding: 32px 28px;
          overflow: hidden;
          font-family: 'DM Sans', sans-serif;
          transition: all 0.4s cubic-bezier(0.23, 1, 0.32, 1);
          cursor: default;
        }

        .why-card::after {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 2px;
          background: linear-gradient(90deg, transparent, var(--card-accent), transparent);
          opacity: 0;
          transition: opacity 0.4s;
        }

        .why-card:hover {
          transform: translateY(-6px);
          border-color: rgba(255,200,0,0.3);
          box-shadow: 0 24px 60px rgba(0,0,0,0.45), 0 0 40px rgba(255,200,0,0.05);
        }

        .why-card:hover::after { opacity: 1; }

        .why-icon-hex {
          position: relative;
          width: 60px;
          height: 60px;
          margin-bottom: 22px;
        }

        .why-hex-bg {
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(255,200,0,0.14), rgba(255,200,0,0.04));
          clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
          transition: all 0.4s ease;
        }

        .why-card:hover .why-hex-bg {
          background: linear-gradient(135deg, var(--card-accent), rgba(255,200,0,0.6));
        }

        .why-hex-icon {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--card-accent);
          transition: color 0.4s;
        }

        .why-card:hover .why-hex-icon { color: #0a0f1e; }

        .why-num {
          position: absolute;
          top: 20px; right: 20px;
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 40px;
          font-weight: 900;
          color: rgba(255,200,0,0.04);
          line-height: 1;
          user-select: none;
        }

        .why-title {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 20px;
          font-weight: 800;
          text-transform: uppercase;
          color: #f0f4ff;
          margin-bottom: 10px;
          letter-spacing: 0.3px;
        }

        .why-desc {
          font-size: 13.5px;
          color: rgba(180,200,240,0.58);
          line-height: 1.7;
        }

        /* ── TEAM CARDS ── */
        .team-card {
          position: relative;
          background: #0a0f1e;
          border: 1px solid rgba(255,200,0,0.1);
          border-radius: 20px;
          padding: 32px 24px;
          text-align: center;
          overflow: hidden;
          font-family: 'DM Sans', sans-serif;
          transition: all 0.4s cubic-bezier(0.23, 1, 0.32, 1);
        }

        .team-card::after {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 2px;
          background: linear-gradient(90deg, transparent, #ffc800, transparent);
          opacity: 0;
          transition: opacity 0.4s;
        }

        .team-card:hover {
          transform: translateY(-6px);
          border-color: rgba(255,200,0,0.3);
          box-shadow: 0 20px 50px rgba(0,0,0,0.45);
        }

        .team-card:hover::after { opacity: 1; }

        .team-avatar {
          position: relative;
          width: 88px;
          height: 88px;
          margin: 0 auto 18px;
        }

        .avatar-spin-ring {
          position: absolute;
          inset: -5px;
          border-radius: 50%;
          border: 1.5px solid rgba(255,200,0,0.18);
          border-top-color: rgba(255,200,0,0.6);
          animation: avatarSpin 8s linear infinite;
        }

        @keyframes avatarSpin { to { transform: rotate(360deg); } }

        .avatar-circle {
          width: 88px;
          height: 88px;
          border-radius: 50%;
          background: linear-gradient(135deg, rgba(255,200,0,0.1), rgba(255,140,0,0.05));
          border: 1.5px solid rgba(255,200,0,0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          color: rgba(255,200,0,0.5);
          transition: all 0.4s;
        }

        .team-card:hover .avatar-circle {
          border-color: rgba(255,200,0,0.5);
          background: rgba(255,200,0,0.12);
          color: #ffc800;
          box-shadow: 0 0 24px rgba(255,200,0,0.15);
        }

        .team-name {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 20px;
          font-weight: 800;
          text-transform: uppercase;
          color: #f0f4ff;
          margin-bottom: 4px;
        }

        .team-role {
          display: inline-block;
          font-size: 11px;
          font-weight: 700;
          color: #ffc800;
          letter-spacing: 0.8px;
          text-transform: uppercase;
          background: rgba(255,200,0,0.08);
          border: 1px solid rgba(255,200,0,0.18);
          border-radius: 100px;
          padding: 3px 12px;
          margin-bottom: 12px;
        }

        .team-bio {
          font-size: 13px;
          color: rgba(180,200,240,0.5);
          line-height: 1.65;
        }

        /* ── VIEW ALL BTN ── */
        .view-all-btn {
          display: inline-flex;
          align-items: center;
          gap: 9px;
          padding: 13px 32px;
          border: 1.5px solid rgba(255,200,0,0.25);
          color: #ffc800;
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 16px;
          font-weight: 800;
          letter-spacing: 0.6px;
          text-transform: uppercase;
          border-radius: 12px;
          text-decoration: none;
          background: rgba(255,200,0,0.04);
          transition: all 0.3s ease;
          margin-top: 48px;
        }

        .view-all-btn:hover {
          background: #ffc800;
          color: #0a0f1e;
          border-color: #ffc800;
          box-shadow: 0 0 28px rgba(255,200,0,0.35);
          transform: translateY(-2px);
        }

        /* ── CTA SECTION ── */
        .cta-section {
          position: relative;
          overflow: hidden;
          background: #050b18;
          padding: 100px 0;
          text-align: center;
          font-family: 'DM Sans', sans-serif;
        }

        .cta-grid {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(255,200,0,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,200,0,0.04) 1px, transparent 1px);
          background-size: 60px 60px;
          mask-image: radial-gradient(ellipse 70% 80% at 50% 50%, black 20%, transparent 100%);
        }

        .cta-glow {
          position: absolute;
          top: 50%; left: 50%;
          transform: translate(-50%, -50%);
          width: 600px; height: 400px;
          background: radial-gradient(ellipse, rgba(255,200,0,0.08) 0%, transparent 70%);
          pointer-events: none;
        }

        .cta-zap-ring {
          position: relative;
          width: 80px;
          height: 80px;
          margin: 0 auto 28px;
          border-radius: 50%;
          border: 2px solid rgba(255,200,0,0.25);
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255,200,0,0.06);
          box-shadow: 0 0 40px rgba(255,200,0,0.15);
        }

        .cta-title {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: clamp(36px, 5vw, 64px);
          font-weight: 900;
          text-transform: uppercase;
          color: #f0f4ff;
          letter-spacing: -1px;
          line-height: 0.95;
          margin-bottom: 16px;
        }

        .cta-title span {
          background: linear-gradient(135deg, #ffc800, #ffec6e);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .cta-desc {
          font-size: 15px;
          color: rgba(180,200,240,0.5);
          max-width: 440px;
          margin: 0 auto 36px;
          line-height: 1.7;
        }

        .cta-btns {
          display: flex;
          flex-wrap: wrap;
          gap: 14px;
          justify-content: center;
        }

        .cta-btn-primary {
          display: inline-flex;
          align-items: center;
          gap: 9px;
          padding: 15px 36px;
          background: linear-gradient(135deg, #ffc800, #ffaa00);
          color: #0a0f1e;
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 17px;
          font-weight: 800;
          letter-spacing: 0.6px;
          text-transform: uppercase;
          border-radius: 12px;
          text-decoration: none;
          transition: all 0.3s ease;
        }

        .cta-btn-primary:hover {
          box-shadow: 0 0 32px rgba(255,200,0,0.45), 0 6px 20px rgba(255,160,0,0.3);
          transform: translateY(-2px);
        }

        .cta-btn-secondary {
          display: inline-flex;
          align-items: center;
          gap: 9px;
          padding: 15px 32px;
          border: 1.5px solid rgba(255,200,0,0.25);
          color: rgba(220,230,255,0.75);
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 17px;
          font-weight: 700;
          letter-spacing: 0.6px;
          text-transform: uppercase;
          border-radius: 12px;
          text-decoration: none;
          background: rgba(255,200,0,0.04);
          transition: all 0.3s;
        }

        .cta-btn-secondary:hover {
          border-color: rgba(255,200,0,0.5);
          color: #ffc800;
          background: rgba(255,200,0,0.08);
        }
      `}</style>

      {/* ── HERO ── */}
      <section className="hero-section">
        <div className="hero-grid" />
        <div className="hero-glow-1" />
        <div className="hero-glow-2" />
        <div className="hero-ring-1" />
        <div className="hero-ring-2" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <motion.div
                className="hero-trust-badge"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Zap size={14} color="#ffc800" />
                Trusted by <span>1000+</span> Happy Customers
              </motion.div>

              <h1 className="hero-h1">
                Professional
                <span className="hero-h1-accent">Electricians</span>
                At Your Doorstep
              </h1>

              <p className="hero-desc">
                Book trusted electricians for installation, repair, and maintenance. Fast, reliable, and affordable electrical services with 24/7 support.
              </p>

              <div className="hero-btns">
                <Link to="/booking" className="hero-btn-primary">
                  <Zap size={16} /> Book Service Now
                  <ArrowRight size={16} />
                </Link>
                <Link to="/services" className="hero-btn-secondary">
                  View All Services
                </Link>
              </div>

              <motion.div
                className="hero-trust-strip"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div className="trust-avatars">
                    {["A","B","C","D"].map((l) => (
                      <div className="trust-avatar" key={l}>{l}</div>
                    ))}
                  </div>
                  <div>
                    <div className="trust-rating-val">
                      <span className="trust-star">★</span> 4.9/5
                    </div>
                    <div className="trust-rating-label">from 500+ reviews</div>
                  </div>
                </div>
                <div className="trust-sep" />
                <div className="trust-text">
                  <strong>24/7</strong> Emergency Support
                </div>
                <div className="trust-sep" />
                <div className="trust-text">
                  <strong>10+</strong> Years Experience
                </div>
              </motion.div>
            </motion.div>

            {/* Hero Visual */}
            <motion.div
              className="hero-visual"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <div style={{ position: "relative" }}>
                <div className="orb-outer">
                  <div className="orb-mid">
                    <div className="orb-inner">
                      <Zap size={80} className="orb-zap" />
                    </div>
                  </div>
                </div>

                {/* Badge: Licensed */}
                <motion.div
                  className="hero-badge"
                  style={{ top: -20, right: 20 }}
                  animate={{ y: [-4, 4, -4] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                >
                  <div className="badge-icon"><Shield size={16} /></div>
                  <div>
                    <div className="badge-label">Certification</div>
                    <div className="badge-value">Licensed & Insured</div>
                  </div>
                </motion.div>

                {/* Badge: 24/7 */}
                <motion.div
                  className="hero-badge"
                  style={{ bottom: -20, left: 20 }}
                  animate={{ y: [4, -4, 4] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                >
                  <div className="badge-icon" style={{ color: "#38bdf8", background: "rgba(56,189,248,0.1)" }}>
                    <Clock size={16} />
                  </div>
                  <div>
                    <div className="badge-label">Availability</div>
                    <div className="badge-value">24/7 Service</div>
                  </div>
                </motion.div>

                {/* Badge: Pricing */}
                <motion.div
                  className="hero-badge"
                  style={{ top: "50%", right: -36, transform: "translateY(-50%)" }}
                  animate={{ y: [-3, 3, -3] }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                >
                  <div className="badge-icon" style={{ color: "#34d399", background: "rgba(52,211,153,0.1)" }}>
                    <BadgeDollarSign size={16} />
                  </div>
                  <div>
                    <div className="badge-label">Pricing</div>
                    <div className="badge-value">Transparent</div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <div className="stats-bar">
        <div className="container mx-auto px-4">
          <motion.div
            className="stats-card"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.65, duration: 0.6 }}
          >
            <AnimatedCounter end={500} suffix="+" label="Happy Customers" />
            <AnimatedCounter end={1000} suffix="+" label="Repairs Done" />
            <AnimatedCounter end={10} suffix="+" label="Expert Electricians" />
            <AnimatedCounter end={5} suffix="+" label="Years Experience" />
          </motion.div>
        </div>
      </div>

      {/* ── SERVICES ── */}
      <Section>
        <div className="text-center mb-14">
          <div className="sec-badge"><Zap size={12} /> What We Offer</div>
          <h2 className="sec-title">Our Professional <span>Services</span></h2>
          <p className="sec-desc">From simple repairs to complex installations, our certified electricians handle it all with precision and care.</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {displayServices.map((s, i) => (
            <motion.div
              key={s.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
            >
              <ServiceCard service={s} />
            </motion.div>
          ))}
        </div>
        <div className="text-center">
          <Link to="/services" className="view-all-btn">
            View All Services <ArrowRight size={16} />
          </Link>
        </div>
      </Section>

      {/* ── WHY CHOOSE US ── */}
      <Section>
        <div className="text-center mb-14">
          <div className="sec-badge">Why Choose Us</div>
          <h2 className="sec-title">Reliable Solutions <span>You Can Trust</span></h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {whyChooseUs.map((item, i) => (
            <motion.div
              key={item.title}
              className="why-card"
              style={{ "--card-accent": item.accent } as React.CSSProperties}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
            >
              <div className="why-num">0{i + 1}</div>
              <div className="why-icon-hex">
                <div className="why-hex-bg" />
                <div className="why-hex-icon"><item.icon size={22} /></div>
              </div>
              <div className="why-title">{item.title}</div>
              <p className="why-desc">{item.description}</p>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* ── PROCESS ── */}
      <Section>
        <div className="text-center mb-14">
          <div className="sec-badge"><Zap size={12} /> How It Works</div>
          <h2 className="sec-title">Our Simple <span>Process</span></h2>
          <p className="sec-desc">Getting your electrical issues resolved is easy with our streamlined process.</p>
        </div>
        <ProcessTimeline />
      </Section>

      {/* ── TEAM ── */}
      <Section>
        <div className="text-center mb-14">
          <div className="sec-badge"><Users size={12} /> Our Experts</div>
          <h2 className="sec-title">Meet Our <span>Team</span></h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {displayTeam.map((m, i) => (
            <motion.div
              key={m.id}
              className="team-card"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
            >
              <div className="team-avatar">
                <div className="avatar-spin-ring" />
                <div className="avatar-circle"><Users size={32} /></div>
              </div>
              <div className="team-name">{m.name}</div>
              <div className="team-role">{m.role}</div>
              <p className="team-bio">{m.bio}</p>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* ── TESTIMONIALS ── */}
      <Section>
        <div className="text-center mb-14">
          <div className="sec-badge">Testimonials</div>
          <h2 className="sec-title">What Our <span>Clients Say</span></h2>
        </div>
        <TestimonialSlider testimonials={displayTestimonials} />
      </Section>

      {/* ── CTA ── */}
      <section className="cta-section">
        <div className="cta-grid" />
        <div className="cta-glow" />
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="cta-zap-ring">
              <Zap size={36} color="#ffc800" />
            </div>
            <h2 className="cta-title">
              Need an Electrician <span>Today?</span>
            </h2>
            <p className="cta-desc">
              Book a professional electrician and get your electrical issues resolved quickly and safely.
            </p>
            <div className="cta-btns">
              <Link to="/booking" className="cta-btn-primary">
                <Zap size={16} /> Book Now <ArrowRight size={16} />
              </Link>
              <Link to="/contact" className="cta-btn-secondary">
                Contact Us
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
};

export default Index;