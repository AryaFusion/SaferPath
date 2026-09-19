import React from 'react';
import { useSafety } from '../../context/SafetyContext';
import { ContextBand, ConfidenceInline } from '../../components/common/ContextBand';
import Button from '../../components/common/Button';
import { getContextSummary, getTimeTimeline } from './evidenceUtils';
import type { TimeOfDay } from '../../lib/types';
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
  ShieldAlert,
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
  const timeSteps = getTimeTimeline(timeOfDay);

  // 1. Loading State
  if (isLoadingRoutes) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-2 text-[#64748B] text-xs font-medium animate-pulse">
          <Clock className="w-4 h-4" />
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
          <ShieldAlert className="w-5 h-5 text-[#64748B]" />
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
    <div className="space-y-6 max-w-4xl mx-auto px-1">
      {/* Page Header Bar */}
      <div className="space-y-4 pb-4 border-b border-[#DCE3EE]">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setTab('/route')}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#64748B] hover:text-[#172033] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
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
            Evidence
          </h1>
          <p className="text-xs text-[#64748B] font-normal mt-0.5">
            Contextual signals associated with your selected route.
          </p>
        </div>

        {/* Metadata Controls Panel */}
        <div className="bg-white border border-[#DCE3EE] rounded-md p-3.5 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-[#64748B] font-mono">FROM:</span>
              <span className="font-semibold text-[#172033]">{originLocation}</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-[#64748B] font-mono">TO:</span>
              <span className="font-semibold text-[#172033]">{destinationLocation}</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-[#DCE3EE] text-xs">
            {/* Travel Time Selector */}
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-[#64748B] font-mono block">
                Selected travel time:
              </span>
              <div className="flex items-center gap-1">
                {(['18:00', '21:00', '23:30'] as TimeOfDay[]).map((timeVal) => {
                  const isSelected = timeOfDay === timeVal;
                  return (
                    <button
                      key={timeVal}
                      onClick={() => setTimeOfDay(timeVal)}
                      className={`px-2.5 py-1 rounded font-mono text-xs transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-[#2563EB] text-white font-semibold'
                          : 'bg-[#F5F7FB] text-[#64748B] hover:bg-[#EFF6FF] hover:text-[#2563EB]'
                      }`}
                    >
                      {timeVal === '18:00' ? '6:00 PM' : timeVal === '21:00' ? '9:00 PM' : '11:30 PM'}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Selected Route Selector */}
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-[#64748B] font-mono block">
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
        <div className="bg-[#F5F7FB] border border-[#DCE3EE] rounded-md p-3 text-xs text-[#172033] flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-[#B45309] shrink-0" />
          <span>{routingStatusMessage || 'Displaying cached physical telemetry for Dadar-Shivaji Park corridor.'}</span>
        </div>
      )}

      {/* CONTEXT SUMMARY REPORT SECTION */}
      <div className="space-y-2">
        <h2 className="text-xs font-bold text-[#64748B] uppercase tracking-wider font-mono">
          Context summary
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 text-xs">
          <div className="bg-white p-3 rounded-md border border-[#DCE3EE]">
            <span className="text-[10px] font-bold text-[#64748B] font-mono block">LIGHTING</span>
            <span className="font-semibold text-[#172033] block text-[11px] mt-0.5">{summary.lighting}</span>
          </div>

          <div className="bg-white p-3 rounded-md border border-[#DCE3EE]">
            <span className="text-[10px] font-bold text-[#64748B] font-mono block">ACTIVITY</span>
            <span className="font-semibold text-[#172033] block text-[11px] mt-0.5">{summary.activity}</span>
          </div>

          <div className="bg-white p-3 rounded-md border border-[#DCE3EE]">
            <span className="text-[10px] font-bold text-[#64748B] font-mono block">HELP POINTS</span>
            <span className="font-semibold text-[#0F766E] block text-[11px] mt-0.5">{summary.helpPointsCount} available</span>
          </div>

          <div className="bg-white p-3 rounded-md border border-[#DCE3EE]">
            <span className="text-[10px] font-bold text-[#64748B] font-mono block">REPORTS</span>
            <span className="font-semibold text-[#172033] block text-[11px] mt-0.5">{summary.reportsCount} recent</span>
          </div>

          <div className="bg-white p-3 rounded-md border border-[#DCE3EE]">
            <span className="text-[10px] font-bold text-[#64748B] font-mono block">ROUTE CONTINUITY</span>
            <span className="font-semibold text-[#172033] block text-[11px] mt-0.5">{summary.routeContinuity}</span>
          </div>

          <div className="bg-white p-3 rounded-md border border-[#DCE3EE]">
            <span className="text-[10px] font-bold text-[#64748B] font-mono block">FRESHNESS</span>
            <span className="font-semibold text-[#172033] block text-[11px] mt-0.5">{summary.freshness}</span>
          </div>
        </div>
      </div>

      <hr className="border-[#DCE3EE]" />

      {/* CONTEXTUAL SHIFT OVER TRAVEL TIME */}
      <div className="bg-white border border-[#DCE3EE] rounded-md p-4 space-y-3">
        <h2 className="text-xs font-bold text-[#172033] uppercase tracking-wider font-mono flex items-center gap-1.5">
          <Clock className="w-4 h-4 text-[#64748B]" />
          <span>Contextual shift over travel time</span>
        </h2>
        <p className="text-xs text-[#64748B]">
          Physical route geometry remains constant while contextual evidence varies across departure windows:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 text-xs">
          {timeSteps.map((step) => (
            <div
              key={step.time}
              onClick={() => setTimeOfDay(step.time)}
              className={`p-3 rounded-md border cursor-pointer space-y-1 ${
                step.isCurrent
                  ? 'bg-[#EFF6FF] border-[#2563EB]'
                  : 'bg-white border-[#DCE3EE] hover:border-[#2563EB]/50'
              }`}
            >
              <div className="flex justify-between items-center">
                <span className="font-bold text-[#172033] font-mono">{step.label}</span>
                {step.isCurrent && (
                  <span className="px-1.5 py-0.5 rounded bg-[#2563EB] text-white text-[10px] font-semibold">
                    Selected
                  </span>
                )}
              </div>
              <p className="text-[11px] text-[#64748B] leading-snug">{step.observation}</p>
            </div>
          ))}
        </div>
      </div>

      <hr className="border-[#DCE3EE]" />

      {/* DETAILED REPORT SECTIONS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* LIGHTING */}
        <div className="bg-white border border-[#DCE3EE] rounded-md p-4 space-y-2.5">
          <div className="flex justify-between items-center border-b border-[#DCE3EE] pb-2">
            <h3 className="text-xs font-bold text-[#172033] uppercase tracking-wider font-mono flex items-center gap-1.5">
              <Sun className="w-4 h-4 text-[#2563EB]" />
              <span>Lighting</span>
            </h3>
            <span className="text-[10px] font-semibold text-[#64748B] font-mono">
              Recent observation
            </span>
          </div>

          <div className="space-y-1 text-xs">
            <div className="font-bold text-[#172033]">{selectedRoute.lightingEvidence}</div>
            <p className="text-[#64748B] text-[11px]">
              Physical streetlamp survey logs indicate consistent lamp spacing along main commercial corridors.
            </p>
          </div>

          <div className="pt-2 border-t border-[#DCE3EE] flex justify-between items-center text-[11px] text-[#64748B] font-mono">
            <span>Source: Municipal Lighting Survey</span>
            <ConfidenceInline confidence={selectedRoute.confidence} />
          </div>
        </div>

        {/* ACTIVITY */}
        <div className="bg-white border border-[#DCE3EE] rounded-md p-4 space-y-2.5">
          <div className="flex justify-between items-center border-b border-[#DCE3EE] pb-2">
            <h3 className="text-xs font-bold text-[#172033] uppercase tracking-wider font-mono flex items-center gap-1.5">
              <Users className="w-4 h-4 text-[#64748B]" />
              <span>Activity</span>
            </h3>
            <span className="text-[10px] font-semibold text-[#64748B] font-mono">
              Contextual support
            </span>
          </div>

          <div className="space-y-1 text-xs">
            <div className="font-bold text-[#172033]">{selectedRoute.footfallEvidence}</div>
            <p className="text-[#64748B] text-[11px]">
              {timeOfDay === '23:30'
                ? 'Storefronts are mostly closed at 11:30 PM. Pedestrian activity is centered near transit plazas.'
                : 'Commercial fronts and transit desks provide continuous baseline footfall observations.'}
            </p>
          </div>

          <div className="pt-2 border-t border-[#DCE3EE] flex justify-between items-center text-[11px] text-[#64748B] font-mono">
            <span>Source: Transit & Business Front Logs</span>
            <ConfidenceInline confidence={selectedRoute.confidence} />
          </div>
        </div>

        {/* HELP POINTS */}
        <div className="bg-white border border-[#DCE3EE] rounded-md p-4 space-y-2.5">
          <div className="flex justify-between items-center border-b border-[#DCE3EE] pb-2">
            <h3 className="text-xs font-bold text-[#172033] uppercase tracking-wider font-mono flex items-center gap-1.5">
              <MapPinned className="w-4 h-4 text-[#2563EB]" />
              <span>Help points</span>
            </h3>
            <span className="text-[10px] font-semibold text-[#0F766E] font-mono">
              {summary.helpPointsCount} available
            </span>
          </div>

          <div className="space-y-2 text-xs">
            {helpPoints.slice(0, 3).map((hp) => (
              <div key={hp.id} className="p-2 bg-[#F5F7FB] rounded-md border border-[#DCE3EE] space-y-0.5">
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
            className="w-full pt-1.5 flex items-center justify-center gap-1 text-xs font-semibold text-[#2563EB] hover:text-[#1D4ED8] cursor-pointer"
          >
            <span>View Help Nearby directory</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* REPORTS */}
        <div className="bg-white border border-[#DCE3EE] rounded-md p-4 space-y-2.5">
          <div className="flex justify-between items-center border-b border-[#DCE3EE] pb-2">
            <h3 className="text-xs font-bold text-[#172033] uppercase tracking-wider font-mono flex items-center gap-1.5">
              <ClipboardList className="w-4 h-4 text-[#172033]" />
              <span>Reports</span>
            </h3>
            <span className="text-[10px] font-semibold text-[#64748B] font-mono">
              {summary.reportsCount} recent
            </span>
          </div>

          {reports.length > 0 ? (
            <div className="space-y-2 text-xs">
              {reports.slice(0, 2).map((rep) => (
                <div key={rep.id} className="p-2 bg-[#F5F7FB] rounded-md border border-[#DCE3EE] space-y-0.5">
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
            className="w-full pt-1.5 flex items-center justify-center gap-1 text-xs font-semibold text-[#172033] hover:text-[#2563EB] cursor-pointer"
          >
            <span>View physical reports</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* ROUTE CONTINUITY */}
        <div className="bg-white border border-[#DCE3EE] rounded-md p-4 space-y-2.5">
          <h3 className="text-xs font-bold text-[#172033] uppercase tracking-wider font-mono flex items-center gap-1.5 border-b border-[#DCE3EE] pb-2">
            <CheckCircle2 className="w-4 h-4 text-[#0F766E]" />
            <span>Route continuity</span>
          </h3>
          <p className="text-xs text-[#64748B] leading-relaxed">
            Continuous paved pedestrian pathway with marked crosswalks and open sightlines along primary corridors.
          </p>
          <div className="text-[11px] text-[#64748B] font-mono">
            Source: OpenStreetMap Pedestrian Network Data
          </div>
        </div>

        {/* CONFIDENCE & FRESHNESS */}
        <div className="bg-white border border-[#DCE3EE] rounded-md p-4 space-y-2.5">
          <h3 className="text-xs font-bold text-[#172033] uppercase tracking-wider font-mono border-b border-[#DCE3EE] pb-2">
            Confidence & freshness
          </h3>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-[#64748B]">Freshness rating:</span>
              <span className="font-semibold text-[#172033] font-mono">{selectedRoute.freshness}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[#64748B]">Data confidence:</span>
              <ContextBand level={selectedRoute.supportLevel} />
            </div>
          </div>
          <p className="text-[11px] text-[#64748B] leading-relaxed pt-1 border-t border-[#DCE3EE]">
            Ratings reflect observation recency and physical data density without using arbitrary numerical safety scores.
          </p>
        </div>

      </div>

      {/* ABOUT THIS EVIDENCE (LIMITATIONS & DISCLAIMER SECTION) */}
      <div className="bg-[#101828] text-white rounded-md p-4 space-y-2.5">
        <div className="flex items-center gap-2 border-b border-slate-700 pb-2">
          <ShieldAlert className="w-4 h-4 text-[#38BDF8]" />
          <h2 className="text-xs font-bold uppercase tracking-wider font-mono text-[#38BDF8]">
            About this evidence
          </h2>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed font-sans">
          SaferPath presents available contextual information—such as physical observations, activity context, help points, and user-submitted reports—to inform your journey. Please note:
        </p>
        <ul className="text-xs text-slate-400 space-y-1 list-disc list-inside font-sans">
          <li>Information may be incomplete or subject to verification delays.</li>
          <li>Physical observations can become outdated over time.</li>
          <li>Local street conditions can change unexpectedly.</li>
          <li>SaferPath states physical facts and does not calculate safety probabilities or guarantee personal safety.</li>
        </ul>
      </div>

      {/* BOTTOM NAVIGATION ACTIONS */}
      <div className="pt-4 border-t border-[#DCE3EE] flex flex-col sm:flex-row justify-between items-center gap-3">
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
