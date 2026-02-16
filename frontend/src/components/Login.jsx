import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom'; 
import loginImg from "../assets/login-image.png";

const LoginPage = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [status, setStatus] = useState({ type: '', message: '' });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      setStatus({ type: 'error', message: 'Please fill in all fields.' });
      return;
    }
    setIsLoading(true);
    setStatus({ type: '', message: '' });

    try {
      const res = await axios.post('http://localhost:5000/api/users/login', formData);
      const { user, token } = res.data;
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('token', token);
      setStatus({ type: 'success', message: `Welcome, ${user.username}!` });
      setTimeout(() => navigate(user.role.toLowerCase() === 'admin' ? '/admin-dashboard' : '/dashboard'), 1000);
    } catch (err) {
      setStatus({ type: 'error', message: err.response?.data?.message || 'Login failed.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full flex-col md:flex-row font-sans bg-slate-50 overflow-hidden">
      
      {/* LEFT SIDE: Refined scaling for Tailwind v4 */}
      <div className="hidden md:flex flex-col flex-1 bg-linear-to-br from-emerald-100 via-teal-50 to-sky-100 relative items-center justify-start overflow-hidden">
        
        {/* Branding Text */}
        <div className="z-10 text-center px-6 mt-20 transition-all duration-700 hover:scale-105 max-w-lg">
          <h1 className="text-4xl lg:text-5xl font-black tracking-tight text-emerald-900 leading-tight">
            Your <span className="text-emerald-600">Personal</span> <br />
            Carbon Footprint <br />
            <span className="bg-emerald-600 text-white px-5 py-1 rounded-2xl shadow-lg inline-block mt-3">
              Application
            </span>
          </h1>
          <p className="mt-3 text-emerald-800 font-bold text-lg opacity-80 italic">
            "Small changes, massive impact."
          </p>
        </div>

        {/* The Illustration: Reduced size and centered */}
        <div className="absolute inset-x-0 bottom-0 flex justify-center items-end pointer-events-none p-8">
          <img
            src={loginImg}
            alt="Sustainability Illustration"
            /* Reduced width to 75% of the panel and capped the max width */
            className="w-6/2 max-w-md h-auto translate-y-4 drop-shadow-xl transition-transform duration-1000 hover:-translate-y-2"
          />
        </div>
      </div>

      {/* RIGHT SIDE: Login Form */}
      <div className="flex flex-1 items-center justify-center p-6 bg-white z-20">
        <div className="w-full max-w-md p-10 bg-white rounded-3xl shadow-2xl border border-emerald-50">
          
          <div className="flex flex-col items-center mb-10">
            <div className="flex items-center justify-center w-16 h-16 bg-emerald-600 rounded-2xl shadow-xl mb-5 text-white transform hover:rotate-12 transition-transform">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-9 w-9" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <h2 className="text-4xl font-black text-slate-800">EcoTrack</h2>
            <p className="text-emerald-700 font-medium mt-2">Login to your mission dashboard</p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <input
              name="email"
              type="text"
              placeholder="Email or Username"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 bg-slate-50 outline-none shadow-xs"
            />
            <input
              name="password"
              type="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 bg-slate-50 outline-none shadow-xs"
            />
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-green font-black rounded-2xl shadow-lg shadow-emerald-200 transition-all active:scale-95 disabled:opacity-50 uppercase tracking-widest text-sm"
            >
              {isLoading ? 'Authenticating...' : 'Login'}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-slate-500 text-sm">
              New to the mission?{' '}
              <Link to="/signup" className="text-emerald-600 font-bold hover:underline decoration-2">
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