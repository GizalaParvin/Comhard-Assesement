import React, { useState } from 'react';
import SlaBar from './SlaBar';
import { formatDuration } from '../utils/sla';

function SectionView({
  tasks,
  sections,
  sectionStats,
  nowTime,
  onEdit,
  onDelete,
  onStageChange,
  onMoveSection,
  onAddSection,
  onRenameSection,
  onDeleteSection
}) {
  const [collapsed, setCollapsed] = useState({});
  const [newSectionName, setNewSectionName] = useState('');

  function toggleCollapse(name) {
    setCollapsed((prev) => ({ ...prev, [name]: !prev[name] }));
  }

  // Combine default 'General' with user sections
  const allSectionNames = ['General'];
  sections.forEach((s) => {
    if (!allSectionNames.includes(s.name)) {
      allSectionNames.push(s.name);
    }
  });

  // Find average completion time from backend stats
  function getSectionAvg(name) {
    const stat = (sectionStats || []).find((s) => s.section === name);
    if (!stat || stat.avgDurationMs === null || stat.avgDurationMs === undefined) {
      return 'N/A';
    }
    return formatDuration(stat.avgDurationMs);
  }

  function handleCreateSection(e) {
    e.preventDefault();
    if (newSectionName.trim()) {
      onAddSection(newSectionName.trim());
      setNewSectionName('');
    }
  }

  return (
    <div>
      {/* Create Section Form */}
      <form onSubmit={handleCreateSection} style={{ display: 'flex', gap: '8px', marginBottom: '16px', maxWidth: '350px' }}>
        <input
          type="text"
          placeholder="New section name..."
          value={newSectionName}
          onChange={(e) => setNewSectionName(e.target.value)}
        />
        <button type="submit" className="primary" style={{ whiteSpace: 'nowrap' }}>Add Section</button>
      </form>

      {/* Sections List */}
      {allSectionNames.map((sectionName) => {
        const sectionTasks = tasks.filter((t) => (t.section || 'General') === sectionName);
        const isCollapsed = !!collapsed[sectionName];
        const userSectionObj = sections.find((s) => s.name === sectionName);
        const avgTime = getSectionAvg(sectionName);

        return (
          <div key={sectionName} className="section-group">
            <div className="section-header" onClick={() => toggleCollapse(sectionName)}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '0.85rem' }}>{isCollapsed ? '▶' : '▼'}</span>
                <strong>{sectionName}</strong>
                <span className="badge badge-allocated">{sectionTasks.length} tasks</span>
                <span style={{ fontSize: '0.8rem', color: '#475569', marginLeft: '8px', background: '#e2e8f0', padding: '2px 8px', borderRadius: '4px' }}>
                  Avg Completion Time: <strong>{avgTime}</strong>
                </span>
              </div>

              {/* Actions on section */}
              {userSectionObj && (
                <div onClick={(e) => e.stopPropagation()} style={{ display: 'flex', gap: '6px' }}>
                  <button
                    className="small"
                    onClick={() => {
                      const newName = prompt('Rename section to:', sectionName);
                      if (newName && newName.trim() && newName.trim() !== sectionName) {
                        onRenameSection(userSectionObj._id, newName.trim());
                      }
                    }}
                  >
                    Rename
                  </button>
                  <button
                    className="small danger"
                    onClick={() => {
                      if (confirm(`Delete section "${sectionName}"? Tasks will move to General.`)) {
                        onDeleteSection(userSectionObj._id);
                      }
                    }}
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>

            {/* Tasks inside this section */}
            {!isCollapsed && (
              <div className="section-body">
                {sectionTasks.length === 0 ? (
                  <div style={{ color: '#94a3b8', fontSize: '0.85rem' }}>No tasks in this section.</div>
                ) : (
                  <div className="grid-container">
                    {sectionTasks.map((task) => (
                      <div key={task._id} className="card">
                        <div>
                          <div className="card-header">
                            <span className={`badge badge-${task.priority.toLowerCase()}`}>
                              {task.priority}
                            </span>
                            <span className={`badge badge-${task.stage.toLowerCase()}`}>
                              {task.stage}
                            </span>
                          </div>

                          <h3>{task.title}</h3>
                          {task.description && <p>{task.description}</p>}
                          <SlaBar task={task} nowTime={nowTime} />
                        </div>

                        <div className="card-footer">
                          {/* Move section selector */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Move:</span>
                            <select
                              value={task.section || 'General'}
                              onChange={(e) => onMoveSection(task._id, e.target.value)}
                              style={{ width: 'auto', padding: '2px 4px', fontSize: '0.75rem' }}
                            >
                              {allSectionNames.map((sec) => (
                                <option key={sec} value={sec}>{sec}</option>
                              ))}
                            </select>
                          </div>

                          <div style={{ display: 'flex', gap: '6px' }}>
                            <button className="small" onClick={() => onEdit(task)}>Edit</button>
                            <button className="small danger" onClick={() => onDelete(task)}>Delete</button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default SectionView;
