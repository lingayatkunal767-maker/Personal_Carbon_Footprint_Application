import React, { useState } from 'react';

const GoalsCard = ({ goals, onAddGoal, onUpdateGoal, onRemoveGoal }) => {
  const [showForm, setShowForm] = useState(false);
  const [formName, setFormName] = useState('');
  const [formTarget, setFormTarget] = useState('');
  const [formCurrent, setFormCurrent] = useState('');
  const [formDeadline, setFormDeadline] = useState('');
  const [editId, setEditId] = useState(null);
  const [editVal, setEditVal] = useState('');

  const todayStr = new Date().toISOString().split('T')[0];

  const resetForm = () => {
    setFormName(''); setFormTarget(''); setFormCurrent(''); setFormDeadline('');
    setShowForm(false);
  };

  const handleAdd = () => {
    if (!formName.trim() || !formTarget || Number(formTarget) < 1) return;
    const target = Number(formTarget);
    const current = Math.min(target, Math.max(0, Number(formCurrent) || 0));
    const progress = Math.round((current / target) * 100);
    onAddGoal({
      id: `goal-${Date.now()}`,
      name: formName.trim(),
      progress,
      targetValue: target,
      currentValue: current,
      deadline: formDeadline || null,
      color: 'linear-gradient(90deg,var(--g-mid),var(--g-light))',
    });
    resetForm();
  };

  const applyUpdate = (goal) => {
    const newCurrent = Math.min(goal.targetValue, Math.max(0, Number(editVal) || 0));
    onUpdateGoal(goal.id, { currentValue: newCurrent });
    setEditId(null);
  };

  const formatDeadline = (d) => {
    if (!d) return null;
    const date = new Date(d + 'T00:00:00');
    const now = new Date();
    const diffDays = Math.ceil((date - now) / 86400000);
    const label = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    if (diffDays < 0) return { label, status: 'overdue', badge: '⚠ Overdue' };
    if (diffDays === 0) return { label, status: 'urgent', badge: '🔥 Today' };
    if (diffDays <= 7) return { label, status: 'urgent', badge: `⏰ ${diffDays}d left` };
    return { label, status: 'ok', badge: `📅 ${label}` };
  };

  const activeGoals = goals.filter(g => (g.progress ?? 0) < 100);
  const completedGoals = goals.filter(g => (g.progress ?? 0) >= 100);

  const GoalItem = ({ goal }) => {
    const isEditing = editId === goal.id;
    const dl = formatDeadline(goal.deadline);
    const completed = (goal.progress ?? 0) >= 100;
    const currentKg = goal.currentValue ?? Math.round(((goal.progress ?? 0) / 100) * (goal.targetValue || 100));

    return (
      <div className={`goal-item${completed ? ' goal-item-completed' : ''}`}>
        <div className="goal-meta">
          <div className="goal-header-main">
            {completed && <span className="goal-complete-icon">✅</span>}
            <span className={`goal-name${completed ? ' completed' : ''}`}>
              {goal.name}
            </span>
          </div>
          <div className="goal-header-side">
            {dl && (
              <span className={`goal-deadline-badge ${dl.status}`}>
                {dl.badge}
              </span>
            )}
            <span className={`goal-pct${completed ? ' completed' : ''}`}>
              {goal.progress ?? 0}%
            </span>
          </div>
        </div>

        <progress className={`goal-progress${completed ? ' completed' : ''}`} value={goal.progress ?? 0} max="100" />

        {(goal.targetValue > 0) && (
          <div className="goal-target-row">
            <span className={`goal-saved-value${completed ? ' completed' : ''}`}>
              {currentKg} kg saved
            </span>
            <span>Target: {goal.targetValue} kg CO₂</span>
          </div>
        )}

        {isEditing ? (
          <div className="goal-edit-row">
            <span className="goal-edit-label">Saved so far (kg):</span>
            <input
              type="number"
              min="0"
              max={goal.targetValue}
              value={editVal}
              onChange={e => setEditVal(e.target.value)}
              className="goal-edit-input"
              autoFocus
            />
            <button
              className="btn-save"
              type="button"
              onClick={() => applyUpdate(goal)}
            >
              ✓ Save
            </button>
            <button
              className="btn-cancel"
              type="button"
              onClick={() => setEditId(null)}
            >
              ✕
            </button>
          </div>
        ) : (
          <div className="goal-action-row">
            {!completed && (
              <button
                className="card-action goal-action-btn"
                type="button"
                onClick={() => { setEditId(goal.id); setEditVal(String(currentKg)); }}
              >
                ✏ Update Progress
              </button>
            )}
            <button
              className="card-action goal-action-btn goal-remove-btn"
              type="button"
              onClick={() => onRemoveGoal(goal.id)}
            >
              🗑 Remove
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="card">
      <div className="card-title">
        🎯 Your Goals
        <button className="card-action" onClick={() => setShowForm(p => !p)}>
          {showForm ? '✕ Close' : '+ Add Goal'}
        </button>
      </div>

      {showForm && (
        <div className="goal-form-panel">
          <div className="form-group">
            <label>Goal Name *</label>
            <input
              type="text"
              placeholder="e.g. Reduce car trips by 50%"
              value={formName}
              onChange={e => setFormName(e.target.value)}
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>CO₂ Reduction Target (kg) *</label>
              <input
                type="number"
                min="1"
                placeholder="e.g. 50"
                value={formTarget}
                onChange={e => setFormTarget(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Already Saved (kg)</label>
              <input
                type="number"
                min="0"
                placeholder="0"
                value={formCurrent}
                onChange={e => setFormCurrent(e.target.value)}
              />
            </div>
          </div>
          <div className="form-group">
            <label>Deadline (optional)</label>
            <input
              type="date"
              value={formDeadline}
              min={todayStr}
              onChange={e => setFormDeadline(e.target.value)}
            />
          </div>
          <div className="modal-footer goal-form-actions">
            <button type="button" className="btn-cancel" onClick={resetForm}>Cancel</button>
            <button
              className="btn-save"
              type="button"
              onClick={handleAdd}
              disabled={!formName.trim() || !formTarget || Number(formTarget) < 1}
            >
              Add Goal
            </button>
          </div>
        </div>
      )}

      {goals.length === 0 ? (
        <div className="card-empty">
          No goals yet — add your first CO₂ reduction goal to start tracking!
        </div>
      ) : (
        <>
          {activeGoals.length > 0 && (
            <div className="goal-section">
              <div className="goal-section-label">
                Active ({activeGoals.length})
              </div>
              {activeGoals.map(g => <GoalItem key={g.id} goal={g} />)}
            </div>
          )}
          {completedGoals.length > 0 && (
            <div className={`goal-completed-section${activeGoals.length > 0 ? ' has-active' : ''}`}>
              <div className="goal-section-label completed">
                ✅ Completed ({completedGoals.length})
              </div>
              {completedGoals.map(g => <GoalItem key={g.id} goal={g} />)}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default GoalsCard;
