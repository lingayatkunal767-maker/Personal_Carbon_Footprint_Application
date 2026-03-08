import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FaLeaf, FaEarthAmericas, FaSmog } from "react-icons/fa6";
import { GiFootprint } from "react-icons/gi";

const OtpVerification = () => {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const inputs = useRef([]);
  const navigate = useNavigate();
  const email = localStorage.getItem("verifyEmail");

  useEffect(() => {
    if (!email) navigate("/signup");
  }, [email, navigate]);

  const handleChange = (value, index) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) inputs.current[index + 1]?.focus();
  };

  const handleSubmit = async () => {
    const enteredOtp = otp.join("");
    if (enteredOtp.length !== 6) {
      alert("Please enter complete 6-digit OTP");
      return;
    }

    try {
      await axios.post("http://localhost:8080/api/auth/verify-otp", {
        email: email,
        otp: enteredOtp
      });
      alert("Email verified successfully ✅");
      localStorage.removeItem("verifyEmail");
      navigate("/"); 
    } catch (error) {
      // Logic to catch Spring Boot's error message
      const errorMsg = error.response?.data?.error || error.response?.data?.message || "Invalid or expired OTP ❌";
      alert(errorMsg);
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
        <p className="text-emerald-700 font-semibold text-sm mb-8 break-all">{email}</p>

        <div className="flex justify-center gap-3 mb-8">
          {otp.map((digit, index) => (
            <input
              key={index}
              type="text"
              maxLength="1"
              value={digit}
              ref={(el) => (inputs.current[index] = el)}
              onChange={(e) => handleChange(e.target.value, index)}
              className="w-12 h-14 text-center text-2xl font-bold border-2 border-emerald-300 bg-white rounded-xl focus:border-emerald-600 focus:ring-2 focus:ring-emerald-300 transition-all outline-none shadow-sm"
            />
          ))}
        </div>

        <button onClick={handleSubmit} className="w-full py-3 bg-gradient-to-r from-emerald-600 to-green-700 hover:from-emerald-700 hover:to-green-800 text-white font-bold rounded-2xl shadow-lg transition-all active:scale-95">
          Verify & Reduce Carbon 🌱
        </button>
        <p className="text-xs text-slate-500 mt-6">🌍 Every action counts towards a greener planet.</p>
      </div>
    </div>
  );
};

export default OtpVerification;