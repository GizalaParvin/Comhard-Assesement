import React from 'react';
import SlaBar from './SlaBar';

function GridView({ tasks, nowTime, onEdit, onDelete, onStageChange }) {
  if (tasks.length === 0) {
    return <div style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>No tasks found.</div>;
  }

  return (
    <div className="grid-container">
      {tasks.map((task) => (
        <div key={task._id} className="card">
          <div>
            <div className="card-header">
              <span className={`badge badge-${task.priority.toLowerCase()}`}>
                {task.priority}
              </span>
              <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>
                {task.section || 'General'}
              </span>
            </div>

            <h3>{task.title}</h3>
            {task.description && <p>{task.description}</p>}

            <SlaBar task={task} nowTime={nowTime} />
            <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>
              Deadline: {new Date(task.slaDeadline).toLocaleString()}
            </div>
          </div>

          <div className="card-footer">
            <select
              value={task.stage}
              onChange={(e) => onStageChange(task._id, e.target.value)}
              style={{ width: 'auto', padding: '3px 6px', fontSize: '0.8rem' }}
            >
              <option value="Allocated">Allocated</option>
              <option value="Working">Working</option>
              <option value="Completed">Completed</option>
            </select>

            <div style={{ display: 'flex', gap: '6px' }}>
              <button className="small" onClick={() => onEdit(task)}>Edit</button>
              <button className="small danger" onClick={() => onDelete(task)}>Delete</button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default GridView;
