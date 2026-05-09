import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bar, Pie, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import '../styles/AdminDashboard.css';
import { adminAPI, extractApiErrorMessage } from '../services/api';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Tooltip, Legend);

const TABS = [
  { id: 'users', label: 'User Management' },
  { id: 'surveys', label: 'Survey Monitoring' },
  { id: 'logs', label: 'Carbon Logs' },
  { id: 'factors', label: 'Emission Factors' },
  { id: 'analytics', label: 'Analytics Dashboard' },
  { id: 'badges', label: 'Badge & Rewards' },
];

function byText(source, text) {
  if (!text.trim()) return true;
  return source.toLowerCase().includes(text.trim().toLowerCase());
}

function csvDownload(csvText, fileName) {
  const blob = new Blob([csvText], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export default function AdminHomePage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('users');
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState('');

  const [analytics, setAnalytics] = useState(null);
  const [users, setUsers] = useState([]);
  const [surveyRows, setSurveyRows] = useState([]);
  const [carbonLogs, setCarbonLogs] = useState([]);
  const [factors, setFactors] = useState([]);
  const [badgeDefs, setBadgeDefs] = useState([]);

  const [userSearch, setUserSearch] = useState('');
  const [surveySearch, setSurveySearch] = useState('');
  const [logSearch, setLogSearch] = useState('');
  const [editingLogId, setEditingLogId] = useState(null);
  const [logEdit, setLogEdit] = useState({ transportEmission: '', foodEmission: '', energyEmission: '' });

  const [factorForm, setFactorForm] = useState({
    category: 'transport',
    factorKey: '',
    factorValue: '',
    unit: 'kg CO2e/km',
    description: '',
  });

  const [badgeForm, setBadgeForm] = useState({
    id: null,
    badgeName: '',
    badgeType: 'ACHIEVEMENT',
    description: '',
    thresholdPercent: '',
    active: true,
  });

  const [assignForm, setAssignForm] = useState({ userId: '', badgeDefinitionId: '', reason: '' });
  const [performanceThreshold, setPerformanceThreshold] = useState('10');

  const notify = useCallback((msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  }, []);

  const ensureAdmin = useCallback(() => {
    const token = localStorage.getItem('auth_token');
    const raw = localStorage.getItem('current_user');

    if (!token || !raw) {
      navigate('/admin/login', { replace: true });
      return null;
    }

    try {
      const session = JSON.parse(raw);
      if ((session.role || '').toUpperCase() !== 'ADMIN') {
        navigate('/admin/login', { replace: true });
        return null;
      }
      return session;
    } catch {
      navigate('/admin/login', { replace: true });
      return null;
    }
  }, [navigate]);

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [analyticsRes, usersRes, surveysRes, logsRes, factorsRes, badgeDefsRes] = await Promise.all([
        adminAPI.getAnalytics(6),
        adminAPI.getUsers(),
        adminAPI.getSurveyMonitoring(),
        adminAPI.getCarbonLogs(),
        adminAPI.getEmissionFactors(),
        adminAPI.getBadgeDefinitions(),
      ]);

      setAnalytics(analyticsRes);
      setUsers(Array.isArray(usersRes) ? usersRes : []);
      setSurveyRows(Array.isArray(surveysRes) ? surveysRes : []);
      setCarbonLogs(Array.isArray(logsRes) ? logsRes : []);
      setFactors(Array.isArray(factorsRes) ? factorsRes : []);
      setBadgeDefs(Array.isArray(badgeDefsRes) ? badgeDefsRes : []);
    } catch (error) {
      notify(extractApiErrorMessage(error, 'Failed to load admin data'));
    } finally {
      setLoading(false);
    }
  }, [notify]);

  useEffect(() => {
    const admin = ensureAdmin();
    if (!admin) return;
    loadAll();
  }, [ensureAdmin, loadAll]);

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('current_user');
    navigate('/admin/login', { replace: true });
  };

  const filteredUsers = useMemo(
    () => users.filter((u) => byText(`${u.name} ${u.email}`, userSearch)),
    [users, userSearch]
  );

  const filteredSurveys = useMemo(
    () => surveyRows.filter((s) => byText(`${s.userName} ${s.userEmail} ${s.transportMode} ${s.issueReason || ''}`, surveySearch)),
    [surveyRows, surveySearch]
  );

  const filteredLogs = useMemo(
    () => carbonLogs.filter((l) => byText(`${l.userName} ${l.userEmail} ${l.logDate}`, logSearch)),
    [carbonLogs, logSearch]
  );

  const chartBreakdown = useMemo(() => {
    const breakdown = analytics?.categoryBreakdown || [];
    return {
      labels: breakdown.map((item) => item.category),
      datasets: [
        {
          data: breakdown.map((item) => Number(item.total || 0)),
          backgroundColor: ['#2d7a4f', '#e8a624', '#4a90d9'],
        },
      ],
    };
  }, [analytics]);

  const chartTrend = useMemo(() => {
    const trend = analytics?.monthlyTrend || [];
    return {
      labels: trend.map((item) => item.month),
      datasets: [
        {
          label: 'Monthly Emissions (kg CO2e)',
          data: trend.map((item) => Number(item.total || 0)),
          borderColor: '#2d7a4f',
          backgroundColor: 'rgba(45, 122, 79, 0.2)',
          fill: true,
          tension: 0.3,
        },
      ],
    };
  }, [analytics]);

  const isLargeViewport = typeof window !== 'undefined'
    && window.matchMedia('(min-width: 1600px)').matches;

  const handleUserStatus = async (userId, active) => {
    try {
      const updated = await adminAPI.updateUserStatus(userId, active);
      setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
      notify(`User ${active ? 'activated' : 'deactivated'}`);
    } catch (error) {
      notify(extractApiErrorMessage(error, 'Failed to update user status'));
    }
  };

  const handleExportLogs = async () => {
    try {
      const csv = await adminAPI.exportCarbonLogs();
      csvDownload(csv, `admin-carbon-logs-${new Date().toISOString().slice(0, 10)}.csv`);
      notify('Carbon logs exported');
    } catch (error) {
      notify(extractApiErrorMessage(error, 'Export failed'));
    }
  };

  const handleDeleteLog = async (logId) => {
    try {
      await adminAPI.deleteCarbonLog(logId);
      setCarbonLogs((prev) => prev.filter((log) => log.id !== logId));
      notify('Carbon log deleted');
    } catch (error) {
      notify(extractApiErrorMessage(error, 'Failed to delete log'));
    }
  };

  const startEditLog = (log) => {
    setEditingLogId(log.id);
    setLogEdit({
      transportEmission: String(Number(log.transportEmission || 0)),
      foodEmission: String(Number(log.foodEmission || 0)),
      energyEmission: String(Number(log.energyEmission || 0)),
    });
  };

  const cancelEditLog = () => {
    setEditingLogId(null);
    setLogEdit({ transportEmission: '', foodEmission: '', energyEmission: '' });
  };

  const saveLogUpdate = async (logId) => {
    const transport = Number(logEdit.transportEmission);
    const food = Number(logEdit.foodEmission);
    const energy = Number(logEdit.energyEmission);

    if ([transport, food, energy].some((value) => Number.isNaN(value) || value < 0)) {
      notify('Emission values must be valid non-negative numbers');
      return;
    }

    try {
      const updated = await adminAPI.updateCarbonLog(logId, {
        transportEmission: transport,
        foodEmission: food,
        energyEmission: energy,
      });

      setCarbonLogs((prev) => prev.map((log) => (log.id === updated.id ? updated : log)));
      cancelEditLog();
      notify('Carbon log updated');
    } catch (error) {
      notify(extractApiErrorMessage(error, 'Failed to update carbon log'));
    }
  };

  const handleFactorUpsert = async (e) => {
    e.preventDefault();
    if (!factorForm.factorKey || !factorForm.factorValue) {
      notify('Factor key and value are required');
      return;
    }

    const payload = {
      category: factorForm.category,
      factorKey: factorForm.factorKey,
      factorValue: Number(factorForm.factorValue),
      unit: factorForm.unit,
      description: factorForm.description,
    };

    try {
      await adminAPI.upsertEmissionFactor(payload);
      notify('Emission factor saved');
      setFactorForm({ category: 'transport', factorKey: '', factorValue: '', unit: 'kg CO2e/km', description: '' });
      const all = await adminAPI.getEmissionFactors();
      setFactors(Array.isArray(all) ? all : []);
    } catch (error) {
      notify(extractApiErrorMessage(error, 'Failed to save factor'));
    }
  };

  const handleBadgeSave = async (e) => {
    e.preventDefault();
    if (!badgeForm.badgeName || !badgeForm.badgeType) {
      notify('Badge name and type are required');
      return;
    }

    try {
      await adminAPI.upsertBadgeDefinition({
        id: badgeForm.id,
        badgeName: badgeForm.badgeName,
        badgeType: badgeForm.badgeType,
        description: badgeForm.description,
        thresholdPercent: badgeForm.thresholdPercent === '' ? null : Number(badgeForm.thresholdPercent),
        active: !!badgeForm.active,
      });
      notify('Badge definition saved');
      setBadgeForm({ id: null, badgeName: '', badgeType: 'ACHIEVEMENT', description: '', thresholdPercent: '', active: true });
      const all = await adminAPI.getBadgeDefinitions();
      setBadgeDefs(Array.isArray(all) ? all : []);
    } catch (error) {
      notify(extractApiErrorMessage(error, 'Failed to save badge definition'));
    }
  };

  const handleAssignBadge = async () => {
    if (!assignForm.userId || !assignForm.badgeDefinitionId) {
      notify('Select user and badge definition');
      return;
    }

    try {
      const data = await adminAPI.assignBadge({
        userId: Number(assignForm.userId),
        badgeDefinitionId: Number(assignForm.badgeDefinitionId),
        reason: assignForm.reason,
      });
      notify(data?.message || 'Badge assigned');
      setAssignForm({ userId: '', badgeDefinitionId: '', reason: '' });
    } catch (error) {
      notify(extractApiErrorMessage(error, 'Failed to assign badge'));
    }
  };

  const handleAssignByPerformance = async () => {
    const minReduction = Number(performanceThreshold);
    if (Number.isNaN(minReduction) || minReduction < 0) {
      notify('Good score threshold must be a valid non-negative number');
      return;
    }

    try {
      const data = await adminAPI.assignByPerformance(minReduction);
      notify(`Good-score assignment done (${data.assignedCount || 0} assigned)`);
    } catch (error) {
      notify(extractApiErrorMessage(error, 'Failed to run performance assignment'));
    }
  };

  const renderUsers = () => (
    <section className="admin-card">
      <h2>User Management</h2>
      <p className="admin-card-desc">View all users and activate/deactivate accounts.</p>

      <div className="admin-toolbar">
        <input
          className="admin-input"
          placeholder="Search by name/email"
          value={userSearch}
          onChange={(e) => setUserSearch(e.target.value)}
        />
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
              <th>Provider</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((u) => (
              <tr key={u.id}>
                <td>{u.id}</td>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td>{u.role}</td>
                <td>
                  <span className={`admin-badge ${u.active ? 'admin-badge-ok' : 'admin-badge-off'}`}>
                    {u.active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td>{u.oauthProvider || 'LOCAL'}</td>
                <td>
                  <button
                    className={`admin-btn ${u.active ? 'admin-btn-danger' : 'admin-btn-primary'}`}
                    onClick={() => handleUserStatus(u.id, !u.active)}
                    disabled={(u.role || '').toUpperCase() === 'ADMIN'}
                  >
                    {u.active ? 'Deactivate' : 'Activate'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );

  const renderSurveys = () => (
    <section className="admin-card">
      <h2>Survey Monitoring</h2>
      <p className="admin-card-desc">Detect unrealistic or incorrect survey submissions.</p>

      <div className="admin-toolbar">
        <input
          className="admin-input"
          placeholder="Search survey rows"
          value={surveySearch}
          onChange={(e) => setSurveySearch(e.target.value)}
        />
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>User</th>
              <th>Transport</th>
              <th>Distance</th>
              <th>Electricity</th>
              <th>Total Emission</th>
              <th>Flag</th>
            </tr>
          </thead>
          <tbody>
            {filteredSurveys.map((row) => (
              <tr key={row.surveyId}>
                <td>{row.surveyDate}</td>
                <td>{row.userName}</td>
                <td>{row.transportMode}</td>
                <td>{Number(row.distanceKmPerDay || 0).toFixed(2)} km/day</td>
                <td>{Number(row.electricityKwhPerMonth || 0).toFixed(2)} kWh/mo</td>
                <td>{Number(row.totalEmission || 0).toFixed(2)} kg</td>
                <td>
                  {row.unrealistic ? (
                    <span className="admin-badge admin-badge-warn">{row.issueReason || 'Flagged'}</span>
                  ) : (
                    <span className="admin-badge admin-badge-ok">Valid</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );

  const renderLogs = () => (
    <section className="admin-card">
      <h2>Carbon Logs Management</h2>
      <p className="admin-card-desc">Review emission history and export admin reports.</p>

      <div className="admin-toolbar">
        <input
          className="admin-input"
          placeholder="Search carbon logs"
          value={logSearch}
          onChange={(e) => setLogSearch(e.target.value)}
        />
        <button className="admin-btn admin-btn-primary" onClick={handleExportLogs}>Export CSV</button>
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>User</th>
              <th>Transport</th>
              <th>Food</th>
              <th>Energy</th>
              <th>Total</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredLogs.map((log) => (
              <tr key={log.id}>
                <td>{log.logDate}</td>
                <td>{log.userName}</td>
                <td>
                  {editingLogId === log.id ? (
                    <input
                      className="admin-input admin-input-sm"
                      type="number"
                      min="0"
                      step="0.01"
                      value={logEdit.transportEmission}
                      onChange={(e) => setLogEdit((prev) => ({ ...prev, transportEmission: e.target.value }))}
                    />
                  ) : (
                    Number(log.transportEmission || 0).toFixed(2)
                  )}
                </td>
                <td>
                  {editingLogId === log.id ? (
                    <input
                      className="admin-input admin-input-sm"
                      type="number"
                      min="0"
                      step="0.01"
                      value={logEdit.foodEmission}
                      onChange={(e) => setLogEdit((prev) => ({ ...prev, foodEmission: e.target.value }))}
                    />
                  ) : (
                    Number(log.foodEmission || 0).toFixed(2)
                  )}
                </td>
                <td>
                  {editingLogId === log.id ? (
                    <input
                      className="admin-input admin-input-sm"
                      type="number"
                      min="0"
                      step="0.01"
                      value={logEdit.energyEmission}
                      onChange={(e) => setLogEdit((prev) => ({ ...prev, energyEmission: e.target.value }))}
                    />
                  ) : (
                    Number(log.energyEmission || 0).toFixed(2)
                  )}
                </td>
                <td>{Number(log.totalEmission || 0).toFixed(2)}</td>
                <td>
                  {editingLogId === log.id ? (
                    <>
                      <button className="admin-btn admin-btn-primary" onClick={() => saveLogUpdate(log.id)}>
                        Save
                      </button>{' '}
                      <button className="admin-btn" onClick={cancelEditLog}>
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button className="admin-btn" onClick={() => startEditLog(log)}>
                        Edit
                      </button>{' '}
                      <button className="admin-btn admin-btn-danger" onClick={() => handleDeleteLog(log.id)}>
                        Delete
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );

  const renderFactors = () => (
    <section className="admin-card">
      <h2>Emission Factor Management</h2>
      <p className="admin-card-desc">Update transport, food, and energy factors without code changes.</p>

      <div className="admin-grid-2">
        <form className="admin-card" onSubmit={handleFactorUpsert}>
          <h2>Create / Update Factor</h2>
          <div className="admin-form-grid">
            <select
              className="admin-select"
              value={factorForm.category}
              onChange={(e) => setFactorForm((prev) => ({ ...prev, category: e.target.value }))}
            >
              <option value="transport">transport</option>
              <option value="food">food</option>
              <option value="energy">energy</option>
            </select>
            <input
              className="admin-input"
              placeholder="factor key (e.g. car, non_veg)"
              value={factorForm.factorKey}
              onChange={(e) => setFactorForm((prev) => ({ ...prev, factorKey: e.target.value }))}
            />
            <input
              className="admin-input"
              placeholder="value"
              type="number"
              step="0.000001"
              value={factorForm.factorValue}
              onChange={(e) => setFactorForm((prev) => ({ ...prev, factorValue: e.target.value }))}
            />
            <input
              className="admin-input"
              placeholder="unit"
              value={factorForm.unit}
              onChange={(e) => setFactorForm((prev) => ({ ...prev, unit: e.target.value }))}
            />
          </div>
          <textarea
            className="admin-textarea"
            placeholder="Description"
            value={factorForm.description}
            onChange={(e) => setFactorForm((prev) => ({ ...prev, description: e.target.value }))}
          />
          <div className="admin-toolbar">
            <button className="admin-btn admin-btn-primary" type="submit">Save Factor</button>
          </div>
        </form>

        <div className="admin-card">
          <h2>Current Factors</h2>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Key</th>
                  <th>Value</th>
                  <th>Unit</th>
                </tr>
              </thead>
              <tbody>
                {factors.map((factor) => (
                  <tr key={factor.id || `${factor.category}-${factor.factorKey}`}>
                    <td>{factor.category}</td>
                    <td>{factor.factorKey}</td>
                    <td>{Number(factor.factorValue || 0).toFixed(6)}</td>
                    <td>{factor.unit || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );

  const renderAnalytics = () => (
    <section className="admin-card">
      <h2>Analytics Dashboard</h2>
      <p className="admin-card-desc">Global emissions overview and sustainability trend tracking.</p>

      <div className="admin-chart-grid">
        <div className="admin-chart-box">
          <h3>Category-wise Breakdown</h3>
          {(analytics?.categoryBreakdown || []).length ? (
            <div className="admin-chart-canvas admin-chart-canvas-pie">
              <Pie
                data={chartBreakdown}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'top',
                      labels: {
                        boxWidth: isLargeViewport ? 18 : 14,
                        padding: isLargeViewport ? 18 : 14,
                        font: {
                          size: isLargeViewport ? 14 : 11,
                        },
                      },
                    },
                  },
                }}
              />
            </div>
          ) : (
            <div className="admin-empty">No breakdown data</div>
          )}
        </div>

        <div className="admin-chart-box">
          <h3>Monthly Carbon Trend</h3>
          {(analytics?.monthlyTrend || []).length ? (
            <div className="admin-chart-canvas admin-chart-canvas-line">
              <Line
                data={chartTrend}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { display: false } },
                  elements: {
                    line: { tension: 0.35, borderWidth: 3 },
                    point: {
                      radius: isLargeViewport ? 4 : 3,
                      hoverRadius: isLargeViewport ? 6 : 5,
                    },
                  },
                  scales: {
                    x: {
                      grid: { display: false },
                      ticks: {
                        font: { size: isLargeViewport ? 13 : 11 },
                      },
                    },
                    y: {
                      beginAtZero: true,
                      ticks: {
                        font: { size: isLargeViewport ? 13 : 11 },
                      },
                    },
                  },
                }}
              />
            </div>
          ) : (
            <div className="admin-empty">No trend data</div>
          )}
        </div>
      </div>

      <div className="admin-card" style={{ marginTop: 10 }}>
        <h2>Platform Metrics</h2>
        <div className="admin-chart-canvas admin-chart-canvas-bar">
          <Bar
            data={{
              labels: ['Users', 'Active Users', 'Surveys', 'Carbon Logs'],
              datasets: [
                {
                  label: 'Count',
                  data: [
                    Number(analytics?.totalUsers || 0),
                    Number(analytics?.activeUsers || 0),
                    Number(analytics?.totalSurveys || 0),
                    Number(analytics?.totalCarbonLogs || 0),
                  ],
                  backgroundColor: ['#2d7a4f', '#5aaa72', '#e8a624', '#4a90d9'],
                  borderRadius: 8,
                  maxBarThickness: isLargeViewport ? 72 : 58,
                },
              ],
            }}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: { legend: { display: false } },
              scales: {
                x: {
                  grid: { display: false },
                  ticks: { font: { size: isLargeViewport ? 13 : 11 } },
                },
                y: {
                  beginAtZero: true,
                  ticks: {
                    precision: 0,
                    font: { size: isLargeViewport ? 13 : 11 },
                  },
                },
              },
            }}
          />
        </div>
      </div>
    </section>
  );

  const renderBadges = () => (
    <section className="admin-card">
      <h2>Badge & Reward Management</h2>
      <p className="admin-card-desc">Create eco-badges and assign them manually or by reduction performance.</p>

      <div className="admin-grid-2">
        <form className="admin-card" onSubmit={handleBadgeSave}>
          <h2>Create / Update Badge</h2>
          <div className="admin-form-grid">
            <input
              className="admin-input"
              placeholder="Badge name"
              value={badgeForm.badgeName}
              onChange={(e) => setBadgeForm((prev) => ({ ...prev, badgeName: e.target.value }))}
            />
            <input
              className="admin-input"
              placeholder="Badge type"
              value={badgeForm.badgeType}
              onChange={(e) => setBadgeForm((prev) => ({ ...prev, badgeType: e.target.value }))}
            />
            <input
              className="admin-input"
              type="number"
              step="0.01"
              placeholder="Threshold %"
              value={badgeForm.thresholdPercent}
              onChange={(e) => setBadgeForm((prev) => ({ ...prev, thresholdPercent: e.target.value }))}
            />
            <select
              className="admin-select"
              value={badgeForm.active ? 'true' : 'false'}
              onChange={(e) => setBadgeForm((prev) => ({ ...prev, active: e.target.value === 'true' }))}
            >
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>
          <textarea
            className="admin-textarea"
            placeholder="Description"
            value={badgeForm.description}
            onChange={(e) => setBadgeForm((prev) => ({ ...prev, description: e.target.value }))}
          />
          <div className="admin-toolbar">
            <button className="admin-btn admin-btn-primary" type="submit">Save Badge</button>
            <button
              className="admin-btn"
              type="button"
              onClick={() => setBadgeForm({ id: null, badgeName: '', badgeType: 'ACHIEVEMENT', description: '', thresholdPercent: '', active: true })}
            >
              Reset
            </button>
          </div>
        </form>

        <div className="admin-card">
          <h2>Assign Rewards</h2>
          <div className="admin-assign-row">
            <select
              className="admin-select"
              value={assignForm.userId}
              onChange={(e) => setAssignForm((prev) => ({ ...prev, userId: e.target.value }))}
            >
              <option value="">Select user</option>
              {users
                .filter((u) => (u.role || '').toUpperCase() === 'USER')
                .map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.email})
                  </option>
                ))}
            </select>

            <select
              className="admin-select"
              value={assignForm.badgeDefinitionId}
              onChange={(e) => setAssignForm((prev) => ({ ...prev, badgeDefinitionId: e.target.value }))}
            >
              <option value="">Select badge</option>
              {badgeDefs.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.badgeName}
                </option>
              ))}
            </select>
          </div>

          <textarea
            className="admin-textarea"
            placeholder="Assignment reason"
            value={assignForm.reason}
            onChange={(e) => setAssignForm((prev) => ({ ...prev, reason: e.target.value }))}
          />

          <div className="admin-toolbar">
            <button className="admin-btn admin-btn-primary" onClick={handleAssignBadge}>Assign Badge</button>
            <input
              className="admin-input admin-input-sm admin-threshold-input"
              type="number"
              min="0"
              step="1"
              value={performanceThreshold}
              onChange={(e) => setPerformanceThreshold(e.target.value)}
              placeholder="Good score threshold %"
            />
            <button className="admin-btn" onClick={handleAssignByPerformance}>Assign by Good Score</button>
          </div>

          <div className="admin-table-wrap" style={{ marginTop: 8 }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Type</th>
                  <th>Threshold %</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {badgeDefs.map((badge) => (
                  <tr key={badge.id}>
                    <td>{badge.badgeName}</td>
                    <td>{badge.badgeType}</td>
                    <td>{badge.thresholdPercent ?? '-'}</td>
                    <td>
                      <span className={`admin-badge ${badge.active ? 'admin-badge-ok' : 'admin-badge-off'}`}>
                        {badge.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <button
                        className="admin-btn"
                        onClick={() =>
                          setBadgeForm({
                            id: badge.id,
                            badgeName: badge.badgeName,
                            badgeType: badge.badgeType,
                            description: badge.description || '',
                            thresholdPercent: badge.thresholdPercent ?? '',
                            active: !!badge.active,
                          })
                        }
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );

  const renderActiveTab = () => {
    if (activeTab === 'users') return renderUsers();
    if (activeTab === 'surveys') return renderSurveys();
    if (activeTab === 'logs') return renderLogs();
    if (activeTab === 'factors') return renderFactors();
    if (activeTab === 'analytics') return renderAnalytics();
    if (activeTab === 'badges') return renderBadges();
    return null;
  };

  return (
    <div className="admin-page">
      <header className="admin-topbar">
        <div className="admin-logo">
          <span>🌿</span>
          <span>CarbonCalc Admin</span>
        </div>

        <div className="admin-topbar-actions">
          <button className="admin-btn" onClick={loadAll}>Refresh</button>
          <button className="admin-btn" onClick={() => navigate('/home')}>User Dashboard</button>
          <button className="admin-btn admin-btn-danger" onClick={handleLogout}>Logout</button>
        </div>
      </header>

      <div className="admin-layout">
        <section className="admin-hero">
          <h1>Platform Administration Center</h1>
          <p>Manage users, monitor survey quality, maintain emission factors, and drive sustainable behavior with rewards.</p>

          <div className="admin-kpis">
            <div className="admin-kpi">
              <strong>{Number(analytics?.totalPlatformEmissions || 0).toFixed(2)} kg</strong>
              <span>Total Platform Emissions</span>
            </div>
            <div className="admin-kpi">
              <strong>{analytics?.totalUsers || 0}</strong>
              <span>Total Users</span>
            </div>
            <div className="admin-kpi">
              <strong>{analytics?.activeUsers || 0}</strong>
              <span>Active Users</span>
            </div>
            <div className="admin-kpi">
              <strong>{analytics?.totalCarbonLogs || 0}</strong>
              <span>Carbon Logs</span>
            </div>
          </div>
        </section>

        <div className="admin-tabs">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              className={`admin-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {loading ? <div className="admin-card"><div className="admin-empty">Loading admin data...</div></div> : renderActiveTab()}
      </div>

      {toast && <div className="admin-toast">{toast}</div>}
    </div>
  );
}
