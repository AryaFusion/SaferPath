import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Navigation,
  Lightbulb,
  Activity,
  LifeBuoy,
  FileText,
  AlertCircle,
  X,
  ChevronRight,
  ShieldAlert,
  CheckCircle2,
  Info,
  RefreshCw,
} from "lucide-react";
import { useJourney } from "../../context/JourneyContext";

// ─── Mock data keyed by time bucket ─────────────────────────────────────────

type TimeBucket = "morning" | "afternoon" | "evening" | "night" | "latenight";

interface RouteData {
  id: string;
  name: string;
  time: string;
  dist: string;
  lights: string;
  lightsColor: string;
  activity: string;
  activityColor: string;
  help: string;
  reports: string;
  freshness: string;
  tags: string[];
  segment: {
    name: string;
    duration: string;
    lights: string;
    activity: string;
    help: string;
    reports: string;
    freshness: string;
  };
}

function getTimeBucket(travelTime: string): TimeBucket {
  // Parse hour from strings like "Today · 9:00 AM" or "9:00 PM"
  const match = travelTime.match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (!match) return "afternoon";
  let hour = parseInt(match[1]);
  const period = match[3].toUpperCase();
  if (period === "PM" && hour !== 12) hour += 12;
  if (period === "AM" && hour === 12) hour = 0;
  if (hour >= 5 && hour < 12) return "morning";
  if (hour >= 12 && hour < 17) return "afternoon";
  if (hour >= 17 && hour < 21) return "evening";
  if (hour >= 21 && hour < 23) return "night";
  return "latenight";
}

