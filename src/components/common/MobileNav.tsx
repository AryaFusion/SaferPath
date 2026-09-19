import React from 'react';
import { Compass, Footprints, Megaphone, Stethoscope, Settings } from 'lucide-react';
import { useSafety } from '../../context/SafetyContext';
import type { AppRoute } from '../../lib/routes';

export const MobileNav: React.FC = () => {
  const { tab, setTab, activeTrip } = useSafety();

  const items: { path: AppRoute; label: string; icon: React.FC<{ className?: string }> }[] = [
    { path: '/route', label: 'Route', icon: Compass },
    { path: '/trip', label: 'Trip', icon: Footprints },
    { path: '/reports', label: 'Reports', icon: Megaphone },
    { path: '/help', label: 'Help', icon: Stethoscope },
    { path: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-[#DCE3EE] shadow-sm">
      {/* Active Trip Persistent Status Bar if walking */}
      {activeTrip && activeTrip.status === 'In progress' && (
        <div
          onClick={() => setTab('/trip')}
          className="bg-[#2563EB] text-white text-[11px] px-4 py-1.5 flex items-center justify-between cursor-pointer font-medium"
        >
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#38BDF8] animate-pulse" />
            <span className="truncate">Walk active: {activeTrip.routeName}</span>
          </div>
          <span className="font-mono text-xs font-bold font-telemetry">~{activeTrip.durationMinutes}m</span>
        </div>
      )}

      {/* Main Bottom Tabs */}
      <div className="grid grid-cols-5 h-14">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = tab === item.path;
          return (
            <button
              key={item.path}
              onClick={() => {
                setTab(item.path);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`flex flex-col items-center justify-center gap-1 text-[11px] font-medium transition-colors cursor-pointer ${
                isActive ? 'text-[#2563EB] font-semibold' : 'text-[#64748B] hover:text-[#172033]'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-[#2563EB]' : 'text-[#64748B]'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileNav;
