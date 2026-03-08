import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Download, UserRoundPen, Calendar, Filter, 
  Table as TableIcon, LineChart as ChartIcon, 
  ChevronLeft, ChevronRight, Leaf, TrendingDown, LayoutDashboard,
  MoreVertical
} from "lucide-react";

const CarbonHistory = () => {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState("table"); // 'table' or 'chart'
  const [dateRange, setDateRange] = useState("2024-05-01 to 2024-05-31");
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  const historyLogs = [
    { date: "2024-05-12", transport: 120, food: 85, energy: 143, total: 348, alert: false },
    { date: "2024-05-05", transport: 145, food: 92, energy: 138, total: 375, alert: true },
    { date: "2024-04-28", transport: 110, food: 80, energy: 150, total: 340, alert: false },
    { date: "2024-04-21", transport: 135, food: 88, energy: 142, total: 365, alert: false },
    { date: "2024-04-14", transport: 125, food: 90, energy: 140, total: 355, alert: false },
  ];

  // Chart Data Constants
  const chartData = [
    { month: 'Jan', value: 310 },
    { month: 'Feb', value: 330 },
    { month: 'Mar', value: 345 },
    { month: 'Apr', value: 320 },
    { month: 'May', value: 348 },
  ];

  return (
    <div className="flex min-h-screen bg-[#F8FAF9] font-sans text-slate-700">
      <main className="flex-1 p-8 max-w-7xl mx-auto">
        
        {/* Header Section */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 tracking-tight">Carbon History</h1>
            <p className="text-gray-500 mt-1">Analyze your environmental progress and historical log data.</p>
          </div>
          <div className="flex gap-3">
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-50 transition-all shadow-sm">
              <Download size={16} /> Export CSV
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition-all shadow-md shadow-emerald-100">
              <UserRoundPen size={16} /> Update Profile
            </button>
          </div>
        </div>

        {/* Toolbar Section */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            {/* Clickable Date Picker */}
            <div className="relative">
              <button 
                onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-100 rounded-xl text-xs font-semibold text-gray-500 shadow-sm hover:border-emerald-500 transition-colors"
              >
                <Calendar size={14} className="text-gray-400" />
                {dateRange}
              </button>
              
              {isDatePickerOpen && (
                <div className="absolute top-12 left-0 z-10 bg-white border border-gray-200 p-4 rounded-2xl shadow-xl w-64 animate-in fade-in zoom-in-95">
                  <p className="text-[10px] font-bold text-gray-400 mb-2 uppercase">Select Range</p>
                  <input 
                    type="date" 
                    className="w-full mb-2 p-2 border border-gray-100 rounded-lg text-xs"
                    onChange={(e) => { setDateRange(e.target.value); setIsDatePickerOpen(false); }}
                  />
                  <button onClick={() => setIsDatePickerOpen(false)} className="w-full py-2 bg-emerald-50 text-emerald-600 text-xs font-bold rounded-lg">Apply Range</button>
                </div>
              )}
            </div>
            
            {/* Category Filters */}
            <div className="flex items-center bg-white p-1 rounded-xl border border-gray-100 shadow-sm">
              <button className="px-4 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 text-white shadow-sm">All Categories</button>
              <button className="px-4 py-1.5 rounded-lg text-xs font-bold text-gray-400 hover:text-gray-600">Transport</button>
              <button className="px-4 py-1.5 rounded-lg text-xs font-bold text-gray-400 hover:text-gray-600">Energy</button>
            </div>
          </div>

          {/* Toggle View Mode */}
          <div className="flex bg-white border border-gray-100 p-1 rounded-xl shadow-sm">
            <button 
              onClick={() => setViewMode("table")}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${viewMode === 'table' ? 'bg-emerald-50 text-emerald-700' : 'text-gray-400'}`}
            >
              <TableIcon size={14} /> Table View
            </button>
            <button 
              onClick={() => setViewMode("chart")}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${viewMode === 'chart' ? 'bg-emerald-50 text-emerald-700' : 'text-gray-400'}`}
            >
              <ChartIcon size={14} /> Trend Chart
            </button>
          </div>
        </div>

        {/* Dynamic Container: Table or Chart */}
        <div className="bg-white border border-gray-100 rounded-[32px] overflow-hidden shadow-sm min-h-[400px]">
          {viewMode === "table" ? (
            <div className="animate-in fade-in duration-500">
              <div className="p-8 flex justify-between items-center border-b border-gray-50">
                <div>
                  <h3 className="font-bold text-gray-800 text-lg">Detailed Logs</h3>
                  <p className="text-xs text-gray-400 mt-0.5">Showing 5 of 128 total records</p>
                </div>
                <p className="text-emerald-600 text-xs font-bold bg-emerald-50 px-3 py-1.5 rounded-full">Efficiency: +12.4% vs last month</p>
              </div>

              <table className="w-full text-left">
                <thead className="bg-gray-50/50">
                  <tr className="text-gray-400 text-[11px] uppercase tracking-[0.1em]">
                    <th className="px-8 py-5 font-bold">Date</th>
                    <th className="px-8 py-5 font-bold">Transport (kg)</th>
                    <th className="px-8 py-5 font-bold">Food (kg)</th>
                    <th className="px-8 py-5 font-bold">Energy (kg)</th>
                    <th className="px-8 py-5 font-bold">Total (kg)</th>
                    <th className="px-8 py-5 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {historyLogs.map((row, i) => (
                    <tr key={i} className="hover:bg-gray-50/30 transition-colors group">
                      <td className="px-8 py-5 text-sm text-gray-500">{row.date}</td>
                      <td className="px-8 py-5 text-sm text-gray-600 font-medium">{row.transport}</td>
                      <td className="px-8 py-5 text-sm text-gray-600 font-medium">{row.food}</td>
                      <td className="px-8 py-5 text-sm text-gray-600 font-medium">{row.energy}</td>
                      <td className="px-8 py-5 text-sm font-black text-gray-800 flex items-center gap-2">
                        {row.total}
                        {row.alert && <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>}
                      </td>
                      <td className="px-8 py-5 text-right">
                        <button className="text-emerald-600 text-xs font-bold hover:underline">View Details</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Pagination */}
              <div className="p-6 border-t border-gray-50 flex justify-between items-center">
                 <p className="text-xs text-gray-400 font-medium font-sans">Showing <span className="text-gray-800 font-bold">1-5</span> of <span className="text-gray-800 font-bold">128</span> entries</p>
                 <div className="flex gap-2">
                    <button className="p-2 border border-gray-100 rounded-lg text-gray-400 hover:bg-gray-50"><ChevronLeft size={16}/></button>
                    <button className="w-8 h-8 rounded-lg bg-emerald-600 text-white text-xs font-bold">1</button>
                    <button className="w-8 h-8 rounded-lg text-gray-400 text-xs font-bold hover:bg-gray-50">2</button>
                    <button className="w-8 h-8 rounded-lg text-gray-400 text-xs font-bold hover:bg-gray-50">3</button>
                    <span className="text-gray-300 px-1">...</span>
                    <button className="w-8 h-8 rounded-lg text-gray-400 text-xs font-bold hover:bg-gray-50">26</button>
                    <button className="p-2 border border-gray-100 rounded-lg text-gray-400 hover:bg-gray-50"><ChevronRight size={16}/></button>
                 </div>
              </div>
            </div>
          ) : (
            /* --- TREND CHART VIEW --- */
            <div className="p-8 animate-in slide-in-from-bottom-4 duration-500">
              <div className="mb-8">
                <h3 className="font-bold text-gray-800 text-lg">Emission Trend</h3>
                <p className="text-xs text-gray-400 mt-0.5">Monthly emission trend over time</p>
              </div>

              {/* SVG Area Chart */}
              <div className="relative h-[300px] w-full">
                <svg viewBox="0 0 800 300" className="w-full h-full">
                  <defs>
                    <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity="0.2" />
                      <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  
                  {/* Grid Lines */}
                  {[0, 75, 150, 225, 300].map(y => (
                    <line key={y} x1="0" y1={y} x2="800" y2={y} stroke="#f1f5f9" strokeWidth="1" />
                  ))}

                  {/* Area Fill */}
                  <path 
                    d="M0,200 Q200,160 400,140 T800,120 L800,300 L0,300 Z" 
                    fill="url(#chartGradient)"
                  />

                  {/* Main Line */}
                  <path 
                    d="M0,200 Q200,160 400,140 T800,120" 
                    fill="none" 
                    stroke="#059669" 
                    strokeWidth="3" 
                  />

                  {/* Data Point */}
                  <circle cx="600" cy="130" r="5" fill="#059669" />
                  <rect x="610" y="110" width="100" height="30" rx="15" fill="#1e293b" />
                  <text x="625" y="130" fill="white" fontSize="10" fontWeight="bold">340 kg CO2e</text>
                </svg>

                {/* X-Axis Labels */}
                <div className="flex justify-between mt-4 px-2">
                  {chartData.map(d => (
                    <span key={d.month} className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{d.month}</span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
           <FooterMetric label="Average Monthly" value="356 kg CO2e" icon={Leaf} />
           <FooterMetric label="Best Category" value="Food & Diet" icon={ChartIcon} color="bg-emerald-50 text-emerald-600" />
           <FooterMetric 
             label="Total Audited" 
             value="2,481 kg" 
             icon={TrendingDown} 
             isMore 
           />
        </div>
        
        <footer className="mt-12 py-6 text-center border-t border-gray-100">
           <p className="text-[10px] text-gray-300 font-bold uppercase tracking-widest">© 2026 EcoTrack • Environmentally Conscious Tracking</p>
        </footer>
      </main>
    </div>
  );
};

const FooterMetric = ({ label, value, icon: Icon, color = "bg-gray-50 text-emerald-500", isMore }) => (
  <div className="bg-white p-6 rounded-[24px] border border-gray-100 flex items-center gap-5 shadow-sm hover:shadow-md transition-shadow">
    <div className={`p-4 rounded-2xl ${color}`}>
      <Icon size={24} />
    </div>
    <div className="flex-1">
      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{label}</p>
      <p className="text-xl font-black text-gray-800 mt-0.5">{value}</p>
    </div>
    {isMore && (
      <button className="p-2 bg-gray-50 rounded-full text-gray-400 hover:text-gray-600">
        <MoreVertical size={16}/>
      </button>
    )}
  </div>
);

export default CarbonHistory;