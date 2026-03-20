import { Navigate, Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useState, useEffect, useRef, useCallback } from "react";
import {
  Zap, LayoutDashboard, Wrench, CalendarDays, Users, Star, FolderOpen,
  Mail, Settings, LogOut, Loader2, UserCog, Menu, X, Package,
  ShoppingCart, DollarSign, Truck, AlertTriangle, ChevronRight
} from "lucide-react";
import { toast } from "sonner";

const ADMIN_SESSION_TIMEOUT = 30 * 60 * 1000;

const navItems = [
  { label: "Dashboard",    to: "/admin/dashboard",    icon: LayoutDashboard, group: "main" },
  { label: "Products",     to: "/admin/products",     icon: Package,         group: "store" },
  { label: "Orders",       to: "/admin/orders",       icon: ShoppingCart,    group: "store" },
  { label: "Payments",     to: "/admin/payments",     icon: DollarSign,      group: "store" },
  { label: "Shipping",     to: "/admin/shipping",     icon: Truck,           group: "store" },
  { label: "Services",     to: "/admin/services",     icon: Wrench,          group: "services" },
  { label: "Bookings",     to: "/admin/bookings",     icon: CalendarDays,    group: "services" },
  { label: "Users",        to: "/admin/users",        icon: UserCog,         group: "people" },
  { label: "Team",         to: "/admin/team",         icon: Users,           group: "people" },
  { label: "Testimonials", to: "/admin/testimonials", icon: Star,            group: "content" },
  { label: "Projects",     to: "/admin/projects",     icon: FolderOpen,      group: "content" },
  { label: "Messages",     to: "/admin/messages",     icon: Mail,            group: "content" },
  { label: "Settings",     to: "/admin/settings",     icon: Settings,        group: "system" },
];

const groups = [
  { key: "main",     label: null },
  { key: "store",    label: "Store" },
  { key: "services", label: "Services" },
  { key: "people",   label: "People" },
  { key: "content",  label: "Content" },
  { key: "system",   label: "System" },
];

