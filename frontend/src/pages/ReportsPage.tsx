import { useState } from "react";
import AppNavbar from "../components/app/AppNavbar";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText, Plus, X, MapPin, Clock, Info, CheckCircle2, ChevronRight,
  ShieldAlert, Eye, MessageSquareWarning, Navigation, Lock
} from "lucide-react";

// ─── Mock Data ───────────────────────────────────────────────────────────────

type ReportStatus = "Submitted" | "Under review" | "Reviewed" | "Needs more information";
type ReportCategory = "Poor lighting" | "Low activity" | "Infrastructure issue" | "Help point issue" | "Safety incident" | "Other";

interface Report {
  id: string;
  category: ReportCategory;
  date: string;
  location: string;
  description: string;
  status: ReportStatus;
  privacy: "Public route context" | "Private (Admin only)";
}

const mockReports: Report[] = [
  {
    id: "rep_1",
    category: "Poor lighting",
    date: "Today, 8:42 PM",
    location: "Bandra West, near Station Rd",
    description: "The street lights are completely out for a 200m stretch near the west exit.",
    status: "Under review",
    privacy: "Public route context",
  },
  {
    id: "rep_2",
    category: "Infrastructure issue",
    date: "Yesterday, 7:15 PM",
    location: "Andheri East, MIDC area",
    description: "Deep open pothole on the pedestrian walkway, forcing people onto the main road.",
    status: "Reviewed",
    privacy: "Public route context",
  },
  {
    id: "rep_3",
    category: "Help point issue",
    date: "Wed, 17 Sep, 10:30 PM",
    location: "Juhu Beach entrance",
    description: "The emergency call box is physically damaged and non-responsive.",
    status: "Needs more information",
    privacy: "Private (Admin only)",
  },
];

const CATEGORIES: { label: ReportCategory; icon: React.ElementType; color: string }[] = [
  { label: "Poor lighting", icon: LightbulbIcon, color: "text-amber-600 bg-amber-50" },
  { label: "Low activity", icon: Eye, color: "text-indigo-600 bg-indigo-50" },
  { label: "Infrastructure issue", icon: ShieldAlert, color: "text-orange-600 bg-orange-50" },
  { label: "Help point issue", icon: LifeBuoyIcon, color: "text-blue-600 bg-blue-50" },
  { label: "Safety incident", icon: MessageSquareWarning, color: "text-red-600 bg-red-50" },
  { label: "Other", icon: FileText, color: "text-slate-600 bg-slate-50" },
];

// Helper icons that aren't imported directly above to avoid conflicts
function LightbulbIcon(props: any) {
  return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1.3.5 2.6 1.5 3.5.8.8 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/></svg>;
}

function LifeBuoyIcon(props: any) {
  return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/><line x1="4.93" y1="4.93" x2="9.17" y2="9.17"/><line x1="14.83" y1="14.83" x2="19.07" y2="19.07"/><line x1="14.83" y1="9.17" x2="19.07" y2="4.93"/><line x1="14.83" y1="9.17" x2="18.36" y2="5.64"/><line x1="4.93" y1="19.07" x2="9.17" y2="14.83"/></svg>;
}


