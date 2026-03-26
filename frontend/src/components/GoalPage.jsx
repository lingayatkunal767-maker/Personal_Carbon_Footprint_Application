import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ChevronLeft, Target, Settings, 
  CheckCircle2, Circle, TrendingDown, 
  Coins, Plus, Loader2, X, Zap, Users
} from "lucide-react";

const GoalPage = () => {
  const navigate = useNavigate();
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [newGoal, setNewGoal] = useState({
    title: "",
    description: "",
    category: "Transport",
    targetAmount: "",
    deadline: ""
  });

  const fetchGoals = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch("http://localhost:8080/api/goals", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setGoals(data);
      }
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  const handleIncrementProgress = async (kg) => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch("http://localhost:8080/api/goals/active/increment", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ progress: kg }),
      });

      if (response.ok) {
        fetchGoals(); 
      }
    } catch (err) {
      console.error("Increment error:", err);
    }
  };

  const handleCreateGoal = async (e, customGoal = null) => {
    if (e) e.preventDefault();
    const token = localStorage.getItem("token");
    
    // If customGoal is provided (from Admin challenge), use it. Otherwise use form state.
    const goalToSave = customGoal || {
      ...newGoal,
      targetAmount: parseFloat(newGoal.targetAmount)
    };

    try {
      const response = await fetch("http://localhost:8080/api/goals", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(goalToSave),
      });

      if (response.ok) {
        setIsModalOpen(false);
        setNewGoal({ title: "", description: "", category: "Transport", targetAmount: "", deadline: "" });
        fetchGoals();
      }
    } catch (err) {
      console.error("Creation error:", err);
    }
  };

  // Logic to separate the combined list from the backend
  const activePersonalGoal = goals.find(g => g.status === "ACTIVE" && !g.isCommunityGoal);
  const communityChallenges = goals.filter(g => g.isCommunityGoal && g.status === "ACTIVE");
  const pastGoals = goals.filter(g => g.status !== "ACTIVE");

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAF9]">
      <Loader2 className="animate-spin text-emerald-500" size={32} />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAF9] p-6 font-sans text-slate-700">
      <header className="max-w-2xl mx-auto mb-6 flex items-center gap-4">
        <button onClick={() => navigate("/dashboard")} className="p-2 hover:bg-white rounded-full transition-colors">
          <ChevronLeft size={24} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Eco Goals</h1>
          <p className="text-sm text-gray-400">Personal & Community Milestones</p>
        </div>
      </header>

      <main className="max-w-2xl mx-auto space-y-6 pb-20">
        
        {/* 1. ACTIVE PERSONAL GOAL */}
        <section className="bg-white rounded-[32px] p-8 shadow-sm border border-gray-100">
          {activePersonalGoal ? (
            <>
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-3">
                  <div className="bg-emerald-50 p-3 rounded-2xl text-emerald-600"><Target size={24} /></div>
                  <div>
                    <h2 className="font-bold text-gray-800">My Active Goal</h2>
                    <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wider">
                      Target: {activePersonalGoal.targetAmount}kg
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => handleIncrementProgress(2.5)}
                  className="flex items-center gap-2 text-xs font-bold bg-emerald-500 px-4 py-2 rounded-xl text-white hover:bg-emerald-600 shadow-md transition-all"
                >
                  <Zap size={14} /> Log 2.5kg
                </button>
              </div>
              
              <h3 className="text-xl font-bold text-gray-800 mb-6">{activePersonalGoal.title}</h3>
              
              <div className="mb-8">
                <div className="flex justify-between items-end mb-2">
                  <span className="text-xs font-bold text-gray-400 uppercase">Progress</span>
                  <span className="text-lg font-black text-emerald-600">{activePersonalGoal.progressPercentage}%</span>
                </div>
                <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden">
                  <div 
                    className="bg-emerald-500 h-full transition-all duration-700 ease-out" 
                    style={{ width: `${activePersonalGoal.progressPercentage}%` }}
                  ></div>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-6">
              <p className="text-gray-400 font-medium mb-4">No personal goals active.</p>
              <button onClick={() => setIsModalOpen(true)} className="text-emerald-600 font-bold text-sm hover:underline tracking-tight">
                + Start a new goal
              </button>
            </div>
          )}
        </section>

        {/* 2. COMMUNITY CHALLENGES (ADMIN POSTS) */}
        {communityChallenges.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center gap-2 ml-2">
              <Users size={18} className="text-emerald-600" />
              <h3 className="font-bold text-gray-800 tracking-tight">Community Challenges</h3>
            </div>
            {communityChallenges.map((challenge) => (
              <div key={challenge.id} className="bg-emerald-600 rounded-[24px] p-6 shadow-lg text-white relative overflow-hidden transition-transform hover:scale-[1.01]">
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="text-lg font-bold">{challenge.title}</h4>
                    <span className="bg-white/20 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">Admin Post</span>
                  </div>
                  <p className="text-emerald-50 text-xs mb-4 opacity-90">{challenge.description}</p>
                  
                  <button 
                    onClick={() => handleCreateGoal(null, {
                      title: challenge.title,
                      description: challenge.description,
                      category: challenge.category,
                      targetAmount: challenge.targetAmount,
                      deadline: challenge.deadline
                    })}
                    className="w-full py-3 bg-white text-emerald-600 rounded-xl font-bold text-sm hover:bg-emerald-50 transition-colors shadow-sm"
                  >
                    Accept Challenge
                  </button>
                </div>
                <div className="absolute -right-10 -top-10 w-32 h-32 bg-white/10 rounded-full"></div>
              </div>
            ))}
          </section>
        )}

        {/* 3. GOAL HISTORY & ADD NEW BUTTON */}
        <section className="bg-white rounded-[32px] p-8 shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-800 mb-6">History</h3>
          <div className="space-y-4 mb-8">
            {pastGoals.length > 0 ? pastGoals.map((goal) => (
              <div key={goal.id} className="flex items-center justify-between p-4 bg-gray-50/50 rounded-2xl">
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-full bg-white ${goal.status === 'COMPLETED' ? 'text-emerald-500' : 'text-gray-400'}`}>
                    <CheckCircle2 size={18} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-700">{goal.title}</h4>
                    <p className="text-[11px] text-gray-400">{goal.category} • {goal.targetAmount}kg</p>
                  </div>
                </div>
                <span className={`text-[10px] font-black uppercase ${goal.status === 'COMPLETED' ? 'text-emerald-600' : 'text-gray-400'}`}>
                  {goal.status}
                </span>
              </div>
            )) : <p className="text-center text-xs text-gray-400 py-4">No completed goals yet.</p>}
          </div>

          {/* NEW GOAL BUTTON - Now placed inside the history section for better visibility */}
          <button 
            onClick={() => setIsModalOpen(true)}
            className="w-full py-4 border-2 border-dashed border-gray-200 rounded-2xl flex items-center justify-center gap-2 text-gray-400 font-bold hover:bg-gray-50 hover:border-emerald-200 hover:text-emerald-500 transition-all group"
          >
            <Plus size={18} className="group-hover:scale-110 transition-transform"/> 
            Set a New Personal Goal
          </button>
        </section>
      </main>

      {/* CREATE MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[32px] p-8 w-full max-w-md shadow-2xl relative">
            <button onClick={() => setIsModalOpen(false)} className="absolute right-6 top-6 text-gray-400 hover:text-gray-600 transition-colors">
              <X size={20}/>
            </button>
            <h2 className="text-xl font-bold mb-6 text-gray-800">Set New Eco Goal</h2>
            <form onSubmit={handleCreateGoal} className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Goal Title</label>
                <input type="text" required placeholder="e.g. Reduce Car Travel" className="survey-input mt-1"
                  value={newGoal.title} onChange={(e) => setNewGoal({...newGoal, title: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Category</label>
                  <select className="survey-input mt-1" value={newGoal.category} onChange={(e) => setNewGoal({...newGoal, category: e.target.value})}>
                    <option value="Transport">Transport</option>
                    <option value="Food">Food</option>
                    <option value="Energy">Energy</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Target (kg)</label>
                  <input type="number" required placeholder="50" className="survey-input mt-1"
                    value={newGoal.targetAmount} onChange={(e) => setNewGoal({...newGoal, targetAmount: e.target.value})} />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Deadline</label>
                <input type="date" required className="survey-input mt-1"
                  value={newGoal.deadline} onChange={(e) => setNewGoal({...newGoal, deadline: e.target.value})} />
              </div>
              <button type="submit" className="w-full py-4 bg-emerald-500 text-white rounded-2xl font-bold shadow-lg mt-4 hover:bg-emerald-600 transition-all active:scale-[0.98]">
                Create Goal
              </button>
            </form>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        .survey-input {
          width: 100%; background-color: #f8fafc; border: 1px solid #e2e8f0;
          border-radius: 0.75rem; padding: 0.75rem; font-size: 0.875rem; outline: none;
          transition: all 0.2s;
        }
        .survey-input:focus { border-color: #10b981; background-color: white; box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.05); }
      `}} />
    </div>
  );
};

export default GoalPage;