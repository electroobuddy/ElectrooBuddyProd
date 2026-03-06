// import { useState, useEffect } from "react";
// import { Link, useLocation } from "react-router-dom";
// import { Menu, X, Zap, ChevronDown, ArrowRight } from "lucide-react";
// import { motion, AnimatePresence } from "framer-motion";
// import ThemeToggle from "@/components/ThemeToggle";

// const navLinks = [
//   { label: "Home", to: "/" },
//   { label: "About", to: "/about" },
//   { label: "Services", to: "/services" },
//   { label: "Projects", to: "/projects" },
//   {
//     label: "Pages",
//     children: [
//       { label: "FAQs", to: "/faq" },
//       { label: "Privacy Policy", to: "/privacy" },
//       { label: "Terms & Conditions", to: "/terms" },
//     ],
//   },
//   { label: "Contact", to: "/contact" },
// ];

// const Navbar = () => {
//   const [open, setOpen] = useState(false);
//   const [pagesOpen, setPagesOpen] = useState(false);
//   const [scrolled, setScrolled] = useState(false);
//   const location = useLocation();

//   useEffect(() => {
//     const handler = () => setScrolled(window.scrollY > 20);
//     window.addEventListener("scroll", handler);
//     return () => window.removeEventListener("scroll", handler);
//   }, []);

//   const isActive = (to: string) => location.pathname === to;

//   return (
//     <nav
//       className={`sticky top-0 z-50 transition-all duration-500 ${
//         scrolled
//           ? "bg-card/90 backdrop-blur-xl border-b border-border/50 shadow-lg shadow-foreground/5"
//           : "bg-transparent border-b border-transparent"
//       }`}
//     >
//       <div className="container mx-auto flex items-center justify-between h-20 px-4">
//         <Link to="/" className="flex items-center gap-2.5 group">
//           <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-electric-blue-dark flex items-center justify-center shadow-lg shadow-primary/25 group-hover:shadow-xl group-hover:shadow-primary/30 transition-all duration-300 group-hover:scale-105">
//             <Zap className="w-5 h-5 text-secondary electric-pulse" />
//           </div>
//           <span className="text-2xl font-heading font-bold text-foreground tracking-tight">
//             Electro<span className="text-gradient">o</span>buddy
//           </span>
//         </Link>

//         {/* Desktop nav */}
//         <div className="hidden md:flex items-center gap-2">
//           {navLinks.map((link) =>
//             link.children ? (
//               <div
//                 key={link.label}
//                 className="relative"
//                 onMouseEnter={() => setPagesOpen(true)}
//                 onMouseLeave={() => setPagesOpen(false)}
//               >
//                 <button className="nav-link-underline flex items-center gap-1 px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-all duration-300 rounded-lg hover:bg-muted/50">
//                   {link.label} <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${pagesOpen ? "rotate-180" : ""}`} />
//                 </button>
//                 <AnimatePresence>
//                   {pagesOpen && (
//                     <motion.div
//                       initial={{ opacity: 0, y: 12, scale: 0.95 }}
//                       animate={{ opacity: 1, y: 0, scale: 1 }}
//                       exit={{ opacity: 0, y: 12, scale: 0.95 }}
//                       transition={{ duration: 0.2 }}
//                       className="absolute top-full left-0 mt-2 w-52 bg-card/95 backdrop-blur-xl border border-border/50 rounded-xl shadow-xl shadow-foreground/10 overflow-hidden"
//                     >
//                       {link.children.map((child) => (
//                         <Link
//                           key={child.to}
//                           to={child.to}
//                           className="group flex items-center justify-between px-5 py-3 text-sm text-muted-foreground hover:text-foreground hover:bg-gradient-to-r hover:from-primary/5 hover:to-transparent transition-all duration-300"
//                         >
//                           {child.label}
//                           <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
//                         </Link>
//                       ))}
//                     </motion.div>
//                   )}
//                 </AnimatePresence>
//               </div>
//             ) : (
//               <Link
//                 key={link.to}
//                 to={link.to!}
//                 className={`nav-link-underline px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300 ${
//                   isActive(link.to!)
//                     ? "text-primary bg-primary/10 font-semibold"
//                     : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
//                 }`}
//               >
//                 {link.label}
//               </Link>
//             )
//           )}

//           <div className="ml-1">
//             <ThemeToggle />
//           </div>

//           <Link
//             to="/booking"
//             className="ml-2 px-6 py-2.5 text-sm font-semibold bg-gradient-to-r from-primary to-electric-blue-dark text-primary-foreground rounded-xl hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5 transition-all duration-300 ripple"
//           >
//             Book Now
//           </Link>
//         </div>

