import React, { useState } from "react";
import {
  AlertTriangle,
  Loader2,
  Navigation,
  RotateCcw,
  HelpCircle,
} from "lucide-react";
import {
  respondToDeviation,
  type DeviationSummary,
  type DeviationResponseResult,
  ApiError,
} from "../../api/saferpath/client";
import { generateIdempotencyKey } from "../../lib/session";

interface SmartDeviationBannerProps {
  tripId: string;
  deviation: DeviationSummary;
  onResolved: (result: DeviationResponseResult) => void;
}

// Context band display
const CONTEXT_BAND_LABELS: Record<string, { label: string; color: string }> = {
  STRONG_CONTEXTUAL_SUPPORT: {
    label: "Strong contextual support",
    color: "text-emerald-800",
  },
  GOOD_CONTEXT: { label: "Good context", color: "text-emerald-700" },
  MIXED_CONTEXT: { label: "Mixed context", color: "text-amber-700" },
  CAUTION_SEGMENT: { label: "Caution segment", color: "text-amber-800" },
  LIMITED_DATA: { label: "Limited data", color: "text-orange-700" },
  UNKNOWN: { label: "Unknown context", color: "text-gray-600" },
};

/**
 * SmartDeviationBanner — shown when a route deviation is detected during an active trip.
 *
 * CRITICAL RULES:
 * - This is NOT an emergency prompt. Deviation ≠ danger.
 * - User must explicitly choose YES / NO / UNSURE.
 * - Emergency action remains separately user-initiated.
 * - Does NOT say "You are in danger."
 */
