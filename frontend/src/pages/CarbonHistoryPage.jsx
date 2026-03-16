import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { carbonLogAPI } from '../services/api';
import '../styles/CarbonHistory.css';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, Filler);

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8081/api';
const PAGE_SIZE = 5;
const CATEGORY_FILTERS = ['all', 'transport', 'food', 'energy'];

function toInputDate(date) {
  return date.toISOString().split('T')[0];
}

function formatDate(dateValue) {
  if (!dateValue) return '-';
  const date = new Date(dateValue);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function formatNumber(value) {
  return Number(value || 0).toFixed(2);
}

function parseLog(log) {
  return {
    logDate: log.logDate,
    transportEmission: Number(log.transportEmission || 0),
    foodEmission: Number(log.foodEmission || 0),
    energyEmission: Number(log.energyEmission || 0),
    totalEmission: Number(log.totalEmission || 0),
  };
}

function getMonthKey(dateString) {
  return (dateString || '').slice(0, 7);
}

function getEfficiencyStats(logs) {
  if (!logs.length) {
    return { percentage: 0, positive: true, label: 'Efficiency: no data yet' };
  }

  const monthBuckets = logs.reduce((acc, log) => {
    const key = getMonthKey(log.logDate);
    if (!key) return acc;
    if (!acc[key]) {
      acc[key] = { total: 0, days: 0 };
    }
    acc[key].total += log.totalEmission;
    acc[key].days += 1;
    return acc;
  }, {});

  const monthKeys = Object.keys(monthBuckets).sort();
  if (monthKeys.length >= 2) {
    const previousKey = monthKeys[monthKeys.length - 2];
    const currentKey = monthKeys[monthKeys.length - 1];

    const previousAvg = monthBuckets[previousKey].total / monthBuckets[previousKey].days;
    const currentAvg = monthBuckets[currentKey].total / monthBuckets[currentKey].days;

    if (previousAvg > 0) {
      const percent = ((previousAvg - currentAvg) / previousAvg) * 100;
      return {
        percentage: Math.abs(percent),
        positive: percent >= 0,
        label: `Efficiency: ${percent >= 0 ? '+' : '-'}${Math.abs(percent).toFixed(1)}% vs last month`,
      };
    }
  }

  if (logs.length >= 6) {
    const ordered = [...logs].sort((a, b) => a.logDate.localeCompare(b.logDate));
    const half = Math.floor(ordered.length / 2);
    const firstHalf = ordered.slice(0, half);
    const secondHalf = ordered.slice(half);

    const firstAvg = firstHalf.reduce((sum, item) => sum + item.totalEmission, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, item) => sum + item.totalEmission, 0) / secondHalf.length;

    if (firstAvg > 0) {
      const percent = ((firstAvg - secondAvg) / firstAvg) * 100;
      return {
        percentage: Math.abs(percent),
        positive: percent >= 0,
        label: `Efficiency: ${percent >= 0 ? '+' : '-'}${Math.abs(percent).toFixed(1)}% vs previous period`,
      };
    }
  }

  return { percentage: 0, positive: true, label: 'Efficiency: insufficient comparison data' };
}

