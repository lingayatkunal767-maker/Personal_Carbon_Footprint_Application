import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ChevronLeft, Target, Settings, 
  CheckCircle2, Circle, TrendingDown, 
  Coins, Plus 
} from "lucide-react";

const GoalPage = () => {
  const navigate = useNavigate();

  // Mock data for the current active goal
  const [currentGoal] = useState({
    title: "Reduce Monthly Emission by 20%",
    date: "Jan 31, 2026",
    progress: 40,
    currentKg: 348,
    savedAmt: 125,
    milestones: [
      { label: "Reduce by 5%", date: "Jan 10", completed: true },
      { label: "Reduce by 10%", date: "Jan 15", completed: true },
      { label: "Reduce by 15%", date: "Jan 25", completed: false },
      { label: "Reduce by 20%", date: "Jan 31", completed: false },
    ]
  });

  // Mock data for history
  const pastGoals = [
    { title: "Reduce by 10% in December", detail: "12% reduction", status: "Achieved", color: "emerald" },
    { title: "Cycle 50km in November", detail: "67km cycled", status: "Achieved", color: "emerald" },
    { title: "Save 500 kWh in October", detail: "420 kWh saved", status: "Missed", color: "rose" },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAF9] p-6 font-sans text-slate-700">
      {/* --- HEADER --- */}
      <header className="max-w-2xl mx-auto mb-6 flex items-center gap-4">
        <button 
          onClick={() => navigate(-1)} 
          className="p-2 hover:bg-white rounded-full transition-colors"
        >
          <ChevronLeft size={24} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Your Goals</h1>
          <p className="text-sm text-gray-400">Track your eco-commitments</p>
        </div>
      </header>

      <main className="max-w-2xl mx-auto space-y-6">
        
        {/* --- CURRENT GOAL CARD --- */}
        <section className="bg-white rounded-[32px] p-8 shadow-sm border border-gray-100">
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center gap-3">
              <div className="bg-emerald-50 p-3 rounded-2xl text-emerald-600">
                <Target size={24} />
              </div>
              <div>
                <h2 className="font-bold text-gray-800">Current Goal</h2>
                <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wider">{currentGoal.date}</p>
              </div>
            </div>
            <button className="flex items-center gap-1 text-xs font-bold bg-gray-50 px-3 py-1.5 rounded-lg text-gray-500 hover:bg-gray-100">
              Manage <Settings size={14} />
            </button>
          </div>

          <h3 className="text-xl font-bold text-gray-800 mb-6">{currentGoal.title}</h3>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between items-end mb-2">
              <span className="text-xs font-bold text-gray-400 uppercase">Progress</span>
              <span className="text-lg font-black text-emerald-600">{currentGoal.progress}%</span>
            </div>
            <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden">
              <div 
                className="bg-emerald-500 h-full transition-all duration-1000" 
                style={{ width: `${currentGoal.progress}%` }}
              ></div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <StatBox label="Completed" value={`${currentGoal.progress}%`} icon={CheckCircle2} />
            <StatBox label="Current (kg)" value={currentGoal.currentKg} icon={TrendingDown} />
            <StatBox label="Saved" value={`₹${currentGoal.savedAmt}`} icon={Coins} />
          </div>

          {/* Milestones List */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Milestones</h4>
            {currentGoal.milestones.map((ms, i) => (
              <div key={i} className="flex justify-between items-center group">
                <div className="flex items-center gap-3">
                  {ms.completed ? 
                    <CheckCircle2 size={20} className="text-emerald-500" /> : 
                    <Circle size={20} className="text-gray-300" />
                  }
                  <span className={`text-sm font-semibold ${ms.completed ? 'text-gray-700' : 'text-gray-400'}`}>
                    {ms.label}
                  </span>
                </div>
                <span className="text-[11px] font-bold text-gray-400">{ms.date}</span>
              </div>
            ))}
          </div>
        </section>

        {/* --- PAST GOALS SECTION --- */}
        <section className="bg-white rounded-[32px] p-8 shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-800 mb-6">Past Goals</h3>
          <div className="space-y-4">
            {pastGoals.map((goal, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-gray-50/50 rounded-2xl border border-transparent hover:border-gray-200 transition-all">
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-full bg-white shadow-sm ${goal.status === 'Achieved' ? 'text-emerald-500' : 'text-rose-500'}`}>
                    <CheckCircle2 size={18} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-700">{goal.title}</h4>
                    <p className="text-[11px] text-gray-400">{goal.detail}</p>
                  </div>
                </div>
                <span className={`text-[10px] font-black uppercase tracking-tighter ${goal.status === 'Achieved' ? 'text-emerald-600' : 'text-rose-400'}`}>
                  {goal.status}
                </span>
              </div>
            ))}
          </div>

          <button className="w-full mt-8 py-4 border-2 border-dashed border-gray-200 rounded-2xl flex items-center justify-center gap-2 text-gray-400 font-bold hover:bg-gray-50 hover:border-emerald-200 hover:text-emerald-600 transition-all">
            <Plus size={18} /> Set a New Goal
          </button>
        </section>

      </main>
    </div>
  );
};

// Sub-component for the stats boxes
const StatBox = ({ label, value, icon: Icon }) => (
  <div className="bg-[#F1F5F2] p-4 rounded-[24px] flex flex-col items-center text-center">
    <Icon size={18} className="text-emerald-600 mb-2" />
    <span className="text-lg font-black text-gray-800 leading-none">{value}</span>
    <span className="text-[9px] font-bold text-gray-400 uppercase mt-1 tracking-tighter">{label}</span>
  </div>
);

export default GoalPage;