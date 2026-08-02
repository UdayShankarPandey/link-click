import React from 'react';

/**
 * Single elevated Founder Badge component.
 * Displays 👑 Founder badge consistently across profiles, post cards, comments, and hovercards.
 */
const FounderBadge = ({ size = 'sm', className = '' }) => {
  const sizeClasses = size === 'xs' 
    ? 'px-1.5 py-0.2 text-[10px]' 
    : size === 'lg' 
    ? 'px-3 py-1 text-sm' 
    : 'px-2 py-0.5 text-xs';

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
