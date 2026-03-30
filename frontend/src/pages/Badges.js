import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import AppLayout from "../components/AppLayout";
import "./Badges.css";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:8080";

// Default color mapping by icon / code; backend is source of truth
const DEFAULT_COLOR = "badge-green";

const FILTER_OPTIONS = [
  { key: "all",    label: "All" },
  { key: "earned", label: "✅ Earned" },
  { key: "locked", label: "🔒 Locked" },
];

function Badges() {
  const navigate = useNavigate();
  const [badges, setBadges]             = useState([]);
  const [loading, setLoading]           = useState(true);
  const [selectedBadge, setSelectedBadge] = useState(null);
  const [filter, setFilter]             = useState("all");

  const resolveIcon = (tpl) => {
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

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { navigate("/login"); return; }

    const headers = { Authorization: `Bearer ${token}` };

    // Fetch catalog (badge templates) + earned badges in parallel
    Promise.all([
      axios.get(`${API_BASE}/api/badge-templates`, { headers }),
      axios.get(`${API_BASE}/api/badges`, { headers }),
    ])
      .then(([templateRes, earnedRes]) => {
        const allTemplates = Array.isArray(templateRes.data) ? templateRes.data : [];
        // Only show active badge templates to end users
        const templates = allTemplates.filter((t) => t.active !== false);
        const earned = Array.isArray(earnedRes.data) ? earnedRes.data : [];

        const earnedByName = new Map(
          earned.map((b) => [b.badgeName || b.name, b])
        );

        const merged = templates.map((tpl) => {
          const name = tpl.name;
          const earnedBadge = earnedByName.get(name);

          // Derive icon/color for frontend
          const icon = resolveIcon(tpl);
          const color =
            icon === "📅" ? "badge-blue" :
            icon === "🍃" ? "badge-green" :
            icon === "🔥" ? "badge-amber" :
            icon === "📋" ? "badge-purple" :
            icon === "✂️" ? "badge-blue" :
            icon === "🏆" ? "badge-amber" :
            icon === "🌳" ? "badge-green" :
            icon === "☀️" ? "badge-amber" :
            icon === "🤝" ? "badge-purple" :
            icon === "🎯" ? "badge-amber" :
            icon === "✅" ? "badge-green" :
            DEFAULT_COLOR;

          return {
            id: tpl.id,
            name,
            icon,
            color,
            desc: tpl.description || tpl.conditionText || "",
            earned: Boolean(earnedBadge),
            earnedAt: earnedBadge?.awardedAt || earnedBadge?.createdAt || null,
          };
        });

        setBadges(merged);
      })
      .catch(() => {
        // If backend unreachable, show empty list
        setBadges([]);
      })
      .finally(() => setLoading(false));
  }, [navigate]);

  // ── Derived values ────────────────────────────────────────
  const earned   = badges.filter((b) => b.earned);
  const locked   = badges.filter((b) => !b.earned);
  const progress = badges.length > 0
    ? Math.round((earned.length / badges.length) * 100)
    : 0;

  const filteredBadges =
    filter === "earned" ? earned :
    filter === "locked" ? locked :
    badges;

  const formatDate = (dateStr) =>
    dateStr
      ? new Date(dateStr).toLocaleDateString("en-IN", {
          day: "numeric", month: "short", year: "numeric",
        })
      : null;

  // ── Render ────────────────────────────────────────────────
  return (
    <AppLayout>
      <div className="badges-page">

        {/* ── Header ── */}
        <div className="badges-page-header">
          <div className="badges-page-title-wrap">
            <h1 className="badges-page-title">🏅 My Badges</h1>
            <p className="badges-page-subtitle">
              Earn badges by building eco-friendly habits and reducing your carbon footprint.
            </p>
          </div>

          {/* Progress card */}
          <div className="badges-progress-card">
            <span className="badges-progress-label">Overall Progress</span>
            <span className="badges-progress-count">
              {earned.length}
              <span className="badges-progress-total"> / {badges.length}</span>
            </span>
            <div className="badges-progress-bar-wrap">
              <div
                className="badges-progress-bar"
                style={{ width: `${progress}%` }}
                role="progressbar"
                aria-valuenow={progress}
                aria-valuemin={0}
                aria-valuemax={100}
              />
            </div>
            <span className="badges-progress-pct">{progress}% earned</span>
          </div>
        </div>

        {loading ? (
          <div className="badges-loading">
            <div className="badges-spinner" />
            <p>Loading your badges…</p>
          </div>
        ) : (
          <>
            {/* ── Filter tabs ── */}
            <div className="badges-filter-tabs">
              {FILTER_OPTIONS.map((opt) => (
                <button
                  key={opt.key}
                  type="button"
                  className={`badges-filter-btn ${filter === opt.key ? "active" : ""}`}
                  onClick={() => setFilter(opt.key)}
                >
                  {opt.label}
                  <span className="badges-filter-count">
                    {opt.key === "all"    ? badges.length :
                     opt.key === "earned" ? earned.length :
                     locked.length}
                  </span>
                </button>
              ))}
            </div>

            {/* ── Badge grid ── */}
            {filteredBadges.length === 0 ? (
              <div className="badges-all-earned card">
                <span className="badges-all-earned-icon">
                  {filter === "earned" ? "🎉" : "🔓"}
                </span>
                <p>
                  {filter === "earned"
                    ? "You haven't earned any badges yet. Start logging your carbon footprint!"
                    : "You've earned every badge! Incredible work! 🌍"}
                </p>
              </div>
            ) : (
              <section className="badges-section">
                <div className="badges-grid">
                  {filteredBadges.map((badge) => (
                    <button
                      key={badge.id || badge.name}
                      type="button"
                      className={`badge-tile ${badge.earned ? `earned ${badge.color}` : "locked"} card`}
                      onClick={() => setSelectedBadge(badge)}
                      aria-label={`${badge.earned ? "Earned badge" : "Locked badge"}: ${badge.name}`}
                    >
                      <span className={`badge-tile-icon ${!badge.earned ? "badge-tile-icon-locked" : ""}`}>
                        {badge.icon}
                      </span>
                      <span className="badge-tile-name">{badge.name}</span>
                      {badge.earned && badge.earnedAt && (
                        <span className="badge-tile-date">{formatDate(badge.earnedAt)}</span>
                      )}
                      {badge.earned
                        ? <span className="badge-tile-earned-dot" aria-hidden>✦</span>
                        : <span className="badge-tile-lock-icon"  aria-hidden>🔒</span>
                      }
                    </button>
                  ))}
                </div>
              </section>
            )}
          </>
        )}

        {/* ── Badge Detail Modal ── */}
        {selectedBadge && (
          <div
            className="badge-modal-overlay"
            onClick={() => setSelectedBadge(null)}
            role="dialog"
            aria-modal="true"
            aria-label={`Badge: ${selectedBadge.name}`}
          >
            <div
              className={`badge-modal ${selectedBadge.earned ? selectedBadge.color : ""} card`}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                className="badge-modal-close"
                onClick={() => setSelectedBadge(null)}
                aria-label="Close"
              >
                ×
              </button>
              <span className="badge-modal-icon">{selectedBadge.icon}</span>
              <h3 className="badge-modal-name">{selectedBadge.name}</h3>
              <p className="badge-modal-desc">{selectedBadge.desc}</p>
              {selectedBadge.earned ? (
                <span className="badge-modal-status earned">
                  ✦ Earned
                  {selectedBadge.earnedAt && ` · ${formatDate(selectedBadge.earnedAt)}`}
                </span>
              ) : (
                <span className="badge-modal-status locked">🔒 Not yet earned</span>
              )}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}

export default Badges;
