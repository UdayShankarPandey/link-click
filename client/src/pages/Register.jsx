import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserPlus, User, Mail, Lock, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password || !confirmPassword) {
      setError('All fields are required.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    const result = await register(name, email, password);
    setIsSubmitting(false);

    if (result.success) {
      toast.success(result.message || 'Account created! Please check your email.');
      navigate('/check-email', { state: { email: result.email || email } });
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-8">
      <div className="bg-surface border border-border rounded-2xl p-7 sm:p-8 max-w-sm w-full animate-fade-in">
        {/* Header */}
        <div className="text-center mb-7">
          <div className="inline-flex w-12 h-12 rounded-xl bg-amber-muted text-amber items-center justify-center mb-4">
            <UserPlus className="h-5 w-5" />
          </div>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">Create account</h1>
          <p className="text-sm text-text-secondary mt-1">Join the Link Click community</p>
        </div>

        {error && (
          <div className="bg-danger-muted border border-danger/20 text-danger p-3 rounded-xl mb-5 flex items-start gap-2 text-sm">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="reg-name" className="block text-sm font-medium text-text-secondary mb-1.5">Full Name</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-text-tertiary">
                <User className="h-4 w-4" />
              </span>
              <input
                id="reg-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-canvas border border-border rounded-xl text-sm text-text-primary placeholder-text-tertiary focus:outline-none focus:border-amber/40 focus:ring-1 focus:ring-amber/20 transition-colors"
                placeholder="Jane Doe"
                maxLength={100}
                required
                autoComplete="name"
              />
            </div>
          </div>

          <div>
            <label htmlFor="reg-email" className="block text-sm font-medium text-text-secondary mb-1.5">Email</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-text-tertiary">
                <Mail className="h-4 w-4" />
              </span>
              <input
                id="reg-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-canvas border border-border rounded-xl text-sm text-text-primary placeholder-text-tertiary focus:outline-none focus:border-amber/40 focus:ring-1 focus:ring-amber/20 transition-colors"
                placeholder="you@example.com"
                maxLength={255}
                required
                autoComplete="email"
              />
            </div>
          </div>

          <div>
            <label htmlFor="reg-password" className="block text-sm font-medium text-text-secondary mb-1.5">Password</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-text-tertiary">
                <Lock className="h-4 w-4" />
              </span>
              <input
                id="reg-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-canvas border border-border rounded-xl text-sm text-text-primary placeholder-text-tertiary focus:outline-none focus:border-amber/40 focus:ring-1 focus:ring-amber/20 transition-colors"
                placeholder="At least 6 characters"
                required
                autoComplete="new-password"
              />
            </div>
          </div>

          <div>
            <label htmlFor="reg-confirm" className="block text-sm font-medium text-text-secondary mb-1.5">Confirm Password</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-text-tertiary">
                <Lock className="h-4 w-4" />
              </span>
              <input
                id="reg-confirm"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-canvas border border-border rounded-xl text-sm text-text-primary placeholder-text-tertiary focus:outline-none focus:border-amber/40 focus:ring-1 focus:ring-amber/20 transition-colors"
                placeholder="Repeat password"
                required
                autoComplete="new-password"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-amber hover:bg-amber-hover text-text-inverse font-semibold py-2.5 px-4 rounded-xl transition-all duration-150 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber focus-visible:ring-offset-2 focus-visible:ring-offset-canvas active:scale-[0.99]"
          >
            {isSubmitting ? (
              <div className="w-5 h-5 border-2 border-text-inverse border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>Create Account</>
            )}
          </button>
        </form>

        <p className="text-center text-sm text-text-secondary mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-amber hover:underline font-medium">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
