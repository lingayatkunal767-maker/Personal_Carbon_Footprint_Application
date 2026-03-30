import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import AppLayout from "../components/AppLayout";
import "./Notifications.css";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:8080";

/* ── Notification type meta ──────────────────────────────── */
const TYPE_META = {
  goal:        { icon: "🎯", label: "Goal" },
  badge:       { icon: "🏅", label: "Badge" },
  leaderboard: { icon: "🏆", label: "Leaderboard" },
  emission:    { icon: "⚠️", label: "Emission" },
  purchase:    { icon: "🛒", label: "Purchase" },
  system:      { icon: "🔔", label: "System" },
};

/* ── Fallback notifications (used when backend is unavailable) ── */
const FALLBACK_NOTIFICATIONS = [
  {
    id: 1,
    type: "goal",
    message: "Congratulations! You completed your goal <strong>Reduce monthly emissions by 20%</strong>.",
    timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    read: false,
  },
  {
    id: 2,
    type: "badge",
    message: "You earned the <strong>Eco Starter</strong> badge! 🌱 Keep up the great work.",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    read: false,
  },
  {
    id: 3,
    type: "leaderboard",
    message: "Your rank improved! You are now ranked <strong>#3</strong> on the leaderboard.",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    read: false,
  },
  {
    id: 4,
    type: "emission",
    message: "High emission alert: Your daily emission of <strong>68 kg CO₂e</strong> exceeds the recommended limit.",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    read: true,
  },
  {
    id: 5,
    type: "purchase",
    message: "Your purchase of <strong>Plant 10 Trees</strong> (₹2,099) has been confirmed. 🌳",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    read: true,
  },
  {
    id: 6,
    type: "badge",
    message: "You earned the <strong>Week Warrior</strong> badge for logging 7 consecutive days! 📅",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(),
    read: true,
  },
  {
    id: 7,
    type: "goal",
    message: "New goal suggestion: <strong>Switch to public transport</strong> to reduce your transport emissions by 40%.",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    read: true,
  },
  {
    id: 8,
    type: "system",
    message: "Welcome to CarbonCalc! Start by completing the <strong>Lifestyle Survey</strong> to get your first carbon footprint estimate.",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
    read: true,
  },
  {
    id: 9,
    type: "purchase",
    message: "Your purchase of <strong>Solar Panel Micro-Investment</strong> (₹4,199) has been confirmed. ☀️",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 96).toISOString(),
    read: true,
  },
  {
    id: 10,
    type: "leaderboard",
    message: "Leaderboard updated! Check your current rank and see how you compare with others.",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 120).toISOString(),
    read: true,
  },
];

const FILTER_OPTIONS = [
  { key: "all",         label: "All" },
  { key: "unread",      label: "🔴 Unread" },
  { key: "goal",        label: "🎯 Goals" },
  { key: "badge",       label: "🏅 Badges" },
  { key: "leaderboard", label: "🏆 Leaderboard" },
  { key: "emission",    label: "⚠️ Emissions" },
  { key: "purchase",    label: "🛒 Purchases" },
];

/* ─────────────────────────────────────────────────────────
   NOTIFICATIONS COMPONENT
   ───────────────────────────────────────────────────────── */
