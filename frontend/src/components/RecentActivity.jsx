import React, { useState } from 'react';

const RecentActivity = ({ activities, onRemove }) => {
  const [showAll, setShowAll] = useState(false);
  const visibleActivities = showAll ? activities : activities.slice(0, 5);

  return (
    <div className="card">
      <div className="card-title">
        Recent Activity
        <button className="card-action" onClick={() => setShowAll((prev) => !prev)}>
          {showAll ? 'Show Less' : 'View All →'}
        </button>
      </div>
      <div className="activity-list">
        {visibleActivities.map((activity) => (
          <div key={activity.id} className={`act-item ${!activity.isPositive ? 'neg' : ''}`}>
            <span className="act-icon">{activity.icon}</span>
            <div className="act-info">
              <p>{activity.name}</p>
              <small>{activity.time}</small>
            </div>
            <span className={`act-delta ${activity.isPositive ? 'pos' : 'neg'}`}>
              {activity.deltaKg < 0 ? '−' : '+'}{Math.abs(activity.deltaKg).toFixed(1)} kg
            </span>
            <button className="btn-logout" onClick={() => onRemove(activity.id)}>Remove</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentActivity;
