import React, { useState } from 'react';

const RecentActivity = ({ activities, onRemove }) => {
  const [showAll, setShowAll] = useState(false);
  const visibleActivities = showAll ? activities : activities.slice(0, 5);

  return (
    <div className="card recent-activity-card">
      <div className="card-title">
        Recent Activity
        <button className="card-action" onClick={() => setShowAll((prev) => !prev)}>
          {showAll ? 'Show Less' : 'View All →'}
        </button>
      </div>
      {activities.length === 0 ? (
        <div className="card-empty">
          <span>📋</span>
          <p>No activities logged yet</p>
          <small>Click "+ Log Activity" to record your first activity</small>
        </div>
      ) : (
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
          {activities.length > 5 && (
            <button className="card-action" style={{marginTop:'0.5rem',width:'100%',textAlign:'center'}} onClick={() => setShowAll(prev => !prev)}>
              {showAll ? 'Show Less ▲' : `Show All ${activities.length} Activities ▼`}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default RecentActivity;
