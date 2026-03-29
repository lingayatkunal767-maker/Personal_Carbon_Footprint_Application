import React from 'react';

const NotificationItem = ({ notification, onMarkAsRead }) => {
  const isRead = notification.read;

  const getIcon = (type) => {
    switch (type) {
      case 'BADGE': return '🎉';
      case 'GOAL': return '🎯';
      case 'EMISSION': return '⚠️';
      default: return '🔔';
    }
  };

  return (
    <div className={`p-4 rounded-xl mb-3 flex items-start gap-4 transition-all duration-200 border ${
      isRead ? 'bg-white opacity-60 border-gray-100' : 'bg-green-50 border-green-100 shadow-sm'
    }`}>
      <div className="text-2xl mt-1">
        {getIcon(notification.type)}
      </div>
      <div className="flex-grow">
        <div className="flex justify-between items-start">
          <h4 className={`font-semibold text-sm ${isRead ? 'text-gray-600' : 'text-green-900'}`}>
            {notification.title}
          </h4>
          {!isRead && (
            <button 
              onClick={() => onMarkAsRead(notification.id)}
              className="text-[10px] font-bold text-green-600 hover:text-green-800 uppercase tracking-tighter"
            >
              Mark Read
            </button>
          )}
        </div>
        <p className={`text-xs mt-1 ${isRead ? 'text-gray-500' : 'text-green-800'}`}>
          {notification.message}
        </p>
        <p className="text-[10px] text-gray-400 mt-2 font-medium">
          {new Date(notification.createdAt).toLocaleString()}
        </p>
      </div>
    </div>
  );
};

export default NotificationItem;
