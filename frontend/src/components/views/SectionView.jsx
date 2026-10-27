import React, { useState } from 'react';
import { useTasks } from '../../context/TaskContext';
import TaskCard from '../tasks/TaskCard';
import EmptyState from '../common/EmptyState';
import {
  ChevronDown,
  ChevronRight,
  Folder,
  Plus,
  Edit2,
  Trash2,
  FolderPlus,
} from 'lucide-react';

const SectionView = () => {
  const {
    filteredTasks,
    sections,
    setTaskModal,
    setSectionModal,
    setConfirmDialog,
    deleteSection,
  } = useTasks();

  // Collapsed sections tracking (default all expanded)
  const [collapsedSections, setCollapsedSections] = useState({});

  const toggleCollapse = (sectionName) => {
    setCollapsedSections((prev) => ({
      ...prev,
      [sectionName]: !prev[sectionName],
    }));
  };

  // Compile full list of section names including 'General' and user-created sections
  const allSectionNames = ['General', ...sections.map((s) => s.name)];
  // Also any custom sections currently on tasks not yet in sections table
  filteredTasks.forEach((t) => {
    if (t.section && !allSectionNames.includes(t.section)) {
      allSectionNames.push(t.section);
    }
  });

  const getSectionMetadata = (name) => {
    return sections.find((s) => s.name.toLowerCase() === name.toLowerCase()) || {
      name,
      color: '#6366f1',
    };
  };

  const handleDeleteSection = (sectionObj) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Section',
      message: `Delete "${sectionObj.name}"? Tasks currently in this section will be safely preserved and moved to "General".`,
      onConfirm: () => deleteSection(sectionObj._id),
    });
  };

  return (
    <div className="space-y-6">
      {allSectionNames.map((secName) => {
        const secMeta = getSectionMetadata(secName);
        const secTasks = filteredTasks.filter((t) => (t.section || 'General') === secName);
        const isCollapsed = collapsedSections[secName];
        const isUserSection = sections.some((s) => s.name === secName);
        const userSectionObj = sections.find((s) => s.name === secName);

        return (
          <div
            key={secName}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm transition-all"
          >
            {/* Section Header */}
            <div
              onClick={() => toggleCollapse(secName)}
              className="flex items-center justify-between p-4 sm:p-5 bg-slate-50/60 dark:bg-slate-800/40 cursor-pointer select-none border-b border-slate-100 dark:border-slate-800 hover:bg-slate-100/60 dark:hover:bg-slate-800/60 transition-colors"
            >
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-transform"
                >
                  {isCollapsed ? (
                    <ChevronRight className="w-5 h-5" />
                  ) : (
                    <ChevronDown className="w-5 h-5" />
                  )}
                </button>

                <div
                  className="w-3.5 h-3.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: secMeta.color || '#6366f1' }}
                />

                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span>{secName}</span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    {secTasks.length}
                  </span>
                </h3>
              </div>

              {/* Section Actions */}
              <div
                className="flex items-center gap-1 sm:gap-2"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Quick Add Task to this section */}
                <button
                  onClick={() =>
                    setTaskModal({
                      isOpen: true,
                      task: { section: secName },
                    })
                  }
                  className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 dark:hover:bg-indigo-900/60 transition-colors"
                  title={`Add task to ${secName}`}
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Add Task</span>
                </button>

                {/* Edit & Delete Section (only for user-created sections) */}
                {isUserSection && userSectionObj && (
                  <>
                    <button
                      onClick={() =>
                        setSectionModal({
                          isOpen: true,
                          section: userSectionObj,
                        })
                      }
                      className="p-1.5 rounded-xl text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                      title="Rename section"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteSection(userSectionObj)}
                      className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                      title="Delete section"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Collapsible Content */}
            {!isCollapsed && (
              <div className="p-4 sm:p-5">
                {secTasks.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {secTasks.map((task) => (
                      <TaskCard key={task._id} task={task} />
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center text-xs text-slate-400 dark:text-slate-500">
                    No tasks currently under "{secName}". Click "Add Task" to create one.
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}

      {/* Add New Section Banner at bottom */}
      <div className="pt-2 flex justify-center">
        <button
          onClick={() => setSectionModal({ isOpen: true, section: null })}
          className="flex items-center gap-2 px-5 py-2.5 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all font-semibold text-sm"
        >
          <FolderPlus className="w-4 h-4" />
          <span>Create Another Section</span>
        </button>
      </div>
    </div>
  );
};

export default SectionView;
