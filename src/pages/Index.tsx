// import { Link, useNavigate } from "react-router-dom";
// import { useEffect, useState } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import {
//   Zap, ArrowRight, Shield, Clock, BadgeDollarSign, HeartHandshake,
//   Users, X, Phone, CheckCircle, Loader2, Calendar, MapPin, Wrench,
//   AlignLeft, ChevronRight, Star, ShoppingCart
// } from "lucide-react";
// import { supabase } from "@/integrations/supabase/client";
// import { toast } from "sonner";
// import Section from "@/components/Section";
// import ServiceCard from "@/components/ServiceCard";
// import AnimatedCounter, { COUNTER_DATA } from "@/components/AnimatedCounter";
// import ProcessTimeline from "@/components/ProcessTimeline";
// import VideoSection from "@/components/VideoSection";
// import TestimonialSlider from "@/components/TestimonialSlider";
// import { services as staticServices } from "@/data/services";
// import { teamMembers as staticTeam } from "@/data/team";
// import { testimonials as staticTestimonials } from "@/data/testimonials";
// import { useServices, useTeamMembers, useTestimonials, useProducts } from "@/hooks/useOptimizedData";

// const whyChooseUs = [
//   { icon: Shield,          title: "Certified Electricians", description: "All our professionals are licensed, insured, and certified with rigorous training.",   accent: "#ffc800" },
//   { icon: Clock,           title: "Fast Response",          description: "24/7 availability with average response time under 30 minutes for emergencies.",         accent: "#38bdf8" },
//   { icon: BadgeDollarSign, title: "Affordable Pricing",     description: "Transparent, competitive pricing with no hidden fees. Get quotes upfront.",              accent: "#a78bfa" },
//   { icon: HeartHandshake,  title: "Safe & Reliable",        description: "100% satisfaction guarantee with industry-leading safety standards.",                    accent: "#34d399" },
// ];

// // ─── Booking Modal ────────────────────────────────────────────────────────────

// const inputCls = "w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all";

// export const BookingModal = ({ onClose }: { onClose: () => void }) => {
//   const [step, setStep] = useState<"form" | "done">("form");
//   const [submitting, setSubmitting] = useState(false);
//   const [services, setServices] = useState<{ title: string }[]>([]);
//   const [form, setForm] = useState({
//     name: "", phone: "", email: "", address: "", service_type: "",
//     preferred_date: "", preferred_time: "", description: "",
//     exact_location: "",
//     custom_service_demand: "",
//     is_switch_working: "",
//     has_old_fan: "",
//     is_electricity_supply_on: "",
//   });
//   const patch = (u: Partial<typeof form>) => setForm(prev => ({ ...prev, ...u }));
  
//   const [gettingLocation, setGettingLocation] = useState(false);

//   // Mark modal as dismissed when closed
//   const handleClose = () => {
//     sessionStorage.setItem('bookingModalDismissed', 'true');
//     onClose();
//   };

//   const handleGetCurrentLocation = () => {
//     setGettingLocation(true);
//     if (navigator.geolocation) {
//       navigator.geolocation.getCurrentPosition(
//         async (position) => {
//           const { latitude, longitude } = position.coords;
//           try {
//             const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
//             const data = await response.json();
//             const address = data.display_name || `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
//             patch({ address, exact_location: address });
//             toast.success("Location fetched successfully!");
//           } catch (error) {
//             patch({ address: `${latitude}, ${longitude}`, exact_location: `${latitude}, ${longitude}` });
//             toast.success("Coordinates fetched! Please provide more details.");
//           }
//           setGettingLocation(false);
//         },
//         (error) => {
//           setGettingLocation(false);
//           toast.error("Unable to get your location. Please enter manually.");
//         }
//       );
//     } else {
//       setGettingLocation(false);
//       toast.error("Geolocation is not supported by your browser.");
//     }
//   };

//   useEffect(() => {
//     supabase.from("services").select("title").order("sort_order").then(({ data }) => {
//       if (data) setServices(data);
//     });
//   }, []);

//   // Add Custom Service option to services list
//   const servicesWithOptions = [
//     ...services,
//     { title: "Custom Service" }
//   ];

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setSubmitting(true);
//     const { error } = await supabase.from("bookings").insert({
//       name: form.name, phone: form.phone, email: form.email, address: form.address,
//       service_type: form.service_type === "Custom Service" ? `Custom: ${form.custom_service_demand}` : form.service_type,
//       preferred_date: form.preferred_date,
//       preferred_time: form.preferred_time, 
//       description: form.service_type === "Custom Service" ? form.custom_service_demand : (form.description || null),
//       exact_location: form.exact_location || null,
//       custom_service_demand: form.service_type === "Custom Service" ? form.custom_service_demand : null,
//       is_switch_working: form.is_switch_working || null,
//       has_old_fan: form.has_old_fan || null,
//       is_electricity_supply_on: form.is_electricity_supply_on || null,
//     });
//     if (error) {
//       toast.error("Failed to submit booking. Please try again.");
//     } else {
//       // Clear the dismissal flag so modal can show again for new bookings
//       sessionStorage.removeItem('bookingModalDismissed');
//       setStep("done");
//       toast.success("Booking submitted! We'll confirm your appointment shortly.");
//     }
//     setSubmitting(false);
//   };

//   return (
//     <motion.div
//       initial={{ opacity: 0 }}
//       animate={{ opacity: 1 }}
//       exit={{ opacity: 0 }}
//       className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm"
//       onClick={handleClose}
//       style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, margin: 0, padding: 0 }}
//     >
//       <motion.div
//         initial={{ scale: 0.96, opacity: 0, y: 24 }}
//         animate={{ scale: 1, opacity: 1, y: 0 }}
//         exit={{ scale: 0.96, opacity: 0, y: 24 }}
//         transition={{ type: "spring", damping: 28, stiffness: 320 }}
//         className="relative bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl w-full max-w-lg max-h-[92vh] overflow-hidden flex flex-col m-4"
//         onClick={e => e.stopPropagation()}
//         style={{ maxHeight: 'calc(100vh - 32px)' }}
//       >
//         {/* Top accent strip */}
//         <div className="h-1 w-full bg-gradient-to-r from-blue-500 via-violet-500 to-blue-400 flex-shrink-0" />

//         {/* Header */}
//         <div className="flex items-start justify-between px-6 pt-5 pb-4 border-b border-zinc-100 dark:border-zinc-800 flex-shrink-0">
//           <div className="flex items-center gap-3">
//             <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-500/20">
//               <Zap size={18} className="text-white" />
//             </div>
//             <div>
//               <h2 className="text-lg font-bold text-zinc-900 dark:text-white leading-tight">Book a Service</h2>
//               <p className="text-xs text-zinc-400 mt-0.5">Fill in details — we'll confirm shortly</p>
//             </div>
//           </div>
//           <button
//             onClick={onClose}
//             className="w-8 h-8 flex items-center justify-center rounded-xl border border-zinc-200 dark:border-zinc-700 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors flex-shrink-0"
//           >
//             <X size={15} />
//           </button>
//         </div>

//         {/* Body */}
//         <div className="flex-1 overflow-y-auto px-6 py-5">
//           <AnimatePresence mode="wait">
//             {step === "done" ? (
//               <motion.div key="done"
//                 initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
//                 className="flex flex-col items-center justify-center text-center py-10 gap-4">
//                 <div className="w-20 h-20 rounded-full bg-emerald-50 dark:bg-emerald-950/30 border-2 border-emerald-200 dark:border-emerald-800 flex items-center justify-center">
//                   <CheckCircle size={40} className="text-emerald-500" />
//                 </div>
//                 <div>
//                   <h3 className="text-xl font-bold text-zinc-900 dark:text-white">Booking Submitted!</h3>
//                   <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1.5 max-w-xs">
//                     Thank you! We'll reach out to confirm your appointment shortly.
//                   </p>
//                 </div>
//                 <div className="flex gap-2 mt-2">
//                   <button onClick={() => { handleClose(); window.location.href = '/track-booking'; }}
//                     className="px-6 py-2.5 border border-emerald-500 text-emerald-600 dark:text-emerald-400 text-sm font-semibold rounded-xl hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-colors">
//                     Track Booking
//                   </button>
//                   <button onClick={handleClose}
//                     className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors">
//                     Close
//                   </button>
//                 </div>
//               </motion.div>
//             ) : (
//               <motion.form key="form" onSubmit={handleSubmit} className="space-y-4">
//                 {/* Name + Phone */}
//                 <div className="grid grid-cols-2 gap-3">
//                   <div className="space-y-1.5">
//                     <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
//                       <Users size={11} /> Full Name <span className="text-red-400">*</span>
//                     </label>
//                     <input type="text" required placeholder="Rahul Sharma"
//                       value={form.name} onChange={e => patch({ name: e.target.value })}
//                       className={inputCls} />
//                   </div>
//                   <div className="space-y-1.5">
//                     <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
//                       <Phone size={11} /> Phone <span className="text-red-400">*</span>
//                     </label>
//                     <input type="tel" required placeholder="+91 98765 43210"
//                       value={form.phone} onChange={e => patch({ phone: e.target.value })}
//                       className={inputCls} />
//                   </div>
//                 </div>
                
//                 {/* Email */}
//                 <div className="space-y-1.5">
//                   <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
//                     <AlignLeft size={11} /> Email Address <span className="text-red-400">*</span>
//                   </label>
//                   <input type="email" required placeholder="your@email.com"
//                     value={form.email} onChange={e => patch({ email: e.target.value })}
//                     className={inputCls} />
//                 </div>

//                 {/* Address with Location Picker */}
//                 <div className="space-y-1.5">
//                   <div className="flex items-center justify-between mb-1">
//                     <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
//                       <MapPin size={11} /> Service Address <span className="text-red-400">*</span>
//                     </label>
//                     <button
//                       type="button"
//                       onClick={handleGetCurrentLocation}
//                       disabled={gettingLocation}
//                       className="text-xs px-2 py-1 rounded bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/50 font-medium transition-colors flex items-center gap-1 disabled:opacity-50"
//                     >
//                       {gettingLocation ? (
//                         <><Loader2 size={10} className="animate-spin" /> Getting...</>
//                       ) : (
//                         <><MapPin size={10} /> Use Current Location</>
//                       )}
//                     </button>
//                   </div>
//                   <input type="text" required placeholder="123 Main St, City or use location picker"
//                     value={form.address} onChange={e => patch({ address: e.target.value })}
//                     className={inputCls} />
//                 </div>

//                 {/* Service type */}
//                 <div className="space-y-1.5">
//                   <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
//                     <Wrench size={11} /> Service Type <span className="text-red-400">*</span>
//                   </label>
//                   <select required value={form.service_type}
//                     onChange={e => patch({ service_type: e.target.value })}
//                     className={inputCls}>
//                     <option value="">Select a service…</option>
//                     {servicesWithOptions.map(s => (
//                       <option key={s.title} value={s.title}>{s.title}</option>
//                     ))}
//                   </select>
//                 </div>

//                 {/* Custom Service Demand Input - Show only when Custom Service is selected */}
//                 {form.service_type === "Custom Service" && (
//                   <div className="space-y-1.5">
//                     <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
//                       <AlignLeft size={11} /> Describe Your Custom Service Requirement <span className="text-red-400">*</span>
//                     </label>
//                     <textarea rows={4} placeholder="Please describe the specific electrical work you need done…"
//                       value={form.custom_service_demand} onChange={e => patch({ custom_service_demand: e.target.value })}
//                       className={`${inputCls} resize-none`} required />
//                   </div>
//                 )}

