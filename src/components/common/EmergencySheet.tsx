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
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-[#101828]/60 backdrop-blur-xs">
      <div
        className="w-full max-w-lg bg-white border border-[#DCE3EE] rounded-t-md sm:rounded-md shadow-lg p-5 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-start border-b border-[#DCE3EE] pb-2.5">
          <div>
            <span className="text-[10px] font-mono uppercase text-[#C62828] font-bold block">
              Emergency assistance
            </span>
            <h2 className="text-base font-bold text-[#172033]">
              Need official emergency assistance?
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-[#64748B] hover:text-[#172033] text-xs font-bold cursor-pointer"
            aria-label="Close sheet"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Primary Hotline Dial Action */}
        <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-md space-y-2.5">
          <div className="flex items-center gap-2.5">
            <Phone className="w-5 h-5 text-[#C62828] shrink-0" />
            <div>
              <h3 className="text-xs font-bold text-[#C62828]">Call official emergency services (112)</h3>
              <p className="text-[11px] text-rose-800">Direct line to public police and medical dispatch operators.</p>
            </div>
          </div>

          <a href="tel:112" className="block">
            <Button variant="caution" size="md" className="w-full">
              Direct dial 112
            </Button>
          </a>
        </div>

        {/* Secondary Contact Ping */}
        <div className="space-y-1.5">
          <span className="text-xs font-bold text-[#172033] font-mono block">
            Trusted contacts ({contacts.length}):
          </span>
          <div className="space-y-1">
            {contacts.map((c) => (
              <div key={c.id} className="flex justify-between items-center text-xs p-2 bg-[#F5F7FB] border border-[#DCE3EE] rounded-md">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-[#172033] text-xs">{c.name}</span>
                    {c.id.startsWith('c-') && (
                      <span className="px-1.5 py-0.2 text-[9px] font-mono font-semibold bg-[#F1F5F9] text-[#64748B] border border-[#CBD5E1] rounded">
                        Demo contact
                      </span>
                    )}
                  </div>
                  <span className="text-[#64748B] block text-[10px] font-mono">{c.phone}</span>
                </div>
                <a href={`tel:${c.phone}`} className="px-2.5 py-1 bg-white hover:bg-[#EFF6FF] text-[#172033] hover:text-[#2563EB] font-medium text-[11px] rounded border border-[#DCE3EE] transition-colors">
                  Call
                </a>
              </div>
            ))}
          </div>
        </div>

        {/* Disclaimer Statement */}
        <div className="text-[11px] text-[#64748B] leading-relaxed pt-2 border-t border-[#DCE3EE]">
          <strong>Important statement:</strong> SaferPath provides route evidence and assistance tools. It does not automatically dispatch police or ambulance services. In life-threatening emergencies, dial 112 directly.
        </div>

        <Button variant="ghost" size="sm" className="w-full text-[#64748B]" onClick={onClose}>
          Return to app
        </Button>
      </div>
    </div>
  );
};

export default EmergencySheet;
