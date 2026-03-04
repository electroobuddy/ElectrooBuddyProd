import { supabase } from "@/integrations/supabase/client";

/**
 * To create the first admin:
 * 1. Sign up at /admin with email + password
 * 2. Then run this SQL in Cloud > Run SQL:
 *    INSERT INTO public.user_roles (user_id, role) 
 *    SELECT id, 'admin' FROM auth.users WHERE email = 'your-email@example.com';
 */

export const signUpAdmin = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signUp({ email, password });
  return { data, error };
};
