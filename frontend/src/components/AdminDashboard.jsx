import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Shield, Users, Leaf, Target, TrendingUp,
  Plus, Edit2, Trash2, X, Loader2, CheckCircle, AlertCircle,
  BarChart3, Award, Car, Zap, TreePine, Bike, Recycle,
  Sun, Droplets, Sparkles, ShieldCheck, ChevronLeft, RefreshCw
} from "lucide-react";
import axios from "axios";

// ── Icon map: must match what backend stores as badge.icon ──
const ICON_COMPONENTS = {
  Leaf, Car, Zap, TreePine, Bike, Recycle, Sun, Droplets,
  Award, Target, Shield, Sparkles, ShieldCheck,
};

const ICON_OPTIONS = [
  "Leaf","Car","Zap","TreePine","Bike","Recycle",
  "Sun","Droplets","Award","Target","Shield","Sparkles","ShieldCheck",
];

const COLOR_OPTIONS = [
  { label:"Green",   color:"text-green-600",   bg:"bg-green-100"   },
  { label:"Blue",    color:"text-blue-600",    bg:"bg-blue-100"    },
  { label:"Yellow",  color:"text-yellow-600",  bg:"bg-yellow-100"  },
  { label:"Red",     color:"text-red-600",     bg:"bg-red-100"     },
  { label:"Purple",  color:"text-purple-600",  bg:"bg-purple-100"  },
  { label:"Orange",  color:"text-orange-600",  bg:"bg-orange-100"  },
  { label:"Emerald", color:"text-emerald-600", bg:"bg-emerald-100" },
  { label:"Teal",    color:"text-teal-600",    bg:"bg-teal-100"    },
];

const emptyBadge = {
  name:"", description:"", icon:"Leaf", category:"general",
  thresholdKg:0, color:"text-green-600", bgColor:"bg-green-100", active:true,
};

function getToken()    { return localStorage.getItem("token"); }
function authHeaders() { return { headers: { Authorization: `Bearer ${getToken()}` } }; }

