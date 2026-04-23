import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle, Crown, Sparkles } from "lucide-react";
import Section from "@/components/Section";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button"; // Assuming a Button component
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"; // Assuming Card components
import { useAuth } from "@/hooks/useAuth"; // Assuming an auth hook to get current user
import SEO from "@/components/SEO"; // Assuming an SEO component for meta tags

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  description: string;
    duration_days: number;
  features: string[];
}

const Subscriptions = () => {
  const { user } = useAuth(); // Get current user from auth hook
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);

  useEffect(() => {
    const fetchPlans = async () => {
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('is_active', true)
        .order('price', { ascending: true });

      if (error) {
        toast.error("Failed to load subscription plans.");
        console.error("Error fetching plans:", error);
      } else {
        setPlans(data || []);
      }
      setLoading(false);
    };

    fetchPlans();
  }, []);

  const handleSubscribe = async (plan: SubscriptionPlan) => {
    if (!user) {
      toast.info("Please log in to subscribe.");
      // Redirect to login or show login modal
      return;
    }

    setSelectedPlanId(plan.id);
    // In a real application, this would initiate a payment flow
    // For now, we'll simulate a successful subscription
    toast.loading(`Initiating payment for ${plan.name}...`);

    try {
      // Simulate payment gateway interaction
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Create a pending subscription record
      const { data, error } = await supabase
        .from('user_subscriptions')
        .insert({
          user_id: user.id,
          plan_id: plan.id,
          start_date: new Date().toISOString(),
          end_date: new Date(Date.now() + plan.duration_days * 24 * 60 * 60 * 1000).toISOString(),
          status: 'active', // Will be 'pending' until webhook confirms payment
          amount: plan.price,
          currency: plan.currency,
          payment_id: `mock_payment_${Date.now()}` // Replace with actual payment ID
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      toast.dismiss();
      toast.success(`Successfully subscribed to ${plan.name}!`);
      // Optionally redirect to dashboard or show success message
    } catch (error: any) {
      toast.dismiss();
      toast.error(`Subscription failed: ${error.message || 'Unknown error'}`);
      console.error("Subscription error:", error);
    } finally {
      setSelectedPlanId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p>Loading plans...</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen py-12">
      <Section>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Annual Maintenance Plans
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Ensure your electrical systems are always in top condition with our annual maintenance subscriptions.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {plans.map((plan) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="flex flex-col h-full">
                <CardHeader className="text-center">
                  <CardTitle className="text-3xl font-bold text-blue-600 dark:text-blue-400 flex items-center justify-center gap-2">
                    {plan.name.includes('Premium') ? <Crown className="w-6 h-6" /> : <Sparkles className="w-6 h-6" />}
                    {plan.name}
                  </CardTitle>
                  <CardDescription className="text-lg mt-2">
                    {plan.description}
                  </CardDescription>
                  <p className="text-5xl font-extrabold text-gray-900 dark:text-white mt-4">
                    ₹{plan.price}
                    <span className="text-lg font-medium text-gray-500 dark:text-gray-400">/year</span>
                  </p>
                </CardHeader>
                <CardContent className="flex-grow">
                  <ul className="space-y-3 text-gray-700 dark:text-gray-300">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full text-lg py-6"
                    onClick={() => handleSubscribe(plan)}
                    disabled={selectedPlanId === plan.id}
                  >
                    {selectedPlanId === plan.id ? 'Processing...' : 'Choose Plan'}
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>
      </Section>
    </div>
  );
};

export default Subscriptions;