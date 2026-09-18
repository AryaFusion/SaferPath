import React, { useState } from 'react';
import { useSafety } from '../../context/SafetyContext';
import type { PageRoute } from '../../types';

export const Header: React.FC = () => {
  const { currentPage, setCurrentPage } = useSafety();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems: { id: PageRoute; label: string; icon: string }[] = [
    { id: 'plan', label: 'Plan', icon: '🗺️' },
    { id: 'help', label: 'Help nearby', icon: '🏥' },
    { id: 'report', label: 'Report', icon: '📢' },
    { id: 'trip', label: 'Active trip', icon: '🚶' },
    { id: 'contacts', label: 'Contacts', icon: '📱' },
    { id: 'privacy', label: 'Privacy', icon: '🔒' },
    { id: 'settings', label: 'Settings', icon: '⚙️' },
  ];

  const handleNav = (id: PageRoute) => {
    setCurrentPage(id);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/80 shadow-2xl">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <button
          onClick={() => handleNav('plan')}
          className="flex items-center gap-3 text-left cursor-pointer group"
        >
          <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 shadow-lg shadow-emerald-950/80 border border-emerald-300/30">
            <span className="text-base text-slate-950 font-extrabold">🛡️</span>
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-400"></span>
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold tracking-tight text-white group-hover:text-emerald-400 transition-colors">
                SaferPath
              </span>
              <span className="px-2 py-0.5 text-[9px] font-extrabold tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-full uppercase hidden sm:inline-block">
                CONTEXT ENGINE
              </span>
            </div>
          </div>
        </button>

        {/* Desktop Navbar Tabs */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-900/90 p-1.5 rounded-full border border-slate-800 text-xs font-semibold shadow-inner">
          {navItems.map((item) => {
            const isActive = currentPage === item.id || (currentPage === 'route-detail' && item.id === 'plan');
            return (
              <button
                key={item.id}
                onClick={() => handleNav(item.id)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full transition-all cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold shadow-md shadow-emerald-950/40'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <span className="text-xs">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right Emergency Quick Assist Pill & Mobile Menu Toggle */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleNav('emergency')}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold border transition-all cursor-pointer ${
              currentPage === 'emergency'
                ? 'bg-rose-600 text-white border-rose-500 shadow-lg shadow-rose-950/80 animate-pulse'
                : 'bg-rose-500/10 text-rose-400 border-rose-500/30 hover:bg-rose-500/20 hover:border-rose-500/50 shadow-md shadow-rose-950/30'
            }`}
          >
            <span className="text-sm">🆘</span>
            <span>Emergency</span>
          </button>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-400 hover:text-white focus:outline-none cursor-pointer"
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-950/95 border-b border-slate-800 px-4 py-3 space-y-1.5">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNav(item.id)}
              className={`w-full flex items-center gap-2.5 text-left px-3.5 py-2 rounded-xl text-sm font-semibold transition-colors cursor-pointer ${
                currentPage === item.id
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold'
                  : 'text-slate-300 hover:bg-slate-900'
              }`}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      )}
    </header>
  );
};

export default Header;
