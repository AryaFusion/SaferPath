import React from 'react';
import { useSafety } from '../../context/SafetyContext';
import { ConfidenceInline } from '../../components/common/ContextBand';
import Button from '../../components/common/Button';
import { getContextSummary, getTimeTimeline } from './evidenceUtils';
import {
  ArrowLeft,
  Sun,
  Users,
  MapPinned,
  ClipboardList,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Navigation,
  Info,
  ChevronRight,
} from 'lucide-react';

export const EvidenceTimeline: React.FC = () => {
  const {
    routes,
    selectedRoute,
    selectedRouteId,
    setSelectedRouteId,
    timeOfDay,
    setTimeOfDay,
    liveCurrentTime,
    originLocation,
    destinationLocation,
    helpPoints,
    reports,
    isLoadingRoutes,
    isFallbackRouting,
    routingStatusMessage,
    setTab,
    startTrip,
  } = useSafety();

  const summary = getContextSummary(selectedRoute, timeOfDay, helpPoints, reports);
  const timeSteps = getTimeTimeline(timeOfDay, liveCurrentTime);

  // 1. Loading State
  if (isLoadingRoutes) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-2 text-[#64748B] text-xs font-medium animate-pulse">
          <Clock className="w-4 h-4 text-[#2563EB]" />
          <span>Loading contextual evidence & physical telemetry...</span>
        </div>
        <div className="bg-white border border-[#DCE3EE] rounded-md p-6 space-y-4 animate-pulse">
          <div className="h-5 bg-[#F5F7FB] rounded w-1/4" />
          <div className="h-4 bg-[#F5F7FB] rounded w-1/2" />
        </div>
      </div>
    );
  }

  // 2. Empty State
  if (!selectedRoute) {
    return (
      <div className="max-w-4xl mx-auto p-8 bg-white border border-[#DCE3EE] rounded-md text-center space-y-4">
        <div className="w-10 h-10 rounded-md bg-[#F5F7FB] text-[#64748B] flex items-center justify-center mx-auto">
          <Info className="w-5 h-5 text-[#2563EB]" />
        </div>
        <h2 className="text-base font-bold text-[#172033]">No evidence available</h2>
        <p className="text-xs text-[#64748B] max-w-md mx-auto leading-relaxed">
          No recent contextual evidence is available for this route and time. This must not be treated as evidence that conditions are good or bad.
        </p>
        <Button variant="primary" size="md" onClick={() => setTab('/route')}>
          Back to route planner
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-5 max-w-4xl mx-auto px-1">
      {/* Top Header & Navigation Bar */}
      <div className="space-y-3 pb-3 border-b border-[#DCE3EE]">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setTab('/route')}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#64748B] hover:text-[#172033] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-[#2563EB]" />
            <span>Back to route planner</span>
          </button>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setTab('/help')}
              className="text-xs"
            >
              <MapPinned className="w-3.5 h-3.5 mr-1 text-[#2563EB]" />
              <span>View help nearby</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setTab('/reports')}
              className="text-xs"
            >
              <ClipboardList className="w-3.5 h-3.5 mr-1 text-[#172033]" />
              <span>View reports</span>
            </Button>
          </div>
        </div>

        {/* Title & Subtitle */}
        <div>
          <h1 className="text-2xl font-bold text-[#172033] tracking-tight">
            Evidence report
          </h1>
          <p className="text-xs text-[#64748B] font-normal mt-0.5">
            Contextual observations for <strong className="text-[#172033] font-semibold">{selectedRoute.name}</strong> ({selectedRoute.via}).
          </p>
        </div>

        {/* Journey Metadata & Selectors Panel */}
        <div className="bg-white border border-[#DCE3EE] rounded-md p-3 space-y-2.5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-[#64748B] font-mono uppercase">Origin:</span>
              <span className="font-semibold text-[#172033]">{originLocation}</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-[#64748B] font-mono uppercase">Destination:</span>
              <span className="font-semibold text-[#172033]">{destinationLocation}</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-2 border-t border-[#DCE3EE] text-xs">
            {/* Travel Time Selector */}
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold text-[#64748B]">
                Selected travel time:
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setTimeOfDay('now')}
                  className="px-2.5 py-1 rounded text-xs bg-[#2563EB] text-white font-semibold cursor-pointer"
                >
                  NOW · {liveCurrentTime}
                </button>
              </div>
            </div>

            {/* Selected Route Selector */}
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold text-[#64748B]">
                Selected route:
              </span>
              <div className="flex items-center gap-1">
                {routes.map((rt, idx) => {
                  const isSelected = rt.id === selectedRouteId;
                  return (
                    <button
                      key={rt.id}
                      onClick={() => setSelectedRouteId(rt.id)}
                      className={`px-2.5 py-1 rounded text-xs transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-[#2563EB] text-white font-semibold'
                          : 'bg-[#F5F7FB] text-[#64748B] hover:bg-[#EFF6FF] hover:text-[#2563EB]'
                      }`}
                    >
                      Route {idx + 1}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Fallback Banner */}
      {isFallbackRouting && (
        <div className="bg-[#F5F7FB] border border-[#DCE3EE] rounded-md p-2.5 text-xs text-[#172033] flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-[#B45309] shrink-0" />
          <span>{routingStatusMessage || 'Displaying sample physical telemetry for Dadar-Shivaji Park corridor.'}</span>
        </div>
      )}

      {/* CONTEXT SUMMARY REPORT SECTION */}
      <div className="bg-white border border-[#DCE3EE] rounded-md p-4 space-y-3">
        <div className="flex items-center justify-between border-b border-[#DCE3EE] pb-2">
          <h2 className="text-sm font-bold text-[#172033]">
            Context summary
          </h2>
          <span className="px-2 py-0.5 text-[10px] font-mono font-semibold bg-[#F1F5F9] text-[#64748B] border border-[#CBD5E1] rounded">
            Sample fixture data
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-3 text-xs">
          <div className="space-y-0.5">
            <span className="text-[#64748B] text-[11px] block">Lighting</span>
            <span className="font-semibold text-[#172033] block">{summary.lighting}</span>
          </div>

          <div className="space-y-0.5">
            <span className="text-[#64748B] text-[11px] block">Activity</span>
            <span className="font-semibold text-[#172033] block">{summary.activity}</span>
          </div>

          <div className="space-y-0.5">
            <span className="text-[#64748B] text-[11px] block">Help points</span>
            <span className="font-semibold text-[#0F766E] block">{summary.helpPointsCount} available</span>
          </div>

          <div className="space-y-0.5">
            <span className="text-[#64748B] text-[11px] block">Reports</span>
            <span className="font-semibold text-[#172033] block">{summary.reportsCount} recent</span>
          </div>

          <div className="space-y-0.5">
            <span className="text-[#64748B] text-[11px] block">Route continuity</span>
            <span className="font-semibold text-[#172033] block">{summary.routeContinuity}</span>
          </div>

          <div className="space-y-0.5">
            <span className="text-[#64748B] text-[11px] block">Freshness</span>
            <span className="font-semibold text-[#172033] block font-mono">{summary.freshness}</span>
          </div>
        </div>
      </div>

      {/* DETAILED OBSERVATIONS GROUPED SECTION */}
      <div className="bg-white border border-[#DCE3EE] rounded-md p-4 space-y-4">
        <h2 className="text-sm font-bold text-[#172033] border-b border-[#DCE3EE] pb-2">
          Detailed contextual observations
        </h2>

        <div className="space-y-4 divide-y divide-[#DCE3EE]">

          {/* LIGHTING */}
          <div className="space-y-1.5 pt-1">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-bold text-[#172033] flex items-center gap-1.5">
                <Sun className="w-3.5 h-3.5 text-[#2563EB]" />
                <span>Lighting</span>
              </h3>
              <span className="text-[10px] text-[#64748B] font-mono">
                Source: Demo fixture survey
              </span>
            </div>
            <div className="text-xs font-semibold text-[#172033]">
              {selectedRoute.lightingEvidence}
            </div>
            <p className="text-[11px] text-[#64748B] leading-relaxed">
              Streetlamp survey logs indicate consistent lamp spacing along main commercial corridors.
            </p>
          </div>

          {/* ACTIVITY */}
          <div className="space-y-1.5 pt-3">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-bold text-[#172033] flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-[#64748B]" />
                <span>Activity</span>
              </h3>
              <span className="text-[10px] text-[#64748B] font-mono">
                Source: Sample activity log
              </span>
            </div>
            <div className="text-xs font-semibold text-[#172033]">
              {selectedRoute.footfallEvidence}
            </div>
            <p className="text-[11px] text-[#64748B] leading-relaxed">
              {timeOfDay === '23:30'
                ? 'Storefronts are mostly closed at 11:30 PM. Pedestrian activity is centered near transit plazas.'
                : 'Commercial fronts and transit desks provide continuous baseline footfall observations.'}
            </p>
          </div>

          {/* HELP POINTS */}
          <div className="space-y-2 pt-3">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-bold text-[#172033] flex items-center gap-1.5">
                <MapPinned className="w-3.5 h-3.5 text-[#2563EB]" />
                <span>Help points</span>
              </h3>
              <span className="text-[11px] font-semibold text-[#0F766E]">
                {summary.helpPointsCount} available nearby
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {helpPoints.slice(0, 2).map((hp) => (
                <div key={hp.id} className="p-2 bg-[#F5F7FB] rounded border border-[#DCE3EE] space-y-0.5">
                  <div className="flex justify-between font-semibold text-[#172033] text-[11px]">
                    <span>{hp.name}</span>
                    <span className="text-[#2563EB] font-mono">{hp.distanceMeters}m</span>
                  </div>
                  <div className="flex justify-between text-[10px] text-[#64748B]">
                    <span>{hp.category}</span>
                    <span>{hp.status}</span>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => setTab('/help')}
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#2563EB] hover:text-[#1D4ED8] cursor-pointer pt-1"
            >
              <span>View help nearby directory</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* REPORTS */}
          <div className="space-y-2 pt-3">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-bold text-[#172033] flex items-center gap-1.5">
                <ClipboardList className="w-3.5 h-3.5 text-[#172033]" />
                <span>Reports</span>
              </h3>
              <span className="text-[11px] font-semibold text-[#64748B]">
                {summary.reportsCount} recent logs
              </span>
            </div>

            {reports.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {reports.slice(0, 2).map((rep) => (
                  <div key={rep.id} className="p-2 bg-[#F5F7FB] rounded border border-[#DCE3EE] space-y-0.5">
                    <div className="flex justify-between font-semibold text-[#172033] text-[11px]">
                      <span>{rep.category}</span>
                      <span className="text-[#64748B] font-mono text-[10px]">{rep.submittedAt}</span>
                    </div>
                    <p className="text-[#64748B] text-[11px] leading-snug">{rep.physicalDetails}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[#64748B]">No active physical maintenance reports logged for this segment.</p>
            )}

            <button
              onClick={() => setTab('/reports')}
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#172033] hover:text-[#2563EB] cursor-pointer pt-1"
            >
              <span>View physical reports</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* ROUTE CONTINUITY */}
          <div className="space-y-1 pt-3">
            <h3 className="text-xs font-bold text-[#172033] flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#0F766E]" />
              <span>Route continuity</span>
            </h3>
            <p className="text-xs text-[#64748B] leading-relaxed">
              Continuous paved pedestrian pathway with marked crosswalks and open sightlines along primary corridors.
            </p>
            <div className="text-[10px] text-[#64748B] font-mono">
              Source: OpenStreetMap Pedestrian Network (Sample)
            </div>
          </div>

          {/* DATA AVAILABILITY & FRESHNESS */}
          <div className="space-y-2 pt-3">
            <h3 className="text-xs font-bold text-[#172033]">
              Data availability & freshness
            </h3>
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-[#64748B]">Freshness rating:</span>
                <span className="font-semibold text-[#172033] font-mono">{selectedRoute.freshness}</span>
                <span className="px-1.5 py-0.2 text-[9px] font-mono font-semibold bg-[#F1F5F9] text-[#64748B] border border-[#CBD5E1] rounded">
                  Sample data
                </span>
              </div>
              <ConfidenceInline confidence={selectedRoute.confidence} />
            </div>
            <p className="text-[11px] text-[#64748B] leading-relaxed pt-1">
              Observations reflect observation recency and physical data availability without using subjective safety scores or probabilities.
            </p>
          </div>

        </div>
      </div>

      {/* CONTEXTUAL SHIFT OVER TRAVEL TIME */}
      <div className="bg-white border border-[#DCE3EE] rounded-md p-4 space-y-3">
        <h2 className="text-sm font-bold text-[#172033]">
          Contextual shift over travel time
        </h2>
        <p className="text-xs text-[#64748B]">
          Physical route geometry remains constant while contextual observations shift across departure windows:
        </p>

        <div className="grid grid-cols-1 gap-2 text-xs">
          {timeSteps.filter((step) => step.time === 'now').map((step) => (
            <div
              key={step.time}
              className="p-3 rounded border bg-[#EFF6FF] border-[#2563EB] space-y-1"
            >
              <div className="flex justify-between items-center">
                <span className="font-bold text-[#172033] font-mono text-xs">{step.label}</span>
                <span className="px-1.5 py-0.5 rounded bg-[#2563EB] text-white text-[10px] font-semibold">
                  Live
                </span>
              </div>
              <p className="text-xs text-[#64748B] leading-snug">{step.observation}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ABOUT THIS EVIDENCE (RESTRAINED LIGHT BLUE INFO SECTION) */}
      <div className="bg-[#EFF6FF]/60 border border-[#DCE3EE] rounded-md p-4 space-y-2">
        <div className="flex items-center gap-2 pb-1.5 border-b border-[#DCE3EE]">
          <Info className="w-4 h-4 text-[#2563EB] shrink-0" />
          <h3 className="text-xs font-bold text-[#172033]">
            About this evidence
          </h3>
        </div>
        <p className="text-xs text-[#64748B] leading-relaxed">
          SaferPath presents available contextual information—such as physical observations, activity context, help points, and user-submitted reports—to inform your journey. Please note:
        </p>
        <ul className="text-xs text-[#64748B] space-y-1 list-disc list-inside">
          <li>Information may be incomplete or subject to verification delays.</li>
          <li>Physical observations can become outdated over time.</li>
          <li>Local street conditions can change unexpectedly.</li>
          <li>SaferPath states physical facts and does not calculate safety probabilities or guarantee personal safety.</li>
        </ul>
      </div>

      {/* BOTTOM NAVIGATION ACTIONS */}
      <div className="pt-3 border-t border-[#DCE3EE] flex flex-col sm:flex-row justify-between items-center gap-3">
        <Button variant="outline" size="md" onClick={() => setTab('/route')}>
          Back to route planner
        </Button>

        <Button
          variant="primary"
          size="md"
          onClick={() => startTrip(selectedRoute.id)}
          className="flex items-center gap-2"
        >
          <Navigation className="w-4 h-4 text-white" />
          <span>Start walk on {selectedRoute.name}</span>
        </Button>
      </div>
    </div>
  );
};

export default EvidenceTimeline;
