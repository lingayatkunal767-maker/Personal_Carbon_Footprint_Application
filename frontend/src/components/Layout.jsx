import React, { useState, useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import {
  LogOut, Leaf, LayoutDashboard, 
  ClipboardList, History, Settings, Search, 
  Bell, TrendingUp
} from "lucide-react";

const Layout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState({ name: "Alex" });

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
    if (storedUser.username || storedUser.name) {
      setUser({ name: storedUser.username || storedUser.name });
    }
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <div className="flex min-h-screen bg-[#F8FAF9] font-sans text-slate-700">
      {/* --- SIDEBAR --- */}
      <aside className="w-64 bg-white border-r border-gray-100 flex flex-col sticky top-0 h-screen">
        <div className="p-6 flex items-center gap-2">
          <div className="bg-emerald-600 p-1.5 rounded-lg">
            <Leaf className="text-white w-6 h-6" />
          </div>
          <span className="text-xl font-bold text-gray-800 tracking-tight">EcoTrack</span>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          <SidebarItem 
            icon={LayoutDashboard} label="Dashboard" 
            active={location.pathname === "/dashboard"} 
            onClick={() => navigate("/dashboard")} 
          />
          <SidebarItem 
            icon={ClipboardList} label="Lifestyle Survey" 
            active={location.pathname === "/survey"} 
            onClick={() => navigate("/survey")} 
          />
          <SidebarItem 
            icon={History} label="Carbon History" 
            active={location.pathname === "/history"} 
            onClick={() => navigate("/history")} 
          />
          <SidebarItem 
            icon={TrendingUp} label="My Goals" 
            active={location.pathname === "/goals"} 
            onClick={() => navigate("/goals")} 
          />
        </nav>

        <div className="p-4 border-t border-gray-100 space-y-1">
          <SidebarItem icon={Settings} label="Settings" />
          <SidebarItem icon={LogOut} label="Logout" color="text-rose-500" onClick={handleLogout} />
        </div>
      </aside>

      {/* --- CONTENT AREA --- */}
      <main className="flex-1 overflow-y-auto">
        <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-8 sticky top-0 z-20">
          <div className="relative w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input type="text" placeholder="Search..." className="w-full bg-gray-50 border-none rounded-lg py-2 pl-10 pr-4 outline-none text-sm" />
          </div>
          
          <div className="flex items-center gap-4">
            <button className="p-2 text-gray-400 hover:bg-gray-100 rounded-full relative">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="flex items-center gap-3 border-l pl-4">
              <p className="text-sm font-bold text-gray-800">{user.name}</p>
              <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`} className="w-10 h-10 rounded-full bg-emerald-50 border border-emerald-100" alt="avatar" />
            </div>
          </div>
        </header>

        {/* This is where the specific page content (Dashboard, Survey, etc.) will render */}
        <Outlet />
      </main>
    </div>
  );
};

const SidebarItem = ({ icon: Icon, label, active, onClick, color = "text-gray-500" }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-semibold text-sm ${
      active ? "bg-emerald-600 text-white shadow-lg shadow-emerald-100" : `hover:bg-gray-50 ${color}`
    }`}
  >
    <Icon size={18} />
    {label}
  </button>
);

export default Layout;