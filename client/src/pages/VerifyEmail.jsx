import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle, AlertCircle, RefreshCw, LogIn, Mail } from 'lucide-react';
import api from '../services/api';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('loading'); // 'loading' | 'success' | 'error'
  const [message, setMessage] = useState('');
  const hasCalledRef = useRef(false);

  useEffect(() => {
    if (hasCalledRef.current) return;
    hasCalledRef.current = true;

    const token = searchParams.get('token');

    if (!token) {
      setStatus('error');
      setMessage('Verification token is missing. Please check your email link.');
      return;
    }

    const verifyToken = async () => {
      try {
        const response = await api.post('/auth/verify-email', { token });
        setStatus('success');
        setMessage(response.data?.message || 'Email verified successfully. You can now log in.');
        if (window.history.replaceState) {
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      } catch (error) {
        setStatus('error');
        setMessage(
          error.response?.data?.message || 'Verification link is invalid or has expired.'
        );
      }
    };

    verifyToken();
  }, [searchParams]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-8">
      <div className="bg-surface border border-border rounded-2xl p-7 sm:p-8 max-w-md w-full animate-fade-in text-center">
        {/* Loading State */}
        {status === 'loading' && (
          <div className="py-6">
            <div className="inline-flex w-14 h-14 rounded-2xl bg-amber-muted text-amber items-center justify-center mb-5">
              <RefreshCw className="h-7 w-7 animate-spin" />
            </div>
            <h1 className="text-2xl font-bold text-text-primary tracking-tight">Verifying your email</h1>
            <p className="text-sm text-text-secondary mt-2">
              Please wait while we activate your account...
            </p>
          </div>
        )}

        {/* Success State */}
        {status === 'success' && (
          <div className="py-2">
            <div className="inline-flex w-14 h-14 rounded-2xl bg-amber-muted text-amber items-center justify-center mb-5">
              <CheckCircle className="h-7 w-7" />
            </div>
            <h1 className="text-2xl font-bold text-text-primary tracking-tight">Email Verified!</h1>
            <p className="text-sm text-text-secondary mt-2">{message}</p>
            <p className="text-xs text-text-tertiary mt-1">
              Your account is active and ready to use.
            </p>

            <div className="mt-6">
              <Link
                to="/login"
                className="w-full bg-amber hover:bg-amber-hover text-text-inverse font-semibold py-2.5 px-4 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm cursor-pointer"
              >
                <LogIn className="h-4 w-4" />
                Sign In to Your Account
              </Link>
            </div>
          </div>
        )}

        {/* Error State */}
        {status === 'error' && (
          <div role="alert" className="py-2">
            <div className="inline-flex w-14 h-14 rounded-2xl bg-danger-muted text-danger items-center justify-center mb-5">
              <AlertCircle className="h-7 w-7" />
            </div>
            <h1 className="text-2xl font-bold text-text-primary tracking-tight">Verification Failed</h1>
            <p className="text-sm text-text-secondary mt-2">{message}</p>

            <div className="mt-6 space-y-3">
              <Link
                to="/check-email"
                className="w-full bg-amber hover:bg-amber-hover text-text-inverse font-semibold py-2.5 px-4 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm cursor-pointer"
              >
                <Mail className="h-4 w-4" />
                Request New Verification Link
              </Link>
              <Link
                to="/login"
                className="w-full bg-surface-hover border border-border hover:border-amber/40 text-text-primary font-medium py-2.5 px-4 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm cursor-pointer"
              >
                Back to Sign In
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;
