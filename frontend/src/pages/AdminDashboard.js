import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import AppLayout from "../components/AppLayout";
import "./AdminDashboard.css";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:8080";

// ── Tab configuration ──────────────────────────────────────
const TABS = [
  { key: "analytics",     icon: "📊", label: "Analytics" },
  { key: "users",         icon: "👥", label: "Users" },
  { key: "surveys",       icon: "📋", label: "Surveys" },
  { key: "carbon",        icon: "🌍", label: "Carbon Data" },
  { key: "goals",         icon: "🎯", label: "Goals" },
  { key: "badges",        icon: "🏅", label: "Badges" },
  { key: "leaderboard",   icon: "🏆", label: "Leaderboard" },
  { key: "marketplace",   icon: "🛒", label: "Marketplace" },
  { key: "transactions",  icon: "💳", label: "Transactions" },
  { key: "notifications", icon: "🔔", label: "Notifications" },
];

// ── Mock Data ──────────────────────────────────────────────
const MOCK_USERS = [
  { id: 101, name: "Rahul Sharma", email: "rahul@gmail.com", role: "User", status: "Active", createdAt: "2024-11-15" },
  { id: 102, name: "Neha Gupta", email: "neha@gmail.com", role: "User", status: "Active", createdAt: "2024-12-01" },
  { id: 103, name: "Aman Verma", email: "aman@gmail.com", role: "User", status: "Active", createdAt: "2025-01-10" },
  { id: 104, name: "Priya Singh", email: "priya@gmail.com", role: "User", status: "Inactive", createdAt: "2024-10-20" },
  { id: 105, name: "Admin User", email: "admin@gmail.com", role: "Admin", status: "Active", createdAt: "2024-09-01" },
];

const MOCK_SURVEYS = [
  { id: 1, user: "Rahul Sharma", transport: "Car – 20 km/day", diet: "Non-Vegetarian", energy: "Electricity – 300 kWh/month", date: "2025-02-10" },
  { id: 2, user: "Neha Gupta", transport: "Public Transit", diet: "Vegetarian", energy: "Electricity – 180 kWh/month", date: "2025-02-12" },
  { id: 3, user: "Aman Verma", transport: "Bicycle", diet: "Vegan", energy: "Solar + Grid – 120 kWh/month", date: "2025-02-15" },
  { id: 4, user: "Priya Singh", transport: "Motorbike – 15 km/day", diet: "Non-Vegetarian", energy: "Electricity – 250 kWh/month", date: "2025-02-18" },
];

const MOCK_CARBON_LOGS = [
  { id: 1, user: "Rahul Sharma", date: "2025-03-10", totalEmission: 45, transport: 20, food: 12, energy: 13 },
  { id: 2, user: "Neha Gupta", date: "2025-03-10", totalEmission: 38, transport: 10, food: 8, energy: 20 },
  { id: 3, user: "Aman Verma", date: "2025-03-10", totalEmission: 22, transport: 5, food: 7, energy: 10 },
  { id: 4, user: "Priya Singh", date: "2025-03-09", totalEmission: 50, transport: 22, food: 14, energy: 14 },
  { id: 5, user: "Rahul Sharma", date: "2025-03-09", totalEmission: 42, transport: 18, food: 11, energy: 13 },
];

const MOCK_GOALS = [
  { id: 1, user: "Rahul Sharma", title: "Reduce monthly emissions", target: 30, current: 45, status: "Active" },
  { id: 2, user: "Neha Gupta", title: "Reduce transport usage", target: 5, current: 5, status: "Completed" },
  { id: 3, user: "Aman Verma", title: "Go zero energy emission", target: 0, current: 10, status: "Active" },
  { id: 4, user: "Priya Singh", title: "Switch to vegetarian diet", target: 5, current: 14, status: "Active" },
];

