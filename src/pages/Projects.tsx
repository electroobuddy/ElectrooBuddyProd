import { useState } from "react";
import Section from "@/components/Section";
import { projects, projectCategories } from "@/data/projects";
import { Zap, FolderOpen } from "lucide-react";

const Projects = () => {
  const [active, setActive] = useState("All");
  const filtered = active === "All" ? projects : projects.filter((p) => p.category === active);

  return (
    <>
      <section className="bg-hero py-20">
        <div className="container mx-auto px-4 text-center">
          <Zap className="w-10 h-10 text-secondary mx-auto mb-4" />
          <h1 className="text-3xl md:text-5xl font-heading font-extrabold text-primary-foreground">Our Projects</h1>
          <p className="text-primary-foreground/70 mt-3 max-w-lg mx-auto">Showcasing our best electrical work</p>
        </div>
      </section>
      <Section>
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {projectCategories.map((c) => (
            <button
              key={c}
              onClick={() => setActive(c)}
              className={`px-5 py-2 text-sm font-medium rounded-full transition-colors ${
                active === c
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((p) => (
            <div key={p.id} className="bg-card border border-border rounded-xl overflow-hidden hover-lift">
              <div className="h-48 bg-hero flex items-center justify-center">
                <FolderOpen className="w-12 h-12 text-secondary/60" />
              </div>
              <div className="p-5">
                <span className="text-xs font-medium text-secondary">{p.category}</span>
                <h3 className="text-lg font-heading font-bold text-foreground mt-1">{p.title}</h3>
                <p className="text-sm text-muted-foreground mt-2">{p.description}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>
    </>
  );
};

export default Projects;
