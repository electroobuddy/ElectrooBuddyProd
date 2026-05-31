import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { 
  Search, 
  Filter, 
  ArrowUpDown, 
  CheckCircle, 
  XCircle, 
  Clock, 
  User as UserIcon,
  CreditCard,
  Mail,
  Phone,
  MapPin,
  Calendar,
  X,
  Loader2,
  Download,
  RefreshCw
} from "lucide-react";
import { toast } from "sonner";

interface Subscription {
  id: string;
  user_id: string;
  subscription_plan_id: string;
  status: string;
  amount: number;
  currency: string;
  payment_id: string;
  start_date: string;
  end_date: string;
  created_at: string;
  subscription_plans?: { name: string };
  profile_full_name?: string;
  profile_phone?: string;
  profile_address?: string;
  profile_email?: string;
  usage_days?: number;
  total_days?: number;
  remaining_days?: number;
  usage_percent?: number;
}

const AdminSubscriptions = () => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      const { data, error } = await (supabase as any)
        .from('user_subscriptions')
        .select(`
          *,
          subscription_plans (name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const rows = data || [];
      const userIds = Array.from(new Set(rows.map((row: any) => row.user_id).filter(Boolean)));
      
      let profileMap: Record<string, any> = {};

      if (userIds.length > 0) {
        // Fetch profiles
        const { data: profiles } = await (supabase as any)
          .from("profiles")
          .select("user_id, full_name, phone, address, email")
          .in("user_id", userIds);

        // Build profile map
        (profiles || []).forEach((profile: any) => {
          profileMap[profile.user_id] = profile;
        });

        // Try to fetch emails from auth (admin only)
        try {
          const { data: authUsers } = await supabase.auth.admin.listUsers();
          if (authUsers?.users) {
            authUsers.users.forEach((authUser: any) => {
              if (profileMap[authUser.id]) {
                profileMap[authUser.id].email = authUser.email;
              }
            });
          }
        } catch {
          // Auth admin API may not be available, use profile email
        }
      }

      const hydrated = rows.map((row: any) => {
        const profile = profileMap[row.user_id] || {};
        const start = new Date(row.start_date).getTime();
        const end = new Date(row.end_date).getTime();
        const now = Date.now();
        const totalDays = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));
        const usedDays = Math.max(0, Math.min(totalDays, Math.floor((Math.min(now, end) - start) / (1000 * 60 * 60 * 24))));
        const remainingDays = Math.max(0, Math.ceil((end - now) / (1000 * 60 * 60 * 24)));
        const usagePercent = Math.max(0, Math.min(100, Math.round((usedDays / totalDays) * 100)));

        return {
          ...row,
          profile_full_name: profile.full_name || "N/A",
          profile_phone: profile.phone || "N/A",
          profile_address: profile.address || "N/A",
          profile_email: profile.email || "N/A",
          usage_days: usedDays,
          total_days: totalDays,
          remaining_days: remainingDays,
          usage_percent: usagePercent,
        };
      });

      setSubscriptions(hydrated);
    } catch (error: any) {
      toast.error("Error fetching subscriptions: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchSubscriptions();
    setRefreshing(false);
  };

  const filteredSubscriptions = subscriptions.filter(sub => {
    const matchesSearch = 
      sub.profile_full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.profile_phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.profile_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.user_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.payment_id?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || sub.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 dark:bg-emerald-950/30 dark:text-emerald-400 px-2.5 py-1 rounded-full text-xs font-semibold border border-emerald-200 dark:border-emerald-800"><CheckCircle size={12} /> Active</span>;
      case 'expired':
        return <span className="inline-flex items-center gap-1 text-zinc-600 bg-zinc-100 dark:bg-zinc-800 dark:text-zinc-400 px-2.5 py-1 rounded-full text-xs font-semibold border border-zinc-200 dark:border-zinc-700"><Clock size={12} /> Expired</span>;
      case 'cancelled':
        return <span className="inline-flex items-center gap-1 text-red-600 bg-red-50 dark:bg-red-950/30 dark:text-red-400 px-2.5 py-1 rounded-full text-xs font-semibold border border-red-200 dark:border-red-800"><XCircle size={12} /> Cancelled</span>;
      default:
        return <span className="inline-flex items-center gap-1 text-amber-600 bg-amber-50 dark:bg-amber-950/30 dark:text-amber-400 px-2.5 py-1 rounded-full text-xs font-semibold border border-amber-200 dark:border-amber-800"><Clock size={12} /> Pending</span>;
    }
  };

  const exportCSV = () => {
    const csv = "User Name,Email,Phone,Plan,Status,Amount,Start Date,End Date,Remaining Days\n" + 
      filteredSubscriptions.map(s => 
        `${s.profile_full_name},${s.profile_email},${s.profile_phone},${s.subscription_plans?.name || ""},${s.status},${s.amount},${s.start_date},${s.end_date},${s.remaining_days}`
      ).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `subscriptions-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV exported");
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <CreditCard size={22} className="text-blue-500" />
            User Subscriptions
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            {subscriptions.length} total · {subscriptions.filter(s => s.status === 'active').length} active
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={exportCSV}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 text-sm font-medium hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-all">
            <Download size={14} /> Export
          </button>
          <button onClick={handleRefresh} disabled={refreshing}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 text-sm font-medium hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-all disabled:opacity-60">
            <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} /> Refresh
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Search by name, email, phone, or payment ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm text-zinc-700 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="pending">Pending</option>
          <option value="expired">Expired</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50">
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">User</th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider hidden sm:table-cell">Email</th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">Plan</th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">Amount</th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider hidden md:table-cell">Usage</th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider hidden lg:table-cell">Expiry</th>
                <th className="px-4 py-3.5 text-right text-xs font-semibold text-zinc-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center">
                    <Loader2 className="w-6 h-6 animate-spin text-blue-500 mx-auto" />
                    <p className="text-zinc-500 mt-2">Loading subscriptions...</p>
                  </td>
                </tr>
              ) : filteredSubscriptions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center text-zinc-500">
                    No subscriptions found
                  </td>
                </tr>
              ) : (
                filteredSubscriptions.map((sub) => (
                  <tr key={sub.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center flex-shrink-0">
                          <span className="text-white font-bold text-sm">
                            {sub.profile_full_name?.[0]?.toUpperCase() || "?"}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-zinc-900 dark:text-white text-sm truncate">{sub.profile_full_name}</p>
                          <p className="text-xs text-zinc-400 truncate">{sub.profile_phone}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 hidden sm:table-cell">
                      <p className="text-sm text-zinc-500 truncate max-w-[180px]">{sub.profile_email}</p>
                    </td>
                    <td className="px-4 py-4">
                      <span className="font-semibold text-zinc-900 dark:text-white">{sub.subscription_plans?.name}</span>
                    </td>
                    <td className="px-4 py-4">{getStatusBadge(sub.status)}</td>
                    <td className="px-4 py-4 font-medium text-zinc-900 dark:text-white">₹{sub.amount}</td>
                    <td className="px-4 py-4 hidden md:table-cell">
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-zinc-700 dark:text-zinc-300">{sub.usage_days}/{sub.total_days} days</p>
                        <div className="w-24 h-2 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                          <div className="h-2 bg-blue-500 rounded-full transition-all" style={{ width: `${sub.usage_percent}%` }} />
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 hidden lg:table-cell">
                      <span className="text-sm text-zinc-500">
                        {new Date(sub.end_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <button onClick={() => setSelectedSubscription(sub)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/20 transition-colors">
                        View Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Drawer */}
      {selectedSubscription && (
        <>
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" onClick={() => setSelectedSubscription(null)} />
          <div className="fixed top-0 right-0 bottom-0 z-50 w-full max-w-lg bg-white dark:bg-zinc-900 shadow-2xl overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 p-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Subscription Details</h2>
              <button onClick={() => setSelectedSubscription(null)} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition">
                <X size={18} className="text-zinc-500" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* User Info Card */}
              <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-xl p-4 border border-zinc-200 dark:border-zinc-700">
                <h3 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider mb-3">User Information</h3>
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-xl">
                      {selectedSubscription.profile_full_name?.[0]?.toUpperCase() || "?"}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-lg text-zinc-900 dark:text-white">{selectedSubscription.profile_full_name}</p>
                    <div className="mt-2 space-y-1.5">
                      <p className="flex items-center gap-2 text-sm text-zinc-500">
                        <Mail size={14} className="text-zinc-400" /> {selectedSubscription.profile_email}
                      </p>
                      <p className="flex items-center gap-2 text-sm text-zinc-500">
                        <Phone size={14} className="text-zinc-400" /> {selectedSubscription.profile_phone}
                      </p>
                      {selectedSubscription.profile_address !== "N/A" && (
                        <p className="flex items-center gap-2 text-sm text-zinc-500">
                          <MapPin size={14} className="text-zinc-400" /> {selectedSubscription.profile_address}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Subscription Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-xl p-4 border border-zinc-200 dark:border-zinc-700">
                  <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1">Plan</p>
                  <p className="text-lg font-bold text-zinc-900 dark:text-white">{selectedSubscription.subscription_plans?.name}</p>
                </div>
                <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-xl p-4 border border-zinc-200 dark:border-zinc-700">
                  <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1">Amount</p>
                  <p className="text-lg font-bold text-zinc-900 dark:text-white">₹{selectedSubscription.amount} <span className="text-sm font-normal text-zinc-400">{selectedSubscription.currency}</span></p>
                </div>
                <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-xl p-4 border border-zinc-200 dark:border-zinc-700">
                  <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1">Status</p>
                  <div className="mt-1">{getStatusBadge(selectedSubscription.status)}</div>
                </div>
                <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-xl p-4 border border-zinc-200 dark:border-zinc-700">
                  <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1">Payment ID</p>
                  <p className="text-sm font-mono text-zinc-700 dark:text-zinc-300 break-all">{selectedSubscription.payment_id || "N/A"}</p>
                </div>
              </div>

              {/* Usage Timeline */}
              <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-xl p-4 border border-zinc-200 dark:border-zinc-700">
                <h3 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider mb-3">Usage Timeline</h3>
                <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400 mb-3">
                  <Calendar size={14} />
                  <span>{new Date(selectedSubscription.start_date).toLocaleDateString('en-IN')} → {new Date(selectedSubscription.end_date).toLocaleDateString('en-IN')}</span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-500">Used</span>
                    <span className="font-medium text-zinc-900 dark:text-white">{selectedSubscription.usage_days} of {selectedSubscription.total_days} days ({selectedSubscription.usage_percent}%)</span>
                  </div>
                  <div className="w-full h-3 rounded-full bg-zinc-200 dark:bg-zinc-700 overflow-hidden">
                    <div className="h-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all" style={{ width: `${selectedSubscription.usage_percent}%` }} />
                  </div>
                  <p className="text-xs text-zinc-500">
                    {selectedSubscription.remaining_days > 0
                      ? `${selectedSubscription.remaining_days} days remaining`
                      : "Subscription duration completed"}
                  </p>
                </div>
              </div>

              {/* User ID */}
              <div className="text-xs text-zinc-400 font-mono break-all">
                User ID: {selectedSubscription.user_id}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminSubscriptions;