//         {/* Mobile controls */}
//         <div className="flex items-center gap-2 md:hidden">
//           <ThemeToggle />
//           <button 
//             className="p-2.5 rounded-lg hover:bg-muted/50 transition-colors" 
//             onClick={() => setOpen(!open)}
//           >
//             {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
//           </button>
//         </div>
//       </div>

//       {/* Mobile menu */}
//       <AnimatePresence>
//         {open && (
//           <motion.div
//             initial={{ height: 0, opacity: 0 }}
//             animate={{ height: "auto", opacity: 1 }}
//             exit={{ height: 0, opacity: 0 }}
//             className="md:hidden overflow-hidden bg-card/95 backdrop-blur-xl border-t border-border shadow-xl"
//           >
//             <div className="px-4 py-5 space-y-2">
//               {navLinks.map((link) =>
//                 link.children ? (
//                   <div key={link.label} className="border-b border-border/50 last:border-0 pb-2">
//                     <button
//                       onClick={() => setPagesOpen(!pagesOpen)}
//                       className="flex items-center justify-between w-full px-3 py-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg transition-all"
//                     >
//                       {link.label} <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${pagesOpen ? "rotate-180" : ""}`} />
//                     </button>
//                     <AnimatePresence>
//                       {pagesOpen && (
//                         <motion.div
//                           initial={{ height: 0, opacity: 0 }}
//                           animate={{ height: "auto", opacity: 1 }}
//                           exit={{ height: 0, opacity: 0 }}
//                           className="pl-4 pr-2 overflow-hidden"
//                         >
//                           {link.children.map((child) => (
//                             <Link
//                               key={child.to}
//                               to={child.to}
//                               onClick={() => {
//                                 setOpen(false);
//                                 setPagesOpen(false);
//                               }}
//                               className="block px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-gradient-to-r hover:from-primary/5 hover:to-transparent rounded-lg transition-all duration-300"
//                             >
//                               {child.label}
//                             </Link>
//                           ))}
//                         </motion.div>
//                       )}
//                     </AnimatePresence>
//                   </div>
//                 ) : (
//                   <Link
//                     key={link.to}
//                     to={link.to!}
//                     onClick={() => setOpen(false)}
//                     className={`block px-4 py-3 text-sm font-medium rounded-lg transition-all duration-300 ${
//                       isActive(link.to!) 
//                         ? "text-primary bg-primary/10 font-semibold" 
//                         : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
//                     }`}
//                   >
//                     {link.label}
//                   </Link>
//                 )
//               )}
//               <Link
//                 to="/booking"
//                 onClick={() => setOpen(false)}
//                 className="block text-center mt-4 px-6 py-3 text-sm font-semibold bg-gradient-to-r from-primary to-electric-blue-dark text-primary-foreground rounded-xl hover:shadow-xl hover:shadow-primary/30 transition-all ripple"
//               >
//                 Book Now
//               </Link>
//             </div>
//           </motion.div>
//         )}
//       </AnimatePresence>
//     </nav>
//   );
// };

// export default Navbar;

import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Zap, ChevronDown, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ThemeToggle from "@/components/ThemeToggle";

