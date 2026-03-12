import { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, Leaf } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '../lib/api';
import type { User } from '../App';

interface LoginProps {
  onLogin: (user: User) => void;
  onNavigateToSignup: () => void;
}

export function Login({ onLogin, onNavigateToSignup }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) { toast.error('Please fix the errors in the form'); return; }
    setIsLoading(true);
    try {
      const res = await api.auth.login(email, password);
      localStorage.setItem('carboncalc_token', res.token);
      toast.success(`Welcome back, ${res.user.name}!`);
      onLogin({
        id: res.user.id,
        name: res.user.name,
        email: res.user.email,
        memberSince: res.user.memberSince ?? new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      });
    } catch (err: any) {
      toast.error(err.message || 'Invalid credentials. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-eco-bg-alt pt-20 pb-10">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-10 left-[10%] w-32 h-16 bg-white/40 rounded-full blur-xl" />
        <div className="absolute top-20 right-[15%] w-40 h-20 bg-white/30 rounded-full blur-xl" />
      </div>

      {/* Hills at bottom */}
      <div className="absolute bottom-0 left-0 right-0 pointer-events-none">
        <svg viewBox="0 0 1440 200" className="w-full h-auto" preserveAspectRatio="none">
          <defs>
            <linearGradient id="loginHillGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#7BC88D" />
              <stop offset="100%" stopColor="#3D8B5D" />
            </linearGradient>
          </defs>
          <path
            fill="url(#loginHillGradient)"
            fillOpacity="0.5"
            d="M0,128L48,138.7C96,149,192,171,288,165.3C384,160,480,128,576,128C672,128,768,160,864,165.3C960,171,1056,149,1152,138.7C1248,128,1344,128,1392,128L1440,128L1440,200L1392,200C1344,200,1248,200,1152,200C1056,200,960,200,864,200C768,200,672,200,576,200C480,200,384,200,288,200C192,200,96,200,48,200L0,200Z"
          />
        </svg>

        {/* Decorative bike and globe */}
        <div className="absolute bottom-8 left-[20%]">
          <svg className="w-16 h-16 text-eco-green/40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="5" cy="18" r="3" />
            <circle cx="19" cy="18" r="3" />
            <path d="M5 18l4-8 3 5h4l3-5" />
            <path d="M12 15V7" />
          </svg>
        </div>
        <div className="absolute bottom-12 right-[25%]">
          <svg className="w-12 h-12 text-eco-green/30" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
          </svg>
        </div>
      </div>

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-md mx-auto px-4">
        <div className="eco-card p-8 animate-fade-in-up">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-eco-green/10 rounded-full mb-4">
              <Leaf className="w-8 h-8 text-eco-green" />
            </div>
            <h1 className="text-2xl font-heading font-bold text-eco-forest">CarbonCalc</h1>
            <p className="text-sm text-eco-sage mt-1">Track & Reduce Your Carbon Footprint</p>
          </div>

          {/* Title */}
          <h2 className="text-xl font-heading font-bold text-eco-forest text-center mb-6">
            Login to Your Account
          </h2>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-eco-forest mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-eco-sage pointer-events-none" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) setErrors({ ...errors, email: undefined });
                  }}
                  placeholder="srushti@email.com"
                  className={`eco-input !pl-12 ${errors.email ? 'border-eco-error focus:ring-eco-error' : ''}`}
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-eco-error">{errors.email}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-medium text-eco-forest mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-eco-sage pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors({ ...errors, password: undefined });
                  }}
                  placeholder="••••••••"
                  className={`eco-input !pl-12 !pr-12 ${errors.password ? 'border-eco-error focus:ring-eco-error' : ''}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-eco-sage hover:text-eco-forest transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-eco-error">{errors.password}</p>
              )}
            </div>

            {/* Forgot Password */}
            <div className="text-right">
              <button
                type="button"
                onClick={() => toast.info('Password reset feature coming soon!')}
                className="text-sm text-eco-green hover:text-eco-forest transition-colors"
              >
                Forgot Password?
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="eco-button w-full justify-center disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Logging in...
                </span>
              ) : (
                'Login'
              )}
            </button>
          </form>

          {/* Footer */}
          <p className="mt-6 text-center text-sm text-eco-sage">
            Don't have an account?{' '}
            <button
              onClick={onNavigateToSignup}
              className="font-semibold text-eco-green hover:text-eco-forest transition-colors"
            >
              Sign Up
            </button>
          </p>
        </div>
      </div>
    </section>
  );
}
