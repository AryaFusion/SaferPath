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
      <div className="space-y-1 pb-3 border-b border-[#DCE3EE]">
        <h1 className="text-2xl font-bold text-[#172033] tracking-tight">
          Active trip
        </h1>
        <p className="text-xs text-[#64748B]">
          Real-time walk check-in tracking and telemetry heartbeat logging.
        </p>
      </div>

      {activeTrip && activeTrip.status === 'In progress' ? (
        <div className="space-y-4">
          {/* Main Status Display */}
          <div className="bg-white border border-[#DCE3EE] rounded-md p-5 space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-[#DCE3EE] pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#2563EB] animate-pulse" aria-hidden="true" />
                  <span className="text-xs font-mono uppercase text-[#2563EB] font-bold">
                    Journey active
                  </span>
                </div>
                <h2 className="text-xl font-bold text-[#172033] mt-0.5">
                  {activeTrip.routeName}
                </h2>
              </div>

              <div className="text-right">
                <span className="text-[11px] font-mono text-[#64748B] block">Commenced at {activeTrip.startedAt}</span>
                <span className="text-base font-bold text-[#172033] font-mono">
                  Est. {activeTrip.durationMinutes} min remaining
                </span>
              </div>
            </div>

            {/* Operational Actions */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-[#172033] font-mono block">
                Operational actions
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  onClick={() => logTripCheckIn("Pedestrian check-in logged: Journey proceeding normally.")}
                  className="py-2.5 px-3.5 bg-[#172033] hover:bg-[#101828] text-white font-medium text-xs rounded-md cursor-pointer flex items-center justify-between transition-colors"
                >
                  <span>Log normal check-in</span>
                  <span className="font-mono text-[11px] text-[#38BDF8]">✓ Heartbeat</span>
                </button>

                <button
                  onClick={() => logTripCheckIn("Route adjustment logged: Took an alternate street turn.", 'route_adjustment')}
                  className="py-2.5 px-3.5 bg-[#F5F7FB] hover:bg-[#EFF6FF] text-[#172033] border border-[#DCE3EE] font-medium text-xs rounded-md cursor-pointer flex items-center justify-between transition-colors"
                >
                  <span>Log route turn adjustment</span>
                  <span className="font-mono text-[11px] text-[#64748B]">↗ Reroute</span>
                </button>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 pt-1">
                <button
                  onClick={endTrip}
                  className="flex-1 py-2.5 px-3.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold text-xs rounded-md transition-colors cursor-pointer"
                >
                  Arrived at destination
                </button>

                <button
                  onClick={onOpenEmergency}
                  className="py-2.5 px-3.5 bg-[#C62828] hover:bg-rose-800 text-white font-semibold text-xs rounded-md transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Emergency assist</span>
                </button>
              </div>
            </div>
          </div>

          {/* Telemetry Log Table */}
          <div className="bg-white border border-[#DCE3EE] rounded-md p-4 space-y-2.5">
            <div className="flex justify-between items-center border-b border-[#DCE3EE] pb-2">
              <h3 className="text-xs font-bold text-[#172033] font-mono">Check-in telemetry log</h3>
              <span className="text-[11px] font-mono text-[#64748B]">24h auto-purge active</span>
            </div>

            <div className="space-y-1.5 divide-y divide-[#DCE3EE]">
              {activeTrip.checkInLogs.map((log) => (
                <div key={log.id} className="flex items-start gap-2.5 text-xs pt-1.5 first:pt-0">
                  <span className="font-mono text-[#64748B] shrink-0 text-[11px]">{log.timestamp}</span>
                  <div>
                    <span className="font-semibold text-[#172033] block text-[11px]">
                      {log.event === 'walk_commenced'
                        ? 'Journey commenced'
                        : log.event === 'destination_reached'
                        ? 'Destination reached'
                        : 'Heartbeat logged'}
                    </span>
                    <span className="text-[#64748B] text-[11px]">{log.message}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-[#DCE3EE] rounded-md p-8 text-center space-y-3">
          <div className="w-10 h-10 rounded-md bg-[#F5F7FB] text-[#64748B] mx-auto flex items-center justify-center">
            <Navigation className="w-5 h-5 text-[#2563EB]" />
          </div>
          <div className="space-y-1">
            <h2 className="text-base font-bold text-[#172033]">No active trip in progress</h2>
            <p className="text-xs text-[#64748B] max-w-md mx-auto">
              Select a route option from the planner workspace to initiate journey check-in logging.
            </p>
          </div>
          <Button variant="primary" size="md" onClick={() => setTab('/route')}>
            Plan a route
          </Button>
        </div>
      )}

      {/* 24h Data Retention Notice */}
      <div className="p-3 rounded-md bg-[#F5F7FB] border border-[#DCE3EE] text-[#64748B] text-xs flex items-center gap-2">
        <Lock className="w-3.5 h-3.5 text-[#64748B] shrink-0" />
        <span><strong>Data retention:</strong> All active journey timelines and check-in logs are automatically purged 24 hours after completion.</span>
      </div>
    </div>
  );
};

export default TripStatus;
