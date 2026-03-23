import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const DebugRoles = () => {
  const { user } = useAuth();
  const [roles, setRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchRoles = async () => {
      try {
        console.log('🔍 Fetching roles for user:', user.id);
        
        const { data, error } = await supabase
          .from('user_roles')
          .select('*')
          .eq('user_id', user.id);

        if (error) {
          console.error('❌ Error fetching roles:', error);
          setError(error.message);
        } else {
          console.log('✅ Roles fetched successfully:', data);
          setRoles(data || []);
        }
      } catch (err) {
        console.error('Unexpected error:', err);
        setError('Unexpected error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchRoles();
  }, [user]);

  if (!user) {
    return (
      <div style={{ padding: '20px', fontFamily: 'monospace' }}>
        <h2>🚫 Not Logged In</h2>
        <p>Please log in to see your roles.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ padding: '20px', fontFamily: 'monospace' }}>
        <h2>⏳ Loading...</h2>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace', background: '#1a1a1a', color: '#fff', minHeight: '100vh' }}>
      <h2>🎭 User Role Debugger</h2>
      
      <div style={{ marginBottom: '20px', padding: '15px', background: '#2a2a2a', borderRadius: '8px' }}>
        <h3>👤 Current User:</h3>
        <p><strong>ID:</strong> {user.id}</p>
        <p><strong>Email:</strong> {user.email}</p>
      </div>

      {error && (
        <div style={{ marginBottom: '20px', padding: '15px', background: '#ff444422', border: '1px solid #ff4444', borderRadius: '8px' }}>
          <h3>❌ Error:</h3>
          <p>{error}</p>
        </div>
      )}

      <div style={{ marginBottom: '20px', padding: '15px', background: '#2a2a2a', borderRadius: '8px' }}>
        <h3>📋 User Roles ({roles.length}):</h3>
        {roles.length === 0 ? (
          <p style={{ color: '#ffaa00' }}>⚠️ No roles found for this user!</p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {roles.map((role, index) => (
              <li 
                key={role.id} 
                style={{ 
                  padding: '10px', 
                  margin: '10px 0', 
                  background: '#333', 
                  borderRadius: '5px',
                  borderLeft: `4px solid ${
                    role.role === 'admin' ? '#ff4444' : 
                    role.role === 'technician' ? '#44aaff' : '#44ff44'
                  }`
                }}
              >
                <strong>Role #{index + 1}:</strong> 
                <span style={{ 
                  marginLeft: '10px', 
                  padding: '4px 8px', 
                  background: role.role === 'admin' ? '#ff444433' : 
                             role.role === 'technician' ? '#44aaff33' : '#44ff4433',
                  borderRadius: '4px',
                  fontWeight: 'bold'
                }}>
                  {role.role.toUpperCase()}
                </span>
                <div style={{ marginTop: '5px', fontSize: '12px', color: '#aaa' }}>
                  <small>ID: {role.id}</small>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div style={{ marginBottom: '20px', padding: '15px', background: '#2a2a2a', borderRadius: '8px' }}>
        <h3>🔍 Console Output:</h3>
        <p style={{ fontSize: '12px', color: '#aaa' }}>
          Open browser DevTools (F12) → Console tab to see detailed logs
        </p>
      </div>

      <button
        onClick={() => window.location.reload()}
        style={{
          padding: '10px 20px',
          background: '#4444ff',
          color: '#fff',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          fontWeight: 'bold'
        }}
      >
        🔄 Refresh
      </button>
    </div>
  );
};

export default DebugRoles;
