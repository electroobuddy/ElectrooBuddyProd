// import { useEffect, useState } from "react";
// import { motion } from "framer-motion";
// import { supabase } from "@/integrations/supabase/client";
// import Section from "@/components/Section";
// import { teamMembers as staticTeam } from "@/data/team";
// import { Zap, Target, Eye, CheckCircle, Users } from "lucide-react";

// const About = () => {
//   const [team, setTeam] = useState<any[]>([]);

//   useEffect(() => {
//     supabase.from("team_members").select("*").order("sort_order").then(({ data }) => setTeam(data && data.length > 0 ? data : staticTeam));
//   }, []);

//   return (
//     <>
//       {/* Page Header */}
//       <section className="bg-hero-premium py-28 relative overflow-hidden">
//         {/* Enhanced background */}
//         <div className="absolute inset-0">
//           <div className="absolute top-0 right-1/4 w-96 h-96 rounded-full bg-primary/10 blur-3xl float-animation" />
//           <div className="absolute bottom-0 left-1/4 w-96 h-96 rounded-full bg-secondary/10 blur-3xl float-animation" style={{ animationDelay: '2s' }} />
//           <div className="absolute inset-0 bg-circuit-pattern opacity-20" />
//         </div>
        
//         <div className="container mx-auto px-4 text-center relative z-10">
//           <motion.div 
//             initial={{ opacity: 0, y: 30 }} 
//             animate={{ opacity: 1, y: 0 }} 
//             transition={{ duration: 0.7 }}
//           >
//             {/* Trust badge */}
//             <motion.div
//               initial={{ opacity: 0, scale: 0.9 }}
//               animate={{ opacity: 1, scale: 1 }}
//               transition={{ delay: 0.2, duration: 0.4 }}
//               className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full bg-primary/15 backdrop-blur-sm border border-primary/30 text-primary-foreground/90 text-sm font-semibold mb-6 shadow-lg shadow-primary/10"
//             >
//               <Shield className="w-4 h-4 text-secondary" />
//               Licensed & Certified Professionals
//             </motion.div>
            
//             <motion.h1 
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ delay: 0.3, duration: 0.6 }}
//               className="text-4xl md:text-5xl lg:text-6xl font-heading font-extrabold text-primary-foreground mb-6 tracking-tight"
//             >
//               About <span className="gradient-text">Electroobuddy</span>
//             </motion.h1>
            
//             <motion.p 
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ delay: 0.4, duration: 0.6 }}
//               className="text-primary-foreground/70 mt-5 max-w-2xl mx-auto text-lg leading-relaxed"
//             >
//               Your Trusted Electrical Service Partner since 2012 - Delivering Excellence in Every Connection
//             </motion.p>
//           </motion.div>
//         </div>
//       </section>

//       <Section>
//         <div className="max-w-3xl mx-auto text-center">
//           <h2 className="text-2xl md:text-3xl font-heading font-bold text-foreground mb-6">Who We Are</h2>
//           <p className="text-muted-foreground leading-relaxed text-lg">
//             Electroobuddy is a leading electrical services company dedicated to providing top-notch electrical solutions for residential, commercial, and industrial clients. With over 12 years of experience and a team of certified master electricians, we deliver safe, reliable, and cost-effective services that exceed expectations.
//           </p>
//         </div>
//       </Section>

//       <Section className="bg-muted/50">
//         <div className="grid md:grid-cols-2 gap-8">
//           {[
//             { icon: Target, title: "Our Mission", text: "To provide exceptional electrical services that prioritize safety, quality, and customer satisfaction while making professional electrical expertise accessible and affordable for everyone.", color: "primary" },
//             { icon: Eye, title: "Our Vision", text: "To become the most trusted name in electrical services, known for innovation, reliability, and an unwavering commitment to excellence in every project we undertake.", color: "secondary" },
//           ].map((item, i) => (
//             <motion.div
//               key={item.title}
//               initial={{ opacity: 0, x: i === 0 ? -30 : 30 }}
//               whileInView={{ opacity: 1, x: 0 }}
//               viewport={{ once: true }}
//               transition={{ duration: 0.6 }}
//               className="group bg-card border border-border rounded-2xl p-8 hover-lift hover-glow"
//             >
//               <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-500">
//                 <item.icon className="w-7 h-7 text-primary" />
//               </div>
//               <h3 className="text-xl font-heading font-bold text-foreground mb-3">{item.title}</h3>
//               <p className="text-muted-foreground leading-relaxed">{item.text}</p>
//             </motion.div>
//           ))}
//         </div>
//       </Section>

