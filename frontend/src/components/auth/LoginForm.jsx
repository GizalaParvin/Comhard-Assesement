import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Mail, Lock, LogIn, AlertCircle, Sparkles } from 'lucide-react';

const LoginForm = ({ onToggleRegister }) => {
  const { login, authError, setAuthError } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const fillDemoAccount = () => {
    setEmail('demo@example.com');
    setPassword('password123');
    setErrors({});
    if (setAuthError) setAuthError(null);
  };

  const validate = () => {
    const errs = {};
    if (!email.trim()) {
      errs.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errs.email = 'Please enter a valid email address';
    }

    if (!password) {
      errs.password = 'Password is required';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    await login(email, password);
    setLoading(false);
  };

  return (
    <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-xl">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Welcome back
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Sign in to access your tasks and live SLA dashboard
        </p>
      </div>

      {/* Demo Credentials Quick Fill Button */}
      <div className="mb-6">
        <button
          type="button"
          onClick={fillDemoAccount}
          className="w-full py-2.5 px-4 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/80 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2 group shadow-sm"
        >
          <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400 group-hover:rotate-12 transition-transform" />
          <span>Quick Demo Login (demo@example.com)</span>
        </button>
      </div>

      {authError && (
        <div className="mb-4 p-3.5 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 rounded-2xl flex items-center gap-2.5 text-xs text-rose-700 dark:text-rose-300">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{authError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
            Email Address
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setErrors((prev) => ({ ...prev, email: '' }));
              }}
              className={`w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border rounded-xl focus:outline-none focus:ring-2 transition-all ${
                errors.email
                  ? 'border-rose-400 focus:ring-rose-500/20'
                  : 'border-slate-200 dark:border-slate-700 focus:ring-indigo-500/20 focus:border-indigo-500'
              }`}
            />
          </div>
          {errors.email && (
            <p className="text-xs text-rose-500 mt-1">{errors.email}</p>
          )}
        </div>

        {/* Password */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
            Password
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setErrors((prev) => ({ ...prev, password: '' }));
              }}
              className={`w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border rounded-xl focus:outline-none focus:ring-2 transition-all ${
                errors.password
                  ? 'border-rose-400 focus:ring-rose-500/20'
                  : 'border-slate-200 dark:border-slate-700 focus:ring-indigo-500/20 focus:border-indigo-500'
              }`}
            />
          </div>
          {errors.password && (
            <p className="text-xs text-rose-500 mt-1">{errors.password}</p>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full mt-2 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-sm shadow-lg shadow-indigo-600/25 transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2"
        >
          <LogIn className="w-4 h-4" />
          <span>{loading ? 'Signing in...' : 'Sign In'}</span>
        </button>
      </form>

      {/* Switch to Register */}
      <div className="mt-6 text-center text-xs text-slate-500 dark:text-slate-400">
        Don't have an account?{' '}
        <button
          onClick={onToggleRegister}
          className="font-bold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 transition-colors"
        >
          Create an account
        </button>
      </div>
    </div>
  );
};

export default LoginForm;
