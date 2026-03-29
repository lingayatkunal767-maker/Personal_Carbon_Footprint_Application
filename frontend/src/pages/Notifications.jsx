import React, { useEffect, useState } from 'react';
import { getNotifications, markNotificationAsRead } from '../services/notificationService';
import NotificationItem from '../components/NotificationItem';
import LoadingSpinner from '../components/LoadingSpinner';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
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

  if (loading) return <LoadingSpinner message="Retrieving your updates..." />;

  const unreadOnly = notifications.filter(n => !n.read);
  const readOnly = notifications.filter(n => n.read);

  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <div className="flex justify-between items-end mb-10">
        <div>
          <h1 className="text-4xl font-extrabold text-green-900 tracking-tight">Activity Center</h1>
          <p className="text-green-700 mt-2 font-medium">Stay updated on your sustainability journey.</p>
        </div>
        <div className="bg-green-100 px-4 py-2 rounded-2xl border border-green-200 flex items-center gap-2">
          <span className="text-xl">🔔</span>
          <span className="text-green-800 font-bold">{unreadOnly.length} New</span>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-2xl mb-8 border border-red-100 text-sm font-medium">
          {error}
        </div>
      )}

      <div className="space-y-12">
        {unreadOnly.length > 0 && (
          <section>
            <h2 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-6 border-b border-gray-100 pb-2">New Updates</h2>
            <div className="space-y-4">
              {unreadOnly.map(n => (
                <NotificationItem 
                  key={n.id} 
                  notification={n} 
                  onMarkAsRead={handleMarkAsRead} 
                />
              ))}
            </div>
          </section>
        )}

        <section>
          <h2 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-6 border-b border-gray-100 pb-2">Earlier</h2>
          {readOnly.length === 0 && unreadOnly.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-[32px] border border-gray-50 shadow-inner">
              <span className="text-4xl block mb-2 opacity-30">📪</span>
              <p className="text-gray-400 italic text-sm font-medium">Nothing to show for now.</p>
            </div>
          ) : readOnly.length === 0 ? (
            <p className="text-gray-400 italic text-sm">No old notifications.</p>
          ) : (
            <div className="space-y-3">
              {readOnly.map(n => (
                <NotificationItem 
                  key={n.id} 
                  notification={n} 
                  onMarkAsRead={handleMarkAsRead} 
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default Notifications;
