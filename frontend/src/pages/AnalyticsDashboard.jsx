import React, { useState, useEffect } from 'react';
import { 
  BarChart3, TrendingUp, DollarSign, Users, Award, ShieldCheck, 
  ThumbsUp, PieChart, Activity
} from 'lucide-react';
import Layout from '../components/Layout';

export default function AnalyticsDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('/api/analytics', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const resData = await res.json();
      if (res.ok) {
        setData(resData);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-black text-white flex items-center gap-2">
            Business Analytics &amp; Reports
            <BarChart3 className="w-6 h-6 text-brand-500" />
          </h2>
          <p className="text-xs text-slate-400 mt-1 uppercase tracking-widest font-semibold">Real-time market activity and operational performance</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-96">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-brand-500"></div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Top Level Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="p-6 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Completed Revenue</span>
                  <span className="text-2xl font-black text-emerald-400 mt-1 block">{(data?.revenues?.completed || 0).toLocaleString()} FCFA</span>
                </div>
                <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl">
                  <DollarSign className="w-5 h-5" />
                </div>
              </div>

              <div className="p-6 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Projected Pipeline</span>
                  <span className="text-2xl font-black text-brand-400 mt-1 block">{(data?.revenues?.projected || 0).toLocaleString()} FCFA</span>
                </div>
                <div className="p-3 bg-brand-500/10 text-brand-400 rounded-xl">
                  <TrendingUp className="w-5 h-5" />
                </div>
              </div>

              <div className="p-6 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Customer Satisfaction</span>
                  <span className="text-2xl font-black text-yellow-500 mt-1 block">{data?.customerSatisfaction} / 5.0</span>
                </div>
                <div className="p-3 bg-yellow-500/10 text-yellow-400 rounded-xl">
                  <ThumbsUp className="w-5 h-5" />
                </div>
              </div>

              <div className="p-6 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Technician Utilization</span>
                  <span className="text-2xl font-black text-indigo-400 mt-1 block">{data?.technicianUtilization?.utilizationRate}%</span>
                </div>
                <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl">
                  <Activity className="w-5 h-5" />
                </div>
              </div>
            </div>

            {/* Main analytics panels */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Common Repair Categories */}
              <div className="lg:col-span-2 p-6 bg-slate-950 border border-slate-800 rounded-3xl flex flex-col gap-6">
                <h3 className="text-base font-bold flex items-center gap-2">
                  <PieChart className="w-5 h-5 text-indigo-400" />
                  Most Requested Services
                </h3>
                <div className="space-y-4">
                  {data?.categories?.slice(0, 5).map((item, idx) => (
                    <div key={idx} className="space-y-2">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-slate-300">{item.category}</span>
                        <span className="text-slate-400">{item.count} Requests</span>
                      </div>
                      <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden border border-slate-850">
                        <div 
                          className="bg-brand-500 h-full rounded-full transition-all duration-500" 
                          style={{ width: `${(item.count / (data.categories[0]?.count || 1)) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Averages Summary */}
              <div className="p-6 bg-slate-950 border border-slate-800 rounded-3xl flex flex-col gap-6">
                <h3 className="text-base font-bold flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-emerald-400" />
                  Average Repair Cost Breakdown
                </h3>
                <div className="space-y-4 text-xs">
                  <div className="flex justify-between py-2.5 border-b border-slate-850">
                    <span className="text-slate-400">Labor Charge</span>
                    <span className="font-bold text-slate-200">{(data?.averages?.labor || 0).toLocaleString()} FCFA</span>
                  </div>
                  <div className="flex justify-between py-2.5 border-b border-slate-850">
                    <span className="text-slate-400">Replacement Parts</span>
                    <span className="font-bold text-slate-200">{(data?.averages?.parts || 0).toLocaleString()} FCFA</span>
                  </div>
                  <div className="flex justify-between py-2.5 border-b border-slate-850">
                    <span className="text-slate-400">Travel &amp; Logistics</span>
                    <span className="font-bold text-slate-200">{(data?.averages?.travel || 0).toLocaleString()} FCFA</span>
                  </div>
                  <div className="flex justify-between pt-3 text-sm font-extrabold text-white">
                    <span className="text-emerald-400">Average Total Job</span>
                    <span className="text-emerald-400">{(data?.averages?.total || 0).toLocaleString()} FCFA</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Top Rated Technicians */}
            <div className="p-6 bg-slate-950 border border-slate-800 rounded-3xl space-y-6">
              <h3 className="text-base font-bold flex items-center gap-2">
                <Award className="w-5 h-5 text-yellow-500" />
                Top Performing Artisans
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {data?.topArtisans?.map((tech, idx) => (
                  <div key={idx} className="p-5 rounded-2xl bg-slate-900 border border-slate-850 flex items-center justify-between gap-4">
                    <div>
                      <h4 className="font-bold text-sm text-white flex items-center gap-1.5">
                        {tech.name}
                        <ShieldCheck className="w-4 h-4 text-brand-400" />
                      </h4>
                      <p className="text-xs text-slate-400 mt-1">{tech.category} — {tech.city}</p>
                    </div>
                    <span className="px-2.5 py-1 bg-yellow-500/10 border border-yellow-500/25 rounded-lg text-xs font-bold text-yellow-500 flex items-center gap-1 shrink-0">
                      <span>{tech.rating}</span>
                      <span className="text-[10px]">★</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