const routesData: Record<TimeBucket, RouteData[]> = {
  morning: [
    {
      id: "r1", name: "Route 01", time: "32 min", dist: "4.2 km",
      lights: "Good lighting", lightsColor: "text-emerald-600",
      activity: "Active area", activityColor: "text-emerald-600",
      help: "3 help points", reports: "No recent reports",
      freshness: "Recently updated",
      tags: ["Recommended"],
      segment: { name: "Suburban Street", duration: "8 min", lights: "Good", activity: "High", help: "1 nearby", reports: "2", freshness: "Recently updated" },
    },
    {
      id: "r2", name: "Route 02", time: "35 min", dist: "4.5 km",
      lights: "Good lighting", lightsColor: "text-emerald-600",
      activity: "Active area", activityColor: "text-emerald-600",
      help: "2 help points", reports: "No recent reports",
      freshness: "Updated 1h ago",
      tags: [],
      segment: { name: "Park Lane", duration: "12 min", lights: "Good", activity: "Moderate", help: "1 nearby", reports: "0", freshness: "Updated 1h ago" },
    },
    {
      id: "r3", name: "Route 03", time: "38 min", dist: "4.8 km",
      lights: "Good lighting", lightsColor: "text-emerald-600",
      activity: "Active area", activityColor: "text-emerald-600",
      help: "4 help points", reports: "No recent reports",
      freshness: "Recently updated",
      tags: [],
      segment: { name: "Commercial Rd", duration: "10 min", lights: "Good", activity: "High", help: "2 nearby", reports: "0", freshness: "Recently updated" },
    },
  ],
  afternoon: [
    {
      id: "r1", name: "Route 01", time: "32 min", dist: "4.2 km",
      lights: "Good lighting", lightsColor: "text-emerald-600",
      activity: "Active area", activityColor: "text-emerald-600",
      help: "3 help points", reports: "No recent reports",
      freshness: "Recently updated",
      tags: ["Recommended"],
      segment: { name: "Suburban Street", duration: "8 min", lights: "Good", activity: "Moderate", help: "1 nearby", reports: "2", freshness: "Recently updated" },
    },
    {
      id: "r2", name: "Route 02", time: "35 min", dist: "4.5 km",
      lights: "Moderate lighting", lightsColor: "text-amber-600",
      activity: "Moderate activity", activityColor: "text-amber-600",
      help: "1 help point", reports: "1 verified report",
      freshness: "Updated 2h ago",
      tags: [],
      segment: { name: "Park Lane", duration: "12 min", lights: "Moderate", activity: "Low", help: "0 nearby", reports: "1", freshness: "Updated 2h ago" },
    },
    {
      id: "r3", name: "Route 03", time: "38 min", dist: "4.8 km",
      lights: "Good lighting", lightsColor: "text-emerald-600",
      activity: "Active area", activityColor: "text-emerald-600",
      help: "4 help points", reports: "No recent reports",
      freshness: "Recently updated",
      tags: [],
      segment: { name: "Commercial Rd", duration: "10 min", lights: "Good", activity: "Active", help: "2 nearby", reports: "0", freshness: "Recently updated" },
    },
  ],
  evening: [
    {
      id: "r1", name: "Route 01", time: "32 min", dist: "4.2 km",
      lights: "Good lighting", lightsColor: "text-emerald-600",
      activity: "Moderate activity", activityColor: "text-amber-600",
      help: "3 help points", reports: "No recent reports",
      freshness: "Recently updated",
      tags: ["Recommended"],
      segment: { name: "Suburban Street", duration: "8 min", lights: "Good", activity: "Low", help: "1 nearby", reports: "2", freshness: "Recently updated" },
    },
    {
      id: "r2", name: "Route 02", time: "35 min", dist: "4.5 km",
      lights: "Poor lighting", lightsColor: "text-red-500",
      activity: "Low activity", activityColor: "text-red-500",
      help: "1 help point", reports: "1 verified report",
      freshness: "Updated 2h ago",
      tags: [],
      segment: { name: "Park Lane", duration: "12 min", lights: "Poor", activity: "Very low", help: "0 nearby", reports: "1", freshness: "Updated 2h ago" },
    },
    {
      id: "r3", name: "Route 03", time: "38 min", dist: "4.8 km",
      lights: "Good lighting", lightsColor: "text-emerald-600",
      activity: "Moderate activity", activityColor: "text-amber-600",
      help: "4 help points", reports: "No recent reports",
      freshness: "Recently updated",
      tags: [],
      segment: { name: "Commercial Rd", duration: "10 min", lights: "Good", activity: "Moderate", help: "2 nearby", reports: "0", freshness: "Recently updated" },
    },
  ],
  night: [
    {
      id: "r1", name: "Route 01", time: "32 min", dist: "4.2 km",
      lights: "Good lighting", lightsColor: "text-emerald-600",
      activity: "Low activity", activityColor: "text-red-500",
      help: "2 help points", reports: "No recent reports",
      freshness: "Recently updated",
      tags: ["Recommended"],
      segment: { name: "Suburban Street", duration: "8 min", lights: "Good", activity: "Very low", help: "1 nearby", reports: "2", freshness: "Recently updated" },
    },
    {
      id: "r2", name: "Route 02", time: "35 min", dist: "4.5 km",
      lights: "Poor lighting", lightsColor: "text-red-500",
      activity: "Very low activity", activityColor: "text-red-500",
      help: "0 help points", reports: "1 verified report",
      freshness: "Stale data",
      tags: ["Limited data"],
      segment: { name: "Park Lane", duration: "12 min", lights: "Poor", activity: "Very low", help: "0 nearby", reports: "1", freshness: "Stale data" },
    },
    {
      id: "r3", name: "Route 03", time: "38 min", dist: "4.8 km",
      lights: "Moderate lighting", lightsColor: "text-amber-600",
      activity: "Low activity", activityColor: "text-red-500",
      help: "3 help points", reports: "No recent reports",
      freshness: "Recently updated",
      tags: [],
      segment: { name: "Commercial Rd", duration: "10 min", lights: "Moderate", activity: "Low", help: "2 nearby", reports: "0", freshness: "Recently updated" },
    },
  ],
  latenight: [
    {
      id: "r1", name: "Route 01", time: "32 min", dist: "4.2 km",
      lights: "Good lighting", lightsColor: "text-emerald-600",
      activity: "Very low activity", activityColor: "text-red-500",
      help: "2 help points (1 closed)", reports: "No recent reports",
      freshness: "Recently updated",
      tags: ["Recommended"],
      segment: { name: "Suburban Street", duration: "8 min", lights: "Good", activity: "Very low", help: "1 nearby", reports: "2", freshness: "Recently updated" },
    },
    {
      id: "r2", name: "Route 02", time: "35 min", dist: "4.5 km",
      lights: "Poor lighting", lightsColor: "text-red-500",
      activity: "Very low activity", activityColor: "text-red-500",
      help: "0 help points", reports: "1 verified report",
      freshness: "Stale data",
      tags: ["Limited data"],
      segment: { name: "Park Lane", duration: "12 min", lights: "Poor", activity: "Very low", help: "0 nearby", reports: "1", freshness: "Stale data" },
    },
    {
      id: "r3", name: "Route 03", time: "38 min", dist: "4.8 km",
      lights: "Moderate lighting", lightsColor: "text-amber-600",
      activity: "Very low activity", activityColor: "text-red-500",
      help: "3 help points", reports: "No recent reports",
      freshness: "Recently updated",
      tags: [],
      segment: { name: "Commercial Rd", duration: "10 min", lights: "Moderate", activity: "Very low", help: "2 nearby", reports: "0", freshness: "Recently updated" },
    },
  ],
};

