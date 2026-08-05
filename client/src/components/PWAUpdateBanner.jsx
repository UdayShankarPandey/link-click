import React from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { RefreshCw, X } from 'lucide-react';
import BRAND from '../config/branding';

const PWAUpdateBanner = () => {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(swUrl, r) {
      if (r) {
        // Check for updates every 60 minutes
        setInterval(() => {
          r.update();
        }, 60 * 60 * 1000);
      }
    },
    onRegisterError(error) {
      console.error('[PWA] Service Worker registration failed:', error);
    },
  });

  const handleClose = () => {
    setNeedRefresh(false);
  };

  if (!needRefresh) return null;

  return (
    <div
      className="fixed bottom-4 right-4 z-50 max-w-sm animate-slide-up"
      role="status"
      aria-live="polite"
      aria-labelledby="pwa-update-title"
    >
      <div className="border border-amber/40 p-4 rounded-2xl shadow-2xl backdrop-blur-lg bg-surface/95 flex items-start gap-3">
        <div className="p-2 rounded-xl bg-amber-muted text-amber shrink-0 mt-0.5">
          <RefreshCw className="h-5 w-5" aria-hidden="true" />
        </div>

        <div className="flex-1 min-w-0">
          <h3 id="pwa-update-title" className="text-sm font-bold text-text-primary">
            Update Available ({BRAND.version})
          </h3>
          <p className="text-xs text-text-secondary mt-0.5 leading-relaxed">
            A new version of {BRAND.name} is ready. Reload to apply updates.
          </p>

          <div className="flex items-center gap-2 mt-3">
            <button
              onClick={() => updateServiceWorker(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber hover:bg-amber-hover text-text-inverse font-semibold text-xs transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber"
              aria-label="Reload application to update to latest version"
            >
              <span>Reload to Update</span>
            </button>

            <button
              onClick={handleClose}
              className="px-3 py-1.5 rounded-lg bg-surface-raised hover:bg-surface-hover text-text-secondary hover:text-text-primary font-medium text-xs border border-border transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber"
              aria-label="Dismiss update notification"
            >
              Dismiss
            </button>
          </div>
        </div>

        <button
          onClick={handleClose}
          className="text-text-muted hover:text-text-primary p-1 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber"
          aria-label="Close update notification"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default PWAUpdateBanner;
