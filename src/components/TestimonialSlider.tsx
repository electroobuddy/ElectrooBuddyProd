// import { useState, useEffect } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import { Star, ChevronLeft, ChevronRight, Quote } from "lucide-react";

// interface Testimonial {
//   id: string;
//   name: string;
//   text: string;
//   rating: number;
//   service?: string | null;
// }

// const TestimonialSlider = ({ testimonials }: { testimonials: Testimonial[] }) => {
//   const [current, setCurrent] = useState(0);
//   const [direction, setDirection] = useState(0);

//   useEffect(() => {
//     if (testimonials.length <= 1) return;
//     const timer = setInterval(() => {
//       setDirection(1);
//       setCurrent((prev) => (prev + 1) % testimonials.length);
//     }, 5000);
//     return () => clearInterval(timer);
//   }, [testimonials.length]);

//   const navigate = (dir: number) => {
//     setDirection(dir);
//     setCurrent((prev) => (prev + dir + testimonials.length) % testimonials.length);
//   };

//   if (testimonials.length === 0) return null;

//   const variants = {
//     enter: (dir: number) => ({
//       x: dir > 0 ? 300 : -300,
//       opacity: 0,
//     }),
//     center: {
//       x: 0,
//       opacity: 1,
//     },
//     exit: (dir: number) => ({
//       x: dir > 0 ? -300 : 300,
//       opacity: 0,
//     }),
//   };

//   const t = testimonials[current];

//   return (
//     <div className="relative max-w-4xl mx-auto">
//       {/* Enhanced testimonial card */}
//       <div className="relative min-h-[320px] flex items-center justify-center">
//         <AnimatePresence mode="wait" custom={direction}>
//           <motion.div
//             key={current}
//             custom={direction}
//             variants={variants}
//             initial="enter"
//             animate="center"
//             exit="exit"
//             transition={{ duration: 0.5, ease: "easeInOut" }}
//             className="w-full px-4"
//           >
//             <div className="group relative bg-card border-2 border-border/50 rounded-3xl p-8 md:p-10 shadow-2xl shadow-primary/5 hover:shadow-xl hover:shadow-primary/10 transition-all duration-500">
//               {/* Decorative quote mark */}
//               <div className="absolute top-6 left-8 opacity-10">
//                 <Quote className="w-20 h-20 text-primary" />
//               </div>
              
//               <div className="relative z-10">
//                 {/* Enhanced rating display */}
//                 <div className="flex gap-1.5 justify-center mb-6">
//                   {Array.from({ length: t.rating }).map((_, i) => (
//                     <motion.div
//                       key={i}
//                       initial={{ scale: 0 }}
//                       animate={{ scale: 1 }}
//                       transition={{ delay: i * 0.1, duration: 0.3 }}
//                     >
//                       <Star className="w-6 h-6 fill-secondary text-secondary drop-shadow-sm" />
//                     </motion.div>
//                   ))}
//                 </div>
                
//                 {/* Testimonial text */}
//                 <p className="text-lg md:text-xl lg:text-2xl text-foreground leading-relaxed mb-8 italic font-light">
//                   "{t.text}"
//                 </p>
                
//                 {/* Customer info with avatar placeholder */}
//                 <div className="flex items-center justify-center gap-4">
//                   <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center border-2 border-primary/20 shadow-lg shadow-primary/10">
//                     <span className="text-xl font-bold text-primary">
//                       {t.name.charAt(0).toUpperCase()}
//                     </span>
//                   </div>
//                   <div className="text-left">
//                     <p className="font-heading font-bold text-foreground text-base">{t.name}</p>
//                     {t.service && (
//                       <p className="text-sm text-muted-foreground mt-0.5 flex items-center gap-1">
//                         <span className="w-1 h-1 rounded-full bg-primary" />
//                         {t.service}
//                       </p>
//                     )}
//                   </div>
//                 </div>
//               </div>
              
//               {/* Subtle gradient overlay */}
//               <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl pointer-events-none" />
//             </div>
//           </motion.div>
//         </AnimatePresence>
//       </div>