const MOCK_BADGES = [
  { id: 1, name: "Eco Starter", icon: "🌱", condition: "Complete first survey", active: true, usersEarned: 4 },
  { id: 2, name: "Green Achiever", icon: "🏆", condition: "Complete first goal", active: true, usersEarned: 1 },
  { id: 3, name: "Carbon Saver", icon: "✂️", condition: "Reduce emissions by 20%", active: true, usersEarned: 0 },
  { id: 4, name: "Week Warrior", icon: "📅", condition: "Log 7 consecutive days", active: true, usersEarned: 2 },
  { id: 5, name: "Solar Hero", icon: "☀️", condition: "Zero energy emissions for a week", active: false, usersEarned: 0 },
];

const MOCK_LEADERBOARD = [
  { rank: 1, user: "Rahul Sharma", emissionReduction: 25, goalsCompleted: 3, badgesEarned: 4, score: 1650 },
  { rank: 2, user: "Neha Gupta", emissionReduction: 20, goalsCompleted: 2, badgesEarned: 3, score: 1500 },
  { rank: 3, user: "Aman Verma", emissionReduction: 18, goalsCompleted: 1, badgesEarned: 3, score: 1400 },
  { rank: 4, user: "Priya Singh", emissionReduction: 10, goalsCompleted: 0, badgesEarned: 2, score: 520 },
];

const MOCK_MARKETPLACE = [
  { id: 1, name: "Tree Planting", icon: "🌳", type: "Carbon Offset", price: 200, desc: "Plant a tree to offset your carbon emissions." },
  { id: 2, name: "Solar Energy Support", icon: "☀️", type: "Renewable Energy", price: 500, desc: "Support solar energy projects." },
  { id: 3, name: "Carbon Credit", icon: "📜", type: "Carbon Credit", price: 350, desc: "Purchase verified carbon credits." },
  { id: 4, name: "Clean Water Initiative", icon: "💧", type: "Social Impact", price: 150, desc: "Fund clean water access projects." },
];

const MOCK_TRANSACTIONS = [
  { id: 1, user: "Rahul Sharma", item: "Tree Planting", amount: 200, date: "2025-03-08", status: "Completed" },
  { id: 2, user: "Neha Gupta", item: "Carbon Credit", amount: 500, date: "2025-03-09", status: "Completed" },
  { id: 3, user: "Aman Verma", item: "Solar Energy Support", amount: 500, date: "2025-03-10", status: "Pending" },
  { id: 4, user: "Priya Singh", item: "Tree Planting", amount: 200, date: "2025-03-11", status: "Completed" },
];

const MOCK_NOTIFICATIONS = [
  { id: 1, type: "info", message: "New user registered: Priya Singh", date: "2025-03-11 14:30" },
  { id: 2, type: "success", message: "Neha Gupta completed goal: Reduce transport usage", date: "2025-03-10 09:15" },
  { id: 3, type: "warning", message: "High emission detected for Rahul Sharma (45 kg)", date: "2025-03-10 18:00" },
  { id: 4, type: "info", message: "Badge 'Eco Starter' earned by Aman Verma", date: "2025-03-09 12:45" },
  { id: 5, type: "error", message: "Transaction failed for order #1023", date: "2025-03-08 16:20" },
  { id: 6, type: "success", message: "Leaderboard updated successfully", date: "2025-03-08 00:00" },
];