//                 {/* Date + Time */}
//                 <div className="grid grid-cols-2 gap-3">
//                   <div className="space-y-1.5">
//                     <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
//                       <Calendar size={11} /> Date <span className="text-red-400">*</span>
//                     </label>
//                     <input type="date" required
//                       value={form.preferred_date} onChange={e => patch({ preferred_date: e.target.value })}
//                       className={inputCls} />
//                   </div>
//                   <div className="space-y-1.5">
//                     <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
//                       <Clock size={11} /> Time <span className="text-red-400">*</span>
//                     </label>
//                     <input type="time" required
//                       value={form.preferred_time} onChange={e => patch({ preferred_time: e.target.value })}
//                       className={inputCls} />
//                   </div>
//                 </div>

//                 {/* Description */}
//                 <div className="space-y-1.5">
//                   <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
//                     <AlignLeft size={11} /> Description
//                     <span className="text-zinc-300 dark:text-zinc-600 lowercase font-normal tracking-normal">(optional)</span>
//                   </label>
//                   <textarea rows={3} placeholder="Describe your electrical issue…"
//                     value={form.description} onChange={e => patch({ description: e.target.value })}
//                     className={`${inputCls} resize-none`} />
//                 </div>

//                 {/* Exact Location */}
//                 <div className="space-y-1.5">
//                   <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
//                     <MapPin size={11} /> Exact Location / Landmark
//                   </label>
//                   <input type="text" placeholder="Near temple, Behind shopping mall, etc."
//                     value={form.exact_location} onChange={e => patch({ exact_location: e.target.value })}
//                     className={inputCls} />
//                 </div>

//                 {/* Fan Installation Questions - Only show if service is Fan Installation */}
//                 {form.service_type.toLowerCase().includes('fan') && (
//                   <>
//                     <div className="space-y-1.5">
//                       <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
//                         <Wrench size={11} /> Is Your Switch Working? <span className="text-red-400">*</span>
//                       </label>
//                       <select required
//                         value={form.is_switch_working} onChange={e => patch({ is_switch_working: e.target.value })}
//                         className={inputCls}>
//                         <option value="">Select...</option>
//                         <option value="yes">Yes</option>
//                         <option value="no">No</option>
//                       </select>
//                     </div>

//                     <div className="space-y-1.5">
//                       <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
//                         <Zap size={11} /> Is There an Old Fan at Installation Location? <span className="text-red-400">*</span>
//                       </label>
//                       <select required
//                         value={form.has_old_fan} onChange={e => patch({ has_old_fan: e.target.value })}
//                         className={inputCls}>
//                         <option value="">Select...</option>
//                         <option value="yes">Yes</option>
//                         <option value="no">No</option>
//                       </select>
//                     </div>

//                     <div className="space-y-1.5">
//                       <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
//                         <Zap size={11} /> Is Electricity Supply On at Switch Location? <span className="text-red-400">*</span>
//                       </label>
//                       <select required
//                         value={form.is_electricity_supply_on} onChange={e => patch({ is_electricity_supply_on: e.target.value })}
//                         className={inputCls}>
//                         <option value="">Select...</option>
//                         <option value="yes">Yes</option>
//                         <option value="no">No</option>
//                       </select>
//                     </div>
//                   </>
//                 )}

//                 {/* Submit */}
//                 <button type="submit" disabled={submitting}
//                   className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm transition-all shadow-sm shadow-blue-500/20 disabled:opacity-60 flex items-center justify-center gap-2">
//                   {submitting
//                     ? <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />Processing…</>
//                     : <><Zap size={15} />Submit Booking<ChevronRight size={14} /></>}
//                 </button>

//                 {/* Alt contact */}
//                 <p className="text-center text-xs text-zinc-400 pt-1">
//                   Or call directly at{" "}
//                   <a href="tel:+918109308287" className="text-blue-500 font-semibold hover:underline">
//                     +91 81093 08287
//                   </a>
//                 </p>
//               </motion.form>
//             )}
//           </AnimatePresence>
//         </div>
//       </motion.div>
//     </motion.div>
//   );
// };

// // ─── Page ─────────────────────────────────────────────────────────────────────

// const Index = () => {
//   const navigate = useNavigate();
//   const { services: dbServices, loading: servicesLoading } = useServices(4);
//   const { team: dbTeam, loading: teamLoading } = useTeamMembers();
//   const { testimonials: dbTestimonials, loading: testimonialsLoading } = useTestimonials();
//   const { products: allProducts, loading: productsLoading } = useProducts({ sortBy: 'featured' });

//   const isLoading = servicesLoading || teamLoading || testimonialsLoading || productsLoading;

//   // Get 4 featured products for hero section
//   const featuredProducts = allProducts.filter(p => p.is_featured).slice(0, 4);
  
//   const displayServices = dbServices.length > 0
//     ? dbServices
//     : staticServices.slice(0, 4).map(s => ({
//         id: s.id, title: s.title, description: s.description,
//         icon_name: "Zap", whatsapp_enabled: true, call_enabled: true, book_now_enabled: true,
//       }));
//   const displayTeam         = dbTeam.length > 0         ? dbTeam         : staticTeam;
//   const displayTestimonials = dbTestimonials.length > 0 ? dbTestimonials : staticTestimonials;

//   // State for global booking modal (managed in App.tsx)
//   const [mounted, setMounted] = useState(false);

//   useEffect(() => {
//     setMounted(true);
//     // Modal is now triggered globally from App.tsx
//   }, []);

//   return (
//     <>
//       <style>{`
//         @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700;800;900&family=DM+Sans:wght@400;500;600&display=swap');

//         /* ── HERO ── */
//         .hero-section {
//           position: relative;
//           min-height: 100vh;
//           display: flex;
//           align-items: center;
//           overflow: hidden;
//           background: hsl(var(--background));
//           font-family: 'DM Sans', sans-serif;
//         }

//         .hero-grid {
//           position: absolute;
//           inset: 0;
//           background-image:
//             linear-gradient(hsl(var(--primary) / 0.04) 1px, transparent 1px),
//             linear-gradient(90deg, hsl(var(--primary) / 0.04) 1px, transparent 1px);
//           background-size: 60px 60px;
//           mask-image: radial-gradient(ellipse 80% 80% at 30% 50%, black 0%, transparent 100%);
//         }

//         .hero-glow-1 {
//           position: absolute;
//           top: 20%; left: -120px;
//           width: 500px; height: 500px;
//           border-radius: 50%;
//           background: radial-gradient(circle, hsl(var(--primary) / 0.08) 0%, transparent 70%);
//           animation: floatGlow 6s ease-in-out infinite;
//         }

//         .hero-glow-2 {
//           position: absolute;
//           bottom: 10%; right: -80px;
//           width: 400px; height: 400px;
//           border-radius: 50%;
//           background: radial-gradient(circle, hsl(var(--secondary) / 0.06) 0%, transparent 70%);
//           animation: floatGlow 8s ease-in-out infinite reverse;
//           animation-delay: 2s;
//         }

//         .hero-ring-1 {
//           position: absolute;
//           top: 50%; left: 60%;
//           transform: translate(-50%, -50%);
//           width: 700px; height: 700px;
//           border-radius: 50%;
//           border: 1px solid hsl(var(--primary) / 0.06);
//           pointer-events: none;
//         }

//         .hero-ring-2 {
//           position: absolute;
//           top: 50%; left: 60%;
//           transform: translate(-50%, -50%);
//           width: 500px; height: 500px;
//           border-radius: 50%;
//           border: 1px solid hsl(var(--primary) / 0.05);
//           pointer-events: none;
//         }

//         @keyframes floatGlow {
//           0%, 100% { transform: translateY(0px); }
//           50% { transform: translateY(-20px); }
//         }

//         .hero-trust-badge {
//           display: inline-flex;
//           align-items: center;
//           gap: 10px;
//           padding: 9px 20px;
//           border: 1px solid hsl(var(--primary) / 0.3);
//           border-radius: 100px;
//           background: hsl(var(--primary) / 0.07);
//           backdrop-filter: blur(8px);
//           margin-bottom: 28px;
//           font-size: 13px;
//           font-weight: 600;
//           color: hsl(var(--foreground));
//           letter-spacing: 0.3px;
//         }

//         .hero-trust-badge span { color: hsl(var(--secondary)); }

//         .hero-h1 {
//           font-family: 'Barlow Condensed', sans-serif;
//           font-size: clamp(52px, 8vw, 96px);
//           font-weight: 900;
//           line-height: 0.9;
//           text-transform: uppercase;
//           letter-spacing: -2px;
//           color: hsl(var(--foreground));
//           margin-bottom: 24px;
//         }

//         .hero-h1-accent {
//           background: linear-gradient(135deg, hsl(var(--secondary)) 0%, hsl(var(--electric-yellow-light)) 50%, hsl(var(--electric-blue-dark)) 100%);
//           -webkit-background-clip: text;
//           -webkit-text-fill-color: transparent;
//           background-clip: text;
//           display: block;
//         }

//         .hero-desc {
//           font-size: 17px;
//           color: hsl(var(--muted-foreground));
//           line-height: 1.75;
//           max-width: 480px;
//           margin-bottom: 36px;
//         }

//         .hero-btns {
//           display: flex;
//           flex-wrap: wrap;
//           gap: 14px;
//           margin-bottom: 40px;
//         }

//         .hero-btn-primary {
//           display: inline-flex;
//           align-items: center;
//           gap: 10px;
//           padding: 15px 32px;
//           background: linear-gradient(135deg, hsl(var(--primary)), hsl(var(--electric-blue-dark)));
//           color: hsl(var(--primary-foreground));
//           font-family: 'Barlow Condensed', sans-serif;
//           font-size: 17px;
//           font-weight: 800;
//           letter-spacing: 0.6px;
//           text-transform: uppercase;
//           border-radius: 12px;
//           text-decoration: none;
//           transition: all 0.3s ease;
//           position: relative;
//           overflow: hidden;
//         }

//         .hero-btn-primary:hover {
//           box-shadow: 0 0 36px hsl(var(--primary) / 0.45), 0 8px 24px hsl(var(--primary) / 0.3);
//           transform: translateY(-2px);
//         }

//         .hero-btn-secondary {
//           display: inline-flex;
//           align-items: center;
//           gap: 10px;
//           padding: 15px 32px;
//           border: 1.5px solid hsl(var(--border) / 0.5);
//           color: hsl(var(--foreground));
//           font-family: 'Barlow Condensed', sans-serif;
//           font-size: 17px;
//           font-weight: 700;
//           letter-spacing: 0.6px;
//           text-transform: uppercase;
//           border-radius: 12px;
//           text-decoration: none;
//           transition: all 0.3s ease;
//           background: hsl(var(--muted) / 0.3);
//         }

//         .hero-btn-secondary:hover {
//           border-color: hsl(var(--primary) / 0.6);
//           color: hsl(var(--primary));
//           background: hsl(var(--primary) / 0.08);
//         }

//         .hero-trust-strip {
//           display: flex;
//           flex-wrap: wrap;
//           align-items: center;
//           gap: 20px;
//           padding-top: 24px;
//           border-top: 1px solid hsl(var(--border) / 0.5);
//         }

//         .trust-avatars { display: flex; align-items: center; }

//         .trust-avatar {
//           width: 34px; height: 34px;
//           border-radius: 50%;
//           background: linear-gradient(135deg, hsl(var(--primary) / 0.2), hsl(var(--secondary) / 0.1));
//           border: 2px solid hsl(var(--border) / 0.5);
//           display: flex; align-items: center; justify-content: center;
//           font-family: 'Barlow Condensed', sans-serif;
//           font-size: 13px; font-weight: 700;
//           color: hsl(var(--primary));
//           margin-left: -8px;
//         }
//         .trust-avatar:first-child { margin-left: 0; }
//         .trust-rating-label { font-size: 11px; color: hsl(var(--muted-foreground) / 0.45); margin-top: 2px; }
//         .trust-rating-val { font-size: 14px; font-weight: 700; color: hsl(var(--foreground)); display: flex; align-items: center; gap: 4px; }
//         .trust-star { color: hsl(var(--secondary)); }
//         .trust-sep { width: 1px; height: 28px; background: rgba(255,200,0,0.12); }
//         .trust-text { font-size: 13px; color: rgba(180,200,240,0.5); }
//         .trust-text strong { color: #f0f4ff; }

