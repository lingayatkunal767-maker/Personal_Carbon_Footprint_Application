import React from 'react';
import NotificationItem from './NotificationItem';
import LoadingSpinner from './LoadingSpinner';

const NotificationPanel = ({ notifications, loading, error, onMarkAsRead }) => {
  const unreadCount = notifications.filter(n => !n.read).length;

  if (loading) return <LoadingSpinner message="Checking notifications..." />;
  
  if (error) return (
    <div className="p-6 bg-red-50 rounded-2xl text-red-600 text-center text-sm font-medium border border-red-100">
      {error}
    </div>
  );

  return (
    <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl overflow-hidden border border-green-50">
      <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-white/50">
        <h3 className="font-bold text-green-900 text-lg flex items-center gap-2">
          Notifications
          {unreadCount > 0 && (
            <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full ring-2 ring-red-100">
              {unreadCount}
            </span>
          )}
        </h3>
        <button className="text-xs text-green-600 font-semibold hover:underline">
          View All
        </button>
      </div>
      <div className="p-4 max-h-[400px] overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="text-center py-10">
            <span className="text-4xl text-gray-300 block mb-2">📭</span>
            <p className="text-gray-500 text-sm italic">No notifications yet.</p>
          </div>
        ) : (
          notifications.map(notification => (
            <NotificationItem 
              key={notification.id} 
              notification={notification} 
              onMarkAsRead={onMarkAsRead} 
            />
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationPanel;
