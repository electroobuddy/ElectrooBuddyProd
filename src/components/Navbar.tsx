import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, ChevronDown, ArrowRight, User, ShoppingCart, Sun, Moon, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ThemeToggle from "@/components/ThemeToggle";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/contexts/CartContext";

// Import favicon
import favicon from "/favicon.png";

const navLinks = [
  { label: "Home",     to: "/" },
  { label: "About",    to: "/about" },
  { label: "Services", to: "/services" },
  { label: "Products", to: "/products" },
  { label: "Subscriptions", to: "/subscriptions" },
  { label: "Projects", to: "/projects" },
  {
    label: "Pages",
    children: [
      { label: "Track Booking",    to: "/track-booking" },
      { label: "FAQs",               to: "/faq" },
      { label: "Privacy Policy",     to: "/privacy" },
      { label: "Terms & Conditions", to: "/terms" },
    ],
  },
  { label: "Contact", to: "/contact" },
];

// ─── Blinking Eye Component ───────────────────────────────────────────────────
// Replaces the second 'o' in "Electroo" with an animated eye that blinks
// naturally: quick double-blink, then a long pause.

const BlinkingEye = () => {
  const [blink, setBlink] = useState(false);

  useEffect(() => {
    // Sequence: blink → short pause → blink again → long pause → repeat
    const schedule = () => {
      // First blink
      setBlink(true);
      setTimeout(() => setBlink(false), 120);

      // Second blink (double-blink feel)
      setTimeout(() => setBlink(true),  420);
      setTimeout(() => setBlink(false), 540);

      // Schedule next cycle: 3–5 s random interval
      const next = 3000 + Math.random() * 2000;
      setTimeout(schedule, next + 540);
    };

    const initial = setTimeout(schedule, 1500);
    return () => clearTimeout(initial);
  }, []);

  return (
    <span
      aria-hidden="true"
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        width: "0.72em",
        height: "0.72em",
        verticalAlign: "middle",
        flexShrink: 0,
      }}
    >
      {/* Eye white / sclera */}
      <span
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "50%",
          background: "#3b82f6",
          boxShadow: "0 0 6px rgba(59, 130, 246, 0.6)",
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* Pupil */}
        <span
          style={{
            width: "42%",
            height: "42%",
            borderRadius: "50%",
            background: "#ffffff",
            boxShadow: "inset 0 0 2px rgba(0,0,0,0.4)",
            flexShrink: 0,
            transition: "transform 0.15s ease",
            transform: blink ? "scaleY(0.05)" : "scaleY(1)",
          }}
        />
      </span>

      {/* Upper eyelid — slides down on blink */}
      <span
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          borderRadius: "50% 50% 0 0 / 60% 60% 0 0",
          background: "#1e3a8a",
          transformOrigin: "top center",
          transform: blink ? "scaleY(1)" : "scaleY(0)",
          height: "100%",
          transition: blink
            ? "transform 0.07s cubic-bezier(0.4, 0, 1, 1)"
            : "transform 0.14s cubic-bezier(0, 0, 0.2, 1)",
          zIndex: 2,
        }}
      />

      {/* Lower eyelid — slides up slightly on blink */}
      <span
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          borderRadius: "0 0 50% 50% / 0 0 60% 60%",
          background: "#1e3a8a",
          transformOrigin: "bottom center",
          transform: blink ? "scaleY(0.55)" : "scaleY(0)",
          height: "50%",
          transition: blink
            ? "transform 0.07s cubic-bezier(0.4, 0, 1, 1)"
            : "transform 0.14s cubic-bezier(0, 0, 0.2, 1)",
          zIndex: 2,
        }}
      />

      {/* Subtle shine glint */}
      <span
        style={{
          position: "absolute",
          top: "18%",
          left: "22%",
          width: "20%",
          height: "20%",
          borderRadius: "50%",
          background: "rgba(255,255,255,0.7)",
          zIndex: 3,
          pointerEvents: "none",
        }}
      />
    </span>
  );
};

