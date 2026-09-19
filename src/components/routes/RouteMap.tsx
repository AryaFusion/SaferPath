import React from 'react';
import { useSafety } from '../../context/SafetyContext';

export const RouteMap: React.FC = () => {
  const { routes, selectedRouteId, setSelectedRouteId, helpPoints } = useSafety();

  return (
    <div className="w-full h-64 sm:h-80 bg-[#f3efea] border border-stone-200/90 rounded-2xl relative overflow-hidden flex flex-col justify-between p-4 shadow-inner">
      {/* Soft Map Grid Overlay */}
      <div
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(#121826 1px, transparent 1px)',
          backgroundSize: '20px 20px',
        }}
      />

      {/* Top Map Bar */}
      <div className="relative z-10 flex justify-between items-center bg-white/90 backdrop-blur-xs px-3 py-1.5 rounded-lg border border-stone-200 text-xs shadow-xs">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-teal-600 animate-pulse" />
          <span className="font-bold text-slate-900 font-editorial">Spatial Route Context Preview</span>
        </div>

        <div className="flex items-center gap-3 text-[11px] text-slate-600 font-medium">
          <span className="flex items-center gap-1">
            <span className="w-3 h-1 bg-teal-600 rounded-full" /> Selected
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-1 bg-stone-400 rounded-full" /> Alternative
          </span>
        </div>
      </div>

      {/* SVG Canvas for Vector Route Geometry */}
      <div className="relative w-full flex-1 my-2 z-10">
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          {/* Subtle Ambient Support Corridors */}
          <circle cx="50" cy="55" r="22" fill="#0d9488" fillOpacity="0.08" />

          {/* Unselected Routes */}
          {routes.map((rt) => {
            if (rt.id === selectedRouteId) return null;
            const isLake = rt.id.includes('lake');
            const pathD = isLake
              ? 'M 15 75 C 35 70, 65 50, 85 25'
              : 'M 15 75 C 25 45, 55 35, 85 25';

            return (
              <path
                key={rt.id}
                d={pathD}
                fill="none"
                stroke="#94a3b8"
                strokeWidth="2"
                strokeDasharray="3 3"
                className="cursor-pointer hover:stroke-slate-600 transition-colors"
                onClick={() => setSelectedRouteId(rt.id)}
              />
            );
          })}

          {/* Selected Route Line */}
          {routes.map((rt) => {
            if (rt.id !== selectedRouteId) return null;
            const isLake = rt.id.includes('lake');
            const pathD = isLake
              ? 'M 15 75 C 35 70, 65 50, 85 25'
              : 'M 15 75 C 25 45, 55 35, 85 25';

            return (
              <g key={`sel-${rt.id}`}>
                <path
                  d={pathD}
                  fill="none"
                  stroke="#0d9488"
                  strokeWidth="4"
                  strokeOpacity="0.3"
                  strokeLinecap="round"
                />
                <path
                  d={pathD}
                  fill="none"
                  stroke="#0f766e"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              </g>
            );
          })}
        </svg>

        {/* Origin Marker */}
        <div
          className="absolute transform -translate-x-1/2 -translate-y-1/2 z-20 flex items-center gap-1 bg-slate-900 px-2 py-0.5 rounded text-[10px] font-mono-telemetry font-bold text-white shadow-xs"
          style={{ left: '15%', top: '75%' }}
        >
          <span>A: Origin</span>
        </div>

        {/* Destination Marker */}
        <div
          className="absolute transform -translate-x-1/2 -translate-y-1/2 z-20 flex items-center gap-1 bg-slate-900 px-2 py-0.5 rounded text-[10px] font-mono-telemetry font-bold text-white shadow-xs"
          style={{ left: '85%', top: '25%' }}
        >
          <span>B: Destination</span>
        </div>

        {/* Help Point Indicators */}
        {helpPoints.slice(0, 2).map((hp, idx) => (
          <div
            key={hp.id}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 z-20"
            style={{ left: `${40 + idx * 25}%`, top: `${50 - idx * 10}%` }}
            title={hp.name}
          >
            <div className="w-4 h-4 rounded-full bg-white border border-teal-600 text-teal-800 text-[9px] font-bold flex items-center justify-center shadow-xs">
              🏥
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Route Selector Tabs */}
      <div className="relative z-10 flex items-center justify-between gap-2 bg-white/90 backdrop-blur-xs p-1.5 rounded-lg border border-stone-200">
        <span className="text-xs font-bold text-slate-700 hidden sm:inline font-editorial">Select Alternative:</span>
        <div className="flex flex-1 gap-1">
          {routes.map((rt) => {
            const isSelected = rt.id === selectedRouteId;
            return (
              <button
                key={rt.id}
                onClick={() => setSelectedRouteId(rt.id)}
                className={`flex-1 px-2.5 py-1 rounded text-xs font-medium transition-all text-center truncate cursor-pointer focus-visible-ring ${
                  isSelected
                    ? 'bg-slate-900 text-white font-semibold'
                    : 'bg-stone-100 text-slate-700 hover:bg-stone-200'
                }`}
              >
                {rt.name} ({rt.durationMinutes}m)
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default RouteMap;
