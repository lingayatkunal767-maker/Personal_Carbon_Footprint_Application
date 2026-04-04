import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { apiFetch } from "../utils/api";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const CATEGORIES = ["Transport", "Energy", "Food", "Waste", "Other"];
const CATEGORY_COLORS = {
  Transport: { bg: "bg-blue-100", text: "text-blue-700", bar: "bg-blue-500" },
  Energy: { bg: "bg-yellow-100", text: "text-yellow-700", bar: "bg-yellow-500" },
  Food: { bg: "bg-orange-100", text: "text-orange-700", bar: "bg-orange-500" },
  Waste: { bg: "bg-red-100", text: "text-red-700", bar: "bg-red-500" },
  Other: { bg: "bg-gray-100", text: "text-gray-700", bar: "bg-gray-500" },
};

const ECO_TIPS = [
  "🚲 Cycling 10 km instead of driving saves ~2.6 kg CO₂",
  "💡 Switching to LED bulbs can cut lighting energy by 75%",
  "🥦 A plant-based meal produces ~50% less CO₂ than a meat-based one",
  "♻️ Recycling 1 kg of plastic saves ~1.5 kg CO₂",
  "🌳 A single tree absorbs ~22 kg of CO₂ per year",
  "🔌 Unplugging idle devices can save up to 10% on electricity",
];

