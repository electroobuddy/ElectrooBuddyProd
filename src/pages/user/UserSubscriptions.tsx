import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { CreditCard, CalendarClock, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

const UserSubscriptions = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);

  useEffect(() => {
    const fetchSubscriptions = async () => {
      if (!user) return;
      try {
        const { data, error } = await (supabase as any)
          .from("user_subscriptions")
          .select("id, status, start_date, end_date, amount, currency, payment_id, subscription_plans(name, description)")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (error) throw error;
        setSubscriptions(data || []);
      } catch (error: any) {
        toast.error(error.message || "Failed to load subscriptions");
      } finally {
        setLoading(false);
      }
    };

    fetchSubscriptions();
  }, [user]);

  if (loading) {
    return <div className="p-6">Loading subscriptions...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <ShieldCheck className="text-primary" />
          My Subscriptions
        </h1>
        <p className="text-muted-foreground">Track your maintenance plans and validity.</p>
      </div>

      {subscriptions.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-8 text-center">
          <p className="text-muted-foreground mb-4">You do not have any subscription yet.</p>
          <Link to="/subscriptions" className="inline-flex px-4 py-2 rounded-lg bg-primary text-primary-foreground">
            Explore Plans
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {subscriptions.map((sub) => (
            <div key={sub.id} className="rounded-xl border border-border bg-card p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-lg font-semibold">{sub.subscription_plans?.name || "Maintenance Plan"}</h2>
                <span
                  className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                    sub.status === "active"
                      ? "bg-green-100 text-green-700"
                      : sub.status === "expired"
                        ? "bg-zinc-100 text-zinc-700"
                        : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {sub.status}
                </span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">{sub.subscription_plans?.description}</p>

              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                <p className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-primary" />
                  {sub.currency} {Number(sub.amount).toLocaleString("en-IN")}
                </p>
                <p className="flex items-center gap-2">
                  <CalendarClock className="w-4 h-4 text-primary" />
                  Start: {new Date(sub.start_date).toLocaleDateString("en-IN")}
                </p>
                <p className="flex items-center gap-2">
                  <CalendarClock className="w-4 h-4 text-primary" />
                  End: {new Date(sub.end_date).toLocaleDateString("en-IN")}
                </p>
              </div>

              {sub.payment_id && (
                <p className="text-xs text-muted-foreground mt-3 font-mono">Payment ID: {sub.payment_id}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserSubscriptions;
