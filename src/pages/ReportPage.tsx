import React, { useState } from 'react';
import { useSafety } from '../context/SafetyContext';

export const ReportPage: React.FC = () => {
  const { reports, addReport } = useSafety();

  const [category, setCategory] = useState<'lighting' | 'pavement' | 'sightlines' | 'shop' | 'other'>('lighting');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [submittedMessage, setSubmittedMessage] = useState(false);

  const getCategoryLabel = (cat: string) => {
    switch (cat) {
      case 'lighting': return 'Street light not working';
      case 'pavement': return 'Pavement blocked or broken';
      case 'sightlines': return 'Overgrown or blocked sightlines';
      case 'shop': return 'Open shop or active desk';
      default: return 'Other physical condition';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!location || !description) return;

    addReport({
      category,
      categoryLabel: getCategoryLabel(category),
      location,
      description,
      isAnonymous,
    });

    setSubmittedMessage(true);
    setLocation('');
    setDescription('');
    setTimeout(() => setSubmittedMessage(false), 4000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Title */}
      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold text-stone-900 tracking-tight">
          Report a street condition
        </h1>
        <p className="text-sm text-stone-600 leading-relaxed max-w-2xl">
          Share physical observations to help others judge route context.
        </p>
      </div>

      {/* Principle Banner */}
      <div className="p-4 rounded-xl bg-stone-100 border border-stone-200 text-stone-800 text-xs font-medium flex items-center gap-2">
        <span className="text-base">🛡️</span>
        <span>
          <strong>Principles first:</strong> Reports describe places and conditions — never people.
        </span>
      </div>

      {/* Form Card */}
      <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm space-y-5">
        {submittedMessage && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl animate-fade-in">
            ✓ Observation submitted. Thank you for contributing to route context!
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-stone-700 block">
              Condition category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as any)}
              className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-400"
            >
              <option value="lighting">💡 Street light not working</option>
              <option value="pavement">🚧 Pavement blocked or broken</option>
              <option value="sightlines">🌿 Overgrown or blocked sightlines</option>
              <option value="shop">🏪 Open shop or active desk</option>
              <option value="other">📍 Other physical condition</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-stone-700 block">
              Location / Landmark *
            </label>
            <input
              type="text"
              required
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Corner of 4th Ave & Main Flyover"
              className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-400"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-stone-700 block">
              Observation details *
            </label>
            <textarea
              rows={3}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the physical condition (e.g. 2 light poles unlit on west side)..."
              className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-400 resize-none"
            />
          </div>

          <label className="flex items-center gap-2 text-xs text-stone-700 cursor-pointer pt-1">
            <input
              type="checkbox"
              checked={isAnonymous}
              onChange={(e) => setIsAnonymous(e.target.checked)}
              className="w-4 h-4 accent-stone-900 rounded cursor-pointer"
            />
            <span>Submit anonymously (do not link to my profile)</span>
          </label>

          <button
            type="submit"
            className="w-full py-3 bg-stone-900 hover:bg-stone-800 text-white font-semibold text-xs rounded-xl shadow-sm transition-all cursor-pointer"
          >
            Submit observation
          </button>
        </form>
      </div>

      {/* Recent Observations List */}
      <div className="space-y-3">
        <h3 className="text-base font-bold text-stone-900">Recent Street Observations</h3>
        <div className="space-y-3">
          {reports.map((rep) => (
            <div key={rep.id} className="bg-white border border-stone-200 rounded-xl p-4 space-y-1">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-stone-900">{rep.categoryLabel}</span>
                <span className="text-stone-400">{rep.timeAgo}</span>
              </div>
              <p className="text-xs text-stone-600">{rep.description}</p>
              <div className="text-[11px] text-stone-400 pt-1">
                📍 {rep.location} · {rep.isAnonymous ? 'Anonymous' : 'Community Contributor'}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ReportPage;
