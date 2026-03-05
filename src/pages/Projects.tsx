import { useState, useEffect } from "react";
import { motion } from "framer-motion";
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
      <section className="bg-hero-premium py-24 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 right-1/3 w-64 h-64 rounded-full bg-secondary/5 blur-3xl" />
        </div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <Zap className="w-10 h-10 text-secondary mx-auto mb-4 electric-pulse" />
            <h1 className="text-3xl md:text-5xl font-heading font-extrabold text-primary-foreground">
              Our <span className="gradient-text">Projects</span>
            </h1>
            <p className="text-primary-foreground/50 mt-4 max-w-lg mx-auto">Showcasing our best electrical work</p>
          </motion.div>
        </div>
      </section>
      <Section>
        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
        ) : (
          <>
            <div className="flex flex-wrap justify-center gap-2 mb-12">
              {categories.map((c) => (
                <button
                  key={c}
                  onClick={() => setActive(c)}
                  className={`px-5 py-2 text-sm font-medium rounded-full transition-all duration-300 ${
                    active === c
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                      : "bg-card border border-border text-muted-foreground hover:text-foreground hover:border-primary/30"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((p, i) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08, duration: 0.5 }}
                  className="group bg-card border border-border rounded-2xl overflow-hidden hover-lift hover-glow"
                >
                  <div className="h-48 bg-hero-premium flex items-center justify-center relative overflow-hidden">
                    <FolderOpen className="w-12 h-12 text-primary/30 group-hover:scale-110 transition-transform duration-500" />
                    {/* Overlay on hover */}
                    <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/10 transition-colors duration-500" />
                  </div>
                  <div className="p-6">
                    <span className="inline-flex px-3 py-1 text-xs font-medium rounded-full bg-primary/10 text-primary mb-3">{p.category}</span>
                    <h3 className="text-lg font-heading font-bold text-foreground">{p.title}</h3>
                    <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{p.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </>
        )}
      </Section>
    </>
  );
};

export default Projects;
