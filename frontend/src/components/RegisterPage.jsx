import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import loginImg from "../assets/login-image.png";

const RegisterPage = () => {
  const [formData, setFormData] = useState({ username: "", email: "", password: "", confirmPassword: "" });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) return alert("Passwords do not match");
    setIsLoading(true);
    try {
      await axios.post("http://localhost:5000/api/users/register", formData);
      navigate("/");
    } catch (err) {
      alert(err.response?.data?.message || "Registration failed.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-white font-sans overflow-hidden">
      
      {/* LEFT SIDE: Fixed 50% width */}
      <div className="hidden md:flex flex-col w-1/2 bg-linear-to-br from-emerald-100 via-teal-50 to-sky-100 relative items-center justify-center p-12">
        <div className="z-10 text-center mb-20">
          <h1 className="text-4xl lg:text-5xl font-black text-emerald-900 leading-tight">
            Join the <span className="text-emerald-600">Green</span> <br />
            Revolution <br />
            <span className="bg-emerald-600 text-white px-5 py-1 rounded-2xl shadow-lg inline-block mt-3">
              Application
            </span>
          </h1>
          <p className="mt-4 text-emerald-800 font-bold text-lg opacity-80 italic">
            "Start your journey today."
          </p>
        </div>
        <div className="absolute bottom-0 w-full flex justify-center">
          <img src={loginImg} alt="Sustainability" className="w-2/3 max-w-sm h-auto translate-y-4 drop-shadow-2xl" />
        </div>
      </div>

      {/* RIGHT SIDE: Fixed 50% width and centered */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md p-10 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-emerald-50 bg-white">
          <div className="flex flex-col items-center mb-8">
            <h2 className="text-3xl font-black text-slate-800">Create Account</h2>
            <p className="text-emerald-600 font-medium mt-1">Sign up to track your impact</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input name="username" placeholder="Full Name" onChange={handleChange} className="w-full px-5 py-3 rounded-2xl border border-slate-200 bg-slate-50 outline-none focus:border-emerald-500" required />
            <input name="email" type="email" placeholder="Email Address" onChange={handleChange} className="w-full px-5 py-3 rounded-2xl border border-slate-200 bg-slate-50 outline-none focus:border-emerald-500" required />
            <input name="password" type="password" placeholder="Password" onChange={handleChange} className="w-full px-5 py-3 rounded-2xl border border-slate-200 bg-slate-50 outline-none focus:border-emerald-500" required />
            <input name="confirmPassword" type="password" placeholder="Confirm Password" onChange={handleChange} className="w-full px-5 py-3 rounded-2xl border border-slate-200 bg-slate-50 outline-none focus:border-emerald-500" required />
            
            <button type="submit" disabled={isLoading} className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-green font-black rounded-2xl shadow-xl transition-all active:scale-95 uppercase tracking-widest">
              {isLoading ? "Processing..." : "Sign Up"}
            </button>
          </form>

          <div className="mt-6 text-center text-sm">
            <p className="text-slate-500">Already have an account? <Link to="/" className="text-emerald-600 font-bold hover:underline">Login</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;