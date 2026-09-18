import React from 'react';
import { useSafety } from '../context/SafetyContext';

export const PlanPage: React.FC = () => {
  const {
    origin,
    setOrigin,
    destination,
    setDestination,
    leavingTime,
    setLeavingTime,
    routes,
    navigateToDetail,
    startTrip,
  } = useSafety();

  const handleUseCurrentLocation = () => {
    setOrigin('Current Location (Sitabuldi Square)');
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Title Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold text-stone-900 tracking-tight">
          Plan a walk with context
        </h1>
        <p className="text-sm text-stone-600 leading-relaxed max-w-2xl">
          Tell us where you are going and when. We compare the routes on lighting, people around and verified help points — and show you the evidence behind each one.
        </p>
      </div>

      {/* Input Form Card */}
      <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Starting Point */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold uppercase tracking-wider text-stone-700">
                Starting point
              </label>
              <button
                type="button"
                onClick={handleUseCurrentLocation}
                className="text-xs text-stone-600 hover:text-stone-900 underline font-medium cursor-pointer"
              >
                Use my current location
              </button>
            </div>
            <input
              type="text"
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
              placeholder="Enter starting location..."
              className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-400 focus:bg-white transition-all"
            />
          </div>

          {/* Destination */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-stone-700 block">
              Destination
            </label>
            <input
              type="text"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="Enter destination address..."
              className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-400 focus:bg-white transition-all"
            />
          </div>
        </div>

        {/* Time Picker & Context Note */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-2 border-t border-stone-100">
          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-wider text-stone-700 block">
              Leaving at
            </label>
            <input
              type="text"
              value={leavingTime}
              onChange={(e) => setLeavingTime(e.target.value)}
              className="px-4 py-2 bg-stone-50 border border-stone-200 rounded-xl text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-400"
            />
          </div>

          <p className="text-xs text-stone-500 italic max-w-sm">
            💡 <strong>Time matters:</strong> the same street reads differently at 7 PM and 11 PM.
          </p>

          <button
            type="button"
            className="w-full sm:w-auto px-6 py-2.5 bg-stone-900 hover:bg-stone-800 text-white font-semibold text-sm rounded-xl shadow-sm transition-all cursor-pointer self-end"
          >
            Compare routes
          </button>
        </div>
      </div>

      {/* Route Comparison Results Section */}
      <div className="space-y-4">
        {/* Context Disclaimer Banner */}
        <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-200 text-amber-900 text-xs leading-relaxed flex items-start gap-2.5">
          <span className="text-base shrink-0">📌</span>
          <span>
            <strong>Read this as context, not a promise.</strong> Conditions change. Where recent observations are missing, we say so instead of filling the gap with a guess.
          </span>
        </div>

        {/* Route Cards */}
        <div className="space-y-4">
          {routes.map((rt) => {
            const isSafest = rt.id === 'route-b';
            const isWarning = rt.isOlderData;

            return (
              <div
                key={rt.id}
                className={`bg-white border rounded-2xl p-6 shadow-sm transition-all hover:shadow-md space-y-4 ${
                  isSafest ? 'border-emerald-300 ring-1 ring-emerald-200' : 'border-stone-200'
                }`}
              >
                {/* Header Line */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-lg font-bold text-stone-900">{rt.name}</h3>
                    <span className="text-sm text-stone-500 font-medium">{rt.via}</span>
                    {rt.badges.map((b, idx) => (
                      <span
                        key={idx}
                        className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          b === 'Safest' || b === 'Suggested for this time'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : b === 'Fastest'
                            ? 'bg-stone-100 text-stone-800 border border-stone-200'
                            : 'bg-amber-100 text-amber-800 border border-amber-200'
                        }`}
                      >
                        {b}
                      </span>
                    ))}
                  </div>

                  <div className="text-right">
                    <span className="text-base font-bold text-stone-900">{rt.durationMin} min</span>
                    <span className="text-xs text-stone-500 block">{rt.distanceKm} km walk</span>
                  </div>
                </div>

                {/* Factors Matrix */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-stone-50/80 p-3.5 rounded-xl border border-stone-200/60 text-xs">
                  <div>
                    <span className="text-[10px] text-stone-500 uppercase tracking-wider block font-bold">Lighting</span>
                    <span className={`font-semibold ${rt.lighting === 'Well covered' ? 'text-emerald-700' : rt.lighting === 'Mixed' ? 'text-amber-700' : 'text-stone-600'}`}>
                      {rt.lighting}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-stone-500 uppercase tracking-wider block font-bold">Footfall</span>
                    <span className={`font-semibold ${rt.footfall === 'Busy' || rt.footfall === 'Mixed' ? 'text-stone-800' : 'text-rose-700'}`}>
                      {rt.footfall}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-stone-500 uppercase tracking-wider block font-bold">Help Points</span>
                    <span className="font-semibold text-emerald-700">
                      {rt.helpPointsCount} verified
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-stone-500 uppercase tracking-wider block font-bold">Flagged Areas</span>
                    <span className={`font-semibold ${rt.flaggedAreasCount > 0 ? 'text-amber-700' : 'text-stone-600'}`}>
                      {rt.flaggedAreasCount > 0 ? `${rt.flaggedAreasCount} flagged` : 'None flagged'}
                    </span>
                  </div>
                </div>

                {/* Status / Confidence bar */}
                <div className="flex flex-wrap items-center justify-between text-xs text-stone-500 gap-2 border-t border-stone-100 pt-3">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${isWarning ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                    <span>Confidence: <strong className="text-stone-800">{rt.confidence}</strong></span>
                    <span>•</span>
                    <span>{rt.freshness}</span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-3 w-full sm:w-auto justify-end pt-2 sm:pt-0">
                    <button
                      onClick={() => navigateToDetail(rt.id)}
                      className="text-stone-700 hover:text-stone-900 font-semibold underline text-xs cursor-pointer"
                    >
                      Why this route? →
                    </button>

                    <button
                      onClick={() => startTrip(rt.id)}
                      className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white font-semibold text-xs rounded-xl transition-all shadow-sm cursor-pointer"
                    >
                      Start this walk
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default PlanPage;
