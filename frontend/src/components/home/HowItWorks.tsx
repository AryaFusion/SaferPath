import { motion } from "framer-motion";
import {
  Search,
  Clock,
  Footprints,
  Lightbulb,
  Activity,
  FileText,
  LifeBuoy,
  CheckCircle2,
} from "lucide-react";
import type { ReactNode } from "react";

interface Step {
  number: string;
  title: string;
  description: string;
  tint: string;
  mockup: ReactNode;
  mobileVisualFirst?: boolean;
}

function CardChrome() {
  return (
    <div className="mb-2 sm:mb-2.5 lg:mb-3 flex gap-1.5" aria-hidden="true">
      <span className="h-1.5 w-1.5 rounded-full bg-slate-200 lg:h-2 lg:w-2" />
      <span className="h-1.5 w-1.5 rounded-full bg-slate-200 lg:h-2 lg:w-2" />
      <span className="h-1.5 w-1.5 rounded-full bg-slate-200 lg:h-2 lg:w-2" />
    </div>
  );
}

function PlanMockup() {
  return (
    <div className="relative rounded-xl border border-slate-100 bg-white p-3.5 shadow-sm sm:p-4 sm:rounded-2xl lg:p-6">
      <CardChrome />
      <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400 sm:text-xs lg:text-sm">
        Route search
      </p>
      <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50/60 px-3 py-2 text-xs text-slate-700 sm:text-sm lg:py-2.5">
        <Search className="h-3.5 w-3.5 shrink-0 text-slate-400 sm:h-4 sm:w-4" aria-hidden="true" />
        <span className="truncate font-medium">Central Station → North Park</span>
      </div>
      <div className="mt-2.5 grid grid-cols-2 gap-2 sm:gap-2.5">
        <div className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50/60 px-2.5 py-2 text-xs text-slate-700 sm:text-sm">
          <Clock className="h-3.5 w-3.5 shrink-0 text-slate-400 sm:h-4 sm:w-4" aria-hidden="true" />
          <span className="whitespace-nowrap font-medium">6:00 PM</span>
        </div>
        <div className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50/60 px-2.5 py-2 text-xs text-slate-700 sm:text-sm">
          <Footprints className="h-3.5 w-3.5 shrink-0 text-slate-400 sm:h-4 sm:w-4" aria-hidden="true" />
          <span className="whitespace-nowrap font-medium">Walking</span>
        </div>
      </div>
      <div className="mt-2.5 rounded-lg bg-slate-900 py-2 text-center text-xs font-semibold text-white shadow-xs sm:mt-3 sm:py-2.5 sm:text-sm">
        Search Route Context
      </div>
    </div>
  );
}

