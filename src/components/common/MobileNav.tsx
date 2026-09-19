import React from 'react';
import { useSafety } from '../../context/SafetyContext';
import type { AppRoute } from '../../lib/routes';

export const MobileNav: React.FC = () => {
  const { tab, setTab, activeTrip } = useSafety();

  const items: { path: AppRoute; label: string; icon: string }[] = [
    { path: '/route', label: 'Route', icon: '🧭' },
    { path: '/trip', label: 'Trip', icon: '🚶' },
    { path: '/reports', label: 'Reports', icon: '📢' },
    { path: '/help', label: 'Help', icon: '🏥' },
    { path: '/settings', label: 'Settings', icon: '⚙️' },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#faf8f5]/95 backdrop-blur-md border-t border-stone-200/90 shadow-lg">
      {/* Active Trip Persistent Status Bar if walking */}
      {activeTrip && activeTrip.status === 'In progress' && (
        <div
          onClick={() => setTab('/trip')}
          className="bg-teal-900 text-white text-[11px] px-4 py-1.5 flex items-center justify-between cursor-pointer font-medium"
        >
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
            <span className="truncate">Walk active: {activeTrip.routeName}</span>
          </div>
          <span className="font-mono-telemetry font-bold">~{activeTrip.durationMinutes}m</span>
        </div>
      )}

      {/* Main Bottom Tabs */}
      <div className="grid grid-cols-5 h-14">
        {items.map((item) => {
          const isActive = tab === item.path;
          return (
            <button
              key={item.path}
              onClick={() => {
                setTab(item.path);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`flex flex-col items-center justify-center gap-0.5 text-[10px] font-medium transition-colors cursor-pointer focus-visible-ring ${
                isActive ? 'text-slate-950 font-bold' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <span className="text-base" aria-hidden="true">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileNav;
