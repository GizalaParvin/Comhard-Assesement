import React from 'react';
import SlaBar from './SlaBar';

const STAGES = ['Allocated', 'Working', 'Completed'];

function KanbanView({ tasks, nowTime, onEdit, onDelete, onStageChange }) {
  function handleDragStart(e, taskId) {
    e.dataTransfer.setData('text/plain', taskId);
  }

  function handleDragOver(e) {
    e.preventDefault();
  }

  function handleDrop(e, stage) {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain');
    if (taskId) {
      onStageChange(taskId, stage);
    }
  }

  return (
    <div className="kanban-board">
      {STAGES.map((stage) => {
        const stageTasks = tasks.filter((t) => t.stage === stage);

        return (
          <div
            key={stage}
            className="kanban-column"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, stage)}
          >
            <div className="kanban-column-header">
              <span>{stage}</span>
              <span className="badge badge-allocated">{stageTasks.length}</span>
            </div>

            <div className="kanban-cards">
              {stageTasks.map((task) => (
                <div
                  key={task._id}
                  className="kanban-card"
                  draggable
                  onDragStart={(e) => handleDragStart(e, task._id)}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span className={`badge badge-${task.priority.toLowerCase()}`}>
                      {task.priority}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                      {task.section || 'General'}
                    </span>
                  </div>

                  <strong style={{ fontSize: '0.9rem' }}>{task.title}</strong>
                  {task.description && (
                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>
                      {task.description}
                    </div>
                  )}

                  <SlaBar task={task} nowTime={nowTime} />

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '4px', marginTop: '8px' }}>
                    <button className="small" onClick={() => onEdit(task)}>Edit</button>
                    <button className="small danger" onClick={() => onDelete(task)}>Delete</button>
                  </div>
                </div>
              ))}

              {stageTasks.length === 0 && (
                <div style={{ textAlign: 'center', padding: '30px 10px', color: '#94a3b8', fontSize: '0.8rem', border: '1px dashed #cbd5e1', borderRadius: '4px' }}>
                  Drag cards here
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default KanbanView;
