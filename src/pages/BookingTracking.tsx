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
  confirmed: { bg: "bg-blue-100 dark:bg-blue-900/30", text: "text-blue-700 dark:text-blue-400", label: "Confirmed" },
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
    console.log('🔍 [BookingTracking] Search initiated');
    console.log('📝 [BookingTracking] Search type:', searchType);
    console.log('📝 [BookingTracking] Search value:', searchValue);
    
    if (!searchValue.trim()) {
      console.warn('⚠️ [BookingTracking] Empty search value');
      toast.error("Please enter a valid search value");
      return;
    }

    setLoading(true);
    setBookings([]);
    setSearched(true);
    console.log('✅ [BookingTracking] Loading state set to true');

    try {
      // Normalize phone number - remove all non-numeric characters
      const normalizedPhone = searchValue.trim().replace(/\D/g, '');
      console.log('📱 [BookingTracking] Normalized phone:', normalizedPhone);
      
      if (searchType === "phone") {
        console.log('📞 [BookingTracking] Searching by phone...');
        
        // Search by phone number with multiple format variations
        // This handles +91XXXXXXXXXX, 91XXXXXXXXXX, 0XXXXXXXXXX, XXXXXXXXXX formats
        const phonePatterns = [
          normalizedPhone, // Exact match
          normalizedPhone.startsWith('91') ? normalizedPhone.slice(2) : '91' + normalizedPhone, // Add/remove 91 prefix
          normalizedPhone.length === 10 ? '91' + normalizedPhone : normalizedPhone.slice(2), // Toggle 91 prefix
        ].filter(Boolean);

        // Remove duplicates
        const uniquePhones = [...new Set(phonePatterns)];
        
        console.log('🎯 [BookingTracking] Phone patterns to search:', uniquePhones);
        console.log('📊 [BookingTracking] Number of unique patterns:', uniquePhones.length);

        // Fetch all bookings and filter client-side for phone number matches
        console.log('💾 [BookingTracking] Fetching all bookings from database...');
        const { data, error } = await supabase
          .from("bookings")
          .select("*")
          .order("created_at", { ascending: false });
        
        console.log('📦 [BookingTracking] Database response:');
        console.log('   - Data count:', data?.length || 0);
        console.log('   - Error:', error);
        
        if (error) {
          console.error('❌ [BookingTracking] Database error:', error);
          throw error;
        }
        
        // Filter bookings that match any of the phone patterns
        console.log('🔍 [BookingTracking] Starting client-side filtering...');
        const matchingBookings = (data || []).filter(booking => {
          const bookingPhone = booking.phone?.replace(/\D/g, '') || '';
          const isMatch = uniquePhones.some(pattern => 
            bookingPhone === pattern || 
            bookingPhone.includes(pattern) ||
            pattern.includes(bookingPhone)
          );
          
          if (isMatch) {
            console.log('✅ [BookingTracking] MATCH FOUND:');
            console.log('   - Booking ID:', booking.id);
            console.log('   - Booking Name:', booking.name);
            console.log('   - Booking Phone:', booking.phone);
            console.log('   - Normalized Booking Phone:', bookingPhone);
            console.log('   - Matched Pattern:', uniquePhones.find(pattern => 
              bookingPhone === pattern || 
              bookingPhone.includes(pattern) ||
              pattern.includes(bookingPhone)
            ));
          }
          
          return isMatch;
        });

        console.log('📊 [BookingTracking] Total matching bookings:', matchingBookings.length);
        setBookings(matchingBookings);
        
        if (matchingBookings.length === 0) {
          console.warn('⚠️ [BookingTracking] No matches found for phone number');
          toast.info("No bookings found for this phone number");
        } else {
          console.log('✅ [BookingTracking] Success! Found', matchingBookings.length, 'booking(s)');
          toast.success(`Found ${matchingBookings.length} booking(s)`);
        }
      } else {
        console.log('📧 [BookingTracking] Searching by email...');
        
        // Search by email - direct booking email match
        const searchTerm = searchValue.trim().toLowerCase();
        console.log('📧 [BookingTracking] Search term (lowercase):', searchTerm);
        
        if (!searchTerm) {
          console.warn('⚠️ [BookingTracking] Empty email search term');
          toast.error("Please enter an email address");
          setLoading(false);
          return;
        }

        console.log('💾 [BookingTracking] Querying database with ILIKE...');
        const { data, error } = await supabase
          .from("bookings")
          .select("*")
          .ilike("email", `%${searchTerm}%`)
          .order("created_at", { ascending: false });
        
        console.log('📦 [BookingTracking] Email search response:');
        console.log('   - Data count:', data?.length || 0);
        console.log('   - Error:', error);
        
        if (error) {
          console.error('❌ [BookingTracking] Email search error:', error);
          console.error('❌ [BookingTracking] Error message:', error.message);
          console.error('❌ [BookingTracking] Error details:', JSON.stringify(error, null, 2));
          
          // If error is about column not existing, show helpful message
          if (error.message.includes('column "email" does not exist')) {
            console.warn('⚠️ [BookingTracking] Email column does not exist in database yet!');
            toast.error("Email search is not available yet. Please search by phone number.");
            setSearchType("phone");
            setLoading(false);
            return;
          }
          throw error;
        }
        
        console.log('✅ [BookingTracking] Email search successful');
        setBookings(data || []);
        
        if (data.length === 0) {
          console.warn('⚠️ [BookingTracking] No bookings found for email:', searchTerm);
          toast.info("No bookings found for this email");
        } else {
          console.log('✅ [BookingTracking] Success! Found', data.length, 'booking(s)');
          console.log('📋 [BookingTracking] Matching bookings:', (data as any[]).map(b => ({
            id: b.id,
            name: b.name,
            email: b.email,
            phone: b.phone
          })));
          toast.success(`Found ${data.length} booking(s)`);
        }
      }
    } catch (error: any) {
      console.error('💥 [BookingTracking] Catch block error:', error);
      console.error('💥 [BookingTracking] Error stack:', error.stack);
      console.error('💥 [BookingTracking] Full error object:', JSON.stringify(error, null, 2));
      toast.error("Failed to search bookings. Please try again.");
    } finally {
      console.log('🏁 [BookingTracking] Search completed, setting loading to false');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
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
