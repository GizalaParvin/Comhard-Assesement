import React from 'react';

const LoadingSkeleton = ({ count = 3, view = 'grid' }) => {
  if (view === 'list') {
    return (
      <div className="space-y-3">
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className="animate-pulse bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex items-center justify-between gap-4"
          >
            <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/3" />
            <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/6" />
            <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/4" />
            <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-16" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="animate-pulse bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4 shadow-sm"
        >
          <div className="flex justify-between items-center">
            <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-20" />
            <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-16" />
          </div>
          <div className="space-y-2">
            <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded w-4/5" />
            <div className="h-3.5 bg-slate-200 dark:bg-slate-800 rounded w-full" />
          </div>
          <div className="h-2 bg-slate-200 dark:bg-slate-800 rounded w-full" />
        </div>
      ))}
    </div>
  );
};

export default LoadingSkeleton;
