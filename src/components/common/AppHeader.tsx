import React, { useState, useEffect } from 'react';
import { useSafety } from '../../context/SafetyContext';
import { Shield, Search, MapPin, AlertTriangle } from 'lucide-react';
import GlobalSearchModal from './GlobalSearchModal';

interface AppHeaderProps {
  onOpenEmergency: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({ onOpenEmergency }) => {
  const { setTab, userLocationName } = useSafety();
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Keyboard shortcut: Ctrl/Cmd + K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
      <header className="bg-white border-b border-[#DCE3EE] sticky top-0 z-30 h-14">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-full flex items-center justify-between">
          {/* Brand Logo & Title */}
          <button
            onClick={() => setTab('/route')}
            className="flex items-center gap-2 text-left cursor-pointer focus-visible-ring rounded-md p-1"
          >
            <div className="w-6 h-6 rounded-md bg-[#2563EB] text-white flex items-center justify-center font-bold text-xs shrink-0">
              <Shield className="w-3.5 h-3.5" />
            </div>
            <span className="text-sm font-bold text-[#172033] tracking-tight leading-none inline-flex items-center">
              SaferPath
            </span>
          </button>

          {/* Right Actions: Location + Global Search Trigger + Profile + Emergency */}
          <div className="flex items-center gap-2 text-xs font-medium">
            {/* Location Badge */}
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#F5F7FB] border border-[#DCE3EE] rounded-md text-[11px] font-semibold text-[#172033]">
              <MapPin className="w-3.5 h-3.5 text-[#64748B] shrink-0" />
              <span className="leading-none inline-flex items-center">{userLocationName}</span>
            </div>

            {/* Search Trigger Button with Cmd+K Badge */}
            <button
              onClick={() => setIsSearchOpen(true)}
              aria-label="Search places and pages (Ctrl + K)"
              className="px-2.5 py-1.5 rounded-md bg-[#F5F7FB] hover:bg-[#EFF6FF] border border-[#DCE3EE] hover:border-[#2563EB] flex items-center gap-2 text-[#64748B] hover:text-[#2563EB] cursor-pointer transition-colors"
            >
              <Search className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden sm:inline text-[11px] font-medium leading-none">Search...</span>
              <kbd className="hidden sm:inline-block px-1 py-0.2 rounded text-[10px] font-mono-telemetry bg-white border border-[#DCE3EE] text-[#64748B]">
                ⌘K
              </kbd>
            </button>

            {/* User Profile Avatar */}
            <div className="w-7 h-7 rounded-md bg-[#EFF6FF] text-[#2563EB] font-bold text-xs flex items-center justify-center border border-[#2563EB]/30 leading-none">
              A
            </div>

            {/* Compact Emergency Button */}
            <button
              onClick={onOpenEmergency}
              className="px-2.5 py-1.5 rounded-md text-[11px] font-semibold bg-[#C62828] text-white hover:bg-red-800 transition-colors cursor-pointer focus-visible-ring flex items-center justify-center gap-1.5 ml-1 leading-none"
              aria-label="Open emergency assistance sheet"
            >
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              <span className="leading-none inline-flex items-center">Emergency</span>
            </button>
          </div>
        </div>
      </header>

      {/* Global Search Modal Dialog */}
      <GlobalSearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
};

export default AppHeader;
