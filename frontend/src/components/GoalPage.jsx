import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ChevronLeft, Target, Settings, 
  CheckCircle2, Circle, TrendingDown, 
  Coins, Plus, Loader2, X, Zap 
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
  const handleAddLog = async (kg) => {
  const response = await fetch("..."); // Your PATCH request
  if (response.ok) {
    // THIS IS THE SECRET:
    fetchGoals(); // This re-runs the GET request to sync the UI with the DB
  }
};

  // NEW: Logic to increment progress for the active goal
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
        fetchGoals(); // Refresh the numbers and bar immediately
      }
    } catch (err) {
      console.error("Increment error:", err);
    }
  };

  const handleCreateGoal = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    try {
      const response = await fetch("http://localhost:8080/api/goals", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          ...newGoal,
          targetAmount: parseFloat(newGoal.targetAmount)
        }),
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

  const activeGoal = goals.find(g => g.status === "ACTIVE");
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
          <h1 className="text-2xl font-bold text-gray-800">Your Goals</h1>
          <p className="text-sm text-gray-400">Track your eco-commitments</p>
        </div>
      </header>

      <main className="max-w-2xl mx-auto space-y-6">
        <section className="bg-white rounded-[32px] p-8 shadow-sm border border-gray-100">
          {activeGoal ? (
            <>
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-3">
                  <div className="bg-emerald-50 p-3 rounded-2xl text-emerald-600"><Target size={24} /></div>
                  <div>
                    <h2 className="font-bold text-gray-800">Current Goal</h2>
                    <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wider">
                      Ends: {new Date(activeGoal.deadline).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                {/* NEW: QUICK LOG BUTTON TO SEE OUTPUT */}
                <button 
                  onClick={() => handleIncrementProgress(2.5)}
                  className="flex items-center gap-2 text-xs font-bold bg-emerald-500 px-4 py-2 rounded-xl text-white hover:bg-emerald-600 shadow-md shadow-emerald-100 transition-all"
                >
                  <Zap size={14} /> Log 2.5kg
                </button>
              </div>
              
              <h3 className="text-xl font-bold text-gray-800 mb-6">{activeGoal.title}</h3>
              
              <div className="mb-8">
                <div className="flex justify-between items-end mb-2">
                  <span className="text-xs font-bold text-gray-400 uppercase">Progress</span>
                  <span className="text-lg font-black text-emerald-600">{activeGoal.progressPercentage}%</span>
                </div>
                <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden">
                  <div 
                    className="bg-emerald-500 h-full transition-all duration-700 ease-out" 
                    style={{ width: `${activeGoal.progressPercentage}%` }}
                  ></div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <StatBox label="Current" value={`${activeGoal.currentProgress.toFixed(1)}kg`} icon={TrendingDown} />
                <StatBox label="Target" value={`${activeGoal.targetAmount}kg`} icon={CheckCircle2} />
                <StatBox label="Status" value={activeGoal.status} icon={Target} />
              </div>
            </>
          ) : (
            <div className="text-center py-10">
              <p className="text-gray-400 font-medium">No active goals found.</p>
            </div>
          )}
        </section>

        {/* PAST GOALS */}
        <section className="bg-white rounded-[32px] p-8 shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-800 mb-6">Goal History</h3>
          <div className="space-y-4">
            {pastGoals.map((goal) => (
              <div key={goal.id} className="flex items-center justify-between p-4 bg-gray-50/50 rounded-2xl">
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-full bg-white ${goal.status === 'COMPLETED' ? 'text-emerald-500' : 'text-rose-500'}`}>
                    <CheckCircle2 size={18} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-700">{goal.title}</h4>
                    <p className="text-[11px] text-gray-400">{goal.category} • {goal.targetAmount}kg</p>
                  </div>
                </div>
                <span className="text-[10px] font-black uppercase tracking-tighter text-emerald-600">{goal.status}</span>
              </div>
            ))}
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="w-full mt-8 py-4 border-2 border-dashed border-gray-200 rounded-2xl flex items-center justify-center gap-2 text-gray-400 font-bold hover:bg-gray-50 transition-all"
          >
            <Plus size={18} /> Set a New Goal
          </button>
        </section>
      </main>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[32px] p-8 w-full max-w-md shadow-2xl relative">
            <button onClick={() => setIsModalOpen(false)} className="absolute right-6 top-6 text-gray-400"><X size={20}/></button>
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
              <button type="submit" className="w-full py-4 bg-emerald-500 text-white rounded-2xl font-bold shadow-lg shadow-emerald-100 mt-4">Create Goal</button>
            </form>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        .survey-input {
          width: 100%; background-color: #f8fafc; border: 1px solid #e2e8f0;
          border-radius: 0.75rem; padding: 0.75rem; font-size: 0.875rem; outline: none;
        }
        .survey-input:focus { border-color: #10b981; }
      `}} />
    </div>
  );
};
const handleAddProgress = async (amount) => {
  const response = await fetch(`/api/goals/progress?amount=${amount}`, { method: 'POST' });
  const data = await response.json();

  // If the backend sent a newBadge name (like "Transport Pro")
  if (data.newBadge) {
     setEarnedBadgeName(data.newBadge);
     setShowPopup(true);
  }
};
const StatBox = ({ label, value, icon: Icon }) => (
  <div className="bg-[#F1F5F2] p-4 rounded-[24px] flex flex-col items-center text-center">
    <Icon size={18} className="text-emerald-600 mb-2" />
    <span className="text-sm font-black text-gray-800">{value}</span>
    <span className="texst-[9px] font-bold text-gray-400 uppercase mt-1">{label}</span>
  </div>
);

export default GoalPage;