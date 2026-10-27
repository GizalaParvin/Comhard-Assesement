// Format milliseconds into human-readable duration
export function formatDuration(ms) {
  if (ms === null || ms === undefined || isNaN(ms)) return 'N/A';
  if (ms < 0) ms = Math.abs(ms);

  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    const remHours = hours % 24;
    const remMins = minutes % 60;
    return remHours > 0 ? `${days}d ${remHours}h ${remMins}m` : `${days}d ${remMins}m`;
  }
  if (hours > 0) {
    const remMins = minutes % 60;
    return `${hours}h ${remMins}m`;
  }
  if (minutes > 0) {
    return `${minutes}m`;
  }
  return `${Math.max(1, seconds)}s`;
}

// Calculate SLA progress, color, and remaining or breached text
export function getSlaInfo(task, nowTime) {
  const allocated = new Date(task.allocatedAt).getTime();
  const deadline = new Date(task.slaDeadline).getTime();
  const now = nowTime || Date.now();
  const total = Math.max(1000, deadline - allocated);

  // If task is completed
  if (task.stage === 'Completed') {
    const completed = task.completedAt ? new Date(task.completedAt).getTime() : now;
    const isWithin = completed <= deadline;
    const elapsed = Math.max(0, completed - allocated);

    return {
      percent: 100,
      color: isWithin ? '#22c55e' : '#ef4444',
      statusText: isWithin ? 'within SLA' : 'after SLA',
      detailText: isWithin ? `Done in ${formatDuration(elapsed)}` : `Overdue by ${formatDuration(completed - deadline)}`,
      isBreached: !isWithin,
      isCompleted: true
    };
  }

  // Active task: Allocated or Working
  const elapsed = Math.max(0, now - allocated);
  const percent = Math.round((elapsed / total) * 100);

  if (now > deadline) {
    const breachedMs = now - deadline;
    return {
      percent: 100,
      color: '#ef4444', // Red
      statusText: `breached by ${formatDuration(breachedMs)}`,
      detailText: `Overdue`,
      isBreached: true,
      isCompleted: false
    };
  }

  // Under 50% -> Green
  if (percent < 50) {
    return {
      percent: Math.min(100, percent),
      color: '#22c55e',
      statusText: `${formatDuration(deadline - now)} left`,
      detailText: `${percent}% elapsed`,
      isBreached: false,
      isCompleted: false
    };
  }

  // 50% to 80% -> Yellow
  if (percent <= 80) {
    return {
      percent: Math.min(100, percent),
      color: '#eab308',
      statusText: `${formatDuration(deadline - now)} left`,
      detailText: `${percent}% elapsed`,
      isBreached: false,
      isCompleted: false
    };
  }

  // 80% to 100% -> Orange (at risk)
  return {
    percent: Math.min(100, percent),
    color: '#f97316',
    statusText: `${formatDuration(deadline - now)} left`,
    detailText: `At risk (${percent}%)`,
    isBreached: false,
    isCompleted: false
  };
}
