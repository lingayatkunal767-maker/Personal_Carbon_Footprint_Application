import { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, User, Leaf } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '../lib/api';
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
    fullName?: string; email?: string; password?: string; confirmPassword?: string;
  }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<'register' | 'verify'>('register');
  const [otpValue, setOtpValue] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);

  const validateForm = () => {
    const newErrors: { fullName?: string; email?: string; password?: string; confirmPassword?: string; } = {};
    if (!fullName.trim()) newErrors.fullName = 'Full name is required';
    else if (fullName.trim().length < 2) newErrors.fullName = 'Name must be at least 2 characters';
    if (!email.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = 'Please enter a valid email address';
    if (!password) newErrors.password = 'Password is required';
    else if (password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password))
      newErrors.password = 'Password must contain uppercase, lowercase, and number';
    if (!confirmPassword) newErrors.confirmPassword = 'Please confirm your password';
    else if (password !== confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) { toast.error('Please fix the errors in the form'); return; }
    setIsLoading(true);
    try {
      await api.auth.register(fullName, email, password);
      toast.success('OTP sent to your email! Check your inbox (or backend console).');
      setStep('verify');
    } catch (err: any) {
      toast.error(err.message || 'Signup failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otpValue.trim() || otpValue.length < 4) { toast.error('Please enter the OTP'); return; }
    setVerifying(true);
    try {
      await api.auth.verifyOtp(email, otpValue.trim());
      const res = await api.auth.login(email, password);
      localStorage.setItem('carboncalc_token', res.token);
      toast.success('Account verified! Welcome to CarbonCalc!');
      onSignup({
        id: res.user.id, name: res.user.name, email: res.user.email,
        memberSince: res.user.memberSince ?? new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      });
    } catch (err: any) {
      toast.error(err.message || 'Invalid OTP. Please try again.');
    } finally {
      setVerifying(false);
    }
  };

  const handleResendOtp = async () => {
    setResending(true);
    try {
      await api.auth.resendOtp(email);
      toast.success('New OTP sent! Check your inbox (or backend console).');
      setOtpValue('');
    } catch (err: any) {
      toast.error(err.message || 'Failed to resend OTP.');
    } finally {
      setResending(false);
    }
  };

  // OTP Verification Screen
  if (step === 'verify') {
    return (
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-eco-bg-alt pt-20 pb-10">
        <div className="relative w-full max-w-md mx-auto px-4">
          <div className="eco-card p-8 text-center">
            <div className="w-16 h-16 bg-eco-green/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-eco-green" />
            </div>
            <h2 className="text-2xl font-heading font-bold text-eco-forest mb-2">Verify Your Email</h2>
            <p className="text-eco-sage text-sm mb-6">
              We sent a 6-digit OTP to <span className="font-semibold text-eco-forest">{email}</span>
              <br /><span className="text-xs">(Check backend console if email isn't configured)</span>
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-eco-forest mb-2 text-left">Enter OTP</label>
              <input
                type="text"
                maxLength={6}
                value={otpValue}
                onChange={e => setOtpValue(e.target.value.replace(/\D/g, ''))}
                onKeyDown={e => e.key === 'Enter' && handleVerifyOtp()}
                placeholder="123456"
                className="eco-input text-center text-2xl tracking-[0.5em] font-bold"
                autoFocus
              />
            </div>
            <button
              onClick={handleVerifyOtp}
              disabled={verifying}
              className="eco-button w-full py-3 mb-3 disabled:opacity-70"
            >
              {verifying ? 'Verifying...' : 'Verify & Continue'}
            </button>
            <button
              onClick={handleResendOtp}
              disabled={resending}
              className="text-sm text-eco-green hover:text-eco-forest transition-colors font-medium disabled:opacity-50"
            >
              {resending ? 'Sending...' : "Didn't receive it? Resend OTP"}
            </button>
            <button
              onClick={() => setStep('register')}
              className="block mx-auto mt-3 text-xs text-eco-sage hover:text-eco-forest transition-colors"
            >
              ← Back to signup
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-eco-bg-alt pt-20 pb-10">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-10 left-[10%] w-32 h-16 bg-white/40 rounded-full blur-xl" />
        <div className="absolute top-20 right-[15%] w-40 h-20 bg-white/30 rounded-full blur-xl" />
      </div>
      <div className="absolute bottom-0 left-0 right-0 pointer-events-none">
        <svg viewBox="0 0 1440 200" className="w-full h-auto" preserveAspectRatio="none">
          <defs>
            <linearGradient id="signupHillGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#7BC88D" />
              <stop offset="100%" stopColor="#3D8B5D" />
            </linearGradient>
          </defs>
          <path fill="url(#signupHillGradient)" fillOpacity="0.5"
            d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,122.7C672,117,768,139,864,154.7C960,171,1056,181,1152,165.3C1248,149,1344,107,1392,85.3L1440,64L1440,200L1392,200C1344,200,1248,200,1152,200C1056,200,960,200,864,200C768,200,672,200,576,200C480,200,384,200,288,200C192,200,96,200,48,200L0,200Z"
          />
        </svg>
      </div>

      <div className="relative z-10 w-full max-w-md mx-auto px-4">
        <div className="eco-card p-8 animate-fade-in-up">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-eco-green/10 rounded-full mb-4">
              <Leaf className="w-8 h-8 text-eco-green" />
            </div>
            <h1 className="text-2xl font-heading font-bold text-eco-forest">CarbonCalc</h1>
            <p className="text-sm text-eco-sage mt-1">Join & Start Reducing Your Emissions</p>
          </div>

          <h2 className="text-xl font-heading font-bold text-eco-forest text-center mb-6">Create Your Account</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-eco-forest mb-2">Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-eco-sage pointer-events-none" />
                <input type="text" value={fullName}
                  onChange={e => { setFullName(e.target.value); if (errors.fullName) setErrors({ ...errors, fullName: undefined }); }}
                  placeholder="Your Name"
                  className={`eco-input !pl-12 ${errors.fullName ? 'border-eco-error focus:ring-eco-error' : ''}`}
                />
              </div>
              {errors.fullName && <p className="mt-1 text-sm text-eco-error">{errors.fullName}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-eco-forest mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-eco-sage pointer-events-none" />
                <input type="email" value={email}
                  onChange={e => { setEmail(e.target.value); if (errors.email) setErrors({ ...errors, email: undefined }); }}
                  placeholder="you@email.com"
                  className={`eco-input !pl-12 ${errors.email ? 'border-eco-error focus:ring-eco-error' : ''}`}
                />
              </div>
              {errors.email && <p className="mt-1 text-sm text-eco-error">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-eco-forest mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-eco-sage pointer-events-none" />
                <input type={showPassword ? 'text' : 'password'} value={password}
                  onChange={e => { setPassword(e.target.value); if (errors.password) setErrors({ ...errors, password: undefined }); }}
                  placeholder="••••••••"
                  className={`eco-input !pl-12 !pr-12 ${errors.password ? 'border-eco-error focus:ring-eco-error' : ''}`}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-eco-sage hover:text-eco-forest transition-colors">
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-sm text-eco-error">{errors.password}</p>}
              <p className="mt-1 text-xs text-eco-sage">At least 6 chars with uppercase, lowercase, and number</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-eco-forest mb-2">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-eco-sage pointer-events-none" />
                <input type={showConfirmPassword ? 'text' : 'password'} value={confirmPassword}
                  onChange={e => { setConfirmPassword(e.target.value); if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: undefined }); }}
                  placeholder="••••••••"
                  className={`eco-input !pl-12 !pr-12 ${errors.confirmPassword ? 'border-eco-error focus:ring-eco-error' : ''}`}
                />
                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-eco-sage hover:text-eco-forest transition-colors">
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.confirmPassword && <p className="mt-1 text-sm text-eco-error">{errors.confirmPassword}</p>}
            </div>

            <button type="submit" disabled={isLoading}
              className="eco-button w-full justify-center disabled:opacity-70 disabled:cursor-not-allowed mt-6">
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Creating account...
                </span>
              ) : 'Sign Up'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-eco-sage">
            Already have an account?{' '}
            <button onClick={onNavigateToLogin} className="font-semibold text-eco-green hover:text-eco-forest transition-colors">
              Login
            </button>
          </p>
        </div>
      </div>
    </section>
  );
}
