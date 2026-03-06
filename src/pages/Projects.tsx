// import { useState, useEffect } from "react";
// import { motion } from "framer-motion";
// import { supabase } from "@/integrations/supabase/client";
// import Section from "@/components/Section";
// import { projects as staticProjects } from "@/data/projects";
// import { Zap, FolderOpen, Loader2 } from "lucide-react";

// const Projects = () => {
//   const [active, setActive] = useState("All");
//   const [projects, setProjects] = useState<any[]>([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     supabase.from("projects").select("*").order("created_at", { ascending: false }).then(({ data }) => {
//       setProjects(data && data.length > 0 ? data : staticProjects);
//       setLoading(false);
//     });
//   }, []);

//   const categories = ["All", ...new Set(projects.map((p) => p.category))];
//   const filtered = active === "All" ? projects : projects.filter((p) => p.category === active);

//   return (
//     <>
//       <section className="bg-hero-premium py-24 relative overflow-hidden">
//         <div className="absolute inset-0">
//           <div className="absolute top-0 right-1/3 w-64 h-64 rounded-full bg-secondary/5 blur-3xl" />
//         </div>
//         <div className="container mx-auto px-4 text-center relative z-10">
//           <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
//             <Zap className="w-10 h-10 text-secondary mx-auto mb-4 electric-pulse" />
//             <h1 className="text-3xl md:text-5xl font-heading font-extrabold text-primary-foreground">
//               Our <span className="gradient-text">Projects</span>
//             </h1>
//             <p className="text-primary-foreground/50 mt-4 max-w-lg mx-auto">Showcasing our best electrical work</p>
//           </motion.div>
//         </div>
//       </section>
//       <Section>
//         {loading ? (
//           <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
//         ) : (
//           <>
//             <div className="flex flex-wrap justify-center gap-2 mb-12">
//               {categories.map((c) => (
//                 <button
//                   key={c}
//                   onClick={() => setActive(c)}
//                   className={`px-5 py-2 text-sm font-medium rounded-full transition-all duration-300 ${
//                     active === c
//                       ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
//                       : "bg-card border border-border text-muted-foreground hover:text-foreground hover:border-primary/30"
//                   }`}
//                 >
//                   {c}
//                 </button>
//               ))}
//             </div>
//             <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
//               {filtered.map((p, i) => (
//                 <motion.div
//                   key={p.id}
//                   initial={{ opacity: 0, y: 30 }}
//                   whileInView={{ opacity: 1, y: 0 }}
//                   viewport={{ once: true }}
//                   transition={{ delay: i * 0.08, duration: 0.5 }}
//                   className="group bg-card border border-border rounded-2xl overflow-hidden hover-lift hover-glow"
//                 >
//                   <div className="h-48 bg-hero-premium flex items-center justify-center relative overflow-hidden">
//                     <FolderOpen className="w-12 h-12 text-primary/30 group-hover:scale-110 transition-transform duration-500" />
//                     {/* Overlay on hover */}
//                     <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/10 transition-colors duration-500" />
//                   </div>
//                   <div className="p-6">
//                     <span className="inline-flex px-3 py-1 text-xs font-medium rounded-full bg-primary/10 text-primary mb-3">{p.category}</span>
//                     <h3 className="text-lg font-heading font-bold text-foreground">{p.title}</h3>
//                     <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{p.description}</p>
//                   </div>
//                 </motion.div>
//               ))}
//             </div>
//           </>
//         )}
//       </Section>
//     </>
//   );
// };

// export default Projects;

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import Section from "@/components/Section";
import { projects as staticProjects } from "@/data/projects";
import { Zap, FolderOpen, Loader2 } from "lucide-react";

