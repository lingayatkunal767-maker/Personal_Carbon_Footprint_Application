import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import LogActivityModal from "./LogActivityModal";
import {
  LogOut, Leaf, Zap, Car, LayoutDashboard, 
  ClipboardList, History, Settings, Search, 
  Bell, Plus, Utensils, TrendingUp, MoreHorizontal, Award, Sparkles, ShieldCheck, TreePine
} from "lucide-react";

// --- SUB-COMPONENT: SMOOTH TREND CHART ---
const SmoothTrendChart = ({ data }) => {
  if (!data || data.length === 0) return null;
  const points = data.map((val, i) => ({
    x: (i / (data.length - 1)) * 300,
    y: 100 - (val * 0.8) 
  }));

  const pathData = points.reduce((acc, point, i, str) => {
    if (i === 0) return `M ${point.x},${point.y}`;
    const prev = str[i - 1];
    const cx = (prev.x + point.x) / 2;
    return `${acc} C ${cx},${prev.y} ${cx},${point.y} ${point.x},${point.y}`;
  }, "");

  const areaData = `${pathData} L 300,100 L 0,100 Z`;

  return (
    <div className="w-full h-48 relative mt-4">
      <svg viewBox="0 0 300 100" preserveAspectRatio="none" className="w-full h-full">
        <defs>
          <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={areaData} fill="url(#gradient)" />
        <path d={pathData} fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" />
        <circle cx={points[points.length - 1].x} cy={points[points.length - 1].y} r="3" fill="#10b981" stroke="white" strokeWidth="1" />
      </svg>
      <div className="flex justify-between mt-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">
        <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
      </div>
    </div>
  );
};

// --- SUB-COMPONENT: CATEGORY CARD ---
const CategoryCard = ({ label, value, change, icon: Icon, data, color }) => (
  <div className="bg-white border border-gray-100 p-6 rounded-[32px]">
    <div className="flex justify-between items-start mb-5">
      <div className="p-2.5 bg-gray-50 rounded-xl text-emerald-600"><Icon size={20} /></div>
      <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${color === 'rose' ? 'bg-rose-50 text-rose-500' : 'bg-emerald-50 text-emerald-600'}`}>
        {change}
      </span>
    </div>
    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">{label}</p>
    <p className="text-2xl font-black text-gray-800 mt-1">{value}</p>
    <div className="flex gap-1.5 mt-5 h-10 items-end">
      {data.map((h, i) => (
        <div key={i} className={`flex-1 rounded-sm ${h > 50 ? 'bg-rose-400' : 'bg-emerald-400'}`} style={{ height: `${h}%` }}></div>
      ))}
    </div>
  </div>
);

// --- SUB-COMPONENT: BADGE ITEM ---
const BadgeItem = ({ icon: Icon, label, color, onClick }) => {
  const [bgClass, textClass] = color.split(" ");
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center justify-center p-5 rounded-[24px] 
      ${bgClass} border border-white shadow-sm
      hover:scale-105 hover:shadow-md 
      transition-all duration-200 cursor-pointer w-full`}
    >
      <div className={`mb-3 ${textClass}`}>
        <Icon size={28} />
      </div>
      <span className="text-[9px] uppercase font-black text-center tracking-tighter leading-tight text-gray-600">
        {label}
      </span>
    </button>
  );
};

