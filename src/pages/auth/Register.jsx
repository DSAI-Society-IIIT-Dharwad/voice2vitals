import { useParams, useNavigate, Link } from 'react-router-dom';
import { useState } from 'react';
import { supabase } from '../../../lib/supabase';
import './Auth.css';

export default function Register() {
  const { domain, role } = useParams();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            role: role,
            domain: domain
          }
        }
      });

      if (error) throw error;
      
      navigate(`/setup/${domain}/${role}`);
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
          <h2 className="auth-title">First time signup.</h2>
          <p className="auth-subtitle">Create your {role} account.</p>
          
          {error && <div className="text-danger mb-4 text-sm bg-danger/10 p-2 rounded">{error}</div>}

          <form className="flex-col gap-4" onSubmit={handleRegister}>
            <div>
              <label className="input-label">Email id</label>
              <input type="email" className="auth-input" placeholder="Enter your email" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div>
              <label className="input-label">Password</label>
              <input type="password" className="auth-input" placeholder="Create a strong password" required value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            
            <div className="text-sm mt-2 mb-2">
              <span className="text-muted">Already user? </span>
              <Link to={`/auth/${domain}/${role}/login`} className="text-primary font-semibold">Sign in</Link>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-3 mt-2 text-lg">
              {loading ? 'Continuing...' : 'Continue'}
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