export default function Dashboard() {
  const navigate = useNavigate();
  const [emissions, setEmissions] = useState([]);
  const [form, setForm] = useState({ category: '', activityType: '', quantity: '', carbonOutput: '', createdAt: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [tipIndex, setTipIndex] = useState(0);
  const [editingId, setEditingId] = useState(null);
  const [logs, setLogs] = useState([]);
  const [goals, setGoals] = useState([]);
  const [badges, setBadges] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [user, setUser] = useState(null);

  const latestLog = logs.length > 0 ? logs[0] : null;
  const chartData = logs.slice(0, 7).reverse().map(log => ({
    date: new Date(log.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    emission: log.totalEmission
  }));

  // Rotate eco tip
  useEffect(() => {
    setTipIndex(Math.floor(Math.random() * ECO_TIPS.length));
    const interval = setInterval(() => {
      setTipIndex(prev => (prev + 1) % ECO_TIPS.length);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  // Handle OAuth redirect token from URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlToken = params.get('token');
    if (urlToken) {
      localStorage.setItem('token', urlToken);
      window.history.replaceState({}, document.title, '/dashboard');
    }
  }, []);

  // Fetch Dashboard Data
  useEffect(() => {
    let mounted = true;
    const loadDashboardData = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }
      setLoading(true);
      try {
        // Fetch User
        const userData = await apiFetch('/api/users/me');
        if (mounted) setUser(userData);

        // Fetch Emissions
        const emissionsData = await apiFetch('/api/emissions');
        if (mounted) setEmissions(emissionsData || []);

        // Fetch Logs
        const logsData = await apiFetch('/api/carbon/logs');
        if (mounted) setLogs(logsData || []);

        // Fetch Goals
        const goalsData = await apiFetch('/api/goals');
        if (mounted) setGoals(goalsData || []);

        // Fetch Leaderboard
        const leaderboardData = await apiFetch('/api/leaderboard');
        if (mounted) setLeaderboard(leaderboardData || []);

        // Fetch Notifications
        const notificationsData = await apiFetch('/api/notifications');
        if (mounted) setNotifications(notificationsData || []);

      } catch (err) {
        if (err.status === 401) navigate('/login');
        else {
          console.error("Dashboard data load failed:", err);
          // Don't set global error for initial background fetches to avoid confusing 'An error occurred' message
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadDashboardData();

    // Fetch Badges separately when user is loaded
    return () => { mounted = false; };
  }, [navigate]);

  useEffect(() => {
    if (user?.id) {
      apiFetch(`/api/badges/user/${user.id}`)
        .then(data => setBadges(data || []))
        .catch(err => console.error("Badges load failed", err));
    }
  }, [user]);

  // Add emission handler
  const handleAddEmission = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const newEmission = await apiFetch('/api/emissions', {
        method: 'POST',
        body: JSON.stringify({
          category: form.category,
          activityType: form.activityType,
          quantity: parseFloat(form.quantity),
          carbonOutput: parseFloat(form.carbonOutput),
          createdAt: form.createdAt ? new Date(form.createdAt).toISOString() : null
        })
      });
      setEmissions(prev => [...prev, newEmission]);
      setForm({ category: '', activityType: '', quantity: '', carbonOutput: '', createdAt: '' });
    } catch (err) {
      if (err.status === 401) navigate('/login');
      else setError(err.message || 'Failed to add emission.');
    }
  };

  // Start editing an emission
  const startEditing = (emission) => {
    setEditingId(emission.id);
    setForm({
      category: emission.category || '',
      activityType: emission.activityType || '',
      quantity: emission.quantity?.toString() || '',
      carbonOutput: emission.carbonOutput?.toString() || '',
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Cancel editing
  const cancelEditing = () => {
    setEditingId(null);
    setForm({ category: '', activityType: '', quantity: '', carbonOutput: '' });
  };

  // Update emission handler
  const handleUpdateEmission = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const updated = await apiFetch(`/api/emissions/${editingId}`, {
        method: 'PUT',
        body: JSON.stringify({
          category: form.category,
          activityType: form.activityType,
          quantity: parseFloat(form.quantity),
          carbonOutput: parseFloat(form.carbonOutput)
        })
      });
      setEmissions(prev => prev.map(em => em.id === editingId ? updated : em));
      setEditingId(null);
      setForm({ category: '', activityType: '', quantity: '', carbonOutput: '' });
    } catch (err) {
      if (err.status === 401) navigate('/login');
      else setError(err.message || 'Failed to update emission.');
    }
  };

  // Delete emission handler
  const handleDeleteEmission = async (id, index) => {
    try {
      await apiFetch(`/api/emissions/${id}`, { method: 'DELETE' });
      setEmissions(prev => prev.filter((_, i) => i !== index));
    } catch (err) {
      if (err.status === 401) navigate('/login');
      else setError(err.message || 'Failed to delete emission.');
    }
  };

  // Calculate summary
  const totalEmission = emissions.reduce((sum, e) => sum + (e.carbonOutput || 0), 0);
  const thisMonth = totalEmission;
  const goalProgress = totalEmission > 0 ? Math.min(100, Math.round((totalEmission / 200) * 100)) : 0;
  const recordCount = emissions.length;

  // Category breakdown
  const categoryTotals = emissions.reduce((acc, e) => {
    const cat = e.category || "Other";
    acc[cat] = (acc[cat] || 0) + (e.carbonOutput || 0);
    return acc;
  }, {});
  const maxCategoryTotal = Math.max(...Object.values(categoryTotals), 1);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#d4edda] via-[#b5dfca] to-[#5cb578]">

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Welcome + Eco Tip */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-green-900">Welcome back 👋</h1>
          <p className="text-green-800/70 mt-1">Track, manage, and reduce your carbon footprint.</p>
          <div className="mt-4 flex items-center justify-between gap-4">
            <div className="bg-white/60 backdrop-blur-sm rounded-xl px-5 py-3 inline-flex items-center gap-3 shadow-sm">
              <span className="text-lg">💡</span>
              <span className="text-sm text-green-900 font-medium">{ECO_TIPS[tipIndex]}</span>
            </div>
            {/* Quick Actions */}
            <div className="flex gap-3">
              <Link
                to="/lifestyle-survey"
                className="bg-white/80 hover:bg-white text-green-700 font-semibold px-4 py-2 rounded-lg shadow-sm transition flex items-center gap-2"
              >
                + Add Log
              </Link>
              <Link
                to="/create-goal"
                className="bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded-lg shadow-sm transition"
              >
                + New Goal
              </Link>
            </div>
          </div>
        </div>

        {/* Loading indicator */}
        {loading && (
          <div className="text-center py-8">
            <div className="inline-block w-8 h-8 border-4 border-green-300 border-t-green-700 rounded-full animate-spin" />
            <p className="text-green-800 mt-2">Loading your emissions...</p>
          </div>
        )}
        {latestLog && (
  <div className="bg-white/90 rounded-2xl shadow-md p-6 mb-6">
    <h2 className="text-lg font-bold text-green-900 mb-2">
      Today's Carbon Footprint
    </h2>

    <p className="text-3xl font-bold text-green-700">
      {latestLog.totalEmission} kg CO₂
    </p>

    <div className="flex gap-6 mt-3 text-sm text-gray-600">
      <span>🚗 Transport: {latestLog.transportEmission}</span>
      <span>🥗 Food: {latestLog.foodEmission}</span>
      <span>⚡ Energy: {latestLog.energyEmission}</span>
    </div>
  </div>
)}
        {/* Summary Cards - 2x2 Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-8">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-md p-5 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Total Emissions</p>
                <p className="text-2xl font-bold text-gray-800 mt-1">{totalEmission.toFixed(1)} <span className="text-sm font-normal text-gray-500">kg CO₂</span></p>
              </div>
              <div className="w-11 h-11 bg-green-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
              </div>
            </div>
          </div>
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-md p-5 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">This Month</p>
                <p className="text-2xl font-bold text-blue-700 mt-1">{thisMonth.toFixed(1)} <span className="text-sm font-normal text-gray-500">kg CO₂</span></p>
              </div>
              <div className="w-11 h-11 bg-blue-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
              </div>
            </div>
          </div>
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-md p-5 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Records</p>
                <p className="text-2xl font-bold text-purple-700 mt-1">{recordCount} <span className="text-sm font-normal text-gray-500">entries</span></p>
              </div>
              <div className="w-11 h-11 bg-purple-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
              </div>
            </div>
          </div>
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-md p-5 border-l-4 border-amber-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Goal Progress</p>
                <p className="text-2xl font-bold text-amber-700 mt-1">{goalProgress}%</p>
              </div>
              <div className="w-11 h-11 bg-amber-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/></svg>
              </div>
            </div>
            <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
              <div className="bg-amber-500 h-2 rounded-full transition-all duration-500" style={{ width: `${goalProgress}%` }} />
            </div>
          </div>
        </div>

        {/* Milestone 4: Sustainability Progress Sections */}
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          
          {/* Active Goals & Badges */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white/90 rounded-2xl shadow-md p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold text-green-900 flex items-center gap-2">
                  <span className="text-xl">🎯</span> Active Goals
                </h2>
                <Link to="/goals" className="text-xs font-bold text-green-600 hover:underline">View All</Link>
              </div>
              {goals.length === 0 ? (
                <p className="text-gray-400 text-sm italic">No active goals. Start one to track your progress!</p>
              ) : (
                <div className="space-y-4">
                  {goals.slice(0, 2).map(goal => {
                    // Update to match requested formula: progress = (target - current) / target * 100
                    const rawProgress = goal.targetEmission > 0 ? ((goal.targetEmission - goal.currentEmission) / goal.targetEmission) * 100 : 0;
                    const progress = Math.max(0, Math.min(100, Math.round(rawProgress)));
                    return (
                      <div key={goal.id} className="p-4 bg-green-50/50 rounded-xl border border-green-100">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-semibold text-green-900">{goal.goalTitle}</span>
                          <span className="text-xs font-bold text-green-600">{progress}% buffer left</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                          <div className="bg-green-500 h-1.5 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="bg-white/90 rounded-2xl shadow-md p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold text-green-900 flex items-center gap-2">
                  <span className="text-xl">🏅</span> Recent Badges
                </h2>
                <Link to="/badges" className="text-xs font-bold text-green-600 hover:underline">View Gallery</Link>
              </div>
              {badges.length === 0 ? (
                <p className="text-gray-400 text-sm italic">Unlock badges by achieving your sustainability goals!</p>
              ) : (
                <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                  {badges.slice(0, 4).map(badge => (
                    <div key={badge.id} className="flex-shrink-0 text-center group">
                      <div className="w-14 h-14 bg-gradient-to-br from-amber-100 to-orange-100 rounded-full flex items-center justify-center mb-1 shadow-sm group-hover:scale-110 transition-transform">
                        <span className="text-2xl">🏅</span>
                      </div>
                      <p className="text-[10px] font-bold text-gray-700 truncate w-14">{badge.badgeName}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Leaderboard & Notifications Sidebar */}
          <div className="space-y-6">
            <div className="bg-white/90 rounded-2xl shadow-md p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold text-green-900 flex items-center gap-2">
                  <span className="text-xl">🏆</span> Leaderboard
                </h2>
                <Link to="/leaderboard" className="text-xs font-bold text-green-600 hover:underline">Full Rank</Link>
              </div>
              <div className="space-y-3">
                {leaderboard.slice(0, 3).map((entry, idx) => (
                  <div key={entry.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition">
                    <span className="text-sm font-black text-gray-400 w-4">{idx + 1}</span>
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-[10px] font-bold text-green-700 uppercase">
                      {entry.userName?.substring(0, 2)}
                    </div>
                    <div className="flex-grow">
                      <p className="text-xs font-bold text-gray-800">{entry.userName}</p>
                      <p className="text-[10px] text-gray-500 font-medium">{entry.score} pts</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white/90 rounded-2xl shadow-md p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold text-green-900 flex items-center gap-2">
                  <span className="text-xl">🔔</span> Notifications
                </h2>
                <Link to="/notifications" className="text-xs font-bold text-green-600 hover:underline">Inbox</Link>
              </div>
              <div className="space-y-4">
                {notifications.length === 0 ? (
                  <p className="text-gray-400 text-[10px] italic">No new notifications.</p>
                ) : (
                  notifications.slice(0, 3).map(notif => (
                    <div key={notif.id} className="flex gap-3 items-start border-l-2 border-green-200 pl-3 py-1">
                      <div className="flex-grow">
                        <p className="text-[11px] font-bold text-gray-800 leading-tight">{notif.title}</p>
                        <p className="text-[10px] text-gray-500 truncate w-40">{notif.message}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

        </div>

        <div className="bg-white/90 rounded-2xl shadow-md p-6 mb-8">
  <h2 className="text-lg font-bold text-green-900 mb-4">
    Carbon Emission History
  </h2>

  <ResponsiveContainer width="100%" height={300}>
    <LineChart data={chartData}>
      <XAxis dataKey="date" />
      <YAxis />
      <Tooltip />
      <Line type="monotone" dataKey="emission" stroke="#16a34a" strokeWidth={3} />
    </LineChart>
  </ResponsiveContainer>
</div>
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          {/* Add Emission Form */}
          <div className="lg:col-span-2 bg-white/90 backdrop-blur-sm rounded-2xl shadow-md p-6">
            <h2 className="text-lg font-bold text-green-900 mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/></svg>
              {editingId ? 'Update Emission' : 'Add New Emission'}
            </h2>
            {error && (
            <div className="flex items-center gap-3 mb-6 p-4 bg-red-50/80 backdrop-blur-sm border border-red-100 rounded-xl animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
              </div>
              <p className="text-red-800 text-sm font-medium">{error}</p>
              <button 
                onClick={() => setError('')} 
                className="ml-auto text-red-400 hover:text-red-600 transition-colors"
                title="Dismiss"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>
          )}
            <form onSubmit={editingId ? handleUpdateEmission : handleAddEmission} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Category</label>
                  <select
                    value={form.category}
                    onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm bg-white"
                    required
                  >
                    <option value="" disabled>Select category</option>
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Activity Type</label>
                  <input
                    type="text"
                    placeholder="e.g. Car commute, Heating..."
                    value={form.activityType}
                    onChange={e => setForm(f => ({ ...f, activityType: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Quantity</label>
                  <input
                    type="number"
                    placeholder="e.g. 50"
                    value={form.quantity}
                    onChange={e => setForm(f => ({ ...f, quantity: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                    required
                    min="0"
                    step="any"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Carbon Output (kg CO₂)</label>
                  <input
                    type="number"
                    placeholder="e.g. 12.5"
                    value={form.carbonOutput}
                    onChange={e => setForm(f => ({ ...f, carbonOutput: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                    required
                    min="0"
                    step="any"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Date (Optional)</label>
                  <input
                    type="date"
                    value={form.createdAt}
                    onChange={e => setForm(f => ({ ...f, createdAt: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  className={`sm:w-auto text-white px-8 py-2.5 rounded-xl font-semibold transition shadow-md ${
                    editingId
                      ? 'bg-blue-600 hover:bg-blue-700'
                      : 'bg-green-800 hover:bg-green-900'
                  }`}
                >
                  {editingId ? 'Update Emission' : '+ Add Emission'}
                </button>
                {editingId && (
                  <button
                    type="button"
                    onClick={cancelEditing}
                    className="sm:w-auto bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-2.5 rounded-xl font-semibold transition"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Category Breakdown */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-md p-6">
            <h2 className="text-lg font-bold text-green-900 mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"/><path strokeLinecap="round" strokeLinejoin="round" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"/></svg>
              By Category
            </h2>
            {Object.keys(categoryTotals).length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-8">No data yet. Add emissions to see breakdown.</p>
            ) : (
              <div className="space-y-3">
                {Object.entries(categoryTotals)
                  .sort((a, b) => b[1] - a[1])
                  .map(([cat, total]) => {
                    const colors = CATEGORY_COLORS[cat] || CATEGORY_COLORS.Other;
                    const pct = Math.round((total / maxCategoryTotal) * 100);
                    return (
                      <div key={cat}>
                        <div className="flex items-center justify-between mb-1">
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${colors.bg} ${colors.text}`}>{cat}</span>
                          <span className="text-xs font-medium text-gray-600">{total.toFixed(1)} kg</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2">
                          <div className={`${colors.bar} h-2 rounded-full transition-all duration-500`} style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        </div>

        {/* Emission Records Table */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-green-900 flex items-center gap-2">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16"/></svg>
              Emission Records
            </h2>
            <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full font-medium">{recordCount} record{recordCount !== 1 ? 's' : ''}</span>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-green-50/80">
                  <th className="py-3 px-4 text-left text-xs font-semibold text-green-800 uppercase tracking-wide rounded-tl-lg">#</th>
                  <th className="py-3 px-4 text-left text-xs font-semibold text-green-800 uppercase tracking-wide">Category</th>
                  <th className="py-3 px-4 text-left text-xs font-semibold text-green-800 uppercase tracking-wide">Activity</th>
                  <th className="py-3 px-4 text-left text-xs font-semibold text-green-800 uppercase tracking-wide">Quantity</th>
                  <th className="py-3 px-4 text-left text-xs font-semibold text-green-800 uppercase tracking-wide">CO₂ (kg)</th>
                  <th className="py-3 px-4 text-right text-xs font-semibold text-green-800 uppercase tracking-wide rounded-tr-lg">Action</th>
                </tr>
              </thead>
              <tbody>
                {emissions.length === 0 && !loading ? (
                  <tr>
                    <td colSpan="6" className="py-10 text-center">
                      <div className="text-gray-400">
                        <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"/></svg>
                        <p className="text-sm">No emission records yet.</p>
                        <p className="text-xs mt-1">Add your first emission above to get started!</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  emissions.map((e, i) => {
                    const colors = CATEGORY_COLORS[e.category] || CATEGORY_COLORS.Other;
                    return (
                      <tr key={e.id || i} className="border-t border-gray-100 hover:bg-green-50/40 transition">
                        <td className="py-3 px-4 text-sm text-gray-400">{i + 1}</td>
                        <td className="py-3 px-4">
                          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${colors.bg} ${colors.text}`}>{e.category}</span>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-700">{e.activityType}</td>
                        <td className="py-3 px-4 text-sm text-gray-700">{e.quantity}</td>
                        <td className="py-3 px-4 text-sm font-semibold text-gray-800">{e.carbonOutput}</td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => startEditing(e)}
                              className="text-blue-400 hover:text-blue-600 hover:bg-blue-50 p-1.5 rounded-lg transition"
                              title="Edit"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                            </button>
                            <button
                              onClick={() => handleDeleteEmission(e.id, i)}
                              className="text-red-400 hover:text-red-600 hover:bg-red-50 p-1.5 rounded-lg transition"
                              title="Delete"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