const Projects = () => {
  const [active, setActive] = useState("All");
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("projects").select("*").order("created_at", { ascending: false }).then(({ data }) => {
      setProjects(data && data.length > 0 ? data : staticProjects);
      setLoading(false);
    });
  }, []);

  const categories = ["All", ...new Set(projects.map((p) => p.category))];
  const filtered = active === "All" ? projects : projects.filter((p) => p.category === active);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700;800;900&family=DM+Sans:wght@400;500&display=swap');

        /* ── PAGE HERO ── */
        .projects-hero {
          position: relative;
          padding: 100px 0 80px;
          overflow: hidden;
          background: hsl(var(--background));
          font-family: 'DM Sans', sans-serif;
        }

        .hero-grid-lines {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(hsl(var(--secondary) / 0.04) 1px, transparent 1px),
            linear-gradient(90deg, hsl(var(--secondary) / 0.04) 1px, transparent 1px);
          background-size: 60px 60px;
          mask-image: radial-gradient(ellipse 70% 70% at 50% 50%, black 30%, transparent 100%);
        }

        .hero-glow-left {
          position: absolute;
          top: -80px; left: -80px;
          width: 400px; height: 400px;
          border-radius: 50%;
          background: radial-gradient(circle, hsl(var(--secondary) / 0.07) 0%, transparent 70%);
          pointer-events: none;
        }

        .hero-glow-right {
          position: absolute;
          bottom: -60px; right: -60px;
          width: 300px; height: 300px;
          border-radius: 50%;
          background: radial-gradient(circle, hsl(var(--primary) / 0.05) 0%, transparent 70%);
          pointer-events: none;
        }

        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 7px 18px;
          border: 1px solid hsl(var(--secondary) / 0.3);
          border-radius: 100px;
          background: hsl(var(--secondary) / 0.06);
          margin-bottom: 20px;
          font-size: 12px;
          font-weight: 600;
          color: hsl(var(--secondary));
          letter-spacing: 1px;
          text-transform: uppercase;
        }

        .hero-title {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: clamp(44px, 7vw, 80px);
          font-weight: 900;
          line-height: 0.95;
          color: hsl(var(--foreground));
          text-transform: uppercase;
          letter-spacing: -1px;
        }

        .hero-title span {
          background: linear-gradient(135deg, hsl(var(--secondary)), hsl(var(--electric-yellow-light)));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .hero-sub {
          color: hsl(var(--muted-foreground) / 0.5);
          font-size: 15px;
          margin-top: 14px;
          max-width: 440px;
          margin-left: auto;
          margin-right: auto;
        }

        /* ── FILTER PILLS ── */
        .filter-row {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 10px;
          margin-bottom: 52px;
        }

        .filter-pill {
          padding: 9px 22px;
          border-radius: 100px;
          font-size: 13px;
          font-weight: 600;
          font-family: 'DM Sans', sans-serif;
          letter-spacing: 0.3px;
          cursor: pointer;
          border: 1px solid hsl(var(--secondary) / 0.15);
          background: hsl(var(--secondary) / 0.04);
          color: hsl(var(--muted-foreground) / 0.55);
          transition: all 0.25s ease;
          outline: none;
        }

        .filter-pill:hover {
          border-color: hsl(var(--secondary) / 0.4);
          color: hsl(var(--secondary));
          background: hsl(var(--secondary) / 0.08);
        }

        .filter-pill.active {
          background: linear-gradient(135deg, hsl(var(--secondary)), hsl(var(--electric-yellow-dark)));
          border-color: transparent;
          color: hsl(var(--card));
          box-shadow: 0 0 20px hsl(var(--secondary) / 0.3), 0 4px 16px hsl(var(--secondary) / 0.2);
        }

        /* ── PROJECT CARDS ── */
        .project-card {
          position: relative;
          background: hsl(var(--card));
          border: 1px solid hsl(var(--border) / 0.3);
          border-radius: 20px;
          overflow: hidden;
          transition: all 0.4s cubic-bezier(0.23, 1, 0.32, 1);
          font-family: 'DM Sans', sans-serif;
        }

        .project-card::after {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 2px;
          background: linear-gradient(90deg, transparent, hsl(var(--secondary)), transparent);
          opacity: 0;
          transition: opacity 0.4s;
        }

        .project-card:hover {
          transform: translateY(-6px);
          border-color: hsl(var(--border) / 0.5);
          box-shadow: 0 24px 60px hsl(var(--foreground) / 0.1), 0 0 40px hsl(var(--secondary) / 0.07);
        }

        .project-card:hover::after { opacity: 1; }

        .card-thumb {
          position: relative;
          height: 200px;
          background: linear-gradient(135deg, hsl(var(--muted) / 0.5) 0%, hsl(var(--muted)) 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }

        .thumb-grid {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(hsl(var(--secondary) / 0.05) 1px, transparent 1px),
            linear-gradient(90deg, hsl(var(--secondary) / 0.05) 1px, transparent 1px);
          background-size: 30px 30px;
        }

        .thumb-icon-wrap {
          position: relative;
          z-index: 2;
          width: 72px;
          height: 72px;
          border-radius: 50%;
          border: 1px solid hsl(var(--secondary) / 0.2);
          background: hsl(var(--secondary) / 0.06);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.4s ease;
        }

        .project-card:hover .thumb-icon-wrap {
          background: hsl(var(--secondary) / 0.15);
          border-color: hsl(var(--secondary) / 0.5);
          box-shadow: 0 0 30px hsl(var(--secondary) / 0.2);
          transform: scale(1.1);
        }

        .thumb-folder {
          width: 32px;
          height: 32px;
          color: hsl(var(--secondary) / 0.5);
          transition: color 0.4s;
        }

        .project-card:hover .thumb-folder { color: hsl(var(--secondary)); }

        .thumb-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to bottom, transparent 60%, hsl(var(--background) / 0.8) 100%);
        }

        .card-body {
          padding: 22px 24px 26px;
        }

        .card-category {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 4px 12px;
          border-radius: 100px;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.8px;
          text-transform: uppercase;
          background: hsl(var(--secondary) / 0.1);
          color: hsl(var(--secondary));
          border: 1px solid hsl(var(--secondary) / 0.2);
          margin-bottom: 12px;
        }

        .card-title {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 22px;
          font-weight: 700;
          text-transform: uppercase;
          color: hsl(var(--foreground));
          line-height: 1.15;
          margin-bottom: 8px;
          letter-spacing: 0.3px;
        }

        .card-desc {
          font-size: 13.5px;
          color: hsl(var(--muted-foreground) / 0.6);
          line-height: 1.65;
        }

        .card-footer {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-top: 18px;
          padding-top: 16px;
          border-top: 1px solid hsl(var(--border) / 0.3);
        }

        .footer-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: hsl(var(--secondary));
          box-shadow: 0 0 6px hsl(var(--secondary) / 0.6);
          flex-shrink: 0;
          animation: dotBlink 2s ease-in-out infinite;
        }

        @keyframes dotBlink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }

        .footer-label {
          font-size: 11px;
          color: hsl(var(--secondary) / 0.6);
          font-weight: 500;
          letter-spacing: 0.5px;
          text-transform: uppercase;
        }
      `}</style>

      {/* Hero */}
      <section className="projects-hero">
        <div className="hero-grid-lines" />
        <div className="hero-glow-left" />
        <div className="hero-glow-right" />

        <div className="container mx-auto px-4 text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="hero-badge">
              <Zap size={12} />
              Portfolio
            </div>
            <h1 className="hero-title">
              Our <span>Projects</span>
            </h1>
            <p className="hero-sub">Showcasing our finest electrical work across residential, commercial & industrial sectors</p>
          </motion.div>
        </div>
      </section>

      <Section>
        {loading ? (
          <div className="flex justify-center py-16">
            <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 12 }}>
              <Loader2 className="animate-spin" size={22} style={{ color: "hsl(var(--secondary))" }} />
              <span style={{ color: "hsl(var(--muted-foreground) / 0.5)", fontSize: 14, fontFamily: "'DM Sans', sans-serif" }}>Loading projects...</span>
            </div>
          </div>
        ) : (
          <>
            {/* Filter pills */}
            <div className="filter-row">
              {categories.map((c) => (
                <button
                  key={c}
                  onClick={() => setActive(c)}
                  className={`filter-pill ${active === c ? "active" : ""}`}
                >
                  {c}
                </button>
              ))}
            </div>

            {/* Grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence>
                {filtered.map((p, i) => (
                  <motion.div
                    key={p.id}
                    layout
                    initial={{ opacity: 0, y: 32, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.94 }}
                    transition={{ delay: i * 0.07, duration: 0.45, ease: [0.23, 1, 0.32, 1] }}
                    className="project-card"
                  >
                    <div className="card-thumb">
                      <div className="thumb-grid" />
                      <div className="thumb-icon-wrap">
                        <FolderOpen className="thumb-folder" />
                      </div>
                      <div className="thumb-overlay" />
                    </div>

                    <div className="card-body">
                      <div className="card-category">
                        <Zap size={9} />
                        {p.category}
                      </div>
                      <h3 className="card-title">{p.title}</h3>
                      <p className="card-desc">{p.description}</p>
                      <div className="card-footer">
                        <div className="footer-dot" />
                        <span className="footer-label">Completed</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </>
        )}
      </Section>
    </>
  );
};

export default Projects;