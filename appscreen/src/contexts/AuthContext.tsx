// Authentication Context for React Native - matching web implementation

import { Session, User } from "@supabase/supabase-js";
import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { supabase } from "../services/supabase";

interface AuthContextType {
  session: Session | null;
  user: User | null;
  isAdmin: boolean;
  isTechnician: boolean;
  loading: boolean;
  signIn: (
    email: string,
    password: string,
    rememberMe?: boolean,
  ) => Promise<{ error: any }>;
  signUp: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isTechnician, setIsTechnician] = useState(false);
  const [loading, setLoading] = useState(true);
  const initialized = useRef(false);

  const checkUserRoles = async (userId: string) => {
    try {
      console.log("🔍 Checking roles for user:", userId);

      // Fetch all roles for the user
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId);

      if (error) {
        console.error("❌ Error fetching roles:", error);
        setIsAdmin(false);
        setIsTechnician(false);
        return;
      }

      console.log("🎭 Fetched roles:", data);

      // Check each role
      const hasAdminRole = data?.some((r) => r.role === "admin") || false;
      const hasTechnicianRole =
        data?.some((r) => r.role === "technician") || false;

      console.log("✅ Is Admin?", hasAdminRole);
      console.log("✅ Is Technician?", hasTechnicianRole);

      setIsAdmin(hasAdminRole);
      setIsTechnician(hasTechnicianRole);
    } catch (err) {
      console.error("❌ Exception in checkUserRoles:", err);
      setIsAdmin(false);
      setIsTechnician(false);
    }
  };

  useEffect(() => {
    // First, restore session from storage
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        await checkUserRoles(session.user.id);
      }
      initialized.current = true;
      setLoading(false);
    });

    // Then listen for subsequent auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      // Only process after initial load is done
      if (!initialized.current) return;

      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        await checkUserRoles(session.user.id);
      } else {
        setIsAdmin(false);
        setIsTechnician(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (
    email: string,
    password: string,
    rememberMe: boolean = true,
  ) => {
    // Note: Supabase automatically persists sessions by default.
    // The rememberMe flag is handled on the client side via AsyncStorage
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: undefined }, // React Native doesn't have window.location
    });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setIsAdmin(false);
    setIsTechnician(false);
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        isAdmin,
        isTechnician,
        loading,
        signIn,
        signUp,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
