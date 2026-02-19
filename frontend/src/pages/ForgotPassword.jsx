import { useState } from "react";
import { Link } from "react-router-dom";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const validate = () => {
    if (!email) {
      return "Email is required";
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      return "Invalid email format";
    }
    return "";
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const validationError = validate();
    setError(validationError);
    setSuccess("");

    if (!validationError) {
      console.log("Reset link sent to:", email);

      // Later connect API here

      setSuccess("Password reset link sent to your email.");
      setEmail("");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-green-50">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md">

        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-green-700">
            CarbonCalc 🌱
          </h1>

          <p className="text-gray-500 text-sm mt-1">
            Reset your password
          </p>

          <h2 className="text-xl font-semibold text-green-600 mt-4">
            Forgot Password 🔐
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">

          <div>
            <input
              type="email"
              placeholder="Enter your registered email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            {error && (
              <p className="text-red-500 text-sm mt-1">{error}</p>
            )}
          </div>

          {success && (
            <p className="text-green-600 text-sm text-center">
              {success}
            </p>
          )}

          <button
            type="submit"
            className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition"
          >
            Send Reset Link
          </button>

        </form>

        <p className="text-center text-sm mt-4">
          Remember your password?{" "}
          <Link to="/login" className="text-green-600 font-medium">
            Back to Login
          </Link>
        </p>

      </div>
    </div>
  );
}

export default ForgotPassword;