//       {/* Enhanced navigation */}
//       <div className="flex items-center justify-center gap-4 mt-10">
//         <motion.button
//           whileHover={{ scale: 1.1 }}
//           whileTap={{ scale: 0.9 }}
//           onClick={() => navigate(-1)}
//           className="w-12 h-12 rounded-full border-2 border-border/50 bg-card flex items-center justify-center hover:border-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-primary/20"
//         >
//           <ChevronLeft className="w-5 h-5" />
//         </motion.button>
        
//         <div className="flex gap-2.5">
//           {testimonials.map((_, i) => (
//             <motion.button
//               key={i}
//               whileHover={{ scale: 1.2 }}
//               onClick={() => { setDirection(i > current ? 1 : -1); setCurrent(i); }}
//               className={`rounded-full transition-all duration-500 ${
//                 i === current 
//                   ? "bg-gradient-to-r from-primary to-electric-blue-dark w-10 h-3 shadow-lg shadow-primary/30" 
//                   : "bg-border w-3 h-3 hover:bg-muted-foreground/50"
//               }`}
//             />
//           ))}
//         </div>
        
//         <motion.button
//           whileHover={{ scale: 1.1 }}
//           whileTap={{ scale: 0.9 }}
//           onClick={() => navigate(1)}
//           className="w-12 h-12 rounded-full border-2 border-border/50 bg-card flex items-center justify-center hover:border-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-primary/20"
//         >
//           <ChevronRight className="w-5 h-5" />
//         </motion.button>
//       </div>
//     </div>
//   );
// };

// export default TestimonialSlider;

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";

interface Testimonial {
  id: string;
  name: string;
  text: string;
  rating: number;
  service?: string | null;
}

