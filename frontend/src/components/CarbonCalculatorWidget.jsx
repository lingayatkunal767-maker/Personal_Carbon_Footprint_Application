import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { carbonLogAPI } from '../services/api';

const LATEST_CALCULATION_KEY = 'latest_carbon_calculation';
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8081/api';

function parseLog(log) {
  return {
    logDate: log.logDate,
    transportEmission: Number(log.transportEmission || 0),
    foodEmission: Number(log.foodEmission || 0),
    energyEmission: Number(log.energyEmission || 0),
    totalEmission: Number(log.totalEmission || 0),
    updatedAt: log.updatedAt || null,
  };
}

function parseDateForSort(dateStr) {
  if (!dateStr) return Number.NEGATIVE_INFINITY;
  const parsed = new Date(dateStr).getTime();
  return Number.isNaN(parsed) ? Number.NEGATIVE_INFINITY : parsed;
}

function readLatestCalculationSnapshot(resolvedUserId) {
  const raw = localStorage.getItem(LATEST_CALCULATION_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw);
    if (!parsed || Number(parsed.userId) !== Number(resolvedUserId) || !parsed.logDate) {
      return null;
    }

    return {
      logDate: parsed.logDate,
      transportEmission: Number(parsed.transportEmission || 0),
      foodEmission: Number(parsed.foodEmission || 0),
      energyEmission: Number(parsed.energyEmission || 0),
      totalEmission: Number(parsed.totalEmission || 0),
      updatedAt: parsed.updatedAt || null,
    };
  } catch {
    return null;
  }
}

function withLatestSnapshot(logs, snapshot) {
  if (!snapshot) return logs;

  const snapshotDate = snapshot.logDate;
  let merged = logs;
  const existingIdx = logs.findIndex((item) => item.logDate === snapshotDate);

  if (existingIdx >= 0) {
    merged = logs.map((item, idx) => (idx === existingIdx ? { ...item, ...snapshot } : item));
  } else {
    merged = [snapshot, ...logs];
  }

  return [...merged].sort((a, b) => {
    const dateDiff = parseDateForSort(b.logDate) - parseDateForSort(a.logDate);
    if (dateDiff !== 0) return dateDiff;
    return parseDateForSort(b.updatedAt) - parseDateForSort(a.updatedAt);
  });
}

