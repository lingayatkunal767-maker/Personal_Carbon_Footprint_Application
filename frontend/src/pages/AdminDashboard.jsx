import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { apiFetch } from "../utils/api";
import "./AdminDashboard.css";

// ── Tab configuration ──────────────────────────────────────
const TABS = [
  { key: "analytics", icon: "📊", label: "Analytics" },
  { key: "users", icon: "👥", label: "Users" },
  { key: "carbon", icon: "🌍", label: "Carbon Data" },
  { key: "goals", icon: "🎯", label: "Goals" },
  { key: "badges", icon: "🏅", label: "Badges" },
  { key: "leaderboard", icon: "🏆", label: "Leaderboard" },
  { key: "marketplace", icon: "🛒", label: "Marketplace" },
  { key: "transactions", icon: "💳", label: "Transactions" },
  { key: "notifications", icon: "🔔", label: "Notifications" },
  { key: "settings", icon: "⚙", label: "Settings" },
];

// ── Mock Data / Fallbacks ─────────────────────────────────
const MOCK_USERS = [
  { id: 101, name: "Vikram Malhotra", email: "vikram@gmail.com", role: "User", status: "Active", createdAt: "2024-11-15", city: "Delhi" },
  { id: 102, name: "Ananya Desai", email: "ananya@gmail.com", role: "User", status: "Active", createdAt: "2024-12-01", city: "Mumbai" },
  { id: 103, name: "Kabir Khan", email: "kabir@gmail.com", role: "User", status: "Active", createdAt: "2025-01-10", city: "Bengaluru" },
  { id: 104, name: "Meera Reddy", email: "meera@gmail.com", role: "User", status: "Inactive", createdAt: "2024-10-20", city: "Chennai" },
  { id: 105, name: "Admin User", email: "admin@gmail.com", role: "Admin", status: "Active", createdAt: "2024-09-01", city: "Pune" },
];

const MOCK_CARBON_LOGS = [
  { id: 1, user: "Vikram Malhotra", date: "2025-03-10", totalEmission: 45, transport: 20, food: 12, energy: 13 },
  { id: 2, user: "Ananya Desai", date: "2025-03-10", totalEmission: 38, transport: 10, food: 8, energy: 20 },
  { id: 3, user: "Kabir Khan", date: "2025-03-10", totalEmission: 22, transport: 5, food: 7, energy: 10 },
  { id: 4, user: "Meera Reddy", date: "2025-03-09", totalEmission: 50, transport: 22, food: 14, energy: 14 },
  { id: 5, user: "Vikram Malhotra", date: "2025-03-09", totalEmission: 42, transport: 18, food: 11, energy: 13 },
];

const MOCK_GOALS = [
  { id: 1, user: "Vikram Malhotra", title: "Reduce monthly emissions", target: 30, current: 45, status: "Active" },
  { id: 2, user: "Ananya Desai", title: "Reduce transport usage", target: 5, current: 5, status: "Completed" },
  { id: 3, user: "Kabir Khan", title: "Go zero energy emission", target: 0, current: 10, status: "Active" },
  { id: 4, user: "Meera Reddy", title: "Switch to vegetarian diet", target: 5, current: 14, status: "Active" },
];

const MOCK_BADGES = [
  { id: 1, name: "Eco Starter", icon: "🌱", condition: "Complete first survey", active: true, usersEarned: 4 },
  { id: 2, name: "Green Achiever", icon: "🏆", condition: "Complete first goal", active: true, usersEarned: 1 },
  { id: 3, name: "Carbon Saver", icon: "✂️", condition: "Reduce emissions by 20%", active: true, usersEarned: 0 },
  { id: 4, name: "Week Warrior", icon: "📅", condition: "Log 7 consecutive days", active: true, usersEarned: 2 },
  { id: 5, name: "Solar Hero", icon: "☀️", condition: "Zero energy emissions for a week", active: false, usersEarned: 0 },
];

const MOCK_LEADERBOARD = [
  { rank: 1, user: "Vikram Malhotra", city: "Delhi", emissionReduction: 25, goalsCompleted: 3, badgesEarned: 4, score: 1650 },
  { rank: 2, user: "Ananya Desai", city: "Mumbai", emissionReduction: 20, goalsCompleted: 2, badgesEarned: 3, score: 1500 },
  { rank: 3, user: "Kabir Khan", city: "Bengaluru", emissionReduction: 18, goalsCompleted: 1, badgesEarned: 3, score: 1400 },
  { rank: 4, user: "Meera Reddy", city: "Chennai", emissionReduction: 10, goalsCompleted: 0, badgesEarned: 2, score: 520 },
];

