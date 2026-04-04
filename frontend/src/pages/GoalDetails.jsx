import { useState, useEffect } from "react";
import { 
  ArrowLeft, 
  Edit3, 
  CheckCircle2, 
  Target, 
  TrendingDown, 
  Calendar,
  ChevronRight,
  Clock,
  Zap,
  Car,
  Utensils,
  Trash2,
  Globe,
  Leaf
} from "lucide-react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { apiFetch } from "../utils/api";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";

export default function GoalDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [goal, setGoal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    fetchGoalDetails();
    fetchActivities();
  }, [id]);

  const fetchGoalDetails = async () => {
    try {
      const data = await apiFetch(`/api/goals/${id}`);
      setGoal(data);
    } catch (err) {
      console.error("Failed to fetch goal", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchActivities = async () => {
    try {
      const data = await apiFetch(`/api/goals/${id}/activities`);
      setActivities(data || []);
    } catch (err) {
      console.error("Failed to fetch activities", err);
    }
  };

  const handleCompleteGoal = async () => {
    try {
      await apiFetch(`/api/goals/${id}/complete`, { method: "PUT" });
      alert("Goal Completed successfully! Points added to your leaderboard score.");
      navigate("/goals");
    } catch (err) {
      console.error("Failed to complete goal", err);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (!goal) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 space-y-4">
      <p className="text-slate-500 font-bold">Goal not found</p>
      <button onClick={() => navigate("/dashboard")} className="text-green-600 font-bold hover:underline">Back to Dashboard</button>
    </div>
  );

  const progress = Math.round(goal.progressPercentage);
  const remaining = Math.max(0, goal.targetEmission - goal.currentEmission);

  // Mock data for the chart based on current progress
  const chartData = [
    { name: "Mon", savings: 3 },
    { name: "Tue", savings: 5 },
    { name: "Wed", savings: 6 },
    { name: "Thu", savings: 6 },
    { name: "Fri", savings: 8 },
    { name: "Sat", savings: 10 },
    { name: "Sun", savings: goal.currentEmission || 11.5 },
  ];

  const getCategoryIcon = (cat) => {
    switch (cat?.toLowerCase()) {
      case 'transport': return <Car size={20} />;
      case 'food & diet': return <Utensils size={20} />;
      case 'home energy': return <Zap size={20} />;
      case 'waste': return <Trash2 size={20} />;
      default: return <Globe size={20} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-800">
      {/* Header */}
      <header className="bg-white border-b border-slate-100 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-8 py-6 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <button 
              onClick={() => navigate("/goals")}
              className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-slate-100 transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">{goal.goalTitle}</h1>
              <p className="text-sm font-bold text-slate-400 flex items-center gap-2">
                <span className="capitalize">{goal.status} Goal</span>
                <span>•</span>
                <span>Started {new Date(goal.createdAt).toLocaleDateString()}</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="px-5 py-2.5 bg-white border border-slate-200 rounded-xl font-bold flex items-center gap-2 hover:bg-slate-50 transition-all">
              <Edit3 size={18} />
              <span>Edit Goal</span>
            </button>
            {goal.status === 'active' && (
              <button 
                onClick={handleCompleteGoal}
                className="px-6 py-2.5 bg-green-500 text-white rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-green-500/20 hover:bg-green-600 transition-all active:scale-95"
              >
                <CheckCircle2 size={18} />
                <span>Mark as Completed</span>
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Content (Left) */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Efficiency Status Card */}
            <div className="bg-white rounded-[40px] p-10 border border-slate-100 shadow-sm flex flex-col md:flex-row items-center gap-12">
               <div className="relative w-48 h-48 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="96"
                      cy="96"
                      r="88"
                      stroke="currentColor"
                      strokeWidth="16"
                      fill="transparent"
                      className="text-slate-100"
                    />
                    <circle
                      cx="96"
                      cy="96"
                      r="88"
                      stroke="currentColor"
                      strokeWidth="16"
                      fill="transparent"
                      strokeDasharray={2 * Math.PI * 88}
                      strokeDashoffset={2 * Math.PI * 88 * (1 - progress / 100)}
                      className="text-green-500 transition-all duration-1000"
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-4xl font-black text-slate-900">{progress}%</span>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Complete</span>
                  </div>
               </div>

               <div className="flex-1 space-y-6">
                  <div>
                    <h3 className="text-lg font-black text-slate-900 flex items-center gap-2 mb-2">
                       <TrendingDown className="text-green-500" size={20} />
                       Efficiency Status
                    </h3>
                    <p className="text-slate-400 font-medium leading-relaxed">
                      You're on track to hit your {goal.timeframe?.toLowerCase()} target of {goal.targetEmission}kg. Great job choosing public transport!
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-6 pt-4 border-t border-slate-50">
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Current</label>
                      <p className="text-xl font-black text-slate-800">{goal.currentEmission} <span className="text-sm font-bold text-slate-400">kg</span></p>
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Target</label>
                      <p className="text-xl font-black text-slate-800">{goal.targetEmission} <span className="text-sm font-bold text-slate-400">kg</span></p>
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Remaining</label>
                      <p className="text-xl font-black text-green-600">{remaining.toFixed(1)} <span className="text-sm font-bold text-green-600">kg</span></p>
                    </div>
                  </div>
               </div>
            </div>

            {/* Savings Chart Card */}
            <div className="bg-white rounded-[40px] p-10 border border-slate-100 shadow-sm space-y-8">
               <div className="flex items-center justify-between">
                  <h3 className="text-lg font-black text-slate-900">Accumulated Carbon Savings</h3>
                  <div className="text-[11px] font-black text-green-500 bg-green-50 px-3 py-1 rounded-full uppercase">Daily View</div>
               </div>
               <p className="text-xs font-bold text-slate-400 -mt-4">Visualizing your daily impact since the goal started.</p>
               
               <div className="h-[300px] w-full pt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="colorSavings" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#22c55e" stopOpacity={0.1}/>
                          <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis 
                        dataKey="name" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{fontSize: 12, fontWeight: 700, fill: '#94a3b8'}} 
                        dy={10}
                      />
                      <YAxis hide />
                      <Tooltip 
                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)', fontWeight: 800 }} 
                      />
                      <Area 
                        type="monotone" 
                        dataKey="savings" 
                        stroke="#22c55e" 
                        strokeWidth={4} 
                        fillOpacity={1} 
                        fill="url(#colorSavings)" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
               </div>
            </div>

          </div>

          {/* Sidebar (Right) */}
          <div className="space-y-8">
            
            {/* Recent Activity */}
            <div className="bg-white rounded-[40px] p-8 border border-slate-100 shadow-sm space-y-8">
               <h3 className="text-xl font-black text-slate-900 tracking-tight">Recent Activity</h3>
               <p className="text-xs font-bold text-slate-400 -mt-6">Logs contributing to this goal.</p>

               <div className="space-y-6">
                  {activities.length > 0 ? activities.slice(0, 5).map((activity, idx) => (
                    <div key={idx} className="flex items-center gap-4 group">
                      <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-green-50 group-hover:text-green-500 transition-colors">
                        {getCategoryIcon(goal.category)}
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-black text-slate-800">{activity.action || "Activity Logged"}</h4>
                        <p className="text-[11px] font-bold text-slate-400">{new Date(activity.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                      </div>
                      <span className="text-xs font-black text-slate-900">+{activity.description?.match(/[\d.]+/)?.[0] || "0"} kg</span>
                    </div>
                  )) : (
                    <p className="text-center py-10 text-slate-300 font-bold italic">No recent activity detected.</p>
                  )}
               </div>

               <button className="w-full py-4 bg-slate-50 rounded-2xl text-slate-400 font-bold text-[13px] hover:bg-slate-100 transition-colors uppercase tracking-widest">
                  View Full History
               </button>
            </div>

            {/* Eco Tip */}
            <div className="bg-green-50/50 rounded-[40px] p-8 space-y-4 border border-green-100/50">
               <div className="w-10 h-10 rounded-2xl bg-green-500 flex items-center justify-center text-white">
                  <Leaf size={20} />
               </div>
               <h3 className="text-lg font-black text-green-700 tracking-tight">Eco Tip</h3>
               <p className="text-sm font-bold text-green-700/80 leading-relaxed">
                  Swapping just two car trips for public transport each week could help you hit your goal 15% faster!
               </p>
               <button className="text-green-600 font-black text-[11px] uppercase tracking-widest flex items-center gap-1 hover:underline">
                  Learn more <ChevronRight size={14} />
               </button>
            </div>

            {/* Goal Parameters */}
            <div className="bg-white rounded-[40px] p-8 border border-slate-100 shadow-sm space-y-6">
              <h3 className="text-lg font-black text-slate-900 tracking-tight mb-2">Goal Parameters</h3>
              <div className="space-y-4">
                 <div className="flex justify-between items-center text-sm font-bold">
                    <span className="text-slate-400">Category</span>
                    <span className="text-slate-900">{goal.category}</span>
                 </div>
                 <div className="flex justify-between items-center text-sm font-bold">
                    <span className="text-slate-400">Timeframe</span>
                    <span className="text-slate-900">{goal.timeframe}</span>
                 </div>
                 <div className="flex justify-between items-center text-sm font-bold">
                    <span className="text-slate-400">Priority</span>
                    <span className="bg-orange-50 text-orange-500 px-3 py-1 rounded-lg text-[11px] font-black uppercase">High</span>
                 </div>
              </div>
              <p className="text-[12px] font-bold text-slate-400 italic pt-6 border-t border-slate-50 leading-relaxed uppercase tracking-tighter">
                “Minimize personal car usage by prioritizing cycling and regional trains.”
              </p>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}