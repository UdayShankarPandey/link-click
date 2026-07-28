import React, { useEffect, useRef } from 'react';
import { AlertTriangle, X } from 'lucide-react';

const ConfirmDialog = ({ open, title, message, confirmLabel = 'Delete', onConfirm, onCancel, variant = 'danger' }) => {
  const confirmBtnRef = useRef(null);
  const dialogRef = useRef(null);

  useEffect(() => {
    if (open) {
      // Focus the cancel-like element or dialog on open
      confirmBtnRef.current?.focus();
      // Trap focus and handle Escape
      const handleKeyDown = (e) => {
        if (e.key === 'Escape') onCancel();
      };
      document.addEventListener('keydown', handleKeyDown);
      // Prevent body scroll
      document.body.style.overflow = 'hidden';
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
        document.body.style.overflow = '';
      };
    }
  }, [open, onCancel]);

  if (!open) return null;

  const btnClass = variant === 'danger'
    ? 'bg-danger hover:bg-red-600 text-white'
    : 'bg-amber hover:bg-amber-hover text-text-inverse';

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4 animate-overlay-in" role="dialog" aria-modal="true" aria-labelledby="confirm-title">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onCancel}></div>

      {/* Dialog */}
      <div ref={dialogRef} className="relative bg-surface-raised border border-border rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-fade-in-scale">
        <button
          type="button"
          onClick={onCancel}
          className="absolute top-4 right-4 p-1 rounded-md text-text-tertiary hover:text-text-primary transition-colors cursor-pointer"
          aria-label="Close dialog"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-start gap-4">
          <div className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${variant === 'danger' ? 'bg-danger-muted text-danger' : 'bg-amber-muted text-amber'}`}>
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 id="confirm-title" className="text-base font-semibold text-text-primary">{title}</h3>
            <p className="text-sm text-text-secondary mt-1 leading-relaxed">{message}</p>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-lg text-sm font-medium text-text-secondary bg-surface hover:bg-surface-raised border border-border transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            ref={confirmBtnRef}
            onClick={onConfirm}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors cursor-pointer ${btnClass}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
