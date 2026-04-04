import { useNavigate, useParams } from 'react-router-dom';
import { User, Activity, Shield, Briefcase, PhoneCall } from 'lucide-react';
import './Auth.css';

export default function RoleSelection() {
  const navigate = useNavigate();
  const { domain } = useParams();
  
  const roles = domain === 'medical' 
    ? [
        { id: 'doctor', title: 'Doctor', icon: Activity },
        { id: 'patient', title: 'Patient', icon: User },
        { id: 'admin', title: 'Admin', icon: Shield }
      ]
    : [
        { id: 'manager', title: 'The Manager', icon: Briefcase },
        { id: 'user', title: 'The User', icon: User }
      ];

  return (
    <div className="auth-layout">
      <div className="auth-left animate-fade-in">
        <div className="text-center max-w-lg w-full">
          <h1 className="text-2xl font-bold mb-4" style={{textTransform: 'capitalize'}}>{domain} Portal</h1>
          <p className="text-muted">Select your user persona to proceed.</p>
          
          <div className="selection-grid" style={{gridTemplateColumns: roles.length > 2 ? 'repeat(3, 1fr)' : 'repeat(2, 1fr)'}}>
            {roles.map(r => {
              const Icon = r.icon;
              return (
                <button key={r.id} className="selection-btn" onClick={() => navigate(`/auth/${domain}/${r.id}/login`)}>
                  <Icon size={32} className="icon" />
                  <span className="title">{r.title}</span>
                </button>
              )
            })}
          </div>
          <button className="mt-8 text-primary font-semibold" onClick={() => navigate('/')}>← Back</button>
        </div>
      </div>
    </div>
  )
}