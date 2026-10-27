import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { taskService, sectionService } from '../services/api';
import { useAuth } from './AuthContext';
import { calculateSLA } from '../utils/slaHelper';

const TaskContext = createContext();

export const TaskProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();

  // Core state
  const [tasks, setTasks] = useState([]);
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(false);

  // Active view with localStorage persistence
  const [activeView, setActiveView] = useState(() => {
    return localStorage.getItem('taskflow_view') || 'list';
  });

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterSection, setFilterSection] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');

  // Live timer tick for SLA (updates every 30 seconds live)
  const [currentTime, setCurrentTime] = useState(Date.now());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(Date.now());
    }, 30000); // 30 seconds live refresh
    return () => clearInterval(timer);
  }, []);

  // Sync active view to localStorage
  useEffect(() => {
    localStorage.setItem('taskflow_view', activeView);
  }, [activeView]);

  // Toast system
  const [toasts, setToasts] = useState([]);
  const showToast = (message, type = 'success') => {
    const id = Date.now() + Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };
  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Modals state
  const [taskModal, setTaskModal] = useState({ isOpen: false, task: null });
  const [sectionModal, setSectionModal] = useState({ isOpen: false, section: null });
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null,
  });

  // Fetch tasks and sections when authenticated
  const fetchAllData = async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    try {
      const [tasksRes, sectionsRes] = await Promise.all([
        taskService.getTasks(),
        sectionService.getSections(),
      ]);
      setTasks(tasksRes.data.data || []);
      setSections(sectionsRes.data.data || []);
    } catch (err) {
      console.error('[TaskContext Error] fetchAllData:', err);
      showToast('Failed to load tasks or sections', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchAllData();
    } else {
      setTasks([]);
      setSections([]);
    }
  }, [isAuthenticated]);

  // Task Actions
  const createTask = async (taskData) => {
    try {
      const res = await taskService.createTask(taskData);
      setTasks((prev) => [res.data.data, ...prev]);
      showToast('Task created successfully!', 'success');
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || 'Error creating task';
      showToast(msg, 'error');
      return { success: false, error: msg };
    }
  };

  const updateTask = async (id, taskData) => {
    try {
      const res = await taskService.updateTask(id, taskData);
      setTasks((prev) =>
        prev.map((t) => (t._id === id ? res.data.data : t))
      );
      showToast('Task updated successfully!', 'success');
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || 'Error updating task';
      showToast(msg, 'error');
      return { success: false, error: msg };
    }
  };

  // Quick status change (optimistic update for responsive drag-and-drop in Kanban)
  const updateTaskStatus = async (id, newStatus) => {
    const originalTasks = [...tasks];
    // Optimistic UI update
    setTasks((prev) =>
      prev.map((t) => {
        if (t._id === id) {
          return {
            ...t,
            status: newStatus,
            completedAt: newStatus === 'Done' ? (t.completedAt || new Date().toISOString()) : null,
          };
        }
        return t;
      })
    );

    try {
      const res = await taskService.updateTaskStatus(id, newStatus);
      // Sync with server returned data
      setTasks((prev) =>
        prev.map((t) => (t._id === id ? res.data.data : t))
      );
    } catch (err) {
      // Revert optimistic update on error
      setTasks(originalTasks);
      showToast('Failed to update task status', 'error');
    }
  };

  const deleteTask = async (id) => {
    try {
      await taskService.deleteTask(id);
      setTasks((prev) => prev.filter((t) => t._id !== id));
      showToast('Task deleted successfully', 'success');
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || 'Error deleting task';
      showToast(msg, 'error');
      return { success: false, error: msg };
    }
  };

  // Section Actions
  const createSection = async (sectionData) => {
    try {
      const res = await sectionService.createSection(sectionData);
      setSections((prev) => [...prev, res.data.data]);
      showToast(`Section "${res.data.data.name}" created`, 'success');
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || 'Error creating section';
      showToast(msg, 'error');
      return { success: false, error: msg };
    }
  };

  const renameSection = async (id, sectionData) => {
    try {
      const res = await sectionService.renameSection(id, sectionData);
      const updated = res.data.data;
      setSections((prev) =>
        prev.map((s) => (s._id === id ? updated : s))
      );
      // Also update tasks in local state whose section was renamed
      await fetchAllData();
      showToast(`Section renamed to "${updated.name}"`, 'success');
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || 'Error updating section';
      showToast(msg, 'error');
      return { success: false, error: msg };
    }
  };

  const deleteSection = async (id) => {
    try {
      await sectionService.deleteSection(id);
      setSections((prev) => prev.filter((s) => s._id !== id));
      // Refresh tasks because deleted section tasks moved to 'General'
      await fetchAllData();
      showToast('Section deleted and tasks moved to General', 'success');
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || 'Error deleting section';
      showToast(msg, 'error');
      return { success: false, error: msg };
    }
  };

  // Filtered and Sorted Tasks (reactive across all views)
  const filteredTasks = useMemo(() => {
    return tasks
      .filter((task) => {
        // Search filter
        if (searchTerm.trim()) {
          const term = searchTerm.toLowerCase();
          const matchTitle = task.title?.toLowerCase().includes(term);
          const matchDesc = task.description?.toLowerCase().includes(term);
          if (!matchTitle && !matchDesc) return false;
        }

        // Status filter
        if (filterStatus !== 'all' && task.status !== filterStatus) {
          return false;
        }

        // Priority filter
        if (filterPriority !== 'all' && task.priority !== filterPriority) {
          return false;
        }

        // Section filter
        if (filterSection !== 'all' && task.section !== filterSection) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        let valA = a[sortBy];
        let valB = b[sortBy];

        if (sortBy === 'priority') {
          const priorityWeights = { High: 3, Medium: 2, Low: 1 };
          valA = priorityWeights[a.priority] || 0;
          valB = priorityWeights[b.priority] || 0;
        } else if (sortBy === 'dueDate' || sortBy === 'createdAt') {
          valA = new Date(valA || 0).getTime();
          valB = new Date(valB || 0).getTime();
        } else if (typeof valA === 'string') {
          valA = valA.toLowerCase();
          valB = (valB || '').toLowerCase();
        }

        if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
        if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
  }, [tasks, searchTerm, filterStatus, filterPriority, filterSection, sortBy, sortOrder]);

  // SLA Dashboard Summary Metrics
  const stats = useMemo(() => {
    let completed = 0;
    let inProgress = 0;
    let atRisk = 0;
    let breached = 0;

    tasks.forEach((task) => {
      const sla = calculateSLA(task, currentTime);
      if (task.status === 'Done') {
        completed++;
        if (sla.isBreached) {
          breached++;
        }
      } else {
        if (task.status === 'In Progress') {
          inProgress++;
        }
        if (sla.status === 'risk') {
          atRisk++;
        } else if (sla.status === 'breached') {
          breached++;
        }
      }
    });

    return {
      total: tasks.length,
      completed,
      inProgress,
      atRisk,
      breached,
    };
  }, [tasks, currentTime]);

  return (
    <TaskContext.Provider
      value={{
        tasks,
        filteredTasks,
        sections,
        loading,
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
        sortBy,
        setSortBy,
        sortOrder,
        setSortOrder,
        currentTime,
        stats,
        fetchAllData,
        createTask,
        updateTask,
        updateTaskStatus,
        deleteTask,
        createSection,
        renameSection,
        deleteSection,
        toasts,
        showToast,
        removeToast,
        taskModal,
        setTaskModal,
        sectionModal,
        setSectionModal,
        confirmDialog,
        setConfirmDialog,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};

export const useTasks = () => {
  const context = useContext(TaskContext);
  if (!context) throw new Error('useTasks must be used within a TaskProvider');
  return context;
};
