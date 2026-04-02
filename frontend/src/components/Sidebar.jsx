import { NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Trophy, Users, LogOut, Leaf } from './Icons'
import { useAuth } from '../context/AuthContext'
import { useEffect } from 'react'
import { useNotifications } from '../context/NotificationContext'
import api from '../services/api'

const NAV_ITEMS = [
  { to: '/dashboard',    icon: LayoutDashboard, label: 'Dashboard'     },
  { to: '/survey',       icon: null,            label: 'Survey',        emoji: '📋' },
  { to: '/goals',        icon: null,            label: 'Goals',         emoji: '🎯' },
  { to: '/badges',       icon: Trophy,          label: 'Badges'        },
  { to: '/leaderboard',  icon: Users,           label: 'Leaderboard'   },
  { to: '/marketplace',  icon: null,            label: 'Marketplace',   emoji: '🛒' },
  { to: '/transactions', icon: null,            label: 'Transactions',  emoji: '💳' },
  { to: '/notifications',icon: null,            label: 'Notifications', emoji: '🔔', badge: true },
]

export default function Sidebar() {
  const { logout, user } = useAuth()
  const navigate = useNavigate()
  const { unreadCount, fetchNotifications } = useNotifications()

  useEffect(() => { fetchNotifications() }, [fetchNotifications])

  const handleLogout = () => { logout(); navigate('/', { replace: true }) }

  const email = user?.email ?? ''
  const displayName = email.split('@')[0] ?? 'User'
  const initials = displayName.slice(0, 2).toUpperCase()

  return (
    <aside className="w-56 min-h-screen bg-white border-r border-gray-100 flex flex-col shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-5">
        <div className="flex items-center justify-center w-8 h-8 bg-green-500 rounded-full">
          <Leaf size={15} className="text-white" />
        </div>
        <span className="text-base font-bold text-gray-900">CarbonCalc</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-2 space-y-0.5">
        {NAV_ITEMS.map(({ to, icon: Icon, label, emoji, badge }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-green-50 text-green-700'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'
              }`
            }
          >
            {({ isActive }) => (
              <>
                {Icon
                  ? <Icon size={17} className={isActive ? 'text-green-600' : 'text-gray-400'} />
                  : <span className="text-base leading-none">{emoji}</span>
                }
                <span className="flex-1">{label}</span>
                {badge && unreadCount > 0 && (
                  <span className="text-xs font-bold bg-green-500 text-white px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User + logout */}
      <div className="px-3 pb-4 border-t border-gray-100 pt-3">
        <div className="flex items-center gap-2.5 px-2 py-2 mb-1">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-500 text-white text-xs font-bold shrink-0">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-gray-800 truncate capitalize">{displayName}</p>
            <p className="text-xs text-gray-400 truncate">{email || 'Member'}</p>
          </div>
        </div>
        <button onClick={handleLogout}
          className="flex items-center gap-2 w-full px-3 py-2 rounded-xl text-xs font-medium text-red-500 hover:bg-red-50 transition-colors">
          <LogOut size={15} /> Logout
        </button>
      </div>
    </aside>
  )
}
