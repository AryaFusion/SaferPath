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
      <div className="space-y-1 pb-3 border-b border-[#DCE3EE]">
        <h1 className="text-2xl font-bold text-[#172033] tracking-tight">
          Help nearby
        </h1>
        <p className="text-xs text-[#64748B]">
          Authorized physical locations where travelers can access verified help points or staffed desks.
        </p>
      </div>

      {/* Filter Category Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
        <span className="text-[#64748B] font-medium text-xs mr-1">Filter:</span>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilterCategory(cat)}
            className={`px-2.5 py-1 rounded text-xs transition-colors cursor-pointer font-medium ${
              filterCategory === cat
                ? 'bg-[#2563EB] text-white'
                : 'bg-[#F5F7FB] text-[#64748B] hover:bg-[#EFF6FF] hover:text-[#2563EB]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Dense List Rows */}
      <div className="bg-white border border-[#DCE3EE] rounded-md divide-y divide-[#DCE3EE]">
        {filteredPoints.map((hp) => (
          <div
            key={hp.id}
            className="p-3.5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 hover:bg-[#F5F7FB] transition-colors"
          >
            <div className="space-y-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-[#172033] text-xs">{hp.name}</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#F5F7FB] text-[#172033] border border-[#DCE3EE]">
                  {hp.category}
                </span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                    hp.status === 'Open & Lit' || hp.status === '24/7 Staffed'
                      ? 'bg-[#EFF6FF] text-[#0F766E] border-[#0F766E]/30'
                      : 'bg-[#F5F7FB] text-[#64748B] border-[#DCE3EE]'
                  }`}
                >
                  {hp.status}
                </span>
                <span className="text-[11px] font-mono text-[#64748B]">
                  {hp.distanceMeters}m away
                </span>
              </div>

              <div className="flex items-center gap-1.5 text-xs text-[#64748B]">
                <MapPin className="w-3.5 h-3.5 text-[#64748B] shrink-0" />
                <span className="truncate">{hp.address}</span>
              </div>

              <div className="text-[11px] font-mono text-[#64748B] flex items-center gap-1.5 flex-wrap">
                <div className="flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-[#2563EB]" />
                  <span>Authority log: {hp.verificationAuthority} ({hp.verifiedTime})</span>
                </div>
                <span className="text-[10px] text-[#64748B] bg-[#F5F7FB] px-1.5 py-0.2 rounded border border-[#DCE3EE]">
                  Demo data
                </span>
              </div>
            </div>

            {/* Action */}
            {hp.phone && (
              <a href={`tel:${hp.phone}`} className="shrink-0 w-full sm:w-auto">
                <Button variant="outline" size="sm" className="w-full text-xs">
                  <Phone className="w-3 h-3 text-[#2563EB]" />
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
