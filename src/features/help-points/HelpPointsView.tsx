import React, { useState, useEffect, useCallback } from "react";
import Button from "../../components/common/Button";
import {
  MapPin,
  Phone,
  ShieldCheck,
  Loader2,
  WifiOff,
  RefreshCw,
  Info,
} from "lucide-react";
import {
  getNearbyHelpPoints,
  type HelpPointApiItem,
  ApiError,
} from "../../api/saferpath/client";
import { FIXTURE_HELP_POINTS } from "../../test-fixtures/helpPoints";

// ---------------------------------------------------------------------------
// Mapping: backend category → display label
// ---------------------------------------------------------------------------
const CATEGORY_LABELS: Record<string, string> = {
  PHARMACY: "Pharmacy",
  TRANSIT_DESK: "Transit Desk",
  POLICE_DESK: "Police Desk",
  CLINIC: "Clinic",
  COMMERCIAL_HAVEN: "Commercial Haven",
  PHARMACY_24H: "Pharmacy (24h)",
  STAFFED_DESK: "Staffed Desk",
};

function formatCategory(raw: string): string {
  return CATEGORY_LABELS[raw?.toUpperCase()] || raw;
}

// ---------------------------------------------------------------------------
// Default coordinates (Dadar, Mumbai) — used when geolocation unavailable
// ---------------------------------------------------------------------------
const DEFAULT_LAT = 19.019;
const DEFAULT_LNG = 72.843;
const DEFAULT_RADIUS = 1000;

// ---------------------------------------------------------------------------
// Unified help point type for display
// ---------------------------------------------------------------------------
interface DisplayHelpPoint {
  id: string;
  name: string;
  category: string;
  status: string;
  verificationStatus: string;
  address: string;
  phone?: string;
  distanceMeters?: number;
  isFixture: boolean;
  accessibilityFeatures?: string[];
}

