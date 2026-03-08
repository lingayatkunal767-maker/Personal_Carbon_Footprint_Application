import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  LogOut, Leaf, Zap, Car, LayoutDashboard, 
  ClipboardList, History, Settings, Search, 
  Bell, Plus, Utensils, TrendingUp, MoreHorizontal
} from "lucide-react";

// --- NEW SUB-COMPONENT: SMOOTH TREND CHART ---
const SmoothTrendChart = ({ data }) => {
  // Normalize data points for a 300x100 coordinate system
  const points = data.map((val, i) => ({
    x: (i / (data.length - 1)) * 300,
    y: 100 - val // Invert because SVG y-axis goes down
  }));

  // Create the path string for the smooth line
  const pathData = points.reduce((acc, point, i, str) => {
    if (i === 0) return `M ${point.x},${point.y}`;
    // Simple smoothing using curve logic
    const prev = str[i - 1];
    const cx = (prev.x + point.x) / 2;
    return `${acc} C ${cx},${prev.y} ${cx},${point.y} ${point.x},${point.y}`;
  }, "");

  // Path for the filled area (must close the shape at the bottom)
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
        {/* The Filled Area */}
        <path d={areaData} fill="url(#gradient)" />
        {/* The Main Line */}
        <path d={pathData} fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" />
        
        {/* Active Point Indicator (last point) */}
        <circle 
          cx={points[points.length - 1].x} 
          cy={points[points.length - 1].y} 
          r="3" 
          fill="#10b981" 
          stroke="white" 
          strokeWidth="1" 
        />
      </svg>
      
      {/* X-Axis Labels */}
      <div className="flex justify-between mt-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">
        <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
      </div>
    </div>
  );
};

