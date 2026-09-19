import React from 'react';
import { useSafety } from '../../context/SafetyContext';
import type { TimeOfDay } from '../../lib/types';

export const TimeLens: React.FC = () => {
  const { timeOfDay, setTimeOfDay, liveCurrentTime } = useSafety();

  const times: { value: TimeOfDay; label: string; period: string }[] = [
    { value: 'now', label: `NOW · ${liveCurrentTime}`, period: 'Live Local Time' },
  ];

  return (
    <div className="py-3 px-4 bg-white/60 backdrop-blur-sm border-y border-stone-200/80">
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono-telemetry">
            Time Lens:
          </span>
          <span className="text-xs text-slate-700">
            {timeOfDay === 'now'
              ? `Live system departure time (${liveCurrentTime} Asia/Kolkata)`
              : timeOfDay === '18:00'
              ? 'Peak commercial lighting & transit activity'
              : timeOfDay === '21:00'
              ? 'Retail closing window; municipal lamps active'
              : 'Late night window; sparse footfall telemetry'}
          </span>
        </div>

        {/* Distinctive Horizontal Timeline */}
        <div className="flex items-center gap-1 self-stretch sm:self-auto justify-between sm:justify-end">
          {times.map((item, idx) => {
            const isSelected = timeOfDay === item.value;
            return (
              <React.Fragment key={item.value}>
                <button
                  onClick={() => setTimeOfDay(item.value)}
                  className={`flex flex-col items-center px-3 py-1 rounded-lg transition-all cursor-pointer focus-visible-ring ${
                    isSelected
                      ? 'bg-slate-900 text-white shadow-xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-stone-200/50'
                  }`}
                  aria-pressed={isSelected}
                >
                  <span className="text-xs font-mono-telemetry font-bold">{item.label}</span>
                  <span className={`text-[10px] ${isSelected ? 'text-slate-300' : 'text-slate-400'}`}>
                    {item.period}
                  </span>
                </button>
                {idx < times.length - 1 && (
                  <span className="text-stone-300 font-mono-telemetry text-xs px-1" aria-hidden="true">
                    ──────
                  </span>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TimeLens;
