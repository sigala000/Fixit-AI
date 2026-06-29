import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ClipboardList, Calendar, FileText, Plus, AlertCircle, CheckCircle, 
  MessageSquare, User, ArrowRight, Star
} from 'lucide-react';
import Layout from '../components/Layout';

export default function CustomerDashboard() {
  const [stats, setStats] = useState({ requests: 0, estimates: 0, appointments: 0 });
  const [recentRequests, setRecentRequests] = useState([]);
  const [recentEstimates, setRecentEstimates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    const token = localStorage.getItem('token');
    try {
      // Fetch Requests
      const reqRes = await fetch('/api/requests', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const reqs = await reqRes.json();

      // Fetch Estimates
      const estRes = await fetch('/api/estimates', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const ests = await estRes.json();

      // Fetch Appointments
      const appRes = await fetch('/api/appointments', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const apps = await appRes.json();

      if (reqRes.ok && estRes.ok && appRes.ok) {
        setStats({
          requests: reqs.length,
          estimates: ests.filter(e => e.status === 'pending').length,
          appointments: apps.filter(a => a.status === 'confirmed').length
        });
        setRecentRequests(reqs.slice(0, 4));
        setRecentEstimates(ests.slice(0, 3));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const colors = {
      intake: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/25',
      diagnosed: 'bg-blue-500/10 text-blue-400 border-blue-500/25',
      matched: 'bg-purple-500/10 text-purple-400 border-purple-500/25',
      estimated: 'bg-orange-500/10 text-orange-400 border-orange-500/25',
      scheduled: 'bg-green-500/10 text-green-400 border-green-500/25',
      completed: 'bg-slate-500/10 text-slate-400 border-slate-500/25'
    };
    return (
      <span className={`px-2.5 py-1 border rounded-full text-xs font-semibold capitalize ${colors[status] || 'bg-slate-500/10 text-slate-400 border-slate-500/25'}`}>
        {status}
      </span>
    );
  };

  return (
    <Layout>
      {loading ? (
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-brand-500"></div>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Welcome Banner */}
          <div className="p-8 rounded-3xl bg-gradient-to-r from-brand-900/60 to-slate-900 border border-slate-800 relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2">
              <h2 className="text-3xl font-extrabold tracking-tight">Need a Repair?</h2>
              <p className="text-slate-400 text-sm max-w-xl">Get in touch with Cameroon's top-rated plumbers, electricians, carpenters, AC specialists and more. Our AI handles the heavy lifting.</p>
            </div>
            <Link to="/requests" className="px-6 py-3.5 bg-brand-600 hover:bg-brand-500 text-sm font-bold rounded-2xl flex items-center gap-2 shadow-lg shadow-brand-600/30 transition-all shrink-0">
              <Plus className="w-5 h-5" />
              File Repair Request
            </Link>
          </div>

          {/* Core Stats Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-1">Repair Requests</p>
                <h3 className="text-3xl font-black">{stats.requests}</h3>
              </div>
              <div className="p-3 bg-brand-500/10 text-brand-400 rounded-xl">
                <ClipboardList className="w-6 h-6" />
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-1">Pending Quotes</p>
                <h3 className="text-3xl font-black">{stats.estimates}</h3>
              </div>
              <div className="p-3 bg-orange-500/10 text-orange-400 rounded-xl">
                <FileText className="w-6 h-6" />
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-1">Active Bookings</p>
                <h3 className="text-3xl font-black">{stats.appointments}</h3>
              </div>
              <div className="p-3 bg-green-500/10 text-green-400 rounded-xl">
                <Calendar className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Detailed Lists */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Recent Repair Requests */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold">Recent Repair Jobs</h3>
                <Link to="/requests" className="text-xs font-semibold text-brand-500 hover:text-brand-400 flex items-center gap-1">
                  View All <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="space-y-4">
                {recentRequests.length === 0 ? (
                  <div className="p-8 text-center text-slate-500 bg-slate-950/40 border border-slate-850 rounded-2xl">
                    No repair requests submitted yet.
                  </div>
                ) : (
                  recentRequests.map(req => (
                    <Link 
                      key={req._id} 
                      to={`/requests`}
                      className="p-5 rounded-2xl bg-slate-950 hover:bg-slate-900 border border-slate-800/80 hover:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all"
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-sm text-white">{req.category || 'New Request'}</span>
                          {getStatusBadge(req.status)}
                        </div>
                        <p className="text-slate-400 text-xs truncate max-w-md">{req.description}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-[10px] text-slate-500 font-semibold block uppercase">Filed On</span>
                        <span className="text-xs font-medium text-slate-400">{new Date(req.createdAt).toLocaleDateString()}</span>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </div>

            {/* Pending Quotations */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold">Pending Quotations</h3>
                <Link to="/estimates" className="text-xs font-semibold text-brand-500 hover:text-brand-400 flex items-center gap-1">
                  All Estimates <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="space-y-4">
                {recentEstimates.filter(e => e.status === 'pending').length === 0 ? (
                  <div className="p-8 text-center text-slate-500 bg-slate-950/40 border border-slate-850 rounded-2xl">
                    No pending quotes.
                  </div>
                ) : (
                  recentEstimates.filter(e => e.status === 'pending').map(est => (
                    <div key={est._id} className="p-5 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col gap-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-bold text-sm text-white">{est.technician?.user?.name || 'Artisan Match'}</h4>
                          <p className="text-xs text-slate-500">{est.repairRequest?.category}</p>
                        </div>
                        <span className="px-2 py-1 bg-brand-500/10 text-brand-400 border border-brand-500/25 rounded-md text-[10px] font-bold uppercase tracking-wider">
                          Quote
                        </span>
                      </div>
                      <div className="flex justify-between items-center bg-slate-900 p-3 rounded-xl border border-slate-850">
                        <span className="text-xs text-slate-400">Total Price</span>
                        <span className="font-bold text-sm text-brand-400">{est.totalRange}</span>
                      </div>
                      <Link 
                        to="/estimates"
                        className="w-full py-2.5 bg-brand-600 hover:bg-brand-500 text-xs font-bold text-center rounded-xl transition-all block"
                      >
                        Review Quotation
                      </Link>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