const routeColors = ["#10b981", "#3b82f6", "#f59e0b"];

// ─── Component ───────────────────────────────────────────────────────────────

export default function RouteResults({
  travelTime,
  onChangeTravelTime,
  origin,
  destination,
  mode,
}: {
  travelTime: string;
  onChangeTravelTime?: () => void;
  origin?: string;
  destination?: string;
  mode?: string;
}) {
  const bucket = getTimeBucket(travelTime);
  const currentRoutes = routesData[bucket];

  const [selectedRoute, setSelectedRoute] = useState<string>("r1");
  const [showDrawer, setShowDrawer] = useState(false);
  const [drawerData, setDrawerData] = useState<RouteData | null>(null);

  // Journey states
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [checkInEnabled, setCheckInEnabled] = useState(false);
  const { activeTrip, startJourney, endJourney, triggerDeviation, isDeviationActive, clearDeviation } = useJourney();
  const isActiveJourney = !!activeTrip;

  const activeRoute = currentRoutes.find((r) => r.id === selectedRoute) ?? currentRoutes[0];

  return (
    <div className="space-y-5">
      {/* ─── Header ─── */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900 lg:text-xl">Your route options</h2>
          <p className="text-xs text-slate-500 sm:text-sm">
            Route context for{" "}
            <span className="font-semibold text-slate-700">{travelTime}</span>
          </p>
        </div>

        {/* Change travel time — subtle action */}
        {onChangeTravelTime && (
          <button
            onClick={onChangeTravelTime}
            className="flex items-center gap-1.5 self-start rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-600 shadow-sm transition-all hover:border-slate-300 hover:text-slate-900 sm:self-auto"
          >
            <RefreshCw className="h-3 w-3" />
            Change travel time
          </button>
        )}
      </div>

      {/* ─── Route cards + Map ─── */}
      <div className="flex flex-col gap-5 xl:flex-row">
        {/* Route cards */}
        <div className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {currentRoutes.map((route, idx) => {
            const isSelected = selectedRoute === route.id;
            return (
              <motion.div
                key={route.id + bucket}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: idx * 0.05 }}
                onClick={() => setSelectedRoute(route.id)}
                className={`cursor-pointer rounded-xl border p-4 transition-all duration-200 ${
                  isSelected
                    ? "border-emerald-600 bg-white shadow-md ring-1 ring-emerald-600/30"
                    : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm"
                }`}
              >
                {/* Tags */}
                <div className="mb-2 flex items-center gap-2">
                  {route.tags.map((tag) => (
                    <span
                      key={tag}
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        tag === "Recommended"
                          ? "bg-emerald-50 text-emerald-700"
                          : tag === "Limited data"
                          ? "bg-amber-50 text-amber-700"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {tag}
                    </span>
                  ))}
                  <div className="ml-auto">
                    <Navigation className="h-3.5 w-3.5 text-slate-300" />
                  </div>
                </div>

                {/* Name + metrics */}
                <h4 className="mb-1 text-sm font-bold text-slate-900">{route.name}</h4>
                <p className="mb-3 text-xs text-slate-500">
                  {route.time} · {route.dist}
                </p>

                {/* Context indicators */}
                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center gap-1.5">
                    <Lightbulb className="h-3.5 w-3.5 text-slate-400" />
                    <span className={`font-medium ${route.lightsColor}`}>{route.lights}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Activity className="h-3.5 w-3.5 text-slate-400" />
                    <span className={`font-medium ${route.activityColor}`}>{route.activity}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <LifeBuoy className="h-3.5 w-3.5 text-slate-400" />
                    <span className="text-slate-600">{route.help}</span>
                  </div>
                </div>

                {/* Why this route */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setDrawerData(route);
                    setShowDrawer(true);
                  }}
                  className="mt-3 flex items-center gap-1 text-[11px] font-bold text-emerald-600 transition-colors hover:text-emerald-700"
                >
                  Why this route? <ChevronRight className="h-3 w-3" />
                </button>
              </motion.div>
            );
          })}
        </div>

        {/* ─── Map placeholder ─── */}
        <div className="relative h-[300px] overflow-hidden rounded-xl border border-slate-200 bg-slate-100 xl:h-auto xl:min-h-[340px] xl:w-[400px]">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "linear-gradient(rgba(15,23,42,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(15,23,42,0.03) 1px, transparent 1px)",
              backgroundSize: "24px 24px",
            }}
          />
          <svg viewBox="0 0 400 300" className="absolute inset-0 h-full w-full" preserveAspectRatio="xMidYMid meet">
            <path d="M60 260 C100 240 130 200 160 170 C190 140 220 130 260 120 C300 110 330 90 350 60" fill="none" stroke={routeColors[0]} strokeWidth={selectedRoute === "r1" ? 4 : 2} strokeLinecap="round" opacity={selectedRoute === "r1" ? 1 : 0.4} />
            <path d="M60 260 C90 230 120 210 170 190 C220 170 270 140 310 100 C330 80 340 70 350 60" fill="none" stroke={routeColors[1]} strokeWidth={selectedRoute === "r2" ? 4 : 2} strokeLinecap="round" opacity={selectedRoute === "r2" ? 1 : 0.4} />
            <path d="M60 260 C80 250 100 250 140 230 C180 210 200 180 230 150 C260 120 300 90 350 60" fill="none" stroke={routeColors[2]} strokeWidth={selectedRoute === "r3" ? 4 : 2} strokeLinecap="round" opacity={selectedRoute === "r3" ? 1 : 0.4} />
            <circle cx="60" cy="260" r="8" fill="white" stroke="#0f172a" strokeWidth="2.5" />
            <circle cx="60" cy="260" r="3.5" fill="#0f172a" />
            <circle cx="350" cy="60" r="8" fill="white" stroke="#10b981" strokeWidth="2.5" />
            <circle cx="350" cy="60" r="3.5" fill="#10b981" />
          </svg>

          {/* Legend */}
          <div className="absolute bottom-3 left-3 flex flex-col gap-1.5 rounded-lg border border-slate-200/80 bg-white/95 px-3 py-2 text-xs shadow-sm backdrop-blur-sm">
            {currentRoutes.map((route, i) => (
              <div key={route.id} className="flex items-center gap-2">
                <div className="h-2 w-4 rounded-full" style={{ backgroundColor: routeColors[i] }} />
                <span className="font-medium text-slate-700">{route.name}</span>
                <span className="text-slate-400">{route.time}</span>
              </div>
            ))}
          </div>

          {/* Limited data badge */}
          {currentRoutes.some((r) => r.tags.includes("Limited data")) && (
            <div className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-lg border border-amber-200/80 bg-amber-50/90 px-2.5 py-1.5 text-[10px] font-medium text-amber-700 shadow-sm backdrop-blur-sm">
              <Info className="h-3 w-3" />
              Limited data in this area
            </div>
          )}
        </div>
      </div>

      {/* ─── Selected route detail bar ─── */}
      <motion.div
        key={activeRoute.id + bucket}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="rounded-xl border border-slate-200/80 bg-white px-5 py-4 shadow-sm"
      >
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6">
            {/* Route ID */}
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-slate-900">{activeRoute.name}</h4>
                <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                  Selected
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Last-mile · {activeRoute.segment.duration} walk
                <span className="ml-1 text-slate-400">· {activeRoute.segment.name}</span>
              </p>
            </div>

            {/* Context metrics */}
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-slate-600">
              <div className="flex items-center gap-1.5">
                <Lightbulb className="h-3.5 w-3.5 text-slate-400" />
                <span className="text-slate-500">Lighting</span>
                <span className={`font-semibold ${activeRoute.lightsColor}`}>{activeRoute.segment.lights}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Activity className="h-3.5 w-3.5 text-slate-400" />
                <span className="text-slate-500">Activity</span>
                <span className={`font-semibold ${activeRoute.activityColor}`}>{activeRoute.segment.activity}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <LifeBuoy className="h-3.5 w-3.5 text-slate-400" />
                <span className="text-slate-500">Help points</span>
                <span className="font-semibold text-emerald-600">{activeRoute.segment.help}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5 text-slate-400" />
                <span className="text-slate-500">Recent reports</span>
                <span className="font-semibold text-slate-700">{activeRoute.segment.reports}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-slate-400" />
                <span className="text-slate-500">Data freshness</span>
                <span className="font-semibold text-emerald-600">{activeRoute.segment.freshness}</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setShowCheckInModal(true)}
            className="flex items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-emerald-600 px-6 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-emerald-700 hover:shadow-md"
          >
            Start Journey
            <Navigation className="h-4 w-4" />
          </button>
        </div>
      </motion.div>

      {/* ─── Disclaimer ─── */}
      <div className="flex items-start gap-2 px-1 text-[11px] text-slate-400">
        <Info className="mt-0.5 h-3 w-3 shrink-0" />
        <p>SaferPath provides context to help you make informed decisions. The user makes the final decision. Stay aware of your surroundings.</p>
      </div>

      {/* ─── Why this route? Drawer ─── */}
      <AnimatePresence>
        {showDrawer && drawerData && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDrawer(false)}
              className="fixed inset-0 z-[60] bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: "100%", opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "100%", opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 right-0 z-[70] w-full max-w-md overflow-y-auto bg-white shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-slate-100 p-5">
                <h3 className="text-base font-bold text-slate-900">Route Evidence</h3>
                <button onClick={() => setShowDrawer(false)} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="p-5 sm:p-6">
                <h4 className="mb-1 text-lg font-bold text-slate-900">{drawerData.name}</h4>
                <p className="mb-6 text-sm text-slate-500">
                  Context for {travelTime} · {drawerData.time} · {drawerData.dist}
                </p>

                <div className="space-y-5">
                  {[
                    { icon: Lightbulb, label: "Lighting", value: drawerData.lights, color: "bg-amber-50 text-amber-600" },
                    { icon: Activity, label: "Activity", value: drawerData.activity, color: "bg-emerald-50 text-emerald-600" },
                    { icon: LifeBuoy, label: "Help Nearby", value: drawerData.help, color: "bg-blue-50 text-blue-600" },
                    { icon: FileText, label: "Recent Reports", value: drawerData.reports, color: "bg-slate-50 text-slate-600" },
                    { icon: CheckCircle2, label: "Data Freshness", value: drawerData.freshness, color: "bg-emerald-50 text-emerald-600" },
                  ].map((item) => (
                    <div key={item.label} className="flex gap-3">
                      <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${item.color}`}>
                        <item.icon className="h-4 w-4" />
                      </div>
                      <div>
                        <h5 className="text-sm font-semibold text-slate-900">{item.label}</h5>
                        <p className="mt-0.5 text-sm text-slate-600">{item.value}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {drawerData.tags.includes("Limited data") && (
                  <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50/50 p-4">
                    <div className="flex gap-3">
                      <AlertCircle className="h-5 w-5 shrink-0 text-amber-600" />
                      <div>
                        <h6 className="text-sm font-bold text-amber-900">Limited data</h6>
                        <p className="mt-1 text-xs leading-relaxed text-amber-700">
                          Some segments have insufficient recent information. Conditions may vary. SaferPath provides context; you make the final decision.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Last-mile section */}
                <div className="mt-6">
                  <h5 className="mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">Last-mile</h5>
                  <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4">
                    <p className="font-semibold text-slate-900">Last-mile · {drawerData.segment.duration} walk</p>
                    <p className="mt-0.5 text-xs text-slate-500">{drawerData.segment.name}</p>
                    <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-600">
                      <div className="flex items-center gap-1.5"><Lightbulb className="h-3 w-3 text-slate-400" /> {drawerData.segment.lights}</div>
                      <div className="flex items-center gap-1.5"><Activity className="h-3 w-3 text-slate-400" /> {drawerData.segment.activity}</div>
                      <div className="flex items-center gap-1.5"><LifeBuoy className="h-3 w-3 text-slate-400" /> {drawerData.segment.help}</div>
                      <div className="flex items-center gap-1.5"><FileText className="h-3 w-3 text-slate-400" /> {drawerData.segment.reports} reports</div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ─── Check-In Modal ─── */}
      <AnimatePresence>
        {showCheckInModal && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[80] bg-slate-900/40 backdrop-blur-sm" />
            <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
              <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 10 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 10 }}
                className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl"
              >
                <h3 className="text-lg font-bold text-slate-900">Start Journey</h3>
                <p className="mt-1 text-sm text-slate-500">
                  {activeRoute.name} · {travelTime}
                </p>
                <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <label className="flex cursor-pointer items-start gap-3">
                    <input 
                      type="checkbox" 
                      checked={checkInEnabled}
                      onChange={(e) => setCheckInEnabled(e.target.checked)}
                      className="mt-0.5 h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-600" 
                    />
                    <div>
                      <span className="block text-sm font-semibold text-slate-900">Enable check-in for this journey</span>
                      <span className="mt-0.5 block text-xs text-slate-500">Optional. SaferPath will prompt you to confirm you've arrived safely.</span>
                    </div>
                  </label>
                </div>
                <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                  <button onClick={() => setShowCheckInModal(false)} className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100">Cancel</button>
                  <button
                    onClick={() => {
                      setShowCheckInModal(false);
                      startJourney({
                        origin: origin || "Current location",
                        destination: destination || "Selected Destination",
                        travelMode: mode || "Walk",
                        departureTime: travelTime,
                        date: "Today",
                        selectedRoute: activeRoute.name,
                        checkInEnabled,
                        eta: activeRoute.time,
                        context: activeRoute.segment,
                      });
                    }}
                    className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-emerald-700"
                  >
                    Confirm & Start <Navigation className="h-4 w-4" />
                  </button>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

      {/* ─── Active Journey Banner ─── */}
      <AnimatePresence>
        {isActiveJourney && (
          <motion.div
            initial={{ y: "-100%" }}
            animate={{ y: 0 }}
            exit={{ y: "-100%" }}
            className="fixed inset-x-0 top-0 z-[100] flex items-center justify-between bg-emerald-700 px-4 py-3 text-white shadow-md md:px-8"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600">
                <Navigation className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-bold">Journey in progress</p>
                <p className="text-xs text-emerald-200">ETA: {activeRoute.time}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => triggerDeviation()} className="rounded-lg bg-emerald-800/50 px-3 py-1.5 text-xs font-semibold hover:bg-emerald-800">
                Trigger Deviation
              </button>
              <button onClick={() => endJourney()} className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold hover:bg-emerald-500">
                End
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Deviation Modal ─── */}
      <AnimatePresence>
        {isDeviationActive && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[110] bg-slate-900/60 backdrop-blur-md" />
            <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl"
              >
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-indigo-50">
                  <ShieldAlert className="h-6 w-6 text-indigo-600" />
                </div>
                <h3 className="text-center text-lg font-bold text-slate-900">You're outside your planned route.</h3>
                <p className="mt-2 text-center text-sm text-slate-500">Are you okay?</p>
                <div className="mt-6 flex flex-col gap-3">
                  <button onClick={() => clearDeviation()} className="w-full rounded-xl bg-slate-100 py-3 text-sm font-semibold text-slate-800 hover:bg-slate-200">I'm okay</button>
                  <button onClick={() => clearDeviation()} className="w-full rounded-xl bg-red-600 py-3 text-sm font-bold text-white shadow-sm hover:bg-red-700 hover:shadow-md">I need help</button>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