//         .hero-visual {
//           display: none;
//           align-items: center;
//           justify-content: center;
//           position: relative;
//         }
//         @media (min-width: 1024px) { .hero-visual { display: flex; } }

//         .orb-outer {
//           position: relative; width: 400px; height: 400px;
//           border-radius: 50%;
//           border: 1.5px solid hsl(var(--primary) / 0.2);
//           background: radial-gradient(circle at 40% 40%, hsl(var(--primary) / 0.07), transparent 60%);
//           display: flex; align-items: center; justify-content: center;
//           animation: orbFloat 6s ease-in-out infinite;
//         }
//         @keyframes orbFloat { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-12px); } }

//         .orb-mid {
//           width: 290px; height: 290px; border-radius: 50%;
//           border: 1.5px solid hsl(var(--primary) / 0.25);
//           background: radial-gradient(circle at 40% 40%, hsl(var(--primary) / 0.1), transparent 70%);
//           display: flex; align-items: center; justify-content: center;
//         }
//         .orb-inner {
//           width: 180px; height: 180px; border-radius: 50%;
//           border: 2px solid hsl(var(--primary) / 0.4);
//           background: radial-gradient(circle, hsl(var(--primary) / 0.12), hsl(var(--card) / 0.95) 70%);
//           display: flex; align-items: center; justify-content: center;
//           box-shadow: 0 0 60px hsl(var(--primary) / 0.15), inset 0 0 40px hsl(var(--primary) / 0.05);
//         }
//         .orb-zap {
//           color: hsl(var(--secondary));
//           filter: drop-shadow(0 0 20px hsl(var(--primary) / 0.6));
//           animation: zapPulse 2s ease-in-out infinite;
//         }
//         @keyframes zapPulse {
//           0%, 100% { filter: drop-shadow(0 0 20px hsl(var(--primary) / 0.6)); transform: scale(1); }
//           50% { filter: drop-shadow(0 0 36px hsl(var(--primary) / 0.9)); transform: scale(1.05); }
//         }

//         /* ─── ORBITAL BADGES ─── */
//         .orbit-container {
//           position: absolute;
//           top: 50%; left: 50%;
//           transform: translate(-50%, -50%);
//           width: 500px; height: 500px;
//           pointer-events: none;
//         }

//         .orbit-ring {
//           position: absolute;
//           top: 50%; left: 50%;
//           transform: translate(-50%, -50%);
//           border-radius: 50%;
//           border: 1px dashed hsl(var(--primary) / 0.15);
//           animation: orbitRotate linear infinite;
//         }

//         .orbit-ring-1 {
//           width: 420px; height: 420px;
//           animation-duration: 20s;
//         }

//         .orbit-ring-2 {
//           width: 340px; height: 340px;
//           animation-duration: 15s;
//           animation-direction: reverse;
//         }

//         .orbit-ring-3 {
//           width: 260px; height: 260px;
//           animation-duration: 12s;
//         }

//         @keyframes orbitRotate {
//           to { transform: translate(-50%, -50%) rotate(360deg); }
//         }

//         .badge-wrapper {
//           position: absolute;
//           /* Wrapper rotates with ring */
//         }

//         .badge-wrapper-1 {
//           top: 0; left: 50%;
//           transform: translate(-50%, -50%);
//         }

//         .badge-wrapper-2 {
//           bottom: 0; left: 50%;
//           transform: translate(-50%, 50%);
//         }

//         .badge-wrapper-3 {
//           top: 50%; right: 0;
//           transform: translate(50%, -50%);
//         }

//         .orbit-badge {
//           display: flex; align-items: center; gap: 10px;
//           padding: 12px 16px;
//           background: hsl(var(--card) / 0.95);
//           border: 1px solid hsl(var(--border) / 0.3);
//           border-radius: 14px;
//           backdrop-filter: blur(12px);
//           box-shadow: 0 8px 32px hsl(var(--foreground) / 0.1);
//           /* Counter-rotate to stay upright */
//           animation: counterRotate linear infinite;
//         }

//         .orbit-badge-1 {
//           animation-duration: 20s;
//         }

//         .orbit-badge-2 {
//           animation-duration: 15s;
//           animation-direction: reverse;
//         }

//         .orbit-badge-3 {
//           animation-duration: 12s;
//         }

//         @keyframes counterRotate {
//           to { transform: rotate(-360deg); }
//         }

//         @keyframes counterRotateReverse {
//           to { transform: rotate(360deg); }
//         }

//         .hero-badge {
//           position: absolute;
//           display: flex; align-items: center; gap: 10px;
//           padding: 12px 16px;
//           background: hsl(var(--card) / 0.95);
//           border: 1px solid hsl(var(--border) / 0.3);
//           border-radius: 14px;
//           backdrop-filter: blur(12px);
//           box-shadow: 0 8px 32px hsl(var(--foreground) / 0.1);
//         }
//         .badge-icon {
//           width: 34px; height: 34px; border-radius: 10px;
//           background: hsl(var(--primary) / 0.1);
//           display: flex; align-items: center; justify-content: center;
//           color: hsl(var(--secondary)); flex-shrink: 0;
//         }
//         .badge-label { font-size: 10px; color: hsl(var(--muted-foreground) / 0.45); font-family: 'DM Sans', sans-serif; margin-bottom: 2px; text-transform: uppercase; letter-spacing: 0.5px; }
//         .badge-value { font-family: 'Barlow Condensed', sans-serif; font-size: 15px; font-weight: 700; color: hsl(var(--foreground)); line-height: 1; }

//         .stats-bar { position: relative; z-index: 20; margin-top: -52px; }
//         .stats-card {
//           background: hsl(var(--card));
//           border: 1px solid hsl(var(--border) / 0.3);
//           border-radius: 20px;
//           padding: 36px 40px;
//           box-shadow: 0 24px 80px hsl(var(--foreground) / 0.1), 0 0 0 1px hsl(var(--primary) / 0.06);
//           display: grid;
//           grid-template-columns: repeat(2, 1fr);
//           gap: 24px;
//         }
//         @media (min-width: 768px) { .stats-card { grid-template-columns: repeat(4, 1fr); } }

//         .sec-badge {
//           display: inline-flex; align-items: center; gap: 8px;
//           padding: 7px 18px;
//           border: 1px solid hsl(var(--border) / 0.3);
//           border-radius: 100px;
//           background: hsl(var(--primary) / 0.06);
//           margin-bottom: 16px;
//           font-size: 12px; font-weight: 700;
//           color: hsl(var(--secondary));
//           letter-spacing: 1px; text-transform: uppercase;
//           font-family: 'Barlow Condensed', sans-serif;
//         }
//         .sec-title {
//           font-family: 'Barlow Condensed', sans-serif;
//           font-size: clamp(32px, 4.5vw, 52px);
//           font-weight: 900; text-transform: uppercase;
//           color: hsl(var(--foreground));
//           letter-spacing: -0.5px; line-height: 1; margin-bottom: 16px;
//         }
//         .sec-title span {
//           background: linear-gradient(135deg, hsl(var(--secondary)), hsl(var(--electric-yellow-light)));
//           -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
//         }
//         .sec-desc { font-size: 15px; color: hsl(var(--muted-foreground) / 0.55); line-height: 1.7; max-width: 560px; margin: 0 auto; }

//         .why-card {
//           position: relative;
//           background: hsl(var(--card));
//           border: 1px solid hsl(var(--border) / 0.3);
//           border-radius: 20px;
//           padding: 32px 28px;
//           overflow: hidden;
//           font-family: 'DM Sans', sans-serif;
//           transition: all 0.4s cubic-bezier(0.23, 1, 0.32, 1);
//           cursor: default;
//         }
//         .why-card::after { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px; background: linear-gradient(90deg, transparent, var(--card-accent), transparent); opacity: 0; transition: opacity 0.4s; }
//         .why-card:hover { transform: translateY(-6px); border-color: hsl(var(--border) / 0.5); box-shadow: 0 24px 60px hsl(var(--foreground) / 0.1), 0 0 40px hsl(var(--primary) / 0.05); }
//         .why-card:hover::after { opacity: 1; }
//         .why-icon-hex { position: relative; width: 60px; height: 60px; margin-bottom: 22px; }
//         .why-hex-bg { position: absolute; inset: 0; background: linear-gradient(135deg, hsl(var(--primary) / 0.14), hsl(var(--primary) / 0.04)); clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%); transition: all 0.4s ease; }
//         .why-card:hover .why-hex-bg { background: linear-gradient(135deg, var(--card-accent), hsl(var(--secondary) / 0.6)); }
//         .why-hex-icon { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; color: var(--card-accent); transition: color 0.4s; }
//         .why-card:hover .why-hex-icon { color: hsl(var(--card-foreground)); }
//         .why-num { position: absolute; top: 20px; right: 20px; font-family: 'Barlow Condensed', sans-serif; font-size: 40px; font-weight: 900; color: hsl(var(--primary) / 0.04); line-height: 1; user-select: none; }
//         .why-title { font-family: 'Barlow Condensed', sans-serif; font-size: 20px; font-weight: 800; text-transform: uppercase; color: hsl(var(--foreground)); margin-bottom: 10px; letter-spacing: 0.3px; }
//         .why-desc { font-size: 13.5px; color: hsl(var(--muted-foreground) / 0.58); line-height: 1.7; }

//         .team-card {
//           position: relative; background: hsl(var(--card));
//           border: 1px solid hsl(var(--border) / 0.3);
//           border-radius: 20px; padding: 32px 24px; text-align: center;
//           overflow: hidden; font-family: 'DM Sans', sans-serif;
//           transition: all 0.4s cubic-bezier(0.23, 1, 0.32, 1);
//         }
//         .team-card::after { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px; background: linear-gradient(90deg, transparent, hsl(var(--primary)), transparent); opacity: 0; transition: opacity 0.4s; }
//         .team-card:hover { transform: translateY(-6px); border-color: hsl(var(--border) / 0.5); box-shadow: 0 20px 50px hsl(var(--foreground) / 0.1); }
//         .team-card:hover::after { opacity: 1; }
//         .team-avatar { position: relative; width: 88px; height: 88px; margin: 0 auto 18px; }
//         .avatar-spin-ring { position: absolute; inset: -5px; border-radius: 50%; border: 1.5px solid hsl(var(--border) / 0.3); border-top-color: hsl(var(--secondary)); animation: avatarSpin 8s linear infinite; }
//         @keyframes avatarSpin { to { transform: rotate(360deg); } }
//         .avatar-circle { width: 88px; height: 88px; border-radius: 50%; background: linear-gradient(135deg, hsl(var(--primary) / 0.1), hsl(var(--secondary) / 0.05)); border: 1.5px solid hsl(var(--border) / 0.3); display: flex; align-items: center; justify-content: center; color: hsl(var(--muted-foreground)); transition: all 0.4s; }
//         .team-card:hover .avatar-circle { border-color: hsl(var(--primary) / 0.5); background: hsl(var(--primary) / 0.12); color: hsl(var(--secondary)); box-shadow: 0 0 24px hsl(var(--primary) / 0.15); }
//         .team-name { font-family: 'Barlow Condensed', sans-serif; font-size: 20px; font-weight: 800; text-transform: uppercase; color: hsl(var(--foreground)); margin-bottom: 4px; }
//         .team-role { display: inline-block; font-size: 11px; font-weight: 700; color: hsl(var(--secondary)); letter-spacing: 0.8px; text-transform: uppercase; background: hsl(var(--primary) / 0.08); border: 1px solid hsl(var(--border) / 0.3); border-radius: 100px; padding: 3px 12px; margin-bottom: 12px; }
//         .team-bio { font-size: 13px; color: hsl(var(--muted-foreground) / 0.5); line-height: 1.65; }

