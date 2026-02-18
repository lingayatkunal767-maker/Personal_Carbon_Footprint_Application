import React from 'react';

const NotificationsPanel = ({ isOpen, onClose }) => {
  const notifications = [
    { type: 'alert', icon: '⚠️', text: 'Emissions up 12% this week!', detail: 'Try reducing transport to hit your goal.' },
    { type: 'warn', icon: '🎯', text: 'Goal is 40% complete!', detail: "You're halfway to reducing monthly emissions." },
    { type: '', icon: '🏆', text: 'Team Green crossed 800 pts!', detail: 'Leaderboard updated 2 hours ago.' },
    { type: '', icon: '🌱', text: 'New personalised Eco Tips ready', detail: 'Check the tips section for new recommendations.' },
    { type: '', icon: '🏅', text: '"Transport Pro" badge earned!', detail: 'Congratulations on your 21-day streak!' }
  ];

  return (
    <div className={`notif-panel ${isOpen ? 'open' : ''}`}>
      <div className="notif-header">
        Notifications
        <button className="notif-close" onClick={onClose}>✕</button>
      </div>
      <div className="notif-list">
        {notifications.map((notif, index) => (
          <div key={index} className={`notif-item ${notif.type}`}>
            <p>{notif.icon} {notif.text}</p>
            <small>{notif.detail}</small>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NotificationsPanel;
