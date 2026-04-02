import React from 'react';

const NotificationsPanel = ({ isOpen, onClose, notifications, onDismiss, onMarkAllRead }) => {
  return (
    <div className={`notif-panel ${isOpen ? 'open' : ''}`}>
      <div className="notif-header">
        Notifications
        <div style={{ display: 'flex', gap: '.4rem', alignItems: 'center' }}>
          <button type="button" className="card-action" onClick={onMarkAllRead}>Mark all read</button>
          <button type="button" className="notif-close" onClick={onClose}>✕</button>
        </div>
      </div>
      <div className="notif-list">
        {notifications.length === 0 && (
          <div className="notif-item">
            <p>🎉 You're all caught up!</p>
            <small>No new notifications.</small>
          </div>
        )}
        {notifications.map((notif) => (
          <div key={notif.id} className={`notif-item ${notif.type} ${notif.isRead ? 'read' : ''}`}>
            <p>{notif.icon} {notif.text}</p>
            <small>{notif.detail}</small>
            <button type="button" className="btn-logout" style={{ marginTop: '.45rem' }} onClick={() => onDismiss(notif.id)}>
              Dismiss
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NotificationsPanel;
