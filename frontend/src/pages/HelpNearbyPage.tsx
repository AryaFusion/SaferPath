import { useState, useEffect, useRef } from "react";
import AppNavbar from "../components/app/AppNavbar";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, MapPin, Navigation, X, ChevronRight, Shield, ShieldCheck,
  ExternalLink, Info, Phone, LifeBuoy, Pill, Train, Building2,
  Stethoscope, AlertTriangle, Clock, Filter,
} from "lucide-react";
import { useJourney } from "../context/JourneyContext";
import type { SupportPoint, SupportCategory } from "../data/supportPointsData";
import { fetchNearbySupportPoints, geocodeSearch } from "../utils/poiService";
import { calculateDistance } from "../utils/geo";
import { Link } from "react-router-dom";

// ─── Filter Categories ──────────────────────────────────────────────────────

type FilterKey = "All" | SupportCategory;

const FILTER_CATEGORIES: { key: FilterKey; label: string; icon: React.ElementType }[] = [
  { key: "All", label: "All", icon: Filter },
  { key: "Police", label: "Police", icon: Shield },
  { key: "Hospital", label: "Hospital", icon: Building2 },
  { key: "Clinic", label: "Clinic", icon: Stethoscope },
  { key: "Pharmacy", label: "Pharmacy", icon: Pill },
  { key: "Transport", label: "Transport", icon: Train },
  { key: "Support", label: "Support", icon: LifeBuoy },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getCategoryColor(cat: SupportCategory): string {
  switch (cat) {
    case "Police": return "bg-blue-50 text-blue-700";
    case "Hospital": return "bg-red-50 text-red-700";
    case "Clinic": return "bg-violet-50 text-violet-700";
    case "Pharmacy": return "bg-emerald-50 text-emerald-700";
    case "Transport": return "bg-amber-50 text-amber-700";
    case "Support": return "bg-teal-50 text-teal-700";
    default: return "bg-slate-100 text-slate-700";
  }
}

function getCategoryIcon(cat: SupportCategory): React.ElementType {
  switch (cat) {
    case "Police": return Shield;
    case "Hospital": return Building2;
    case "Clinic": return Stethoscope;
    case "Pharmacy": return Pill;
    case "Transport": return Train;
    case "Support": return LifeBuoy;
    default: return MapPin;
  }
}

function getVerificationBadge(point: SupportPoint) {
  if (point.verified === true) {
    return { label: "Verified", color: "text-emerald-600", bg: "bg-emerald-50" };
  }
  if (point.verified === false) {
    return { label: "Not recently verified", color: "text-slate-500", bg: "bg-slate-50" };
  }
  return { label: "Verification status unavailable", color: "text-slate-400", bg: "bg-slate-50" };
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function HelpNearbyPage() {
  const { activeTrip, currentTripLocation, locationTrackingStatus } = useJourney();

  // State
  const [activeFilter, setActiveFilter] = useState<FilterKey>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [showAlongRoute, setShowAlongRoute] = useState(false);
  const [selectedPoint, setSelectedPoint] = useState<SupportPoint | null>(null);
  const [locationMode, setLocationMode] = useState<"nearby" | "search">("nearby");
  
  // Real-time data state
  const [livePoints, setLivePoints] = useState<SupportPoint[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  
  const lastFetchCoordsRef = useRef<{lat: number, lon: number} | null>(null);

  // Fetch real-time data
  useEffect(() => {
    if (locationMode !== "nearby" || !currentTripLocation) return;
    
    const lat = currentTripLocation.latitude;
    const lon = currentTripLocation.longitude;
    
    // Throttle: only refetch if moved more than ~100m or first time
    let shouldFetch = false;
    if (!lastFetchCoordsRef.current) {
      shouldFetch = true;
    } else {
      const distStr = calculateDistance(
        lastFetchCoordsRef.current.lat, lastFetchCoordsRef.current.lon,
        lat, lon
      );
      // distStr looks like "150 m" or "1.2 km"
      if (distStr.includes("km") || parseInt(distStr) > 100) {
        shouldFetch = true;
      }
    }
    
    if (shouldFetch) {
      setIsLoading(true);
      setFetchError(null);
      fetchNearbySupportPoints(lat, lon, 2000)
        .then((data) => {
          setLivePoints(data);
          lastFetchCoordsRef.current = { lat, lon };
        })
        .catch(() => setFetchError("Nearby support couldn't be loaded. Check your connection and try again."))
        .finally(() => setIsLoading(false));
    }
  }, [currentTripLocation, locationMode]);

  // Handle manual search
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    setLocationMode("search");
    setIsLoading(true);
    setFetchError(null);
    try {
      const coords = await geocodeSearch(searchQuery);
      if (coords) {
        const data = await fetchNearbySupportPoints(coords.lat, coords.lon, 2000);
        setLivePoints(data);
      } else {
        setFetchError("Location not found.");
        setLivePoints([]);
      }
    } catch {
      setFetchError("Search failed.");
    } finally {
      setIsLoading(false);
    }
  };

  // Drawer ref for Escape handling
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") setSelectedPoint(null);
    }
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  // ─── Filtering & Distances ──────────────────────────────────────────────────────

  const processedPoints = livePoints.map(point => {
    // If in nearby mode with active trip, update distance based on current location
    if (locationMode === "nearby" && currentTripLocation) {
      return {
        ...point,
        distance: calculateDistance(currentTripLocation.latitude, currentTripLocation.longitude, point.latitude, point.longitude)
      };
    }
    return point;
  }).sort((a, b) => {
    // Sort by distance roughly (km vs m)
    if (a.distance && b.distance) {
      const aVal = a.distance.includes("km") ? parseFloat(a.distance) * 1000 : parseFloat(a.distance);
      const bVal = b.distance.includes("km") ? parseFloat(b.distance) * 1000 : parseFloat(b.distance);
      return aVal - bVal;
    }
    return 0;
  });

  const filteredPoints = processedPoints.filter((point) => {
    // Category filter
    if (activeFilter !== "All" && point.category !== activeFilter) return false;

    // Along route filter (not fully implemented with real geo route yet)
    if (showAlongRoute && activeTrip) {
      if (!point.routeRelevant) return false;
    }

    return true;
  });

  // ─── Directions handler (mock — structured for future integration) ─────

  const handleGetDirections = (point: SupportPoint) => {
    let mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${point.latitude},${point.longitude}`;
    if (locationMode === "nearby" && currentTripLocation) {
      mapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${currentTripLocation.latitude},${currentTripLocation.longitude}&destination=${point.latitude},${point.longitude}`;
    }
    window.open(mapsUrl, "_blank", "noopener,noreferrer");
  };

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[#f7f9f8] pt-14 pb-20 text-slate-900 md:pb-8">
      <AppNavbar />

      <main className="mx-auto max-w-[1200px] px-4 py-6 sm:px-6 md:py-8 lg:px-10 lg:py-10">

        {/* ─── Page Header ─── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-6"
        >
          <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl lg:text-[26px]">
            Help Nearby
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {activeTrip
              ? "Find support points near your current journey."
              : "Find verified support points around you or along your route."}
          </p>
        </motion.div>

        {/* ─── Active Journey Banner ─── */}
        <AnimatePresence>
          {activeTrip && (
            <motion.section
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
              className="mb-6"
            >
              <div className="rounded-2xl border border-emerald-200 bg-white p-4 shadow-sm ring-1 ring-emerald-600/10 sm:p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50">
                      <Navigation className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-slate-900">{activeTrip.destination}</h3>
                        <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                          <span className="relative flex h-1.5 w-1.5">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
                          </span>
                          Active
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">
                        {activeTrip.travelMode} · Started {activeTrip.departureTime}
                      </p>
                    </div>
                  </div>
                  <Link
                    to="/trips"
                    className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50"
                  >
                    View Journey
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        {/* ─── Search & Location Controls ─── */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.05 }}
          className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center"
        >
          {/* Search input */}
          <form onSubmit={handleSearch} className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search an area or place"
              className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-10 text-sm text-slate-900 shadow-sm outline-none transition-all placeholder:text-slate-400 focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100"
              aria-label="Search support points"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => { setSearchQuery(""); setLocationMode("nearby"); setLivePoints([]); lastFetchCoordsRef.current = null; }}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-0.5 text-slate-400 hover:text-slate-600"
                aria-label="Clear search"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </form>

          {/* Location & route controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setLocationMode("nearby");
                if (currentTripLocation) {
                  lastFetchCoordsRef.current = null; // force refetch
                }
              }}
              className={`flex items-center gap-1.5 rounded-lg border px-3 py-2.5 text-xs font-semibold transition-colors ${
                locationMode === "nearby"
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              }`}
              aria-label="Use current location"
              aria-pressed={locationMode === "nearby"}
            >
              <MapPin className="h-3.5 w-3.5" />
              Near me
            </button>

            {activeTrip && (
              <button
                onClick={() => {
                  setShowAlongRoute(!showAlongRoute);
                  setLocationMode("nearby");
                }}
                className={`flex items-center gap-1.5 rounded-lg border px-3 py-2.5 text-xs font-semibold transition-colors ${
                  showAlongRoute
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                }`}
                aria-label="Show support points along your route"
                aria-pressed={showAlongRoute}
              >
                <Navigation className="h-3.5 w-3.5" />
                Along my route
              </button>
            )}
          </div>
        </motion.div>

        {/* ─── Filter Chips ─── */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="mb-6 flex gap-2 overflow-x-auto pb-1 scrollbar-hide"
          role="group"
          aria-label="Filter by support type"
        >
          {FILTER_CATEGORIES.map((cat) => {
            const isActive = activeFilter === cat.key;
            return (
              <button
                key={cat.key}
                onClick={() => setActiveFilter(cat.key)}
                className={`flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-2 text-xs font-semibold transition-all ${
                  isActive
                    ? "border-emerald-200 bg-emerald-600 text-white shadow-sm"
                    : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                }`}
                aria-pressed={isActive}
              >
                <cat.icon className="h-3.5 w-3.5" />
                {cat.label}
              </button>
            );
          })}
        </motion.div>

        {/* ─── Data Quality Notice ─── */}
        <div className="mb-6 flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-600 shadow-sm">
          <Info className="mt-0.5 h-5 w-5 shrink-0 text-slate-400" />
          <p>
            Some support-point information may be incomplete or outdated. SaferPath provides context; you make the final decision.
          </p>
        </div>

        {/* ─── Main Results Layout ─── */}
        <div className="flex flex-col gap-6 lg:flex-row">

          {/* ─── Route Context Visualization (Desktop left column) ─── */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.15 }}
            className="order-2 lg:order-1 lg:w-[340px] lg:shrink-0"
          >
            {/* Route Context Card */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400">
                {activeTrip ? "Route Context" : "Area Context"}
              </h3>

              {activeTrip ? (
                <div className="space-y-4">
                  {/* Route visualization */}
                  <div className="relative rounded-xl bg-slate-50 p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex flex-col items-center">
                        <div className="h-3 w-3 rounded-full border-2 border-emerald-500 bg-white" />
                        <div className="h-12 w-px bg-gradient-to-b from-emerald-400 to-slate-300" />
                        <div className="h-3 w-3 rounded-full bg-slate-800" />
                      </div>
                      <div className="flex-1 space-y-6">
                        <div>
                          <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">From</p>
                          <p className="text-sm font-semibold text-slate-800">{activeTrip.origin}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">To</p>
                          <p className="text-sm font-semibold text-slate-800">{activeTrip.destination}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Route stats */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="rounded-lg bg-slate-50 px-3 py-2">
                      <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">Mode</p>
                      <p className="text-sm font-semibold text-slate-700">{activeTrip.travelMode}</p>
                    </div>
                    <div className="rounded-lg bg-slate-50 px-3 py-2">
                      <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">ETA</p>
                      <p className="text-sm font-semibold text-slate-700">{activeTrip.eta}</p>
                    </div>
                    <div className="col-span-2 rounded-lg bg-slate-50 px-3 py-2">
                      <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">Route</p>
                      <p className="text-sm font-semibold text-slate-700">{activeTrip.selectedRoute}</p>
                    </div>
                  </div>

                  {/* Support summary */}
                  <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-3">
                    <p className="text-xs font-semibold text-emerald-700">
                      {filteredPoints.filter((p) => p.routeRelevant).length} support point{filteredPoints.filter((p) => p.routeRelevant).length !== 1 ? "s" : ""} near your route
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* No-journey area context */}
                  <div className="rounded-xl bg-slate-50 p-5 text-center">
                    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
                      <MapPin className="h-6 w-6 text-slate-400" />
                    </div>
                    <p className="text-sm font-semibold text-slate-700">Bandra West area</p>
                    <p className="mt-1 text-xs text-slate-400">Showing support points nearby</p>
                  </div>

                  <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-3">
                    <p className="text-xs text-slate-500">
                      Plan a journey from <Link to="/home" className="font-semibold text-emerald-600 hover:underline">Home</Link> to see route-relevant support points.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* ─── Emergency Support Section ─── */}
            <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400">
                Emergency support
              </h3>
              <div className="rounded-xl border border-red-100 bg-red-50/50 p-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-100">
                    <Phone className="h-4 w-4 text-red-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      If you are in immediate danger, contact the appropriate emergency service directly.
                    </p>
                    <div className="mt-3 flex items-center gap-2">
                      <span className="rounded-lg bg-red-100 px-3 py-1.5 text-sm font-bold text-red-700">
                        112
                      </span>
                      <span className="text-xs text-slate-500">Emergency response (India)</span>
                    </div>
                    <p className="mt-3 text-[11px] text-slate-400">
                      SaferPath does not dispatch emergency services or guarantee emergency response.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* ─── Support Point List (Desktop right column) ─── */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="order-1 flex-1 lg:order-2"
          >
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">
                {showAlongRoute && activeTrip ? "Support along your route" : "Support points"}
              </h2>
              <span className="text-xs text-slate-400">
                {filteredPoints.length} result{filteredPoints.length !== 1 ? "s" : ""}
              </span>
            </div>

            {/* ─── Results or Empty States ─── */}
            {isLoading ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 py-16 text-center">
                <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-emerald-200 border-t-emerald-600"></div>
                <p className="text-sm font-semibold text-slate-700">Finding support nearby...</p>
                <p className="mt-1 max-w-xs text-xs text-slate-500">
                  {locationMode === "nearby" ? "Using your current location" : "Searching selected area"}
                </p>
              </div>
            ) : fetchError ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-red-300 bg-red-50 py-16 text-center">
                <AlertTriangle className="mb-3 h-10 w-10 text-red-400" />
                <p className="text-sm font-bold text-slate-800">{fetchError}</p>
                <button 
                  onClick={() => {
                    lastFetchCoordsRef.current = null; // force refetch if nearby
                    if (locationMode === "search") {
                      handleSearch({ preventDefault: () => {} } as any);
                    } else {
                      setLocationMode("search"); // hack to trigger effect
                      setTimeout(() => setLocationMode("nearby"), 0);
                    }
                  }}
                  className="mt-4 rounded-lg bg-white px-4 py-2 text-xs font-semibold text-red-700 shadow-sm ring-1 ring-inset ring-red-300 hover:bg-red-50"
                >
                  Retry
                </button>
              </div>
            ) : locationMode === "nearby" && locationTrackingStatus === "denied" ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 py-16 text-center">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-200">
                  <MapPin className="h-6 w-6 text-slate-500" />
                </div>
                <p className="text-sm font-bold text-slate-800">Location access is turned off</p>
                <p className="mt-1 max-w-xs text-xs text-slate-500">
                  Allow location access in your browser settings to see support points near your current position.
                </p>
              </div>
            ) : locationMode === "nearby" && !activeTrip ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 py-16 text-center">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-200">
                  <Navigation className="h-6 w-6 text-slate-500" />
                </div>
                <p className="text-sm font-bold text-slate-800">Location needed</p>
                <p className="mt-1 max-w-xs text-xs text-slate-500">
                  Start a journey to use live location, or search an area manually above to find nearby support.
                </p>
              </div>
            ) : filteredPoints.length > 0 ? (
              <div className="space-y-3">
                {filteredPoints.map((point, index) => {
                  const CatIcon = getCategoryIcon(point.category);
                  const vBadge = getVerificationBadge(point);

                  return (
                    <motion.article
                      key={point.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.04 }}
                      className="group rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md sm:p-5"
                      aria-label={`${point.name}, ${point.type}, ${point.distance} away`}
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="flex items-start gap-3 sm:gap-4">
                          {/* Category icon */}
                          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${getCategoryColor(point.category)}`}>
                            <CatIcon className="h-5 w-5" />
                          </div>

                          <div className="min-w-0 flex-1">
                            {/* Name & type */}
                            <h3 className="text-sm font-bold text-slate-900 sm:text-[15px]">
                              {point.name}
                            </h3>
                            <div className="mt-1 flex flex-wrap items-center gap-2">
                              <span className={`rounded-md px-2 py-0.5 text-[10px] font-semibold ${getCategoryColor(point.category)}`}>
                                {point.type}
                              </span>
                              <span className="text-xs text-slate-400">
                                {point.distance} away
                              </span>
                            </div>

                            {/* Address */}
                            <p className="mt-1.5 text-xs text-slate-500">{point.address}</p>

                            {/* Description */}
                            <p className="mt-1.5 text-sm text-slate-600">{point.description}</p>

                            {/* Badges row */}
                            <div className="mt-3 flex flex-wrap items-center gap-2">
                              {/* Verification badge */}
                              <span className={`flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-medium ${vBadge.bg} ${vBadge.color}`}>
                                {point.verified === true ? (
                                  <ShieldCheck className="h-3 w-3" />
                                ) : point.verified === false ? (
                                  <Clock className="h-3 w-3" />
                                ) : (
                                  <AlertTriangle className="h-3 w-3" />
                                )}
                                {vBadge.label}
                              </span>

                              {/* Route relevance badge */}
                              {point.routeRelevant && activeTrip && (
                                <span className="flex items-center gap-1 rounded-md bg-teal-50 px-2 py-0.5 text-[10px] font-medium text-teal-700">
                                  <Navigation className="h-3 w-3" />
                                  {point.routeProximity || "Near your route"}
                                </span>
                              )}

                              {/* Freshness */}
                              {point.verified === true && point.verificationDate && (
                                <span className="text-[10px] text-slate-400">
                                  · Checked {point.verificationDate}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex shrink-0 items-center gap-2 sm:flex-col sm:items-end">
                          <button
                            onClick={() => setSelectedPoint(point)}
                            className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50"
                          >
                            View Details
                            <ChevronRight className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleGetDirections(point)}
                            className="flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-bold text-white shadow-sm transition-all hover:bg-emerald-700 hover:shadow-md"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                            Directions
                          </button>
                        </div>
                      </div>
                    </motion.article>
                  );
                })}
              </div>
            ) : (
              /* ─── No Results State ─── */
              <div className="rounded-2xl border border-slate-200 bg-white py-16 text-center shadow-sm">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
                  <MapPin className="h-7 w-7 text-slate-400" />
                </div>
                <h3 className="text-base font-bold text-slate-800">No support points found</h3>
                <p className="mx-auto mt-2 max-w-xs text-sm text-slate-500">
                  Try another category or search a different area.
                </p>
                <button
                  onClick={() => {
                    setActiveFilter("All");
                    setSearchQuery("");
                    setShowAlongRoute(false);
                    if (searchQuery) {
                      setLocationMode("nearby");
                      setLivePoints([]);
                      lastFetchCoordsRef.current = null;
                    }
                  }}
                  className="mt-5 inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </motion.div>
        </div>
      </main>

      {/* ─── Detail Drawer ─── */}
      <AnimatePresence>
        {selectedPoint && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedPoint(null)}
              className="fixed inset-0 z-[80] bg-slate-900/30 backdrop-blur-sm"
            />
            {/* Drawer */}
            <motion.div
              ref={drawerRef}
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed inset-y-0 right-0 z-[90] flex w-full max-w-md flex-col bg-white shadow-2xl"
              role="dialog"
              aria-label={`Details for ${selectedPoint.name}`}
              aria-modal="true"
            >
              {/* Drawer header */}
              <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                <h2 className="text-sm font-bold text-slate-900">Support Point Details</h2>
                <button
                  onClick={() => setSelectedPoint(null)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100"
                  aria-label="Close details"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Drawer content */}
              <div className="flex-1 overflow-y-auto px-5 py-6">
                {/* Icon + Name */}
                <div className="flex items-start gap-4">
                  <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${getCategoryColor(selectedPoint.category)}`}>
                    {(() => {
                      const Icon = getCategoryIcon(selectedPoint.category);
                      return <Icon className="h-6 w-6" />;
                    })()}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">{selectedPoint.name}</h3>
                    <span className={`mt-1 inline-block rounded-md px-2 py-0.5 text-xs font-semibold ${getCategoryColor(selectedPoint.category)}`}>
                      {selectedPoint.type}
                    </span>
                  </div>
                </div>

                {/* Meta info */}
                <div className="mt-6 space-y-3">
                  <div className="flex items-start gap-3">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                    <div>
                      <p className="text-sm text-slate-700">{selectedPoint.address}</p>
                      <p className="text-xs text-slate-400">{selectedPoint.distance} away</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Info className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                    <p className="text-sm text-slate-700">{selectedPoint.description}</p>
                  </div>
                </div>

                {/* Verification status */}
                <div className="mt-6">
                  <h4 className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">Data Status</h4>
                  <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                    {(() => {
                      const vBadge = getVerificationBadge(selectedPoint);
                      return (
                        <div className="flex items-center gap-2">
                          {selectedPoint.verified === true ? (
                            <ShieldCheck className="h-4 w-4 text-emerald-600" />
                          ) : selectedPoint.verified === false ? (
                            <Clock className="h-4 w-4 text-slate-500" />
                          ) : (
                            <AlertTriangle className="h-4 w-4 text-slate-400" />
                          )}
                          <div>
                            <p className={`text-sm font-semibold ${vBadge.color}`}>{vBadge.label}</p>
                            {selectedPoint.verificationDate && (
                              <p className="text-xs text-slate-400">Information checked {selectedPoint.verificationDate}</p>
                            )}
                            <p className="text-xs text-slate-400">{selectedPoint.freshness}</p>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>

                {/* Route relevance */}
                {activeTrip && selectedPoint.routeRelevant && (
                  <div className="mt-4">
                    <h4 className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">Route Relevance</h4>
                    <div className="rounded-xl border border-teal-100 bg-teal-50/50 p-3">
                      <div className="flex items-center gap-2">
                        <Navigation className="h-4 w-4 text-teal-600" />
                        <p className="text-sm font-semibold text-teal-700">
                          {selectedPoint.routeProximity || "Near your route"}
                        </p>
                      </div>
                      <p className="mt-1.5 text-xs text-slate-500">
                        This support point is shown because it is near your selected route.
                      </p>
                    </div>
                  </div>
                )}

                {/* Why this is shown */}
                <div className="mt-6 rounded-xl border border-slate-100 bg-slate-50 p-3">
                  <p className="text-xs text-slate-500">
                    <span className="font-semibold text-slate-600">Why this is shown: </span>
                    {activeTrip && selectedPoint.routeRelevant
                      ? "This support point is near your active route."
                      : `This ${selectedPoint.type.toLowerCase()} is in the area you're exploring.`}
                  </p>
                </div>
              </div>

              {/* Drawer footer */}
              <div className="border-t border-slate-100 px-5 py-4">
                <button
                  onClick={() => handleGetDirections(selectedPoint)}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-sm font-bold text-white shadow-sm transition-all hover:bg-emerald-700 hover:shadow-md"
                >
                  <ExternalLink className="h-4 w-4" />
                  Get Directions
                </button>
                <p className="mt-2 text-center text-[10px] text-slate-400">
                  Opens in an external map application
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