export default function CarbonHistoryPage() {
  const navigate = useNavigate();

  const now = new Date();
  const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  const [userId, setUserId] = useState(null);
  const [userName, setUserName] = useState('Eco User');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [fromDate, setFromDate] = useState(toInputDate(previousMonthStart));
  const [toDate, setToDate] = useState(toInputDate(now));

  const [logs, setLogs] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [viewMode, setViewMode] = useState('table');
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedLogDate, setExpandedLogDate] = useState(null);

  const handleLogout = useCallback(() => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('current_user');
    navigate('/login', { replace: true });
  }, [navigate]);

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    const stored = localStorage.getItem('current_user');

    if (!token || !stored) {
      navigate('/login', { replace: true });
      return;
    }

    let session;
    try {
      session = JSON.parse(stored);
    } catch {
      navigate('/login', { replace: true });
      return;
    }

    if (session?.name) {
      setUserName(session.name);
    }

    if (session?.id) {
      setUserId(session.id);
      return;
    }

    if (session?.email) {
      fetch(`${API_BASE}/users/email/${encodeURIComponent(session.email)}`)
        .then((response) => (response.ok ? response.json() : null))
        .then((data) => {
          if (data?.id) {
            const updated = { ...session, id: data.id };
            localStorage.setItem('current_user', JSON.stringify(updated));
            setUserId(data.id);
            return;
          }
          navigate('/login', { replace: true });
        })
        .catch(() => navigate('/login', { replace: true }));
      return;
    }

    navigate('/login', { replace: true });
  }, [navigate]);

  useEffect(() => {
    if (!userId) return;

    const fetchLogs = async () => {
      setLoading(true);
      setError('');
      setExpandedLogDate(null);

      try {
        const response = await carbonLogAPI.getCarbonLogs(userId, fromDate || null, toDate || null);
        const mappedLogs = Array.isArray(response) ? response.map(parseLog) : [];
        mappedLogs.sort((a, b) => b.logDate.localeCompare(a.logDate));
        setLogs(mappedLogs);
      } catch (err) {
        setError(err.message || 'Unable to load carbon history right now.');
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, [userId, fromDate, toDate]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchText, activeCategory, fromDate, toDate]);

  const filteredLogs = useMemo(() => {
    const normalizedSearch = searchText.trim().toLowerCase();

    return logs.filter((log) => {
      const categoryMatch =
        activeCategory === 'all' ||
        (activeCategory === 'transport' && log.transportEmission > 0) ||
        (activeCategory === 'food' && log.foodEmission > 0) ||
        (activeCategory === 'energy' && log.energyEmission > 0);

      if (!categoryMatch) return false;
      if (!normalizedSearch) return true;

      const searchable = [
        log.logDate,
        formatDate(log.logDate),
        formatNumber(log.transportEmission),
        formatNumber(log.foodEmission),
        formatNumber(log.energyEmission),
        formatNumber(log.totalEmission),
      ]
        .join(' ')
        .toLowerCase();

      return searchable.includes(normalizedSearch);
    });
  }, [logs, searchText, activeCategory]);

  const totalPages = Math.max(1, Math.ceil(filteredLogs.length / PAGE_SIZE));

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const pagedLogs = useMemo(() => {
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    return filteredLogs.slice(startIndex, startIndex + PAGE_SIZE);
  }, [filteredLogs, currentPage]);

  const summaryStats = useMemo(() => {
    if (!filteredLogs.length) {
      return {
        averageMonthly: 0,
        bestCategory: 'N/A',
        totalAudited: 0,
      };
    }

    const totalAudited = filteredLogs.reduce((sum, item) => sum + item.totalEmission, 0);

    const categoryTotals = filteredLogs.reduce(
      (acc, item) => {
        acc.transport += item.transportEmission;
        acc.food += item.foodEmission;
        acc.energy += item.energyEmission;
        return acc;
      },
      { transport: 0, food: 0, energy: 0 }
    );

    const bestCategoryKey = Object.entries(categoryTotals).sort((a, b) => a[1] - b[1])[0][0];
    const bestCategoryLabel =
      bestCategoryKey === 'transport'
        ? 'Transport'
        : bestCategoryKey === 'food'
        ? 'Food and Diet'
        : 'Energy Usage';

    const monthlyTotals = filteredLogs.reduce((acc, item) => {
      const month = getMonthKey(item.logDate);
      if (!month) return acc;
      acc[month] = (acc[month] || 0) + item.totalEmission;
      return acc;
    }, {});

    const averageMonthly =
      Object.keys(monthlyTotals).length > 0
        ? Object.values(monthlyTotals).reduce((sum, value) => sum + value, 0) /
          Object.keys(monthlyTotals).length
        : 0;

    return {
      averageMonthly,
      bestCategory: bestCategoryLabel,
      totalAudited,
    };
  }, [filteredLogs]);

  const efficiencyStats = useMemo(() => getEfficiencyStats(filteredLogs), [filteredLogs]);

  const trendChartData = useMemo(() => {
    const ordered = [...filteredLogs]
      .sort((a, b) => a.logDate.localeCompare(b.logDate))
      .slice(-30);

    return {
      labels: ordered.map((item) =>
        new Date(item.logDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      ),
      datasets: [
        {
          label: 'Total (kg)',
          data: ordered.map((item) => item.totalEmission),
          borderColor: '#2f8f46',
          backgroundColor: 'rgba(47, 143, 70, 0.16)',
          fill: true,
          tension: 0.35,
          pointRadius: 3,
        },
        {
          label: 'Transport',
          data: ordered.map((item) => item.transportEmission),
          borderColor: '#4f9ff7',
          backgroundColor: 'transparent',
          tension: 0.3,
          pointRadius: 2,
        },
        {
          label: 'Food',
          data: ordered.map((item) => item.foodEmission),
          borderColor: '#e9a42b',
          backgroundColor: 'transparent',
          tension: 0.3,
          pointRadius: 2,
        },
        {
          label: 'Energy',
          data: ordered.map((item) => item.energyEmission),
          borderColor: '#9b6cdf',
          backgroundColor: 'transparent',
          tension: 0.3,
          pointRadius: 2,
        },
      ],
    };
  }, [filteredLogs]);

  const trendChartOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
          labels: {
            usePointStyle: true,
            pointStyle: 'circle',
            boxWidth: 8,
          },
        },
      },
      scales: {
        x: {
          grid: { display: false },
        },
        y: {
          beginAtZero: true,
          ticks: {
            callback: (value) => `${value} kg`,
          },
        },
      },
    }),
    []
  );

  const handleExportCsv = useCallback(() => {
    if (!filteredLogs.length) return;

    const header = ['Date', 'Transport (kg)', 'Food (kg)', 'Energy (kg)', 'Total (kg)'];
    const lines = filteredLogs.map((item) => [
      item.logDate,
      formatNumber(item.transportEmission),
      formatNumber(item.foodEmission),
      formatNumber(item.energyEmission),
      formatNumber(item.totalEmission),
    ]);

    const csv = [header, ...lines].map((row) => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `carbon-history-${fromDate || 'all'}-to-${toDate || 'all'}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [filteredLogs, fromDate, toDate]);

  const handleNavigateDashboard = useCallback(() => navigate('/home'), [navigate]);
  const handleNavigateSurvey = useCallback(() => navigate('/survey'), [navigate]);

  const pageButtons = useMemo(() => {
    const pages = [];
    for (let i = 1; i <= totalPages; i += 1) {
      pages.push(i);
    }
    return pages;
  }, [totalPages]);

  return (
    <div className="history-shell">
      <aside className="history-sidebar">
        <div className="history-brand">
          <div className="history-brand-mark">CC</div>
          <span>CarbonCalc</span>
        </div>

        <nav className="history-nav">
          <button type="button" className="history-nav-item" onClick={handleNavigateDashboard}>
            Dashboard
          </button>
          <button type="button" className="history-nav-item" onClick={handleNavigateSurvey}>
            Lifestyle Survey
          </button>
          <button type="button" className="history-nav-item active">
            Carbon History
          </button>
        </nav>

        <div className="history-side-footer">
          <button type="button" className="history-side-link" onClick={handleNavigateDashboard}>
            Settings
          </button>
          <button type="button" className="history-side-link danger" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </aside>

      <main className="history-main">
        <header className="history-topbar">
          <div className="history-search-wrap">
            <input
              type="text"
              className="history-search-input"
              placeholder="Search logs or data..."
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
            />
          </div>

          <div className="history-user-area">
            <span className="history-bell" aria-hidden="true">
              !
            </span>
            <div className="history-user-meta">
              <strong>{userName}</strong>
              <small>Eco Warrior</small>
            </div>
            <div className="history-user-avatar">{(userName || 'U').charAt(0).toUpperCase()}</div>
          </div>
        </header>

        <section className="history-content">
          <div className="history-title-row">
            <div>
              <h1>Carbon History</h1>
              <p>Analyze your environmental progress and historical log data.</p>
            </div>
            <div className="history-action-group">
              <button
                type="button"
                className="history-btn secondary"
                onClick={handleExportCsv}
                disabled={!filteredLogs.length}
              >
                Export CSV
              </button>
              <button type="button" className="history-btn primary" onClick={handleNavigateDashboard}>
                Update Profile
              </button>
            </div>
          </div>

          <div className="history-filter-row">
            <div className="history-date-range">
              <label>
                From
                <input
                  type="date"
                  value={fromDate}
                  max={toDate || undefined}
                  onChange={(event) => setFromDate(event.target.value)}
                />
              </label>
              <label>
                To
                <input
                  type="date"
                  value={toDate}
                  min={fromDate || undefined}
                  onChange={(event) => setToDate(event.target.value)}
                />
              </label>
            </div>

            <div className="history-category-tabs">
              {CATEGORY_FILTERS.map((category) => (
                <button
                  key={category}
                  type="button"
                  className={`history-pill ${activeCategory === category ? 'active' : ''}`}
                  onClick={() => setActiveCategory(category)}
                >
                  {category === 'all'
                    ? 'All Categories'
                    : category.charAt(0).toUpperCase() + category.slice(1)}
                </button>
              ))}
            </div>

            <div className="history-view-toggle">
              <button
                type="button"
                className={viewMode === 'table' ? 'active' : ''}
                onClick={() => setViewMode('table')}
              >
                Table View
              </button>
              <button
                type="button"
                className={viewMode === 'trend' ? 'active' : ''}
                onClick={() => setViewMode('trend')}
              >
                Trend Chart
              </button>
            </div>
          </div>

          <article className="history-card">
            <div className="history-card-head">
              <div>
                <h2>Detailed Logs</h2>
                <p>
                  Showing {pagedLogs.length} of {filteredLogs.length} total records
                </p>
              </div>
              <p className={`history-efficiency ${efficiencyStats.positive ? 'positive' : 'negative'}`}>
                {efficiencyStats.label}
              </p>
            </div>

            {loading && <div className="history-state">Loading carbon history...</div>}
            {!loading && error && <div className="history-state error">{error}</div>}
            {!loading && !error && filteredLogs.length === 0 && (
              <div className="history-state">No logs found for the selected filters.</div>
            )}

            {!loading && !error && filteredLogs.length > 0 && viewMode === 'table' && (
              <>
                <div className="history-table-wrap">
                  <table className="history-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Transport (kg)</th>
                        <th>Food (kg)</th>
                        <th>Energy (kg)</th>
                        <th>Total (kg)</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pagedLogs.map((log) => {
                        const rowExpanded = expandedLogDate === log.logDate;
                        const total = log.totalEmission || 1;
                        return (
                          <React.Fragment key={log.logDate}>
                            <tr>
                              <td>{formatDate(log.logDate)}</td>
                              <td>{formatNumber(log.transportEmission)}</td>
                              <td>{formatNumber(log.foodEmission)}</td>
                              <td>{formatNumber(log.energyEmission)}</td>
                              <td className="total-cell">{formatNumber(log.totalEmission)}</td>
                              <td>
                                <button
                                  type="button"
                                  className="history-link-btn"
                                  onClick={() =>
                                    setExpandedLogDate((prev) => (prev === log.logDate ? null : log.logDate))
                                  }
                                >
                                  {rowExpanded ? 'Hide Details' : 'View Details'}
                                </button>
                              </td>
                            </tr>
                            {rowExpanded && (
                              <tr className="history-details-row">
                                <td colSpan={6}>
                                  <div className="history-details-grid">
                                    <div>
                                      <span>Transport share</span>
                                      <strong>{((log.transportEmission / total) * 100).toFixed(1)}%</strong>
                                    </div>
                                    <div>
                                      <span>Food share</span>
                                      <strong>{((log.foodEmission / total) * 100).toFixed(1)}%</strong>
                                    </div>
                                    <div>
                                      <span>Energy share</span>
                                      <strong>{((log.energyEmission / total) * 100).toFixed(1)}%</strong>
                                    </div>
                                    <div>
                                      <span>Logged date</span>
                                      <strong>{formatDate(log.logDate)}</strong>
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="history-pagination">
                  <span>
                    Showing {(currentPage - 1) * PAGE_SIZE + 1}-
                    {Math.min(currentPage * PAGE_SIZE, filteredLogs.length)} of {filteredLogs.length} entries
                  </span>
                  <div>
                    <button
                      type="button"
                      onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                    >
                      Prev
                    </button>
                    {pageButtons.map((page) => (
                      <button
                        key={page}
                        type="button"
                        className={page === currentPage ? 'active' : ''}
                        onClick={() => setCurrentPage(page)}
                      >
                        {page}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </button>
                  </div>
                </div>
              </>
            )}

            {!loading && !error && filteredLogs.length > 0 && viewMode === 'trend' && (
              <div className="history-trend-wrap">
                <Line data={trendChartData} options={trendChartOptions} />
              </div>
            )}
          </article>

          <div className="history-summary-grid">
            <article className="history-summary-card">
              <span>Average Monthly</span>
              <strong>{summaryStats.averageMonthly.toFixed(1)} kg CO2e</strong>
            </article>
            <article className="history-summary-card">
              <span>Best Category</span>
              <strong>{summaryStats.bestCategory}</strong>
            </article>
            <article className="history-summary-card">
              <span>Total Audited</span>
              <strong>{summaryStats.totalAudited.toFixed(1)} kg</strong>
            </article>
          </div>
        </section>
      </main>
    </div>
  );
}
