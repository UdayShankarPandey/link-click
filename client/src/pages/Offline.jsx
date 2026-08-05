import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { WifiOff, RefreshCw, Home } from 'lucide-react';
import logomark from '../assets/branding/logomark.png';
import BRAND from '../config/branding';

const Offline = () => {
  const [isChecking, setIsChecking] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      window.location.reload();
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleRetry = () => {
    setIsChecking(true);
    setTimeout(() => {
      if (navigator.onLine) {
        window.location.reload();
      } else {
        setIsChecking(false);
      }
    }, 600);
  };

  return (
    <div
      className="min-h-[75vh] flex flex-col items-center justify-center px-4 text-center animate-fade-in"
      role="region"
      aria-label="Offline status page"
    >
      <div className="bg-surface border border-border p-8 rounded-2xl max-w-md w-full shadow-xl relative overflow-hidden">
        {/* Ambient Top Glow */}
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-40 h-40 bg-amber/10 rounded-full blur-2xl pointer-events-none" />

        {/* Branding Logomark */}
        <div className="flex justify-center mb-4">
          <img
            src={logomark}
            alt=""
            aria-hidden="true"
            width="56"
            height="56"
            className="h-14 w-14 object-contain"
          />
        </div>

        {/* Icon & Title */}
        <div className="inline-flex items-center justify-center p-3 rounded-full bg-amber-muted text-amber mb-4">
          <WifiOff className="h-6 w-6" aria-hidden="true" />
        </div>

        <h1 className="text-2xl font-bold text-text-primary mb-2">
          You are currently offline
        </h1>

        <p className="text-text-secondary text-sm mb-6 leading-relaxed">
          {BRAND.name} requires an active internet connection to load new posts and sync community activity.
          {isOnline ? ' Connection restored! Reloading...' : ' Check your connection and try again.'}
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={handleRetry}
            disabled={isChecking}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-amber hover:bg-amber-hover text-text-inverse font-semibold text-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber focus-visible:ring-offset-2 focus-visible:ring-offset-canvas disabled:opacity-50"
            aria-label="Retry network connection"
          >
            <RefreshCw className={`h-4 w-4 ${isChecking ? 'animate-spin' : ''}`} aria-hidden="true" />
            <span>{isChecking ? 'Checking Connection...' : 'Retry Connection'}</span>
          </button>

          <Link
            to="/"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-surface-raised hover:bg-surface-hover text-text-primary font-medium text-sm border border-border transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber"
            aria-label="Return to Home Feed"
          >
            <Home className="h-4 w-4 text-text-secondary" aria-hidden="true" />
            <span>Return Home</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Offline;
