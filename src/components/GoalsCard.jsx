import React, { useState } from 'react';

const GoalsCard = ({ goals, onAddGoal, onUpdateGoal, onRemoveGoal }) => {
  const [showForm, setShowForm] = useState(false);
  const [manageMode, setManageMode] = useState(false);
  const [name, setName] = useState('');
  const [progress, setProgress] = useState(25);

  const handleAdd = () => {
    if (!name.trim()) {
      return;
    }
    onAddGoal({
      id: `goal-${Date.now()}`,
      name: name.trim(),
      progress: Math.min(100, Math.max(0, Number(progress) || 0)),
      color: 'linear-gradient(90deg,var(--g-mid),var(--g-light))'
    });
    setName('');
    setProgress(25);
    setShowForm(false);
  };

  return (
    <div className="card">
      <div className="card-title">
        Your Goals
        <button className="card-action" onClick={() => setShowForm((prev) => !prev)}>
          {showForm ? 'Close' : '+ Add Goal'}
        </button>
      </div>
      {showForm && (
        <div style={{ marginBottom: '1rem' }}>
          <div className="form-group">
            <label>Goal</label>
            <input
              type="text"
              placeholder="e.g. Reduce car trips"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Target Progress (%)</label>
            <input
              type="number"
              min="0"
              max="100"
              value={progress}
              onChange={(e) => setProgress(e.target.value)}
            />
          </div>
          <div className="modal-footer" style={{ marginTop: '.6rem' }}>
            <button className="btn-cancel" onClick={() => setShowForm(false)}>Cancel</button>
            <button className="btn-save" onClick={handleAdd}>Add Goal</button>
          </div>
        </div>
      )}
      {goals.map((goal) => (
        <div key={goal.id} className="goal-item">
          <div className="goal-meta">
            <span>{goal.name}</span>
            <span className="goal-pct">{goal.progress}%</span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${goal.progress}%`, background: goal.color }}></div>
          </div>
          {manageMode && (
            <div style={{ display: 'flex', gap: '.6rem', marginTop: '.5rem', alignItems: 'center' }}>
              <input
                type="range"
                min="0"
                max="100"
                value={goal.progress}
                onChange={(e) => onUpdateGoal(goal.id, { progress: Number(e.target.value) })}
                style={{ flex: 1 }}
              />
              <button className="btn-logout" onClick={() => onRemoveGoal(goal.id)}>Remove</button>
            </div>
          )}
        </div>
      ))}
      <button className="btn-goals" onClick={() => setManageMode((prev) => !prev)}>
        {manageMode ? 'Done' : 'Manage Goals ▾'}
      </button>
    </div>
  );
};

export default GoalsCard;
