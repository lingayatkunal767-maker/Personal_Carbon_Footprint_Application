import React from 'react';

const StatSummaryRow = ({ stats }) => {
  return (
    <div className="stat-row">
      {stats.map((stat, index) => (
        <div key={index} className="stat-card">
          <div className={`stat-icon ${stat.iconClass}`}>{stat.icon}</div>
          <div>
            <div className="stat-val">
              {stat.value} {stat.unit && <span style={{ fontSize: '.75rem', color: 'var(--muted)', fontWeight: '500' }}>{stat.unit}</span>}
            </div>
            <div className="stat-lbl">{stat.label}</div>
            <div className={`stat-change ${stat.changeClass}`}>{stat.change}</div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatSummaryRow;
