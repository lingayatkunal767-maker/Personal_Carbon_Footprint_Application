import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { apiFetch } from "../utils/api";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from "recharts";
import { 
  ArrowLeft, 
  Target, 
  Calendar, 
  Zap, 
  Leaf, 
  TrendingDown, 
  Clock, 
  RotateCcw,
  CheckCircle2,
  AlertCircle
} from "lucide-react";

export default function GoalDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [goal, setGoal] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [goalData, activityData] = await Promise.all([
          apiFetch(`/api/goals/${id}`),
          apiFetch(`/api/goals/${id}/activities`)
        ]);
        setGoal(goalData);
        setActivities(activityData);
      } catch (err) {
        console.error("Error fetching goal details:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const progress = goal ? goal.progressPercentage : 0;

  // Mock data for trends based on goal progress
  const chartData = [
    { day: "Mon", value: 0 },
    { day: "Tue", value: progress * 0.2 },
    { day: "Wed", value: progress * 0.4 },
    { day: "Thu", value: progress * 0.35 },
    { day: "Fri", value: progress * 0.6 },
    { day: "Sat", value: progress * 0.85 },
    { day: "Sun", value: progress }
  ];

  const handleCompleteGoal = async () => {
    try {
      const updatedGoal = await apiFetch(`/api/goals/${id}/complete`, {
        method: "PUT"
      });
      if (updatedGoal) {
        setGoal(updatedGoal);
        alert("Goal marked as completed! 🌿");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to complete goal");
    }
  };

  const handleAbandonGoal = async () => {
    if (!window.confirm("Are you sure you want to abandon this goal?")) return;
    try {
      const updatedGoal = await apiFetch(`/api/goals/${id}/abandon`, {
        method: "PUT"
      });
      if (updatedGoal) {
        setGoal(updatedGoal);
        alert("Goal abandoned");
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (!goal) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 space-y-4">
      <AlertCircle size={48} className="text-slate-300" />
      <p className="text-slate-500 font-medium">Goal not found</p>
      <button onClick={() => navigate(-1)} className="text-green-600 font-bold hover:underline">Go Back</button>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-800 p-8">
      <div className="max-w-[1400px] mx-auto">
        
        {/* Breadcrumb / Back */}
        <button 
          onClick={() => navigate(-1)}
          className="group flex items-center gap-2 text-slate-400 hover:text-slate-600 font-bold mb-8 transition-colors"
        >
          <ArrowLeft size={18} className="transition-transform group-hover:-translate-x-1" />
          Back to Goals
        </button>

        <div className="flex flex-col lg:flex-row gap-10">
          
          {/* Main Content */}
          <div className="flex-1 space-y-8">
            
            {/* Header Card */}
            <div className="bg-white rounded-[32px] p-10 shadow-sm border border-slate-100">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase ${
                      goal.status === 'completed' ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-blue-600'
                    }`}>
                      {goal.status}
                    </span>
                    <span className="text-slate-300">•</span>
                    <span className="text-slate-400 text-sm font-medium">
                      Category: <span className="text-green-600 font-bold">{goal.category || 'General'}</span>
                    </span>
                  </div>
                  <h1 className="text-3xl font-black text-slate-900 tracking-tight">
                    {goal.goalTitle}
                  </h1>
                </div>

                <div className="flex items-center gap-4">
                  {goal.status === 'active' && (
                    <>
                      <button 
                        onClick={handleAbandonGoal}
                        className="px-6 py-3 text-slate-400 font-bold hover:text-red-500 transition-colors"
                      >
                        Abandon
                      </button>
                      <button 
                        onClick={handleCompleteGoal}
                        className="px-8 py-3 bg-green-500 text-white rounded-2xl font-bold shadow-xl shadow-green-500/20 hover:bg-green-600 transition-all flex items-center gap-2"
                      >
                        <CheckCircle2 size={18} />
                        Mark Complete
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Progress and Stats Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                <div className="relative w-40 h-40 mx-auto md:mx-0">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                    <circle 
                      cx="50" cy="50" r="45" 
                      className="fill-none stroke-slate-50 stroke-[8]" 
                    />
                    <circle 
                      cx="50" cy="50" r="45" 
                      className="fill-none stroke-green-500 stroke-[8] transition-all duration-1000"
                      strokeDasharray="282.7"
                      strokeDashoffset={282.7 - (282.7 * progress) / 100}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-black text-slate-900">{Math.round(progress)}%</span>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Progress</span>
                  </div>
                </div>

                <div className="flex flex-col justify-center space-y-1">
                  <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Current</p>
                  <p className="text-3xl font-black text-slate-900">{goal.currentEmission} <span className="text-sm text-slate-400">kg</span></p>
                  <p className="text-xs font-bold text-green-500">Emission recorded</p>
                </div>

                <div className="flex flex-col justify-center space-y-1">
                  <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Target</p>
                  <p className="text-3xl font-black text-slate-900">{goal.targetEmission} <span className="text-sm text-slate-400">kg</span></p>
                  <p className="text-xs font-bold text-slate-400">Reduction goal</p>
                </div>

                <div className="flex flex-col justify-center space-y-1">
                  <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Remaining</p>
                  <p className="text-3xl font-black text-slate-900">
                    {Math.max(0, goal.targetEmission - goal.currentEmission)} <span className="text-sm text-slate-400">kg</span>
                  </p>
                  <p className="text-xs font-bold text-slate-400">To reach target</p>
                </div>
              </div>
            </div>

            {/* Chart Area */}
            <div className="bg-white rounded-[32px] p-10 shadow-sm border border-slate-100">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-black text-slate-900 tracking-tight">Accumulated Carbon Savings</h2>
                <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-xl">
                  <TrendingDown size={16} className="text-green-500" />
                  <span className="text-sm font-bold text-slate-600">Improving Trend</span>
                </div>
              </div>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                    <XAxis 
                      dataKey="day" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{fill: '#94A3B8', fontSize: 12, fontWeight: 700}}
                      dy={10}
                    />
                    <YAxis hide />
                    <Tooltip 
                      contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                      itemStyle={{fontWeight: 700, color: '#22C55E'}}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="value" 
                      stroke="#22C55E" 
                      strokeWidth={4} 
                      dot={{r: 6, fill: '#22C55E', strokeWidth: 3, stroke: '#fff'}}
                      activeDot={{r: 8, strokeWidth: 0}}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="w-full lg:w-[380px] space-y-8">
            
            {/* Goal Info Card */}
            <div className="bg-slate-900 rounded-[32px] p-8 text-white space-y-8">
              <h3 className="text-lg font-black tracking-tight">Goal Parameters</h3>
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                    <Clock size={20} className="text-green-400" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Timeframe</p>
                    <p className="font-bold">{goal.timeframe || 'Next 30 Days'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                    <RotateCcw size={20} className="text-green-400" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Recurrence</p>
                    <p className="font-bold capitalize">{goal.recurrence || 'Weekly'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                    <Calendar size={20} className="text-green-400" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Started</p>
                    <p className="font-bold">{new Date(goal.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Activity List */}
            <div className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-100">
              <h3 className="text-lg font-black text-slate-900 tracking-tight mb-6">Recent Activity</h3>
              <div className="space-y-6">
                {activities.length > 0 ? activities.map((a, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center text-green-500 flex-shrink-0">
                      <Zap size={18} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800">{a.action || 'Activity'}</p>
                      <p className="text-xs font-medium text-slate-400">{a.description || 'Impact recorded'}</p>
                      <p className="text-[10px] font-bold text-slate-300 mt-1 uppercase tracking-widest">
                        {new Date(a.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                )) : (
                  <p className="text-sm text-slate-400 font-medium text-center py-4">No activity recorded yet.</p>
                )}
              </div>
            </div>

            {/* Action Plan */}
            <div className="bg-green-50/50 rounded-[32px] p-8 border border-green-100/50">
              <h3 className="text-green-700 font-black tracking-tight mb-4">Action Plan</h3>
              <p className="text-green-700/70 text-sm font-medium leading-relaxed italic">
                “{goal.description || 'Focus on reducing your high-impact activities this week to reach your target.'}”
              </p>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}