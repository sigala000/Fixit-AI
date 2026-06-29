import React, { useState, useEffect } from 'react';
import { 
  Bell, Check, Info, AlertTriangle, Clock, Trash2 
} from 'lucide-react';
import Layout from '../components/Layout';

export default function NotificationCenter() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('/api/notifications', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setNotifications(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`/api/notifications/${id}/read`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h2 className="text-2xl font-black text-white flex items-center gap-2">
            Notification Center
            <Bell className="w-6 h-6 text-brand-500" />
          </h2>
          <p className="text-xs text-slate-400 mt-1 uppercase tracking-widest font-semibold">Stay updated on your repair diagnostics, matched artisans, and quotes</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-brand-500"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-slate-500 bg-slate-950/40 border border-slate-850 rounded-2xl">
                Your notification feed is empty.
              </div>
            ) : (
              notifications.map(n => (
                <div 
                  key={n._id} 
                  className={`p-5 rounded-2xl border flex items-center justify-between gap-6 transition-all ${
                    n.read 
                      ? 'bg-slate-950/40 border-slate-900/60 opacity-60' 
                      : 'bg-slate-950 border-slate-800 shadow-md shadow-brand-500/5'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`p-3.5 rounded-xl mt-0.5 ${
                      n.type === 'alert' ? 'bg-red-500/10 text-red-400' :
                      n.type === 'reminder' ? 'bg-yellow-500/10 text-yellow-400' :
                      'bg-brand-500/10 text-brand-400'
                    }`}>
                      {n.type === 'alert' ? <AlertTriangle className="w-5 h-5" /> : <Info className="w-5 h-5" />}
                    </div>
                    <div className="space-y-1">
                      <p className={`text-xs ${n.read ? 'text-slate-400' : 'text-white font-semibold'}`}>{n.message}</p>
                      <span className="text-[10px] text-slate-500 flex items-center gap-1 font-medium">
                        <Clock className="w-3 h-3" /> {new Date(n.createdAt).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {!n.read && (
                    <button
                      onClick={() => markAsRead(n._id)}
                      className="p-2 text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-850 rounded-xl shrink-0 transition-colors"
                      title="Mark as read"
                    >
                      <Check className="w-4.5 h-4.5 text-brand-400" />
                    </button>
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
