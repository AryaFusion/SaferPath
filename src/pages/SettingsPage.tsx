import React from 'react';
import { useSafety } from '../context/SafetyContext';

export const SettingsPage: React.FC = () => {
  const { settings, updateSettings } = useSafety();

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Title */}
      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold text-stone-900 tracking-tight">
          App Settings & Permissions
        </h1>
        <p className="text-sm text-stone-600 leading-relaxed max-w-2xl">
          Manage system permissions, active trip tracking preferences, and privacy controls.
        </p>
      </div>

      {/* Permissions Switches Card */}
      <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-stone-900 border-b border-stone-100 pb-3">
          Permissions & Telemetry Controls
        </h3>

        <div className="space-y-4 text-xs">
          <label className="flex items-center justify-between p-3.5 bg-stone-50 border border-stone-200/80 rounded-xl cursor-pointer hover:bg-stone-100/60 transition-colors">
            <div>
              <span className="font-bold text-stone-900 block">Device Location Access</span>
              <span className="text-stone-500 text-[11px]">Used exclusively for route comparison and nearby help points</span>
            </div>
            <input
              type="checkbox"
              checked={settings.locationAccess}
              onChange={(e) => updateSettings('locationAccess', e.target.checked)}
              className="w-4 h-4 accent-stone-900 rounded cursor-pointer"
            />
          </label>

          <label className="flex items-center justify-between p-3.5 bg-stone-50 border border-stone-200/80 rounded-xl cursor-pointer hover:bg-stone-100/60 transition-colors">
            <div>
              <span className="font-bold text-stone-900 block">Active Trip Heartbeat Tracking</span>
              <span className="text-stone-500 text-[11px]">Log periodic check-ins during an active walk</span>
            </div>
            <input
              type="checkbox"
              checked={settings.activeTripTracking}
              onChange={(e) => updateSettings('activeTripTracking', e.target.checked)}
              className="w-4 h-4 accent-stone-900 rounded cursor-pointer"
            />
          </label>

          <label className="flex items-center justify-between p-3.5 bg-stone-50 border border-stone-200/80 rounded-xl cursor-pointer hover:bg-stone-100/60 transition-colors">
            <div>
              <span className="font-bold text-stone-900 block">Trusted Contact Sharing</span>
              <span className="text-stone-500 text-[11px]">Allow trusted contacts to receive automated check-in notifications</span>
            </div>
            <input
              type="checkbox"
              checked={settings.contactSharing}
              onChange={(e) => updateSettings('contactSharing', e.target.checked)}
              className="w-4 h-4 accent-stone-900 rounded cursor-pointer"
            />
          </label>

          <label className="flex items-center justify-between p-3.5 bg-stone-50 border border-stone-200/80 rounded-xl cursor-pointer hover:bg-stone-100/60 transition-colors">
            <div>
              <span className="font-bold text-stone-900 block">Public Street Reporting</span>
              <span className="text-stone-500 text-[11px]">Contribute anonymous physical observations to public context</span>
            </div>
            <input
              type="checkbox"
              checked={settings.publicReporting}
              onChange={(e) => updateSettings('publicReporting', e.target.checked)}
              className="w-4 h-4 accent-stone-900 rounded cursor-pointer"
            />
          </label>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
