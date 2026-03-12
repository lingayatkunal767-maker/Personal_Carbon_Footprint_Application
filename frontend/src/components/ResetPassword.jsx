import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FaLeaf, FaEarthAmericas, FaSmog } from "react-icons/fa6";
import { GiFootprint } from "react-icons/gi";

const ResetPassword = () => {
  const [formData, setFormData] = useState({ otp: '', newPassword: '', confirmPassword: '' });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const email = localStorage.getItem("resetEmail");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.newPassword !== formData.confirmPassword) {
      return alert("Passwords do not match!");
    }

    setIsLoading(true);
    try {
      await axios.post('http://localhost:8080/api/auth/reset-password', {
        email,
        otp: formData.otp,
        newPassword: formData.newPassword
      });
      
      alert("Password changed successfully! Please login. ✅");
      localStorage.removeItem("resetEmail");
      navigate('/');
    } catch (err) {
      const errorMsg = err.response?.data?.error || "Invalid OTP or request expired.";
      alert(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-emerald-200 via-green-100 to-sky-200">
      {/* Background Icons */}
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

        <h2 className="text-3xl font-black text-emerald-900 mb-2">New Password</h2>
        <p className="text-slate-600 mb-6 text-sm italic">Secure your account for a greener future</p>

        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          <div>
            <label className="text-xs font-bold text-emerald-800 ml-2 uppercase">Verification Code</label>
            <input
              placeholder="6-Digit OTP"
              className="w-full px-5 py-3 mt-1 rounded-2xl border-2 border-emerald-100 bg-white/50 outline-none focus:border-emerald-500 transition-all shadow-sm"
              onChange={(e) => setFormData({...formData, otp: e.target.value})}
              required
            />
          </div>

          <div>
            <label className="text-xs font-bold text-emerald-800 ml-2 uppercase">New Password</label>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full px-5 py-3 mt-1 rounded-2xl border-2 border-emerald-100 bg-white/50 outline-none focus:border-emerald-500 transition-all shadow-sm"
              onChange={(e) => setFormData({...formData, newPassword: e.target.value})}
              required
            />
          </div>

          <div>
            <label className="text-xs font-bold text-emerald-800 ml-2 uppercase">Confirm Password</label>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full px-5 py-3 mt-1 rounded-2xl border-2 border-emerald-100 bg-white/50 outline-none focus:border-emerald-500 transition-all shadow-sm"
              onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 mt-2 bg-gradient-to-r from-emerald-600 to-green-700 hover:from-emerald-700 hover:to-green-800 text-white font-black rounded-2xl shadow-xl transition-all active:scale-95 uppercase tracking-widest"
          >
            {isLoading ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;