import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import loginImg from "../assets/login-image.png";
import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";

const RegisterPage = () => {
  const [formData, setFormData] = useState({ username: "", email: "", password: "", confirmPassword: "" });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const validate = () => {
    let newErrors = {};
    if (!formData.username.trim()) newErrors.username = "Full name is required";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) newErrors.email = "Email is required";
    else if (!emailRegex.test(formData.email)) newErrors.email = "Enter a valid email address";
    if (!formData.password) newErrors.password = "Password is required";
    else if (formData.password.length < 8) newErrors.password = "Password must be at least 8 characters";
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = "Passwords do not match";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setIsLoading(true);
    try {
      await axios.post("http://localhost:8080/api/auth/register", {
        name: formData.username,
        email: formData.email,
        password: formData.password
      });
      localStorage.setItem("verifyEmail", formData.email);
      navigate("/verify-otp");
    } catch (err) {
      setErrors({
        api: err.response?.data?.error || err.response?.data?.message || "Registration failed."
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-white font-sans overflow-hidden">
      <div className="hidden md:flex flex-col w-1/2 bg-linear-to-br from-emerald-100 via-teal-50 to-sky-100 relative items-center justify-center p-12">
        <div className="z-10 text-center mb-20">
          <h1 className="text-4xl lg:text-5xl font-black text-emerald-900 leading-tight">
            Join the <span className="text-emerald-600">Green</span> <br /> Revolution <br />
            <span className="bg-emerald-600 text-white px-5 py-1 rounded-2xl shadow-lg inline-block mt-3">Application</span>
          </h1>
          <p className="mt-4 text-emerald-800 font-bold text-lg opacity-80 italic">"Start your journey today."</p>
        </div>
        <div className="absolute bottom-0 w-full flex justify-center">
          <img src={loginImg} alt="Sustainability" className="w-2/3 max-w-sm h-auto translate-y-4 drop-shadow-2xl" />
        </div>
      </div>

      <div className="w-full md:w-1/2 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md p-10 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-emerald-50 bg-white">
          <div className="flex flex-col items-center mb-8">
            <h2 className="text-3xl font-black text-slate-800">Create Account</h2>
            <p className="text-emerald-600 font-medium mt-1">Sign up to track your impact</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <input name="username" placeholder="Full Name" onChange={handleChange} className={`w-full px-5 py-3 rounded-2xl border bg-slate-50 outline-none focus:border-emerald-500 ${errors.username ? "border-red-500" : "border-slate-200"}`} />
            {errors.username && <p className="text-red-500 text-sm">{errors.username}</p>}

            <input name="email" type="email" placeholder="Email Address" onChange={handleChange} className={`w-full px-5 py-3 rounded-2xl border bg-slate-50 outline-none focus:border-emerald-500 ${errors.email ? "border-red-500" : "border-slate-200"}`} />
            {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}

            <input name="password" type="password" placeholder="Password" onChange={handleChange} className={`w-full px-5 py-3 rounded-2xl border bg-slate-50 outline-none focus:border-emerald-500 ${errors.password ? "border-red-500" : "border-slate-200"}`} />
            {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}

            <input name="confirmPassword" type="password" placeholder="Confirm Password" onChange={handleChange} className={`w-full px-5 py-3 rounded-2xl border bg-slate-50 outline-none focus:border-emerald-500 ${errors.confirmPassword ? "border-red-500" : "border-slate-200"}`} />
            {errors.confirmPassword && <p className="text-red-500 text-sm">{errors.confirmPassword}</p>}

            {errors.api && <p className="text-red-600 text-center font-medium">{errors.api}</p>}

            <button type="submit" disabled={isLoading} className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-2xl shadow-xl transition-all active:scale-95 uppercase tracking-widest">
              {isLoading ? "Processing..." : "Sign Up"}
            </button>
          </form>

          <div className="mt-6 text-center text-sm">
            <p className="text-slate-500">Already have an account? <Link to="/" className="text-emerald-600 font-bold hover:underline">Login</Link></p>
          </div>
          
          <div className="mt-6 space-y-3">
            <div className="flex items-center gap-3">
              <hr className="flex-grow border-slate-200" /><span className="text-sm text-slate-400">OR</span><hr className="flex-grow border-slate-200" />
            </div>
            <a href="http://localhost:8080/oauth2/authorization/google" className="flex items-center justify-center gap-3 w-full py-3 bg-white border border-slate-300 rounded-2xl shadow-sm hover:shadow-md transition">
              <FcGoogle size={22} /><span className="font-semibold text-slate-700">Continue with Google</span>
            </a>
            <a href="http://localhost:8080/oauth2/authorization/github" className="flex items-center justify-center gap-3 w-full py-3 bg-black text-white rounded-2xl shadow-sm hover:bg-gray-900 transition">
              <FaGithub size={20} /><span className="font-semibold">Continue with GitHub</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;