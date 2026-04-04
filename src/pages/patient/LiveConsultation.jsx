
import { useNavigate } from 'react-router-dom';
import { Mic, PhoneOff } from 'lucide-react';
import TranscriptBlock from '../../components/shared/TranscriptBlock';
import { mockTranscript } from '../../mock/data';

export default function LiveConsultation() {
  const navigate = useNavigate();
  return (
    <div className="animate-fade-in flex flex-col h-full gap-4">
      <div className="flex justify-between items-center card">
        <div>
          <h2 className="font-semibold text-lg">In Consultation with Dr. Smith</h2>
          <div className="text-sm text-secondary flex items-center gap-2">
            <span className="pulse-primary" style={{width: 8, height: 8, borderRadius:'50%', background:'var(--secondary-hover)', display:'inline-block'}}></span>
            Live Recording
          </div>
        </div>
        <div className="font-mono text-xl">04:22</div>
      </div>
      
      <div className="flex-1 card overflow-hidden flex flex-col">
        <h3 className="font-semibold mb-4">Live Transcript</h3>
        <div className="flex-1 overflow-auto">
          <TranscriptBlock segments={mockTranscript} />
        </div>
        <div className="mt-4 flex justify-center gap-4">
          <button className="btn-primary" style={{borderRadius: '50%', width: 56, height: 56, display:'flex', alignItems:'center', justifyContent:'center'}}><Mic /></button>
          <button onClick={() => navigate('/patient/dashboard')} className="btn-primary flex items-center justify-center" style={{borderRadius: '50%', width: 56, height: 56, background: 'var(--danger)'}}><PhoneOff /></button>
        </div>
      </div>
    </div>
  );
}