const MOCK_MARKETPLACE = [
  { id: 1, name: "Tree Planting", icon: "🌳", type: "Carbon Offset", price: 200, desc: "Plant a tree to offset your carbon emissions." },
  { id: 2, name: "Solar Energy Support", icon: "☀️", type: "Renewable Energy", price: 500, desc: "Support solar energy projects." },
  { id: 3, name: "Carbon Credit", icon: "📜", type: "Carbon Credit", price: 350, desc: "Purchase verified carbon credits." },
  { id: 4, name: "Clean Water Initiative", icon: "💧", type: "Social Impact", price: 150, desc: "Fund clean water access projects." },
  { id: 5, name: "Bamboo Toothbrush Pack", icon: "🎋", type: "Eco Product", price: 120, desc: "Pack of 4 biodegradable toothbrushes." },
  { id: 6, name: "Reusable Water Bottle", icon: "🚰", type: "Eco Product", price: 450, desc: "Stainless steel bottle to reduce plastic waste." },
  { id: 7, name: "Solar Power Bank", icon: "🔋", type: "Electronics", price: 1200, desc: "Charge devices using renewable solar energy." },
  { id: 8, name: "Organic Compost Bin", icon: "♻️", type: "Home & Garden", price: 850, desc: "Start composting at home with zero odor." },
];

const MOCK_TRANSACTIONS = [
  { id: 1, user: "Vikram Malhotra", item: "Tree Planting", amount: 200, date: "2025-03-08", status: "Completed" },
  { id: 2, user: "Ananya Desai", item: "Carbon Credit", amount: 500, date: "2025-03-09", status: "Completed" },
  { id: 3, user: "Kabir Khan", item: "Solar Energy Support", amount: 500, date: "2025-03-10", status: "Pending" },
  { id: 4, user: "Meera Reddy", item: "Tree Planting", amount: 200, date: "2025-03-11", status: "Completed" },
];

const MOCK_NOTIFICATIONS = [
  { id: 1, type: "info", message: "New user registered: Meera Reddy", date: "2025-03-11 14:30" },
  { id: 2, type: "success", message: "Ananya Desai completed goal: Reduce transport usage", date: "2025-03-10 09:15" },
  { id: 3, type: "warning", message: "High emission detected for Vikram Malhotra (45 kg)", date: "2025-03-10 18:00" },
  { id: 4, type: "info", message: "Badge 'Eco Starter' earned by Kabir Khan", date: "2025-03-09 12:45" },
  { id: 5, type: "error", message: "Transaction failed for order #1023", date: "2025-03-08 16:20" },
  { id: 6, type: "success", message: "Leaderboard updated successfully", date: "2025-03-08 00:00" },
];

const NOTIF_ICONS = { info: "ℹ️", success: "✅", warning: "⚠️", error: "❌" };

