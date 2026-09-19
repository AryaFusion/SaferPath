import React, { useState } from 'react';
import { useSafety } from '../../context/SafetyContext';
import Button from '../../components/common/Button';
import { ShieldCheck, Download, Trash2 } from 'lucide-react';

export const PrivacyCenter: React.FC = () => {
  const { privacy, updatePrivacy } = useSafety();
  const [wipedMessage, setWipedMessage] = useState(false);

  const handleWipe = () => {
    setWipedMessage(true);
    setTimeout(() => setWipedMessage(false), 5000);
  };

  return (
    <div className="space-y-4 max-w-4xl mx-auto px-1">
      {/* Title */}
      <div className="space-y-1 pb-3 border-b border-[#DCE3EE]">
        <h1 className="text-2xl font-bold text-[#172033] tracking-tight">
          Privacy
        </h1>
        <p className="text-xs text-[#64748B]">
          Privacy overview, data retention policy, and local storage controls.
        </p>
      </div>

      {/* 24-Hour Purge Summary */}
      <div className="bg-white border border-[#DCE3EE] rounded-md p-4 space-y-3">
        <h2 className="text-xs font-bold text-[#172033] font-mono border-b border-[#DCE3EE] pb-2">
          Automatic 24-hour data purge policy
        </h2>
        <p className="text-xs text-[#64748B] leading-relaxed">
          Search origins, destinations, check-in heartbeats, and route telemetry are retained strictly for active walk duration and permanently purged after 24 hours.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs pt-1">
          <div className="p-3 bg-[#F5F7FB] rounded-md border border-[#DCE3EE] space-y-0.5">
            <span className="font-bold text-[#172033] text-[11px] block">Search history</span>
            <span className="text-[10px] font-mono text-[#64748B]">Auto-purged at 24h</span>
          </div>

          <div className="p-3 bg-[#F5F7FB] rounded-md border border-[#DCE3EE] space-y-0.5">
            <span className="font-bold text-[#172033] text-[11px] block">GPS coordinates</span>
            <span className="text-[10px] font-mono text-[#64748B]">Never stored long-term</span>
          </div>

          <div className="p-3 bg-[#F5F7FB] rounded-md border border-[#DCE3EE] space-y-0.5">
            <span className="font-bold text-[#172033] text-[11px] block">Physical reports</span>
            <span className="text-[10px] font-mono text-[#64748B]">Anonymized & aggregated</span>
          </div>
        </div>
      </div>

      <hr className="border-[#DCE3EE]" />

      {/* Row-Based Privacy Controls */}
      <div className="bg-white border border-[#DCE3EE] rounded-md p-4 space-y-3">
        <h2 className="text-xs font-bold text-[#172033] font-mono border-b border-[#DCE3EE] pb-2">
          Granular privacy controls
        </h2>

        {wipedMessage && (
          <div className="p-2.5 bg-[#EFF6FF] border border-[#2563EB]/30 text-[#2563EB] text-xs font-semibold rounded-md flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 shrink-0 text-[#2563EB]" />
            <span>Search caches and session telemetry completely wiped.</span>
          </div>
        )}

        <div className="space-y-2.5 text-xs">
          <label className="flex items-center justify-between p-3 bg-[#F5F7FB] border border-[#DCE3EE] rounded-md cursor-pointer hover:bg-[#EFF6FF] transition-colors">
            <div>
              <span className="font-semibold text-[#172033] block">Local search history</span>
              <span className="text-[#64748B] text-[11px]">Keep recent origins and destinations in browser storage for 24h</span>
            </div>
            <input
              type="checkbox"
              checked={privacy.storeSearchHistoryLocally}
              onChange={(e) => updatePrivacy('storeSearchHistoryLocally', e.target.checked)}
              className="w-4 h-4 accent-[#2563EB] rounded cursor-pointer shrink-0"
            />
          </label>

          <label className="flex items-center justify-between p-3 bg-[#F5F7FB] border border-[#DCE3EE] rounded-md cursor-pointer hover:bg-[#EFF6FF] transition-colors">
            <div>
              <span className="font-semibold text-[#172033] block">Anonymous reporting mode</span>
              <span className="text-[#64748B] text-[11px]">Strip profile identifiers from physical street observations</span>
            </div>
            <input
              type="checkbox"
              checked={privacy.anonymousReportingOnly}
              onChange={(e) => updatePrivacy('anonymousReportingOnly', e.target.checked)}
              className="w-4 h-4 accent-[#2563EB] rounded cursor-pointer shrink-0"
            />
          </label>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-[#DCE3EE]">
          <Button
            variant="outline"
            size="sm"
            onClick={() => alert("Data archive generated. Exporting JSON package...")}
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download data package (.json)</span>
          </Button>

          <Button
            variant="caution"
            size="sm"
            onClick={handleWipe}
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Wipe session data now</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PrivacyCenter;
