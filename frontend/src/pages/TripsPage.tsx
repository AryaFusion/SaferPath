import { useState } from "react";
import AppNavbar from "../components/app/AppNavbar";
import { motion, AnimatePresence } from "framer-motion";
import { Navigation, Clock, ShieldAlert, CheckCircle2, FileText, X, ChevronRight, Activity, Lightbulb, LifeBuoy } from "lucide-react";

// ─── Mock Data ───────────────────────────────────────────────────────────────

type TripStatus = "Completed" | "Cancelled" | "Interrupted" | "Active";

interface Trip {
  id: string;
  origin: string;
  destination: string;
  date: string;
  departureTime: string;
  travelMode: string;
  duration: string;
  status: TripStatus;
  checkInEnabled: boolean;
  selectedRoute: string;
  context: {
    lights: string;
    activity: string;
    help: string;
    reports: string;
    freshness: string;
  };
}

const mockActiveTrip: Trip | null = {
  id: "t_active",
  origin: "Current location",
  destination: "Bandra West",
  date: "Today",
  departureTime: "8:30 PM",
  travelMode: "Walk",
  duration: "32 min",
  status: "Active",
  checkInEnabled: true,
  selectedRoute: "Route 01 (Suburban Street)",
  context: {
    lights: "Good lighting",
    activity: "Active area",
    help: "3 help points",
    reports: "No recent reports",
    freshness: "Recently updated",
  },
};

const mockPastTrips: Trip[] = [
  {
    id: "t_1",
    origin: "Office (BKC)",
    destination: "Andheri Station",
    date: "Yesterday",
    departureTime: "6:15 PM",
    travelMode: "Transit",
    duration: "41 min",
    status: "Completed",
    checkInEnabled: false,
    selectedRoute: "Fastest Route",
    context: {
      lights: "Moderate lighting",
      activity: "High activity",
      help: "4 help points",
      reports: "1 verified report",
      freshness: "Recently updated",
    },
  },
  {
    id: "t_2",
    origin: "Coffee Shop",
    destination: "Home",
    date: "Wed, 17 Sep",
    departureTime: "11:00 PM",
    travelMode: "Walk",
    duration: "18 min",
    status: "Completed",
    checkInEnabled: true,
    selectedRoute: "Main Road",
    context: {
      lights: "Good lighting",
      activity: "Low activity",
      help: "2 help points",
      reports: "No recent reports",
      freshness: "Updated 2h ago",
    },
  },
  {
    id: "t_3",
    origin: "Current location",
    destination: "Juhu Beach",
    date: "Mon, 15 Sep",
    departureTime: "7:00 PM",
    travelMode: "Walk",
    duration: "25 min",
    status: "Cancelled",
    checkInEnabled: true,
    selectedRoute: "Scenic Route",
    context: {
      lights: "Poor lighting",
      activity: "Moderate activity",
      help: "1 help point",
      reports: "2 reports nearby",
      freshness: "Stale data",
    },
  },
  {
    id: "t_4",
    origin: "Current location",
    destination: "Dadar Market",
    date: "Sun, 14 Sep",
    departureTime: "9:30 PM",
    travelMode: "Cab",
    duration: "45 min",
    status: "Interrupted",
    checkInEnabled: true,
    selectedRoute: "Highway Route",
    context: {
      lights: "Good lighting",
      activity: "High activity",
      help: "5 help points",
      reports: "No recent reports",
      freshness: "Recently updated",
    },
  },
];

// ─── Component ───────────────────────────────────────────────────────────────

type FilterType = "All" | "Completed" | "Cancelled";

