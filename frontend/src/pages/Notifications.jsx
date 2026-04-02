import React, { useEffect, useState } from 'react';
import { getNotifications, markNotificationAsRead, clearReadNotifications, markAllNotificationsAsRead } from '../services/notificationService';
import NotificationItem from '../components/NotificationItem';
import LoadingSpinner from '../components/LoadingSpinner';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const data = await getNotifications();
      setNotifications(data || []);
    } catch (err) {
      setError(err.message || "Failed to load notifications.");
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await markNotificationAsRead(id);
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, read: true } : n)
      );
    } catch (err) {
      console.error("Failed to mark as read", err);
    }
  };

  const handleClearRead = async () => {
    try {
      await clearReadNotifications();
      setNotifications(prev => prev.filter(n => !n.read));
    } catch (err) {
      setError("Failed to clear read notifications.");
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsAsRead();
      setNotifications(prev => prev.map(n => ({...n, read: true})));
    } catch (err) {
      setError("Failed to mark all as read.");
    }
  };

  if (loading) return <LoadingSpinner message="Retrieving your updates..." />;

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'All') return true;
    if (filter === 'Unread') return !n.read;
    // Extract category name dynamically from the filter string (e.g. "Goals" -> "GOAL")
    let categoryMap = {
      'Goals': 'GOAL',
      'Badges': 'BADGE',
      'Leaderboard': 'LEADERBOARD',
      'Emissions': 'EMISSION',
      'Purchases': 'PURCHASE'
    };
    return n.category === categoryMap[filter];
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      {/* Header */}
      <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden mb-8">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl">🔔</span>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Notifications</h1>
          </div>
          <p className="text-gray-500 font-medium">Stay updated on your goals, badges, rankings, and eco marketplace activity.</p>
        </div>
        <div className="bg-green-700 px-5 py-2.5 rounded-full shadow-md text-white font-black z-10">
          {unreadCount} unread
        </div>
        {/* Aesthetic Background Effect */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-green-50 rounded-full blur-3xl opacity-50"></div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-xl mb-6 font-medium">
          {error}
        </div>
      )}

      {/* Filters & Actions Bar */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4">
        {/* Pills */}
        <div className="flex flex-wrap gap-2">
          {['All', 'Unread', 'Goals', 'Badges', 'Leaderboard', 'Emissions', 'Purchases'].map(chip => (
            <button 
              key={chip}
              onClick={() => setFilter(chip)}
              className={`px-4 py-2 rounded-full text-sm font-bold transition flex items-center gap-2 ${
                filter === chip 
                  ? 'bg-green-700 text-white shadow-md' 
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {chip === 'Unread' && filter !== 'Unread' && <span className="w-1.5 h-1.5 rounded-full bg-red-500 block"></span>}
              {chip === 'Goals' && '🎯'}
              {chip === 'Badges' && '🏅'}
              {chip === 'Leaderboard' && '🏆'}
              {chip === 'Emissions' && '⚠️'}
              {chip === 'Purchases' && '🛒'}
              {chip}
            </button>
          ))}
        </div>

        {/* Global Actions */}
        <div className="flex items-center gap-3">
          <button 
            onClick={handleMarkAllRead}
            className="text-sm font-bold text-gray-600 border border-gray-200 bg-white px-4 py-2 rounded-full hover:bg-gray-50 transition"
          >
            ✓ Mark all read
          </button>
          <button 
            onClick={handleClearRead}
            className="text-sm font-bold text-red-600 border border-red-100 bg-red-50 px-4 py-2 rounded-full hover:bg-red-100 transition"
          >
            🗑 Clear read
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-4">
        {filteredNotifications.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-gray-50 shadow-sm">
            <span className="text-5xl block mb-4">📭</span>
            <h3 className="text-xl font-bold text-gray-900">No notifications found</h3>
            <p className="text-gray-500 font-medium mt-2">You're all caught up on this category.</p>
          </div>
        ) : (
          filteredNotifications.map(n => (
            <NotificationItem 
              key={n.id} 
              notification={n} 
              onMarkAsRead={handleMarkAsRead} 
            />
          ))
        )}
      </div>
    </div>
  );
};

export default Notifications;
