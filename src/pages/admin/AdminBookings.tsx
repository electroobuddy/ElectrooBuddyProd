import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Pencil, Trash2, X, Eye } from "lucide-react";
import { toast } from "sonner";

const AdminBookings = () => {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [viewing, setViewing] = useState<any | null>(null);
  const [editing, setEditing] = useState<any | null>(null);
  const [editForm, setEditForm] = useState({ name: "", phone: "", address: "", service_type: "", preferred_date: "", preferred_time: "", description: "", status: "pending" });

  const fetchData = async () => {
    let q = supabase.from("bookings").select("*").order("created_at", { ascending: false });
    if (filter) q = q.eq("status", filter);
    const { data } = await q;
    setBookings(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [filter]);

  const updateStatus = async (id: string, newStatus: string) => {
    const booking = bookings.find(b => b.id === id);
    const oldStatus = booking?.status;
    const { error } = await supabase.from("bookings").update({ status: newStatus }).eq("id", id);
    if (error) return toast.error(error.message);
    supabase.functions.invoke("notify-booking-status", {
      body: { bookingId: id, oldStatus, newStatus },
    }).catch(console.error);
    toast.success("Status updated");
    fetchData();
  };

  const handleEdit = (b: any) => {
    setEditing(b);
    setEditForm({
      name: b.name, phone: b.phone, address: b.address, service_type: b.service_type,
      preferred_date: b.preferred_date, preferred_time: b.preferred_time,
      description: b.description || "", status: b.status,
    });
  };

  const handleSaveEdit = async () => {
    if (!editing?.id) return;
    const { error } = await supabase.from("bookings").update(editForm).eq("id", editing.id);
    if (error) return toast.error(error.message);
    toast.success("Booking updated");
    setEditing(null);
    fetchData();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this booking?")) return;
    const { error } = await supabase.from("bookings").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Booking deleted");
    fetchData();
  };

  const exportCSV = () => {
    if (!bookings.length) return;
    const headers = ["Name", "Phone", "Address", "Service", "Date", "Time", "Description", "Status"];
    const rows = bookings.map((b) => [b.name, b.phone, b.address, b.service_type, b.preferred_date, b.preferred_time, b.description || "", b.status]);
    const csv = [headers, ...rows].map((r) => r.map(c => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
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

      {/* View Detail Modal */}
      {viewing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setViewing(null)}>
          <div className="bg-card border border-border rounded-xl p-6 max-w-lg w-full mx-4 space-y-3" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-heading font-bold text-foreground">Booking Details</h2>
              <button onClick={() => setViewing(null)} className="p-1 text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><span className="text-muted-foreground">Name:</span><p className="font-medium text-foreground">{viewing.name}</p></div>
              <div><span className="text-muted-foreground">Phone:</span><p className="font-medium text-foreground">{viewing.phone}</p></div>
              <div className="col-span-2"><span className="text-muted-foreground">Address:</span><p className="font-medium text-foreground">{viewing.address}</p></div>
              <div><span className="text-muted-foreground">Service:</span><p className="font-medium text-foreground">{viewing.service_type}</p></div>
              <div><span className="text-muted-foreground">Status:</span><p className="font-medium text-foreground capitalize">{viewing.status}</p></div>
              <div><span className="text-muted-foreground">Date:</span><p className="font-medium text-foreground">{viewing.preferred_date}</p></div>
              <div><span className="text-muted-foreground">Time:</span><p className="font-medium text-foreground">{viewing.preferred_time}</p></div>
              {viewing.description && <div className="col-span-2"><span className="text-muted-foreground">Description:</span><p className="font-medium text-foreground">{viewing.description}</p></div>}
              <div className="col-span-2"><span className="text-muted-foreground">Created:</span><p className="font-medium text-foreground">{new Date(viewing.created_at).toLocaleString()}</p></div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setEditing(null)}>
          <div className="bg-card border border-border rounded-xl p-6 max-w-lg w-full mx-4 space-y-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-heading font-bold text-foreground">Edit Booking</h2>
              <button onClick={() => setEditing(null)} className="p-1 text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
            </div>
            <input placeholder="Name" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            <input placeholder="Phone" value={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            <input placeholder="Address" value={editForm.address} onChange={(e) => setEditForm({ ...editForm, address: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            <input placeholder="Service Type" value={editForm.service_type} onChange={(e) => setEditForm({ ...editForm, service_type: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            <div className="grid grid-cols-2 gap-3">
              <input type="date" value={editForm.preferred_date} onChange={(e) => setEditForm({ ...editForm, preferred_date: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              <input type="time" value={editForm.preferred_time} onChange={(e) => setEditForm({ ...editForm, preferred_time: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
            <textarea placeholder="Description" rows={2} value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none" />
            <select value={editForm.status} onChange={(e) => setEditForm({ ...editForm, status: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm">
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <div className="flex gap-3">
              <button onClick={handleSaveEdit} className="px-5 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg">Save</button>
              <button onClick={() => setEditing(null)} className="px-5 py-2 bg-muted text-muted-foreground text-sm font-medium rounded-lg">Cancel</button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Name</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Phone</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">Service</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">Address</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden lg:table-cell">Date</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden lg:table-cell">Time</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookings.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-8 text-center text-muted-foreground">No bookings found</td></tr>
              ) : (
                bookings.map((b) => (
                  <tr key={b.id} className="border-b border-border last:border-0">
                    <td className="px-4 py-3 text-foreground font-medium">{b.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{b.phone}</td>
                    <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{b.service_type}</td>
                    <td className="px-4 py-3 text-muted-foreground hidden md:table-cell max-w-[150px] truncate">{b.address}</td>
                    <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell">{b.preferred_date}</td>
                    <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell">{b.preferred_time}</td>
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
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <button onClick={() => setViewing(b)} className="p-1.5 text-muted-foreground hover:text-foreground" title="View"><Eye className="w-4 h-4" /></button>
                      <button onClick={() => handleEdit(b)} className="p-1.5 text-muted-foreground hover:text-foreground" title="Edit"><Pencil className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(b.id)} className="p-1.5 text-muted-foreground hover:text-destructive" title="Delete"><Trash2 className="w-4 h-4" /></button>
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
