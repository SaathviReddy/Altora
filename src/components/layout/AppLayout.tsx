import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Compass,
  Brain,
  DollarSign,
  Package,
  Milestone,
  MessageSquare,
  FileText,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Briefcase
} from 'lucide-react';
import { api, User } from '../../services/api';

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [user, setUser] = useState<User | null>(null);
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    api.auth.getMe().then((currUser) => {
      if (!currUser) {
        navigate('/login');
      } else {
        setUser(currUser);
      }
    });
  }, [navigate]);

  const handleLogout = async () => {
    await api.auth.logout();
    navigate('/');
  };

  const navItems = [
    { label: 'Workspace', path: '/app/workspace', icon: LayoutDashboard },
    { label: 'Advisor', path: '/app/advisor', icon: Compass },
    { label: 'Memory', path: '/app/memory', icon: Brain },
    { label: 'Finance', path: '/app/finance', icon: DollarSign },
    { label: 'Inventory', path: '/app/inventory', icon: Package },
    { label: 'Milestones', path: '/app/milestones', icon: Milestone },
    { label: 'Chat', path: '/app/chat', icon: MessageSquare },
    { label: 'Reports', path: '/app/reports', icon: FileText },
    { label: 'Settings', path: '/app/settings', icon: Settings },
  ];

  const currentActiveLabel = navItems.find((item) => item.path === location.pathname)?.label || 'Console';

  return (
    <div className="min-h-screen bg-cream flex flex-col md:flex-row overflow-hidden font-sans">
      
      {/* Mobile Top Navigation Bar */}
      <header className="md:hidden bg-ivory border-b border-charcoal/5 px-6 py-4 flex justify-between items-center z-40">
        <div className="flex items-center space-x-2">
          <Briefcase size={20} className="text-gold" />
          <span className="font-serif font-semibold text-charcoal text-lg tracking-wider">ALTORA</span>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-xs uppercase tracking-wider text-brown font-semibold bg-cream px-2.5 py-1 rounded">
            {currentActiveLabel}
          </span>
          <button 
            onClick={() => setMobileOpen(!mobileOpen)} 
            className="text-charcoal focus:outline-none p-1"
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </header>

      {/* Mobile Navigation Drawer Overlay */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 bg-charcoal/20 backdrop-blur-xs z-35" onClick={() => setMobileOpen(false)} />
      )}

      {/* Mobile Navigation Drawer Panel */}
      <aside className={`md:hidden fixed top-[61px] bottom-0 left-0 w-64 bg-ivory border-r border-charcoal/5 flex flex-col justify-between p-6 z-40 transition-transform duration-300 ease-in-out ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center space-x-3.5 px-4 py-3 rounded text-sm transition-colors ${active ? 'bg-cream text-gold font-medium border-l-2 border-gold' : 'text-brown hover:bg-cream/50 hover:text-charcoal'}`}
              >
                <Icon size={18} className={active ? 'text-gold' : 'text-brown/80'} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
        
        {/* Mobile Sidebar Footer */}
        <div className="border-t border-charcoal/5 pt-4">
          {user && (
            <div className="mb-4">
              <p className="text-xs text-brown uppercase tracking-wider font-semibold">Business context</p>
              <p className="text-sm font-serif font-semibold text-charcoal truncate">{user.businessName || 'Altora Ventures'}</p>
              <p className="text-xs text-brown truncate">{user.name}</p>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 text-red-700/80 hover:text-red-700 text-sm font-medium px-4 py-2 w-full hover:bg-red-50 rounded"
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Desktop Persistent Sidebar */}
      <aside className={`hidden md:flex flex-col justify-between border-r border-charcoal/10 bg-ivory transition-all duration-300 relative ${collapsed ? 'w-20' : 'w-64'} min-h-screen py-8 px-4 flex-shrink-0`}>
        {/* Toggle Collapse Button */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3.5 top-14 bg-ivory border border-charcoal/10 hover:border-gold/50 rounded-full p-1 text-brown hover:text-charcoal shadow-sm transition-colors z-20 cursor-pointer"
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>

        <div>
          {/* Logo Brand Header */}
          <div className={`flex items-center mb-10 px-4 ${collapsed ? 'justify-center' : 'space-x-2.5'}`}>
            <Briefcase size={22} className="text-gold flex-shrink-0" />
            {!collapsed && (
              <span className="font-serif font-semibold text-charcoal text-xl tracking-widest">ALTORA</span>
            )}
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center px-4 py-3 rounded text-sm transition-all duration-150 ${active ? 'bg-cream text-charcoal font-semibold border-l-2 border-gold shadow-[inset_0_1px_2px_rgba(26,26,26,0.02)]' : 'text-brown hover:bg-cream/40 hover:text-charcoal'} ${collapsed ? 'justify-center' : 'space-x-3.5'}`}
                  title={collapsed ? item.label : undefined}
                >
                  <Icon size={18} className={active ? 'text-gold' : 'text-brown/70'} />
                  {!collapsed && <span>{item.label}</span>}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Desktop Sidebar Footer */}
        <div className="border-t border-charcoal/5 pt-6 px-2">
          {!collapsed && user && (
            <div className="mb-5 bg-cream/30 p-3.5 rounded border border-charcoal/5">
              <p className="text-[10px] text-brown uppercase tracking-widest font-semibold mb-0.5">Active Context</p>
              <p className="text-sm font-serif font-semibold text-charcoal truncate">{user.businessName || 'Altora Ventures'}</p>
              <p className="text-xs text-brown truncate mt-0.5">{user.name}</p>
            </div>
          )}
          
          <button
            onClick={handleLogout}
            className={`flex items-center text-brown hover:text-charcoal hover:bg-cream/40 text-sm font-medium p-3 rounded w-full transition-colors ${collapsed ? 'justify-center' : 'space-x-3'}`}
            title="Sign Out"
          >
            <LogOut size={16} className="text-brown/70 flex-shrink-0" />
            {!collapsed && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Main Main Scrollable Dashboard Viewport */}
      <main className="flex-1 overflow-y-auto max-h-screen p-6 md:p-10 flex flex-col focus:outline-none">
        <div className="max-w-6xl w-full mx-auto flex-1 flex flex-col">
          {children}
        </div>
      </main>

    </div>
  );
};
