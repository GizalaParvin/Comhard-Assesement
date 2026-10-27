import React, { useState } from 'react';
import { useTasks } from '../../context/TaskContext';
import TaskCard from '../tasks/TaskCard';
import { Circle, Clock, CheckCircle2, Plus } from 'lucide-react';

const COLUMNS = [
  {
    id: 'To Do',
    title: 'To Do',
    icon: Circle,
    headerColor: 'text-slate-600 dark:text-slate-400',
    borderColor: 'border-slate-300 dark:border-slate-700',
    badgeBg: 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300',
  },
  {
    id: 'In Progress',
    title: 'In Progress',
    icon: Clock,
    headerColor: 'text-sky-600 dark:text-sky-400',
    borderColor: 'border-sky-300 dark:border-sky-800',
    badgeBg: 'bg-sky-100 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300',
  },
  {
    id: 'Done',
    title: 'Done',
    icon: CheckCircle2,
    headerColor: 'text-emerald-600 dark:text-emerald-400',
    borderColor: 'border-emerald-300 dark:border-emerald-800',
    badgeBg: 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300',
  },
];

const KanbanView = () => {
  const { filteredTasks, updateTaskStatus, setTaskModal } = useTasks();
  const [dragOverColumn, setDragOverColumn] = useState(null);

  const handleDragStart = (e, taskId) => {
    e.dataTransfer.setData('text/plain', taskId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, columnId) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverColumn !== columnId) {
      setDragOverColumn(columnId);
    }
  };

  const handleDragLeave = (columnId) => {
    if (dragOverColumn === columnId) {
      setDragOverColumn(null);
    }
  };

  const handleDrop = async (e, columnId) => {
    e.preventDefault();
    setDragOverColumn(null);
    const taskId = e.dataTransfer.getData('text/plain');
    if (!taskId) return;

    // Trigger update
    await updateTaskStatus(taskId, columnId);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-start">
      {COLUMNS.map((col) => {
        const Icon = col.icon;
        const columnTasks = filteredTasks.filter((t) => t.status === col.id);
        const isHovered = dragOverColumn === col.id;

        return (
          <div
            key={col.id}
            onDragOver={(e) => handleDragOver(e, col.id)}
            onDragLeave={() => handleDragLeave(col.id)}
            onDrop={(e) => handleDrop(e, col.id)}
            className={`flex flex-col bg-slate-100/70 dark:bg-slate-900/40 rounded-3xl p-4 border-2 transition-all min-h-[500px] ${
              isHovered
                ? 'border-indigo-500 bg-indigo-50/30 dark:bg-indigo-950/20 shadow-lg scale-[1.01]'
                : 'border-transparent'
            }`}
          >
            {/* Column Header */}
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Icon className={`w-4 h-4 ${col.headerColor}`} />
                <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">
                  {col.title}
                </h3>
                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${col.badgeBg}`}>
                  {columnTasks.length}
                </span>
              </div>

              {/* Quick Add in this status */}
              <button
                onClick={() =>
                  setTaskModal({
                    isOpen: true,
                    task: { status: col.id },
                  })
                }
                className="p-1 rounded-lg text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                title={`Add task to ${col.title}`}
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Task Card List with Drag and Drop */}
            <div className="flex-1 space-y-3 overflow-y-auto">
              {columnTasks.map((task) => (
                <TaskCard
                  key={task._id}
                  task={task}
                  isDraggable={true}
                  onDragStart={handleDragStart}
                />
              ))}

              {columnTasks.length === 0 && (
                <div className="h-32 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-xs text-slate-400 dark:text-slate-500 text-center p-4">
                  <span>Drop tasks here</span>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default KanbanView;
