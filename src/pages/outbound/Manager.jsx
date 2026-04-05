
import { useState } from 'react';
import { PlayCircle } from 'lucide-react';
import { mockOutboundBatch } from '../../mock/data';

export default function OutboundManager({ domain }) {
  const [calling, setCalling] = useState(false);
  const [progress, setProgress] = useState(0);

  const startBatch = () => {
    setCalling(true);
    setProgress(0);
    const interval = setInterval(() => {
      setProgress(p => {
        if (p >= 100) { clearInterval(interval); setCalling(false); return 100; }
        return p + 10;
      });
    }, 500);
  };

  const domainBatches = mockOutboundBatch.filter(b => b.domain === domain);
  const title = domain === 'healthcare' ? 'Medical Outbound Campaigns' : 'Finance Outbound Campaigns';

  return (
    <div className="animate-fade-in max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{title}</h1>
        <button className="btn-primary flex items-center gap-2">Create New Batch</button>
      </div>

      <div className="flex-col gap-4">
        {domainBatches.map(b => (
          <div className="card" key={b.id}>
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="font-semibold text-lg">{b.name}</h3>
                <div className="text-sm text-muted">ID: {b.id} • {b.totals} Contacts</div>
              </div>
              <div>
                {b.status === 'completed' ? (
                   <span className="status-pill success text-sm w-full text-center">Completed ({b.successful}/{b.totals})</span>
                ) : (
                   <button className="btn-primary flex items-center gap-2" onClick={startBatch} disabled={calling}>
                     <PlayCircle size={18} /> {calling ? 'Running...' : 'Start Calls'}
                   </button>
                )}
              </div>
            </div>
            
            {calling && b.status !== 'completed' && (
               <div className="mt-4 p-4 bg-primary-light rounded-md">
                 <div className="flex justify-between text-sm font-semibold mb-2 text-primary">
                    <span>Batch Progress</span>
                    <span>{progress}%</span>
                 </div>
                 <div className="w-full bg-white rounded-full h-3 overflow-hidden">
                    <div className="bg-primary h-3 rounded-full transition-all duration-300" style={{width: `${progress}%`}}></div>
                 </div>
                 <div className="mt-3 text-sm text-muted">Automated voice AI is calling {b.totals} contacts...</div>
               </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}