//         .view-all-btn {
//           display: inline-flex; align-items: center; gap: 9px;
//           padding: 13px 32px;
//           border: 1.5px solid hsl(var(--border) / 0.5);
//           color: hsl(var(--secondary));
//           font-family: 'Barlow Condensed', sans-serif;
//           font-size: 16px; font-weight: 800; letter-spacing: 0.6px; text-transform: uppercase;
//           border-radius: 12px; text-decoration: none;
//           background: hsl(var(--primary) / 0.04);
//           transition: all 0.3s ease;
//           margin-top: 48px;
//         }
//         .view-all-btn:hover { background: hsl(var(--secondary)); color: hsl(var(--card-foreground)); border-color: hsl(var(--secondary)); box-shadow: 0 0 28px hsl(var(--primary) / 0.35); transform: translateY(-2px); }

//         .cta-section { position: relative; overflow: hidden; background: hsl(var(--background)); padding: 100px 0; text-align: center; font-family: 'DM Sans', sans-serif; }
//         .cta-grid { position: absolute; inset: 0; background-image: linear-gradient(hsl(var(--primary) / 0.04) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary) / 0.04) 1px, transparent 1px); background-size: 60px 60px; mask-image: radial-gradient(ellipse 70% 80% at 50% 50%, black 20%, transparent 100%); }
//         .cta-glow { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 600px; height: 400px; background: radial-gradient(ellipse, hsl(var(--primary) / 0.08) 0%, transparent 70%); pointer-events: none; }
//         .cta-zap-ring { position: relative; width: 80px; height: 80px; margin: 0 auto 28px; border-radius: 50%; border: 2px solid hsl(var(--border) / 0.3); display: flex; align-items: center; justify-content: center; background: hsl(var(--primary) / 0.06); box-shadow: 0 0 40px hsl(var(--primary) / 0.15); }
//         .cta-title { font-family: 'Barlow Condensed', sans-serif; font-size: clamp(36px, 5vw, 64px); font-weight: 900; text-transform: uppercase; color: hsl(var(--foreground)); letter-spacing: -1px; line-height: 0.95; margin-bottom: 16px; }
//         .cta-title span { background: linear-gradient(135deg, hsl(var(--secondary)), hsl(var(--electric-yellow-light))); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
//         .cta-desc { font-size: 15px; color: hsl(var(--muted-foreground) / 0.5); max-width: 440px; margin: 0 auto 36px; line-height: 1.7; }
//         .cta-btns { display: flex; flex-wrap: wrap; gap: 14px; justify-content: center; }
//         .cta-btn-primary { display: inline-flex; align-items: center; gap: 9px; padding: 15px 36px; background: linear-gradient(135deg, hsl(var(--secondary)), hsl(var(--electric-blue-dark))); color: hsl(var(--primary-foreground)); font-family: 'Barlow Condensed', sans-serif; font-size: 17px; font-weight: 800; letter-spacing: 0.6px; text-transform: uppercase; border-radius: 12px; text-decoration: none; transition: all 0.3s ease; }
//         .cta-btn-primary:hover { box-shadow: 0 0 32px hsl(var(--primary) / 0.45), 0 6px 20px hsl(var(--secondary) / 0.3); transform: translateY(-2px); }
//         .cta-btn-secondary { display: inline-flex; align-items: center; gap: 9px; padding: 15px 32px; border: 1.5px solid hsl(var(--border) / 0.5); color: hsl(var(--foreground)); font-family: 'Barlow Condensed', sans-serif; font-size: 17px; font-weight: 700; letter-spacing: 0.6px; text-transform: uppercase; border-radius: 12px; text-decoration: none; background: hsl(var(--muted) / 0.3); transition: all 0.3s; }
//         .cta-btn-secondary:hover { border-color: hsl(var(--primary) / 0.6); color: hsl(var(--secondary)); background: hsl(var(--primary) / 0.08); }
//       `}</style>

//       {/* ── HERO ── */}
//       <section className="hero-section">
//         <div className="hero-grid" />
//         <div className="hero-glow-1" />
//         <div className="hero-glow-2" />
//         <div className="hero-ring-1" />
//         <div className="hero-ring-2" />

//         <div className="container mx-auto px-4 relative z-10">
//           <div className="grid lg:grid-cols-2 gap-12 items-center">
//             <motion.div initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, ease: "easeOut" }}>
//               <motion.div className="hero-trust-badge" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
//                 <Zap size={14} /> Trusted by <span>1000+</span> Happy Customers
//               </motion.div>
//               <h1 className="hero-h1">
//                 Professional
//                 <span className="hero-h1-accent">Electricians</span>
//                 At Your Doorstep
//               </h1>
//               <p className="hero-desc">On-demand electrical services provider for installation, repair, and maintenance. Fast, reliable, and affordable electrical services with 24/7 support. Book now and experience the difference.</p>
//               <p className="hero-desc">It Is India's Leading Appliances Care Provider And Damage Protection On-Demand Repair Services. We Cover All Electronic Devices And Home Appliances. Our Plans Are Available Currently In Ujjain (M.P). We Visit Your Cities As Soon As Possible.</p>
//               <div className="hero-btns">
//                 <Link to="/booking" className="hero-btn-primary">
//                   <Zap size={16} /> Book Service Now <ArrowRight size={16} />
//                 </Link>
//                 <Link to="/products" className="hero-btn-secondary" style={{ background: 'linear-gradient(135deg, hsl(var(--secondary)), hsl(var(--electric-blue-dark)))', border: 'none', color: 'hsl(var(--primary-foreground))' }}>
//                   <ShoppingCart size={16} /> Buy Products
//                 </Link>
//               </div>

             
//               <motion.div className="hero-trust-strip" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
//                 <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
//                   <div className="trust-avatars">
//                     {["A","B","C","D"].map(l => <div className="trust-avatar" key={l}>{l}</div>)}
//                   </div>
//                   <div>
//                     <div className="trust-rating-val"><span className="trust-star">★</span> 4.9/5</div>
//                     <div className="trust-rating-label">from 500+ reviews</div>
//                   </div>
//                 </div>
//                 <div className="trust-sep" />
//                 <div className="trust-text"><strong>24/7</strong> Emergency Support</div>
//                 <div className="trust-sep" />
//                 <div className="trust-text"><strong>10+</strong> Years Experience</div>
//               </motion.div>
//             </motion.div>

//             <motion.div className="hero-visual" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, delay: 0.3 }}>
//               <div style={{ position: "relative" }}>
//                 <div className="orb-outer">
//                   <div className="orb-mid">
//                     <div className="orb-inner">
//                       <Zap size={80} className="orb-zap" />
//                     </div>
//                   </div>
//                 </div>

//                 {/* Orbiting Badges - Like Electrons */}
//                 <div className="orbit-container">
//                   {/* Ring 1 - Certification Badge */}
//                   <div className="orbit-ring orbit-ring-1">
//                     <div className="badge-wrapper badge-wrapper-1">
//                       <div className="orbit-badge orbit-badge-1">
//                         <div className="badge-icon"><Shield size={16} /></div>
//                         <div><div className="badge-label">Certification</div><div className="badge-value">Licensed & Insured</div></div>
//                       </div>
//                     </div>
//                   </div>

//                   {/* Ring 2 - Availability Badge */}
//                   <div className="orbit-ring orbit-ring-2">
//                     <div className="badge-wrapper badge-wrapper-2">
//                       <div className="orbit-badge orbit-badge-2">
//                         <div className="badge-icon"><Clock size={16} /></div>
//                         <div><div className="badge-label">Availability</div><div className="badge-value">24/7 Service</div></div>
//                       </div>
//                     </div>
//                   </div>

//                   {/* Ring 3 - Pricing Badge */}
//                   <div className="orbit-ring orbit-ring-3">
//                     <div className="badge-wrapper badge-wrapper-3">
//                       <div className="orbit-badge orbit-badge-3">
//                         <div className="badge-icon"><BadgeDollarSign size={16} /></div>
//                         <div><div className="badge-label">Pricing</div><div className="badge-value">Transparent</div></div>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </motion.div>
//           </div>
//         </div>
//       </section>

//       {/* ── STATS ── */}
//       <div className="stats-bar">
//         <div className="container mx-auto px-4">
//           <motion.div className="stats-card" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.65, duration: 0.6 }}>
//             {COUNTER_DATA.map((data, index) => <AnimatedCounter key={index} {...data} />)}
//           </motion.div>
//         </div>
//       </div>
//  {/* Featured Products Showcase */}
//               {!productsLoading && featuredProducts.length > 0 && (
//                 <motion.div 
//                   className="mt-8 pt-8 border-t border-zinc-200 dark:border-zinc-800"
//                   initial={{ opacity: 0, y: 20 }}
//                   animate={{ opacity: 1, y: 0 }}
//                   transition={{ delay: 0.8, duration: 0.6 }}
//                 >
//                   <div className="flex items-center gap-2 mb-4">
//                     <Star size={16} className="text-yellow-500" fill="currentColor" />
//                     <span className="text-sm font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wide">Featured Products</span>
//                   </div>
//                   <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
//                     {featuredProducts.map((product, idx) => (
//                       <motion.div
//                         key={product.id}
//                         initial={{ opacity: 0, scale: 0.9 }}
//                         animate={{ opacity: 1, scale: 1 }}
//                         transition={{ delay: 0.9 + (idx * 0.1), duration: 0.4 }}
//                         className="group cursor-pointer"
//                       >
//                         <Link to={`/product/${product.slug}`} className="block">
//                           <div className="relative bg-white dark:bg-zinc-800 rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-700 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
//                             {/* Product Image */}
//                             <div className="aspect-square overflow-hidden bg-zinc-100 dark:bg-zinc-900 relative">
//                               {product.main_image_url ? (
//                                 <img
//                                   src={product.main_image_url}
//                                   alt={product.name}
//                                   className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
//                                   loading="lazy"
//                                 />
//                               ) : (
//                                 <div className="w-full h-full flex items-center justify-center">
//                                   <ShoppingCart size={32} className="text-zinc-400" />
//                                 </div>
//                               )}
//                               {product.is_featured && (
//                                 <span className="absolute top-1.5 left-1.5 bg-yellow-500 text-white text-[10px] sm:text-xs font-bold px-1.5 py-0.5 rounded-full">
//                                   ⭐ Featured
//                                 </span>
//                               )}
//                               {product.inventory_quantity === 0 && product.track_inventory && (
//                                 <span className="absolute top-1.5 right-1.5 bg-red-500 text-white text-[10px] sm:text-xs font-bold px-1.5 py-0.5 rounded-full">
//                                   Out of Stock
//                                 </span>
//                               )}
//                             </div>
                            
//                             {/* Product Info */}
//                             <div className="p-2.5 sm:p-3">
//                               <h4 className="font-semibold text-xs sm:text-sm text-zinc-900 dark:text-white truncate mb-1.5">
//                                 {product.name}
//                               </h4>
//                               <div className="flex items-center justify-between">
//                                 <div className="flex items-center gap-1.5">
//                                   <span className="text-sm sm:text-base font-bold text-primary">
//                                     ₹{product.price.toFixed(2)}
//                                   </span>
//                                   {product.compare_at_price && (
//                                     <span className="text-[9px] sm:text-[10px] text-zinc-400 line-through">
//                                       ₹{product.compare_at_price.toFixed(2)}
//                                     </span>
//                                   )}
//                                 </div>
//                               </div>
//                               {product.category && (
//                                 <span className="text-[8px] sm:text-[9px] text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-700 px-1 py-0.5 rounded mt-1.5 inline-block">
//                                   {product.category}
//                                 </span>
//                               )}
//                             </div>
//                           </div>
//                         </Link>
//                       </motion.div>
//                     ))}
//                   </div>
//                   <div className="text-center mt-4">
//                     <Link to="/products" className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1">
//                       View All Products <ChevronRight size={12} />
//                     </Link>
//                   </div>
//                 </motion.div>
//               )}
//       {/* ── SERVICES ── */}
//       <Section>
//         <div className="text-center mb-14">
//           <div className="sec-badge"><Zap size={12} /> What We Offer</div>
//           <h2 className="sec-title">Our Professional <span>Services</span></h2>
//           <p className="sec-desc">From simple repairs to complex installations, our certified electricians handle it all with precision and care.</p>
//         </div>
//         <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
//           {displayServices.map((s, i) => (
//             <motion.div key={s.id} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1, duration: 0.5 }}>
//               <ServiceCard service={s} />
//             </motion.div>
//           ))}
//         </div>
//         <div className="text-center">
//           <Link to="/services" className="view-all-btn">View All Services <ArrowRight size={16} /></Link>
//         </div>
//       </Section>

