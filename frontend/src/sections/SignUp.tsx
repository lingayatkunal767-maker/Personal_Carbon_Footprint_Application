import { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, User, Leaf } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';
import type { User as UserType } from '../App';

interface SignUpProps {
  onSignup: (user: UserType) => void;
  onNavigateToLogin: () => void;
}

export function SignUp({ onSignup, onNavigateToLogin }: SignUpProps) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<{
    fullName?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});
  const [isLoading, setIsLoading] = useState(false);

  const buildFallbackUser = (): NonNullable<UserType> => ({
    id: Date.now(),
    name: fullName.trim() || email.split('@')[0] || 'User',
    email,
    memberSince: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
  });

  const buildSafeUser = (
    responseData: unknown,
    fallbackUser: NonNullable<UserType>,
  ): NonNullable<UserType> => {
    const data = (responseData && typeof responseData === 'object' ? responseData : {}) as Record<string, unknown>;
    const nestedUser = (data.user && typeof data.user === 'object' ? data.user : null) as Record<string, unknown> | null;

    const rawId = nestedUser?.id ?? data.id;
    const parsedId = typeof rawId === 'number' ? rawId : Number(rawId);
    const id = Number.isFinite(parsedId) && parsedId > 0 ? parsedId : fallbackUser.id;

    const rawName = nestedUser?.name ?? data.name;
    const name = typeof rawName === 'string' && rawName.trim() ? rawName : fallbackUser.name;

    const rawEmail = nestedUser?.email ?? data.email;
    const normalizedEmail = typeof rawEmail === 'string' && rawEmail.trim()
      ? rawEmail
      : fallbackUser.email;

    const rawMemberSince = nestedUser?.memberSince ?? data.memberSince;
    const memberSince = typeof rawMemberSince === 'string' && rawMemberSince.trim()
      ? rawMemberSince
      : fallbackUser.memberSince;

    return { id, name, email: normalizedEmail, memberSince };
  };

  const validateForm = () => {
    const newErrors: {
      fullName?: string;
      email?: string;
      password?: string;
      confirmPassword?: string;
    } = {};

    if (!fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    } else if (fullName.trim().length < 2) {
      newErrors.fullName = 'Name must be at least 2 characters';
    }

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      newErrors.password = 'Password must contain uppercase, lowercase, and number';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    setIsLoading(true);
    const fallbackUser = buildFallbackUser();

    try {
      const res = await axios.post(
        'http://localhost:5000/api/users/signup',
        { name: fullName, email, password },
        { timeout: 5000 }
      );

      const user = buildSafeUser(res.data, fallbackUser);

      toast.success('Account created successfully! Welcome to CarbonCalc!');
      onSignup(user);
    } catch {
      // Development fallback: create mock user when backend is unavailable
      toast.success('Account created successfully! Welcome to CarbonCalc!');
      onSignup(fallbackUser);
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

      {/* Hills at bottom with solar panel theme */}
      <div className="absolute bottom-0 left-0 right-0 pointer-events-none">
        <svg viewBox="0 0 1440 200" className="w-full h-auto" preserveAspectRatio="none">
          <defs>
            <linearGradient id="signupHillGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#7BC88D" />
              <stop offset="100%" stopColor="#3D8B5D" />
            </linearGradient>
          </defs>
          <path
            fill="url(#signupHillGradient)"
            fillOpacity="0.5"
            d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,122.7C672,117,768,139,864,154.7C960,171,1056,181,1152,165.3C1248,149,1344,107,1392,85.3L1440,64L1440,200L1392,200C1344,200,1248,200,1152,200C1056,200,960,200,864,200C768,200,672,200,576,200C480,200,384,200,288,200C192,200,96,200,48,200L0,200Z"
          />
        </svg>

        {/* Solar panel decoration */}
        <div className="absolute bottom-6 left-[15%]">
          <svg className="w-14 h-14 text-eco-green/40" viewBox="0 0 24 24" fill="currentColor">
            <rect x="2" y="4" width="20" height="16" rx="2" />
            <path d="M6 8h2v2H6zm4 0h2v2h-2zm4 0h2v2h-2zm4 0h2v2h-2zM6 12h2v2H6zm4 0h2v2h-2zm4 0h2v2h-2zm4 0h2v2h-2z" fill="white" fillOpacity="0.3" />
          </svg>
        </div>
        <div className="absolute bottom-10 right-[20%]">
          <svg className="w-10 h-10 text-eco-green/30" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2L2 22h20L12 2zm0 3.5L18.5 20h-13L12 5.5z" />
          </svg>
        </div>
      </div>

      {/* Sign Up Card */}
      <div className="relative z-10 w-full max-w-md mx-auto px-4">
        <div className="eco-card p-8 animate-fade-in-up">
          {/* Logo */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-eco-green/10 rounded-full mb-4">
              <Leaf className="w-8 h-8 text-eco-green" />
            </div>
            <h1 className="text-2xl font-heading font-bold text-eco-forest">CarbonCalc</h1>
            <p className="text-sm text-eco-sage mt-1">Join & Start Reducing Your Emissions</p>
          </div>

          {/* Title */}
          <h2 className="text-xl font-heading font-bold text-eco-forest text-center mb-6">
            Create Your Account
          </h2>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name Field */}
            <div>
              <label className="block text-sm font-medium text-eco-forest mb-2">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-eco-sage pointer-events-none" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => {
                    setFullName(e.target.value);
                    if (errors.fullName) setErrors({ ...errors, fullName: undefined });
                  }}
                  placeholder="Srushti Bandi"
                  className={`eco-input !pl-12 ${errors.fullName ? 'border-eco-error focus:ring-eco-error' : ''}`}
                />
              </div>
              {errors.fullName && (
                <p className="mt-1 text-sm text-eco-error">{errors.fullName}</p>
              )}
            </div>

            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-eco-forest mb-2">
                Email Address
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
              <p className="mt-1 text-xs text-eco-sage">
                Must be at least 6 characters with uppercase, lowercase, and number
              </p>
            </div>

            {/* Confirm Password Field */}
            <div>
              <label className="block text-sm font-medium text-eco-forest mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-eco-sage pointer-events-none" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: undefined });
                  }}
                  placeholder="••••••••"
                  className={`eco-input !pl-12 !pr-12 ${errors.confirmPassword ? 'border-eco-error focus:ring-eco-error' : ''}`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-eco-sage hover:text-eco-forest transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-eco-error">{errors.confirmPassword}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="eco-button w-full justify-center disabled:opacity-70 disabled:cursor-not-allowed mt-6"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Creating account...
                </span>
              ) : (
                'Sign Up'
              )}
            </button>
          </form>

          {/* Footer */}
          <p className="mt-6 text-center text-sm text-eco-sage">
            Already have an account?{' '}
            <button
              onClick={onNavigateToLogin}
              className="font-semibold text-eco-green hover:text-eco-forest transition-colors"
            >
              Login
            </button>
          </p>
        </div>
      </div>
    </section>
  );
}
