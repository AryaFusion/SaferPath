import React, { useState, useEffect } from 'react';
import { useSafety } from '../../context/SafetyContext';
import Button from '../../components/common/Button';
import {
  ShieldCheck,
  Database,
  Trash2,
  CheckCircle2,
  X,
  RefreshCw,
} from 'lucide-react';

export const PrivacyCenter: React.FC = () => {
  const { privacy, updatePrivacy, resetTrip } = useSafety();

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showWipeModal, setShowWipeModal] = useState<boolean>(false);

  // Local Storage Inspection State
  const [storageItems, setStorageItems] = useState<{ key: string; label: string; exists: boolean; sizeBytes: number }[]>([]);

  const auditLocalStorage = () => {
    if (typeof window === 'undefined') return;
    const keysToAudit = [
      { key: 'saferpath_saved_places', label: 'Saved places & custom locations' },
      { key: 'saferpath_trusted_contacts', label: 'Trusted contacts list' },
      { key: 'saferpath_active_trip', label: 'Active trip telemetry & check-in logs' },
      { key: 'saferpath_privacy', label: 'Privacy & telemetry preferences' },
      { key: 'saferpath_profile_name', label: 'Commuter profile display name' },
    ];

    const audited = keysToAudit.map((item) => {
      const val = localStorage.getItem(item.key);
      return {
        key: item.key,
        label: item.label,
        exists: !!val,
        sizeBytes: val ? new Blob([val]).size : 0,
      };
    });

    setStorageItems(audited);
  };

  useEffect(() => {
    auditLocalStorage();
  }, []);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleClearTripLogs = () => {
    resetTrip();
    auditLocalStorage();
    triggerToast('Active trip telemetry and check-in logs cleared.');
  };

  const handleConfirmFullWipe = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('saferpath_saved_places');
      localStorage.removeItem('saferpath_trusted_contacts');
      localStorage.removeItem('saferpath_active_trip');
      localStorage.removeItem('saferpath_privacy');
      localStorage.removeItem('saferpath_profile_name');
    }
    resetTrip();
    setShowWipeModal(false);
    auditLocalStorage();
    triggerToast('All local storage caches and session data wiped completely.');
  };

  return (
    <div className="space-y-5 max-w-4xl mx-auto px-1 pb-10">
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
          Privacy Center & Storage Audit
        </h1>
        <p className="text-xs text-[#64748B]">
          Transparent overview of client-side data handling, local storage items, and data deletion controls.
        </p>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 1: PRIVACY OVERVIEW & ARCHITECTURE BOUNDARIES                     */}
      {/* ========================================================================= */}
      <div className="bg-white border border-[#DCE3EE] rounded-md p-5 space-y-4 shadow-xs">
        <div className="flex items-center gap-2.5 border-b border-[#DCE3EE] pb-3">
          <ShieldCheck className="w-5 h-5 text-[#2563EB] shrink-0" />
          <div>
            <h2 className="text-sm font-bold text-[#172033]">
              Core privacy principles
            </h2>
            <span className="text-[11px] text-[#64748B]">
              Client-first data architecture & zero user tracking policy
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="p-3.5 bg-[#F5F7FB] border border-[#DCE3EE] rounded-md space-y-1">
            <span className="font-bold text-[#172033] text-xs block">1. Local-first storage</span>
            <p className="text-[11px] text-[#64748B] leading-relaxed">
              Saved places, trusted contacts, and active walk logs reside in your browser's local storage. They are not uploaded to central tracking databases.
            </p>
          </div>

          <div className="p-3.5 bg-[#F5F7FB] border border-[#DCE3EE] rounded-md space-y-1">
            <span className="font-bold text-[#172033] text-xs block">2. Temporary walk telemetry</span>
            <p className="text-[11px] text-[#64748B] leading-relaxed">
              Check-in heartbeats and active trip activity logs are stored locally for the walk duration and auto-purged after 24 hours.
            </p>
          </div>

          <div className="p-3.5 bg-[#F5F7FB] border border-[#DCE3EE] rounded-md space-y-1">
            <span className="font-bold text-[#172033] text-xs block">3. Honest emergency handoff</span>
            <p className="text-[11px] text-[#64748B] leading-relaxed">
              SaferPath provides contextual guidance and phone dialing links. It does not automatically dispatch police or emergency responders.
            </p>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 2: GRANULAR PRIVACY SETTINGS TOGGLES                             */}
      {/* ========================================================================= */}
      <div className="bg-white border border-[#DCE3EE] rounded-md p-5 space-y-3.5 shadow-xs">
        <h2 className="text-xs font-bold text-[#172033] uppercase font-mono tracking-wider border-b border-[#DCE3EE] pb-2">
          Granular privacy controls
        </h2>

        <div className="space-y-3 text-xs">
          <label className="flex items-center justify-between p-3 bg-[#F5F7FB] border border-[#DCE3EE] rounded-md cursor-pointer hover:bg-[#EFF6FF] transition-colors">
            <div>
              <span className="font-semibold text-[#172033] block">Store search history locally</span>
              <span className="text-[#64748B] text-[11px]">Keep recent origin and destination queries in browser storage for quick reuse</span>
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
              <span className="font-semibold text-[#172033] block">Anonymous report mode</span>
              <span className="text-[#64748B] text-[11px]">Strip profile metadata when submitting physical feature reports</span>
            </div>
            <input
              type="checkbox"
              checked={privacy.anonymousReportingOnly}
              onChange={(e) => {
                updatePrivacy('anonymousReportingOnly', e.target.checked);
                triggerToast('Anonymous report preference saved.');
              }}
              className="w-4 h-4 accent-[#2563EB] rounded cursor-pointer shrink-0"
            />
          </label>

          <div className="p-3 bg-[#F5F7FB] border border-[#DCE3EE] rounded-md flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <div>
              <span className="font-semibold text-[#172033] block">Telemetry auto-purge timeframe</span>
              <span className="text-[#64748B] text-[11px]">Time window before active trip logs and check-in history are cleared</span>
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
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 3: BROWSER STORAGE TRANSPARENCY AUDIT TOOL                        */}
      {/* ========================================================================= */}
      <div className="bg-white border border-[#DCE3EE] rounded-md p-5 space-y-4 shadow-xs">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-[#DCE3EE] pb-3">
          <div>
            <h2 className="text-xs font-bold text-[#172033] uppercase font-mono tracking-wider flex items-center gap-1.5">
              <Database className="w-4 h-4 text-[#2563EB]" />
              <span>Browser storage transparency audit</span>
            </h2>
            <span className="text-[11px] text-[#64748B]">
              Inspect data items currently stored in your local browser storage
            </span>
          </div>

          <button
            onClick={auditLocalStorage}
            className="px-2.5 py-1 bg-white hover:bg-[#F5F7FB] text-[#172033] border border-[#DCE3EE] rounded text-xs font-semibold flex items-center gap-1 cursor-pointer"
          >
            <RefreshCw className="w-3 h-3 text-[#2563EB]" />
            <span>Re-audit storage</span>
          </button>
        </div>

        {/* Audit Table */}
        <div className="border border-[#DCE3EE] rounded-md overflow-hidden text-xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F5F7FB] border-b border-[#DCE3EE] text-[#64748B] font-mono text-[10px] uppercase">
                <th className="p-2.5">Storage item</th>
                <th className="p-2.5">Key</th>
                <th className="p-2.5">Status</th>
                <th className="p-2.5 text-right">Size</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DCE3EE]">
              {storageItems.map((item) => (
                <tr key={item.key} className="hover:bg-[#F5F7FB]">
                  <td className="p-2.5 font-semibold text-[#172033]">{item.label}</td>
                  <td className="p-2.5 font-mono text-[11px] text-[#64748B]">{item.key}</td>
                  <td className="p-2.5">
                    {item.exists ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-emerald-50 text-emerald-800 border border-emerald-200">
                        Active in browser
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono text-[#64748B] bg-[#F5F7FB] border border-[#DCE3EE]">
                        Empty
                      </span>
                    )}
                  </td>
                  <td className="p-2.5 text-right font-mono text-[11px] text-[#64748B]">
                    {item.exists ? `${item.sizeBytes} bytes` : '0 B'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Deletion Control Buttons */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pt-2">
          <button
            onClick={handleClearTripLogs}
            className="px-3.5 py-1.5 bg-white border border-[#DCE3EE] hover:bg-[#F5F7FB] text-[#172033] font-semibold text-xs rounded-md transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5 text-[#64748B]" />
            <span>Purge active trip logs</span>
          </button>

          <Button
            variant="caution"
            size="sm"
            onClick={() => setShowWipeModal(true)}
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Wipe all local storage data</span>
          </Button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 4: DETAILED PRIVACY POLICY STATEMENT                              */}
      {/* ========================================================================= */}
      <div className="bg-white border border-[#DCE3EE] rounded-md p-5 space-y-4 shadow-xs text-xs">
        <h2 className="text-xs font-bold text-[#172033] uppercase font-mono tracking-wider border-b border-[#DCE3EE] pb-2">
          Comprehensive privacy policy & data statements
        </h2>

        <div className="space-y-3 text-[#64748B] leading-relaxed">
          <div>
            <h3 className="font-bold text-[#172033] text-xs block">1. Geolocation & Positioning</h3>
            <p className="text-[11px] mt-0.5">
              Location positioning relies on standard web browser Geolocation APIs (`navigator.geolocation`). Position coordinates are used strictly inside your client application to evaluate nearby help points and center map viewports. Coordinates are never continuously broadcast or saved to central server tracking databases.
            </p>
          </div>

          <div>
            <h3 className="font-bold text-[#172033] text-xs block">2. Saved Places & Trusted Contacts</h3>
            <p className="text-[11px] mt-0.5">
              Saved locations and contact entries are kept locally on your device. Preloaded fixture contacts (Aarti Nandurkar, Dev Kulkarni) are sample demo entries. User-added contacts are saved in browser storage (`localStorage`) and can be edited or deleted by you at any time.
            </p>
          </div>

          <div>
            <h3 className="font-bold text-[#172033] text-xs block">3. Emergency Assistance Handoff</h3>
            <p className="text-[11px] mt-0.5">
              The emergency view provides quick phone dialing links (`tel:112`) to public emergency hotlines. SaferPath does not automatically dispatch law enforcement, fire, or medical responders. In urgent situations, users must dial 112 directly.
            </p>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL: FULL LOCAL STORAGE WIPE CONFIRMATION                               */}
      {/* ========================================================================= */}
      {showWipeModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="wipe-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#101828]/60 backdrop-blur-xs"
        >
          <div className="w-full max-w-md bg-white border border-[#DCE3EE] rounded-md shadow-lg p-5 space-y-4 animate-fadeIn">
            <div className="space-y-1">
              <h3 id="wipe-modal-title" className="text-base font-bold text-[#172033]">
                Wipe all local storage data?
              </h3>
              <p className="text-xs text-[#64748B]">
                This will permanently delete saved places, trusted contacts, active trip logs, and privacy preferences stored in this browser.
              </p>
            </div>

            <div className="flex justify-end gap-2.5 pt-2 border-t border-[#DCE3EE]">
              <button
                onClick={() => setShowWipeModal(false)}
                className="px-4 py-2 bg-white border border-[#DCE3EE] hover:bg-[#F5F7FB] text-[#172033] font-semibold text-xs rounded-md cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDeleteLocalWipe}
                className="px-4 py-2 bg-[#C62828] hover:bg-rose-800 text-white font-bold text-xs rounded-md cursor-pointer transition-colors"
              >
                Wipe data
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  function handleConfirmDeleteLocalWipe() {
    handleConfirmFullWipe();
  }
};

export default PrivacyCenter;
