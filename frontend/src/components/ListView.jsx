import React, { useState } from 'react';
import SlaBar from './SlaBar';
import { getSlaInfo } from '../utils/sla';

function ListView({ tasks, nowTime, onEdit, onDelete, onStageChange }) {
  const [sortField, setSortField] = useState('allocatedAt');
  const [sortAsc, setSortAsc] = useState(false);

  function handleSort(field) {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  }

  const sortedTasks = [...tasks].sort((a, b) => {
    let valA = a[sortField];
    let valB = b[sortField];

    if (sortField === 'slaDeadline' || sortField === 'allocatedAt') {
      valA = new Date(valA).getTime();
      valB = new Date(valB).getTime();
    } else if (typeof valA === 'string') {
      valA = valA.toLowerCase();
      valB = valB.toLowerCase();
    }

    if (valA < valB) return sortAsc ? -1 : 1;
    if (valA > valB) return sortAsc ? 1 : -1;
    return 0;
  });

  return (
    <div className="table-container">
      <table>
        <thead>
          <tr>
            <th style={{ minWidth: '220px' }} onClick={() => handleSort('title')}>Title {sortField === 'title' ? (sortAsc ? '▲' : '▼') : ''}</th>
            <th style={{ width: '130px' }} onClick={() => handleSort('stage')}>Stage {sortField === 'stage' ? (sortAsc ? '▲' : '▼') : ''}</th>
            <th style={{ width: '100px' }} onClick={() => handleSort('priority')}>Priority {sortField === 'priority' ? (sortAsc ? '▲' : '▼') : ''}</th>
            <th style={{ width: '120px' }} onClick={() => handleSort('section')}>Section {sortField === 'section' ? (sortAsc ? '▲' : '▼') : ''}</th>
            <th style={{ width: '160px' }} onClick={() => handleSort('slaDeadline')}>Deadline {sortField === 'slaDeadline' ? (sortAsc ? '▲' : '▼') : ''}</th>
            <th style={{ minWidth: '190px' }}>SLA Progress</th>
            <th style={{ width: '120px', textAlign: 'center' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {sortedTasks.map((task) => {
            const sla = getSlaInfo(task, nowTime);
            return (
              <tr key={task._id} className={sla.isBreached ? 'row-breached' : ''}>
                <td>
                  <strong>{task.title}</strong>
                  {task.description && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{task.description}</div>}
                </td>
                <td>
                  <select
                    value={task.stage}
                    onChange={(e) => onStageChange(task._id, e.target.value)}
                    className={`stage-select stage-select-${task.stage.toLowerCase()}`}
                  >
                    <option value="Allocated">Allocated</option>
                    <option value="Working">Working</option>
                    <option value="Completed">Completed</option>
                  </select>
                </td>
                <td>
                  <span className={`badge badge-${task.priority.toLowerCase()}`}>
                    {task.priority}
                  </span>
                </td>
                <td>
                  <span style={{ fontSize: '0.82rem', fontWeight: 500 }}>
                    {task.section || 'General'}
                  </span>
                </td>
                <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  {new Date(task.slaDeadline).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </td>
                <td>
                  <SlaBar task={task} nowTime={nowTime} />
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                    <button className="small" onClick={() => onEdit(task)}>Edit</button>
                    <button className="small danger" onClick={() => onDelete(task)}>Delete</button>
                  </div>
                </td>
              </tr>
            );
          })}
          {sortedTasks.length === 0 && (
            <tr>
              <td colSpan="7" style={{ textAlign: 'center', padding: '24px', color: '#64748b' }}>
                No tasks found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default ListView;
