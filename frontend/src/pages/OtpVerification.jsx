import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FaLeaf, FaEarthAmericas, FaSmog } from "react-icons/fa6";
import { GiFootprint } from "react-icons/gi";

const OtpVerification = () => {
  const [otp, setOtp]             = useState(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError]         = useState("");
  const [resending, setResending] = useState(false);
  const [resendMsg, setResendMsg] = useState("");
  const inputs = useRef([]);
  const navigate = useNavigate();
  const email = localStorage.getItem("verifyEmail");

  useEffect(() => {
    if (!email) navigate("/signup");
    inputs.current[0]?.focus();
  }, [email, navigate]);

  const handleChange = (value, index) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError("");
    if (value && index < 5) inputs.current[index + 1]?.focus();
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 6) {
      setOtp(pasted.split(""));
      inputs.current[5]?.focus();
    }
    e.preventDefault();
  };

  const handleSubmit = async () => {
    const enteredOtp = otp.join("");
    if (enteredOtp.length !== 6) { setError("Please enter the complete 6-digit OTP"); return; }
    setIsLoading(true);
    setError("");
    try {
      // POST /api/auth/verify-otp  →  { message: "OTP Verified Successfully" }
      // Backend sets user.enabled = true, deletes OTP row
      await axios.post("http://localhost:8080/api/auth/verify-otp", { email, otp: enteredOtp });
      localStorage.removeItem("verifyEmail");
      // Redirect to login so user logs in fresh and gets JWT token
      navigate("/", { state: { verified: true } });
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || "Invalid or expired OTP ❌");
      setOtp(["", "", "", "", "", ""]);
      inputs.current[0]?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    setResendMsg("");
    setError("");
    try {
      // POST /api/auth/resend-otp  →  { message: "OTP resent..." }
      // Backend deletes old OTP, generates new one, sends email + prints to console
      await axios.post("http://localhost:8080/api/auth/resend-otp", { email });
      setResendMsg("New OTP sent! Check your email or backend console.");
    } catch (err) {
      setError(err.response?.data?.error || "Failed to resend OTP.");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-emerald-200 via-green-100 to-sky-200">
      <FaLeaf className="absolute text-emerald-300 text-9xl top-10 left-10 opacity-20 rotate-12" />
      <FaEarthAmericas className="absolute text-green-400 text-8xl bottom-10 right-16 opacity-20" />
      <FaSmog className="absolute text-slate-400 text-7xl bottom-24 left-20 opacity-10" />
      <GiFootprint className="absolute text-emerald-500 text-8xl top-1/3 right-10 opacity-10 rotate-45" />

      <div className="relative z-10 backdrop-blur-lg bg-white/80 border border-white/40 shadow-2xl p-10 rounded-3xl w-full max-w-md text-center">
        <div className="flex justify-center mb-4">
          <div className="bg-emerald-600 p-4 rounded-full shadow-lg">
            <GiFootprint className="text-white text-3xl" />
          </div>
        </div>

        <h2 className="text-3xl font-black text-emerald-900">Verify Your Email</h2>
        <p className="text-slate-600 mt-2 text-sm">Enter the 6-digit OTP sent to</p>
        <p className="text-emerald-700 font-semibold text-sm mb-2 break-all">{email}</p>
        <p className="text-xs text-slate-400 mb-6">
          💡 OTP also printed in IntelliJ / terminal console if email fails.
        </p>

        {error && (
          <div className="mb-4 px-4 py-2 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm font-medium">
            {error}
          </div>
        )}
        {resendMsg && (
          <div className="mb-4 px-4 py-2 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-sm font-medium">
            {resendMsg}
          </div>
        )}

        {/* 6-box OTP input */}
        <div className="flex justify-center gap-3 mb-6" onPaste={handlePaste}>
          {otp.map((digit, index) => (
            <input
              key={index} type="text" maxLength="1" value={digit}
              ref={(el) => (inputs.current[index] = el)}
              onChange={(e) => handleChange(e.target.value, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              className="w-12 h-14 text-center text-2xl font-bold border-2 border-emerald-300 bg-white rounded-xl focus:border-emerald-600 focus:ring-2 focus:ring-emerald-300 transition-all outline-none shadow-sm"
            />
          ))}
        </div>

        <button onClick={handleSubmit} disabled={isLoading}
          className="w-full py-3 bg-gradient-to-r from-emerald-600 to-green-700 hover:from-emerald-700 hover:to-green-800 text-white font-bold rounded-2xl shadow-lg transition-all active:scale-95 disabled:opacity-70">
          {isLoading ? "Verifying..." : "Verify & Continue 🌱"}
        </button>

        <button onClick={handleResend} disabled={resending}
          className="mt-4 text-sm text-emerald-700 font-semibold hover:underline disabled:opacity-50">
          {resending ? "Resending..." : "Didn't receive it? Resend OTP"}
        </button>

        <p className="text-xs text-slate-500 mt-4">🌍 Every action counts towards a greener planet.</p>
      </div>
    </div>
  );
};

export default OtpVerification;
