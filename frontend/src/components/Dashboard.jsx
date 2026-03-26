import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import LogActivityModal from "./LogActivityModal";
import {
  Leaf, Zap, Car, Plus, Utensils, TrendingUp,
  MoreHorizontal, Award, Sparkles, ShieldCheck, TreePine, ChevronRight
} from "lucide-react";

// --- Sub-Component: Smooth Area Chart with Hover Tooltips ---
const SmoothTrendChart = ({ data }) => {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  if (!data || data.length === 0) return (
    <div className="w-full h-48 flex items-center justify-center text-gray-400 text-sm italic mt-4">
      No trend data yet — log entries to see your chart
    </div>
  );

  const max = Math.max(...data, 1);
  const width = 300;
  const height = 100;
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  const points = data.map((val, i) => ({
    x: (i / (data.length - 1)) * width,
    y: height - ((val / max) * 80),
    value: val
  }));

  const pathData = points.reduce((acc, point, i, arr) => {
    if (i === 0) return `M ${point.x},${point.y}`;
    const prev = arr[i - 1];
    const cx = (prev.x + point.x) / 2;
    return `${acc} C ${cx},${prev.y} ${cx},${point.y} ${point.x},${point.y}`;
  }, "");

  const areaData = `${pathData} L ${width},${height} L 0,${height} Z`;

  return (
    <div className="w-full h-56 relative mt-4 group">
      {/* Tooltip Popup */}
      {hoveredIndex !== null && (
        <div 
          className="absolute z-10 bg-gray-900 text-white text-[10px] px-2 py-1.5 rounded-lg shadow-xl pointer-events-none -translate-x-1/2 -translate-y-12 transition-all duration-200 border border-white/10"
          style={{ 
            left: `${(hoveredIndex / (data.length - 1)) * 100}%`, 
            top: `${points[hoveredIndex].y}%` 
          }}
        >
          <div className="flex flex-col items-center">
            <span className="text-emerald-400 font-black">{points[hoveredIndex].value} kg</span>
            <span className="text-[8px] text-gray-400 uppercase">{days[hoveredIndex]}</span>
          </div>
        </div>
      )}

      <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" className="w-full h-full overflow-visible">
        <defs>
          <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
          </linearGradient>
        </defs>
        
        <path d={areaData} fill="url(#trendGrad)" className="transition-all duration-500" />
        <path d={pathData} fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" />

        {hoveredIndex !== null && (
          <line x1={points[hoveredIndex].x} y1="0" x2={points[hoveredIndex].x} y2={height} stroke="#10b981" strokeWidth="1" strokeDasharray="4" />
        )}

        {hoveredIndex !== null ? (
          <circle cx={points[hoveredIndex].x} cy={points[hoveredIndex].y} r="4" fill="#10b981" stroke="white" strokeWidth="2" />
        ) : (
          <circle cx={points[points.length - 1].x} cy={points[points.length - 1].y} r="3" fill="#10b981" stroke="white" strokeWidth="1" />
        )}

        {points.map((p, i) => (
          <rect key={i} x={i === 0 ? 0 : p.x - (width / (data.length - 1) / 2)} y="0" width={width / (data.length - 1)} height={height} fill="transparent" className="cursor-pointer"
            onMouseEnter={() => setHoveredIndex(i)} onMouseLeave={() => setHoveredIndex(null)} />
        ))}
      </svg>

      <div className="flex justify-between mt-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">
        {days.map((day, i) => (
          <span key={day} className={hoveredIndex === i ? "text-emerald-600 scale-110 transition-transform" : ""}>{day}</span>
        ))}
      </div>
    </div>
  );
};

