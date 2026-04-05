
import { useNavigate } from 'react-router-dom';
import { PhoneOff } from 'lucide-react';
import TranscriptBlock from '../../components/shared/TranscriptBlock';
import { mockTranscript } from '../../mock/data';

export default function CustomerLiveSession() {
  const navigate = useNavigate();
  return (
    <div className="animate-fade-in flex flex-col h-full gap-4">
      <div className="flex justify-between items-center card">
        <div>
          <h2 className="font-semibold text-lg">Support Session</h2>
          <div className="text-sm text-secondary">Recording Active</div>
        </div>
        <div className="font-mono text-xl">12:05</div>
      </div>
      
      <div className="flex-1 card overflow-hidden flex flex-col">
        <h3 className="font-semibold mb-4">Live Transcript</h3>
        <div className="flex-1 overflow-auto">
          <TranscriptBlock segments={mockTranscript} />
        </div>
        <div className="mt-4 flex justify-center gap-4">
          <button onClick={() => navigate('/customer/dashboard')} className="btn-primary flex items-center justify-center bg-danger" style={{borderRadius: '50%', width: 56, height: 56}}><PhoneOff /></button>
        </div>
      </div>
    </div>
  );
}