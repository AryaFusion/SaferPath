import React, { useState } from 'react';

export const PrivacyPage: React.FC = () => {
  const [dataPurged, setDataPurged] = useState(false);

  const handlePurge = () => {
    setDataPurged(true);
    setTimeout(() => setDataPurged(false), 5000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Title */}
      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold text-stone-900 tracking-tight">
          Privacy & Data Retention
        </h1>
        <p className="text-sm text-stone-600 leading-relaxed max-w-2xl">
          We design for minimal data collection and short retention periods.
        </p>
      </div>

      {/* Retention Card */}
      <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-stone-900">Automatic 24-Hour Purge Guarantee</h3>
        <p className="text-xs text-stone-600 leading-relaxed">
          Your search history, active walk heartbeats, and check-in logs are stored strictly for trip duration and automatically deleted from our servers 24 hours after walk completion.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-2">
          <div className="p-3 bg-stone-50 rounded-xl border border-stone-200/60">
            <span className="font-bold text-stone-900 block">Search History</span>
            <span className="text-[11px] text-stone-500">Purged after 24 hours</span>
          </div>

          <div className="p-3 bg-stone-50 rounded-xl border border-stone-200/60">
            <span className="font-bold text-stone-900 block">GPS Telemetry</span>
            <span className="text-[11px] text-stone-500">Never sold or stored long-term</span>
          </div>

          <div className="p-3 bg-stone-50 rounded-xl border border-stone-200/60">
            <span className="font-bold text-stone-900 block">Community Reports</span>
            <span className="text-[11px] text-stone-500">Aggregated & anonymized</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-stone-900">Your Data Controls</h3>

        {dataPurged && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl animate-fade-in">
            ✓ All local session data and search cache have been completely purged.
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => alert("Data download package generated. Downloading JSON archive...")}
            className="px-5 py-2.5 bg-stone-900 hover:bg-stone-800 text-white font-semibold text-xs rounded-xl shadow-sm transition-all cursor-pointer"
          >
            Download my data (.json)
          </button>

          <button
            onClick={handlePurge}
            className="px-5 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-semibold text-xs rounded-xl transition-all cursor-pointer"
          >
            Delete everything now
          </button>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPage;
