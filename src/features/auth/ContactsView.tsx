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
    { id: 'sp-1', name: 'Home', address: 'Shivaji Park, Mumbai' },
    { id: 'sp-2', name: 'Transit Hub', address: 'Dadar Station West, Mumbai' },
    { id: 'sp-3', name: 'Campus', address: 'Matunga West, Mumbai' },
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
      <div className="space-y-1 pb-3 border-b border-[#DCE3EE]">
        <h1 className="text-2xl font-bold text-[#172033] tracking-tight">
          Saved places & contacts
        </h1>
        <p className="text-xs text-[#64748B]">
          Manage saved frequent locations and trusted check-in contacts for active walks.
        </p>
      </div>

      {/* Section 1: Saved Places List */}
      <div className="space-y-2">
        <h2 className="text-xs font-bold text-[#64748B] uppercase font-mono">
          Saved frequent locations
        </h2>
        <div className="bg-white border border-[#DCE3EE] rounded-md divide-y divide-[#DCE3EE]">
          {savedPlaces.map((sp) => (
            <div key={sp.id} className="p-3 flex items-center justify-between text-xs hover:bg-[#F5F7FB] transition-colors">
              <div className="flex items-center gap-2.5">
                <MapPin className="w-4 h-4 text-[#2563EB] shrink-0" />
                <div>
                  <span className="font-bold text-[#172033] text-xs block">{sp.name}</span>
                  <span className="text-[#64748B] text-xs">{sp.address}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setOriginLocation(sp.address);
                    setTab('/route');
                  }}
                  className="px-2.5 py-1 text-[11px] font-medium bg-[#F5F7FB] text-[#172033] hover:bg-[#EFF6FF] hover:text-[#2563EB] border border-[#DCE3EE] rounded transition-colors cursor-pointer"
                >
                  Use as origin
                </button>
                <button
                  onClick={() => {
                    setDestinationLocation(sp.address);
                    setTab('/route');
                  }}
                  className="px-2.5 py-1 text-[11px] font-medium bg-[#F5F7FB] text-[#172033] hover:bg-[#EFF6FF] hover:text-[#2563EB] border border-[#DCE3EE] rounded transition-colors cursor-pointer"
                >
                  Use as destination
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <hr className="border-[#DCE3EE]" />

      {/* Section 2: Trusted Contacts List */}
      <div className="space-y-2">
        <h2 className="text-xs font-bold text-[#64748B] uppercase font-mono">
          Trusted contacts ({contacts.length})
        </h2>

        <div className="bg-white border border-[#DCE3EE] rounded-md divide-y divide-[#DCE3EE]">
          {contacts.map((c) => (
            <div
              key={c.id}
              className="p-3.5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 hover:bg-[#F5F7FB]"
            >
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-[#172033] text-xs">{c.name}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#F5F7FB] text-[#172033] border border-[#DCE3EE]">
                    {c.relationship}
                  </span>
                </div>
                <div className="text-[11px] font-mono text-[#64748B]">{c.phone}</div>
              </div>

              <button
                onClick={() => removeContact(c.id)}
                className="px-2.5 py-1 text-xs font-medium text-[#C62828] hover:bg-rose-50 border border-rose-200 rounded transition-colors cursor-pointer flex items-center gap-1"
              >
                <Trash2 className="w-3 h-3" />
                <span>Revoke access</span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Section 3: Add Contact Form */}
      <div className="bg-white border border-[#DCE3EE] rounded-md p-4 space-y-3">
        <h2 className="text-xs font-bold text-[#172033] font-mono">Add trusted contact</h2>

        <form onSubmit={handleAdd} className="space-y-3 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-[#172033] block">
                Contact name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Aarti Nandurkar"
                className="w-full px-3 py-1.5 bg-white border border-[#DCE3EE] rounded-md text-xs text-[#172033] focus-visible-ring"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-[#172033] block">
                Phone number *
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98221..."
                className="w-full px-3 py-1.5 bg-white border border-[#DCE3EE] rounded-md text-xs text-[#172033] focus-visible-ring"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pt-1">
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-[#172033] block">
                Relationship
              </label>
              <select
                value={relationship}
                onChange={(e) => setRelationship(e.target.value)}
                className="px-2.5 py-1.5 bg-white border border-[#DCE3EE] rounded-md text-xs text-[#172033] focus-visible-ring"
              >
                <option value="Family">Family member</option>
                <option value="Friend">Friend / roommate</option>
                <option value="Colleague">Colleague</option>
                <option value="Campus Police">Campus desk</option>
              </select>
            </div>

            <Button type="submit" variant="primary" size="sm">
              <Plus className="w-3.5 h-3.5" />
              <span>Save contact</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ContactsView;
