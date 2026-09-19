import React, { useState, useEffect } from 'react';
import { useSafety } from '../../context/SafetyContext';
import { Search, MapPin, MapPinned, ClipboardList, Navigation, X, ChevronRight } from 'lucide-react';
import type { AppRoute } from '../../lib/routes';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({ isOpen, onClose }) => {
  const { helpPoints, reports, setTab, setOriginLocation, setDestinationLocation } = useSafety();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Close on Escape, focus input on open
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const savedPlaces = [
    { title: 'Shivaji Park, Mumbai', type: 'Saved place', route: '/route' as AppRoute, action: 'origin' },
    { title: 'Dadar Station West, Mumbai', type: 'Saved place', route: '/route' as AppRoute, action: 'destination' },
    { title: 'Matunga West, Mumbai', type: 'Saved place', route: '/route' as AppRoute, action: 'origin' },
  ];

  const helpResults = helpPoints.map((hp) => ({
    title: hp.name,
    type: `Help Point (${hp.category})`,
    route: '/help' as AppRoute,
    action: 'navigate',
  }));

  const reportResults = reports.map((r) => ({
    title: `${r.category}: ${r.locationDescription}`,
    type: 'Physical report',
    route: '/reports' as AppRoute,
    action: 'navigate',
  }));

  const systemPages = [
    { title: 'Plan a route', type: 'Application page', route: '/route' as AppRoute, action: 'navigate' },
    { title: 'Evidence Report', type: 'Application page', route: '/evidence' as AppRoute, action: 'navigate' },
    { title: 'Verified Help Nearby', type: 'Application page', route: '/help' as AppRoute, action: 'navigate' },
    { title: 'Reports Stepper', type: 'Application page', route: '/reports' as AppRoute, action: 'navigate' },
    { title: 'Active Trip Monitor', type: 'Application page', route: '/trip' as AppRoute, action: 'navigate' },
    { title: 'Saved Places & Contacts', type: 'Application page', route: '/saved-places' as AppRoute, action: 'navigate' },
    { title: 'Telemetry Settings', type: 'Application page', route: '/settings' as AppRoute, action: 'navigate' },
    { title: 'Privacy Center', type: 'Application page', route: '/privacy' as AppRoute, action: 'navigate' },
  ];

  const allItems = [...savedPlaces, ...helpResults, ...reportResults, ...systemPages];

  const filteredItems = query.trim()
    ? allItems.filter(
        (item) =>
          item.title.toLowerCase().includes(query.toLowerCase()) ||
          item.type.toLowerCase().includes(query.toLowerCase())
      )
    : allItems.slice(0, 8);

  const handleSelect = (item: typeof allItems[0]) => {
    if (item.action === 'origin') {
      setOriginLocation(item.title);
    } else if (item.action === 'destination') {
      setDestinationLocation(item.title);
    }
    setTab(item.route);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4 bg-[#101828]/60 backdrop-blur-xs">
      <div
        className="w-full max-w-lg bg-white border border-[#DCE3EE] rounded-md shadow-xl overflow-hidden space-y-0"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Input Bar */}
        <div className="p-3 border-b border-[#DCE3EE] flex items-center gap-2.5 bg-[#F7FAFF]">
          <Search className="w-4 h-4 text-[#2563EB] shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Search saved places, help points, reports, pages (Cmd + K)..."
            className="w-full bg-transparent text-xs text-[#172033] focus:outline-none placeholder-[#64748B]"
          />
          {query && (
            <button onClick={() => setQuery('')} className="p-0.5 text-[#64748B] hover:text-[#172033] text-xs">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono-telemetry bg-white border border-[#DCE3EE] text-[#64748B]">
            ESC
          </span>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto divide-y divide-[#DCE3EE]/60 text-xs">
          {filteredItems.length > 0 ? (
            filteredItems.map((item, idx) => (
              <div
                key={idx}
                onClick={() => handleSelect(item)}
                onMouseEnter={() => setSelectedIndex(idx)}
                className={`p-3 flex items-center justify-between cursor-pointer transition-colors ${
                  idx === selectedIndex ? 'bg-[#EFF6FF] text-[#2563EB]' : 'hover:bg-[#F5F7FB] text-[#172033]'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  {item.type.includes('Saved') ? (
                    <MapPin className="w-3.5 h-3.5 text-[#2563EB] shrink-0" />
                  ) : item.type.includes('Help') ? (
                    <MapPinned className="w-3.5 h-3.5 text-[#0F766E] shrink-0" />
                  ) : item.type.includes('Report') ? (
                    <ClipboardList className="w-3.5 h-3.5 text-[#172033] shrink-0" />
                  ) : (
                    <Navigation className="w-3.5 h-3.5 text-[#2563EB] shrink-0" />
                  )}

                  <div className="truncate">
                    <span className="font-semibold block text-xs truncate">{item.title}</span>
                    <span className="text-[10px] text-[#64748B] font-mono-telemetry block">{item.type}</span>
                  </div>
                </div>

                <ChevronRight className="w-3.5 h-3.5 text-[#64748B] shrink-0" />
              </div>
            ))
          ) : (
            <div className="p-6 text-center text-[#64748B] text-xs">
              No matching places, help points, or system pages found.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-2 bg-[#F5F7FB] border-t border-[#DCE3EE] text-[10px] font-mono-telemetry text-[#64748B] flex justify-between items-center px-3">
          <span>SaferPath Global Search</span>
          <span>Use Enter to navigate</span>
        </div>
      </div>
    </div>
  );
};

export default GlobalSearchModal;
