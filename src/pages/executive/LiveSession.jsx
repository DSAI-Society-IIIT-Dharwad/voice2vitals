
import { useNavigate } from 'react-router-dom';
import { PhoneOff } from 'lucide-react';
import TranscriptBlock from '../../components/shared/TranscriptBlock';
import ExtractionPanel from '../../components/shared/ExtractionPanel';
import { mockTranscript, mockFieldsFinance } from '../../mock/data';

export default function ExecutiveLiveSession() {
  const navigate = useNavigate();
  return (
    <div className="animate-fade-in flex flex-col h-full gap-4">
      <div className="flex justify-between items-center card">
        <div>
          <h2 className="font-semibold text-lg">Active Call: Jane Smith</h2>
          <div className="text-sm text-secondary flex items-center gap-2">
             <div className="pulse-primary" style={{width: 8, height: 8, borderRadius:'50%', background:'var(--secondary-hover)'}}></div> Listening & Extracting
          </div>
        </div>
        <div className="font-mono text-xl bg-primary-light text-primary px-3 py-1 rounded-md">12:05</div>
      </div>
      
      <div className="flex-1 flex gap-6 overflow-hidden">
        <div className="flex-1 card flex flex-col">
          <h3 className="font-semibold mb-4 border-b pb-2">Live Transcript</h3>
          <div className="flex-1 overflow-auto"><TranscriptBlock segments={mockTranscript} /></div>
          <div className="mt-4 flex justify-center pt-4 border-t">
             <button onClick={() => navigate('/executive/dashboard')} className="btn-primary text-white flex gap-2 items-center px-8 py-3"><PhoneOff size={18}/> End Session & Save</button>
          </div>
        </div>
        
        <div className="w-[35%] card flex flex-col border-primary border-t-4">
          <h3 className="font-semibold mb-4 text-primary">Live Structured Summary</h3>
          <div className="flex-1 overflow-auto bg-primary-light p-2 rounded-md">
            <ExtractionPanel fields={mockFieldsFinance} />
          </div>
        </div>
      </div>
    </div>
  );
}