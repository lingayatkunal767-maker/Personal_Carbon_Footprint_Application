import axios from 'axios'

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8080'
console.log('[API] Using base URL:', baseURL)

const api = axios.create({ baseURL })

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  console.log('[API] Request:', config.method?.toUpperCase(), config.url, config.params)
  return config
}, error => {
  console.error('[API] Request error:', error)
  return Promise.reject(error)
})

api.interceptors.response.use(
  res => {
    console.log('[API] Response:', res.config.url, res.status, res.data)
    return res
  },
  err => {
    console.error('[API] Response error:', err.config?.url, err.response?.status, err.response?.data)
    if (err.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('role')
      window.location.href = '/'
    }
    return Promise.reject(err)
  }
)

export default api
