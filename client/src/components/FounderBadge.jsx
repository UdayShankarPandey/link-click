import React from 'react';

const SIZE_MAP = {
  xs: 'px-1.5 py-0.2 text-[10px]',
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-0.5 text-xs',
  lg: 'px-3 py-1 text-sm',
};

/**
 * Single elevated Founder Badge component.
 * Displays 👑 Founder badge consistently across profiles, post cards, comments, and hovercards.
 */
const FounderBadge = ({ size = 'sm', className = '' }) => {
  const sizeClasses = SIZE_MAP[size] || SIZE_MAP.sm;

  return (
    <span
      className={`inline-flex items-center gap-1 font-semibold rounded-md bg-amber-muted text-amber border border-amber/20 shrink-0 ${sizeClasses} ${className}`}
      title="Platform Founder"
    >
      <span>👑</span>
      <span>Founder</span>
    </span>
  );
};

export default FounderBadge;
