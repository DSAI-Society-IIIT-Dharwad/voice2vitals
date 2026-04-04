import { useParams, useNavigate, Link } from 'react-router-dom';
import './Auth.css';

export default function Login() {
  const { domain, role } = useParams();
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    navigate(`/${role}/dashboard`);
  };

  return (
    <div className="auth-layout">
      <div className="auth-left animate-fade-in">
        <div className="auth-card">
          <h2 className="auth-title">Sign In</h2>
          <p className="auth-subtitle">Welcome back to the Voice2Vitals {domain} portal as {role}.</p>
          
          <form className="flex-col gap-4" onSubmit={handleLogin}>
            <div>
              <label className="input-label">Email id</label>
              <input type="email" className="auth-input" placeholder="Enter your email" required />
            </div>
            <div>
              <label className="input-label">Password</label>
              <input type="password" className="auth-input" placeholder="Enter your password" required />
            </div>
            
            <div className="text-sm mt-2 mb-2">
              <span className="text-muted">First time user? </span>
              <Link to={`/auth/${domain}/${role}/signup`} className="text-primary font-semibold">Sign up</Link>
            </div>

            <button type="submit" className="btn-primary w-full py-3 mt-2 text-lg">Sign In</button>
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