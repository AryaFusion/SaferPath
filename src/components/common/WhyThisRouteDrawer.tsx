import React, { useState, useEffect } from "react";
import type { RouteOption } from "../../lib/types";
import { ContextBand, ConfidenceInline } from "./ContextBand";
import Button from "./Button";
import {
  getRouteContext,
  type RouteContextResponse,
} from "../../api/saferpath/client";

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
  const [contextData, setContextData] = useState<RouteContextResponse | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!isOpen || !route) {
      setContextData(null);
      setError(null);
      return;
    }

    let isMounted = true;
    setIsLoading(true);
    setError(null);

    getRouteContext(route.id)
      .then((data) => {
        if (isMounted) {
          setContextData(data);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err);
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, route]);

  if (!isOpen || !route) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/40 backdrop-blur-xs animate-fade-in">
      <div
        className="w-full max-w-xl bg-[#faf8f5] border-l border-stone-300 h-full overflow-y-auto p-6 shadow-2xl flex flex-col justify-between"
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

              {!isLoading && !error && contextData ? (
                <div className="flex items-center gap-3 mt-1.5">
                  <ContextBand level={contextData.route_context_band as any} />
                  <span>•</span>
                  <ConfidenceInline
                    confidence={contextData.route_confidence as any}
                  />
                  <span>•</span>
                  <span className="text-xs font-mono-telemetry text-slate-600">
                    Coverage: {contextData.route_coverage}
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-3 mt-1.5">
                  <ContextBand level={route.supportLevel} />
                  <span>•</span>
                  <ConfidenceInline confidence={route.confidence} />
                </div>
              )}
            </div>

            <button
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-slate-900 text-lg font-bold cursor-pointer"
              aria-label="Close drawer"
            >
              ✕
            </button>
          </div>

          {isLoading && (
            <div className="space-y-4 animate-pulse">
              <div className="h-4 bg-stone-200 rounded w-1/3"></div>
              <div className="h-20 bg-stone-200 rounded w-full"></div>
              <div className="h-4 bg-stone-200 rounded w-1/3 mt-6"></div>
              <div className="h-20 bg-stone-200 rounded w-full"></div>
            </div>
          )}

          {error && (
            <div className="bg-amber-50 border border-amber-200 text-amber-800 text-sm p-3 rounded-lg mb-4">
              Context data unavailable — showing local route summary only
            </div>
          )}

          {!isLoading && (error || !contextData) && (
            <div className="space-y-6">
              {/* Fallback to local data (existing implementation) */}
              <div className="space-y-1.5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-teal-800 font-mono-telemetry flex items-center gap-1.5">
                  <span>🛡️</span>
                  <span>Strongest Contextual Support</span>
                </h3>
                <p className="text-xs text-slate-700 leading-relaxed bg-white p-3 rounded-lg border border-stone-200/80">
                  {route.lightingEvidence}
                </p>
              </div>

              <div className="space-y-1.5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 font-mono-telemetry flex items-center gap-1.5">
                  <span>👥</span>
                  <span>Pedestrian Footfall Activity</span>
                </h3>
                <p className="text-xs text-slate-700 leading-relaxed bg-white p-3 rounded-lg border border-stone-200/80">
                  {route.footfallEvidence}
                </p>
              </div>

              <div className="space-y-1.5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 font-mono-telemetry flex items-center gap-1.5">
                  <span>🏥</span>
                  <span>Verified Help Points Nearby</span>
                </h3>
                <div className="text-xs text-slate-700 bg-white p-3 rounded-lg border border-stone-200/80">
                  {route.helpPointsCount > 0 ? (
                    <span>
                      {route.helpPointsCount} verified assistance desks and
                      pharmacies along promenade.
                    </span>
                  ) : (
                    <span className="text-slate-500">
                      No verified 24/7 help points logged for this path.
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-1.5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-amber-800 font-mono-telemetry flex items-center gap-1.5">
                  <span>⚠️</span>
                  <span>Caution & Telemetry Gaps</span>
                </h3>
                <div className="text-xs text-slate-700 bg-white p-3 rounded-lg border border-stone-200/80">
                  {route.cautionPointsCount > 0 ? (
                    <span className="text-amber-900">
                      {route.cautionPointsCount} segment has limited lighting
                      observations logged.
                    </span>
                  ) : (
                    <span>
                      No caution segments currently flagged in verified logs.
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-1.5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono-telemetry">
                  Data Freshness & Source Logs
                </h3>
                <p className="text-xs font-mono-telemetry text-slate-600 bg-stone-100 p-2.5 rounded-lg border border-stone-200">
                  Freshness: {route.freshness} · Telemetry source: Municipal
                  lamp API & verified community observations.
                </p>
              </div>
            </div>
          )}

          {!isLoading && !error && contextData && (
            <div className="space-y-6">
              {/* 1. Strongest Support */}
              {contextData.explanation?.strongest_support &&
                contextData.explanation.strongest_support.length > 0 && (
                  <div className="space-y-1.5">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-teal-800 font-mono-telemetry flex items-center gap-1.5">
                      <span>🛡️</span>
                      <span>Strongest Contextual Support</span>
                    </h3>
                    <div className="text-xs text-slate-700 leading-relaxed bg-white p-3 rounded-lg border border-stone-200/80">
                      <ul className="list-disc pl-4 space-y-1">
                        {contextData.explanation.strongest_support.map(
                          (item: string, i: number) => (
                            <li key={i}>{item}</li>
                          ),
                        )}
                      </ul>
                    </div>
                  </div>
                )}

              {/* 2. Caution & Telemetry Gaps */}
              {contextData.explanation?.strongest_caution &&
                contextData.explanation.strongest_caution.length > 0 && (
                  <div className="space-y-1.5">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-amber-800 font-mono-telemetry flex items-center gap-1.5">
                      <span>⚠️</span>
                      <span>Caution & Telemetry Gaps</span>
                    </h3>
                    <div className="text-xs text-slate-700 leading-relaxed bg-white p-3 rounded-lg border border-stone-200/80">
                      <ul className="list-disc pl-4 space-y-1 text-amber-900">
                        {contextData.explanation.strongest_caution.map(
                          (item: string, i: number) => (
                            <li key={i}>{item}</li>
                          ),
                        )}
                      </ul>
                    </div>
                  </div>
                )}

              {/* 3. Unknown / Incomplete Data */}
              {contextData.explanation?.unknown_groups &&
                contextData.explanation.unknown_groups.length > 0 && (
                  <div className="space-y-1.5">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 font-mono-telemetry flex items-center gap-1.5">
                      <span>❓</span>
                      <span>Unknown / Incomplete Data</span>
                    </h3>
                    <div className="text-xs text-slate-700 bg-white p-3 rounded-lg border border-stone-200/80">
                      <ul className="list-disc pl-4 space-y-1">
                        {contextData.explanation.unknown_groups.map(
                          (item: string, i: number) => (
                            <li key={i}>{item}</li>
                          ),
                        )}
                      </ul>
                    </div>
                  </div>
                )}

              {/* Stale Groups */}
              {contextData.explanation?.stale_groups &&
                contextData.explanation.stale_groups.length > 0 && (
                  <div className="space-y-1.5">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 font-mono-telemetry flex items-center gap-1.5">
                      <span>⏳</span>
                      <span>Stale Data</span>
                    </h3>
                    <div className="text-xs text-slate-700 bg-white p-3 rounded-lg border border-stone-200/80">
                      <ul className="list-disc pl-4 space-y-1 text-slate-500">
                        {contextData.explanation.stale_groups.map(
                          (item: string, i: number) => (
                            <li key={i}>{item}</li>
                          ),
                        )}
                      </ul>
                    </div>
                  </div>
                )}

              {/* Freshness Summary */}
              {contextData.freshness_summary &&
                Object.keys(contextData.freshness_summary).length > 0 && (
                  <div className="space-y-1.5">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono-telemetry">
                      Telemetry Freshness
                    </h3>
                    <div className="text-[11px] font-mono-telemetry text-slate-600 bg-stone-100 p-2.5 rounded-lg border border-stone-200 grid grid-cols-2 gap-2">
                      {Object.entries(contextData.freshness_summary).map(
                        ([key, val]) => (
                          <div key={key}>
                            <span className="font-bold text-slate-700">
                              {key}:
                            </span>{" "}
                            {val as string}
                          </div>
                        ),
                      )}
                    </div>
                  </div>
                )}

              {/* Segments Breakdown */}
              {contextData.segments && contextData.segments.length > 0 && (
                <div className="space-y-1.5">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono-telemetry border-b border-stone-200 pb-1">
                    Segment Context Breakdown
                  </h3>
                  <div className="space-y-2 mt-2">
                    {contextData.segments.map((seg) => (
                      <div
                        key={seg.segment_id}
                        className="text-xs border border-stone-200 rounded p-2 bg-white flex justify-between items-center"
                      >
                        <div>
                          <span className="font-bold text-slate-800">
                            Seg {seg.sequence}
                          </span>
                          <span className="text-slate-500 ml-2">
                            {seg.context_band}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          {seg.strongest_support.length > 0 && (
                            <span title={seg.strongest_support.join(", ")}>
                              🛡️
                            </span>
                          )}
                          {seg.caution.length > 0 && (
                            <span title={seg.caution.join(", ")}>⚠️</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Drawer Actions */}
        <div className="pt-4 border-t border-stone-200 flex items-center justify-between gap-3 mt-6">
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
