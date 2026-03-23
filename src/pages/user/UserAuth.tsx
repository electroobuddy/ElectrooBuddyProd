import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { Zap, Loader2, Mail, Lock, User, ArrowRight } from "lucide-react";
import { toast } from "sonner";

const UserAuth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();

  // Auto-fill remembered email on mount
  useEffect(() => {
    const rememberedEmail = localStorage.getItem('electro_remembered_email');
    const isRemembered = localStorage.getItem('electro_remember_me');
    if (rememberedEmail && isRemembered === 'true') {
      setEmail(rememberedEmail);
      setRememberMe(true);
    }
  }, []);

  if (user) {
    navigate("/dashboard", { replace: true });
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (isLogin) {
      // Use remember me for session persistence
      const { error } = await signIn(email, password, rememberMe);
      if (error) {
        toast.error(error.message || "Login failed");
        console.error('❌ Login error:', error);
      } else {
        console.log('✅ Login successful!');
        
        // Fetch and log user roles after successful login
        const fetchUserRoles = async () => {
          try {
            // Get current user from auth state
            const { data: { user } } = await supabase.auth.getUser();
            
            if (user) {
              console.log('👤 Current user:', user.email);
              
              const { data: rolesData, error: rolesError } = await supabase
                .from('user_roles')
                .select('role')
                .eq('user_id', user.id);
              
              if (rolesError) {
                console.error('❌ Error fetching roles:', rolesError);
              } else {
                console.log('🎭 User Roles:', rolesData);
                console.log('Roles array:', rolesData.map((r: any) => r.role));
                
                // Check for specific roles
                const hasAdminRole = rolesData.some((r: any) => r.role === 'admin');
                const hasTechnicianRole = rolesData.some((r: any) => r.role === 'technician');
                const hasUserRole = rolesData.some((r: any) => r.role === 'user');
                
                console.log('📋 Role Check:');
                console.log('  - Is Admin?', hasAdminRole);
                console.log('  - Is Technician?', hasTechnicianRole);
                console.log('  - Is User?', hasUserRole);
              }
            }
          } catch (err) {
            console.error('Unexpected error fetching user:', err);
          }
        };
        
        fetchUserRoles();
        
        toast.success("Welcome back!");
        
        // Store email if remember me is checked (for convenience only)
        if (rememberMe) {
          localStorage.setItem('electro_remembered_email', email);
          localStorage.setItem('electro_remember_me', 'true');
        } else {
          localStorage.removeItem('electro_remembered_email');
          localStorage.removeItem('electro_remember_me');
        }
        
        navigate("/dashboard");
      }
    } else {
      if (password.length < 6) {
        toast.error("Password must be at least 6 characters");
        setLoading(false);
        return;
      }
      const { error } = await signUp(email, password);
      if (error) {
        toast.error(error.message || "Sign up failed");
        console.error('❌ Signup error:', error);
      } else {
        console.log('✅ Signup successful!');
        
        // Log the default role that was created
        setTimeout(async () => {
          try {
            const { data: { user } } = await supabase.auth.getUser();
            
            if (user) {
              console.log('🆕 New user created with ID:', user.id);
              console.log('📧 Email:', user.email);
              
              // Fetch the role that was automatically assigned
              const { data: rolesData, error: rolesError } = await supabase
                .from('user_roles')
                .select('role')
                .eq('user_id', user.id);
              
              if (rolesError) {
                console.error('❌ Error fetching roles after signup:', rolesError);
              } else {
                console.log('🎭 Default Role Assigned:', rolesData);
              }
            }
          } catch (err) {
            console.error('Unexpected error fetching user after signup:', err);
          }
        }, 1000);
        
        toast.success("Account created! Please check your email to verify your account.");
      }
    }
    setLoading(false);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700;800;900&family=DM+Sans:wght@400;500;600&display=swap');

        .auth-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px 20px;
          background: hsl(var(--background));
          font-family: 'DM Sans', sans-serif;
          position: relative;
          overflow: hidden;
        }

        .auth-grid-bg {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(hsl(var(--primary) / 0.03) 1px, transparent 1px),
            linear-gradient(90deg, hsl(var(--primary) / 0.03) 1px, transparent 1px);
          background-size: 60px 60px;
          mask-image: radial-gradient(ellipse 70% 70% at 50% 50%, black 20%, transparent 100%);
        }

        .auth-glow {
          position: absolute;
          top: -100px;
          left: 50%;
          transform: translateX(-50%);
          width: 600px;
          height: 400px;
          background: radial-gradient(ellipse, hsl(var(--primary) / 0.1) 0%, transparent 70%);
          pointer-events: none;
        }

        .auth-card {
          position: relative;
          width: 100%;
          max-width: 440px;
          background: hsl(var(--card));
          border: 1px solid hsl(var(--border) / 0.3);
          border-radius: 24px;
          padding: 48px 40px;
          overflow: hidden;
        }

        @media (max-width: 480px) {
          .auth-card { padding: 36px 24px; }
        }

        .auth-corner-tl {
          position: absolute;
          top: 0; left: 0;
          width: 60px; height: 60px;
          border-top: 2px solid hsl(var(--primary) / 0.3);
          border-left: 2px solid hsl(var(--primary) / 0.3);
          border-radius: 24px 0 0 0;
          pointer-events: none;
        }

        .auth-corner-br {
          position: absolute;
          bottom: 0; right: 0;
          width: 60px; height: 60px;
          border-bottom: 2px solid hsl(var(--primary) / 0.15);
          border-right: 2px solid hsl(var(--primary) / 0.15);
          border-radius: 0 0 24px 0;
          pointer-events: none;
        }

        .auth-logo {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          margin-bottom: 32px;
        }

        .auth-logo-icon {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          background: linear-gradient(135deg, hsl(var(--primary)), hsl(var(--electric-blue-dark)));
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 0 24px hsl(var(--primary) / 0.3);
        }

        .auth-logo-text {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 26px;
          font-weight: 800;
          text-transform: uppercase;
          color: hsl(var(--foreground));
        }

        .auth-logo-text span {
          background: linear-gradient(135deg, hsl(var(--secondary)), hsl(var(--electric-yellow-light)));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .auth-title {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 28px;
          font-weight: 800;
          text-transform: uppercase;
          color: hsl(var(--foreground));
          text-align: center;
          margin-bottom: 8px;
        }

        .auth-subtitle {
          text-align: center;
          font-size: 14px;
          color: hsl(var(--muted-foreground));
          margin-bottom: 32px;
        }

        .auth-field {
          margin-bottom: 18px;
        }

        .auth-label {
          display: block;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.8px;
          text-transform: uppercase;
          color: hsl(var(--muted-foreground) / 0.6);
          margin-bottom: 8px;
          font-family: 'Barlow Condensed', sans-serif;
        }

        .auth-input-wrap {
          position: relative;
        }

        .auth-input-icon {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          color: hsl(var(--muted-foreground) / 0.4);
          pointer-events: none;
        }

        .auth-input {
          width: 100%;
          padding: 13px 16px 13px 42px;
          background: hsl(var(--primary) / 0.03);
          border: 1px solid hsl(var(--border) / 0.3);
          border-radius: 12px;
          color: hsl(var(--foreground));
          font-size: 14px;
          font-family: 'DM Sans', sans-serif;
          outline: none;
          transition: all 0.25s ease;
        }

        .auth-input::placeholder {
          color: hsl(var(--muted-foreground) / 0.3);
        }

        .auth-input:focus {
          border-color: hsl(var(--primary) / 0.5);
          box-shadow: 0 0 0 3px hsl(var(--primary) / 0.08);
        }

        .auth-submit {
          width: 100%;
          padding: 14px;
          background: linear-gradient(135deg, hsl(var(--primary)), hsl(var(--electric-blue-dark)));
          color: hsl(var(--primary-foreground));
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 16px;
          font-weight: 800;
          letter-spacing: 0.8px;
          text-transform: uppercase;
          border: none;
          border-radius: 12px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin-top: 24px;
          transition: all 0.3s ease;
        }

        .auth-submit:hover:not(:disabled) {
          box-shadow: 0 0 28px hsl(var(--primary) / 0.4);
          transform: translateY(-2px);
        }

        .auth-submit:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .auth-toggle {
          text-align: center;
          margin-top: 24px;
          font-size: 13px;
          color: hsl(var(--muted-foreground));
        }

        .auth-toggle-btn {
          background: none;
          border: none;
          color: hsl(var(--primary));
          font-weight: 600;
          cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          transition: opacity 0.2s;
        }

        .auth-toggle-btn:hover { opacity: 0.7; }

        .auth-remember {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 20px;
        }

        .auth-remember-input {
          width: 16px;
          height: 16px;
          cursor: pointer;
          accent-color: hsl(var(--primary));
        }

        .auth-remember-label {
          font-size: 13px;
          color: hsl(var(--foreground));
          cursor: pointer;
          user-select: none;
          font-family: 'DM Sans', sans-serif;
        }
          height: 1px;
          background: linear-gradient(90deg, transparent, hsl(var(--border) / 0.3), transparent);
          margin: 20px 0;
        }
      `}</style>

      <div className="auth-page">
        <div className="auth-grid-bg" />
        <div className="auth-glow" />

        <motion.div
          className="auth-card"
          initial={{ opacity: 0, y: 30, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="auth-corner-tl" />
          <div className="auth-corner-br" />

          <div className="auth-logo">
            <div className="auth-logo-icon">
              <Zap size={22} color="#0a0f1e" strokeWidth={2.5} />
            </div>
            <span className="auth-logo-text">Electro<span>o</span>buddy</span>
          </div>

          <h1 className="auth-title">{isLogin ? "Welcome Back" : "Create Account"}</h1>
          <p className="auth-subtitle">
            {isLogin
              ? "Sign in to manage your bookings"
              : "Sign up to book services and track your appointments"}
          </p>

          <form onSubmit={handleSubmit}>
            <div className="auth-field">
              <label className="auth-label">Email</label>
              <div className="auth-input-wrap">
                <Mail size={16} className="auth-input-icon" />
                <input
                  type="email"
                  required
                  className="auth-input"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="auth-field">
              <label className="auth-label">Password</label>
              <div className="auth-input-wrap">
                <Lock size={16} className="auth-input-icon" />
                <input
                  type="password"
                  required
                  className="auth-input"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button type="submit" className="auth-submit" disabled={loading}>
              {loading ? (
                <><Loader2 size={16} className="animate-spin" /> Processing...</>
              ) : (
                <>{isLogin ? "Sign In" : "Create Account"} <ArrowRight size={16} /></>
              )}
            </button>
          </form>

          <div className="auth-remember">
            <input
              type="checkbox"
              id="remember"
              className="auth-remember-input"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            />
            <label htmlFor="remember" className="auth-remember-label">
              Remember me for 30 days
            </label>
          </div>
          
          <div className="auth-divider" />

          <div className="auth-toggle">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button className="auth-toggle-btn" onClick={() => setIsLogin(!isLogin)}>
              {isLogin ? "Sign Up" : "Sign In"}
            </button>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default UserAuth;
