import React from 'react';

const NotificationItem = ({ notification, onMarkAsRead }) => {
  const isUnread = !notification.read;

  const getIconData = (category) => {
    switch (category?.toUpperCase()) {
      case 'GOAL':
        return { icon: '🎯', bg: 'bg-blue-50', text: 'text-blue-600' };
      case 'BADGE':
        return { icon: '🏅', bg: 'bg-yellow-50', text: 'text-yellow-600' };
      case 'LEADERBOARD':
        return { icon: '🏆', bg: 'bg-indigo-50', text: 'text-indigo-600' };
      case 'EMISSION':
        return { icon: '⚠️', bg: 'bg-red-50', text: 'text-red-500' };
      case 'PURCHASE':
        return { icon: '🛒', bg: 'bg-emerald-50', text: 'text-emerald-600' };
      default:
        return { icon: '🔔', bg: 'bg-gray-100', text: 'text-gray-600' };
    }
  };

  const getCategoryColor = (category) => {
    switch (category?.toUpperCase()) {
      case 'GOAL': return 'text-blue-700 bg-blue-100';
      case 'BADGE': return 'text-yellow-700 bg-yellow-100';
      case 'LEADERBOARD': return 'text-indigo-700 bg-indigo-100';
      case 'EMISSION': return 'text-red-600 bg-red-100';
      case 'PURCHASE': return 'text-emerald-700 bg-emerald-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTimeAgo = (dateString) => {
    if (!dateString) return 'Just now';
    const seconds = Math.floor((new Date() - new Date(dateString)) / 1000);
    let interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + "d ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + "h ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + "m ago";
    return "Just now";
  };

  const { icon, bg, text } = getIconData(notification.category);

  return (
    <div className={`relative flex items-center justify-between p-4 rounded-xl border transition-all ${
      isUnread ? 'bg-white shadow-sm border-green-200' : 'bg-gray-50/50 border-gray-100 opacity-60'
    }`}>
      
      {/* Decorative vertical bar for unread */}
      {isUnread && <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-green-500 rounded-l-xl"></div>}

      <div className="flex items-center gap-4 pl-2">
        {/* Icon Circle */}
        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${bg} ${text}`}>
          {icon}
        </div>

        {/* Content */}
        <div className="flex flex-col">
          <p className="text-sm font-medium text-gray-900 leading-snug">
            {notification.message}
          </p>
          <div className="flex items-center gap-3 mt-2">
            <span className="text-xs text-gray-400 font-medium">
              {getTimeAgo(notification.createdAt)}
            </span>
            {notification.category && (
              <span className={`px-2 py-0.5 rounded uppercase text-[10px] font-black tracking-widest ${getCategoryColor(notification.category)}`}>
                {notification.category}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4">
        {isUnread && (
          <>
            <button 
              onClick={() => onMarkAsRead(notification.id)}
              className="text-xs font-bold text-gray-500 hover:text-green-700 transition"
            >
              Mark read
            </button>
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
          </>
        )}
        <button 
          onClick={() => onMarkAsRead(notification.id)}
          className="text-gray-300 hover:text-gray-500 text-lg transition"
          title="Dismiss"
        >
          ×
        </button>
      </div>
    </div>
  );
};

export default NotificationItem;
