import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Eye } from "lucide-react";
import { toast } from "sonner";

const AdminMessages = () => {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<any | null>(null);

  const fetch = async () => {
    const { data } = await supabase.from("contact_messages").select("*").order("created_at", { ascending: false });
    setMessages(data || []);
    setLoading(false);
  };

  useEffect(() => { fetch(); }, []);

  const markRead = async (id: string) => {
    await supabase.from("contact_messages").update({ read: true }).eq("id", id);
    fetch();
  };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;

  return (
    <div>
      <h1 className="text-2xl font-heading font-bold text-foreground mb-6">Contact Messages</h1>

      {selected && (
        <div className="bg-card border border-border rounded-xl p-6 mb-6">
          <div className="flex justify-between items-start mb-4">
            <h3 className="font-heading font-bold text-foreground">{selected.name}</h3>
            <button onClick={() => setSelected(null)} className="text-sm text-muted-foreground">Close</button>
          </div>
          <div className="space-y-2 text-sm">
            <p><span className="font-medium text-foreground">Email:</span> <span className="text-muted-foreground">{selected.email}</span></p>
            <p><span className="font-medium text-foreground">Phone:</span> <span className="text-muted-foreground">{selected.phone}</span></p>
            <p><span className="font-medium text-foreground">Service:</span> <span className="text-muted-foreground">{selected.service || "N/A"}</span></p>
            <p><span className="font-medium text-foreground">Message:</span></p>
            <p className="text-muted-foreground bg-muted p-3 rounded-lg">{selected.message}</p>
          </div>
        </div>
      )}

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Name</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">Email</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden lg:table-cell">Date</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
              <th className="text-right px-4 py-3 font-medium text-muted-foreground">View</th>
            </tr>
          </thead>
          <tbody>
            {messages.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">No messages</td></tr>
            ) : (
              messages.map((m) => (
                <tr key={m.id} className={`border-b border-border last:border-0 ${!m.read ? "bg-primary/5" : ""}`}>
                  <td className="px-4 py-3 text-foreground font-medium">{m.name}</td>
                  <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{m.email}</td>
                  <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell">{new Date(m.created_at).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${m.read ? "bg-muted text-muted-foreground" : "bg-primary/10 text-primary"}`}>
                      {m.read ? "Read" : "New"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => { setSelected(m); if (!m.read) markRead(m.id); }} className="p-1.5 text-muted-foreground hover:text-foreground">
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminMessages;