// --- Sub-Component: Interactive Category Card ---
const CategoryCard = ({ label, value, change, icon: Icon, data, color, isActive, onClick }) => (
  <div 
    onClick={onClick}
    className={`group cursor-pointer transition-all duration-300 border p-6 rounded-[32px] relative overflow-hidden ${
      isActive 
        ? "bg-emerald-50 border-emerald-200 ring-4 ring-emerald-500/5 scale-[1.02] shadow-xl" 
        : "bg-white border-gray-100 hover:border-emerald-100 hover:shadow-md"
    }`}
  >
    <div className="flex justify-between items-start mb-5 relative z-10">
      <div className={`p-2.5 rounded-xl transition-colors ${isActive ? "bg-emerald-600 text-white" : "bg-gray-50 text-emerald-600"}`}>
        <Icon size={20} />
      </div>
      <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${
        color === "rose" ? "bg-rose-50 text-rose-500" : "bg-emerald-50 text-emerald-600"
      }`}>
        {change}
      </span>
    </div>
    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider relative z-10">{label}</p>
    <p className="text-2xl font-black text-gray-800 mt-1 relative z-10">{value}</p>
    
    <div className="flex gap-1.5 mt-5 h-10 items-end relative z-10">
      {data.map((h, i) => (
        <div key={i} 
          className={`flex-1 rounded-sm transition-all duration-500 ${
            isActive ? "bg-emerald-500" : (h > 50 ? "bg-rose-400" : "bg-emerald-400")
          }`}
          style={{ height: `${h}%` }} 
        />
      ))}
    </div>
    {isActive && <div className="absolute top-0 right-0 p-4"><ChevronRight size={16} className="text-emerald-400" /></div>}
  </div>
);

const BadgeItem = ({ icon: Icon, label, color, onClick }) => {
  const [bgClass, textClass] = color.split(" ");
  return (
    <button onClick={onClick}
      className={`flex flex-col items-center justify-center p-5 rounded-[24px] ${bgClass || "bg-emerald-100"} border border-white shadow-sm hover:scale-105 hover:shadow-md transition-all cursor-pointer w-full`}>
      <div className={`mb-3 ${textClass || "text-emerald-600"}`}><Icon size={28} /></div>
      <span className="text-[9px] uppercase font-black text-center tracking-tighter leading-tight text-gray-600">{label}</span>
    </button>
  );
};

const ICON_MAP = { Sparkles, Car, Zap, Leaf, TreePine, Award, ShieldCheck, TrendingUp };

// --- Main Dashboard Component ---
const EcoTrack = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [db, setDb] = useState(null);
  const [userBadges, setUserBadges] = useState([]);
  const [isLogOpen, setIsLogOpen] = useState(false);
  const [period, setPeriod] = useState("weekly");
  const [activeCategory, setActiveCategory] = useState(null);

  const fetchDashboard = useCallback(async (p = period) => {
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };
      const [dbRes, badgeRes] = await Promise.all([
        fetch(`http://localhost:8080/api/dashboard?period=${p}`, { headers }),
        fetch("http://localhost:8080/api/badges/current", { headers }),
      ]);
      if (dbRes.ok) setDb(await dbRes.json());
      if (badgeRes.ok) {
        const bd = await badgeRes.json();
        setUserBadges(Array.isArray(bd) ? bd.filter(b => b.earned) : []);
      }
    } catch (err) {
      console.error("Dashboard fetch failed:", err);
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => { fetchDashboard(period); }, [fetchDashboard, period]);

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-white">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-emerald-600 font-bold text-sm tracking-widest uppercase">Loading Insights</p>
      </div>
    </div>
  );

  const weeklyTrend = db?.weeklyTrend?.map(p => p.amount) || [];
  const breakdown = db?.categoryBreakdown || {};

  const categories = [
    { id: "Transport", label: "Transport", value: `${breakdown.Transport || 0} kg`, change: "+12.2%", icon: Car, data: [40,60,45,70,50,65,55], color: "rose" },
    { id: "Food", label: "Food & Diet", value: `${breakdown.Food || 0} kg`, change: "-2.4%", icon: Utensils, data: [30,25,35,20,30,25,20], color: "emerald" },
    { id: "Energy", label: "Energy Usage", value: `${breakdown.Energy || 0} kg`, change: "+1.8%", icon: Zap, data: [60,55,65,60,70,65,60], color: "rose" },
  ];

  const activities = Array.isArray(db?.recentActivities) ? db.recentActivities : [];

  return (
    <div className="flex min-h-screen bg-[#F8FAF9] font-sans text-slate-700">
      <main className="flex-1">
        <div className="p-8 max-w-7xl mx-auto">
          {/* Header */}
          <section className="mb-10 flex justify-between items-end">
            <div>
              <h1 className="text-4xl font-black text-gray-900 tracking-tight">
                Hey {db?.userName?.split(" ")[0] || "Eco Warrior"}!
              </h1>
              <p className="text-gray-500 mt-2 font-medium">Tracking your carbon footprint in Chennai.</p>
            </div>
            <div className="hidden md:block text-right">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Global Rank</p>
              <p className="text-xl font-black text-emerald-600">#1,240</p>
            </div>
          </section>

          {/* Top Row Cards */}
          <div className="grid grid-cols-12 gap-6 mb-10">
            <div className="col-span-12 lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-[#EDF5ED] p-8 rounded-[40px] relative overflow-hidden flex flex-col justify-center border border-emerald-100 shadow-sm">
                <div className="flex gap-1 mb-6 relative z-10">
                  {["daily","weekly","monthly"].map(p => (
                    <button key={p} onClick={() => setPeriod(p)}
                      className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase transition-all ${
                        period === p ? "bg-emerald-600 text-white shadow-lg" : "bg-white/60 text-emerald-700 hover:bg-white"
                      }`}>{p}</button>
                  ))}
                </div>
                <p className="text-sm font-bold text-emerald-800/60 uppercase tracking-widest">
                  {period} Footprint
                </p>
                <h2 className="text-5xl font-black text-gray-900 mt-2">
                  {db?.periodCarbonKg ?? 0} <span className="text-lg font-bold text-emerald-700/40">kg CO₂e</span>
                </h2>
                <div className="mt-6 flex items-center gap-4 relative z-10">
                   <p className={`text-xs font-black px-2 py-1 rounded-lg ${db?.monthlyChangePercent > 0 ? "bg-rose-100 text-rose-600" : "bg-emerald-100 text-emerald-600"}`}>
                    {db?.monthlyChangePercent > 0 ? "↑" : "↓"} {Math.abs(db?.monthlyChangePercent || 0)}%
                  </p>
                  <p className="text-[11px] text-emerald-800/40 font-bold uppercase">vs last {period}</p>
                </div>
                <Leaf className="absolute -right-8 -bottom-8 w-48 h-48 text-emerald-600/5 rotate-12" />
              </div>

              <div className="bg-white border border-gray-100 p-8 rounded-[40px] flex flex-col justify-center shadow-sm">
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6">Quick Actions</p>
                <div className="grid grid-cols-2 gap-4">
                  <button onClick={() => setIsLogOpen(true)}
                    className="flex flex-col items-center justify-center gap-3 bg-gray-900 text-white py-6 rounded-[24px] hover:bg-emerald-600 transition-all group">
                    <Plus size={20} className="group-hover:rotate-90 transition-transform" /> 
                    <span className="text-[10px] font-black uppercase">Add Log</span>
                  </button>
                  <button onClick={() => navigate("/goals")}
                    className="flex flex-col items-center justify-center gap-3 bg-white border-2 border-gray-100 py-6 rounded-[24px] hover:border-emerald-500 transition-all">
                    <TrendingUp size={20} className="text-emerald-500" />
                    <span className="text-[10px] font-black uppercase text-gray-600">New Goal</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="col-span-12 lg:col-span-4 bg-white border border-gray-100 p-8 rounded-[40px] shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-black text-gray-900 uppercase text-xs tracking-widest">Active Goals</h3>
                <Award size={18} className="text-emerald-500" />
              </div>
              {db?.activeGoals > 0 ? (
                <>
                  <div className="flex justify-between text-[11px] font-black mb-3 text-gray-500 uppercase tracking-tighter">
                    <span>Overall Progress</span>
                    <span className="text-emerald-600">
                      {db?.completedGoals > 0 ? Math.round((db.completedGoals/(db.activeGoals+db.completedGoals))*100) : 0}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden mb-6">
                    <div className="bg-emerald-500 h-full transition-all duration-1000 shadow-[0_0_12px_rgba(16,185,129,0.4)]"
                      style={{ width: `${db?.completedGoals > 0 ? Math.round((db.completedGoals/(db.activeGoals+db.completedGoals))*100) : 0}%` }} />
                  </div>
                  <div className="space-y-3">
                     <div className="flex justify-between p-3 bg-gray-50 rounded-2xl border border-gray-100">
                        <span className="text-[10px] font-bold text-gray-500">Active Tasks</span>
                        <span className="text-[10px] font-black text-gray-900">{db?.activeGoals}</span>
                     </div>
                  </div>
                </>
              ) : (
                <div className="py-10 text-center">
                  <p className="text-xs text-gray-400 italic font-medium">No active goals found.</p>
                </div>
              )}
              <button onClick={() => navigate("/goals")} className="w-full mt-6 py-4 bg-gray-50 text-gray-600 rounded-2xl text-[10px] font-black uppercase hover:bg-gray-100 transition-colors tracking-widest">
                Manage All Goals
              </button>
            </div>
          </div>

          {/* Category Breakdown Section */}
          <div className="mb-4 flex items-center justify-between">
             <h3 className="font-black text-gray-900 uppercase text-xs tracking-widest">Category Analysis</h3>
             {activeCategory && <button onClick={() => setActiveCategory(null)} className="text-[10px] font-black text-emerald-600 underline">CLEAR SELECTION</button>}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {categories.map((cat) => (
              <CategoryCard key={cat.id} {...cat} isActive={activeCategory === cat.id} onClick={() => setActiveCategory(cat.id === activeCategory ? null : cat.id)} />
            ))}
          </div>

          {/* Category Deep Dive (Conditional) */}
          {activeCategory && (
            <div className="mb-10 p-8 bg-gray-900 text-white rounded-[40px] animate-in fade-in zoom-in duration-300 shadow-2xl relative overflow-hidden">
               <div className="relative z-10 flex flex-col md:flex-row justify-between gap-6">
                  <div>
                    <h4 className="text-2xl font-black">Deep Dive: {activeCategory}</h4>
                    <p className="text-gray-400 text-sm mt-1">Optimization tips to reduce your {activeCategory.toLowerCase()} footprint.</p>
                  </div>
                  <div className="flex gap-4">
                     <div className="bg-white/5 border border-white/10 p-4 rounded-3xl min-w-[120px]">
                        <p className="text-[10px] font-black text-emerald-400 uppercase">Daily Avg</p>
                        <p className="text-xl font-black">2.4 kg</p>
                     </div>
                     <div className="bg-white/5 border border-white/10 p-4 rounded-3xl min-w-[120px]">
                        <p className="text-[10px] font-black text-rose-400 uppercase">Peak Day</p>
                        <p className="text-xl font-black">Wednesday</p>
                     </div>
                  </div>
               </div>
               <Sparkles className="absolute top-0 right-0 w-64 h-64 text-emerald-500/5 -translate-y-12 translate-x-12" />
            </div>
          )}

          {/* Trend Chart & Badges Row */}
          <div className="grid grid-cols-12 gap-6 mb-10">
            <div className="col-span-12 lg:col-span-8 bg-white border border-gray-100 rounded-[40px] p-10 shadow-sm">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="font-black text-gray-900 uppercase text-xs tracking-widest">Emission Trend</h3>
                  <p className="text-[11px] text-gray-400 font-medium mt-1 uppercase tracking-tighter">Your daily CO2 output</p>
                </div>
                <button onClick={() => navigate("/history")} className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-4 py-2 rounded-full hover:bg-emerald-100 transition-colors uppercase">Full History</button>
              </div>
              <SmoothTrendChart data={weeklyTrend} />
            </div>

            

            <div className="col-span-12 lg:col-span-4 bg-white border border-gray-100 rounded-[40px] p-10 shadow-sm">
              <div className="flex justify-between items-center mb-8">
                <h3 className="font-black text-gray-900 uppercase text-xs tracking-widest">Eco Badges ({userBadges.length})</h3>
                <button onClick={() => navigate("/badges")} className="text-[10px] font-black text-emerald-600 underline uppercase tracking-widest">View All</button>
              </div>
              <div className="grid grid-cols-2 gap-5">
                {userBadges.length > 0 ? (
                  userBadges.slice(0, 4).map((badge, i) => {
                    const Icon = ICON_MAP[badge.iconName] || Award;
                    return (
                      <BadgeItem key={i} icon={Icon} label={badge.name} color={`${badge.bgColor} ${badge.color}`} onClick={() => navigate("/badges")} />
                    );
                  })
                ) : (
                  <div className="col-span-2 py-10 text-center border-2 border-dashed border-gray-100 rounded-[32px]">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Unlock your first badge</p>
                    <button onClick={() => navigate("/survey")} className="mt-3 text-[10px] text-emerald-600 font-black underline uppercase">TAKE SURVEY</button>
                  </div>
                )}
              </div>
            </div>
          </div>

          


          {/* Activity Table */}
          <div className="bg-white border border-gray-100 rounded-[40px] p-10 shadow-sm overflow-hidden">
            <div className="flex justify-between items-center mb-10">
              <h3 className="font-black text-gray-900 uppercase text-xs tracking-widest">Recent Activity</h3>
              <button onClick={() => navigate("/history")} className="text-[10px] font-black text-gray-400 hover:text-emerald-600 uppercase tracking-widest transition-colors">Audit Full Logs →</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-gray-400 text-[10px] uppercase tracking-[0.2em] border-b border-gray-50">
                    <th className="pb-6 font-black">Timestamp</th>
                    <th className="pb-6 font-black">Type</th>
                    <th className="pb-6 font-black">Activity Description</th>
                    <th className="pb-6 font-black text-right">Impact</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {activities.length > 0 ? activities.map((row, i) => (
                    <tr key={i} className="group hover:bg-emerald-50/30 transition-all cursor-default">
                      <td className="py-6 text-sm text-gray-400 font-medium">{row.date}</td>
                      <td className="py-6">
                        <span className="px-4 py-1.5 bg-gray-100 text-[9px] rounded-full font-black text-gray-500 uppercase tracking-tighter group-hover:bg-white transition-colors">{row.category}</span>
                      </td>
                      <td className="py-6 text-sm font-bold text-gray-800 max-w-[300px] truncate">{row.description}</td>
                      <td className="py-6 text-right font-black text-gray-900">
                        <div className="flex items-center justify-end gap-3">
                          {row.emissionAmount} <span className="text-[10px] text-gray-400 font-bold">kg</span>
                          <MoreHorizontal size={14} className="text-gray-200 group-hover:text-emerald-300 transition-colors" />
                        </div>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="4" className="py-20 text-center text-gray-400 text-xs italic font-medium tracking-tight">
                        Log your first activity to start seeing data.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <footer className="mt-16 py-10 text-center border-t border-gray-100">
            <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.3em]">EcoTrack Terminal v2.0 • 2026</p>
          </footer>
        </div>
      </main>

      <LogActivityModal isOpen={isLogOpen} onClose={() => setIsLogOpen(false)} onRefresh={() => fetchDashboard(period)} />
    </div>
  );
};

export default EcoTrack;