// ─── Logo Text ────────────────────────────────────────────────────────────────

const LogoText = () => (
  <span className="logo-text">
    Electr
    <BlinkingEye />
    <BlinkingEye />
    buddy
  </span>
);

// ─── Navbar ───────────────────────────────────────────────────────────────────

const Navbar = () => {
  const [open, setOpen]           = useState(false);
  const [pagesOpen, setPagesOpen] = useState(false);
  const [scrolled, setScrolled]   = useState(false);
  const [darkMode, setDarkMode]   = useState(true); // Default to dark mode
  const location                  = useLocation();
  const { user }                  = useAuth();
  const { itemCount }             = useCart();

  // Dark mode effect for mobile menu
  useEffect(() => {
    // Check localStorage first, if not set, default to dark mode (true)
    const storedMode = localStorage.getItem('darkMode');
    const isDark = storedMode !== null ? storedMode === 'true' : true;
    setDarkMode(isDark);
    // Ensure dark class is applied
    document.documentElement.classList.toggle('dark', isDark);
  }, []);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  useEffect(() => { setOpen(false); setPagesOpen(false); }, [location]);

  const isActive = (to: string) => location.pathname === to;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap');

        .navbar-root {
          position: sticky;
          top: 0;
          z-index: 50;
          transition: all 0.4s cubic-bezier(0.23, 1, 0.32, 1);
          font-family: 'Poppins', sans-serif;
        }

        .navbar-root.scrolled {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-bottom: 1px solid #e5e7eb;
          box-shadow: 0 4px 32px rgba(0, 0, 0, 0.08);
        }

        .dark .navbar-root.scrolled {
          background: rgba(31, 41, 55, 0.95);
          border-color: #374151;
          box-shadow: 0 4px 32px rgba(0, 0, 0, 0.3);
        }

        .navbar-root.top {
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(8px);
          border-bottom: 1px solid transparent;
        }

        .dark .navbar-root.top {
          background: rgba(17, 24, 39, 0.7);
        }

        .nav-inner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 64px;
          padding: 0 12px;
          max-width: 1280px;
          margin: 0 auto;
        }

        @media (min-width: 480px) {
          .nav-inner {
            padding: 0 16px;
          }
        }

        @media (min-width: 640px) {
          .nav-inner {
            height: 68px;
            padding: 0 20px;
          }
        }

        @media (min-width: 768px) {
          .nav-inner {
            height: 72px;
            padding: 0 24px;
          }
        }

        @media (min-width: 1024px) {
          .nav-inner {
            padding: 0 32px;
          }
        }

        @media (min-width: 1280px) {
          .nav-inner {
            padding: 0 40px;
          }
        }

        /* Logo */
        .nav-logo {
          display: flex;
          align-items: center;
          gap: 8px;
          text-decoration: none;
        }

        @media (min-width: 640px) {
          .nav-logo {
            gap: 10px;
          }
        }

        .logo-icon {
          width: 32px;
          height: 32px;
          border-radius: 10px;
          background: linear-gradient(135deg, #3b82f6, #1e3a8a);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 0 20px rgba(59, 130, 246, 0.35);
          transition: all 0.3s ease;
          flex-shrink: 0;
        }

        @media (min-width: 640px) {
          .logo-icon {
            width: 36px;
            height: 36px;
            border-radius: 11px;
          }
        }

        @media (min-width: 768px) {
          .logo-icon {
            width: 40px;
            height: 40px;
            border-radius: 12px;
          }
        }

        .nav-logo:hover .logo-icon {
          box-shadow: 0 0 32px rgba(59, 130, 246, 0.55);
          transform: scale(1.06);
        }

        .logo-text {
          font-family: 'Poppins', sans-serif;
          font-size: 18px;
          font-weight: 800;
          color: #1e3a8a;
          line-height: 1;
          display: inline-flex;
          align-items: center;
          gap: 0;
          white-space: nowrap;
        }

        @media (min-width: 640px) {
          .logo-text {
            font-size: 20px;
          }
        }

        @media (min-width: 768px) {
          .logo-text {
            font-size: 22px;
          }
        }

        @media (min-width: 1024px) {
          .logo-text {
            font-size: 24px;
          }
        }

        .dark .logo-text {
          color: #60a5fa;
        }

        .logo-tagline {
          font-family: 'Poppins', sans-serif;
          font-size: 9px;
          font-weight: 500;
          color: #6b7280;
          letter-spacing: 0.3px;
          white-space: nowrap;
          margin-top: 2px;
        }

        @media (min-width: 640px) {
          .logo-tagline {
            font-size: 10px;
          }
        }

        @media (min-width: 768px) {
          .logo-tagline {
            font-size: 11px;
          }
        }

        .dark .logo-tagline {
          color: #9ca3af;
        }

        /* Desktop links */
        .desktop-nav {
          display: none;
          align-items: center;
          gap: 2px;
        }

        @media (min-width: 1024px) { 
          .desktop-nav { 
            display: flex; 
            gap: 4px;
          } 
        }

        @media (min-width: 1280px) { 
          .desktop-nav { 
            gap: 6px;
          } 
        }

        .nav-link {
          position: relative;
          padding: 6px 10px;
          font-size: 13px;
          font-weight: 500;
          color: #6b7280;
          border-radius: 8px;
          text-decoration: none;
          transition: all 0.25s ease;
          font-family: 'Poppins', sans-serif;
        }

        @media (min-width: 1280px) {
          .nav-link {
            padding: 8px 14px;
            font-size: 14px;
            border-radius: 10px;
          }
        }

        .nav-link::after {
          content: '';
          position: absolute;
          bottom: 4px;
          left: 50%;
          transform: translateX(-50%);
          width: 0;
          height: 2px;
          background: #3b82f6;
          border-radius: 1px;
          transition: width 0.3s ease;
        }

        .nav-link:hover { color: #1e3a8a; background: rgba(59, 130, 246, 0.05); }
        .nav-link:hover::after { width: 60%; }
        .nav-link.active { color: #1e3a8a; background: rgba(59, 130, 246, 0.1); font-weight: 600; }
        .nav-link.active::after { width: 60%; }

        .dark .nav-link { color: #9ca3af; }
        .dark .nav-link:hover { color: #60a5fa; background: rgba(59, 130, 246, 0.1); }
        .dark .nav-link.active { color: #60a5fa; background: rgba(59, 130, 246, 0.15); }
        .dark .nav-link::after { background: #60a5fa; }

        /* Dropdown trigger */
        .nav-dropdown-trigger {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 6px 10px;
          font-size: 13px;
          font-weight: 500;
          color: #6b7280;
          border-radius: 8px;
          background: transparent;
          border: none;
          cursor: pointer;
          transition: all 0.25s ease;
          font-family: 'Poppins', sans-serif;
        }

        @media (min-width: 1280px) {
          .nav-dropdown-trigger {
            gap: 5px;
            padding: 8px 14px;
            font-size: 14px;
            border-radius: 10px;
          }
        }

        .nav-dropdown-trigger:hover { color: #1e3a8a; background: rgba(59, 130, 246, 0.05); }
        .trigger-chevron { transition: transform 0.3s ease; }
        .trigger-chevron.open { transform: rotate(180deg); }

        .dark .nav-dropdown-trigger { color: #9ca3af; }
        .dark .nav-dropdown-trigger:hover { color: #60a5fa; background: rgba(59, 130, 246, 0.1); }

        /* Dropdown menu */
        .dropdown-menu {
          position: absolute;
          top: calc(100% + 8px);
          left: 0;
          width: 200px;
          background: rgba(255, 255, 255, 0.98);
          backdrop-filter: blur(20px);
          border: 1px solid #e5e7eb;
          border-radius: 14px;
          overflow: hidden;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
          z-index: 100;
        }

        @media (min-width: 1024px) and (max-width: 1279px) {
          .dropdown-menu {
            width: 210px;
          }
        }

        @media (min-width: 1280px) {
          .dropdown-menu {
            top: calc(100% + 10px);
            width: 220px;
            border-radius: 16px;
          }
        }

        .dark .dropdown-menu {
          background: rgba(31, 41, 55, 0.98);
          border-color: #374151;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        }

        .dropdown-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 11px 16px;
          font-size: 13px;
          font-weight: 500;
          color: #6b7280;
          text-decoration: none;
          transition: all 0.22s ease;
          border-bottom: 1px solid rgba(229, 231, 235, 0.5);
          font-family: 'Poppins', sans-serif;
        }

        @media (min-width: 1280px) {
          .dropdown-item {
            padding: 13px 18px;
            font-size: 14px;
          }
        }
        .dropdown-item:last-child { border-bottom: none; }
        .dropdown-item:hover { background: rgba(59, 130, 246, 0.05); color: #1e3a8a; padding-left: 22px; }
        .dropdown-arrow { opacity: 0; transform: translateX(-4px); transition: all 0.22s ease; color: #3b82f6; }
        .dropdown-item:hover .dropdown-arrow { opacity: 1; transform: translateX(0); }

        .dark .dropdown-item { color: #9ca3af; border-color: rgba(55, 65, 81, 0.5); }
        .dark .dropdown-item:hover { background: rgba(59, 130, 246, 0.1); color: #60a5fa; }
        .dark .dropdown-arrow { color: #60a5fa; }

        /* Book Now CTA */
        .book-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          margin-left: 8px;
          padding: 8px 16px;
          background: linear-gradient(135deg, #3b82f6, #1e3a8a);
          color: #ffffff;
          font-family: 'Poppins', sans-serif;
          font-size: 13px;
          font-weight: 700;
          border-radius: 8px;
          text-decoration: none;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }

        @media (min-width: 1280px) {
          .book-btn {
            gap: 8px;
            margin-left: 10px;
            padding: 10px;
            font-size: 14px;
            border-radius: 10px;
          }
        }
        .book-btn::before { content: ''; position: absolute; inset: 0; background: rgba(255,255,255,0); transition: background 0.3s; }
        .book-btn:hover { box-shadow: 0 0 24px rgba(59, 130, 246, 0.45), 0 6px 18px rgba(59, 130, 246, 0.3); transform: translateY(-2px); }
        .book-btn:hover::before { background: rgba(255,255,255,0.08); }

        /* Mobile controls */
        .mobile-controls { display: flex; align-items: center; gap: 6px; }
        
        @media (min-width: 640px) { 
          .mobile-controls { 
            gap: 8px; 
          } 
        }
        
        @media (min-width: 1024px) { 
          .mobile-controls { 
            display: none; 
          } 
        }

        .hamburger-btn {
          width: 36px; 
          height: 36px;
          border-radius: 8px;
          border: 1px solid #e5e7eb;
          background: rgba(59, 130, 246, 0.05);
          display: flex; 
          align-items: center; 
          justify-content: center;
          color: #3b82f6;
          cursor: pointer;
          transition: all 0.25s ease;
        }

        @media (min-width: 640px) {
          .hamburger-btn {
            width: 40px;
            height: 40px;
            border-radius: 10px;
          }
        }
        .hamburger-btn:hover { background: rgba(59, 130, 246, 0.1); border-color: #3b82f6; color: #1e3a8a; }

        .dark .hamburger-btn { border-color: #374151; background: rgba(59, 130, 246, 0.1); color: #60a5fa; }
        .dark .hamburger-btn:hover { background: rgba(59, 130, 246, 0.2); border-color: #60a5fa; color: #60a5fa; }

        .mobile-theme-toggle {
          width: 36px; 
          height: 36px;
          border-radius: 8px;
          border: 1px solid #e5e7eb;
          background: rgba(59, 130, 246, 0.05);
          display: flex; 
          align-items: center; 
          justify-content: center;
          cursor: pointer;
          transition: all 0.25s ease;
          flex-shrink: 0;
        }

        @media (min-width: 640px) {
          .mobile-theme-toggle {
            width: 40px;
            height: 40px;
            border-radius: 10px;
          }
        }
        .mobile-theme-toggle:hover { background: rgba(59, 130, 246, 0.1); border-color: #3b82f6; }

        .dark .mobile-theme-toggle { border-color: #374151; background: rgba(59, 130, 246, 0.1); }
        .dark .mobile-theme-toggle:hover { background: rgba(59, 130, 246, 0.2); border-color: #60a5fa; }

        /* Mobile menu */
        .mobile-menu {
          background: rgba(255, 255, 255, 0.98);
          backdrop-filter: blur(20px);
          border-top: 1px solid #e5e7eb;
          overflow: hidden;
        }

        .dark .mobile-menu {
          background: rgba(31, 41, 55, 0.98);
          border-color: #374151;
        }
        
        @media (min-width: 1024px) { 
          .mobile-menu { 
            display: none; 
          } 
        }

        .mobile-menu-inner { 
          padding: 12px 16px 20px; 
          display: flex; 
          flex-direction: column; 
          gap: 6px; 
        }

        @media (min-width: 640px) {
          .mobile-menu-inner {
            padding: 16px 20px 24px;
            gap: 8px;
          }
        }

        .mobile-theme-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 14px;
          margin-bottom: 6px;
          border-radius: 8px;
          background: rgba(59, 130, 246, 0.05);
          border: 1px solid rgba(229, 231, 235, 0.5);
        }

        @media (min-width: 640px) {
          .mobile-theme-row {
            padding: 12px 16px;
            margin-bottom: 8px;
            border-radius: 10px;
          }
        }

        .dark .mobile-theme-row {
          background: rgba(59, 130, 246, 0.1);
          border-color: rgba(55, 65, 81, 0.5);
        }

        .mobile-theme-label {
          font-size: 14px;
          font-weight: 500;
          color: #6b7280;
          font-family: 'Poppins', sans-serif;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .dark .mobile-theme-label {
          color: #9ca3af;
        }

        .mobile-link {
          display: block;
          padding: 10px 14px;
          font-size: 13px; 
          font-weight: 500;
          color: #6b7280;
          border-radius: 8px;
          text-decoration: none;
          transition: all 0.22s ease;
          font-family: 'Poppins', sans-serif;
          border: 1px solid transparent;
        }

        @media (min-width: 640px) {
          .mobile-link {
            padding: 12px 16px;
            font-size: 14px;
            border-radius: 10px;
          }
        }
        .mobile-link:hover, .mobile-link.active { background: rgba(59, 130, 246, 0.1); border-color: rgba(59, 130, 246, 0.2); color: #1e3a8a; padding-left: 20px; }
        
        .dark .mobile-link { color: #9ca3af; }
        .dark .mobile-link:hover, .dark .mobile-link.active { background: rgba(59, 130, 246, 0.15); border-color: rgba(59, 130, 246, 0.3); color: #60a5fa; }

        .mobile-trigger {
          display: flex; 
          align-items: center; 
          justify-content: space-between;
          width: 100%; 
          padding: 10px 14px;
          font-size: 13px; 
          font-weight: 500;
          color: #6b7280;
          border-radius: 8px;
          background: transparent;
          border: 1px solid transparent;
          cursor: pointer;
          font-family: 'Poppins', sans-serif;
          transition: all 0.22s;
        }

        @media (min-width: 640px) {
          .mobile-trigger {
            padding: 12px 16px;
            font-size: 14px;
            border-radius: 10px;
          }
        }
        .mobile-trigger:hover { background: rgba(59, 130, 246, 0.05); border-color: rgba(229, 231, 235, 0.5); color: #1e3a8a; }

        .dark .mobile-trigger { color: #9ca3af; }
        .dark .mobile-trigger:hover { background: rgba(59, 130, 246, 0.1); border-color: rgba(55, 65, 81, 0.5); color: #60a5fa; }

        .mobile-sub-link {
          display: block;
          padding: 9px 14px 9px 26px;
          font-size: 12px;
          color: #6b7280;
          text-decoration: none;
          border-radius: 7px;
          transition: all 0.22s;
          font-family: 'Poppins', sans-serif;
          position: relative;
        }

        @media (min-width: 640px) {
          .mobile-sub-link {
            padding: 10px 16px 10px 28px;
            font-size: 13px;
            border-radius: 8px;
          }
        }
        .mobile-sub-link::before { content: '⚡'; position: absolute; left: 12px; font-size: 9px; top: 50%; transform: translateY(-50%); opacity: 0.4; }
        .mobile-sub-link:hover { color: #3b82f6; background: rgba(59, 130, 246, 0.05); }

        .dark .mobile-sub-link { color: #9ca3af; }
        .dark .mobile-sub-link:hover { color: #60a5fa; background: rgba(59, 130, 246, 0.1); }

        .mobile-divider { height: 1px; background: linear-gradient(90deg, rgba(59, 130, 246, 0.3), transparent); margin: 4px 0; }

        .dark .mobile-divider { background: linear-gradient(90deg, rgba(59, 130, 246, 0.5), transparent); }

        .mobile-book-btn {
          display: block; 
          text-align: center; 
          margin-top: 6px; 
          padding: 12px;
          background: linear-gradient(135deg, #3b82f6, #1e3a8a);
          color: #ffffff;
          font-family: 'Poppins', sans-serif;
          font-size: 14px; 
          font-weight: 700;
          border-radius: 10px; 
          text-decoration: none;
          box-shadow: 0 0 20px rgba(59, 130, 246, 0.25);
        }

        @media (min-width: 640px) {
          .mobile-book-btn {
            margin-top: 8px;
            padding: 14px;
            font-size: 15px;
            border-radius: 12px;
          }
        }
      `}</style>

      <nav className={`navbar-root ${scrolled ? "scrolled" : "top"}`}>
        <div className="nav-inner">

          {/* ── Logo ── */}
          <Link to="/" className="nav-logo">
            <div className="logo-icon">
              <img src={favicon} alt="Electroo Buddy" className="w-full h-full object-contain rounded-lg" />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
              <LogoText />
              <span className="logo-tagline">Home Appliance Services</span>
            </div>
          </Link>

          {/* ── Desktop nav ── */}
          <div className="desktop-nav">
            {navLinks.map((link) =>
              link.children ? (
                <div key={link.label} style={{ position: "relative" }}
                  onMouseEnter={() => setPagesOpen(true)}
                  onMouseLeave={() => setPagesOpen(false)}>
                  <button className="nav-dropdown-trigger">
                    {link.label}
                    <ChevronDown size={14} className={`trigger-chevron ${pagesOpen ? "open" : ""}`} />
                  </button>
                  <AnimatePresence>
                    {pagesOpen && (
                      <motion.div className="dropdown-menu"
                        initial={{ opacity: 0, y: 10, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.96 }}
                        transition={{ duration: 0.18 }}>
                        {link.children.map(child => (
                          <Link key={child.to} to={child.to} className="dropdown-item">
                            {child.label}
                            <ArrowRight size={13} className="dropdown-arrow" />
                          </Link>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <Link key={link.to} to={link.to!} className={`nav-link ${isActive(link.to!) ? "active" : ""}`}>
                  {link.label}
                </Link>
              )
            )}

            <div style={{ marginLeft: 4 }}><ThemeToggle /></div>

            <Link to="/cart" className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" style={{ marginRight: 6 }}>
              <ShoppingCart size={18} className="text-gray-700 dark:text-gray-300" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs font-bold w-4 h-4 rounded-full flex items-center justify-center" style={{ fontSize: '10px' }}>
                  {itemCount}
                </span>
              )}
            </Link>

            <Link to={user ? "/dashboard" : "/login"} className="nav-link" style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <User size={13} />
              <span className="hidden xl:inline">{user ? "Dashboard" : "Login"}</span>
              <span className="xl:hidden">{user ? "Dash" : "Login"}</span>
            </Link>

            <Link to="/booking" className="book-btn">
              <Zap size={13} /> Book Now
            </Link>
          </div>

          {/* ── Mobile controls ── */}
          <div className="mobile-controls">
            <Link to="/cart" className="relative p-2 mr-1" style={{ color: "#6b7280" }}>
              <ShoppingCart size={18} className="dark:text-gray-300" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs font-bold w-4 h-4 rounded-full flex items-center justify-center" style={{ fontSize: '10px' }}>
                  {itemCount}
                </span>
              )}
            </Link>
            <button className="hamburger-btn" onClick={() => setOpen(!open)} aria-label="Toggle menu">
              {open ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        {/* ── Mobile menu ── */}
        <AnimatePresence>
          {open && (
            <motion.div className="mobile-menu"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}>
              <div className="mobile-menu-inner">
                {/* Theme Toggle Row */}
                <div className="mobile-theme-row">
                  <span className="mobile-theme-label">
                    {darkMode ? <Moon size={14} /> : <Sun size={14} />}
                    <span className="hidden sm:inline">{darkMode ? 'Dark Mode' : 'Light Mode'}</span>
                    <span className="sm:hidden">{darkMode ? 'Dark' : 'Light'}</span>
                  </span>
                  <button
                    className="mobile-theme-toggle"
                    onClick={() => {
                      const newMode = !darkMode;
                      setDarkMode(newMode);
                      document.documentElement.classList.toggle('dark', newMode);
                      localStorage.setItem('darkMode', String(newMode));
                    }}
                    aria-label="Toggle theme"
                  >
                    {darkMode ? (
                      <Sun size={16} className="text-yellow-500" />
                    ) : (
                      <Moon size={16} className="text-gray-700 dark:text-gray-300" />
                    )}
                  </button>
                </div>

                {navLinks.map((link) =>
                  link.children ? (
                    <div key={link.label}>
                      <button className="mobile-trigger" onClick={() => setPagesOpen(!pagesOpen)}>
                        {link.label}
                        <ChevronDown size={14} className={`trigger-chevron ${pagesOpen ? "open" : ""}`} />
                      </button>
                      <AnimatePresence>
                        {pagesOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.25 }}
                            style={{ overflow: "hidden" }}>
                            {link.children.map(child => (
                              <Link key={child.to} to={child.to} className="mobile-sub-link"
                                onClick={() => { setOpen(false); setPagesOpen(false); }}>
                                {child.label}
                              </Link>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                      <div className="mobile-divider" />
                    </div>
                  ) : (
                    <Link key={link.to} to={link.to!} className={`mobile-link ${isActive(link.to!) ? "active" : ""}`}
                      onClick={() => setOpen(false)}>
                      {link.label}
                    </Link>
                  )
                )}
                <Link to={user ? "/dashboard" : "/login"} className="mobile-link" onClick={() => setOpen(false)}
                  style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <User size={14} /> 
                  <span className="hidden sm:inline">{user ? "My Dashboard" : "Login / Sign Up"}</span>
                  <span className="sm:hidden">{user ? "Dashboard" : "Login"}</span>
                </Link>
                <Link to="/cart" className="mobile-link" onClick={() => setOpen(false)}
                  style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <ShoppingCart size={14} /> 
                  <span className="hidden sm:inline">My Cart {itemCount > 0 && `(${itemCount})`}</span>
                  <span className="sm:hidden">Cart {itemCount > 0 && `(${itemCount})`}</span>
                </Link>
                <Link to="/booking" className="mobile-book-btn" onClick={() => setOpen(false)}>
                  ⚡ Book Now
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </>
  );
};

export default Navbar;