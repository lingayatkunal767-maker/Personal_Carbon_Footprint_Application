import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiFetch } from "../utils/api";
import AuthLayout from "../components/AuthLayout";

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = "Full name is required";
    const emailRegex = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;
    if (!formData.email) errs.email = "Email is required";
    else if (!emailRegex.test(formData.email)) errs.email = "Enter a valid email address";
    if (!formData.password) {
      errs.password = "Password is required";
    } else if (formData.password.length < 8) {
      errs.password = "Password must be at least 8 characters";
    } else if (!/[A-Za-z]/.test(formData.password)) {
      errs.password = "Must include at least one letter";
    } else if (!/\d/.test(formData.password)) {
      errs.password = "Must include at least one number";
    } else if (!/[@$!%*#?&]/.test(formData.password)) {
      errs.password = "Must include a special character (@$!%*#?&)";
    }
    if (!formData.confirmPassword) {
      errs.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      errs.confirmPassword = "Passwords do not match";
    }
    return errs;
  };

  // Step 1: Send OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setSuccess("");
    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setLoading(true);
    try {
      const data = await apiFetch("/api/auth/send-otp", {
        method: "POST",
        body: JSON.stringify({ email: formData.email }),
      });
      setOtpSent(true);
      setSuccess(data.message || "OTP sent! Check your email (or backend console).");
    } catch (err) {
      setErrors({ api: err.message || "Failed to send OTP." });
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP & Register
  const handleVerifyAndRegister = async (e) => {
    e.preventDefault();
    setSuccess("");
    if (!otp || otp.length !== 6) {
      setErrors({ otp: "Enter the 6-digit OTP sent to your email" });
      return;
    }

    setLoading(true);
    try {
      // Verify OTP first
      await apiFetch("/api/auth/verify-otp", {
        method: "POST",
        body: JSON.stringify({ email: formData.email, otp }),
      });
      setOtpVerified(true);

      // Now register
      await apiFetch("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }),
      });

      setSuccess("Account created successfully! Redirecting to login...");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setErrors({ api: err.message || "Verification failed." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl overflow-hidden max-w-md w-full px-8 py-8">
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-green-700 hover:text-green-900 font-medium mb-4 transition">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>
          Home
        </Link>
        <div className="text-center mb-5">
          <Link to="/" className="inline-flex items-center gap-2 mb-3">
            <span className="text-2xl font-bold text-green-900">CarbonCalc</span>
            <span className="text-xl">🌱</span>
          </Link>
          <h1 className="text-2xl font-bold text-green-800 mb-1">Create account</h1>
          <p className="text-gray-500 text-sm">
            We'll send you a secure OTP to verify your email.
          </p>
        </div>

        {errors.api && (
          <p className="text-red-500 text-sm mb-4 bg-red-50 p-3 rounded-lg">{errors.api}</p>
        )}
        {success && (
          <p className="text-green-600 text-sm mb-4 bg-green-50 p-3 rounded-lg">{success}</p>
        )}

        <form onSubmit={otpSent ? handleVerifyAndRegister : handleSendOtp} className="space-y-3.5">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input
              type="text"
              name="name"
              placeholder="Enter your name"
              value={formData.name}
              onChange={handleChange}
              disabled={otpSent}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500 text-sm"
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              name="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
              disabled={otpSent}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500 text-sm"
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Min 8 chars, letter + number + special"
              value={formData.password}
              onChange={handleChange}
              disabled={otpSent}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500 text-sm"
            />
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
            <input
              type={showPassword ? "text" : "password"}
              name="confirmPassword"
              placeholder="Re-enter your password"
              value={formData.confirmPassword}
              onChange={handleChange}
              disabled={otpSent}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500 text-sm"
            />
            {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
          </div>

          {/* Show password checkbox */}
          <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={showPassword}
              onChange={() => setShowPassword(!showPassword)}
              className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
            />
            Show password
          </label>

          {/* OTP Input (step 2) */}
          {otpSent && !otpVerified && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Enter OTP</label>
              <input
                type="text"
                maxLength={6}
                placeholder="6-digit OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-center text-base tracking-widest font-mono"
              />
              {errors.otp && <p className="text-red-500 text-xs mt-1">{errors.otp}</p>}
              <button
                type="button"
                onClick={async () => {
                  setLoading(true);
                  try {
                    await apiFetch("/api/auth/send-otp", {
                      method: "POST",
                      body: JSON.stringify({ email: formData.email }),
                    });
                    setSuccess("New OTP sent!");
                  } catch (err) {
                    setErrors({ api: err.message || "Failed to resend OTP." });
                  } finally {
                    setLoading(false);
                  }
                }}
                className="text-xs text-green-600 hover:underline mt-1"
                disabled={loading}
              >
                Resend OTP
              </button>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-3 rounded-xl text-white font-semibold bg-green-800 hover:bg-green-900 transition shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? "Please wait..." : otpSent ? "Verify & Create Account" : "Send OTP"}
          </button>
        </form>

        <p className="text-center text-sm mt-5 text-gray-500">
          Already have an account?{" "}
          <Link to="/login" className="text-green-600 font-semibold hover:underline">
            Login
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}

export default Register;
