import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import AppLayout from "../components/AppLayout";
import "./Badges.css";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:8080";

// Badge metadata — maps backend badgeName to icon/color/description
const BADGE_META = {
  "First Log":      { icon: "🌱", color: "badge-green",  desc: "Logged your very first carbon entry." },
  "Week Warrior":   { icon: "📅", color: "badge-blue",   desc: "Logged carbon data for 7 consecutive days." },
  "Low Emitter":    { icon: "🍃", color: "badge-green",  desc: "Kept daily emissions under 10 kg CO₂e." },
  "Eco Streak":     { icon: "🔥", color: "badge-amber",  desc: "Maintained a 14-day low-emission streak." },
  "Survey Master":  { icon: "📋", color: "badge-purple", desc: "Completed the full lifestyle survey." },
  "Carbon Cutter":  { icon: "✂️", color: "badge-blue",   desc: "Reduced emissions by 20% vs last month." },
  "Green Champion": { icon: "🏆", color: "badge-amber",  desc: "Reached the top 10% of low emitters." },
  "Tree Planter":   { icon: "🌳", color: "badge-green",  desc: "Offset 100 kg CO₂e through logged actions." },
  "Solar Hero":     { icon: "☀️", color: "badge-amber",  desc: "Logged zero energy emissions for a week." },
  "Team Player":    { icon: "🤝", color: "badge-purple", desc: "Joined and contributed to a team." },
};

const ALL_BADGES = Object.entries(BADGE_META).map(([name, meta]) => ({
  name,
  ...meta,
  earned: false,
  earnedAt: null,
}));

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

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { navigate("/"); return; }

    axios
      .get(`${API_BASE}/api/badges`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => {
        const earned = Array.isArray(res.data) ? res.data : [];
        const earnedNames = new Set(
          earned.map((b) => b.badgeName || b.name)
        );
        const merged = ALL_BADGES.map((b) => {
          const serverBadge = earned.find(
            (e) => (e.badgeName || e.name) === b.name
          );
          return {
            ...b,
            earned: earnedNames.has(b.name),
            earnedAt: serverBadge?.earnedAt || serverBadge?.createdAt || null,
          };
        });
        setBadges(merged);
      })
      .catch(() => {
        // Backend not reachable – show all as locked with graceful fallback
        setBadges(ALL_BADGES);
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
                      key={badge.name}
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
