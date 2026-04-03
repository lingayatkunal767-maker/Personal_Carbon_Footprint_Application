import React from 'react';
import { useNavigate } from 'react-router-dom';

const TopBar = ({ onLogout, onOpenModal, onOpenNotifications, unreadCount }) => {
  const navigate = useNavigate();

  return (
    <div className="topbar">
      <div className="logo">
        <svg width="30" height="30" viewBox="0 0 40 40" fill="none">
          <circle cx="20" cy="20" r="20" fill="#d4edda"/>
          <path d="M20 8C14 8 10 13 10 18c0 6 5 10 10 14 5-4 10-8 10-14 0-5-4-10-10-10z" fill="#2d7a4f"/>
          <path d="M20 16v12M20 22c-2-2-5-2-6-4M20 20c2-2 5-2 6-4" stroke="#fff" strokeWidth="1.8" strokeLinecap="round"/>
        </svg>
        <span className="logo-text">Carbon<em>Calc</em></span>
      </div>

      <div className="topbar-right">
        <button
          className="btn-icon btn-notifications"
          onClick={onOpenNotifications}
          title="Notifications"
          aria-label="Notifications"
        >
          🔔{unreadCount > 0 && <span className="notif-dot"></span>}
        </button>

        <button
          className="btn-history btn-marketplace"
          onClick={() => navigate('/marketplace')}
          title="Eco Marketplace"
          aria-label="Eco Marketplace"
        >
          <span className="btn-emoji" aria-hidden="true">🛒</span>
          <span className="btn-label">Marketplace</span>
        </button>

        <button
          className="btn-history btn-history-link"
          onClick={() => navigate('/history')}
          title="Open Carbon History"
          aria-label="Open Carbon History"
        >
          <span className="btn-emoji" aria-hidden="true">📜</span>
          <span className="btn-label">Carbon History</span>
        </button>

        <button
          className="btn-logout btn-logout-compact"
          onClick={onLogout}
          title="Logout"
          aria-label="Logout"
        >
          <span className="btn-emoji" aria-hidden="true">↪</span>
          <span className="btn-label">Logout</span>
        </button>

        <button className="btn-primary btn-log-activity" onClick={onOpenModal} aria-label="Log activity">
          <span className="btn-emoji" aria-hidden="true">＋</span>
          <span className="btn-label">Log Activity</span>
        </button>
      </div>
    </div>
  );
};

export default TopBar;
