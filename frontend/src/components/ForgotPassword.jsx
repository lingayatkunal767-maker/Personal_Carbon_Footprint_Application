import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { FaLeaf, FaEarthAmericas, FaSmog } from "react-icons/fa6";
import { GiFootprint } from "react-icons/gi";

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await axios.post('http://localhost:8080/api/auth/forgot-password', { email });
      localStorage.setItem("resetEmail", email);
      alert("Reset OTP sent to your email! 📧");
      navigate('/reset-password');
    } catch (err) {
      const errorMsg = err.response?.data?.error || "User not found or error sending email.";
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

        <h2 className="text-3xl font-black text-emerald-900 mb-2">Reset Password</h2>
        <p className="text-slate-600 mb-8 text-sm">Enter your email to receive a reset OTP</p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <input
            type="email"
            placeholder="Email Address"
            className="w-full px-5 py-4 rounded-2xl border-2 border-emerald-100 bg-white/50 outline-none focus:border-emerald-500 transition-all shadow-sm"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 bg-gradient-to-r from-emerald-600 to-green-700 hover:from-emerald-700 hover:to-green-800 text-white font-black rounded-2xl shadow-xl transition-all active:scale-95 uppercase tracking-widest"
          >
            {isLoading ? 'Sending...' : 'Send OTP'}
          </button>
        </form>

        <div className="mt-8 text-center">
          <Link to="/" className="text-emerald-700 font-bold hover:underline italic text-sm">
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;