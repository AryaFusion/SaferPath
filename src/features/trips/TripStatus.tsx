import React, { useState, useEffect } from 'react';
import { useSafety } from '../../context/SafetyContext';
import Button from '../../components/common/Button';
import {
  Navigation,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Phone,
  UserCheck,
  UserPlus,
  ArrowRight,
  X,
  Radio,
  RotateCcw,
  Info,
  Lock,
  ChevronRight,
  HelpCircle,
  ExternalLink,
} from 'lucide-react';

interface TripStatusProps {
  onOpenEmergency: () => void;
}

export const TripStatus: React.FC<TripStatusProps> = ({ onOpenEmergency }) => {
  const {
    activeTrip,
    selectedRoute,
    routes,
    setSelectedRouteId,
    originLocation,
    destinationLocation,
    timeOfDay,
    liveCurrentTime,
    selectedTimeDisplay,
    contacts,
    startTrip,
    logTripCheckIn,
    endTrip,
    resetTrip,
    setTab,
  } = useSafety();

  const [selectedContactId, setSelectedContactId] = useState<string>(
    () => (contacts.length > 0 ? contacts[0].id : '')
  );
  const [showCheckInNotice, setShowCheckInNotice] = useState<boolean>(false);
  const [lastCheckInTime, setLastCheckInTime] = useState<string>('');
  const [showStopConfirmation, setShowStopConfirmation] = useState<boolean>(false);
  const [showNeedHelpModal, setShowNeedHelpModal] = useState<boolean>(false);

  // Compute dynamic elapsed time for active trip
  const [elapsedMinutes, setElapsedMinutes] = useState<number>(0);

  useEffect(() => {
    if (!activeTrip || activeTrip.status !== 'In progress') {
      setElapsedMinutes(0);
      return;
    }

    const calculateElapsed = () => {
      const startMs = activeTrip.startedAtTimestamp || Date.now();
      const nowMs = Date.now();
      const diffMins = Math.max(0, Math.floor((nowMs - startMs) / (1000 * 60)));
      setElapsedMinutes(diffMins);
    };

    calculateElapsed();
    const interval = setInterval(calculateElapsed, 15000); // update every 15s
    return () => clearInterval(interval);
  }, [activeTrip]);

  // Handle "I'm okay" check-in action
  const handleCheckIn = () => {
    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    logTripCheckIn('Check-in recorded: Pedestrian journey proceeding normally.', 'checkin_ok');
    setLastCheckInTime(nowStr);
    setShowCheckInNotice(true);
    setTimeout(() => {
      setShowCheckInNotice(false);
    }, 4000);
  };

  // Handle trip start from BEFORE TRIP view
  const handleStartTrip = () => {
    if (!selectedRoute) return;
    startTrip(selectedRoute.id, selectedContactId || undefined);
  };

  // Handle confirmed trip stop
  const handleConfirmStop = () => {
    setShowStopConfirmation(false);
    endTrip();
  };

  // Active trusted contact model
  const activeContact = contacts.find(
    (c) => c.id === (activeTrip?.trustedContactId || selectedContactId)
  ) || contacts[0] || null;

  // Calculate estimated arrival time
  const getEstimatedArrival = () => {
    if (!activeTrip) return '';
    const startMs = activeTrip.startedAtTimestamp || Date.now();
    const targetMs = startMs + activeTrip.durationMinutes * 60 * 1000;
    return new Date(targetMs).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Determine current trip state
  const isBeforeTrip = !activeTrip || activeTrip.status === 'Before trip';
  const isActiveTrip = activeTrip && activeTrip.status === 'In progress';
  const isCompletedTrip = activeTrip && activeTrip.status === 'Completed';

  return (
    <div className="space-y-5 max-w-4xl mx-auto px-1 pb-8">
      {/* Top Page Header */}
      <div className="space-y-1 pb-3 border-b border-[#DCE3EE]">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-[#172033] tracking-tight">
            Active trip
          </h1>
          {isActiveTrip && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#EFF6FF] border border-[#2563EB]/30 text-[#2563EB] text-xs font-semibold font-mono">
              <span className="w-2 h-2 rounded-full bg-[#2563EB] animate-pulse" aria-hidden="true" />
              Trip in progress
            </span>
          )}
          {isCompletedTrip && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold font-mono">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Completed
            </span>
          )}
        </div>
        <p className="text-xs text-[#64748B]">
          {isBeforeTrip && 'Select journey parameters and start walk check-in tracking.'}
          {isActiveTrip && 'Real-time journey progress and timestamped check-in telemetry.'}
          {isCompletedTrip && 'Journey summary and check-in timeline archive.'}
        </p>
      </div>

      {/* ========================================================================= */}
      {/* STATE A: BEFORE TRIP                                                     */}
      {/* ========================================================================= */}
      {isBeforeTrip && (
        <div className="space-y-4">
          {/* Journey Config Card */}
          <div className="bg-white border border-[#DCE3EE] rounded-md p-5 space-y-4 shadow-xs">
            <div className="flex justify-between items-center border-b border-[#DCE3EE] pb-3">
              <h2 className="text-xs font-bold uppercase font-mono text-[#172033] tracking-wider">
                Selected journey configuration
              </h2>
              <button
                onClick={() => setTab('/route')}
                className="text-xs font-semibold text-[#2563EB] hover:text-[#1D4ED8] cursor-pointer flex items-center gap-1"
              >
                <span>Change route</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Origin -> Destination Route Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-3 bg-[#F5F7FB] border border-[#DCE3EE] rounded-md space-y-1">
                <span className="text-[10px] font-mono text-[#64748B] uppercase font-bold block">From (Origin)</span>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#2563EB] shrink-0" />
                  <span className="text-xs font-bold text-[#172033] truncate">{originLocation}</span>
                </div>
              </div>

              <div className="p-3 bg-[#F5F7FB] border border-[#DCE3EE] rounded-md space-y-1">
                <span className="text-[10px] font-mono text-[#64748B] uppercase font-bold block">To (Destination)</span>
                <div className="flex items-center gap-2">
                  <Navigation className="w-4 h-4 text-[#2563EB] shrink-0" />
                  <span className="text-xs font-bold text-[#172033] truncate">{destinationLocation}</span>
                </div>
              </div>
            </div>

            {/* Route Selector & Metrics */}
            {selectedRoute ? (
              <div className="space-y-3 pt-1">
                {/* Route Selection Dropdown if multiple routes exist */}
                {routes.length > 1 && (
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-[#172033] block">
                      Select active route variant:
                    </label>
                    <select
                      value={selectedRoute.id}
                      onChange={(e) => setSelectedRouteId(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-[#DCE3EE] rounded-md text-xs text-[#172033] font-medium focus-visible-ring"
                    >
                      {routes.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.name} ({r.via}) — {r.durationMinutes} min ({r.distanceKm} km)
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Selected Route Info Strip */}
                <div className="p-4 bg-[#F5F7FB] border border-[#DCE3EE] rounded-md space-y-3">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-[#DCE3EE] pb-2.5">
                    <div>
                      <span className="text-[10px] font-mono uppercase text-[#2563EB] font-bold block">Selected route</span>
                      <h3 className="text-sm font-bold text-[#172033]">
                        {selectedRoute.name} <span className="font-normal text-[#64748B]">via {selectedRoute.via}</span>
                      </h3>
                    </div>
                    <span className="px-2.5 py-1 rounded text-[11px] font-semibold bg-white border border-[#DCE3EE] text-[#172033]">
                      {selectedRoute.supportLevel}
                    </span>
                  </div>

                  {/* Summary Metrics Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                    <div>
                      <span className="text-[10px] text-[#64748B] block">Departure time</span>
                      <span className="font-bold text-[#172033]">
                        {timeOfDay === 'now' ? `NOW · ${liveCurrentTime}` : selectedTimeDisplay}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#64748B] block">Est. duration</span>
                      <span className="font-bold text-[#172033]">{selectedRoute.durationMinutes} min</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#64748B] block">Distance</span>
                      <span className="font-bold text-[#172033]">{selectedRoute.distanceKm} km</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#64748B] block">Evidence freshness</span>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="font-bold text-[#172033]">{selectedRoute.freshness || 'Observed 10 mins ago'}</span>
                        <span className="px-1.5 py-0.2 text-[9px] font-mono font-semibold bg-[#F1F5F9] text-[#64748B] border border-[#CBD5E1] rounded">
                          Sample data
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-md text-xs text-amber-900 flex items-center justify-between">
                <span>No route selected. Please plan a route first.</span>
                <Button variant="primary" size="sm" onClick={() => setTab('/route')}>
                  Plan route
                </Button>
              </div>
            )}

            {/* Trusted Contact Selection Strip */}
            <div className="space-y-2 pt-2 border-t border-[#DCE3EE]">
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-bold text-[#172033] font-mono">
                  Trusted contact for trip sharing
                </h3>
                <button
                  onClick={() => setTab('/saved-places')}
                  className="text-[11px] font-semibold text-[#2563EB] hover:underline cursor-pointer flex items-center gap-1"
                >
                  <UserPlus className="w-3 h-3" />
                  <span>Manage contacts</span>
                </button>
              </div>

              {contacts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {contacts.map((c) => {
                    const isSelected = c.id === (selectedContactId || contacts[0].id);
                    return (
                      <div
                        key={c.id}
                        onClick={() => setSelectedContactId(c.id)}
                        className={`p-3 rounded-md border cursor-pointer transition-colors flex items-center justify-between text-xs ${
                          isSelected
                            ? 'bg-[#EFF6FF] border-[#2563EB] text-[#172033]'
                            : 'bg-white border-[#DCE3EE] hover:bg-[#F5F7FB] text-[#64748B]'
                        }`}
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-[#172033] text-xs">{c.name}</span>
                            <span className="text-[10px] text-[#64748B] font-mono">({c.relationship})</span>
                            {c.id.startsWith('c-') && (
                              <span className="px-1.5 py-0.2 text-[9px] font-mono font-semibold bg-[#F1F5F9] text-[#64748B] border border-[#CBD5E1] rounded">
                                Demo contact
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] font-mono text-[#64748B] block">{c.phone}</span>
                        </div>
                        {isSelected && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-[#2563EB] text-white">
                            Selected
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-3 bg-[#F5F7FB] border border-[#DCE3EE] rounded-md text-xs text-[#64748B] flex items-center justify-between">
                  <span>No trusted contacts configured.</span>
                  <button
                    onClick={() => setTab('/saved-places')}
                    className="px-3 py-1 bg-white hover:bg-[#EFF6FF] text-[#2563EB] font-semibold text-xs border border-[#DCE3EE] rounded cursor-pointer"
                  >
                    Set up trusted contact
                  </button>
                </div>
              )}
            </div>

            {/* Primary Action Button */}
            <div className="pt-3">
              <button
                onClick={handleStartTrip}
                disabled={!selectedRoute}
                className="w-full sm:w-auto px-8 py-3 bg-[#2563EB] hover:bg-[#1D4ED8] disabled:bg-[#CBD5E1] text-white font-bold text-sm rounded-md shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                <Navigation className="w-4 h-4" />
                <span>Start trip</span>
              </button>
            </div>
          </div>

          {/* Operational Clarification Disclaimer */}
          <div className="p-3.5 rounded-md bg-[#F5F7FB] border border-[#DCE3EE] text-[#64748B] text-xs flex items-start gap-2.5">
            <Info className="w-4 h-4 text-[#2563EB] shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="font-bold text-[#172033] block">Operational telemetry statement</span>
              <p>
                SaferPath active trip provides self-directed check-ins and contact notification logs.
                It does not provide live GPS satellite tracking or automatic emergency service dispatch.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STATE B: ACTIVE TRIP                                                      */}
      {/* ========================================================================= */}
      {isActiveTrip && (
        <div className="space-y-4">
          {/* Check-In Confirmation Toast Banner */}
          {showCheckInNotice && (
            <div
              role="alert"
              className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-md text-xs font-semibold flex items-center justify-between animate-fadeIn"
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Check-in recorded at {lastCheckInTime}. Log added to timeline.</span>
              </div>
              <button
                onClick={() => setShowCheckInNotice(false)}
                className="p-1 text-emerald-700 hover:text-emerald-900 cursor-pointer"
                aria-label="Dismiss check-in notification"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Active Journey Overview Header */}
          <div className="bg-white border border-[#DCE3EE] rounded-md p-5 space-y-4 shadow-xs">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-[#DCE3EE] pb-3">
              <div>
                <span className="text-[10px] font-mono uppercase text-[#2563EB] font-bold block">
                  ACTIVE TRIP
                </span>
                <h2 className="text-lg font-bold text-[#172033] mt-0.5 flex items-center gap-2">
                  <span>{activeTrip.origin}</span>
                  <ArrowRight className="w-4 h-4 text-[#64748B] shrink-0" />
                  <span>{activeTrip.destination}</span>
                </h2>
                <span className="text-xs text-[#64748B] font-medium block mt-0.5">
                  {activeTrip.routeName}
                </span>
              </div>

              <div className="text-left sm:text-right">
                <span className="text-[11px] font-mono text-[#64748B] block">Status: Trip in progress</span>
                <span className="text-sm font-bold text-[#172033] font-mono">
                  {activeTrip.durationMinutes} min journey ({activeTrip.remainingDistanceKm} km)
                </span>
              </div>
            </div>

            {/* Journey Progress Data Matrix */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#F5F7FB] border border-[#DCE3EE] p-3.5 rounded-md text-xs font-mono">
              <div>
                <span className="text-[10px] text-[#64748B] block uppercase font-bold">Started</span>
                <span className="font-bold text-[#172033]">{activeTrip.startedAt}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#64748B] block uppercase font-bold">Elapsed</span>
                <span className="font-bold text-[#2563EB]">{elapsedMinutes} min</span>
              </div>
              <div>
                <span className="text-[10px] text-[#64748B] block uppercase font-bold">Est. arrival</span>
                <span className="font-bold text-[#172033]">{getEstimatedArrival()}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#64748B] block uppercase font-bold">Selected route</span>
                <span className="font-bold text-[#172033] truncate block">{activeTrip.routeName}</span>
              </div>
            </div>

            {/* GPS Disclaimer Banner */}
            <div className="text-[11px] text-[#64748B] bg-white border border-[#DCE3EE] p-2.5 rounded-md flex items-center gap-2">
              <Radio className="w-3.5 h-3.5 text-[#2563EB] shrink-0 animate-pulse" />
              <span>
                <strong>Telemetry note:</strong> GPS location is not actively tracked. Progress is recorded via user-initiated check-ins.
              </span>
            </div>

            {/* Operational Action Controls Grid */}
            <div className="space-y-2.5 pt-2">
              <span className="text-xs font-bold text-[#172033] font-mono block">
                Primary active controls
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {/* 1. Primary Check-in: I'm okay */}
                <button
                  onClick={handleCheckIn}
                  className="py-3 px-4 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-xs rounded-md shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-2 min-h-[44px]"
                  aria-label="Log I am okay check-in"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>I'm okay</span>
                </button>

                {/* 2. Secondary Action: Need help */}
                <button
                  onClick={() => setShowNeedHelpModal(true)}
                  className="py-3 px-4 bg-white border border-[#DCE3EE] hover:bg-[#F5F7FB] text-[#172033] font-bold text-xs rounded-md shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-2 min-h-[44px]"
                  aria-label="Open assistance options"
                >
                  <HelpCircle className="w-4 h-4 text-[#2563EB]" />
                  <span>Need help</span>
                </button>

                {/* 3. Emergency Action */}
                <button
                  onClick={onOpenEmergency}
                  className="py-3 px-4 bg-[#C62828] hover:bg-rose-800 text-white font-bold text-xs rounded-md shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-2 min-h-[44px]"
                  aria-label="Open official emergency options"
                >
                  <AlertTriangle className="w-4 h-4" />
                  <span>Emergency</span>
                </button>
              </div>

              {/* Stop Trip Action Button */}
              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setShowStopConfirmation(true)}
                  className="py-2 px-3.5 bg-white border border-[#DCE3EE] hover:bg-rose-50 text-[#C62828] hover:border-rose-300 font-semibold text-xs rounded-md transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Stop trip</span>
                </button>
              </div>
            </div>
          </div>

          {/* Trusted Contact Status Box */}
          {activeContact && (
            <div className="bg-white border border-[#DCE3EE] rounded-md p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-md bg-[#F5F7FB] border border-[#DCE3EE] flex items-center justify-center text-[#2563EB]">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#172033]">{activeContact.name}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-[#EFF6FF] text-[#2563EB] border border-[#2563EB]/20">
                      Trip sharing active
                    </span>
                    {activeContact.id.startsWith('c-') && (
                      <span className="px-1.5 py-0.5 text-[9px] font-mono font-semibold bg-[#F1F5F9] text-[#64748B] border border-[#CBD5E1] rounded">
                        Demo contact
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] font-mono text-[#64748B]">
                    {activeContact.relationship} • {activeContact.phone}
                  </span>
                </div>
              </div>

              <a
                href={`tel:${activeContact.phone}`}
                className="px-3 py-1.5 bg-white hover:bg-[#F5F7FB] text-[#172033] text-xs font-medium border border-[#DCE3EE] rounded-md transition-colors flex items-center gap-1.5"
              >
                <Phone className="w-3.5 h-3.5 text-[#2563EB]" />
                <span>Call contact</span>
              </a>
            </div>
          )}

          {/* Compact Check-In Timeline */}
          <div className="bg-white border border-[#DCE3EE] rounded-md p-4 space-y-3">
            <div className="flex justify-between items-center border-b border-[#DCE3EE] pb-2">
              <h3 className="text-xs font-bold text-[#172033] uppercase font-mono tracking-wider">
                Trip activity timeline ({activeTrip.checkInLogs.length})
              </h3>
              <span className="text-[11px] font-mono text-[#64748B]">Updated real-time</span>
            </div>

            <div className="space-y-0 relative pl-4 border-l-2 border-[#DCE3EE] ml-2">
              {activeTrip.checkInLogs.map((log, idx) => (
                <div key={log.id} className="relative pb-4 last:pb-0">
                  {/* Timeline dot */}
                  <span
                    className={`absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full border-2 border-white ${
                      idx === 0 ? 'bg-[#2563EB]' : 'bg-[#64748B]'
                    }`}
                  />
                  <div className="flex items-start justify-between gap-2 text-xs">
                    <div>
                      <span className="font-semibold text-[#172033] block text-xs">
                        {log.event === 'walk_commenced'
                          ? 'Trip started'
                          : log.event === 'destination_reached'
                          ? 'Trip completed'
                          : 'Check-in recorded'}
                      </span>
                      <p className="text-[#64748B] text-xs mt-0.5">{log.message}</p>
                    </div>
                    <span className="font-mono text-[#64748B] text-[11px] shrink-0">{log.timestamp}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STATE C: TRIP COMPLETED                                                  */}
      {/* ========================================================================= */}
      {isCompletedTrip && (
        <div className="space-y-4">
          <div className="bg-white border border-[#DCE3EE] rounded-md p-6 space-y-5 text-center sm:text-left shadow-xs">
            {/* Header Checkmark */}
            <div className="flex flex-col sm:flex-row items-center gap-4 border-b border-[#DCE3EE] pb-4">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <div className="space-y-0.5">
                <span className="text-xs font-bold uppercase font-mono text-emerald-700 block">
                  Walk completed
                </span>
                <h2 className="text-xl font-bold text-[#172033]">
                  Trip completed successfully
                </h2>
                <p className="text-xs text-[#64748B]">
                  Your check-in session for this walk has ended.
                </p>
              </div>
            </div>

            {/* Trip Summary Table */}
            <div className="bg-[#F5F7FB] border border-[#DCE3EE] rounded-md p-4 space-y-3 text-xs">
              <h3 className="text-xs font-bold text-[#172033] font-mono border-b border-[#DCE3EE] pb-2">
                Trip summary details
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <span className="text-[#64748B] text-[11px] block font-mono">FROM</span>
                  <span className="font-bold text-[#172033]">{activeTrip.origin}</span>
                </div>
                <div>
                  <span className="text-[#64748B] text-[11px] block font-mono">TO</span>
                  <span className="font-bold text-[#172033]">{activeTrip.destination}</span>
                </div>
                <div>
                  <span className="text-[#64748B] text-[11px] block font-mono">Route</span>
                  <span className="font-bold text-[#172033]">{activeTrip.routeName}</span>
                </div>
                <div>
                  <span className="text-[#64748B] text-[11px] block font-mono">Check-ins recorded</span>
                  <span className="font-bold text-[#172033]">{activeTrip.checkInLogs.length}</span>
                </div>
                <div>
                  <span className="text-[#64748B] text-[11px] block font-mono">Started</span>
                  <span className="font-bold text-[#172033]">{activeTrip.startedAt}</span>
                </div>
                <div>
                  <span className="text-[#64748B] text-[11px] block font-mono">Ended</span>
                  <span className="font-bold text-[#172033]">{activeTrip.endedAt || 'Just now'}</span>
                </div>
              </div>
            </div>

            {/* Full Activity Timeline Archive */}
            <div className="space-y-2 text-left">
              <h3 className="text-xs font-bold text-[#172033] font-mono">
                Log activity archive
              </h3>
              <div className="bg-white border border-[#DCE3EE] rounded-md divide-y divide-[#DCE3EE]">
                {activeTrip.checkInLogs.map((log) => (
                  <div key={log.id} className="p-3 flex justify-between items-start text-xs">
                    <div>
                      <span className="font-semibold text-[#172033] block text-xs">
                        {log.event === 'walk_commenced'
                          ? 'Trip started'
                          : log.event === 'destination_reached'
                          ? 'Trip ended'
                          : 'Check-in recorded'}
                      </span>
                      <span className="text-[#64748B] text-[11px]">{log.message}</span>
                    </div>
                    <span className="font-mono text-[#64748B] text-[11px] shrink-0">{log.timestamp}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={() => {
                  resetTrip();
                  setTab('/route');
                }}
                className="px-6 py-2.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold text-xs rounded-md shadow-xs transition-colors cursor-pointer"
              >
                Back to Route Planner
              </button>

              <button
                onClick={resetTrip}
                className="px-6 py-2.5 bg-white border border-[#DCE3EE] hover:bg-[#F5F7FB] text-[#172033] font-semibold text-xs rounded-md transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Start another trip</span>
              </button>
            </div>
          </div>

          {/* Retention notice */}
          <div className="p-3 rounded-md bg-[#F5F7FB] border border-[#DCE3EE] text-[#64748B] text-xs flex items-center gap-2">
            <Lock className="w-3.5 h-3.5 text-[#64748B] shrink-0" />
            <span>
              <strong>Data retention:</strong> All active journey timelines and check-in logs are stored locally and purged 24 hours after completion.
            </span>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: STOP TRIP CONFIRMATION                                           */}
      {/* ========================================================================= */}
      {showStopConfirmation && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="stop-trip-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#101828]/60 backdrop-blur-xs"
        >
          <div className="w-full max-w-md bg-white border border-[#DCE3EE] rounded-md shadow-lg p-5 space-y-4 animate-fadeIn">
            <div className="space-y-1">
              <h3 id="stop-trip-title" className="text-base font-bold text-[#172033]">
                End this trip?
              </h3>
              <p className="text-xs text-[#64748B]">
                This will conclude your active walk check-in session and log your final arrival time.
              </p>
            </div>

            <div className="flex justify-end gap-2.5 pt-2 border-t border-[#DCE3EE]">
              <button
                onClick={() => setShowStopConfirmation(false)}
                className="px-4 py-2 bg-white border border-[#DCE3EE] hover:bg-[#F5F7FB] text-[#172033] font-semibold text-xs rounded-md cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmStop}
                className="px-4 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-xs rounded-md cursor-pointer transition-colors"
              >
                End trip
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: NEED HELP ASSISTANCE                                             */}
      {/* ========================================================================= */}
      {showNeedHelpModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="need-help-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#101828]/60 backdrop-blur-xs"
        >
          <div className="w-full max-w-lg bg-white border border-[#DCE3EE] rounded-md shadow-lg p-5 space-y-4 animate-fadeIn">
            <div className="flex justify-between items-start border-b border-[#DCE3EE] pb-2.5">
              <div>
                <span className="text-[10px] font-mono uppercase text-[#2563EB] font-bold block">
                  Assistance options
                </span>
                <h3 id="need-help-title" className="text-base font-bold text-[#172033]">
                  Non-emergency journey support
                </h3>
              </div>
              <button
                onClick={() => setShowNeedHelpModal(false)}
                className="p-1 text-[#64748B] hover:text-[#172033] cursor-pointer"
                aria-label="Close assistance modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-[#64748B] leading-relaxed">
              If you require assistance or want to notify someone during your walk, select an action below:
            </p>

            <div className="space-y-2.5">
              {/* Option A: Call trusted contact */}
              {activeContact ? (
                <div className="p-3 bg-[#F5F7FB] border border-[#DCE3EE] rounded-md flex justify-between items-center text-xs">
                  <div>
                    <span className="font-bold text-[#172033] block">{activeContact.name}</span>
                    <span className="text-[11px] text-[#64748B] font-mono">{activeContact.phone}</span>
                  </div>
                  <a
                    href={`tel:${activeContact.phone}`}
                    className="px-3 py-1.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold rounded text-xs transition-colors flex items-center gap-1.5"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Call contact</span>
                  </a>
                </div>
              ) : (
                <div className="p-3 bg-[#F5F7FB] border border-[#DCE3EE] rounded-md text-xs text-[#64748B] flex justify-between items-center">
                  <span>No trusted contact configured.</span>
                  <button
                    onClick={() => {
                      setShowNeedHelpModal(false);
                      setTab('/saved-places');
                    }}
                    className="text-[#2563EB] font-semibold text-xs underline cursor-pointer"
                  >
                    Add contact
                  </button>
                </div>
              )}

              {/* Option B: View Nearby Help Points */}
              <div className="p-3 bg-[#F5F7FB] border border-[#DCE3EE] rounded-md flex justify-between items-center text-xs">
                <div>
                  <span className="font-bold text-[#172033] block">Nearby Help Points</span>
                  <span className="text-[11px] text-[#64748B]">Locate verified commercial or transit desks nearby</span>
                </div>
                <button
                  onClick={() => {
                    setShowNeedHelpModal(false);
                    setTab('/help');
                  }}
                  className="px-3 py-1.5 bg-white border border-[#DCE3EE] hover:bg-[#EFF6FF] text-[#172033] hover:text-[#2563EB] font-semibold rounded text-xs transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <span>View map</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Important Disclaimer Statement */}
            <div className="p-3 bg-amber-50 border border-amber-200 text-amber-900 text-xs rounded-md space-y-1">
              <span className="font-bold block">Important statement</span>
              <p className="text-[11px] leading-relaxed">
                SaferPath provides contextual information and direct contact dialing. It does not dispatch official police or emergency services. For immediate emergencies, call 112 directly.
              </p>
            </div>

            <div className="flex justify-end pt-2 border-t border-[#DCE3EE]">
              <button
                onClick={() => setShowNeedHelpModal(false)}
                className="px-4 py-2 bg-white border border-[#DCE3EE] hover:bg-[#F5F7FB] text-[#172033] font-semibold text-xs rounded-md cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TripStatus;
