
import { useNavigate } from 'react-router-dom';
import { mockCases } from '../../mock/data';
import '../Dashboard.css';

export default function ExecutiveDashboard() {
  const navigate = useNavigate();
  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl">Agent Workspace</h1>
      </div>
      
      <div className="dashboard-grid mb-6">
        <div className="card stat-card">
          <span className="stat-label">Sessions Today</span>
          <span className="stat-value">24</span>
        </div>
        <div className="card stat-card">
          <span className="stat-label">Processing Queue</span>
          <span className="stat-value text-warning">2</span>
        </div>
      </div>
    </div>
  );
}