// --- MAIN COMPONENT: ECOTRACK ---
const EcoTrack = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [db, setDb] = useState(null);
  const [userBadges, setUserBadges] = useState([]);
  const [isLogOpen, setIsLogOpen] = useState(false);

  const iconMap = {
    "Sparkles": Sparkles,
    "Car": Car,
    "Zap": Zap,
    "Leaf": Leaf,
    "TreePine": TreePine,
    "Award": Award,
    "ShieldCheck": ShieldCheck,
    "TrendingUp": TrendingUp
  };

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem("token");
      const headers = { "Authorization": `Bearer ${token}` };

      // 1. Fetch Dashboard Stats
      const dbRes = await fetch("http://localhost:8080/api/dashboard?period=weekly", { headers });
      if (dbRes.ok) {
        const data = await dbRes.json();
        setDb(data);
      }

      // 2. Fetch User Badges
      const badgeRes = await fetch("http://localhost:8080/api/badges/current", { headers });
      if (badgeRes.ok) {
        const badgeData = await badgeRes.json();
        // Only keep earned ones for the sidebar
        setUserBadges(badgeData.filter(b => b.earned));
      }

    } catch (error) {
      console.error("Failed to fetch dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) return <div className="flex h-screen items-center justify-center text-emerald-600 font-bold">Loading Dashboard...</div>;

  const weeklyTrend = db?.weeklyTrend?.map(p => p.amount) || [0,0,0,0,0,0,0];
  
  const categories = [
    { label: "Transport", value: `${db?.categoryBreakdown?.Transport || 0} kg`, change: "+12.2%", icon: Car, data: [40, 60, 45, 70, 50, 65, 55], color: "rose" },
    { label: "Food & Diet", value: `${db?.categoryBreakdown?.Food || 0} kg`, change: "-2.4%", icon: Utensils, data: [30, 25, 35, 20, 30, 25, 20], color: "emerald" },
    { label: "Energy Usage", value: `${db?.categoryBreakdown?.Energy || 0} kg`, change: "+1.8%", icon: Zap, data: [60, 55, 65, 60, 70, 65, 60], color: "rose" },
  ];

  const activities = db?.recentActivities?.length > 0 ? db.recentActivities : [];

  return (
    <div className="flex min-h-screen bg-[#F8FAF9] font-sans text-slate-700">
      <main className="flex-1">
        <div className="p-8 max-w-7xl mx-auto">
          <section className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800">Welcome back, {db?.userName?.split(' ')[0] || "Eco Warrior"}!</h1>
            <p className="text-gray-500 mt-1">Here's your environmental impact summary for this week.</p>
          </section>

          <div className="grid grid-cols-12 gap-6 mb-8">
            <div className="col-span-12 lg:col-span-8 grid grid-cols-2 gap-6">
                <div className="bg-[#EDF5ED] p-8 rounded-[32px] relative overflow-hidden flex flex-col justify-center">
                    <p className="text-sm font-semibold text-gray-600">Total Footprint</p>
                    <h2 className="text-4xl font-black text-gray-800 mt-2">{db?.totalCarbonKg || 0} <span className="text-lg font-medium text-gray-500">kg CO2e</span></h2>
                    <p className={`text-xs font-bold mt-3 ${db?.monthlyChangePercent > 0 ? 'text-rose-500' : 'text-emerald-600'}`}>
                      {db?.monthlyChangePercent > 0 ? '↑' : '↓'} {Math.abs(db?.monthlyChangePercent || 0)}% from previous week
                    </p>
                    <Leaf className="absolute -right-6 -bottom-6 w-32 h-32 text-emerald-600/10 rotate-12" />
                </div>
                
                <div className="bg-white border border-gray-100 p-8 rounded-[32px] flex flex-col justify-center">
                    <p className="text-sm font-bold text-gray-800 mb-4">Quick Actions</p>
                    <div className="flex gap-3">
                        <button onClick={() => setIsLogOpen(true)} className="flex-1 flex items-center justify-center gap-2 border border-gray-200 py-2.5 rounded-xl text-xs font-bold hover:bg-gray-50 transition-colors">
                            <Plus size={14}/> Add Log
                        </button>
                        <button onClick={() => navigate("/goals")} className="flex-1 flex items-center justify-center gap-2 border border-gray-200 py-2.5 rounded-xl text-xs font-bold hover:bg-gray-50 transition-colors">
                            <TrendingUp size={14}/> New Goal
                        </button>
                    </div>
                </div>
            </div>

            <div className="col-span-12 lg:col-span-4 bg-white border border-gray-100 p-8 rounded-[32px]">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-gray-800">Active Goals</h3>
                <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-full font-bold uppercase">Tracking</span>
              </div>
              <div className="flex justify-between text-xs font-bold mb-2 text-gray-600">
                <span>Monthly Reduction Goal</span>
                <span className="text-emerald-600">65%</span>
              </div>
              <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden mb-4">
                <div className="bg-emerald-500 h-full w-[65%]"></div>
              </div>
              <p className="text-[11px] text-gray-400 leading-relaxed mb-5">Current Leaderboard: <span className="text-emerald-600 font-bold">#{db?.leaderboardRank || "Top 10"}</span></p>
              <button onClick={() => navigate("/goals")} className="w-full py-2.5 bg-gray-50 text-gray-600 rounded-xl text-xs font-bold hover:bg-gray-100 transition-colors">Manage All Goals</button>
            </div>
          </div>

          <h3 className="font-bold text-gray-800 mb-4">Category Breakdown</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {categories.map((cat, i) => (
              <CategoryCard key={i} {...cat} />
            ))}
          </div>

          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-12 lg:col-span-8 bg-white border border-gray-100 rounded-[32px] p-8">
              <div className="flex justify-between items-start mb-2">
                <div>
                    <h3 className="font-bold text-gray-800">Emission Trend</h3>
                    <p className="text-xs text-gray-400 mt-0.5">Visualizing your carbon output over the last 7 days.</p>
                </div>
              </div>
              <SmoothTrendChart data={weeklyTrend} />
            </div>

            {/* --- DYNAMIC BADGE SIDEBAR --- */}
            <div className="col-span-12 lg:col-span-4 bg-white border border-gray-100 rounded-[32px] p-8">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-gray-800">Eco Badges ({userBadges.length})</h3>
                <button onClick={() => navigate("/badges")} className="text-[10px] font-black text-emerald-600 hover:underline">VIEW ALL</button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                  {userBadges.length > 0 ? (
                    userBadges.slice(0, 4).map((badge, i) => {
                      const Icon = iconMap[badge.iconName] || Award;
                      return (
                        <BadgeItem 
                          key={i} 
                          icon={Icon} 
                          label={badge.name} 
                          color={`${badge.bgColor} ${badge.color.replace("bg-", "text-")}`} 
                          onClick={() => navigate("/badges")} 
                        />
                      )
                    })
                  ) : (
                    <div className="col-span-2 py-8 text-center border-2 border-dashed border-gray-100 rounded-[24px]">
                       <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">No badges earned</p>
                       <button onClick={() => navigate("/survey")} className="mt-2 text-[10px] text-emerald-600 font-black">TAKE SURVEY</button>
                    </div>
                  )}
              </div>
            </div>
          </div>

          {/* Activity Table */}
          <div className="mt-8 bg-white border border-gray-100 rounded-[32px] p-8">
            <div className="flex justify-between items-center mb-8">
                <h3 className="font-bold text-gray-800">Recent Activity</h3>
                <button onClick={() => navigate("/history")} className="text-xs text-emerald-600 font-bold hover:underline">View All History</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-gray-400 text-[10px] uppercase tracking-widest border-b border-gray-50">
                    <th className="pb-5 font-bold">Date</th>
                    <th className="pb-5 font-bold">Category</th>
                    <th className="pb-5 font-bold">Description</th>
                    <th className="pb-5 font-bold text-right">Emission</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {activities.length > 0 ? activities.map((row, i) => (
                    <tr key={i} className="group hover:bg-gray-50/50 transition-colors">
                      <td className="py-5 text-sm text-gray-500">{row.date}</td>
                      <td className="py-5">
                          <span className="px-3 py-1 bg-gray-100 text-[10px] rounded-full font-bold text-gray-500">{row.category}</span>
                      </td>
                      <td className="py-5 text-sm font-semibold text-gray-700">{row.description}</td>
                      <td className="py-5 text-right font-bold text-gray-800 flex items-center justify-end gap-2">
                        {row.emissionAmount} kg
                        <MoreHorizontal size={14} className="text-gray-300 cursor-pointer" />
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="4" className="py-10 text-center text-gray-400 text-xs italic">No activities logged yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
          
          <footer className="mt-12 py-6 text-center border-t border-gray-100">
            <p className="text-[10px] text-gray-400">© 2026 EcoTrack • Environmentally Conscious Tracking</p>
          </footer>
        </div>
      </main>

      <LogActivityModal 
        isOpen={isLogOpen} 
        onClose={() => setIsLogOpen(false)} 
        onRefresh={fetchDashboardData} 
      />
    </div>
  );
};

export default EcoTrack;