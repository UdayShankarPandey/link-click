import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, Mail, Lock, AlertCircle, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [unverifiedEmail, setUnverifiedEmail] = useState(null);
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    setIsSubmitting(true);
    setError('');
    setUnverifiedEmail(null);

    const result = await login(email, password);
    setIsSubmitting(false);

    if (result.success) {
      toast.success('Welcome back!');
      navigate(from, { replace: true });
    } else {
      setError(result.message);
      if (result.emailVerified === false) {
        setUnverifiedEmail(email);
        setPassword('');
      }
    }
  };

  const handleResend = async () => {
    const targetEmail = unverifiedEmail || email;
    if (!targetEmail) return;

    setIsResending(true);
    try {
      const response = await api.post('/auth/resend-verification', { email: targetEmail });
      toast.success(response.data?.message || 'Verification link sent!');
      setResendCooldown(60);
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to resend verification email.';
      if (err.response?.status === 429) {
        const retryAfter = err.response?.data?.retryAfter;
        const seconds = typeof retryAfter === 'number' && retryAfter > 0 ? retryAfter : 60;
        setResendCooldown(seconds);
      }
      toast.error(message);
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="bg-surface border border-border rounded-2xl p-7 sm:p-8 max-w-sm w-full animate-fade-in">
        {/* Header */}
        <div className="text-center mb-7">
          <div className="inline-flex w-12 h-12 rounded-xl bg-amber-muted text-amber items-center justify-center mb-4">
            <LogIn className="h-5 w-5" />
          </div>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">Sign in</h1>
          <p className="text-sm text-text-secondary mt-1">Continue to your Link Click account</p>
        </div>

        {error && (
          <div role="alert" className="bg-danger-muted border border-danger/20 text-danger p-3 rounded-xl mb-5 flex items-start gap-2 text-sm">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span>{error}</span>
              {unverifiedEmail && (
                <div className="mt-2.5 pt-2 border-t border-danger/20">
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={isResending || resendCooldown > 0}
                    className="inline-flex items-center gap-1.5 font-medium text-xs text-amber hover:underline disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {isResending ? (
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Mail className="h-3.5 w-3.5" />
                    )}
                    {isResending
                      ? 'Sending link...'
                      : resendCooldown > 0
                      ? `Resend in ${resendCooldown}s`
                      : 'Resend verification email'}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="login-email" className="block text-sm font-medium text-text-secondary mb-1.5">
              Email
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-text-tertiary">
                <Mail className="h-4 w-4" />
              </span>
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-canvas border border-border rounded-xl text-sm text-text-primary placeholder-text-tertiary focus:outline-none focus:border-amber/40 focus:ring-1 focus:ring-amber/20 transition-colors"
                placeholder="you@example.com"
                required
                autoComplete="email"
              />
            </div>
          </div>

          <div>
            <label htmlFor="login-password" className="block text-sm font-medium text-text-secondary mb-1.5">
              Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-text-tertiary">
                <Lock className="h-4 w-4" />
              </span>
              <input
                id="login-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-canvas border border-border rounded-xl text-sm text-text-primary placeholder-text-tertiary focus:outline-none focus:border-amber/40 focus:ring-1 focus:ring-amber/20 transition-colors"
                placeholder="••••••••"
                required
                autoComplete="current-password"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-amber hover:bg-amber-hover text-text-inverse font-semibold py-2.5 px-4 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-sm"
          >
            {isSubmitting ? (
              <div className="w-5 h-5 border-2 border-text-inverse border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>Sign In</>
            )}
          </button>
        </form>

        <p className="text-center text-sm text-text-secondary mt-6">
          Don't have an account?{' '}
          <Link to="/register" className="text-amber hover:underline font-medium">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
