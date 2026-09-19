import React from 'react';
import { useSafety } from '../../context/SafetyContext';
import Button from './Button';
import { Phone, X } from 'lucide-react';

interface EmergencySheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EmergencySheet: React.FC<EmergencySheetProps> = ({ isOpen, onClose }) => {
  const { contacts } = useSafety();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-[#142033]/60 backdrop-blur-xs">
      <div
        className="w-full max-w-lg bg-white border border-[#D9DDE3] rounded-t-md sm:rounded-md shadow-xl p-5 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-start border-b border-[#D9DDE3] pb-2.5">
          <div>
            <span className="text-[10px] font-mono-telemetry uppercase text-[#C83B4A] font-bold block">
              Emergency assistance
            </span>
            <h2 className="text-base font-bold text-[#142033]">
              Need official emergency assistance?
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-[#5F6B7A] hover:text-[#142033] text-xs font-bold cursor-pointer"
            aria-label="Close sheet"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Primary Hotline Dial Action */}
        <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-md space-y-2.5">
          <div className="flex items-center gap-2.5">
            <Phone className="w-5 h-5 text-[#C83B4A] shrink-0" />
            <div>
              <h3 className="text-xs font-bold text-[#C83B4A]">Call Official Emergency Services (112)</h3>
              <p className="text-[11px] text-rose-800">Direct line to public police and medical dispatch operators.</p>
            </div>
          </div>

          <a href="tel:112" className="block">
            <Button variant="caution" size="md" className="w-full">
              Direct Dial 112
            </Button>
          </a>
        </div>

        {/* Secondary Contact Ping */}
        <div className="space-y-1.5">
          <span className="text-xs font-bold text-[#142033] uppercase font-mono-telemetry block">
            Trusted Contacts ({contacts.length}):
          </span>
          <div className="space-y-1">
            {contacts.map((c) => (
              <div key={c.id} className="flex justify-between items-center text-xs p-2 bg-[#F1F3F2] border border-[#D9DDE3] rounded-md">
                <div>
                  <span className="font-bold text-[#142033] text-xs">{c.name}</span>
                  <span className="text-[#5F6B7A] block text-[10px] font-mono-telemetry">{c.phone}</span>
                </div>
                <a href={`tel:${c.phone}`} className="px-2.5 py-1 bg-white hover:bg-[#D9DDE3] text-[#142033] font-medium text-[11px] rounded border border-[#D9DDE3]">
                  Call
                </a>
              </div>
            ))}
          </div>
        </div>

        {/* Disclaimer Statement */}
        <div className="text-[11px] text-[#5F6B7A] leading-relaxed pt-2 border-t border-[#D9DDE3]">
          <strong>Important Statement:</strong> SaferPath provides route evidence and assistance tools. It does not automatically dispatch police or ambulance services. In life-threatening emergencies, dial 112 directly.
        </div>

        <Button variant="ghost" size="sm" className="w-full text-[#5F6B7A]" onClick={onClose}>
          Return to app
        </Button>
      </div>
    </div>
  );
};

export default EmergencySheet;
