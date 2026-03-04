import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";

const emptyService = { title: "", description: "", icon_name: "Zap", whatsapp_enabled: true, call_enabled: true, book_now_enabled: true, sort_order: 0 };

const AdminServices = () => {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<any | null>(null);
  const [form, setForm] = useState(emptyService);

  const fetch = async () => {
    const { data } = await supabase.from("services").select("*").order("sort_order");
    setServices(data || []);
    setLoading(false);
  };

  useEffect(() => { fetch(); }, []);

  const handleSave = async () => {
    if (!form.title || !form.description) return toast.error("Title and description required");
    if (editing?.id) {
      const { error } = await supabase.from("services").update(form).eq("id", editing.id);
      if (error) return toast.error(error.message);
      toast.success("Service updated");
    } else {
      const { error } = await supabase.from("services").insert(form);
      if (error) return toast.error(error.message);
      toast.success("Service added");
    }
    setEditing(null);
    setForm(emptyService);
    fetch();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this service?")) return;
    const { error } = await supabase.from("services").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Service deleted");
    fetch();
  };

  const startEdit = (s: any) => {
    setEditing(s);
    setForm({ title: s.title, description: s.description, icon_name: s.icon_name, whatsapp_enabled: s.whatsapp_enabled, call_enabled: s.call_enabled, book_now_enabled: s.book_now_enabled, sort_order: s.sort_order });
  };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-heading font-bold text-foreground">Services</h1>
        <button onClick={() => { setEditing({}); setForm(emptyService); }} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:opacity-90">
          <Plus className="w-4 h-4" /> Add Service
        </button>
      </div>

      {editing && (
        <div className="bg-card border border-border rounded-xl p-6 mb-6 space-y-4">
          <h2 className="font-heading font-semibold text-foreground">{editing.id ? "Edit" : "Add"} Service</h2>
          <input placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
          <textarea placeholder="Description" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none" />
          <input placeholder="Icon name (e.g. Zap, Plug, Wrench)" value={form.icon_name} onChange={(e) => setForm({ ...form, icon_name: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
          <div className="flex flex-wrap gap-4">
            {(["whatsapp_enabled", "call_enabled", "book_now_enabled"] as const).map((key) => (
              <label key={key} className="flex items-center gap-2 text-sm text-foreground">
                <input type="checkbox" checked={(form as any)[key]} onChange={(e) => setForm({ ...form, [key]: e.target.checked })} className="rounded" />
                {key.replace("_enabled", "").replace("_", " ").replace(/\b\w/g, l => l.toUpperCase())}
              </label>
            ))}
          </div>
          <div className="flex gap-3">
            <button onClick={handleSave} className="px-5 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:opacity-90">Save</button>
            <button onClick={() => setEditing(null)} className="px-5 py-2 bg-muted text-muted-foreground text-sm font-medium rounded-lg">Cancel</button>
          </div>
        </div>
      )}

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Title</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">WhatsApp</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">Call</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">Book Now</th>
              <th className="text-right px-4 py-3 font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {services.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">No services yet</td></tr>
            ) : (
              services.map((s) => (
                <tr key={s.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 text-foreground font-medium">{s.title}</td>
                  <td className="px-4 py-3 hidden md:table-cell">{s.whatsapp_enabled ? "✅" : "❌"}</td>
                  <td className="px-4 py-3 hidden md:table-cell">{s.call_enabled ? "✅" : "❌"}</td>
                  <td className="px-4 py-3 hidden md:table-cell">{s.book_now_enabled ? "✅" : "❌"}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => startEdit(s)} className="p-1.5 text-muted-foreground hover:text-foreground"><Pencil className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(s.id)} className="p-1.5 text-muted-foreground hover:text-destructive"><Trash2 className="w-4 h-4" /></button>
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

export default AdminServices;
