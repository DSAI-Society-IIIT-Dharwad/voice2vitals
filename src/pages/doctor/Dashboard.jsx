import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Activity, Plus } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import '../Dashboard.css';

export default function DoctorDashboard() {
  const navigate = useNavigate();
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCases();
  }, []);

  const fetchCases = async () => {
    try {
      const { data, error } = await supabase
        .from('consultations')
        .select(`*, prescriptions(patient_name, diagnosis)`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCases(data || []);
    } catch (error) {
      console.error('Error fetching consultations', error);
    } finally {
      setLoading(false);
    }
  };

  const getPatientName = (c) => {
    if (c.prescriptions && c.prescriptions.length > 0) {
      return c.prescriptions[0].patient_name || 'Evaluating...';
    }
    return c.file_name || 'Live Recording Session';
  };

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl">Doctor Dashboard</h1>
        <button className="btn-primary flex items-center gap-2" onClick={() => navigate('/doctor/consultation/new/live')}>
          <Plus size={18} /> New Live Consultation
        </button>
      </div>
      
      <div className="dashboard-grid mb-6">
        <div className="card stat-card">
          <span className="stat-label">Total Cases</span>
          <span className="stat-value">{cases.length}</span>
        </div>
        <div className="card stat-card">
          <span className="stat-label">Pending AI</span>
          <span className="stat-value text-warning">{cases.filter(c => c.status === 'processing' || c.status === 'pending').length}</span>
        </div>
        <div className="card stat-card">
          <span className="stat-label">Completed</span>
          <span className="stat-value">{cases.filter(c => c.status === 'completed').length}</span>
        </div>
      </div>

      <h2 className="text-xl mb-4 font-semibold">Session History & Queue</h2>
      
      {loading ? (
        <div className="card text-center p-8 text-muted">Loading cases...</div>
      ) : cases.length === 0 ? (
         <div className="card text-center p-8 text-muted">No consultations yet.</div>
      ) : (
        <div className="flex-col gap-4">
          {cases.map(c => (
            <div className="card flex justify-between items-center" key={c.id}>
              <div>
                <div className="font-semibold">{getPatientName(c)}</div>
                <div className="text-sm text-muted">Date: {new Date(c.created_at).toLocaleString()}</div>
              </div>
              <div className="flex items-center gap-4">
                <span className={`status-pill ${c.status === 'completed' ? 'success' : 'warning'}`}>{c.status}</span>
                {c.status === 'completed' ? 
                  <button className="btn-primary" onClick={() => navigate(`/doctor/report/${c.id}/review`)}>Review AI Report</button> :
                  <button className="btn-primary bg-secondary" disabled>Processing...</button>
                }
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}