import React, { useState, useEffect, Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { HelmetProvider } from 'react-helmet-async';
import PageTransition from "@/components/PageTransition";
import { ThemeProvider } from "next-themes";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { CartProvider } from "@/contexts/CartContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import BookingModal from "@/components/BookingModal";
import PushNotificationPrompt from "@/components/PushNotificationPrompt";
import ErrorBoundary from "@/components/ErrorBoundary";
import AsyncErrorBoundary from "@/components/AsyncErrorBoundary";
import { initOneSignal } from "./utils/oneSignalUtils";

// Lazy load heavy components
const Index = lazy(() => import("./pages/Index"));
const About = lazy(() => import("./pages/About"));
const Services = lazy(() => import("./pages/Services"));
const Projects = lazy(() => import("./pages/Projects"));
const Contact = lazy(() => import("./pages/Contact"));
const BookingForm = lazy(() => import("./pages/BookingForm"));
const BookingTracking = lazy(() => import("./pages/BookingTracking"));
const Review = lazy(() => import("./pages/Review"));
const FAQ = lazy(() => import("./pages/FAQ"));
const Privacy = lazy(() => import("./pages/Privacy"));
const Terms = lazy(() => import("./pages/Terms"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Products = lazy(() => import("./pages/Products"));
const ProductDetails = lazy(() => import("./pages/ProductDetails"));
const Cart = lazy(() => import("./pages/Cart"));
const Checkout = lazy(() => import("./pages/Checkout"));
const OrderSuccess = lazy(() => import("./pages/OrderSuccess"));
const OrderTracking = lazy(() => import("./pages/OrderTracking"));
const Tips = lazy(() => import("./pages/Tips"));
const UserAuth = lazy(() => import("./pages/user/UserAuth"));
const UserLayout = lazy(() => import("./pages/user/UserLayout"));
const UserDashboard = lazy(() => import("./pages/user/UserDashboard"));
const UserBookings = lazy(() => import("./pages/user/UserBookings"));
const UserProfile = lazy(() => import("./pages/user/UserProfile"));
const UserOrders = lazy(() => import("./pages/user/UserOrders"));
const UserSubscriptions = lazy(() => import("./pages/user/UserSubscriptions"));
const UserProducts = lazy(() => import("./pages/user/UserProducts"));
const UserServices = lazy(() => import("./pages/user/UserServices"));
const AdminLogin = lazy(() => import("./pages/admin/AdminLogin"));
const AdminLayout = lazy(() => import("./pages/admin/AdminLayout"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminServices = lazy(() => import("./pages/admin/AdminServices"));
const AdminBookings = lazy(() => import("./pages/admin/AdminBookings"));
const AdminTeam = lazy(() => import("./pages/admin/AdminTeam"));
const AdminTestimonials = lazy(() => import("./pages/admin/AdminTestimonials"));
const AdminProjects = lazy(() => import("./pages/admin/AdminProjects"));
const AdminMessages = lazy(() => import("./pages/admin/AdminMessages"));
const AdminSettings = lazy(() => import("./pages/admin/AdminSettings"));
const AdminUsers = lazy(() => import("./pages/admin/AdminUsers"));
const AdminProducts = lazy(() => import("@/pages/admin/AdminProducts"));
const AdminCouponsCategories = lazy(() => import("@/pages/admin/AdminCouponsCategories"));
const AdminOrders = lazy(() => import("@/pages/admin/AdminOrders"));
const AdminPayments = lazy(() => import("./pages/admin/AdminPayments"));
const AdminShippingSettings = lazy(() => import("./pages/admin/AdminShippingSettings"));
const AdminTechnicians = lazy(() => import("./pages/admin/AdminTechnicians"));
const AdminOffers = lazy(() => import("./pages/admin/AdminOffers"));
const AdminNotifications = lazy(() => import("./pages/admin/AdminNotifications"));
const TechnicianLogin = lazy(() => import("./pages/technician/TechnicianLogin"));
const TechnicianLayout = lazy(() => import("./pages/technician/TechnicianLayout"));
const TechnicianDashboard = lazy(() => import("./pages/technician/TechnicianDashboard"));
const TechnicianBookings = lazy(() => import("./pages/technician/TechnicianBookings"));
const TechnicianProfile = lazy(() => import("./pages/technician/TechnicianProfile"));
const TechnicianSettings = lazy(() => import("./pages/technician/TechnicianSettings"));
const TechnicianSignUp = lazy(() => import("./pages/technician/TechnicianSignUp"));
const Subscriptions = lazy(() => import("@/components/Subscriptions"));
const AdminSubscriptions = lazy(() => import("@/components/AdminSubscriptions"));
const SubscriptionSuccess = lazy(() => import("./pages/SubscriptionSuccess"));
const TestFCMNotifications = lazy(() => import("./pages/TestFCMNotifications"));
const TestOneSignalNotifications = lazy(() => import("./pages/TestOneSignalNotifications"));

const queryClient = new QueryClient();

const AppContent = () => {
  const location = useLocation();
  const { user } = useAuth();
  const isAdmin = location.pathname.startsWith("/admin");
  const isUserPanel = location.pathname.startsWith("/dashboard") || location.pathname === "/login";
  const isTechnicianPanel = location.pathname.startsWith("/technician") && !location.pathname.startsWith("/technician/login") && !location.pathname.startsWith("/technician/signup");
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [hasShownInSession, setHasShownInSession] = useState(false);
  const [shouldCheckModal, setShouldCheckModal] = useState(true);

  useEffect(() => {
    setMounted(true);
  }, []);
 useEffect(() => {
    // ── OneSignal: initialize once on app load ──
    // Must run client-side only (typeof window check is inside initOneSignal)
    initOneSignal();
  }, []);
  useEffect(() => {
    if (!mounted || !shouldCheckModal) return;
    
    // Check if modal should be shown based on localStorage with 30-minute expiry
    const showModalConfig = localStorage.getItem('bookingModalConfig');
    const now = Date.now();
    
    // Don't show if already shown in this session
    if (hasShownInSession) {
      setShouldCheckModal(false);
      return;
    }
    
    if (!showModalConfig) {
      // First time ever - show modal after delay
      const timer = setTimeout(() => {
        setShowBookingModal(true);
        setHasShownInSession(true);
        setShouldCheckModal(false);
      }, 1200);
      return () => clearTimeout(timer);
    } else {
      try {
        const { dismissedAt, expiresAt } = JSON.parse(showModalConfig);
        // Check if expired (30 minutes = 1800000 ms)
        if (now > expiresAt) {
          // Expired - show modal again
          localStorage.removeItem('bookingModalConfig');
          const timer = setTimeout(() => {
            setShowBookingModal(true);
            setHasShownInSession(true);
            setShouldCheckModal(false);
          }, 1200);
          return () => clearTimeout(timer);
        }
        // Not expired - don't show (user dismissed within 30 min)
        setShouldCheckModal(false);
      } catch {
        // Invalid data - show modal
        const timer = setTimeout(() => {
          setShowBookingModal(true);
          setHasShownInSession(true);
          setShouldCheckModal(false);
        }, 1200);
        return () => clearTimeout(timer);
      }
    }
  }, [mounted, hasShownInSession, shouldCheckModal]);

  return (
    <>
      {!isAdmin && !isUserPanel && !isTechnicianPanel && <Navbar />}
      <main className={isAdmin || isUserPanel || isTechnicianPanel ? "" : "min-h-screen"}>
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<PageTransition><Suspense fallback={<div>Loading...</div>}><AsyncErrorBoundary><Index /></AsyncErrorBoundary></Suspense></PageTransition>} />
            <Route path="/about" element={<PageTransition><Suspense fallback={<div>Loading...</div>}><AsyncErrorBoundary><About /></AsyncErrorBoundary></Suspense></PageTransition>} />
            <Route path="/services" element={<PageTransition><Suspense fallback={<div>Loading...</div>}><AsyncErrorBoundary><Services /></AsyncErrorBoundary></Suspense></PageTransition>} />
            <Route path="/projects" element={<PageTransition><Suspense fallback={<div>Loading...</div>}><AsyncErrorBoundary><Projects /></AsyncErrorBoundary></Suspense></PageTransition>} />
            <Route path="/contact" element={<PageTransition><Suspense fallback={<div>Loading...</div>}><AsyncErrorBoundary><Contact /></AsyncErrorBoundary></Suspense></PageTransition>} />
            <Route path="/booking" element={<PageTransition><Suspense fallback={<div>Loading...</div>}><AsyncErrorBoundary><BookingForm /></AsyncErrorBoundary></Suspense></PageTransition>} />
            <Route path="/track-booking" element={<PageTransition><Suspense fallback={<div>Loading...</div>}><AsyncErrorBoundary><BookingTracking /></AsyncErrorBoundary></Suspense></PageTransition>} />
            <Route path="/review" element={<PageTransition><Suspense fallback={<div>Loading...</div>}><AsyncErrorBoundary><Review /></AsyncErrorBoundary></Suspense></PageTransition>} />
            <Route path="/faq" element={<PageTransition><Suspense fallback={<div>Loading...</div>}><AsyncErrorBoundary><FAQ /></AsyncErrorBoundary></Suspense></PageTransition>} />
            <Route path="/tips" element={<PageTransition><Suspense fallback={<div>Loading...</div>}><AsyncErrorBoundary><Tips /></AsyncErrorBoundary></Suspense></PageTransition>} />
            <Route path="/privacy" element={<PageTransition><Suspense fallback={<div>Loading...</div>}><AsyncErrorBoundary><Privacy /></AsyncErrorBoundary></Suspense></PageTransition>} />
            <Route path="/subscriptions" element={<PageTransition><Suspense fallback={<div>Loading...</div>}><AsyncErrorBoundary><Subscriptions /></AsyncErrorBoundary></Suspense></PageTransition>} />
            <Route path="/subscription-success" element={<PageTransition><Suspense fallback={<div>Loading...</div>}><AsyncErrorBoundary><SubscriptionSuccess /></AsyncErrorBoundary></Suspense></PageTransition>} />
            <Route path="/test-fcm" element={<PageTransition><Suspense fallback={<div>Loading...</div>}><AsyncErrorBoundary><TestFCMNotifications /></AsyncErrorBoundary></Suspense></PageTransition>} />
            <Route path="/test-onesignal" element={<PageTransition><Suspense fallback={<div>Loading...</div>}><AsyncErrorBoundary><TestOneSignalNotifications /></AsyncErrorBoundary></Suspense></PageTransition>} />
            <Route path="/terms" element={<PageTransition><Suspense fallback={<div>Loading...</div>}><AsyncErrorBoundary><Terms /></AsyncErrorBoundary></Suspense></PageTransition>} />
            <Route path="/products" element={<PageTransition><Suspense fallback={<div>Loading...</div>}><AsyncErrorBoundary><Products /></AsyncErrorBoundary></Suspense></PageTransition>} />
            <Route path="/products/:slug" element={<PageTransition><Suspense fallback={<div>Loading...</div>}><AsyncErrorBoundary><ProductDetails /></AsyncErrorBoundary></Suspense></PageTransition>} />
            <Route path="/cart" element={<PageTransition><Suspense fallback={<div>Loading...</div>}><AsyncErrorBoundary><Cart /></AsyncErrorBoundary></Suspense></PageTransition>} />
            <Route path="/checkout" element={<PageTransition><Suspense fallback={<div>Loading...</div>}><AsyncErrorBoundary><Checkout /></AsyncErrorBoundary></Suspense></PageTransition>} />
            <Route path="/order-success" element={<PageTransition><Suspense fallback={<div>Loading...</div>}><AsyncErrorBoundary><OrderSuccess /></AsyncErrorBoundary></Suspense></PageTransition>} />
            <Route path="/track-order/:orderNumber" element={<PageTransition><Suspense fallback={<div>Loading...</div>}><AsyncErrorBoundary><OrderTracking /></AsyncErrorBoundary></Suspense></PageTransition>} />
            <Route path="/login" element={<PageTransition><Suspense fallback={<div>Loading...</div>}><AsyncErrorBoundary><UserAuth /></AsyncErrorBoundary></Suspense></PageTransition>} />
            <Route element={<Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full" />Loading...</div>}><UserLayout /></Suspense>}>
              <Route path="/dashboard" element={<UserDashboard />} />
              <Route path="/dashboard/bookings" element={<UserBookings />} />
              <Route path="/dashboard/orders" element={<UserOrders />} />
              <Route path="/dashboard/subscriptions" element={<UserSubscriptions />} />
              <Route path="/dashboard/products" element={<UserProducts />} />
              <Route path="/dashboard/services" element={<UserServices />} />
              <Route path="/dashboard/profile" element={<UserProfile />} />
            </Route>

            {/* Admin routes - hidden, no public links */}
            <Route path="/admin" element={<Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full" />Loading...</div>}><AdminLogin /></Suspense>} />
            <Route element={<Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full" />Loading...</div>}><AdminLayout /></Suspense>}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/products" element={<AdminProducts />} />
              <Route path="/admin/coupons-categories" element={<AdminCouponsCategories />} />
              <Route path="/admin/offers" element={<AdminOffers />} />
              <Route path="/admin/orders" element={<AdminOrders />} />
              <Route path="/admin/services" element={<AdminServices />} />
              <Route path="/admin/bookings" element={<AdminBookings />} />
              <Route path="/admin/technicians" element={<AdminTechnicians />} />
              <Route path="/admin/team" element={<AdminTeam />} />
              <Route path="/admin/testimonials" element={<AdminTestimonials />} />
              <Route path="/admin/projects" element={<AdminProjects />} />
              <Route path="/admin/messages" element={<AdminMessages />} />
              <Route path="/admin/notifications" element={<AdminNotifications />} />
              <Route path="/admin/users" element={<AdminUsers />} />
              <Route path="/admin/payments" element={<AdminPayments />} />
              <Route path="/admin/subscriptions" element={<AdminSubscriptions />} />
              <Route path="/admin/shipping" element={<AdminShippingSettings />} />
              <Route path="/admin/settings" element={<AdminSettings />} />
            </Route>

            {/* Technician routes - hidden, no public links */}
            <Route path="/technician/login" element={<Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full" />Loading...</div>}><TechnicianLogin /></Suspense>} />
            <Route path="/technician/signup" element={<Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full" />Loading...</div>}><TechnicianSignUp /></Suspense>} />
            <Route element={<Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full" />Loading...</div>}><TechnicianLayout /></Suspense>}>
              <Route path="/technician/dashboard" element={<TechnicianDashboard />} />
              <Route path="/technician/bookings" element={<TechnicianBookings />} />
              <Route path="/technician/profile" element={<TechnicianProfile />} />
              <Route path="/technician/settings" element={<TechnicianSettings />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </AnimatePresence>
      </main>
      {!isAdmin && !isUserPanel && <Footer />}
      {!isAdmin && !isUserPanel && <WhatsAppFloat onBackToTopClick={() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }} backToTopVisible={false} />}
      
      {/* Global Booking Modal - appears on all public pages */}
      {mounted && !isAdmin && !isUserPanel && (
        <AnimatePresence>
          {showBookingModal && (
            <BookingModal 
              onClose={() => {
                setShowBookingModal(false);
                setHasShownInSession(true);
                setShouldCheckModal(false);
              }} 
            />
          )}
        </AnimatePresence>
      )}
      
      {/* Push Notification Prompt */}
      <PushNotificationPrompt userId={user?.id} />
    </>
  );
};

const App = () => (
  <ErrorBoundary
    onError={(error, errorInfo) => {
      console.error('Global App Error:', error, errorInfo);
      // TODO: Add error reporting service here
    }}
  >
    <HelmetProvider>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
        <QueryClientProvider client={queryClient}>
          <ErrorBoundary>
            <TooltipProvider>
              <AuthProvider>
                <ErrorBoundary>
                  <CartProvider>
                    <Toaster />
                    <Sonner />
                    <BrowserRouter>
                      <AppContent />
                    </BrowserRouter>
                  </CartProvider>
                </ErrorBoundary>
              </AuthProvider>
            </TooltipProvider>
          </ErrorBoundary>
        </QueryClientProvider>
      </ThemeProvider>
    </HelmetProvider>
  </ErrorBoundary>
);

export default App;
