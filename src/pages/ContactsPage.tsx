import React, { useState } from 'react';
import { useSafety } from '../context/SafetyContext';

export const ContactsPage: React.FC = () => {
  const { contacts, addContact, removeContact } = useSafety();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [relationship, setRelationship] = useState('Family');

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
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Title */}
      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold text-stone-900 tracking-tight">
          Trusted contacts & check-ins
        </h1>
        <p className="text-sm text-stone-600 leading-relaxed max-w-2xl">
          Choose who receives your trip check-ins and estimated arrival times.
        </p>
      </div>

      {/* Contacts List */}
      <div className="space-y-3">
        <h3 className="text-base font-bold text-stone-900">Configured Emergency Contacts ({contacts.length})</h3>

        <div className="space-y-3">
          {contacts.map((c) => (
            <div
              key={c.id}
              className="bg-white border border-stone-200 rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-base font-bold text-stone-900">{c.name}</h4>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-stone-100 text-stone-700 border border-stone-200">
                    {c.relationship}
                  </span>
                </div>
                <p className="text-xs text-stone-500">{c.phone}</p>

                <div className="flex items-center gap-3 text-xs text-stone-600 pt-1">
                  <span>Check-ins: <strong className="text-emerald-700">Enabled</strong></span>
                  <span>•</span>
                  <span>ETA sharing: <strong className="text-emerald-700">Enabled</strong></span>
                </div>
              </div>

              <button
                onClick={() => removeContact(c.id)}
                className="px-3 py-1.5 text-xs text-rose-700 hover:text-rose-900 font-semibold bg-rose-50 border border-rose-200 rounded-xl hover:bg-rose-100 transition-colors cursor-pointer"
              >
                Revoke access
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Add New Contact Form Card */}
      <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-stone-900">Add New Trusted Contact</h3>

        <form onSubmit={handleAdd} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-stone-700 block">
                Contact Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Aarti Nandurkar"
                className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-400"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-stone-700 block">
                Phone Number *
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98221..."
                className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-400"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-2">
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-stone-700 block">
                Relationship
              </label>
              <select
                value={relationship}
                onChange={(e) => setRelationship(e.target.value)}
                className="px-4 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900"
              >
                <option value="Family">Family Member</option>
                <option value="Friend">Friend / Roommate</option>
                <option value="Colleague">Colleague</option>
                <option value="Campus Police">Campus Police</option>
              </select>
            </div>

            <button
              type="submit"
              className="px-6 py-2.5 bg-stone-900 hover:bg-stone-800 text-white font-semibold text-xs rounded-xl shadow-sm transition-all cursor-pointer self-end"
            >
              + Save Contact
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ContactsPage;
