import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { User, Mail, Lock, UserPlus, AlertCircle } from 'lucide-react';

const RegisterForm = ({ onToggleLogin }) => {
  const { register, authError, setAuthError } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const errs = {};
    if (!name.trim()) {
      errs.name = 'Full name is required';
    } else if (name.trim().length > 50) {
      errs.name = 'Name cannot exceed 50 characters';
    }

    if (!email.trim()) {
      errs.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errs.email = 'Please enter a valid email';
    }

    if (!password) {
      errs.password = 'Password is required';
    } else if (password.length < 6) {
      errs.password = 'Password must be at least 6 characters';
    }

    if (password !== confirmPassword) {
      errs.confirmPassword = 'Passwords do not match';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    await register(name.trim(), email.trim(), password);
    setLoading(false);
  };

  return (
    <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-xl">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Create Account
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Start managing tasks with intelligent SLA tracking
        </p>
      </div>

      {authError && (
        <div className="mb-4 p-3.5 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 rounded-2xl flex items-center gap-2.5 text-xs text-rose-700 dark:text-rose-300">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{authError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3.5">
        {/* Name */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
            Full Name
          </label>
          <div className="relative">
            <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="e.g. Alex Johnson"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setErrors((prev) => ({ ...prev, name: '' }));
              }}
              className={`w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border rounded-xl focus:outline-none focus:ring-2 transition-all ${
                errors.name
                  ? 'border-rose-400 focus:ring-rose-500/20'
                  : 'border-slate-200 dark:border-slate-700 focus:ring-indigo-500/20 focus:border-indigo-500'
              }`}
            />
          </div>
          {errors.name && (
            <p className="text-xs text-rose-500 mt-1">{errors.name}</p>
          )}
        </div>

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
            Password (min 6 characters)
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

        {/* Confirm Password */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
            Confirm Password
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                setErrors((prev) => ({ ...prev, confirmPassword: '' }));
              }}
              className={`w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border rounded-xl focus:outline-none focus:ring-2 transition-all ${
                errors.confirmPassword
                  ? 'border-rose-400 focus:ring-rose-500/20'
                  : 'border-slate-200 dark:border-slate-700 focus:ring-indigo-500/20 focus:border-indigo-500'
              }`}
            />
          </div>
          {errors.confirmPassword && (
            <p className="text-xs text-rose-500 mt-1">{errors.confirmPassword}</p>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full mt-3 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-sm shadow-lg shadow-indigo-600/25 transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2"
        >
          <UserPlus className="w-4 h-4" />
          <span>{loading ? 'Creating account...' : 'Create Account'}</span>
        </button>
      </form>

      {/* Switch to Login */}
      <div className="mt-6 text-center text-xs text-slate-500 dark:text-slate-400">
        Already have an account?{' '}
        <button
          onClick={onToggleLogin}
          className="font-bold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 transition-colors"
        >
          Sign in
        </button>
      </div>
    </div>
  );
};

export default RegisterForm;