const TestimonialSlider = ({ testimonials }: { testimonials: Testimonial[] }) => {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(0);

  useEffect(() => {
    if (testimonials.length <= 1) return;
    const timer = setInterval(() => {
      setDirection(1);
      setCurrent((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [testimonials.length]);

  const navigate = (dir: number) => {
    setDirection(dir);
    setCurrent((prev) => (prev + dir + testimonials.length) % testimonials.length);
  };

  if (testimonials.length === 0) return null;

  const variants = {
    enter: (dir: number) => ({ x: dir > 0 ? 280 : -280, opacity: 0, scale: 0.96 }),
    center: { x: 0, opacity: 1, scale: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -280 : 280, opacity: 0, scale: 0.96 }),
  };

  const t = testimonials[current];

  const initials = t.name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@700;800&family=DM+Sans:ital,wght@0,400;0,500;1,400&display=swap');

        .testimonial-outer {
          position: relative;
          font-family: 'DM Sans', sans-serif;
          max-width: 780px;
          margin: 0 auto;
        }

        .testimonial-card {
          position: relative;
          background: linear-gradient(135deg, #0d1428 0%, #0a0f1e 60%, #0d1428 100%);
          border: 1px solid rgba(255, 200, 0, 0.18);
          border-radius: 24px;
          padding: 52px 52px 44px;
          overflow: hidden;
          min-height: 300px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
        }

        @media (max-width: 640px) {
          .testimonial-card { padding: 36px 24px 32px; }
        }

        .card-corner-tl {
          position: absolute;
          top: 0; left: 0;
          width: 80px; height: 80px;
          border-top: 2px solid rgba(255,200,0,0.4);
          border-left: 2px solid rgba(255,200,0,0.4);
          border-radius: 24px 0 0 0;
        }

        .card-corner-br {
          position: absolute;
          bottom: 0; right: 0;
          width: 80px; height: 80px;
          border-bottom: 2px solid rgba(255,200,0,0.2);
          border-right: 2px solid rgba(255,200,0,0.2);
          border-radius: 0 0 24px 0;
        }

        .quote-symbol {
          position: absolute;
          top: 20px; right: 24px;
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 120px;
          font-weight: 800;
          color: rgba(255, 200, 0, 0.05);
          line-height: 1;
          user-select: none;
          pointer-events: none;
        }

        .stars-row {
          display: flex;
          gap: 4px;
          margin-bottom: 20px;
          justify-content: center;
        }

        .star-icon {
          width: 18px;
          height: 18px;
          color: #ffc800;
          fill: #ffc800;
          filter: drop-shadow(0 0 4px rgba(255,200,0,0.6));
        }

        .star-empty {
          color: rgba(255,200,0,0.2);
          fill: rgba(255,200,0,0.2);
          filter: none;
        }

        .testimonial-text {
          font-size: 17px;
          line-height: 1.75;
          color: rgba(220, 230, 255, 0.88);
          font-style: italic;
          margin-bottom: 32px;
          max-width: 580px;
        }

        @media (max-width: 640px) {
          .testimonial-text { font-size: 15px; }
        }

        .author-row {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .author-avatar {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: linear-gradient(135deg, #ffc800 0%, #ff8c00 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 18px;
          font-weight: 800;
          color: #0a0f1e;
          flex-shrink: 0;
          box-shadow: 0 0 20px rgba(255,200,0,0.3);
        }

        .author-info { text-align: left; }

        .author-name {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 18px;
          font-weight: 700;
          color: #f0f4ff;
          text-transform: uppercase;
          letter-spacing: 0.4px;
          line-height: 1;
          margin-bottom: 4px;
        }

        .author-service {
          font-size: 12px;
          color: #ffc800;
          font-weight: 500;
          letter-spacing: 0.3px;
        }

        /* Glow aura */
        .card-glow {
          position: absolute;
          width: 300px;
          height: 300px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(255,200,0,0.06) 0%, transparent 70%);
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          pointer-events: none;
        }

        /* Navigation */
        .nav-row {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 16px;
          margin-top: 24px;
        }

        .nav-btn {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          border: 1px solid rgba(255,200,0,0.25);
          background: rgba(255,200,0,0.05);
          color: rgba(255,200,0,0.7);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.25s ease;
          outline: none;
        }

        .nav-btn:hover {
          background: rgba(255,200,0,0.15);
          border-color: rgba(255,200,0,0.6);
          color: #ffc800;
          box-shadow: 0 0 16px rgba(255,200,0,0.2);
          transform: scale(1.05);
        }

        .dots-row {
          display: flex;
          gap: 6px;
          align-items: center;
        }

        .dot {
          height: 6px;
          border-radius: 3px;
          background: rgba(255,200,0,0.25);
          cursor: pointer;
          transition: all 0.3s ease;
          border: none;
          padding: 0;
          outline: none;
        }

        .dot.active {
          background: #ffc800;
          box-shadow: 0 0 8px rgba(255,200,0,0.5);
          width: 28px;
        }

        .dot:not(.active) { width: 6px; }
        .dot:not(.active):hover { background: rgba(255,200,0,0.5); }
      `}</style>

      <div className="testimonial-outer">
        <div className="testimonial-card">
          <div className="card-corner-tl" />
          <div className="card-corner-br" />
          <div className="card-glow" />
          <div className="quote-symbol">"</div>

          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={current}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.38, ease: [0.23, 1, 0.32, 1] }}
              style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}
            >
              <div className="stars-row">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`star-icon ${i >= t.rating ? "star-empty" : ""}`}
                  />
                ))}
              </div>

              <p className="testimonial-text">"{t.text}"</p>

              <div className="author-row">
                <div className="author-avatar">{initials}</div>
                <div className="author-info">
                  <div className="author-name">{t.name}</div>
                  {t.service && <div className="author-service">⚡ {t.service}</div>}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="nav-row">
          <button className="nav-btn" onClick={() => navigate(-1)} aria-label="Previous">
            <ChevronLeft size={18} />
          </button>

          <div className="dots-row">
            {testimonials.map((_, i) => (
              <button
                key={i}
                className={`dot ${i === current ? "active" : ""}`}
                onClick={() => { setDirection(i > current ? 1 : -1); setCurrent(i); }}
                aria-label={`Go to testimonial ${i + 1}`}
              />
            ))}
          </div>

          <button className="nav-btn" onClick={() => navigate(1)} aria-label="Next">
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </>
  );
};

export default TestimonialSlider;