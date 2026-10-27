import React from 'react';
import { useTasks } from '../../context/TaskContext';
import {
  Search,
  Filter,
  Plus,
  LayoutList,
  LayoutGrid,
  Kanban,
  FolderKanban,
  X,
  ArrowUpDown,
  FolderPlus,
} from 'lucide-react';

const FilterBar = () => {
  const {
    activeView,
    setActiveView,
    searchTerm,
    setSearchTerm,
    filterStatus,
    setFilterStatus,
    filterPriority,
    setFilterPriority,
    filterSection,
    setFilterSection,
    sections,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    setTaskModal,
    setSectionModal,
  } = useTasks();

  const views = [
    { id: 'list', label: 'List', icon: LayoutList },
    { id: 'grid', label: 'Grid', icon: LayoutGrid },
    { id: 'kanban', label: 'Kanban', icon: Kanban },
    { id: 'section', label: 'Sections', icon: FolderKanban },
  ];

  const hasActiveFilters =
    searchTerm || filterStatus !== 'all' || filterPriority !== 'all' || filterSection !== 'all';

  const resetFilters = () => {
    setSearchTerm('');
    setFilterStatus('all');
    setFilterPriority('all');
    setFilterSection('all');
  };

  return (
    <div className="space-y-4 mb-6">
      {/* Top row: View Switcher Tabs & Primary Action Buttons */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Four View Mode Switcher */}
        <div className="flex items-center p-1 bg-slate-200/80 dark:bg-slate-800/80 rounded-2xl overflow-x-auto shadow-inner">
          {views.map((v) => {
            const Icon = v.icon;
            const isActive = activeView === v.id;
            return (
              <button
                key={v.id}
                onClick={() => setActiveView(v.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{v.label}</span>
              </button>
            );
          })}
        </div>

        {/* Action Buttons: New Section + New Task */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setSectionModal({ isOpen: true, section: null })}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs sm:text-sm font-semibold transition-all"
          >
            <FolderPlus className="w-4 h-4 text-indigo-500" />
            <span>Add Section</span>
          </button>

          <button
            onClick={() => setTaskModal({ isOpen: true, task: null })}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-semibold shadow-md shadow-indigo-600/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span>New Task</span>
          </button>
        </div>
      </div>

      {/* Bottom row: Search input, Dropdown Filters, Sort & Reset */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 sm:p-4 shadow-sm flex flex-wrap items-center gap-3">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search tasks by title or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-800 dark:text-slate-100 placeholder-slate-400"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter by Status */}
        <div className="flex items-center gap-1.5">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-700 dark:text-slate-200"
          >
            <option value="all">Status: All</option>
            <option value="To Do">To Do</option>
            <option value="In Progress">In Progress</option>
            <option value="Done">Done</option>
          </select>
        </div>

        {/* Filter by Priority */}
        <div className="flex items-center gap-1.5">
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="px-3 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-700 dark:text-slate-200"
          >
            <option value="all">Priority: All</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>

        {/* Filter by Section */}
        <div className="flex items-center gap-1.5">
          <select
            value={filterSection}
            onChange={(e) => setFilterSection(e.target.value)}
            className="px-3 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-700 dark:text-slate-200"
          >
            <option value="all">Section: All</option>
            <option value="General">General</option>
            {sections.map((s) => (
              <option key={s._id} value={s.name}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        {/* Sort Options */}
        <div className="flex items-center gap-1">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-700 dark:text-slate-200"
          >
            <option value="createdAt">Sort: Created Date</option>
            <option value="dueDate">Sort: Due Date</option>
            <option value="priority">Sort: Priority</option>
            <option value="title">Sort: Title</option>
          </select>

          <button
            onClick={() => setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'))}
            className="p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            title={`Sort order: ${sortOrder === 'asc' ? 'Ascending' : 'Descending'}`}
          >
            <ArrowUpDown className="w-4 h-4" />
          </button>
        </div>

        {/* Clear Filters Button if any applied */}
        {hasActiveFilters && (
          <button
            onClick={resetFilters}
            className="px-2.5 py-2 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl font-medium transition-colors flex items-center gap-1"
          >
            <X className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default FilterBar;
