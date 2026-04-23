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
  CreditCard
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const AdminSubscriptions = () => {
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedSubscription, setSelectedSubscription] = useState<any | null>(null);

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
      let profileNameByUserId: Record<string, string> = {};

      if (userIds.length > 0) {
        const { data: profiles, error: profilesError } = await (supabase as any)
          .from("profiles")
          .select("user_id, full_name, phone, address")
          .in("user_id", userIds);

        if (profilesError) throw profilesError;

        const profileMap = (profiles || []).reduce((acc: Record<string, any>, profile: any) => {
          acc[profile.user_id] = profile;
          return acc;
        }, {});
        profileNameByUserId = profileMap as any;
      }

      const hydrated = rows.map((row: any) => {
        const profile = profileNameByUserId[row.user_id] || {};
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

  const filteredSubscriptions = subscriptions.filter(sub => {
    const matchesSearch = 
      sub.profile_full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.profile_phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.user_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.payment_id?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || sub.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <span className="flex items-center gap-1 text-green-600 bg-green-50 px-2 py-1 rounded-full text-xs font-medium"><CheckCircle size={14} /> Active</span>;
      case 'expired':
        return <span className="flex items-center gap-1 text-gray-600 bg-gray-50 px-2 py-1 rounded-full text-xs font-medium"><Clock size={14} /> Expired</span>;
      case 'cancelled':
        return <span className="flex items-center gap-1 text-red-600 bg-red-50 px-2 py-1 rounded-full text-xs font-medium"><XCircle size={14} /> Cancelled</span>;
      default:
        return <span className="flex items-center gap-1 text-yellow-600 bg-yellow-50 px-2 py-1 rounded-full text-xs font-medium"><Clock size={14} /> Pending</span>;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <CreditCard className="text-primary" />
            User Subscriptions
          </h1>
          <p className="text-muted-foreground">Manage and monitor annual maintenance plans.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="relative w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search user or payment ID..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px]">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="expired">Expired</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={fetchSubscriptions} variant="outline" size="icon">
            <ArrowUpDown className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="border rounded-lg bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Used</TableHead>
              <TableHead>Expiry Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={7} className="text-center py-8">Loading subscriptions...</TableCell></TableRow>
            ) : filteredSubscriptions.length === 0 ? (
              <TableRow><TableCell colSpan={7} className="text-center py-8">No subscriptions found.</TableCell></TableRow>
            ) : (
              filteredSubscriptions.map((sub) => (
                <TableRow key={sub.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <UserIcon size={14} className="text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{sub.profile_full_name || "N/A"}</p>
                        <p className="text-xs text-muted-foreground font-mono">{sub.payment_id || "No Payment ID"}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-semibold">{sub.subscription_plans?.name}</span>
                  </TableCell>
                  <TableCell>{getStatusBadge(sub.status)}</TableCell>
                  <TableCell className="font-medium">₹{sub.amount}</TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <p className="text-xs font-medium">{sub.usage_days}/{sub.total_days} days</p>
                      <div className="w-28 h-2 rounded-full bg-muted overflow-hidden">
                        <div className="h-2 bg-primary" style={{ width: `${sub.usage_percent}%` }} />
                      </div>
                      <p className="text-[11px] text-muted-foreground">
                        {sub.remaining_days > 0 ? `${sub.remaining_days} days left` : "Ended"}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">
                      {new Date(sub.end_date).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => setSelectedSubscription(sub)}>Details</Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {selectedSubscription && (
        <div className="border rounded-lg bg-card p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Subscription Details</h2>
            <Button variant="outline" size="sm" onClick={() => setSelectedSubscription(null)}>
              Close
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-1">
              <p><span className="font-medium">User Name:</span> {selectedSubscription.profile_full_name}</p>
              <p><span className="font-medium">Phone:</span> {selectedSubscription.profile_phone}</p>
              <p><span className="font-medium">Address:</span> {selectedSubscription.profile_address}</p>
              <p><span className="font-medium">User ID:</span> <span className="font-mono text-xs">{selectedSubscription.user_id}</span></p>
            </div>

            <div className="space-y-1">
              <p><span className="font-medium">Plan:</span> {selectedSubscription.subscription_plans?.name}</p>
              <p><span className="font-medium">Amount:</span> ₹{selectedSubscription.amount} {selectedSubscription.currency}</p>
              <p><span className="font-medium">Payment ID:</span> <span className="font-mono text-xs">{selectedSubscription.payment_id || "N/A"}</span></p>
              <p><span className="font-medium">Status:</span> {selectedSubscription.status}</p>
            </div>
          </div>

          <div className="border rounded-md p-4 bg-muted/30 space-y-2">
            <p className="font-medium">Usage Timeline</p>
            <p className="text-sm">
              {new Date(selectedSubscription.start_date).toLocaleDateString('en-IN')} -{" "}
              {new Date(selectedSubscription.end_date).toLocaleDateString('en-IN')}
            </p>
            <p className="text-sm">
              Used {selectedSubscription.usage_days} of {selectedSubscription.total_days} days
              {" "}({selectedSubscription.usage_percent}%)
            </p>
            <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
              <div className="h-2 bg-primary" style={{ width: `${selectedSubscription.usage_percent}%` }} />
            </div>
            <p className="text-sm text-muted-foreground">
              {selectedSubscription.remaining_days > 0
                ? `${selectedSubscription.remaining_days} days remaining`
                : "Subscription duration completed"}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSubscriptions