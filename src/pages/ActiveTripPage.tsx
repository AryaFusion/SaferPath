import React from 'react';
import { useSafety } from '../context/SafetyContext';

export const ActiveTripPage: React.FC = () => {
  const { activeTrip, logCheckIn, endTrip, setCurrentPage } = useSafety();

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Title */}
      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold text-stone-900 tracking-tight">
          Active trip assistance
        </h1>
        <p className="text-sm text-stone-600 leading-relaxed max-w-2xl">
          Track your walk, log check-ins, and share progress with trusted contacts.
        </p>
      </div>

      {activeTrip.active ? (
        <div className="space-y-6">
          {/* Active Walk Banner */}
          <div className="bg-white border border-emerald-300 ring-1 ring-emerald-200 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-stone-100 pb-3">
              <div>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  WALK IN PROGRESS
                </span>
                <h3 className="text-xl font-bold text-stone-900 mt-1">{activeTrip.routeName}</h3>
              </div>
              <div className="text-right">
                <span className="text-sm font-bold text-stone-900">Started at {activeTrip.startedAt}</span>
                <span className="text-xs text-stone-500 block">ETA: ~{activeTrip.etaMinutes} mins remaining</span>
              </div>
            </div>

            {/* Quick Check-In Action Buttons */}
            <div className="space-y-2 pt-1">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-700 block">
                Quick Check-in Actions:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  onClick={() => logCheckIn("Check-in logged: Pedestrian reported everything fine.")}
                  className="py-2.5 px-4 bg-stone-900 hover:bg-stone-800 text-white font-semibold text-xs rounded-xl shadow-sm transition-all cursor-pointer"
                >
                  "I'm fine — check in"
                </button>

                <button
                  onClick={() => logCheckIn("Reroute alert: Took an alternate street turn.", 'reroute')}
                  className="py-2.5 px-4 bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 font-semibold text-xs rounded-xl transition-all cursor-pointer"
                >
                  "I took a different turn"
                </button>

                <button
                  onClick={endTrip}
                  className="py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-sm transition-all cursor-pointer"
                >
                  "I've arrived"
                </button>
              </div>
            </div>
          </div>

          {/* Real-time Trip Log Timeline */}
          <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-bold text-stone-900">Trip Event Log</h3>
              <span className="text-xs text-stone-400 font-mono">24h Purge Active</span>
            </div>

            <div className="space-y-3">
              {activeTrip.logs.map((log) => (
                <div key={log.id} className="flex items-start gap-3 text-xs p-3 bg-stone-50 rounded-xl border border-stone-200/60">
                  <span className="font-mono text-stone-400 shrink-0">{log.timestamp}</span>
                  <div className="space-y-0.5">
                    <span className="font-bold text-stone-800 block">
                      {log.type === 'start' ? '🚀 Walk Commenced' : log.type === 'arrived' ? '🎉 Destination Reached' : '📍 Check-in Heartbeat'}
                    </span>
                    <span className="text-stone-600">{log.message}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-stone-200 rounded-2xl p-8 text-center space-y-4 shadow-sm">
          <div className="w-12 h-12 rounded-full bg-stone-100 text-stone-600 mx-auto flex items-center justify-center text-xl font-bold">
            🚶
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-stone-900">No active walk in progress</h3>
            <p className="text-xs text-stone-500 max-w-md mx-auto">
              Plan your walk route to enable active trip check-ins, heartbeat logging, and emergency contact sharing.
            </p>
          </div>
          <button
            onClick={() => setCurrentPage('plan')}
            className="px-5 py-2.5 bg-stone-900 hover:bg-stone-800 text-white font-semibold text-xs rounded-xl shadow-sm transition-all cursor-pointer"
          >
            Plan a walk now →
          </button>
        </div>
      )}

      {/* Retention Policy Box */}
      <div className="p-4 rounded-xl bg-stone-100 border border-stone-200 text-stone-600 text-xs flex items-center gap-2">
        <span>🔒</span>
        <span>
          <strong>Automatic Data Purge:</strong> All active trip logs and check-in timelines are automatically deleted 24 hours after completion.
        </span>
      </div>
    </div>
  );
};

export default ActiveTripPage;
