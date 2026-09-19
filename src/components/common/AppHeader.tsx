import React from 'react';
import { useSafety } from '../../context/SafetyContext';
import { Shield, Search, MapPin, AlertTriangle } from 'lucide-react';

interface AppHeaderProps {
  onOpenEmergency: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({ onOpenEmergency }) => {
  const { setTab } = useSafety();

  return (
    <header className="bg-white border-b border-[#D9DDE3] sticky top-0 z-30 h-14">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-full flex items-center justify-between">
        {/* Brand Logo & Title */}
        <button
          onClick={() => setTab('/route')}
          className="flex items-center gap-2 text-left cursor-pointer focus-visible-ring rounded-md p-1"
        >
          <div className="w-6 h-6 rounded-md bg-[#0B8F83] text-white flex items-center justify-center font-bold text-xs shrink-0">
            <Shield className="w-3.5 h-3.5" />
          </div>
          <span className="text-sm font-bold text-[#142033] tracking-tight leading-none inline-flex items-center">
            SaferPath
          </span>
        </button>

        {/* Right Actions: Location + Search + Profile + Emergency */}
        <div className="flex items-center gap-2 text-xs font-medium">
          {/* Location Badge */}
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#F1F3F2] border border-[#D9DDE3] rounded-md text-[11px] font-semibold text-[#142033]">
            <MapPin className="w-3.5 h-3.5 text-[#5F6B7A] shrink-0" />
            <span className="leading-none inline-flex items-center">Mumbai</span>
          </div>

          {/* Search Button */}
          <button
            aria-label="Search places"
            className="w-7 h-7 rounded-md bg-white border border-[#D9DDE3] flex items-center justify-center text-[#5F6B7A] hover:text-[#142033] hover:bg-[#F1F3F2] cursor-pointer"
          >
            <Search className="w-3.5 h-3.5 shrink-0" />
          </button>

          {/* User Profile Avatar */}
          <div className="w-7 h-7 rounded-md bg-[#EBF2F1] text-[#0B8F83] font-bold text-xs flex items-center justify-center border border-[#0B8F83]/30 leading-none">
            A
          </div>

          {/* Compact Emergency Button */}
          <button
            onClick={onOpenEmergency}
            className="px-2.5 py-1.5 rounded-md text-[11px] font-semibold bg-[#C83B4A] text-white hover:bg-rose-800 transition-colors cursor-pointer focus-visible-ring flex items-center justify-center gap-1.5 ml-1 leading-none"
            aria-label="Open emergency assistance sheet"
          >
            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
            <span className="leading-none inline-flex items-center">Emergency</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
