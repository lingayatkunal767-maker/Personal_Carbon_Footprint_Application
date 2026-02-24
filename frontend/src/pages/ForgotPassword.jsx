import { useState } from "react";
import { Link } from "react-router-dom";
import { apiFetch } from "../utils/api";
import AuthLayout from "../components/AuthLayout";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const validate = () => {
    if (!email) return "Email is required";
    if (!/\S+@\S+\.\S+/.test(email)) return "Invalid email format";
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validate();
    setError(validationError);
    setSuccess("");
    if (validationError) return;

    setLoading(true);
    try {
      const data = await apiFetch("/api/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email }),
      });
      setSuccess(data.message || "Password reset link sent to your email.");
      setEmail("");
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
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
          <h1 className="text-2xl font-bold text-green-800 mb-1">Forgot Password?</h1>
          <p className="text-gray-500 text-sm">
            Enter your registered email to receive a reset link.
          </p>
        </div>

        {error && (
          <p className="text-red-500 text-sm mb-4 bg-red-50 p-3 rounded-lg">{error}</p>
        )}
        {success && (
          <p className="text-green-600 text-sm mb-4 bg-green-50 p-3 rounded-lg">{success}</p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl text-white font-semibold bg-green-800 hover:bg-green-900 transition shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? "Sending..." : "Send Reset Link"}
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

export default ForgotPassword;