// ── Main Component ─────────────────────────────────────────
export default function AdminDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("analytics");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [userFilter, setUserFilter] = useState("all");

  // Admin data — real backend where available, mock fallbacks
  const [adminLeaderboard, setAdminLeaderboard] = useState(MOCK_LEADERBOARD);
  const [adminBadges, setAdminBadges] = useState(MOCK_BADGES);
  const [adminCarbonLogs, setAdminCarbonLogs] = useState([]);
  const [adminGoals, setAdminGoals] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [badgeTemplates, setBadgeTemplates] = useState([]);

  // Badge award form state
  const [badgeUserQuery, setBadgeUserQuery] = useState("");
  const [selectedBadgeUser, setSelectedBadgeUser] = useState(null);
  const [badgeSelectedTemplateId, setBadgeSelectedTemplateId] = useState("");
  const [badgeEditId, setBadgeEditId] = useState(null);
  const [badgeEditDraft, setBadgeEditDraft] = useState({ name: "", conditionText: "", icon: "", active: true });
  const [newTemplate, setNewTemplate] = useState({ name: "", description: "", conditionText: "", icon: "", active: true });
  const [creatingTemplate, setCreatingTemplate] = useState(false);
  const [showCreateTemplateForm, setShowCreateTemplateForm] = useState(false);
  const [editingTemplateId, setEditingTemplateId] = useState(null);
  const [showAwardForm, setShowAwardForm] = useState(false);
  const [badgeSubmitting, setBadgeSubmitting] = useState(false);
  const [badgeMessage, setBadgeMessage] = useState("");
  const [badgeFilter, setBadgeFilter] = useState("all");

  // ── Create / update badge template ──────
  const handleCreateTemplate = async (e) => {
    e.preventDefault();
    setBadgeMessage("");
    if (!newTemplate.name) { setBadgeMessage("Template name is required."); return; }
    const token = localStorage.getItem("token");
    if (!token) { navigate("/login"); return; }

    try {
      setCreatingTemplate(true);
      const payload = { name: newTemplate.name, description: newTemplate.description, conditionText: newTemplate.conditionText, icon: newTemplate.icon, active: newTemplate.active };

      if (editingTemplateId) {
        const updated = await apiFetch(`/api/badge-templates/${editingTemplateId}`, { method: "PUT", body: JSON.stringify(payload) });
        setBadgeTemplates((prev) => Array.isArray(prev) ? prev.map((b) => (b.id === updated.id ? updated : b)) : prev);
        setBadgeMessage("Badge template updated successfully.");
      } else {
        const created = await apiFetch("/api/badge-templates", { method: "POST", body: JSON.stringify(payload) });
        setBadgeTemplates((prev) => Array.isArray(prev) ? [...prev, created] : [created]);
        setBadgeMessage("New badge template created successfully.");
      }
      setNewTemplate({ name: "", description: "", conditionText: "", icon: "", active: true });
      setEditingTemplateId(null);
      setShowCreateTemplateForm(false);
    } catch {
      setBadgeMessage("Failed to save badge template.");
    } finally {
      setCreatingTemplate(false);
    }
  };

  // ── Award badge to user ──────────────────
  const handleAwardBadge = async (e) => {
    e.preventDefault();
    setBadgeMessage("");
    if (!selectedBadgeUser || !badgeSelectedTemplateId) { setBadgeMessage("Select both a user and a badge template."); return; }
    const token = localStorage.getItem("token");
    if (!token) { navigate("/login"); return; }

    try {
      setBadgeSubmitting(true);
      await apiFetch("/api/badges/award", {
        method: "POST",
        body: JSON.stringify({ userId: selectedBadgeUser.id, badgeTemplateId: badgeSelectedTemplateId }),
      });
      setBadgeMessage(`Badge awarded to ${selectedBadgeUser.name} successfully!`);
      setSelectedBadgeUser(null);
      setBadgeUserQuery("");
      setBadgeSelectedTemplateId("");
      setShowAwardForm(false);
    } catch {
      setBadgeMessage("Failed to award badge. The endpoint may not be available.");
    } finally {
      setBadgeSubmitting(false);
    }
  };

  // ── Initial data fetch ──────────────────
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { navigate("/login"); return; }

    apiFetch("/api/users/me")
      .then((userData) => {
        setUser(userData);

        // Fetch admin data in parallel
        const fetches = [
          apiFetch("/api/leaderboard").catch(() => null),
          apiFetch("/api/carbon/logs").catch(() => null),
          apiFetch("/api/goals").catch(() => null),
        ];

        Promise.allSettled(fetches).then((results) => {
          const [lbResult, carbonResult, goalsResult] = results;

          if (lbResult.status === "fulfilled" && lbResult.value) {
            const data = Array.isArray(lbResult.value) ? lbResult.value : [];
            if (data.length > 0) {
              const mapped = data
                .map((e, index) => ({
                  rank: index + 1,
                  user: e.userName || e.username || `User ${index + 1}`,
                  city: e.city || MOCK_LEADERBOARD[index % MOCK_LEADERBOARD.length]?.city || "Delhi",
                  emissionReduction: e.emissionReduction ?? 0,
                  goalsCompleted: e.goalsCompleted ?? 0,
                  badgesEarned: e.badgesEarned ?? 0,
                  score: Number(e.score) || 0,
                }))
                .sort((a, b) => b.score - a.score);
              mapped.forEach((entry, idx) => { entry.rank = idx + 1; });
              setAdminLeaderboard(mapped);
            }
          }

          if (carbonResult.status === "fulfilled" && carbonResult.value) {
            const list = Array.isArray(carbonResult.value) ? carbonResult.value : [];
            setAdminCarbonLogs(list);
          }

          if (goalsResult.status === "fulfilled" && goalsResult.value) {
            const list = Array.isArray(goalsResult.value) ? goalsResult.value : [];
            setAdminGoals(list);
          }
        }).finally(() => setLoading(false));
      })
      .catch(() => {
        localStorage.removeItem("token");
        navigate("/login");
      });
  }, [navigate]);

  // Sync tab with URL query param
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tabParam = params.get("tab");
    const validKeys = TABS.map((t) => t.key);
    if (tabParam && validKeys.includes(tabParam)) {
      setActiveTab(tabParam);
      setSearchTerm("");
    } else {
      setActiveTab("analytics");
    }
  }, [location.search]);

  // ── Loading ──────────────────────────────
  if (loading) {
    return (
      <div className="admin-layout">
        <div className="admin-loading">
          <div className="admin-spinner" />
          <p style={{ color: '#065f46', fontWeight: 600 }}>Loading admin panel…</p>
        </div>
      </div>
    );
  }

  // ── Access check ──
  if (!user) {
    return (
      <div className="admin-layout">
        <div className="admin-denied">
          <span className="admin-denied-icon">🛡️</span>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#064e3b' }}>Access Denied</h2>
          <p style={{ color: 'rgba(6, 78, 59, 0.7)' }}>Please log in to access the admin panel.</p>
          <button className="btn btn-primary" onClick={() => navigate("/login")} style={{ marginTop: 16 }}>
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  const ADMIN_EMAILS = ["admin@gmail.com"];
  const isAdmin = user && (ADMIN_EMAILS.includes(user.email) || user.role?.toLowerCase() === "admin");

  if (!isAdmin) {
    return (
      <div className="admin-layout">
        <div className="admin-denied">
          <span className="admin-denied-icon">🛡️</span>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#064e3b' }}>Access Denied</h2>
          <p style={{ color: 'rgba(6, 78, 59, 0.7)' }}>You do not have administrative privileges to view this page.</p>
          <button className="btn btn-primary" onClick={() => navigate("/dashboard")} style={{ marginTop: 16 }}>
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const currentTab = TABS.find((t) => t.key === activeTab) || TABS[0];

  const handleTabClick = (key) => {
    navigate(`/admin?tab=${key}`, { replace: true });
  };

  // ══════════════════════════════════════════
  // RENDER SECTIONS
  // ══════════════════════════════════════════

  // 1. ANALYTICS
  function renderAnalytics() {
    const totalUsers = allUsers.length || MOCK_USERS.length;
    const carbonSource = adminCarbonLogs.length > 0 ? adminCarbonLogs : MOCK_CARBON_LOGS;
    const avgEmissions = carbonSource.length
      ? (carbonSource.reduce((s, l) => s + Number(l.totalEmission || 0), 0) / carbonSource.length).toFixed(1)
      : "0.0";
    const topBadgeSource = adminBadges.length > 0 ? adminBadges : MOCK_BADGES;
    const topBadge = topBadgeSource.reduce((a, b) => (a.usersEarned ?? 0) >= (b.usersEarned ?? 0) ? a : b);
    const totalTransactions = MOCK_TRANSACTIONS.reduce((s, t) => s + t.amount, 0);
    const goalsSource = Array.isArray(adminGoals) ? adminGoals : [];
    const goalsCompleted = goalsSource.filter((g) => g.status === "COMPLETED" || g.status === "Completed").length;

    // Emission by user chart data
    const emissionByUser = {};
    carbonSource.forEach((l) => {
      const key = l.userName || l.user?.name || l.user || "Unknown";
      const val = Number(l.totalEmission || 0);
      emissionByUser[key] = (emissionByUser[key] || 0) + val;
    });
    const maxEmission = Math.max(...Object.values(emissionByUser), 1);

    // Emission by category
    const categoryEmissions = {};
    carbonSource.forEach((l) => {
      categoryEmissions["Transport"] = (categoryEmissions["Transport"] || 0) + Number(l.transport || l.transportEmission || 0);
      categoryEmissions["Food"] = (categoryEmissions["Food"] || 0) + Number(l.food || l.foodEmission || 0);
      categoryEmissions["Energy"] = (categoryEmissions["Energy"] || 0) + Number(l.energy || l.energyEmission || 0);
    });
    const maxCat = Math.max(...Object.values(categoryEmissions), 1);

    const barColors = ["", "blue", "orange", "red", "purple"];

    return (
      <>
        <div className="admin-stats-grid">
          <div className="admin-stat-card"><span className="admin-stat-icon">👥</span><span className="admin-stat-value">{totalUsers}</span><span className="admin-stat-label">Total Users</span></div>
          <div className="admin-stat-card"><span className="admin-stat-icon">🌍</span><span className="admin-stat-value">{avgEmissions} kg</span><span className="admin-stat-label">Avg. Emissions</span></div>
          <div className="admin-stat-card"><span className="admin-stat-icon">🏅</span><span className="admin-stat-value">{topBadge.name}</span><span className="admin-stat-label">Most Earned Badge</span></div>
          <div className="admin-stat-card"><span className="admin-stat-icon">💰</span><span className="admin-stat-value">₹{totalTransactions}</span><span className="admin-stat-label">Marketplace Revenue</span></div>
          <div className="admin-stat-card"><span className="admin-stat-icon">🎯</span><span className="admin-stat-value">{goalsCompleted}</span><span className="admin-stat-label">Goals Completed</span></div>
        </div>

        <div className="admin-charts-grid">
          <div className="admin-chart-card">
            <h4>Emissions by User</h4>
            <div className="admin-bar-chart">
              {Object.entries(emissionByUser).map(([name, val], i) => (
                <div className="admin-bar-row" key={name}>
                  <span className="admin-bar-label" title={name}>{name}</span>
                  <div className="admin-bar-track">
                    <div className={`admin-bar-fill ${barColors[i % barColors.length]}`} style={{ width: `${(val / maxEmission) * 100}%` }} />
                  </div>
                  <span className="admin-bar-value">{val} kg</span>
                </div>
              ))}
            </div>
          </div>

          <div className="admin-chart-card">
            <h4>Emissions by Category</h4>
            <div className="admin-bar-chart">
              {Object.entries(categoryEmissions).map(([cat, val]) => {
                const colorMap = { Transport: "blue", Food: "orange", Energy: "purple" };
                return (
                  <div className="admin-bar-row" key={cat}>
                    <span className="admin-bar-label">{cat}</span>
                    <div className="admin-bar-track">
                      <div className={`admin-bar-fill ${colorMap[cat] || ""}`} style={{ width: `${(val / maxCat) * 100}%` }} />
                    </div>
                    <span className="admin-bar-value">{val} kg</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </>
    );
  }

  // 2. USERS
  function renderUsers() {
    const usersSource = allUsers.length > 0 ? allUsers : MOCK_USERS;
    const filtered = usersSource.filter((u) => {
      const matchSearch = !searchTerm || (u.name || "").toLowerCase().includes(searchTerm.toLowerCase()) || (u.email || "").toLowerCase().includes(searchTerm.toLowerCase());
      const matchFilter = userFilter === "all" || (userFilter === "active" && (u.status || "Active") === "Active") || (userFilter === "blocked" && (u.status || "") === "Inactive");
      return matchSearch && matchFilter;
    });

    return (
      <div className="admin-table-card">
        <div className="admin-table-header">
          <h3 className="admin-table-title">All Users</h3>
          <span className="admin-table-meta">{filtered.length} user{filtered.length !== 1 ? "s" : ""}</span>
        </div>
        <div className="admin-filter-bar">
          {["all", "active", "blocked"].map((f) => (
            <button key={f} className={`admin-filter-btn ${userFilter === f ? "active" : ""}`} onClick={() => setUserFilter(f)}>
              {f === "all" ? "All" : f === "active" ? "Active" : "Blocked"}
            </button>
          ))}
        </div>
        <div style={{ overflowX: "auto" }}>
          <table className="admin-table">
            <thead><tr><th>#</th><th>Name</th><th>Email</th><th>City</th><th>Role</th><th>Status</th><th>Joined</th></tr></thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={7} style={{ textAlign: "center", padding: 32 }}>No users found.</td></tr>
              ) : filtered.map((u, i) => (
                <tr key={u.id || i}>
                  <td>{i + 1}</td>
                  <td style={{ fontWeight: 600 }}>{u.name || "—"}</td>
                  <td>{u.email || "—"}</td>
                  <td>{u.city || "—"}</td>
                  <td><span className={`badge ${(u.role || "").toLowerCase().includes("admin") ? "badge-purple" : "badge-blue"}`}>{u.role || "User"}</span></td>
                  <td><span className={`badge ${(u.status || "Active") === "Active" ? "badge-green" : "badge-red"}`}>{u.status || "Active"}</span></td>
                  <td>{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // 3. CARBON DATA
  function renderCarbon() {
    const logsSource = adminCarbonLogs.length > 0 ? adminCarbonLogs : MOCK_CARBON_LOGS;
    const filtered = logsSource.filter((l) => {
      const name = l.userName || l.user?.name || l.user || "";
      return !searchTerm || name.toLowerCase().includes(searchTerm.toLowerCase());
    });

    return (
      <div className="admin-table-card">
        <div className="admin-table-header">
          <h3 className="admin-table-title">Carbon Emission Logs</h3>
          <span className="admin-table-meta">{filtered.length} record{filtered.length !== 1 ? "s" : ""}</span>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table className="admin-table">
            <thead><tr><th>#</th><th>User</th><th>Date</th><th>Total (kg)</th><th>Transport</th><th>Food</th><th>Energy</th></tr></thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={7} style={{ textAlign: "center", padding: 32 }}>No carbon data found.</td></tr>
              ) : filtered.map((l, i) => (
                <tr key={l.id || i}>
                  <td>{i + 1}</td>
                  <td style={{ fontWeight: 600 }}>{l.userName || l.user?.name || l.user || "—"}</td>
                  <td>{l.date || (l.createdAt ? new Date(l.createdAt).toLocaleDateString() : "—")}</td>
                  <td><strong>{l.totalEmission || "—"}</strong></td>
                  <td>{l.transport || l.transportEmission || "—"}</td>
                  <td>{l.food || l.foodEmission || "—"}</td>
                  <td>{l.energy || l.energyEmission || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // 4. GOALS
  function renderGoals() {
    const goalsSource = adminGoals.length > 0
      ? adminGoals.map((g) => ({
        id: g.id,
        user: g.userName || g.user?.name || "—",
        title: g.goalTitle || g.title || "—",
        target: g.targetEmission ?? g.target ?? "—",
        current: g.currentEmission ?? g.current ?? "—",
        status: g.status || "Active",
      }))
      : MOCK_GOALS;

    const filtered = goalsSource.filter((g) => !searchTerm || (g.user || "").toLowerCase().includes(searchTerm.toLowerCase()) || (g.title || "").toLowerCase().includes(searchTerm.toLowerCase()));

    return (
      <div className="admin-table-card">
        <div className="admin-table-header">
          <h3 className="admin-table-title">All User Goals</h3>
          <span className="admin-table-meta">{filtered.length} goal{filtered.length !== 1 ? "s" : ""}</span>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table className="admin-table">
            <thead><tr><th>#</th><th>User</th><th>Goal</th><th>Target</th><th>Current</th><th>Status</th></tr></thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign: "center", padding: 32 }}>No goals found.</td></tr>
              ) : filtered.map((g, i) => {
                const st = (g.status || "").toLowerCase();
                const badgeClass = st.includes("completed") ? "badge-green" : st.includes("abandon") ? "badge-red" : "badge-yellow";
                return (
                  <tr key={g.id || i}>
                    <td>{i + 1}</td>
                    <td style={{ fontWeight: 600 }}>{g.user}</td>
                    <td>{g.title}</td>
                    <td>{g.target}</td>
                    <td>{g.current}</td>
                    <td><span className={`badge ${badgeClass}`}>{g.status}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // 5. BADGES
  function renderBadges() {
    const badgesSource = badgeTemplates.length > 0
      ? badgeTemplates.map((t) => ({ id: t.id, name: t.name, icon: t.icon || "🏅", condition: t.conditionText || t.description || "—", active: t.active !== false, usersEarned: t.usersEarned ?? 0 }))
      : adminBadges.length > 0 ? adminBadges : MOCK_BADGES;

    const filteredBadges = badgesSource.filter((b) => {
      const matchSearch = !searchTerm || b.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchFilter = badgeFilter === "all" || (badgeFilter === "active" && b.active) || (badgeFilter === "disabled" && !b.active);
      return matchSearch && matchFilter;
    });

    // User search for award form
    const matchedUsers = badgeUserQuery.length >= 2
      ? (allUsers.length > 0 ? allUsers : MOCK_USERS).filter((u) => (u.name || "").toLowerCase().includes(badgeUserQuery.toLowerCase()) || (u.email || "").toLowerCase().includes(badgeUserQuery.toLowerCase())).slice(0, 6)
      : [];

    return (
      <>
        {badgeMessage && <div className={`admin-msg ${badgeMessage.includes("Failed") ? "error" : ""}`}>{badgeMessage}</div>}

        <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
          <button className="btn btn-primary btn-sm" onClick={() => { setShowCreateTemplateForm(!showCreateTemplateForm); setEditingTemplateId(null); setNewTemplate({ name: "", description: "", conditionText: "", icon: "", active: true }); }}>
            {showCreateTemplateForm ? "Cancel" : "+ New Badge Template"}
          </button>
          <button className="btn btn-outline btn-sm" onClick={() => setShowAwardForm(!showAwardForm)}>
            {showAwardForm ? "Cancel" : "🎖 Award Badge"}
          </button>
        </div>

        {/* Create / Edit template form */}
        {showCreateTemplateForm && (
          <form className="admin-badge-form" onSubmit={handleCreateTemplate}>
            <h4>{editingTemplateId ? "Edit Badge Template" : "Create New Badge Template"}</h4>
            <div className="admin-form-row">
              <div className="admin-form-group">
                <label className="admin-form-label">Name *</label>
                <input className="admin-form-input" value={newTemplate.name} onChange={(e) => setNewTemplate((t) => ({ ...t, name: e.target.value }))} placeholder="e.g. Carbon Saver" required />
              </div>
              <div className="admin-form-group">
                <label className="admin-form-label">Icon (emoji)</label>
                <input className="admin-form-input" value={newTemplate.icon} onChange={(e) => setNewTemplate((t) => ({ ...t, icon: e.target.value }))} placeholder="🏅" />
              </div>
            </div>
            <div className="admin-form-group">
              <label className="admin-form-label">Description</label>
              <input className="admin-form-input" value={newTemplate.description} onChange={(e) => setNewTemplate((t) => ({ ...t, description: e.target.value }))} placeholder="Awarded for..." />
            </div>
            <div className="admin-form-group">
              <label className="admin-form-label">Condition</label>
              <input className="admin-form-input" value={newTemplate.conditionText} onChange={(e) => setNewTemplate((t) => ({ ...t, conditionText: e.target.value }))} placeholder="Reduce emissions by 20%" />
            </div>
            <div className="admin-form-actions">
              <button type="submit" className="btn btn-primary btn-sm" disabled={creatingTemplate}>
                {creatingTemplate ? "Saving…" : editingTemplateId ? "Update Template" : "Create Template"}
              </button>
            </div>
          </form>
        )}

        {/* Award badge form */}
        {showAwardForm && (
          <form className="admin-badge-form" onSubmit={handleAwardBadge}>
            <h4>Award Badge to User</h4>
            <div className="admin-form-row">
              <div className="admin-form-group admin-user-dropdown">
                <label className="admin-form-label">Search User</label>
                <input className="admin-form-input" value={selectedBadgeUser ? selectedBadgeUser.name : badgeUserQuery} onChange={(e) => { setBadgeUserQuery(e.target.value); setSelectedBadgeUser(null); }} placeholder="Type a name or email…" />
                {matchedUsers.length > 0 && !selectedBadgeUser && (
                  <div className="admin-user-list">
                    {matchedUsers.map((u) => (
                      <button type="button" key={u.id} className="admin-user-option" onClick={() => { setSelectedBadgeUser(u); setBadgeUserQuery(""); }}>
                        {u.name} — {u.email}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="admin-form-group">
                <label className="admin-form-label">Badge Template</label>
                <select className="admin-form-select" value={badgeSelectedTemplateId} onChange={(e) => setBadgeSelectedTemplateId(e.target.value)}>
                  <option value="">Select badge…</option>
                  {badgesSource.map((b) => <option key={b.id} value={b.id}>{b.icon} {b.name}</option>)}
                </select>
              </div>
            </div>
            <div className="admin-form-actions">
              <button type="submit" className="btn btn-primary btn-sm" disabled={badgeSubmitting}>
                {badgeSubmitting ? "Awarding…" : "Award Badge"}
              </button>
            </div>
          </form>
        )}

        {/* Filter bar */}
        <div className="admin-filter-bar">
          {["all", "active", "disabled"].map((f) => (
            <button key={f} className={`admin-filter-btn ${badgeFilter === f ? "active" : ""}`} onClick={() => setBadgeFilter(f)}>
              {f === "all" ? "All" : f === "active" ? "Active" : "Disabled"}
            </button>
          ))}
        </div>

        <div className="admin-table-card" style={{ marginBottom: 0 }}>
          <div className="admin-table-header">
            <h3 className="admin-table-title">Badge Templates</h3>
            <span className="admin-table-meta">{filteredBadges.length} badge{filteredBadges.length !== 1 ? "s" : ""}</span>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table className="admin-table">
              <thead><tr><th>Icon</th><th>Name</th><th>Condition</th><th>Status</th><th>Users Earned</th><th>Actions</th></tr></thead>
              <tbody>
                {filteredBadges.length === 0 ? (
                  <tr><td colSpan={6} style={{ textAlign: "center", padding: 32 }}>No badges found.</td></tr>
                ) : filteredBadges.map((b) => (
                  <tr key={b.id}>
                    <td style={{ fontSize: 24 }}>{b.icon}</td>
                    <td style={{ fontWeight: 600 }}>{b.name}</td>
                    <td>{b.condition}</td>
                    <td><span className={`badge ${b.active ? "badge-green" : "badge-gray"}`}>{b.active ? "Active" : "Disabled"}</span></td>
                    <td>{b.usersEarned}</td>
                    <td>
                      <button className="btn btn-sm btn-secondary" onClick={() => { setShowCreateTemplateForm(true); setEditingTemplateId(b.id); setNewTemplate({ name: b.name, description: b.condition, conditionText: b.condition, icon: b.icon, active: b.active }); }}>
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </>
    );
  }

  // 6. LEADERBOARD
  function renderLeaderboard() {
    const lb = adminLeaderboard;
    return (
      <div className="admin-table-card">
        <div className="admin-table-header">
          <h3 className="admin-table-title">Leaderboard Rankings</h3>
          <span className="admin-table-meta">{lb.length} participant{lb.length !== 1 ? "s" : ""}</span>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table className="admin-table">
            <thead><tr><th>Rank</th><th>User</th><th>City</th><th>Score</th><th>Emission Reduction</th><th>Goals Done</th><th>Badges</th></tr></thead>
            <tbody>
              {lb.map((e) => (
                <tr key={e.rank}>
                  <td><strong>{e.rank <= 3 ? ["🥇", "🥈", "🥉"][e.rank - 1] : `#${e.rank}`}</strong></td>
                  <td style={{ fontWeight: 600 }}>{e.user}</td>
                  <td>{e.city || "—"}</td>
                  <td><strong>{e.score}</strong> pts</td>
                  <td>{e.emissionReduction}%</td>
                  <td>{e.goalsCompleted}</td>
                  <td>{e.badgesEarned}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // 7. MARKETPLACE
  function renderMarketplace() {
    const items = MOCK_MARKETPLACE;
    return (
      <>
        <div className="admin-marketplace-grid">
          {items.map((item) => (
            <div className="admin-mp-card" key={item.id}>
              <div className="admin-mp-icon">{item.icon}</div>
              <div className="admin-mp-name">{item.name}</div>
              <div className="admin-mp-type">{item.type}</div>
              <div className="admin-mp-desc">{item.desc}</div>
              <div className="admin-mp-price">₹{item.price}</div>
            </div>
          ))}
        </div>
      </>
    );
  }

  // 8. TRANSACTIONS
  function renderTransactions() {
    const txns = MOCK_TRANSACTIONS;
    return (
      <div className="admin-table-card">
        <div className="admin-table-header">
          <h3 className="admin-table-title">All Transactions</h3>
          <span className="admin-table-meta">{txns.length} transaction{txns.length !== 1 ? "s" : ""}</span>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table className="admin-table">
            <thead><tr><th>#</th><th>User</th><th>Item</th><th>Amount</th><th>Date</th><th>Status</th></tr></thead>
            <tbody>
              {txns.map((t) => (
                <tr key={t.id}>
                  <td>{t.id}</td>
                  <td style={{ fontWeight: 600 }}>{t.user}</td>
                  <td>{t.item}</td>
                  <td><strong>₹{t.amount}</strong></td>
                  <td>{t.date}</td>
                  <td><span className={`badge ${t.status === "Completed" ? "badge-green" : "badge-yellow"}`}>{t.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // 9. NOTIFICATIONS
  function renderNotifications() {
    const notifs = MOCK_NOTIFICATIONS;
    return (
      <div className="admin-table-card">
        <div className="admin-table-header">
          <h3 className="admin-table-title">System Notifications</h3>
          <span className="admin-table-meta">{notifs.length} notification{notifs.length !== 1 ? "s" : ""}</span>
        </div>
        <div className="admin-notif-list">
          {notifs.map((n) => (
            <div className={`admin-notif-item notif-${n.type}`} key={n.id}>
              <div className={`admin-notif-icon-wrap ${n.type}`}>
                {NOTIF_ICONS[n.type] || "📌"}
              </div>
              <div className="admin-notif-body">
                <div className="admin-notif-msg">{n.message}</div>
                <div className="admin-notif-date">{n.date}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 10. SETTINGS
  function renderSettings() {
    return (
      <div className="admin-table-card">
        <div className="admin-table-header">
          <h3 className="admin-table-title">Admin Settings & Maintenance</h3>
        </div>
        <div className="admin-empty">
          <span className="admin-empty-icon">🛠️</span>
          <p className="text-gray-600 font-semibold">Settings and maintenance tools are under development.</p>
          <p style={{ fontSize: 13, color: "#6b7280", marginTop: 4 }}>
            Use this space to configure system behaviour, maintenance windows, and other admin-only options.
          </p>
        </div>
      </div>
    );
  }

  // ── Render content switcher ──────────────
  const renderContent = () => {
    switch (activeTab) {
      case "analytics": return renderAnalytics();
      case "users": return renderUsers();
      case "carbon": return renderCarbon();
      case "goals": return renderGoals();
      case "badges": return renderBadges();
      case "leaderboard": return renderLeaderboard();
      case "marketplace": return renderMarketplace();
      case "transactions": return renderTransactions();
      case "notifications": return renderNotifications();
      case "settings": return renderSettings();
      default: return null;
    }
  };

  // ── Main render ──────────────────────────
  return (
    <div className="admin-layout">
      {/* Topbar matches the screenshot provided */}
      <header className="admin-topbar">
        <div className="admin-topbar-left">
          <div className="admin-topbar-logo">🌱 CarbonCalc <span className="admin-badge-label">Admin</span></div>
        </div>
        <div className="admin-topbar-right">
          <div className="admin-topbar-profile" onClick={() => navigate("/dashboard")} title="Back to User Dashboard">
            <div className="admin-topbar-avatar">{user?.name ? user.name.charAt(0).toUpperCase() : "A"}</div>
            <div className="admin-topbar-user-info">
              <span className="admin-topbar-name">{user?.name || "Admin"}</span>
              <span className="admin-topbar-role">{user?.role?.toUpperCase() || "ADMIN"}</span>
            </div>
          </div>
        </div>
      </header>

      <div className="admin-shell">
        {/* Sidebar */}
        <aside className="admin-sidebar">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              className={`admin-tab-btn ${activeTab === tab.key ? "active" : ""}`}
              onClick={() => handleTabClick(tab.key)}
            >
              <span className="admin-tab-icon">{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </aside>

        {/* Main Content */}
        <main className="admin-main">
          <div className="admin-page-header">
            <h1 className="admin-page-title">
              <span className="admin-page-title-icon">{currentTab.icon}</span>
              {currentTab.label}
            </h1>
            {["users", "carbon", "goals", "badges"].includes(activeTab) && (
              <input
                className="admin-search-box"
                type="text"
                placeholder={`Search ${currentTab.label.toLowerCase()}…`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            )}
          </div>

          {renderContent()}
        </main>
      </div>
    </div>
  );
}
