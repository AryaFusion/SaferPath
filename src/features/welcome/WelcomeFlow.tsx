import React, { useState } from "react";
import { useSafety } from "../../context/SafetyContext";
import Button from "../../components/common/Button";
import {
  ShieldCheck,
  MapPin,
  Lock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  PhoneCall,
} from "lucide-react";

export const WelcomeFlow: React.FC = () => {
  const { setUserConsented, setTab } = useSafety();

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Purpose-specific consent states (Phase 8 requirement)
  const [consentRoutePlanning, setConsentRoutePlanning] = useState(true);
  const [consentActiveTrip, setConsentActiveTrip] = useState(true);
  const [consentContactSharing, setConsentContactSharing] = useState(true);
  const [consentAnonymousReports, setConsentAnonymousReports] = useState(true);

  // Accessibility / language preferences
  const [preferredLanguage, setPreferredLanguage] = useState<
    "en" | "mr" | "hi"
  >("en");
  const [highContrast, setHighContrast] = useState(() => {
    return localStorage.getItem("saferpath_high_contrast") === "true";
  });

  const handleToggleHighContrast = (checked: boolean) => {
    setHighContrast(checked);
    localStorage.setItem("saferpath_high_contrast", String(checked));
    if (checked) {
      document.documentElement.classList.add("high-contrast");
    } else {
      document.documentElement.classList.remove("high-contrast");
    }
  };

  const handleFinishSetup = () => {
    setUserConsented(true);
    localStorage.setItem(
      "saferpath_consent_record",
      JSON.stringify({
        version: "1.0",
        timestamp: new Date().toISOString(),
        consents: {
          routePlanningLocation: consentRoutePlanning,
          activeTripLocation: consentActiveTrip,
          contactSharing: consentContactSharing,
          anonymousReports: consentAnonymousReports,
        },
      }),
    );
    setTab("/route");
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto px-1 py-4">
      {/* Stepper Header */}
      <div className="border-b border-[#DCE3EE] pb-3 flex justify-between items-center">
        <div>
          <span className="text-[10px] font-mono uppercase text-[#2563EB] font-bold block">
            SaferPath Onboarding & Setup
          </span>
          <h1 className="text-2xl font-bold text-[#172033] tracking-tight">
            {step === 1 && "Welcome & Purpose"}
            {step === 2 && "Distinct Privacy Permissions"}
            {step === 3 && "Language & Accessibility"}
            {step === 4 && "Emergency & Service Region"}
          </h1>
        </div>

        <div className="flex items-center gap-1.5 text-xs font-mono text-[#64748B]">
          <span className="font-bold text-[#2563EB]">Step {step}</span>
          <span>of 4</span>
        </div>
      </div>

      {/* Step 1: Welcome & Mission */}
      {step === 1 && (
        <div className="bg-white border border-[#DCE3EE] rounded-xl p-6 space-y-4">
          <div className="w-12 h-12 rounded-xl bg-[#EFF6FF] border border-[#2563EB]/20 text-[#2563EB] flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>

          <div className="space-y-1.5">
            <h2 className="text-lg font-bold text-[#172033]">
              Contextual mobility, built with civic integrity.
            </h2>
            <p className="text-xs text-[#64748B] leading-relaxed">
              SaferPath helps you evaluate walking options based on factual,
              time-dependent corridor attributes: municipal lighting continuity,
              pedestrian footfall density, open commercial storefronts, and
              verified community physical observations.
            </p>
          </div>

          <div className="p-3.5 bg-amber-50 border border-amber-200 text-amber-900 rounded-md text-xs space-y-1">
            <span className="font-bold flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
              <span>What SaferPath Is and Is Not</span>
            </span>
            <p className="text-[11px] leading-relaxed">
              We do <em>not</em> claim to guarantee safety, grade
              neighbourhoods, or compute predictive danger scores. We state
              physical context facts to give you agency and insight into your
              route options.
            </p>
          </div>

          <div className="p-3 bg-[#F5F7FB] border border-[#DCE3EE] rounded-md text-xs text-[#64748B] flex items-center gap-2">
            <Lock className="w-4 h-4 text-[#2563EB] shrink-0" />
            <span>
              <strong>Authentication note:</strong> User account registration is
              deferred. You can use all core route planning and check-in
              capabilities right now without an account.
            </span>
          </div>

          <div className="pt-2 flex justify-end">
            <Button variant="primary" size="md" onClick={() => setStep(2)}>
              <span>Continue to privacy setup</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 2: Granular Consent & Permission Education (Phase 8) */}
      {step === 2 && (
        <div className="bg-white border border-[#DCE3EE] rounded-xl p-6 space-y-4">
          <div className="space-y-1">
            <h2 className="text-base font-bold text-[#172033]">
              Purpose-Specific Privacy Permissions
            </h2>
            <p className="text-xs text-[#64748B]">
              We distinguish exactly how location data is utilized. We never
              collapse these into a vague "allow all" prompt.
            </p>
          </div>

          <div className="space-y-3 text-xs">
            {/* Permission 1: Route Planning */}
            <label className="flex items-start gap-3 p-3 bg-[#F5F7FB] border border-[#DCE3EE] rounded-md cursor-pointer hover:bg-[#EFF6FF] transition-colors">
              <input
                type="checkbox"
                checked={consentRoutePlanning}
                onChange={(e) => setConsentRoutePlanning(e.target.checked)}
                className="mt-0.5 w-4 h-4 accent-[#2563EB] rounded cursor-pointer shrink-0"
              />
              <div>
                <span className="font-bold text-[#172033] block">
                  Route Planning Location (Client-Side)
                </span>
                <span className="text-[#64748B] text-[11px] leading-snug">
                  Used strictly inside your browser to locate origin/destination
                  landmarks and show nearby help points. Coordinates are not
                  stored on central servers.
                </span>
              </div>
            </label>

            {/* Permission 2: Active Trip Telemetry */}
            <label className="flex items-start gap-3 p-3 bg-[#F5F7FB] border border-[#DCE3EE] rounded-md cursor-pointer hover:bg-[#EFF6FF] transition-colors">
              <input
                type="checkbox"
                checked={consentActiveTrip}
                onChange={(e) => setConsentActiveTrip(e.target.checked)}
                className="mt-0.5 w-4 h-4 accent-[#2563EB] rounded cursor-pointer shrink-0"
              />
              <div>
                <span className="font-bold text-[#172033] block">
                  Active Trip Check-ins & Ephemeral Telemetry
                </span>
                <span className="text-[#64748B] text-[11px] leading-snug">
                  Enables "I'm OK" check-in logs and smart route deviation
                  detection during an active journey. Telemetry is purged within
                  24 hours of trip completion.
                </span>
              </div>
            </label>

            {/* Permission 3: Trusted Contacts */}
            <label className="flex items-start gap-3 p-3 bg-[#F5F7FB] border border-[#DCE3EE] rounded-md cursor-pointer hover:bg-[#EFF6FF] transition-colors">
              <input
                type="checkbox"
                checked={consentContactSharing}
                onChange={(e) => setConsentContactSharing(e.target.checked)}
                className="mt-0.5 w-4 h-4 accent-[#2563EB] rounded cursor-pointer shrink-0"
              />
              <div>
                <span className="font-bold text-[#172033] block">
                  Trusted Contact Sharing Grants
                </span>
                <span className="text-[#64748B] text-[11px] leading-snug">
                  Allows sharing specific scopes (STATUS_ONLY, LOCATION, or
                  TRIP_CONTEXT) with contacts you explicitly designate. Never
                  shared with third parties.
                </span>
              </div>
            </label>

            {/* Permission 4: Anonymous Reports */}
            <label className="flex items-start gap-3 p-3 bg-[#F5F7FB] border border-[#DCE3EE] rounded-md cursor-pointer hover:bg-[#EFF6FF] transition-colors">
              <input
                type="checkbox"
                checked={consentAnonymousReports}
                onChange={(e) => setConsentAnonymousReports(e.target.checked)}
                className="mt-0.5 w-4 h-4 accent-[#2563EB] rounded cursor-pointer shrink-0"
              />
              <div>
                <span className="font-bold text-[#172033] block">
                  Anonymous Physical Community Observations
                </span>
                <span className="text-[#64748B] text-[11px] leading-snug">
                  Permits submitting physical feature observations (dim lamps,
                  pathway obstacles). Reports are stored coarse-area only
                  without precise GPS coordinates.
                </span>
              </div>
            </label>
          </div>

          <div className="flex justify-between items-center pt-2 border-t border-[#DCE3EE]">
            <Button variant="ghost" size="sm" onClick={() => setStep(1)}>
              Back
            </Button>
            <Button variant="primary" size="md" onClick={() => setStep(3)}>
              <span>Next: Accessibility & Language</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: Accessibility & Language Setup */}
      {step === 3 && (
        <div className="bg-white border border-[#DCE3EE] rounded-xl p-6 space-y-4">
          <div className="space-y-1">
            <h2 className="text-base font-bold text-[#172033]">
              Language & Accessibility Preferences
            </h2>
            <p className="text-xs text-[#64748B]">
              Configure high-visibility rendering and preferred display
              language.
            </p>
          </div>

          <div className="space-y-3 text-xs">
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-[#172033] block">
                Preferred Language
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { code: "en", label: "English" },
                  { code: "mr", label: "मराठी (Marathi)" },
                  { code: "hi", label: "हिन्दी (Hindi)" },
                ].map((lang) => (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => setPreferredLanguage(lang.code as any)}
                    className={`p-2.5 rounded-md border text-center font-semibold cursor-pointer transition-colors ${
                      preferredLanguage === lang.code
                        ? "bg-[#EFF6FF] border-[#2563EB] text-[#2563EB]"
                        : "bg-[#F5F7FB] border-[#DCE3EE] text-[#172033] hover:border-[#2563EB]/40"
                    }`}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>
            </div>

            <label className="flex items-center justify-between p-3 bg-[#F5F7FB] border border-[#DCE3EE] rounded-md cursor-pointer hover:bg-[#EFF6FF] transition-colors mt-2">
              <div>
                <span className="font-bold text-[#172033] block">
                  High Contrast Mode
                </span>
                <span className="text-[#64748B] text-[11px]">
                  Boosts border clarity and font weight for outdoor evening
                  visibility.
                </span>
              </div>
              <input
                type="checkbox"
                checked={highContrast}
                onChange={(e) => handleToggleHighContrast(e.target.checked)}
                className="w-4 h-4 accent-[#2563EB] rounded cursor-pointer"
              />
            </label>
          </div>

          <div className="flex justify-between items-center pt-2 border-t border-[#DCE3EE]">
            <Button variant="ghost" size="sm" onClick={() => setStep(2)}>
              Back
            </Button>
            <Button variant="primary" size="md" onClick={() => setStep(4)}>
              <span>Next: Region & Emergency Info</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 4: Emergency Region & Complete */}
      {step === 4 && (
        <div className="bg-white border border-[#DCE3EE] rounded-xl p-6 space-y-4">
          <div className="space-y-1">
            <h2 className="text-base font-bold text-[#172033]">
              Active Pilot Region & Emergency Hotlines
            </h2>
            <p className="text-xs text-[#64748B]">
              SaferPath is currently active in the Mumbai Metropolitan Pilot
              Region.
            </p>
          </div>

          <div className="p-4 bg-[#F5F7FB] border border-[#DCE3EE] rounded-md space-y-2 text-xs">
            <div className="flex items-center gap-2 font-bold text-[#172033]">
              <MapPin className="w-4 h-4 text-[#2563EB]" />
              <span>
                Pilot Coverage: Mumbai (Dadar, Shivaji Park, Matunga corridors)
              </span>
            </div>
            <p className="text-[#64748B] leading-relaxed">
              Real-time pedestrian corridor models are actively calibrated for
              the Dadar–Shivaji Park–Matunga pedestrian corridors. Journeys
              outside this corridor use standard pedestrian network routing with
              default context.
            </p>
          </div>

          {/* Official Emergency Contact Info */}
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-md space-y-2 text-xs">
            <div className="flex items-center gap-2 font-bold text-[#C62828]">
              <PhoneCall className="w-4 h-4" />
              <span>National Emergency Hotline (India): 112 / 100</span>
            </div>
            <p className="text-rose-900 leading-relaxed">
              In any life-threatening or immediate crisis, dial 112 directly.
              SaferPath does not automatically dispatch emergency police or
              ambulance units.
            </p>
          </div>

          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-md text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              Setup complete! You can review or adjust your privacy and contact
              preferences anytime under Settings.
            </span>
          </div>

          <div className="flex justify-between items-center pt-2 border-t border-[#DCE3EE]">
            <Button variant="ghost" size="sm" onClick={() => setStep(3)}>
              Back
            </Button>
            <Button variant="primary" size="md" onClick={handleFinishSetup}>
              <CheckCircle2 className="w-4 h-4 mr-1.5" />
              <span>Complete Setup & Open Planner</span>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default WelcomeFlow;
