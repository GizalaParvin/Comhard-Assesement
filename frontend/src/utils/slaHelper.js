/**
 * Helper utilities for SLA calculations, color coding, and human-friendly time formatting
 */

/**
 * Format a millisecond duration into clean string (e.g. "2h 30m", "45m", "3d 4h")
 */
export const formatDuration = (ms) => {
  if (ms < 0) ms = Math.abs(ms);

  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    const remHours = hours % 24;
    return remHours > 0 ? `${days}d ${remHours}h` : `${days}d`;
  }
  if (hours > 0) {
    const remMinutes = minutes % 60;
    return remMinutes > 0 ? `${hours}h ${remMinutes}m` : `${hours}h`;
  }
  if (minutes > 0) {
    return `${minutes}m`;
  }
  return `${Math.max(1, seconds)}s`;
};

/**
 * Calculate SLA progress, status, color, and text
 * @param {Object} task - Task object containing startTime, dueDate, deadline, status, completedAt
 * @param {Date|number} currentTime - Current timestamp from live ticker
 */
export const calculateSLA = (task, currentTime = Date.now()) => {
  const start = new Date(task.startTime || task.createdAt || Date.now()).getTime();
  const end = new Date(task.deadline || task.dueDate).getTime();
  const now = typeof currentTime === 'number' ? currentTime : new Date(currentTime).getTime();
  const isDone = task.status === 'Done';
  const completedAt = task.completedAt ? new Date(task.completedAt).getTime() : null;

  const totalDuration = Math.max(end - start, 1000); // minimum 1s to prevent division by zero

  // For completed tasks: evaluation is based on completion timestamp
  if (isDone) {
    const finalTime = completedAt || now;
    const isWithinSLA = finalTime <= end;
    const elapsed = Math.max(0, finalTime - start);
    const percentage = Math.min(100, Math.max(0, Math.round((elapsed / totalDuration) * 100)));

    if (isWithinSLA) {
      return {
        status: 'completed_within',
        isBreached: false,
        isCompleted: true,
        percentage: 100,
        colorClass: 'bg-emerald-500',
        textColorClass: 'text-emerald-600 dark:text-emerald-400',
        badgeBgClass: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800',
        displayText: 'Completed within SLA',
        remainingText: `Done in ${formatDuration(elapsed)}`,
      };
    } else {
      const breachedByMs = finalTime - end;
      return {
        status: 'completed_after',
        isBreached: true,
        isCompleted: true,
        percentage: 100,
        colorClass: 'bg-rose-500',
        textColorClass: 'text-rose-600 dark:text-rose-400',
        badgeBgClass: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800',
        displayText: 'Completed after SLA',
        remainingText: `Late by ${formatDuration(breachedByMs)}`,
      };
    }
  }

  // Active tasks (To Do, In Progress)
  const elapsed = Math.max(0, now - start);
  const remainingMs = end - now;
  const rawPercentage = (elapsed / totalDuration) * 100;
  const displayPercentage = Math.min(100, Math.max(0, Math.round(rawPercentage)));

  if (now > end) {
    // Breached!
    const breachedMs = now - end;
    return {
      status: 'breached',
      isBreached: true,
      isCompleted: false,
      percentage: 100,
      colorClass: 'bg-rose-500',
      textColorClass: 'text-rose-600 dark:text-rose-400',
      badgeBgClass: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800',
      displayText: `Breached by ${formatDuration(breachedMs)}`,
      remainingText: `Overdue by ${formatDuration(breachedMs)}`,
    };
  }

  // Under 50% elapsed -> Green
  if (rawPercentage < 50) {
    return {
      status: 'healthy',
      isBreached: false,
      isCompleted: false,
      percentage: displayPercentage,
      colorClass: 'bg-emerald-500',
      textColorClass: 'text-emerald-600 dark:text-emerald-400',
      badgeBgClass: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800',
      displayText: `${formatDuration(remainingMs)} left`,
      remainingText: `${displayPercentage}% elapsed`,
    };
  }

  // 50% to 80% elapsed -> Yellow
  if (rawPercentage <= 80) {
    return {
      status: 'warning',
      isBreached: false,
      isCompleted: false,
      percentage: displayPercentage,
      colorClass: 'bg-yellow-500',
      textColorClass: 'text-yellow-600 dark:text-yellow-400',
      badgeBgClass: 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950/40 dark:text-yellow-300 dark:border-yellow-800',
      displayText: `${formatDuration(remainingMs)} left`,
      remainingText: `${displayPercentage}% elapsed`,
    };
  }

  // 80% to 100% elapsed -> Orange (At Risk)
  return {
    status: 'risk',
    isBreached: false,
    isCompleted: false,
    percentage: displayPercentage,
    colorClass: 'bg-amber-500',
    textColorClass: 'text-amber-600 dark:text-amber-400',
    badgeBgClass: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800',
    displayText: `${formatDuration(remainingMs)} left`,
    remainingText: `At risk (${displayPercentage}%)`,
  };
};

/**
 * Format date for datetime-local input fields (YYYY-MM-DDTHH:mm)
 */
export const toDateTimeLocal = (dateString) => {
  if (!dateString) return '';
  const d = new Date(dateString);
  const pad = (n) => String(n).padStart(2, '0');
  const year = d.getFullYear();
  const month = pad(d.getMonth() + 1);
  const day = pad(d.getDate());
  const hours = pad(d.getHours());
  const minutes = pad(d.getMinutes());
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

/**
 * Format date for friendly human display (e.g. "Oct 27, 2026, 05:30 PM")
 */
export const formatDisplayDate = (dateString) => {
  if (!dateString) return '—';
  const d = new Date(dateString);
  return d.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
};
