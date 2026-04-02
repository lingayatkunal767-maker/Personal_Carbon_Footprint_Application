import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useGoogleLogin } from '@react-oauth/google'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'

// Password strength rules
const RULES = [
  { id: 'length',  label: 'At least 8 characters',          test: p => p.length >= 8 },
  { id: 'upper',   label: 'One uppercase letter (A–Z)',      test: p => /[A-Z]/.test(p) },
  { id: 'lower',   label: 'One lowercase letter (a–z)',      test: p => /[a-z]/.test(p) },
  { id: 'number',  label: 'One number (0–9)',                test: p => /[0-9]/.test(p) },
  { id: 'symbol',  label: 'One special character (!@#$…)',   test: p => /[^A-Za-z0-9]/.test(p) },
]

function getStrength(password) {
  const passed = RULES.filter(r => r.test(password)).length
  if (passed <= 1) return { level: 0, label: 'Very weak',  color: '#ef4444', bg: 'bg-red-500',    width: '20%' }
  if (passed === 2) return { level: 1, label: 'Weak',       color: '#f97316', bg: 'bg-orange-400', width: '40%' }
  if (passed === 3) return { level: 2, label: 'Fair',       color: '#eab308', bg: 'bg-yellow-400', width: '60%' }
  if (passed === 4) return { level: 3, label: 'Strong',     color: '#22c55e', bg: 'bg-green-500',  width: '80%' }
  return                     { level: 4, label: 'Very strong', color: '#16a34a', bg: 'bg-green-600', width: '100%' }
}

function PasswordStrength({ password }) {
  if (!password) return null
  const strength = getStrength(password)
  const passed = RULES.filter(r => r.test(password))
  const failed = RULES.filter(r => !r.test(password))

  return (
    <div className="mt-2 space-y-2">
      {/* Strength bar */}
      <div className="flex items-center gap-2">
        <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-300 ${strength.bg}`}
            style={{ width: strength.width }}
          />
        </div>
        <span className="text-xs font-semibold shrink-0" style={{ color: strength.color }}>
          {strength.label}
        </span>
      </div>

      {/* Requirements checklist — only show unmet rules when typing */}
      {failed.length > 0 && (
        <div className="bg-gray-50 rounded-lg px-3 py-2.5 space-y-1.5">
          <p className="text-xs font-semibold text-gray-500 mb-1">Password must include:</p>
          {RULES.map(rule => {
            const ok = rule.test(password)
            return (
              <div key={rule.id} className="flex items-center gap-2">
                <span className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 text-xs ${ok ? 'bg-green-100 text-green-600' : 'bg-gray-200 text-gray-400'}`}>
                  {ok ? '✓' : '·'}
                </span>
                <span className={`text-xs ${ok ? 'text-green-600 line-through' : 'text-gray-500'}`}>
                  {rule.label}
                </span>
              </div>
            )
          })}
        </div>
      )}

      {/* All passed */}
      {failed.length === 0 && (
        <div className="flex items-center gap-1.5 text-xs text-green-600 font-medium">
          <span className="w-4 h-4 rounded-full bg-green-100 flex items-center justify-center text-xs">✓</span>
          Password meets all requirements
        </div>
      )}
    </div>
  )
}

export default function Register() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const allRulesPassed = RULES.every(r => r.test(form.password))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!allRulesPassed) {
      setError('Please create a stronger password that meets all requirements.')
      return
    }
    setLoading(true)
    setError('')
    try {
      await api.post('/api/auth/register', form)
      navigate('/login')
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleRegister = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setLoading(true); setError('')
      try {
        const userInfo = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
        }).then(r => r.json())

        const res = await api.post('/api/auth/google', {
          credential: tokenResponse.access_token,
          email: userInfo.email,
          name: userInfo.name,
        })
        login(res.data.token, res.data.role)
        navigate(res.data.role === 'ADMIN' ? '/admin' : '/dashboard', { replace: true })
      } catch (err) {
        setError(err.response?.data?.error || err.response?.data?.message || 'Google sign-up failed.')
      } finally { setLoading(false) }
    },
    onError: () => setError('Google sign-up was cancelled or failed.'),
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-sm p-7">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-3">
            <span className="text-xl">🌱</span>
          </div>
          <h1 className="text-xl font-bold text-gray-800">Create Account</h1>
          <p className="text-gray-500 text-xs mt-1">Start tracking your carbon footprint</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-3 py-2.5 mb-4 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              placeholder="Jane Doe"
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              placeholder="jane@example.com"
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent"
            />
          </div>

          {/* Password with strength meter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={form.password}
                onChange={handleChange}
                required
                placeholder="Create a strong password"
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent"
              />
              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                tabIndex={-1}
              >
                {showPassword ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                )}
              </button>
            </div>

            {/* Live strength indicator */}
            <PasswordStrength password={form.password} />
          </div>

          <button
            type="submit"
            disabled={loading || (form.password.length > 0 && !allRulesPassed)}
            className="w-full bg-green-500 hover:bg-green-600 disabled:bg-green-300 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-lg transition-colors text-sm mt-2"
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <div className="flex items-center gap-3 my-4">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-xs text-gray-400">or</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        <button
          type="button"
          onClick={() => handleGoogleRegister()}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 border border-gray-200 rounded-lg px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          <svg width="18" height="18" viewBox="0 0 48 48">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
          </svg>
          Continue with Google
        </button>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-green-600 font-medium hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
