import React from 'react';

const GoalsCard = () => {
  const goals = [
    { name: 'Reduce Monthly Emissions by 20%', progress: 40, color: 'linear-gradient(90deg,var(--g-mid),var(--g-light))' },
    { name: 'Switch to Renewable Energy', progress: 65, color: 'linear-gradient(90deg,#4a90d9,#81c784)' },
    { name: 'Plant 50 Trees This Year', progress: 28, color: 'linear-gradient(90deg,var(--gold),#f4c844)' }
  ];

  return (
    <div className="card">
      <div className="card-title">Your Goals <a>+ Add Goal</a></div>
      {goals.map((goal, index) => (
        <div key={index} className="goal-item">
          <div className="goal-meta">
            <span>{goal.name}</span>
            <span className="goal-pct">{goal.progress}%</span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${goal.progress}%`, background: goal.color }}></div>
          </div>
        </div>
      ))}
      <button className="btn-goals">Manage Goals ▾</button>
    </div>
  );
};

export default GoalsCard;
