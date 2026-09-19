import React, { useState, useEffect } from 'react';
import { useSafety } from '../../context/SafetyContext';
import Button from '../../components/common/Button';
import type { TimeOfDay } from '../../lib/types';
import {
  User,
  Sliders,
  Bell,
  Eye,
  Sun,
  Lock,
  Info,
  CheckCircle2,
  X,
  AlertTriangle,
  ExternalLink,
  Save,
  RotateCcw,
} from 'lucide-react';

type SettingsSection =
  | 'Profile'
  | 'Trip Preferences'
  | 'Notifications'
  | 'Accessibility'
  | 'Appearance'
  | 'Privacy'
  | 'About';

export const SettingsView: React.FC = () => {
  const {
    privacy,
    updatePrivacy,
    timeOfDay,
    setTimeOfDay,
    liveCurrentTime,
    setTab,
  } = useSafety();

  const [activeSection, setActiveSection] = useState<SettingsSection>('Profile');

  // ---------------------------------------------------------------------------
  // 1. PROFILE STATE & PERSISTENCE
  // ---------------------------------------------------------------------------
  const [profileName, setProfileName] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('saferpath_profile_name') || 'Mumbai Commuter';
    }
    return 'Mumbai Commuter';
  });

  const [savedName, setSavedName] = useState<string>(profileName);
  const hasProfileChanges = profileName.trim() !== savedName;

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = profileName.trim() || 'Mumbai Commuter';
    setProfileName(trimmed);
    setSavedName(trimmed);
    if (typeof window !== 'undefined') {
      localStorage.setItem('saferpath_profile_name', trimmed);
    }
    triggerToast('Profile changes saved successfully.');
  };

  const handleCancelProfile = () => {
    setProfileName(savedName);
  };

  // ---------------------------------------------------------------------------
  // 2. ACCESSIBILITY TOGGLES & APPLICATION EFFECTS
  // ---------------------------------------------------------------------------
  const [highContrast, setHighContrast] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('saferpath_high_contrast') === 'true';
    }
    return false;
  });

  const [reducedMotion, setReducedMotion] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('saferpath_reduced_motion') === 'true';
    }
    return false;
  });

  const [enhancedFocusRings, setEnhancedFocusRings] = useState<boolean>(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('saferpath_high_contrast', String(highContrast));
      if (highContrast) {
        document.documentElement.classList.add('high-contrast');
      } else {
        document.documentElement.classList.remove('high-contrast');
      }
    }
  }, [highContrast]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('saferpath_reduced_motion', String(reducedMotion));
      if (reducedMotion) {
        document.documentElement.classList.add('reduce-motion');
      } else {
        document.documentElement.classList.remove('reduce-motion');
      }
    }
  }, [reducedMotion]);

  // ---------------------------------------------------------------------------
  // 3. TRIP & NOTIFICATION LOCAL PREFERENCES
  // ---------------------------------------------------------------------------
  const [walkPace, setWalkPace] = useState<'standard' | 'cautious'>('standard');
  const [checkInInterval, setCheckInInterval] = useState<'10' | '15' | 'disabled'>('10');
  const [soundAlerts, setSoundAlerts] = useState<boolean>(true);
  const [tripCommencedBanner, setTripCommencedBanner] = useState<boolean>(true);

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const sectionsList: { name: SettingsSection; icon: React.ReactNode }[] = [
    { name: 'Profile', icon: <User className="w-4 h-4" /> },
    { name: 'Trip Preferences', icon: <Sliders className="w-4 h-4" /> },
    { name: 'Notifications', icon: <Bell className="w-4 h-4" /> },
    { name: 'Accessibility', icon: <Eye className="w-4 h-4" /> },
    { name: 'Appearance', icon: <Sun className="w-4 h-4" /> },
    { name: 'Privacy', icon: <Lock className="w-4 h-4" /> },
    { name: 'About', icon: <Info className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-4 max-w-4xl mx-auto px-1 pb-10">
      {/* Toast Feedback */}
      {toastMessage && (
        <div
          role="status"
          className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-md text-xs font-semibold flex items-center justify-between animate-fadeIn"
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{toastMessage}</span>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="p-1 text-emerald-700 hover:text-emerald-900 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Page Title */}
      <div className="space-y-1 pb-3 border-b border-[#DCE3EE]">
        <h1 className="text-2xl font-bold text-[#172033] tracking-tight">
          Settings
        </h1>
        <p className="text-xs text-[#64748B]">
          Configure commuter profile defaults, trip preferences, local alert behaviors, and privacy options.
        </p>
      </div>

      {/* Main Settings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
        {/* Mobile Section Selector Dropdown */}
        <div className="md:hidden space-y-1">
          <label className="text-[11px] font-semibold text-[#172033] block">
            Select settings section:
          </label>
          <select
            value={activeSection}
            onChange={(e) => setActiveSection(e.target.value as SettingsSection)}
            className="w-full p-2 bg-white border border-[#DCE3EE] rounded-md text-xs font-bold text-[#172033] focus-visible-ring"
          >
            {sectionsList.map((s) => (
              <option key={s.name} value={s.name}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        {/* Desktop Left Sidebar Menu (4 cols) */}
        <div className="hidden md:block md:col-span-4 bg-white border border-[#DCE3EE] rounded-md p-1.5 space-y-0.5 shadow-xs">
          {sectionsList.map((s) => {
            const isActive = activeSection === s.name;
            return (
              <button
                key={s.name}
                onClick={() => setActiveSection(s.name)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-xs font-medium transition-colors cursor-pointer text-left ${
                  isActive
                    ? 'bg-[#EFF6FF] text-[#172033] font-bold border-l-2 border-[#2563EB]'
                    : 'text-[#64748B] hover:bg-[#F5F7FB] hover:text-[#172033]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className={isActive ? 'text-[#2563EB]' : 'text-[#64748B]'}>{s.icon}</span>
                  <span>{s.name}</span>
                </div>
                {s.name === 'Profile' && hasProfileChanges && (
                  <span className="w-2 h-2 rounded-full bg-amber-500" title="Unsaved changes" />
                )}
              </button>
            );
          })}
        </div>

        {/* Right Settings Content Area (8 cols) */}
        <div className="md:col-span-8 bg-white border border-[#DCE3EE] rounded-md p-4 sm:p-5 space-y-4 shadow-xs">
          {/* Section Header */}
          <div className="flex justify-between items-center border-b border-[#DCE3EE] pb-3">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-[#172033]">
                {activeSection}
              </h2>
              {activeSection === 'Profile' && hasProfileChanges && (
                <span className="px-2 py-0.5 text-[10px] font-bold font-mono bg-amber-50 text-amber-900 border border-amber-300 rounded">
                  Unsaved changes
                </span>
              )}
            </div>
            <span className="text-[11px] font-mono text-[#64748B]">SaferPath v2.4.0</span>
          </div>

          {/* =================================================================== */}
          {/* 1. PROFILE                                                          */}
          {/* =================================================================== */}
          {activeSection === 'Profile' && (
            <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#172033] block">
                  Commuter display name
                </label>
                <input
                  type="text"
                  required
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  placeholder="e.g. Mumbai Commuter"
                  className="w-full px-3 py-2 bg-white border border-[#DCE3EE] rounded-md text-xs text-[#172033] focus-visible-ring"
                />
                <span className="text-[11px] text-[#64748B] block">
                  Used locally for journey summaries and check-in timeline records.
                </span>
              </div>

              <div className="p-3 bg-[#F5F7FB] border border-[#DCE3EE] rounded-md space-y-1 text-xs">
                <span className="font-bold text-[#172033] block">Local profile storage statement</span>
                <p className="text-[11px] text-[#64748B] leading-relaxed">
                  Profile information is saved exclusively in your browser's local storage. It is not submitted to a central server or user registry.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#DCE3EE]">
                {hasProfileChanges && (
                  <button
                    type="button"
                    onClick={handleCancelProfile}
                    className="px-3.5 py-1.5 bg-white border border-[#DCE3EE] hover:bg-[#F5F7FB] text-[#172033] font-semibold text-xs rounded-md transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Cancel</span>
                  </button>
                )}
                <Button type="submit" variant="primary" size="sm" disabled={!hasProfileChanges}>
                  <Save className="w-3.5 h-3.5" />
                  <span>Save profile</span>
                </Button>
              </div>
            </form>
          )}

          {/* =================================================================== */}
          {/* 2. TRIP PREFERENCES                                                 */}
          {/* =================================================================== */}
          {activeSection === 'Trip Preferences' && (
            <div className="space-y-3.5 text-xs">
              {/* Default departure time */}
              <div className="p-3 bg-[#F5F7FB] border border-[#DCE3EE] rounded-md flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div>
                  <span className="font-semibold text-[#172033] block">Default departure time</span>
                  <span className="text-[#64748B] text-[11px]">Primary time window used for walking route search calculations</span>
                </div>
                <select
                  value={timeOfDay}
                  onChange={(e) => {
                    setTimeOfDay(e.target.value as TimeOfDay);
                    triggerToast(`Default travel time updated to ${e.target.value}.`);
                  }}
                  className="px-3 py-1.5 bg-white border border-[#DCE3EE] rounded-md text-xs font-semibold text-[#172033] focus-visible-ring"
                >
                  <option value="now">NOW ({liveCurrentTime})</option>
                </select>
              </div>

              {/* Walking Pace */}
              <div className="p-3 bg-[#F5F7FB] border border-[#DCE3EE] rounded-md flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div>
                  <span className="font-semibold text-[#172033] block">Estimated walking pace</span>
                  <span className="text-[#64748B] text-[11px]">Controls estimated duration calculation multiplier</span>
                </div>
                <select
                  value={walkPace}
                  onChange={(e) => {
                    setWalkPace(e.target.value as any);
                    triggerToast('Walking pace preference updated.');
                  }}
                  className="px-3 py-1.5 bg-white border border-[#DCE3EE] rounded-md text-xs font-semibold text-[#172033] focus-visible-ring"
                >
                  <option value="standard">Standard (4.0 km/h)</option>
                  <option value="cautious">Cautious (3.2 km/h)</option>
                </select>
              </div>

              {/* Check-in Prompt Interval */}
              <div className="p-3 bg-[#F5F7FB] border border-[#DCE3EE] rounded-md flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div>
                  <span className="font-semibold text-[#172033] block">Active trip check-in interval</span>
                  <span className="text-[#64748B] text-[11px]">Frequency of "I'm okay" prompt indicators during active walks</span>
                </div>
                <select
                  value={checkInInterval}
                  onChange={(e) => {
                    setCheckInInterval(e.target.value as any);
                    triggerToast('Check-in interval preference saved.');
                  }}
                  className="px-3 py-1.5 bg-white border border-[#DCE3EE] rounded-md text-xs font-semibold text-[#172033] focus-visible-ring"
                >
                  <option value="10">Every 10 mins (default)</option>
                  <option value="15">Every 15 mins</option>
                  <option value="disabled">Disabled (Manual only)</option>
                </select>
              </div>
            </div>
          )}

          {/* =================================================================== */}
          {/* 3. NOTIFICATIONS                                                    */}
          {/* =================================================================== */}
          {activeSection === 'Notifications' && (
            <div className="space-y-3.5 text-xs">
              <label className="flex items-center justify-between p-3 bg-[#F5F7FB] border border-[#DCE3EE] rounded-md cursor-pointer hover:bg-[#EFF6FF] transition-colors">
                <div>
                  <span className="font-semibold text-[#172033] block">Check-in sound feedback</span>
                  <span className="text-[#64748B] text-[11px]">Play local audio confirmation when logging check-in status</span>
                </div>
                <input
                  type="checkbox"
                  checked={soundAlerts}
                  onChange={(e) => {
                    setSoundAlerts(e.target.checked);
                    triggerToast(e.target.checked ? 'Sound feedback enabled.' : 'Sound feedback muted.');
                  }}
                  className="w-4 h-4 accent-[#2563EB] rounded cursor-pointer shrink-0"
                />
              </label>

              <label className="flex items-center justify-between p-3 bg-[#F5F7FB] border border-[#DCE3EE] rounded-md cursor-pointer hover:bg-[#EFF6FF] transition-colors">
                <div>
                  <span className="font-semibold text-[#172033] block">Trip start confirmation banner</span>
                  <span className="text-[#64748B] text-[11px]">Show in-app banner upon starting an active walk</span>
                </div>
                <input
                  type="checkbox"
                  checked={tripCommencedBanner}
                  onChange={(e) => {
                    setTripCommencedBanner(e.target.checked);
                    triggerToast('Notification setting saved.');
                  }}
                  className="w-4 h-4 accent-[#2563EB] rounded cursor-pointer shrink-0"
                />
              </label>

              {/* Operational Boundary Notice */}
              <div className="p-3 bg-amber-50 border border-amber-200 text-amber-900 rounded-md space-y-1">
                <span className="font-bold block flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
                  <span>Browser-based local alerts only</span>
                </span>
                <p className="text-[11px] leading-relaxed">
                  Notifications are handled strictly inside your active browser session. SaferPath does not deliver SMS, email, or server push notifications.
                </p>
              </div>
            </div>
          )}

          {/* =================================================================== */}
          {/* 4. ACCESSIBILITY                                                   */}
          {/* =================================================================== */}
          {activeSection === 'Accessibility' && (
            <div className="space-y-3.5 text-xs">
              <label className="flex items-center justify-between p-3 bg-[#F5F7FB] border border-[#DCE3EE] rounded-md cursor-pointer hover:bg-[#EFF6FF] transition-colors">
                <div>
                  <span className="font-semibold text-[#172033] block">High contrast UI mode</span>
                  <span className="text-[#64748B] text-[11px]">Increases border sharpness and text contrast across controls</span>
                </div>
                <input
                  type="checkbox"
                  checked={highContrast}
                  onChange={(e) => {
                    setHighContrast(e.target.checked);
                    triggerToast(e.target.checked ? 'High contrast mode enabled.' : 'Standard contrast mode restored.');
                  }}
                  className="w-4 h-4 accent-[#2563EB] rounded cursor-pointer shrink-0"
                />
              </label>

              <label className="flex items-center justify-between p-3 bg-[#F5F7FB] border border-[#DCE3EE] rounded-md cursor-pointer hover:bg-[#EFF6FF] transition-colors">
                <div>
                  <span className="font-semibold text-[#172033] block">Reduced motion mode</span>
                  <span className="text-[#64748B] text-[11px]">Disables pulsating indicators and transition animations</span>
                </div>
                <input
                  type="checkbox"
                  checked={reducedMotion}
                  onChange={(e) => {
                    setReducedMotion(e.target.checked);
                    triggerToast(e.target.checked ? 'Reduced motion enabled.' : 'Standard animations restored.');
                  }}
                  className="w-4 h-4 accent-[#2563EB] rounded cursor-pointer shrink-0"
                />
              </label>

              <label className="flex items-center justify-between p-3 bg-[#F5F7FB] border border-[#DCE3EE] rounded-md cursor-pointer hover:bg-[#EFF6FF] transition-colors">
                <div>
                  <span className="font-semibold text-[#172033] block">Enhanced keyboard focus rings</span>
                  <span className="text-[#64748B] text-[11px]">Highlights active interactive buttons for keyboard navigation</span>
                </div>
                <input
                  type="checkbox"
                  checked={enhancedFocusRings}
                  onChange={(e) => setEnhancedFocusRings(e.target.checked)}
                  className="w-4 h-4 accent-[#2563EB] rounded cursor-pointer shrink-0"
                />
              </label>
            </div>
          )}

          {/* =================================================================== */}
          {/* 5. APPEARANCE                                                       */}
          {/* =================================================================== */}
          {activeSection === 'Appearance' && (
            <div className="space-y-3.5 text-xs">
              <div className="p-3 bg-[#F5F7FB] border border-[#DCE3EE] rounded-md flex justify-between items-center">
                <div>
                  <span className="font-semibold text-[#172033] block">Application theme</span>
                  <span className="text-[#64748B] text-[11px]">Light civic mobility design system</span>
                </div>
                <span className="px-2.5 py-1 text-[11px] font-bold font-mono bg-white text-[#2563EB] border border-[#DCE3EE] rounded">
                  Light mode active
                </span>
              </div>

              <div className="p-3.5 bg-white border border-[#DCE3EE] rounded-md space-y-1.5">
                <span className="font-bold text-[#172033] block">Theme policy note</span>
                <p className="text-[11px] text-[#64748B] leading-relaxed">
                  SaferPath uses a high-contrast Light Mobility palette optimized for outdoor day & evening visibility. Dark mode is currently not implemented to preserve strict color contrast guidelines.
                </p>
              </div>
            </div>
          )}

          {/* =================================================================== */}
          {/* 6. PRIVACY                                                          */}
          {/* =================================================================== */}
          {activeSection === 'Privacy' && (
            <div className="space-y-3.5 text-xs">
              <label className="flex items-center justify-between p-3 bg-[#F5F7FB] border border-[#DCE3EE] rounded-md cursor-pointer hover:bg-[#EFF6FF] transition-colors">
                <div>
                  <span className="font-semibold text-[#172033] block">Local search history</span>
                  <span className="text-[#64748B] text-[11px]">Store recent origin/destination searches in browser localStorage</span>
                </div>
                <input
                  type="checkbox"
                  checked={privacy.storeSearchHistoryLocally}
                  onChange={(e) => {
                    updatePrivacy('storeSearchHistoryLocally', e.target.checked);
                    triggerToast('Search history storage setting updated.');
                  }}
                  className="w-4 h-4 accent-[#2563EB] rounded cursor-pointer shrink-0"
                />
              </label>

              <label className="flex items-center justify-between p-3 bg-[#F5F7FB] border border-[#DCE3EE] rounded-md cursor-pointer hover:bg-[#EFF6FF] transition-colors">
                <div>
                  <span className="font-semibold text-[#172033] block">Anonymous report submissions</span>
                  <span className="text-[#64748B] text-[11px]">Omit user profile metadata when submitting physical feature reports</span>
                </div>
                <input
                  type="checkbox"
                  checked={privacy.anonymousReportingOnly}
                  onChange={(e) => {
                    updatePrivacy('anonymousReportingOnly', e.target.checked);
                    triggerToast('Anonymous reporting preference saved.');
                  }}
                  className="w-4 h-4 accent-[#2563EB] rounded cursor-pointer shrink-0"
                />
              </label>

              <div className="p-3 bg-[#F5F7FB] border border-[#DCE3EE] rounded-md flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div>
                  <span className="font-semibold text-[#172033] block">Telemetry auto-purge window</span>
                  <span className="text-[#64748B] text-[11px]">Local storage auto-purge timeframe for active trip telemetry</span>
                </div>
                <select
                  value={privacy.autoPurgeHours}
                  onChange={(e) => {
                    updatePrivacy('autoPurgeHours', Number(e.target.value));
                    triggerToast(`Auto-purge window updated to ${e.target.value}h.`);
                  }}
                  className="px-3 py-1.5 bg-white border border-[#DCE3EE] rounded-md text-xs font-semibold text-[#172033] focus-visible-ring"
                >
                  <option value={12}>12 hours</option>
                  <option value={24}>24 hours (default)</option>
                  <option value={48}>48 hours</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setTab('/privacy')}
                  className="px-4 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold text-xs rounded-md shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <span>Open Privacy Center</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* =================================================================== */}
          {/* 7. ABOUT                                                            */}
          {/* =================================================================== */}
          {activeSection === 'About' && (
            <div className="space-y-4 text-xs">
              <div className="p-4 bg-[#F5F7FB] border border-[#DCE3EE] rounded-md space-y-2">
                <div className="flex justify-between items-center border-b border-[#DCE3EE] pb-2">
                  <h3 className="text-base font-bold text-[#172033]">SaferPath</h3>
                  <span className="px-2 py-0.5 font-mono text-[10px] font-bold bg-white text-[#2563EB] border border-[#DCE3EE] rounded">
                    v2.4.0-civic
                  </span>
                </div>
                <p className="text-xs text-[#64748B] leading-relaxed">
                  SaferPath is a pedestrian mobility guidance application designed to provide contextual evidence comparison across walking corridors.
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-[#172033] font-mono uppercase text-[11px]">How contextual evidence works</h4>
                <p className="text-xs text-[#64748B] leading-relaxed">
                  Instead of generating subjective "safety scores" or classifying routes as safe vs dangerous, SaferPath evaluates objective physical attributes—such as municipal streetlamp coverage, footfall density, commercial open hours, and community physical observations.
                </p>
              </div>

              <div className="p-3.5 bg-amber-50 border border-amber-200 text-amber-900 rounded-md space-y-1">
                <span className="font-bold block flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
                  <span>Operational disclaimers & boundaries</span>
                </span>
                <p className="text-[11px] leading-relaxed">
                  SaferPath provides contextual evidence for informational purposes. It does not provide real-time GPS tracking or automatic emergency service dispatch. For immediate life-threatening emergencies, dial official emergency services (112 / 100) directly.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsView;
