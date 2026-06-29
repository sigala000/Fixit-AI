import React, { useState, useEffect } from 'react';
import { 
  FileText, Check, X, ShieldAlert, DollarSign, Wrench, Navigation, ArrowRight
} from 'lucide-react';
import Layout from '../components/Layout';

export default function EstimatePage() {
  const [estimates, setEstimates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEstimates();
  }, []);

  const fetchEstimates = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('/api/estimates', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setEstimates(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id, action) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`/api/estimates/${id}/action`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ action })
      });

      if (res.ok) {
        const updated = await res.json();
        setEstimates(prev => prev.map(est => est._id === id ? { ...est, status: updated.status } : est));
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-black text-white">Repair Estimates &amp; Quotations</h2>
          <p className="text-xs text-slate-400 mt-1 uppercase tracking-widest font-semibold">Review and approve cost estimates to authorize bookings</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-brand-500"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {estimates.length === 0 ? (
              <div className="md:col-span-2 p-12 text-center text-slate-500 bg-slate-950/40 border border-slate-850 rounded-2xl">
                No estimates found. File a repair request and wait for diagnosis to generate quotes.
              </div>
            ) : (
              estimates.map(est => (
                <div key={est._id} className="p-6 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col gap-6 relative overflow-hidden">
                  {/* Status Banner */}
                  <div className="absolute top-0 right-0">
                    <span className={`px-4 py-1.5 rounded-bl-xl text-[10px] font-bold uppercase tracking-wider ${
                      est.status === 'accepted' ? 'bg-emerald-500/10 text-emerald-400 border-l border-b border-emerald-500/20' :
                      est.status === 'declined' ? 'bg-red-500/10 text-red-400 border-l border-b border-red-500/20' :
                      'bg-yellow-500/10 text-yellow-400 border-l border-b border-yellow-500/20'
                    }`}>
                      {est.status}
                    </span>
                  </div>

                  {/* Header info */}
                  <div>
                    <h3 className="font-bold text-base text-white">{est.technician?.user?.name || 'Artisan Match'}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">{est.repairRequest?.category} Specialist</p>
                    <p className="text-xs text-slate-400 mt-2 bg-slate-900 p-3 rounded-xl border border-slate-850">
                      <strong>Client Inquiry:</strong> "{est.repairRequest?.description}"
                    </p>
                  </div>

                  {/* Itemized pricing breakdown */}
                  <div className="space-y-3 bg-slate-900/60 p-4 border border-slate-850 rounded-xl">
                    <h4 className="text-[10px] text-slate-500 uppercase tracking-widest font-bold border-b border-slate-800 pb-2">Itemized Breakdown</h4>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400 flex items-center gap-1.5"><Wrench className="w-3.5 h-3.5" /> Labor &amp; Service Fee</span>
                      <span className="font-semibold text-slate-200">{est.labor.toLocaleString()} FCFA</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400 flex items-center gap-1.5"><DollarSign className="w-3.5 h-3.5" /> Replacement Parts</span>
                      <span className="font-semibold text-slate-200">{est.parts.toLocaleString()} FCFA</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400 flex items-center gap-1.5"><Navigation className="w-3.5 h-3.5" /> Travel &amp; Transport</span>
                      <span className="font-semibold text-slate-200">{est.travel.toLocaleString()} FCFA</span>
                    </div>
                    <div className="border-t border-slate-850 pt-2 flex justify-between items-center text-sm font-extrabold">
                      <span className="text-brand-400">Total Price Estimate</span>
                      <span className="text-brand-400">{est.totalRange}</span>
                    </div>
                  </div>

                  {/* Action buttons */}
                  {est.status === 'pending' ? (
                    <div className="grid grid-cols-2 gap-4 mt-auto">
                      <button
                        onClick={() => handleAction(est._id, 'decline')}
                        className="py-3 bg-slate-900 border border-slate-850 hover:bg-slate-850 text-xs font-bold rounded-xl text-red-400 transition-all flex items-center justify-center gap-1.5"
                      >
                        <X className="w-4 h-4" /> Decline
                      </button>
                      <button
                        onClick={() => handleAction(est._id, 'accept')}
                        className="py-3 bg-brand-600 hover:bg-brand-500 text-xs font-bold rounded-xl text-white transition-all flex items-center justify-center gap-1.5 shadow-md shadow-brand-600/10"
                      >
                        <Check className="w-4 h-4" /> Accept &amp; Schedule
                      </button>
                    </div>
                  ) : est.status === 'accepted' ? (
                    <div className="p-3 bg-emerald-950/20 border border-emerald-800/30 rounded-xl text-xs text-emerald-400 flex items-center justify-between gap-3 mt-auto">
                      <div className="flex items-center gap-2">
                        <Check className="w-4.5 h-4.5" />
                        <span>Quotation Accepted. Go to Appointments to book.</span>
                      </div>
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  ) : (
                    <div className="p-3 bg-red-950/20 border border-red-800/30 rounded-xl text-xs text-red-400 flex items-center gap-2 mt-auto">
                      <X className="w-4.5 h-4.5" />
                      <span>Quotation Declined. You can request a reassessment in the chat.</span>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}
