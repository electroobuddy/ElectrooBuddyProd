import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import Section from "@/components/Section";
import SEO from "@/components/SEO";
import { teamMembers as staticTeam } from "@/data/team";
import { Zap, Target, Eye, CheckCircle, Users } from "lucide-react";

const About = () => {
  const [team, setTeam] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
    <>
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
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700;800;900&family=DM+Sans:wght@400;500&display=swap');

        /* ─── HERO ─── */
        .about-hero {
          position: relative;
          padding: 100px 0 90px;
          overflow: hidden;
          background: hsl(var(--background));
          font-family: 'DM Sans', sans-serif;
          text-align: center;
        }

        .about-hero-grid {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(hsl(var(--primary) / 0.035) 1px, transparent 1px),
            linear-gradient(90deg, hsl(var(--primary) / 0.035) 1px, transparent 1px);
          background-size: 60px 60px;
          mask-image: radial-gradient(ellipse 80% 80% at 50% 50%, black 20%, transparent 100%);
        }

        .about-hero-glow {
          position: absolute;
          top: -100px; left: 50%;
          transform: translateX(-50%);
          width: 600px; height: 400px;
          background: radial-gradient(ellipse, hsl(var(--primary) / 0.08) 0%, transparent 70%);
          pointer-events: none;
        }

        .about-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 7px 18px;
          border: 1px solid hsl(var(--primary) / 0.3);
          border-radius: 100px;
          background: hsl(var(--primary) / 0.06);
          margin-bottom: 20px;
          font-size: 12px;
          font-weight: 600;
          color: hsl(var(--secondary));
          letter-spacing: 1px;
          text-transform: uppercase;
        }

        .about-hero-title {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: clamp(48px, 7vw, 88px);
          font-weight: 900;
          line-height: 0.92;
          color: hsl(var(--foreground));
          text-transform: uppercase;
          letter-spacing: -1px;
        }

        .about-hero-title span {
          background: linear-gradient(135deg, hsl(var(--secondary)), hsl(var(--electric-yellow-light)) 50%, hsl(var(--electric-blue-dark)));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .about-hero-sub {
          color: hsl(var(--muted-foreground) / 0.45);
          font-size: 15px;
          margin-top: 16px;
          max-width: 400px;
          margin-left: auto;
          margin-right: auto;
          line-height: 1.6;
        }

        /* ─── WHO WE ARE ─── */
        .who-section {
          padding: 80px 0;
          background: hsl(var(--card));
        }

        .who-inner {
          max-width: 780px;
          margin: 0 auto;
          text-align: center;
        }

        .section-label {
          display: inline-block;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: hsl(var(--secondary));
          margin-bottom: 16px;
          font-family: 'Barlow Condensed', sans-serif;
        }

        .section-title {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: clamp(30px, 4vw, 48px);
          font-weight: 800;
          color: hsl(var(--foreground));
          text-transform: uppercase;
          letter-spacing: 0.3px;
          margin-bottom: 20px;
        }

        .section-title span {
          background: linear-gradient(135deg, hsl(var(--secondary)), hsl(var(--electric-yellow-light)));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .who-text {
          font-family: 'DM Sans', sans-serif;
          font-size: 16px;
          color: hsl(var(--muted-foreground));
          line-height: 1.8;
        }

        .who-divider {
          width: 60px;
          height: 3px;
          background: linear-gradient(90deg, transparent, hsl(var(--secondary)), transparent);
          margin: 28px auto;
          border-radius: 2px;
        }

        /* ─── MISSION / VISION CARDS ─── */
        .mv-section {
          padding: 80px 0;
          background: hsl(var(--background));
        }

        .mv-card {
          position: relative;
          background: hsl(var(--card));
          border: 1px solid hsl(var(--border) / 0.5);
          border-radius: 20px;
          padding: 40px 36px;
          overflow: hidden;
          font-family: 'DM Sans', sans-serif;
          transition: all 0.4s cubic-bezier(0.23, 1, 0.32, 1);
        }

        .mv-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 2px;
          background: linear-gradient(90deg, transparent, hsl(var(--primary)), transparent);
          opacity: 0;
          transition: opacity 0.4s;
        }

        .mv-card:hover {
          transform: translateY(-6px);
          border-color: hsl(var(--primary) / 0.5);
          box-shadow: 0 24px 60px hsl(var(--foreground) / 0.1), 0 0 40px hsl(var(--primary) / 0.2);
        }

        .mv-card:hover::before { opacity: 1; }

        .mv-card-bg-num {
          position: absolute;
          bottom: -20px; right: 10px;
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 120px;
          font-weight: 900;
          color: hsl(var(--primary) / 0.03);
          line-height: 1;
          user-select: none;
          pointer-events: none;
          letter-spacing: -4px;
        }

        .mv-icon-hex {
          position: relative;
          width: 60px;
          height: 60px;
          margin-bottom: 24px;
        }

        .hex-bg {
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, hsl(var(--primary) / 0.15), hsl(var(--primary) / 0.05));
          clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
          transition: all 0.4s ease;
        }

        .mv-card:hover .hex-bg {
          background: linear-gradient(135deg, hsl(var(--primary)), hsl(var(--electric-blue-dark)));
        }

        .hex-icon {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          color: hsl(var(--primary));
          transition: color 0.4s;
        }

        .mv-card:hover .hex-icon { color: hsl(var(--primary-foreground)); }

        .mv-title {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 26px;
          font-weight: 800;
          text-transform: uppercase;
          color: hsl(var(--foreground));
          margin-bottom: 12px;
          letter-spacing: 0.4px;
        }

        .mv-text {
          font-size: 14px;
          color: hsl(var(--muted-foreground));
          line-height: 1.75;
        }

        /* ─── PERKS ─── */
        .perks-section {
          padding: 80px 0;
          background: hsl(var(--card));
        }

        .perk-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px 20px;
          background: hsl(var(--background));
          border: 1px solid hsl(var(--border) / 0.3);
          border-radius: 14px;
          font-family: 'DM Sans', sans-serif;
          transition: all 0.3s ease;
        }

        .perk-item:hover {
          border-color: hsl(var(--primary) / 0.5);
          background: hsl(var(--primary) / 0.04);
          transform: translateX(4px);
          box-shadow: -3px 0 0 hsl(var(--secondary)), 0 8px 24px hsl(var(--foreground) / 0.1);
        }

        .perk-check {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: hsl(var(--primary) / 0.1);
          border: 1px solid hsl(var(--primary) / 0.25);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          color: hsl(var(--secondary));
          transition: all 0.3s;
        }

        .perk-item:hover .perk-check {
          background: hsl(var(--secondary));
          color: hsl(var(--card-foreground));
          box-shadow: 0 0 12px hsl(var(--primary) / 0.3);
        }

        .perk-text {
          font-size: 14px;
          font-weight: 500;
          color: hsl(var(--muted-foreground));
        }

        /* ─── TEAM ─── */
        .team-section {
          padding: 80px 0;
          background: hsl(var(--background));
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
          background: hsl(var(--card));
          border: 1px solid hsl(var(--border) / 0.3);
          border-radius: 20px;
          padding: 36px 24px 32px;
          text-align: center;
          overflow: hidden;
          font-family: 'DM Sans', sans-serif;
          transition: all 0.4s cubic-bezier(0.23, 1, 0.32, 1);
          width: 280px;
          flex: 0 0 280px;
        }

        .team-card::after {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 2px;
          background: linear-gradient(90deg, transparent, hsl(var(--primary)), transparent);
          opacity: 0;
          transition: opacity 0.4s;
        }

        .team-card:hover {
          transform: translateY(-6px);
          border-color: hsl(var(--border) / 0.5);
          box-shadow: 0 20px 50px hsl(var(--foreground) / 0.1), 0 0 30px hsl(var(--primary) / 0.06);
        }

        .team-card:hover::after { opacity: 1; }

        .team-avatar {
          position: relative;
          width: 88px;
          height: 88px;
          margin: 0 auto 20px;
        }

        .avatar-ring {
          position: absolute;
          inset: -4px;
          border-radius: 50%;
          border: 1.5px solid hsl(var(--primary) / 0.2);
          animation: avatarSpin 8s linear infinite;
        }

        @keyframes avatarSpin {
          to { transform: rotate(360deg); }
        }

        .avatar-inner {
          width: 88px;
          height: 88px;
          border-radius: 50%;
          background: linear-gradient(135deg, hsl(var(--primary) / 0.12), hsl(var(--secondary) / 0.06));
          border: 1px solid hsl(var(--border) / 0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.4s;
        }

        .team-card:hover .avatar-inner {
          background: linear-gradient(135deg, hsl(var(--primary) / 0.2), hsl(var(--secondary) / 0.1));
          border-color: hsl(var(--primary) / 0.4);
          box-shadow: 0 0 24px hsl(var(--primary) / 0.15);
        }

        .team-users-icon {
          color: hsl(var(--muted-foreground));
          transition: color 0.4s, transform 0.4s;
        }

        .team-card:hover .team-users-icon {
          color: hsl(var(--secondary));
          transform: scale(1.15);
        }

        .team-name {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 22px;
          font-weight: 700;
          text-transform: uppercase;
          color: hsl(var(--foreground));
          letter-spacing: 0.4px;
          margin-bottom: 4px;
        }

        .team-role {
          font-size: 12px;
          font-weight: 600;
          color: hsl(var(--secondary));
          letter-spacing: 0.8px;
          text-transform: uppercase;
          margin-bottom: 14px;
        }

        .team-bio {
          font-size: 13px;
          color: hsl(var(--muted-foreground));
          line-height: 1.65;
        }
      `}</style>

      {/* HERO */}
      <section className="about-hero">
        <div className="about-hero-grid" />
        <div className="about-hero-glow" />
        <div className="container mx-auto px-4 relative z-10">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="about-badge"><Zap size={12} /> Since 2001</div>
            <h1 className="about-hero-title">About <span>Electroobuddy</span></h1>
            <p className="about-hero-sub">Your Trusted Electrical Service Partner with over a decade of proven excellence</p>
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
                accent: "#ffc800",
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
    </>
  );
};

export default About;