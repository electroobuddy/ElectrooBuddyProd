import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { CalendarDays, Wrench, FolderOpen, Mail } from "lucide-react";

const AdminDashboard = () => {
  const [counts, setCounts] = useState({ bookings: 0, services: 0, projects: 0, messages: 0 });
  const [recentBookings, setRecentBookings] = useState<any[]>([]);

  useEffect(() => {
    const fetchCounts = async () => {
      const [b, s, p, m] = await Promise.all([
        supabase.from("bookings").select("id", { count: "exact", head: true }),
        supabase.from("services").select("id", { count: "exact", head: true }),
        supabase.from("projects").select("id", { count: "exact", head: true }),
        supabase.from("contact_messages").select("id", { count: "exact", head: true }),
      ]);
      setCounts({
        bookings: b.count || 0,
        services: s.count || 0,
        projects: p.count || 0,
        messages: m.count || 0,
      });
    };

    const fetchRecent = async () => {
      const { data } = await supabase
        .from("bookings")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5);
      setRecentBookings(data || []);
    };

    fetchCounts();
    fetchRecent();
  }, []);

  const stats = [
    { label: "Total Bookings", value: counts.bookings, icon: CalendarDays, color: "bg-primary/10 text-primary" },
    { label: "Total Services", value: counts.services, icon: Wrench, color: "bg-secondary/20 text-secondary-foreground" },
    { label: "Total Projects", value: counts.projects, icon: FolderOpen, color: "bg-primary/10 text-primary" },
    { label: "Messages", value: counts.messages, icon: Mail, color: "bg-secondary/20 text-secondary-foreground" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-heading font-bold text-foreground mb-6">Dashboard</h1>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((s) => (
          <div key={s.label} className="bg-card border border-border rounded-xl p-5">
            <div className={`w-10 h-10 rounded-lg ${s.color} flex items-center justify-center mb-3`}>
              <s.icon className="w-5 h-5" />
            </div>
            <p className="text-2xl font-heading font-bold text-foreground">{s.value}</p>
            <p className="text-sm text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      <h2 className="text-lg font-heading font-semibold text-foreground mb-4">Recent Bookings</h2>
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Name</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Service</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Date</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentBookings.length === 0 ? (
                <tr><td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">No bookings yet</td></tr>
              ) : (
                recentBookings.map((b: any) => (
                  <tr key={b.id} className="border-b border-border last:border-0">
                    <td className="px-4 py-3 text-foreground">{b.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{b.service_type}</td>
                    <td className="px-4 py-3 text-muted-foreground">{b.preferred_date}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        b.status === "confirmed" ? "bg-green-100 text-green-700" :
                        b.status === "completed" ? "bg-blue-100 text-blue-700" :
                        "bg-yellow-100 text-yellow-700"
                      }`}>
                        {b.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
