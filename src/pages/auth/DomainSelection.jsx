import { useNavigate } from 'react-router-dom';
import { Activity, Briefcase } from 'lucide-react';
import './Auth.css';

export default function DomainSelection() {
  const navigate = useNavigate();

  return (
    <div className="auth-layout">
      <div className="auth-left animate-fade-in">
        <div className="text-center max-w-lg">
          <div className="logo mb-8" style={{fontSize: '2.5rem'}}>Voice2<span style={{color: 'var(--secondary)'}}>Vitals</span></div>
          <h1 className="text-2xl font-bold mb-4">Choose Your Domain</h1>
          <p className="text-muted">Select the industry to streamline your conversational intelligence.</p>
          
          <div className="selection-grid">
            <button className="selection-btn" onClick={() => navigate('/role/medical')}>
              <Activity size={36} className="icon"/>
              <span className="title">Medical</span>
            </button>
            <button className="selection-btn" onClick={() => navigate('/role/finance')}>
              <Briefcase size={36} className="icon"/>
              <span className="title">Finance</span>
            </button>
          </div>
        </div>
      </div>
      <div className="auth-right hidden md:flex">
         <h2 className="text-4xl font-bold mb-6 text-center leading-tight">Transform conversations <br/>into structured data.</h2>
         <p className="text-lg opacity-90 text-center max-w-md">Instantly transcribe, extract, and analyze voice interactions in real-time.</p>
      </div>
    </div>
  )
}