import React from 'react';
import { calculateSLA } from '../../utils/slaHelper';
import { useTasks } from '../../context/TaskContext';
import { Clock, AlertTriangle, CheckCircle2, AlertCircle } from 'lucide-react';

const SLAProgressBar = ({ task, compact = false, showLabel = true }) => {
  const { currentTime } = useTasks();
  const sla = calculateSLA(task, currentTime);

  // Status icon based on SLA condition
  const renderIcon = () => {
    if (sla.isCompleted) {
      return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />;
    }
    if (sla.status === 'breached') {
      return <AlertCircle className="w-3.5 h-3.5 text-rose-500 flex-shrink-0" />;
    }
    if (sla.status === 'risk') {
      return <AlertTriangle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />;
    }
    return <Clock className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 flex-shrink-0" />;
  };

  if (compact) {
    return (
      <div className="w-full space-y-1">
        <div className="flex items-center justify-between text-xs">
          <span className="flex items-center gap-1 font-medium truncate">
            {renderIcon()}
            <span className={sla.textColorClass}>{sla.displayText}</span>
          </span>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
            {sla.percentage}%
          </span>
        </div>
        <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
          <div
            className={`h-full ${sla.colorClass} transition-all duration-500 ease-out rounded-full`}
            style={{ width: `${sla.percentage}%` }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-1.5">
      {showLabel && (
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5">
            {renderIcon()}
            <span className={`font-semibold tracking-wide ${sla.textColorClass}`}>
              {sla.displayText}
            </span>
          </div>
          <span className="text-slate-500 dark:text-slate-400 text-[11px] font-mono">
            {sla.remainingText}
          </span>
        </div>
      )}

      {/* SLA Progress track and bar */}
      <div className="relative w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner">
        <div
          className={`h-full ${sla.colorClass} transition-all duration-700 ease-out rounded-full ${
            sla.status === 'risk' || sla.status === 'breached' ? 'live-pulse' : ''
          }`}
          style={{ width: `${sla.percentage}%` }}
        />
      </div>

      {/* Threshold markers */}
      <div className="flex justify-between text-[10px] text-slate-400 dark:text-slate-500 px-0.5">
        <span>0%</span>
        <span className="text-yellow-600/70 dark:text-yellow-400/60">50%</span>
        <span className="text-amber-600/70 dark:text-amber-400/60">80%</span>
        <span className="text-rose-600/70 dark:text-rose-400/60">100%</span>
      </div>
    </div>
  );
};

export default SLAProgressBar;
