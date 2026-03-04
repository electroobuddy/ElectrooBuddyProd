import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Pencil, Trash2, Loader2, Star } from "lucide-react";
import { toast } from "sonner";

const emptyTest = { name: "", text: "", rating: 5, service: "" };

const AdminTestimonials = () => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<any | null>(null);
  const [form, setForm] = useState(emptyTest);

  const fetch = async () => {
    const { data } = await supabase.from("testimonials").select("*").order("created_at", { ascending: false });
    setItems(data || []);
    setLoading(false);
  };

  useEffect(() => { fetch(); }, []);

  const handleSave = async () => {
    if (!form.name || !form.text) return toast.error("Name and text required");
    if (editing?.id) {
      const { error } = await supabase.from("testimonials").update(form).eq("id", editing.id);
      if (error) return toast.error(error.message);
    } else {
      const { error } = await supabase.from("testimonials").insert(form);
      if (error) return toast.error(error.message);
    }
    toast.success("Saved");
    setEditing(null);
    setForm(emptyTest);
    fetch();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete?")) return;
    await supabase.from("testimonials").delete().eq("id", id);
    toast.success("Deleted");
    fetch();
  };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-heading font-bold text-foreground">Testimonials</h1>
        <button onClick={() => { setEditing({}); setForm(emptyTest); }} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:opacity-90">
          <Plus className="w-4 h-4" /> Add
        </button>
      </div>

      {editing && (
        <div className="bg-card border border-border rounded-xl p-6 mb-6 space-y-4">
          <input placeholder="Customer Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
          <textarea placeholder="Testimonial text" rows={3} value={form.text} onChange={(e) => setForm({ ...form, text: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none" />
          <input placeholder="Service" value={form.service} onChange={(e) => setForm({ ...form, service: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Rating</label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((r) => (
                <button key={r} onClick={() => setForm({ ...form, rating: r })}>
                  <Star className={`w-5 h-5 ${r <= form.rating ? "fill-secondary text-secondary" : "text-muted-foreground"}`} />
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={handleSave} className="px-5 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg">Save</button>
            <button onClick={() => setEditing(null)} className="px-5 py-2 bg-muted text-muted-foreground text-sm font-medium rounded-lg">Cancel</button>
          </div>
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-4">
        {items.map((t) => (
          <div key={t.id} className="bg-card border border-border rounded-xl p-5">
            <div className="flex gap-0.5 mb-2">
              {Array.from({ length: t.rating }).map((_, i) => <Star key={i} className="w-3.5 h-3.5 fill-secondary text-secondary" />)}
            </div>
            <p className="text-sm text-muted-foreground mb-2">"{t.text}"</p>
            <p className="text-sm font-medium text-foreground">{t.name}</p>
            <div className="flex gap-2 mt-3">
              <button onClick={() => { setEditing(t); setForm({ name: t.name, text: t.text, rating: t.rating, service: t.service || "" }); }} className="p-1.5 text-muted-foreground hover:text-foreground"><Pencil className="w-4 h-4" /></button>
              <button onClick={() => handleDelete(t.id)} className="p-1.5 text-muted-foreground hover:text-destructive"><Trash2 className="w-4 h-4" /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminTestimonials;
