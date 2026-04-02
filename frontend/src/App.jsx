import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { AuthProvider, useAuth } from './context/AuthContext'
import { NotificationProvider } from './context/NotificationContext'
import ProtectedRoute from './components/ProtectedRoute'
import Sidebar from './components/Sidebar'
import Login from './pages/Login'
import Register from './pages/Register'
import Landing from './pages/Landing'
import Dashboard from './pages/Dashboard'
import Survey from './pages/Survey'
import CarbonHistory from './pages/CarbonHistory'
import Goals from './pages/Goals'
import Badges from './pages/Badges'
import Leaderboard from './pages/Leaderboard'
import Marketplace from './pages/Marketplace'
import Transactions from './pages/Transactions'
import Notifications from './pages/Notifications'
import AdminDashboard from './pages/AdminDashboard'

function PublicRoute({ children }) {
  const token = localStorage.getItem('token')
  const role  = localStorage.getItem('role')
  if (token && role === 'ADMIN') return <Navigate to="/admin" replace />
  if (token) return <Navigate to="/dashboard" replace />
  return children
}

function AdminRoute({ children }) {
  const { token, role } = useAuth()
  if (!token) return <Navigate to="/" replace />
  if (role !== 'ADMIN') return <Navigate to="/dashboard" replace />
  return children
}

function AppLayout() {
  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: '#f9fafb' }}>
      <Sidebar />
      <main style={{ flex: 1, overflowY: 'auto', minWidth: 0 }}>
        <Outlet />
      </main>
    </div>
  )
}

export default function App() {
  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID ?? ''}>
    <BrowserRouter>
      <AuthProvider>
        <NotificationProvider>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/survey" element={<Survey />} />
              <Route path="/carbon-history" element={<CarbonHistory />} />
              <Route path="/goals" element={<Goals />} />
              <Route path="/badges" element={<Badges />} />
              <Route path="/leaderboard" element={<Leaderboard />} />
              <Route path="/marketplace" element={<Marketplace />} />
              <Route path="/transactions" element={<Transactions />} />
              <Route path="/notifications" element={<Notifications />} />
            </Route>
          </Route>

          <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
    </GoogleOAuthProvider>
  )
}
