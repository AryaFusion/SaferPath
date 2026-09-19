import React from "react";
import { useSafety } from "../../context/SafetyContext";
import Button from "../../components/common/Button";
import {
  Shield,
  MapPin,
  Clock,
  Lock,
  Sun,
  AlertTriangle,
  ArrowRight,
  Settings,
} from "lucide-react";

export const LandingView: React.FC = () => {
  const { setTab } = useSafety();

  return (
    <div className="space-y-10 max-w-5xl mx-auto px-2 py-4">
      {/* Hero Section */}
      <section className="bg-white border border-[#DCE3EE] rounded-xl p-6 sm:p-10 shadow-xs relative overflow-hidden">
        <div className="max-w-2xl space-y-4 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EFF6FF] border border-[#2563EB]/20 text-[#2563EB] text-xs font-semibold">
            <Shield className="w-3.5 h-3.5" />
            <span>Civic Pedestrian Context Intelligence</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#172033] tracking-tight leading-tight">
            A clearer picture of your walking journey before you take a step.
          </h1>

          <p className="text-sm sm:text-base text-[#64748B] leading-relaxed">
            SaferPath evaluates physical corridor attributes—such as municipal
            streetlamp continuity, pedestrian footfall density, open commercial
            storefronts, and verified community observations—to help you compare
            walking routes across different times of evening.
          </p>

          <div className="p-3 bg-amber-50 border border-amber-200 text-amber-900 rounded-md text-xs flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <span className="leading-normal">
              <strong>Essential Principle:</strong> SaferPath provides physical
              and contextual facts to inform your choices. We do <em>not</em>{" "}
              provide subjective "safety scores", calculate crime probabilities,
              or guarantee personal safety.
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Button
              variant="primary"
              size="lg"
              onClick={() => setTab("/route")}
              className="flex items-center gap-2 text-sm px-5 py-2.5"
            >
              <span>Explore route planner</span>
              <ArrowRight className="w-4 h-4" />
            </Button>

            <Button
              variant="outline"
              size="lg"
              onClick={() => setTab("/welcome")}
              className="text-sm px-5 py-2.5"
            >
              <span>Setup & privacy consent</span>
            </Button>
          </div>
        </div>
      </section>

      {/* Core Principles Grid */}
      <section className="space-y-4">
        <div className="border-b border-[#DCE3EE] pb-2">
          <h2 className="text-xs font-bold text-[#172033] uppercase font-mono tracking-wider">
            How Contextual Planning Works
          </h2>
          <p className="text-xs text-[#64748B] mt-0.5">
            Objective physical criteria evaluated transparently without opaque
            algorithms.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          {/* Card 1: Time-Aware Evaluation */}
          <div className="bg-white border border-[#DCE3EE] rounded-lg p-5 space-y-2.5">
            <div className="w-8 h-8 rounded-md bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-[#172033]">
              Time-Aware Routing
            </h3>
            <p className="text-[#64748B] leading-relaxed">
              Street characteristics shift dramatically as the night progresses.
              A vibrant market street at 6:00 PM may become deserted shuttered
              alleys by 11:30 PM. SaferPath models observations specific to your
              departure window.
            </p>
          </div>

          {/* Card 2: Objective Telemetry */}
          <div className="bg-white border border-[#DCE3EE] rounded-lg p-5 space-y-2.5">
            <div className="w-8 h-8 rounded-md bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Sun className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-[#172033]">
              Physical Observations
            </h3>
            <p className="text-[#64748B] leading-relaxed">
              We aggregate factual attributes: functional streetlamps, active
              transit stations, verified 24/7 pharmacies, and obstruction
              reports. No predictive danger scores or fear-based rankings.
            </p>
          </div>

          {/* Card 3: Privacy by Design */}
          <div className="bg-white border border-[#DCE3EE] rounded-lg p-5 space-y-2.5">
            <div className="w-8 h-8 rounded-md bg-blue-50 text-blue-700 flex items-center justify-center">
              <Lock className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-[#172033]">
              Privacy & Zero Tracking
            </h3>
            <p className="text-[#64748B] leading-relaxed">
              Route planning does not require an account. Location checks are
              executed client-side. Journey timelines and check-in logs reside
              in ephemeral session storage and auto-purge after 24 hours.
            </p>
          </div>
        </div>
      </section>

      {/* Contextual Terminology Guide */}
      <section className="bg-white border border-[#DCE3EE] rounded-xl p-6 space-y-4">
        <div className="border-b border-[#DCE3EE] pb-2">
          <h2 className="text-xs font-bold text-[#172033] uppercase font-mono tracking-wider">
            Approved Contextual Terminology
          </h2>
          <p className="text-xs text-[#64748B] mt-0.5">
            SaferPath uses factual contextual support bands rather than
            arbitrary safety grades.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
          <div className="p-3 bg-[#F5F7FB] border border-[#DCE3EE] rounded-md space-y-1">
            <div className="font-bold text-teal-900 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-teal-600" />
              <span>STRONG CONTEXTUAL SUPPORT</span>
            </div>
            <p className="text-[#64748B]">
              Continuous lighting, active footfall, and nearby staffed desks
              verified within recent windows.
            </p>
          </div>

          <div className="p-3 bg-[#F5F7FB] border border-[#DCE3EE] rounded-md space-y-1">
            <div className="font-bold text-emerald-900 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-600" />
              <span>GOOD CONTEXT</span>
            </div>
            <p className="text-[#64748B]">
              Adequate lighting and pedestrian continuity along major municipal
              corridors.
            </p>
          </div>

          <div className="p-3 bg-[#F5F7FB] border border-[#DCE3EE] rounded-md space-y-1">
            <div className="font-bold text-amber-900 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-600" />
              <span>MIXED CONTEXT</span>
            </div>
            <p className="text-[#64748B]">
              Corridor features vary by segment or commercial closing times
              introduce quiet sections.
            </p>
          </div>

          <div className="p-3 bg-[#F5F7FB] border border-[#DCE3EE] rounded-md space-y-1">
            <div className="font-bold text-rose-900 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-600" />
              <span>CAUTION SEGMENT</span>
            </div>
            <p className="text-[#64748B]">
              Specific physical reports logged, such as unlit streetlamps or
              walkway construction barriers.
            </p>
          </div>

          <div className="p-3 bg-[#F5F7FB] border border-[#DCE3EE] rounded-md space-y-1">
            <div className="font-bold text-stone-700 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-stone-400" />
              <span>LIMITED DATA</span>
            </div>
            <p className="text-[#64748B]">
              Sparse telemetry or outdated observations. Absence of data does
              not indicate hazard or safety.
            </p>
          </div>

          <div className="p-3 bg-[#F5F7FB] border border-[#DCE3EE] rounded-md space-y-1">
            <div className="font-bold text-gray-700 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-gray-400" />
              <span>UNKNOWN</span>
            </div>
            <p className="text-[#64748B]">
              No recent physical verification records exist for this segment.
            </p>
          </div>
        </div>
      </section>

      {/* Quick Setup & Preferences Links */}
      <section className="bg-[#EFF6FF]/60 border border-[#DCE3EE] rounded-xl p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs">
        <div>
          <span className="font-bold text-[#172033] block">
            Ready to start planning?
          </span>
          <p className="text-[#64748B] mt-0.5">
            Configure your accessibility preferences, view privacy audit logs,
            or plan your journey.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setTab("/settings")}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Preferences</span>
          </Button>
          <Button variant="primary" size="sm" onClick={() => setTab("/route")}>
            <MapPin className="w-3.5 h-3.5" />
            <span>Launch Planner</span>
          </Button>
        </div>
      </section>
    </div>
  );
};

export default LandingView;
