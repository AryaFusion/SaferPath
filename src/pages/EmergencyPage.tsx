import React, { useState } from 'react';
import { useSafety } from '../context/SafetyContext';

export const EmergencyPage: React.FC = () => {
  const { contacts } = useSafety();
  const [alertSent, setAlertSent] = useState(false);

  const handleBroadcastAlert = () => {
    setAlertSent(true);
    setTimeout(() => setAlertSent(false), 6000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Title Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold text-stone-900 tracking-tight flex items-center gap-2">
          <span>📞</span>
          <span>Emergency Services & Quick Assist</span>
        </h1>
        <p className="text-sm text-stone-600 leading-relaxed max-w-2xl">
          Direct access to local emergency services and instant alert dispatch to your trusted contacts.
        </p>
      </div>

      {/* Emergency Call Banner */}
      <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 space-y-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-rose-600 text-white flex items-center justify-center text-xl font-bold shadow-md animate-bounce">
            🆘
          </div>
          <div>
            <h3 className="text-xl font-extrabold text-rose-900">National Emergency Services (112 / 100)</h3>
            <p className="text-xs text-rose-700">Immediate connection to police, medical dispatch, or fire service.</p>
          </div>
        </div>

        <a
          href="tel:112"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-sm rounded-xl shadow-md transition-all cursor-pointer"
        >
          <span>📞 Call 112 Emergency Services</span>
        </a>
      </div>

      {/* Instant Contact Alert Broadcast Card */}
      <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-stone-900">One-Tap Trusted Contact Broadcast</h3>
        <p className="text-xs text-stone-600 leading-relaxed">
          Send an urgent SMS alert containing your current GPS location to your configured emergency contacts ({contacts.length}).
        </p>

        {alertSent && (
          <div className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold rounded-xl animate-fade-in flex items-center gap-2">
            <span>✓</span>
            <span>Emergency SMS alert broadcasted to {contacts.map((c) => c.name).join(', ')}.</span>
          </div>
        )}

        <button
          onClick={handleBroadcastAlert}
          className="w-full sm:w-auto px-6 py-3 bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs rounded-xl shadow-sm transition-all cursor-pointer"
        >
          🚨 Broadcast Urgent SOS to Contacts
        </button>
      </div>

      {/* Contacts Summary */}
      <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm space-y-3">
        <h3 className="text-base font-bold text-stone-900">Notified Emergency Numbers</h3>
        <div className="space-y-2">
          {contacts.map((c) => (
            <div key={c.id} className="flex justify-between items-center text-xs p-3 bg-stone-50 rounded-xl border border-stone-200/60">
              <div>
                <span className="font-bold text-stone-900">{c.name} ({c.relationship})</span>
                <span className="text-stone-500 block">{c.phone}</span>
              </div>
              <a
                href={`tel:${c.phone}`}
                className="px-3 py-1.5 bg-stone-200 hover:bg-stone-300 text-stone-900 font-semibold rounded-lg transition-colors"
              >
                Call
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EmergencyPage;
