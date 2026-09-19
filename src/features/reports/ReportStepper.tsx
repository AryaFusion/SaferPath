import React, { useState } from 'react';
import { useSafety } from '../../context/SafetyContext';
import Button from '../../components/common/Button';
import { Sun, AlertCircle, Eye, Store, ShieldCheck, MapPin } from 'lucide-react';

export const ReportStepper: React.FC = () => {
  const { reports, addPhysicalReport } = useSafety();

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [category, setCategory] = useState<'Streetlamp Issue' | 'Pavement Obstacle' | 'Overgrown Sightlines' | 'Open Commercial Front' | 'Other Physical Feature'>('Streetlamp Issue');
  const [locationDescription, setLocationDescription] = useState('');
  const [physicalDetails, setPhysicalDetails] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [completedMessage, setCompletedMessage] = useState(false);

  const categories = [
    { val: 'Streetlamp Issue', label: 'Streetlamp outage / dim lighting', icon: <Sun className="w-4 h-4 text-[#0B8F83]" /> },
    { val: 'Pavement Obstacle', label: 'Pavement obstacle / construction', icon: <AlertCircle className="w-4 h-4 text-amber-600" /> },
    { val: 'Overgrown Sightlines', label: 'Overgrown sightlines / dense foliage', icon: <Eye className="w-4 h-4 text-[#5F6B7A]" /> },
    { val: 'Open Commercial Front', label: 'Open commercial front / staffed desk', icon: <Store className="w-4 h-4 text-[#0B8F83]" /> },
  ];

  const handleNext = () => {
    if (step === 1 && !category) return;
    if (step === 2 && !locationDescription) return;
    if (step === 3 && !physicalDetails) return;

    if (step === 4) {
      addPhysicalReport({
        category,
        locationDescription,
        physicalDetails,
        isAnonymous,
      });
      setCompletedMessage(true);
      setStep(1);
      setLocationDescription('');
      setPhysicalDetails('');
      setTimeout(() => setCompletedMessage(false), 5000);
    } else {
      setStep((prev) => (prev + 1) as any);
    }
  };

  return (
    <div className="space-y-4 max-w-4xl mx-auto px-1">
      {/* Title */}
      <div className="space-y-1 pb-3 border-b border-[#D9DDE3]">
        <h1 className="text-2xl font-bold text-[#142033] tracking-tight">
          Reports
        </h1>
        <p className="text-xs text-[#5F6B7A]">
          Share observable physical telemetry (streetlamps, sidewalk clearance, open commercial fronts) to enrich route evidence.
        </p>
      </div>

      {/* Stepper Progress Bar */}
      <div className="flex items-center justify-between border-b border-[#D9DDE3] pb-2.5 text-xs font-mono-telemetry text-[#5F6B7A]">
        <span className={step >= 1 ? 'text-[#142033] font-bold' : ''}>1. Category</span>
        <span>──</span>
        <span className={step >= 2 ? 'text-[#142033] font-bold' : ''}>2. Location</span>
        <span>──</span>
        <span className={step >= 3 ? 'text-[#142033] font-bold' : ''}>3. Details</span>
        <span>──</span>
        <span className={step >= 4 ? 'text-[#142033] font-bold' : ''}>4. Review</span>
      </div>

      {/* Privacy Notice */}
      <div className="text-xs text-[#5F6B7A] bg-[#F1F3F2] p-2.5 rounded-md border border-[#D9DDE3] leading-relaxed">
        <strong className="text-[#142033]">Privacy Notice:</strong> Reports describe physical features — never individuals. Submissions enrich route context and are not an emergency dispatch mechanism.
      </div>

      {completedMessage && (
        <div className="p-3 bg-[#EBF2F1] border border-[#0B8F83]/30 text-[#0B8F83] text-xs font-semibold rounded-md flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 shrink-0" />
          <span>Physical telemetry report submitted. Observations queued for route evidence matching.</span>
        </div>
      )}

      {/* Stepper Content Panel */}
      <div className="bg-white border border-[#D9DDE3] rounded-md p-5 space-y-4">
        {step === 1 && (
          <div className="space-y-3">
            <label className="text-xs font-bold text-[#142033] uppercase font-mono-telemetry block">
              Step 1: Select feature category
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {categories.map((catItem) => (
                <button
                  key={catItem.val}
                  type="button"
                  onClick={() => setCategory(catItem.val as any)}
                  className={`p-3 text-left rounded-md border text-xs font-medium cursor-pointer transition-colors flex items-center gap-2.5 ${
                    category === catItem.val
                      ? 'bg-[#EBF2F1] border-[#0B8F83] text-[#142033] font-semibold'
                      : 'bg-white text-[#142033] border-[#D9DDE3] hover:bg-[#F1F3F2]'
                  }`}
                >
                  {catItem.icon}
                  <span>{catItem.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-3">
            <label className="text-xs font-bold text-[#142033] uppercase font-mono-telemetry block">
              Step 2: Location description or landmark
            </label>
            <input
              type="text"
              value={locationDescription}
              onChange={(e) => setLocationDescription(e.target.value)}
              placeholder="e.g. Corner of Dadar Station West Plaza"
              className="w-full px-3 py-2 bg-white border border-[#D9DDE3] rounded-md text-xs text-[#142033] focus-visible-ring"
            />
          </div>
        )}

        {step === 3 && (
          <div className="space-y-3">
            <label className="text-xs font-bold text-[#142033] uppercase font-mono-telemetry block">
              Step 3: Physical evidence details
            </label>
            <textarea
              rows={3}
              value={physicalDetails}
              onChange={(e) => setPhysicalDetails(e.target.value)}
              placeholder="Describe physical features observed (e.g. 2 streetlamps unlit on west walkway)..."
              className="w-full px-3 py-2 bg-white border border-[#D9DDE3] rounded-md text-xs text-[#142033] focus-visible-ring resize-none"
            />
          </div>
        )}

        {step === 4 && (
          <div className="space-y-3 text-xs">
            <label className="text-xs font-bold text-[#142033] uppercase font-mono-telemetry block">
              Step 4: Review and confirm submission
            </label>

            <div className="p-3 bg-[#F1F3F2] border border-[#D9DDE3] rounded-md space-y-1">
              <div>Category: <strong className="text-[#142033]">{category}</strong></div>
              <div>Location: <strong className="text-[#142033]">{locationDescription}</strong></div>
              <div>Details: <strong className="text-[#142033]">{physicalDetails}</strong></div>
            </div>

            <label className="flex items-center gap-2 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
                className="w-4 h-4 accent-[#142033] rounded cursor-pointer"
              />
              <span className="text-[#5F6B7A]">Submit anonymously (recommended)</span>
            </label>
          </div>
        )}

        {/* Action Controls */}
        <div className="flex justify-between items-center pt-3 border-t border-[#D9DDE3]">
          <Button
            variant="ghost"
            size="sm"
            disabled={step === 1}
            onClick={() => setStep((prev) => (prev - 1) as any)}
          >
            ← Back
          </Button>

          <Button variant="primary" size="sm" onClick={handleNext}>
            {step === 4 ? 'Submit telemetry report' : 'Next step →'}
          </Button>
        </div>
      </div>

      {/* Recent Submissions List */}
      <div className="space-y-2 pt-2">
        <h2 className="text-xs font-bold text-[#5F6B7A] uppercase font-mono-telemetry">
          Recent physical context reports
        </h2>
        <div className="bg-white border border-[#D9DDE3] rounded-md divide-y divide-[#D9DDE3]">
          {reports.map((rep) => (
            <div key={rep.id} className="p-3 text-xs space-y-1">
              <div className="flex justify-between items-center">
                <span className="font-bold text-[#142033]">{rep.category}</span>
                <span className="text-[#5F6B7A] font-mono-telemetry text-[10px]">{rep.submittedAt}</span>
              </div>
              <p className="text-[#5F6B7A]">{rep.physicalDetails}</p>
              <div className="text-[11px] font-mono-telemetry text-[#5F6B7A] flex items-center gap-1">
                <MapPin className="w-3 h-3 text-[#5F6B7A]" />
                <span>{rep.locationDescription}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ReportStepper;
