import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Users, Search, Shield, User, Mail, Calendar } from "lucide-react";

interface UserProfile {
  user_id: string;
  full_name: string;
  phone: string;
  address: string;
  created_at: string;
  email?: string;
  role?: string;
}

const AdminUsers = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchUsers = async () => {
    setLoading(true);
    // Fetch profiles
    const { data: profiles, error } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Failed to load users");
      setLoading(false);
      return;
    }

    // Fetch roles
    const { data: roles } = await supabase.from("user_roles").select("*");
    const roleMap: Record<string, string> = {};
    (roles || []).forEach((r: any) => {
      roleMap[r.user_id] = r.role;
    });

    // We don't have direct access to auth.users emails from client, 
    // so we'll show user_id. For better UX, we store email in bookings.
    // Let's try to get emails from bookings table as a workaround.
    const { data: bookings } = await supabase.from("bookings").select("user_id, name").not("user_id", "is", null);
    const nameMap: Record<string, string> = {};
    (bookings || []).forEach((b: any) => {
      if (b.user_id && !nameMap[b.user_id]) nameMap[b.user_id] = b.name;
    });

    const combined = (profiles || []).map((p: any) => ({
      ...p,
      role: roleMap[p.user_id] || "user",
      booking_name: nameMap[p.user_id] || "",
    }));

    setUsers(combined);
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    return (
      (u.full_name || "").toLowerCase().includes(q) ||
      (u.phone || "").toLowerCase().includes(q) ||
      u.user_id.toLowerCase().includes(q) ||
      ((u as any).booking_name || "").toLowerCase().includes(q)
    );
  });

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground flex items-center gap-2">
            <Users className="w-6 h-6 text-primary" /> Users
          </h1>
          <p className="text-sm text-muted-foreground">{users.length} registered users</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-6 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, phone, or ID..."
          className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-card border border-dashed border-border rounded-xl">
          <Users className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="font-heading font-bold text-foreground">No users found</p>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block bg-card border border-border rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">User</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Phone</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Address</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Role</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((u: any) => (
                    <tr key={u.user_id} className="border-b border-border last:border-0 hover:bg-muted/30 transition">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <User className="w-4 h-4 text-primary" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-foreground truncate">
                              {u.full_name || u.booking_name || "Unnamed"}
                            </p>
                            <p className="text-xs text-muted-foreground truncate max-w-[200px]">{u.user_id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{u.phone || "—"}</td>
                      <td className="px-4 py-3 text-muted-foreground truncate max-w-[200px]">{u.address || "—"}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
                          u.role === "admin"
                            ? "bg-primary/10 text-primary"
                            : "bg-muted text-muted-foreground"
                        }`}>
                          {u.role === "admin" && <Shield className="w-3 h-3" />}
                          {u.role}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                        {new Date(u.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-3">
            {filtered.map((u: any) => (
              <div key={u.user_id} className="bg-card border border-border rounded-xl p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <User className="w-5 h-5 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-heading font-bold text-foreground truncate">
                      {u.full_name || u.booking_name || "Unnamed"}
                    </p>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
                      u.role === "admin" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                    }`}>
                      {u.role === "admin" && <Shield className="w-3 h-3" />}
                      {u.role}
                    </span>
                  </div>
                </div>
                <div className="space-y-1.5 text-sm text-muted-foreground">
                  {u.phone && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5" /> {u.phone}
                    </div>
                  )}
                  {u.address && (
                    <div className="flex items-center gap-2">
                      <User className="w-3.5 h-3.5" /> <span className="truncate">{u.address}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5" />
                    Joined {new Date(u.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default AdminUsers;
