import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import AppLayout from "../components/AppLayout";
import "./Dashboard.css";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:8080";

// Mock data – replace with API when backend is ready
const TIME_FILTERS = ["Daily", "Weekly", "Monthly"];
// const EMISSION_BY_PERIOD = { Daily: 64.4, Weekly: 450.5, Monthly: 1850 };
// const CATEGORY_EMISSIONS = [
//   { label: "Transport", value: 142, unit: "kg CO₂e" },
//   { label: "Food", value: 98, unit: "kg CO₂e" },
//   { label: "Energy", value: 210, unit: "kg CO₂e" },
// ];
// const TREND_DATA = [
//   { date: "05-06", value: 58 },
//   { date: "05-07", value: 62 },
//   { date: "05-08", value: 55 },
//   { date: "05-09", value: 70 },
//   { date: "05-10", value: 65 },
//   { date: "05-11", value: 72 },
//   { date: "05-12", value: 64 },
// ];
// const RECENT_LOGS = [
//   { id: "1", date: "2024-05-12", total: 348 },
//   { id: "2", date: "2024-05-11", total: 337 },
//   { id: "3", date: "2024-05-10", total: 333 },
//   { id: "4", date: "2024-05-09", total: 326 },
//   { id: "5", date: "2024-05-08", total: 319 },
// ];

