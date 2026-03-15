import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import ImageUpload from "@/components/admin/ImageUpload";

const emptyProject = { title: "", description: "", category: "", image_url: "" };

const AdminProjects = () => {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<any | null>(null);
  const [form, setForm] = useState(emptyProject);

  const fetchData = async () => {
    const { data } = await supabase.from("projects").select("*").order("created_at", { ascending: false });
    setProjects(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleSave = async () => {
    if (!form.title || !form.description || !form.category) return toast.error("All fields required");
    const payload = { ...form, image_url: form.image_url || null };
    if (editing?.id) {
      const { error } = await supabase.from("projects").update(payload).eq("id", editing.id);
      if (error) return toast.error(error.message);
    } else {
      const { error } = await supabase.from("projects").insert(payload);
      if (error) return toast.error(error.message);
    }
    toast.success("Saved");
    setEditing(null);
    setForm(emptyProject);
    fetchData();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete?")) return;
    await supabase.from("projects").delete().eq("id", id);
    toast.success("Deleted");
    fetchData();
  };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-heading font-bold text-foreground">Projects</h1>
        <button onClick={() => { setEditing({}); setForm(emptyProject); }} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:opacity-90">
          <Plus className="w-4 h-4" /> Add
        </button>
      </div>

      {editing && (
        <div className="bg-card border border-border rounded-xl p-6 mb-6 space-y-4">
          <ImageUpload
            folder="projects"
            currentUrl={form.image_url || null}
            onUpload={(url) => setForm({ ...form, image_url: url })}
            onRemove={() => setForm({ ...form, image_url: "" })}
          />
          <input placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
          <textarea placeholder="Description" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none" />
          <input placeholder="Category (e.g. Residential, Commercial)" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
          <div className="flex gap-3">
            <button onClick={handleSave} className="px-5 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg">Save</button>
            <button onClick={() => setEditing(null)} className="px-5 py-2 bg-muted text-muted-foreground text-sm font-medium rounded-lg">Cancel</button>
          </div>
        </div>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects.map((p) => (
          <div key={p.id} className="bg-card border border-border rounded-xl overflow-hidden">
            {p.image_url && <img src={p.image_url} alt={p.title} className="w-full h-36 object-cover" />}
            <div className="p-5">
              <span className="text-xs font-medium text-secondary">{p.category}</span>
              <h3 className="font-heading font-bold text-foreground mt-1">{p.title}</h3>
              <p className="text-xs text-muted-foreground mt-1">{p.description}</p>
              <div className="flex gap-2 mt-3">
                <button onClick={() => { setEditing(p); setForm({ title: p.title, description: p.description, category: p.category, image_url: p.image_url || "" }); }} className="p-1.5 text-muted-foreground hover:text-foreground"><Pencil className="w-4 h-4" /></button>
                <button onClick={() => handleDelete(p.id)} className="p-1.5 text-muted-foreground hover:text-destructive"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminProjects;
