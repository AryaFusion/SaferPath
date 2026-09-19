import React, { useState } from 'react';
import { useSafety } from '../../context/SafetyContext';
import Button from '../../components/common/Button';
import {
  Sun,
  AlertCircle,
  Eye,
  Store,
  MapPin,
  CheckCircle2,
  Clock,
  Check,
  RotateCcw,
  Navigation,
  Info,
} from 'lucide-react';

export const ReportStepper: React.FC = () => {
  const { reports, addPhysicalReport, originLocation, destinationLocation, setTab } = useSafety();

  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [category, setCategory] = useState<
    'Streetlamp Issue' | 'Pavement Obstacle' | 'Overgrown Sightlines' | 'Open Commercial Front' | 'Other Physical Feature'
  >('Streetlamp Issue');
  const [locationDescription, setLocationDescription] = useState('');
  const [physicalDetails, setPhysicalDetails] = useState('');
  const [timeObserved, setTimeObserved] = useState('Observed just now');
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [submittedReportId, setSubmittedReportId] = useState<string>('');
  const [validationError, setValidationError] = useState<string | null>(null);

  const categories = [
    {
      val: 'Streetlamp Issue' as const,
      title: 'Streetlamp outage / dim lighting',
      desc: 'Report a streetlight that is unlit or provides limited illumination.',
      icon: <Sun className="w-4 h-4 text-[#2563EB] shrink-0" />,
    },
    {
      val: 'Pavement Obstacle' as const,
      title: 'Pavement obstacle / construction',
      desc: 'Report an obstruction or surface hazard affecting pedestrian movement.',
      icon: <AlertCircle className="w-4 h-4 text-[#B45309] shrink-0" />,
    },
    {
      val: 'Overgrown Sightlines' as const,
      title: 'Overgrown sightlines / dense foliage',
      desc: 'Report overgrown vegetation or structures blocking walkway sightlines.',
      icon: <Eye className="w-4 h-4 text-[#64748B] shrink-0" />,
    },
    {
      val: 'Open Commercial Front' as const,
      title: 'Open commercial front / staffed desk',
      desc: 'Report an active commercial storefront or staffed desk along the walkway.',
      icon: <Store className="w-4 h-4 text-[#0F766E] shrink-0" />,
    },
  ];

  const handleNext = () => {
    setValidationError(null);

    if (step === 1) {
      if (!category) {
        setValidationError('Please select a report category.');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!locationDescription.trim()) {
        setValidationError('Please enter an approximate location or landmark.');
        return;
      }
      setStep(3);
    } else if (step === 3) {
      if (!physicalDetails.trim()) {
        setValidationError('Please provide physical details of your observation.');
        return;
      }
      setStep(4);
    } else if (step === 4) {
      const newRefId = `REP-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
      addPhysicalReport({
        category,
        locationDescription: locationDescription.trim(),
        physicalDetails: physicalDetails.trim(),
        isAnonymous,
      });
      setSubmittedReportId(newRefId);
      setStep(5);
    }
  };

  const handleResetForm = () => {
    setStep(1);
    setCategory('Streetlamp Issue');
    setLocationDescription('');
    setPhysicalDetails('');
    setTimeObserved('Observed just now');
    setIsAnonymous(true);
    setSubmittedReportId('');
    setValidationError(null);
  };

  const stepsList = [
    { num: 1, label: 'Category' },
    { num: 2, label: 'Location' },
    { num: 3, label: 'Details' },
    { num: 4, label: 'Review' },
  ];

  return (
    <div className="space-y-5 max-w-4xl mx-auto px-1">
      {/* Page Header */}
      <div className="space-y-1 pb-3 border-b border-[#DCE3EE]">
        <h1 className="text-2xl sm:text-3xl font-bold text-[#172033] tracking-tight">
          Reports
        </h1>
        <p className="text-xs sm:text-sm text-[#64748B]">
          Report an observable physical condition to help keep route context current.
        </p>
      </div>

      {/* Step Indicator Bar */}
      {step <= 4 && (
        <div className="bg-white border border-[#DCE3EE] rounded-md p-3.5 space-y-2">
          <div className="flex items-center justify-between gap-2 overflow-x-auto">
            {stepsList.map((st, idx) => {
              const isCurrent = step === st.num;
              const isCompleted = step > st.num;

              return (
                <React.Fragment key={st.num}>
                  <div
                    onClick={() => {
                      if (isCompleted) setStep(st.num as any);
                    }}
                    className={`flex items-center gap-2 cursor-pointer shrink-0 text-xs ${
                      isCompleted ? 'hover:opacity-80' : ''
                    }`}
                  >
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs transition-colors ${
                        isCompleted
                          ? 'bg-[#2563EB] text-white'
                          : isCurrent
                          ? 'bg-[#2563EB] text-white ring-2 ring-[#2563EB]/20'
                          : 'bg-[#F5F7FB] text-[#64748B] border border-[#DCE3EE]'
                      }`}
                    >
                      {isCompleted ? <Check className="w-3.5 h-3.5" /> : st.num}
                    </div>
                    <span
                      className={`font-medium ${
                        isCurrent
                          ? 'text-[#172033] font-bold'
                          : isCompleted
                          ? 'text-[#2563EB] font-semibold'
                          : 'text-[#64748B]'
                      }`}
                    >
                      {st.label}
                    </span>
                  </div>

                  {idx < stepsList.length - 1 && (
                    <div
                      className={`flex-1 h-0.5 min-w-[20px] transition-colors ${
                        step > st.num ? 'bg-[#2563EB]' : 'bg-[#DCE3EE]'
                      }`}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      )}

      {/* Compact Privacy Notice Strip */}
      {step <= 4 && (
        <div className="flex items-start gap-2 p-2.5 bg-[#F5F7FB] border border-[#DCE3EE] rounded-md text-xs text-[#64748B]">
          <Info className="w-4 h-4 text-[#2563EB] shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong className="text-[#172033]">Privacy notice:</strong> Reports describe physical features, never individuals. Submissions enrich route context and are not an emergency dispatch mechanism.
          </p>
        </div>
      )}

      {/* Validation Alert */}
      {validationError && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-[#C62828] text-xs rounded-md flex items-center gap-2 font-medium">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{validationError}</span>
        </div>
      )}

      {/* Main Step Forms */}
      {step <= 4 && (
        <div className="bg-white border border-[#DCE3EE] rounded-md p-4 sm:p-5 space-y-4">
          {/* STEP 1: CATEGORY */}
          {step === 1 && (
            <div className="space-y-3">
              <div className="border-b border-[#DCE3EE] pb-2">
                <h2 className="text-xs font-bold text-[#172033] uppercase font-mono tracking-wider">
                  Step 1: Select what you observed
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {categories.map((catItem) => {
                  const isSelected = category === catItem.val;

                  return (
                    <div
                      key={catItem.val}
                      onClick={() => {
                        setCategory(catItem.val);
                        setValidationError(null);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          setCategory(catItem.val);
                          setValidationError(null);
                        }
                      }}
                      tabIndex={0}
                      role="button"
                      aria-pressed={isSelected}
                      className={`p-3.5 rounded-md border transition-all cursor-pointer flex flex-col justify-between space-y-2 h-full ${
                        isSelected
                          ? 'bg-[#EFF6FF] border-[#2563EB] ring-1 ring-[#2563EB]'
                          : 'bg-white border-[#DCE3EE] hover:border-[#2563EB]/50 hover:bg-[#F5F7FB]'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2.5">
                          {catItem.icon}
                          <h3 className="text-xs font-bold text-[#172033]">{catItem.title}</h3>
                        </div>
                        <div
                          className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                            isSelected ? 'border-[#2563EB] bg-[#2563EB]' : 'border-[#DCE3EE] bg-white'
                          }`}
                        >
                          {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                      </div>
                      <p className="text-[11px] text-[#64748B] leading-snug">{catItem.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 2: LOCATION */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="border-b border-[#DCE3EE] pb-2">
                <h2 className="text-xs font-bold text-[#172033] uppercase font-mono tracking-wider">
                  Step 2: Approximate location or landmark
                </h2>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-[#172033] block">
                  Location description *
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-[#64748B] absolute left-3 top-2.5 pointer-events-none" />
                  <input
                    type="text"
                    value={locationDescription}
                    onChange={(e) => {
                      setLocationDescription(e.target.value);
                      if (e.target.value.trim()) setValidationError(null);
                    }}
                    placeholder="e.g. Dadar Station West Plaza / Senapati Bapat Marg"
                    className="w-full pl-9 pr-3 py-2 bg-white border border-[#DCE3EE] rounded-md text-xs text-[#172033] focus-visible-ring"
                  />
                </div>
              </div>

              {/* Quick Location Preset Buttons */}
              <div className="space-y-1.5 pt-1">
                <span className="text-[11px] font-medium text-[#64748B] block">Quick location shortcuts:</span>
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  {[originLocation, destinationLocation, 'Shivaji Park, Mumbai', 'Dadar Station West', 'Matunga West'].map(
                    (presetLoc, idx) => (
                      <button
                        key={`${presetLoc}-${idx}`}
                        type="button"
                        onClick={() => {
                          setLocationDescription(presetLoc);
                          setValidationError(null);
                        }}
                        className="px-2.5 py-1 bg-[#F5F7FB] hover:bg-[#EFF6FF] text-[#172033] hover:text-[#2563EB] border border-[#DCE3EE] rounded text-[11px] transition-colors cursor-pointer"
                      >
                        + {presetLoc}
                      </button>
                    )
                  )}
                </div>
              </div>

              <p className="text-[11px] text-[#64748B] pt-1">
                Approximate location is sufficient. Exact personal GPS coordinates are never published.
              </p>
            </div>
          )}

          {/* STEP 3: DETAILS */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="border-b border-[#DCE3EE] pb-2">
                <h2 className="text-xs font-bold text-[#172033] uppercase font-mono tracking-wider">
                  Step 3: Physical evidence details
                </h2>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-semibold text-[#172033]">
                    Observation description *
                  </label>
                  <span className="text-[11px] font-mono text-[#64748B]">
                    {physicalDetails.length} / 300
                  </span>
                </div>
                <textarea
                  rows={4}
                  maxLength={300}
                  value={physicalDetails}
                  onChange={(e) => {
                    setPhysicalDetails(e.target.value);
                    if (e.target.value.trim()) setValidationError(null);
                  }}
                  placeholder="Describe physical features observed (e.g. 2 streetlamps unlit on west walkway, sidewalk clear for walking)..."
                  className="w-full px-3 py-2 bg-white border border-[#DCE3EE] rounded-md text-xs text-[#172033] focus-visible-ring resize-none leading-relaxed"
                />
              </div>

              {/* Time Observed Selection */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#172033] block">
                  Time observed
                </label>
                <select
                  value={timeObserved}
                  onChange={(e) => setTimeObserved(e.target.value)}
                  className="px-3 py-1.5 bg-white border border-[#DCE3EE] rounded-md text-xs text-[#172033] focus-visible-ring"
                >
                  <option value="Observed just now">Observed just now</option>
                  <option value="Observed within the last hour">Observed within the last hour</option>
                  <option value="Observed earlier today">Observed earlier today</option>
                </select>
              </div>
            </div>
          )}

          {/* STEP 4: REVIEW */}
          {step === 4 && (
            <div className="space-y-4 text-xs">
              <div className="border-b border-[#DCE3EE] pb-2">
                <h2 className="text-xs font-bold text-[#172033] uppercase font-mono tracking-wider">
                  Step 4: Review and confirm submission
                </h2>
              </div>

              <div className="p-4 bg-[#F5F7FB] border border-[#DCE3EE] rounded-md space-y-3">
                <div className="flex justify-between items-start border-b border-[#DCE3EE] pb-2">
                  <div>
                    <span className="text-[10px] font-bold text-[#64748B] font-mono uppercase block">CATEGORY</span>
                    <span className="font-bold text-[#172033] text-xs">{category}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="text-[11px] text-[#2563EB] hover:underline font-medium cursor-pointer"
                  >
                    Edit category
                  </button>
                </div>

                <div className="flex justify-between items-start border-b border-[#DCE3EE] pb-2">
                  <div>
                    <span className="text-[10px] font-bold text-[#64748B] font-mono uppercase block">LOCATION</span>
                    <span className="font-semibold text-[#172033] text-xs">{locationDescription}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="text-[11px] text-[#2563EB] hover:underline font-medium cursor-pointer"
                  >
                    Edit location
                  </button>
                </div>

                <div className="flex justify-between items-start border-b border-[#DCE3EE] pb-2">
                  <div>
                    <span className="text-[10px] font-bold text-[#64748B] font-mono uppercase block">DETAILS</span>
                    <p className="text-[#172033] text-xs mt-0.5 leading-snug">{physicalDetails}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="text-[11px] text-[#2563EB] hover:underline font-medium cursor-pointer"
                  >
                    Edit details
                  </button>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-[#64748B] font-mono uppercase block">OBSERVED</span>
                  <span className="text-[#172033] text-xs font-mono">{timeObserved}</span>
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                  className="w-4 h-4 accent-[#2563EB] rounded cursor-pointer"
                />
                <span className="text-[#64748B]">Submit anonymously (recommended)</span>
              </label>
            </div>
          )}

          {/* Step Controls Footer */}
          <div className="flex justify-between items-center pt-3 border-t border-[#DCE3EE]">
            <Button
              variant="ghost"
              size="sm"
              disabled={step === 1}
              onClick={() => setStep((prev) => (prev - 1) as any)}
            >
              ← Back
            </Button>

            <Button variant="primary" size="sm" onClick={handleNext}>
              {step === 4 ? 'Submit report' : 'Next step →'}
            </Button>
          </div>
        </div>
      )}

      {/* STEP 5: SUBMISSION CONFIRMATION STATE */}
      {step === 5 && (
        <div className="bg-white border border-[#DCE3EE] rounded-md p-6 sm:p-8 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-[#EFF6FF] border border-[#2563EB]/30 text-[#2563EB] flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>

          <div className="space-y-1 max-w-md mx-auto">
            <h2 className="text-xl font-bold text-[#172033]">Report submitted</h2>
            <p className="text-xs text-[#64748B]">
              Thank you for contributing a physical-context observation.
            </p>
          </div>

          {/* Reference Card */}
          <div className="p-4 bg-[#F5F7FB] border border-[#DCE3EE] rounded-md max-w-sm mx-auto text-left space-y-1.5 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-[#64748B]">Reference ID:</span>
              <span className="font-mono font-bold text-[#172033]">{submittedReportId}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[#64748B]">Submitted time:</span>
              <span className="font-mono text-[#172033]">Just now</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[#64748B]">Category:</span>
              <span className="font-semibold text-[#172033]">{category}</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-3 pt-2">
            <Button variant="outline" size="sm" onClick={handleResetForm} className="w-full sm:w-auto">
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Back to reports</span>
            </Button>

            <Button variant="primary" size="sm" onClick={() => setTab('/route')} className="w-full sm:w-auto">
              <Navigation className="w-3.5 h-3.5" />
              <span>Return to route planner</span>
            </Button>
          </div>
        </div>
      )}

      {/* Recent Submissions Section */}
      <div className="space-y-2 pt-3">
        <div>
          <h2 className="text-xs font-bold text-[#172033] uppercase font-mono tracking-wider">
            Recent reports
          </h2>
          <p className="text-[11px] text-[#64748B]">
            Recent physical-context observations associated with this area.
          </p>
        </div>

        <div className="bg-white border border-[#DCE3EE] rounded-md divide-y divide-[#DCE3EE]">
          {reports.map((rep) => (
            <div key={rep.id} className="p-3.5 text-xs space-y-1.5 hover:bg-[#F5F7FB] transition-colors">
              <div className="flex justify-between items-center flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-[#172033]">{rep.category}</span>
                  <span className="text-[10px] text-[#64748B] bg-[#F5F7FB] px-1.5 py-0.5 rounded border border-[#DCE3EE]">
                    Demo data
                  </span>
                </div>
                <span className="text-[#64748B] font-mono text-[10px] flex items-center gap-1">
                  <Clock className="w-3 h-3 text-[#64748B]" />
                  <span>{rep.submittedAt}</span>
                </span>
              </div>
              <p className="text-[#64748B] text-[11px] leading-relaxed">{rep.physicalDetails}</p>
              <div className="text-[11px] font-mono text-[#64748B] flex items-center gap-1">
                <MapPin className="w-3 h-3 text-[#64748B] shrink-0" />
                <span className="truncate">{rep.locationDescription}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ReportStepper;
