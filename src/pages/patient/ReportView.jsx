
import { useNavigate } from 'react-router-dom';
import { mockFieldsMedic } from '../../mock/data';
import ExtractionPanel from '../../components/shared/ExtractionPanel';

export default function PatientReportView() {
  const navigate = useNavigate();
  return (
    <div className="animate-fade-in max-w-3xl mx-auto pb-12">
      <button onClick={() => navigate(-1)} className="text-primary text-sm mb-4">← Back</button>
      <div className="card mb-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Consultation Report</h2>
          <span className="status-pill success">Finalized</span>
        </div>
        <div className="grid grid-cols-2 gap-4 mb-6 border-b pb-6">
           <div><div className="text-sm text-muted">Doctor</div><div className="font-semibold">Dr. Smith</div></div>
           <div><div className="text-sm text-muted">Date</div><div className="font-semibold">Oct 12, 2023</div></div>
        </div>
        <ExtractionPanel fields={mockFieldsMedic} />
      </div>
    </div>
  );
}