import React from 'react';
import { useSafety } from '../../context/SafetyContext';
import Button from '../../components/common/Button';
import { Navigation, AlertTriangle, Lock } from 'lucide-react';

interface TripStatusProps {
  onOpenEmergency: () => void;
}

export const TripStatus: React.FC<TripStatusProps> = ({ onOpenEmergency }) => {
  const { activeTrip, logTripCheckIn, endTrip, setTab } = useSafety();

  return (
    <div className="space-y-4 max-w-4xl mx-auto px-1">
      {/* Title */}
      <div className="space-y-1 pb-3 border-b border-[#D9DDE3]">
        <h1 className="text-2xl font-bold text-[#142033] tracking-tight">
          Active trip
        </h1>
        <p className="text-xs text-[#5F6B7A]">
          Real-time walk check-in tracking and telemetry heartbeat logging.
        </p>
      </div>

      {activeTrip && activeTrip.status === 'In progress' ? (
        <div className="space-y-4">
          {/* Main Status Display */}
          <div className="bg-white border border-[#D9DDE3] rounded-md p-5 space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-[#D9DDE3] pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#0B8F83] animate-pulse" aria-hidden="true" />
                  <span className="text-xs font-mono-telemetry uppercase text-[#0B8F83] font-bold">
                    Journey active
                  </span>
                </div>
                <h2 className="text-xl font-bold text-[#142033] mt-0.5">
                  {activeTrip.routeName}
                </h2>
              </div>

              <div className="text-right">
                <span className="text-[11px] font-mono-telemetry text-[#5F6B7A] block">Commenced at {activeTrip.startedAt}</span>
                <span className="text-base font-bold text-[#142033] font-mono-telemetry">
                  Est. {activeTrip.durationMinutes} min remaining
                </span>
              </div>
            </div>

            {/* Operational Actions */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-[#142033] uppercase font-mono-telemetry block">
                Operational Actions
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  onClick={() => logTripCheckIn("Pedestrian check-in logged: Journey proceeding normally.")}
                  className="py-2.5 px-3.5 bg-[#142033] hover:bg-slate-800 text-white font-medium text-xs rounded-md cursor-pointer flex items-center justify-between transition-colors"
                >
                  <span>Log normal check-in</span>
                  <span className="font-mono-telemetry text-[11px] text-[#0B8F83]">✓ Heartbeat</span>
                </button>

                <button
                  onClick={() => logTripCheckIn("Route adjustment logged: Took an alternate street turn.", 'route_adjustment')}
                  className="py-2.5 px-3.5 bg-[#F1F3F2] hover:bg-[#D9DDE3] text-[#142033] border border-[#D9DDE3] font-medium text-xs rounded-md cursor-pointer flex items-center justify-between transition-colors"
                >
                  <span>Log route turn adjustment</span>
                  <span className="font-mono-telemetry text-[11px] text-[#5F6B7A]">↗ Reroute</span>
                </button>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 pt-1">
                <button
                  onClick={endTrip}
                  className="flex-1 py-2.5 px-3.5 bg-[#0B8F83] hover:bg-[#08766D] text-white font-semibold text-xs rounded-md transition-colors cursor-pointer"
                >
                  Arrived at destination
                </button>

                <button
                  onClick={onOpenEmergency}
                  className="py-2.5 px-3.5 bg-[#C83B4A] hover:bg-rose-800 text-white font-semibold text-xs rounded-md transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Emergency assist</span>
                </button>
              </div>
            </div>
          </div>

          {/* Telemetry Log Table */}
          <div className="bg-white border border-[#D9DDE3] rounded-md p-4 space-y-2.5">
            <div className="flex justify-between items-center border-b border-[#D9DDE3] pb-2">
              <h3 className="text-xs font-bold text-[#142033] uppercase font-mono-telemetry">Check-in telemetry log</h3>
              <span className="text-[11px] font-mono-telemetry text-[#5F6B7A]">24h Auto-Purge Active</span>
            </div>

            <div className="space-y-1.5 divide-y divide-[#D9DDE3]/60">
              {activeTrip.checkInLogs.map((log) => (
                <div key={log.id} className="flex items-start gap-2.5 text-xs pt-1.5 first:pt-0">
                  <span className="font-mono-telemetry text-[#5F6B7A] shrink-0 text-[11px]">{log.timestamp}</span>
                  <div>
                    <span className="font-semibold text-[#142033] block text-[11px]">
                      {log.event === 'walk_commenced'
                        ? 'Journey commenced'
                        : log.event === 'destination_reached'
                        ? 'Destination reached'
                        : 'Heartbeat logged'}
                    </span>
                    <span className="text-[#5F6B7A] text-[11px]">{log.message}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-[#D9DDE3] rounded-md p-8 text-center space-y-3">
          <div className="w-10 h-10 rounded-md bg-[#F1F3F2] text-[#5F6B7A] mx-auto flex items-center justify-center">
            <Navigation className="w-5 h-5 text-[#0B8F83]" />
          </div>
          <div className="space-y-1">
            <h2 className="text-base font-bold text-[#142033]">No active trip in progress</h2>
            <p className="text-xs text-[#5F6B7A] max-w-md mx-auto">
              Select a route option from the planner workspace to initiate journey check-in logging.
            </p>
          </div>
          <Button variant="primary" size="md" onClick={() => setTab('/route')}>
            Plan a route
          </Button>
        </div>
      )}

      {/* 24h Data Retention Notice */}
      <div className="p-3 rounded-md bg-[#F1F3F2] border border-[#D9DDE3] text-[#5F6B7A] text-xs flex items-center gap-2">
        <Lock className="w-3.5 h-3.5 text-[#5F6B7A] shrink-0" />
        <span><strong>Data Retention:</strong> All active journey timelines and check-in logs are automatically purged 24 hours after completion.</span>
      </div>
    </div>
  );
};

export default TripStatus;
