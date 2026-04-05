
import { useNavigate } from 'react-router-dom';
import { mockFieldsMedic } from '../../mock/data';
import ExtractionPanel from '../../components/shared/ExtractionPanel';

export default function ReportReview() {
  const navigate = useNavigate();
  return (
    <div className="animate-fade-in gap-4 pb-12">
      <h2 className="text-2xl font-bold mb-6">Review & Finalize Report</h2>
      <div className="card mb-6 bg-warning-light border-warning">
         <p className="text-warning font-semibold mb-1">AI Generated Draft</p>
         <p className="text-sm">Please review the extracted clinical fields and add your final remarks below before signing off.</p>
      </div>

      <div className="flex gap-6 items-start">
        <div className="flex-1 card">
           <h3 className="font-semibold mb-4 border-b pb-2">AI Extraction</h3>
           <ExtractionPanel fields={mockFieldsMedic} />
        </div>
        
        <div className="flex-1 card">
           <h3 className="font-semibold mb-4 border-b pb-2">Doctor's Final Notes</h3>
           <form className="flex-col gap-4">
             <div className="flex-col gap-1 mb-4">
               <label className="text-sm font-semibold">Final Diagnosis</label>
               <input type="text" className="w-full p-2 border rounded" defaultValue={mockFieldsMedic.provisionalDiagnosis} />
             </div>
             <div className="flex-col gap-1 mb-4">
               <label className="text-sm font-semibold">Prescription & Advice</label>
               <textarea className="w-full p-2 border rounded h-32" defaultValue={mockFieldsMedic.treatmentPlan}></textarea>
             </div>
             <div className="flex-col gap-1 mb-4">
               <label className="text-sm font-semibold">Follow-up Note</label>
               <input type="text" className="w-full p-2 border rounded" placeholder="e.g. Return in 5 days if fever persists" />
             </div>
             <button type="button" onClick={() => navigate('/doctor/dashboard')} className="btn-primary w-full py-3 mt-4 text-lg">Finalize & Sign Report</button>
           </form>
        </div>
      </div>
    </div>
  );
}