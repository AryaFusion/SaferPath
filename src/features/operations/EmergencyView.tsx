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
      <div className="space-y-1 pb-3 border-b border-[#D9DDE3]">
        <h1 className="text-2xl font-bold text-[#142033] tracking-tight">
          Emergency assistance
        </h1>
        <p className="text-xs text-[#5F6B7A]">
          Direct dial connection to official public emergency services (112) and user-initiated SMS alert dispatch.
        </p>
      </div>

      {/* Emergency Call Banner */}
      <div className="bg-rose-50 border border-rose-200 rounded-md p-4 space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-md bg-[#C83B4A] text-white flex items-center justify-center font-bold">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-[#C83B4A]">Official Emergency Hotline (112 / 100)</h2>
            <p className="text-xs text-rose-800">Direct telephone connection to public emergency dispatch operators.</p>
          </div>
        </div>

        <a href="tel:112" className="inline-block w-full sm:w-auto">
          <Button variant="caution" size="md" className="w-full">
            <Phone className="w-4 h-4" />
            <span>Call 112 Emergency Services</span>
          </Button>
        </a>
      </div>

      {/* Instant Contact Alert Broadcast Card */}
      <div className="bg-white border border-[#D9DDE3] rounded-md p-4 space-y-3">
        <h2 className="text-xs font-bold text-[#142033] uppercase font-mono-telemetry">
          User-Initiated Contact Broadcast
        </h2>
        <p className="text-xs text-[#5F6B7A] leading-relaxed">
          Trigger an urgent SMS message containing your destination context to your configured trusted contacts ({contacts.length}).
        </p>

        {broadcastSent && (
          <div className="p-2.5 bg-[#EBF2F1] border border-[#0B8F83]/30 text-[#0B8F83] text-xs font-semibold rounded-md flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span>Emergency SMS alert dispatched to {contacts.map((c) => c.name).join(', ')}.</span>
          </div>
        )}

        <Button
          variant="secondary"
          size="md"
          onClick={handleBroadcast}
          className="w-full sm:w-auto"
        >
          <Send className="w-3.5 h-3.5 text-[#142033]" />
          <span>Send SMS Alert to Trusted Contacts</span>
        </Button>
      </div>

      {/* Disclaimer */}
      <div className="p-3 rounded-md bg-[#F1F3F2] border border-[#D9DDE3] text-[#5F6B7A] text-xs">
        <strong>Important Statement:</strong> SaferPath does not automatically dispatch law enforcement or medical emergency services. In urgent situations, always dial 112 directly.
      </div>
    </div>
  );
};

export default EmergencyView;
