import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Mail, ArrowLeft, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';

const CheckEmail = () => {
  const location = useLocation();
  const email = location.state?.email || '';

  const [isResending, setIsResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [resendStatus, setResendStatus] = useState(null); // { success: boolean, message: string } | null

  // 60-second cooldown timer effect
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleResend = async () => {
    if (!email) {
      toast.error('Please enter your email on the sign in page to resend verification.');
      return;
    }

    if (cooldown > 0 || isResending) return;

    setIsResending(true);
    setResendStatus(null);

    try {
      const response = await api.post('/auth/resend-verification', { email });
      const message = response.data?.message || 'Verification email sent.';
      toast.success(message);
      setResendStatus({ success: true, message });
      setCooldown(60);
    } catch (error) {
      const status = error.response?.status;
      const message = error.response?.data?.message || 'Failed to send verification email.';

      if (status === 429) {
        const retryAfter = error.response?.data?.retryAfter;
        const seconds = typeof retryAfter === 'number' && retryAfter > 0 ? retryAfter : 60;
        setCooldown(seconds);
      }

      toast.error(message);
      setResendStatus({ success: false, message });
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-8">
      <div className="bg-surface border border-border rounded-2xl p-7 sm:p-8 max-w-md w-full animate-fade-in text-center">
        {/* Header Icon */}
        <div className="inline-flex w-14 h-14 rounded-2xl bg-amber-muted text-amber items-center justify-center mb-5">
          <Mail className="h-7 w-7" />
        </div>

        <h1 className="text-2xl font-bold text-text-primary tracking-tight">Check your email</h1>

        <p className="text-sm text-text-secondary mt-2">
          We've sent a verification link to
        </p>

        {email ? (
          <div className="my-3 px-4 py-2 bg-canvas border border-border rounded-xl font-medium text-amber text-sm inline-block break-all">
            {email}
          </div>
        ) : (
          <p className="text-xs text-text-tertiary mt-1 italic">your registered email address</p>
        )}

        <p className="text-xs text-text-tertiary mt-2">
          Click the link inside the email to verify your account and activate your profile.
        </p>

        {/* Status Alert */}
        {resendStatus && (
          <div
            role="alert"
            className={`mt-4 p-3 rounded-xl flex items-start gap-2 text-xs text-left ${
              resendStatus.success
                ? 'bg-amber-muted/40 border border-amber/30 text-amber'
                : 'bg-danger-muted border border-danger/20 text-danger'
            }`}
          >
            {resendStatus.success ? (
              <CheckCircle className="h-4 w-4 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            )}
            <span>{resendStatus.message}</span>
          </div>
        )}

        {/* Resend Action */}
        <div className="mt-6 pt-5 border-t border-border/60">
          <p className="text-xs text-text-secondary mb-3">Didn't receive the email?</p>
          {(() => {
            let resendButtonText = 'Resend verification email';
            if (isResending) {
              resendButtonText = 'Sending...';
            } else if (cooldown > 0) {
              resendButtonText = `Resend in ${cooldown}s`;
            }
            return (
              <button
                type="button"
                onClick={handleResend}
                disabled={isResending || cooldown > 0 || !email}
                className="w-full bg-surface-hover border border-border hover:border-amber/40 text-text-primary font-medium py-2.5 px-4 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isResending ? (
                  <RefreshCw className="h-4 w-4 animate-spin text-amber" />
                ) : (
                  <Mail className="h-4 w-4 text-amber" />
                )}
                {resendButtonText}
              </button>
            );
          })()}
        </div>

        {/* Back link */}
        <div className="mt-6">
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-amber hover:underline"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CheckEmail;
