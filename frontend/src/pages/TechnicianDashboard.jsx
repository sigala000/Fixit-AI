import React, { useState, useEffect } from 'react';
import { 
  ClipboardList, Calendar, DollarSign, Star, Briefcase, ToggleLeft, ToggleRight,
  ShieldCheck, MapPin
} from 'lucide-react';
import Layout from '../components/Layout';

export default function TechnicianDashboard() {
  const [tech, setTech] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [requests, setRequests] = useState([]);
  const [availableJobs, setAvailableJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfileAndJobs();
  }, []);

  const fetchProfileAndJobs = async () => {
    const token = localStorage.getItem('token');
    try {
      // Get profile
      const profRes = await fetch('/api/auth/profile', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const profileData = await profRes.json();
      if (profRes.ok) {
        setTech(profileData.technician);
      }

      // Get appointments
      const appRes = await fetch('/api/appointments', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const apps = await appRes.json();
      if (appRes.ok) {
        setAppointments(apps.slice(0, 5));
      }

      // Get assigned requests (matched to this technician)
      const reqRes = await fetch('/api/requests', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const reqs = await reqRes.json();
      if (reqRes.ok) {
        setRequests(reqs.slice(0, 5));
      }

      // Get available jobs (job board — open requests in same category)
      const availRes = await fetch('/api/requests/available', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const avail = await availRes.json();
      if (availRes.ok) {
        setAvailableJobs(avail.slice(0, 5));
      }

      // Get reviews
      if (profileData.technician) {
        const revRes = await fetch(`/api/technicians/${profileData.technician._id}/reviews`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const revs = await revRes.json();
        if (revRes.ok) {
          setReviews(revs.slice(0, 4));
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleAvailability = async () => {
    const token = localStorage.getItem('token');
    // Simulated endpoint or local update (fallback to keep code robust)
    setTech(prev => ({
      ...prev,
      availability: !prev.availability
    }));
  };

  return (
    <Layout>
      {loading ? (
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-brand-500"></div>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Header Greeting & Profile Details */}
          <div className="p-8 rounded-3xl bg-gradient-to-r from-brand-900/40 to-slate-900 border border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="flex items-center gap-4">
              <img 
                src={tech?.profileImageUrl || "https://images.unsplash.com/photo-1540569014015-19a7ee504e3a"} 
                alt="Profile" 
                className="w-16 h-16 rounded-full object-cover border border-slate-700 shadow-md shadow-brand-600/10"
              />
              <div>
                <h2 className="text-2xl font-black text-white flex items-center gap-2">
                  Artisan Dashboard
                  <ShieldCheck className="w-5 h-5 text-brand-400" />
                </h2>
                <div className="flex flex-wrap items-center gap-3 mt-1 text-slate-400 text-xs font-semibold">
                  <span className="flex items-center gap-1"><Briefcase className="w-3.5 h-3.5 text-brand-500" /> {tech?.category}</span>
                  <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-indigo-400" /> {tech?.serviceAreas?.join(', ')}</span>
                </div>
              </div>
            </div>

            {/* Toggle availability */}
            <button 
              onClick={toggleAvailability}
              className={`px-5 py-3 rounded-2xl flex items-center gap-2 border font-bold text-sm transition-all ${
                tech?.availability 
                  ? 'bg-emerald-600/15 border-emerald-500/30 text-emerald-400' 
                  : 'bg-red-600/15 border-red-500/30 text-red-400'
              }`}
            >
              {tech?.availability ? (
                <>
                  <ToggleRight className="w-6 h-6 text-emerald-500" />
                  <span>Available for Jobs</span>
                </>
              ) : (
                <>
                  <ToggleLeft className="w-6 h-6 text-red-500" />
                  <span>Unavailable</span>
                </>
              )}
            </button>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-1">Average Rating</p>
                <div className="flex items-center gap-1">
                  <h3 className="text-3xl font-black text-white">{tech?.rating}</h3>
                  <span className="text-yellow-500 text-sm">★</span>
                </div>
              </div>
              <div className="p-3 bg-yellow-500/10 text-yellow-400 rounded-xl">
                <Star className="w-6 h-6 fill-current" />
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-1">Experience</p>
                <h3 className="text-3xl font-black text-white">{tech?.experience} yrs</h3>
              </div>
              <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl">
                <Briefcase className="w-6 h-6" />
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-1">Active Bookings</p>
                <h3 className="text-3xl font-black text-white">{appointments.length}</h3>
              </div>
              <div className="p-3 bg-brand-500/10 text-brand-400 rounded-xl">
                <Calendar className="w-6 h-6" />
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-1">Estimated Earnings</p>
                <h3 className="text-3xl font-black text-emerald-400">125,000 FCFA</h3>
              </div>
              <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl">
                <DollarSign className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Job Queue & Reviews */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">

              {/* Assigned Jobs */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <ClipboardList className="w-5 h-5 text-brand-400" />
                  Assigned Jobs
                </h3>
                <div className="space-y-3">
                  {requests.length === 0 ? (
                    <div className="p-6 text-center text-slate-500 bg-slate-950/40 border border-slate-800 rounded-2xl text-sm">
                      No jobs assigned yet.
                    </div>
                  ) : (
                    requests.map(req => (
                      <div key={req._id} className="p-5 rounded-2xl bg-slate-950 border border-slate-800 flex justify-between items-center gap-4">
                        <div>
                          <h4 className="font-bold text-sm text-white">{req.customer?.name}</h4>
                          <p className="text-xs text-slate-400 mt-1 max-w-md">{req.description}</p>
                          <div className="flex gap-2 mt-2">
                            <span className="px-2 py-0.5 bg-slate-900 border border-slate-800 text-[10px] text-slate-400 font-semibold rounded-md uppercase">
                              {req.city}
                            </span>
                            <span className={`px-2 py-0.5 text-[10px] font-semibold border rounded-md capitalize ${
                              req.status === 'scheduled' ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-orange-500/10 border-orange-500/30 text-orange-400'
                            }`}>
                              {req.status}
                            </span>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-[10px] text-slate-500 block uppercase font-semibold">Priority</span>
                          <span className="text-xs font-bold text-red-400">{req.urgency}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Job Board — Open Requests in Same Category */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-indigo-400" />
                  Job Board
                  <span className="ml-1 px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-400 text-[10px] font-bold border border-indigo-500/30">
                    {availableJobs.length} Open
                  </span>
                </h3>
                <div className="space-y-3">
                  {availableJobs.length === 0 ? (
                    <div className="p-6 text-center text-slate-500 bg-slate-950/40 border border-slate-800 rounded-2xl text-sm">
                      No open jobs in your category right now.
                    </div>
                  ) : (
                    availableJobs.map(req => (
                      <div key={req._id} className="p-5 rounded-2xl bg-indigo-950/20 border border-indigo-900/40 flex justify-between items-center gap-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-sm text-white">{req.category}</h4>
                            <span className="px-2 py-0.5 bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-[10px] font-semibold rounded-md">NEW</span>
                          </div>
                          <p className="text-xs text-slate-400 mt-1 max-w-md">{req.description}</p>
                          <div className="flex gap-2 mt-2">
                            <span className="px-2 py-0.5 bg-slate-900 border border-slate-800 text-[10px] text-slate-400 font-semibold rounded-md uppercase flex items-center gap-1">
                              <MapPin className="w-2.5 h-2.5" /> {req.city}
                            </span>
                            <span className={`px-2 py-0.5 text-[10px] font-semibold border rounded-md capitalize ${
                              req.urgency === 'High' ? 'bg-red-500/10 border-red-500/30 text-red-400' :
                              req.urgency === 'Medium' ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400' :
                              'bg-slate-500/10 border-slate-500/30 text-slate-400'
                            }`}>
                              {req.urgency} Priority
                            </span>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <button className="px-3 py-1.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors">
                            View Job
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>

            {/* Recent Reviews */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold">Client Reviews</h3>
              <div className="space-y-4">
                {reviews.length === 0 ? (
                  <div className="p-8 text-center text-slate-500 bg-slate-950/40 border border-slate-850 rounded-2xl">
                    No reviews received yet.
                  </div>
                ) : (
                  reviews.map(rev => (
                    <div key={rev._id} className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-xs text-white">{rev.customer?.name}</span>
                        <div className="flex items-center gap-0.5 text-xs text-yellow-500">
                          {Array.from({ length: rev.rating }).map((_, i) => <Star key={i} className="w-3.5 h-3.5 fill-current" />)}
                        </div>
                      </div>
                      <p className="text-slate-400 text-xs italic">"{rev.comment}"</p>
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
