import { useState, useEffect } from "react";
import { 
  Search, 
  Settings, 
  Car, 
  Utensils, 
  Zap, 
  Trash2, 
  Globe, 
  Calendar, 
  ChevronDown, 
  Target,
  ArrowRight
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../utils/api";

export default function CreateGoal() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [category, setCategory] = useState("Transport");
  const [timeframe, setTimeframe] = useState("Next 30 Days");
  const [recurrence, setRecurrence] = useState("weekly");
  const [reductionTarget, setReductionTarget] = useState(15);
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
  }, []);

  const categories = [
    { name: "Transport", icon: <Car size={24} />, color: "text-green-600", bg: "bg-green-50", border: "border-green-500" },
    { name: "Food & Diet", icon: <Utensils size={24} />, color: "text-gray-500", bg: "bg-white", border: "border-gray-200" },
    { name: "Home Energy", icon: <Zap size={24} />, color: "text-gray-500", bg: "bg-white", border: "border-gray-200" },
    { name: "Waste", icon: <Trash2 size={24} />, color: "text-gray-500", bg: "bg-white", border: "border-gray-200" },
    { name: "Global", icon: <Globe size={24} />, color: "text-gray-500", bg: "bg-white", border: "border-gray-200" }
  ];

  const handleCreateGoal = async () => {
    if (reductionTarget === 0) {
      alert("Please set a reduction target");
      return;
    }

    setIsSubmitting(true);
    try {
      const goalData = {
        userId: user?.id || 1, // Fallback to 1 if user not loaded
        goalTitle: `${category} Reduction Goal`,
        targetEmission: reductionTarget,
        category,
        timeframe,
        recurrence,
        description,
        startDate: new Date().toISOString().split('.')[0],
        endDate: calculateEndDate(timeframe).split('.')[0]
      };

      const response = await apiFetch("/api/goals", {
        method: "POST",
        body: JSON.stringify(goalData),
      });

      if (response && response.id) {
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

  const calculateEndDate = (tf) => {
    const date = new Date();
    if (tf === "Next 7 Days") date.setDate(date.getDate() + 7);
    else if (tf === "Next 30 Days") date.setDate(date.getDate() + 30);
    else if (tf === "Next 3 Months") date.setMonth(date.getMonth() + 3);
    else if (tf === "Next Year") date.setFullYear(date.getFullYear() + 1);
    return date.toISOString();
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-800">
      {/* Header */}
      <header className="flex items-center justify-between px-8 py-4 bg-white border-b border-slate-100">
        <div className="relative w-1/2 max-w-xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search goals or activities..." 
            className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-green-500/20 outline-none transition-all"
          />
        </div>
        <div className="flex items-center gap-6">
          <button className="p-2 text-slate-400 hover:bg-slate-50 rounded-full transition-colors">
            <Settings size={20} />
          </button>
          <div className="flex items-center gap-3 pl-6 border-l border-slate-100">
            <div className="text-right">
              <p className="text-sm font-semibold text-slate-900">{user?.name || "Alex Rivera"}</p>
              <p className="text-xs text-slate-500 font-medium">{user?.membershipType || "Pro Member"}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden ring-2 ring-slate-100">
              <img src="https://ui-avatars.com/api/?name=Alex+Rivera&background=E2E8F0&color=475569" alt="User" />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-[1400px] mx-auto px-8 py-10">
        <div className="flex flex-col lg:flex-row gap-10">
          
          {/* Main Form Area */}
          <div className="flex-1 space-y-10">
            
            {/* Category Selector */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
              {categories.map((cat) => (
                <button
                  key={cat.name}
                  onClick={() => setCategory(cat.name)}
                  className={`flex flex-col items-center justify-center p-6 rounded-2xl border-2 transition-all duration-300 ${
                    category === cat.name 
                      ? "bg-white border-green-500 shadow-xl shadow-green-500/10 scale-[1.02]" 
                      : "bg-white border-slate-100 hover:border-slate-200 hover:shadow-lg"
                  }`}
                >
                  <div className={`mb-3 transition-colors ${category === cat.name ? "text-green-500" : "text-slate-400"}`}>
                    {cat.icon}
                  </div>
                  <span className={`text-[13px] font-bold tracking-tight ${category === cat.name ? "text-green-600" : "text-slate-500"}`}>
                    {cat.name}
                  </span>
                </button>
              ))}
            </div>

            {/* Form Content */}
            <div className="bg-white rounded-3xl p-10 shadow-sm border border-slate-100 space-y-12">
              
              {/* Target and Timeframe Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                
                {/* Reduction Target */}
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-black tracking-[0.1em] text-slate-400 uppercase">
                      Reduction Target
                    </label>
                    <span className="bg-green-50 text-green-600 text-lg font-bold px-3 py-1 rounded-lg">
                      {reductionTarget}%
                    </span>
                  </div>
                  <div className="relative pt-6">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={reductionTarget}
                      onChange={(e) => setReductionTarget(parseInt(e.target.value))}
                      className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-green-500 focus:outline-none"
                    />
                    <div 
                      className="absolute top-2 w-10 h-10 bg-white border-4 border-green-500 rounded-full flex items-center justify-center text-[10px] font-bold text-green-600 shadow-lg transition-all"
                      style={{ left: `calc(${reductionTarget}% - 20px)` }}
                    >
                      <Target size={14} />
                    </div>
                  </div>
                  <p className="text-[13px] text-slate-400 font-medium">
                    Aiming for a {reductionTarget}% decrease from your current baseline.
                  </p>
                </div>

                {/* Timeframe */}
                <div className="space-y-6">
                  <label className="text-[11px] font-black tracking-[0.1em] text-slate-400 uppercase block">
                    Timeframe
                  </label>
                  <div className="relative group">
                    <select
                      value={timeframe}
                      onChange={(e) => setTimeframe(e.target.value)}
                      className="w-full appearance-none bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 font-bold text-slate-700 outline-none focus:ring-2 focus:ring-green-500/10 focus:bg-white transition-all cursor-pointer"
                    >
                      <option>Next 7 Days</option>
                      <option>Next 30 Days</option>
                      <option>Next 3 Months</option>
                      <option>Next Year</option>
                    </select>
                    <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none transition-transform group-hover:translate-y-[-40%]" size={20} />
                  </div>
                </div>
              </div>

              {/* Recurrence */}
              <div className="space-y-6">
                <label className="text-[11px] font-black tracking-[0.1em] text-slate-400 uppercase block">
                  Recurrence
                </label>
                <div className="flex flex-wrap gap-3">
                  {["daily", "weekly", "monthly", "one time"].map((item) => (
                    <button
                      key={item}
                      onClick={() => setRecurrence(item)}
                      className={`px-8 py-3.5 rounded-full text-sm font-bold capitalize transition-all duration-300 ${
                        recurrence === item
                          ? "bg-green-500 text-white shadow-xl shadow-green-500/30"
                          : "bg-slate-50 text-slate-400 hover:bg-slate-100"
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div className="space-y-6">
                <label className="text-[11px] font-black tracking-[0.1em] text-slate-400 uppercase block">
                  Optional Description / Action Plan
                </label>
                <textarea
                  rows="5"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detail the specific actions you'll take (e.g., Use public transit on rainy days instead of driving)."
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-5 text-slate-700 font-medium outline-none focus:ring-2 focus:ring-green-500/10 focus:bg-white transition-all resize-none placeholder:text-slate-300"
                />
              </div>

              {/* Form Footer */}
              <div className="pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-500">
                    <Target size={20} />
                  </div>
                  <p className="text-sm font-medium text-slate-500">
                    Estimated impact: <span className="text-slate-900 font-bold">~12.4 kg CO2e</span> saved per week.
                  </p>
                </div>
                <div className="flex items-center gap-4 w-full sm:w-auto">
                  <button 
                    onClick={() => navigate(-1)}
                    className="flex-1 sm:flex-none px-8 py-4 font-bold text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateGoal}
                    disabled={isSubmitting}
                    className="flex-1 sm:flex-none px-10 py-4 bg-green-500 text-white rounded-2xl font-bold shadow-xl shadow-green-500/20 hover:bg-green-600 hover:shadow-green-500/30 active:scale-95 transition-all flex items-center justify-center gap-2 group"
                  >
                    {isSubmitting ? "Creating..." : "Create Goal"}
                    {!isSubmitting && <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />}
                  </button>
                </div>
              </div>

            </div>
          </div>

          {/* Sidebar Widgets */}
          <div className="w-full lg:w-[380px] space-y-8">
            
            {/* Carbon Insight */}
            <div className="bg-green-50/50 rounded-3xl p-8 border border-green-100/50 space-y-6 backdrop-blur-sm">
              <h3 className="text-lg font-black text-green-700 tracking-tight">Carbon Insight</h3>
              <p className="text-[15px] leading-relaxed text-green-700/80 font-medium italic">
                “Did you know? Switching to a vegetarian diet for just one day a week can reduce your food carbon footprint by over 100kg of CO2 per year.”
              </p>
              <div className="inline-flex items-center gap-2 bg-white/80 px-4 py-2 rounded-full border border-green-200">
                <span className="text-[11px] font-black text-green-600 tracking-widest uppercase">Eco-Tip #42</span>
              </div>
            </div>

            {/* Ready to start? */}
            <div className="border-2 border-dashed border-slate-200 rounded-3xl p-10 flex flex-col items-center text-center space-y-6 hover:border-green-300 transition-colors group">
              <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-green-50 group-hover:text-green-400 transition-all">
                <Calendar size={32} />
              </div>
              <div className="space-y-2">
                <h4 className="text-lg font-bold text-slate-800">Ready to start?</h4>
                <p className="text-sm font-medium text-slate-400 leading-relaxed">
                  Your tracking begins as soon as you hit create.
                </p>
              </div>
            </div>

            {/* Sidebar Weekly Progress (Context from Image) */}
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 space-y-6">
              <div className="flex items-center justify-between">
                <h4 className="text-[11px] font-black tracking-[0.1em] text-slate-400 uppercase">Weekly Progress</h4>
                <span className="text-green-500 font-bold text-sm">65%</span>
              </div>
              <div className="w-full h-2.5 bg-slate-50 rounded-full overflow-hidden">
                <div className="h-full bg-green-500 rounded-full" style={{ width: "65%" }}></div>
              </div>
              <p className="text-xs font-bold text-slate-500">65% of weekly goal reached</p>
            </div>

          </div>

        </div>
      </main>
    </div>
  );
}