import React from 'react';
import type { SupportLevel, ContextConfidence } from '../../lib/types';

interface ContextBandProps {
  level: SupportLevel;
  className?: string;
}

export const ContextBand: React.FC<ContextBandProps> = ({ level, className = '' }) => {
  let accentDot = 'bg-stone-500';
  let textColor = 'text-stone-800';

  if (level === 'Stronger Contextual Support') {
    accentDot = 'bg-teal-600';
    textColor = 'text-teal-900';
  } else if (level === 'Mixed Context') {
    accentDot = 'bg-amber-600';
    textColor = 'text-amber-900';
  } else if (level === 'Caution Segment') {
    accentDot = 'bg-rose-600';
    textColor = 'text-rose-900';
  } else if (level === 'Limited Data' || level === 'Stale Evidence') {
    accentDot = 'bg-stone-400';
    textColor = 'text-stone-700';
  }

  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${textColor} ${className}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${accentDot}`} aria-hidden="true" />
      <span>{level}</span>
    </span>
  );
};

export const ConfidenceInline: React.FC<{ confidence: ContextConfidence }> = ({ confidence }) => {
  return (
    <span className="text-xs text-[#64748B] font-mono">
      Context availability: <strong className="text-[#172033] font-semibold">{confidence}</strong>
    </span>
  );
};