//       <Section>
//         <div className="text-center mb-12">
//           <h2 className="text-2xl md:text-3xl font-heading font-bold text-foreground">
//             Why Choose <span className="text-gradient-blue">Electroobuddy?</span>
//           </h2>
//         </div>
//         <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-4xl mx-auto">
//           {["Licensed & insured professionals", "Transparent, upfront pricing", "24/7 emergency support", "Quality materials & workmanship", "100% satisfaction guarantee", "On-time service delivery"].map((item, i) => (
//             <motion.div
//               key={item}
//               initial={{ opacity: 0, y: 20 }}
//               whileInView={{ opacity: 1, y: 0 }}
//               viewport={{ once: true }}
//               transition={{ delay: i * 0.08, duration: 0.4 }}
//               className="flex items-center gap-3 p-4 bg-card border border-border rounded-xl hover-glow transition-all"
//             >
//               <CheckCircle className="w-5 h-5 text-secondary shrink-0" />
//               <span className="text-sm font-medium text-foreground">{item}</span>
//             </motion.div>
//           ))}
//         </div>
//       </Section>

//       <Section className="bg-muted/50">
//         <div className="text-center mb-12">
//           <h2 className="text-2xl md:text-3xl font-heading font-bold text-foreground">
//             Our <span className="text-gradient">Team</span>
//           </h2>
//         </div>
//         <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
//           {team.map((m, i) => (
//             <motion.div
//               key={m.id}
//               initial={{ opacity: 0, y: 30 }}
//               whileInView={{ opacity: 1, y: 0 }}
//               viewport={{ once: true }}
//               transition={{ delay: i * 0.1, duration: 0.5 }}
//               className="group bg-card border border-border rounded-2xl p-7 text-center hover-lift hover-glow"
//             >
//               <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform duration-500">
//                 <Users className="w-8 h-8 text-primary" />
//               </div>
//               <h3 className="font-heading font-bold text-foreground">{m.name}</h3>
//               <p className="text-sm text-primary font-medium mt-1">{m.role}</p>
//               <p className="text-xs text-muted-foreground mt-3 leading-relaxed">{m.bio}</p>
//             </motion.div>
//           ))}
//         </div>
//       </Section>
//     </>
//   );
// };

// export default About;

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import Section from "@/components/Section";
import { teamMembers as staticTeam } from "@/data/team";
import { Zap, Target, Eye, CheckCircle, Users } from "lucide-react";