function UnderstandMockup() {
  const rows = [
    { icon: Lightbulb, label: "Lighting", value: "Continuous", bar: "w-4/5 bg-amber-500" },
    { icon: Activity, label: "Activity", value: "High Footfall", bar: "w-3/5 bg-emerald-500" },
    { icon: FileText, label: "Reports", value: "Verified", bar: "w-2/5 bg-blue-500" },
    { icon: LifeBuoy, label: "Help Points", value: "3 Active", bar: "w-3/4 bg-indigo-500" },
  ];
  return (
    <div className="relative overflow-hidden rounded-xl border border-slate-100 bg-white p-3.5 shadow-sm sm:p-4 sm:rounded-2xl lg:p-6">
      <CardChrome />
      <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400 sm:text-xs lg:text-sm">
        Corridor telemetry
      </p>
      <div className="space-y-2 sm:space-y-2.5 lg:space-y-3">
        {rows.map(({ icon: Icon, label, value, bar }) => (
          <div key={label} className="space-y-1">
            <div className="flex items-center justify-between text-xs sm:text-sm">
              <span className="flex items-center gap-1.5 font-medium text-slate-700 whitespace-nowrap">
                <Icon className="h-3.5 w-3.5 shrink-0 text-slate-400 sm:h-4 sm:w-4" aria-hidden="true" />
                {label}
              </span>
              <span className="text-[10px] font-semibold text-slate-500 sm:text-xs whitespace-nowrap">
                {value}
              </span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100 lg:h-2">
              <span className={`block h-full rounded-full ${bar}`} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CompareMockup() {
  // Only the two primary routes matching the hero section: 6:00 PM and 11:30 PM
  const times = [
    {
      label: "6:00 PM",
      tag: "Active",
      desc: "Active commercial footfall • Good daylight",
      active: true,
    },
    {
      label: "11:30 PM",
      tag: "Night Context",
      desc: "Quiet corridor • Verified 24/7 help points",
      active: false,
    },
  ];
  return (
    <div className="relative overflow-hidden rounded-xl border border-slate-100 bg-white p-3.5 shadow-sm sm:p-4 sm:rounded-2xl lg:p-6">
      <CardChrome />
      <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400 sm:text-xs lg:text-sm">
        Time context comparison
      </p>
      <div className="space-y-2 sm:space-y-2.5">
        {times.map(({ label, tag, desc, active }) => (
          <div
            key={label}
            className={`rounded-lg sm:rounded-xl border p-2.5 sm:p-3 transition-all ${
              active
                ? "border-slate-900 bg-slate-900 text-white shadow-xs"
                : "border-slate-200 bg-slate-50/50 text-slate-700 hover:border-slate-300"
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="whitespace-nowrap text-xs font-bold sm:text-sm lg:text-base">
                {label}
              </span>
              <span
                className={`rounded-full px-2 py-0.5 text-[9px] font-semibold sm:text-[10px] whitespace-nowrap ${
                  active
                    ? "bg-emerald-400/20 text-emerald-300"
                    : "bg-slate-200/80 text-slate-600"
                }`}
              >
                {tag}
              </span>
            </div>
            <p
              className={`mt-1 text-[10px] sm:text-xs lg:text-sm leading-relaxed ${
                active ? "text-slate-300" : "text-slate-500"
              }`}
            >
              {desc}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function DecideMockup() {
  return (
    <div className="relative overflow-hidden rounded-xl border border-slate-100 bg-white p-3.5 shadow-sm sm:p-4 sm:rounded-2xl lg:p-6">
      <CardChrome />
      <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400 sm:text-xs lg:text-sm">
        Route choice confirmation
      </p>
      <div className="flex items-center gap-2.5 rounded-lg border border-emerald-200/80 bg-emerald-50 p-2.5 sm:p-3">
        <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 sm:h-5 sm:w-5" aria-hidden="true" />
        <div>
          <p className="text-xs font-bold text-emerald-950 sm:text-sm">
            Optimal Context
          </p>
          <p className="text-[10px] text-emerald-700 sm:text-xs">
            100% continuous lighting verified
          </p>
        </div>
      </div>
      <div className="mt-3 space-y-1.5 text-xs text-slate-600 sm:text-sm">
        <div className="flex justify-between">
          <span className="text-slate-400">Estimated Walk:</span>
          <span className="font-semibold text-slate-800">18 min</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">Context Support:</span>
          <span className="font-semibold text-emerald-600">Strong Context</span>
        </div>
      </div>
      <div className="mt-3 rounded-lg bg-slate-900 py-2 text-center text-xs font-semibold text-white shadow-xs sm:py-2.5 sm:text-sm">
        Confirm Route
      </div>
    </div>
  );
}

const steps: Step[] = [
  {
    number: "01",
    title: "Plan",
    description: "Enter your destination, departure time, and walking preferences to initiate context evaluation.",
    tint: "bg-emerald-50/70",
    mockup: <PlanMockup />,
    mobileVisualFirst: false,
  },
  {
    number: "02",
    title: "Understand",
    description: "Inspect physical attributes: municipal streetlamp status, footfall trends, and active help desks.",
    tint: "bg-violet-50/70",
    mockup: <UnderstandMockup />,
    mobileVisualFirst: false, // Mobile: text first, then visual
  },
  {
    number: "03",
    title: "Compare",
    description: "See how corridor conditions evolve between early evening (6:00 PM) and late night (11:30 PM).",
    tint: "bg-sky-50/70",
    mockup: <CompareMockup />,
    mobileVisualFirst: false, // Mobile: text first, then visual
  },
  {
    number: "04",
    title: "Decide",
    description: "Choose the route that aligns best with your comfort, lighting continuity, and schedule.",
    tint: "bg-emerald-50/70",
    mockup: <DecideMockup />,
    mobileVisualFirst: false, // Mobile: text first, then visual
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-white">
      <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-28 lg:px-12 lg:py-36">
        {/* Section Header */}
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700 sm:text-sm">
            How it works
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
            Your journey, step by step.
          </h2>
          <p className="mt-4 text-sm text-slate-500 sm:text-base lg:text-lg">
            From initial planning to choosing a route with full physical context.
          </p>
        </div>

        {/* Timeline Flow Container */}
        <div className="relative mx-auto mt-14 max-w-md sm:mt-18 md:max-w-3xl lg:mt-24 lg:max-w-5xl xl:max-w-[1200px]">
          {/* Central Vertical Timeline Line (Desktop / Laptop) */}
          <div
            className="absolute left-1/2 top-0 bottom-0 hidden w-px -translate-x-1/2 bg-slate-200 md:block"
            aria-hidden="true"
          />

          <ol className="space-y-20 sm:space-y-16 md:space-y-20 lg:space-y-24 xl:space-y-28">
            {steps.map((step, index) => {
              const mockupLeft = index % 2 === 0;

              const mockupBlock = (
                <div
                  className={`w-full rounded-2xl p-2.5 transition-all duration-300 sm:p-3.5 sm:rounded-3xl lg:p-5 xl:p-6 ${step.tint} hover:shadow-md`}
                >
                  {step.mockup}
                </div>
              );

              const textBlock = (
                <div className="w-full space-y-1.5 sm:space-y-2 lg:space-y-3">
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-600 sm:text-xs lg:text-sm">
                    Step {step.number}
                  </span>
                  <h3 className="text-lg font-bold text-slate-900 leading-snug sm:text-xl lg:text-2xl xl:text-3xl">
                    {step.title}
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed sm:text-sm lg:text-base xl:text-lg max-w-md">
                    {step.description}
                  </p>
                </div>
              );

              return (
                <li
                  key={step.number}
                  className="relative flex flex-col md:grid md:grid-cols-2 items-center gap-5 sm:gap-6 md:gap-8 lg:gap-14 xl:gap-20"
                >
                  {/* Central Node (Desktop / Laptop) */}
                  <div
                    className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 hidden h-3.5 w-3.5 rounded-full border-2 border-white bg-slate-900 shadow-sm md:block lg:h-4 lg:w-4"
                    aria-hidden="true"
                  />

                  {/* Left block on desktop */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-60px" }}
                    transition={{
                      duration: 0.5,
                      delay: index * 0.05,
                      ease: "easeOut",
                    }}
                    className={`w-full md:col-start-1 md:pr-4 lg:pr-8 ${
                      step.mobileVisualFirst
                        ? mockupLeft
                          ? "order-1"
                          : "order-2"
                        : mockupLeft
                        ? "order-2"
                        : "order-1"
                    } md:order-none`}
                  >
                    {mockupLeft ? mockupBlock : textBlock}
                  </motion.div>

                  {/* Right block on desktop */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-60px" }}
                    transition={{
                      duration: 0.5,
                      delay: index * 0.05 + 0.08,
                      ease: "easeOut",
                    }}
                    className={`w-full md:col-start-2 md:pl-4 lg:pl-8 ${
                      step.mobileVisualFirst
                        ? mockupLeft
                          ? "order-2"
                          : "order-1"
                        : mockupLeft
                        ? "order-1"
                        : "order-2"
                    } md:order-none`}
                  >
                    {mockupLeft ? textBlock : mockupBlock}
                  </motion.div>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}