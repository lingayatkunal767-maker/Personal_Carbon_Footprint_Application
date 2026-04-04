import { useState, useEffect } from "react";
import { 
  Target, 
  CheckCircle2, 
  Edit3, 
  ArrowRight,
  ChevronRight,
  Clock,
  TrendingDown
} from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { apiFetch } from "../utils/api";

export default function Goals() {
  const navigate = useNavigate();
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("active");

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    setLoading(true);
    try {
      const data = await apiFetch("/api/goals");
      setGoals(data || []);
    } catch (err) {
      console.error("Failed to fetch goals", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteGoal = async (id) => {
    try {
      await apiFetch(`/api/goals/${id}/complete`, { method: "PUT" });
      alert("Goal completed successfully! You've earned points for your progress.");
      fetchGoals();
    } catch (err) {
      console.error("Failed to complete goal", err);
    }
  };

  const filteredGoals = goals.filter(g => g.status === filter);

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-800">
      {/* Header */}
      <header className="bg-white border-b border-slate-100 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-8 py-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-green-500 flex items-center justify-center text-white shadow-lg shadow-green-500/20">
              <Target size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">Your Sustainability Goals</h1>
              <p className="text-sm font-medium text-slate-400">Track and manage your carbon reduction progress</p>
            </div>
          </div>
          <button 
            onClick={() => navigate("/create-goal")}
            className="px-6 py-3 bg-slate-900 text-white rounded-2xl font-bold flex items-center gap-2 hover:bg-slate-800 transition-all active:scale-95"
          >
            <span>+ Create New</span>
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-8 py-10">
        {/* Tabs */}
        <div className="flex items-center gap-2 mb-10 bg-slate-100/50 p-1.5 rounded-2xl w-fit">
          <button 
            onClick={() => setFilter("active")}
            className={`px-8 py-3 rounded-xl font-bold transition-all ${filter === "active" ? "bg-white text-green-600 shadow-sm" : "text-slate-400 hover:text-slate-600"}`}
          >
            Active
          </button>
          <button 
            onClick={() => setFilter("completed")}
            className={`px-8 py-3 rounded-xl font-bold transition-all ${filter === "completed" ? "bg-white text-green-600 shadow-sm" : "text-slate-400 hover:text-slate-600"}`}
          >
            Completed
          </button>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-4">
            <div className="w-10 h-10 border-4 border-green-500/30 border-t-green-500 rounded-full animate-spin"></div>
            <p className="text-slate-400 font-bold">Fetching your goals...</p>
          </div>
        ) : filteredGoals.length === 0 ? (
          <div className="bg-white rounded-[40px] border-2 border-dashed border-slate-100 p-20 flex flex-col items-center text-center space-y-6">
            <div className="w-24 h-24 rounded-3xl bg-slate-50 flex items-center justify-center text-slate-200">
              <Target size={48} />
            </div>
            <div className="max-w-sm">
              <h2 className="text-xl font-black text-slate-800 mb-2">No {filter} goals found</h2>
              <p className="text-slate-400 font-medium leading-relaxed">
                {filter === "active" 
                  ? "Start by defining a new target to reduce your carbon footprint today." 
                  : "Complete your first goal to see it listed here!"}
              </p>
            </div>
            {filter === "active" && (
              <button 
                onClick={() => navigate("/create-goal")}
                className="px-10 py-4 bg-green-500 text-white rounded-2xl font-bold shadow-xl shadow-green-500/20 hover:bg-green-600 transition-all flex items-center gap-2 group"
              >
                Let's get started
                <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredGoals.map((goal) => (
              <div 
                key={goal.id} 
                className="group bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-500 flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start mb-6">
                    <div className={`p-3 rounded-2xl ${goal.status === 'active' ? 'bg-green-50 text-green-500' : 'bg-slate-50 text-slate-400'}`}>
                      <Target size={22} />
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={(e) => { e.preventDefault(); /* Would go to edit page */ }}
                        className="p-2.5 bg-slate-50 text-slate-400 rounded-xl hover:bg-green-50 hover:text-green-500 transition-all"
                        title="Edit Goal"
                      >
                        <Edit3 size={18} />
                      </button>
                      {goal.status === 'active' && (
                        <button 
                          onClick={(e) => { e.preventDefault(); handleCompleteGoal(goal.id); }}
                          className="p-2.5 bg-slate-50 text-slate-400 rounded-xl hover:bg-green-50 hover:text-green-500 transition-all"
                          title="Mark Complete"
                        >
                          <CheckCircle2 size={18} />
                        </button>
                      )}
                    </div>
                  </div>

                  <h3 className="text-xl font-black text-slate-900 mb-2 truncate group-hover:text-green-600 transition-colors">
                    {goal.goalTitle}
                  </h3>
                  
                  <div className="flex items-center gap-4 text-[13px] font-bold text-slate-400 mb-8">
                    <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1 rounded-full">
                      <Clock size={14} />
                      <span>{goal.timeframe || "Next 30 Days"}</span>
                    </div>
                    <span>•</span>
                    <span className="capitalize">{goal.recurrence || "one time"}</span>
                  </div>

                  {/* Progress Section */}
                  <div className="space-y-4 mb-8">
                    <div className="flex justify-between items-end">
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Progress</label>
                        <p className="text-2xl font-black text-slate-800">
                          {Math.round(goal.progressPercentage)}%
                        </p>
                      </div>
                      <div className="text-right">
                         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 italic">Target: {goal.targetEmission}kg</p>
                         <p className="text-xs font-bold text-green-600 flex items-center gap-1 justify-end">
                            <TrendingDown size={14} />
                            {Math.round(goal.targetEmission - goal.currentEmission)}kg remaining
                         </p>
                      </div>
                    </div>
                    <div className="w-full h-3 bg-slate-50 rounded-full overflow-hidden p-0.5">
                      <div 
                        className="h-full bg-green-500 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.4)] transition-all duration-1000"
                        style={{ width: `${goal.progressPercentage}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                <Link 
                  to={`/goal-details/${goal.id}`}
                  className="w-full py-4 bg-slate-50 text-slate-600 rounded-2xl font-bold flex items-center justify-center gap-2 group-hover:bg-green-500 group-hover:text-white transition-all"
                >
                  View Details
                  <ChevronRight size={18} />
                </Link>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
