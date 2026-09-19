import React, { useState } from "react";
import { useSafety } from "../../context/SafetyContext";
import Button from "../../components/common/Button";
import {
  Sun,
  AlertCircle,
  Store,
  Train,
  AccessibilityIcon,
  MapPin,
  CheckCircle2,
  Clock,
  Check,
  RotateCcw,
  Navigation,
  Info,
  Loader2,
  WifiOff,
  RefreshCw,
} from "lucide-react";
import {
  createReport,
  getReport,
  type ReportCategory,
  type CoarseArea,
  type PublicationIntent,
  ApiError,
} from "../../api/saferpath/client";
import { generateIdempotencyKey } from "../../lib/session";
import EvidenceManager from "./EvidenceManager";

// ---------------------------------------------------------------------------
// Category mapping: UX label → backend enum value
// ---------------------------------------------------------------------------
const CATEGORY_MAP: {
  val: ReportCategory;
  title: string;
  desc: string;
  icon: React.ReactNode;
}[] = [
  {
    val: "LIGHTING",
    title: "Lighting issue",
    desc: "Report a streetlight that is unlit, dim, or non-functional.",
    icon: <Sun className="w-4 h-4 text-[#2563EB] shrink-0" />,
  },
  {
    val: "PEDESTRIAN_INFRASTRUCTURE",
    title: "Pavement obstacle / infrastructure",
    desc: "Report an obstruction, construction hazard, or damaged pathway.",
    icon: <AlertCircle className="w-4 h-4 text-[#B45309] shrink-0" />,
  },
  {
    val: "ACTIVITY_CONTEXT",
    title: "Open commercial front / activity",
    desc: "Report an active commercial storefront, staffed desk, or visible footfall.",
    icon: <Store className="w-4 h-4 text-[#0F766E] shrink-0" />,
  },
  {
    val: "TRANSIT_CONTEXT",
    title: "Transit context observation",
    desc: "Report a transit-related physical observation (station desk, bus stop condition).",
    icon: <Train className="w-4 h-4 text-[#2563EB] shrink-0" />,
  },
  {
    val: "ACCESSIBILITY",
    title: "Accessibility issue",
    desc: "Report a physical feature affecting accessibility (ramp, tactile path, etc.).",
    icon: <AccessibilityIcon className="w-4 h-4 text-[#64748B] shrink-0" />,
  },
];

const CATEGORY_LABEL: Record<ReportCategory, string> = {
  LIGHTING: "Lighting issue",
  PEDESTRIAN_INFRASTRUCTURE: "Pavement / infrastructure",
  ACTIVITY_CONTEXT: "Activity context",
  TRANSIT_CONTEXT: "Transit context",
  ACCESSIBILITY: "Accessibility issue",
};

const COARSE_AREA_OPTIONS: { val: CoarseArea; label: string }[] = [
  { val: "MUMBAI_SOUTH", label: "Mumbai South (Colaba, Fort, Nariman Point)" },
  { val: "MUMBAI_CENTRAL", label: "Mumbai Central (Dadar, Parel, Worli)" },
  { val: "MUMBAI_NORTH", label: "Mumbai North (Andheri, Goregaon, Borivali)" },
  { val: "MUMBAI_EAST", label: "Mumbai East (Kurla, Ghatkopar, Mulund)" },
  { val: "MUMBAI_WEST", label: "Mumbai West (Bandra, Santacruz, Malad)" },
];

const TIME_OPTIONS = [
  "Observed just now",
  "Within the last 30 minutes",
  "Within the last 1 hour",
  "Observed earlier today",
];

