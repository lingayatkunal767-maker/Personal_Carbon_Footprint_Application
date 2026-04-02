import React, { useState, useEffect, useCallback } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import {
  LogOut, Leaf, LayoutDashboard,
  ClipboardList, History, TrendingUp,
  ShoppingBag, Trophy, Award, Bell,
  Shield, Users, BarChart3, Target,
  CreditCard, ChevronDown, ChevronRight,
  Settings
} from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// Sidebar Item
// ─────────────────────────────────────────────────────────────────────────────
const SidebarItem = ({ icon: Icon, label, active, onClick, badge = 0, color = "text-gray-500" }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm font-semibold ${
      active
        ? "bg-emerald-600 text-white shadow-lg shadow-emerald-100"
        : `hover:bg-gray-50 ${color}`
    }`}
  >
    <Icon size={17} className="flex-shrink-0" />
    <span className="flex-1 text-left truncate">{label}</span>
    {badge > 0 && (
      <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full min-w-[18px] text-center ${
        active ? "bg-white/30 text-white" : "bg-rose-500 text-white"
      }`}>
        {badge > 99 ? "99+" : badge}
      </span>
    )}
  </button>
);

// Section label
const SectionLabel = ({ children }) => (
  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-3 pt-4 pb-1 select-none">
    {children}
  </p>
);

