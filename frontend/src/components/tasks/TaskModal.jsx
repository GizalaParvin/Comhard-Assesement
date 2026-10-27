import React, { useState, useEffect } from 'react';
import { useTasks } from '../../context/TaskContext';
import { toDateTimeLocal } from '../../utils/slaHelper';
import { X, Calendar, Clock, Tag, Flag, AlertCircle } from 'lucide-react';

const TaskModal = () => {
  const { taskModal, setTaskModal, createTask, updateTask, sections } = useTasks();
  const { isOpen, task } = taskModal;

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'To Do',
    priority: 'Medium',
    section: 'General',
    startTime: '',
    dueDate: '',
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Populate form on open
  useEffect(() => {
    if (isOpen) {
      if (task) {
        setFormData({
          title: task.title || '',
          description: task.description || '',
          status: task.status || 'To Do',
          priority: task.priority || 'Medium',
          section: task.section || 'General',
          startTime: toDateTimeLocal(task.startTime || task.createdAt || new Date()),
          dueDate: toDateTimeLocal(task.dueDate || task.deadline || new Date(Date.now() + 4 * 3600000)),
        });
      } else {
        // Defaults for new task: start now, due in 4 hours
        const now = new Date();
        const due = new Date(Date.now() + 4 * 3600 * 1000);
        setFormData({
          title: '',
          description: '',
          status: 'To Do',
          priority: 'Medium',
          section: sections[0]?.name || 'General',
          startTime: toDateTimeLocal(now),
          dueDate: toDateTimeLocal(due),
        });
      }
      setErrors({});
    }
  }, [isOpen, task, sections]);

  if (!isOpen) return null;

  const handleClose = () => {
    setTaskModal({ isOpen: false, task: null });
  };

  // Quick SLA duration preset helper
  const applyPresetHours = (hours) => {
    const start = formData.startTime ? new Date(formData.startTime) : new Date();
    const newDue = new Date(start.getTime() + hours * 3600 * 1000);
    setFormData((prev) => ({
      ...prev,
      dueDate: toDateTimeLocal(newDue),
    }));
  };

  const validate = () => {
    const errs = {};
    if (!formData.title.trim()) {
      errs.title = 'Task title is required';
    } else if (formData.title.length > 120) {
      errs.title = 'Title must be 120 characters or less';
    }

    if (!formData.dueDate) {
      errs.dueDate = 'Due date / SLA deadline is required';
    }

    if (formData.startTime && formData.dueDate) {
      const startMs = new Date(formData.startTime).getTime();
      const dueMs = new Date(formData.dueDate).getTime();
      if (dueMs <= startMs) {
        errs.dueDate = 'Deadline must be after the start time';
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    const payload = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      status: formData.status,
      priority: formData.priority,
      section: formData.section || 'General',
      startTime: new Date(formData.startTime).toISOString(),
      dueDate: new Date(formData.dueDate).toISOString(),
      deadline: new Date(formData.dueDate).toISOString(),
    };

    let result;
    if (task) {
      result = await updateTask(task._id, payload);
    } else {
      result = await createTask(payload);
    }

    setSubmitting(false);
    if (result.success) {
      handleClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
      <div className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-8">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              {task ? 'Edit Task' : 'Create New Task'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Configure details, priority, and SLA deadlines.
            </p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              Task Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Migrate authentication service to JWT"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className={`w-full px-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-800/80 border rounded-xl focus:outline-none focus:ring-2 transition-all ${
                errors.title
                  ? 'border-rose-400 focus:ring-rose-500/20'
                  : 'border-slate-200 dark:border-slate-700 focus:ring-indigo-500/20 focus:border-indigo-500'
              }`}
            />
            {errors.title && (
              <p className="flex items-center gap-1 text-xs text-rose-500 mt-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {errors.title}
              </p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              Description
            </label>
            <textarea
              rows={3}
              placeholder="Add key objectives, acceptance criteria, or notes..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-800 dark:text-slate-100"
            />
          </div>

          {/* Grid row: Status & Priority */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Status */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-800 dark:text-slate-200"
              >
                <option value="To Do">To Do</option>
                <option value="In Progress">In Progress</option>
                <option value="Done">Done</option>
              </select>
            </div>

            {/* Priority */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Priority
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-800 dark:text-slate-200"
              >
                <option value="Low">Low Priority</option>
                <option value="Medium">Medium Priority</option>
                <option value="High">High Priority</option>
              </select>
            </div>
          </div>

          {/* Section selector */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              Section / Category
            </label>
            <div className="flex gap-2">
              <select
                value={formData.section}
                onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-800 dark:text-slate-200"
              >
                <option value="General">General</option>
                {sections.map((s) => (
                  <option key={s._id} value={s.name}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* SLA Tracking: Start Time & Due Date (Deadline) */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                SLA Timeline Configuration
              </span>
              {/* Presets */}
              <div className="flex items-center gap-1">
                <span className="text-[11px] text-slate-500 hidden sm:inline">Presets:</span>
                <button
                  type="button"
                  onClick={() => applyPresetHours(2)}
                  className="px-2 py-0.5 text-[10px] font-semibold bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-md hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-slate-700 dark:text-slate-200 transition-colors"
                >
                  +2h
                </button>
                <button
                  type="button"
                  onClick={() => applyPresetHours(8)}
                  className="px-2 py-0.5 text-[10px] font-semibold bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-md hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-slate-700 dark:text-slate-200 transition-colors"
                >
                  +8h
                </button>
                <button
                  type="button"
                  onClick={() => applyPresetHours(24)}
                  className="px-2 py-0.5 text-[10px] font-semibold bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-md hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-slate-700 dark:text-slate-200 transition-colors"
                >
                  +1d
                </button>
                <button
                  type="button"
                  onClick={() => applyPresetHours(72)}
                  className="px-2 py-0.5 text-[10px] font-semibold bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-md hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-slate-700 dark:text-slate-200 transition-colors"
                >
                  +3d
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Start Time
                </label>
                <input
                  type="datetime-local"
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-800 dark:text-slate-200"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  SLA Deadline / Due Date <span className="text-rose-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  className={`w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border rounded-xl focus:outline-none focus:ring-2 text-slate-800 dark:text-slate-200 ${
                    errors.dueDate
                      ? 'border-rose-400 focus:ring-rose-500/20'
                      : 'border-slate-200 dark:border-slate-700 focus:ring-indigo-500/20'
                  }`}
                />
                {errors.dueDate && (
                  <p className="flex items-center gap-1 text-[11px] text-rose-500 mt-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.dueDate}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
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
              {submitting ? 'Saving...' : task ? 'Update Task' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskModal;
