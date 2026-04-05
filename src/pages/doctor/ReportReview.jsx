import { useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';
import ExtractionPanel from '../../components/shared/ExtractionPanel';

export default function ReportReview() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReport();
  }, [id]);

  const fetchReport = async () => {
    try {
      const { data, error } = await supabase
        .from('prescriptions')
        .select('*')
        .eq('consultation_id', id)
        .single();

      if (error) throw error;
      setReport(data.full_json);
    } catch (error) {
      console.error('Error fetching report', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
     return <div className="p-8 text-center">Loading AI Report...</div>;
  }

  if (!report) {
     return <div className="p-8 text-center text-danger">Report could not be found or is still processing.</div>;
  }

  // To map backend json to ExtractionPanel format (which takes an array)
  // Or we can just build a custom panel. We assume ExtractionPanel can render raw report json for now 
  // Let's coerce 'report' into something extraction panel expects, if extraction panel expects an object
  // Alternatively we just use the raw report. We pass report directly as 'fields'
  
  return (
    <div className="animate-fade-in gap-4 pb-12">
      <h2 className="text-2xl font-bold mb-6">Review & Finalize AI Report</h2>
      <div className="card mb-6 bg-warning-light border-warning">
         <p className="text-warning font-semibold mb-1">AI Generated Draft</p>
         <p className="text-sm">Please review the extracted clinical fields generated from the transcript.</p>
      </div>

      <div className="flex gap-6 items-start">
        <div className="flex-1 card">
           <h3 className="font-semibold mb-4 border-b pb-2">AI Extraction</h3>
           <ExtractionPanel fields={report} />
        </div>
        
        <div className="flex-1 card">
           <h3 className="font-semibold mb-4 border-b pb-2">Doctor's Final Notes</h3>
           <form className="flex-col gap-4">
             <div className="flex-col gap-1 mb-4">
               <label className="text-sm font-semibold">Final Diagnosis</label>
               <input type="text" className="w-full p-2 border rounded" defaultValue={report.Diagnosis || ''} />
             </div>
             <div className="flex-col gap-1 mb-4">
               <label className="text-sm font-semibold">Prescription & Advice</label>
               <textarea className="w-full p-2 border rounded h-32" defaultValue={JSON.stringify(report.Medications, null, 2)}></textarea>
             </div>
             <div className="flex-col gap-1 mb-4">
               <label className="text-sm font-semibold">Follow-up Note</label>
               <input type="text" className="w-full p-2 border rounded" defaultValue={report.Follow_Up || ''} placeholder="e.g. Return in 5 days if fever persists" />
             </div>
             <button type="button" onClick={() => navigate('/doctor/dashboard')} className="btn-primary w-full py-3 mt-4 text-lg">Finalize & Sign Report</button>
           </form>
        </div>
      </div>
    </div>
  );
}