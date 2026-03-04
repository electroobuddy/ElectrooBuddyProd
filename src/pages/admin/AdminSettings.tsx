import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

const AdminSettings = () => {
  const [phone, setPhone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from("site_settings").select("*");
      if (data) {
        data.forEach((s: any) => {
          if (s.key === "phone_number") setPhone(s.value);
          if (s.key === "whatsapp_number") setWhatsapp(s.value);
        });
      }
      setLoading(false);
    };
    fetch();
  }, []);

  const save = async () => {
    await supabase.from("site_settings").update({ value: phone }).eq("key", "phone_number");
    await supabase.from("site_settings").update({ value: whatsapp }).eq("key", "whatsapp_number");
    toast.success("Settings saved");
  };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;

  return (
    <div>
      <h1 className="text-2xl font-heading font-bold text-foreground mb-6">Site Settings</h1>
      <div className="bg-card border border-border rounded-xl p-6 max-w-lg space-y-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Phone Number</label>
          <input value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">WhatsApp Number (without +)</label>
          <input value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
        </div>
        <button onClick={save} className="px-5 py-2.5 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:opacity-90">
          Save Settings
        </button>
      </div>
    </div>
  );
};

export default AdminSettings;
