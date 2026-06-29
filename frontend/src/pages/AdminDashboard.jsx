import React, { useState, useEffect } from 'react';
import { 
  Shield, Users, ClipboardList, Briefcase, FileText, CheckCircle, AlertTriangle
} from 'lucide-react';
import Layout from '../components/Layout';

export default function AdminDashboard() {
  const [requests, setRequests] = useState([]);
  const [techs, setTechs] = useState([]);
  const [stats, setStats] = useState({ requests: 0, techs: 0, completed: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    const token = localStorage.getItem('token');
    try {
      // Requests
      const reqRes = await fetch('/api/requests', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const reqs = await reqRes.json();

      // Techs
      const techRes = await fetch('/api/technicians', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const technicians = await techRes.json();

      if (reqRes.ok && techRes.ok) {
        setRequests(reqs);
        setTechs(technicians);
        setStats({
          requests: reqs.length,
          techs: technicians.length,
          completed: reqs.filter(r => r.status === 'completed').length
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      {loading ? (
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-brand-500"></div>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Header Greeting */}
          <div className="p-8 rounded-3xl bg-gradient-to-r from-brand-900/40 to-slate-900 border border-slate-800 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-black text-white flex items-center gap-2">
                Administrator Panel
                <Shield className="w-5 h-5 text-brand-400" />
              </h2>
              <p className="text-xs text-slate-400 mt-1 uppercase tracking-widest font-semibold">System-wide monitoring &amp; oversight</p>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-1">Total Artisans</p>
                <h3 className="text-3xl font-black text-white">{stats.techs}</h3>
              </div>
              <div className="p-3 bg-brand-500/10 text-brand-400 rounded-xl">
                <Briefcase className="w-6 h-6" />
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-1">Total Requests</p>
                <h3 className="text-3xl font-black text-white">{stats.requests}</h3>
              </div>
              <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl">
                <ClipboardList className="w-6 h-6" />
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-1">Completed Jobs</p>
                <h3 className="text-3xl font-black text-emerald-400">{stats.completed}</h3>
              </div>
              <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl">
                <CheckCircle className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Technicians & Requests list */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
              <h3 className="text-lg font-bold">Registered Artisans</h3>
              <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                {techs.map(t => (
                  <div key={t._id} className="p-4 rounded-xl bg-slate-900 border border-slate-850 flex justify-between items-center gap-3">
                    <div>
                      <h4 className="font-bold text-sm text-white">{t.user?.name}</h4>
                      <p className="text-xs text-slate-400">{t.category} — {t.user?.city}</p>
                    </div>
                    <span className="px-2.5 py-1 bg-brand-500/10 border border-brand-500/25 rounded-lg text-xs font-bold text-brand-400">
                      {t.rating} ★
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
              <h3 className="text-lg font-bold">System Repair Queue</h3>
              <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                {requests.map(r => (
                  <div key={r._id} className="p-4 rounded-xl bg-slate-900 border border-slate-850 flex justify-between items-center gap-3">
                    <div>
                      <h4 className="font-bold text-sm text-white">{r.category || 'New Job'}</h4>
                      <p className="text-xs text-slate-400 mt-0.5 truncate max-w-xs">{r.description}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                      r.status === 'completed' ? 'bg-slate-800 text-slate-400' : 'bg-brand-500/10 text-brand-400 border border-brand-500/20'
                    }`}>
                      {r.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
