import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import AppLayout from "../components/AppLayout";
import "./CarbonHistory.css";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:8080";

const CATEGORIES = ["All Categories", "Transport", "Food", "Energy"];

function getDefaultMonthRange() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const first = `${y}-${m}-01`;
  const today = `${y}-${m}-${String(d.getDate()).padStart(2, "0")}`;

  return { start: first, end: today };
}
function getTodayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

const MAX_RANGE_DAYS = 365;

function validateDateRange(start, end) {
  if (!start || !end) return "Please select both From and To dates.";
  if (start > end) return "From date must be before or equal to To date.";
  const today = getTodayStr();
  if (start > today) return "From date cannot be in the future.";
  if (end > today) return "To date cannot be in the future.";
  const startMs = new Date(start).getTime();
  const endMs = new Date(end).getTime();
  const days = Math.round((endMs - startMs) / (24 * 60 * 60 * 1000)) + 1;
  if (days > MAX_RANGE_DAYS) return `Date range cannot exceed ${MAX_RANGE_DAYS} days.`;
  return null;
}

function CarbonHistory() {
  const navigate = useNavigate();
  const defaultRange = getDefaultMonthRange();
  const todayStr = getTodayStr();
  const [view, setView] = useState("table");
  const [category, setCategory] = useState("All Categories");
  const [startDate, setStartDate] = useState(defaultRange.start);
  const [endDate, setEndDate] = useState(defaultRange.end);
  const [dateError, setDateError] = useState(null);
  const [page, setPage] = useState(1);
  const [logs, setLogs] = useState([]);
  const perPage = 5;

  useEffect(() => {
    setDateError(validateDateRange(startDate, endDate));
  }, [startDate, endDate]);

  useEffect(() => {
  const fetchLogs = async () => {
    try {
      const res = await axios.get(
        `${API_BASE}/api/carbon/logs?from=${startDate}&to=${endDate}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      setLogs(res.data);

    } catch (err) {
      console.error("Error fetching logs", err);
    }
  };

  if (!dateError) {
    fetchLogs();
  }

}, [startDate, endDate, dateError]);

const filteredLogs = logs.filter((row) => {
  if (category === "All Categories") return true;

  if (category === "Transport") return row.transportEmission > 0;
  if (category === "Food") return row.foodEmission > 0;
  if (category === "Energy") return row.energyEmission > 0;

  return true;
});

// Total Emission
const totalEmission = filteredLogs.reduce(
  (sum, log) => sum + log.totalEmission,
  0
);

// Average Monthly (based on selected range)
const months =
  new Set(filteredLogs.map((log) => log.date.slice(0, 7))).size || 1;

const avgMonthly = (totalEmission / months).toFixed(2);

// Category totals
const transportTotal = filteredLogs.reduce(
  (sum, log) => sum + log.transportEmission,
  0
);

const foodTotal = filteredLogs.reduce(
  (sum, log) => sum + log.foodEmission,
  0
);

const energyTotal = filteredLogs.reduce(
  (sum, log) => sum + log.energyEmission,
  0
);

// Find Best Category (lowest emission)
const categoryTotals = {
  Transport: transportTotal,
  Food: foodTotal,
  Energy: energyTotal
};

const bestCategory = Object.keys(categoryTotals).reduce((a, b) =>
  categoryTotals[a] < categoryTotals[b] ? a : b
);

const chartData = filteredLogs.map((log) => ({
  date: log.date,
  transport: log.transportEmission,
  food: log.foodEmission,
  energy: log.energyEmission,
  total: log.totalEmission
}));
const totalEntries = filteredLogs.length;
  const paginatedLogs = filteredLogs.slice((page - 1) * perPage, page * perPage);
  const hasDateError = Boolean(dateError);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/");
      return;
    }
    const check = async () => {
      try {
        await axios.get(`${API_BASE}/api/auth/api/test`, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch {
        localStorage.removeItem("token");
        navigate("/");
      }
    };
    check();
  }, [navigate]);

  return (
    <AppLayout>
      <div className="history-page">
        <div className="history-header">
          <div>
            <h1 className="history-title">Carbon History</h1>
            <p className="history-subtitle">Analyze your environmental progress and historical log data.</p>
          </div>
          <div className="history-header-actions">
            <Link to="/Profile" className="btn btn-primary">
              Update Profile →
            </Link>
          </div>
        </div>

        <div className="history-toolbar">
          <div className="history-date-range-picker-wrap">
            <div className={`history-date-range-picker ${hasDateError ? "history-date-range-picker-error" : ""}`}>
              <span className="history-date-icon">📅</span>
              <label className="history-date-label">
                From
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => { setStartDate(e.target.value); setPage(1); }}
                  className="history-date-input"
                  max={endDate > todayStr ? todayStr : endDate}
                  min="2020-01-01"
                  aria-invalid={hasDateError}
                  aria-describedby={hasDateError ? "history-date-error" : undefined}
                />
              </label>
              <label className="history-date-label">
                To
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => { setEndDate(e.target.value); setPage(1); }}
                  className="history-date-input"
                  min={startDate}
                  max={todayStr}
                  aria-invalid={hasDateError}
                  aria-describedby={hasDateError ? "history-date-error" : undefined}
                />
              </label>
            </div>
            {dateError && (
              <p id="history-date-error" className="history-date-error" role="alert">
                {dateError}
              </p>
            )}
          </div>
          <div className="history-filters">
            <span className="history-filter-icon">▣</span>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                className={`history-filter-btn ${category === cat ? "active" : ""}`}
                onClick={() => {
                  setCategory(cat);
                  setPage(1);
                }}
              >
                {cat}
              </button>
            ))}
          </div>
          <div className="history-view-toggle">
            <button
              type="button"
              className={`history-view-btn ${view === "table" ? "active" : ""}`}
              onClick={() => setView("table")}
              aria-pressed={view === "table"}
            >
              Table View
            </button>
            <button
              type="button"
              className={`history-view-btn ${view === "chart" ? "active" : ""}`}
              onClick={() => setView("chart")}
              aria-pressed={view === "chart"}
            >
              Trend Chart
            </button>
          </div>
        </div>

        <section className="history-logs-section card">
          <div className="history-logs-header">
            <div>
              <h2 className="section-heading">Detailed Logs</h2>
              <p className="history-logs-meta">Showing {totalEntries > 0 ? (page - 1) * perPage + 1 : 0}–{Math.min(page * perPage, totalEntries)} of {totalEntries} records.</p>
            </div>
            <span className="history-efficiency">Efficiency: +12.4% vs last month</span>
          </div>

          {view === "table" ? (
            <>
              <div className="history-table-wrap">
                <table className="history-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Transport Emission</th>
                      <th>Food Emission</th>
                      <th>Energy Emission</th>
                      <th>Total Emission</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedLogs.map((row) => (
                      <tr key={row.id}>
                        <td>{row.date}</td>
                        <td>{row.transportEmission}</td>
                        <td>{row.foodEmission}</td>
                        <td>{row.energyEmission}</td>
                        <td className="history-total-cell">
                           {row.totalEmission}
                          {row.alert && <span className="history-alert-dot" title="Above target" />}
                        </td>
                        <td>
                          <button type="button" className="history-detail-link" onClick={() => navigate(`/carbon-details/${row.id}`)}>
                            View Details</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="history-pagination">
                <span className="history-pagination-info">
                  Showing {(page - 1) * perPage + 1}–{Math.min(page * perPage, totalEntries)} of {totalEntries} entries
                </span>
                <div className="history-pagination-btns">
                  <button type="button" className="history-page-btn" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>←</button>
                  {Array.from({ length: Math.max(1, Math.ceil(totalEntries / perPage)) }, (_, i) => i + 1).map((n) => (
                    <button key={n} type="button" className={`history-page-btn ${page === n ? "active" : ""}`} onClick={() => setPage(n)}>{n}</button>
                  ))}
                  <button type="button" className="history-page-btn" disabled={page >= Math.ceil(totalEntries / perPage)} onClick={() => setPage((p) => p + 1)}>→</button>
                </div>
              </div>
            </>
          ) : (

            <div style={{ width: "100%", height: 350 }}>
               <ResponsiveContainer>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />

              <Line type="monotone" dataKey="transport" stroke="#3498db" name="Transport" />
              <Line type="monotone" dataKey="food" stroke="#f39c12" name="Food" />
              <Line type="monotone" dataKey="energy" stroke="#e74c3c" name="Energy" />
              <Line type="monotone" dataKey="total" stroke="#2ecc71" strokeWidth={3} name="Total" />

            </LineChart>
              </ResponsiveContainer>
          </div>
          )}
        </section>

        <div className="history-summary-cards">

  <div className="history-summary-card card card-green">
    <span className="history-summary-icon">🌿</span>
    <span className="history-summary-label">Average Monthly</span>
    <span className="history-summary-value">
      {avgMonthly} kg CO₂e
    </span>
  </div>

  <div className="history-summary-card card card-green">
    <span className="history-summary-icon">📉</span>
    <span className="history-summary-label">Best Category</span>
    <span className="history-summary-value">
      {bestCategory}
    </span>
  </div>

  <div className="history-summary-card card card-green">
    <span className="history-summary-icon">📊</span>
    <span className="history-summary-label">Total Audited</span>
    <span className="history-summary-value">
      {totalEmission.toFixed(2)} kg
    </span>
  </div>

</div>
      </div>
    </AppLayout>
  );
}

export default CarbonHistory;
