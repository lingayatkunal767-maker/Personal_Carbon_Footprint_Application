import { useEffect } from 'react'
import { useNotifications } from '../context/NotificationContext'

const TYPE_CONFIG = {
  SURVEY:       { icon: '📋', bg: 'bg-blue-50',    border: 'border-blue-100'   },
  GOAL:         { icon: '🎯', bg: 'bg-indigo-50',  border: 'border-indigo-100' },
  BADGE:        { icon: '🏆', bg: 'bg-yellow-50',  border: 'border-yellow-100' },
  LEADERBOARD:  { icon: '📊', bg: 'bg-purple-50',  border: 'border-purple-100' },
  HIGH_EMISSION:{ icon: '⚠️', bg: 'bg-red-50',     border: 'border-red-100'    },
  PURCHASE:     { icon: '🛒', bg: 'bg-green-50',   border: 'border-green-100'  },
}

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days < 7) return `${days}d ago`
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function NotifCard({ notif, onRead, onDelete }) {
  const cfg = TYPE_CONFIG[notif.type] ?? { icon: '🔔', bg: 'bg-gray-50', border: 'border-gray-100' }
  return (
    <div className={`flex gap-4 p-4 rounded-2xl border ${cfg.border} ${cfg.bg} transition-opacity ${notif.isRead ? 'opacity-60' : ''}`}>
      <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-white shadow-sm shrink-0 text-xl">
        {cfg.icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-semibold text-gray-800 leading-snug">{notif.title}</p>
          <div className="flex items-center gap-2 shrink-0">
            {!notif.isRead && <span className="w-2 h-2 rounded-full bg-green-500" />}
            <span className="text-xs text-gray-400 whitespace-nowrap">{timeAgo(notif.createdAt)}</span>
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-1 leading-relaxed">{notif.message}</p>
        <div className="flex gap-3 mt-2">
          {!notif.isRead && (
            <button onClick={() => onRead(notif.id)}
              className="text-xs text-green-600 font-semibold hover:underline">
              Mark as read
            </button>
          )}
          <button onClick={() => onDelete(notif.id)}
            className="text-xs text-red-400 font-semibold hover:underline">
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}

export default function Notifications() {
  const { notifications, unreadCount, loaded, fetchNotifications, markRead, markAllRead, remove } = useNotifications()

  // Fetch on mount if not already loaded
  useEffect(() => {
    if (!loaded) fetchNotifications()
  }, [loaded, fetchNotifications])

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100 px-8 py-5 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            Notifications
            {unreadCount > 0 && (
              <span className="text-xs font-semibold bg-green-500 text-white px-2 py-0.5 rounded-full">
                {unreadCount}
              </span>
            )}
          </h1>
          <p className="text-xs text-gray-400 mt-0.5">Stay updated on your sustainability journey.</p>
        </div>
        {unreadCount > 0 && (
          <button onClick={() => markAllRead(notifications)}
            className="px-4 py-2 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
            Mark all as read
          </button>
        )}
      </div>

      <div className="p-6 max-w-2xl mx-auto">
        {!loaded ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-9 w-9 border-4 border-green-500 border-t-transparent" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <span className="text-5xl block mb-3">🔔</span>
            <p className="font-medium text-gray-500">No notifications yet</p>
            <p className="text-sm mt-1">Submit a survey, complete a goal, or earn a badge to get notified.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map(n => (
              <NotifCard key={n.id} notif={n} onRead={markRead} onDelete={remove} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
