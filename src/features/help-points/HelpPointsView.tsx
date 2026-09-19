import React, { useState } from 'react';
import { useSafety } from '../../context/SafetyContext';
import Button from '../../components/common/Button';
import { MapPin, Phone, ShieldCheck } from 'lucide-react';

export const HelpPointsView: React.FC = () => {
  const { helpPoints } = useSafety();
  const [filterCategory, setFilterCategory] = useState<string>('All');

  const categories = ['All', 'Pharmacy', 'Transit Desk', 'Police Desk', 'Commercial Haven'];

  const filteredPoints = helpPoints.filter((hp) =>
    filterCategory === 'All' ? true : hp.category === filterCategory
  );

  return (
    <div className="space-y-4 max-w-4xl mx-auto px-1">
      {/* Title */}
      <div className="space-y-1 pb-3 border-b border-[#D9DDE3]">
        <h1 className="text-2xl font-bold text-[#142033] tracking-tight">
          Help nearby
        </h1>
        <p className="text-xs text-[#5F6B7A]">
          Authorized physical locations where travelers can access verified help points or staffed desks.
        </p>
      </div>

      {/* Filter Category Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
        <span className="text-[#5F6B7A] font-medium text-xs mr-1">Filter:</span>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilterCategory(cat)}
            className={`px-2.5 py-1 rounded-md text-xs transition-colors cursor-pointer font-medium ${
              filterCategory === cat
                ? 'bg-[#142033] text-white'
                : 'bg-[#F1F3F2] text-[#5F6B7A] hover:bg-[#D9DDE3] hover:text-[#142033]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Dense List Rows */}
      <div className="bg-white border border-[#D9DDE3] rounded-md divide-y divide-[#D9DDE3]">
        {filteredPoints.map((hp) => (
          <div
            key={hp.id}
            className="p-3.5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 hover:bg-[#FAF9F6] transition-colors"
          >
            <div className="space-y-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-[#142033] text-xs">{hp.name}</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#F1F3F2] text-[#142033] border border-[#D9DDE3]">
                  {hp.category}
                </span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                    hp.status === 'Open & Lit' || hp.status === '24/7 Staffed'
                      ? 'bg-[#EBF2F1] text-[#0B8F83] border-[#0B8F83]/30'
                      : 'bg-[#F1F3F2] text-[#5F6B7A] border-[#D9DDE3]'
                  }`}
                >
                  {hp.status}
                </span>
                <span className="text-[11px] font-mono-telemetry text-[#5F6B7A]">
                  {hp.distanceMeters}m away
                </span>
              </div>

              <div className="flex items-center gap-1.5 text-xs text-[#5F6B7A]">
                <MapPin className="w-3.5 h-3.5 text-[#5F6B7A] shrink-0" />
                <span className="truncate">{hp.address}</span>
              </div>

              <div className="text-[11px] font-mono-telemetry text-[#5F6B7A] flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-[#0B8F83]" />
                <span>Verified by {hp.verificationAuthority} ({hp.verifiedTime})</span>
              </div>
            </div>

            {/* Action */}
            {hp.phone && (
              <a href={`tel:${hp.phone}`} className="shrink-0 w-full sm:w-auto">
                <Button variant="outline" size="sm" className="w-full text-xs">
                  <Phone className="w-3 h-3 text-[#0B8F83]" />
                  <span>Call {hp.phone.split('/')[0]}</span>
                </Button>
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default HelpPointsView;
