import React from 'react';
import { useTasks } from '../../context/TaskContext';
import { CheckCircle2, Clock, AlertTriangle, AlertCircle, Layers } from 'lucide-react';

const DashboardStats = () => {
  const { stats, setFilterStatus } = useTasks();

  const cards = [
    {
      label: 'Total Tasks',
      value: stats.total,
      icon: Layers,
      color: 'text-indigo-600 dark:text-indigo-400',
      bg: 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800/60',
      filter: 'all',
    },
    {
      label: 'In Progress',
      value: stats.inProgress,
      icon: Clock,
      color: 'text-sky-600 dark:text-sky-400',
      bg: 'bg-sky-50 dark:bg-sky-950/40 border-sky-200 dark:border-sky-800/60',
      filter: 'In Progress',
    },
    {
      label: 'Completed',
      value: stats.completed,
      icon: CheckCircle2,
      color: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/60',
      filter: 'Done',
    },
    {
      label: 'SLA At Risk',
      value: stats.atRisk,
      icon: AlertTriangle,
      color: 'text-amber-600 dark:text-amber-400',
      bg: 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800/60',
      subtext: '80% - 100% SLA elapsed',
    },
    {
      label: 'SLA Breached',
      value: stats.breached,
      icon: AlertCircle,
      color: 'text-rose-600 dark:text-rose-400',
      bg: 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800/60',
      subtext: 'Exceeded SLA deadline',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5 mb-6">
      {cards.map((card, idx) => {
        const IconComponent = card.icon;
        return (
          <div
            key={idx}
            onClick={() => card.filter && setFilterStatus(card.filter)}
            className={`p-4 rounded-2xl border transition-all duration-200 ${card.bg} ${
              card.filter ? 'cursor-pointer hover:shadow-md hover:scale-[1.01]' : ''
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                {card.label}
              </span>
              <IconComponent className={`w-5 h-5 ${card.color}`} />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                {card.value}
              </span>
              {card.subtext && (
                <span className="text-[10px] text-slate-500 dark:text-slate-400 hidden xl:inline truncate">
                  {card.subtext}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default DashboardStats;