//       {/* ── WHY CHOOSE US ── */}
//       <Section>
//         <div className="text-center mb-14">
//           <div className="sec-badge">Why Choose Us</div>
//           <h2 className="sec-title">Reliable Solutions <span>You Can Trust</span></h2>
//         </div>
//         <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
//           {whyChooseUs.map((item, i) => (
//             <motion.div key={item.title} className="why-card" style={{ "--card-accent": item.accent } as React.CSSProperties}
//               initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1, duration: 0.5 }}>
//               <div className="why-num">0{i + 1}</div>
//               <div className="why-icon-hex">
//                 <div className="why-hex-bg" />
//                 <div className="why-hex-icon"><item.icon size={22} /></div>
//               </div>
//               <div className="why-title">{item.title}</div>
//               <p className="why-desc">{item.description}</p>
//             </motion.div>
//           ))}
//         </div>
//       </Section>

//       {/* ── PROCESS ── */}
//       <Section>
//         <div className="text-center mb-14">
//           <div className="sec-badge"><Zap size={12} /> How It Works</div>
//           <h2 className="sec-title">Our Simple <span>Process</span></h2>
//           <p className="sec-desc">Getting your electrical issues resolved is easy with our streamlined process.</p>
//         </div>
//         <ProcessTimeline />
//       </Section>

//       {/* ── VIDEO ── */}
//       <VideoSection />

//       {/* ── TEAM ── */}
//       <Section>
//         <div className="text-center mb-14">
//           <div className="sec-badge"><Users size={12} /> Our Experts</div>
//           <h2 className="sec-title">Meet Our <span>Team</span></h2>
//         </div>
//         <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
//           {displayTeam.map((m, i) => (
//             <motion.div key={m.id} className="team-card" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1, duration: 0.5 }}>
//               <div className="team-avatar">
//                 <div className="avatar-spin-ring" />
//                 {m.photo_url
//                   ? <img src={m.photo_url} alt={m.name} className="avatar-circle" style={{ objectFit: "cover", width: 80, height: 80, borderRadius: "50%", border: "3px solid hsl(var(--primary) / 0.3)" }} />
//                   : <div className="avatar-circle"><Users size={32} /></div>}
//               </div>
//               <div className="team-name">{m.name}</div>
//               <div className="team-role">{m.role}</div>
//               <p className="team-bio">{m.bio}</p>
//             </motion.div>
//           ))}
//         </div>
//       </Section>

//       {/* ── TESTIMONIALS ── */}
//       <Section>
//         <div className="text-center mb-14">
//           <div className="sec-badge">Testimonials</div>
//           <h2 className="sec-title">What Our <span>Clients Say</span></h2>
//         </div>
//         <TestimonialSlider testimonials={displayTestimonials} />
//       </Section>

//       {/* ── CTA ── */}
//       <section className="cta-section">
//         <div className="cta-grid" />
//         <div className="cta-glow" />
//         <div className="container mx-auto px-4 relative z-10">
//           <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
//             <div className="cta-zap-ring"><Zap size={36} /></div>
//             <h2 className="cta-title">Need an Electrician <span>Today?</span></h2>
//             <p className="cta-desc">Book a professional electrician and get your electrical issues resolved quickly and safely.</p>
//             <div className="cta-btns">
//               <Link to="/booking" className="cta-btn-primary"><Zap size={16} /> Book Now <ArrowRight size={16} /></Link>
//               <Link to="/contact" className="cta-btn-secondary">Contact Us</Link>
//             </div>
//           </motion.div>
//         </div>
//       </section>
//     </>
//   );
// };

// export default Index;


import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Zap, ArrowRight, Shield, Clock, BadgeDollarSign, HeartHandshake,
  Users, X, Phone, CheckCircle, Loader2, Calendar, MapPin, Wrench,
  AlignLeft, ChevronRight, Star, ShoppingCart
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import Section from "@/components/Section";
import ServiceCard from "@/components/ServiceCard";
import AnimatedCounter, { COUNTER_DATA } from "@/components/AnimatedCounter";
import ProcessTimeline from "@/components/ProcessTimeline";
import VideoSection from "@/components/VideoSection";
import TestimonialSlider from "@/components/TestimonialSlider";
import { services as staticServices } from "@/data/services";
import { teamMembers as staticTeam } from "@/data/team";
import { testimonials as staticTestimonials } from "@/data/testimonials";
import { useServices, useTeamMembers, useTestimonials, useProducts } from "@/hooks/useOptimizedData";

const whyChooseUs = [
  { icon: Shield,          title: "Certified Electricians", description: "All our professionals are licensed, insured, and certified with rigorous training.",   accent: "#ffc800" },
  { icon: Clock,           title: "Fast Response",          description: "24/7 availability with average response time under 30 minutes for emergencies.",         accent: "#38bdf8" },
  { icon: BadgeDollarSign, title: "Affordable Pricing",     description: "Transparent, competitive pricing with no hidden fees. Get quotes upfront.",              accent: "#a78bfa" },
  { icon: HeartHandshake,  title: "Safe & Reliable",        description: "100% satisfaction guarantee with industry-leading safety standards.",                    accent: "#34d399" },
];

// ─── Booking Modal ─────────────────────────────────────────────────────────────

const inputCls = "w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all";

