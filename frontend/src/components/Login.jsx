import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import loginImg from "../assets/login-image.png";
import { FcGoogle } from "react-icons/fc";
import { FaGithub, FaLeaf } from "react-icons/fa6"; // Added FaLeaf for theme consistency

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
      // POST request to your Spring Boot Login Endpoint
      const res = await axios.post('http://localhost:8080/api/auth/login', formData);
      
      // Destructure user and token from the AuthResponse DTO
      const { user, token } = res.data;

      // Persist to local storage
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('token', token);

      // Clean up any old reset session data
      localStorage.removeItem("resetEmail");

      // Role-based navigation
      const userRole = user?.role?.toLowerCase();
      navigate(userRole === 'admin' ? '/admin-dashboard' : '/dashboard');
      
    } catch (err) {
      // Catching Spring Boot's error responses: Map.of("error", "message")
      const errorMsg = err.response?.data?.error || err.response?.data?.message || 'Login failed. Please try again.';
      alert(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-white font-sans overflow-x-hidden">
      {/* LEFT SIDE - BRANDING */}
      <div className="hidden md:flex flex-1 bg-gradient-to-br from-emerald-100 via-teal-50 to-sky-100 relative items-center justify-center p-12">
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

      {/* RIGHT SIDE - FORM */}
      <div className="flex-1 md:w-1/2 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md p-10 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-emerald-50 bg-white">
          <div className="flex flex-col items-center mb-10">
            <div className="w-16 h-16 bg-emerald-600 rounded-2xl flex items-center justify-center shadow-lg mb-4">
               {/* Updated to use a leaf icon to match the sustainability theme */}
               <FaLeaf className="text-white text-3xl" />
            </div>
            <h2 className="text-3xl font-black text-slate-800">EcoTrack</h2>
            <p className="text-emerald-600 font-medium">Login to your dashboard</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <input 
                name="email" 
                type="email" 
                placeholder="Email Address" 
                onChange={handleChange} 
                className="w-full px-5 py-4 rounded-2xl border border-slate-200 bg-slate-50 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all" 
                required 
              />
            </div>
            
            <div>
              <input 
                name="password" 
                type="password" 
                placeholder="Password" 
                onChange={handleChange} 
                className="w-full px-5 py-4 rounded-2xl border border-slate-200 bg-slate-50 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all" 
                required 
              />
              <div className="flex justify-end mt-2">
                <Link 
                  to="/forgot-password" 
                  className="text-sm text-emerald-600 font-semibold hover:underline transition-all"
                >
                  Forgot Password?
                </Link>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isLoading} 
              className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-2xl shadow-xl transition-all active:scale-95 uppercase tracking-widest disabled:opacity-70"
            >
              {isLoading ? 'Authenticating...' : 'Login'}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-slate-500 text-sm">
              New to the mission? <Link to="/signup" className="text-emerald-600 font-bold hover:underline">Join the cause</Link>
            </p>
          </div>

          <div className="mt-6 space-y-3">
            <div className="flex items-center gap-3">
              <hr className="flex-grow border-slate-200" />
              <span className="text-sm text-slate-400">OR</span>
              <hr className="flex-grow border-slate-200" />
            </div>
            
            {/* OAuth Links */}
            <a 
              href="http://localhost:8080/oauth2/authorization/google" 
              className="flex items-center justify-center gap-3 w-full py-3 bg-white border border-slate-300 rounded-2xl shadow-sm hover:shadow-md transition active:scale-[0.98]"
            >
              <FcGoogle size={22} />
              <span className="font-semibold text-slate-700">Continue with Google</span>
            </a>
            
            <a 
              href="http://localhost:8080/oauth2/authorization/github" 
              className="flex items-center justify-center gap-3 w-full py-3 bg-black text-white rounded-2xl shadow-sm hover:bg-gray-900 transition active:scale-[0.98]"
            >
              <FaGithub size={20} />
              <span className="font-semibold">Continue with GitHub</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;