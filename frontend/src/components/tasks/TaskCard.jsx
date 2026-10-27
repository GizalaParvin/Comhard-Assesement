import React from 'react';
import { useTasks } from '../../context/TaskContext';
import SLAProgressBar from '../sla/SLAProgressBar';
import { formatDisplayDate } from '../../utils/slaHelper';
import {
  Calendar,
  MoreVertical,
  Edit2,
  Trash2,
  CheckCircle,
  Clock,
  Circle,
  Folder,
} from 'lucide-react';

const TaskCard = ({ task, isDraggable = false, onDragStart }) => {
  const { setTaskModal, setConfirmDialog, deleteTask, updateTaskStatus } = useTasks();

  const handleEdit = (e) => {
    e.stopPropagation();
    setTaskModal({ isOpen: true, task });
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Task',
      message: `Are you sure you want to permanently delete "${task.title}"?`,
      onConfirm: () => deleteTask(task._id),
    });
  };

  const handleStatusChange = (e) => {
    e.stopPropagation();
    updateTaskStatus(task._id, e.target.value);
  };

  // Priority badge styling
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

  // Status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case 'Done':
        return <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />;
      case 'In Progress':
        return <Clock className="w-3.5 h-3.5 text-sky-500" />;
      case 'To Do':
      default:
        return <Circle className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  return (
    <div
      draggable={isDraggable}
      onDragStart={(e) => onDragStart && onDragStart(e, task._id)}
      className={`group bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/90 rounded-2xl p-4 sm:p-5 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between gap-3 ${
        isDraggable ? 'cursor-grab active:cursor-grabbing hover:border-indigo-400 dark:hover:border-indigo-600' : ''
      }`}
    >
      {/* Top Header: Section + Priority + Actions */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          {/* Section badge */}
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
            <Folder className="w-3 h-3 text-indigo-500" />
            <span className="truncate max-w-[90px]">{task.section || 'General'}</span>
          </span>

          {/* Priority badge */}
          <span
            className={`px-2 py-0.5 rounded-lg text-[11px] font-semibold border ${getPriorityBadge(
              task.priority
            )}`}
          >
            {task.priority}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1 opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
          <button
            onClick={handleEdit}
            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Edit task"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleDelete}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Delete task"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Task Content: Title and Description */}
      <div>
        <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white leading-snug line-clamp-2">
          {task.title}
        </h3>
        {task.description && (
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
            {task.description}
          </p>
        )}
      </div>

      {/* SLA Progress Bar Engine */}
      <div className="pt-1">
        <SLAProgressBar task={task} compact={false} />
      </div>

      {/* Footer: Due date info & Quick Status Changer */}
      <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-[11px]">
          <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
          <span className="truncate">{formatDisplayDate(task.dueDate)}</span>
        </div>

        {/* Quick Status Select */}
        <div className="flex items-center gap-1">
          {getStatusIcon(task.status)}
          <select
            value={task.status}
            onChange={handleStatusChange}
            className="text-[11px] font-semibold bg-transparent text-slate-700 dark:text-slate-300 border-none focus:ring-0 cursor-pointer p-0"
          >
            <option value="To Do">To Do</option>
            <option value="In Progress">In Progress</option>
            <option value="Done">Done</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