// ── Main Component ─────────────────────────────────────────
function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("analytics");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { navigate("/"); return; }

    axios
      .get(`${API_BASE}/api/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => {
        setUser(res.data);
        setLoading(false);
      })
      .catch(() => {
        localStorage.removeItem("token");
        navigate("/");
      });
  }, [navigate]);

  if (loading) {
    return (
      <AppLayout>
        <div className="admin-loading">
          <div className="admin-spinner" />
          <p>Loading admin panel…</p>
        </div>
      </AppLayout>
    );
  }

  if (!user || (user.role !== "Admin" && user.role !== "ADMIN" && user.role !== "admin")) {
    return (
      <AppLayout>
        <div className="admin-denied">
          <span className="admin-denied-icon">🛡️</span>
          <h2>Access Denied</h2>
          <p>You don't have admin privileges to access this page.</p>
          <button className="btn btn-primary" onClick={() => navigate("/dashboard")} style={{ marginTop: 16 }}>
            Go to Dashboard
          </button>
        </div>
      </AppLayout>
    );
  }

  // ── Active tab info
  const currentTab = TABS.find((t) => t.key === activeTab) || TABS[0];

  // ── Render content for each section ──
  const renderContent = () => {
    switch (activeTab) {
      case "analytics":
        return renderAnalytics();
      case "users":
        return renderUsers();
      case "surveys":
        return renderSurveys();
      case "carbon":
        return renderCarbon();
      case "goals":
        return renderGoals();
      case "badges":
        return renderBadges();
      case "leaderboard":
        return renderLeaderboard();
      case "marketplace":
        return renderMarketplace();
      case "transactions":
        return renderTransactions();
      case "notifications":
        return renderNotifications();
      default:
        return null;
    }
  };

  // ══════════════════════════════════════════
  // 1. SYSTEM ANALYTICS
  // ══════════════════════════════════════════
  function renderAnalytics() {
    const totalUsers = MOCK_USERS.length;
    const avgEmissions = (
      MOCK_CARBON_LOGS.reduce((s, l) => s + l.totalEmission, 0) / MOCK_CARBON_LOGS.length
    ).toFixed(1);
    const topBadge = MOCK_BADGES.reduce((a, b) => (a.usersEarned >= b.usersEarned ? a : b));
    const totalTransactions = MOCK_TRANSACTIONS.reduce((s, t) => s + t.amount, 0);
    const goalsCompleted = MOCK_GOALS.filter((g) => g.status === "Completed").length;

    const emissionByUser = {};
    MOCK_CARBON_LOGS.forEach((l) => {
      emissionByUser[l.user] = (emissionByUser[l.user] || 0) + l.totalEmission;
    });
    const maxEmission = Math.max(...Object.values(emissionByUser), 1);

    return (
      <>
        <div className="admin-stats-grid">
          <div className="admin-stat-card">
            <span className="admin-stat-icon">👥</span>
            <span className="admin-stat-value">{totalUsers}</span>
            <span className="admin-stat-label">Total Users</span>
          </div>
          <div className="admin-stat-card">
            <span className="admin-stat-icon">🌍</span>
            <span className="admin-stat-value">{avgEmissions} kg</span>
            <span className="admin-stat-label">Avg. Emissions</span>
          </div>
          <div className="admin-stat-card">
            <span className="admin-stat-icon">🏅</span>
            <span className="admin-stat-value">{topBadge.name}</span>
            <span className="admin-stat-label">Most Earned Badge</span>
          </div>
          <div className="admin-stat-card">
            <span className="admin-stat-icon">💰</span>
            <span className="admin-stat-value">₹{totalTransactions}</span>
            <span className="admin-stat-label">Marketplace Revenue</span>
          </div>
          <div className="admin-stat-card">
            <span className="admin-stat-icon">🎯</span>
            <span className="admin-stat-value">{goalsCompleted}</span>
            <span className="admin-stat-label">Goals Completed</span>
          </div>
        </div>

        <div className="admin-charts-grid">
          <div className="admin-chart-card">
            <h4 className="admin-chart-title">Emissions by User (kg CO₂e)</h4>
            <div className="admin-bar-chart">
              {Object.entries(emissionByUser).map(([name, val]) => (
                <div className="admin-bar-wrap" key={name}>
                  <span className="admin-bar-value">{val}</span>
                  <div
                    className="admin-bar"
                    style={{ height: `${(val / maxEmission) * 100}%` }}
                  />
                  <span className="admin-bar-label">{name.split(" ")[0]}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="admin-chart-card">
            <h4 className="admin-chart-title">Leaderboard Scores</h4>
            <div className="admin-bar-chart">
              {MOCK_LEADERBOARD.map((entry) => (
                <div className="admin-bar-wrap" key={entry.user}>
                  <span className="admin-bar-value">{entry.score}</span>
                  <div
                    className="admin-bar"
                    style={{
                      height: `${(entry.score / Math.max(...MOCK_LEADERBOARD.map((e) => e.score), 1)) * 100}%`,
                    }}
                  />
                  <span className="admin-bar-label">{entry.user.split(" ")[0]}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </>
    );
  }

  // ══════════════════════════════════════════
  // 2. USER MANAGEMENT
  // ══════════════════════════════════════════
  function renderUsers() {
    const filtered = MOCK_USERS.filter(
      (u) =>
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
    return (
      <div className="admin-table-card">
        <div className="admin-table-header">
          <h3 className="admin-table-title">All Users ({filtered.length})</h3>
          <div className="admin-search-wrap">
            <span className="admin-search-icon">🔍</span>
            <input
              type="text"
              className="admin-search-input"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u.id}>
                  <td>{u.id}</td>
                  <td><strong>{u.name}</strong></td>
                  <td>{u.email}</td>
                  <td>{u.role}</td>
                  <td>
                    <span className={`admin-status ${u.status === "Active" ? "admin-status-active" : "admin-status-inactive"}`}>
                      {u.status}
                    </span>
                  </td>
                  <td>{u.createdAt}</td>
                  <td>
                    <div className="admin-actions-row">
                      <button className="admin-action-btn" title="View Profile">👁</button>
                      <button className="admin-action-btn admin-action-btn-danger" title="Deactivate">✕</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════
  // 3. SURVEY MANAGEMENT
  // ══════════════════════════════════════════
  function renderSurveys() {
    return (
      <div className="admin-table-card">
        <div className="admin-table-header">
          <h3 className="admin-table-title">Survey Responses ({MOCK_SURVEYS.length})</h3>
        </div>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>User</th>
                <th>Transport</th>
                <th>Diet</th>
                <th>Energy</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_SURVEYS.map((s) => (
                <tr key={s.id}>
                  <td>{s.id}</td>
                  <td><strong>{s.user}</strong></td>
                  <td>{s.transport}</td>
                  <td>{s.diet}</td>
                  <td>{s.energy}</td>
                  <td>{s.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════
  // 4. CARBON DATA MONITORING
  // ══════════════════════════════════════════
  function renderCarbon() {
    return (
      <div className="admin-table-card">
        <div className="admin-table-header">
          <h3 className="admin-table-title">Carbon Emission Logs</h3>
        </div>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Date</th>
                <th>Transport</th>
                <th>Food</th>
                <th>Energy</th>
                <th>Total Emission</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_CARBON_LOGS.map((l) => (
                <tr key={l.id}>
                  <td><strong>{l.user}</strong></td>
                  <td>{l.date}</td>
                  <td>{l.transport} kg</td>
                  <td>{l.food} kg</td>
                  <td>{l.energy} kg</td>
                  <td>
                    <strong style={{ color: "var(--color-primary)" }}>{l.totalEmission} kg CO₂e</strong>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════
  // 5. GOAL MONITORING
  // ══════════════════════════════════════════
  function renderGoals() {
    return (
      <div className="admin-table-card">
        <div className="admin-table-header">
          <h3 className="admin-table-title">Goal Monitoring</h3>
        </div>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Goal</th>
                <th>Target (kg)</th>
                <th>Current (kg)</th>
                <th>Progress</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_GOALS.map((g) => {
                const progressPct = g.status === "Completed"
                  ? 100
                  : g.target > 0
                    ? Math.max(0, Math.min(100, Math.round((1 - (g.current - g.target) / g.target) * 100)))
                    : 0;
                return (
                  <tr key={g.id}>
                    <td><strong>{g.user}</strong></td>
                    <td>{g.title}</td>
                    <td>{g.target}</td>
                    <td>{g.current}</td>
                    <td>
                      <div style={{
                        width: 80, height: 8, background: "var(--color-border)",
                        borderRadius: 999, overflow: "hidden"
                      }}>
                        <div style={{
                          width: `${progressPct}%`,
                          height: "100%",
                          background: g.status === "Completed"
                            ? "var(--color-accent-green)"
                            : "linear-gradient(90deg, var(--color-primary), var(--color-accent-green))",
                          borderRadius: 999,
                          transition: "width 0.3s"
                        }} />
                      </div>
                    </td>
                    <td>
                      <span className={`admin-status ${g.status === "Completed" ? "admin-status-completed" : "admin-status-pending"}`}>
                        {g.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════
  // 6. BADGE MANAGEMENT
  // ══════════════════════════════════════════
  function renderBadges() {
    return (
      <>
        <div className="admin-table-card" style={{ padding: 20, marginBottom: 20 }}>
          <div className="admin-actions-row">
            <button className="admin-action-btn admin-action-btn-primary">+ Create New Badge</button>
          </div>
        </div>
        <div className="admin-badge-grid">
          {MOCK_BADGES.map((b) => (
            <div className="admin-badge-card" key={b.id}>
              <span className="admin-badge-card-status">
                <span className={`admin-status ${b.active ? "admin-status-active" : "admin-status-inactive"}`}>
                  {b.active ? "Active" : "Disabled"}
                </span>
              </span>
              <span className="admin-badge-card-icon">{b.icon}</span>
              <div className="admin-badge-card-name">{b.name}</div>
              <div className="admin-badge-card-condition">{b.condition}</div>
              <div style={{ fontSize: 12, color: "var(--color-text-muted)", marginBottom: 10 }}>
                {b.usersEarned} users earned
              </div>
              <div className="admin-actions-row">
                <button className="admin-action-btn">Edit</button>
                <button className="admin-action-btn admin-action-btn-danger">
                  {b.active ? "Disable" : "Enable"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </>
    );
  }

  // ══════════════════════════════════════════
  // 7. LEADERBOARD MANAGEMENT
  // ══════════════════════════════════════════
  function renderLeaderboard() {
    return (
      <>
        <div className="admin-formula-card">
          <div className="admin-formula-label">Scoring Formula</div>
          <p className="admin-formula-text">
            Score = (Emission Reduction × 50) + (Goals Completed × 20) + (Badges Earned × 10)
          </p>
        </div>
        <div className="admin-table-card">
          <div className="admin-table-header">
            <h3 className="admin-table-title">Leaderboard Rankings</h3>
            <button className="admin-action-btn admin-action-btn-danger">🔄 Reset Leaderboard</button>
          </div>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>User</th>
                  <th>Emission Reduction</th>
                  <th>Goals Completed</th>
                  <th>Badges Earned</th>
                  <th>Score</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_LEADERBOARD.map((entry) => (
                  <tr key={entry.rank}>
                    <td>
                      <strong style={{
                        color: entry.rank <= 3 ? "var(--color-primary)" : "var(--color-text)",
                        fontSize: entry.rank <= 3 ? 16 : 14,
                      }}>
                        {entry.rank === 1 ? "🥇" : entry.rank === 2 ? "🥈" : entry.rank === 3 ? "🥉" : `#${entry.rank}`}
                      </strong>
                    </td>
                    <td><strong>{entry.user}</strong></td>
                    <td>{entry.emissionReduction} kg</td>
                    <td>{entry.goalsCompleted}</td>
                    <td>{entry.badgesEarned}</td>
                    <td><strong style={{ color: "var(--color-primary)", fontSize: 16 }}>{entry.score}</strong></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </>
    );
  }

  // ══════════════════════════════════════════
  // 8. ECO MARKETPLACE MANAGEMENT
  // ══════════════════════════════════════════
  function renderMarketplace() {
    return (
      <>
        <div style={{ marginBottom: 20 }}>
          <button className="admin-action-btn admin-action-btn-primary">+ Add New Item</button>
        </div>
        <div className="admin-marketplace-grid">
          {MOCK_MARKETPLACE.map((item) => (
            <div className="admin-product-card" key={item.id}>
              <span className="admin-product-icon">{item.icon}</span>
              <span className="admin-product-type">{item.type}</span>
              <h4 className="admin-product-name">{item.name}</h4>
              <p className="admin-product-desc">{item.desc}</p>
              <span className="admin-product-price">₹{item.price}</span>
              <div className="admin-actions-row">
                <button className="admin-action-btn">Edit</button>
                <button className="admin-action-btn admin-action-btn-danger">Remove</button>
              </div>
            </div>
          ))}
        </div>
      </>
    );
  }

  // ══════════════════════════════════════════
  // 9. TRANSACTION MONITORING
  // ══════════════════════════════════════════
  function renderTransactions() {
    return (
      <div className="admin-table-card">
        <div className="admin-table-header">
          <h3 className="admin-table-title">Transaction History</h3>
        </div>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>User</th>
                <th>Item</th>
                <th>Amount</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_TRANSACTIONS.map((t) => (
                <tr key={t.id}>
                  <td>#{t.id}</td>
                  <td><strong>{t.user}</strong></td>
                  <td>{t.item}</td>
                  <td><strong style={{ color: "var(--color-primary)" }}>₹{t.amount}</strong></td>
                  <td>{t.date}</td>
                  <td>
                    <span className={`admin-status ${t.status === "Completed" ? "admin-status-completed" : "admin-status-pending"}`}>
                      {t.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════
  // 10. NOTIFICATION MANAGEMENT
  // ══════════════════════════════════════════
  function renderNotifications() {
    return (
      <div className="admin-table-card">
        <div className="admin-table-header">
          <h3 className="admin-table-title">System Notifications</h3>
        </div>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Type</th>
                <th>Message</th>
                <th>Date & Time</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_NOTIFICATIONS.map((n) => (
                <tr key={n.id}>
                  <td>
                    <span className={`admin-notif-dot admin-notif-dot-${n.type}`} />
                    <span style={{ textTransform: "capitalize", fontWeight: 600 }}>{n.type}</span>
                  </td>
                  <td>{n.message}</td>
                  <td style={{ whiteSpace: "nowrap" }}>{n.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // ── Main render ──────────────────────────────────────────
  return (
    <AppLayout>
      <div className="admin-page">
        {/* Sidebar Tab Navigation */}
        <aside className="admin-sidebar">
          <h4 className="admin-sidebar-title">Admin Panel</h4>
          <nav className="admin-sidebar-nav">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                type="button"
                className={`admin-tab-btn ${activeTab === tab.key ? "active" : ""}`}
                onClick={() => { setActiveTab(tab.key); setSearchTerm(""); }}
              >
                <span className="admin-tab-icon">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <div className="admin-content">
          <div className="admin-content-header">
            <h1 className="admin-content-title">
              <span>{currentTab.icon}</span>
              {currentTab.label}
            </h1>
            <p className="admin-content-subtitle">
              {activeTab === "analytics" && "Overview of system performance and user engagement."}
              {activeTab === "users" && "Manage registered users, view profiles, and monitor activity."}
              {activeTab === "surveys" && "Review lifestyle survey data submitted by users."}
              {activeTab === "carbon" && "Monitor carbon emission data generated by users."}
              {activeTab === "goals" && "Track user sustainability goals and their progress."}
              {activeTab === "badges" && "Create and manage achievement badges."}
              {activeTab === "leaderboard" && "View and manage user rankings and scoring rules."}
              {activeTab === "marketplace" && "Manage eco marketplace products and listings."}
              {activeTab === "transactions" && "Track user purchases in the eco marketplace."}
              {activeTab === "notifications" && "Monitor system notifications and alerts."}
            </p>
          </div>
          {renderContent()}
        </div>
      </div>
    </AppLayout>
  );
}

export default AdminDashboard;
