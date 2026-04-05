
import { useNavigate } from 'react-router-dom';
import { mockCases } from '../../mock/data';
import { Activity } from 'lucide-react';
import '../Dashboard.css';

export default function DoctorDashboard() {
  const navigate = useNavigate();
  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl">Doctor Dashboard</h1>
      </div>
      
      <div className="dashboard-grid mb-6">
        <div className="card stat-card">
          <span className="stat-label">Today's Appointments</span>
          <span className="stat-value">8</span>
        </div>
        <div className="card stat-card">
          <span className="stat-label">Pending Reports</span>
          <span className="stat-value text-warning">3</span>
        </div>
        <div className="card stat-card">
          <span className="stat-label">Completed Cases</span>
          <span className="stat-value">142</span>
        </div>
      </div>

      <h2 className="text-xl mb-4 font-semibold">Active Sessions & Queue</h2>
      <div className="flex-col gap-4">
        {mockCases.filter(c => c.domain === 'healthcare').map(c => (
          <div className="card flex justify-between items-center" key={c.id}>
            <div>
              <div className="font-semibold">{c.patientName}</div>
              <div className="text-sm text-muted">ID: {c.id} | {c.date}</div>
            </div>
            <div className="flex items-center gap-4">
              <span className={`status-pill ${c.status === 'completed' ? 'success' : 'warning'}`}>{c.status}</span>
              {c.status === 'completed' ? 
                <button className="btn-primary" onClick={() => navigate(`/doctor/report/${c.id}/review`)}>Review</button> :
                <button className="btn-primary" onClick={() => navigate(`/doctor/consultation/${c.id}/live`)} style={{background: 'var(--secondary-hover)'}}><Activity size={16} style={{display:'inline', marginRight: 4}}/> Join Live</button>
              }
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}