import { useParams, useNavigate } from 'react-router-dom';
import './Auth.css';

export default function ProfileSetup() {
  const { domain, role } = useParams();
  const navigate = useNavigate();

  const titleText = domain === 'medical' ? `Collect req info for ${role}` : `Collect basic info for ${role}`;

  const handleComplete = (e) => {
    e.preventDefault();
    navigate(`/${role}/dashboard`);
  };

  return (
    <div className="auth-layout flex-col items-center justify-center p-4">
      <div className="auth-card w-full max-w-lg mx-auto animate-fade-in">
        <h2 className="auth-title">{titleText}</h2>
        <p className="auth-subtitle mb-6">Let's finish setting up your account before reaching the dashboard.</p>
        
        <form className="flex-col gap-4" onSubmit={handleComplete}>
          <div>
             <label className="input-label">Full Name</label>
             <input type="text" className="auth-input" required />
          </div>
          <div>
             <label className="input-label">Phone Number</label>
             <input type="tel" className="auth-input" required />
          </div>
          <button type="submit" className="btn-primary w-full py-3 mt-4 text-lg">Go to Dashboard</button>
        </form>
      </div>
    </div>
  );
}