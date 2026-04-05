
import { useNavigate } from 'react-router-dom';
import { Mic, PhoneOff } from 'lucide-react';
import TranscriptBlock from '../../components/shared/TranscriptBlock';
import ExtractionPanel from '../../components/shared/ExtractionPanel';
import { mockTranscript, mockFieldsMedic } from '../../mock/data';

export default function DoctorLiveConsultation() {
  const navigate = useNavigate();
  return (
    <div className="animate-fade-in flex flex-col h-full gap-4">
      <div className="flex justify-between items-center card">
        <div>
          <h2 className="font-semibold text-lg">Consultation: John Doe</h2>
          <div className="text-sm text-secondary">Recording & Extracting...</div>
        </div>
        <div className="font-mono text-xl">04:22</div>
      </div>
      
      <div className="flex-1 flex gap-6 overflow-hidden">
        <div className="flex-1 card flex flex-col">
          <h3 className="font-semibold mb-4">Live Transcript</h3>
          <div className="flex-1"><TranscriptBlock segments={mockTranscript} /></div>
          <div className="mt-4 flex justify-center gap-4 pt-4 border-t">
             <button onClick={() => navigate('/doctor/report/C1/review')} className="btn-primary bg-danger text-white flex gap-2 items-center"><PhoneOff size={18}/> End & Review</button>
          </div>
        </div>
        
        <div className="w-[30%] card flex flex-col">
          <h3 className="font-semibold mb-4 text-primary">Live Extracted Data</h3>
          <div className="flex-1 overflow-auto">
            <ExtractionPanel fields={mockFieldsMedic} />
          </div>
        </div>
      </div>
    </div>
  );
}