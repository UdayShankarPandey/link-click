import React, { Component } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import logomark from '../assets/branding/logomark.png';
import BRAND from '../config/branding';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      errorId: null,
      errorMessage: null,
    };
  }

  static getDerivedStateFromError(error) {
    const errorId = `ERR-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
    return {
      hasError: true,
      errorId,
      errorMessage: error?.message || 'An unexpected rendering error occurred.',
    };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[ErrorBoundary] Caught runtime error:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      const isDev = import.meta.env.DEV;

      return (
        <div
          className="min-h-screen bg-canvas text-text-primary flex flex-col items-center justify-center px-4 text-center font-sans animate-fade-in"
          role="alert"
          aria-live="assertive"
          aria-labelledby="error-boundary-title"
        >
          <div className="bg-surface border border-border p-8 rounded-2xl max-w-md w-full shadow-2xl relative overflow-hidden">
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

            {/* Alert Icon */}
            <div className="inline-flex items-center justify-center p-3 rounded-full bg-red-500/10 text-red-400 mb-4">
              <AlertTriangle className="h-6 w-6" aria-hidden="true" />
            </div>

            <h1 id="error-boundary-title" className="text-2xl font-bold text-text-primary mb-2">
              Something went wrong
            </h1>

            <p className="text-text-secondary text-sm mb-6 leading-relaxed">
              An unexpected error occurred in {BRAND.name}. We recommend reloading the application or returning home.
            </p>

            {/* Development Mode Error ID & Message */}
            {isDev && (
              <div className="mb-6 p-3 rounded-xl bg-canvas border border-border text-left text-xs font-mono text-text-secondary overflow-x-auto">
                <p className="font-semibold text-amber">Debug Reference (Dev Only):</p>
                <p className="mt-1">ID: {this.state.errorId}</p>
                <p className="mt-1 text-red-400 truncate">{this.state.errorMessage}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={this.handleReload}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-amber hover:bg-amber-hover text-text-inverse font-semibold text-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber focus-visible:ring-offset-2 focus-visible:ring-offset-canvas"
                aria-label="Reload application"
              >
                <RefreshCw className="h-4 w-4" aria-hidden="true" />
                <span>Reload Application</span>
              </button>

              <button
                onClick={this.handleGoHome}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-surface-raised hover:bg-surface-hover text-text-primary font-medium text-sm border border-border transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber"
                aria-label="Return to Home Feed"
              >
                <Home className="h-4 w-4 text-text-secondary" aria-hidden="true" />
                <span>Return Home</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
