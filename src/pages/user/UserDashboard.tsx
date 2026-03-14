import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import {
  Zap, Calendar, Clock, MapPin, LogOut, Plus,
  CheckCircle, AlertCircle, Loader2, User, ChevronRight
} from "lucide-react";

const statusColors: Record<string, { bg: string; text: string; label: string }> = {
  pending: { bg: "hsl(var(--secondary) / 0.15)", text: "hsl(var(--secondary))", label: "Pending" },
  confirmed: { bg: "hsl(var(--primary) / 0.15)", text: "hsl(var(--primary))", label: "Confirmed" },
  completed: { bg: "hsl(142 76% 36% / 0.15)", text: "hsl(142 76% 36%)", label: "Completed" },
  cancelled: { bg: "hsl(0 84% 60% / 0.15)", text: "hsl(0 84% 60%)", label: "Cancelled" },
};

const UserDashboard = () => {
  const { user, signOut, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login", { replace: true });
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!user) return;
    const fetchBookings = async () => {
      const { data } = await supabase
        .from("bookings")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      setBookings(data || []);
      setLoading(false);
    };
    fetchBookings();
  }, [user]);

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  if (authLoading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: "hsl(var(--background))" }}>
        <Loader2 size={32} className="animate-spin" style={{ color: "hsl(var(--primary))" }} />
      </div>
    );
  }

  if (!user) return null;

  const stats = {
    total: bookings.length,
    pending: bookings.filter(b => b.status === "pending").length,
    completed: bookings.filter(b => b.status === "completed").length,
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700;800;900&family=DM+Sans:wght@400;500;600&display=swap');

        .dash-page {
          min-height: 100vh;
          background: hsl(var(--background));
          font-family: 'DM Sans', sans-serif;
          padding-bottom: 80px;
        }

        .dash-header {
          position: relative;
          padding: 48px 0 40px;
          overflow: hidden;
        }

        .dash-header-glow {
          position: absolute;
          top: -60px; left: 50%;
          transform: translateX(-50%);
          width: 600px; height: 300px;
          background: radial-gradient(ellipse, hsl(var(--primary) / 0.08) 0%, transparent 70%);
          pointer-events: none;
        }

        .dash-header-inner {
          max-width: 960px;
          margin: 0 auto;
          padding: 0 20px;
          position: relative;
          z-index: 1;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 16px;
        }

        .dash-user-info {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .dash-avatar {
          width: 48px;
          height: 48px;
          border-radius: 14px;
          background: linear-gradient(135deg, hsl(var(--primary)), hsl(var(--electric-blue-dark)));
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 0 20px hsl(var(--primary) / 0.25);
          flex-shrink: 0;
        }

        .dash-greeting {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 24px;
          font-weight: 800;
          text-transform: uppercase;
          color: hsl(var(--foreground));
        }

        .dash-email {
          font-size: 13px;
          color: hsl(var(--muted-foreground));
        }

        .dash-actions {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }

        .dash-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 20px;
          border-radius: 12px;
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 14px;
          font-weight: 700;
          letter-spacing: 0.5px;
          text-transform: uppercase;
          text-decoration: none;
          cursor: pointer;
          transition: all 0.3s ease;
          border: none;
        }

        .dash-btn-primary {
          background: linear-gradient(135deg, hsl(var(--primary)), hsl(var(--electric-blue-dark)));
          color: hsl(var(--primary-foreground));
        }

        .dash-btn-primary:hover {
          box-shadow: 0 0 24px hsl(var(--primary) / 0.4);
          transform: translateY(-2px);
        }

        .dash-btn-outline {
          background: hsl(var(--muted) / 0.3);
          border: 1px solid hsl(var(--border) / 0.3);
          color: hsl(var(--muted-foreground));
        }

        .dash-btn-outline:hover {
          border-color: hsl(var(--border));
          color: hsl(var(--foreground));
        }

        /* Stats */
        .dash-stats {
          max-width: 960px;
          margin: 0 auto;
          padding: 0 20px;
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
          margin-bottom: 40px;
        }

        @media (max-width: 600px) {
          .dash-stats { grid-template-columns: 1fr; }
        }

        .stat-card {
          background: hsl(var(--card));
          border: 1px solid hsl(var(--border) / 0.2);
          border-radius: 16px;
          padding: 24px;
          text-align: center;
        }

        .stat-num {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 36px;
          font-weight: 900;
          color: hsl(var(--primary));
        }

        .stat-label {
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: hsl(var(--muted-foreground));
          margin-top: 4px;
        }

        /* Bookings list */
        .dash-section {
          max-width: 960px;
          margin: 0 auto;
          padding: 0 20px;
        }

        .dash-section-title {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 22px;
          font-weight: 800;
          text-transform: uppercase;
          color: hsl(var(--foreground));
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .booking-card {
          background: hsl(var(--card));
          border: 1px solid hsl(var(--border) / 0.2);
          border-radius: 16px;
          padding: 24px;
          margin-bottom: 14px;
          transition: all 0.25s ease;
        }

        .booking-card:hover {
          border-color: hsl(var(--primary) / 0.3);
          box-shadow: 0 4px 20px hsl(var(--primary) / 0.08);
        }

        .booking-top {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 12px;
          flex-wrap: wrap;
          margin-bottom: 14px;
        }

        .booking-service {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 18px;
          font-weight: 700;
          text-transform: uppercase;
          color: hsl(var(--foreground));
        }

        .booking-badge {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 5px 12px;
          border-radius: 100px;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .booking-details {
          display: flex;
          flex-wrap: wrap;
          gap: 20px;
          font-size: 13px;
          color: hsl(var(--muted-foreground));
        }

        .booking-detail {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .empty-state {
          text-align: center;
          padding: 60px 20px;
          background: hsl(var(--card));
          border: 1px dashed hsl(var(--border) / 0.3);
          border-radius: 20px;
        }

        .empty-icon {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          background: hsl(var(--primary) / 0.08);
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 16px;
          color: hsl(var(--primary));
        }

        .empty-title {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 22px;
          font-weight: 800;
          text-transform: uppercase;
          color: hsl(var(--foreground));
          margin-bottom: 8px;
        }

        .empty-text {
          font-size: 14px;
          color: hsl(var(--muted-foreground));
          margin-bottom: 20px;
        }
      `}</style>

      <div className="dash-page">
        <div className="dash-header">
          <div className="dash-header-glow" />
          <motion.div
            className="dash-header-inner"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="dash-user-info">
              <div className="dash-avatar">
                <User size={22} color="#0a0f1e" strokeWidth={2.5} />
              </div>
              <div>
                <div className="dash-greeting">My Dashboard</div>
                <div className="dash-email">{user.email}</div>
              </div>
            </div>
            <div className="dash-actions">
              <Link to="/booking" className="dash-btn dash-btn-primary">
                <Plus size={14} /> Book Service
              </Link>
              <button onClick={handleLogout} className="dash-btn dash-btn-outline">
                <LogOut size={14} /> Sign Out
              </button>
            </div>
          </motion.div>
        </div>

        {/* Stats */}
        <motion.div
          className="dash-stats"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          {[
            { num: stats.total, label: "Total Bookings" },
            { num: stats.pending, label: "Pending" },
            { num: stats.completed, label: "Completed" },
          ].map((s, i) => (
            <div className="stat-card" key={i}>
              <div className="stat-num">{s.num}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </motion.div>

        {/* Bookings */}
        <div className="dash-section">
          <div className="dash-section-title">
            <Calendar size={18} style={{ color: "hsl(var(--primary))" }} />
            Your Bookings
          </div>

          {loading ? (
            <div style={{ textAlign: "center", padding: 40 }}>
              <Loader2 size={28} className="animate-spin" style={{ color: "hsl(var(--primary))" }} />
            </div>
          ) : bookings.length === 0 ? (
            <motion.div
              className="empty-state"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
            >
              <div className="empty-icon"><Zap size={28} /></div>
              <div className="empty-title">No Bookings Yet</div>
              <p className="empty-text">Book your first electrical service and track it here.</p>
              <Link to="/booking" className="dash-btn dash-btn-primary">
                <Plus size={14} /> Book Now
              </Link>
            </motion.div>
          ) : (
            bookings.map((b, i) => {
              const status = statusColors[b.status] || statusColors.pending;
              return (
                <motion.div
                  className="booking-card"
                  key={b.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.05 }}
                >
                  <div className="booking-top">
                    <div className="booking-service">{b.service_type}</div>
                    <div
                      className="booking-badge"
                      style={{ background: status.bg, color: status.text }}
                    >
                      {b.status === "completed" ? <CheckCircle size={12} /> : <AlertCircle size={12} />}
                      {status.label}
                    </div>
                  </div>
                  <div className="booking-details">
                    <div className="booking-detail">
                      <Calendar size={14} />
                      {new Date(b.preferred_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </div>
                    <div className="booking-detail">
                      <Clock size={14} />
                      {b.preferred_time}
                    </div>
                    <div className="booking-detail">
                      <MapPin size={14} />
                      {b.address}
                    </div>
                  </div>
                  {b.description && (
                    <p style={{ marginTop: 12, fontSize: 13, color: "hsl(var(--muted-foreground) / 0.7)", lineHeight: 1.5 }}>
                      {b.description}
                    </p>
                  )}
                </motion.div>
              );
            })
          )}
        </div>
      </div>
    </>
  );
};

export default UserDashboard;
