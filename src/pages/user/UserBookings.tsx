import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Calendar, Clock, MapPin, Plus, CheckCircle, AlertCircle, FileText, Phone, X, Zap } from "lucide-react";

const statusColors: Record<string, { bg: string; text: string; label: string }> = {
  pending: { bg: "bg-yellow-100 dark:bg-yellow-900/30", text: "text-yellow-700 dark:text-yellow-400", label: "Pending" },
  confirmed: { bg: "bg-blue-100 dark:bg-blue-900/30", text: "text-blue-700 dark:text-blue-400", label: "Confirmed" },
  completed: { bg: "bg-green-100 dark:bg-green-900/30", text: "text-green-700 dark:text-green-400", label: "Completed" },
  cancelled: { bg: "bg-red-100 dark:bg-red-900/30", text: "text-red-700 dark:text-red-400", label: "Cancelled" },
};

const UserBookings = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [bookingForm, setBookingForm] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    service_type: "",
    preferred_date: "",
    preferred_time: "",
    description: "",
    exact_location: "",
    custom_service_demand: "",
    is_switch_working: "",
    has_old_fan: "",
    is_electricity_supply_on: "",
  });
  
  const [gettingLocation, setGettingLocation] = useState(false);
  const [bookingSubmitting, setBookingSubmitting] = useState(false);
  const [services, setServices] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      let query = supabase.from("bookings").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
      if (filter) query = query.eq("status", filter);
      const { data } = await query;
      setBookings(data || []);
      setLoading(false);
    };
    fetch();
  }, [user, filter]);

  useEffect(() => {
    supabase.from("services").select("title").order("sort_order").then(({ data }) => {
      if (data) setServices(data);
    });
  }, []);

  // Add Custom Service option to services list
  const servicesWithOptions = [
    ...services,
    { title: "Custom Service" }
  ];

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBookingSubmitting(true);
    
    const insertData: any = {
      name: bookingForm.name,
      phone: bookingForm.phone,
      email: bookingForm.email,
      address: bookingForm.address,
      service_type: bookingForm.service_type === "Custom Service" ? `Custom: ${bookingForm.custom_service_demand}` : bookingForm.service_type,
      preferred_date: bookingForm.preferred_date,
      preferred_time: bookingForm.preferred_time,
      description: bookingForm.service_type === "Custom Service" ? bookingForm.custom_service_demand : (bookingForm.description || null),
      exact_location: bookingForm.exact_location || null,
      custom_service_demand: bookingForm.service_type === "Custom Service" ? bookingForm.custom_service_demand : null,
      is_switch_working: bookingForm.is_switch_working || null,
      has_old_fan: bookingForm.has_old_fan || null,
      is_electricity_supply_on: bookingForm.is_electricity_supply_on || null,
      user_id: user!.id,
    };
    
    const { error } = await supabase.from("bookings").insert(insertData);
    if (error) {
      toast.error("Failed to submit booking. Please try again.");
    } else {
      toast.success("Booking submitted! We'll confirm your appointment shortly.");
      setBookingForm({ 
        name: "", 
        phone: "", 
        email: "", 
        address: "", 
        service_type: "", 
        preferred_date: "", 
        preferred_time: "", 
        description: "",
        exact_location: "",
        custom_service_demand: "",
        is_switch_working: "",
        has_old_fan: "",
        is_electricity_supply_on: "",
      });
      setShowBookingForm(false);
      // Refresh bookings
      setLoading(true);
      const { data } = await supabase.from("bookings").select("*").eq("user_id", user!.id).order("created_at", { ascending: false });
      setBookings(data || []);
    }
    setBookingSubmitting(false);
  };
  
  const handleGetCurrentLocation = () => {
    setGettingLocation(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
            const data = await response.json();
            const address = data.display_name || `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
            setBookingForm({ ...bookingForm, address, exact_location: address });
            toast.success("Location fetched successfully!");
          } catch (error) {
            setBookingForm({ ...bookingForm, address: `${latitude}, ${longitude}`, exact_location: `${latitude}, ${longitude}` });
            toast.success("Coordinates fetched! Please provide more details.");
          }
          setGettingLocation(false);
        },
        (error) => {
          setGettingLocation(false);
          toast.error("Unable to get your location. Please enter manually.");
        }
      );
    } else {
      setGettingLocation(false);
      toast.error("Geolocation is not supported by your browser.");
    }
  };

  const stats = {
    total: bookings.length,
    pending: bookings.filter(b => b.status === "pending").length,
    completed: bookings.filter(b => b.status === "completed").length,
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">My Bookings</h1>
          <p className="text-sm text-muted-foreground">View and track all your service bookings</p>
        </div>
        <button
          onClick={() => setShowBookingForm(!showBookingForm)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition self-start"
        >
          <Plus className="w-4 h-4" /> {showBookingForm ? "Cancel" : "Book Service"}
        </button>
      </div>

      {/* Quick Booking Form */}
      {showBookingForm && (
        <div className="mb-8 bg-card border border-border rounded-xl p-6 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-heading font-bold text-foreground">Quick Booking Form</h2>
            <button
              onClick={() => setShowBookingForm(false)}
              className="w-8 h-8 rounded-full bg-muted hover:bg-muted/80 flex items-center justify-center transition-colors"
            >
              <X size={16} />
            </button>
          </div>
          <form onSubmit={handleBookingSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="John Doe"
                  value={bookingForm.name}
                  onChange={(e) => setBookingForm({ ...bookingForm, name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="+91 98765 43210"
                  value={bookingForm.phone}
                  onChange={(e) => setBookingForm({ ...bookingForm, phone: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                Email Address *
              </label>
              <input
                type="email"
                required
                placeholder="your@email.com"
                value={bookingForm.email}
                onChange={(e) => setBookingForm({ ...bookingForm, email: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
              />
            </div>

            {/* Address with Location Picker */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-0">
                  Service Address *
                </label>
                <button
                  type="button"
                  onClick={handleGetCurrentLocation}
                  disabled={gettingLocation}
                  className="text-xs px-3 py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 font-medium transition-colors flex items-center gap-1.5 disabled:opacity-50"
                >
                  {gettingLocation ? (
                    <><Loader2 size={12} className="animate-spin" /> Getting Location...</>
                  ) : (
                    <><MapPin size={12} /> Use Current Location</>
                  )}
                </button>
              </div>
              <input
                type="text"
                required
                placeholder="123 Main St, City or use location picker"
                value={bookingForm.address}
                onChange={(e) => setBookingForm({ ...bookingForm, address: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                Service Type *
              </label>
              <select
                required
                value={bookingForm.service_type}
                onChange={(e) => setBookingForm({ ...bookingForm, service_type: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
              >
                <option value="">Select a service...</option>
                {servicesWithOptions.map((s) => (
                  <option key={s.title} value={s.title}>{s.title}</option>
                ))}
              </select>
            </div>

            {/* Custom Service Demand Input - Show only when Custom Service is selected */}
            {bookingForm.service_type === "Custom Service" && (
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                  Describe Your Custom Service Requirement *
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Please describe the specific electrical work you need done..."
                  value={bookingForm.custom_service_demand}
                  onChange={(e) => setBookingForm({ ...bookingForm, custom_service_demand: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition resize-none"
                />
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                  Preferred Date *
                </label>
                <input
                  type="date"
                  required
                  value={bookingForm.preferred_date}
                  onChange={(e) => setBookingForm({ ...bookingForm, preferred_date: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                  Preferred Time *
                </label>
                <input
                  type="time"
                  required
                  value={bookingForm.preferred_time}
                  onChange={(e) => setBookingForm({ ...bookingForm, preferred_time: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                Description <span className="text-muted-foreground/50 lowercase">(optional)</span>
              </label>
              <textarea
                rows={3}
                placeholder="Describe your electrical issue or requirement..."
                value={bookingForm.description}
                onChange={(e) => setBookingForm({ ...bookingForm, description: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition resize-none"
              />
            </div>

            {/* Exact Location */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                Exact Location / Landmark
              </label>
              <input
                type="text"
                placeholder="Near temple, Behind shopping mall, etc."
                value={bookingForm.exact_location}
                onChange={(e) => setBookingForm({ ...bookingForm, exact_location: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
              />
            </div>

            {/* Fan Installation Questions - Only show if service is Fan Installation */}
            {bookingForm.service_type.toLowerCase().includes('fan') && (
              <>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                    Is Your Switch Working? *
                  </label>
                  <select
                    required
                    value={bookingForm.is_switch_working}
                    onChange={(e) => setBookingForm({ ...bookingForm, is_switch_working: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
                  >
                    <option value="">Select...</option>
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                    Is There an Old Fan at Installation Location? *
                  </label>
                  <select
                    required
                    value={bookingForm.has_old_fan}
                    onChange={(e) => setBookingForm({ ...bookingForm, has_old_fan: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
                  >
                    <option value="">Select...</option>
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                    Is Electricity Supply On at Switch Location? *
                  </label>
                  <select
                    required
                    value={bookingForm.is_electricity_supply_on}
                    onChange={(e) => setBookingForm({ ...bookingForm, is_electricity_supply_on: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
                  >
                    <option value="">Select...</option>
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                  </select>
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={bookingSubmitting}
              className="w-full py-3.5 bg-gradient-to-r from-primary to-primary/90 text-primary-foreground font-heading font-bold uppercase tracking-wide rounded-lg hover:shadow-lg hover:shadow-primary/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {bookingSubmitting ? (
                <><Loader2 size={18} className="animate-spin" /> Processing...</>
              ) : (
                <><Zap size={16} /> Submit Booking</>
              )}
            </button>
          </form>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { num: stats.total, label: "Total" },
          { num: stats.pending, label: "Pending" },
          { num: stats.completed, label: "Completed" },
        ].map((s) => (
          <div key={s.label} className="bg-card border border-border rounded-xl p-4 text-center">
            <p className="text-2xl font-heading font-bold text-primary">{s.num}</p>
            <p className="text-xs text-muted-foreground uppercase tracking-wide">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {["", "pending", "confirmed", "completed", "cancelled"].map((f) => (
          <button
            key={f}
            onClick={() => { setFilter(f); setLoading(true); }}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${
              filter === f ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {f || "All"}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : bookings.length === 0 ? (
        <div className="text-center py-16 bg-card border border-dashed border-border rounded-xl">
          <Calendar className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="font-heading font-bold text-foreground mb-1">No Bookings Found</p>
          <p className="text-sm text-muted-foreground mb-4">
            {filter ? "No bookings match this filter." : "Book your first service to get started."}
          </p>
          <Link to="/booking" className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium">
            <Plus className="w-4 h-4" /> Book Now
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {bookings.map((b) => {
            const status = statusColors[b.status] || statusColors.pending;
            return (
              <div key={b.id} className="bg-card border border-border rounded-xl p-4 sm:p-5 hover:border-primary/20 transition">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3">
                  <h3 className="font-heading font-bold text-foreground">{b.service_type}</h3>
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${status.bg} ${status.text} self-start`}>
                    {b.status === "completed" ? <CheckCircle className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                    {status.label}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
                    {new Date(b.preferred_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 flex-shrink-0" />
                    {b.preferred_time}
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                    <span className="truncate">{b.address}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 flex-shrink-0" />
                    {b.phone}
                  </div>
                </div>
                {b.description && (
                  <div className="flex items-start gap-2 mt-3 text-sm text-muted-foreground/70">
                    <FileText className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                    <p className="line-clamp-2">{b.description}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default UserBookings;