// ---------------------------------------------------------------------------
// Moderation status display labels
// ---------------------------------------------------------------------------
const MODERATION_LABELS: Record<string, { label: string; color: string }> = {
  PENDING: {
    label: "Pending review",
    color: "text-amber-700 bg-amber-50 border-amber-200",
  },
  ACCEPTED_PUBLIC_CONTEXT: {
    label: "Accepted — public context",
    color: "text-emerald-800 bg-emerald-50 border-emerald-200",
  },
  ACCEPTED_RESTRICTED_EVIDENCE: {
    label: "Accepted — restricted evidence",
    color: "text-blue-800 bg-blue-50 border-blue-200",
  },
  MERGED: {
    label: "Merged with existing data",
    color: "text-blue-700 bg-blue-50 border-blue-200",
  },
  REJECTED: {
    label: "Rejected",
    color: "text-red-700 bg-red-50 border-red-200",
  },
  CORRECTED: {
    label: "Corrected",
    color: "text-yellow-800 bg-yellow-50 border-yellow-200",
  },
  EXPIRED: {
    label: "Expired",
    color: "text-gray-600 bg-gray-50 border-gray-200",
  },
  ESCALATED: {
    label: "Escalated for review",
    color: "text-purple-700 bg-purple-50 border-purple-200",
  },
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export const ReportStepper: React.FC = () => {
  const { reports, setTab } = useSafety();

  // Form state
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [category, setCategory] = useState<ReportCategory>("LIGHTING");
  const [coarseArea, setCoarseArea] = useState<CoarseArea>("MUMBAI_CENTRAL");
  const [publicationIntent, setPublicationIntent] = useState<PublicationIntent>(
    "RESTRICTED_EVIDENCE",
  );
  const [timeObserved, setTimeObserved] = useState("Observed just now");
  const [validationError, setValidationError] = useState<string | null>(null);

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submittedReport, setSubmittedReport] = useState<{
    report_id: string;
    reference: string;
    moderation_status: string;
    category: ReportCategory;
    expires_at: string;
    reused: boolean;
  } | null>(null);
  const [idempotencyKey] = useState(() => generateIdempotencyKey());

  // Report status polling state
  const [isPollingStatus, setIsPollingStatus] = useState(false);
  const [polledStatus, setPolledStatus] = useState<string | null>(null);
  const [statusPollError, setStatusPollError] = useState<string | null>(null);

  const handleNext = async () => {
    setValidationError(null);

    if (step === 1) {
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    } else if (step === 3) {
      setStep(4);
    } else if (step === 4) {
      // Submit to real backend
      setIsSubmitting(true);
      setSubmitError(null);

      // Build observed_at: map text selection to an approximate ISO timestamp
      const observedAt = buildObservedAt(timeObserved);

      try {
        const response = await createReport({
          idempotency_key: idempotencyKey,
          category,
          observed_at: observedAt,
          coarse_area: coarseArea,
          publication_intent: publicationIntent,
        });

        setSubmittedReport({
          report_id: response.report_id,
          reference: response.reference,
          moderation_status: response.moderation_status,
          category: response.category,
          expires_at: response.expires_at,
          reused: response.reused,
        });
        setStep(5);
      } catch (err) {
        if (err instanceof ApiError) {
          if (err.isNetworkError) {
            setSubmitError(
              "Network error — please check your connection and try again.",
            );
          } else if (err.isValidation) {
            setSubmitError(
              "The report details are not valid for this area. Please review your selections.",
            );
          } else if (err.isConflict) {
            // Idempotency: we already submitted this — treat as success
            setStep(5);
          } else if (err.isUnavailable) {
            setSubmitError(
              "The reporting service is temporarily unavailable. Please try again in a few minutes.",
            );
          } else {
            setSubmitError(`Submission error (${err.code}). Please try again.`);
          }
        } else {
          setSubmitError("An unexpected error occurred. Please try again.");
        }
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handlePollStatus = async () => {
    if (!submittedReport) return;
    setIsPollingStatus(true);
    setStatusPollError(null);
    try {
      const response = await getReport(submittedReport.report_id);
      setPolledStatus(response.moderation_status);
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.isNetworkError) {
          setStatusPollError("Network error — unable to check status.");
        } else {
          setStatusPollError("Status check failed. Please try again.");
        }
      } else {
        setStatusPollError("Unexpected error checking status.");
      }
    } finally {
      setIsPollingStatus(false);
    }
  };

  const handleResetForm = () => {
    setStep(1);
    setCategory("LIGHTING");
    setCoarseArea("MUMBAI_CENTRAL");
    setPublicationIntent("RESTRICTED_EVIDENCE");
    setTimeObserved("Observed just now");
    setValidationError(null);
    setSubmitError(null);
    setSubmittedReport(null);
    setPolledStatus(null);
    setStatusPollError(null);
  };

  const currentStatus =
    polledStatus || submittedReport?.moderation_status || "PENDING";
  const statusStyle = MODERATION_LABELS[currentStatus] || {
    label: currentStatus,
    color: "text-gray-600 bg-gray-50 border-gray-200",
  };

  return (
    <div className="space-y-4 max-w-4xl mx-auto px-1">
      {/* Title */}
      <div className="space-y-1 pb-3 border-b border-[#DCE3EE]">
        <h1 className="text-2xl font-bold text-[#172033] tracking-tight">
          Submit a physical report
        </h1>
        <p className="text-xs text-[#64748B] max-w-xl">
          Report a physical feature you have directly observed along a walking
          route. Submissions are moderated before publication and do not include
          precise coordinates.
        </p>
      </div>

      {/* Step Progress Indicator */}
      {step < 5 && (
        <div
          className="flex items-center gap-1 text-[11px] font-mono text-[#64748B]"
          aria-label="Step progress"
        >
          {[1, 2, 3, 4].map((n) => (
            <React.Fragment key={n}>
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px] border ${
                  step > n
                    ? "bg-[#2563EB] text-white border-[#2563EB]"
                    : step === n
                      ? "bg-white text-[#2563EB] border-[#2563EB]"
                      : "bg-white text-[#64748B] border-[#DCE3EE]"
                }`}
              >
                {step > n ? <Check className="w-3 h-3" /> : n}
              </div>
              {n < 4 && (
                <div
                  className={`flex-1 h-px ${step > n ? "bg-[#2563EB]" : "bg-[#DCE3EE]"}`}
                />
              )}
            </React.Fragment>
          ))}
          <span className="ml-2">
            Step {step} of 4 —{" "}
            {step === 1
              ? "Category"
              : step === 2
                ? "Area"
                : step === 3
                  ? "Time & Intent"
                  : "Review"}
          </span>
        </div>
      )}

      {step < 5 && (
        <div className="bg-white border border-[#DCE3EE] rounded-md p-4 sm:p-6 space-y-4">
          {/* Validation error */}
          {validationError && (
            <div
              role="alert"
              className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-md flex items-center gap-2"
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{validationError}</span>
            </div>
          )}

          {/* Submit error */}
          {submitError && (
            <div
              role="alert"
              className="p-3 bg-amber-50 border border-amber-200 text-amber-900 text-xs rounded-md space-y-2"
            >
              <div className="flex items-center gap-2 font-bold">
                <WifiOff className="w-4 h-4 shrink-0" />
                <span>Submission failed</span>
              </div>
              <p>{submitError}</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSubmitError(null)}
              >
                <RefreshCw className="w-3 h-3" />
                <span>Retry</span>
              </Button>
            </div>
          )}

          {/* ── STEP 1: Category ────────────────────────────────────────── */}
          {step === 1 && (
            <div className="space-y-3">
              <div className="border-b border-[#DCE3EE] pb-2">
                <h2 className="text-xs font-bold text-[#172033] uppercase font-mono tracking-wider">
                  Step 1: Select observation category
                </h2>
                <p className="text-[11px] text-[#64748B] mt-0.5">
                  Choose the category that best describes the physical feature
                  you observed.
                </p>
              </div>

              <fieldset>
                <legend className="sr-only">Report category</legend>
                <div className="space-y-2">
                  {CATEGORY_MAP.map((cat) => (
                    <label
                      key={cat.val}
                      className={`flex items-start gap-3 p-3 rounded-md border cursor-pointer transition-colors ${
                        category === cat.val
                          ? "border-[#2563EB] bg-[#EFF6FF]"
                          : "border-[#DCE3EE] bg-white hover:bg-[#F5F7FB]"
                      }`}
                    >
                      <input
                        type="radio"
                        name="category"
                        value={cat.val}
                        checked={category === cat.val}
                        onChange={() => setCategory(cat.val)}
                        className="sr-only"
                      />
                      <div className="mt-0.5 shrink-0">{cat.icon}</div>
                      <div>
                        <span className="font-semibold text-xs text-[#172033] block">
                          {cat.title}
                        </span>
                        <span className="text-[11px] text-[#64748B]">
                          {cat.desc}
                        </span>
                      </div>
                      {category === cat.val && (
                        <Check className="w-4 h-4 text-[#2563EB] shrink-0 ml-auto mt-0.5" />
                      )}
                    </label>
                  ))}
                </div>
              </fieldset>
            </div>
          )}

          {/* ── STEP 2: Coarse Area ─────────────────────────────────────── */}
          {step === 2 && (
            <div className="space-y-3">
              <div className="border-b border-[#DCE3EE] pb-2">
                <h2 className="text-xs font-bold text-[#172033] uppercase font-mono tracking-wider">
                  Step 2: Select approximate area
                </h2>
                <p className="text-[11px] text-[#64748B] mt-0.5">
                  Select the broad area where you made this observation. We do
                  not collect precise coordinates.
                </p>
              </div>

              <div className="p-3 bg-blue-50 border border-blue-200 text-blue-900 text-[11px] rounded-md flex items-start gap-2">
                <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                <span>
                  Your report will be associated with this coarse area only — no
                  GPS coordinates are stored or transmitted.
                </span>
              </div>

              <fieldset>
                <legend className="sr-only">Approximate area</legend>
                <div className="space-y-2">
                  {COARSE_AREA_OPTIONS.map((opt) => (
                    <label
                      key={opt.val}
                      className={`flex items-center gap-3 p-3 rounded-md border cursor-pointer transition-colors ${
                        coarseArea === opt.val
                          ? "border-[#2563EB] bg-[#EFF6FF]"
                          : "border-[#DCE3EE] bg-white hover:bg-[#F5F7FB]"
                      }`}
                    >
                      <input
                        type="radio"
                        name="coarseArea"
                        value={opt.val}
                        checked={coarseArea === opt.val}
                        onChange={() => setCoarseArea(opt.val)}
                        className="sr-only"
                      />
                      <MapPin className="w-4 h-4 text-[#64748B] shrink-0" />
                      <span className="text-xs font-medium text-[#172033]">
                        {opt.label}
                      </span>
                      {coarseArea === opt.val && (
                        <Check className="w-4 h-4 text-[#2563EB] shrink-0 ml-auto" />
                      )}
                    </label>
                  ))}
                </div>
              </fieldset>
            </div>
          )}

          {/* ── STEP 3: Time & Publication Intent ──────────────────────── */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="border-b border-[#DCE3EE] pb-2">
                <h2 className="text-xs font-bold text-[#172033] uppercase font-mono tracking-wider">
                  Step 3: Observation time & publication intent
                </h2>
              </div>

              {/* Time */}
              <div className="space-y-1.5">
                <label
                  htmlFor="time-observed"
                  className="text-[11px] font-semibold text-[#172033] block"
                >
                  When did you observe this?
                </label>
                <select
                  id="time-observed"
                  value={timeObserved}
                  onChange={(e) => setTimeObserved(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#DCE3EE] rounded-md text-xs text-[#172033] focus-visible:outline-[#2563EB]"
                >
                  {TIME_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>

              {/* Publication intent */}
              <div className="space-y-2">
                <span className="text-[11px] font-semibold text-[#172033] block">
                  How should this report be used?
                </span>
                <div className="space-y-2">
                  <label
                    className={`flex items-start gap-3 p-3 rounded-md border cursor-pointer transition-colors ${
                      publicationIntent === "RESTRICTED_EVIDENCE"
                        ? "border-[#2563EB] bg-[#EFF6FF]"
                        : "border-[#DCE3EE] bg-white hover:bg-[#F5F7FB]"
                    }`}
                  >
                    <input
                      type="radio"
                      name="intent"
                      value="RESTRICTED_EVIDENCE"
                      checked={publicationIntent === "RESTRICTED_EVIDENCE"}
                      onChange={() =>
                        setPublicationIntent("RESTRICTED_EVIDENCE")
                      }
                      className="sr-only"
                    />
                    <div>
                      <span className="font-semibold text-xs text-[#172033] block">
                        Restricted evidence (recommended)
                      </span>
                      <span className="text-[11px] text-[#64748B]">
                        Used only for internal route context calculations. Not
                        published publicly.
                      </span>
                    </div>
                    {publicationIntent === "RESTRICTED_EVIDENCE" && (
                      <Check className="w-4 h-4 text-[#2563EB] shrink-0 ml-auto mt-0.5" />
                    )}
                  </label>
                  <label
                    className={`flex items-start gap-3 p-3 rounded-md border cursor-pointer transition-colors ${
                      publicationIntent === "PUBLIC_CONTEXT"
                        ? "border-[#2563EB] bg-[#EFF6FF]"
                        : "border-[#DCE3EE] bg-white hover:bg-[#F5F7FB]"
                    }`}
                  >
                    <input
                      type="radio"
                      name="intent"
                      value="PUBLIC_CONTEXT"
                      checked={publicationIntent === "PUBLIC_CONTEXT"}
                      onChange={() => setPublicationIntent("PUBLIC_CONTEXT")}
                      className="sr-only"
                    />
                    <div>
                      <span className="font-semibold text-xs text-[#172033] block">
                        Public context
                      </span>
                      <span className="text-[11px] text-[#64748B]">
                        Subject to moderation. If accepted, aggregated context
                        may appear in route evaluations.
                      </span>
                    </div>
                    {publicationIntent === "PUBLIC_CONTEXT" && (
                      <Check className="w-4 h-4 text-[#2563EB] shrink-0 ml-auto mt-0.5" />
                    )}
                  </label>
                </div>
              </div>

              <div className="p-3 bg-[#F5F7FB] border border-[#DCE3EE] rounded-md text-[11px] text-[#64748B]">
                <strong>Retention policy:</strong> Reports are retained for 90
                days and then expire automatically. No precise coordinates are
                stored. Submissions are moderated before any contextual use.
              </div>
            </div>
          )}

          {/* ── STEP 4: Review ──────────────────────────────────────────── */}
          {step === 4 && (
            <div className="space-y-4 text-xs">
              <div className="border-b border-[#DCE3EE] pb-2">
                <h2 className="text-xs font-bold text-[#172033] uppercase font-mono tracking-wider">
                  Step 4: Review and submit
                </h2>
              </div>

              <div className="p-4 bg-[#F5F7FB] border border-[#DCE3EE] rounded-md space-y-3">
                <div className="flex justify-between items-start border-b border-[#DCE3EE] pb-2">
                  <div>
                    <span className="text-[10px] font-bold text-[#64748B] font-mono uppercase block">
                      Category
                    </span>
                    <span className="font-bold text-[#172033] text-xs">
                      {CATEGORY_LABEL[category]}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="text-[11px] text-[#2563EB] hover:underline font-medium cursor-pointer"
                  >
                    Edit
                  </button>
                </div>

                <div className="flex justify-between items-start border-b border-[#DCE3EE] pb-2">
                  <div>
                    <span className="text-[10px] font-bold text-[#64748B] font-mono uppercase block">
                      Area
                    </span>
                    <span className="font-semibold text-[#172033] text-xs">
                      {COARSE_AREA_OPTIONS.find((a) => a.val === coarseArea)
                        ?.label ?? coarseArea}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="text-[11px] text-[#2563EB] hover:underline font-medium cursor-pointer"
                  >
                    Edit
                  </button>
                </div>

                <div className="flex justify-between items-start border-b border-[#DCE3EE] pb-2">
                  <div>
                    <span className="text-[10px] font-bold text-[#64748B] font-mono uppercase block">
                      Observed
                    </span>
                    <span className="text-[#172033] text-xs font-mono">
                      {timeObserved}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="text-[11px] text-[#2563EB] hover:underline font-medium cursor-pointer"
                  >
                    Edit
                  </button>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-[#64748B] font-mono uppercase block">
                    Publication intent
                  </span>
                  <span className="text-[#172033] text-xs">
                    {publicationIntent === "RESTRICTED_EVIDENCE"
                      ? "Restricted evidence (not published)"
                      : "Public context (subject to moderation)"}
                  </span>
                </div>
              </div>

              <div className="p-3 bg-blue-50 border border-blue-200 text-blue-900 text-[11px] rounded-md flex items-start gap-2">
                <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                <span>
                  Submissions are anonymous by default. No identity information
                  is attached to this report. Your session ID is a temporary
                  correlation identifier only.
                </span>
              </div>
            </div>
          )}

          {/* Step Controls */}
          <div className="flex justify-between items-center pt-3 border-t border-[#DCE3EE]">
            <Button
              variant="ghost"
              size="sm"
              disabled={step === 1 || isSubmitting}
              onClick={() => setStep((prev) => (prev - 1) as 1 | 2 | 3 | 4 | 5)}
            >
              ← Back
            </Button>

            <Button
              variant="primary"
              size="sm"
              onClick={handleNext}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Submitting…</span>
                </>
              ) : step === 4 ? (
                "Submit report"
              ) : (
                "Next →"
              )}
            </Button>
          </div>
        </div>
      )}

      {/* ── STEP 5: Confirmation ──────────────────────────────────────── */}
      {step === 5 && submittedReport && (
        <div className="bg-white border border-[#DCE3EE] rounded-md p-6 sm:p-8 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-[#EFF6FF] border border-[#2563EB]/30 text-[#2563EB] flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>

          <div className="space-y-1 max-w-md mx-auto">
            <h2 className="text-xl font-bold text-[#172033]">
              {submittedReport.reused
                ? "Report already submitted"
                : "Report submitted"}
            </h2>
            <p className="text-xs text-[#64748B]">
              {submittedReport.reused
                ? "This report was already submitted (duplicate submission detected)."
                : "Thank you for contributing a physical-context observation."}
            </p>
          </div>

          {/* Reference Card */}
          <div className="p-4 bg-[#F5F7FB] border border-[#DCE3EE] rounded-md max-w-sm mx-auto text-left space-y-2 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-[#64748B]">Reference:</span>
              <span className="font-mono font-bold text-[#172033]">
                {submittedReport.reference}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[#64748B]">Category:</span>
              <span className="font-semibold text-[#172033]">
                {CATEGORY_LABEL[submittedReport.category]}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[#64748B]">Expires:</span>
              <span className="font-mono text-[#172033] text-[11px]">
                {new Date(submittedReport.expires_at).toLocaleDateString(
                  "en-IN",
                  {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  },
                )}
              </span>
            </div>
            <div className="flex justify-between items-center pt-1 border-t border-[#DCE3EE]">
              <span className="text-[#64748B]">Status:</span>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold border ${statusStyle.color}`}
              >
                {statusStyle.label}
              </span>
            </div>
          </div>

          {/* Status check */}
          <div className="max-w-sm mx-auto space-y-2">
            {statusPollError && (
              <p className="text-xs text-red-700" role="alert">
                {statusPollError}
              </p>
            )}
            <button
              onClick={handlePollStatus}
              disabled={isPollingStatus}
              className="flex items-center gap-1.5 text-xs text-[#2563EB] hover:underline font-medium cursor-pointer disabled:opacity-50 mx-auto"
            >
              {isPollingStatus ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <RefreshCw className="w-3 h-3" />
              )}
              <span>
                {isPollingStatus
                  ? "Checking status…"
                  : "Check moderation status"}
              </span>
            </button>

            {polledStatus && (
              <p className="text-[11px] text-[#64748B]">
                Status last checked at{" "}
                {new Date().toLocaleTimeString("en-IN", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
                .
              </p>
            )}
          </div>

          <div className="text-[11px] text-[#64748B] max-w-md mx-auto">
            Reports are moderated before contextual use. No identity information
            was attached. Data expires automatically after 90 days.
          </div>

          {/* Secure Evidence Upload Section (Phase 4I) */}
          <div className="max-w-md mx-auto text-left pt-2">
            <EvidenceManager reportId={submittedReport.report_id} />
          </div>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-3 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetForm}
              className="w-full sm:w-auto"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Submit another report</span>
            </Button>

            <Button
              variant="primary"
              size="sm"
              onClick={() => setTab("/route")}
              className="w-full sm:w-auto"
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>Return to route planner</span>
            </Button>
          </div>
        </div>
      )}

      {/* Recent Reports (fixture label) */}
      {reports.length > 0 && step !== 5 && (
        <div className="space-y-2 pt-3">
          <div>
            <h2 className="text-xs font-bold text-[#172033] uppercase font-mono tracking-wider">
              Recent reports (local session)
            </h2>
            <p className="text-[11px] text-[#64748B]">
              Reports submitted in this session. These reflect your local
              session log.
            </p>
          </div>

          <div className="bg-white border border-[#DCE3EE] rounded-md divide-y divide-[#DCE3EE]">
            {reports.map((rep) => (
              <div
                key={rep.id}
                className="p-3.5 text-xs space-y-1.5 hover:bg-[#F5F7FB] transition-colors"
              >
                <div className="flex justify-between items-center flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#172033]">
                      {rep.category}
                    </span>
                    <span className="text-[10px] text-[#64748B] bg-[#F5F7FB] px-1.5 py-0.5 rounded border border-[#DCE3EE]">
                      Demo data
                    </span>
                  </div>
                  <span className="text-[#64748B] font-mono text-[10px] flex items-center gap-1">
                    <Clock className="w-3 h-3 text-[#64748B]" />
                    <span>{rep.submittedAt}</span>
                  </span>
                </div>
                <p className="text-[#64748B] text-[11px] leading-relaxed">
                  {rep.physicalDetails}
                </p>
                <div className="text-[11px] font-mono text-[#64748B] flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-[#64748B] shrink-0" />
                  <span className="truncate">{rep.locationDescription}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ---------------------------------------------------------------------------
// Helper: convert user-selected time label → ISO 8601 timestamp
// ---------------------------------------------------------------------------
function buildObservedAt(label: string): string {
  const now = new Date();
  if (label.includes("30 minutes")) {
    now.setMinutes(now.getMinutes() - 30);
  } else if (label.includes("1 hour")) {
    now.setHours(now.getHours() - 1);
  } else if (label.includes("earlier today")) {
    now.setHours(now.getHours() - 3);
  }
  // Ensure timezone offset is included
  return now.toISOString();
}

export default ReportStepper;
