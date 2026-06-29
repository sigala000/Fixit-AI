import React, { useState, useEffect } from 'react';
import { 
  Calendar, MapPin, Clock, CheckCircle, X, ShieldAlert, ArrowRight, ClipboardCheck 
} from 'lucide-react';
import Layout from '../components/Layout';

export default function AppointmentPage() {
  const [appointments, setAppointments] = useState([]);
  const [acceptedEstimates, setAcceptedEstimates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookingForm, setBookingForm] = useState({
    estimateId: '',
    date: '',
    location: ''
  });
  const [bookingLoading, setBookingLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const token = localStorage.getItem('token');
    try {
      // Fetch Appointments
      const appRes = await fetch('/api/appointments', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const apps = await appRes.json();
      if (appRes.ok) {
        setAppointments(apps);
      }

      // Fetch Estimates to see accepted ones without appointments
      const estRes = await fetch('/api/estimates', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const ests = await estRes.json();
      if (estRes.ok) {
        // filter accepted ones
        const accepted = ests.filter(e => e.status === 'accepted');
        setAcceptedEstimates(accepted);
        if (accepted.length > 0) {
          setBookingForm(prev => ({ ...prev, estimateId: accepted[0]._id }));
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBooking = async (e) => {
    e.preventDefault();
    if (!bookingForm.estimateId || !bookingForm.date || !bookingForm.location) return;
    
    setBookingLoading(true);
    const token = localStorage.getItem('token');

    try {
      const selectedEst = acceptedEstimates.find(e => e._id === bookingForm.estimateId);
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          repairRequestId: selectedEst.repairRequest._id,
          date: bookingForm.date,
          location: bookingForm.location
        })
      });

      const data = await res.json();
      if (res.ok) {
        setAppointments(prev => [data, ...prev]);
        setBookingForm({ estimateId: '', date: '', location: '' });
        fetchData(); // refresh lists
      }
    } catch (err) {
      console.error(err);
    } finally {
      setBookingLoading(false);
    }
  };

  const handleCancelBooking = async (id) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`/api/appointments/${id}/cancel`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const updated = await res.json();
        setAppointments(prev => prev.map(app => app._id === id ? { ...app, status: updated.status } : app));
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Layout>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Side: Create Appointment from Accepted Estimates */}
        <div className="lg:col-span-1 space-y-6">
          <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
            <h3 className="text-base font-bold flex items-center gap-2">
              <ClipboardCheck className="w-5 h-5 text-brand-500" />
              Book Appointment
            </h3>

            {acceptedEstimates.length === 0 ? (
              <p className="text-xs text-slate-500 leading-relaxed">
                You don't have any accepted quotes waiting for appointment scheduling. Once you accept a quotation, you can select date and book here.
              </p>
            ) : (
              <form onSubmit={handleCreateBooking} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Select Accepted Job</label>
                  <select
                    value={bookingForm.estimateId}
                    onChange={(e) => setBookingForm(prev => ({ ...prev, estimateId: e.target.value }))}
                    className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-brand-500 transition-all cursor-pointer"
                  >
                    {acceptedEstimates.map(est => (
                      <option key={est._id} value={est._id}>
                        {est.repairRequest?.category} — {est.technician?.user?.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Choose Date &amp; Time</label>
                  <input
                    type="datetime-local"
                    required
                    value={bookingForm.date}
                    onChange={(e) => setBookingForm(prev => ({ ...prev, date: e.target.value }))}
                    className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-brand-500 transition-all cursor-pointer"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Service Address / Location</label>
                  <input
                    type="text"
                    required
                    placeholder="E.g. Rue de Mermoz, Yaounde"
                    value={bookingForm.location}
                    onChange={(e) => setBookingForm(prev => ({ ...prev, location: e.target.value }))}
                    className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-650 focus:outline-none focus:border-brand-500 transition-all"
                  />
                </div>

                <button
                  type="submit"
                  disabled={bookingLoading}
                  className="w-full py-3.5 bg-brand-600 hover:bg-brand-500 disabled:bg-brand-850 text-xs font-bold rounded-xl transition-all shadow-md shadow-brand-600/10 flex items-center justify-center gap-1.5"
                >
                  Confirm Booking
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Right Side: Appointment Calendar List */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-lg font-bold">Your Booked Repairs</h3>
          {loading ? (
            <div className="flex items-center justify-center h-48">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-brand-500"></div>
            </div>
          ) : (
            <div className="space-y-4">
              {appointments.length === 0 ? (
                <div className="p-8 text-center text-slate-500 bg-slate-950/40 border border-slate-850 rounded-2xl">
                  No appointments scheduled.
                </div>
              ) : (
                appointments.map(app => (
                  <div key={app._id} className="p-5 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-brand-500/10 text-brand-400 rounded-xl">
                        <Calendar className="w-6 h-6" />
                      </div>
                      <div className="space-y-1.5">
                        <h4 className="font-bold text-sm text-white">{app.repairRequest?.category || 'Service Booking'}</h4>
                        <p className="text-xs text-slate-400">Assigned Tech: <strong>{app.technician?.user?.name}</strong></p>
                        <div className="flex flex-wrap items-center gap-3 mt-1.5 text-slate-500 text-[11px] font-medium">
                          <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {new Date(app.date).toLocaleString()}</span>
                          <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {app.location}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-3 shrink-0">
                      <span className={`px-2.5 py-1 text-[10px] font-bold rounded-md uppercase border ${
                        app.status === 'confirmed' ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400' :
                        app.status === 'cancelled' ? 'bg-red-500/10 border-red-500/25 text-red-400' :
                        'bg-yellow-500/10 border-yellow-500/25 text-yellow-400'
                      }`}>
                        {app.status}
                      </span>
                      {app.status === 'confirmed' && (
                        <button
                          onClick={() => handleCancelBooking(app._id)}
                          className="text-[10px] font-bold text-red-400 hover:underline"
                        >
                          Cancel Booking
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