export const BookingModal = ({ onClose }: { onClose: () => void }) => {
  const [step, setStep] = useState<"form" | "done">("form");
  const [submitting, setSubmitting] = useState(false);
  const [services, setServices] = useState<{ title: string }[]>([]);
  const [form, setForm] = useState({
    name: "", phone: "", email: "", address: "", service_type: "",
    preferred_date: "", preferred_time: "", description: "",
    exact_location: "",
    custom_service_demand: "",
    is_switch_working: "",
    has_old_fan: "",
    is_electricity_supply_on: "",
  });
  const patch = (u: Partial<typeof form>) => setForm(prev => ({ ...prev, ...u }));
  const [gettingLocation, setGettingLocation] = useState(false);

  const handleClose = () => {
    // Store dismissal time and expiry (30 minutes from now)
    const now = Date.now();
    const expiresAt = now + (30 * 60 * 1000); // 30 minutes in milliseconds
    localStorage.setItem('bookingModalConfig', JSON.stringify({
      dismissedAt: now,
      expiresAt: expiresAt
    }));
    onClose();
  };

  const handleGetCurrentLocation = () => {
    setGettingLocation(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
            const data = await response.json();
            const address = data.display_name || `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
            patch({ address, exact_location: address });
            toast.success("Location fetched successfully!");
          } catch {
            patch({ address: `${latitude}, ${longitude}`, exact_location: `${latitude}, ${longitude}` });
            toast.success("Coordinates fetched! Please provide more details.");
          }
          setGettingLocation(false);
        },
        () => {
          setGettingLocation(false);
          toast.error("Unable to get your location. Please enter manually.");
        }
      );
    } else {
      setGettingLocation(false);
      toast.error("Geolocation is not supported by your browser.");
    }
  };

  useEffect(() => {
    supabase.from("services").select("title").order("sort_order").then(({ data }) => {
      if (data) setServices(data);
    });
  }, []);

  const servicesWithOptions = [...services, { title: "Custom Service" }];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const { error } = await supabase.from("bookings").insert({
      name: form.name, phone: form.phone, email: form.email, address: form.address,
      service_type: form.service_type === "Custom Service" ? `Custom: ${form.custom_service_demand}` : form.service_type,
      preferred_date: form.preferred_date,
      preferred_time: form.preferred_time,
      description: form.service_type === "Custom Service" ? form.custom_service_demand : (form.description || null),
      exact_location: form.exact_location || null,
      custom_service_demand: form.service_type === "Custom Service" ? form.custom_service_demand : null,
      is_switch_working: form.is_switch_working || null,
      has_old_fan: form.has_old_fan || null,
      is_electricity_supply_on: form.is_electricity_supply_on || null,
    });
    if (error) {
      toast.error("Failed to submit booking. Please try again.");
    } else {
      sessionStorage.removeItem('bookingModalDismissed');
      setStep("done");
      toast.success("Booking submitted! We'll confirm your appointment shortly.");
    }
    setSubmitting(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4"
      onClick={handleClose}
    >
      <motion.div
        initial={{ scale: 0.96, opacity: 0, y: 40 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.96, opacity: 0, y: 40 }}
        transition={{ type: "spring", damping: 28, stiffness: 320 }}
        className="relative bg-white dark:bg-zinc-900 rounded-t-3xl sm:rounded-3xl shadow-2xl w-full sm:max-w-lg max-h-[92vh] sm:max-h-[90vh] overflow-hidden flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Top accent strip */}
        <div className="h-1 w-full bg-gradient-to-r from-blue-500 via-violet-500 to-blue-400 flex-shrink-0" />

        {/* Mobile drag handle */}
        <div className="flex justify-center pt-2 pb-0 sm:hidden flex-shrink-0">
          <div className="w-10 h-1 rounded-full bg-zinc-200 dark:bg-zinc-700" />
        </div>

        {/* Header */}
        <div className="flex items-start justify-between px-4 sm:px-6 pt-4 sm:pt-5 pb-3 sm:pb-4 border-b border-zinc-100 dark:border-zinc-800 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-blue-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-500/20">
              <Zap size={16} className="text-white" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-white leading-tight">Book a Service</h2>
              <p className="text-xs text-zinc-400 mt-0.5 hidden sm:block">Fill in details — we'll confirm shortly</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-xl border border-zinc-200 dark:border-zinc-700 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors flex-shrink-0 ml-2"
          >
            <X size={15} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 sm:py-5">
          <AnimatePresence mode="wait">
            {step === "done" ? (
              <motion.div key="done"
                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center text-center py-8 sm:py-10 gap-4">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-emerald-50 dark:bg-emerald-950/30 border-2 border-emerald-200 dark:border-emerald-800 flex items-center justify-center">
                  <CheckCircle size={32} className="text-emerald-500 sm:hidden" />
                  <CheckCircle size={40} className="text-emerald-500 hidden sm:block" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-white">Booking Submitted!</h3>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1.5 max-w-xs">
                    Thank you! We'll reach out to confirm your appointment shortly.
                  </p>
                </div>
                <div className="flex gap-2 mt-2 w-full sm:w-auto">
                  <button onClick={() => { handleClose(); window.location.href = '/track-booking'; }}
                    className="flex-1 sm:flex-none px-4 sm:px-6 py-2.5 border border-emerald-500 text-emerald-600 dark:text-emerald-400 text-sm font-semibold rounded-xl hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-colors">
                    Track Booking
                  </button>
                  <button onClick={handleClose}
                    className="flex-1 sm:flex-none px-4 sm:px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors">
                    Close
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.form key="form" onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
                {/* Name + Phone */}
                <div className="grid grid-cols-1 xs:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Users size={11} /> Full Name <span className="text-red-400">*</span>
                    </label>
                    <input type="text" required placeholder="Rahul Sharma"
                      value={form.name} onChange={e => patch({ name: e.target.value })}
                      className={inputCls} autoComplete="name" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Phone size={11} /> Phone <span className="text-red-400">*</span>
                    </label>
                    <input type="tel" required placeholder="+91 98765 43210"
                      value={form.phone} onChange={e => patch({ phone: e.target.value })}
                      className={inputCls} autoComplete="tel" inputMode="numeric" />
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                    <AlignLeft size={11} /> Email Address <span className="text-red-400">*</span>
                  </label>
                  <input type="email" required placeholder="your@email.com"
                    value={form.email} onChange={e => patch({ email: e.target.value })}
                    className={inputCls} autoComplete="email" />
                </div>

                {/* Address */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                      <MapPin size={11} /> Service Address <span className="text-red-400">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={handleGetCurrentLocation}
                      disabled={gettingLocation}
                      className="text-xs px-2 py-1 rounded bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/50 font-medium transition-colors flex items-center gap-1 disabled:opacity-50 flex-shrink-0"
                    >
                      {gettingLocation
                        ? <><Loader2 size={10} className="animate-spin" /> Getting…</>
                        : <><MapPin size={10} /> Use My Location</>}
                    </button>
                  </div>
                  <input type="text" required placeholder="123 Main St, City"
                    value={form.address} onChange={e => patch({ address: e.target.value })}
                    className={inputCls} autoComplete="street-address" />
                </div>

                {/* Service type */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Wrench size={11} /> Service Type <span className="text-red-400">*</span>
                  </label>
                  <select required value={form.service_type}
                    onChange={e => patch({ service_type: e.target.value })}
                    className={inputCls}>
                    <option value="">Select a service…</option>
                    {servicesWithOptions.map(s => (
                      <option key={s.title} value={s.title}>{s.title}</option>
                    ))}
                  </select>
                </div>

                {/* Custom Service */}
                {form.service_type === "Custom Service" && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                      <AlignLeft size={11} /> Describe Your Requirement <span className="text-red-400">*</span>
                    </label>
                    <textarea rows={3} placeholder="Describe the electrical work you need…"
                      value={form.custom_service_demand} onChange={e => patch({ custom_service_demand: e.target.value })}
                      className={`${inputCls} resize-none`} required />
                  </div>
                )}

                {/* Date + Time */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Calendar size={11} /> Date <span className="text-red-400">*</span>
                    </label>
                    <input type="date" required
                      value={form.preferred_date} onChange={e => patch({ preferred_date: e.target.value })}
                      className={inputCls} min={new Date().toISOString().split("T")[0]} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Clock size={11} /> Time <span className="text-red-400">*</span>
                    </label>
                    <input type="time" required
                      value={form.preferred_time} onChange={e => patch({ preferred_time: e.target.value })}
                      className={inputCls} />
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                    <AlignLeft size={11} /> Description
                    <span className="text-zinc-400 lowercase font-normal tracking-normal text-[10px]">(optional)</span>
                  </label>
                  <textarea rows={2} placeholder="Describe your electrical issue…"
                    value={form.description} onChange={e => patch({ description: e.target.value })}
                    className={`${inputCls} resize-none`} />
                </div>

                {/* Exact Location */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                    <MapPin size={11} /> Landmark
                    <span className="text-zinc-400 lowercase font-normal tracking-normal text-[10px]">(optional)</span>
                  </label>
                  <input type="text" placeholder="Near temple, Behind mall…"
                    value={form.exact_location} onChange={e => patch({ exact_location: e.target.value })}
                    className={inputCls} />
                </div>

                {/* Fan-specific questions */}
                {form.service_type.toLowerCase().includes('fan') && (
                  <div className="space-y-3 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-xl border border-blue-100 dark:border-blue-900/30">
                    <p className="text-xs font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider">Fan Installation Details</p>
                    {[
                      { field: "is_switch_working", label: "Is your switch working?" },
                      { field: "has_old_fan", label: "Old fan at installation location?" },
                      { field: "is_electricity_supply_on", label: "Electricity supply on at switch?" },
                    ].map(({ field, label }) => (
                      <div key={field} className="space-y-1.5">
                        <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                          {label} <span className="text-red-400">*</span>
                        </label>
                        <select required
                          value={form[field as keyof typeof form]}
                          onChange={e => patch({ [field]: e.target.value })}
                          className={inputCls}>
                          <option value="">Select…</option>
                          <option value="yes">Yes</option>
                          <option value="no">No</option>
                        </select>
                      </div>
                    ))}
                  </div>
                )}

                {/* Submit */}
                <button type="submit" disabled={submitting}
                  className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-sm transition-all shadow-sm shadow-blue-500/20 disabled:opacity-60 flex items-center justify-center gap-2 mt-2">
                  {submitting
                    ? <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />Processing…</>
                    : <><Zap size={15} />Submit Booking<ChevronRight size={14} /></>}
                </button>

                <p className="text-center text-xs text-zinc-400 pb-1">
                  Or call at{" "}
                  <a href="tel:+918109308287" className="text-blue-500 font-semibold hover:underline">
                    +91 81093 08287
                  </a>
                </p>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
};

// ─── Page ─────────────────────────────────────────────────────────────────────

const Index = () => {
  const navigate = useNavigate();
  const { services: dbServices, loading: servicesLoading } = useServices(4);
  const { team: dbTeam, loading: teamLoading } = useTeamMembers();
  const { testimonials: dbTestimonials, loading: testimonialsLoading } = useTestimonials();
  const { products: allProducts, loading: productsLoading } = useProducts({ sortBy: 'featured' });

  // Show is_featured products first; fall back to first 4 active products so the section is never empty
  // Memoized to prevent recalculation on every render and fix flickering
  const featuredProducts = useMemo(() => {
    const featured = allProducts.filter(p => p.is_featured);
    return (featured.length > 0 ? featured : allProducts).slice(0, 4);
  }, [allProducts]);

  const displayServices = dbServices.length > 0
    ? dbServices
    : staticServices.slice(0, 4).map(s => ({
        id: s.id, title: s.title, description: s.description,
        icon_name: "Zap", whatsapp_enabled: true, call_enabled: true, book_now_enabled: true,
      }));
  const displayTeam         = dbTeam.length > 0         ? dbTeam         : staticTeam;
  const displayTestimonials = dbTestimonials.length > 0 ? dbTestimonials : staticTestimonials;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700;800;900&family=DM+Sans:wght@400;500;600&display=swap');

        /* ── BASE ── */
        .hero-section {
          position: relative;
          min-height: 100svh;
          display: flex;
          align-items: center;
          overflow: hidden;
          background: hsl(var(--background));
          font-family: 'DM Sans', sans-serif;
          padding-top: 80px; /* navbar clearance */
          padding-bottom: 60px;
        }

        /* ── BACKGROUND EFFECTS ── */
        .hero-grid {
          position: absolute; inset: 0;
          background-image:
            linear-gradient(hsl(var(--primary) / 0.04) 1px, transparent 1px),
            linear-gradient(90deg, hsl(var(--primary) / 0.04) 1px, transparent 1px);
          background-size: 60px 60px;
          mask-image: radial-gradient(ellipse 90% 80% at 30% 50%, black 0%, transparent 100%);
          pointer-events: none;
        }

        .hero-glow-1 {
          position: absolute; top: 20%; left: -80px;
          width: min(500px, 80vw); height: min(500px, 80vw);
          border-radius: 50%;
          background: radial-gradient(circle, hsl(var(--primary) / 0.08) 0%, transparent 70%);
          animation: floatGlow 6s ease-in-out infinite;
          pointer-events: none;
        }
        .hero-glow-2 {
          position: absolute; bottom: 5%; right: -60px;
          width: min(400px, 70vw); height: min(400px, 70vw);
          border-radius: 50%;
          background: radial-gradient(circle, hsl(var(--secondary) / 0.06) 0%, transparent 70%);
          animation: floatGlow 8s ease-in-out infinite reverse;
          animation-delay: 2s;
          pointer-events: none;
        }

        @keyframes floatGlow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }

        /* ── HERO TEXT ── */
        .hero-trust-badge {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 7px 16px;
          border: 1px solid hsl(var(--primary) / 0.3);
          border-radius: 100px;
          background: hsl(var(--primary) / 0.07);
          margin-bottom: 20px;
          font-size: 12px; font-weight: 600;
          color: hsl(var(--foreground));
          letter-spacing: 0.3px;
        }
        .hero-trust-badge span { color: hsl(var(--secondary)); }

        .hero-h1 {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: clamp(42px, 9vw, 96px);
          font-weight: 900;
          line-height: 0.9;
          text-transform: uppercase;
          letter-spacing: -1px;
          color: hsl(var(--foreground));
          margin-bottom: 20px;
        }
        @media (max-width: 480px) {
          .hero-h1 { font-size: clamp(38px, 12vw, 56px); letter-spacing: -0.5px; line-height: 0.92; }
        }

        .hero-h1-accent {
          background: linear-gradient(135deg, hsl(var(--secondary)) 0%, hsl(var(--electric-yellow-light)) 50%, hsl(var(--electric-blue-dark)) 100%);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
          display: block;
        }

        .hero-desc {
          font-size: clamp(14px, 2vw, 17px);
          color: hsl(var(--muted-foreground));
          line-height: 1.75;
          max-width: 480px;
          margin-bottom: 12px;
        }

        .hero-btns {
          display: flex; flex-wrap: wrap; gap: 12px;
          margin-bottom: 32px;
        }

        .hero-btn-primary, .hero-btn-secondary {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 13px 24px;
          font-family: 'Barlow Condensed', sans-serif;
          font-size: clamp(14px, 2vw, 17px);
          font-weight: 800; letter-spacing: 0.6px; text-transform: uppercase;
          border-radius: 12px; text-decoration: none;
          transition: all 0.3s ease;
          white-space: nowrap;
        }
        @media (max-width: 380px) {
          .hero-btn-primary, .hero-btn-secondary {
            width: 100%; justify-content: center;
            padding: 13px 20px;
          }
        }
        .hero-btn-primary {
          background: linear-gradient(135deg, hsl(var(--primary)), hsl(var(--electric-blue-dark)));
          color: hsl(var(--primary-foreground));
        }
        .hero-btn-primary:hover {
          box-shadow: 0 0 36px hsl(var(--primary) / 0.45), 0 8px 24px hsl(var(--primary) / 0.3);
          transform: translateY(-2px);
        }
        .hero-btn-secondary {
          background: linear-gradient(135deg, hsl(var(--secondary)), hsl(var(--electric-blue-dark)));
          border: none; color: hsl(var(--primary-foreground));
        }
        .hero-btn-secondary:hover { transform: translateY(-2px); opacity: 0.9; }

        /* ── TRUST STRIP ── */
        .hero-trust-strip {
          display: flex; flex-wrap: wrap; align-items: center; gap: 16px;
          padding-top: 20px;
          border-top: 1px solid hsl(var(--border) / 0.5);
        }
        .trust-avatars { display: flex; align-items: center; }
        .trust-avatar {
          width: 30px; height: 30px; border-radius: 50%;
          background: linear-gradient(135deg, hsl(var(--primary) / 0.2), hsl(var(--secondary) / 0.1));
          border: 2px solid hsl(var(--border) / 0.5);
          display: flex; align-items: center; justify-content: center;
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 12px; font-weight: 700; color: hsl(var(--primary));
          margin-left: -8px;
        }
        .trust-avatar:first-child { margin-left: 0; }
        .trust-rating-val { font-size: 13px; font-weight: 700; color: hsl(var(--foreground)); display: flex; align-items: center; gap: 4px; }
        .trust-rating-label { font-size: 10px; color: hsl(var(--muted-foreground) / 0.5); margin-top: 1px; }
        .trust-star { color: hsl(var(--secondary)); }
        .trust-sep { width: 1px; height: 24px; background: hsl(var(--border) / 0.5); }
        .trust-text { font-size: 12px; color: hsl(var(--muted-foreground) / 0.6); }
        .trust-text strong { color: hsl(var(--foreground)); }

        /* ── HERO VISUAL (desktop only) ── */
        .hero-visual {
          display: none; align-items: center; justify-content: center; position: relative;
        }
        @media (min-width: 1024px) { .hero-visual { display: flex; } }

        .orb-outer {
          position: relative; width: 340px; height: 340px; border-radius: 50%;
          border: 1.5px solid hsl(var(--primary) / 0.2);
          background: radial-gradient(circle at 40% 40%, hsl(var(--primary) / 0.07), transparent 60%);
          display: flex; align-items: center; justify-content: center;
          animation: orbFloat 6s ease-in-out infinite;
        }
        @media (min-width: 1280px) { .orb-outer { width: 400px; height: 400px; } }
        @keyframes orbFloat { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-12px); } }

        .orb-mid {
          width: 240px; height: 240px; border-radius: 50%;
          border: 1.5px solid hsl(var(--primary) / 0.25);
          background: radial-gradient(circle at 40% 40%, hsl(var(--primary) / 0.1), transparent 70%);
          display: flex; align-items: center; justify-content: center;
        }
        @media (min-width: 1280px) { .orb-mid { width: 290px; height: 290px; } }

        .orb-inner {
          width: 150px; height: 150px; border-radius: 50%;
          border: 2px solid hsl(var(--primary) / 0.4);
          background: radial-gradient(circle, hsl(var(--primary) / 0.12), hsl(var(--card) / 0.95) 70%);
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 0 60px hsl(var(--primary) / 0.15), inset 0 0 40px hsl(var(--primary) / 0.05);
        }
        @media (min-width: 1280px) { .orb-inner { width: 180px; height: 180px; } }

        .orb-zap {
          color: hsl(var(--secondary));
          filter: drop-shadow(0 0 20px hsl(var(--primary) / 0.6));
          animation: zapPulse 2s ease-in-out infinite;
        }
        @keyframes zapPulse {
          0%, 100% { filter: drop-shadow(0 0 20px hsl(var(--primary) / 0.6)); transform: scale(1); }
          50% { filter: drop-shadow(0 0 36px hsl(var(--primary) / 0.9)); transform: scale(1.05); }
        }

        /* ── ORBITAL BADGES ── */
        .orbit-container {
          position: absolute; top: 50%; left: 50%;
          transform: translate(-50%, -50%);
          width: 460px; height: 460px;
          pointer-events: none;
        }
        @media (min-width: 1280px) { .orbit-container { width: 500px; height: 500px; } }

        .orbit-ring {
          position: absolute; top: 50%; left: 50%;
          transform: translate(-50%, -50%);
          border-radius: 50%;
          border: 1px dashed hsl(var(--primary) / 0.15);
          animation: orbitRotate linear infinite;
        }
        .orbit-ring-1 { width: 380px; height: 380px; animation-duration: 20s; }
        .orbit-ring-2 { width: 300px; height: 300px; animation-duration: 15s; animation-direction: reverse; }
        .orbit-ring-3 { width: 230px; height: 230px; animation-duration: 12s; }
        @media (min-width: 1280px) {
          .orbit-ring-1 { width: 420px; height: 420px; }
          .orbit-ring-2 { width: 340px; height: 340px; }
          .orbit-ring-3 { width: 260px; height: 260px; }
        }
        @keyframes orbitRotate { to { transform: translate(-50%, -50%) rotate(360deg); } }

        .badge-wrapper { position: absolute; }
        .badge-wrapper-1 { top: 0; left: 50%; transform: translate(-50%, -50%); }
        .badge-wrapper-2 { bottom: 0; left: 50%; transform: translate(-50%, 50%); }
        .badge-wrapper-3 { top: 50%; right: 0; transform: translate(50%, -50%); }

        .orbit-badge {
          display: flex; align-items: center; gap: 10px;
          padding: 10px 14px;
          background: hsl(var(--card) / 0.95);
          border: 1px solid hsl(var(--border) / 0.3);
          border-radius: 14px;
          backdrop-filter: blur(12px);
          box-shadow: 0 8px 32px hsl(var(--foreground) / 0.1);
          animation: counterRotate linear infinite;
          white-space: nowrap;
        }
        .orbit-badge-1 { animation-duration: 20s; }
        .orbit-badge-2 { animation-duration: 15s; animation-direction: reverse; }
        .orbit-badge-3 { animation-duration: 12s; }
        @keyframes counterRotate { to { transform: rotate(-360deg); } }

        .badge-icon {
          width: 30px; height: 30px; border-radius: 8px;
          background: hsl(var(--primary) / 0.1);
          display: flex; align-items: center; justify-content: center;
          color: hsl(var(--secondary)); flex-shrink: 0;
        }
        .badge-label { font-size: 9px; color: hsl(var(--muted-foreground) / 0.5); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 2px; }
        .badge-value { font-family: 'Barlow Condensed', sans-serif; font-size: 13px; font-weight: 700; color: hsl(var(--foreground)); line-height: 1; }

        /* ── STATS BAR ── */
        .stats-bar { position: relative; z-index: 20; margin-top: -40px; }
        @media (max-width: 767px) { .stats-bar { margin-top: 0; } }

        .stats-card {
          background: hsl(var(--card));
          border: 1px solid hsl(var(--border) / 0.3);
          border-radius: 20px;
          padding: 24px 20px;
          box-shadow: 0 24px 80px hsl(var(--foreground) / 0.1), 0 0 0 1px hsl(var(--primary) / 0.06);
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 20px;
        }
        @media (min-width: 768px) {
          .stats-card { grid-template-columns: repeat(4, 1fr); padding: 36px 40px; }
        }

        /* ── SECTION LABELS ── */
        .sec-badge {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 6px 16px;
          border: 1px solid hsl(var(--border) / 0.3);
          border-radius: 100px;
          background: hsl(var(--primary) / 0.06);
          margin-bottom: 14px;
          font-size: 11px; font-weight: 700;
          color: hsl(var(--secondary));
          letter-spacing: 1px; text-transform: uppercase;
          font-family: 'Barlow Condensed', sans-serif;
        }
        .sec-title {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: clamp(28px, 5vw, 52px);
          font-weight: 900; text-transform: uppercase;
          color: hsl(var(--foreground));
          letter-spacing: -0.5px; line-height: 1; margin-bottom: 14px;
        }
        .sec-title span {
          background: linear-gradient(135deg, hsl(var(--secondary)), hsl(var(--electric-yellow-light)));
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
        }
        .sec-desc { font-size: 14px; color: hsl(var(--muted-foreground) / 0.6); line-height: 1.7; max-width: 540px; margin: 0 auto; }

        /* ── WHY CARDS ── */
        .why-card {
          position: relative;
          background: hsl(var(--card));
          border: 1px solid hsl(var(--border) / 0.3);
          border-radius: 20px;
          padding: 28px 24px;
          overflow: hidden;
          font-family: 'DM Sans', sans-serif;
          transition: all 0.4s cubic-bezier(0.23, 1, 0.32, 1);
          cursor: default;
        }
        .why-card::after { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px; background: linear-gradient(90deg, transparent, var(--card-accent), transparent); opacity: 0; transition: opacity 0.4s; }
        .why-card:hover { transform: translateY(-6px); border-color: hsl(var(--border) / 0.5); box-shadow: 0 24px 60px hsl(var(--foreground) / 0.1); }
        .why-card:hover::after { opacity: 1; }
        .why-icon-hex { position: relative; width: 54px; height: 54px; margin-bottom: 18px; flex-shrink: 0; }
        .why-hex-bg { position: absolute; inset: 0; background: linear-gradient(135deg, hsl(var(--primary) / 0.14), hsl(var(--primary) / 0.04)); clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%); transition: all 0.4s; }
        .why-card:hover .why-hex-bg { background: linear-gradient(135deg, var(--card-accent), hsl(var(--secondary) / 0.6)); }
        .why-hex-icon { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; color: var(--card-accent); transition: color 0.4s; }
        .why-card:hover .why-hex-icon { color: hsl(var(--card-foreground)); }
        .why-num { position: absolute; top: 16px; right: 16px; font-family: 'Barlow Condensed', sans-serif; font-size: 36px; font-weight: 900; color: hsl(var(--primary) / 0.04); line-height: 1; user-select: none; }
        .why-title { font-family: 'Barlow Condensed', sans-serif; font-size: 18px; font-weight: 800; text-transform: uppercase; color: hsl(var(--foreground)); margin-bottom: 8px; letter-spacing: 0.3px; }
        .why-desc { font-size: 13px; color: hsl(var(--muted-foreground) / 0.58); line-height: 1.7; }

        /* ── TEAM CARDS ── */
        .team-card {
          position: relative; background: hsl(var(--card));
          border: 1px solid hsl(var(--border) / 0.3);
          border-radius: 20px; padding: 28px 20px; text-align: center;
          overflow: hidden; font-family: 'DM Sans', sans-serif;
          transition: all 0.4s cubic-bezier(0.23, 1, 0.32, 1);
        }
        .team-card::after { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px; background: linear-gradient(90deg, transparent, hsl(var(--primary)), transparent); opacity: 0; transition: opacity 0.4s; }
        .team-card:hover { transform: translateY(-6px); box-shadow: 0 20px 50px hsl(var(--foreground) / 0.1); }
        .team-card:hover::after { opacity: 1; }
        .team-avatar { position: relative; width: 80px; height: 80px; margin: 0 auto 16px; }
        .avatar-spin-ring { position: absolute; inset: -5px; border-radius: 50%; border: 1.5px solid hsl(var(--border) / 0.3); border-top-color: hsl(var(--secondary)); animation: avatarSpin 8s linear infinite; }
        @keyframes avatarSpin { to { transform: rotate(360deg); } }
        .avatar-circle { width: 80px; height: 80px; border-radius: 50%; background: linear-gradient(135deg, hsl(var(--primary) / 0.1), hsl(var(--secondary) / 0.05)); border: 1.5px solid hsl(var(--border) / 0.3); display: flex; align-items: center; justify-content: center; color: hsl(var(--muted-foreground)); transition: all 0.4s; }
        .team-name { font-family: 'Barlow Condensed', sans-serif; font-size: 18px; font-weight: 800; text-transform: uppercase; color: hsl(var(--foreground)); margin-bottom: 4px; }
        .team-role { display: inline-block; font-size: 10px; font-weight: 700; color: hsl(var(--secondary)); letter-spacing: 0.8px; text-transform: uppercase; background: hsl(var(--primary) / 0.08); border: 1px solid hsl(var(--border) / 0.3); border-radius: 100px; padding: 2px 10px; margin-bottom: 10px; }
        .team-bio { font-size: 12.5px; color: hsl(var(--muted-foreground) / 0.5); line-height: 1.65; }

        /* ── VIEW ALL BTN ── */
        .view-all-btn {
          display: inline-flex; align-items: center; gap: 9px;
          padding: 12px 28px;
          border: 1.5px solid hsl(var(--border) / 0.5);
          color: hsl(var(--secondary));
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 15px; font-weight: 800; letter-spacing: 0.6px; text-transform: uppercase;
          border-radius: 12px; text-decoration: none;
          background: hsl(var(--primary) / 0.04);
          transition: all 0.3s ease; margin-top: 40px;
        }
        .view-all-btn:hover { background: hsl(var(--secondary)); color: hsl(var(--card-foreground)); border-color: hsl(var(--secondary)); box-shadow: 0 0 28px hsl(var(--primary) / 0.35); transform: translateY(-2px); }

        /* ── CTA ── */
        .cta-section { position: relative; overflow: hidden; background: hsl(var(--background)); padding: 80px 0; text-align: center; font-family: 'DM Sans', sans-serif; }
        .cta-grid { position: absolute; inset: 0; background-image: linear-gradient(hsl(var(--primary) / 0.04) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary) / 0.04) 1px, transparent 1px); background-size: 60px 60px; mask-image: radial-gradient(ellipse 70% 80% at 50% 50%, black 20%, transparent 100%); pointer-events: none; }
        .cta-glow { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: min(600px, 90vw); height: 400px; background: radial-gradient(ellipse, hsl(var(--primary) / 0.08) 0%, transparent 70%); pointer-events: none; }
        .cta-zap-ring { position: relative; width: 72px; height: 72px; margin: 0 auto 24px; border-radius: 50%; border: 2px solid hsl(var(--border) / 0.3); display: flex; align-items: center; justify-content: center; background: hsl(var(--primary) / 0.06); box-shadow: 0 0 40px hsl(var(--primary) / 0.15); }
        .cta-title { font-family: 'Barlow Condensed', sans-serif; font-size: clamp(30px, 6vw, 64px); font-weight: 900; text-transform: uppercase; color: hsl(var(--foreground)); letter-spacing: -1px; line-height: 0.95; margin-bottom: 14px; }
        .cta-title span { background: linear-gradient(135deg, hsl(var(--secondary)), hsl(var(--electric-yellow-light))); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .cta-desc { font-size: 14px; color: hsl(var(--muted-foreground) / 0.5); max-width: 420px; margin: 0 auto 32px; line-height: 1.7; padding: 0 16px; }
        .cta-btns { display: flex; flex-wrap: wrap; gap: 12px; justify-content: center; padding: 0 16px; }
        .cta-btn-primary {
          display: inline-flex; align-items: center; gap: 9px; padding: 14px 32px;
          background: linear-gradient(135deg, hsl(var(--secondary)), hsl(var(--electric-blue-dark)));
          color: hsl(var(--primary-foreground));
          font-family: 'Barlow Condensed', sans-serif; font-size: clamp(14px, 2vw, 17px);
          font-weight: 800; letter-spacing: 0.6px; text-transform: uppercase;
          border-radius: 12px; text-decoration: none; transition: all 0.3s ease;
        }
        .cta-btn-primary:hover { box-shadow: 0 0 32px hsl(var(--primary) / 0.45); transform: translateY(-2px); }
        .cta-btn-secondary {
          display: inline-flex; align-items: center; gap: 9px; padding: 14px 28px;
          border: 1.5px solid hsl(var(--border) / 0.5); color: hsl(var(--foreground));
          font-family: 'Barlow Condensed', sans-serif; font-size: clamp(14px, 2vw, 17px);
          font-weight: 700; letter-spacing: 0.6px; text-transform: uppercase;
          border-radius: 12px; text-decoration: none; background: hsl(var(--muted) / 0.3); transition: all 0.3s;
        }
        .cta-btn-secondary:hover { border-color: hsl(var(--primary) / 0.6); color: hsl(var(--secondary)); background: hsl(var(--primary) / 0.08); }

        /* ── FEATURED PRODUCTS MINI GRID ── */
        .feat-prod-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 10px;
        }
        @media (min-width: 500px) { .feat-prod-grid { grid-template-columns: repeat(4, 1fr); gap: 12px; } }

        /* ── TOUCH / TAP TARGETS ── */
        @media (max-width: 767px) {
          .why-card:hover { transform: none; }
          .team-card:hover { transform: none; }
        }
      `}</style>

      {/* ── HERO ── */}
      <section className="hero-section">
        <div className="hero-grid" />
        <div className="hero-glow-1" />
        <div className="hero-glow-2" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-12 items-center">

            {/* Left column */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
            >
              <motion.div
                className="hero-trust-badge"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Zap size={13} />
                Trusted by <span>1,000+</span> Happy Customers
              </motion.div>

              <h1 className="hero-h1">
                Professional
                <span className="hero-h1-accent">Electricians</span>
                At Your Doorstep
              </h1>

              <p className="hero-desc">
                On-demand electrical services for installation, repair, and maintenance.
                Fast, reliable, and affordable with 24/7 support.
              </p>
              <p className="hero-desc" style={{ marginBottom: 28 }}>
                India's leading appliance care provider, currently serving Ujjain (M.P.) — expanding soon.
              </p>

              <div className="hero-btns">
                <Link to="/booking" className="hero-btn-primary">
                  <Zap size={15} /> Book Service Now <ArrowRight size={15} />
                </Link>
                <Link to="/products" className="hero-btn-secondary">
                  <ShoppingCart size={15} /> Buy Products
                </Link>
              </div>

              {/* Trust strip */}
              <motion.div
                className="hero-trust-strip"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.55 }}
                style={{ marginTop: 24 }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div className="trust-avatars">
                    {["A","B","C","D"].map(l => <div className="trust-avatar" key={l}>{l}</div>)}
                  </div>
                  <div>
                    <div className="trust-rating-val"><span className="trust-star">★</span> 4.9/5</div>
                    <div className="trust-rating-label">500+ reviews</div>
                  </div>
                </div>
                <div className="trust-sep hidden sm:block" />
                <div className="trust-text hidden sm:block"><strong>24/7</strong> Emergency Support</div>
                <div className="trust-sep hidden sm:block" />
                <div className="trust-text hidden sm:block"><strong>10+</strong> Years Experience</div>
              </motion.div>
            </motion.div>

            {/* Right column – orb visual (desktop only, defined in CSS) */}
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
                      <Zap size={72} className="orb-zap" />
                    </div>
                  </div>
                </div>

                <div className="orbit-container">
                  <div className="orbit-ring orbit-ring-1">
                    <div className="badge-wrapper badge-wrapper-1">
                      <div className="orbit-badge orbit-badge-1">
                        <div className="badge-icon"><Shield size={14} /></div>
                        <div>
                          <div className="badge-label">Certification</div>
                          <div className="badge-value">Licensed & Insured</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="orbit-ring orbit-ring-2">
                    <div className="badge-wrapper badge-wrapper-2">
                      <div className="orbit-badge orbit-badge-2">
                        <div className="badge-icon"><Clock size={14} /></div>
                        <div>
                          <div className="badge-label">Availability</div>
                          <div className="badge-value">24/7 Service</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="orbit-ring orbit-ring-3">
                    <div className="badge-wrapper badge-wrapper-3">
                      <div className="orbit-badge orbit-badge-3">
                        <div className="badge-icon"><BadgeDollarSign size={14} /></div>
                        <div>
                          <div className="badge-label">Pricing</div>
                          <div className="badge-value">Transparent</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
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
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            {COUNTER_DATA.map((data, i) => <AnimatedCounter key={i} {...data} />)}
          </motion.div>
        </div>
      </div>

      {/* ── FEATURED PRODUCTS ── */}
      <Section>
        <div className="text-center mb-10 sm:mb-14">
          <div className="sec-badge"><Star size={11} /> Shop</div>
          <h2 className="sec-title">Featured <span>Products</span></h2>
          <p className="sec-desc">Hand-picked electrical components and accessories for your home and office.</p>
        </div>

        {productsLoading ? (
          /* skeleton */
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
        ) : featuredProducts.length === 0 ? null : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {featuredProducts.map((product, idx) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.08, duration: 0.45 }}
              >
                <Link to={`/products/${product.slug}`} className="block group h-full">
                  <div className="h-full bg-card border border-border/40 rounded-xl overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col">
                    {/* image */}
                    <div className="aspect-square overflow-hidden bg-muted relative">
                      {product.main_image_url ? (
                        <img
                          src={product.main_image_url}
                          alt={product.name}
                          loading="lazy"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ShoppingCart size={32} className="text-muted-foreground opacity-20" />
                        </div>
                      )}
                      {product.is_featured && (
                        <span className="absolute top-2 left-2 bg-yellow-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5">
                          <Star size={9} className="fill-current" /> Featured
                        </span>
                      )}
                      {product.track_inventory && product.inventory_quantity === 0 && (
                        <span className="absolute top-2 right-2 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                          Out of Stock
                        </span>
                      )}
                    </div>

                    {/* info */}
                    <div className="p-3 sm:p-4 flex flex-col flex-1">
                      <h3 className="font-heading font-semibold text-sm sm:text-base line-clamp-2 leading-snug mb-2 flex-1">
                        {product.name}
                      </h3>
                      <div className="flex items-center justify-between mt-auto gap-2">
                        <div className="min-w-0">
                          <span className="text-base sm:text-lg font-bold text-primary block">
                            ₹{product.price.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                          </span>
                          {product.compare_at_price && (
                            <span className="text-xs text-muted-foreground line-through">
                              ₹{product.compare_at_price.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                            </span>
                          )}
                        </div>
                        {product.compare_at_price && product.compare_at_price > product.price && (
                          <span className="text-[10px] font-bold text-green-600 bg-green-50 dark:bg-green-950/30 px-2 py-0.5 rounded-full flex-shrink-0">
                            {Math.round((1 - product.price / product.compare_at_price) * 100)}% OFF
                          </span>
                        )}
                      </div>
                      {product.category && (
                        <span className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded mt-2 inline-block w-fit">
                          {product.category}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}

        <div className="text-center">
          <Link to="/products" className="view-all-btn">
            View All Products <ArrowRight size={15} />
          </Link>
        </div>
      </Section>

      {/* ── SERVICES ── */}
      <Section>
        <div className="text-center mb-10 sm:mb-14">
          <div className="sec-badge"><Zap size={11} /> What We Offer</div>
          <h2 className="sec-title">Our Professional <span>Services</span></h2>
          <p className="sec-desc">From simple repairs to complex installations, our certified electricians handle it all with precision and care.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
          {displayServices.map((s, i) => (
            <motion.div key={s.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.45 }}
            >
              <ServiceCard service={s} />
            </motion.div>
          ))}
        </div>
        <div className="text-center">
          <Link to="/services" className="view-all-btn">View All Services <ArrowRight size={15} /></Link>
        </div>
      </Section>

      {/* ── WHY CHOOSE US ── */}
      <Section>
        <div className="text-center mb-10 sm:mb-14">
          <div className="sec-badge">Why Choose Us</div>
          <h2 className="sec-title">Reliable Solutions <span>You Can Trust</span></h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
          {whyChooseUs.map((item, i) => (
            <motion.div
              key={item.title}
              className="why-card"
              style={{ "--card-accent": item.accent } as React.CSSProperties}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.45 }}
            >
              <div className="why-num">0{i + 1}</div>
              <div className="why-icon-hex">
                <div className="why-hex-bg" />
                <div className="why-hex-icon"><item.icon size={20} /></div>
              </div>
              <div className="why-title">{item.title}</div>
              <p className="why-desc">{item.description}</p>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* ── PROCESS ── */}
      <Section>
        <div className="text-center mb-10 sm:mb-14">
          <div className="sec-badge"><Zap size={11} /> How It Works</div>
          <h2 className="sec-title">Our Simple <span>Process</span></h2>
          <p className="sec-desc">Getting your electrical issues resolved is easy with our streamlined process.</p>
        </div>
        <ProcessTimeline />
      </Section>

      {/* ── VIDEO ── */}
      <VideoSection />

      {/* ── TEAM ── */}
      <Section>
        <div className="text-center mb-10 sm:mb-14">
          <div className="sec-badge"><Users size={11} /> Our Experts</div>
          <h2 className="sec-title">Meet Our <span>Team</span></h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
          {displayTeam.map((m, i) => (
            <motion.div
              key={m.id}
              className="team-card"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.45 }}
            >
              <div className="team-avatar">
                <div className="avatar-spin-ring" />
                {m.photo_url
                  ? <img src={m.photo_url} alt={m.name} style={{ objectFit: "cover", width: 80, height: 80, borderRadius: "50%", border: "3px solid hsl(var(--primary) / 0.3)" }} />
                  : <div className="avatar-circle"><Users size={28} /></div>}
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
        <div className="text-center mb-10 sm:mb-14">
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
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="cta-zap-ring"><Zap size={32} /></div>
            <h2 className="cta-title">Need an Electrician <span>Today?</span></h2>
            <p className="cta-desc">Book a professional electrician and get your electrical issues resolved quickly and safely.</p>
            <div className="cta-btns">
              <Link to="/booking" className="cta-btn-primary"><Zap size={15} /> Book Now <ArrowRight size={15} /></Link>
              <Link to="/contact" className="cta-btn-secondary">Contact Us</Link>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
};

export default Index;