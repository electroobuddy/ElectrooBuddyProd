import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

const AdminBookings = () => {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");

  const fetch = async () => {
    let q = supabase.from("bookings").select("*").order("created_at", { ascending: false });
    if (filter) q = q.eq("status", filter);
    const { data } = await q;
    setBookings(data || []);
    setLoading(false);
  };

  useEffect(() => { fetch(); }, [filter]);

  const updateStatus = async (id: string, newStatus: string) => {
    const booking = bookings.find(b => b.id === id);
    const oldStatus = booking?.status;
    const { error } = await supabase.from("bookings").update({ status: newStatus }).eq("id", id);
    if (error) return toast.error(error.message);
    
    // Trigger email notification
    supabase.functions.invoke("notify-booking-status", {
      body: { bookingId: id, oldStatus, newStatus },
    }).catch(console.error);
    
    toast.success("Status updated & notification sent");
    fetch();
  };

  const exportCSV = () => {
    if (!bookings.length) return;
    const headers = ["Name", "Phone", "Address", "Service", "Date", "Time", "Status"];
    const rows = bookings.map((b) => [b.name, b.phone, b.address, b.service_type, b.preferred_date, b.preferred_time, b.status]);
    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "bookings.csv";
    a.click();
  };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-heading font-bold text-foreground">Bookings</h1>
        <div className="flex gap-2">
          <select value={filter} onChange={(e) => setFilter(e.target.value)} className="px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm">
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <button onClick={exportCSV} className="px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:opacity-90">Export CSV</button>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Name</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Phone</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">Service</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden lg:table-cell">Date</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
              </tr>
            </thead>
            <tbody>
              {bookings.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">No bookings found</td></tr>
              ) : (
                bookings.map((b) => (
                  <tr key={b.id} className="border-b border-border last:border-0">
                    <td className="px-4 py-3 text-foreground font-medium">{b.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{b.phone}</td>
                    <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{b.service_type}</td>
                    <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell">{b.preferred_date}</td>
                    <td className="px-4 py-3">
                      <select
                        value={b.status}
                        onChange={(e) => updateStatus(b.id, e.target.value)}
                        className="px-2 py-1 rounded border border-input bg-background text-foreground text-xs"
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
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

export default AdminBookings;
