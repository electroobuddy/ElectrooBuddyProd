import React, { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import PageTransition from "@/components/PageTransition";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/hooks/useAuth";
import { CartProvider } from "@/contexts/CartContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import { BookingModal } from "./pages/Index"; // Named export
import Index from "./pages/Index";
import About from "./pages/About";
import Services from "./pages/Services";
import Projects from "./pages/Projects";
import Contact from "./pages/Contact";
import BookingForm from "./pages/BookingForm";
import FAQ from "./pages/FAQ";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import NotFound from "./pages/NotFound";
import Products from "./pages/Products";
import ProductDetails from "./pages/ProductDetails";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import OrderSuccess from "./pages/OrderSuccess";
import OrderTracking from "./pages/OrderTracking";
import UserAuth from "./pages/user/UserAuth";
import UserLayout from "./pages/user/UserLayout";
import UserDashboard from "./pages/user/UserDashboard";
import UserBookings from "./pages/user/UserBookings";
import UserProfile from "./pages/user/UserProfile";
import UserOrders from "./pages/user/UserOrders";
import UserProducts from "./pages/user/UserProducts";
import UserServices from "./pages/user/UserServices";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminServices from "./pages/admin/AdminServices";
import AdminBookings from "./pages/admin/AdminBookings";
import AdminTeam from "./pages/admin/AdminTeam";
import AdminTestimonials from "./pages/admin/AdminTestimonials";
import AdminProjects from "./pages/admin/AdminProjects";
import AdminMessages from "./pages/admin/AdminMessages";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminPayments from "./pages/admin/AdminPayments";
import AdminShippingSettings from "./pages/admin/AdminShippingSettings";

const queryClient = new QueryClient();

const AppContent = () => {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith("/admin");
  const isUserPanel = location.pathname.startsWith("/dashboard") || location.pathname === "/login";
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const timer = setTimeout(() => setShowBookingModal(true), 1200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {!isAdmin && !isUserPanel && <Navbar />}
      <main className={isAdmin || isUserPanel ? "" : "min-h-screen"}>
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<PageTransition><Index /></PageTransition>} />
            <Route path="/about" element={<PageTransition><About /></PageTransition>} />
            <Route path="/services" element={<PageTransition><Services /></PageTransition>} />
            <Route path="/projects" element={<PageTransition><Projects /></PageTransition>} />
            <Route path="/contact" element={<PageTransition><Contact /></PageTransition>} />
            <Route path="/booking" element={<PageTransition><BookingForm /></PageTransition>} />
            <Route path="/faq" element={<PageTransition><FAQ /></PageTransition>} />
            <Route path="/privacy" element={<PageTransition><Privacy /></PageTransition>} />
            <Route path="/terms" element={<PageTransition><Terms /></PageTransition>} />
            <Route path="/products" element={<PageTransition><Products /></PageTransition>} />
            <Route path="/products/:slug" element={<PageTransition><ProductDetails /></PageTransition>} />
            <Route path="/cart" element={<PageTransition><Cart /></PageTransition>} />
            <Route path="/checkout" element={<PageTransition><Checkout /></PageTransition>} />
            <Route path="/order-success" element={<PageTransition><OrderSuccess /></PageTransition>} />
            <Route path="/track-order/:orderNumber" element={<PageTransition><OrderTracking /></PageTransition>} />
            <Route path="/login" element={<PageTransition><UserAuth /></PageTransition>} />
            <Route element={<UserLayout />}>
              <Route path="/dashboard" element={<UserDashboard />} />
              <Route path="/dashboard/bookings" element={<UserBookings />} />
              <Route path="/dashboard/orders" element={<UserOrders />} />
              <Route path="/dashboard/products" element={<UserProducts />} />
              <Route path="/dashboard/services" element={<UserServices />} />
              <Route path="/dashboard/profile" element={<UserProfile />} />
            </Route>

            {/* Admin routes - hidden, no public links */}
            <Route path="/admin" element={<AdminLogin />} />
            <Route element={<AdminLayout />}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/products" element={<AdminProducts />} />
              <Route path="/admin/orders" element={<AdminOrders />} />
              <Route path="/admin/services" element={<AdminServices />} />
              <Route path="/admin/bookings" element={<AdminBookings />} />
              <Route path="/admin/team" element={<AdminTeam />} />
              <Route path="/admin/testimonials" element={<AdminTestimonials />} />
              <Route path="/admin/projects" element={<AdminProjects />} />
              <Route path="/admin/messages" element={<AdminMessages />} />
              <Route path="/admin/users" element={<AdminUsers />} />
              <Route path="/admin/payments" element={<AdminPayments />} />
              <Route path="/admin/shipping" element={<AdminShippingSettings />} />
              <Route path="/admin/settings" element={<AdminSettings />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </AnimatePresence>
      </main>
      {!isAdmin && !isUserPanel && <Footer />}
      {!isAdmin && !isUserPanel && <WhatsAppFloat />}
      
      {/* Global Booking Modal - appears on all public pages */}
      {mounted && !isAdmin && !isUserPanel && (
        <AnimatePresence>
          {showBookingModal && (
            <BookingModal onClose={() => setShowBookingModal(false)} />
          )}
        </AnimatePresence>
      )}
    </>
  );
};

const App = () => (
  <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <CartProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <AppContent />
            </BrowserRouter>
          </CartProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
