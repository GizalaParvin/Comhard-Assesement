import React, { useState, useEffect } from 'react';
import Dashboard from '../components/Dashboard';
import ListView from '../components/ListView';
import GridView from '../components/GridView';
import KanbanView from '../components/KanbanView';
import SectionView from '../components/SectionView';
import TaskModal from '../components/TaskModal';

function TaskManager({ user, onLogout, theme, onToggleTheme }) {
  const [tasks, setTasks] = useState([]);
  const [sections, setSections] = useState([]);
  const [sectionStats, setSectionStats] = useState([]);
  const [overallStats, setOverallStats] = useState(null);

  const [activeView, setActiveView] = useState(() => localStorage.getItem('active_view') || 'list');
  const [nowTime, setNowTime] = useState(Date.now());
  const [toasts, setToasts] = useState([]);

  function showToast(message, type = 'info') {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3200);
  }

  function handleViewChange(view) {
    setActiveView(view);
    localStorage.setItem('active_view', view);
  }

  // Search & filter state
  const [search, setSearch] = useState('');
  const [filterStage, setFilterStage] = useState('All');
  const [filterPriority, setFilterPriority] = useState('All');
  const [filterSection, setFilterSection] = useState('All');

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  const token = localStorage.getItem('token');

  // 1-minute interval at the top level to refresh SLA live
  useEffect(() => {
    const timer = setInterval(() => {
      setNowTime(Date.now());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // Fetch helper with auth header
  async function apiFetch(endpoint, options = {}) {
    const res = await fetch(endpoint, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        ...options.headers
      }
    });
    if (res.status === 401) {
      onLogout();
      return null;
    }
    return res.json();
  }

  // Refetch all stats and tasks
  async function loadData() {
    try {
      const [tasksData, sectionsData, sectionStatsData, overallStatsData] = await Promise.all([
        apiFetch('/api/tasks'),
        apiFetch('/api/sections'),
        apiFetch('/api/stats/sections'),
        apiFetch('/api/stats/overall')
      ]);

      if (tasksData) setTasks(tasksData);
      if (sectionsData) setSections(sectionsData);
      if (sectionStatsData) setSectionStats(sectionStatsData);
      if (overallStatsData) setOverallStats(overallStatsData);
    } catch (err) {
      console.error('Failed to load data:', err);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  // Task Actions
  async function handleSaveTask(taskData) {
    try {
      if (editingTask) {
        await apiFetch(`/api/tasks/${editingTask._id}`, {
          method: 'PUT',
          body: JSON.stringify(taskData)
        });
        showToast('Task updated successfully', 'success');
      } else {
        await apiFetch('/api/tasks', {
          method: 'POST',
          body: JSON.stringify(taskData)
        });
        showToast('Task created successfully', 'success');
      }
      setIsModalOpen(false);
      setEditingTask(null);
      loadData();
    } catch (err) {
      showToast('Error saving task', 'error');
    }
  }

  async function handleDeleteTask(task) {
    if (window.confirm(`Are you sure you want to delete "${task.title}"?`)) {
      try {
        await apiFetch(`/api/tasks/${task._id}`, { method: 'DELETE' });
        showToast(`Deleted "${task.title}"`, 'info');
        loadData();
      } catch (err) {
        showToast('Error deleting task', 'error');
      }
    }
  }

  async function handleStageChange(taskId, newStage) {
    try {
      await apiFetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        body: JSON.stringify({ stage: newStage })
      });
      showToast(`Task moved to ${newStage}`, 'info');
      loadData();
    } catch (err) {
      showToast('Error updating stage', 'error');
    }
  }

  async function handleMoveSection(taskId, newSection) {
    try {
      await apiFetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        body: JSON.stringify({ section: newSection })
      });
      showToast(`Moved to ${newSection}`, 'info');
      loadData();
    } catch (err) {
      showToast('Error moving section', 'error');
    }
  }

  // Section Actions
  async function handleAddSection(name) {
    try {
      await apiFetch('/api/sections', {
        method: 'POST',
        body: JSON.stringify({ name })
      });
      showToast(`Section "${name}" created`, 'success');
      loadData();
    } catch (err) {
      showToast('Error creating section', 'error');
    }
  }

  async function handleRenameSection(id, name) {
    try {
      await apiFetch(`/api/sections/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ name })
      });
      showToast(`Section renamed to "${name}"`, 'success');
      loadData();
    } catch (err) {
      showToast('Error renaming section', 'error');
    }
  }

  async function handleDeleteSection(id) {
    try {
      await apiFetch(`/api/sections/${id}`, {
        method: 'DELETE'
      });
      showToast('Section deleted. Tasks moved to General', 'info');
      loadData();
    } catch (err) {
      showToast('Error deleting section', 'error');
    }
  }

  async function handleSeedSampleTasks() {
    try {
      await apiFetch('/api/tasks/seed', { method: 'POST' });
      showToast('Demo data loaded successfully!', 'success');
      loadData();
    } catch (err) {
      showToast('Error loading demo data', 'error');
    }
  }

  // Filter tasks
  const filteredTasks = tasks.filter((t) => {
    if (search && !t.title.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }
    if (filterStage !== 'All' && t.stage !== filterStage) {
      return false;
    }
    if (filterPriority !== 'All' && t.priority !== filterPriority) {
      return false;
    }
    if (filterSection !== 'All' && (t.section || 'General') !== filterSection) {
      return false;
    }
    return true;
  });

  return (
    <div>
      {/* Top Header */}
      <div className="header">
        <div className="brand">
          <div className="brand-icon">✓</div>
          <div>
            <h1>TaskFlow</h1>
            <span className="brand-sub">Intelligent Task Management</span>
          </div>
        </div>
        <div className="user-nav">
          <button
            type="button"
            className="theme-toggle-btn"
            onClick={onToggleTheme}
            title="Toggle Light / Dark mode"
          >
            {theme === 'dark' ? '☀️ Light Mode' : '🌙 Dark Mode'}
          </button>

          <div className="user-pill">
            <span className="user-avatar">{user.name ? user.name.charAt(0).toUpperCase() : 'U'}</span>
            <span>{user.name}</span>
          </div>
          <button onClick={onLogout} className="logout-btn">Logout</button>
        </div>
      </div>

      <div className="container">
        {/* Dashboard Counts, Stats & Filter Bar */}
        <Dashboard
          tasks={tasks}
          sections={sections}
          overallStats={overallStats}
          sectionStats={sectionStats}
          nowTime={nowTime}
          search={search}
          setSearch={setSearch}
          filterStage={filterStage}
          setFilterStage={setFilterStage}
          filterPriority={filterPriority}
          setFilterPriority={setFilterPriority}
          filterSection={filterSection}
          setFilterSection={setFilterSection}
          onOpenCreateModal={() => {
            setEditingTask(null);
            setIsModalOpen(true);
          }}
          onSeedSampleTasks={handleSeedSampleTasks}
        />

        {/* View Switcher Tabs */}
        <div className="view-tabs">
          <button
            className={activeView === 'list' ? 'active' : ''}
            onClick={() => handleViewChange('list')}
          >
            List View
          </button>
          <button
            className={activeView === 'grid' ? 'active' : ''}
            onClick={() => handleViewChange('grid')}
          >
            Grid View
          </button>
          <button
            className={activeView === 'kanban' ? 'active' : ''}
            onClick={() => handleViewChange('kanban')}
          >
            Kanban View
          </button>
          <button
            className={activeView === 'section' ? 'active' : ''}
            onClick={() => handleViewChange('section')}
          >
            Section View
          </button>
        </div>

        {/* Active View Container */}
        {activeView === 'list' && (
          <ListView
            tasks={filteredTasks}
            nowTime={nowTime}
            onEdit={(task) => {
              setEditingTask(task);
              setIsModalOpen(true);
            }}
            onDelete={handleDeleteTask}
            onStageChange={handleStageChange}
          />
        )}

        {activeView === 'grid' && (
          <GridView
            tasks={filteredTasks}
            nowTime={nowTime}
            onEdit={(task) => {
              setEditingTask(task);
              setIsModalOpen(true);
            }}
            onDelete={handleDeleteTask}
            onStageChange={handleStageChange}
          />
        )}

        {activeView === 'kanban' && (
          <KanbanView
            tasks={filteredTasks}
            nowTime={nowTime}
            onEdit={(task) => {
              setEditingTask(task);
              setIsModalOpen(true);
            }}
            onDelete={handleDeleteTask}
            onStageChange={handleStageChange}
          />
        )}

        {activeView === 'section' && (
          <SectionView
            tasks={filteredTasks}
            sections={sections}
            sectionStats={sectionStats}
            nowTime={nowTime}
            onEdit={(task) => {
              setEditingTask(task);
              setIsModalOpen(true);
            }}
            onDelete={handleDeleteTask}
            onStageChange={handleStageChange}
            onMoveSection={handleMoveSection}
            onAddSection={handleAddSection}
            onRenameSection={handleRenameSection}
            onDeleteSection={handleDeleteSection}
          />
        )}
      </div>

      {/* Task Create / Edit Modal */}
      <TaskModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingTask(null);
        }}
        onSave={handleSaveTask}
        editingTask={editingTask}
        sections={sections}
      />

      {/* Toast Feedback */}
      <div className="toast-container">
        {toasts.map((toast) => (
          <div key={toast.id} className={`toast toast-${toast.type}`}>
            <span>{toast.type === 'success' ? '✓' : toast.type === 'error' ? '⚠' : 'ℹ'}</span>
            <span>{toast.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default TaskManager;