function Notifications() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading]             = useState(true);
  const [filter, setFilter]               = useState("all");

  // ── Fetch notifications ──
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { navigate("/login"); return; }

    const headers = { Authorization: `Bearer ${token}` };

    axios.get(`${API_BASE}/api/notifications`, { headers })
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : FALLBACK_NOTIFICATIONS;
        setNotifications(data);
      })
      .catch(() => setNotifications(FALLBACK_NOTIFICATIONS))
      .finally(() => setLoading(false));
  }, [navigate]);

  // ── Derived values ──
  const unreadCount = notifications.filter((n) => !n.read).length;

  const filteredNotifications = notifications.filter((n) => {
    if (filter === "unread") return !n.read;
    if (filter === "all") return true;
    return n.type === filter;
  });

  // ── Time formatting ──
  const timeAgo = (timestamp) => {
    if (!timestamp) return "";
    const diff = Date.now() - new Date(timestamp).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return new Date(timestamp).toLocaleDateString("en-IN", {
      day: "numeric", month: "short", year: "numeric",
    });
  };

  // ── Handlers ──
  const markAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => n.id === id ? { ...n, read: true } : n)
    );
    // Try backend
    const token = localStorage.getItem("token");
    if (token) {
      axios.put(`${API_BASE}/api/notifications/${id}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      }).catch(() => {});
    }
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    const token = localStorage.getItem("token");
    if (token) {
      axios.put(`${API_BASE}/api/notifications/read-all`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      }).catch(() => {});
    }
  };

  const dismissNotification = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    const token = localStorage.getItem("token");
    if (token) {
      axios.delete(`${API_BASE}/api/notifications/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      }).catch(() => {});
    }
  };

  const clearAllRead = () => {
    setNotifications((prev) => prev.filter((n) => !n.read));
  };

  // ── Render ──
  return (
    <AppLayout>
      <div className="notifications-page">

        {/* Header */}
        <div className="notifications-header">
          <div className="notifications-title-wrap">
            <h1 className="notifications-title">🔔 Notifications</h1>
            <p className="notifications-subtitle">
              Stay updated on your goals, badges, rankings, and eco marketplace activity.
            </p>
          </div>

          {unreadCount > 0 && (
            <span className="notifications-badge-count">
              {unreadCount} unread
            </span>
          )}
        </div>

        {loading ? (
          <div className="notifications-loading">
            <div className="notifications-spinner" />
            <p>Loading notifications…</p>
          </div>
        ) : (
          <>
            {/* Filters */}
            <div className="notifications-filters">
              {FILTER_OPTIONS.map((opt) => (
                <button
                  key={opt.key}
                  type="button"
                  className={`notifications-filter-btn ${filter === opt.key ? "active" : ""}`}
                  onClick={() => setFilter(opt.key)}
                >
                  {opt.label}
                </button>
              ))}
              {unreadCount > 0 && (
                <button
                  type="button"
                  className="notifications-filter-btn"
                  onClick={markAllAsRead}
                  style={{ marginLeft: "auto" }}
                >
                  ✓ Mark all read
                </button>
              )}
              {notifications.some((n) => n.read) && (
                <button
                  type="button"
                  className="notifications-clear-btn"
                  onClick={clearAllRead}
                >
                  🗑 Clear read
                </button>
              )}
            </div>

            {/* Notification list */}
            {filteredNotifications.length === 0 ? (
              <div className="notifications-empty">
                <span className="notifications-empty-icon">
                  {filter === "unread" ? "✅" : "🔔"}
                </span>
                <h3 className="notifications-empty-title">
                  {filter === "unread" ? "All caught up!" : "No notifications"}
                </h3>
                <p className="notifications-empty-desc">
                  {filter === "unread"
                    ? "You've read all your notifications."
                    : "No notifications match the current filter."}
                </p>
              </div>
            ) : (
              <div className="notifications-list">
                {filteredNotifications.map((notif) => {
                  const meta = TYPE_META[notif.type] || TYPE_META.system;
                  return (
                    <div
                      key={notif.id}
                      className={`notification-card ${notif.read ? "read" : "unread"}`}
                    >
                      {!notif.read && <span className="notification-unread-dot" />}

                      <div className={`notification-icon-bubble ${notif.type}`}>
                        {meta.icon}
                      </div>

                      <div className="notification-body">
                        <p
                          className="notification-message"
                          dangerouslySetInnerHTML={{ __html: notif.message }}
                        />
                        <div className="notification-meta">
                          <span className="notification-time">
                            {timeAgo(notif.timestamp)}
                          </span>
                          <span className={`notification-type-badge ${notif.type}`}>
                            {meta.label}
                          </span>
                        </div>
                      </div>

                      <div className="notification-actions">
                        {!notif.read && (
                          <button
                            type="button"
                            className="notification-mark-btn"
                            onClick={() => markAsRead(notif.id)}
                          >
                            Mark read
                          </button>
                        )}
                        <button
                          type="button"
                          className="notification-dismiss-btn"
                          onClick={() => dismissNotification(notif.id)}
                          title="Dismiss"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </AppLayout>
  );
}

export default Notifications;
