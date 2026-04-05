import { useParams, useNavigate, Link } from 'react-router-dom';
import { useState } from 'react';
import { supabase } from '../../../lib/supabase';
import './Auth.css';

export default function Login() {
  const { domain, role } = useParams();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      
      navigate(`/${role}/dashboard`);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-layout">
      <div className="auth-left animate-fade-in">
        <div className="auth-card">
          <h2 className="auth-title">Sign In</h2>
          <p className="auth-subtitle">Welcome back to the Voice2Vitals {domain} portal as {role}.</p>
          
          {error && <div className="text-danger mb-4 text-sm bg-danger/10 p-2 rounded">{error}</div>}

          <form className="flex-col gap-4" onSubmit={handleLogin}>
            <div>
              <label className="input-label">Email id</label>
              <input type="email" className="auth-input" placeholder="Enter your email" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div>
              <label className="input-label">Password</label>
              <input type="password" className="auth-input" placeholder="Enter your password" required value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            
            <div className="text-sm mt-2 mb-2">
              <span className="text-muted">First time user? </span>
              <Link to={`/auth/${domain}/${role}/signup`} className="text-primary font-semibold">Sign up</Link>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-3 mt-2 text-lg">
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          <div className="divider">other options</div>
          
          <button className="btn-outline w-full py-3 gap-3">
             <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" width="20" height="20" />
             Sign in with Google
          </button>
        </div>
      </div>
    </div>
  );
}