const EcoTrack = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState({ name: "Alex", email: "alex@eco.com" });
  const [footprintData, setFootprintData] = useState({
    total: "450.5",
    transport: "142",
    food: "98",
    energy: "210"
  });

  // Mock data for the 7-day trend
  const weeklyTrend = [40, 55, 35, 75, 50, 60, 45];

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
    if (storedUser.username || storedUser.name) {
      setUser({
        name: storedUser.username || storedUser.name,
        email: storedUser.email || "user@email.com"
      });
    }
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  const categories = [
    { label: "Transport", value: `${footprintData.transport} kg`, change: "+12.2%", icon: Car, data: [40, 60, 45, 70, 50, 65, 55], color: "rose" },
    { label: "Food & Diet", value: `${footprintData.food} kg`, change: "-2.4%", icon: Utensils, data: [30, 25, 35, 20, 30, 25, 20], color: "emerald" },
    { label: "Energy Usage", value: `${footprintData.energy} kg`, change: "+1.8%", icon: Zap, data: [60, 55, 65, 60, 70, 65, 60], color: "rose" },
  ];

  const recentActivity = [
    { date: "May 12, 2024", category: "Transport", desc: "Commute to Office", emission: "12.4 kg" },
    { date: "May 11, 2024", category: "Energy", desc: "Monthly Electricity Bill", emission: "85.0 kg" },
    { date: "May 10, 2024", category: "Food", desc: "Grocery Shopping", emission: "4.2 kg" },
    { date: "May 09, 2024", category: "Transport", desc: "Weekend Road Trip", emission: "45.8 kg" },
    { date: "May 08, 2024", category: "Food", desc: "Dining Out", emission: "8.1 kg" },
  ];

  return (
    <div className="flex min-h-screen bg-[#F8FAF9] font-sans text-slate-700">
      <main className="flex-1">
        <div className="p-8 max-w-7xl mx-auto">
          {/* Welcome Section */}
          <section className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800">Welcome back, {user.name.split(' ')[0]}!</h1>
            <p className="text-gray-500 mt-1">Here's your environmental impact summary for this week.</p>
          </section>

          {/* Top Cards Row */}
          <div className="grid grid-cols-12 gap-6 mb-8">
            <div className="col-span-12 lg:col-span-8 grid grid-cols-2 gap-6">
                <div className="bg-[#EDF5ED] p-8 rounded-[32px] relative overflow-hidden flex flex-col justify-center">
                    <p className="text-sm font-semibold text-gray-600">Total Footprint</p>
                    <h2 className="text-4xl font-black text-gray-800 mt-2">{footprintData.total} <span className="text-lg font-medium text-gray-500">kg CO2e</span></h2>
                    <p className="text-xs text-rose-500 font-bold mt-3">↑ +12% from previous week</p>
                    <Leaf className="absolute -right-6 -bottom-6 w-32 h-32 text-emerald-600/10 rotate-12" />
                </div>
                
                <div className="bg-white border border-gray-100 p-8 rounded-[32px] flex flex-col justify-center">
                    <p className="text-sm font-bold text-gray-800 mb-4">Quick Actions</p>
                    <div className="flex gap-3">
                        <button onClick={() => navigate("/survey")} className="flex-1 flex items-center justify-center gap-2 border border-gray-200 py-2.5 rounded-xl text-xs font-bold hover:bg-gray-50 transition-colors">
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
                <h3 className="font-bold text-gray-800">Monthly Goal</h3>
                <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-full font-bold uppercase">Active</span>
              </div>
              <div className="flex justify-between text-xs font-bold mb-2 text-gray-600">
                <span>Reduce transport emission by 20%</span>
                <span className="text-emerald-600">65%</span>
              </div>
              <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden mb-4">
                <div className="bg-emerald-500 h-full w-[65%]"></div>
              </div>
              <p className="text-[11px] text-gray-400 leading-relaxed mb-5">You've saved <span className="text-emerald-600 font-bold">34kg CO2e</span> so far. Keep it up!</p>
              <button onClick={() => navigate("/goals")} className="w-full py-2.5 bg-gray-50 text-gray-600 rounded-xl text-xs font-bold hover:bg-gray-100 transition-colors">Manage Goals</button>
            </div>
          </div>

          {/* Category Breakdown */}
          <h3 className="font-bold text-gray-800 mb-4">Category Breakdown</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {categories.map((cat, i) => (
              <CategoryCard key={i} {...cat} />
            ))}
          </div>

          {/* Emission Trend Section - REPLACED WITH SMOOTH CHART */}
          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-12 lg:col-span-8 bg-white border border-gray-100 rounded-[32px] p-8">
              <div className="flex justify-between items-start mb-2">
                <div>
                    <h3 className="font-bold text-gray-800">Emission Trend</h3>
                    <p className="text-xs text-gray-400 mt-0.5">Visualizing your carbon output over the last 7 days.</p>
                </div>
                <div className="flex gap-1.5 items-center">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Current Range</span>
                </div>
              </div>
              
              {/* Using the new Smooth Chart component */}
              <SmoothTrendChart data={weeklyTrend} />
            </div>

            <div className="col-span-12 lg:col-span-4 bg-white border border-gray-100 rounded-[32px] p-8">
              <h3 className="font-bold text-gray-800 mb-6">Eco Badges</h3>
              <div className="grid grid-cols-2 gap-4">
                  <BadgeItem icon={Car} label="Transport Pro" color="bg-blue-50 text-blue-500" onClick={() => navigate("/badges/transport")} />
                  <BadgeItem icon={Zap} label="Energy Saver" color="bg-yellow-50 text-yellow-600" onClick={() => navigate("/badges/energy")} />
                  <BadgeItem icon={Leaf} label="Tree Planter" color="bg-emerald-50 text-emerald-500" onClick={() => navigate("/badges/tree")} />
                  <BadgeItem icon={TrendingUp} label="Eco Master" color="bg-purple-50 text-purple-500" onClick={() => navigate("/badges/master")} />
              </div>
              <div className="mt-8 p-4 bg-gray-50 rounded-2xl italic text-[11px] text-center text-gray-400 leading-relaxed">
                "The greatest threat to our planet is the belief that someone else will save it."
              </div>
            </div>
          </div>

          {/* Recent Activity Table */}
          <div className="mt-8 bg-white border border-gray-100 rounded-[32px] p-8">
            <div className="flex justify-between items-center mb-8">
                <h3 className="font-bold text-gray-800">Recent Activity</h3>
                <button onClick={() => navigate("/history")} className="text-xs text-emerald-600 font-bold hover:underline">View All History</button>
            </div>
            <table className="w-full text-left">
              <thead>
                <tr className="text-gray-400 text-[10px] uppercase tracking-widest border-b border-gray-50">
                  <th className="pb-5 font-bold">Date</th>
                  <th className="pb-5 font-bold">Category</th>
                  <th className="pb-5 font-bold">Activity Description</th>
                  <th className="pb-5 font-bold text-right">Emission</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recentActivity.map((row, i) => (
                  <tr key={i} className="group hover:bg-gray-50/50 transition-colors">
                    <td className="py-5 text-sm text-gray-500">{row.date}</td>
                    <td className="py-5">
                        <span className="px-3 py-1 bg-gray-100 text-[10px] rounded-full font-bold text-gray-500">{row.category}</span>
                    </td>
                    <td className="py-5 text-sm font-semibold text-gray-700">{row.desc}</td>
                    <td className="py-5 text-right font-bold text-gray-800 flex items-center justify-end gap-2">
                      {row.emission}
                      <MoreHorizontal size={14} className="text-gray-300 cursor-pointer" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <footer className="mt-12 py-6 text-center border-t border-gray-100">
            <p className="text-[10px] text-gray-400">© 2026 EcoTrack • Environmentally Conscious Tracking</p>
          </footer>
        </div>
      </main>
    </div>
  );
};

// --- SUB-COMPONENTS ---
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
        <div 
          key={i} 
          className={`flex-1 rounded-sm ${h > 50 ? 'bg-rose-400' : 'bg-emerald-400'}`} 
          style={{ height: `${h}%` }}
        ></div>
      ))}
    </div>
  </div>
);

const BadgeItem = ({ icon: Icon, label, color, onClick }) => (
  <button
    onClick={onClick}
    className={`flex flex-col items-center justify-center p-5 rounded-[24px] 
    ${color.split(" ")[0]} border border-white shadow-sm
    hover:scale-105 hover:shadow-md 
    transition-all duration-200 cursor-pointer`}
  >
    <div className={`mb-3 ${color.split(" ")[1]}`}>
      <Icon size={28} />
    </div>
    <span className="text-[9px] uppercase font-black text-center tracking-tighter leading-tight text-gray-600">
      {label}
    </span>
  </button>
);

export default EcoTrack;