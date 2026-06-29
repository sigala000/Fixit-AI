import React, { useState, useEffect, useRef } from 'react';
import { 
  Wrench, ClipboardList, Send, MapPin, Sparkles, User, AlertCircle, 
  CheckCircle, ArrowRight, ShieldCheck, DollarSign, Calendar
} from 'lucide-react';
import Layout from '../components/Layout';

const CITIES = ["Douala", "Yaoundé", "Bafoussam", "Kribi", "Limbe", "Garoua", "Bamenda", "Bertoua"];

export default function RepairRequestPage() {
  const [requests, setRequests] = useState([]);
  const [selectedReq, setSelectedReq] = useState(null);
  const [description, setDescription] = useState('');
  const [city, setCity] = useState('Douala');
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchRequests = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('/api/requests', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setRequests(data);
        if (data.length > 0 && !selectedReq) {
          handleSelectRequest(data[0]);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSelectRequest = async (req) => {
    setSelectedReq(req);
    // Initialize chat with greeting and initial prompt
    setChatHistory([
      { sender: 'agent', text: `Hello! I am the FIXIT Intake Agent. I see you filed a request: "${req.description}". Let me begin diagnosing this issue. Please type a message to proceed or ask me to match a technician.` }
    ]);
  };

  const handleCreateRequest = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const token = localStorage.getItem('token');

    try {
      const res = await fetch('/api/requests', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ description, city })
      });

      const data = await res.json();
      if (res.ok) {
        setDescription('');
        setRequests(prev => [data, ...prev]);
        handleSelectRequest(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!chatMessage.trim() || chatLoading) return;

    const messageText = chatMessage;
    setChatMessage('');
    setChatHistory(prev => [...prev, { sender: 'user', text: messageText }]);
    setChatLoading(true);

    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`/api/requests/${selectedReq._id}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ message: messageText })
      });

      const data = await res.json();
      if (res.ok) {
        setChatHistory(prev => [...prev, { sender: 'agent', text: data.response }]);
        // Refresh request details to see status updates
        refreshRequestDetails();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setChatLoading(false);
    }
  };

  const refreshRequestDetails = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`/api/requests/${selectedReq._id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setSelectedReq(data);
        // Also update in list
        setRequests(prev => prev.map(r => r._id === data._id ? data : r));
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Layout>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-[calc(100vh-120px)]">
        {/* Left Side: Create Request & Request List */}
        <div className="flex flex-col gap-6 lg:col-span-1 h-full overflow-y-auto pr-2">
          {/* File New Request Card */}
          <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
            <h3 className="text-base font-bold flex items-center gap-2">
              <PlusIcon className="w-5 h-5 text-brand-500" />
              File New Request
            </h3>
            <form onSubmit={handleCreateRequest} className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Issue Description</label>
                <textarea
                  required
                  rows="3"
                  placeholder="E.g. Refrigerator is making clicking noises and won't cool..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-brand-500 transition-all resize-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Your Location (City)</label>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-brand-500 transition-all cursor-pointer"
                >
                  {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 bg-brand-600 hover:bg-brand-500 disabled:bg-brand-850 text-xs font-bold rounded-xl transition-all shadow-md shadow-brand-600/10 flex items-center justify-center gap-1"
              >
                {submitting ? 'Submitting...' : 'Submit Request'}
              </button>
            </form>
          </div>

          {/* Request History List */}
          <div className="flex-1 min-h-[250px] p-6 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col gap-4">
            <h3 className="text-base font-bold flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-indigo-400" />
              Your Repair Jobs
            </h3>
            <div className="flex-1 space-y-3 overflow-y-auto pr-1">
              {requests.length === 0 ? (
                <div className="text-center py-10 text-xs text-slate-500">No requests submitted yet.</div>
              ) : (
                requests.map(req => (
                  <button
                    key={req._id}
                    onClick={() => handleSelectRequest(req)}
                    className={`w-full p-4 rounded-xl text-left border transition-all flex flex-col gap-1.5 ${
                      selectedReq?._id === req._id
                        ? 'bg-slate-900 border-brand-500/50'
                        : 'bg-slate-900/50 border-slate-850 hover:bg-slate-900'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-xs text-white">{req.category || 'Extracting Trade...'}</span>
                      <span className="text-[9px] text-slate-500">{new Date(req.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 line-clamp-2">{req.description}</p>
                    <div className="flex justify-between items-center mt-1">
                      <span className="px-2 py-0.5 bg-slate-950 text-[9px] rounded-md text-slate-500 font-semibold capitalize border border-slate-850">
                        {req.status}
                      </span>
                      <span className={`text-[10px] font-bold ${
                        req.urgency === 'High' ? 'text-red-400' : 'text-indigo-400'
                      }`}>
                        {req.urgency} Priority
                      </span>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Agentic Chat & Live Diagnosis status */}
        <div className="lg:col-span-2 flex flex-col h-full bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden">
          {selectedReq ? (
            <>
              {/* Chat Header */}
              <div className="p-5 border-b border-slate-850 bg-slate-900/60 flex flex-wrap justify-between items-center gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-brand-500/10 text-brand-400 rounded-xl border border-brand-500/20">
                    <Sparkles className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-white">FIXIT AI Assistant</h3>
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">Active Session: {selectedReq._id.slice(-6)}</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <span className="px-2.5 py-1 bg-slate-950 border border-slate-800 rounded-full text-xs font-bold text-slate-400 capitalize">
                    Status: {selectedReq.status}
                  </span>
                </div>
              </div>

              {/* Status details sub-header */}
              {selectedReq.status !== 'intake' && (
                <div className="px-5 py-3.5 bg-slate-900 border-b border-slate-850 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                  <div>
                    <span className="text-[9px] text-slate-500 font-semibold block uppercase">Diagnosis</span>
                    <span className="font-medium text-slate-300 line-clamp-1" title={selectedReq.diagnosis}>
                      {selectedReq.diagnosis || 'Classifying...'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-500 font-semibold block uppercase">Category</span>
                    <span className="font-bold text-brand-400">{selectedReq.category}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-500 font-semibold block uppercase">Artisan Partner</span>
                    <span className="font-bold text-indigo-400 flex items-center gap-1">
                      {selectedReq.matchedTechnician ? (
                        <>
                          <ShieldCheck className="w-3.5 h-3.5" />
                          {selectedReq.matchedTechnician.user?.name}
                        </>
                      ) : 'Matching...'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-500 font-semibold block uppercase">Urgency</span>
                    <span className="font-bold text-red-400">{selectedReq.urgency}</span>
                  </div>
                </div>
              )}

              {/* Messages feed */}
              <div className="flex-1 p-6 overflow-y-auto space-y-4">
                {chatHistory.map((msg, i) => (
                  <div 
                    key={i} 
                    className={`flex gap-3 max-w-[85%] ${
                      msg.sender === 'user' ? 'ml-auto flex-row-reverse' : ''
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                      msg.sender === 'user' ? 'bg-indigo-600 text-white' : 'bg-brand-500 text-white'
                    }`}>
                      {msg.sender === 'user' ? 'ME' : <Sparkles className="w-4 h-4" />}
                    </div>
                    <div className={`p-4 rounded-2xl text-xs leading-relaxed ${
                      msg.sender === 'user' 
                        ? 'bg-indigo-600 text-white rounded-tr-none' 
                        : 'bg-slate-900 border border-slate-800 text-slate-300 rounded-tl-none'
                    }`}>
                      {msg.text}
                    </div>
                  </div>
                ))}
                {chatLoading && (
                  <div className="flex gap-3 max-w-[80%]">
                    <div className="w-8 h-8 rounded-full bg-brand-500 text-white flex items-center justify-center shrink-0">
                      <Sparkles className="w-4 h-4 animate-spin" />
                    </div>
                    <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-slate-500 rounded-tl-none flex items-center gap-2">
                      <div className="flex gap-1.5">
                        <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce"></span>
                        <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                        <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                      </div>
                      AI is processing request...
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input */}
              <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-850 bg-slate-900/40 flex gap-3">
                <input
                  type="text"
                  placeholder="Ask a question or request diagnosis..."
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  className="flex-1 px-4 py-3 bg-slate-950 border border-slate-850 rounded-xl text-xs text-white placeholder-slate-650 focus:outline-none focus:border-brand-500 transition-all"
                />
                <button
                  type="submit"
                  disabled={chatLoading}
                  className="p-3 bg-brand-600 hover:bg-brand-500 text-white rounded-xl transition-all shadow-md shadow-brand-600/10 shrink-0"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-500 gap-3 p-6 text-center">
              <ClipboardList className="w-12 h-12 text-slate-700" />
              <div>
                <h4 className="font-bold text-sm text-slate-400">Select or Create a Repair Job</h4>
                <p className="text-xs text-slate-500 max-w-xs mt-1">Submit a new description on the left or select an existing job to trigger the AI Matching pipeline.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

// Simple Plus Icon Component
function PlusIcon(props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2}
      stroke="currentColor"
      {...props}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
  );
}