export default function TripsPage() {
  const [filter, setFilter] = useState<FilterType>("All");
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);

  // Filter logic
  const filteredPastTrips = mockPastTrips.filter((trip) => {
    if (filter === "All") return true;
    return trip.status === filter;
  });

  // Helpers
  const getStatusColor = (status: TripStatus) => {
    switch (status) {
      case "Completed":
        return "bg-slate-100 text-slate-700";
      case "Cancelled":
        return "bg-slate-100 text-slate-500";
      case "Interrupted":
        return "bg-amber-100 text-amber-700";
      case "Active":
        return "bg-emerald-100 text-emerald-700";
      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f9f8] pt-14 pb-20 text-slate-900 md:pb-8">
      <AppNavbar />

      <main className="mx-auto max-w-[1000px] px-4 py-6 sm:px-6 md:py-8 lg:px-10 lg:py-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl lg:text-[26px]">
            Your trips
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            View your current and previous journeys.
          </p>
        </div>

        {/* ─── Active Journey Section ─── */}
        {mockActiveTrip && (
          <section className="mb-10">
            <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-400">
              Active journey
            </h2>
            <div className="rounded-2xl border border-emerald-200 bg-white p-5 shadow-sm ring-1 ring-emerald-600/10 sm:p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-slate-900">{mockActiveTrip.destination}</h3>
                    <span className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">
                      <span className="relative flex h-2 w-2">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
                      </span>
                      Active
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-slate-500">
                    Started at {mockActiveTrip.departureTime} · {mockActiveTrip.travelMode}
                  </p>
                  
                  <div className="mt-3 flex items-center gap-2">
                    <div className="rounded-md bg-emerald-50 px-2 py-1 text-[11px] font-semibold text-emerald-700">
                      {mockActiveTrip.checkInEnabled ? "Check-in enabled" : "Check-in not enabled"}
                    </div>
                    <div className="text-[11px] font-semibold text-slate-500">
                      {mockActiveTrip.selectedRoute}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedTrip(mockActiveTrip)}
                  className="flex items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-emerald-600 px-6 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-emerald-700 hover:shadow-md"
                >
                  View Journey
                  <Navigation className="h-4 w-4" />
                </button>
              </div>
            </div>
          </section>
        )}

        {/* ─── Previous Trips Section ─── */}
        <section>
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">
              Previous trips
            </h2>
            
            {/* Filter Tabs */}
            <div className="flex gap-1 rounded-xl bg-slate-200/50 p-1">
              {(["All", "Completed", "Cancelled"] as FilterType[]).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`rounded-lg px-4 py-1.5 text-xs font-semibold transition-all ${
                    filter === f
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Trips List / Empty State */}
          {filteredPastTrips.length > 0 ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {filteredPastTrips.map((trip) => (
                <button
                  key={trip.id}
                  onClick={() => setSelectedTrip(trip)}
                  className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 text-left transition-colors hover:border-slate-300 hover:bg-slate-50"
                >
                  <div className="flex w-full items-start justify-between gap-4">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">{trip.destination}</h3>
                      <p className="mt-0.5 text-xs text-slate-500">
                        {trip.date} · {trip.departureTime} · {trip.travelMode}
                      </p>
                    </div>
                    <span className={`shrink-0 rounded-md px-2 py-1 text-[10px] font-bold uppercase tracking-wider ${getStatusColor(trip.status)}`}>
                      {trip.status}
                    </span>
                  </div>
                  <div className="flex w-full items-center justify-between text-xs font-semibold text-slate-600">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5 text-slate-400" />
                      {trip.duration}
                    </span>
                    <ChevronRight className="h-4 w-4 text-slate-300 transition-transform group-hover:translate-x-0.5 group-hover:text-slate-500" />
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white py-16 text-center">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                <Navigation className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">No trips found</h3>
              <p className="mx-auto mt-2 max-w-sm text-sm text-slate-500">
                Your planned journeys will appear here once you start travelling with SaferPath.
              </p>
              <a
                href="/home"
                className="mt-6 flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-emerald-700"
              >
                Plan a Journey
              </a>
            </div>
          )}
        </section>
      </main>

      {/* ─── Trip Details Drawer ─── */}
      <AnimatePresence>
        {selectedTrip && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedTrip(null)}
              className="fixed inset-0 z-[60] bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: "100%", opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "100%", opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 right-0 z-[70] flex w-full max-w-md flex-col overflow-y-auto bg-white shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-slate-100 p-5">
                <h3 className="text-base font-bold text-slate-900">Journey details</h3>
                <button
                  onClick={() => setSelectedTrip(null)}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="flex-1 p-5 sm:p-6">
                {/* Header status */}
                <div className="mb-6 flex items-start justify-between gap-4">
                  <div>
                    <h4 className="text-xl font-bold text-slate-900">{selectedTrip.destination}</h4>
                    <p className="mt-1 text-sm text-slate-500">
                      {selectedTrip.date} · {selectedTrip.departureTime}
                    </p>
                  </div>
                  <span className={`shrink-0 rounded-md px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider ${getStatusColor(selectedTrip.status)}`}>
                    {selectedTrip.status}
                  </span>
                </div>

                {/* Core Details Grid */}
                <div className="mb-8 grid grid-cols-2 gap-y-4 gap-x-2 text-sm">
                  <div>
                    <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">Origin</span>
                    <span className="font-medium text-slate-900">{selectedTrip.origin}</span>
                  </div>
                  <div>
                    <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">Travel mode</span>
                    <span className="font-medium text-slate-900">{selectedTrip.travelMode}</span>
                  </div>
                  <div>
                    <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">Route</span>
                    <span className="font-medium text-slate-900">{selectedTrip.selectedRoute}</span>
                  </div>
                  <div>
                    <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">Duration</span>
                    <span className="font-medium text-slate-900">{selectedTrip.duration}</span>
                  </div>
                </div>

                {/* Check-in Status */}
                <div className="mb-8 rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <h5 className="mb-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">Check-in Status</h5>
                  <div className="flex items-center gap-3">
                    {selectedTrip.checkInEnabled ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                    ) : (
                      <ShieldAlert className="h-5 w-5 text-slate-400" />
                    )}
                    <span className="text-sm font-semibold text-slate-900">
                      {selectedTrip.checkInEnabled ? "Check-in enabled for this journey" : "Check-in not enabled"}
                    </span>
                  </div>
                  {selectedTrip.status === "Interrupted" && (
                    <div className="mt-3 rounded-lg bg-amber-100 p-3 text-sm text-amber-800">
                      Journey was interrupted. Deviation flow was triggered.
                    </div>
                  )}
                </div>

                {/* Route Context Block */}
                <div>
                  <h5 className="mb-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">Route Context</h5>
                  <div className="space-y-4 rounded-xl border border-slate-100 bg-white p-1">
                    {[
                      { icon: Lightbulb, label: "Lighting", value: selectedTrip.context.lights },
                      { icon: Activity, label: "Activity", value: selectedTrip.context.activity },
                      { icon: LifeBuoy, label: "Help Nearby", value: selectedTrip.context.help },
                      { icon: FileText, label: "Recent Reports", value: selectedTrip.context.reports },
                      { icon: CheckCircle2, label: "Data Freshness", value: selectedTrip.context.freshness },
                    ].map((item) => (
                      <div key={item.label} className="flex gap-3">
                        <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-50 text-slate-600">
                          <item.icon className="h-3.5 w-3.5" />
                        </div>
                        <div>
                          <h6 className="text-xs font-semibold text-slate-900">{item.label}</h6>
                          <p className="mt-0.5 text-xs text-slate-500">{item.value}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
              
              {/* Bottom Actions for Active Trip only */}
              {selectedTrip.status === "Active" && (
                <div className="border-t border-slate-100 p-5">
                  <button
                    onClick={() => setSelectedTrip(null)}
                    className="w-full rounded-xl bg-emerald-600 py-3 text-sm font-bold text-white shadow-sm transition-all hover:bg-emerald-700 hover:shadow-md"
                  >
                    Back to Active Journey
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
