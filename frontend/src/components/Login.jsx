import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import loginImg from "../assets/login-image.png";

const LoginPage = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await axios.post(
        'http://localhost:5000/api/users/login',
        formData
      );

      const { user, token } = res.data;

      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('token', token);

      navigate(
        user.role.toLowerCase() === 'admin'
          ? '/admin-dashboard'
          : '/dashboard'
      );
    } catch (err) {
      alert(err.response?.data?.message || 'Login failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-white font-sans overflow-x-hidden">

      {/* LEFT SIDE */}
<div className="hidden md:flex flex-1 bg-linear-to-br from-emerald-100 via-teal-50 to-sky-100 relative items-center justify-center p-12">

        <div className="z-10 text-center mb-20">
          <h1 className="text-4xl lg:text-5xl font-black text-emerald-900 leading-tight">
            Your <span className="text-emerald-600">Personal</span> <br />
            Carbon Footprint <br />
            <span className="bg-emerald-600 text-white px-5 py-1 rounded-2xl shadow-lg inline-block mt-3">
              Application
            </span>
          </h1>

          <p className="mt-4 text-emerald-800 font-bold text-lg opacity-80 italic">
            "Small changes, massive impact."
          </p>
        </div>

        <div className="absolute bottom-0 w-full flex justify-center">
          <img
            src={loginImg}
            alt="Sustainability"
            className="w-2/3 max-w-sm h-auto translate-y-4 drop-shadow-2xl"
          />
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="flex-1 md:w-1/2 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md p-10 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-emerald-50 bg-white">

          {/* Logo Section */}
          <div className="flex flex-col items-center mb-10">
            <div className="w-16 h-16 bg-emerald-600 rounded-2xl flex items-center justify-center shadow-lg mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-10 w-10 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
            </div>

            <h2 className="text-3xl font-black text-slate-800">
              EcoTrack
            </h2>
            <p className="text-emerald-600 font-medium">
              Login to your dashboard
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <input
              name="email"
              type="email"
              placeholder="Email Address"
              onChange={handleChange}
              className="w-full px-5 py-4 rounded-2xl border border-slate-200 bg-slate-50 outline-none focus:border-emerald-500 transition-all"
              required
            />

            <input
              name="password"
              type="password"
              placeholder="Password"
              onChange={handleChange}
              className="w-full px-5 py-4 rounded-2xl border border-slate-200 bg-slate-50 outline-none focus:border-emerald-500 transition-all"
              required
            />

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-2xl shadow-xl transition-all active:scale-95 uppercase tracking-widest"
            >
              {isLoading ? 'Loading...' : 'Login'}
            </button>
          </form>

          {/* Signup */}
          <div className="mt-8 text-center">
            <p className="text-slate-500 text-sm">
              New to the mission?{' '}
              <Link
                to="/signup"
                className="text-emerald-600 font-bold hover:underline"
              >
                Join the cause
              </Link>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default LoginPage;