const About = () => {
  const [team, setTeam] = useState<any[]>([]);

  useEffect(() => {
    supabase.from("team_members").select("*").order("sort_order").then(({ data }) => {
      setTeam(data && data.length > 0 ? data : staticTeam);
    });
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
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700;800;900&family=DM+Sans:wght@400;500&display=swap');

        /* ─── HERO ─── */
        .about-hero {
          position: relative;
          padding: 100px 0 90px;
          overflow: hidden;
          background: #050b18;
          font-family: 'DM Sans', sans-serif;
          text-align: center;
        }

        .about-hero-grid {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(255,200,0,0.035) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,200,0,0.035) 1px, transparent 1px);
          background-size: 60px 60px;
          mask-image: radial-gradient(ellipse 80% 80% at 50% 50%, black 20%, transparent 100%);
        }

        .about-hero-glow {
          position: absolute;
          top: -100px; left: 50%;
          transform: translateX(-50%);
          width: 600px; height: 400px;
          background: radial-gradient(ellipse, rgba(255,200,0,0.08) 0%, transparent 70%);
          pointer-events: none;
        }

        .about-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 7px 18px;
          border: 1px solid rgba(255,200,0,0.3);
          border-radius: 100px;
          background: rgba(255,200,0,0.06);
          margin-bottom: 20px;
          font-size: 12px;
          font-weight: 600;
          color: #ffc800;
          letter-spacing: 1px;
          text-transform: uppercase;
        }

        .about-hero-title {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: clamp(48px, 7vw, 88px);
          font-weight: 900;
          line-height: 0.92;
          color: #f0f4ff;
          text-transform: uppercase;
          letter-spacing: -1px;
        }

        .about-hero-title span {
          background: linear-gradient(135deg, #ffc800, #ffec6e 50%, #ffa000);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .about-hero-sub {
          color: rgba(180,200,240,0.45);
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
          background: #070d1c;
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
          color: #ffc800;
          margin-bottom: 16px;
          font-family: 'Barlow Condensed', sans-serif;
        }

        .section-title {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: clamp(30px, 4vw, 48px);
          font-weight: 800;
          color: #f0f4ff;
          text-transform: uppercase;
          letter-spacing: 0.3px;
          margin-bottom: 20px;
        }

        .section-title span {
          background: linear-gradient(135deg, #ffc800, #ffec6e);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .who-text {
          font-family: 'DM Sans', sans-serif;
          font-size: 16px;
          color: rgba(180,200,240,0.65);
          line-height: 1.8;
        }

        .who-divider {
          width: 60px;
          height: 3px;
          background: linear-gradient(90deg, transparent, #ffc800, transparent);
          margin: 28px auto;
          border-radius: 2px;
        }

        /* ─── MISSION / VISION CARDS ─── */
        .mv-section {
          padding: 80px 0;
          background: #050b18;
        }

        .mv-card {
          position: relative;
          background: #0a0f1e;
          border: 1px solid rgba(255,200,0,0.12);
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
          background: linear-gradient(90deg, transparent, var(--card-accent), transparent);
          opacity: 0;
          transition: opacity 0.4s;
        }

        .mv-card:hover {
          transform: translateY(-6px);
          border-color: rgba(255,200,0,0.35);
          box-shadow: 0 24px 60px rgba(0,0,0,0.5), 0 0 40px var(--card-glow);
        }

        .mv-card:hover::before { opacity: 1; }

        .mv-card-bg-num {
          position: absolute;
          bottom: -20px; right: 10px;
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 120px;
          font-weight: 900;
          color: rgba(255,200,0,0.03);
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
          background: linear-gradient(135deg, rgba(255,200,0,0.15), rgba(255,200,0,0.05));
          clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
          transition: all 0.4s ease;
        }

        .mv-card:hover .hex-bg {
          background: linear-gradient(135deg, rgba(255,200,0,0.9), rgba(255,140,0,0.8));
        }

        .hex-icon {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #ffc800;
          transition: color 0.4s;
        }

        .mv-card:hover .hex-icon { color: #0a0f1e; }

        .mv-title {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 26px;
          font-weight: 800;
          text-transform: uppercase;
          color: #f0f4ff;
          margin-bottom: 12px;
          letter-spacing: 0.4px;
        }

        .mv-text {
          font-size: 14px;
          color: rgba(180,200,240,0.6);
          line-height: 1.75;
        }

        /* ─── PERKS ─── */
        .perks-section {
          padding: 80px 0;
          background: #070d1c;
        }

        .perk-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px 20px;
          background: #0a0f1e;
          border: 1px solid rgba(255,200,0,0.1);
          border-radius: 14px;
          font-family: 'DM Sans', sans-serif;
          transition: all 0.3s ease;
        }

        .perk-item:hover {
          border-color: rgba(255,200,0,0.35);
          background: rgba(255,200,0,0.04);
          transform: translateX(4px);
          box-shadow: -3px 0 0 #ffc800, 0 8px 24px rgba(0,0,0,0.3);
        }

        .perk-check {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: rgba(255,200,0,0.1);
          border: 1px solid rgba(255,200,0,0.25);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          color: #ffc800;
          transition: all 0.3s;
        }

        .perk-item:hover .perk-check {
          background: #ffc800;
          color: #0a0f1e;
          box-shadow: 0 0 12px rgba(255,200,0,0.3);
        }

        .perk-text {
          font-size: 14px;
          font-weight: 500;
          color: rgba(200,215,245,0.8);
        }

        /* ─── TEAM ─── */
        .team-section {
          padding: 80px 0;
          background: #050b18;
        }

        .team-card {
          position: relative;
          background: #0a0f1e;
          border: 1px solid rgba(255,200,0,0.12);
          border-radius: 20px;
          padding: 36px 24px 32px;
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
          border-color: rgba(255,200,0,0.35);
          box-shadow: 0 20px 50px rgba(0,0,0,0.5), 0 0 30px rgba(255,200,0,0.06);
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
          border: 1.5px solid rgba(255,200,0,0.2);
          animation: avatarSpin 8s linear infinite;
        }

        @keyframes avatarSpin {
          to { transform: rotate(360deg); }
        }

        .avatar-inner {
          width: 88px;
          height: 88px;
          border-radius: 50%;
          background: linear-gradient(135deg, rgba(255,200,0,0.12), rgba(255,140,0,0.06));
          border: 1px solid rgba(255,200,0,0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.4s;
        }

        .team-card:hover .avatar-inner {
          background: linear-gradient(135deg, rgba(255,200,0,0.2), rgba(255,140,0,0.1));
          border-color: rgba(255,200,0,0.4);
          box-shadow: 0 0 24px rgba(255,200,0,0.15);
        }

        .team-users-icon {
          color: rgba(255,200,0,0.5);
          transition: color 0.4s, transform 0.4s;
        }

        .team-card:hover .team-users-icon {
          color: #ffc800;
          transform: scale(1.15);
        }

        .team-name {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 22px;
          font-weight: 700;
          text-transform: uppercase;
          color: #f0f4ff;
          letter-spacing: 0.4px;
          margin-bottom: 4px;
        }

        .team-role {
          font-size: 12px;
          font-weight: 600;
          color: #ffc800;
          letter-spacing: 0.8px;
          text-transform: uppercase;
          margin-bottom: 14px;
        }

        .team-bio {
          font-size: 13px;
          color: rgba(180,200,240,0.55);
          line-height: 1.65;
        }
      `}</style>

      {/* HERO */}
      <section className="about-hero">
        <div className="about-hero-grid" />
        <div className="about-hero-glow" />
        <div className="container mx-auto px-4 relative z-10">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="about-badge"><Zap size={12} /> Since 2012</div>
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
              Electroobuddy is a leading electrical services company dedicated to providing top-notch electrical solutions for residential, commercial, and industrial clients. With over 12 years of experience and a team of certified master electricians, we deliver safe, reliable, and cost-effective services that exceed expectations.
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
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {team.map((m, i) => (
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
                    <Users className="team-users-icon" size={32} />
                  </div>
                </div>
                <div className="team-name">{m.name}</div>
                <div className="team-role">{m.role}</div>
                <p className="team-bio">{m.bio}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default About;