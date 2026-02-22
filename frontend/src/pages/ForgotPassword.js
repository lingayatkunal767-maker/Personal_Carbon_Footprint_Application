import React, { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "./Auth.css";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:8080";

function isValidPassword(pwd) {
  return /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/.test(pwd || "");
}

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await axios.post(`${API_BASE}/api/auth/forgot-password`, { email: email.trim() });
      if (res.data.userFound === false) {
        setError(res.data.message || "No account found with this email. Please register first.");
        return;
      }
      setOtpSent(true);
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data || "Something went wrong. Try again.");
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");
    if (!isValidPassword(newPassword)) {
      setError("Invalid password.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    try {
      await axios.post(`${API_BASE}/api/auth/reset-password`, {
        email: email.trim(),
        otp: otp.trim(),
        newPassword,
      });
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data || "Invalid or expired OTP. Request a new one.");
    }
  };

  if (success) {
    return (
      <div className="auth-wrapper">
        <div className="auth-box">
          <div className="top-section">
            <h1 className="brand">
              <span className="leaf">🍃</span> Carbon<span>Calc</span>
            </h1>
            <p className="subtitle">Track & Start Reducing Your Emissions</p>
            <hr />
          </div>
          <h2>Password reset</h2>
          <p className="forgot-password-message">Your password has been reset. You can now log in with your new password.</p>
          <p className="bottom-text">
            <Link to="/">Go to Login</Link>
          </p>
        </div>
      </div>
    );
  }

  if (otpSent) {
    return (
      <div className="auth-wrapper">
        <div className="auth-box">
          <div className="top-section">
            <h1 className="brand">
              <span className="leaf">🍃</span> Carbon<span>Calc</span>
            </h1>
            <p className="subtitle">Track & Start Reducing Your Emissions</p>
            <hr />
          </div>
          <h2>Enter OTP & new password</h2>
          <p className="forgot-password-message">
            A 6-digit OTP has been sent to <strong>{email}</strong>. It is valid for 10 minutes. Please check your inbox and spam folder.
          </p>
          <form onSubmit={handleResetPassword}>
            <label>OTP code</label>
            <input
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
            />
            <label>New Password</label>
            <input
              type="password"
              placeholder="New password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
            <label>Confirm Password</label>
            <input
              type="password"
              placeholder="Re-enter password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            {error && <p className="form-error">{error}</p>}
            <button type="submit">Reset password</button>
          </form>
          <p className="bottom-text">
            <button type="button" className="link-button" onClick={() => { setOtpSent(false); setOtp(""); setNewPassword(""); setConfirmPassword(""); setError(""); }}>
              Use a different email
            </button>
            {" · "}
            <Link to="/">Back to Login</Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-wrapper">
      <div className="auth-box">
        <div className="top-section">
          <h1 className="brand">
            <span className="leaf">🍃</span> Carbon<span>Calc</span>
          </h1>
          <p className="subtitle">Track & Start Reducing Your Emissions</p>
          <hr />
        </div>
        <h2>Forgot Password</h2>
        <p className="forgot-password-intro">Enter your email and we'll send you a 6-digit OTP to reset your password.</p>
        <form onSubmit={handleSendOtp}>
          <label>Email Address</label>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          {error && <p className="form-error">{error}</p>}
          <button type="submit">Send OTP</button>
        </form>
        <p className="bottom-text">
          <Link to="/">Back to Login</Link>
        </p>
      </div>
    </div>
  );
}

export default ForgotPassword;