// Render the actual Lucide icon stored as a string name
function BadgeIcon({ iconName, className }) {
  const Comp = ICON_COMPONENTS[iconName] || Award;
  return <Comp className={className} />;
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [tab, setTab]             = useState("overview");
  const [analytics, setAnalytics] = useState(null);
  const [users, setUsers]         = useState([]);
  const [badges, setBadges]       = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState("");
  const [showBadgeModal, setShowBadgeModal] = useState(false);
  const [editingBadge, setEditingBadge]     = useState(null);
  const [badgeForm, setBadgeForm] = useState(emptyBadge);
  const [saving, setSaving]       = useState(false);
  const [goalForm, setGoalForm]   = useState({
    title:"", description:"", category:"transport", targetAmount:"",
    deadline: new Date(Date.now()+30*86400000).toISOString().split("T")[0],
  });
  const [postingGoal, setPostingGoal] = useState(false);
  const [successMsg, setSuccessMsg]   = useState("");

  const showSuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(""), 3500);
  };

  // ── Load all admin data ──
  // Uses Promise.allSettled so a single failing endpoint doesn't crash the whole page
  const loadAll = async () => {
    setLoading(true);
    setError("");
    try {
      const token = getToken();
      if (!token) { navigate("/"); return; }

      const [aResult, uResult, bResult] = await Promise.allSettled([
        axios.get("http://localhost:8080/api/admin/analytics", authHeaders()),
        axios.get("http://localhost:8080/api/admin/users",     authHeaders()),
        axios.get("http://localhost:8080/api/admin/badges",    authHeaders()),
      ]);

      // Analytics
      if (aResult.status === "fulfilled") {
        setAnalytics(aResult.value.data);
      } else {
        const status = aResult.reason?.response?.status;
        const msg    = aResult.reason?.response?.data?.error || aResult.reason?.message || "Unknown error";
        if (status === 403) {
          setError("Access denied — you need ADMIN role. Run: UPDATE users SET role='ADMIN' WHERE email='your@email.com';");
        } else if (status === 401) {
          setError("Session expired. Please log in again.");
          setTimeout(() => navigate("/"), 2000);
          return;
        } else {
          setError(`Analytics failed: ${msg}. Make sure the backend is running at localhost:8080.`);
        }
      }

      // Users
      if (uResult.status === "fulfilled") {
        setUsers(Array.isArray(uResult.value.data) ? uResult.value.data : []);
      }

      // Badges — normalise field names from the Badge entity
      if (bResult.status === "fulfilled") {
        const raw = Array.isArray(bResult.value.data) ? bResult.value.data : [];
        setBadges(raw.map(b => ({
          ...b,
          bgColor: b.bgColor || "bg-green-100",
          color:   b.color   || "text-green-600",
          icon:    b.icon    || "Award",
        })));
      }

    } catch (err) {
      setError(`Unexpected error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadAll(); }, []);

  // ── Badge CRUD ──
  const openCreate = () => { setEditingBadge(null); setBadgeForm(emptyBadge); setShowBadgeModal(true); };
  const openEdit = (b) => {
    setEditingBadge(b);
    setBadgeForm({
      name:        b.name        || "",
      description: b.description || "",
      icon:        b.icon        || "Leaf",
      category:    b.category    || "general",
      thresholdKg: b.thresholdKg ?? 0,
      color:       b.color       || "text-green-600",
      bgColor:     b.bgColor     || "bg-green-100",
      active:      b.active      ?? true,
    });
    setShowBadgeModal(true);
  };

  const saveBadge = async () => {
    if (!badgeForm.name.trim())        { alert("Badge name is required"); return; }
    if (!badgeForm.description.trim()) { alert("Description is required"); return; }
    setSaving(true);
    try {
      const payload = { ...badgeForm, thresholdKg: Number(badgeForm.thresholdKg) || 0 };
      if (editingBadge) {
        await axios.put(`http://localhost:8080/api/admin/badges/${editingBadge.id}`, payload, authHeaders());
        showSuccess("Badge updated successfully!");
      } else {
        await axios.post("http://localhost:8080/api/admin/badges", payload, authHeaders());
        showSuccess("Badge created! Users can now earn it.");
      }
      setShowBadgeModal(false);
      loadAll();
    } catch (e) {
      alert(e.response?.data?.error || e.message || "Failed to save badge");
    } finally {
      setSaving(false);
    }
  };

  const deleteBadge = async (id) => {
    if (!confirm("Delete this badge? Users will no longer see it.")) return;
    try {
      await axios.delete(`http://localhost:8080/api/admin/badges/${id}`, authHeaders());
      showSuccess("Badge deleted.");
      loadAll();
    } catch (e) {
      alert(e.response?.data?.error || "Failed to delete badge");
    }
  };

  const changeRole = async (userId, currentRole) => {
    const newRole = currentRole === "ADMIN" ? "USER" : "ADMIN";
    if (!confirm(`Change role to ${newRole}?`)) return;
    try {
      await axios.put(`http://localhost:8080/api/admin/users/${userId}/role`, { role: newRole }, authHeaders());
      showSuccess(`Role changed to ${newRole}`);
      loadAll();
    } catch (e) {
      alert(e.response?.data?.error || "Failed to change role");
    }
  };

  const postGoal = async () => {
    if (!goalForm.title.trim()) { alert("Title is required"); return; }
    if (!goalForm.targetAmount) { alert("Target amount is required"); return; }
    setPostingGoal(true);
    try {
      await axios.post(
        "http://localhost:8080/api/admin/goals",
        { ...goalForm, targetAmount: parseFloat(goalForm.targetAmount) },
        authHeaders()
      );
      showSuccess("Community goal posted! All users can now see it in their Goals page.");
      setGoalForm({
        title:"", description:"", category:"transport", targetAmount:"",
        deadline: new Date(Date.now()+30*86400000).toISOString().split("T")[0],
      });
    } catch (e) {
      alert(e.response?.data?.error || "Failed to post goal");
    } finally {
      setPostingGoal(false);
    }
  };

  const breakdown      = Object.entries(analytics?.categoryBreakdown ?? {});
  const totalBreakdown = breakdown.reduce((s, [, v]) => s + v, 0) || 1;

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mx-auto mb-3" />
        <p className="text-slate-500 text-sm font-medium">Loading admin data…</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 font-sans">

      {successMsg && (
        <div className="fixed top-4 right-4 z-50 bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-xl text-sm font-semibold flex items-center gap-2">
          <CheckCircle className="w-4 h-4" /> {successMsg}
        </div>
      )}

      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center gap-4 sticky top-0 z-40">
        <button onClick={() => navigate("/dashboard")} className="p-2 hover:bg-slate-100 rounded-xl transition">
          <ChevronLeft className="w-5 h-5 text-slate-500" />
        </button>
        <div className="flex items-center gap-3 flex-1">
          <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-800">Admin Dashboard</h1>
            <p className="text-xs text-slate-500">Community management & aggregate analytics</p>
          </div>
        </div>
        <button onClick={loadAll}
          className="flex items-center gap-2 px-3 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-semibold text-slate-600 transition">
          <RefreshCw className="w-3.5 h-3.5" /> Refresh
        </button>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-6">

        {/* Error banner */}
        {error && (
          <div className="mb-5 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-sm">
            <p className="font-bold mb-1">⚠️ Error loading admin data</p>
            <p>{error}</p>
            <button onClick={loadAll} className="mt-2 text-xs text-red-600 underline font-semibold">Try again</button>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {["overview","users","badges","goals"].map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-5 py-2.5 rounded-2xl text-sm font-semibold transition ${
                tab === t
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-100"
                  : "bg-white text-slate-600 border border-slate-200 hover:border-emerald-300"
              }`}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
              {t === "badges" && badges.length > 0 && (
                <span className="ml-2 bg-white/20 text-xs px-1.5 py-0.5 rounded-full">{badges.length}</span>
              )}
              {t === "users" && users.length > 0 && (
                <span className="ml-2 bg-white/20 text-xs px-1.5 py-0.5 rounded-full">{users.length}</span>
              )}
            </button>
          ))}
        </div>

        {/* ── OVERVIEW TAB ── */}
        {tab === "overview" && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label:"Total Users",       value: analytics?.totalUsers       ?? "—", icon: Users,      bg:"bg-blue-50",   text:"text-blue-600"   },
                { label:"Total CO₂e (kg)",   value: analytics?.totalCarbonKg    ?? "—", icon: Leaf,       bg:"bg-green-50",  text:"text-green-600"  },
                { label:"Avg per User (kg)", value: analytics?.avgCarbonPerUser ?? "—", icon: TrendingUp,  bg:"bg-yellow-50", text:"text-yellow-600" },
                { label:"Goals Created",     value: analytics?.totalGoals       ?? "—", icon: Target,     bg:"bg-purple-50", text:"text-purple-600" },
              ].map((k, i) => (
                <div key={i} className="bg-white rounded-3xl border border-slate-100 p-5 shadow-sm">
                  <div className={`w-10 h-10 ${k.bg} rounded-xl flex items-center justify-center mb-3`}>
                    <k.icon className={`w-5 h-5 ${k.text}`} />
                  </div>
                  <p className="text-2xl font-black text-slate-800">{k.value}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{k.label}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Category Breakdown */}
              <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm">
                <h3 className="font-bold text-slate-800 mb-1 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-emerald-600" /> Category Popularity
                </h3>
                <p className="text-xs text-slate-500 mb-5">Most logged categories system-wide</p>
                {breakdown.length > 0 ? (
                  <div className="space-y-3">
                    {breakdown.map(([cat, val]) => (
                      <div key={cat}>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="font-semibold text-slate-700 capitalize">{cat}</span>
                          <span className="text-slate-400 font-medium">{val} kg</span>
                        </div>
                        <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-500 rounded-full transition-all duration-700"
                            style={{ width: `${Math.min((val / totalBreakdown) * 100, 100)}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-10 text-center text-slate-400 text-sm">
                    No carbon entries logged yet by any user.
                    <p className="text-xs mt-1">Users need to complete the lifestyle survey first.</p>
                  </div>
                )}
              </div>

              {/* Community Stats */}
              <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm">
                <h3 className="font-bold text-slate-800 mb-5">Community Stats</h3>
                <div className="space-y-3">
                  {[
                    ["Total Community CO₂e",       `${analytics?.totalCarbonKg    ?? 0} kg`],
                    ["Average Footprint / User",   `${analytics?.avgCarbonPerUser ?? 0} kg`],
                    ["Global Average (benchmark)", "4,000 kg / year"],
                    ["Goals Completed",            `${analytics?.completedGoals   ?? 0} / ${analytics?.totalGoals ?? 0}`],
                    ["Active Carbon Trackers",     `${analytics?.activeUsers      ?? 0} users`],
                    ["Badges Created (admin)",     `${badges.length}`],
                  ].map(([label, val]) => (
                    <div key={label} className="flex justify-between items-center p-3 bg-slate-50 rounded-2xl">
                      <span className="text-sm text-slate-600">{label}</span>
                      <span className="font-bold text-slate-800 text-sm">{val}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Top Users */}
            <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm">
              <h3 className="font-bold text-slate-800 mb-4">Top Carbon Loggers</h3>
              {(analytics?.topUsers ?? []).length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-100">
                        {["#","Name","Email","Role","Total kg CO₂e"].map((h, i) => (
                          <th key={h} className={`py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wide ${i >= 4 ? "text-right" : "text-left"}`}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {analytics.topUsers.map((u, i) => (
                        <tr key={u.id ?? i} className="border-b border-slate-50 hover:bg-slate-50 transition">
                          <td className="py-3 px-4 text-sm font-bold text-slate-400">{i+1}</td>
                          <td className="py-3 px-4 text-sm font-semibold text-slate-800">{u.name}</td>
                          <td className="py-3 px-4 text-sm text-slate-500">{u.email}</td>
                          <td className="py-3 px-4">
                            <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${u.role === "ADMIN" ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"}`}>
                              {u.role ?? "USER"}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-sm font-bold text-slate-800 text-right">{u.totalKg}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="py-10 text-center text-slate-400 text-sm">
                  No users have logged carbon entries yet.
                  <p className="text-xs mt-1">Once users complete the lifestyle survey or add entries, they'll appear here.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── USERS TAB ── */}
        {tab === "users" && (
          <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm">
            <h3 className="font-bold text-slate-800 mb-5">All Users ({users.length})</h3>
            {users.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-100">
                      {["Name","Email","Role","Verified","Total CO₂e","Action"].map(h => (
                        <th key={h} className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wide text-left">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(u => (
                      <tr key={u.id} className="border-b border-slate-50 hover:bg-slate-50 transition">
                        <td className="py-3 px-4 text-sm font-semibold text-slate-800">{u.name}</td>
                        <td className="py-3 px-4 text-sm text-slate-500">{u.email}</td>
                        <td className="py-3 px-4">
                          <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${u.role === "ADMIN" ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"}`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          {u.enabled
                            ? <CheckCircle className="w-4 h-4 text-emerald-500" />
                            : <AlertCircle className="w-4 h-4 text-red-400" />}
                        </td>
                        <td className="py-3 px-4 text-sm font-bold text-slate-800">{u.totalKg} kg</td>
                        <td className="py-3 px-4">
                          <button onClick={() => changeRole(u.id, u.role)}
                            className="text-xs text-emerald-600 hover:underline font-semibold">
                            {u.role === "ADMIN" ? "Remove Admin" : "Make Admin"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-center text-slate-400 text-sm py-10">No users found.</p>
            )}
          </div>
        )}

        {/* ── BADGES TAB ── */}
        {tab === "badges" && (
          <div>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="font-bold text-slate-800 text-lg">Badge Management</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {badges.length} badge{badges.length !== 1 ? "s" : ""} — appear in users' Eco Gallery immediately
                </p>
              </div>
              <button onClick={openCreate}
                className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-2xl text-sm font-semibold hover:bg-emerald-700 transition shadow-md">
                <Plus className="w-4 h-4" /> New Badge
              </button>
            </div>

            {badges.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {badges.map(badge => (
                  <div key={badge.id} className="bg-white rounded-3xl border border-slate-100 p-5 shadow-sm">
                    <div className="flex items-start justify-between mb-4">
                      {/* FIX: renders the actual stored icon, not always Award */}
                      <div className={`w-12 h-12 rounded-2xl ${badge.bgColor} flex items-center justify-center`}>
                        <BadgeIcon iconName={badge.icon} className={`w-6 h-6 ${badge.color}`} />
                      </div>
                      <div className="flex gap-1">
                        <button onClick={() => openEdit(badge)}
                          className="p-1.5 hover:bg-slate-100 rounded-xl transition" title="Edit">
                          <Edit2 className="w-4 h-4 text-slate-400" />
                        </button>
                        <button onClick={() => deleteBadge(badge.id)}
                          className="p-1.5 hover:bg-red-50 rounded-xl transition" title="Delete">
                          <Trash2 className="w-4 h-4 text-red-400" />
                        </button>
                      </div>
                    </div>
                    <p className="font-bold text-slate-800 mb-1">{badge.name}</p>
                    <p className="text-xs text-slate-500 mb-3 leading-relaxed">{badge.description}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-slate-400 capitalize bg-slate-50 px-2 py-0.5 rounded-full">{badge.category}</span>
                      <span className="text-xs font-semibold text-slate-600">{badge.thresholdKg} kg threshold</span>
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${badge.active ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                        {badge.active ? "● Active" : "○ Inactive"}
                      </span>
                      <span className="text-xs text-slate-400">Icon: {badge.icon}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-3xl border border-slate-100 p-12 text-center shadow-sm">
                <Award className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 font-medium mb-1">No badges created yet</p>
                <p className="text-slate-400 text-sm mb-4">Create badges that users earn based on their carbon activities</p>
                <button onClick={openCreate}
                  className="px-6 py-2.5 bg-emerald-600 text-white rounded-2xl text-sm font-semibold hover:bg-emerald-700 transition">
                  Create First Badge
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── GOALS TAB ── */}
        {tab === "goals" && (
          <div className="max-w-2xl">
            <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm">
              <h3 className="font-bold text-slate-800 mb-1">Post Community Challenge</h3>
              <p className="text-sm text-slate-500 mb-5">
                Create a global sustainability goal. It will be visible to all users in their <strong>Goals page</strong> as a community challenge.
              </p>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">Goal Title *</label>
                  <input value={goalForm.title} onChange={e => setGoalForm(f=>({...f, title:e.target.value}))}
                    placeholder="e.g. Community Transport Challenge — Reduce by 20%"
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">Description</label>
                  <textarea value={goalForm.description} onChange={e => setGoalForm(f=>({...f, description:e.target.value}))}
                    placeholder="Describe the community challenge and how users can participate…"
                    rows={3}
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition text-sm resize-none" />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">Category</label>
                    <select value={goalForm.category} onChange={e => setGoalForm(f=>({...f, category:e.target.value}))}
                      className="w-full px-3 py-3 rounded-2xl border border-slate-200 bg-slate-50 outline-none focus:border-emerald-500 transition text-sm">
                      {["transport","energy","food","shopping","general"].map(c =>
                        <option key={c} value={c}>{c.charAt(0).toUpperCase()+c.slice(1)}</option>
                      )}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">Target (kg CO₂e) *</label>
                    <input type="number" min="1" value={goalForm.targetAmount}
                      onChange={e => setGoalForm(f=>({...f, targetAmount:e.target.value}))}
                      placeholder="500"
                      className="w-full px-3 py-3 rounded-2xl border border-slate-200 bg-slate-50 outline-none focus:border-emerald-500 transition text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">Deadline *</label>
                    <input type="date" value={goalForm.deadline}
                      onChange={e => setGoalForm(f=>({...f, deadline:e.target.value}))}
                      className="w-full px-3 py-3 rounded-2xl border border-slate-200 bg-slate-50 outline-none focus:border-emerald-500 transition text-sm" />
                  </div>
                </div>
                <button onClick={postGoal} disabled={postingGoal}
                  className="w-full py-3.5 bg-emerald-600 text-white rounded-2xl font-semibold text-sm hover:bg-emerald-700 transition disabled:opacity-60 flex items-center justify-center gap-2 shadow-md">
                  {postingGoal
                    ? <><Loader2 className="w-4 h-4 animate-spin" />Posting…</>
                    : <><Plus className="w-4 h-4" />Post Community Goal</>}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Badge Modal ── */}
      {showBadgeModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-slate-800">{editingBadge ? "Edit Badge" : "Create New Badge"}</h3>
              <button onClick={() => setShowBadgeModal(false)} className="p-1.5 hover:bg-slate-100 rounded-xl transition">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">Badge Name *</label>
                <input value={badgeForm.name} onChange={e => setBadgeForm(f=>({...f, name:e.target.value}))}
                  placeholder="e.g. Tree Planter"
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition text-sm" />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">Description *</label>
                <input value={badgeForm.description} onChange={e => setBadgeForm(f=>({...f, description:e.target.value}))}
                  placeholder="e.g. Save 50 kg CO₂e through transport choices"
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition text-sm" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">Category</label>
                  <select value={badgeForm.category} onChange={e => setBadgeForm(f=>({...f, category:e.target.value}))}
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 outline-none focus:border-emerald-500 transition text-sm">
                    {["transport","energy","food","general"].map(c =>
                      <option key={c} value={c}>{c.charAt(0).toUpperCase()+c.slice(1)}</option>
                    )}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">Threshold (kg CO₂e)</label>
                  <input type="number" min="0" step="0.1" value={badgeForm.thresholdKg}
                    onChange={e => setBadgeForm(f=>({...f, thresholdKg:parseFloat(e.target.value)||0}))}
                    placeholder="50"
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 outline-none focus:border-emerald-500 transition text-sm" />
                  <p className="text-xs text-slate-400 mt-1">Users earn this when total CO₂e ≥ threshold</p>
                </div>
              </div>

              {/* Icon picker — shows actual Lucide icon next to the name */}
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-2">Icon (select one)</label>
                <div className="flex flex-wrap gap-2">
                  {ICON_OPTIONS.map(iconName => {
                    const Comp = ICON_COMPONENTS[iconName] || Award;
                    const sel  = badgeForm.icon === iconName;
                    return (
                      <button key={iconName} type="button"
                        onClick={() => setBadgeForm(f=>({...f, icon:iconName}))}
                        className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-xl border transition font-medium ${
                          sel
                            ? "border-emerald-500 bg-emerald-50 text-emerald-700 shadow-sm"
                            : "border-slate-200 text-slate-500 hover:border-emerald-300 bg-white"
                        }`}>
                        <Comp className="w-3.5 h-3.5" />
                        {iconName}
                      </button>
                    );
                  })}
                </div>
                <p className="text-xs text-slate-400 mt-1">Selected: <strong className="text-slate-600">{badgeForm.icon}</strong></p>
              </div>

              {/* Color picker */}
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-2">Color Theme</label>
                <div className="flex flex-wrap gap-2">
                  {COLOR_OPTIONS.map(opt => (
                    <button key={opt.label} type="button"
                      onClick={() => setBadgeForm(f=>({...f, color:opt.color, bgColor:opt.bg}))}
                      className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-xl border transition font-medium ${
                        badgeForm.color === opt.color
                          ? "border-emerald-500 bg-emerald-50 text-emerald-700 shadow-sm"
                          : "border-slate-200 text-slate-500 hover:border-emerald-300 bg-white"
                      }`}>
                      <span className={`w-3 h-3 rounded-full ${opt.bg} border border-slate-200 shadow-sm`} />
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Live Preview — now shows the CORRECT selected icon + color */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">Live Preview</p>
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-2xl ${badgeForm.bgColor} flex items-center justify-center shadow-sm`}>
                    <BadgeIcon iconName={badgeForm.icon} className={`w-7 h-7 ${badgeForm.color}`} />
                  </div>
                  <div>
                    <p className="font-bold text-slate-800">{badgeForm.name || "Badge Name"}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{badgeForm.description || "Badge description"}</p>
                    <p className="text-xs text-emerald-600 font-semibold mt-1">
                      Threshold: {badgeForm.thresholdKg} kg CO₂e · Icon: {badgeForm.icon}
                    </p>
                  </div>
                </div>
              </div>

              <label className="flex items-center gap-3 cursor-pointer p-3 bg-slate-50 rounded-2xl">
                <input type="checkbox" checked={badgeForm.active}
                  onChange={e => setBadgeForm(f=>({...f, active:e.target.checked}))}
                  className="w-4 h-4 accent-emerald-600" />
                <div>
                  <p className="text-sm font-semibold text-slate-700">Active (visible to users)</p>
                  <p className="text-xs text-slate-400">Inactive badges are hidden from users' badge gallery</p>
                </div>
              </label>

              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowBadgeModal(false)}
                  className="flex-1 py-3 border border-slate-200 text-slate-600 rounded-2xl text-sm font-semibold hover:bg-slate-50 transition">
                  Cancel
                </button>
                <button onClick={saveBadge} disabled={saving}
                  className="flex-1 py-3 bg-emerald-600 text-white rounded-2xl text-sm font-semibold hover:bg-emerald-700 transition disabled:opacity-60 flex items-center justify-center gap-2">
                  {saving
                    ? <><Loader2 className="w-4 h-4 animate-spin" />Saving…</>
                    : editingBadge ? "Update Badge" : "Create Badge"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
