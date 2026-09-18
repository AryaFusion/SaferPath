import React from 'react';
import { useSafety } from '../context/SafetyContext';

export const HelpNearbyPage: React.FC = () => {
  const { helpPoints } = useSafety();

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Title */}
      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold text-stone-900 tracking-tight">
          Verified help points & safe havens
        </h1>
        <p className="text-sm text-stone-600 leading-relaxed max-w-2xl">
          Places you can enter or reach quickly if you need assistance, shelter, or a well-lit place to pause.
        </p>
      </div>

      {/* Help Points List */}
      <div className="space-y-4">
        {helpPoints.map((hp) => (
          <div
            key={hp.id}
            className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:shadow-md transition-all"
          >
            <div className="space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-stone-100 text-stone-800 border border-stone-200">
                  {hp.type}
                </span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                    hp.status === 'Open now' || hp.status === '24/7 Monitored'
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      : 'bg-stone-100 text-stone-600 border border-stone-200'
                  }`}
                >
                  {hp.status}
                </span>
                <span className="text-xs text-stone-500 font-medium">
                  {hp.distanceMeters}m away
                </span>
              </div>

              <h3 className="text-lg font-bold text-stone-900">{hp.name}</h3>
              <p className="text-xs text-stone-600">📍 {hp.address}</p>

              <div className="text-[11px] text-stone-400 font-medium">
                Verified by {hp.verifiedBy} · {hp.verifiedTime}
              </div>
            </div>

            {/* Quick Contact or Directions */}
            <div className="flex sm:flex-col items-center sm:items-end gap-2 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-stone-100">
              {hp.phone && (
                <a
                  href={`tel:${hp.phone}`}
                  className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white font-semibold text-xs rounded-xl shadow-sm transition-all text-center w-full sm:w-auto"
                >
                  Call {hp.phone.split('/')[0]}
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HelpNearbyPage;
