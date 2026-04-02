import { createContext, useContext, useState, useEffect } from 'react'
import api from '../services/api'

const AuthContext = createContext(null)

function parseJwt(token) {
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
    return JSON.parse(atob(base64))
  } catch {
    return {}
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('token'))
  const [role,  setRole]  = useState(() => localStorage.getItem('role') ?? 'USER')
  const [user,  setUser]  = useState(() => {
    const t = localStorage.getItem('token')
    if (!t) return null
    const payload = parseJwt(t)
    const savedName = localStorage.getItem('userName')
    return { email: payload.sub ?? '', name: savedName ?? '' }
  })

  // Fetch real name from /api/auth/me after login
  const fetchProfile = async (tok) => {
    try {
      const res = await api.get('/api/auth/me', {
        headers: { Authorization: `Bearer ${tok}` }
      })
      const name = res.data?.name ?? ''
      localStorage.setItem('userName', name)
      setUser(prev => prev ? { ...prev, name } : { email: res.data?.email ?? '', name })
    } catch { /* ignore */ }
  }

  // On mount, if token exists but no name cached, fetch it
  useEffect(() => {
    const t = localStorage.getItem('token')
    const savedName = localStorage.getItem('userName')
    if (t && !savedName) fetchProfile(t)
  }, [])

  const login = (newToken, newRole = 'USER') => {
    localStorage.setItem('token', newToken)
    localStorage.setItem('role', newRole)
    setToken(newToken)
    setRole(newRole)
    const payload = parseJwt(newToken)
    setUser({ email: payload.sub ?? '', name: '' })
    fetchProfile(newToken)
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('role')
    localStorage.removeItem('userName')
    setToken(null)
    setRole('USER')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ token, role, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