function normalizeUserId(candidate) {
  const parsed = Number(candidate);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

async function resolveUserId(initialUserId) {
  const normalizedInitialId = normalizeUserId(initialUserId);
  if (normalizedInitialId) return normalizedInitialId;

  const stored = localStorage.getItem('current_user');
  if (!stored) return null;

  try {
    const session = JSON.parse(stored);
    const normalizedSessionId = normalizeUserId(session?.id);
    if (normalizedSessionId) {
      return normalizedSessionId;
    }

    if (session?.email) {
      const response = await fetch(`${API_BASE}/users/email/${encodeURIComponent(session.email)}`);
      if (!response.ok) return null;

      const user = await response.json();
      const normalizedFetchedId = normalizeUserId(user?.id);
      if (!normalizedFetchedId) return null;

      const merged = { ...session, id: normalizedFetchedId };
      localStorage.setItem('current_user', JSON.stringify(merged));
      return normalizedFetchedId;
    }
  } catch {
    return null;
  }

  return null;
}

function formatKg(value) {
  return `${Number(value || 0).toFixed(2)} kg CO2e`;
}

function formatDate(value) {
  if (!value) return '-';
  const date = new Date(value);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

const CarbonCalculatorWidget = ({ userId }) => {
  const navigate = useNavigate();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeUserId, setActiveUserId] = useState(null);
  const [editingDate, setEditingDate] = useState(null);
  const [editForm, setEditForm] = useState({ transportEmission: '', foodEmission: '', energyEmission: '' });
  const [rowActionBusy, setRowActionBusy] = useState(false);
  const [showAllHistory, setShowAllHistory] = useState(false);

  const loadLogs = useCallback(async () => {
    const resolvedUserId = await resolveUserId(userId);

    if (!resolvedUserId) {
      setActiveUserId(null);
      setLoading(false);
      setLogs([]);
      setError('Unable to identify your account. Please login again.');
      return;
    }

    setActiveUserId(resolvedUserId);
    setLoading(true);
    setError('');
    try {
      const response = await carbonLogAPI.getCarbonLogs(resolvedUserId);
      const mapped = Array.isArray(response) ? response.map(parseLog) : [];
      const snapshot = readLatestCalculationSnapshot(resolvedUserId);
      setLogs(withLatestSnapshot(mapped, snapshot));
    } catch (err) {
      setError(err.message || 'Unable to load saved footprint history.');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  useEffect(() => {
    const handleFocusRefresh = () => {
      loadLogs();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        loadLogs();
      }
    };

    const handleStorage = (event) => {
      if (event.key === 'current_user' || event.key === LATEST_CALCULATION_KEY) {
        loadLogs();
      }
    };

    window.addEventListener('focus', handleFocusRefresh);
    window.addEventListener('storage', handleStorage);
    window.addEventListener('carbon-log-updated', handleFocusRefresh);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    const refreshTimer = window.setInterval(loadLogs, 30000);

    return () => {
      window.removeEventListener('focus', handleFocusRefresh);
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('carbon-log-updated', handleFocusRefresh);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.clearInterval(refreshTimer);
    };
  }, [loadLogs]);

  const handleStartEdit = (log) => {
    setEditingDate(log.logDate);
    setEditForm({
      transportEmission: Number(log.transportEmission).toFixed(2),
      foodEmission: Number(log.foodEmission).toFixed(2),
      energyEmission: Number(log.energyEmission).toFixed(2),
    });
    setError('');
  };

  const handleCancelEdit = () => {
    setEditingDate(null);
    setEditForm({ transportEmission: '', foodEmission: '', energyEmission: '' });
  };

  const handleSaveEdit = async (logDate) => {
    if (!activeUserId) {
      setError('Unable to identify current user for this action.');
      return;
    }

    const transport = Number(editForm.transportEmission);
    const food = Number(editForm.foodEmission);
    const energy = Number(editForm.energyEmission);

    if ([transport, food, energy].some((value) => Number.isNaN(value) || value < 0)) {
      setError('Please enter valid non-negative values for transport, food, and energy.');
      return;
    }

    setRowActionBusy(true);
    setError('');
    try {
      await carbonLogAPI.updateCarbonLogByDate(activeUserId, logDate, {
        transportEmission: transport,
        foodEmission: food,
        energyEmission: energy,
      });
      handleCancelEdit();
      await loadLogs();
    } catch (err) {
      setError(err.message || 'Unable to update this history entry.');
    } finally {
      setRowActionBusy(false);
    }
  };

  const handleDelete = async (logDate) => {
    if (!activeUserId) {
      setError('Unable to identify current user for this action.');
      return;
    }

    const confirmed = window.confirm(`Delete carbon history entry for ${formatDate(logDate)}?`);
    if (!confirmed) return;

    setRowActionBusy(true);
    setError('');
    try {
      await carbonLogAPI.deleteCarbonLogByDate(activeUserId, logDate);
      if (editingDate === logDate) {
        handleCancelEdit();
      }
      await loadLogs();
    } catch (err) {
      setError(err.message || 'Unable to delete this history entry.');
    } finally {
      setRowActionBusy(false);
    }
  };

  const latest = logs.length > 0 ? logs[0] : null;
  const visibleLogs = showAllHistory ? logs : logs.slice(0, 4);
  const weeklyAverage = useMemo(() => {
    if (!logs.length) return 0;
    const top7 = logs.slice(0, 7);
    const total = top7.reduce((sum, item) => sum + item.totalEmission, 0);
    return total / top7.length;
  }, [logs]);

  return (
    <div className="card carbon-calc-card">
      <div className="card-title">
        Calculate Your Carbon Footprint
        <button className="card-action" onClick={() => navigate('/history')}>
          View History →
        </button>
      </div>

      <p className="calc-intro">
        Use your real lifestyle inputs to calculate emissions by category: transport, food, and energy.
        Every calculation is automatically saved to your carbon history.
      </p>

      <div className="calc-actions">
        <button
          className="btn-primary"
          onClick={() => navigate('/survey')}
        >
          <span className="button-icon">📊</span>
          Start Carbon Assessment
        </button>
        <button className="btn-history" onClick={() => navigate('/history')}>
          📜 Open Carbon History
        </button>
      </div>

      {loading ? (
        <div className="card-empty">
          <span>⏳</span>
          <p>Loading saved calculations...</p>
        </div>
      ) : error ? (
        <div className="card-empty">
          <span>⚠️</span>
          <p>Unable to load carbon history</p>
          <small>{error}</small>
        </div>
      ) : latest ? (
        <>
          <div className="calc-latest">
            <div>
              <small>Latest Total Emission</small>
              <strong>{formatKg(latest.totalEmission)}</strong>
            </div>
            <span>{formatDate(latest.logDate)}</span>
          </div>

          <div className="calc-categories">
            <div className="calc-cat-item">
              <span className="calc-cat-icon">🚗</span>
              <div>
                <p>Transport</p>
                <strong>{formatKg(latest.transportEmission)}</strong>
              </div>
            </div>
            <div className="calc-cat-item">
              <span className="calc-cat-icon">🍽️</span>
              <div>
                <p>Food</p>
                <strong>{formatKg(latest.foodEmission)}</strong>
              </div>
            </div>
            <div className="calc-cat-item">
              <span className="calc-cat-icon">⚡</span>
              <div>
                <p>Energy</p>
                <strong>{formatKg(latest.energyEmission)}</strong>
              </div>
            </div>
          </div>

          <div className="calc-submeta">
            <span>7-entry average: {formatKg(weeklyAverage)}</span>
            <span>Total saved records: {logs.length}</span>
          </div>

          <div className="calc-history-list">
            {visibleLogs.map((log) => (
              <div key={log.logDate} className="calc-history-row">
                {editingDate === log.logDate ? (
                  <>
                    <div className="calc-history-edit-fields">
                      <div className="calc-edit-field">
                        <label>T</label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={editForm.transportEmission}
                          onChange={(e) => setEditForm(prev => ({ ...prev, transportEmission: e.target.value }))}
                          disabled={rowActionBusy}
                        />
                      </div>
                      <div className="calc-edit-field">
                        <label>F</label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={editForm.foodEmission}
                          onChange={(e) => setEditForm(prev => ({ ...prev, foodEmission: e.target.value }))}
                          disabled={rowActionBusy}
                        />
                      </div>
                      <div className="calc-edit-field">
                        <label>E</label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={editForm.energyEmission}
                          onChange={(e) => setEditForm(prev => ({ ...prev, energyEmission: e.target.value }))}
                          disabled={rowActionBusy}
                        />
                      </div>
                    </div>
                    <div className="calc-history-actions">
                      <button className="card-action" onClick={() => handleSaveEdit(log.logDate)} disabled={rowActionBusy}>Save</button>
                      <button className="card-action" onClick={handleCancelEdit} disabled={rowActionBusy}>Cancel</button>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <p>{formatDate(log.logDate)}</p>
                      <small>
                        T: {Number(log.transportEmission).toFixed(2)} | F: {Number(log.foodEmission).toFixed(2)} | E: {Number(log.energyEmission).toFixed(2)}
                      </small>
                    </div>
                    <strong>{Number(log.totalEmission).toFixed(2)} kg</strong>
                    <div className="calc-history-actions">
                      <button className="card-action" onClick={() => handleStartEdit(log)} disabled={rowActionBusy}>Edit</button>
                      <button className="card-action calc-delete" onClick={() => handleDelete(log.logDate)} disabled={rowActionBusy}>Delete</button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>

          {logs.length > 4 && (
            <button className="card-action" onClick={() => setShowAllHistory(prev => !prev)}>
              {showAllHistory ? 'Show Less ▲' : `Show More (${logs.length - 4}) ▼`}
            </button>
          )}
        </>
      ) : (
        <div className="card-empty">
          <span>📊</span>
          <p>No calculation history yet</p>
          <small>Complete the carbon assessment to compute and store your first result.</small>
        </div>
      )}
    </div>
  );
};

export default CarbonCalculatorWidget;
