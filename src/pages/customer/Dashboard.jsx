
import { useNavigate } from 'react-router-dom';
import { mockCases } from '../../mock/data';
import { Headset } from 'lucide-react';
import '../Dashboard.css';

export default function CustomerDashboard() {
  const navigate = useNavigate();
  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl">Financial Overview</h1>
        <button className="btn-primary flex items-center gap-2" onClick={() => navigate('/customer/session/new/live')}>
          <Headset size={18} /> Contact Support
        </button>
      </div>
      
      <div className="dashboard-grid mb-6">
        <div className="card stat-card">
          <span className="stat-label">Active Loans</span>
          <span className="stat-value">1</span>
        </div>
        <div className="card stat-card">
          <span className="stat-label">Upcoming Payment</span>
          <span className="stat-value text-danger">$450.00</span>
        </div>
      </div>
    </div>
  );
}