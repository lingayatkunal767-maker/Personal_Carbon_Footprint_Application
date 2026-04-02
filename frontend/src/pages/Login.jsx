import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useGoogleLogin } from '@react-oauth/google'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'

// step: 'login' | 'forgot-email' | 'forgot-otp' | 'forgot-reset'
export default function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()

  const [step, setStep] = useState('login')
  const [form, setForm] = useState({ email: '', password: '' })
  const [fpEmail, setFpEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setLoading(true); setError('')
      try {
        // Exchange access token for user info, then send to backend
        const userInfo = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
        }).then(r => r.json())

        const res = await api.post('/api/auth/google', { credential: tokenResponse.access_token, email: userInfo.email, name: userInfo.name })
        login(res.data.token, res.data.role)
        navigate(res.data.role === 'ADMIN' ? '/admin' : '/dashboard', { replace: true })
      } catch (err) {
        setError(err.response?.data?.error || err.response?.data?.message || 'Google sign-in failed.')
      } finally { setLoading(false) }
    },
    onError: () => setError('Google sign-in was cancelled or failed.'),
  })

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      const res = await api.post('/api/auth/login', form)
      login(res.data.token, res.data.role)
      if (res.data.role === 'ADMIN') {
        navigate('/admin', { replace: true })
      } else {
        navigate('/dashboard', { replace: true })
      }
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || err.response?.data || 'Invalid email or password.')
    } finally { setLoading(false) }  }

  const handleSendOtp = async (e) => {
    e.preventDefault()
    setLoading(true); setError(''); setInfo('')
    try {
      await api.post('/api/auth/forgot-password/send-otp', { email: fpEmail })
      setInfo('OTP sent to ' + fpEmail + '. Check your inbox.')
      setStep('forgot-otp')
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || err.response?.data || 'Failed to send OTP.')
    } finally { setLoading(false) }
  }

  const handleVerifyOtp = async (e) => {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      await api.post('/api/auth/forgot-password/verify-otp', { email: fpEmail, otp })
      setStep('forgot-reset')
      setInfo('')
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || err.response?.data || 'Invalid or expired OTP.')
    } finally { setLoading(false) }
  }

  const handleResetPassword = async (e) => {
    e.preventDefault()
    if (newPassword !== confirmPassword) { setError('Passwords do not match.'); return }
    if (newPassword.length < 6) { setError('Password must be at least 6 characters.'); return }
    setLoading(true); setError('')
    try {
      await api.post('/api/auth/forgot-password/reset', { email: fpEmail, otp, newPassword })
      setStep('login')
      setInfo('Password reset successfully. Please sign in.')
      setFpEmail(''); setOtp(''); setNewPassword(''); setConfirmPassword('')
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || err.response?.data || 'Reset failed.')
    } finally { setLoading(false) }
  }

  const resetForgot = () => { setStep('login'); setError(''); setInfo(''); setFpEmail(''); setOtp('') }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-md p-8">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-green-100 rounded-full mb-4">
            <span className="text-2xl">🌍</span>
          </div>
          {step === 'login' && <>
            <h1 className="text-2xl font-bold text-gray-800">Welcome back</h1>
            <p className="text-gray-500 text-sm mt-1">Sign in to your CarbonCalc account</p>
          </>}
          {step === 'forgot-email' && <>
            <h1 className="text-2xl font-bold text-gray-800">Forgot Password</h1>
            <p className="text-gray-500 text-sm mt-1">Enter your email to receive a one-time password</p>
          </>}
          {step === 'forgot-otp' && <>
            <h1 className="text-2xl font-bold text-gray-800">Enter OTP</h1>
            <p className="text-gray-500 text-sm mt-1">We sent a 6-digit code to <span className="font-medium text-gray-700">{fpEmail}</span></p>
          </>}
          {step === 'forgot-reset' && <>
            <h1 className="text-2xl font-bold text-gray-800">Set New Password</h1>
            <p className="text-gray-500 text-sm mt-1">Choose a strong new password</p>
          </>}
        </div>

        {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 mb-5 text-sm">{error}</div>}
        {info  && <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg px-4 py-3 mb-5 text-sm">{info}</div>}

        {/* ── STEP 1: Login ── */}
        {step === 'login' && (
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" name="email" value={form.email} onChange={handleChange} required
                placeholder="jane@example.com"
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent" />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">Password</label>
                <button type="button" onClick={() => { setStep('forgot-email'); setError(''); setInfo('') }}
                  className="text-xs text-green-600 hover:underline font-medium">
                  Forgot password?
                </button>
              </div>
              <input type="password" name="password" value={form.password} onChange={handleChange} required
                placeholder="••••••••"
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent" />
            </div>
            <button type="submit" disabled={loading}
              className="w-full bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white font-semibold py-2.5 rounded-lg transition-colors text-sm">
              {loading ? 'Signing in...' : 'Sign In'}
            </button>

            <div className="relative my-1">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-white px-3 text-gray-400">or continue with</span>
              </div>
            </div>

            <button type="button" onClick={() => handleGoogleLogin()} disabled={loading}
              className="w-full flex items-center justify-center gap-3 border border-gray-300 rounded-lg py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50">
              <svg width="18" height="18" viewBox="0 0 48 48">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
              </svg>
              Sign in with Google
            </button>
          </form>
        )}

        {/* ── STEP 2: Enter email for OTP ── */}
        {step === 'forgot-email' && (
          <form onSubmit={handleSendOtp} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
              <input type="email" value={fpEmail} onChange={e => setFpEmail(e.target.value)} required
                placeholder="jane@example.com"
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent" />
            </div>
            <button type="submit" disabled={loading}
              className="w-full bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white font-semibold py-2.5 rounded-lg transition-colors text-sm">
              {loading ? 'Sending OTP...' : 'Send OTP'}
            </button>
            <button type="button" onClick={resetForgot}
              className="w-full text-sm text-gray-500 hover:text-gray-700 py-1">
              ← Back to Sign In
            </button>
          </form>
        )}

        {/* ── STEP 3: Enter OTP ── */}
        {step === 'forgot-otp' && (
          <form onSubmit={handleVerifyOtp} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">6-digit OTP</label>
              <input type="text" value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                required maxLength={6} placeholder="123456"
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-center tracking-[0.5em] font-mono focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent" />
              <p className="text-xs text-gray-400 mt-1.5">OTP expires in 10 minutes</p>
            </div>
            <button type="submit" disabled={loading || otp.length !== 6}
              className="w-full bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white font-semibold py-2.5 rounded-lg transition-colors text-sm">
              {loading ? 'Verifying...' : 'Verify OTP'}
            </button>
            <div className="flex items-center justify-between text-sm">
              <button type="button" onClick={resetForgot} className="text-gray-500 hover:text-gray-700">← Back</button>
              <button type="button" onClick={handleSendOtp} disabled={loading}
                className="text-green-600 hover:underline font-medium disabled:opacity-50">
                Resend OTP
              </button>
            </div>
          </form>
        )}

        {/* ── STEP 4: Set new password ── */}
        {step === 'forgot-reset' && (
          <form onSubmit={handleResetPassword} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
              <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)}
                required placeholder="Min. 6 characters"
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
              <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                required placeholder="Repeat password"
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent" />
            </div>
            <button type="submit" disabled={loading}
              className="w-full bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white font-semibold py-2.5 rounded-lg transition-colors text-sm">
              {loading ? 'Saving...' : 'Reset Password'}
            </button>
          </form>
        )}

        {step === 'login' && (
          <p className="text-center text-sm text-gray-500 mt-6">
            Don&apos;t have an account?{' '}
            <Link to="/register" className="text-green-600 font-medium hover:underline">Create one</Link>
          </p>
        )}
      </div>
    </div>
  )
}
