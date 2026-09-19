import React from 'react';
import type { RouteOption } from '../../lib/types';
import { ContextBand, ConfidenceInline } from './ContextBand';
import Button from './Button';

interface WhyThisRouteDrawerProps {
  route: RouteOption | null;
  isOpen: boolean;
  onClose: () => void;
  onSelectRoute: (id: string) => void;
}

export const WhyThisRouteDrawer: React.FC<WhyThisRouteDrawerProps> = ({
  route,
  isOpen,
  onClose,
  onSelectRoute,
}) => {
  if (!isOpen || !route) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/40 backdrop-blur-xs animate-fade-in">
      <div
        className="w-full max-w-xl bg-[#faf8f5] border-l border-stone-300 h-full overflow-y-auto p-6 space-y-6 shadow-2xl flex flex-col justify-between"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="space-y-6">
          {/* Drawer Header */}
          <div className="flex justify-between items-start border-b border-stone-200 pb-4">
            <div>
              <span className="text-[10px] font-mono-telemetry uppercase tracking-wider text-slate-500 font-bold block">
                Evidence Drawer
              </span>
              <h2 className="text-2xl font-bold font-editorial text-slate-900 mt-0.5">
                Why this route? — {route.name}
              </h2>
              <div className="flex items-center gap-3 mt-1.5">
                <ContextBand level={route.supportLevel} />
                <span>•</span>
                <ConfidenceInline confidence={route.confidence} />
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-slate-900 text-lg font-bold cursor-pointer"
              aria-label="Close drawer"
            >
              ✕
            </button>
          </div>

          {/* Progressive Disclosure Sections */}

          {/* 1. Strongest Support */}
          <div className="space-y-1.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-teal-800 font-mono-telemetry flex items-center gap-1.5">
              <span>🛡️</span>
              <span>Strongest Contextual Support</span>
            </h3>
            <p className="text-xs text-slate-700 leading-relaxed bg-white p-3 rounded-lg border border-stone-200/80">
              {route.lightingEvidence}
            </p>
          </div>

          {/* 2. Activity & Footfall */}
          <div className="space-y-1.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 font-mono-telemetry flex items-center gap-1.5">
              <span>👥</span>
              <span>Pedestrian Footfall Activity</span>
            </h3>
            <p className="text-xs text-slate-700 leading-relaxed bg-white p-3 rounded-lg border border-stone-200/80">
              {route.footfallEvidence}
            </p>
          </div>

          {/* 3. Verified Help Points */}
          <div className="space-y-1.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 font-mono-telemetry flex items-center gap-1.5">
              <span>🏥</span>
              <span>Verified Help Points Nearby</span>
            </h3>
            <div className="text-xs text-slate-700 bg-white p-3 rounded-lg border border-stone-200/80">
              {route.helpPointsCount > 0 ? (
                <span>{route.helpPointsCount} verified assistance desks and pharmacies along promenade.</span>
              ) : (
                <span className="text-slate-500">No verified 24/7 help points logged for this path.</span>
              )}
            </div>
          </div>

          {/* 4. Caution Segments */}
          <div className="space-y-1.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-800 font-mono-telemetry flex items-center gap-1.5">
              <span>⚠️</span>
              <span>Caution & Telemetry Gaps</span>
            </h3>
            <div className="text-xs text-slate-700 bg-white p-3 rounded-lg border border-stone-200/80">
              {route.cautionPointsCount > 0 ? (
                <span className="text-amber-900">{route.cautionPointsCount} segment has limited lighting observations logged.</span>
              ) : (
                <span>No caution segments currently flagged in verified logs.</span>
              )}
            </div>
          </div>

          {/* 5. Telemetry Freshness */}
          <div className="space-y-1.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono-telemetry">
              Data Freshness & Source Logs
            </h3>
            <p className="text-xs font-mono-telemetry text-slate-600 bg-stone-100 p-2.5 rounded-lg border border-stone-200">
              Freshness: {route.freshness} · Telemetry source: Municipal lamp API & verified community observations.
            </p>
          </div>
        </div>

        {/* Drawer Actions */}
        <div className="pt-4 border-t border-stone-200 flex items-center justify-between gap-3">
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>

          <Button
            variant="primary"
            onClick={() => {
              onSelectRoute(route.id);
              onClose();
            }}
          >
            Select & Start Walk ({route.durationMinutes} min)
          </Button>
        </div>
      </div>
    </div>
  );
};

export default WhyThisRouteDrawer;
