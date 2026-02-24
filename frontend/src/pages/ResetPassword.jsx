import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { apiFetch } from "../utils/api";
import AuthLayout from "../components/AuthLayout";

function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [formData, setFormData] = useState({ newPassword: "", confirmPassword: "" });
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validate = () => {
    const errs = {};
    if (!formData.newPassword) errs.newPassword = "New password is required";
    else if (formData.newPassword.length < 8) errs.newPassword = "At least 8 characters";
    else if (!/[A-Za-z]/.test(formData.newPassword)) errs.newPassword = "Must include a letter";
    else if (!/\d/.test(formData.newPassword)) errs.newPassword = "Must include a number";
    else if (!/[@$!%*#?&]/.test(formData.newPassword)) errs.newPassword = "Must include a special character";
    if (!formData.confirmPassword) errs.confirmPassword = "Confirm your new password";
    else if (formData.confirmPassword !== formData.newPassword) errs.confirmPassword = "Passwords do not match";
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess("");
    if (!token) {
      setErrors({ api: "Invalid or missing reset token." });
      return;
    }
    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setLoading(true);
    try {
      const data = await apiFetch("/api/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({ token, newPassword: formData.newPassword }),
      });
      setSuccess(data.message || "Password reset successfully!");
      setFormData({ newPassword: "", confirmPassword: "" });
      setTimeout(() => navigate("/login"), 3000);
    } catch (err) {
      setErrors({ api: err.message || "Failed to reset password." });
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <AuthLayout>
        <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-10 max-w-md w-full text-center">
          <h1 className="text-3xl font-bold text-green-800 mb-4">Invalid Link</h1>
          <p className="text-red-500 mb-4">The reset link is invalid or missing a token.</p>
          <p className="text-gray-500 text-sm mb-4">Please use the link sent to your email, or request a new one.</p>
          <Link to="/forgot-password" className="text-green-600 font-semibold hover:underline">
            Request New Reset Link
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl overflow-hidden max-w-md w-full px-8 py-8">
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-green-700 hover:text-green-900 font-medium mb-4 transition">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>
          Home
        </Link>
        <div className="text-center mb-6">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <span className="text-2xl font-bold text-green-900">CarbonCalc</span>
            <span className="text-xl">🌱</span>
          </Link>
          <h1 className="text-2xl font-bold text-green-800 mb-1">Reset Password</h1>
          <p className="text-gray-500 text-sm">Enter your new password below.</p>
        </div>

        {errors.api && (
          <p className="text-red-500 text-sm mb-4 bg-red-50 p-3 rounded-lg">{errors.api}</p>
        )}
        {success && (
          <p className="text-green-600 text-sm mb-4 bg-green-50 p-3 rounded-lg">{success}</p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* New Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
            <input
              type={showPassword ? "text" : "password"}
              name="newPassword"
              placeholder="Enter new password"
              value={formData.newPassword}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
            />
            {errors.newPassword && <p className="text-red-500 text-xs mt-1">{errors.newPassword}</p>}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
            <input
              type={showPassword ? "text" : "password"}
              name="confirmPassword"
              placeholder="Confirm new password"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
            />
            {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
          </div>

          {/* Show password checkbox */}
          <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={showPassword}
              onChange={() => { setShowPassword(!showPassword); setShowConfirmPassword(!showConfirmPassword); }}
              className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
            />
            Show password
          </label>

          <button
            type="submit"
            className="w-full py-3 rounded-xl text-white font-semibold bg-green-800 hover:bg-green-900 transition shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>

        <p className="text-center text-sm mt-5 text-gray-500">
          Remember your password?{" "}
          <Link to="/login" className="text-green-600 font-semibold hover:underline">
            Back to Login
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}

export default ResetPassword;
