import React from 'react';

const RecentActivity = () => {
  const activities = [
    { icon: '🚌', name: 'Took the bus to work', time: 'Today, 8:45 AM', delta: '−2.4 kg', isPositive: true },
    { icon: '✈️', name: 'Short-haul flight', time: 'Yesterday, 3:20 PM', delta: '+86 kg', isPositive: false },
    { icon: '🌱', name: 'Planted 2 trees', time: '2 days ago', delta: '−11 kg', isPositive: true },
    { icon: '🥗', name: 'Plant-based meal day', time: '3 days ago', delta: '−3.8 kg', isPositive: true },
    { icon: '🚲', name: 'Cycled to grocery store', time: '4 days ago', delta: '−1.2 kg', isPositive: true }
  ];

  return (
    <div className="card">
      <div className="card-title">Recent Activity <a>View All →</a></div>
      <div className="activity-list">
        {activities.map((activity, index) => (
          <div key={index} className={`act-item ${!activity.isPositive ? 'neg' : ''}`}>
            <span className="act-icon">{activity.icon}</span>
            <div className="act-info">
              <p>{activity.name}</p>
              <small>{activity.time}</small>
            </div>
            <span className={`act-delta ${activity.isPositive ? 'pos' : 'neg'}`}>{activity.delta}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentActivity;
