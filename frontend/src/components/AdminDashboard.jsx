import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Shield, Users, Leaf, Target, TrendingUp, Plus, Edit2, Trash2,
  X, Loader2, CheckCircle, AlertCircle, BarChart3, Award, Car,
  Zap, TreePine, Bike, Recycle, Sun, Droplets, Sparkles,
  ShieldCheck, RefreshCw, ShoppingBag, Bell, Package, Send,
  CreditCard, Calendar, BarChart2
} from "lucide-react";
import axios from "axios";

// ─── Icon helpers ─────────────────────────────────────────────────────────────
const ICON_COMPONENTS = {
  Leaf, Car, Zap, TreePine, Bike, Recycle, Sun, Droplets,
  Award, Target, Shield, Sparkles, ShieldCheck,
};

const ICON_OPTIONS = ["Leaf","Car","Zap","TreePine","Bike","Recycle","Sun","Droplets","Award","Target","Shield","Sparkles","ShieldCheck"];
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

function BadgeIcon({ iconName, className }) {
  const C = ICON_COMPONENTS[iconName] || Award;
  return <C className={className} />;
}

// ─── Built-in badges (mirrors BadgeController.java exactly) ──────────────────
const BUILTIN_BADGES = [
  { name:"Eco Starter",     description:"Complete your first lifestyle survey",      icon:"Sparkles",    bgColor:"bg-emerald-100", color:"text-emerald-600", thresholdKg:0,   category:"general"   },
  { name:"Transport Pro",   description:"Log 30 kg of transport emissions",           icon:"Car",         bgColor:"bg-blue-100",    color:"text-blue-600",    thresholdKg:30,  category:"transport" },
  { name:"Energy Saver",    description:"Log 10 kg of energy emissions",             icon:"Zap",         bgColor:"bg-yellow-100",  color:"text-yellow-600",  thresholdKg:10,  category:"energy"    },
  { name:"Tree Planter",    description:"Save 50 kg CO₂e total",                     icon:"Leaf",        bgColor:"bg-green-100",   color:"text-green-600",   thresholdKg:50,  category:"general"   },
  { name:"Nature Guardian", description:"Save 100 kg CO₂e total",                   icon:"TreePine",    bgColor:"bg-teal-100",    color:"text-teal-600",    thresholdKg:100, category:"general"   },
  { name:"Eco Master",      description:"Save 200 kg CO₂e total",                   icon:"ShieldCheck", bgColor:"bg-purple-100",  color:"text-purple-600",  thresholdKg:200, category:"general"   },
  { name:"Green Commuter",  description:"Use bicycle or walking as main transport",  icon:"Car",         bgColor:"bg-cyan-100",    color:"text-cyan-600",    thresholdKg:0,   category:"transport" },
  { name:"Renewable Hero",  description:"Enable renewable energy in survey",          icon:"Zap",         bgColor:"bg-orange-100",  color:"text-orange-600",  thresholdKg:0,   category:"energy"    },
  { name:"Plant Based Pro", description:"Choose vegan/vegetarian diet in survey",    icon:"Leaf",        bgColor:"bg-lime-100",    color:"text-lime-600",    thresholdKg:0,   category:"food"      },
  { name:"Goal Crusher",    description:"Log 10 kg of food emissions",               icon:"Award",       bgColor:"bg-rose-100",    color:"text-rose-600",    thresholdKg:10,  category:"food"      },
];

const emptyBadge = { name:"", description:"", icon:"Leaf", category:"general", thresholdKg:0, color:"text-green-600", bgColor:"bg-green-100", active:true };
const emptyItem  = { name:"", description:"", cost:0, offsetValue:0, category:"Forestry" };

function getToken()    { return localStorage.getItem("token"); }
function authHdr()     { return { headers: { Authorization:`Bearer ${getToken()}` } }; }

// ─── Tabs config ──────────────────────────────────────────────────────────────
const TABS = [
  { key:"overview",      icon:"📊", label:"Overview"      },
  { key:"users",         icon:"👥", label:"Users"         },
  { key:"badges",        icon:"🎖️", label:"Badges"       },
  { key:"goals",         icon:"🎯", label:"Goals"         },
  { key:"marketplace",   icon:"🛒", label:"Marketplace"   },
  { key:"transactions",  icon:"💳", label:"Transactions"  },
  { key:"notifications", icon:"🔔", label:"Notifications" },
  { key:"logs", icon:"📜", label:"Logs" },
];

