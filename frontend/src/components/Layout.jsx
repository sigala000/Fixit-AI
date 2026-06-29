import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Wrench, LayoutDashboard, Calendar, FileText, BarChart3, Bell, 
  LogOut, User, Menu, X, ClipboardList, ShieldAlert
} from 'lucide-react';

export default function Layout({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      navigate('/login');
    }
    fetchNotifications();
  }, [location]);

  const fetchNotifications = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const res = await fetch('/api/notifications', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUnreadCount(data.filter(n => !n.read).length);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const navLinks = [
    { name: 'Dashboard', path: user?.role === 'technician' ? '/tech-dashboard' : user?.role === 'admin' ? '/admin-dashboard' : '/dashboard', icon: LayoutDashboard },
    { name: 'Repair Requests', path: '/requests', icon: ClipboardList },
    { name: 'Estimates', path: '/estimates', icon: FileText },
    { name: 'Appointments', path: '/appointments', icon: Calendar },
  ];

  if (user?.role === 'admin') {
    navLinks.push({ name: 'Analytics', path: '/analytics', icon: BarChart3 });
  }

  return (
    <div className="min-h-screen flex bg-slate-900 text-slate-100 font-sans">
      {/* Sidebar for desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-slate-950 border-r border-slate-800">
        <div className="p-6 flex items-center gap-3 border-b border-slate-800 bg-gradient-to-r from-brand-900 to-slate-950">
          <div className="p-2 bg-brand-500 rounded-xl text-white">
            <Wrench className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h1 className="font-extrabold text-lg tracking-wider bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">FIXIT AI</h1>
            <p className="text-xs text-brand-500 font-semibold uppercase tracking-widest">Agent Portal</p>
          </div>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.name}
                to={link.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                  isActive 
                    ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/30' 
                    : 'text-slate-400 hover:bg-slate-900 hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5" />
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* User Card */}
        <div className="p-4 border-t border-slate-800 bg-slate-950">
          <div className="flex items-center gap-3 p-2 rounded-xl bg-slate-900">
            <div className="w-10 h-10 rounded-full bg-brand-500 flex items-center justify-center font-bold text-white uppercase shadow-md shadow-brand-500/20">
              {user?.name?.slice(0, 2) || 'FX'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold truncate text-white">{user?.name}</p>
              <p className="text-xs text-slate-500 capitalize">{user?.role}</p>
            </div>
            <button 
              onClick={handleLogout}
              className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main content wrapper */}
      <div className="flex-1 flex flex-col min-w-0 bg-slate-900">
        {/* Header bar */}
        <header className="h-16 flex items-center justify-between px-6 bg-slate-950/80 backdrop-blur-md border-b border-slate-800 sticky top-0 z-40">
          <button 
            className="md:hidden p-2 text-slate-400 hover:text-white"
            onClick={() => setIsOpen(true)}
          >
            <Menu className="w-6 h-6" />
          </button>

          <div className="hidden md:flex items-center gap-2">
            <span className="text-slate-500">Workspace:</span>
            <span className="px-2.5 py-1 bg-slate-900 border border-slate-800 rounded-full text-xs font-semibold text-brand-500">Cameroon Market</span>
          </div>

          {/* Action Hub */}
          <div className="flex items-center gap-4">
            <Link 
              to="/notifications" 
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-900 rounded-xl relative transition-colors"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4.5 h-4.5 bg-red-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center border-2 border-slate-950">
                  {unreadCount}
                </span>
              )}
            </Link>

            <div className="h-8 w-px bg-slate-800"></div>

            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-slate-300 hidden sm:inline">{user?.name}</span>
              <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-slate-300 uppercase">
                {user?.name?.slice(0, 2)}
              </div>
            </div>
          </div>
        </header>

        {/* Content body */}
        <main className="flex-1 p-6 overflow-y-auto max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>

      {/* Mobile Drawer Sidebar */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsOpen(false)}></div>
          <div className="relative flex flex-col w-64 bg-slate-950 border-r border-slate-800 p-6">
            <button 
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white"
              onClick={() => setIsOpen(false)}
            >
              <X className="w-6 h-6" />
            </button>
            <div className="flex items-center gap-3 mb-8">
              <Wrench className="w-6 h-6 text-brand-500" />
              <span className="font-extrabold text-lg tracking-wider">FIXIT AI</span>
            </div>
            <nav className="flex-1 space-y-2">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = location.pathname === link.path;
                return (
                  <Link
                    key={link.name}
                    to={link.path}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                      isActive 
                        ? 'bg-brand-600 text-white shadow-lg' 
                        : 'text-slate-400 hover:bg-slate-900 hover:text-white'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {link.name}
                  </Link>
                );
              })}
            </nav>
            <div className="border-t border-slate-800 pt-4 mt-auto">
              <button 
                onClick={handleLogout}
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-colors"
              >
                <span>Logout</span>
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
