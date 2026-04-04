
import { useNavigate } from 'react-router-dom';
import { mockCases } from '../../mock/data';
import { Plus } from 'lucide-react';
import '../Dashboard.css';

export default function PatientDashboard() {
  const navigate = useNavigate();
  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl">My Health Overview</h1>
        <button className="btn-primary flex items-center gap-2" onClick={() => navigate('/patient/consultation/new/live')}>
          <Plus size={18} /> Start Consultation
        </button>
      </div>
      
      <div className="dashboard-grid mb-6">
        <div className="card stat-card">
          <span className="stat-label">Past Consultations</span>
          <span className="stat-value">12</span>
        </div>
        <div className="card stat-card">
          <span className="stat-label">Active Prescriptions</span>
          <span className="stat-value">2</span>
        </div>
        <div className="card stat-card">
          <span className="stat-label">Profile Completeness</span>
          <span className="stat-value text-secondary">100%</span>
        </div>
      </div>

      <h2 className="text-xl mb-4 font-semibold">Recent History</h2>
      <div className="flex-col gap-4">
        {mockCases.filter(c => c.domain === 'healthcare').map(c => (
          <div className="card flex justify-between items-center" key={c.id}>
            <div>
              <div className="font-semibold">Consultation #{c.id}</div>
              <div className="text-sm text-muted">{c.date}</div>
            </div>
            <div className="flex items-center gap-4">
              <span className={`status-pill ${c.status === 'completed' ? 'success' : 'warning'}`}>{c.status}</span>
              <button className="btn-primary" onClick={() => navigate(`/patient/report/${c.id}`)}>View</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}