const navLinks = [
  { label: "Home", to: "/" },
  { label: "About", to: "/about" },
  { label: "Services", to: "/services" },
  { label: "Projects", to: "/projects" },
  {
    label: "Pages",
    children: [
      { label: "FAQs", to: "/faq" },
      { label: "Privacy Policy", to: "/privacy" },
      { label: "Terms & Conditions", to: "/terms" },
    ],
  },
  { label: "Contact", to: "/contact" },
];

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [pagesOpen, setPagesOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

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
          background: rgba(7, 13, 28, 0.92);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(255, 200, 0, 0.12);
          box-shadow: 0 4px 32px rgba(0, 0, 0, 0.4);
        }

        .navbar-root.top {
          background: rgba(5, 11, 24, 0.6);
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
          background: linear-gradient(135deg, #ffc800, #ff8c00);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 0 20px rgba(255, 200, 0, 0.35);
          transition: all 0.3s ease;
          flex-shrink: 0;
        }

        .nav-logo:hover .logo-icon {
          box-shadow: 0 0 32px rgba(255, 200, 0, 0.55);
          transform: scale(1.06);
        }

        .logo-text {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 24px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: #f0f4ff;
          line-height: 1;
        }

        .logo-text span {
          background: linear-gradient(135deg, #ffc800, #ffec6e);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
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
          color: rgba(180, 200, 240, 0.65);
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
          background: #ffc800;
          border-radius: 1px;
          transition: width 0.3s ease;
        }

        .nav-link:hover {
          color: #f0f4ff;
          background: rgba(255, 200, 0, 0.06);
        }

        .nav-link:hover::after { width: 60%; }

        .nav-link.active {
          color: #ffc800;
          background: rgba(255, 200, 0, 0.08);
          font-weight: 600;
        }

        .nav-link.active::after { width: 60%; }

        /* Dropdown trigger */
        .nav-dropdown-trigger {
          display: flex;
          align-items: center;
          gap: 5px;
          padding: 8px 14px;
          font-size: 13.5px;
          font-weight: 500;
          color: rgba(180, 200, 240, 0.65);
          border-radius: 10px;
          background: transparent;
          border: none;
          cursor: pointer;
          transition: all 0.25s ease;
          font-family: 'DM Sans', sans-serif;
          letter-spacing: 0.2px;
        }

        .nav-dropdown-trigger:hover {
          color: #f0f4ff;
          background: rgba(255, 200, 0, 0.06);
        }

        .trigger-chevron {
          transition: transform 0.3s ease;
        }

        .trigger-chevron.open { transform: rotate(180deg); }

        /* Dropdown menu */
        .dropdown-menu {
          position: absolute;
          top: calc(100% + 10px);
          left: 0;
          width: 220px;
          background: #0d1428;
          border: 1px solid rgba(255, 200, 0, 0.18);
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255,200,0,0.06);
        }

        .dropdown-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 13px 18px;
          font-size: 13.5px;
          font-weight: 500;
          color: rgba(180, 200, 240, 0.65);
          text-decoration: none;
          transition: all 0.22s ease;
          border-bottom: 1px solid rgba(255,200,0,0.06);
          font-family: 'DM Sans', sans-serif;
        }

        .dropdown-item:last-child { border-bottom: none; }

        .dropdown-item:hover {
          background: rgba(255, 200, 0, 0.06);
          color: #ffc800;
          padding-left: 22px;
        }

        .dropdown-arrow {
          opacity: 0;
          transform: translateX(-4px);
          transition: all 0.22s ease;
          color: #ffc800;
        }

        .dropdown-item:hover .dropdown-arrow {
          opacity: 1;
          transform: translateX(0);
        }

        /* Book Now CTA */
        .book-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          margin-left: 10px;
          padding: 10px 22px;
          background: linear-gradient(135deg, #ffc800, #ffaa00);
          color: #0a0f1e;
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

        .book-btn::before {
          content: '';
          position: absolute;
          inset: 0;
          background: rgba(255,255,255,0);
          transition: background 0.3s;
        }

        .book-btn:hover {
          box-shadow: 0 0 24px rgba(255, 200, 0, 0.45), 0 6px 18px rgba(255, 160, 0, 0.3);
          transform: translateY(-2px);
        }

        .book-btn:hover::before { background: rgba(255,255,255,0.08); }

        /* Mobile controls */
        .mobile-controls {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        @media (min-width: 768px) { .mobile-controls { display: none; } }

        .hamburger-btn {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          border: 1px solid rgba(255,200,0,0.2);
          background: rgba(255,200,0,0.05);
          display: flex;
          align-items: center;
          justify-content: center;
          color: rgba(255,200,0,0.8);
          cursor: pointer;
          transition: all 0.25s ease;
        }

        .hamburger-btn:hover {
          background: rgba(255,200,0,0.12);
          border-color: rgba(255,200,0,0.4);
          color: #ffc800;
        }

        /* Mobile menu */
        .mobile-menu {
          background: #080f20;
          border-top: 1px solid rgba(255,200,0,0.1);
          overflow: hidden;
        }

        @media (min-width: 768px) { .mobile-menu { display: none; } }

        .mobile-menu-inner {
          padding: 16px 20px 24px;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .mobile-link {
          display: block;
          padding: 12px 16px;
          font-size: 14px;
          font-weight: 500;
          color: rgba(180,200,240,0.65);
          border-radius: 10px;
          text-decoration: none;
          transition: all 0.22s ease;
          font-family: 'DM Sans', sans-serif;
          border: 1px solid transparent;
        }

        .mobile-link:hover, .mobile-link.active {
          background: rgba(255,200,0,0.06);
          border-color: rgba(255,200,0,0.15);
          color: #ffc800;
          padding-left: 20px;
        }

        .mobile-trigger {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          padding: 12px 16px;
          font-size: 14px;
          font-weight: 500;
          color: rgba(180,200,240,0.65);
          border-radius: 10px;
          background: transparent;
          border: 1px solid transparent;
          cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          transition: all 0.22s;
        }

        .mobile-trigger:hover {
          background: rgba(255,200,0,0.04);
          border-color: rgba(255,200,0,0.1);
          color: #f0f4ff;
        }

        .mobile-sub-link {
          display: block;
          padding: 10px 16px 10px 28px;
          font-size: 13px;
          color: rgba(180,200,240,0.5);
          text-decoration: none;
          border-radius: 8px;
          transition: all 0.22s;
          font-family: 'DM Sans', sans-serif;
          position: relative;
        }

        .mobile-sub-link::before {
          content: '⚡';
          position: absolute;
          left: 12px;
          font-size: 9px;
          top: 50%;
          transform: translateY(-50%);
          opacity: 0.4;
        }

        .mobile-sub-link:hover { color: #ffc800; background: rgba(255,200,0,0.05); }

        .mobile-divider {
          height: 1px;
          background: linear-gradient(90deg, rgba(255,200,0,0.15), transparent);
          margin: 4px 0;
        }

        .mobile-book-btn {
          display: block;
          text-align: center;
          margin-top: 8px;
          padding: 14px;
          background: linear-gradient(135deg, #ffc800, #ffaa00);
          color: #0a0f1e;
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 16px;
          font-weight: 800;
          letter-spacing: 0.8px;
          text-transform: uppercase;
          border-radius: 12px;
          text-decoration: none;
          box-shadow: 0 0 20px rgba(255,200,0,0.25);
        }
      `}</style>

      <nav className={`navbar-root ${scrolled ? "scrolled" : "top"}`}>
        <div className="nav-inner">
          {/* Logo */}
          <Link to="/" className="nav-logo">
            <div className="logo-icon">
              <Zap size={20} color="#0a0f1e" strokeWidth={2.5} />
            </div>
            <span className="logo-text">Electro<span>o</span>buddy</span>
          </Link>

          {/* Desktop nav */}
          <div className="desktop-nav">
            {navLinks.map((link) =>
              link.children ? (
                <div
                  key={link.label}
                  style={{ position: "relative" }}
                  onMouseEnter={() => setPagesOpen(true)}
                  onMouseLeave={() => setPagesOpen(false)}
                >
                  <button className="nav-dropdown-trigger">
                    {link.label}
                    <ChevronDown size={14} className={`trigger-chevron ${pagesOpen ? "open" : ""}`} />
                  </button>
                  <AnimatePresence>
                    {pagesOpen && (
                      <motion.div
                        className="dropdown-menu"
                        initial={{ opacity: 0, y: 10, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.96 }}
                        transition={{ duration: 0.18 }}
                      >
                        {link.children.map((child) => (
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
                <Link
                  key={link.to}
                  to={link.to!}
                  className={`nav-link ${isActive(link.to!) ? "active" : ""}`}
                >
                  {link.label}
                </Link>
              )
            )}

            <div style={{ marginLeft: 4 }}>
              <ThemeToggle />
            </div>

            <Link to="/booking" className="book-btn">
              <Zap size={13} />
              Book Now
            </Link>
          </div>

          {/* Mobile controls */}
          <div className="mobile-controls">
            <ThemeToggle />
            <button className="hamburger-btn" onClick={() => setOpen(!open)}>
              {open ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {open && (
            <motion.div
              className="mobile-menu"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
            >
              <div className="mobile-menu-inner">
                {navLinks.map((link) =>
                  link.children ? (
                    <div key={link.label}>
                      <button
                        className="mobile-trigger"
                        onClick={() => setPagesOpen(!pagesOpen)}
                      >
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
                            style={{ overflow: "hidden" }}
                          >
                            {link.children.map((child) => (
                              <Link
                                key={child.to}
                                to={child.to}
                                className="mobile-sub-link"
                                onClick={() => { setOpen(false); setPagesOpen(false); }}
                              >
                                {child.label}
                              </Link>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                      <div className="mobile-divider" />
                    </div>
                  ) : (
                    <Link
                      key={link.to}
                      to={link.to!}
                      className={`mobile-link ${isActive(link.to!) ? "active" : ""}`}
                      onClick={() => setOpen(false)}
                    >
                      {link.label}
                    </Link>
                  )
                )}
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