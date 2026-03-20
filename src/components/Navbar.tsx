import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Zap, ChevronDown, ArrowRight, User, ShoppingCart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ThemeToggle from "@/components/ThemeToggle";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/contexts/CartContext";

const navLinks = [
  { label: "Home",     to: "/" },
  { label: "About",    to: "/about" },
  { label: "Services", to: "/services" },
  { label: "Products", to: "/products" },
  { label: "Projects", to: "/projects" },
  {
    label: "Pages",
    children: [
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
        marginBottom: "0.1em",
        // Inherit the yellow gradient colour from the parent span
        flexShrink: 0,
      }}
    >
      {/* Eye white / sclera */}
      <span
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "50%",
          background: "hsl(var(--secondary))",
          boxShadow: "0 0 6px hsl(var(--secondary) / 0.6)",
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
            background: "hsl(var(--background))",
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
          background: "hsl(var(--foreground))",
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
          background: "hsl(var(--foreground))",
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
  const location                  = useLocation();
  const { user }                  = useAuth();
  const { itemCount }             = useCart();

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
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700;800&family=DM+Sans:wght@400;500;600&display=swap');

        .navbar-root {
          position: sticky;
          top: 0;
          z-index: 50;
          transition: all 0.4s cubic-bezier(0.23, 1, 0.32, 1);
          font-family: 'DM Sans', sans-serif;
        }

        .navbar-root.scrolled {
          background: hsl(var(--card) / 0.92);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-bottom: 1px solid hsl(var(--border) / 0.5);
          box-shadow: 0 4px 32px hsl(var(--foreground) / 0.1);
        }

        .navbar-root.top {
          background: hsl(var(--background) / 0.6);
          backdrop-filter: blur(8px);
          border-bottom: 1px solid transparent;
        }

        .nav-inner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 72px;
          padding: 0 24px;
          max-width: 1280px;
          margin: 0 auto;
        }

        /* Logo */
        .nav-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          text-decoration: none;
        }

        .logo-icon {
          width: 40px;
          height: 40px;
          border-radius: 12px;
          background: linear-gradient(135deg, hsl(var(--primary)), hsl(var(--electric-blue-dark)));
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 0 20px hsl(var(--primary) / 0.35);
          transition: all 0.3s ease;
          flex-shrink: 0;
        }

        .nav-logo:hover .logo-icon {
          box-shadow: 0 0 32px hsl(var(--primary) / 0.55);
          transform: scale(1.06);
        }

        .logo-text {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 24px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: hsl(var(--foreground));
          line-height: 1;
          display: inline-flex;
          align-items: center;
          gap: 0;
        }

        /* Desktop links */
        .desktop-nav {
          display: none;
          align-items: center;
          gap: 2px;
        }

        @media (min-width: 768px) { .desktop-nav { display: flex; } }

        .nav-link {
          position: relative;
          padding: 8px 14px;
          font-size: 13.5px;
          font-weight: 500;
          color: hsl(var(--muted-foreground));
          border-radius: 10px;
          text-decoration: none;
          transition: all 0.25s ease;
          letter-spacing: 0.2px;
        }

        .nav-link::after {
          content: '';
          position: absolute;
          bottom: 4px;
          left: 50%;
          transform: translateX(-50%);
          width: 0;
          height: 2px;
          background: hsl(var(--primary));
          border-radius: 1px;
          transition: width 0.3s ease;
        }

        .nav-link:hover { color: hsl(var(--foreground)); background: hsl(var(--muted) / 0.5); }
        .nav-link:hover::after { width: 60%; }
        .nav-link.active { color: hsl(var(--primary)); background: hsl(var(--primary) / 0.1); font-weight: 600; }
        .nav-link.active::after { width: 60%; }

        /* Dropdown trigger */
        .nav-dropdown-trigger {
          display: flex;
          align-items: center;
          gap: 5px;
          padding: 8px 14px;
          font-size: 13.5px;
          font-weight: 500;
          color: hsl(var(--muted-foreground));
          border-radius: 10px;
          background: transparent;
          border: none;
          cursor: pointer;
          transition: all 0.25s ease;
          font-family: 'DM Sans', sans-serif;
          letter-spacing: 0.2px;
        }

        .nav-dropdown-trigger:hover { color: hsl(var(--foreground)); background: hsl(var(--muted) / 0.5); }
        .trigger-chevron { transition: transform 0.3s ease; }
        .trigger-chevron.open { transform: rotate(180deg); }

        /* Dropdown menu */
        .dropdown-menu {
          position: absolute;
          top: calc(100% + 10px);
          left: 0;
          width: 220px;
          background: hsl(var(--card) / 0.95);
          backdrop-filter: blur(20px);
          border: 1px solid hsl(var(--border) / 0.5);
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 20px 60px hsl(var(--foreground) / 0.15);
        }

        .dropdown-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 13px 18px;
          font-size: 13.5px;
          font-weight: 500;
          color: hsl(var(--muted-foreground));
          text-decoration: none;
          transition: all 0.22s ease;
          border-bottom: 1px solid hsl(var(--border) / 0.3);
          font-family: 'DM Sans', sans-serif;
        }
        .dropdown-item:last-child { border-bottom: none; }
        .dropdown-item:hover { background: hsl(var(--primary) / 0.05); color: hsl(var(--primary)); padding-left: 22px; }
        .dropdown-arrow { opacity: 0; transform: translateX(-4px); transition: all 0.22s ease; color: hsl(var(--primary)); }
        .dropdown-item:hover .dropdown-arrow { opacity: 1; transform: translateX(0); }

        /* Book Now CTA */
        .book-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          margin-left: 10px;
          padding: 10px 22px;
          background: linear-gradient(135deg, hsl(var(--primary)), hsl(var(--electric-blue-dark)));
          color: hsl(var(--primary-foreground));
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 15px;
          font-weight: 800;
          letter-spacing: 0.6px;
          text-transform: uppercase;
          border-radius: 10px;
          text-decoration: none;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }
        .book-btn::before { content: ''; position: absolute; inset: 0; background: rgba(255,255,255,0); transition: background 0.3s; }
        .book-btn:hover { box-shadow: 0 0 24px hsl(var(--primary) / 0.45), 0 6px 18px hsl(var(--primary) / 0.3); transform: translateY(-2px); }
        .book-btn:hover::before { background: rgba(255,255,255,0.08); }

        /* Mobile controls */
        .mobile-controls { display: flex; align-items: center; gap: 8px; }
        @media (min-width: 768px) { .mobile-controls { display: none; } }

        .hamburger-btn {
          width: 40px; height: 40px;
          border-radius: 10px;
          border: 1px solid hsl(var(--border) / 0.5);
          background: hsl(var(--muted) / 0.3);
          display: flex; align-items: center; justify-content: center;
          color: hsl(var(--primary));
          cursor: pointer;
          transition: all 0.25s ease;
        }
        .hamburger-btn:hover { background: hsl(var(--muted) / 0.5); border-color: hsl(var(--border)); color: hsl(var(--primary)); }

        /* Mobile menu */
        .mobile-menu {
          background: hsl(var(--card) / 0.95);
          backdrop-filter: blur(20px);
          border-top: 1px solid hsl(var(--border) / 0.5);
          overflow: hidden;
        }
        @media (min-width: 768px) { .mobile-menu { display: none; } }

        .mobile-menu-inner { padding: 16px 20px 24px; display: flex; flex-direction: column; gap: 6px; }

        .mobile-link {
          display: block;
          padding: 12px 16px;
          font-size: 14px; font-weight: 500;
          color: hsl(var(--muted-foreground));
          border-radius: 10px;
          text-decoration: none;
          transition: all 0.22s ease;
          font-family: 'DM Sans', sans-serif;
          border: 1px solid transparent;
        }
        .mobile-link:hover, .mobile-link.active { background: hsl(var(--primary) / 0.1); border-color: hsl(var(--primary) / 0.2); color: hsl(var(--primary)); padding-left: 20px; }

        .mobile-trigger {
          display: flex; align-items: center; justify-content: space-between;
          width: 100%; padding: 12px 16px;
          font-size: 14px; font-weight: 500;
          color: hsl(var(--muted-foreground));
          border-radius: 10px;
          background: transparent;
          border: 1px solid transparent;
          cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          transition: all 0.22s;
        }
        .mobile-trigger:hover { background: hsl(var(--muted) / 0.3); border-color: hsl(var(--border) / 0.3); color: hsl(var(--foreground)); }

        .mobile-sub-link {
          display: block;
          padding: 10px 16px 10px 28px;
          font-size: 13px;
          color: hsl(var(--muted-foreground) / 0.7);
          text-decoration: none;
          border-radius: 8px;
          transition: all 0.22s;
          font-family: 'DM Sans', sans-serif;
          position: relative;
        }
        .mobile-sub-link::before { content: '⚡'; position: absolute; left: 12px; font-size: 9px; top: 50%; transform: translateY(-50%); opacity: 0.4; }
        .mobile-sub-link:hover { color: hsl(var(--primary)); background: hsl(var(--primary) / 0.05); }

        .mobile-divider { height: 1px; background: linear-gradient(90deg, hsl(var(--primary) / 0.3), transparent); margin: 4px 0; }

        .mobile-book-btn {
          display: block; text-align: center; margin-top: 8px; padding: 14px;
          background: linear-gradient(135deg, hsl(var(--primary)), hsl(var(--electric-blue-dark)));
          color: hsl(var(--primary-foreground));
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 16px; font-weight: 800; letter-spacing: 0.8px; text-transform: uppercase;
          border-radius: 12px; text-decoration: none;
          box-shadow: 0 0 20px hsl(var(--primary) / 0.25);
        }
      `}</style>

      <nav className={`navbar-root ${scrolled ? "scrolled" : "top"}`}>
        <div className="nav-inner">

          {/* ── Logo ── */}
          <Link to="/" className="nav-logo">
            <div className="logo-icon">
              <Zap size={20} color="#0a0f1e" strokeWidth={2.5} />
            </div>
            <LogoText />
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

            <Link to="/cart" className="relative p-2 rounded-lg hover:bg-muted/50 transition-colors" style={{ marginRight: 8 }}>
              <ShoppingCart size={20} className="text-foreground" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </Link>

            <Link to={user ? "/dashboard" : "/login"} className="nav-link" style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <User size={14} />
              {user ? "Dashboard" : "Login"}
            </Link>

            <Link to="/booking" className="book-btn">
              <Zap size={13} /> Book Now
            </Link>
          </div>

          {/* ── Mobile controls ── */}
          <div className="mobile-controls">
            <Link to="/cart" className="relative p-2 mr-1" style={{ color: "hsl(var(--foreground))" }}>
              <ShoppingCart size={20} />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </Link>
            <ThemeToggle />
            <button className="hamburger-btn" onClick={() => setOpen(!open)}>
              {open ? <X size={20} /> : <Menu size={20} />}
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
                  <User size={14} /> {user ? "My Dashboard" : "Login / Sign Up"}
                </Link>
                <Link to="/cart" className="mobile-link" onClick={() => setOpen(false)}
                  style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <ShoppingCart size={14} /> My Cart {itemCount > 0 && `(${itemCount})`}
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