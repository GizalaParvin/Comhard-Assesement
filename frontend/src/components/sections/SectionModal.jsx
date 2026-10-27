import React, { useState, useEffect } from 'react';
import { useTasks } from '../../context/TaskContext';
import { X, Folder, AlertCircle } from 'lucide-react';

const COLORS = [
  '#3b82f6', // blue
  '#10b981', // emerald
  '#8b5cf6', // violet
  '#f43f5e', // rose
  '#f59e0b', // amber
  '#06b6d4', // cyan
  '#ec4899', // pink
  '#64748b', // slate
];

const SectionModal = () => {
  const { sectionModal, setSectionModal, createSection, renameSection } = useTasks();
  const { isOpen, section } = sectionModal;

  const [name, setName] = useState('');
  const [color, setColor] = useState('#3b82f6');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (section) {
        setName(section.name);
        setColor(section.color || '#3b82f6');
      } else {
        setName('');
        setColor('#3b82f6');
      }
      setError('');
    }
  }, [isOpen, section]);

  if (!isOpen) return null;

  const handleClose = () => {
    setSectionModal({ isOpen: false, section: null });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Section name is required');
      return;
    }
    if (name.trim().length > 40) {
      setError('Section name must be 40 characters or less');
      return;
    }

    setSubmitting(true);
    let result;
    if (section) {
      result = await renameSection(section._id, { name: name.trim(), color });
    } else {
      result = await createSection({ name: name.trim(), color });
    }

    setSubmitting(false);
    if (result.success) {
      handleClose();
    } else {
      setError(result.error || 'Failed to save section');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center text-white shadow-sm"
              style={{ backgroundColor: color }}
            >
              <Folder className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {section ? 'Rename Section' : 'Create New Section'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Organize tasks into customizable categories
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              Section Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Marketing, Personal, Backend APIs"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError('');
              }}
              className="w-full px-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-800 dark:text-slate-100"
              autoFocus
            />
            {error && (
              <p className="flex items-center gap-1 text-xs text-rose-500 mt-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {error}
              </p>
            )}
          </div>

          {/* Color Picker */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
              Color Tag
            </label>
            <div className="flex items-center gap-2.5 flex-wrap">
              {COLORS.map((c) => (
                <button
                  type="button"
                  key={c}
                  onClick={() => setColor(c)}
                  className={`w-7 h-7 rounded-full transition-transform ${
                    color === c ? 'scale-125 ring-2 ring-offset-2 ring-indigo-500 dark:ring-offset-slate-900' : 'hover:scale-110'
                  }`}
                  style={{ backgroundColor: c }}
                  aria-label={`Select color ${c}`}
                />
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-sm font-semibold rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 text-sm font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white shadow-md shadow-indigo-600/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              {submitting ? 'Saving...' : section ? 'Update Section' : 'Create Section'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SectionModal;
