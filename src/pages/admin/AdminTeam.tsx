import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import ImageUpload from "@/components/admin/ImageUpload";

const emptyMember = { name: "", role: "", bio: "", sort_order: 0, photo_url: "" };

const AdminTeam = () => {
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<any | null>(null);
  const [form, setForm] = useState(emptyMember);

  const fetchData = async () => {
    const { data } = await supabase.from("team_members").select("*").order("sort_order");
    setMembers(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleSave = async () => {
    if (!form.name || !form.role) return toast.error("Name and role required");
    const payload = { ...form, photo_url: form.photo_url || null };
    if (editing?.id) {
      const { error } = await supabase.from("team_members").update(payload).eq("id", editing.id);
      if (error) return toast.error(error.message);
      toast.success("Updated");
    } else {
      const { error } = await supabase.from("team_members").insert(payload);
      if (error) return toast.error(error.message);
      toast.success("Added");
    }
    setEditing(null);
    setForm(emptyMember);
    fetchData();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete?")) return;
    await supabase.from("team_members").delete().eq("id", id);
    toast.success("Deleted");
    fetchData();
  };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-heading font-bold text-foreground">Team Members</h1>
        <button onClick={() => { setEditing({}); setForm(emptyMember); }} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:opacity-90">
          <Plus className="w-4 h-4" /> Add Member
        </button>
      </div>

      {editing && (
        <div className="bg-card border border-border rounded-xl p-6 mb-6 space-y-4">
          <ImageUpload
            folder="team"
            currentUrl={form.photo_url || null}
            onUpload={(url) => setForm({ ...form, photo_url: url })}
            onRemove={() => setForm({ ...form, photo_url: "" })}
          />
          <input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
          <input placeholder="Role / Designation" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
          <textarea placeholder="Bio" rows={2} value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none" />
          <div className="flex gap-3">
            <button onClick={handleSave} className="px-5 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg">Save</button>
            <button onClick={() => setEditing(null)} className="px-5 py-2 bg-muted text-muted-foreground text-sm font-medium rounded-lg">Cancel</button>
          </div>
        </div>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {members.map((m) => (
          <div key={m.id} className="bg-card border border-border rounded-xl p-5">
            {m.photo_url && <img src={m.photo_url} alt={m.name} className="w-16 h-16 rounded-full object-cover mb-3" />}
            <h3 className="font-heading font-bold text-foreground">{m.name}</h3>
            <p className="text-sm text-secondary font-medium">{m.role}</p>
            <p className="text-xs text-muted-foreground mt-1">{m.bio}</p>
            <div className="flex gap-2 mt-3">
              <button onClick={() => { setEditing(m); setForm({ name: m.name, role: m.role, bio: m.bio || "", sort_order: m.sort_order, photo_url: m.photo_url || "" }); }} className="p-1.5 text-muted-foreground hover:text-foreground"><Pencil className="w-4 h-4" /></button>
              <button onClick={() => handleDelete(m.id)} className="p-1.5 text-muted-foreground hover:text-destructive"><Trash2 className="w-4 h-4" /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminTeam;