function apiItemToDisplay(
  item: HelpPointApiItem,
  idx: number,
): DisplayHelpPoint {
  const phone = item.contact?.phone || item.contact?.telephone;
  return {
    id: item.reference || `hp-${idx}`,
    name: item.contact?.name || formatCategory(item.category),
    category: formatCategory(item.category),
    status:
      item.operating_status === "OPEN"
        ? "Open"
        : item.operating_status === "CLOSED"
          ? "Closed"
          : item.operating_status,
    verificationStatus: item.verification_status,
    address: item.contact?.address || "—",
    phone,
    isFixture: false,
    accessibilityFeatures: item.accessibility ?? undefined,
  };
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export const HelpPointsView: React.FC = () => {
  const [filterCategory, setFilterCategory] = useState<string>("All");
  const [displayPoints, setDisplayPoints] = useState<DisplayHelpPoint[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [usingFallback, setUsingFallback] = useState(false);
  const [lastLoaded, setLastLoaded] = useState<Date | null>(null);

  // Geolocation state
  const [userLat, setUserLat] = useState<number>(DEFAULT_LAT);
  const [userLng, setUserLng] = useState<number>(DEFAULT_LNG);
  const [geoError, setGeoError] = useState<string | null>(null);

  const categories = [
    "All",
    "Pharmacy",
    "Transit Desk",
    "Police Desk",
    "Commercial Haven",
    "Clinic",
  ];

  const loadHelpPoints = useCallback(
    async (lat: number, lng: number) => {
      setIsLoading(true);
      setLoadError(null);
      setUsingFallback(false);

      try {
        const raw = await getNearbyHelpPoints(
          lat,
          lng,
          DEFAULT_RADIUS,
          filterCategory !== "All"
            ? filterCategory.toUpperCase().replace(/ /g, "_")
            : undefined,
        );

        if (raw.length === 0) {
          // Backend returned empty — fall through to fixture
          throw new Error("no_results");
        }

        setDisplayPoints(raw.map((item, idx) => apiItemToDisplay(item, idx)));
        setLastLoaded(new Date());
      } catch (err) {
        // Fall back to fixture data
        setUsingFallback(true);
        const fixtures: DisplayHelpPoint[] = FIXTURE_HELP_POINTS.map((hp) => ({
          id: hp.id,
          name: hp.name,
          category: hp.category,
          status: hp.status,
          verificationStatus: `Verified by ${hp.verificationAuthority}`,
          address: hp.address,
          phone: hp.phone,
          distanceMeters: hp.distanceMeters,
          isFixture: true,
          accessibilityFeatures: [],
        }));
        setDisplayPoints(fixtures);

        if (err instanceof ApiError) {
          if (err.isNetworkError) {
            setLoadError(
              "Network unavailable — showing demonstration data. Connect to internet for live help points.",
            );
          } else if (err.isUnavailable) {
            setLoadError(
              "Help points service is temporarily unavailable — showing demonstration data.",
            );
          } else {
            setLoadError(
              `Could not load live help points (${err.code}) — showing demonstration data.`,
            );
          }
        } else if (err instanceof Error && err.message === "no_results") {
          setLoadError(
            "No help points found within 1km of your location in the live database — showing demonstration data.",
          );
        }
        setLastLoaded(new Date());
      } finally {
        setIsLoading(false);
      }
    },
    [filterCategory],
  );

  // Request geolocation on mount
  useEffect(() => {
    if (!navigator.geolocation) {
      setGeoError(
        "Geolocation is not supported by this browser. Showing default area.",
      );
      loadHelpPoints(DEFAULT_LAT, DEFAULT_LNG);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLat(pos.coords.latitude);
        setUserLng(pos.coords.longitude);
        loadHelpPoints(pos.coords.latitude, pos.coords.longitude);
      },
      () => {
        setGeoError(
          "Location permission not granted — using default area (Dadar, Mumbai).",
        );
        loadHelpPoints(DEFAULT_LAT, DEFAULT_LNG);
      },
      { timeout: 8000, enableHighAccuracy: false },
    );
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Reload when category filter changes (after initial load)
  useEffect(() => {
    if (lastLoaded) {
      loadHelpPoints(userLat, userLng);
    }
  }, [filterCategory]); // eslint-disable-line react-hooks/exhaustive-deps

  const filteredPoints =
    filterCategory === "All"
      ? displayPoints
      : displayPoints.filter((hp) =>
          hp.category.toLowerCase().includes(filterCategory.toLowerCase()),
        );

  return (
    <div className="space-y-4 max-w-4xl mx-auto px-1">
      {/* Title */}
      <div className="space-y-1 pb-3 border-b border-[#DCE3EE]">
        <div className="flex justify-between items-start flex-wrap gap-2">
          <div>
            <h1 className="text-2xl font-bold text-[#172033] tracking-tight">
              Help nearby
            </h1>
            <p className="text-xs text-[#64748B]">
              Authorized physical locations where travellers can access verified
              help points or staffed desks.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => loadHelpPoints(userLat, userLng)}
            disabled={isLoading}
            aria-label="Refresh help points"
          >
            {isLoading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <RefreshCw className="w-3.5 h-3.5" />
            )}
            <span>{isLoading ? "Loading…" : "Refresh"}</span>
          </Button>
        </div>
      </div>

      {/* Geolocation notice */}
      {geoError && (
        <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 text-amber-900 text-xs rounded-md">
          <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
          <span>{geoError}</span>
        </div>
      )}

      {/* Fallback/error notice */}
      {loadError && !isLoading && (
        <div
          role="alert"
          className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 text-blue-900 text-xs rounded-md"
        >
          <WifiOff className="w-3.5 h-3.5 shrink-0 mt-0.5" />
          <span>{loadError}</span>
        </div>
      )}

      {/* Fallback badge */}
      {usingFallback && (
        <div className="flex items-center gap-2 text-[11px] text-[#64748B]">
          <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200 font-semibold font-mono text-[10px]">
            Demonstration data
          </span>
          <span>
            Live data unavailable. Showing sample help points for reference.
          </span>
        </div>
      )}

      {/* Filter Category Chips */}
      <div
        className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs"
        role="group"
        aria-label="Filter help points by category"
      >
        <span className="text-[#64748B] font-medium text-xs mr-1 shrink-0">
          Filter:
        </span>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilterCategory(cat)}
            aria-pressed={filterCategory === cat}
            className={`px-2.5 py-1 rounded text-xs transition-colors cursor-pointer font-medium whitespace-nowrap ${
              filterCategory === cat
                ? "bg-[#2563EB] text-white"
                : "bg-[#F5F7FB] text-[#64748B] hover:bg-[#EFF6FF] hover:text-[#2563EB]"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Loading skeleton */}
      {isLoading && (
        <div
          className="bg-white border border-[#DCE3EE] rounded-md divide-y divide-[#DCE3EE]"
          aria-busy="true"
          aria-label="Loading help points"
        >
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="p-3.5 flex items-center gap-3 animate-pulse"
            >
              <div className="w-8 h-8 rounded-md bg-[#F5F7FB]" />
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-[#F5F7FB] rounded w-1/3" />
                <div className="h-2 bg-[#F5F7FB] rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && filteredPoints.length === 0 && (
        <div className="bg-white border border-[#DCE3EE] rounded-md p-8 text-center space-y-2">
          <MapPin className="w-8 h-8 text-[#DCE3EE] mx-auto" />
          <h3 className="text-sm font-bold text-[#172033]">
            No help points found
          </h3>
          <p className="text-xs text-[#64748B]">
            No {filterCategory !== "All" ? filterCategory : ""} help points were
            found in this area.
            {filterCategory !== "All" && (
              <button
                onClick={() => setFilterCategory("All")}
                className="text-[#2563EB] underline ml-1"
              >
                Clear filter
              </button>
            )}
          </p>
        </div>
      )}

      {/* Help Points List */}
      {!isLoading && filteredPoints.length > 0 && (
        <div
          className="bg-white border border-[#DCE3EE] rounded-md divide-y divide-[#DCE3EE]"
          aria-label="Nearby help points"
        >
          {filteredPoints.map((hp) => (
            <div
              key={hp.id}
              className="p-3.5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 hover:bg-[#F5F7FB] transition-colors"
            >
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-[#172033] text-xs">
                    {hp.name}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#F5F7FB] text-[#172033] border border-[#DCE3EE]">
                    {hp.category}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                      hp.status === "Open" || hp.status === "OPEN"
                        ? "bg-[#EFF6FF] text-[#0F766E] border-[#0F766E]/30"
                        : "bg-[#F5F7FB] text-[#64748B] border-[#DCE3EE]"
                    }`}
                  >
                    {hp.status}
                  </span>
                  {hp.distanceMeters !== undefined && (
                    <span className="text-[11px] font-mono text-[#64748B]">
                      {hp.distanceMeters}m away
                    </span>
                  )}
                  {hp.isFixture && (
                    <span className="px-1.5 py-0.5 text-[9px] font-mono font-semibold bg-amber-50 text-amber-700 border border-amber-200 rounded">
                      Demo
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5 text-xs text-[#64748B]">
                  <MapPin className="w-3.5 h-3.5 text-[#64748B] shrink-0" />
                  <span className="truncate">{hp.address}</span>
                </div>

                {hp.verificationStatus && (
                  <div className="text-[11px] font-mono text-[#64748B] flex items-center gap-1.5">
                    <ShieldCheck className="w-3 h-3 text-[#2563EB]" />
                    <span>{hp.verificationStatus}</span>
                  </div>
                )}

                {hp.accessibilityFeatures &&
                  hp.accessibilityFeatures.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-0.5">
                      {hp.accessibilityFeatures.map((f) => (
                        <span
                          key={f}
                          className="px-1.5 py-0.5 text-[9px] font-mono bg-blue-50 text-blue-700 border border-blue-200 rounded"
                        >
                          {f}
                        </span>
                      ))}
                    </div>
                  )}
              </div>

              {/* Phone action */}
              {hp.phone && (
                <a
                  href={`tel:${hp.phone}`}
                  className="shrink-0 w-full sm:w-auto"
                >
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-xs"
                  >
                    <Phone className="w-3 h-3 text-[#2563EB]" />
                    <span>Call {hp.phone.split("/")[0]}</span>
                  </Button>
                </a>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Last loaded timestamp */}
      {lastLoaded && !isLoading && (
        <div className="text-[10px] text-[#64748B] font-mono text-right">
          Last updated:{" "}
          {lastLoaded.toLocaleTimeString("en-IN", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </div>
      )}

      {/* Privacy note */}
      <div className="p-3 bg-[#F5F7FB] border border-[#DCE3EE] rounded-md text-[11px] text-[#64748B]">
        <strong>Privacy:</strong> Your location is used only to find nearby help
        points within this session. It is not stored or transmitted beyond this
        request.
      </div>
    </div>
  );
};

export default HelpPointsView;
