import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronLeft, Target, CheckCircle2, Plus, Loader2,
  X, Zap, Users, Check, XCircle, Trash2
} from "lucide-react";

const API = "http://localhost:8080";
function authHdr() {
  return { Authorization: `Bearer ${localStorage.getItem("token")}` };
}

const GoalPage = () => {
  const navigate = useNavigate();
  const [goals,       setGoals]       = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [logGoalId,   setLogGoalId]   = useState(null); // which goal to log progress on
  const [logAmount,   setLogAmount]   = useState("");
  const [submitting,  setSubmitting]  = useState(false);

  const [newGoal, setNewGoal] = useState({
    title: "", description: "", category: "transport", targetAmount: "", deadline: ""
  });

  const fetchGoals = async () => {
    try {
      const res = await fetch(`${API}/api/goals`, { headers: authHdr() });
      if (res.ok) setGoals(await res.json());
    } catch (err) { console.error("Fetch goals:", err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchGoals(); }, []);

  // FIX: shows ALL active personal goals, not just the first
  const activePersonalGoals = goals.filter(g => g.status === "ACTIVE" && !g.isCommunityGoal);
  const communityChallenges = goals.filter(g => g.isCommunityGoal && g.status === "ACTIVE");
  const pastGoals           = goals.filter(g => g.status !== "ACTIVE" && !g.isCommunityGoal);

  // Log progress on a specific goal
  const handleLog = async (goalId, kg) => {
    const amount = kg || parseFloat(logAmount);
    if (!amount || amount <= 0) return;
    setSubmitting(true);
    try {
      const res = await fetch(`${API}/api/goals/${goalId}/progress`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...authHdr() },
        body: JSON.stringify({ progress: (goals.find(g => g.id === goalId)?.currentProgress || 0) + amount }),
      });
      if (res.ok) { setLogGoalId(null); setLogAmount(""); fetchGoals(); }
    } catch (err) { console.error(err); }
    finally { setSubmitting(false); }
  };

  // Create personal goal
  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch(`${API}/api/goals`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHdr() },
        body: JSON.stringify({ ...newGoal, targetAmount: parseFloat(newGoal.targetAmount) }),
      });
      if (res.ok) {
        setIsModalOpen(false);
        setNewGoal({ title:"", description:"", category:"transport", targetAmount:"", deadline:"" });
        fetchGoals();
      }
    } catch (err) { console.error(err); }
    finally { setSubmitting(false); }
  };

  // Accept community challenge → creates personal copy
  const handleAccept = async (challengeId) => {
    setSubmitting(true);
    try {
      const res = await fetch(`${API}/api/goals/${challengeId}/accept`, {
        method: "POST", headers: authHdr(),
      });
      if (res.ok) fetchGoals();
      else {
        const err = await res.json().catch(() => ({}));
        alert(err.error || "Failed to accept challenge");
      }
    } catch (err) { console.error(err); }
    finally { setSubmitting(false); }
  };

  // Reject community challenge
  const handleReject = async (challengeId) => {
    try {
      await fetch(`${API}/api/goals/${challengeId}/reject`, {
        method: "POST", headers: authHdr(),
      });
      fetchGoals();
    } catch (err) { console.error(err); }
  };

  // Delete a personal goal
  const handleDelete = async (goalId) => {
    if (!confirm("Delete this goal?")) return;
    try {
      await fetch(`${API}/api/goals/${goalId}`, { method: "DELETE", headers: authHdr() });
      fetchGoals();
    } catch (err) { console.error(err); }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAF9]">
      <Loader2 className="animate-spin text-emerald-500" size={32} />
    </div>
  );

  return (
    <div className="bg-[#F8FAF9] min-h-screen p-4 sm:p-6 font-sans text-slate-700">
      <header className="max-w-2xl mx-auto mb-6 flex items-center gap-4">
        <button onClick={() => navigate("/dashboard")} className="p-2 hover:bg-white rounded-full transition-colors">
          <ChevronLeft size={24} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Eco Goals</h1>
          <p className="text-sm text-gray-400">Personal & Community Milestones</p>
        </div>
      </header>

      <main className="max-w-2xl mx-auto space-y-5 pb-20">

        {/* ── COMMUNITY CHALLENGES (from Admin) ─────────────────────────── */}
        {communityChallenges.length > 0 && (
          <section className="space-y-3">
            <div className="flex items-center gap-2 ml-1">
              <Users size={17} className="text-emerald-600" />
              <h3 className="font-bold text-gray-800 tracking-tight">Community Challenges</h3>
              <span className="text-xs text-gray-400">({communityChallenges.length})</span>
            </div>
            {communityChallenges.map(ch => (
              <div key={ch.id} className="bg-emerald-600 rounded-[24px] p-5 shadow-lg text-white relative overflow-hidden">
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="text-base font-bold leading-snug flex-1 mr-2">{ch.title}</h4>
                    <span className="bg-white/20 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase flex-shrink-0">Admin</span>
                  </div>
                  {ch.description && <p className="text-emerald-50 text-xs mb-3 opacity-90">{ch.description}</p>}
                  <div className="flex items-center gap-2 text-[10px] text-emerald-200 mb-4">
                    <span>🎯 {ch.targetAmount} kg · {ch.category}</span>
                    {ch.deadline && <span>· 📅 {ch.deadline}</span>}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAccept(ch.id)}
                      disabled={submitting}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-white text-emerald-700 rounded-xl font-bold text-sm hover:bg-emerald-50 transition"
                    >
                      <Check size={15} /> Accept
                    </button>
                    <button
                      onClick={() => handleReject(ch.id)}
                      className="px-4 py-2.5 bg-white/20 text-white rounded-xl font-bold text-sm hover:bg-white/30 transition flex items-center gap-1.5"
                    >
                      <XCircle size={15} /> Decline
                    </button>
                  </div>
                </div>
                <div className="absolute -right-8 -top-8 w-28 h-28 bg-white/10 rounded-full" />
              </div>
            ))}
          </section>
        )}

        {/* ── ALL ACTIVE PERSONAL GOALS ────────────────────────────────── */}
        <section className="space-y-4">
          <div className="flex items-center justify-between ml-1">
            <div className="flex items-center gap-2">
              <Target size={17} className="text-emerald-600" />
              <h3 className="font-bold text-gray-800">My Active Goals</h3>
              <span className="text-xs text-gray-400">({activePersonalGoals.length})</span>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-1 text-xs font-bold text-emerald-600 hover:underline"
            >
              <Plus size={13} /> New Goal
            </button>
          </div>

          {activePersonalGoals.length === 0 ? (
            <div className="bg-white rounded-[24px] p-8 shadow-sm border border-gray-100 text-center">
              <p className="text-gray-400 font-medium mb-3">No personal goals active yet.</p>
              <button onClick={() => setIsModalOpen(true)} className="text-emerald-600 font-bold text-sm hover:underline">
                + Start your first goal
              </button>
            </div>
          ) : (
            activePersonalGoals.map(goal => (
              <div key={goal.id} className="bg-white rounded-[24px] p-5 shadow-sm border border-gray-100">
                {/* Goal header */}
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-bold text-gray-800 text-base">{goal.title}</h3>
                    <p className="text-xs text-gray-400 capitalize mt-0.5">{goal.category} · Target: {goal.targetAmount} kg</p>
                  </div>
                  <button onClick={() => handleDelete(goal.id)} className="p-1.5 hover:bg-red-50 rounded-xl text-gray-300 hover:text-red-400 transition">
                    <Trash2 size={14} />
                  </button>
                </div>

                {/* Progress bar */}
                <div className="mb-4">
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-gray-400 font-medium">Progress</span>
                    <span className="font-black text-emerald-600">{goal.progressPercentage}%</span>
                  </div>
                  <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-500 h-full transition-all duration-700"
                      style={{ width: `${goal.progressPercentage}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                    <span>{(goal.currentProgress || 0).toFixed(1)} kg logged</span>
                    <span>{(goal.targetAmount - (goal.currentProgress || 0)).toFixed(1)} kg remaining</span>
                  </div>
                </div>

                {/* Quick log buttons */}
                {logGoalId === goal.id ? (
                  <div className="flex gap-2">
                    <input
                      type="number" min="0.1" step="0.1"
                      placeholder="Enter kg..."
                      value={logAmount} onChange={e => setLogAmount(e.target.value)}
                      className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-emerald-500"
                    />
                    <button onClick={() => handleLog(goal.id)} disabled={submitting}
                      className="px-4 py-2 bg-emerald-600 text-white rounded-xl font-bold text-sm hover:bg-emerald-700 disabled:opacity-60">
                      {submitting ? "..." : "Log"}
                    </button>
                    <button onClick={() => setLogGoalId(null)}
                      className="px-3 py-2 bg-gray-100 text-gray-500 rounded-xl text-sm hover:bg-gray-200">
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    {[1, 2.5, 5].map(kg => (
                      <button key={kg} onClick={() => handleLog(goal.id, kg)}
                        className="flex-1 flex items-center justify-center gap-1 py-2 bg-emerald-50 text-emerald-700 rounded-xl font-bold text-xs hover:bg-emerald-100 transition">
                        <Zap size={11} /> +{kg}kg
                      </button>
                    ))}
                    <button onClick={() => setLogGoalId(goal.id)}
                      className="flex-1 py-2 bg-gray-50 text-gray-500 rounded-xl font-bold text-xs hover:bg-gray-100 transition">
                      Custom
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </section>

        {/* ── GOAL HISTORY ─────────────────────────────────────────────── */}
        <section className="bg-white rounded-[24px] p-5 shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-800 mb-4">Goal History</h3>
          {pastGoals.length === 0 ? (
            <p className="text-center text-xs text-gray-400 py-4">No completed goals yet.</p>
          ) : (
            <div className="space-y-3">
              {pastGoals.map(goal => (
                <div key={goal.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <div className={`p-1.5 rounded-full ${goal.status === "COMPLETED" ? "bg-emerald-100 text-emerald-500" : "bg-gray-100 text-gray-400"}`}>
                      <CheckCircle2 size={15} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-700">{goal.title}</p>
                      <p className="text-[10px] text-gray-400 capitalize">{goal.category} · {goal.targetAmount} kg</p>
                    </div>
                  </div>
                  <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                    goal.status === "COMPLETED"
                      ? "bg-emerald-100 text-emerald-600"
                      : "bg-gray-100 text-gray-400"
                  }`}>{goal.status}</span>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* ── CREATE GOAL MODAL ────────────────────────────────────────────── */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[28px] p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-gray-800">Set New Eco Goal</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-1.5 hover:bg-gray-100 rounded-xl"><X size={18} className="text-gray-400" /></button>
            </div>
            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">Goal Title *</label>
                <input required value={newGoal.title} onChange={e => setNewGoal({...newGoal, title:e.target.value})}
                  placeholder="e.g. Reduce Car Travel"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 outline-none focus:border-emerald-500 text-sm" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">Description</label>
                <input value={newGoal.description} onChange={e => setNewGoal({...newGoal, description:e.target.value})}
                  placeholder="Optional notes…"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 outline-none focus:border-emerald-500 text-sm" />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">Category</label>
                  <select value={newGoal.category} onChange={e => setNewGoal({...newGoal, category:e.target.value})}
                    className="w-full px-3 py-3 rounded-xl border border-gray-200 bg-gray-50 outline-none focus:border-emerald-500 text-sm">
                    {["transport","food","energy","shopping","general"].map(c => (
                      <option key={c} value={c}>{c.charAt(0).toUpperCase()+c.slice(1)}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">Target (kg)*</label>
                  <input required type="number" min="1" value={newGoal.targetAmount}
                    onChange={e => setNewGoal({...newGoal, targetAmount:e.target.value})} placeholder="50"
                    className="w-full px-3 py-3 rounded-xl border border-gray-200 bg-gray-50 outline-none focus:border-emerald-500 text-sm" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">Deadline *</label>
                  <input required type="date" value={newGoal.deadline}
                    onChange={e => setNewGoal({...newGoal, deadline:e.target.value})}
                    className="w-full px-3 py-3 rounded-xl border border-gray-200 bg-gray-50 outline-none focus:border-emerald-500 text-sm" />
                </div>
              </div>
              <button type="submit" disabled={submitting}
                className="w-full py-3.5 bg-emerald-600 text-white rounded-xl font-bold text-sm hover:bg-emerald-700 transition disabled:opacity-60 flex items-center justify-center gap-2 mt-2">
                {submitting ? <><Loader2 className="animate-spin" size={16} /> Creating…</> : <><Plus size={16} /> Create Goal</>}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GoalPage;
