import React from 'react';
import { useSafety } from '../context/SafetyContext';

export const RouteDetailPage: React.FC = () => {
  const { selectedRouteId, routes, setCurrentPage, startTrip } = useSafety();

  const route = routes.find((r) => r.id === selectedRouteId) || routes[0];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Back Button */}
      <button
        onClick={() => setCurrentPage('plan')}
        className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-600 hover:text-stone-900 transition-colors cursor-pointer"
      >
        <span>←</span>
        <span>Back to comparison</span>
      </button>

      {/* Header */}
      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-3xl font-extrabold text-stone-900 tracking-tight">
            {route.name} · {route.via}
          </h1>
          {route.badges.map((b, idx) => (
            <span
              key={idx}
              className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200"
            >
              {b}
            </span>
          ))}
        </div>
        <p className="text-sm text-stone-600 leading-relaxed">
          Every claim below comes from observations we can show you, with how many there are and how old they are.
        </p>
      </div>

      {/* Route Summary Overview Card */}
      <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-stone-100 pb-4">
          <div>
            <span className="text-xs text-stone-500 font-medium block">Route Analysis Summary</span>
            <p className="text-sm text-stone-800 font-medium leading-relaxed mt-1">
              {route.whyText}
            </p>
          </div>

          <button
            onClick={() => startTrip(route.id)}
            className="px-5 py-2.5 bg-stone-900 hover:bg-stone-800 text-white font-semibold text-xs rounded-xl shadow-sm transition-all shrink-0 cursor-pointer"
          >
            Start this walk
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 bg-stone-50 rounded-xl">
            <span className="text-stone-500 text-[10px] uppercase font-bold block">Walk Duration</span>
            <span className="text-base font-bold text-stone-900">{route.durationMin} mins</span>
          </div>

          <div className="p-3 bg-stone-50 rounded-xl">
            <span className="text-stone-500 text-[10px] uppercase font-bold block">Distance</span>
            <span className="text-base font-bold text-stone-900">{route.distanceKm} km</span>
          </div>

          <div className="p-3 bg-stone-50 rounded-xl">
            <span className="text-stone-500 text-[10px] uppercase font-bold block">Verified Help</span>
            <span className="text-base font-bold text-emerald-700">{route.helpPointsCount} points</span>
          </div>

          <div className="p-3 bg-stone-50 rounded-xl">
            <span className="text-stone-500 text-[10px] uppercase font-bold block">Telemetry Freshness</span>
            <span className="text-xs font-bold text-stone-800">{route.freshness}</span>
          </div>
        </div>
      </div>

      {/* Segment by Segment Evidence Breakdown */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-stone-900">
          Segment Evidence Breakdown ({route.segments.length} segments)
        </h2>

        <div className="space-y-4">
          {route.segments.map((seg, idx) => (
            <div key={seg.id} className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex justify-between items-start gap-2 border-b border-stone-100 pb-3">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                    Segment {idx + 1}
                  </span>
                  <h3 className="text-base font-bold text-stone-900">{seg.title}</h3>
                </div>
                <span className="text-xs font-semibold text-stone-600 bg-stone-100 px-2.5 py-1 rounded-lg">
                  {seg.distanceKm} km ({seg.durationMin} min)
                </span>
              </div>

              <p className="text-xs text-stone-600 leading-relaxed">{seg.description}</p>

              {/* Factors & Telemetry Observations */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-stone-50/80 p-4 rounded-xl border border-stone-200/60 text-xs">
                <div>
                  <span className="text-stone-500 font-bold block mb-1">Street Lamp Lighting Coverage</span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-stone-900">{seg.lightingRating}</span>
                    <span className="text-[10px] text-stone-500">• {seg.reportsCount} observations</span>
                  </div>
                  <div className="w-full h-1.5 bg-stone-200 rounded-full mt-2 overflow-hidden">
                    <div
                      className={`h-full ${
                        seg.lightingRating === 'Well covered'
                          ? 'bg-emerald-500 w-full'
                          : seg.lightingRating === 'Mixed'
                          ? 'bg-amber-500 w-3/5'
                          : 'bg-stone-400 w-1/4'
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <span className="text-stone-500 font-bold block mb-1">Pedestrian Footfall Activity</span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-stone-900">{seg.footfallRating}</span>
                    <span className="text-[10px] text-stone-500">• newest {seg.newestObsTime}</span>
                  </div>
                  <div className="w-full h-1.5 bg-stone-200 rounded-full mt-2 overflow-hidden">
                    <div
                      className={`h-full ${
                        seg.footfallRating === 'Busy' || seg.footfallRating === 'Mixed'
                          ? 'bg-stone-800 w-4/5'
                          : 'bg-amber-500 w-2/5'
                      }`}
                    />
                  </div>
                </div>
              </div>

              {/* Highlights List */}
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                  Observed Evidence Notes:
                </span>
                <div className="space-y-1">
                  {seg.highlights.map((hl, hIdx) => (
                    <div key={hIdx} className="text-xs text-stone-700 flex items-center gap-2">
                      <span className="text-emerald-600 font-bold">✓</span>
                      <span>{hl}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RouteDetailPage;
