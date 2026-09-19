import React, { useState } from 'react';
import { useSafety } from '../../context/SafetyContext';
import Button from '../../components/common/Button';
import { AlertTriangle, Phone, ShieldCheck, Send } from 'lucide-react';

export const EmergencyView: React.FC = () => {
  const { contacts } = useSafety();
  const [broadcastSent, setBroadcastSent] = useState(false);

  const handleBroadcast = () => {
    setBroadcastSent(true);
    setTimeout(() => setBroadcastSent(false), 6000);
  };

  return (
    <div className="space-y-4 max-w-4xl mx-auto px-1">
      {/* Title */}
      <div className="space-y-1 pb-3 border-b border-[#DCE3EE]">
        <h1 className="text-2xl font-bold text-[#172033] tracking-tight">
          Emergency assistance
        </h1>
        <p className="text-xs text-[#64748B]">
          Direct dial connection to official public emergency services (112) and user-initiated SMS alert dispatch.
        </p>
      </div>

      {/* Emergency Call Banner */}
      <div className="bg-rose-50 border border-rose-200 rounded-md p-4 space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-md bg-[#C62828] text-white flex items-center justify-center font-bold">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-[#C62828]">Official emergency hotline (112 / 100)</h2>
            <p className="text-xs text-rose-800">Direct telephone connection to public emergency dispatch operators.</p>
          </div>
        </div>

        <a href="tel:112" className="inline-block w-full sm:w-auto">
          <Button variant="caution" size="md" className="w-full">
            <Phone className="w-4 h-4" />
            <span>Call 112 emergency services</span>
          </Button>
        </a>
      </div>

      {/* Instant Contact Alert Broadcast Card */}
      <div className="bg-white border border-[#DCE3EE] rounded-md p-4 space-y-3">
        <h2 className="text-xs font-bold text-[#172033] font-mono">
          User-initiated contact broadcast
        </h2>
        <p className="text-xs text-[#64748B] leading-relaxed">
          Trigger an urgent SMS message containing your destination context to your configured trusted contacts ({contacts.length}).
        </p>

        {broadcastSent && (
          <div className="p-2.5 bg-[#EFF6FF] border border-[#2563EB]/30 text-[#2563EB] text-xs font-semibold rounded-md flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 shrink-0 text-[#2563EB]" />
            <span>Emergency SMS alert dispatched to {contacts.map((c) => c.name).join(', ')}.</span>
          </div>
        )}

        <Button
          variant="secondary"
          size="md"
          onClick={handleBroadcast}
          className="w-full sm:w-auto"
        >
          <Send className="w-3.5 h-3.5 text-[#172033]" />
          <span>Send SMS alert to trusted contacts</span>
        </Button>
      </div>

      {/* Disclaimer */}
      <div className="p-3 rounded-md bg-[#F5F7FB] border border-[#DCE3EE] text-[#64748B] text-xs">
        <strong>Important statement:</strong> SaferPath does not automatically dispatch law enforcement or medical emergency services. In urgent situations, always dial 112 directly.
      </div>
    </div>
  );
};

export default EmergencyView;
