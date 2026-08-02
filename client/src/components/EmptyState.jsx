import React from 'react';
import { Link } from 'react-router-dom';

const EmptyState = ({ icon: Icon, title, description, actionLabel, actionTo, suggestions = [] }) => {
  return (
    <div className="bg-surface/40 border border-border/60 rounded-2xl flex flex-col items-center justify-center py-12 sm:py-16 px-6 text-center animate-fade-in my-2">
      {Icon && (
        <div className="w-14 h-14 rounded-2xl bg-surface-raised border border-border flex items-center justify-center mb-4 text-amber shadow-sm">
          <Icon className="h-6 w-6" />
        </div>
      )}
      <h3 className="text-base font-bold text-text-primary mb-1 tracking-tight">{title}</h3>
      {description && (
        <p className="text-sm text-text-secondary max-w-sm leading-relaxed mb-1">{description}</p>
      )}

      {/* Optional starter suggestions */}
      {suggestions.length > 0 && (
        <div className="flex flex-wrap items-center justify-center gap-2 mt-4 mb-2">
          {suggestions.map((item) => (
            <span
              key={`suggestion-${item}`}
              className="text-xs px-2.5 py-1 rounded-lg bg-surface-raised border border-border text-text-tertiary"
            >
              {item}
            </span>
          ))}
        </div>
      )}

      {actionLabel && actionTo && (
        <Link
          to={actionTo}
          className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber text-text-inverse text-sm font-semibold hover:bg-amber-hover transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber focus-visible:ring-offset-2 focus-visible:ring-offset-canvas active:scale-[0.98]"
        >
          {actionLabel}
        </Link>
      )}
    </div>
  );
};

export default EmptyState;
