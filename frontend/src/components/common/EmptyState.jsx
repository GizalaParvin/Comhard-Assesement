import React from 'react';
import { useTasks } from '../../context/TaskContext';
import { ClipboardList, Plus } from 'lucide-react';

const EmptyState = ({ message = 'No tasks found', subtext = 'Create your first task to get started with SLA tracking.' }) => {
  const { setTaskModal } = useTasks();

  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-800 rounded-3xl">
      <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-4 shadow-sm">
        <ClipboardList className="w-8 h-8" />
      </div>
      <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-1">
        {message}
      </h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mb-6">
        {subtext}
      </p>
      <button
        onClick={() => setTaskModal({ isOpen: true, task: null })}
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-lg shadow-indigo-600/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
      >
        <Plus className="w-4 h-4" />
        Create New Task
      </button>
    </div>
  );
};

export default EmptyState;
