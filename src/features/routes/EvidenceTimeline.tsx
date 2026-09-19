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
        <div className="flex items-center gap-2 text-[#5F6B7A] text-xs font-medium animate-pulse">
          <Clock className="w-4 h-4" />
          <span>Loading contextual evidence & physical telemetry...</span>
        </div>
        <div className="bg-white border border-[#D9DDE3] rounded-md p-6 space-y-4 animate-pulse">
          <div className="h-5 bg-[#F1F3F2] rounded w-1/4" />
          <div className="h-4 bg-[#F1F3F2] rounded w-1/2" />
        </div>
      </div>
    );
  }

  // 2. Empty State
  if (!selectedRoute) {
    return (
      <div className="max-w-4xl mx-auto p-8 bg-white border border-[#D9DDE3] rounded-md text-center space-y-4">
        <div className="w-10 h-10 rounded-md bg-[#F1F3F2] text-[#5F6B7A] flex items-center justify-center mx-auto">
          <ShieldAlert className="w-5 h-5 text-[#5F6B7A]" />
        </div>
        <h2 className="text-base font-bold text-[#142033]">No evidence available</h2>
        <p className="text-xs text-[#5F6B7A] max-w-md mx-auto leading-relaxed">
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
      <div className="space-y-4 pb-4 border-b border-[#D9DDE3]">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setTab('/route')}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#5F6B7A] hover:text-[#142033] transition-colors cursor-pointer"
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
              <MapPinned className="w-3.5 h-3.5 mr-1 text-[#0B8F83]" />
              <span>View help nearby</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setTab('/reports')}
              className="text-xs"
            >
              <ClipboardList className="w-3.5 h-3.5 mr-1 text-[#142033]" />
              <span>View reports</span>
            </Button>
          </div>
        </div>

        {/* Title & Subtitle */}
        <div>
          <h1 className="text-2xl font-bold text-[#142033] tracking-tight">
            EVIDENCE
          </h1>
          <p className="text-xs text-[#5F6B7A] font-normal mt-0.5">
            Contextual signals associated with your selected route.
          </p>
        </div>

        {/* Metadata Controls Panel */}
        <div className="bg-white border border-[#D9DDE3] rounded-md p-3.5 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-[#5F6B7A] font-mono-telemetry uppercase">FROM:</span>
              <span className="font-semibold text-[#142033]">{originLocation}</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-[#5F6B7A] font-mono-telemetry uppercase">TO:</span>
              <span className="font-semibold text-[#142033]">{destinationLocation}</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-[#D9DDE3] text-xs">
            {/* Travel Time Selector */}
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-[#5F6B7A] font-mono-telemetry uppercase block">
                SELECTED TRAVEL TIME:
              </span>
              <div className="flex items-center gap-1">
                {(['18:00', '21:00', '23:30'] as TimeOfDay[]).map((timeVal) => {
                  const isSelected = timeOfDay === timeVal;
                  return (
                    <button
                      key={timeVal}
                      onClick={() => setTimeOfDay(timeVal)}
                      className={`px-2.5 py-1 rounded-md font-mono-telemetry text-xs transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-[#142033] text-white font-semibold'
                          : 'bg-[#F1F3F2] text-[#5F6B7A] hover:bg-[#D9DDE3] hover:text-[#142033]'
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
              <span className="text-[10px] font-bold text-[#5F6B7A] font-mono-telemetry uppercase block">
                SELECTED ROUTE:
              </span>
              <div className="flex items-center gap-1">
                {routes.map((rt, idx) => {
                  const isSelected = rt.id === selectedRouteId;
                  return (
                    <button
                      key={rt.id}
                      onClick={() => setSelectedRouteId(rt.id)}
                      className={`px-2.5 py-1 rounded-md text-xs transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-[#0B8F83] text-white font-semibold'
                          : 'bg-[#F1F3F2] text-[#5F6B7A] hover:bg-[#D9DDE3] hover:text-[#142033]'
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
        <div className="bg-[#F1F3F2] border border-[#D9DDE3] rounded-md p-3 text-xs text-[#142033] flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
          <span>{routingStatusMessage || 'Displaying cached physical telemetry for Dadar-Shivaji Park corridor.'}</span>
        </div>
      )}

      {/* CONTEXT SUMMARY REPORT SECTION */}
      <div className="space-y-2">
        <h2 className="text-xs font-bold text-[#5F6B7A] uppercase tracking-wider font-mono-telemetry">
          CONTEXT SUMMARY
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 text-xs">
          <div className="bg-white p-3 rounded-md border border-[#D9DDE3]">
            <span className="text-[10px] font-bold text-[#5F6B7A] font-mono-telemetry uppercase block">LIGHTING</span>
            <span className="font-semibold text-[#142033] block text-[11px] mt-0.5">{summary.lighting}</span>
          </div>

          <div className="bg-white p-3 rounded-md border border-[#D9DDE3]">
            <span className="text-[10px] font-bold text-[#5F6B7A] font-mono-telemetry uppercase block">ACTIVITY</span>
            <span className="font-semibold text-[#142033] block text-[11px] mt-0.5">{summary.activity}</span>
          </div>

          <div className="bg-white p-3 rounded-md border border-[#D9DDE3]">
            <span className="text-[10px] font-bold text-[#5F6B7A] font-mono-telemetry uppercase block">HELP POINTS</span>
            <span className="font-semibold text-[#0B8F83] block text-[11px] mt-0.5">{summary.helpPointsCount} available</span>
          </div>

          <div className="bg-white p-3 rounded-md border border-[#D9DDE3]">
            <span className="text-[10px] font-bold text-[#5F6B7A] font-mono-telemetry uppercase block">REPORTS</span>
            <span className="font-semibold text-[#142033] block text-[11px] mt-0.5">{summary.reportsCount} recent</span>
          </div>

          <div className="bg-white p-3 rounded-md border border-[#D9DDE3]">
            <span className="text-[10px] font-bold text-[#5F6B7A] font-mono-telemetry uppercase block">ROUTE CONTINUITY</span>
            <span className="font-semibold text-[#142033] block text-[11px] mt-0.5">{summary.routeContinuity}</span>
          </div>

          <div className="bg-white p-3 rounded-md border border-[#D9DDE3]">
            <span className="text-[10px] font-bold text-[#5F6B7A] font-mono-telemetry uppercase block">FRESHNESS</span>
            <span className="font-semibold text-[#142033] block text-[11px] mt-0.5">{summary.freshness}</span>
          </div>
        </div>
      </div>

      <hr className="border-[#D9DDE3]" />

      {/* CONTEXTUAL SHIFT OVER TRAVEL TIME */}
      <div className="bg-white border border-[#D9DDE3] rounded-md p-4 space-y-3">
        <h2 className="text-xs font-bold text-[#142033] uppercase tracking-wider font-mono-telemetry flex items-center gap-1.5">
          <Clock className="w-4 h-4 text-[#5F6B7A]" />
          <span>CONTEXTUAL SHIFT OVER TRAVEL TIME</span>
        </h2>
        <p className="text-xs text-[#5F6B7A]">
          Physical route geometry remains constant while contextual evidence varies across departure windows:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 text-xs">
          {timeSteps.map((step) => (
            <div
              key={step.time}
              onClick={() => setTimeOfDay(step.time)}
              className={`p-3 rounded-md border cursor-pointer space-y-1 ${
                step.isCurrent
                  ? 'bg-[#EBF2F1] border-[#0B8F83]'
                  : 'bg-white border-[#D9DDE3] hover:border-slate-400'
              }`}
            >
              <div className="flex justify-between items-center">
                <span className="font-bold text-[#142033] font-mono-telemetry">{step.label}</span>
                {step.isCurrent && (
                  <span className="px-1.5 py-0.5 rounded bg-[#0B8F83] text-white text-[10px] font-semibold">
                    Selected
                  </span>
                )}
              </div>
              <p className="text-[11px] text-[#5F6B7A] leading-snug">{step.observation}</p>
            </div>
          ))}
        </div>
      </div>

      <hr className="border-[#D9DDE3]" />

      {/* DETAILED REPORT SECTIONS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* LIGHTING */}
        <div className="bg-white border border-[#D9DDE3] rounded-md p-4 space-y-2.5">
          <div className="flex justify-between items-center border-b border-[#D9DDE3] pb-2">
            <h3 className="text-xs font-bold text-[#142033] uppercase tracking-wider font-mono-telemetry flex items-center gap-1.5">
              <Sun className="w-4 h-4 text-[#0B8F83]" />
              <span>Lighting</span>
            </h3>
            <span className="text-[10px] font-semibold text-[#5F6B7A] font-mono-telemetry">
              Recent observation
            </span>
          </div>

          <div className="space-y-1 text-xs">
            <div className="font-bold text-[#142033]">{selectedRoute.lightingEvidence}</div>
            <p className="text-[#5F6B7A] text-[11px]">
              Physical streetlamp survey logs indicate consistent lamp spacing along main commercial corridors.
            </p>
          </div>

          <div className="pt-2 border-t border-[#D9DDE3] flex justify-between items-center text-[11px] text-[#5F6B7A] font-mono-telemetry">
            <span>Source: Municipal Lighting Survey</span>
            <ConfidenceInline confidence={selectedRoute.confidence} />
          </div>
        </div>

        {/* ACTIVITY */}
        <div className="bg-white border border-[#D9DDE3] rounded-md p-4 space-y-2.5">
          <div className="flex justify-between items-center border-b border-[#D9DDE3] pb-2">
            <h3 className="text-xs font-bold text-[#142033] uppercase tracking-wider font-mono-telemetry flex items-center gap-1.5">
              <Users className="w-4 h-4 text-[#5F6B7A]" />
              <span>Activity</span>
            </h3>
            <span className="text-[10px] font-semibold text-[#5F6B7A] font-mono-telemetry">
              Contextual support
            </span>
          </div>

          <div className="space-y-1 text-xs">
            <div className="font-bold text-[#142033]">{selectedRoute.footfallEvidence}</div>
            <p className="text-[#5F6B7A] text-[11px]">
              {timeOfDay === '23:30'
                ? 'Storefronts are mostly closed at 11:30 PM. Pedestrian activity is centered near transit plazas.'
                : 'Commercial fronts and transit desks provide continuous baseline footfall observations.'}
            </p>
          </div>

          <div className="pt-2 border-t border-[#D9DDE3] flex justify-between items-center text-[11px] text-[#5F6B7A] font-mono-telemetry">
            <span>Source: Transit & Business Front Logs</span>
            <ConfidenceInline confidence={selectedRoute.confidence} />
          </div>
        </div>

        {/* HELP POINTS */}
        <div className="bg-white border border-[#D9DDE3] rounded-md p-4 space-y-2.5">
          <div className="flex justify-between items-center border-b border-[#D9DDE3] pb-2">
            <h3 className="text-xs font-bold text-[#142033] uppercase tracking-wider font-mono-telemetry flex items-center gap-1.5">
              <MapPinned className="w-4 h-4 text-[#0B8F83]" />
              <span>Help points</span>
            </h3>
            <span className="text-[10px] font-semibold text-[#0B8F83] font-mono-telemetry">
              {summary.helpPointsCount} available
            </span>
          </div>

          <div className="space-y-2 text-xs">
            {helpPoints.slice(0, 3).map((hp) => (
              <div key={hp.id} className="p-2 bg-[#F1F3F2] rounded-md border border-[#D9DDE3] space-y-0.5">
                <div className="flex justify-between font-semibold text-[#142033] text-[11px]">
                  <span>{hp.name}</span>
                  <span className="text-[#0B8F83] font-mono-telemetry">{hp.distanceMeters}m</span>
                </div>
                <div className="flex justify-between text-[10px] text-[#5F6B7A]">
                  <span>{hp.category}</span>
                  <span>{hp.status}</span>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => setTab('/help')}
            className="w-full pt-1.5 flex items-center justify-center gap-1 text-xs font-semibold text-[#0B8F83] hover:text-[#08766D] cursor-pointer"
          >
            <span>View Help Nearby directory</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* REPORTS */}
        <div className="bg-white border border-[#D9DDE3] rounded-md p-4 space-y-2.5">
          <div className="flex justify-between items-center border-b border-[#D9DDE3] pb-2">
            <h3 className="text-xs font-bold text-[#142033] uppercase tracking-wider font-mono-telemetry flex items-center gap-1.5">
              <ClipboardList className="w-4 h-4 text-[#142033]" />
              <span>Reports</span>
            </h3>
            <span className="text-[10px] font-semibold text-[#5F6B7A] font-mono-telemetry">
              {summary.reportsCount} recent
            </span>
          </div>

          {reports.length > 0 ? (
            <div className="space-y-2 text-xs">
              {reports.slice(0, 2).map((rep) => (
                <div key={rep.id} className="p-2 bg-[#F1F3F2] rounded-md border border-[#D9DDE3] space-y-0.5">
                  <div className="flex justify-between font-semibold text-[#142033] text-[11px]">
                    <span>{rep.category}</span>
                    <span className="text-[#5F6B7A] font-mono-telemetry text-[10px]">{rep.submittedAt}</span>
                  </div>
                  <p className="text-[#5F6B7A] text-[11px] leading-snug">{rep.physicalDetails}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-[#5F6B7A]">No active physical maintenance reports logged for this segment.</p>
          )}

          <button
            onClick={() => setTab('/reports')}
            className="w-full pt-1.5 flex items-center justify-center gap-1 text-xs font-semibold text-[#142033] hover:text-slate-800 cursor-pointer"
          >
            <span>View physical reports</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* ROUTE CONTINUITY */}
        <div className="bg-white border border-[#D9DDE3] rounded-md p-4 space-y-2.5">
          <h3 className="text-xs font-bold text-[#142033] uppercase tracking-wider font-mono-telemetry flex items-center gap-1.5 border-b border-[#D9DDE3] pb-2">
            <CheckCircle2 className="w-4 h-4 text-[#0B8F83]" />
            <span>Route continuity</span>
          </h3>
          <p className="text-xs text-[#5F6B7A] leading-relaxed">
            Continuous paved pedestrian pathway with marked crosswalks and open sightlines along primary corridors.
          </p>
          <div className="text-[11px] text-[#5F6B7A] font-mono-telemetry">
            Source: OpenStreetMap Pedestrian Network Data
          </div>
        </div>

        {/* CONFIDENCE & FRESHNESS */}
        <div className="bg-white border border-[#D9DDE3] rounded-md p-4 space-y-2.5">
          <h3 className="text-xs font-bold text-[#142033] uppercase tracking-wider font-mono-telemetry border-b border-[#D9DDE3] pb-2">
            Confidence & freshness
          </h3>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-[#5F6B7A]">Freshness rating:</span>
              <span className="font-semibold text-[#142033] font-mono-telemetry">{selectedRoute.freshness}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[#5F6B7A]">Data confidence:</span>
              <ContextBand level={selectedRoute.supportLevel} />
            </div>
          </div>
          <p className="text-[11px] text-[#5F6B7A] leading-relaxed pt-1 border-t border-[#D9DDE3]">
            Ratings reflect observation recency and physical data density without using arbitrary numerical safety scores.
          </p>
        </div>

      </div>

      {/* ABOUT THIS EVIDENCE (LIMITATIONS & DISCLAIMER SECTION) */}
      <div className="bg-[#142033] text-white rounded-md p-4 space-y-2.5">
        <div className="flex items-center gap-2 border-b border-slate-700 pb-2">
          <ShieldAlert className="w-4 h-4 text-amber-400" />
          <h2 className="text-xs font-bold uppercase tracking-wider font-mono-telemetry text-amber-300">
            ABOUT THIS EVIDENCE
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
      <div className="pt-4 border-t border-[#D9DDE3] flex flex-col sm:flex-row justify-between items-center gap-3">
        <Button variant="outline" size="md" onClick={() => setTab('/route')}>
          Back to route planner
        </Button>

        <Button
          variant="primary"
          size="md"
          onClick={() => startTrip(selectedRoute.id)}
          className="flex items-center gap-2"
        >
          <Navigation className="w-4 h-4 text-[#0B8F83]" />
          <span>Start walk on {selectedRoute.name}</span>
        </Button>
      </div>
    </div>
  );
};

export default EvidenceTimeline;
