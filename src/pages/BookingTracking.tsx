import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { 
  Search, Calendar, Clock, MapPin, Phone, CheckCircle, 
  AlertCircle, FileText, Loader2, ArrowLeft, Zap, User 
} from "lucide-react";

const statusColors: Record<string, { bg: string; text: string; label: string }> = {
  pending: { bg: "bg-yellow-100 dark:bg-yellow-900/30", text: "text-yellow-700 dark:text-yellow-400", label: "Pending" },
  assigned: { bg: "bg-indigo-100 dark:bg-indigo-900/30", text: "text-indigo-700 dark:text-indigo-400", label: "Assigned" },
  confirmed: { bg: "bg-blue-100 dark:bg-blue-900/30", text: "text-blue-700 dark:text-blue-400", label: "Confirmed" },
  "in-progress": { bg: "bg-orange-100 dark:bg-orange-900/30", text: "text-orange-700 dark:text-orange-400", label: "In Progress" },
  completed: { bg: "bg-green-100 dark:bg-green-900/30", text: "text-green-700 dark:text-green-400", label: "Completed" },
  cancelled: { bg: "bg-red-100 dark:bg-red-900/30", text: "text-red-700 dark:text-red-400", label: "Cancelled" },
};

const BookingTracking = () => {
  const [searchType, setSearchType] = useState<"phone" | "email">("phone");
  const [searchValue, setSearchValue] = useState("");
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!searchValue.trim()) {
      toast.error("Please enter a valid search value");
      return;
    }

    setLoading(true);
    setBookings([]);
    setSearched(true);

    try {
      // Normalize phone number - remove all non-numeric characters
      const normalizedPhone = searchValue.trim().replace(/\D/g, '');
      
      if (searchType === "phone") {
        // Use direct phone match with ilike for flexible matching
        const { data, error } = await supabase
          .from("bookings")
          .select("*")
          .ilike("phone", `%${normalizedPhone}%`)
          .order("created_at", { ascending: false })
          .limit(20);
        
        if (error) {
          throw error;
        }
        
        setBookings(data || []);
        
        if (!data || data.length === 0) {
          toast.info("No bookings found for this phone number");
        } else {
          toast.success(`Found ${data.length} booking(s)`);
        }
      } else {
        // Search by email - direct booking email match
        const searchTerm = searchValue.trim().toLowerCase();
        
        if (!searchTerm) {
          toast.error("Please enter an email address");
          setLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from("bookings")
          .select("*")
          .ilike("email", `%${searchTerm}%`)
          .order("created_at", { ascending: false });
        
        if (error) {
          // If error is about column not existing, show helpful message
          if (error.message.includes('column "email" does not exist')) {
            toast.error("Email search is not available yet. Please search by phone number.");
            setSearchType("phone");
            setLoading(false);
            return;
          }
          throw error;
        }
        
        setBookings(data || []);
        
        if (data.length === 0) {
          toast.info("No bookings found for this email");
        } else {
          toast.success(`Found ${data.length} booking(s)`);
        }
      }
    } catch (error: any) {
      console.error("Error searching bookings:", error);
      toast.error("Failed to search bookings. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="booking-tracking-page bg-gray-50 dark:bg-gray-900 min-h-screen">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');

        .booking-tracking-page {
          font-family: 'Poppins', sans-serif;
        }

        .booking-tracking-page h1,
        .booking-tracking-page h2,
        .booking-tracking-page h3,
        .booking-tracking-page h4,
        .booking-tracking-page h5,
        .booking-tracking-page h6 {
          font-weight: 700;
        }
      `}</style>
      {/* Header */}
      <div className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4">
            <Zap className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold text-primary">Track Your Booking</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-heading font-bold text-foreground mb-4">
            Check Your Booking Status
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Enter your phone number or email to view all your bookings and their current status
          </p>
        </motion.div>

        {/* Search Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="max-w-xl mx-auto mb-12"
        >
          <div className="bg-card border border-border rounded-2xl p-6 shadow-lg shadow-primary/5">
            {/* Search Type Toggle */}
            <div className="flex gap-2 mb-6 p-1 bg-muted/50 rounded-xl">
              <button
                onClick={() => setSearchType("phone")}
                className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all ${
                  searchType === "phone"
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Search by Phone
              </button>
              <button
                onClick={() => setSearchType("email")}
                className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all ${
                  searchType === "email"
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Search by Email
              </button>
            </div>

            {/* Search Form */}
            <form onSubmit={handleSearch}>
              <div className="mb-4">
                <label className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                  {searchType === "phone" ? "Phone Number" : "Email Address"}
                </label>
                <div className="relative">
                  <input
                    type={searchType === "phone" ? "tel" : "email"}
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    placeholder={searchType === "phone" ? "+91 98765 43210" : "your@email.com"}
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-gradient-to-r from-primary to-primary/90 text-primary-foreground font-heading font-bold uppercase tracking-wide rounded-xl hover:shadow-lg hover:shadow-primary/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" /> Searching...
                  </>
                ) : (
                  <>
                    <Search size={16} /> Find My Bookings
                  </>
                )}
              </button>
            </form>
          </div>
        </motion.div>

        {/* Results Section */}
        {searched && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : bookings.length === 0 ? (
              searched && (
                <div className="text-center py-16 bg-card border border-dashed border-border rounded-2xl">
                  <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-heading font-bold text-foreground text-xl mb-2">
                    No Bookings Found
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    We couldn't find any bookings with this {searchType}.
                  </p>
                  <Link
                    to="/booking"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition"
                  >
                    Make a New Booking
                  </Link>
                </div>
              )
            ) : (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-heading font-bold text-foreground">
                    Your Bookings ({bookings.length})
                  </h2>
                  <Link
                    to="/login"
                    className="text-sm text-primary hover:underline font-medium"
                  >
                    Sign in to manage all bookings →
                  </Link>
                </div>

                <div className="space-y-4">
                  {bookings.map((booking) => {
                    const status = statusColors[booking.status] || statusColors.pending;
                    return (
                      <div
                        key={booking.id}
                        className="bg-card border border-border rounded-xl p-5 hover:border-primary/20 transition-all shadow-sm"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
                          <div>
                            <h3 className="font-heading font-bold text-foreground text-lg">
                              {booking.service_type}
                            </h3>
                            <p className="text-sm text-muted-foreground mt-1">
                              Booking ID: <span className="font-mono">{booking.id.slice(0, 8)}</span>
                            </p>
                          </div>
                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${status.bg} ${status.text}`}
                          >
                            {booking.status === "completed" ? (
                              <CheckCircle className="w-3.5 h-3.5" />
                            ) : (
                              <AlertCircle className="w-3.5 h-3.5" />
                            )}
                            {status.label}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Calendar className="w-4 h-4 flex-shrink-0" />
                            <span>
                              {new Date(booking.preferred_date).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Clock className="w-4 h-4 flex-shrink-0" />
                            <span>{booking.preferred_time}</span>
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <MapPin className="w-4 h-4 flex-shrink-0" />
                            <span className="truncate">{booking.address}</span>
                          </div>
                          {booking.name && (
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <User className="w-4 h-4 flex-shrink-0" />
                              <span>{booking.name}</span>
                            </div>
                          )}
                          {booking.phone && (
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Phone className="w-4 h-4 flex-shrink-0" />
                              <span>{booking.phone}</span>
                            </div>
                          )}
                          {booking.email && (
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <MapPin className="w-4 h-4 flex-shrink-0" style={{transform: "rotate(90deg)"}} />
                              <span className="truncate">{booking.email}</span>
                            </div>
                          )}
                        </div>

                        {booking.description && (
                          <div className="mt-4 pt-4 border-t border-border">
                            <div className="flex items-start gap-2 text-sm text-muted-foreground">
                              <FileText className="w-4 h-4 flex-shrink-0 mt-0.5" />
                              <p className="line-clamp-2">{booking.description}</p>
                            </div>
                          </div>
                        )}

                        <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
                          <p className="text-xs text-muted-foreground">
                            Created:{" "}
                            {new Date(booking.created_at).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                          {booking.status === "pending" && (
                            <p className="text-xs text-primary font-medium">
                              Awaiting confirmation
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default BookingTracking;