export const SmartDeviationBanner: React.FC<SmartDeviationBannerProps> = ({
  tripId,
  deviation,
  onResolved,
}) => {
  const [selectedResponse, setSelectedResponse] = useState<
    "CONFIRM_ROUTE_CHANGE" | "REJECT_ROUTE_CHANGE" | "UNSURE" | null
  >(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [idempotencyKey] = useState(() => generateIdempotencyKey());

  const contextBand = deviation.context_band
    ? CONTEXT_BAND_LABELS[deviation.context_band] || {
        label: deviation.context_band,
        color: "text-gray-600",
      }
    : null;

  const handleResponse = async (
    response: "CONFIRM_ROUTE_CHANGE" | "REJECT_ROUTE_CHANGE" | "UNSURE",
  ) => {
    setSelectedResponse(response);
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const result = await respondToDeviation(tripId, {
        idempotency_key: idempotencyKey,
        response,
        occurred_at: new Date().toISOString(),
      });
      onResolved(result);
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.isNetworkError) {
          setSubmitError(
            "Network error — your response could not be sent. Please try again.",
          );
        } else {
          setSubmitError(
            `Could not record response (${err.code}). Please try again.`,
          );
        }
      } else {
        setSubmitError("An unexpected error occurred. Please try again.");
      }
      setSelectedResponse(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-labelledby="deviation-banner-title"
      className="border border-amber-300 bg-amber-50 rounded-md p-4 space-y-3"
    >
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-md bg-amber-100 border border-amber-300 flex items-center justify-center shrink-0">
          <AlertTriangle className="w-5 h-5 text-amber-700" />
        </div>
        <div>
          <h3
            id="deviation-banner-title"
            className="text-sm font-bold text-amber-900"
          >
            You're no longer following your selected route.
          </h3>
          <p className="text-xs text-amber-800 mt-0.5">
            Detected at{" "}
            {new Date(deviation.detected_at).toLocaleTimeString("en-IN", {
              hour: "2-digit",
              minute: "2-digit",
            })}
            .
          </p>
        </div>
      </div>

      {/* Context band for alternate path (if available) */}
      {contextBand && (
        <div className="p-2.5 bg-white border border-amber-200 rounded text-xs space-y-0.5">
          <span className="text-[#64748B] block text-[10px] font-mono uppercase">
            Alternate path context
          </span>
          <span className={`font-semibold ${contextBand.color}`}>
            {contextBand.label}
          </span>
          {deviation.confidence && (
            <span className="text-[#64748B] text-[10px] block">
              Confidence: {deviation.confidence}
            </span>
          )}
        </div>
      )}

      {/* Question */}
      <div>
        <p className="text-sm font-semibold text-amber-900 mb-2">
          Did you intentionally take a different route?
        </p>

        {submitError && (
          <p className="text-xs text-red-700 mb-2" role="alert">
            {submitError}
          </p>
        )}

        <div className="flex flex-col sm:flex-row gap-2">
          {/* YES */}
          <button
            onClick={() => handleResponse("CONFIRM_ROUTE_CHANGE")}
            disabled={isSubmitting}
            aria-pressed={selectedResponse === "CONFIRM_ROUTE_CHANGE"}
            className={`flex-1 px-3 py-2.5 rounded-md border font-semibold text-xs transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5 ${
              selectedResponse === "CONFIRM_ROUTE_CHANGE"
                ? "bg-[#2563EB] text-white border-[#2563EB]"
                : "bg-white text-[#172033] border-[#DCE3EE] hover:bg-[#EFF6FF] hover:border-[#2563EB]"
            }`}
          >
            {isSubmitting && selectedResponse === "CONFIRM_ROUTE_CHANGE" ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Navigation className="w-3.5 h-3.5" />
            )}
            <span>Yes, I chose this route</span>
          </button>

          {/* NO */}
          <button
            onClick={() => handleResponse("REJECT_ROUTE_CHANGE")}
            disabled={isSubmitting}
            aria-pressed={selectedResponse === "REJECT_ROUTE_CHANGE"}
            className={`flex-1 px-3 py-2.5 rounded-md border font-semibold text-xs transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5 ${
              selectedResponse === "REJECT_ROUTE_CHANGE"
                ? "bg-amber-600 text-white border-amber-600"
                : "bg-white text-amber-800 border-amber-300 hover:bg-amber-50"
            }`}
          >
            {isSubmitting && selectedResponse === "REJECT_ROUTE_CHANGE" ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <RotateCcw className="w-3.5 h-3.5" />
            )}
            <span>No, return to original</span>
          </button>

          {/* UNSURE */}
          <button
            onClick={() => handleResponse("UNSURE")}
            disabled={isSubmitting}
            aria-pressed={selectedResponse === "UNSURE"}
            className={`flex-1 px-3 py-2.5 rounded-md border font-semibold text-xs transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5 ${
              selectedResponse === "UNSURE"
                ? "bg-gray-700 text-white border-gray-700"
                : "bg-white text-[#64748B] border-[#DCE3EE] hover:bg-[#F5F7FB]"
            }`}
          >
            {isSubmitting && selectedResponse === "UNSURE" ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <HelpCircle className="w-3.5 h-3.5" />
            )}
            <span>I'm not sure</span>
          </button>
        </div>
      </div>

      {/* Outcome guidance */}
      {selectedResponse === "REJECT_ROUTE_CHANGE" && !isSubmitting && (
        <div className="p-2.5 bg-white border border-[#DCE3EE] text-xs text-[#64748B] rounded-md">
          Return-to-route directions are available in your route planner. Your
          original route remains available.
        </div>
      )}

      {selectedResponse === "UNSURE" && !isSubmitting && (
        <div className="p-2.5 bg-white border border-[#DCE3EE] text-xs text-[#64748B] rounded-md">
          That's okay. Continue your journey and use the need-help options below
          if you need assistance.
        </div>
      )}

      {/* Important disclaimer */}
      <div className="text-[11px] text-amber-800 border-t border-amber-200 pt-2">
        <strong>Note:</strong> Route deviation is not automatically an
        emergency. If you need assistance, use the Need Help option or call 112
        directly.
      </div>
    </div>
  );
};

export default SmartDeviationBanner;
