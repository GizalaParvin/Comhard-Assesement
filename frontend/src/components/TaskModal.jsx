import React, { useState, useEffect } from 'react';

function toDateTimeLocal(dateVal) {
  if (!dateVal) return '';
  const d = new Date(dateVal);
  const pad = (n) => String(n).padStart(2, '0');
  const year = d.getFullYear();
  const month = pad(d.getMonth() + 1);
  const day = pad(d.getDate());
  const hours = pad(d.getHours());
  const minutes = pad(d.getMinutes());
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function TaskModal({ isOpen, onClose, onSave, editingTask, sections }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [section, setSection] = useState('General');
  const [stage, setStage] = useState('Allocated');
  const [slaDeadline, setSlaDeadline] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (editingTask) {
      setTitle(editingTask.title || '');
      setDescription(editingTask.description || '');
      setPriority(editingTask.priority || 'Medium');
      setSection(editingTask.section || 'General');
      setStage(editingTask.stage || 'Allocated');
      setSlaDeadline(toDateTimeLocal(editingTask.slaDeadline));
    } else {
      setTitle('');
      setDescription('');
      setPriority('Medium');
      setSection('General');
      setStage('Allocated');
      // Default deadline: 4 hours from now
      const defaultDue = new Date(Date.now() + 4 * 60 * 60 * 1000);
      setSlaDeadline(toDateTimeLocal(defaultDue));
    }
    setError('');
  }, [editingTask, isOpen]);

  if (!isOpen) return null;

  function handleSubmit(e) {
    e.preventDefault();
    if (!title.trim()) {
      setError('Title is required');
      return;
    }
    if (!slaDeadline) {
      setError('SLA Deadline is required');
      return;
    }

    onSave({
      title: title.trim(),
      description: description.trim(),
      priority,
      section,
      stage,
      slaDeadline: new Date(slaDeadline).toISOString()
    });
  }

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>{editingTask ? 'Edit Task' : 'New Task'}</h2>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Prepare client deliverables"
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              rows="2"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Notes or details..."
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div className="form-group">
              <label>Priority</label>
              <select value={priority} onChange={(e) => setPriority(e.target.value)}>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>

            <div className="form-group">
              <label>Section</label>
              <select value={section} onChange={(e) => setSection(e.target.value)}>
                <option value="General">General</option>
                {sections.map((s) => (
                  <option key={s._id} value={s.name}>{s.name}</option>
                ))}
              </select>
            </div>
          </div>

          {editingTask && (
            <div className="form-group">
              <label>Stage</label>
              <select value={stage} onChange={(e) => setStage(e.target.value)}>
                <option value="Allocated">Allocated</option>
                <option value="Working">Working</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
          )}

          <div className="form-group">
            <label>SLA Deadline *</label>
            <input
              type="datetime-local"
              value={slaDeadline}
              onChange={(e) => setSlaDeadline(e.target.value)}
            />
          </div>

          <div className="modal-actions">
            <button type="button" onClick={onClose}>Cancel</button>
            <button type="submit" className="primary">{editingTask ? 'Save Changes' : 'Create Task'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default TaskModal;
