import React from 'react';
import type { SupportLevel, ContextConfidence } from '../../lib/types';

interface SupportBadgeProps {
  level: SupportLevel;
  className?: string;
}

export const SupportBadge: React.FC<SupportBadgeProps> = ({ level, className = '' }) => {
  let styles = 'bg-stone-100 text-stone-800 border-stone-300';
  let icon = 'ℹ️';

  if (level === 'Stronger Contextual Support') {
    styles = 'bg-teal-50 text-teal-900 border-teal-300';
    icon = '🛡️';
  } else if (level === 'Mixed Context') {
    styles = 'bg-amber-50 text-amber-900 border-amber-300';
    icon = '⚖️';
  } else if (level === 'Caution Segment') {
    styles = 'bg-rose-50 text-rose-900 border-rose-300';
    icon = '⚠️';
  } else if (level === 'Limited Data' || level === 'Stale Evidence') {
    styles = 'bg-stone-100 text-stone-700 border-stone-300';
    icon = '🔍';
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold border ${styles} ${className}`}>
      <span aria-hidden="true">{icon}</span>
      <span>{level}</span>
    </span>
  );
};

export const ConfidenceBadge: React.FC<{ confidence: ContextConfidence }> = ({ confidence }) => {
  let badgeStyle = 'bg-stone-100 text-stone-700 border-stone-200';
  if (confidence === 'High') {
    badgeStyle = 'bg-teal-50 text-teal-800 border-teal-200';
  } else if (confidence === 'Moderate') {
    badgeStyle = 'bg-amber-50 text-amber-800 border-amber-200';
  }

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono-code font-medium border ${badgeStyle}`}>
      <span>Confidence:</span>
      <strong>{confidence}</strong>
    </span>
  );
};
