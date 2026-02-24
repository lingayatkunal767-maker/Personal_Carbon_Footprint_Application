import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiFetch } from "../utils/api";
import AuthLayout from "../components/AuthLayout";

export default function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const updated = { ...formData, [e.target.name]: e.target.value };
    setFormData(updated);
    setErrors(validate(updated));
  };

  const validate = (data = formData) => {
    const errs = {};
    const emailRegex = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;
    if (!data.email) errs.email = "Email is required";
    else if (!emailRegex.test(data.email)) errs.email = "Enter a valid email address";
    if (!data.password) errs.password = "Password is required";
    else if (data.password.length < 8) errs.password = "Password must be 8+ characters";
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);
    if (!formData.email || !formData.password) return;

    setLoading(true);
    try {
      const data = await apiFetch("/api/auth/login", {
        method: "POST",
        body: JSON.stringify(formData),
      });
      if (data && data.token) {
        localStorage.setItem("token", data.token);
        navigate("/dashboard");
      } else {
        setErrors({ api: "Login succeeded but no token returned." });
      }
    } catch (err) {
      if (err.status === 401) setErrors({ api: "Invalid email or password." });
      else setErrors({ api: err.message || "Network error. Please try again later." });
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
        <div className="text-center mb-6">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <span className="text-2xl font-bold text-green-900">CarbonCalc</span>
            <span className="text-xl">🌱</span>
          </Link>
          <h1 className="text-2xl font-bold text-green-800 mb-1">Welcome back</h1>
          <p className="text-gray-500 text-sm">
            Sign in to your account
          </p>
        </div>

        {errors.api && (
          <p className="text-red-500 text-sm mb-4 bg-red-50 p-3 rounded-lg">{errors.api}</p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              name="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
            />
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
          </div>

          {/* Show password & Forgot */}
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={showPassword}
                onChange={() => setShowPassword(!showPassword)}
                className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
              />
              Show password
            </label>
            <Link to="/forgot-password" className="text-sm text-green-600 hover:underline">
              Forgot Password?
            </Link>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            className="w-full py-3 rounded-xl text-white font-semibold bg-green-800 hover:bg-green-900 transition shadow-lg disabled:opacity-70"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="text-center text-sm mt-5 text-gray-500">
          Don't have an account?{" "}
          <Link to="/register" className="text-green-600 font-semibold hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}
