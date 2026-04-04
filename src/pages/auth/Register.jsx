import { useParams, useNavigate, Link } from 'react-router-dom';
import './Auth.css';

export default function Register() {
  const { domain, role } = useParams();
  const navigate = useNavigate();

  const handleRegister = (e) => {
    e.preventDefault();
    navigate(`/setup/${domain}/${role}`);
  };

  return (
    <div className="auth-layout">
      <div className="auth-left animate-fade-in">
        <div className="auth-card">
          <h2 className="auth-title">First time signup.</h2>
          <p className="auth-subtitle">Create your {role} account.</p>
          
          <form className="flex-col gap-4" onSubmit={handleRegister}>
            <div>
              <label className="input-label">Email id</label>
              <input type="email" className="auth-input" placeholder="Enter your email" required />
            </div>
            <div>
              <label className="input-label">Password</label>
              <input type="password" className="auth-input" placeholder="Create a strong password" required />
            </div>
            
            <div className="text-sm mt-2 mb-2">
              <span className="text-muted">Already user? </span>
              <Link to={`/auth/${domain}/${role}/login`} className="text-primary font-semibold">Sign in</Link>
            </div>

            <button type="submit" className="btn-primary w-full py-3 mt-2 text-lg">Continue</button>
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