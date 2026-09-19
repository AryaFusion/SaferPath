import React, { useState } from "react";
import { useSafety } from "../../context/SafetyContext";
import Button from "../../components/common/Button";
import {
  AlertTriangle,
  Phone,
  ShieldCheck,
  Send,
  Loader2,
  CheckCircle2,
  Info,
} from "lucide-react";
import {
  createEmergencyHandoff,
  type EmergencyHandoffResponse,
  ApiError,
} from "../../api/saferpath/client";
import { generateIdempotencyKey } from "../../lib/session";

export const EmergencyView: React.FC = () => {
  const { contacts, activeTrip } = useSafety();

  const [isSubmittingHandoff, setIsSubmittingHandoff] = useState(false);
  const [handoffResult, setHandoffResult] =
    useState<EmergencyHandoffResponse | null>(null);
  const [handoffError, setHandoffError] = useState<string | null>(null);

  // Trigger explicit user-initiated emergency handoff via backend
  const handleInitiateOfficialHandoff = async () => {
    setIsSubmittingHandoff(true);
    setHandoffError(null);
    try {
      const tripId = activeTrip?.id || "standalone-emergency";
      const idemKey = generateIdempotencyKey();
      const res = await createEmergencyHandoff(
        tripId,
        "OFFICIAL_CALL",
        idemKey,
        "1.0",
        "user_explicit_tap",
      );
      setHandoffResult(res);
    } catch (err) {
      if (err instanceof ApiError) {
        setHandoffError(
          `Emergency service registration returned: ${err.message} (${err.code}). Please use direct telephone dialing below.`,
        );
      } else {
        setHandoffError(
          "Could not reach backend emergency handoff. Please dial 112 directly on your phone.",
        );
      }
    } finally {
      setIsSubmittingHandoff(false);
    }
  };

  // Helper to construct SMS link for mobile devices
  const buildSmsHref = (phone: string) => {
    const text = encodeURIComponent(
      `URGENT: I am on my walk${activeTrip ? ` heading to ${activeTrip.destination}` : ""}. Please check in on me.`,
    );
    return `sms:${phone}?body=${text}`;
  };

  return (
    <div className="space-y-5 max-w-4xl mx-auto px-1">
      {/* Title */}
      <div className="space-y-1 pb-3 border-b border-[#DCE3EE]">
        <h1 className="text-2xl font-bold text-[#172033] tracking-tight">
          Emergency assistance
        </h1>
        <p className="text-xs text-[#64748B]">
          Direct dial connection to official public emergency services (112) and
          verified emergency handoff protocols.
        </p>
      </div>

      {/* Primary Emergency Call Banner (Direct Dial 112) */}
      <div className="bg-rose-50 border border-rose-200 rounded-md p-4 space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-md bg-[#C62828] text-white flex items-center justify-center font-bold shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-[#C62828]">
              National Emergency Services (112 / 100)
            </h2>
            <p className="text-xs text-rose-800">
              Immediate telephone connection to official public emergency
              response dispatchers.
            </p>
          </div>
        </div>

        <a href="tel:112" className="inline-block w-full sm:w-auto">
          <Button
            variant="caution"
            size="lg"
            className="w-full flex items-center justify-center gap-2"
          >
            <Phone className="w-4 h-4" />
            <span>Call 112 directly</span>
          </Button>
        </a>
      </div>

      {/* Official Backend Emergency Handoff Integration */}
      <div className="bg-white border border-[#DCE3EE] rounded-md p-5 space-y-3.5">
        <div>
          <span className="text-[10px] font-mono uppercase text-[#2563EB] font-bold block">
            Official System Handoff
          </span>
          <h2 className="text-sm font-bold text-[#172033]">
            Record Emergency Dispatch Request
          </h2>
          <p className="text-xs text-[#64748B] mt-0.5 leading-relaxed">
            Registers an explicit emergency event record with the SaferPath
            backend service (
            <code className="font-mono text-[11px] bg-slate-100 px-1 py-0.5 rounded">
              POST /v1/emergency/handoff
            </code>
            ).
          </p>
        </div>

        {handoffError && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-md flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-[#C62828] shrink-0 mt-0.5" />
            <span>{handoffError}</span>
          </div>
        )}

        {handoffResult && (
          <div className="p-3.5 bg-[#F5F7FB] border border-[#DCE3EE] rounded-md space-y-2 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-[#64748B]">Handoff ID:</span>
              <span className="font-mono font-bold text-[#172033]">
                {handoffResult.handoff_id}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[#64748B]">Current State:</span>
              <span className="font-mono font-semibold text-[#2563EB] px-2 py-0.5 bg-blue-50 border border-blue-200 rounded text-[11px]">
                {handoffResult.status}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[#64748B]">Next Action:</span>
              <span className="text-[#172033] font-medium">
                {handoffResult.next_action}
              </span>
            </div>
            {handoffResult.provider_reference && (
              <div className="flex justify-between items-center">
                <span className="text-[#64748B]">Provider Ref:</span>
                <span className="font-mono text-[#172033]">
                  {handoffResult.provider_reference}
                </span>
              </div>
            )}

            {/* Authoritative State Feedback */}
            <div className="pt-2 border-t border-[#DCE3EE] text-[11px] text-[#64748B]">
              {handoffResult.status === "OFFICIAL_CONFIRMATION" && (
                <div className="text-emerald-800 font-semibold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>
                    Official emergency integration has confirmed your handoff
                    record.
                  </span>
                </div>
              )}
              {handoffResult.status === "UNAVAILABLE" && (
                <div className="text-amber-800">
                  Automated service provider is currently unavailable. Please
                  place a direct telephone call to 112.
                </div>
              )}
              {handoffResult.status === "GUIDANCE_DISPLAYED" && (
                <div className="text-blue-800">
                  Emergency guidance recorded. Proceed with telephone dispatch
                  immediately.
                </div>
              )}
            </div>
          </div>
        )}

        <Button
          variant="secondary"
          size="md"
          onClick={handleInitiateOfficialHandoff}
          disabled={isSubmittingHandoff}
          className="w-full sm:w-auto flex items-center justify-center gap-2"
        >
          {isSubmittingHandoff ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <ShieldCheck className="w-3.5 h-3.5 text-[#2563EB]" />
          )}
          <span>
            {isSubmittingHandoff
              ? "Registering with backend..."
              : "Record official handoff request"}
          </span>
        </Button>
      </div>

      {/* Contact Alerts (Real SMS Links - No Fake Timers) */}
      <div className="bg-white border border-[#DCE3EE] rounded-md p-5 space-y-3">
        <h2 className="text-xs font-bold text-[#172033] font-mono uppercase tracking-wider">
          Message Trusted Contacts ({contacts.length})
        </h2>
        <p className="text-xs text-[#64748B] leading-relaxed">
          Open your device messaging app to compose an urgent status SMS to your
          configured contacts.
        </p>

        {contacts.length === 0 ? (
          <div className="p-3 bg-[#F5F7FB] border border-[#DCE3EE] rounded-md text-xs text-[#64748B]">
            No trusted contacts configured. You can add trusted contacts under
            Saved Places & Contacts.
          </div>
        ) : (
          <div className="space-y-2">
            {contacts.map((c) => (
              <div
                key={c.id}
                className="p-3 bg-[#F5F7FB] border border-[#DCE3EE] rounded-md flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-xs"
              >
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-[#172033]">{c.name}</span>
                    <span className="text-[10px] text-[#64748B] font-mono">
                      ({c.relationship})
                    </span>
                  </div>
                  <span className="text-[11px] text-[#64748B] font-mono">
                    {c.phone}
                  </span>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <a
                    href={`tel:${c.phone}`}
                    className="flex-1 sm:flex-none px-3 py-1.5 bg-white border border-[#DCE3EE] hover:bg-[#EFF6FF] text-[#172033] rounded text-xs font-medium flex items-center justify-center gap-1"
                  >
                    <Phone className="w-3 h-3 text-[#2563EB]" />
                    <span>Call</span>
                  </a>
                  <a
                    href={buildSmsHref(c.phone)}
                    className="flex-1 sm:flex-none px-3 py-1.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded text-xs font-semibold flex items-center justify-center gap-1"
                  >
                    <Send className="w-3 h-3" />
                    <span>Send SMS</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Critical Safety Notice */}
      <div className="p-3.5 rounded-md bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-1">
        <span className="font-bold block flex items-center gap-1.5">
          <Info className="w-4 h-4 text-amber-700 shrink-0" />
          <span>Authoritative Dispatch Boundary</span>
        </span>
        <p className="text-[11px] leading-relaxed">
          SaferPath does not automatically dispatch police or ambulance units.
          We will never state "Help is on the way" without authoritative
          confirmation from certified emergency integrations. For immediate life
          safety, always dial 112.
        </p>
      </div>
    </div>
  );
};

export default EmergencyView;
