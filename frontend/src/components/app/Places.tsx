import { Home, Briefcase, GraduationCap } from "lucide-react";

const places = [
  { label: "Home", icon: Home },
  { label: "College", icon: GraduationCap },
  { label: "Work", icon: Briefcase },
];

export default function Places({ onSelect }: { onSelect?: (place: string) => void }) {
  return (
    <div className="mt-4 flex items-center gap-2 px-1">
      <span className="text-xs font-semibold text-slate-400 whitespace-nowrap">Your places</span>
      <div className="flex gap-2 overflow-x-auto">
        {places.map((place) => (
          <button
            key={place.label}
            onClick={() => onSelect?.(place.label)}
            className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 shadow-sm transition-all hover:border-slate-300 hover:bg-slate-50 whitespace-nowrap"
          >
            <place.icon className="h-3.5 w-3.5 text-slate-400" />
            {place.label}
          </button>
        ))}
      </div>
    </div>
  );
}