// ─── Component ───────────────────────────────────────────────────────────────

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>(mockReports);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);

  // Submit Flow States
  const [showSubmitDrawer, setShowSubmitDrawer] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Form States
  const [formCategory, setFormCategory] = useState<ReportCategory | null>(null);
  const [formLocation, setFormLocation] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formPrivacy, setFormPrivacy] = useState<"Public route context" | "Private (Admin only)">("Public route context");

  const getStatusColor = (status: ReportStatus) => {
    switch (status) {
      case "Submitted":
        return "bg-slate-100 text-slate-700";
      case "Under review":
        return "bg-blue-50 text-blue-700";
      case "Reviewed":
        return "bg-emerald-50 text-emerald-700";
      case "Needs more information":
        return "bg-amber-50 text-amber-700";
      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  const handleOpenSubmit = () => {
    setFormCategory(null);
    setFormLocation("");
    setFormDesc("");
    setFormPrivacy("Public route context");
    setSubmitSuccess(false);
    setShowSubmitDrawer(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formCategory || !formLocation.trim() || !formDesc.trim()) return;

    setIsSubmitting(true);
    setTimeout(() => {
      const newReport: Report = {
        id: `rep_${Date.now()}`,
        category: formCategory,
        date: "Just now",
        location: formLocation,
        description: formDesc,
        status: "Submitted",
        privacy: formPrivacy,
      };
      setReports([newReport, ...reports]);
      setIsSubmitting(false);
      setSubmitSuccess(true);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#f7f9f8] pt-14 pb-20 text-slate-900 md:pb-8">
      <AppNavbar />

      <main className="mx-auto max-w-[900px] px-4 py-6 sm:px-6 md:py-8 lg:px-10 lg:py-10">
        {/* Header & Primary Action */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl lg:text-[26px]">
              Reports
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Share information that can help improve route context for others.
            </p>
          </div>
          <button
            onClick={handleOpenSubmit}
            className="flex shrink-0 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-bold text-white shadow-sm transition-all hover:bg-emerald-700 hover:shadow-md"
          >
            Report something
            <Plus className="h-4 w-4" />
          </button>
        </div>

        {/* Data Quality Notice */}
        <div className="mb-8 flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-600 shadow-sm">
          <Info className="mt-0.5 h-5 w-5 shrink-0 text-slate-400" />
          <p>
            Reports are reviewed and used as structured context for routes. They may vary in freshness or completeness. SaferPath provides context; you make the final decision.
          </p>
        </div>

        {/* My Reports */}
        <section>
          <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-400">
            My reports
          </h2>

          {reports.length > 0 ? (
            <div className="flex flex-col gap-3">
              {reports.map((report) => (
                <button
                  key={report.id}
                  onClick={() => setSelectedReport(report)}
                  className="group flex flex-col items-start justify-between gap-4 rounded-xl border border-slate-200 bg-white p-5 text-left transition-colors hover:border-slate-300 hover:bg-slate-50 sm:flex-row sm:items-center"
                >
                  <div className="flex-1">
                    <h3 className="text-sm font-bold text-slate-900">{report.category}</h3>
                    <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-slate-500">
                      <span>{report.location}</span>
                      <span className="text-slate-300">·</span>
                      <span>{report.date}</span>
                    </div>
                  </div>
                  <div className="flex w-full items-center justify-between gap-4 sm:w-auto">
                    <span className={`shrink-0 rounded-md px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider ${getStatusColor(report.status)}`}>
                      {report.status}
                    </span>
                    <ChevronRight className="h-4 w-4 text-slate-300 transition-transform group-hover:translate-x-0.5 group-hover:text-slate-500" />
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white py-16 text-center shadow-sm">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-slate-50 text-slate-400">
                <FileText className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">No reports yet</h3>
              <p className="mx-auto mt-2 max-w-xs text-sm text-slate-500">
                Reports you submit will appear here so you can track their status.
              </p>
              <button
                onClick={handleOpenSubmit}
                className="mt-6 flex items-center gap-2 rounded-xl bg-slate-100 px-6 py-2.5 text-sm font-bold text-slate-700 transition-all hover:bg-slate-200"
              >
                Report something
              </button>
            </div>
          )}
        </section>
      </main>

      {/* ─── Submit Report Flow (Drawer/Modal) ─── */}
      <AnimatePresence>
        {showSubmitDrawer && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { if (!isSubmitting) setShowSubmitDrawer(false); }}
              className="fixed inset-0 z-[60] bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: "100%", opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "100%", opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 right-0 z-[70] flex w-full max-w-lg flex-col overflow-y-auto bg-white shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-slate-100 p-5">
                <h3 className="text-base font-bold text-slate-900">Submit a report</h3>
                <button
                  onClick={() => setShowSubmitDrawer(false)}
                  disabled={isSubmitting}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 disabled:opacity-50"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {submitSuccess ? (
                <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                    <CheckCircle2 className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">Report submitted</h3>
                  <p className="mt-2 text-sm text-slate-500">
                    Thank you. Your report helps improve route context for others. You can track its status in 'My reports'.
                  </p>
                  <button
                    onClick={() => setShowSubmitDrawer(false)}
                    className="mt-8 rounded-xl bg-slate-100 px-6 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-200"
                  >
                    Close
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-1 flex-col">
                  <div className="flex-1 p-5 sm:p-6">
                    
                    {/* Category */}
                    <div className="mb-8">
                      <label className="mb-3 block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                        What would you like to report?
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {CATEGORIES.map((cat) => (
                          <button
                            key={cat.label}
                            type="button"
                            onClick={() => setFormCategory(cat.label)}
                            className={`flex flex-col items-start gap-3 rounded-xl border p-3 text-left transition-all ${
                              formCategory === cat.label
                                ? "border-emerald-600 bg-emerald-50 ring-1 ring-emerald-600/20"
                                : "border-slate-200 bg-white hover:border-slate-300"
                            }`}
                          >
                            <div className={`flex h-8 w-8 items-center justify-center rounded-full ${cat.color}`}>
                              <cat.icon className="h-4 w-4" />
                            </div>
                            <span className={`text-xs font-semibold ${formCategory === cat.label ? "text-emerald-900" : "text-slate-700"}`}>
                              {cat.label}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Location */}
                    <div className="mb-8">
                      <label className="mb-3 block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                        Location
                      </label>
                      <div className="relative">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                          <MapPin className="h-4 w-4 text-slate-400" />
                        </div>
                        <input
                          type="text"
                          required
                          value={formLocation}
                          onChange={(e) => setFormLocation(e.target.value)}
                          placeholder="e.g. Bandra West Station Rd"
                          className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-3 pl-10 pr-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-all focus:border-slate-400 focus:bg-white focus:ring-2 focus:ring-emerald-600/10"
                        />
                      </div>
                      <div className="mt-2 flex gap-2">
                        <button type="button" className="rounded-lg bg-slate-100 px-3 py-1.5 text-[11px] font-semibold text-slate-600 hover:bg-slate-200">
                          Use current location
                        </button>
                        <button type="button" className="rounded-lg bg-slate-100 px-3 py-1.5 text-[11px] font-semibold text-slate-600 hover:bg-slate-200">
                          Select on route
                        </button>
                      </div>
                    </div>

                    {/* Details */}
                    <div className="mb-8">
                      <label className="mb-3 block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                        What did you observe?
                      </label>
                      <textarea
                        required
                        value={formDesc}
                        onChange={(e) => setFormDesc(e.target.value)}
                        placeholder="Keep it concise. Do not include passwords or personal identifying information."
                        rows={4}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-all focus:border-slate-400 focus:bg-white focus:ring-2 focus:ring-emerald-600/10"
                      />
                    </div>

                    {/* Privacy */}
                    <div className="mb-4">
                      <label className="mb-3 block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                        Report Privacy
                      </label>
                      <div className="rounded-xl border border-slate-200 bg-white p-1">
                        {(["Public route context", "Private (Admin only)"] as const).map((p) => (
                          <label key={p} className="flex cursor-pointer items-start gap-3 rounded-lg p-3 hover:bg-slate-50">
                            <input
                              type="radio"
                              name="privacy"
                              checked={formPrivacy === p}
                              onChange={() => setFormPrivacy(p)}
                              className="mt-0.5 h-4 w-4 border-slate-300 text-emerald-600 focus:ring-emerald-600"
                            />
                            <div>
                              <span className="block text-sm font-semibold text-slate-900">{p}</span>
                              <span className="mt-0.5 block text-xs text-slate-500">
                                {p === "Public route context"
                                  ? "Report context is shared anonymously to help others."
                                  : "Information is only shared with SaferPath review team."}
                              </span>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-slate-100 bg-slate-50/50 p-5">
                    <button
                      type="submit"
                      disabled={isSubmitting || !formCategory || !formLocation.trim() || !formDesc.trim()}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-emerald-700 hover:shadow-md disabled:opacity-50 disabled:hover:bg-emerald-600 disabled:hover:shadow-sm"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"></div>
                          Submitting...
                        </>
                      ) : (
                        <>
                          Submit Report
                          <Navigation className="h-4 w-4" />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ─── Report Details Drawer ─── */}
      <AnimatePresence>
        {selectedReport && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedReport(null)}
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
                <h3 className="text-base font-bold text-slate-900">Report details</h3>
                <button
                  onClick={() => setSelectedReport(null)}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="flex-1 p-5 sm:p-6">
                <div className="mb-6 flex items-start justify-between gap-4">
                  <div>
                    <h4 className="text-xl font-bold text-slate-900">{selectedReport.category}</h4>
                    <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-500">
                      <Clock className="h-3.5 w-3.5" />
                      {selectedReport.date}
                    </p>
                  </div>
                  <span className={`shrink-0 rounded-md px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider ${getStatusColor(selectedReport.status)}`}>
                    {selectedReport.status}
                  </span>
                </div>

                <div className="mb-6 space-y-5 rounded-xl border border-slate-200 bg-slate-50/50 p-5">
                  <div>
                    <span className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-slate-400">Location</span>
                    <p className="flex items-start gap-1.5 text-sm font-medium text-slate-900">
                      <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                      {selectedReport.location}
                    </p>
                  </div>
                  
                  <div>
                    <span className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-slate-400">Description</span>
                    <p className="text-sm text-slate-700 leading-relaxed">
                      "{selectedReport.description}"
                    </p>
                  </div>
                  
                  <div>
                    <span className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-slate-400">Privacy Setting</span>
                    <p className="flex items-center gap-1.5 text-sm font-medium text-slate-900">
                      <Lock className="h-4 w-4 text-slate-400" />
                      {selectedReport.privacy}
                    </p>
                  </div>
                </div>

                {selectedReport.status === "Reviewed" && (
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                      <div>
                        <h6 className="text-sm font-bold text-emerald-900">Review complete</h6>
                        <p className="mt-0.5 text-xs text-emerald-700">
                          This report has been reviewed and route context has been updated accordingly. Thank you for your contribution.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                {selectedReport.status === "Needs more information" && (
                  <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                    <div className="flex items-start gap-3">
                      <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
                      <div>
                        <h6 className="text-sm font-bold text-amber-900">More information needed</h6>
                        <p className="mt-0.5 text-xs text-amber-700">
                          We couldn't fully verify the location. Please ensure location details are exact in future reports.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
