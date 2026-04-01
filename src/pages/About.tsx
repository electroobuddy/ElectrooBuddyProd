import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import Section from "@/components/Section";
import SEO from "@/components/SEO";
import { teamMembers as staticTeam } from "@/data/team";
import { Zap, Target, Eye, CheckCircle, Users, Sun, Moon } from "lucide-react";

const About = () => {
  const [team, setTeam] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

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

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        const { data, error } = await supabase.from("team_members").select("*").order("sort_order");
        if (error) {
          console.error("Error fetching team:", error);
          setTeam(staticTeam);
        } else {
          setTeam(data && data.length > 0 ? data : staticTeam);
        }
      } catch (err) {
        console.error("Failed to load team:", err);
        setTeam(staticTeam);
      } finally {
        setLoading(false);
      }
    };
    
    fetchTeam();
  }, []);

  const perks = [
    "Licensed & insured professionals",
    "Transparent, upfront pricing",
    "24/7 emergency support",
    "Quality materials & workmanship",
    "100% satisfaction guarantee",
    "On-time service delivery",
  ];

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
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');

        .about-page {
          font-family: 'Poppins', sans-serif;
        }

        .about-page h1,
        .about-page h2,
        .about-page h3,
        .about-page h4,
        .about-page h5,
        .about-page h6 {
          font-weight: 700;
        }

        /* Hero Section */
        .about-hero {
          position: relative;
          padding: 112px 0 96px;
          overflow: hidden;
          text-align: center;
        }

        /* Who We Are Section */
        .who-section {
          padding: 80px 0;
          background: #ffffff;
        }

        .dark .who-section {
          background: #1f2937;
        }

        .who-inner {
          max-width: 780px;
          margin: 0 auto;
          text-align: center;
        }

        .section-label {
          display: inline-block;
          font-size: 14px;
          font-weight: 600;
          letter-spacing: 1px;
          text-transform: uppercase;
          color: #3b82f6;
          margin-bottom: 16px;
          font-family: 'Poppins', sans-serif;
        }

        .section-title {
          font-family: 'Poppins', sans-serif;
          font-size: clamp(30px, 4vw, 48px);
          font-weight: 800;
          color: #1e3a8a;
          text-transform: uppercase;
          letter-spacing: 0.3px;
          margin-bottom: 20px;
        }

        .dark .section-title {
          color: #60a5fa;
        }

        .section-title span {
          color: #3b82f6;
        }

        .who-text {
          font-family: 'Poppins', sans-serif;
          font-size: 16px;
          color: #4b5563;
          line-height: 1.8;
        }

        .dark .who-text {
          color: #d1d5db;
        }

        .who-divider {
          width: 60px;
          height: 3px;
          background: linear-gradient(90deg, #1e3a8a, #3b82f6, #1e3a8a);
          margin: 28px auto;
          border-radius: 2px;
        }

        /* Mission & Vision Cards */
        .mv-section {
          padding: 80px 0;
          background: #f3f4f6;
        }

        .dark .mv-section {
          background: #111827;
        }

        .mv-card {
          position: relative;
          background: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 16px;
          padding: 40px 36px;
          overflow: hidden;
          font-family: 'Poppins', sans-serif;
          transition: all 0.4s cubic-bezier(0.23, 1, 0.32, 1);
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
        }

        .dark .mv-card {
          background: #1f2937;
          border-color: #374151;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
        }

        .mv-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 3px;
          background: linear-gradient(90deg, #1e3a8a, #3b82f6);
          opacity: 0;
          transition: opacity 0.4s;
        }

        .mv-card:hover {
          transform: translateY(-8px);
          border-color: #3b82f6;
          box-shadow: 0 20px 40px rgba(59, 130, 246, 0.15), 0 0 30px rgba(59, 130, 246, 0.1);
        }

        .mv-card:hover::before { opacity: 1; }

        .mv-icon-hex {
          position: relative;
          width: 60px;
          height: 60px;
          margin-bottom: 24px;
        }

        .hex-bg {
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(30, 58, 138, 0.05));
          clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
          transition: all 0.4s ease;
          border-radius: 8px;
        }

        .mv-card:hover .hex-bg {
          background: linear-gradient(135deg, #3b82f6, #1e3a8a);
        }

        .hex-icon {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #3b82f6;
          transition: color 0.4s;
        }

        .mv-card:hover .hex-icon { color: #ffffff; }

        .mv-title {
          font-family: 'Poppins', sans-serif;
          font-size: 24px;
          font-weight: 700;
          color: #1e3a8a;
          margin-bottom: 12px;
        }

        .dark .mv-title {
          color: #60a5fa;
        }

        .mv-text {
          font-size: 15px;
          color: #6b7280;
          line-height: 1.75;
        }

        .dark .mv-text {
          color: #9ca3af;
        }

        /* Perks Section */
        .perks-section {
          padding: 80px 0;
          background: #ffffff;
        }

        .dark .perks-section {
          background: #1f2937;
        }

        .perk-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px 20px;
          background: #f9fafb;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          font-family: 'Poppins', sans-serif;
          transition: all 0.3s ease;
        }

        .dark .perk-item {
          background: #374151;
          border-color: #4b5563;
        }

        .perk-item:hover {
          border-color: #3b82f6;
          background: rgba(59, 130, 246, 0.05);
          transform: translateX(4px);
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.1);
        }

        .perk-check {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: rgba(59, 130, 246, 0.1);
          border: 1px solid rgba(59, 130, 246, 0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          color: #3b82f6;
          transition: all 0.3s;
        }

        .perk-item:hover .perk-check {
          background: #3b82f6;
          color: #ffffff;
          box-shadow: 0 0 8px rgba(59, 130, 246, 0.4);
        }

        .perk-text {
          font-size: 15px;
          font-weight: 500;
          color: #374151;
        }

        .dark .perk-text {
          color: #e5e7eb;
        }

        /* Team Section */
        .team-section {
          padding: 80px 0;
          background: #f9fafb;
        }

        .dark .team-section {
          background: #111827;
        }

        .team-grid {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 24px;
          max-width: 1200px;
          margin: 0 auto;
        }

        .team-card {
          position: relative;
          background: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 16px;
          padding: 36px 24px 32px;
          text-align: center;
          overflow: hidden;
          font-family: 'Poppins', sans-serif;
          transition: all 0.4s cubic-bezier(0.23, 1, 0.32, 1);
          width: 280px;
          flex: 0 0 280px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
        }

        .dark .team-card {
          background: #1f2937;
          border-color: #374151;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
        }

        .team-card::after {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 3px;
          background: linear-gradient(90deg, #1e3a8a, #3b82f6);
          opacity: 0;
          transition: opacity 0.4s;
        }

        .team-card:hover {
          transform: translateY(-8px);
          border-color: #3b82f6;
          box-shadow: 0 20px 40px rgba(59, 130, 246, 0.15), 0 0 30px rgba(59, 130, 246, 0.1);
        }

        .team-card:hover::after { opacity: 1; }

        .team-avatar {
          position: relative;
          width: 96px;
          height: 96px;
          margin: 0 auto 20px;
        }

        .avatar-ring {
          position: absolute;
          inset: -4px;
          border-radius: 50%;
          border: 2px solid rgba(59, 130, 246, 0.3);
          animation: avatarSpin 8s linear infinite;
        }

        @keyframes avatarSpin {
          to { transform: rotate(360deg); }
        }

        .avatar-inner {
          width: 96px;
          height: 96px;
          border-radius: 50%;
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.12), rgba(30, 58, 138, 0.06));
          border: 2px solid #e5e7eb;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.4s;
          overflow: hidden;
        }

        .team-card:hover .avatar-inner {
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(30, 58, 138, 0.1));
          border-color: #3b82f6;
          box-shadow: 0 0 24px rgba(59, 130, 246, 0.2);
        }

        .team-users-icon {
          color: #9ca3af;
          transition: color 0.4s, transform 0.4s;
        }

        .team-card:hover .team-users-icon {
          color: #3b82f6;
          transform: scale(1.15);
        }

        .team-name {
          font-family: 'Poppins', sans-serif;
          font-size: 20px;
          font-weight: 700;
          color: #1e3a8a;
          margin-bottom: 6px;
        }

        .dark .team-name {
          color: #60a5fa;
        }

        .team-role {
          font-size: 13px;
          font-weight: 600;
          color: #3b82f6;
          margin-bottom: 14px;
        }

        .team-bio {
          font-size: 14px;
          color: #6b7280;
          line-height: 1.65;
        }

        .dark .team-bio {
          color: #9ca3af;
        }
      `}</style>

      {/* Dark Mode Toggle Button */}
      <button
        onClick={toggleDarkMode}
        className="fixed top-24 right-4 z-50 bg-white dark:bg-gray-800 p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700"
        aria-label="Toggle dark mode"
      >
        {darkMode ? (
          <Sun className="w-6 h-6 text-yellow-500" />
        ) : (
          <Moon className="w-6 h-6 text-gray-700" />
        )}
      </button>

      {/* HERO */}
      <section className="hero-gradient text-white about-hero slide-up">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 30 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.7 }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.4 }}
              className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-6 py-3 rounded-full mb-8"
            >
              <Zap className="w-5 h-5" />
              <span className="font-semibold text-sm uppercase tracking-wide">About Electroo Buddy</span>
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6"
            >
              Serving Ujjain Since 1992
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="text-xl max-w-3xl mx-auto opacity-90"
            >
              Your trusted partner for professional electrical services with over 30 years of experience
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* WHO WE ARE */}
      <section className="who-section">
        <div className="container mx-auto px-4">
          <motion.div
            className="who-inner"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="section-label">Who We Are</div>
            <div className="who-divider" />
            <p className="who-text">
              Electroobuddy is a leading electrical services company dedicated to providing top-notch electrical solutions for residential, commercial, and industrial clients. With over 25 years of experience and a team of certified master electricians, we deliver safe, reliable, and cost-effective services that exceed expectations.
            </p>
          </motion.div>
        </div>
      </section>

      {/* MISSION & VISION */}
      <section className="mv-section">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="section-label">Our Foundation</div>
            <div className="section-title">Mission & <span>Vision</span></div>
          </div>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {[
              {
                icon: Target,
                title: "Our Mission",
                text: "To provide exceptional electrical services that prioritize safety, quality, and customer satisfaction while making professional electrical expertise accessible and affordable for everyone.",
                accent: "#2980c7ff",
                glow: "rgba(255,200,0,0.06)",
                num: "01",
              },
              {
                icon: Eye,
                title: "Our Vision",
                text: "To become the most trusted name in electrical services, known for innovation, reliability, and an unwavering commitment to excellence in every project we undertake.",
                accent: "#38bdf8",
                glow: "rgba(56,189,248,0.06)",
                num: "02",
              },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                className="mv-card"
                style={{ "--card-accent": item.accent, "--card-glow": item.glow } as React.CSSProperties}
                initial={{ opacity: 0, x: i === 0 ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.55, delay: i * 0.1 }}
              >
                <div className="mv-card-bg-num">{item.num}</div>
                <div className="mv-icon-hex">
                  <div className="hex-bg" />
                  <div className="hex-icon"><item.icon size={22} /></div>
                </div>
                <div className="mv-title">{item.title}</div>
                <p className="mv-text">{item.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* WHY CHOOSE US */}
      <section className="perks-section">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="section-label">Why Us</div>
            <div className="section-title">Why Choose <span>Electroobuddy?</span></div>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
            {perks.map((item, i) => (
              <motion.div
                key={item}
                className="perk-item"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07, duration: 0.4 }}
              >
                <div className="perk-check"><CheckCircle size={14} /></div>
                <span className="perk-text">{item}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* TEAM */}
      <section className="team-section">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="section-label">The Experts</div>
            <div className="section-title">Our <span>Team</span></div>
          </div>
          <div className="team-grid">
            {loading ? (
              // Loading skeletons
              Array.from({ length: 4 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="team-card"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                >
                  <div className="team-avatar">
                    <div className="avatar-ring" />
                    <div className="avatar-inner bg-zinc-200 dark:bg-zinc-700 animate-pulse" />
                  </div>
                  <div className="h-6 bg-zinc-200 dark:bg-zinc-700 rounded w-3/4 mx-auto mb-2 animate-pulse" />
                  <div className="h-4 bg-zinc-200 dark:bg-zinc-700 rounded w-1/2 mx-auto mb-4 animate-pulse" />
                  <div className="space-y-2">
                    <div className="h-3 bg-zinc-200 dark:bg-zinc-700 rounded animate-pulse" />
                    <div className="h-3 bg-zinc-200 dark:bg-zinc-700 rounded w-5/6 mx-auto animate-pulse" />
                  </div>
                </motion.div>
              ))
            ) : (
              team.map((m, i) => (
                <motion.div
                  key={m.id}
                  className="team-card"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                >
                  <div className="team-avatar">
                    <div className="avatar-ring" />
                    <div className="avatar-inner">
                      {m.photo_url ? (
                        <img src={m.photo_url} alt={m.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                      ) : (
                        <Users className="team-users-icon" size={32} />
                      )}
                    </div>
                  </div>
                  <div className="team-name">{m.name}</div>
                  <div className="team-role">{m.role}</div>
                  <p className="team-bio">{m.bio}</p>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;