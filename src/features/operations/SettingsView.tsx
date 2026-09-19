import React, { useState } from 'react';
import { useSafety } from '../../context/SafetyContext';
import { Sliders, Bell, Lock } from 'lucide-react';

export const SettingsView: React.FC = () => {
  const { privacy, updatePrivacy } = useSafety();
  const [activeCategory, setActiveCategory] = useState<'Telemetry' | 'Privacy' | 'Notifications'>('Telemetry');

  return (
    <div className="space-y-4 max-w-4xl mx-auto px-1">
      {/* Title */}
      <div className="space-y-1 pb-3 border-b border-[#D9DDE3]">
        <h1 className="text-2xl font-bold text-[#142033] tracking-tight">
          Settings
        </h1>
        <p className="text-xs text-[#5F6B7A]">
          Configure application preferences, telemetry permissions, and privacy defaults.
        </p>
      </div>

      {/* Two-Column Layout (Left Categories / Right Settings) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Left Categories Menu (4 cols) */}
        <div className="md:col-span-4 bg-white border border-[#D9DDE3] rounded-md p-2 space-y-0.5">
          <button
            onClick={() => setActiveCategory('Telemetry')}
            className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer text-left ${
              activeCategory === 'Telemetry'
                ? 'bg-[#EBF2F1] text-[#142033] font-semibold border-l-2 border-[#0B8F83]'
                : 'text-[#5F6B7A] hover:bg-[#F1F3F2]'
            }`}
          >
            <Sliders className="w-3.5 h-3.5 text-[#0B8F83]" />
            <span>Telemetry & Location</span>
          </button>

          <button
            onClick={() => setActiveCategory('Privacy')}
            className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer text-left ${
              activeCategory === 'Privacy'
                ? 'bg-[#EBF2F1] text-[#142033] font-semibold border-l-2 border-[#0B8F83]'
                : 'text-[#5F6B7A] hover:bg-[#F1F3F2]'
            }`}
          >
            <Lock className="w-3.5 h-3.5 text-[#5F6B7A]" />
            <span>Data Retention</span>
          </button>

          <button
            onClick={() => setActiveCategory('Notifications')}
            className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer text-left ${
              activeCategory === 'Notifications'
                ? 'bg-[#EBF2F1] text-[#142033] font-semibold border-l-2 border-[#0B8F83]'
                : 'text-[#5F6B7A] hover:bg-[#F1F3F2]'
            }`}
          >
            <Bell className="w-3.5 h-3.5 text-[#5F6B7A]" />
            <span>Notifications</span>
          </button>
        </div>

        {/* Right Settings Rows (8 cols) */}
        <div className="md:col-span-8 bg-white border border-[#D9DDE3] rounded-md p-4 space-y-4">
          <div className="border-b border-[#D9DDE3] pb-2">
            <h2 className="text-xs font-bold text-[#142033] uppercase font-mono-telemetry">
              {activeCategory} Preferences
            </h2>
          </div>

          <div className="space-y-3 text-xs">
            <label className="flex items-center justify-between p-3 bg-[#F1F3F2] border border-[#D9DDE3] rounded-md cursor-pointer hover:bg-[#D9DDE3]/50 transition-colors">
              <div>
                <span className="font-semibold text-[#142033] block">Location Access Permission</span>
                <span className="text-[#5F6B7A] text-[11px]">Used exclusively for route context comparison and nearby help points</span>
              </div>
              <input
                type="checkbox"
                checked={privacy.shareLocationWithContacts}
                onChange={(e) => updatePrivacy('shareLocationWithContacts', e.target.checked)}
                className="w-4 h-4 accent-[#142033] rounded cursor-pointer shrink-0"
              />
            </label>

            <label className="flex items-center justify-between p-3 bg-[#F1F3F2] border border-[#D9DDE3] rounded-md cursor-pointer hover:bg-[#D9DDE3]/50 transition-colors">
              <div>
                <span className="font-semibold text-[#142033] block">Local Search History</span>
                <span className="text-[#5F6B7A] text-[11px]">Store recent search locations locally for quick re-use</span>
              </div>
              <input
                type="checkbox"
                checked={privacy.storeSearchHistoryLocally}
                onChange={(e) => updatePrivacy('storeSearchHistoryLocally', e.target.checked)}
                className="w-4 h-4 accent-[#142033] rounded cursor-pointer shrink-0"
              />
            </label>

            <div className="p-3 bg-[#F1F3F2] border border-[#D9DDE3] rounded-md flex items-center justify-between">
              <div>
                <span className="font-semibold text-[#142033] block">Data Auto-Purge Window</span>
                <span className="text-[#5F6B7A] text-[11px]">Automatically purge active trip logs and check-in history</span>
              </div>
              <select
                value={privacy.autoPurgeHours}
                onChange={(e) => updatePrivacy('autoPurgeHours', Number(e.target.value))}
                className="px-2 py-1 bg-white border border-[#D9DDE3] rounded-md text-xs font-semibold text-[#142033]"
              >
                <option value={12}>12 Hours</option>
                <option value={24}>24 Hours (Default)</option>
                <option value={48}>48 Hours</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsView;