// ─────────────────────────────────────────────────────────────────────────────
// Layout
// ─────────────────────────────────────────────────────────────────────────────
const Layout = () => {
  const navigate  = useNavigate();
  const location  = useLocation();
  const [user, setUser]           = useState({ name: "User", role: "USER" });
  const [unreadCount, setUnread]  = useState(0);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("user") || "{}");
    if (stored.name || stored.username) {
      setUser({ name: stored.name || stored.username, role: stored.role || "USER" });
    }
  }, []);

  // Poll unread notification count
  const fetchUnread = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const res = await fetch("http://localhost:8080/api/notifications/unread-count", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setUnread(data.count ?? 0);
      }
    } catch {}
  }, []);

  useEffect(() => {
    fetchUnread();
    const id = setInterval(fetchUnread, 30000);
    return () => clearInterval(id);
  }, [fetchUnread]);

  const handleLogout = () => { localStorage.clear(); navigate("/"); };
  const isAdmin = user.role?.toUpperCase() === "ADMIN";
  const at = (path) => location.pathname === path;
  const startsWith = (path) => location.pathname.startsWith(path);

  return (
    <div className="flex min-h-screen bg-[#F8FAF9] font-sans text-slate-700">

      {/* ════════════════════ SIDEBAR ════════════════════ */}
      <aside className="w-64 bg-white border-r border-gray-100 flex flex-col sticky top-0 h-screen overflow-y-auto">

        {/* Logo */}
        <div className="px-5 py-5 flex items-center gap-2.5 border-b border-gray-100 flex-shrink-0">
          <div className="bg-emerald-600 p-1.5 rounded-xl flex-shrink-0">
            <Leaf className="text-white w-5 h-5" />
          </div>
          <div>
            <span className="text-lg font-black text-gray-800 tracking-tight leading-none">EcoTrack</span>
            <p className={`text-[10px] font-bold leading-none mt-0.5 ${isAdmin ? "text-purple-500" : "text-emerald-500"}`}>
              {isAdmin ? "Administrator" : "Member"}
            </p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-2 space-y-0.5">

          {/* ── ADMIN SECTION ─────────────── */}
          {isAdmin && (
            <>
              <SectionLabel>Admin</SectionLabel>
              <SidebarItem
                icon={Shield} label="Admin Dashboard"
                active={at("/admin-dashboard")}
                onClick={() => navigate("/admin-dashboard")}
                color="text-purple-500"
              />
              <div className="my-2 mx-1 border-t border-gray-100" />
            </>
          )}

          {/* ── MENU ─────────────────────── */}
          <SectionLabel>Menu</SectionLabel>

          <SidebarItem
            icon={LayoutDashboard} label="Dashboard"
            active={at("/dashboard")}
            onClick={() => navigate("/dashboard")}
          />
          <SidebarItem
            icon={ClipboardList} label="Lifestyle Survey"
            active={at("/survey")}
            onClick={() => navigate("/survey")}
          />
          <SidebarItem
            icon={History} label="Carbon History"
            active={at("/history")}
            onClick={() => navigate("/history")}
          />
          <SidebarItem
            icon={Target} label="My Goals"
            active={at("/goals")}
            onClick={() => navigate("/goals")}
          />
          <SidebarItem
            icon={Award} label="Eco Badges"
            active={startsWith("/badges")}
            onClick={() => navigate("/badges")}
          />
          <SidebarItem
            icon={Trophy} label="Leaderboard"
            active={at("/leaderboard")}
            onClick={() => navigate("/leaderboard")}
          />

          <div className="my-2 mx-1 border-t border-gray-100" />
          <SectionLabel>Marketplace</SectionLabel>

          <SidebarItem
            icon={ShoppingBag} label="Eco Marketplace"
            active={at("/marketplace")}
            onClick={() => navigate("/marketplace")}
          />
          <SidebarItem
            icon={CreditCard} label="My Transactions"
            active={at("/transhistory")}
            onClick={() => navigate("/transhistory")}
          />

          <div className="my-2 mx-1 border-t border-gray-100" />
          <SectionLabel>Activity</SectionLabel>

          <SidebarItem
            icon={Bell} label="Notifications"
            active={at("/notifications")}
            onClick={() => navigate("/notifications")}
            badge={unreadCount}
          />
        </nav>

        {/* Bottom */}
        <div className="px-3 py-3 border-t border-gray-100 space-y-0.5 flex-shrink-0">
          {/* User info card */}
          <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-gray-50 mb-2">
            <img
              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`}
              className="w-8 h-8 rounded-full bg-emerald-50 border border-emerald-100 flex-shrink-0"
              alt="avatar"
            />
            <div className="min-w-0">
              <p className="text-xs font-bold text-gray-800 truncate">{user.name}</p>
              <p className="text-[10px] text-gray-400 truncate">{user.role}</p>
            </div>
          </div>
          <SidebarItem
            icon={LogOut} label="Logout"
            color="text-rose-400"
            onClick={handleLogout}
          />
        </div>
      </aside>

      {/* ════════════════════ MAIN CONTENT ════════════════════ */}
      <main className="flex-1 overflow-y-auto min-w-0">

        {/* Topbar */}
        <header className="h-14 bg-white border-b border-gray-100 flex items-center justify-between px-6 sticky top-0 z-20 gap-4">
          <div className="text-sm font-bold text-gray-500">
            {getPageTitle(location.pathname)}
          </div>

          <div className="flex items-center gap-2 ml-auto">
            {/* Notifications bell */}
            <button
              onClick={() => navigate("/notifications")}
              className="relative p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 rounded-xl transition-colors"
              title="Notifications"
            >
              <Bell size={19} />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border-[1.5px] border-white" />
              )}
            </button>

            {/* User display */}
            <div className="flex items-center gap-2 pl-2 border-l border-gray-100">
              <img
                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`}
                className="w-8 h-8 rounded-full bg-emerald-50 border border-emerald-100"
                alt="avatar"
              />
              <div className="hidden sm:block">
                <p className="text-xs font-bold text-gray-700 leading-none">{user.name}</p>
                <p className="text-[10px] text-gray-400 mt-0.5">{user.role}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <Outlet />
      </main>
    </div>
  );
};

function getPageTitle(path) {
  const map = {
    "/dashboard":       "Dashboard",
    "/survey":          "Lifestyle Survey",
    "/history":         "Carbon History",
    "/goals":           "My Goals",
    "/badges":          "Eco Badges",
    "/leaderboard":     "Leaderboard",
    "/marketplace":     "Eco Marketplace",
    "/transhistory":    "Transaction History",
    "/notifications":   "Notifications",
    "/admin-dashboard": "Admin Dashboard",
  };
  return map[path] || "EcoTrack";
}

export default Layout;
