import { useState, useRef } from "react";
import AppNavbar from "../components/app/AppNavbar";
import RoutePlanner from "../components/app/RoutePlanner";
import Places from "../components/app/Places";
import RouteResults from "../components/app/RouteResults";
import { motion } from "framer-motion";
import { CheckCircle2, Navigation, MapPin } from "lucide-react";
import { useJourney } from "../context/JourneyContext";

function getTodayLabel() {
  return "Today";
}

export default function HomePage() {
  const { activeTrip, locationTrackingStatus } = useJourney();
  const [showResults, setShowResults] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [toValue, setToValue] = useState("");
  const [fromValue, setFromValue] = useState("");
  const [mode, setMode] = useState("Walk");

  // Lifted travel time — shared between RoutePlanner and RouteResults
  const [travelTime, setTravelTime] = useState(`${getTodayLabel()} · 8:30 PM`);

  // Ref to the planner's "open travel-time picker" function
  const openPickerRef = useRef<(() => void) | null>(null);

  const handlePlanRoute = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setShowResults(true);
    }, 1500);
  };

  const handlePlaceSelect = (place: string) => {
    setToValue(place);
  };

  // Called from RouteResults "Change travel time" button
  const handleChangeTravelTime = () => {
    openPickerRef.current?.();
  };

  return (
    <div className="min-h-screen bg-[#f7f9f8] text-slate-900 pt-14 pb-20 md:pb-8">
      <AppNavbar />

      <main className="mx-auto max-w-[1360px] px-4 py-6 sm:px-6 md:py-8 lg:px-10 lg:py-10">
        {/* ─── Page intro ─── */}
        <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl lg:text-[26px]">
              Plan your journey with more context.
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Understand the conditions around your route before you decide.
            </p>
          </motion.div>

          {/* ─── Active Journey / Data freshness badge ─── */}
          <div className="flex flex-col gap-2 sm:items-end">
            {activeTrip && (
              <div className="hidden items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3.5 py-1.5 text-xs text-emerald-700 shadow-sm sm:flex">
                <Navigation className="h-3.5 w-3.5" />
                <span className="font-bold">Journey active</span>
                <span className="opacity-60">•</span>
                <MapPin className="h-3 w-3" />
                <span className="font-semibold">
                  {locationTrackingStatus === "tracking" ? "Live location on" : "Location " + locationTrackingStatus}
                </span>
              </div>
            )}
            <div className="hidden items-center gap-2 rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-xs text-slate-500 shadow-sm sm:flex">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
              <span>Data freshness</span>
              <span className="font-semibold text-slate-700">Updated 5 min ago</span>
            </div>
          </div>
        </div>

        {/* ─── Route Planner ─── */}
        <RoutePlanner
          onPlanRoute={handlePlanRoute}
          toValue={toValue}
          setToValue={setToValue}
          fromValue={fromValue}
          setFromValue={setFromValue}
          mode={mode}
          setMode={setMode}
          isLoading={isLoading}
          travelTime={travelTime}
          onTravelTimeChange={setTravelTime}
          openPickerRef={openPickerRef}
        />

        {/* ─── Your Places ─── */}
        <Places onSelect={handlePlaceSelect} />

        {/* ─── Route Results ─── */}
        {showResults && (
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="mt-8"
          >
            <RouteResults
              travelTime={travelTime}
              onChangeTravelTime={handleChangeTravelTime}
              origin={fromValue}
              destination={toValue}
              mode={mode}
            />
          </motion.div>
        )}
      </main>
    </div>
  );
}
