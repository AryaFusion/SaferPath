import React from "react";
import type { SupportLevel, ContextConfidence } from "../../lib/types";

interface ContextBandProps {
  level: SupportLevel;
  className?: string;
}

export const ContextBand: React.FC<ContextBandProps> = ({
  level,
  className = "",
}) => {
  let accentDot = "bg-stone-500";
  let textColor = "text-stone-800";
  let displayLabel: string = level;

  switch (level) {
    case "STRONG_CONTEXTUAL_SUPPORT":
    case "Stronger Contextual Support":
      accentDot = "bg-teal-600";
      textColor = "text-teal-900";
      displayLabel = "Strong Contextual Support";
      break;
    case "GOOD_CONTEXT":
      accentDot = "bg-emerald-600";
      textColor = "text-emerald-900";
      displayLabel = "Good Context";
      break;
    case "MIXED_CONTEXT":
    case "Mixed Context":
      accentDot = "bg-amber-600";
      textColor = "text-amber-900";
      displayLabel = "Mixed Context";
      break;
    case "CAUTION_SEGMENT":
    case "Caution Segment":
      accentDot = "bg-rose-600";
      textColor = "text-rose-900";
      displayLabel = "Caution Segment";
      break;
    case "LIMITED_DATA":
    case "Limited Data":
    case "Stale Evidence":
      accentDot = "bg-stone-400";
      textColor = "text-stone-700";
      displayLabel =
        level === "Stale Evidence" ? "Stale Evidence" : "Limited Data";
      break;
    case "UNKNOWN":
      accentDot = "bg-gray-400";
      textColor = "text-gray-700";
      displayLabel = "Unknown";
      break;
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs font-medium ${textColor} ${className}`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${accentDot}`}
        aria-hidden="true"
      />
      <span>{displayLabel}</span>
    </span>
  );
};

export const ConfidenceInline: React.FC<{ confidence: ContextConfidence }> = ({
  confidence,
}) => {
  return (
    <span className="text-xs text-[#64748B] font-mono">
      Context availability:{" "}
      <strong className="text-[#172033] font-semibold">{confidence}</strong>
    </span>
  );
};
