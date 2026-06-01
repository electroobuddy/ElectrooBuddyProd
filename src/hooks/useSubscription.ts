import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  description: string;
  features: string[];
  duration_days: number;
  max_service_calls: number;
  parts_discount_percent: number;
  has_priority_support: boolean;
}

export interface UserSubscription {
  id: string;
  plan_id: string;
  user_id: string;
  start_date: string;
  end_date: string;
  status: string;
  payment_id: string | null;
  amount: number;
  currency: string;
  created_at: string;
  subscription_plans: SubscriptionPlan | null;
}

export interface BenefitUsage {
  id: string;
  benefit_type: string;
  booking_id: string | null;
  description: string | null;
  used_at: string;
  created_at: string;
}

export interface SubscriptionBenefits {
  serviceCallsUsed: number;
  serviceCallsTotal: number;
  serviceCallsRemaining: number;
  partsDiscountPercent: number;
  hasPrioritySupport: boolean;
  benefitUsage: BenefitUsage[];
}

const autoExpireSubscriptions = async (userId: string) => {
  const now = new Date().toISOString();
  await supabase
    .from("user_subscriptions")
    .update({ status: "expired" })
    .eq("user_id", userId)
    .eq("status", "active")
    .lt("end_date", now);
};

export function useSubscription() {
  const { user } = useAuth();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [activeSubscription, setActiveSubscription] = useState<UserSubscription | null>(null);
  const [allSubscriptions, setAllSubscriptions] = useState<UserSubscription[]>([]);
  const [benefits, setBenefits] = useState<SubscriptionBenefits | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchPlans = useCallback(async () => {
    const { data, error } = await supabase
      .from("subscription_plans")
      .select("*")
      .eq("is_active", true)
      .order("price", { ascending: true });

    if (error) {
      toast.error("Failed to load subscription plans.");
    } else {
      setPlans((data || []) as SubscriptionPlan[]);
    }
  }, []);

  const fetchBenefits = useCallback(async (subscriptionId: string) => {
    const { data: usageData } = await supabase
      .from("subscription_benefits_usage")
      .select("*")
      .eq("user_subscription_id", subscriptionId)
      .order("used_at", { ascending: false });

    return usageData || [];
  }, []);

  const fetchActiveSubscription = useCallback(async () => {
    if (!user) return;

    await autoExpireSubscriptions(user.id);

    const { data } = await supabase
      .from("user_subscriptions")
      .select("id, plan_id, end_date, status, subscription_plans(*)")
      .eq("user_id", user.id)
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    const sub = data as UserSubscription | null;
    setActiveSubscription(sub);

    if (sub) {
      const usage = await fetchBenefits(sub.id);
      const plan = sub.subscription_plans;
      const serviceCallsUsed = usage.filter((u: any) => u.benefit_type === "service_call").length;

      setBenefits({
        serviceCallsUsed,
        serviceCallsTotal: plan?.max_service_calls || 0,
        serviceCallsRemaining: Math.max(0, (plan?.max_service_calls || 0) - serviceCallsUsed),
        partsDiscountPercent: plan?.parts_discount_percent || 0,
        hasPrioritySupport: plan?.has_priority_support || false,
        benefitUsage: usage as BenefitUsage[],
      });
    } else {
      setBenefits(null);
    }
  }, [user, fetchBenefits]);

  const fetchAllSubscriptions = useCallback(async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("user_subscriptions")
      .select("id, status, start_date, end_date, amount, currency, payment_id, subscription_plans(*)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (!error) {
      setAllSubscriptions((data || []) as UserSubscription[]);
    }
  }, [user]);

  const recordBenefitUsage = useCallback(
    async (subscriptionId: string, benefitType: string, bookingId?: string, description?: string) => {
      if (!user) return null;

      const { data, error } = await supabase
        .from("subscription_benefits_usage")
        .insert({
          user_subscription_id: subscriptionId,
          user_id: user.id,
          benefit_type: benefitType,
          booking_id: bookingId || null,
          description: description || null,
        })
        .select("id")
        .single();

      if (!error) {
        await fetchActiveSubscription();
      }

      return data?.id || null;
    },
    [user, fetchActiveSubscription]
  );

  const useServiceCall = useCallback(
    async (subscriptionId: string, bookingId: string) => {
      if (!benefits || benefits.serviceCallsRemaining <= 0) {
        toast.error("No free service calls remaining in your plan.");
        return false;
      }

      const usageId = await recordBenefitUsage(
        subscriptionId,
        "service_call",
        bookingId,
        "Free service call used"
      );

      if (usageId) {
        toast.success("Free service call applied to this booking!");
        return true;
      }
      return false;
    },
    [benefits, recordBenefitUsage]
  );

  const hasActiveSubscription = useCallback(
    (planId?: string) => {
      if (!activeSubscription) return false;
      if (planId) return activeSubscription.plan_id === planId;
      return true;
    },
    [activeSubscription]
  );

  const isExpired = useCallback(
    (subscription: UserSubscription) => {
      return new Date(subscription.end_date) < new Date();
    },
    []
  );

  const getDaysRemaining = useCallback(
    (subscription: UserSubscription) => {
      const end = new Date(subscription.end_date);
      const now = new Date();
      const diff = end.getTime() - now.getTime();
      return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
    },
    []
  );

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([fetchPlans(), fetchActiveSubscription()]);
      setLoading(false);
    };
    init();
  }, [fetchPlans, fetchActiveSubscription]);

  return {
    plans,
    activeSubscription,
    allSubscriptions,
    benefits,
    loading,
    fetchPlans,
    fetchActiveSubscription,
    fetchAllSubscriptions,
    recordBenefitUsage,
    useServiceCall,
    hasActiveSubscription,
    isExpired,
    getDaysRemaining,
  };
}
