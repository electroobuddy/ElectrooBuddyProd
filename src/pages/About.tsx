import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import SEO from "@/components/SEO";
import { teamMembers as staticTeam } from "@/data/team";
import { DarkModeToggle } from "@/components/about/DarkModeToggle";
import { Hero } from "@/components/about/Hero";
import { WhoWeAre } from "@/components/about/WhoWeAre";
import { MissionVision } from "@/components/about/MissionVision";
import { Perks } from "@/components/about/Perks";
import { Team } from "@/components/about/Team";
import "@/styles/about.css";

const About = () => {
  const [team, setTeam] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Optimized data fetching with cleanup
  useEffect(() => {
    let mounted = true;

    const fetchTeam = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const { data, error } = await supabase
          .from("team_members")
          .select("*")
          .order("sort_order");

        if (!mounted) return;

        if (error) {
          console.error("Error fetching team:", error);
          setError(error.message);
          setTeam(staticTeam);
        } else {
          setTeam(data && data.length > 0 ? data : staticTeam);
        }
      } catch (err) {
        console.error("Failed to load team:", err);
        if (mounted) {
          setError(err instanceof Error ? err.message : "Unknown error");
          setTeam(staticTeam);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchTeam();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="about-page bg-gray-50 dark:bg-gray-900 min-h-screen">
      <SEO
        title="About Electroo Buddy - Leading Electrical Service Provider in Ujjain"
        description="Learn about Electroo Buddy's team of certified electricians with years of experience. We provide reliable, affordable electrical services for residential and commercial needs in Ujjain."
        keywords="about electroo buddy, electrical company Ujjain, certified electricians, licensed electrical contractors, professional electricians, electrical service team"
        canonical="/about"
        structuredData={{
          "@context": "https://schema.org",
          "@type": "Organization",
          "name": "Electroo Buddy",
          "description": "Professional electrical service provider with certified and experienced electricians",
          "url": "https://electroobuddy.com",
          "logo": "https://electroobuddy.com/logo.png",
          "foundingDate": "1992",
          "areaServed": {
            "@type": "City",
            "name": "Ujjain"
          },
          "founder": {
            "@type": "Person",
            "name": "Electroo Buddy Team"
          },
          "employee": {
            "@type": "Thing",
            "description": "Team of certified electricians and electrical professionals"
          }
        }}
      />
      
      <DarkModeToggle />
      <Hero />
      <WhoWeAre />
      <MissionVision />
      <Perks />
      <Team members={team} loading={loading} error={error} />
    </div>
  );
};

export default About;
