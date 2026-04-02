import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react'
import api from '../services/api'

const NotificationContext = createContext(null)

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([])
  const [loaded, setLoaded] = useState(false)
  const intervalRef = useRef(null)

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await api.get('/api/notifications')
      setNotifications(res.data || [])
      setLoaded(true)
    } catch {
      // unauthenticated — ignore
    }
  }, [])

  // Poll every 30 seconds when token exists
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) return

    fetchNotifications()
    intervalRef.current = setInterval(fetchNotifications, 30000)
    return () => clearInterval(intervalRef.current)
  }, [fetchNotifications])

  const markRead = useCallback(async (id) => {
    await api.put(`/api/notifications/${id}/read`)
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n))
  }, [])

  const markAllRead = useCallback(async (list) => {
    const unread = list.filter(n => !n.isRead)
    await Promise.all(unread.map(n => api.put(`/api/notifications/${n.id}/read`)))
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
  }, [])

  const remove = useCallback(async (id) => {
    await api.delete(`/api/notifications/${id}`)
    setNotifications(prev => prev.filter(n => n.id !== id))
  }, [])

  const unreadCount = notifications.filter(n => !n.isRead).length

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, loaded, fetchNotifications, markRead, markAllRead, remove }}>
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotifications() {
  return useContext(NotificationContext)
}
