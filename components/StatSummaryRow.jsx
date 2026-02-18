import React from 'react';

const StatSummaryRow = () => {
  const stats = [
    {
      icon: '🌿',
      iconClass: 'si-g',
      value: '348',
      unit: 'kg',
      label: 'Weekly Emissions',
      change: '▲ +12% vs last week',
      changeClass: 'up'
    },
    {
      icon: '🔥',
      iconClass: 'si-o',
      value: '21',
      unit: 'days',
      label: 'Current Streak',
      change: '▲ +3 this month',
      changeClass: 'dn'
    },
    {
      icon: '🌳',
      iconClass: 'si-b',
      value: '84',
      unit: 'kg',
      label: 'CO₂ Saved',
      change: '≈ 14 trees offset',
      changeClass: 'dn'
    },
    {
      icon: '⚡',
      iconClass: 'si-r',
      value: '1,240',
      unit: '',
      label: 'Eco Points',
      change: '▲ 180 pts this week',
      changeClass: 'dn'
    }
  ];

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
