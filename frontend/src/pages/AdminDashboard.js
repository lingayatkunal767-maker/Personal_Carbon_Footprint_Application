import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import AppLayout from "../components/AppLayout";
import "./AdminDashboard.css";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:8080";

// ── Tab configuration ──────────────────────────────────────
const TABS = [
  { key: "analytics",     icon: "📊", label: "Analytics" },
  { key: "users",         icon: "👥", label: "Users" },
  { key: "carbon",        icon: "🌍", label: "Carbon Data" },
  { key: "goals",         icon: "🎯", label: "Goals" },
  { key: "badges",        icon: "🏅", label: "Badges" },
  { key: "leaderboard",   icon: "🏆", label: "Leaderboard" },
  { key: "marketplace",   icon: "🛒", label: "Marketplace" },
  { key: "transactions",  icon: "💳", label: "Transactions" },
  { key: "notifications", icon: "🔔", label: "Notifications" },
  { key: "settings",      icon: "⚙", label: "Settings" },
];

// ── Mock Data / Fallbacks ─────────────────────────────────
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

// Simple placeholder for maintenance / settings related work
function renderSettings() {
  return (
    <div className="admin-table-card">
      <div className="admin-table-header">
        <h3 className="admin-table-title">Admin Settings & Maintenance</h3>
      </div>
      <div className="admin-empty">
        <span className="admin-empty-icon">🛠️</span>
        <p>Settings and maintenance tools are under development.</p>
        <p style={{ fontSize: 13 }}>
          Use this space to configure system behaviour, maintenance windows, and other admin-only options.
        </p>
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────
function AdminDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("analytics");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [userFilter, setUserFilter] = useState("all"); // all | active | blocked

  // Admin data that should use real backend where available
  const [adminLeaderboard, setAdminLeaderboard] = useState(MOCK_LEADERBOARD);
  const [adminBadges, setAdminBadges] = useState(MOCK_BADGES);
  const [adminCarbonLogs, setAdminCarbonLogs] = useState([]);
  const [adminGoals, setAdminGoals] = useState([]);

  // All users (for admin badge assignment, filtered by name/email instead of raw ID)
  const [allUsers, setAllUsers] = useState([]);

  // Badge templates (source of truth for edit / enable / disable)
  const [badgeTemplates, setBadgeTemplates] = useState([]);

  // Simple inline form for awarding a badge to a user by ID
  const [badgeForm, setBadgeForm] = useState({
    userId: "",
    badgeName: "",
    description: "",
  });
  const [badgeUserQuery, setBadgeUserQuery] = useState("");
  const [selectedBadgeUser, setSelectedBadgeUser] = useState(null);
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [badgeSelectedTemplateId, setBadgeSelectedTemplateId] = useState("");
  const [badgeEditId, setBadgeEditId] = useState(null);
  const [badgeEditDraft, setBadgeEditDraft] = useState({
    name: "",
    conditionText: "",
    icon: "",
    active: true,
  });
  const [newTemplate, setNewTemplate] = useState({
    name: "",
    description: "",
    conditionText: "",
    icon: "",
    active: true,
  });
  const [creatingTemplate, setCreatingTemplate] = useState(false);
  const [showCreateTemplateForm, setShowCreateTemplateForm] = useState(false);
  const [editingTemplateId, setEditingTemplateId] = useState(null);
  const [showAwardForm, setShowAwardForm] = useState(false);
  const [badgeSavingId, setBadgeSavingId] = useState(null);
  const [badgeSubmitting, setBadgeSubmitting] = useState(false);
  const [badgeMessage, setBadgeMessage] = useState("");
  const [badgeFilter, setBadgeFilter] = useState("all"); // all | active | disabled

  const handleCreateTemplate = async (e) => {
    e.preventDefault();
    setBadgeMessage("");

    if (!newTemplate.name) {
      setBadgeMessage("Template name is required.");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      setCreatingTemplate(true);
      const headers = { Authorization: `Bearer ${token}` };
      const payload = {
        name: newTemplate.name,
        description: newTemplate.description,
        conditionText: newTemplate.conditionText,
        icon: newTemplate.icon,
        active: newTemplate.active,
      };

      if (editingTemplateId) {
        // Update existing template
        const res = await axios.put(
          `${API_BASE}/api/badge-templates/${editingTemplateId}`,
          payload,
          { headers }
        );
        const updated = res.data;
        setBadgeTemplates((prev) =>
          Array.isArray(prev)
            ? prev.map((b) => (b.id === updated.id ? updated : b))
            : prev
        );
        setBadgeMessage("Badge template updated successfully.");
      } else {
        // Create new template
        const res = await axios.post(
          `${API_BASE}/api/badge-templates`,
          payload,
          { headers }
        );
        const created = res.data;
        setBadgeTemplates((prev) =>
          Array.isArray(prev) ? [...prev, created] : [created]
        );
        setBadgeMessage("New badge template created successfully.");
      }

      setNewTemplate({
        name: "",
        description: "",
        conditionText: "",
        icon: "",
        active: true,
      });
      setEditingTemplateId(null);
      setShowCreateTemplateForm(false);
    } catch (err) {
      setBadgeMessage(
        "Failed to create badge template. Please check the values and try again."
      );
    } finally {
      setCreatingTemplate(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { navigate("/login"); return; }

    const headers = { Authorization: `Bearer ${token}` };

    axios
      .get(`${API_BASE}/api/auth/me`, { headers })
      .then((res) => {
        setUser(res.data);

        // Fetch data needed for admin views in parallel
        Promise.allSettled([
          // Leaderboard for admin view
          axios.get(`${API_BASE}/api/leaderboard`, { headers }),
          // Badges earned by current admin (used to hydrate badge grid)
          axios.get(`${API_BASE}/api/badges`, { headers }),
          // Carbon logs for current admin
          axios.get(`${API_BASE}/api/carbon/logs`, { headers }),
          // Goals for all non-admin users (admin dashboard)
          axios.get(`${API_BASE}/api/goals/admin`, { headers }),
          // All users – used to search & select a user instead of manual ID
          axios.get(`${API_BASE}/api/users`, { headers }),
          // Badge templates – used for editing / enabling / disabling badges
          axios.get(`${API_BASE}/api/badge-templates`, { headers }),
        ]).then((results) => {
          const [
            lbResult,
            badgeResult,
            carbonResult,
            goalsResult,
            usersResult,
            templatesResult,
          ] = results;

          if (lbResult.status === "fulfilled") {
            const lbRes = lbResult.value;
            const data = Array.isArray(lbRes.data) ? lbRes.data : [];
            if (data.length > 0) {
              const mapped = data
                .map((e, index) => ({
                  rank: index + 1,
                  user:
                    e.userName ||
                    e.username ||
                    e.user?.name ||
                    e.user?.username ||
                    `User ${index + 1}`,
                  emissionReduction: e.emissionReduction ?? 0,
                  goalsCompleted: e.goalsCompleted ?? 0,
                  badgesEarned: e.badgesEarned ?? 0,
                  score: Number(e.score) || 0,
                }))
                .sort((a, b) => b.score - a.score);
              mapped.forEach((entry, idx) => {
                entry.rank = idx + 1;
              });
              setAdminLeaderboard(mapped);
            }
          }

          if (badgeResult.status === "fulfilled") {
            const bRes = badgeResult.value;
            const earned = Array.isArray(bRes.data) ? bRes.data : [];
            if (earned.length > 0) {
              const mapped = earned.map((b, index) => ({
                id: b.id || index + 1,
                name: b.badgeName || b.name || `Badge ${index + 1}`,
                icon: "🏅",
                condition: b.description || "Assigned badge",
                active: true,
                usersEarned: 1,
              }));
              setAdminBadges(mapped);
            }
          }

          if (carbonResult.status === "fulfilled") {
            const cRes = carbonResult.value;
            const list = Array.isArray(cRes.data) ? cRes.data : [];
            setAdminCarbonLogs(list);
          }

          if (goalsResult.status === "fulfilled") {
            const gRes = goalsResult.value;
            const list = Array.isArray(gRes.data) ? gRes.data : [];
            setAdminGoals(list);
          }

          if (usersResult.status === "fulfilled") {
            const uRes = usersResult.value;
            const list = Array.isArray(uRes.data) ? uRes.data : [];
            setAllUsers(list);
          }

          if (templatesResult.status === "fulfilled") {
            const tRes = templatesResult.value;
            const list = Array.isArray(tRes.data) ? tRes.data : [];
            setBadgeTemplates(list);
          }
        }).finally(() => {
          setLoading(false);
        });
      })
      .catch(() => {
        localStorage.removeItem("token");
        navigate("/login");
      });
  }, [navigate]);

  // Sync active tab with URL query (?tab=...)
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
      case "settings":
        return renderSettings();
      default:
        return null;
    }
  };

  // ══════════════════════════════════════════
  // 1. SYSTEM ANALYTICS
  // ══════════════════════════════════════════
  function renderAnalytics() {
    const totalUsers = Array.isArray(allUsers) && allUsers.length
      ? allUsers.filter((u) => (u.role || "").toString().toLowerCase() !== "admin").length
      : MOCK_USERS.length;

    const carbonSource = Array.isArray(adminCarbonLogs) && adminCarbonLogs.length
      ? adminCarbonLogs.filter((l) => {
          const role = (l.user?.role || "").toString().toLowerCase();
          return !role.includes("admin");
        })
      : MOCK_CARBON_LOGS;

    const avgEmissions = carbonSource.length
      ? (
          carbonSource.reduce((s, l) => s + Number(l.totalEmission || 0), 0) /
          carbonSource.length
        ).toFixed(1)
      : "0.0";
    const topBadgeSource = adminBadges.length > 0 ? adminBadges : MOCK_BADGES;
    const topBadge = topBadgeSource.reduce((a, b) =>
      (a.usersEarned ?? 0) >= (b.usersEarned ?? 0) ? a : b
    );
    const totalTransactions = MOCK_TRANSACTIONS.reduce((s, t) => s + t.amount, 0);

    const goalsSource = Array.isArray(adminGoals) ? adminGoals : [];
    const goalsCompleted = goalsSource.filter(
      (g) => g.status === "COMPLETED" || g.status === "Completed"
    ).length;

    const emissionByUser = {};
    carbonSource.forEach((l) => {
      const key = l.userName || l.user?.name || l.user || "You";
      const val = Number(l.totalEmission || 0);
      emissionByUser[key] = (emissionByUser[key] || 0) + val;
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
              {(adminLeaderboard.length ? adminLeaderboard : MOCK_LEADERBOARD).map((entry) => (
                <div className="admin-bar-wrap" key={entry.user}>
                  <span className="admin-bar-value">{entry.score}</span>
                  <div
                    className="admin-bar"
                    style={{
                      height: `${(entry.score / Math.max(...(adminLeaderboard.length ? adminLeaderboard : MOCK_LEADERBOARD).map((e) => e.score), 1)) * 100}%`,
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
    // Prefer real backend data; fall back to mock only if empty
    const sourceUsers =
      Array.isArray(allUsers) && allUsers.length > 0 ? allUsers : MOCK_USERS;

    const normalized = sourceUsers
      // hide admin accounts from this table
      .filter((u) => {
        const role = (u.role || u.userRole || "").toString().toLowerCase();
        return role !== "admin";
      })
      .map((u) => {
        const isActive =
          typeof u.active === "boolean"
            ? u.active
            : (u.status || "Active") === "Active";
        return {
          raw: u,
          id: u.id,
          name: (u.name || u.username || u.email || "").toString(),
          email: (u.email || "").toString(),
          role: (u.role || u.userRole || "User").toString(),
          status: isActive ? "Active" : "Blocked",
          active: isActive,
          createdAt: (
            u.createdAt ||
            u.createdDate ||
            u.createdOn ||
            ""
          ).toString(),
        };
      });

    const filtered = normalized
      // apply status filter
      .filter((u) => {
        if (userFilter === "active") return u.active;
        if (userFilter === "blocked") return !u.active;
        return true;
      })
      // apply text search
      .filter((u) => {
        const q = searchTerm.toLowerCase();
        return (
          u.name.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          String(u.id).includes(q)
        );
      });
    return (
      <div className="admin-table-card">
        <div className="admin-table-header">
          <h3 className="admin-table-title">All Users ({filtered.length})</h3>
          <div
            style={{
              display: "flex",
              gap: 16,
              alignItems: "center",
              justifyContent: "flex-end",
              width: "100%",
              flexWrap: "nowrap",
              overflow: "hidden",
            }}
          >
            <div style={{ display: "flex", gap: 12, fontSize: 13, whiteSpace: "nowrap" }}>
              <button
                type="button"
                onClick={() => setUserFilter("all")}
                style={{
                  border: "none",
                  background: "transparent",
                  padding: 0,
                  margin: 0,
                  cursor: "pointer",
                  fontSize: 13,
                  color:
                    userFilter === "all"
                      ? "var(--color-text)"
                      : "var(--color-text-muted)",
                  fontWeight: userFilter === "all" ? 600 : 400,
                }}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setUserFilter("active")}
                style={{
                  border: "none",
                  background: "transparent",
                  padding: 0,
                  margin: 0,
                  cursor: "pointer",
                  fontSize: 13,
                  color:
                    userFilter === "active"
                      ? "var(--color-text)"
                      : "var(--color-text-muted)",
                  fontWeight: userFilter === "active" ? 600 : 400,
                }}
              >
                Active
              </button>
              <button
                type="button"
                onClick={() => setUserFilter("blocked")}
                style={{
                  border: "none",
                  background: "transparent",
                  padding: 0,
                  margin: 0,
                  cursor: "pointer",
                  fontSize: 13,
                  color:
                    userFilter === "blocked"
                      ? "var(--color-text)"
                      : "var(--color-text-muted)",
                  fontWeight: userFilter === "blocked" ? 600 : 400,
                }}
              >
                Blocked
              </button>
            </div>
            <div className="admin-search-wrap" style={{ minWidth: 0 }}>
              <span className="admin-search-icon">🔍</span>
              <input
                type="text"
                className="admin-search-input"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ maxWidth: 200 }}
              />
            </div>
          </div>
        </div>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Status</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u.id}>
                  <td>{u.id}</td>
                  <td>
                    <strong>{u.name}</strong>
                  </td>
                  <td>{u.email}</td>
                  <td>
                    <span
                      className={`admin-status ${
                        u.active
                          ? "admin-status-active"
                          : "admin-status-inactive"
                      }`}
                    >
                      {u.status}
                    </span>
                  </td>
                  <td>{u.createdAt}</td>
                  <td>
                    <div className="admin-actions-row">
                      <button
                        className="admin-action-btn"
                        type="button"
                        title={u.active ? "Block user" : "Unblock user"}
                        onClick={async () => {
                          const token = localStorage.getItem("token");
                          if (!token) {
                            navigate("/login");
                            return;
                          }
                          const headers = {
                            Authorization: `Bearer ${token}`,
                          };
                          const path = u.active ? "block" : "unblock";
                          try {
                            const res = await axios.put(
                              `${API_BASE}/api/users/${u.id}/${path}`,
                              {},
                              { headers }
                            );
                            const updated = res.data;
                            setAllUsers((prev) =>
                              Array.isArray(prev)
                                ? prev.map((userItem) =>
                                    userItem.id === updated.id
                                      ? updated
                                      : userItem
                                  )
                                : prev
                            );
                          } catch (err) {
                            // ignore for now, could add toast
                          }
                        }}
                      >
                        {u.active ? "Block" : "Unblock"}
                      </button>
                      <button
                        className="admin-action-btn admin-action-btn-danger"
                        type="button"
                        title="Delete user"
                        onClick={async () => {
                          const confirmDelete = window.confirm(
                            `Delete user ${u.name || u.email}? This cannot be undone.`
                          );
                          if (!confirmDelete) return;
                          const token = localStorage.getItem("token");
                          if (!token) {
                            navigate("/login");
                            return;
                          }
                          const headers = {
                            Authorization: `Bearer ${token}`,
                          };
                          try {
                            await axios.delete(
                              `${API_BASE}/api/users/${u.id}`,
                              { headers }
                            );
                            setAllUsers((prev) =>
                              Array.isArray(prev)
                                ? prev.filter((userItem) => userItem.id !== u.id)
                                : prev
                            );
                          } catch (err) {
                            // ignore for now, could add toast
                          }
                        }}
                      >
                        Delete
                      </button>
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
  // 3. CARBON DATA MONITORING
  // ══════════════════════════════════════════
  function renderCarbon() {
    const source = Array.isArray(adminCarbonLogs)
      ? adminCarbonLogs
      : [];

    const rows = source.map((l, idx) => ({
      id: l.id || idx,
      user:
        l.userName ||
        l.user?.name ||
        l.user ||
        "You",
      date: l.date,
      transport: l.transportEmission ?? l.transport ?? 0,
      food: l.foodEmission ?? l.food ?? 0,
      energy: l.energyEmission ?? l.energy ?? 0,
      total: l.totalEmission ?? 0,
    }));

    return (
      <div className="admin-table-card">
        <div className="admin-table-header">
          <h3 className="admin-table-title">Carbon Emission Logs</h3>
        </div>
        {rows.length === 0 ? (
          <div className="admin-empty">
            <span className="admin-empty-icon">📭</span>
            <p>No carbon logs have been recorded yet.</p>
          </div>
        ) : (
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
                {rows.map((l) => (
                  <tr key={l.id}>
                    <td><strong>{l.user}</strong></td>
                    <td>{l.date}</td>
                    <td>{l.transport} kg</td>
                    <td>{l.food} kg</td>
                    <td>{l.energy} kg</td>
                    <td>
                      <strong style={{ color: "var(--color-primary)" }}>
                        {Number(l.total).toFixed(2)} kg CO₂e
                      </strong>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  }

  // ══════════════════════════════════════════
  // 4. GOAL MONITORING
  // ══════════════════════════════════════════
  function renderGoals() {
    const rows = (Array.isArray(adminGoals) ? adminGoals : []).map((g, idx) => ({
      id: g.id || idx,
      user: g.userName || g.user?.name || "You",
      title: g.title || g.name || "",
      target: g.targetValue ?? g.target ?? 0,
      current: g.currentValue ?? g.current ?? 0,
      status: g.status || "ACTIVE",
    }));

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
              {rows.map((g) => {
                const target = Number(g.target) || 0;
                const current = Number(g.current) || 0;
                const isCompleted =
                  g.status === "COMPLETED" || g.status === "Completed";
                const progressPct = isCompleted
                  ? 100
                  : target > 0
                  ? Math.max(
                      0,
                      Math.min(
                        100,
                        Math.round((1 - (current - target) / target) * 100)
                      )
                    )
                  : 0;
                return (
                  <tr key={g.id}>
                    <td>
                      <strong>{g.user}</strong>
                    </td>
                    <td>{g.title}</td>
                    <td>{target}</td>
                    <td>{current}</td>
                    <td>
                      <div
                        style={{
                          width: 80,
                          height: 8,
                          background: "var(--color-border)",
                          borderRadius: 999,
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            width: `${progressPct}%`,
                            height: "100%",
                            background: isCompleted
                              ? "var(--color-accent-green)"
                              : "linear-gradient(90deg, var(--color-primary), var(--color-accent-green))",
                            borderRadius: 999,
                            transition: "width 0.3s",
                          }}
                        />
                      </div>
                    </td>
                    <td>
                      <span
                        className={`admin-status ${
                          isCompleted
                            ? "admin-status-completed"
                            : "admin-status-pending"
                        }`}
                      >
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
  // 5. BADGE MANAGEMENT
  // ══════════════════════════════════════════
  function renderBadges() {

    const resolveBadgeIcon = (tpl) => {
      const code = tpl.code || "";
      switch (code) {
        case "FIRST_LOG": return "🌱";
        case "WEEK_WARRIOR": return "📅";
        case "LOW_EMITTER": return "🍃";
        case "ECO_STREAK": return "🔥";
        case "SURVEY_MASTER": return "📋";
        case "CARBON_CUTTER": return "✂️";
        case "GREEN_CHAMPION": return "🏆";
        case "TREE_PLANTER": return "🌳";
        case "SOLAR_HERO": return "☀️";
        case "TEAM_PLAYER": return "🤝";
        case "GOAL_SETTER": return "🎯";
        case "GOAL_ACHIEVER": return "✅";
        case "ECO_STARTER": return "🌱";
        case "GREEN_ACHIEVER": return "🏆";
        case "CARBON_SAVER": return "✂️";
        case "NIGHT_LOGGER": return "🌙";
        case "PUBLIC_TRANSPORT_PRO": return "🚆";
        case "PLANT_BASED_HERO": return "🥦";
        case "ENERGY_SAVER": return "💡";
        case "WEEKLY_CHECKIN": return "📆";
        case "CONSISTENCY_KING": return "👑";
        case "COMMUNITY_LEADER": return "🤝";
        default:
          if (tpl.icon && tpl.icon !== "??") return tpl.icon;
          return "🏅";
      }
    };

    const normalizedUsers = allUsers
      // do not show admins in award-badge user list
      .filter((u) => {
        const role = (u.role || u.userRole || "").toString().toLowerCase();
        return role !== "admin";
      })
      .map((u) => ({
        id: u.id,
        name: u.name || u.email || `User #${u.id}`,
        email: u.email || "",
        role: u.role || "",
      }));

    const baseBadges =
      badgeTemplates.length > 0 ? badgeTemplates : adminBadges;

    const totalBadges = baseBadges.length;
    const activeBadges = baseBadges.filter((b) => b.active ?? true).length;
    const disabledBadges = totalBadges - activeBadges;

    const displayBadges = baseBadges.filter((b) => {
      const isActive = b.active ?? true;
      if (badgeFilter === "active") return isActive;
      if (badgeFilter === "disabled") return !isActive;
      return true; // all
    });

    const matchingUsers = badgeUserQuery
      ? normalizedUsers.filter((u) => {
          const q = badgeUserQuery.toLowerCase();
          return (
            (u.name && u.name.toLowerCase().includes(q)) ||
            (u.email && u.email.toLowerCase().includes(q)) ||
            String(u.id).includes(q)
          );
        })
      : normalizedUsers.slice(0, 5);

    const handleSelectUser = (user) => {
      setSelectedBadgeUser(user);
      setBadgeMessage("");
    };

    const handleAddSelectedUser = () => {
      if (!selectedBadgeUser) {
        return;
      }
      setSelectedUserIds((prev) =>
        prev.includes(selectedBadgeUser.id)
          ? prev
          : [...prev, selectedBadgeUser.id]
      );
      setBadgeMessage("");
    };

    const handleRemoveSelectedUser = (id) => {
      setSelectedUserIds((prev) => prev.filter((uId) => uId !== id));
    };

    const startEditTemplate = (tpl) => {
      setBadgeEditId(tpl.id);
      setBadgeEditDraft({
        name: tpl.name || "",
        conditionText: tpl.conditionText || tpl.description || "",
        icon: tpl.icon || "",
        active: tpl.active ?? true,
      });
      setBadgeMessage("");
    };

    const cancelEditTemplate = () => {
      setBadgeEditId(null);
    };

    const saveTemplate = async (tpl) => {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }
      try {
        setBadgeSavingId(tpl.id);
        const headers = { Authorization: `Bearer ${token}` };
        const payload = {
          ...tpl,
          name: badgeEditDraft.name || tpl.name,
          conditionText: badgeEditDraft.conditionText || tpl.conditionText,
          icon: badgeEditDraft.icon || tpl.icon,
          active:
            typeof badgeEditDraft.active === "boolean"
              ? badgeEditDraft.active
              : tpl.active,
        };
        const res = await axios.put(
          `${API_BASE}/api/badge-templates/${tpl.id}`,
          payload,
          { headers }
        );
        const updated = res.data;
        setBadgeTemplates((prev) =>
          Array.isArray(prev)
            ? prev.map((b) => (b.id === updated.id ? updated : b))
            : prev
        );
        setBadgeMessage("Badge template updated successfully.");
        setBadgeEditId(null);
      } catch (err) {
        setBadgeMessage(
          "Failed to update badge template. Please try again."
        );
      } finally {
        setBadgeSavingId(null);
      }
    };

    const toggleTemplateActive = async (tpl) => {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }
      try {
        setBadgeSavingId(tpl.id);
        const headers = { Authorization: `Bearer ${token}` };
        const payload = {
          ...tpl,
          active: !tpl.active,
        };
        const res = await axios.put(
          `${API_BASE}/api/badge-templates/${tpl.id}`,
          payload,
          { headers }
        );
        const updated = res.data;
        setBadgeTemplates((prev) =>
          Array.isArray(prev)
            ? prev.map((b) => (b.id === updated.id ? updated : b))
            : prev
        );
        setBadgeMessage(
          updated.active
            ? "Badge has been enabled."
            : "Badge has been disabled."
        );
      } catch (err) {
        setBadgeMessage(
          "Failed to change badge status. Please try again."
        );
      } finally {
        setBadgeSavingId(null);
      }
    };

    const handleAwardBadge = async (e) => {
      e.preventDefault();
      setBadgeMessage("");

      const targetIds = selectedUserIds;

      if (!targetIds.length || !badgeSelectedTemplateId) {
        setBadgeMessage("Please add at least one user and select a badge.");
        return;
      }

      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      try {
        setBadgeSubmitting(true);
        const headers = { Authorization: `Bearer ${token}` };
        for (const id of targetIds) {
          await axios.post(
            `${API_BASE}/api/badges/award/${id}`,
            {
              badgeName: badgeForm.badgeName,
              description: badgeForm.description || undefined,
            },
            { headers }
          );
        }
        setBadgeMessage(
          `Badge awarded to ${targetIds.length} user${targetIds.length > 1 ? "s" : ""}.`
        );
        // Optionally refetch admin badges so the new one appears
        const bRes = await axios.get(`${API_BASE}/api/badges`, { headers });
        const earned = Array.isArray(bRes.data) ? bRes.data : [];
        if (earned.length > 0) {
          const mapped = earned.map((b, index) => ({
            id: b.id || index + 1,
            name: b.badgeName || b.name || `Badge ${index + 1}`,
            icon: "🏅",
            condition: b.description || "Assigned badge",
            active: true,
            usersEarned: 1,
          }));
          setAdminBadges(mapped);
        }
        setBadgeForm({
          userId: "",
          badgeName: "",
          description: "",
        });
        setSelectedBadgeUser(null);
        setSelectedUserIds([]);
        setBadgeSelectedTemplateId("");
      } catch (err) {
        if (err.response && (err.response.status === 400 || err.response.status === 409)) {
          const msg = String(err.response.data || "").toLowerCase();
          if (msg.includes("already") || msg.includes("duplicate")) {
            setBadgeMessage("This badge has already been awarded to one or more selected users.");
          } else {
            setBadgeMessage(err.response.data || "Failed to award badge. Please verify the details and try again.");
          }
        } else {
          setBadgeMessage(
            "Failed to award badge. Please verify the details and try again."
          );
        }
      } finally {
        setBadgeSubmitting(false);
      }
    };

    return (
      <>
        {showCreateTemplateForm && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.45)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1100,
              padding: 16,
            }}
          >
            <div
              style={{
                width: "100%",
                maxWidth: 420,
                background: "var(--color-surface)",
                borderRadius: 18,
                boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
                padding: 24,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <h3 className="admin-table-title" style={{ margin: 0 }}>
                  {editingTemplateId ? "Edit Badge" : "Create Badge"}
                </h3>
                <button
                  type="button"
                  className="admin-action-btn admin-action-btn-danger"
                  onClick={() => setShowCreateTemplateForm(false)}
                >
                  ✕
                </button>
              </div>
              <form
                onSubmit={handleCreateTemplate}
                style={{ display: "flex", flexDirection: "column", gap: 10 }}
              >
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text-muted)" }}>
                  Name
                </label>
                <input
                  type="text"
                  className="admin-search-input"
                  placeholder="e.g. Eco Starter"
                  value={newTemplate.name}
                  onChange={(e) =>
                    setNewTemplate({ ...newTemplate, name: e.target.value })
                  }
                  style={{ marginTop: 4 }}
                />
              </div>

              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text-muted)" }}>
                  Short Description
                </label>
                <textarea
                  className="admin-textarea"
                  placeholder="User-facing description"
                  value={newTemplate.description}
                  onChange={(e) =>
                    setNewTemplate({
                      ...newTemplate,
                      description: e.target.value,
                    })
                  }
                  style={{ marginTop: 4 }}
                />
              </div>

              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text-muted)" }}>
                  Condition
                </label>
                <textarea
                  className="admin-textarea"
                  placeholder="How to earn this badge"
                  value={newTemplate.conditionText}
                  onChange={(e) =>
                    setNewTemplate({
                      ...newTemplate,
                      conditionText: e.target.value,
                    })
                  }
                  style={{ marginTop: 4 }}
                />
              </div>

              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text-muted)" }}>
                  Icon (Emoji)
                </label>
                <input
                  type="text"
                  className="admin-search-input"
                  placeholder="e.g. 🌱"
                  value={newTemplate.icon}
                  onChange={(e) =>
                    setNewTemplate({ ...newTemplate, icon: e.target.value })
                  }
                  style={{ marginTop: 4 }}
                />
              </div>

              <div style={{ marginTop: 6, display: "flex", alignItems: "center" }}>
                <label
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    fontSize: 13,
                    color: "var(--color-text-muted)",
                    cursor: "pointer",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={newTemplate.active}
                    onChange={(e) =>
                      setNewTemplate({
                        ...newTemplate,
                        active: e.target.checked,
                      })
                    }
                    style={{ margin: 0 }}
                  />
                  <span>Active</span>
                </label>
              </div>

              <button
                type="submit"
                className="admin-action-btn admin-action-btn-primary"
                disabled={creatingTemplate}
                style={{ marginTop: 6, alignSelf: "stretch" }}
              >
                {creatingTemplate
                  ? editingTemplateId
                    ? "Saving..."
                    : "Creating..."
                  : editingTemplateId
                  ? "Save Changes"
                  : "Create Badge"}
              </button>
              {badgeMessage && (
                <p
                  style={{
                    marginTop: 8,
                    fontSize: 12,
                    color: badgeMessage.toLowerCase().includes("success")
                      ? "var(--color-accent-green)"
                      : "var(--color-accent-red)",
                  }}
                >
                  {badgeMessage}
                </p>
              )}
            </form>
          </div>
        </div>
        )}

        <div className="admin-table-card" style={{ padding: 20, marginBottom: 20 }}>
          <div className="admin-actions-row" style={{ justifyContent: "space-between", alignItems: "center", gap: 12 }}>
            <div>
              <h3 className="admin-table-title">
                Badge Templates {totalBadges > 0 && `(${totalBadges})`}
              </h3>
              <p style={{ margin: 0, fontSize: 12, color: "var(--color-text-muted)" }}>
                Manage the catalog of badges that users can earn.
              </p>
            </div>
            <div className="admin-actions-row" style={{ gap: 12, alignItems: "center" }}>
              <div style={{ display: "flex", gap: 12, fontSize: 13 }}>
                <button
                  type="button"
                  onClick={() => setBadgeFilter("all")}
                  style={{
                    border: "none",
                    background: "transparent",
                    padding: 0,
                    margin: 0,
                    cursor: "pointer",
                    fontSize: 13,
                    color:
                      badgeFilter === "all"
                        ? "var(--color-text)"
                        : "var(--color-text-muted)",
                    fontWeight: badgeFilter === "all" ? 600 : 400,
                  }}
                >
                  All badges
                </button>
                <button
                  type="button"
                  onClick={() => setBadgeFilter("active")}
                  style={{
                    border: "none",
                    background: "transparent",
                    padding: 0,
                    margin: 0,
                    cursor: "pointer",
                    fontSize: 13,
                    color:
                      badgeFilter === "active"
                        ? "var(--color-text)"
                        : "var(--color-text-muted)",
                    fontWeight: badgeFilter === "active" ? 600 : 400,
                  }}
                >
                  Active
                </button>
                <button
                  type="button"
                  onClick={() => setBadgeFilter("disabled")}
                  style={{
                    border: "none",
                    background: "transparent",
                    padding: 0,
                    margin: 0,
                    cursor: "pointer",
                    fontSize: 13,
                    color:
                      badgeFilter === "disabled"
                        ? "var(--color-text)"
                        : "var(--color-text-muted)",
                    fontWeight: badgeFilter === "disabled" ? 600 : 400,
                  }}
                >
                  Disabled
                </button>
              </div>
              <button
              type="button"
              className="admin-action-btn admin-action-btn-primary"
              onClick={() => {
                setEditingTemplateId(null);
                setNewTemplate({
                  name: "",
                  description: "",
                  conditionText: "",
                  icon: "",
                  active: true,
                });
                setShowCreateTemplateForm((open) => !open);
              }}
            >
              {showCreateTemplateForm ? "Close" : "+ Create Badge"}
            </button>
            </div>
          </div>
        </div>


        <div className="admin-table-card" style={{ padding: 20, marginBottom: 20 }}>
          <div className="admin-actions-row" style={{ justifyContent: "space-between", alignItems: "center", gap: 12 }}>
            <div>
              <h3 className="admin-table-title">Award Badge</h3>
              <p style={{ margin: 0, fontSize: 12, color: "var(--color-text-muted)" }}>
                Choose a user and a badge, then award it with a single click.
              </p>
            </div>
            <button
              type="button"
              className="admin-action-btn admin-action-btn-primary"
              onClick={() => setShowAwardForm((v) => !v)}
            >
              {showAwardForm ? "Close" : "Open Form"}
            </button>
          </div>
        </div>

        {showAwardForm && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.45)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1100,
              padding: 16,
            }}
          >
            <div
              style={{
                width: "100%",
                maxWidth: 420,
                background: "var(--color-surface)",
                borderRadius: 18,
                boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
                padding: 24,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <h3 className="admin-table-title" style={{ margin: 0 }}>
                  Award Badge
                </h3>
                <button
                  type="button"
                  className="admin-action-btn admin-action-btn-danger"
                  onClick={() => setShowAwardForm(false)}
                >
                  ✕
                </button>
              </div>

              <form
                onSubmit={handleAwardBadge}
                style={{ display: "flex", flexDirection: "column", gap: 12 }}
              >
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text-muted)" }}>
                    User
                  </label>
                  <select
                    className="admin-search-input"
                    style={{ marginTop: 4 }}
                    value={selectedBadgeUser ? selectedBadgeUser.id : ""}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (!value) {
                        setSelectedBadgeUser(null);
                        setBadgeForm({ ...badgeForm, userId: "" });
                        return;
                      }
                      const found = normalizedUsers.find(
                        (u) => String(u.id) === String(value)
                      );
                      if (found) {
                        handleSelectUser(found);
                      }
                    }}
                  >
                    <option value="">Select user</option>
                    {normalizedUsers.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.email || "no email"}) · ID {u.id}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="button"
                  className="admin-action-btn admin-action-btn-primary"
                  onClick={handleAddSelectedUser}
                  style={{ marginTop: 8 }}
                >
                  Add User
                </button>

                <div
                  style={{
                    marginTop: 8,
                    border: "1px solid var(--color-border)",
                    borderRadius: 10,
                    padding: 8,
                    minHeight: 36,
                    maxHeight: 120,
                    overflowY: "auto",
                    background: "var(--color-surface)",
                  }}
                >
                  {selectedUserIds.length === 0 ? (
                    <span style={{ fontSize: 12, color: "var(--color-text-muted)" }}>
                      No users added yet. Use the select above and click <strong>Add User</strong>.
                    </span>
                  ) : (
                    selectedUserIds.map((id) => {
                      const u = normalizedUsers.find((user) => user.id === id);
                      if (!u) return null;
                      return (
                        <span
                          key={id}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            padding: "4px 10px",
                            borderRadius: 999,
                            background: "var(--color-primary-soft)",
                            color: "var(--color-text)",
                            fontSize: 12,
                            margin: "2px 4px",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {u.name}{" "}
                          <span
                            onClick={() => handleRemoveSelectedUser(id)}
                            style={{
                              marginLeft: 6,
                              cursor: "pointer",
                              fontWeight: 700,
                            }}
                          >
                            ×
                          </span>
                        </span>
                      );
                    })
                  )}
                </div>

                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text-muted)" }}>
                    Badge
                  </label>
                  {badgeTemplates.length > 0 && (
                    <select
                      className="admin-search-input"
                      style={{ marginTop: 4 }}
                      value={badgeSelectedTemplateId}
                      onChange={(e) => {
                        const value = e.target.value;
                        setBadgeSelectedTemplateId(value);
                        const tpl = badgeTemplates.find(
                          (t) => String(t.id) === String(value)
                        );
                        if (tpl) {
                          setBadgeForm((prev) => ({
                            ...prev,
                            badgeName: tpl.name || prev.badgeName,
                            description:
                              tpl.description ||
                              tpl.conditionText ||
                              prev.description,
                          }));
                        }
                      }}
                    >
                      <option value="">Select badge template</option>
                      {badgeTemplates.map((tpl) => (
                        <option key={tpl.id} value={tpl.id}>
                          {tpl.name}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                <button
                  type="submit"
                  className="admin-action-btn admin-action-btn-primary"
                  disabled={badgeSubmitting}
                  style={{ marginTop: 8, alignSelf: "stretch" }}
                >
                  {badgeSubmitting ? "Awarding..." : "Award Badge"}
                </button>
                {badgeMessage && (
                  <p
                    style={{
                      marginTop: 4,
                      fontSize: 12,
                      color: badgeMessage.toLowerCase().includes("awarded")
                        ? "var(--color-accent-green)"
                        : "var(--color-accent-red)",
                    }}
                  >
                    {badgeMessage}
                  </p>
                )}
              </form>
            </div>
          </div>
        )}
        <div className="admin-badge-grid">
          {displayBadges.map((b) => {
            const isTemplate = typeof b.conditionText !== "undefined";
            const name = b.name;
            const condition = isTemplate
              ? b.conditionText || b.description || "No condition specified"
              : b.condition;
            const active = b.active ?? true;
            const icon = resolveBadgeIcon(b);
            const isEditing = badgeEditId === b.id && isTemplate;
            return (
              <div className="admin-badge-card" key={b.id}>
                <span className="admin-badge-card-status">
                  <span
                    className={`admin-status ${
                      active ? "admin-status-active" : "admin-status-inactive"
                    }`}
                  >
                    {active ? "Active" : "Disabled"}
                  </span>
                </span>
                <span className="admin-badge-card-icon">{icon}</span>
                {isEditing ? (
                  <div style={{ width: "100%", marginTop: 6 }}>
                    <input
                      type="text"
                      className="admin-search-input"
                      style={{ marginBottom: 6 }}
                      placeholder="Badge name"
                      value={badgeEditDraft.name}
                      onChange={(e) =>
                        setBadgeEditDraft({
                          ...badgeEditDraft,
                          name: e.target.value,
                        })
                      }
                    />
                    <input
                      type="text"
                      className="admin-search-input"
                      style={{ marginBottom: 6 }}
                      placeholder="Condition / description"
                      value={badgeEditDraft.conditionText}
                      onChange={(e) =>
                        setBadgeEditDraft({
                          ...badgeEditDraft,
                          conditionText: e.target.value,
                        })
                      }
                    />
                    <input
                      type="text"
                      className="admin-search-input"
                      style={{ marginBottom: 6 }}
                      placeholder="Icon (emoji)"
                      value={badgeEditDraft.icon}
                      onChange={(e) =>
                        setBadgeEditDraft({
                          ...badgeEditDraft,
                          icon: e.target.value,
                        })
                      }
                    />
                    <label
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        fontSize: 12,
                        color: "var(--color-text-muted)",
                        marginBottom: 8,
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={badgeEditDraft.active}
                        onChange={(e) =>
                          setBadgeEditDraft({
                            ...badgeEditDraft,
                            active: e.target.checked,
                          })
                        }
                      />
                      Active
                    </label>
                    <div className="admin-actions-row">
                      <button
                        type="button"
                        className="admin-action-btn admin-action-btn-primary"
                        onClick={() => saveTemplate(b)}
                        disabled={badgeSavingId === b.id}
                      >
                        {badgeSavingId === b.id ? "Saving..." : "Save"}
                      </button>
                      <button
                        type="button"
                        className="admin-action-btn admin-action-btn-danger"
                        onClick={cancelEditTemplate}
                        disabled={badgeSavingId === b.id}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="admin-badge-card-name">{name}</div>
                    <div className="admin-badge-card-condition">{condition}</div>
                    <div className="admin-actions-row">
                      <button
                        type="button"
                        className="admin-action-btn"
                        disabled={!isTemplate}
                        onClick={() => {
                          if (!isTemplate) return;
                          setEditingTemplateId(b.id);
                          setNewTemplate({
                            name: b.name || "",
                            description: b.description || b.conditionText || "",
                            conditionText: b.conditionText || b.description || "",
                            // Use resolved emoji icon so DB "??" is not shown
                            icon: resolveBadgeIcon(b),
                            active: b.active ?? true,
                          });
                          setShowCreateTemplateForm(true);
                        }}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="admin-action-btn admin-action-btn-danger"
                        disabled={!isTemplate || badgeSavingId === b.id}
                        onClick={() =>
                          isTemplate ? toggleTemplateActive(b) : null
                        }
                      >
                        {active ? "Disable" : "Enable"}
                      </button>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </>
    );
  }

  // ══════════════════════════════════════════
  // 6. LEADERBOARD MANAGEMENT
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
                {adminLeaderboard.map((entry) => (
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
  // 7. ECO MARKETPLACE MANAGEMENT
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
  // 8. TRANSACTION MONITORING
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
  // 9. NOTIFICATION MANAGEMENT
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
        {/* Main Content (tabs are now in global sidebar) */}
        <div className="admin-content">
          <div className="admin-content-header">
            <h1 className="admin-content-title">
              <span>{currentTab.icon}</span>
              {currentTab.label}
            </h1>
            <p className="admin-content-subtitle">
              {activeTab === "analytics" && "Overview of system performance and user engagement."}
              {activeTab === "users" && "Manage registered users, view profiles, and monitor activity."}
              {activeTab === "carbon" && "Monitor carbon emission data generated by users."}
              {activeTab === "goals" && "Track user sustainability goals and their progress."}
              {activeTab === "badges" && "Create and manage achievement badges."}
              {activeTab === "leaderboard" && "View and manage user rankings and scoring rules."}
              {activeTab === "marketplace" && "Manage eco marketplace products and listings."}
              {activeTab === "transactions" && "Track user purchases in the eco marketplace."}
              {activeTab === "notifications" && "Monitor system notifications and alerts."}
              {activeTab === "settings" && "Maintenance and configuration settings for the admin panel."}
            </p>
          </div>
          {renderContent()}
        </div>
      </div>
    </AppLayout>
  );
}

export default AdminDashboard;
