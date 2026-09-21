import { useId, useState, useRef, useEffect, MutableRefObject } from "react";
import { MapPin, ArrowRightLeft, Clock, Calendar, Navigation, ChevronDown, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// ─── Helpers ────────────────────────────────────────────────────────────────

function getTodayLabel() {
  return "Today";
}

function getTomorrowLabel() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toLocaleDateString("en-IN", { weekday: "short", month: "short", day: "numeric" });
}

const QUICK_TIMES = ["6:00 AM", "9:00 AM", "12:00 PM", "3:00 PM", "6:00 PM", "9:00 PM", "11:30 PM"];

function formatTravelTime(date: string, time: string) {
  return `${date} · ${time}`;
}

// ─── Travel Time Picker ──────────────────────────────────────────────────────

function TravelTimePicker({
  value,
  onChange,
  onClose,
}: {
  value: { date: string; time: string };
  onChange: (v: { date: string; time: string }) => void;
  onClose: () => void;
}) {
  const [localDate, setLocalDate] = useState(value.date);
  const [localTime, setLocalTime] = useState(value.time);
  const dateOptions = [getTodayLabel(), getTomorrowLabel()];

  function confirm() {
    onChange({ date: localDate, time: localTime });
    onClose();
  }

  return (
    <div className="flex flex-col gap-4 p-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-bold text-slate-900">When are you travelling?</h4>
        <button onClick={onClose} className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100">
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Leave now shortcut */}
      <button
        type="button"
        onClick={() => {
          const now = new Date();
          const h = now.getHours();
          const m = now.getMinutes();
          const suffix = h >= 12 ? "PM" : "AM";
          const hour = h > 12 ? h - 12 : h === 0 ? 12 : h;
          onChange({ date: getTodayLabel(), time: `${hour}:${m.toString().padStart(2, "0")} ${suffix}` });
          onClose();
        }}
        className="flex w-full items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-semibold text-emerald-700 transition-colors hover:bg-emerald-100"
      >
        <Clock className="h-4 w-4" />
        Leave now
      </button>

      {/* Date selector */}
      <div>
        <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">Date</p>
        <div className="flex gap-2">
          {dateOptions.map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => setLocalDate(d)}
              className={`flex-1 rounded-xl border py-2.5 text-xs font-semibold transition-all ${
                localDate === d
                  ? "border-emerald-600 bg-emerald-50 text-emerald-700"
                  : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      {/* Quick time chips */}
      <div>
        <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">Expected departure</p>
        <div className="flex flex-wrap gap-2">
          {QUICK_TIMES.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setLocalTime(t)}
              className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-all ${
                localTime === t
                  ? "border-emerald-600 bg-emerald-600 text-white shadow-sm"
                  : "border-slate-200 bg-white text-slate-600 hover:border-emerald-300 hover:text-emerald-700"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Custom time input */}
      <div>
        <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">Or enter a specific time</p>
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Clock className="h-4 w-4 text-slate-400" />
          </div>
          <input
            type="time"
            onChange={(e) => {
              if (!e.target.value) return;
              const [h, m] = e.target.value.split(":").map(Number);
              const suffix = h >= 12 ? "PM" : "AM";
              const hour = h > 12 ? h - 12 : h === 0 ? 12 : h;
              setLocalTime(`${hour}:${m.toString().padStart(2, "0")} ${suffix}`);
            }}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-sm text-slate-700 outline-none focus:border-slate-400 focus:ring-2 focus:ring-emerald-600/10"
          />
        </div>
      </div>

      {/* SaferPath context note */}
      <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 px-3.5 py-3 text-xs text-emerald-700">
        <span className="font-semibold">Same journey. Different time. Different context.</span>
        <span className="ml-1 text-emerald-600">SaferPath adjusts route context based on your expected travel time.</span>
      </div>

      {/* Confirm */}
      <button
        type="button"
        onClick={confirm}
        className="w-full rounded-xl bg-emerald-600 py-3 text-sm font-bold text-white transition-all hover:bg-emerald-700"
      >
        Confirm travel time
      </button>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function RoutePlanner({
  onPlanRoute,
  toValue,
  setToValue,
  fromValue,
  setFromValue,
  mode,
  setMode,
  isLoading = false,
  travelTime: externalTravelTime,
  onTravelTimeChange,
  openPickerRef,
}: {
  onPlanRoute: () => void;
  toValue: string;
  setToValue: (v: string) => void;
  fromValue: string;
  setFromValue: (v: string) => void;
  mode: string;
  setMode: (v: string) => void;
  isLoading?: boolean;
  travelTime?: string;
  onTravelTimeChange?: (value: string) => void;
  openPickerRef?: MutableRefObject<(() => void) | null>;
}) {
  const fromId = useId();
  const toId = useId();

  // Parse external travelTime string back into { date, time }
  function parseExternalTime(s?: string): { date: string; time: string } {
    if (!s) return { date: getTodayLabel(), time: "8:30 PM" };
    const parts = s.split(" · ");
    if (parts.length === 2) return { date: parts[0], time: parts[1] };
    return { date: getTodayLabel(), time: s };
  }

  const parsedExternal = parseExternalTime(externalTravelTime);
  const [travelTime, setTravelTimeLocal] = useState(parsedExternal);
  const [pickerOpen, setPickerOpen] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  // Expose open function via ref so parent can trigger it
  useEffect(() => {
    if (openPickerRef) {
      openPickerRef.current = () => setPickerOpen(true);
    }
  }, [openPickerRef]);

  // Sync external prop changes
  useEffect(() => {
    const parsed = parseExternalTime(externalTravelTime);
    setTravelTimeLocal(parsed);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [externalTravelTime]);

  function handleTimeChange(v: { date: string; time: string }) {
    setTravelTimeLocal(v);
    onTravelTimeChange?.(formatTravelTime(v.date, v.time));
    setPickerOpen(false);
  }

  // Close picker when clicking outside (desktop)
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setPickerOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  function leaveNow() {
    const now = new Date();
    const h = now.getHours();
    const m = now.getMinutes();
    const suffix = h >= 12 ? "PM" : "AM";
    const hour = h > 12 ? h - 12 : h === 0 ? 12 : h;
    const timeStr = `${hour}:${m.toString().padStart(2, "0")} ${suffix}`;
    handleTimeChange({ date: getTodayLabel(), time: timeStr });
  }

  const displayValue = formatTravelTime(travelTime.date, travelTime.time);

  // Spinner SVG
  const Spinner = () => (
    <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  );

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white px-5 py-5 shadow-sm sm:px-6 lg:px-7">
      <h3 className="mb-4 text-sm font-bold text-slate-900 lg:text-[15px]">Plan a journey</h3>

      <form onSubmit={(e) => { e.preventDefault(); onPlanRoute(); }}>

        {/* ─── Desktop: single horizontal row ─── */}
        <div className="hidden items-end gap-3 lg:flex">
          {/* From */}
          <div className="min-w-0 flex-1">
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <div className="h-2 w-2 rounded-full border-[2px] border-emerald-600 bg-white" />
              </div>
              <input
                id={fromId}
                type="text"
                value={fromValue}
                onChange={(e) => setFromValue(e.target.value)}
                placeholder="Current location"
                required
                className="w-full rounded-xl border border-slate-200 bg-slate-50/60 py-2.5 pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-all focus:border-slate-400 focus:bg-white focus:ring-2 focus:ring-emerald-600/10 hover:border-slate-300"
              />
            </div>
          </div>

          {/* Swap */}
          <button
            type="button"
            onClick={() => { setFromValue(toValue); setToValue(fromValue); }}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-400 transition-colors hover:bg-slate-50 hover:text-slate-600"
            aria-label="Swap locations"
          >
            <ArrowRightLeft className="h-4 w-4" />
          </button>

          {/* To */}
          <div className="min-w-0 flex-1">
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <MapPin className="h-4 w-4 text-emerald-600" />
              </div>
              <input
                id={toId}
                type="text"
                value={toValue}
                onChange={(e) => setToValue(e.target.value)}
                placeholder="Where are you going?"
                required
                className="w-full rounded-xl border border-slate-200 bg-slate-50/60 py-2.5 pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-all focus:border-slate-400 focus:bg-white focus:ring-2 focus:ring-emerald-600/10 hover:border-slate-300"
              />
            </div>
          </div>

          {/* Travel mode */}
          <div className="flex shrink-0 gap-1 rounded-xl bg-slate-100/70 p-1">
            {["Walk", "Transit", "Cab"].map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                className={`rounded-lg px-4 py-2 text-xs font-semibold transition-all ${
                  mode === m ? "bg-emerald-600 text-white shadow-sm" : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {m}
              </button>
            ))}
          </div>

          {/* Travel time — desktop popover */}
          <div className="relative shrink-0" ref={pickerRef}>
            <button
              type="button"
              onClick={() => setPickerOpen((o) => !o)}
              className="flex w-[190px] items-center gap-2 rounded-xl border border-slate-200 bg-white py-2.5 pl-3 pr-3 text-sm text-slate-700 transition-colors hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-600/10"
            >
              <Calendar className="h-4 w-4 shrink-0 text-slate-400" />
              <span className="flex-1 truncate text-left">{displayValue}</span>
              <ChevronDown className={`h-4 w-4 shrink-0 text-slate-400 transition-transform ${pickerOpen ? "rotate-180" : ""}`} />
            </button>
            <AnimatePresence>
              {pickerOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 6, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.98 }}
                  transition={{ duration: 0.16 }}
                  className="absolute right-0 top-[calc(100%+8px)] z-30 w-80 rounded-2xl border border-slate-200 bg-white shadow-xl"
                >
                  <TravelTimePicker
                    value={travelTime}
                    onChange={handleTimeChange}
                    onClose={() => setPickerOpen(false)}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Submit */}
          <motion.button
            whileTap={{ scale: 0.97 }}
            type="submit"
            disabled={isLoading}
            className="flex shrink-0 items-center gap-2 rounded-xl bg-emerald-600 px-6 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-emerald-700 hover:shadow-md disabled:opacity-70"
          >
            {isLoading ? (<><Spinner /> Planning...</>) : (<>Plan My Route <Navigation className="h-4 w-4" /></>)}
          </motion.button>
        </div>

        {/* ─── Mobile: stacked layout ─── */}
        <div className="space-y-4 lg:hidden">
          {/* From */}
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
              <div className="h-2 w-2 rounded-full border-[2px] border-emerald-600 bg-white" />
            </div>
            <input
              type="text"
              value={fromValue}
              onChange={(e) => setFromValue(e.target.value)}
              placeholder="Current location"
              required
              className="w-full rounded-xl border border-slate-200 bg-slate-50/60 py-3 pl-10 pr-10 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-all focus:border-slate-400 focus:bg-white focus:ring-2 focus:ring-emerald-600/10 hover:border-slate-300"
            />
            <button
              type="button"
              onClick={() => { setFromValue(toValue); setToValue(fromValue); }}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-slate-400 hover:text-slate-600"
              aria-label="Swap locations"
            >
              <ArrowRightLeft className="h-4 w-4" />
            </button>
          </div>

          {/* To */}
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
              <MapPin className="h-4 w-4 text-emerald-600" />
            </div>
            <input
              type="text"
              value={toValue}
              onChange={(e) => setToValue(e.target.value)}
              placeholder="Where are you going?"
              required
              className="w-full rounded-xl border border-slate-200 bg-slate-50/60 py-3 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-all focus:border-slate-400 focus:bg-white focus:ring-2 focus:ring-emerald-600/10 hover:border-slate-300"
            />
          </div>

          {/* Travel mode */}
          <div>
            <span className="mb-2 block text-[11px] font-bold uppercase tracking-wider text-slate-500">Travel mode</span>
            <div className="flex gap-1.5 rounded-xl bg-slate-100/70 p-1">
              {["Walk", "Transit", "Cab"].map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMode(m)}
                  className={`flex-1 rounded-lg py-2.5 text-xs font-semibold transition-all ${
                    mode === m ? "bg-emerald-600 text-white shadow-sm" : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* Travel time — mobile bottom sheet trigger */}
          <div>
            <span className="mb-2 block text-[11px] font-bold uppercase tracking-wider text-slate-500">
              When are you travelling?
            </span>
            <button
              type="button"
              onClick={() => setPickerOpen(true)}
              className="flex w-full items-center gap-2 rounded-xl border border-slate-200 bg-white py-3 pl-3 pr-3 text-sm text-slate-700 transition-colors hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-600/10"
            >
              <Calendar className="h-4 w-4 shrink-0 text-slate-400" />
              <span className="flex-1 text-left">{displayValue}</span>
              <ChevronDown className="h-4 w-4 shrink-0 text-slate-400" />
            </button>
          </div>

          {/* Submit */}
          <motion.button
            whileTap={{ scale: 0.97 }}
            type="submit"
            disabled={isLoading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-emerald-700 hover:shadow-md disabled:opacity-70"
          >
            {isLoading ? (<><Spinner /> Planning...</>) : (<>Plan My Route <Navigation className="h-4 w-4" /></>)}
          </motion.button>
        </div>
      </form>

      {/* ─── Mobile Bottom Sheet for Travel Time ─── */}
      <AnimatePresence>
        {pickerOpen && (
          <div className="fixed inset-0 z-[80] lg:hidden">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setPickerOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            {/* Sheet */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="absolute inset-x-0 bottom-0 rounded-t-2xl bg-white shadow-xl"
            >
              {/* Drag handle */}
              <div className="flex justify-center pt-3 pb-1">
                <div className="h-1 w-10 rounded-full bg-slate-200" />
              </div>
              <TravelTimePicker
                value={travelTime}
                onChange={handleTimeChange}
                onClose={() => setPickerOpen(false)}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