export default function AdminDashboard() {
  const navigate = useNavigate();

  const [tab, setTab]             = useState("overview");
  const [analytics, setAnalytics] = useState(null);
  const [users, setUsers]         = useState([]);
  const [badges, setBadges]       = useState([]);
  const [items, setItems]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState("");
  const [toast, setToast]         = useState("");

  const [logs] = useState([
    {
      userEmail: "sakthi13balan@gmail.com",
      role: "ADMIN",
      action: "LOGIN",
      details: "Admin logged in",
      timestamp: "2026-04-02T19:07:03"
    },
    {
      userEmail: "yanar63332@jparksky.com",
      role: "USER",
      action: "PURCHASE",
      details: "Purchase Confirmed: Tree planting initiative",
      timestamp: "2026-04-02T18:00:10"
    },
    {
      userEmail: "gitod32492@devlug.com",
      role: "USER",
      action: "BADGE_EARNED",
      details: "Earned Green Warrior badge",
      timestamp: "2026-04-02T16:30:23"
    }
  ]);

  // Badge modal
  const [showBadgeModal, setShowBadgeModal] = useState(false);
  const [editingBadge,   setEditingBadge]   = useState(null);
  const [badgeForm,      setBadgeForm]       = useState(emptyBadge);
  const [savingBadge,    setSavingBadge]     = useState(false);

  // Goal form
  const [communityGoals, setCommunityGoals] = useState([]);
  const [goalForm,    setGoalForm]    = useState({ title:"", description:"", category:"transport", targetAmount:"", deadline: new Date(Date.now()+30*86400000).toISOString().split("T")[0] });
  const [postingGoal, setPostingGoal] = useState(false);

  // Item modal
  const [showItemModal, setShowItemModal] = useState(false);
  const [editingItem,   setEditingItem]   = useState(null);
  const [itemForm,      setItemForm]      = useState(emptyItem);
  const [savingItem,    setSavingItem]    = useState(false);

  // Notif form
  const [notifForm,    setNotifForm]    = useState({ title:"", body:"", type:"general" });
  const [sendingNotif, setSendingNotif] = useState(false);

  // Transaction analytics
  const [txData,       setTxData]       = useState(null);
  const [txPeriod,     setTxPeriod]     = useState("daily");
  const [txLoading,    setTxLoading]    = useState(false);

  const showToast = (msg) => { setToast(msg); setTimeout(()=>setToast(""),3500); };

  // ── Load ──────────────────────────────────────────────────────────────────
  const loadAll = async () => {
    setLoading(true); setError("");
    const token = getToken();
    if (!token) { navigate("/"); return; }

    const [aR, uR, bR, iR, gR] = await Promise.allSettled([
      axios.get("http://localhost:8080/api/admin/analytics",   authHdr()),
      axios.get("http://localhost:8080/api/admin/users",       authHdr()),
      axios.get("http://localhost:8080/api/admin/badges",      authHdr()),
      axios.get("http://localhost:8080/api/marketplace/items", authHdr()),
      axios.get("http://localhost:8080/api/admin/goals",            authHdr()),
    ]);

    if (aR.status==="fulfilled") setAnalytics(aR.value.data);
    else {
      const s = aR.reason?.response?.status;
      if (s===403) setError("Access denied — your account needs ADMIN role.");
      else if (s===401) { navigate("/"); return; }
      else setError(`Analytics failed: ${aR.reason?.message}. Is the backend running?`);
    }

    if (uR.status==="fulfilled") setUsers(Array.isArray(uR.value.data) ? uR.value.data : []);

    if (bR.status==="fulfilled") {
      const raw = Array.isArray(bR.value.data) ? bR.value.data : [];
      setBadges(raw.map(b => ({
        ...b,
        icon:    b.icon    || b.iconName || "Award",
        bgColor: b.bgColor || "bg-green-100",
        color:   b.color   || "text-green-600",
      })));
    }

    if (iR.status==="fulfilled") setItems(Array.isArray(iR.value.data) ? iR.value.data : []);
    if (gR.status==="fulfilled") setCommunityGoals(Array.isArray(gR.value.data) ? gR.value.data : []);

    setLoading(false);
  };

  const loadTransactions = async (period) => {
    setTxLoading(true);
    try {
      const res = await axios.get(`http://localhost:8080/api/admin/transactions?period=${period}`, authHdr());
      setTxData(res.data);
    } catch(e) {
      showToast("Failed to load transaction data.");
    } finally {
      setTxLoading(false);
    }
  };

  useEffect(() => { loadAll(); }, []);

  useEffect(() => {
    if (tab === "transactions") loadTransactions(txPeriod);
  }, [tab, txPeriod]);

  // ── Badge CRUD ──────────────────────────────────────────────────────────────
  const openCreateBadge = () => { setEditingBadge(null); setBadgeForm(emptyBadge); setShowBadgeModal(true); };
  const openEditBadge   = (b) => {
    setEditingBadge(b);
    setBadgeForm({ name:b.name||"", description:b.description||"", icon:b.icon||"Leaf", category:b.category||"general", thresholdKg:b.thresholdKg??0, color:b.color||"text-green-600", bgColor:b.bgColor||"bg-green-100", active:b.active??true });
    setShowBadgeModal(true);
  };
  const saveBadge = async () => {
    if (!badgeForm.name.trim())        { alert("Badge name required"); return; }
    if (!badgeForm.description.trim()) { alert("Description required"); return; }
    setSavingBadge(true);
    try {
      const payload = { ...badgeForm, iconName:badgeForm.icon, thresholdKg:Number(badgeForm.thresholdKg)||0 };
      if (editingBadge) {
        await axios.put(`http://localhost:8080/api/admin/badges/${editingBadge.id}`, payload, authHdr());
        showToast("Badge updated!");
      } else {
        await axios.post("http://localhost:8080/api/admin/badges", payload, authHdr());
        showToast("Badge created! Visible to all users now.");
      }
      setShowBadgeModal(false);
      loadAll();
    } catch(e) { alert(e.response?.data?.error||e.message||"Save failed"); }
    finally { setSavingBadge(false); }
  };
  const deleteBadge = async (id) => {
    if (!confirm("Delete this badge permanently?")) return;
    try { await axios.delete(`http://localhost:8080/api/admin/badges/${id}`, authHdr()); showToast("Badge deleted."); loadAll(); }
    catch(e) { alert(e.response?.data?.error||"Delete failed"); }
  };

  // ── Goal ────────────────────────────────────────────────────────────────────
  const postGoal = async () => {
    if (!goalForm.title.trim())  { alert("Title required"); return; }
    if (!goalForm.targetAmount)  { alert("Target amount required"); return; }
    setPostingGoal(true);
    try {
      await axios.post("http://localhost:8080/api/admin/goals", { ...goalForm, targetAmount:parseFloat(goalForm.targetAmount) }, authHdr());
      showToast("Community goal posted! Visible in all users' Goals page.");
      loadAll();
      setGoalForm({ title:"", description:"", category:"transport", targetAmount:"", deadline:new Date(Date.now()+30*86400000).toISOString().split("T")[0] });
    } catch(e) { alert(e.response?.data?.error||"Failed to post goal"); }
    finally { setPostingGoal(false); }
  };

  // ── Role ────────────────────────────────────────────────────────────────────
  const changeRole = async (uid, cur) => {
    const nr = cur==="ADMIN"?"USER":"ADMIN";
    if (!confirm(`Change role to ${nr}?`)) return;
    try { await axios.put(`http://localhost:8080/api/admin/users/${uid}/role`, {role:nr}, authHdr()); showToast(`Role updated to ${nr}`); loadAll(); }
    catch(e) { alert(e.response?.data?.error||"Failed"); }
  };

  // ── Marketplace ──────────────────────────────────────────────────────────────
  const openCreateItem = () => { setEditingItem(null); setItemForm(emptyItem); setShowItemModal(true); };
  const openEditItem   = (it) => { setEditingItem(it); setItemForm({name:it.name||"",description:it.description||"",cost:it.cost||0,offsetValue:it.offsetValue||0,category:it.category||"Forestry"}); setShowItemModal(true); };
  const saveItem = async () => {
    if (!itemForm.name.trim()) { alert("Name required"); return; }
    setSavingItem(true);
    try {
      const p = {...itemForm, cost:parseFloat(itemForm.cost)||0, offsetValue:parseFloat(itemForm.offsetValue)||0};
      if (editingItem) {
        await axios.put(`http://localhost:8080/api/admin/marketplace/${editingItem.id}`, p, authHdr());
        showToast("Item updated!");
      } else {
        await axios.post("http://localhost:8080/api/admin/marketplace", p, authHdr());
        showToast("Product added to marketplace!");
      }
      setShowItemModal(false); loadAll();
    } catch(e) { alert(e.response?.data?.error||e.message||"Save failed"); }
    finally { setSavingItem(false); }
  };
  const deleteItem = async (id) => {
    if (!confirm("Remove this item?")) return;
    try { await axios.delete(`http://localhost:8080/api/admin/marketplace/${id}`, authHdr()); showToast("Item removed."); loadAll(); }
    catch(e) { alert(e.response?.data?.error||"Failed"); }
  };

  // ── Broadcast notification ───────────────────────────────────────────────────
  const sendNotif = async () => {
    if (!notifForm.title.trim()) { alert("Title required"); return; }
    if (!notifForm.body.trim())  { alert("Message required"); return; }
    setSendingNotif(true);
    try {
      const res = await axios.post("http://localhost:8080/api/admin/notifications/broadcast", notifForm, authHdr());
      showToast(`✅ Notification sent to ${res.data.count} users!`);
      setNotifForm({ title:"", body:"", type:"general" });
    } catch(e) { alert(e.response?.data?.error||e.message||"Send failed"); }
    finally { setSendingNotif(false); }
  };

  const breakdown      = Object.entries(analytics?.categoryBreakdown ?? {});
  const totalBreakdown = breakdown.reduce((s,[,v])=>s+v,0)||1;

  if (loading) return (
    <div className="flex-1 flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mx-auto mb-3" />
        <p className="text-slate-500 text-sm">Loading admin data…</p>
      </div>
    </div>
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">

      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-xl text-sm font-semibold flex items-center gap-2 animate-in">
          <CheckCircle className="w-4 h-4" /> {toast}
        </div>
      )}

      {/* Page header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-800 tracking-tight">Admin Dashboard</h1>
            <p className="text-xs text-slate-400">Community management & analytics</p>
          </div>
        </div>
        <button onClick={loadAll} className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-50 transition shadow-sm">
          <RefreshCw className="w-3.5 h-3.5" /> Refresh
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-sm">
          <p className="font-bold mb-1">⚠️ Error</p>
          <p>{error}</p>
          <button onClick={loadAll} className="mt-1 text-xs underline font-semibold">Retry</button>
        </div>
      )}

      {/* Tab bar */}
      <div className="flex gap-1.5 mb-6 bg-white p-1.5 rounded-2xl border border-gray-100 shadow-sm flex-wrap">
        {TABS.map(t => (
          <button key={t.key} onClick={()=>setTab(t.key)}
            className={`flex-1 min-w-[90px] px-3 py-2 rounded-xl text-sm font-semibold transition whitespace-nowrap ${
              tab===t.key ? "bg-emerald-600 text-white shadow" : "text-gray-500 hover:bg-gray-50"
            }`}>
            {t.icon} {t.label}
            {t.key==="badges" && (
              <span className={`ml-1 text-[10px] ${tab===t.key?"opacity-70":"text-gray-400"}`}>
                ({BUILTIN_BADGES.length+badges.length})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ══ OVERVIEW ══════════════════════════════════════════════════════════ */}
      {tab==="overview" && (
        <div className="space-y-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              {label:"Total Users",       value:analytics?.totalUsers       ??"—", icon:Users,      bg:"bg-blue-50",   tc:"text-blue-600"  },
              {label:"Total CO₂e (kg)",   value:analytics?.totalCarbonKg    ??"—", icon:Leaf,       bg:"bg-green-50",  tc:"text-green-600" },
              {label:"Avg / User (kg)",   value:analytics?.avgCarbonPerUser ??"—", icon:TrendingUp,  bg:"bg-yellow-50", tc:"text-yellow-600"},
              {label:"Goals Created",     value:analytics?.totalGoals       ??"—", icon:Target,     bg:"bg-purple-50", tc:"text-purple-600"},
            ].map((k,i)=>(
              <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                <div className={`w-9 h-9 ${k.bg} rounded-xl flex items-center justify-center mb-3`}>
                  <k.icon className={`w-4 h-4 ${k.tc}`} />
                </div>
                <p className="text-2xl font-black text-slate-800">{k.value}</p>
                <p className="text-xs text-slate-500 mt-0.5">{k.label}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <h3 className="font-bold text-slate-800 mb-1 flex items-center gap-2 text-sm">
                <BarChart3 className="w-4 h-4 text-emerald-600" /> Category Popularity
              </h3>
              <p className="text-xs text-slate-500 mb-4">Most logged categories system-wide</p>
              {breakdown.length>0 ? breakdown.map(([cat,val])=>(
                <div key={cat} className="mb-3">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-semibold text-slate-700 capitalize">{cat}</span>
                    <span className="text-slate-400">{val} kg</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{width:`${Math.min((val/totalBreakdown)*100,100)}%`}} />
                  </div>
                </div>
              )) : <p className="text-slate-400 text-sm py-6 text-center">No carbon entries yet.</p>}
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <h3 className="font-bold text-slate-800 mb-4 text-sm">Community Stats</h3>
              <div className="space-y-2">
                {[
                  ["Total CO₂e", `${analytics?.totalCarbonKg??0} kg`],
                  ["Avg Footprint/User", `${analytics?.avgCarbonPerUser??0} kg`],
                  ["Global Benchmark", "4,000 kg/year"],
                  ["Goals Completed", `${analytics?.completedGoals??0} / ${analytics?.totalGoals??0}`],
                  ["Active Trackers", `${analytics?.activeUsers??0} users`],
                  ["Marketplace Items", `${items.length}`],
                  ["Total Badges", `${BUILTIN_BADGES.length+badges.length} (${badges.length} custom)`],
                ].map(([l,v])=>(
                  <div key={l} className="flex justify-between p-2.5 bg-slate-50 rounded-xl">
                    <span className="text-xs text-slate-500">{l}</span>
                    <span className="text-xs font-bold text-slate-800">{v}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-gray-50">
              <h3 className="font-bold text-slate-800 text-sm">Top Carbon Loggers</h3>
            </div>
            {(analytics?.topUsers??[]).length>0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead><tr className="border-b border-slate-100">
                    {["#","Name","Email","Role","Total CO₂e"].map((h,i)=>(
                      <th key={h} className={`py-3 px-4 text-xs font-bold text-slate-400 uppercase tracking-wide ${i>=4?"text-right":"text-left"}`}>{h}</th>
                    ))}
                  </tr></thead>
                  <tbody>
                    {analytics.topUsers.map((u,i)=>(
                      <tr key={u.id??i} className="border-b border-slate-50 hover:bg-slate-50 transition">
                        <td className="py-3 px-4 text-sm font-bold text-slate-400">{i+1}</td>
                        <td className="py-3 px-4 text-sm font-semibold text-slate-800">{u.name}</td>
                        <td className="py-3 px-4 text-sm text-slate-500">{u.email}</td>
                        <td className="py-3 px-4"><span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${u.role==="ADMIN"?"bg-purple-100 text-purple-700":"bg-blue-100 text-blue-700"}`}>{u.role??"USER"}</span></td>
                        <td className="py-3 px-4 text-sm font-bold text-slate-800 text-right">{u.totalKg} kg</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : <p className="text-center text-slate-400 text-sm py-10">No users have logged entries yet.</p>}
          </div>
        </div>
      )}

      {/* ══ USERS ══════════════════════════════════════════════════════════════ */}
      {tab==="users" && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-50">
            <h3 className="font-bold text-slate-800 text-sm">All Users ({users.length})</h3>
          </div>
          {users.length>0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead><tr className="border-b border-slate-100">
                  {["Name","Email","Role","Verified","Total CO₂e","Action"].map(h=>(
                    <th key={h} className="py-3 px-4 text-xs font-bold text-slate-400 uppercase tracking-wide text-left">{h}</th>
                  ))}
                </tr></thead>
                <tbody>
                  {users.map(u=>(
                    <tr key={u.id} className="border-b border-slate-50 hover:bg-slate-50 transition">
                      <td className="py-3 px-4 text-sm font-semibold text-slate-800">{u.name}</td>
                      <td className="py-3 px-4 text-sm text-slate-500">{u.email}</td>
                      <td className="py-3 px-4"><span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${u.role==="ADMIN"?"bg-purple-100 text-purple-700":"bg-blue-100 text-blue-700"}`}>{u.role}</span></td>
                      <td className="py-3 px-4">{u.enabled?<CheckCircle className="w-4 h-4 text-emerald-500"/>:<AlertCircle className="w-4 h-4 text-red-400"/>}</td>
                      <td className="py-3 px-4 text-sm font-bold text-slate-800">{u.totalKg} kg</td>
                      <td className="py-3 px-4">
                        <button onClick={()=>changeRole(u.id,u.role)} className="text-xs text-emerald-600 hover:underline font-semibold">
                          {u.role==="ADMIN"?"Remove Admin":"Make Admin"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : <p className="text-center text-slate-400 text-sm py-10">No users found.</p>}
        </div>
      )}

      {/* ══ BADGES ═════════════════════════════════════════════════════════════ */}
      {tab==="badges" && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-800">Custom Badges</h3>
              <p className="text-xs text-slate-400 mt-0.5">{badges.length} created · appear immediately in users' Eco Gallery</p>
            </div>
            <button onClick={openCreateBadge} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700 transition shadow">
              <Plus className="w-4 h-4" /> New Badge
            </button>
          </div>

          {badges.length>0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-7">
              {badges.map(b=>(
                <div key={b.id} className="bg-white rounded-2xl border border-emerald-100 p-5 shadow-sm">
                  <div className="flex items-start justify-between mb-3">
                    <div className={`w-11 h-11 rounded-xl ${b.bgColor||"bg-green-100"} flex items-center justify-center`}>
                      <BadgeIcon iconName={b.icon} className={`w-5 h-5 ${b.color||"text-green-600"}`} />
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">Custom</span>
                      <button onClick={()=>openEditBadge(b)} className="p-1.5 hover:bg-slate-100 rounded-lg" title="Edit"><Edit2 className="w-3.5 h-3.5 text-slate-400"/></button>
                      <button onClick={()=>deleteBadge(b.id)} className="p-1.5 hover:bg-red-50 rounded-lg" title="Delete"><Trash2 className="w-3.5 h-3.5 text-red-400"/></button>
                    </div>
                  </div>
                  <p className="font-bold text-slate-800 text-sm mb-1">{b.name}</p>
                  <p className="text-xs text-slate-500 mb-3 leading-relaxed">{b.description}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-400 capitalize bg-slate-50 px-2 py-0.5 rounded-full">{b.category}</span>
                    <span className="text-xs font-semibold text-slate-600">{b.thresholdKg??0} kg</span>
                  </div>
                  <div className="mt-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${b.active?"bg-emerald-100 text-emerald-700":"bg-slate-100 text-slate-500"}`}>
                      {b.active?"● Active":"○ Inactive"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-slate-50 rounded-2xl border border-dashed border-slate-200 p-8 text-center mb-7">
              <Award className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-slate-400 text-sm mb-3">No custom badges yet</p>
              <button onClick={openCreateBadge} className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700">Create First Badge</button>
            </div>
          )}

          <div className="flex items-center gap-3 mb-4">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">System Badges</span>
            <div className="flex-1 h-px bg-slate-200" />
            <span className="text-xs text-slate-400">Built-in · always active · read-only</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {BUILTIN_BADGES.map((b,i)=>(
              <div key={i} className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-11 h-11 rounded-xl ${b.bgColor} flex items-center justify-center`}>
                    <BadgeIcon iconName={b.icon} className={`w-5 h-5 ${b.color}`} />
                  </div>
                  <span className="text-[10px] font-black text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">System</span>
                </div>
                <p className="font-bold text-slate-800 text-sm mb-1">{b.name}</p>
                <p className="text-xs text-slate-500 mb-3 leading-relaxed">{b.description}</p>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-400 capitalize bg-slate-50 px-2 py-0.5 rounded-full">{b.category}</span>
                  <span className="text-xs font-semibold text-slate-600">{b.thresholdKg>0?`${b.thresholdKg} kg`:"Survey-based"}</span>
                </div>
                <div className="mt-2"><span className="text-xs px-2 py-0.5 rounded-full font-medium bg-emerald-100 text-emerald-700">● Always Active</span></div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ══ GOALS ══════════════════════════════════════════════════════════════ */}
      {tab==="goals" && (
        <div className="space-y-5">
          {/* ── Community Goal Stats ── */}
          {communityGoals.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-slate-50 flex items-center justify-between">
                <h3 className="font-bold text-slate-800 text-sm">Posted Community Goals ({communityGoals.length})</h3>
              </div>
              <div className="divide-y divide-slate-50">
                {communityGoals.map(g => (
                  <div key={g.id} className="p-4 hover:bg-slate-50 transition">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-slate-800 text-sm">{g.title}</p>
                        <p className="text-xs text-slate-400 mt-0.5 capitalize">{g.category} · Target: {g.targetAmount} kg · Deadline: {g.deadline}</p>
                      </div>
                      <div className="flex gap-3 flex-shrink-0">
                        <div className="text-center">
                          <p className="text-lg font-black text-emerald-600">{g.acceptedCount ?? 0}</p>
                          <p className="text-[9px] font-bold text-slate-400 uppercase">Accepted</p>
                        </div>
                        <div className="text-center">
                          <p className="text-lg font-black text-red-400">{g.rejectedCount ?? 0}</p>
                          <p className="text-[9px] font-bold text-slate-400 uppercase">Declined</p>
                        </div>
                        <div className="text-center">
                          <p className="text-lg font-black text-blue-500">{g.status === "COMPLETED" ? "✓" : "●"}</p>
                          <p className="text-[9px] font-bold text-slate-400 uppercase">Status</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Post New Goal form ── */}
          <div className="max-w-2xl">
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <h3 className="font-bold text-slate-800 mb-1">Post Community Challenge</h3>
            <p className="text-sm text-slate-500 mb-5">Creates a global goal visible in every user's Goals page.</p>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Goal Title *</label>
                <input value={goalForm.title} onChange={e=>setGoalForm(f=>({...f,title:e.target.value}))} placeholder="e.g. Community Transport Challenge" className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 outline-none focus:border-emerald-500 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Description</label>
                <textarea value={goalForm.description} onChange={e=>setGoalForm(f=>({...f,description:e.target.value}))} rows={3} placeholder="Describe how users can participate…" className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 outline-none focus:border-emerald-500 text-sm resize-none" />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Category</label>
                  <select value={goalForm.category} onChange={e=>setGoalForm(f=>({...f,category:e.target.value}))} className="w-full px-3 py-3 rounded-xl border border-slate-200 bg-slate-50 outline-none focus:border-emerald-500 text-sm">
                    {["transport","energy","food","shopping","general"].map(c=><option key={c} value={c}>{c.charAt(0).toUpperCase()+c.slice(1)}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Target (kg) *</label>
                  <input type="number" min="1" value={goalForm.targetAmount} onChange={e=>setGoalForm(f=>({...f,targetAmount:e.target.value}))} placeholder="500" className="w-full px-3 py-3 rounded-xl border border-slate-200 bg-slate-50 outline-none focus:border-emerald-500 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Deadline *</label>
                  <input type="date" value={goalForm.deadline} onChange={e=>setGoalForm(f=>({...f,deadline:e.target.value}))} className="w-full px-3 py-3 rounded-xl border border-slate-200 bg-slate-50 outline-none focus:border-emerald-500 text-sm" />
                </div>
              </div>
              <button onClick={postGoal} disabled={postingGoal} className="w-full py-3 bg-emerald-600 text-white rounded-xl font-semibold text-sm hover:bg-emerald-700 transition disabled:opacity-60 flex items-center justify-center gap-2">
                {postingGoal?<><Loader2 className="w-4 h-4 animate-spin"/>Posting…</>:<><Plus className="w-4 h-4"/>Post Community Goal</>}
              </button>
            </div>
          </div>
          </div>
        </div>
      )}

      {/* ══ MARKETPLACE ════════════════════════════════════════════════════════ */}
      {tab==="marketplace" && (
        <div>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-bold text-slate-800">Marketplace Products</h3>
              <p className="text-xs text-slate-400 mt-0.5">{items.length} items available to users</p>
            </div>
            <button onClick={openCreateItem} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700 transition shadow">
              <Plus className="w-4 h-4" /> Add Product
            </button>
          </div>

          {items.length>0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <table className="w-full">
                <thead><tr className="border-b border-slate-100 bg-slate-50">
                  {["Product","Category","Cost (₹)","CO₂ Offset","Actions"].map(h=>(
                    <th key={h} className="py-3 px-5 text-xs font-bold text-slate-400 uppercase tracking-wide text-left">{h}</th>
                  ))}
                </tr></thead>
                <tbody>
                  {items.map(it=>(
                    <tr key={it.id} className="border-b border-slate-50 hover:bg-slate-50 transition">
                      <td className="py-4 px-5">
                        <p className="font-bold text-slate-800 text-sm">{it.name}</p>
                        <p className="text-xs text-slate-400 mt-0.5 max-w-xs truncate">{it.description}</p>
                      </td>
                      <td className="py-4 px-5"><span className="text-xs bg-emerald-50 text-emerald-700 font-semibold px-2 py-0.5 rounded-full">{it.category}</span></td>
                      <td className="py-4 px-5 font-bold text-slate-800 text-sm">₹{it.cost}</td>
                      <td className="py-4 px-5 text-sm font-semibold text-emerald-600">{it.offsetValue} kg CO₂</td>
                      <td className="py-4 px-5">
                        <div className="flex gap-2">
                          <button onClick={()=>openEditItem(it)} className="p-1.5 hover:bg-slate-100 rounded-lg"><Edit2 className="w-4 h-4 text-slate-400"/></button>
                          <button onClick={()=>deleteItem(it.id)} className="p-1.5 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4 text-red-400"/></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-12 text-center">
              <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 font-medium mb-3">No products yet</p>
              <button onClick={openCreateItem} className="px-5 py-2 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700">Add First Product</button>
            </div>
          )}
        </div>
      )}

      {/* ══ TRANSACTIONS ════════════════════════════════════════════════════════ */}
      {tab==="transactions" && (
        <div className="space-y-5">
          {/* Period selector */}
          <div className="flex items-center gap-3">
            <span className="text-sm font-bold text-slate-600">View Period:</span>
            <div className="flex bg-white border border-gray-100 p-1 rounded-xl shadow-sm">
              {["daily","weekly","monthly"].map(p=>(
                <button key={p} onClick={()=>setTxPeriod(p)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold capitalize transition ${txPeriod===p?"bg-emerald-600 text-white":"text-gray-400 hover:text-gray-600"}`}>
                  {p}
                </button>
              ))}
            </div>
            <button onClick={()=>loadTransactions(txPeriod)} className="p-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition shadow-sm">
              <RefreshCw className="w-3.5 h-3.5 text-gray-500" />
            </button>
          </div>

          {txLoading ? (
            <div className="flex items-center justify-center py-16"><Loader2 className="w-7 h-7 animate-spin text-emerald-500"/></div>
          ) : txData ? (
            <>
              {/* KPI cards */}
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label:"Total Transactions", value:txData.totalTx,       icon:CreditCard,  bg:"bg-blue-50",    tc:"text-blue-600"    },
                  { label:"Completed",          value:txData.completedTx,   icon:CheckCircle, bg:"bg-emerald-50", tc:"text-emerald-600" },
                  { label:"Revenue (₹)",        value:`₹${txData.totalRevenue}`, icon:BarChart2, bg:"bg-purple-50",  tc:"text-purple-600"  },
                ].map((k,i)=>(
                  <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                    <div className={`w-9 h-9 ${k.bg} rounded-xl flex items-center justify-center mb-3`}>
                      <k.icon className={`w-4 h-4 ${k.tc}`} />
                    </div>
                    <p className="text-2xl font-black text-slate-800">{k.value}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{k.label}</p>
                  </div>
                ))}
              </div>

              {/* Per-day chart */}
              {Object.keys(txData.perDay||{}).length > 0 && (
                <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                  <h3 className="font-bold text-slate-800 mb-4 text-sm flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-emerald-600" /> Transactions by Date
                  </h3>
                  <div className="space-y-2">
                    {Object.entries(txData.perDay).map(([date, count])=>(
                      <div key={date} className="flex items-center gap-3">
                        <span className="text-xs text-slate-500 w-28 flex-shrink-0">{date}</span>
                        <div className="flex-1 h-6 bg-slate-100 rounded-lg overflow-hidden">
                          <div className="h-full bg-emerald-500 rounded-lg flex items-center px-2"
                            style={{width:`${Math.min((count / Math.max(...Object.values(txData.perDay)))*100, 100)}%`, minWidth:"2rem"}}>
                            <span className="text-white text-[10px] font-black">{count}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Per-product breakdown */}
              {(txData.perProduct||[]).length > 0 && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="p-5 border-b border-slate-50">
                    <h3 className="font-bold text-slate-800 text-sm">Per Product Breakdown</h3>
                  </div>
                  <table className="w-full">
                    <thead><tr className="border-b border-slate-100 bg-slate-50">
                      {["Product","Total Purchases","Completed","Revenue (₹)"].map(h=>(
                        <th key={h} className="py-3 px-5 text-xs font-bold text-slate-400 uppercase tracking-wide text-left">{h}</th>
                      ))}
                    </tr></thead>
                    <tbody>
                      {txData.perProduct.map((p,i)=>(
                        <tr key={i} className="border-b border-slate-50 hover:bg-slate-50">
                          <td className="py-3 px-5 text-sm font-bold text-slate-800">{p.productName}</td>
                          <td className="py-3 px-5 text-sm text-slate-600">{p.totalBuyers}</td>
                          <td className="py-3 px-5"><span className="text-xs bg-emerald-50 text-emerald-700 font-semibold px-2 py-0.5 rounded-full">{p.completedCount}</span></td>
                          <td className="py-3 px-5 text-sm font-bold text-slate-800">₹{p.totalRevenue.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Transaction list */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-slate-50">
                  <h3 className="font-bold text-slate-800 text-sm">Recent Transactions ({txData.transactions?.length||0})</h3>
                </div>
                {(txData.transactions||[]).length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead><tr className="border-b border-slate-100">
                        {["User","Product","Amount","Status","Date"].map(h=>(
                          <th key={h} className="py-3 px-4 text-xs font-bold text-slate-400 uppercase tracking-wide text-left">{h}</th>
                        ))}
                      </tr></thead>
                      <tbody>
                        {txData.transactions.map((tx,i)=>(
                          <tr key={tx.id??i} className="border-b border-slate-50 hover:bg-slate-50">
                            <td className="py-3 px-4">
                              <p className="text-sm font-semibold text-slate-800">{tx.userName}</p>
                              <p className="text-xs text-slate-400">{tx.userEmail}</p>
                            </td>
                            <td className="py-3 px-4 text-sm text-slate-700">{tx.productName}</td>
                            <td className="py-3 px-4 text-sm font-bold text-slate-800">₹{tx.amount}</td>
                            <td className="py-3 px-4">
                              <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${tx.status==="COMPLETED"?"bg-emerald-100 text-emerald-700":"bg-red-100 text-red-600"}`}>
                                {tx.status}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-xs text-slate-400">{tx.date?.slice(0,10)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-center text-slate-400 text-sm py-10">No transactions for this period.</p>
                )}
              </div>
            </>
          ) : (
            <div className="text-center py-16">
              <CreditCard className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-400 text-sm">Select a period to view transaction analytics.</p>
            </div>
          )}
        </div>
      )}

      {/* ══ NOTIFICATIONS ══════════════════════════════════════════════════════ */}
      {tab==="notifications" && (
        <div className="flex justify-center">
          <div className="w-full max-w-2xl">
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                <Send className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800">Broadcast Notification</h3>
                <p className="text-xs text-slate-400">Send a message to all {analytics?.totalUsers??""} users instantly</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Notification Type</label>
                <select value={notifForm.type} onChange={e=>setNotifForm(f=>({...f,type:e.target.value}))} className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 outline-none focus:border-emerald-500 text-sm">
                  {["general","alert","badge","goal","leaderboard","purchase"].map(t=>(
                    <option key={t} value={t}>{t.charAt(0).toUpperCase()+t.slice(1)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Title *</label>
                <input value={notifForm.title} onChange={e=>setNotifForm(f=>({...f,title:e.target.value}))} placeholder="e.g. 🌍 New Community Challenge!" className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 outline-none focus:border-emerald-500 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Message *</label>
                <textarea value={notifForm.body} onChange={e=>setNotifForm(f=>({...f,body:e.target.value}))} rows={4} placeholder="Write the notification message for all users…" className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 outline-none focus:border-emerald-500 text-sm resize-none" />
              </div>

              {(notifForm.title||notifForm.body) && (
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">Preview</p>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Bell className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 text-sm">{notifForm.title||"Title"}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{notifForm.body||"Message…"}</p>
                    </div>
                  </div>
                </div>
              )}

              <button onClick={sendNotif} disabled={sendingNotif} className="w-full py-3.5 bg-blue-600 text-white rounded-xl font-semibold text-sm hover:bg-blue-700 transition disabled:opacity-60 flex items-center justify-center gap-2 shadow">
                {sendingNotif?<><Loader2 className="w-4 h-4 animate-spin"/>Sending…</>:<><Send className="w-4 h-4"/>Send to All Users</>}
              </button>
            </div>
          </div>
        </div>
          </div>
      )}

      {tab==="logs" && (
         <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">

           {/* Header */}
           <div className="flex justify-between items-center px-6 py-4 border-b">
             <h2 className="text-lg font-semibold text-gray-800">
               📜 System Logs
             </h2>
             <span className="text-sm text-gray-500">
               Total: {logs.length}
             </span>
           </div>

           {/* Table */}
           <div className="overflow-x-auto">
             <table className="w-full text-sm text-left">

               {/* Table Head */}
               <thead className="bg-gray-50 text-gray-600 uppercase text-xs tracking-wider">
                 <tr>
                   <th className="px-6 py-3">User</th>
                   <th className="px-6 py-3">Role</th>
                   <th className="px-6 py-3">Action</th>
                   <th className="px-6 py-3">Details</th>
                   <th className="px-6 py-3">Time</th>
                 </tr>
               </thead>

               {/* Table Body */}
               <tbody className="divide-y">
                 {logs.map((log, i) => (
                   <tr key={i} className="hover:bg-gray-50 transition">

                     <td className="px-6 py-4 font-medium text-gray-800">
                       {log.userEmail}
                     </td>

                     <td className="px-6 py-4">
                       <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                         log.role === "ADMIN"
                           ? "bg-purple-100 text-purple-700"
                           : "bg-blue-100 text-blue-700"
                       }`}>
                         {log.role}
                       </span>
                     </td>

                     <td className="px-6 py-4 font-semibold text-gray-700">
                       {log.action}
                     </td>

                     <td className="px-6 py-4 text-gray-500">
                       {log.details}
                     </td>

                     <td className="px-6 py-4 text-gray-400 text-xs">
                       {new Date(log.timestamp).toLocaleString()}
                     </td>

                   </tr>
                 ))}
               </tbody>
             </table>
           </div>

         </div>
       )}

      {/* ══ BADGE MODAL ════════════════════════════════════════════════════════ */}
      {showBadgeModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-slate-800">{editingBadge?"Edit Badge":"Create New Badge"}</h3>
              <button onClick={()=>setShowBadgeModal(false)} className="p-1.5 hover:bg-slate-100 rounded-xl"><X className="w-5 h-5 text-slate-400"/></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Name *</label>
                <input value={badgeForm.name} onChange={e=>setBadgeForm(f=>({...f,name:e.target.value}))} placeholder="e.g. Tree Planter" className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 outline-none focus:border-emerald-500 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Description *</label>
                <input value={badgeForm.description} onChange={e=>setBadgeForm(f=>({...f,description:e.target.value}))} placeholder="e.g. Save 50 kg CO₂e through transport choices" className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 outline-none focus:border-emerald-500 text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Category</label>
                  <select value={badgeForm.category} onChange={e=>setBadgeForm(f=>({...f,category:e.target.value}))} className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 outline-none focus:border-emerald-500 text-sm">
                    {["transport","energy","food","general"].map(c=><option key={c} value={c}>{c.charAt(0).toUpperCase()+c.slice(1)}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Threshold (kg CO₂e)</label>
                  <input type="number" min="0" step="0.1" value={badgeForm.thresholdKg} onChange={e=>setBadgeForm(f=>({...f,thresholdKg:parseFloat(e.target.value)||0}))} placeholder="50" className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 outline-none focus:border-emerald-500 text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Icon</label>
                <div className="flex flex-wrap gap-2">
                  {ICON_OPTIONS.map(n=>{const C=ICON_COMPONENTS[n]||Award;const sel=badgeForm.icon===n;return(
                    <button key={n} type="button" onClick={()=>setBadgeForm(f=>({...f,icon:n}))} className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-xl border transition font-medium ${sel?"border-emerald-500 bg-emerald-50 text-emerald-700":"border-slate-200 text-slate-500 hover:border-slate-300 bg-white"}`}>
                      <C className="w-3.5 h-3.5"/> {n}
                    </button>
                  );})}
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Color</label>
                <div className="flex flex-wrap gap-2">
                  {COLOR_OPTIONS.map(opt=>(
                    <button key={opt.label} type="button" onClick={()=>setBadgeForm(f=>({...f,color:opt.color,bgColor:opt.bg}))} className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-xl border transition font-medium ${badgeForm.color===opt.color?"border-emerald-500 bg-emerald-50 text-emerald-700":"border-slate-200 text-slate-500 bg-white"}`}>
                      <span className={`w-3 h-3 rounded-full ${opt.bg} border border-slate-200`}/> {opt.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-3">Live Preview</p>
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-2xl ${badgeForm.bgColor} flex items-center justify-center`}>
                    <BadgeIcon iconName={badgeForm.icon} className={`w-7 h-7 ${badgeForm.color}`}/>
                  </div>
                  <div>
                    <p className="font-bold text-slate-800">{badgeForm.name||"Badge Name"}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{badgeForm.description||"Description"}</p>
                    <p className="text-xs text-emerald-600 font-semibold mt-1">Threshold: {badgeForm.thresholdKg} kg · {badgeForm.icon}</p>
                  </div>
                </div>
              </div>
              <label className="flex items-center gap-3 cursor-pointer p-3 bg-slate-50 rounded-xl">
                <input type="checkbox" checked={badgeForm.active} onChange={e=>setBadgeForm(f=>({...f,active:e.target.checked}))} className="w-4 h-4 accent-emerald-600"/>
                <div><p className="text-sm font-semibold text-slate-700">Active (visible to users)</p><p className="text-xs text-slate-400">Inactive badges hidden from gallery</p></div>
              </label>
              <div className="flex gap-3 pt-2">
                <button onClick={()=>setShowBadgeModal(false)} className="flex-1 py-3 border border-slate-200 text-slate-600 rounded-xl text-sm font-semibold hover:bg-slate-50">Cancel</button>
                <button onClick={saveBadge} disabled={savingBadge} className="flex-1 py-3 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700 disabled:opacity-60 flex items-center justify-center gap-2">
                  {savingBadge?<><Loader2 className="w-4 h-4 animate-spin"/>Saving…</>:editingBadge?"Update Badge":"Create Badge"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══ ITEM MODAL ═════════════════════════════════════════════════════════ */}
      {showItemModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-slate-800">{editingItem?"Edit Product":"Add Marketplace Product"}</h3>
              <button onClick={()=>setShowItemModal(false)} className="p-1.5 hover:bg-slate-100 rounded-xl"><X className="w-5 h-5 text-slate-400"/></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Product Name *</label>
                <input value={itemForm.name} onChange={e=>setItemForm(f=>({...f,name:e.target.value}))} placeholder="e.g. Tree Planting Initiative" className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 outline-none focus:border-emerald-500 text-sm"/>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Description</label>
                <textarea value={itemForm.description} onChange={e=>setItemForm(f=>({...f,description:e.target.value}))} rows={3} placeholder="Describe the eco-action…" className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 outline-none focus:border-emerald-500 text-sm resize-none"/>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Category</label>
                  <select value={itemForm.category} onChange={e=>setItemForm(f=>({...f,category:e.target.value}))} className="w-full px-3 py-3 rounded-xl border border-slate-200 bg-slate-50 outline-none focus:border-emerald-500 text-sm">
                    {["Forestry","Renewable","Community","Ocean","Agriculture"].map(c=><option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Cost (₹)</label>
                  <input type="number" min="0" value={itemForm.cost} onChange={e=>setItemForm(f=>({...f,cost:e.target.value}))} placeholder="100" className="w-full px-3 py-3 rounded-xl border border-slate-200 bg-slate-50 outline-none focus:border-emerald-500 text-sm"/>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Offset (kg)</label>
                  <input type="number" min="0" value={itemForm.offsetValue} onChange={e=>setItemForm(f=>({...f,offsetValue:e.target.value}))} placeholder="50" className="w-full px-3 py-3 rounded-xl border border-slate-200 bg-slate-50 outline-none focus:border-emerald-500 text-sm"/>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={()=>setShowItemModal(false)} className="flex-1 py-3 border border-slate-200 text-slate-600 rounded-xl text-sm font-semibold hover:bg-slate-50">Cancel</button>
                <button onClick={saveItem} disabled={savingItem} className="flex-1 py-3 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700 disabled:opacity-60 flex items-center justify-center gap-2">
                  {savingItem?<><Loader2 className="w-4 h-4 animate-spin"/>Saving…</>:editingItem?"Update Product":"Add Product"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