const AdminLayout = () => {
  const { user, isAdmin, loading, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showTimeoutWarning, setShowTimeoutWarning] = useState(false);
  const lastActivityTime = useRef(Date.now());
  const warningTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const signOutTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const resetTimeouts = useCallback(() => {
    if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);
    if (signOutTimeoutRef.current) clearTimeout(signOutTimeoutRef.current);
    setShowTimeoutWarning(false);
    warningTimeoutRef.current = setTimeout(() => {
      setShowTimeoutWarning(true);
      toast.warning("Session expiring soon", {
        description: "Your admin session will expire in 5 minutes due to inactivity.",
        duration: 10000,
      });
    }, ADMIN_SESSION_TIMEOUT - 5 * 60 * 1000);
    signOutTimeoutRef.current = setTimeout(() => {
      handleAutoSignOut();
    }, ADMIN_SESSION_TIMEOUT);
  }, []);

  useEffect(() => {
    if (!user || !isAdmin) return;
    const updateActivity = () => { lastActivityTime.current = Date.now(); resetTimeouts(); };
    const events = ["mousedown", "keydown", "scroll", "touchstart"];
    events.forEach(e => document.addEventListener(e, updateActivity));
    resetTimeouts();
    return () => {
      events.forEach(e => document.removeEventListener(e, updateActivity));
      if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);
      if (signOutTimeoutRef.current) clearTimeout(signOutTimeoutRef.current);
    };
  }, [user, isAdmin, resetTimeouts]);

  const handleAutoSignOut = async () => {
    await signOut();
    toast.info("Session expired", { description: "You have been automatically signed out due to inactivity." });
    navigate("/admin");
  };

  const handleStaySignedIn = () => {
    lastActivityTime.current = Date.now();
    resetTimeouts();
    setShowTimeoutWarning(false);
  };

  const currentPage = navItems.find(n => n.to === location.pathname)?.label || "Admin";

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center">
          <Zap className="w-5 h-5 text-white" />
        </div>
        <Loader2 className="w-5 h-5 animate-spin text-zinc-400" />
      </div>
    </div>
  );

  if (!user || !isAdmin) return <Navigate to="/admin" replace />;

  return (
    <div className="flex h-screen overflow-hidden bg-zinc-50 dark:bg-zinc-950">

      {/* ── Session Timeout Warning ── */}
      {showTimeoutWarning && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 max-w-sm w-full shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-800 flex items-center justify-center mb-4">
              <AlertTriangle className="w-6 h-6 text-yellow-500" />
            </div>
            <h2 className="text-lg font-bold text-zinc-900 dark:text-white mb-2">Session expiring soon</h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-5">
              Your admin session will expire in a few minutes due to inactivity.
            </p>
            <div className="flex gap-3">
              <button onClick={handleStaySignedIn}
                className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl transition-colors">
                Stay Signed In
              </button>
              <button onClick={async () => { await signOut(); navigate("/admin"); }}
                className="flex-1 py-2.5 border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 font-semibold text-sm rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Desktop Sidebar ── */}
      <aside className="hidden md:flex w-56 flex-col flex-shrink-0 bg-zinc-900 dark:bg-zinc-950 border-r border-zinc-800 h-screen overflow-hidden">

        {/* Logo */}
        <div className="flex items-center gap-2.5 px-4 py-4 flex-shrink-0 border-b border-zinc-800">
          <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-500/20">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-white leading-none">Admin Panel</p>
            <p className="text-xs text-zinc-500 mt-0.5">Management</p>
          </div>
        </div>

        {/* Nav — scrollable, fixed height */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden py-3 min-h-0
          [&::-webkit-scrollbar]:w-1
          [&::-webkit-scrollbar-track]:bg-transparent
          [&::-webkit-scrollbar-thumb]:bg-zinc-700
          [&::-webkit-scrollbar-thumb]:rounded-full">
          {groups.map(({ key, label }) => {
            const items = navItems.filter(n => n.group === key);
            if (items.length === 0) return null;
            return (
              <div key={key} className="mb-1">
                {label && (
                  <p className="px-4 pt-3 pb-1 text-[10px] font-semibold text-zinc-500 uppercase tracking-widest">
                    {label}
                  </p>
                )}
                {items.map(item => {
                  const active = location.pathname === item.to;
                  return (
                    <Link key={item.to} to={item.to}
                      className={`flex items-center gap-2.5 mx-2 px-3 py-2 rounded-xl text-sm font-medium transition-all group relative ${
                        active
                          ? "bg-blue-600 text-white shadow-sm shadow-blue-500/20"
                          : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800"
                      }`}>
                      <item.icon className={`w-4 h-4 flex-shrink-0 ${active ? "text-white" : "text-zinc-500 group-hover:text-zinc-300"}`} />
                      <span className="truncate">{item.label}</span>
                      {active && <ChevronRight className="w-3 h-3 ml-auto flex-shrink-0 opacity-70" />}
                    </Link>
                  );
                })}
              </div>
            );
          })}
        </nav>

        {/* Sign out — always visible at bottom */}
        <div className="flex-shrink-0 px-2 py-3 border-t border-zinc-800">
          <button onClick={signOut}
            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-all w-full group">
            <LogOut className="w-4 h-4 flex-shrink-0 text-zinc-500 group-hover:text-zinc-300" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* ── Mobile header ── */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 h-14 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between px-4">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-xl bg-blue-600 flex items-center justify-center">
            <Zap className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="text-sm font-bold text-white">{currentPage}</span>
        </div>
        <button onClick={() => setMobileOpen(!mobileOpen)}
          className="w-8 h-8 flex items-center justify-center rounded-xl bg-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-700 transition-colors">
          {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </button>
      </div>

      {/* ── Mobile slide-over menu ── */}
      {mobileOpen && (
        <>
          <div className="md:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)} />
          <div className="md:hidden fixed top-14 left-0 bottom-0 z-50 w-64 bg-zinc-900 border-r border-zinc-800 flex flex-col overflow-hidden">
            <nav className="flex-1 overflow-y-auto py-3 min-h-0">
              {groups.map(({ key, label }) => {
                const items = navItems.filter(n => n.group === key);
                if (items.length === 0) return null;
                return (
                  <div key={key} className="mb-1">
                    {label && (
                      <p className="px-4 pt-3 pb-1 text-[10px] font-semibold text-zinc-500 uppercase tracking-widest">{label}</p>
                    )}
                    {items.map(item => {
                      const active = location.pathname === item.to;
                      return (
                        <Link key={item.to} to={item.to}
                          onClick={() => setMobileOpen(false)}
                          className={`flex items-center gap-2.5 mx-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                            active ? "bg-blue-600 text-white" : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800"
                          }`}>
                          <item.icon className={`w-4 h-4 flex-shrink-0 ${active ? "text-white" : "text-zinc-500"}`} />
                          {item.label}
                        </Link>
                      );
                    })}
                  </div>
                );
              })}
            </nav>
            <div className="flex-shrink-0 px-2 py-3 border-t border-zinc-800">
              <button onClick={() => { signOut(); setMobileOpen(false); }}
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-all w-full">
                <LogOut className="w-4 h-4 flex-shrink-0 text-zinc-500" /> Sign Out
              </button>
            </div>
          </div>
        </>
      )}

      {/* ── Mobile bottom tab bar ── */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-zinc-900 border-t border-zinc-800 flex justify-around items-center px-1 py-1.5 safe-area-bottom">
        {[
          { label: "Dash",     to: "/admin/dashboard",  icon: LayoutDashboard },
          { label: "Products", to: "/admin/products",   icon: Package },
          { label: "Orders",   to: "/admin/orders",     icon: ShoppingCart },
          { label: "Bookings", to: "/admin/bookings",   icon: CalendarDays },
          { label: "More",     to: "#more",             icon: Menu, isMore: true },
        ].map((item: any) => {
          const active = location.pathname === item.to;
          if (item.isMore) {
            return (
              <button key="more" onClick={() => setMobileOpen(true)}
                className="flex flex-col items-center gap-0.5 px-3 py-1 text-zinc-500 hover:text-zinc-200 transition-colors">
                <item.icon className="w-5 h-5" />
                <span className="text-[10px] font-medium">More</span>
              </button>
            );
          }
          return (
            <Link key={item.to} to={item.to}
              className={`flex flex-col items-center gap-0.5 px-3 py-1 transition-colors ${active ? "text-blue-400" : "text-zinc-500 hover:text-zinc-200"}`}>
              <item.icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>

      {/* ── Main content ── */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden min-w-0
        pt-14 pb-16 md:pt-0 md:pb-0
        [&::-webkit-scrollbar]:w-1.5
        [&::-webkit-scrollbar-track]:bg-transparent
        [&::-webkit-scrollbar-thumb]:bg-zinc-200
        dark:[&::-webkit-scrollbar-thumb]:bg-zinc-700
        [&::-webkit-scrollbar-thumb]:rounded-full">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;