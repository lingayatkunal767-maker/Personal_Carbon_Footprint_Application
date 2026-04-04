import { useState, useEffect } from "react";
import { 
  Plus,
  Target, 
  ArrowRight,
  ChevronDown,
  Calendar,
  Car,
  Utensils,
  Zap,
  Trash2,
  Globe,
  Bell,
  Search,
  CheckCircle2,
  Lightbulb,
  TrendingDown
} from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { apiFetch } from "../utils/api";

export default function CreateGoal() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [goals, setGoals] = useState([]);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Transport");
  const [reductionTarget, setReductionTarget] = useState(15);
  const [timeframe, setTimeframe] = useState("Next 30 Days");
  const [recurrence, setRecurrence] = useState("weekly");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function loadUser() {
      try {
        const data = await apiFetch("/api/users/me");
        setUser(data);
      } catch (err) {
        console.error("Failed to load user", err);
      }
    }
    loadUser();
    fetchRecentGoals();
  }, []);

  const fetchRecentGoals = async () => {
    try {
      const data = await apiFetch("/api/goals");
      setGoals(data || []);
    } catch (err) {
      console.error("Failed to fetch goals", err);
    }
  };

  const categories = [
    { name: "Transport", icon: <Car size={24} /> },
    { name: "Food & Diet", icon: <Utensils size={24} /> },
    { name: "Home Energy", icon: <Zap size={24} /> },
    { name: "Waste", icon: <Trash2 size={24} /> },
    { name: "Global", icon: <Globe size={24} /> }
  ];

  const calculateEndDate = (tf) => {
    const date = new Date();
    if (tf === "Next 7 Days") date.setDate(date.getDate() + 7);
    else if (tf === "Next 30 Days") date.setMonth(date.getMonth() + 1);
    else if (tf === "Next 3 Months") date.setMonth(date.getMonth() + 3);
    else if (tf === "Next Year") date.setFullYear(date.getFullYear() + 1);
    return date;
  };

  const handleCreateGoal = async () => {
    if (!title.trim()) {
      alert("Please enter a goal title.");
      return;
    }

    setIsSubmitting(true);
    try {
      const goalData = {
        userId: user?.id || 1,
        goalTitle: title,
        targetEmission: 15.0, // Simulation based on image
        category,
        timeframe,
        status: "active",
        recurrence,
        description,
        startDate: new Date().toISOString(),
        endDate: calculateEndDate(timeframe).toISOString()
      };

      const response = await apiFetch("/api/goals", {
        method: "POST",
        body: JSON.stringify(goalData),
      });

      if (response && response.id) {
        alert("Goal has been created successfully!");
        navigate(`/goal-details/${response.id}`);
      } else {
        alert("Failed to create goal");
      }
    } catch (error) {
      console.error(error);
      alert("Error creating goal: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-800">
      {/* Top Navbar */}
      <header className="flex items-center justify-between px-8 py-4 bg-white border-b border-slate-100 sticky top-0 z-20">
        <div className="relative w-1/3 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
          <input 
            type="text" 
            placeholder="Search goals or activities..." 
            className="w-full pl-12 pr-4 py-2.5 bg-slate-50 border-none rounded-xl text-sm font-medium focus:ring-4 focus:ring-green-500/5 transition-all outline-none"
          />
        </div>
        <div className="flex items-center gap-6">
           <div className="flex items-center gap-3 pr-6 border-r border-slate-100">
             <div className="text-right">
               <p className="text-sm font-black text-slate-900 leading-none mb-1">Alex Rivera</p>
               <p className="text-[11px] font-bold text-slate-400">Pro Member</p>
             </div>
             <div className="w-10 h-10 rounded-full bg-slate-100 overflow-hidden ring-4 ring-slate-50">
               <img src="https://ui-avatars.com/api/?name=Alex+Rivera&background=E2E8F0&color=475569" alt="User" />
             </div>
           </div>
           <button className="text-slate-300 hover:text-slate-500 transition-colors">
              <Bell size={20} />
           </button>
        </div>
      </header>

      <main className="max-w-[1300px] mx-auto px-8 py-10">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-[13px] font-bold text-slate-400 mb-10">
          <Link to="/dashboard" className="hover:text-slate-600">Dashboard</Link>
          <span>/</span>
          <span className="text-slate-600">Create New Goal</span>
        </div>

        <div className="flex flex-col lg:flex-row gap-12 items-start">
          
          {/* Main Form Area */}
          <div className="flex-1 space-y-10">
            <div className="bg-white rounded-[40px] p-12 shadow-xl shadow-slate-200/40 border border-slate-100">
               <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-green-50 flex items-center justify-center text-green-500">
                    <Plus size={24} strokeWidth={3} />
                  </div>
                  <h2 className="text-3xl font-black text-slate-900 tracking-tight">Set a New Sustainability Goal</h2>
               </div>
               <p className="text-slate-400 font-medium mb-12 text-lg">Define a clear target to reduce your carbon footprint. Small changes lead to big impacts.</p>

               <div className="space-y-12">
                 {/* Goal Title */}
                 <div className="space-y-4">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest pl-1">Goal Title</label>
                    <input 
                      type="text" 
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g., Bike to work 3 times a week"
                      className="w-full bg-slate-50/50 border-2 border-slate-50 rounded-2xl px-6 py-5 font-bold text-slate-700 outline-none focus:border-green-500/20 focus:bg-white focus:ring-8 focus:ring-green-500/5 transition-all text-lg"
                    />
                 </div>

                 {/* Category Selector */}
                 <div className="space-y-4">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest pl-1">Target Category</label>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                      {categories.map((cat) => (
                        <button
                          key={cat.name}
                          onClick={() => setCategory(cat.name)}
                          className={`flex flex-col items-center justify-center p-6 rounded-[28px] border-2 transition-all duration-300 ${
                            category === cat.name 
                              ? "bg-white border-green-500 shadow-2xl shadow-green-500/20 scale-[1.03] -translate-y-1" 
                              : "bg-white border-slate-100 hover:border-slate-200"
                          }`}
                        >
                          <div className={`mb-3 transition-colors ${category === cat.name ? "text-green-500" : "text-slate-300"}`}>
                            {cat.icon}
                          </div>
                          <span className={`text-[12px] font-black leading-tight text-center ${category === cat.name ? "text-green-600" : "text-slate-400"}`}>
                            {cat.name}
                          </span>
                        </button>
                      ))}
                    </div>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    {/* Reduction slider */}
                    <div className="space-y-4">
                      <div className="flex justify-between items-center mb-1 pr-2">
                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest pl-1">Reduction Target</label>
                        <span className="text-xl font-black text-green-500">{reductionTarget}%</span>
                      </div>
                      <div className="relative pt-2">
                        <input 
                          type="range"
                          min="1"
                          max="100"
                          value={reductionTarget}
                          onChange={(e) => setReductionTarget(parseInt(e.target.value))}
                          className="w-full h-2 bg-slate-100 rounded-full appearance-none cursor-pointer accent-green-500"
                        />
                        <p className="text-[12px] font-bold text-slate-400 mt-4 italic">
                          Aiming for a {reductionTarget}% decrease from your current baseline.
                        </p>
                      </div>
                    </div>

                    {/* Timeframe */}
                    <div className="space-y-4">
                      <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest pl-1">Timeframe</label>
                      <div className="relative group">
                        <select 
                          value={timeframe}
                          onChange={(e) => setTimeframe(e.target.value)}
                          className="w-full appearance-none bg-slate-50 border-2 border-slate-50 rounded-2xl px-6 py-4.5 font-bold text-slate-700 outline-none focus:border-green-500/20 transition-all cursor-pointer"
                        >
                          <option>Next 7 Days</option>
                          <option>Next 30 Days</option>
                          <option>Next 3 Months</option>
                          <option>Next Year</option>
                        </select>
                        <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 group-hover:text-slate-500 pointer-events-none transition-all" size={20} />
                      </div>
                    </div>
                 </div>

                 {/* Recurrence */}
                 <div className="space-y-4">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest pl-1">Recurrence</label>
                    <div className="flex flex-wrap gap-3">
                      {["daily", "weekly", "monthly", "one time"].map(item => (
                        <button
                          key={item}
                          onClick={() => setRecurrence(item)}
                          className={`px-8 py-3.5 rounded-full text-[13px] font-black capitalize transition-all duration-300 ${
                            recurrence === item 
                              ? "bg-green-500 text-white shadow-xl shadow-green-500/30 -translate-y-0.5" 
                              : "bg-slate-50 text-slate-400 hover:bg-slate-100 border border-transparent"
                          }`}
                        >
                          {item}
                        </button>
                      ))}
                    </div>
                 </div>

                 {/* Description */}
                 <div className="space-y-4">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest pl-1">Optional Description / Action Plan</label>
                    <textarea 
                      rows={5}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Detail the specific actions you'll take (e.g., Use public transit on rainy days instead of driving)."
                      className="w-full bg-slate-50/50 border-2 border-slate-50 rounded-[32px] px-8 py-6 font-bold text-slate-700 outline-none focus:border-green-500/20 focus:bg-white transition-all resize-none placeholder:text-slate-300"
                    />
                 </div>
               </div>

               {/* Footer */}
               <div className="mt-16 pt-10 border-t border-slate-50 flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="flex items-center gap-3 px-6 py-2.5 bg-green-50/50 rounded-full">
                    <TrendingDown size={18} className="text-green-500" />
                    <p className="text-sm font-bold text-slate-600">
                      Estimated impact: <span className="text-green-600 font-black">~12.4 kg CO2e</span> saved per week.
                    </p>
                  </div>
                  <div className="flex gap-4 w-full md:w-auto">
                    <button 
                      onClick={() => navigate(-1)}
                      className="flex-1 md:flex-none px-10 py-4.5 font-black text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={handleCreateGoal}
                      disabled={isSubmitting}
                      className="flex-1 md:flex-none px-12 py-4.5 bg-green-500 text-white rounded-2xl font-black shadow-2xl shadow-green-500/20 hover:bg-green-600 hover:shadow-green-500/40 active:scale-95 transition-all flex items-center justify-center gap-2 group"
                    >
                      {isSubmitting ? "Creating..." : "Create Goal"}
                      {!isSubmitting && <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />}
                    </button>
                  </div>
               </div>
            </div>
          </div>

          {/* Sidebar Area */}
          <div className="w-full lg:w-[380px] space-y-10">
            {/* Goal Tips */}
            <div className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm space-y-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center text-green-500">
                  <Lightbulb size={20} />
                </div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight">Goal Tips</h3>
              </div>
              <div className="space-y-8">
                <div className="flex gap-5">
                  <div className="mt-1 text-green-500">
                    <CheckCircle2 size={20} />
                  </div>
                  <div>
                    <h4 className="font-black text-slate-900 text-sm mb-1 uppercase tracking-wider">Make it SMART</h4>
                    <p className="text-[13px] font-medium text-slate-400 leading-relaxed">Ensure your goal is Specific, Measurable, Achievable, Relevant, and Time-bound.</p>
                  </div>
                </div>
                <div className="flex gap-5">
                   <div className="mt-1 text-green-500">
                    <Globe size={20} />
                  </div>
                  <div>
                    <h4 className="font-black text-slate-900 text-sm mb-1 uppercase tracking-wider">Global Impact</h4>
                    <p className="text-[13px] font-medium text-slate-400 leading-relaxed">Reducing transport emissions by 20% is like saving 45 liters of gasoline every month.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Carbon Insight */}
            <div className="bg-green-50/40 rounded-[32px] p-8 border border-green-100/50 space-y-6">
               <h3 className="text-lg font-black text-green-700 tracking-tight">Carbon Insight</h3>
               <p className="text-[15px] leading-relaxed text-green-800/80 font-bold italic">
                 “Did you know? Switching to a vegetarian diet for just one day a week can reduce your food carbon footprint by over 100kg of CO2 per year.”
               </p>
               <div className="inline-flex items-center gap-2 bg-white/80 px-4 py-2 rounded-full border border-green-200">
                 <span className="text-[11px] font-black text-green-600 tracking-widest uppercase">Eco-Tip #42</span>
               </div>
            </div>

            {/* Created Goals List / Ready to start card */}
            <div className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm space-y-6">
               <div className="flex items-center justify-between">
                  <h3 className="text-lg font-black text-slate-900 tracking-tight">Your Active Goals</h3>
                  <span className="bg-green-50 text-green-600 text-[10px] font-black px-2 py-1 rounded-md uppercase">{goals.filter(g => g.status === 'active').length} Active</span>
               </div>
               
               {goals.filter(g => g.status === 'active').length === 0 ? (
                 <div className="flex flex-col items-center text-center py-6 border-2 border-dashed border-slate-50 rounded-2xl">
                    <Calendar className="text-slate-200 mb-3" size={32} />
                    <p className="text-xs font-bold text-slate-400">Your tracking begins as soon as you hit create.</p>
                 </div>
               ) : (
                 <div className="space-y-4">
                    {goals.filter(g => g.status === 'active').slice(0, 3).map((g) => (
                      <div key={g.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl group hover:bg-green-50 transition-colors">
                        <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-green-500 shadow-sm group-hover:scale-110 transition-transform">
                          <Target size={18} />
                        </div>
                        <div className="flex-1 min-w-0">
                           <p className="text-[13px] font-black text-slate-800 truncate">{g.goalTitle}</p>
                           <div className="w-full h-1 bg-slate-200 rounded-full mt-2 overflow-hidden">
                              <div className="h-full bg-green-500 rounded-full" style={{ width: `${g.progressPercentage}%` }}></div>
                           </div>
                        </div>
                        <ChevronDown className="text-slate-300 -rotate-90" size={14} />
                      </div>
                    ))}
                    {goals.length > 3 && (
                      <Link to="/goals" className="block text-center text-[11px] font-black text-green-600 uppercase tracking-widest hover:underline pt-2">
                        View all {goals.length} goals
                      </Link>
                    )}
                 </div>
               )}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}