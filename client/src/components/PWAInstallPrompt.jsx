import React, { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';
import logomark from '../assets/branding/logomark.png';
import BRAND from '../config/branding';

const DISMISSAL_KEY = 'link_click_pwa_dismissed';
const DISMISSAL_DAYS = 14;

const PWAInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check dismissal status in localStorage
    const dismissedAt = localStorage.getItem(DISMISSAL_KEY);
    if (dismissedAt) {
      const daysPassed = (Date.now() - parseInt(dismissedAt, 10)) / (1000 * 60 * 60 * 24);
      if (daysPassed < DISMISSAL_DAYS) {
        return; // Suppress prompt within 14-day window
      }
    }

    // Suppress prompt if already running in standalone PWA mode
    if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true) {
      return;
    }

    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsVisible(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      console.log('[PWA] User accepted the install prompt');
    } else {
      console.log('[PWA] User dismissed the install prompt');
    }

    setDeferredPrompt(null);
    setIsVisible(false);
  };

  const handleDismiss = () => {
    localStorage.setItem(DISMISSAL_KEY, Date.now().toString());
    setIsVisible(false);
  };

  if (!isVisible || !deferredPrompt) return null;

  return (
    <div
      className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 animate-slide-up"
      role="dialog"
      aria-labelledby="pwa-install-title"
      aria-describedby="pwa-install-desc"
    >
      <div className="bg-surface border border-border p-4 rounded-2xl shadow-2xl flex items-start gap-3 backdrop-blur-lg bg-surface/95">
        <img
          src={logomark}
          alt=""
          aria-hidden="true"
          width="40"
          height="40"
          className="h-10 w-10 object-contain shrink-0 mt-0.5"
        />

        <div className="flex-1 min-w-0">
          <h3 id="pwa-install-title" className="text-sm font-bold text-text-primary flex items-center justify-between">
            <span>Install {BRAND.name}</span>
          </h3>
          <p id="pwa-install-desc" className="text-xs text-text-secondary mt-0.5 leading-relaxed">
            Install the app for a faster experience and quick access from your home screen.
          </p>

          <div className="flex items-center gap-2 mt-3">
            <button
              onClick={handleInstall}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber hover:bg-amber-hover text-text-inverse font-semibold text-xs transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber"
              aria-label={`Install ${BRAND.name} application`}
            >
              <Download className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Install</span>
            </button>

            <button
              onClick={handleDismiss}
              className="px-3 py-1.5 rounded-lg bg-surface-raised hover:bg-surface-hover text-text-secondary hover:text-text-primary font-medium text-xs border border-border transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber"
              aria-label="Dismiss installation prompt for 14 days"
            >
              Not Now
            </button>
          </div>
        </div>

        <button
          onClick={handleDismiss}
          className="text-text-muted hover:text-text-primary p-1 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber"
          aria-label="Close install dialog"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default PWAInstallPrompt;
