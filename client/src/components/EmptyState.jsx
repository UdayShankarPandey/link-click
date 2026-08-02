import React from 'react';
import { Link } from 'react-router-dom';

const EmptyState = ({ icon: Icon, title, description, actionLabel, actionTo }) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center animate-fade-in">
      {Icon && (
        <div className="w-14 h-14 rounded-2xl bg-surface-raised border border-border flex items-center justify-center mb-4">
          <Icon className="h-6 w-6 text-text-tertiary" />
        </div>
      )}
      <h3 className="text-base font-semibold text-text-primary mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-text-secondary max-w-xs">{description}</p>
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
