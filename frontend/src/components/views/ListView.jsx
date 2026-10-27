import React from 'react';
import { useTasks } from '../../context/TaskContext';
import SLAProgressBar from '../sla/SLAProgressBar';
import { formatDisplayDate } from '../../utils/slaHelper';
import EmptyState from '../common/EmptyState';
import {
  ArrowUpDown,
  Edit2,
  Trash2,
  Calendar,
  Folder,
  CheckCircle,
  Clock,
  Circle,
} from 'lucide-react';

const ListView = () => {
  const {
    filteredTasks,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    setTaskModal,
    setConfirmDialog,
    deleteTask,
    updateTaskStatus,
  } = useTasks();

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'High':
        return 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-800';
      case 'Medium':
        return 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800';
      case 'Low':
      default:
        return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700';
    }
  };

  if (!filteredTasks.length) {
    return <EmptyState message="No tasks matching your filters" subtext="Try clearing your search or filters to see all tasks." />;
  }

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 text-xs uppercase tracking-wider select-none">
              <th
                onClick={() => handleSort('title')}
                className="py-3.5 px-4 font-bold cursor-pointer hover:text-indigo-600 transition-colors min-w-[220px]"
              >
                <div className="flex items-center gap-1.5">
                  <span>Task Title</span>
                  <ArrowUpDown className="w-3.5 h-3.5 opacity-60" />
                </div>
              </th>
              <th
                onClick={() => handleSort('status')}
                className="py-3.5 px-4 font-bold cursor-pointer hover:text-indigo-600 transition-colors min-w-[130px]"
              >
                <div className="flex items-center gap-1.5">
                  <span>Status</span>
                  <ArrowUpDown className="w-3.5 h-3.5 opacity-60" />
                </div>
              </th>
              <th
                onClick={() => handleSort('priority')}
                className="py-3.5 px-4 font-bold cursor-pointer hover:text-indigo-600 transition-colors min-w-[110px]"
              >
                <div className="flex items-center gap-1.5">
                  <span>Priority</span>
                  <ArrowUpDown className="w-3.5 h-3.5 opacity-60" />
                </div>
              </th>
              <th className="py-3.5 px-4 font-bold min-w-[120px]">
                <span>Section</span>
              </th>
              <th
                onClick={() => handleSort('dueDate')}
                className="py-3.5 px-4 font-bold cursor-pointer hover:text-indigo-600 transition-colors min-w-[150px]"
              >
                <div className="flex items-center gap-1.5">
                  <span>Due Date</span>
                  <ArrowUpDown className="w-3.5 h-3.5 opacity-60" />
                </div>
              </th>
              <th className="py-3.5 px-4 font-bold min-w-[200px]">
                <span>SLA Progress</span>
              </th>
              <th className="py-3.5 px-4 font-bold text-right min-w-[90px]">
                <span>Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {filteredTasks.map((task) => (
              <tr
                key={task._id}
                className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors group"
              >
                {/* Title & Description */}
                <td className="py-4 px-4 align-middle">
                  <div className="font-semibold text-slate-900 dark:text-white line-clamp-1">
                    {task.title}
                  </div>
                  {task.description && (
                    <div className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                      {task.description}
                    </div>
                  )}
                </td>

                {/* Status with quick selector */}
                <td className="py-4 px-4 align-middle">
                  <select
                    value={task.status}
                    onChange={(e) => updateTaskStatus(task._id, e.target.value)}
                    className="text-xs font-semibold px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                  >
                    <option value="To Do">To Do</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Done">Done</option>
                  </select>
                </td>

                {/* Priority */}
                <td className="py-4 px-4 align-middle">
                  <span
                    className={`inline-block px-2.5 py-0.5 rounded-lg text-xs font-semibold border ${getPriorityBadge(
                      task.priority
                    )}`}
                  >
                    {task.priority}
                  </span>
                </td>

                {/* Section */}
                <td className="py-4 px-4 align-middle">
                  <span className="inline-flex items-center gap-1 text-xs text-slate-600 dark:text-slate-400">
                    <Folder className="w-3.5 h-3.5 text-indigo-500" />
                    <span>{task.section || 'General'}</span>
                  </span>
                </td>

                {/* Due Date */}
                <td className="py-4 px-4 align-middle text-xs text-slate-600 dark:text-slate-400">
                  <div className="flex items-center gap-1.5 whitespace-nowrap">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>{formatDisplayDate(task.dueDate)}</span>
                  </div>
                </td>

                {/* SLA Progress Bar with live ticker */}
                <td className="py-4 px-4 align-middle">
                  <div className="max-w-xs">
                    <SLAProgressBar task={task} compact={true} />
                  </div>
                </td>

                {/* Actions */}
                <td className="py-4 px-4 align-middle text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => setTaskModal({ isOpen: true, task })}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      title="Edit task"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() =>
                        setConfirmDialog({
                          isOpen: true,
                          title: 'Delete Task',
                          message: `Are you sure you want to delete "${task.title}"?`,
                          onConfirm: () => deleteTask(task._id),
                        })
                      }
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      title="Delete task"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ListView;
