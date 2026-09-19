import React, { useState } from 'react';
import { useSafety } from '../../context/SafetyContext';
import Button from '../../components/common/Button';
import { MapPin, Plus, Trash2 } from 'lucide-react';

export const ContactsView: React.FC = () => {
  const { contacts, addContact, removeContact, setOriginLocation, setDestinationLocation, setTab } = useSafety();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [relationship, setRelationship] = useState('Family');

  const savedPlaces = [
    { id: 'sp-1', name: 'HOME', address: 'Shivaji Park, Mumbai' },
    { id: 'sp-2', name: 'TRANSIT HUB', address: 'Dadar Station West, Mumbai' },
    { id: 'sp-3', name: 'CAMPUS', address: 'Matunga West, Mumbai' },
  ];

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) return;

    addContact({
      name,
      phone,
      relationship,
      sharesCheckIns: true,
      sharesETA: true,
    });

    setName('');
    setPhone('');
  };

  return (
    <div className="space-y-4 max-w-4xl mx-auto px-1">
      {/* Title */}
      <div className="space-y-1 pb-3 border-b border-[#D9DDE3]">
        <h1 className="text-2xl font-bold text-[#142033] tracking-tight">
          Saved places & contacts
        </h1>
        <p className="text-xs text-[#5F6B7A]">
          Manage saved frequent locations and trusted check-in contacts for active walks.
        </p>
      </div>

      {/* Section 1: Saved Places List */}
      <div className="space-y-2">
        <h2 className="text-xs font-bold text-[#5F6B7A] uppercase font-mono-telemetry">
          Saved Frequent Locations
        </h2>
        <div className="bg-white border border-[#D9DDE3] rounded-md divide-y divide-[#D9DDE3]">
          {savedPlaces.map((sp) => (
            <div key={sp.id} className="p-3 flex items-center justify-between text-xs hover:bg-[#FAF9F6]">
              <div className="flex items-center gap-2.5">
                <MapPin className="w-4 h-4 text-[#0B8F83] shrink-0" />
                <div>
                  <span className="font-bold text-[#142033] font-mono-telemetry text-[11px] block">{sp.name}</span>
                  <span className="text-[#5F6B7A] text-xs">{sp.address}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setOriginLocation(sp.address);
                    setTab('/route');
                  }}
                  className="px-2.5 py-1 text-[11px] font-medium bg-[#F1F3F2] text-[#142033] hover:bg-[#D9DDE3] rounded-md transition-colors cursor-pointer"
                >
                  Use as origin
                </button>
                <button
                  onClick={() => {
                    setDestinationLocation(sp.address);
                    setTab('/route');
                  }}
                  className="px-2.5 py-1 text-[11px] font-medium bg-[#F1F3F2] text-[#142033] hover:bg-[#D9DDE3] rounded-md transition-colors cursor-pointer"
                >
                  Use as destination
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <hr className="border-[#D9DDE3]" />

      {/* Section 2: Trusted Contacts List */}
      <div className="space-y-2">
        <h2 className="text-xs font-bold text-[#5F6B7A] uppercase font-mono-telemetry">
          Trusted Contacts ({contacts.length})
        </h2>

        <div className="bg-white border border-[#D9DDE3] rounded-md divide-y divide-[#D9DDE3]">
          {contacts.map((c) => (
            <div
              key={c.id}
              className="p-3.5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 hover:bg-[#FAF9F6]"
            >
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-[#142033] text-xs">{c.name}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#F1F3F2] text-[#142033] border border-[#D9DDE3]">
                    {c.relationship}
                  </span>
                </div>
                <div className="text-[11px] font-mono-telemetry text-[#5F6B7A]">{c.phone}</div>
              </div>

              <button
                onClick={() => removeContact(c.id)}
                className="px-2.5 py-1 text-xs font-medium text-[#C83B4A] hover:bg-rose-50 border border-rose-200 rounded-md transition-colors cursor-pointer flex items-center gap-1"
              >
                <Trash2 className="w-3 h-3" />
                <span>Revoke access</span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Section 3: Add Contact Form */}
      <div className="bg-white border border-[#D9DDE3] rounded-md p-4 space-y-3">
        <h2 className="text-xs font-bold text-[#142033] uppercase font-mono-telemetry">Add trusted contact</h2>

        <form onSubmit={handleAdd} className="space-y-3 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-[#142033] block">
                Contact Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Aarti Nandurkar"
                className="w-full px-3 py-1.5 bg-white border border-[#D9DDE3] rounded-md text-xs text-[#142033] focus-visible-ring"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-[#142033] block">
                Phone Number *
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98221..."
                className="w-full px-3 py-1.5 bg-white border border-[#D9DDE3] rounded-md text-xs text-[#142033] focus-visible-ring"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pt-1">
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-[#142033] block">
                Relationship
              </label>
              <select
                value={relationship}
                onChange={(e) => setRelationship(e.target.value)}
                className="px-2.5 py-1.5 bg-white border border-[#D9DDE3] rounded-md text-xs text-[#142033] focus-visible-ring"
              >
                <option value="Family">Family Member</option>
                <option value="Friend">Friend / Roommate</option>
                <option value="Colleague">Colleague</option>
                <option value="Campus Police">Campus Desk</option>
              </select>
            </div>

            <Button type="submit" variant="primary" size="sm">
              <Plus className="w-3.5 h-3.5" />
              <span>Save Contact</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ContactsView;
