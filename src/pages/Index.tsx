
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Zap, ArrowRight, Shield, Clock, BadgeDollarSign, HeartHandshake, Users } from "lucide-react";
import Section from "@/components/Section";
import ServiceCard from "@/components/ServiceCard";
import AnimatedCounter, { COUNTER_DATA, DummyAnimatedCounter } from "@/components/AnimatedCounter";
import ProcessTimeline from "@/components/ProcessTimeline";
import VideoSection from "@/components/VideoSection";
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
          background: hsl(var(--background));
          font-family: 'DM Sans', sans-serif;
        }

        .hero-grid {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(hsl(var(--primary) / 0.04) 1px, transparent 1px),
            linear-gradient(90deg, hsl(var(--primary) / 0.04) 1px, transparent 1px);
          background-size: 60px 60px;
          mask-image: radial-gradient(ellipse 80% 80% at 30% 50%, black 0%, transparent 100%);
        }

        .hero-glow-1 {
          position: absolute;
          top: 20%; left: -120px;
          width: 500px; height: 500px;
          border-radius: 50%;
          background: radial-gradient(circle, hsl(var(--primary) / 0.08) 0%, transparent 70%);
          animation: floatGlow 6s ease-in-out infinite;
        }

        .hero-glow-2 {
          position: absolute;
          bottom: 10%; right: -80px;
          width: 400px; height: 400px;
          border-radius: 50%;
          background: radial-gradient(circle, hsl(var(--secondary) / 0.06) 0%, transparent 70%);
          animation: floatGlow 8s ease-in-out infinite reverse;
          animation-delay: 2s;
        }

        .hero-ring-1 {
          position: absolute;
          top: 50%; left: 60%;
          transform: translate(-50%, -50%);
          width: 700px; height: 700px;
          border-radius: 50%;
          border: 1px solid hsl(var(--primary) / 0.06);
          pointer-events: none;
        }

        .hero-ring-2 {
          position: absolute;
          top: 50%; left: 60%;
          transform: translate(-50%, -50%);
          width: 500px; height: 500px;
          border-radius: 50%;
          border: 1px solid hsl(var(--primary) / 0.05);
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
          border: 1px solid hsl(var(--primary) / 0.3);
          border-radius: 100px;
          background: hsl(var(--primary) / 0.07);
          backdrop-filter: blur(8px);
          margin-bottom: 28px;
          font-size: 13px;
          font-weight: 600;
          color: hsl(var(--foreground));
          letter-spacing: 0.3px;
        }

        .hero-trust-badge span { color: hsl(var(--secondary)); }

        .hero-h1 {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: clamp(52px, 8vw, 96px);
          font-weight: 900;
          line-height: 0.9;
          text-transform: uppercase;
          letter-spacing: -2px;
          color: hsl(var(--foreground));
          margin-bottom: 24px;
        }

        .hero-h1-accent {
          background: linear-gradient(135deg, hsl(var(--secondary)) 0%, hsl(var(--electric-yellow-light)) 50%, hsl(var(--electric-blue-dark)) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          display: block;
        }

        .hero-desc {
          font-size: 17px;
          color: hsl(var(--muted-foreground));
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
          background: linear-gradient(135deg, hsl(var(--primary)), hsl(var(--electric-blue-dark)));
          color: hsl(var(--primary-foreground));
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
          box-shadow: 0 0 36px hsl(var(--primary) / 0.45), 0 8px 24px hsl(var(--primary) / 0.3);
          transform: translateY(-2px);
        }

        .hero-btn-secondary {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 15px 32px;
          border: 1.5px solid hsl(var(--border) / 0.5);
          color: hsl(var(--foreground));
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 17px;
          font-weight: 700;
          letter-spacing: 0.6px;
          text-transform: uppercase;
          border-radius: 12px;
          text-decoration: none;
          transition: all 0.3s ease;
          background: hsl(var(--muted) / 0.3);
        }

        .hero-btn-secondary:hover {
          border-color: hsl(var(--primary) / 0.6);
          color: hsl(var(--primary));
          background: hsl(var(--primary) / 0.08);
        }

        /* Trust strip */
        .hero-trust-strip {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 20px;
          padding-top: 24px;
          border-top: 1px solid hsl(var(--border) / 0.5);
        }

        .trust-avatars {
          display: flex;
          align-items: center;
        }

        .trust-avatar {
          width: 34px;
          height: 34px;
          border-radius: 50%;
          background: linear-gradient(135deg, hsl(var(--primary) / 0.2), hsl(var(--secondary) / 0.1));
          border: 2px solid hsl(var(--border) / 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 13px;
          font-weight: 700;
          color: hsl(var(--primary));
          margin-left: -8px;
        }

        .trust-avatar:first-child { margin-left: 0; }

        .trust-rating-label {
          font-size: 11px;
          color: hsl(var(--muted-foreground) / 0.45);
          margin-top: 2px;
        }

        .trust-rating-val {
          font-size: 14px;
          font-weight: 700;
          color: hsl(var(--foreground));
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .trust-star { color: hsl(var(--secondary)); }

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
          border: 1.5px solid hsl(var(--primary) / 0.2);
          background: radial-gradient(circle at 40% 40%, hsl(var(--primary) / 0.07), transparent 60%);
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
          border: 1.5px solid hsl(var(--primary) / 0.25);
          background: radial-gradient(circle at 40% 40%, hsl(var(--primary) / 0.1), transparent 70%);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .orb-inner {
          width: 180px;
          height: 180px;
          border-radius: 50%;
          border: 2px solid hsl(var(--primary) / 0.4);
          background: radial-gradient(circle, hsl(var(--primary) / 0.12), hsl(var(--card) / 0.95) 70%);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 0 60px hsl(var(--primary) / 0.15), inset 0 0 40px hsl(var(--primary) / 0.05);
        }

        .orb-zap {
          color: hsl(var(--secondary));
          filter: drop-shadow(0 0 20px hsl(var(--primary) / 0.6));
          animation: zapPulse 2s ease-in-out infinite;
        }

        @keyframes zapPulse {
          0%, 100% { filter: drop-shadow(0 0 20px hsl(var(--primary) / 0.6)); transform: scale(1); }
          50% { filter: drop-shadow(0 0 36px hsl(var(--primary) / 0.9)); transform: scale(1.05); }
        }

        /* Floating badges */
        .hero-badge {
          position: absolute;
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 16px;
          background: hsl(var(--card) / 0.95);
          border: 1px solid hsl(var(--border) / 0.3);
          border-radius: 14px;
          backdrop-filter: blur(12px);
          box-shadow: 0 8px 32px hsl(var(--foreground) / 0.1);
        }

        .badge-icon {
          width: 34px;
          height: 34px;
          border-radius: 10px;
          background: hsl(var(--primary) / 0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          color: hsl(var(--secondary));
          flex-shrink: 0;
        }

        .badge-label {
          font-size: 10px;
          color: hsl(var(--muted-foreground) / 0.45);
          font-family: 'DM Sans', sans-serif;
          margin-bottom: 2px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .badge-value {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 15px;
          font-weight: 700;
          color: hsl(var(--foreground));
          line-height: 1;
        }

        /* ── STATS BAR ── */
        .stats-bar {
          position: relative;
          z-index: 20;
          margin-top: -52px;
        }

        .stats-card {
          background: hsl(var(--card));
          border: 1px solid hsl(var(--border) / 0.3);
          border-radius: 20px;
          padding: 36px 40px;
          box-shadow: 0 24px 80px hsl(var(--foreground) / 0.1), 0 0 0 1px hsl(var(--primary) / 0.06);
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
          background: linear-gradient(180deg, transparent, hsl(var(--border) / 0.3), transparent);
        }

        @media (min-width: 768px) { .stats-sep { display: block; } }

        /* ── SECTION LABELS ── */
        .sec-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 7px 18px;
          border: 1px solid hsl(var(--border) / 0.3);
          border-radius: 100px;
          background: hsl(var(--primary) / 0.06);
          margin-bottom: 16px;
          font-size: 12px;
          font-weight: 700;
          color: hsl(var(--secondary));
          letter-spacing: 1px;
          text-transform: uppercase;
          font-family: 'Barlow Condensed', sans-serif;
        }

        .sec-title {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: clamp(32px, 4.5vw, 52px);
          font-weight: 900;
          text-transform: uppercase;
          color: hsl(var(--foreground));
          letter-spacing: -0.5px;
          line-height: 1;
          margin-bottom: 16px;
        }

        .sec-title span {
          background: linear-gradient(135deg, hsl(var(--secondary)), hsl(var(--electric-yellow-light)));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .sec-desc {
          font-size: 15px;
          color: hsl(var(--muted-foreground) / 0.55);
          line-height: 1.7;
          max-width: 560px;
          margin: 0 auto;
        }

        /* ── WHY CHOOSE US CARDS ── */
        .why-card {
          position: relative;
          background: hsl(var(--card));
          border: 1px solid hsl(var(--border) / 0.3);
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
          border-color: hsl(var(--border) / 0.5);
          box-shadow: 0 24px 60px hsl(var(--foreground) / 0.1), 0 0 40px hsl(var(--primary) / 0.05);
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
          background: linear-gradient(135deg, hsl(var(--primary) / 0.14), hsl(var(--primary) / 0.04));
          clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
          transition: all 0.4s ease;
        }

        .why-card:hover .why-hex-bg {
          background: linear-gradient(135deg, var(--card-accent), hsl(var(--secondary) / 0.6));
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

        .why-card:hover .why-hex-icon { color: hsl(var(--card-foreground)); }

        .why-num {
          position: absolute;
          top: 20px; right: 20px;
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 40px;
          font-weight: 900;
          color: hsl(var(--primary) / 0.04);
          line-height: 1;
          user-select: none;
        }

        .why-title {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 20px;
          font-weight: 800;
          text-transform: uppercase;
          color: hsl(var(--foreground));
          margin-bottom: 10px;
          letter-spacing: 0.3px;
        }

        .why-desc {
          font-size: 13.5px;
          color: hsl(var(--muted-foreground) / 0.58);
          line-height: 1.7;
        }

        /* ── TEAM CARDS ── */
        .team-card {
          position: relative;
          background: hsl(var(--card));
          border: 1px solid hsl(var(--border) / 0.3);
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
          background: linear-gradient(90deg, transparent, hsl(var(--primary)), transparent);
          opacity: 0;
          transition: opacity 0.4s;
        }

        .team-card:hover {
          transform: translateY(-6px);
          border-color: hsl(var(--border) / 0.5);
          box-shadow: 0 20px 50px hsl(var(--foreground) / 0.1);
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
          border: 1.5px solid hsl(var(--border) / 0.3);
          border-top-color: hsl(var(--secondary));
          animation: avatarSpin 8s linear infinite;
        }

        @keyframes avatarSpin { to { transform: rotate(360deg); } }

        .avatar-circle {
          width: 88px;
          height: 88px;
          border-radius: 50%;
          background: linear-gradient(135deg, hsl(var(--primary) / 0.1), hsl(var(--secondary) / 0.05));
          border: 1.5px solid hsl(var(--border) / 0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          color: hsl(var(--muted-foreground));
          transition: all 0.4s;
        }

        .team-card:hover .avatar-circle {
          border-color: hsl(var(--primary) / 0.5);
          background: hsl(var(--primary) / 0.12);
          color: hsl(var(--secondary));
          box-shadow: 0 0 24px hsl(var(--primary) / 0.15);
        }

        .team-name {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 20px;
          font-weight: 800;
          text-transform: uppercase;
          color: hsl(var(--foreground));
          margin-bottom: 4px;
        }

        .team-role {
          display: inline-block;
          font-size: 11px;
          font-weight: 700;
          color: hsl(var(--secondary));
          letter-spacing: 0.8px;
          text-transform: uppercase;
          background: hsl(var(--primary) / 0.08);
          border: 1px solid hsl(var(--border) / 0.3);
          border-radius: 100px;
          padding: 3px 12px;
          margin-bottom: 12px;
        }

        .team-bio {
          font-size: 13px;
          color: hsl(var(--muted-foreground) / 0.5);
          line-height: 1.65;
        }

        /* ── VIEW ALL BTN ── */
        .view-all-btn {
          display: inline-flex;
          align-items: center;
          gap: 9px;
          padding: 13px 32px;
          border: 1.5px solid hsl(var(--border) / 0.5);
          color: hsl(var(--secondary));
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 16px;
          font-weight: 800;
          letter-spacing: 0.6px;
          text-transform: uppercase;
          border-radius: 12px;
          text-decoration: none;
          background: hsl(var(--primary) / 0.04);
          transition: all 0.3s ease;
          margin-top: 48px;
        }

        .view-all-btn:hover {
          background: hsl(var(--secondary));
          color: hsl(var(--card-foreground));
          border-color: hsl(var(--secondary));
          box-shadow: 0 0 28px hsl(var(--primary) / 0.35);
          transform: translateY(-2px);
        }

        /* ── CTA SECTION ── */
        .cta-section {
          position: relative;
          overflow: hidden;
          background: hsl(var(--background));
          padding: 100px 0;
          text-align: center;
          font-family: 'DM Sans', sans-serif;
        }

        .cta-grid {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(hsl(var(--primary) / 0.04) 1px, transparent 1px),
            linear-gradient(90deg, hsl(var(--primary) / 0.04) 1px, transparent 1px);
          background-size: 60px 60px;
          mask-image: radial-gradient(ellipse 70% 80% at 50% 50%, black 20%, transparent 100%);
        }

        .cta-glow {
          position: absolute;
          top: 50%; left: 50%;
          transform: translate(-50%, -50%);
          width: 600px; height: 400px;
          background: radial-gradient(ellipse, hsl(var(--primary) / 0.08) 0%, transparent 70%);
          pointer-events: none;
        }

        .cta-zap-ring {
          position: relative;
          width: 80px;
          height: 80px;
          margin: 0 auto 28px;
          border-radius: 50%;
          border: 2px solid hsl(var(--border) / 0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          background: hsl(var(--primary) / 0.06);
          box-shadow: 0 0 40px hsl(var(--primary) / 0.15);
        }

        .cta-title {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: clamp(36px, 5vw, 64px);
          font-weight: 900;
          text-transform: uppercase;
          color: hsl(var(--foreground));
          letter-spacing: -1px;
          line-height: 0.95;
          margin-bottom: 16px;
        }

        .cta-title span {
          background: linear-gradient(135deg, hsl(var(--secondary)), hsl(var(--electric-yellow-light)));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .cta-desc {
          font-size: 15px;
          color: hsl(var(--muted-foreground) / 0.5);
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
          background: linear-gradient(135deg, hsl(var(--secondary)), hsl(var(--electric-blue-dark)));
          color: hsl(var(--primary-foreground));
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
          box-shadow: 0 0 32px hsl(var(--primary) / 0.45), 0 6px 20px hsl(var(--secondary) / 0.3);
          transform: translateY(-2px);
        }

        .cta-btn-secondary {
          display: inline-flex;
          align-items: center;
          gap: 9px;
          padding: 15px 32px;
          border: 1.5px solid hsl(var(--border) / 0.5);
          color: hsl(var(--foreground));
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 17px;
          font-weight: 700;
          letter-spacing: 0.6px;
          text-transform: uppercase;
          border-radius: 12px;
          text-decoration: none;
          background: hsl(var(--muted) / 0.3);
          transition: all 0.3s;
        }

        .cta-btn-secondary:hover {
          border-color: hsl(var(--primary) / 0.6);
          color: hsl(var(--secondary));
          background: hsl(var(--primary) / 0.08);
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
                <Zap size={14} />
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
                  <div className="badge-icon">
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
                  <div className="badge-icon">
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
            {/* Using dummy data - Option 1: Use COUNTER_DATA array */}
            {COUNTER_DATA.map((data, index) => (
              <AnimatedCounter key={index} {...data} />
            ))}
            
            
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

      {/* ── VIDEO ── */}
      <VideoSection />


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
                {m.photo_url ? (
                  <img src={m.photo_url} alt={m.name} className="avatar-circle" style={{ objectFit: 'cover', width: 80, height: 80, borderRadius: '50%', border: '3px solid hsl(var(--primary) / 0.3)' }} />
                ) : (
                  <div className="avatar-circle"><Users size={32} /></div>
                )}
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
              <Zap size={36} />
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