function Dashboard() {
  const navigate = useNavigate();
  const [timeFilter, setTimeFilter] = useState("Weekly");
  // const [summaryEmission, setSummaryEmission] = useState(EMISSION_BY_PERIOD.Weekly);
  // const [trendData, setTrendData] = useState(TREND_DATA);
  // const [recentLogs, setRecentLogs] = useState(RECENT_LOGS);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

const formatDate = (date) => {
    return date.toLocaleDateString("en-CA");
  };

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    const fetchLogs = async () => {
      try {
        const headers = { Authorization: `Bearer ${token}` };
        const today = new Date();
        const to = formatDate(today);
        let fromDate = new Date();

        if (timeFilter === "Daily") {
          fromDate = today;
        } else if (timeFilter === "Weekly") {
          fromDate.setDate(today.getDate() - 7);
        } else if (timeFilter === "Monthly") {
          fromDate.setMonth(today.getMonth() - 1);
        }

        const from = formatDate(fromDate);
        const res = await axios.get(
          `${API_BASE}/api/carbon/logs?from=${from}&to=${to}`,
          { headers }
        );

        const data = Array.isArray(res.data) ? res.data : [];
        setLogs(data);
      } catch (err) {
        localStorage.removeItem("token");
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, [timeFilter, navigate]);

  // useEffect(() => {
  //   setSummaryEmission(EMISSION_BY_PERIOD[timeFilter] ?? EMISSION_BY_PERIOD.Weekly);
  // }, [timeFilter]);

  const safeLogs = Array.isArray(logs) ? logs : [];

  const summaryEmission = safeLogs.reduce(
  (sum, log) => sum + Number(log.totalEmission),
  0
);

const transportTotal = safeLogs.reduce(
  (sum, log) => sum + Number(log.transportEmission),
  0
);

const foodTotal = safeLogs.reduce(
  (sum, log) => sum + Number(log.foodEmission),
  0
);

const energyTotal = safeLogs.reduce(
  (sum, log) => sum + Number(log.energyEmission),
  0
);

const trendData = safeLogs.map(log => ({
  date: log.date,
  value: Number(log.totalEmission)
}));

const recentLogs = [...safeLogs]
  .sort((a, b) => new Date(b.date) - new Date(a.date))
  .slice(0, 5);
  const maxTrend = Math.max(...trendData.map((d) => d.value), 1);

  return (
    <AppLayout>
      <div className="dashboard-page">
        {/* 1. Carbon Summary Card – total emission + time filter */}
        <section className="dashboard-section card dashboard-summary-card">
          <h2 className="section-heading">Carbon Summary</h2>
          <div className="dashboard-summary-row">
            <div className="dashboard-summary-value-wrap">
              <span className="dashboard-summary-value" data-testid="total-emission">
                {summaryEmission.toFixed(2)} kg CO₂e
              </span>
              <span className="dashboard-summary-label">Total emission</span>
            </div>
            <div className="dashboard-summary-filter">
              <span className="dashboard-summary-filter-label">Time period</span>
              <div className="dashboard-time-filters">
                {TIME_FILTERS.map((f) => (
                  <button
                    key={f}
                    type="button"
                    className={`dashboard-time-btn ${timeFilter === f ? "active" : ""}`}
                    onClick={() => setTimeFilter(f)}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* 2. Category-wise breakdown */}
        <section className="dashboard-section">
          <h2 className="section-heading">Category-wise Breakdown</h2>
          <div className="dashboard-category-cards">
            {/* {CATEGORY_EMISSIONS.map((cat) => (
              <div key={cat.label} className="card dashboard-category-card">
                <span className="dashboard-category-label">{cat.label} emissions</span>
                <span className="dashboard-category-value">{cat.value} {cat.unit}</span>
              </div>
            ))} */}
            <div className="card dashboard-category-card">
  <span className="dashboard-category-label">Transport emissions</span>
  <span className="dashboard-category-value">
    {transportTotal.toFixed(2)} kg CO₂e
  </span>
</div>

<div className="card dashboard-category-card">
  <span className="dashboard-category-label">Food emissions</span>
  <span className="dashboard-category-value">
    {foodTotal.toFixed(2)} kg CO₂e
  </span>
</div>

<div className="card dashboard-category-card">
  <span className="dashboard-category-label">Energy emissions</span>
  <span className="dashboard-category-value">
    {energyTotal.toFixed(2)} kg CO₂e
  </span>
</div>
          </div>
        </section>

        {/* 3. Emission Trend Chart – line chart, X: Date, Y: Emission */}
        <section className="dashboard-section card dashboard-trend-section">
          <h2 className="section-heading">Emission Trend</h2>
          <p className="section-sub">Emissions over time. X-axis: Date, Y-axis: Emission (kg CO₂e).</p>
          <div className="dashboard-line-chart">
            <div className="line-chart-y-axis">
              {[maxTrend, Math.round(maxTrend * 0.66), Math.round(maxTrend * 0.33), 0].map((tick) => (
                <span key={tick}>{tick}</span>
              ))}
            </div>
            <div className="line-chart-area">
              <svg className="line-chart-svg" viewBox="0 0 400 120" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-accent-green)" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0.05" />
                  </linearGradient>
                </defs>
                <path
                  className="line-chart-area-path"
                  d={trendData.reduce((acc, d, i) => {
                    const x = (i / (trendData.length - 1)) * 400;
                    const y = 120 - (d.value / maxTrend) * 100;
                    return acc + (i === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`);
                  }, "") + ` L 400 120 L 0 120 Z`}
                  fill="url(#lineGrad)"
                />
                <path
                  className="line-chart-line"
                  d={trendData.reduce((acc, d, i) => {
                    const x = (i / (trendData.length - 1)) * 400;
                    const y = 120 - (d.value / maxTrend) * 100;
                    return acc + (i === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`);
                  }, "")}
                  fill="none"
                  stroke="var(--color-primary)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div className="line-chart-x-axis">
              {trendData.map((d) => (
                <span key={d.date}>{d.date}</span>
              ))}
            </div>
          </div>
        </section>

        {/* 4. Recent Carbon Logs Table – Date, Total emission, View details */}
        <section className="dashboard-section card dashboard-logs-section">
          <div className="dashboard-logs-header">
            <div>
              <h2 className="section-heading">Recent Carbon Logs</h2>
              <p className="section-sub">Your latest footprint entries.</p>
            </div>
            <Link to="/carbon-history" className="dashboard-activity-link">View all</Link>
          </div>
          <div className="dashboard-logs-table-wrap">
            <table className="dashboard-logs-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Total emission</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {recentLogs.map((row) => (
                  <tr key={row.id}>
                    <td>{row.date}</td>
                    <td className="dashboard-logs-total">
                      {Number(row.totalEmission).toFixed(2)} kg CO₂e</td>
                    <td>
                      <Link to={`/carbon-history?date=${row.date}`} className="dashboard-logs-action">
                        View details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

      </div>
    </AppLayout>
  );
}

export default Dashboard;
