import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import AppLayout from "../components/AppLayout";
import "./Transactions.css";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:8080";

function Transactions() {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    const headers = { Authorization: `Bearer ${token}` };
    axios
      .get(`${API_BASE}/api/auth/me`, { headers })
      .then((meRes) => meRes.data?.id)
      .then((userId) => {
        if (!userId) throw new Error("User ID not found.");
        return axios.get(`${API_BASE}/api/transactions/user/${userId}`, { headers });
      })
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : [];
        return data.map((t) => ({
          id: t.id,
          itemName: t.itemName || t.marketplaceItemName || "",
          // prefer DTO field, fall back to any legacy names
          type: t.type || t.itemType || t.marketplaceItemType || "",
          quantity: t.quantity ?? t.qty ?? 1,
          amount: Number(t.amount || 0),
          carbonOffset: Number(
            t.carbonOffset ??
            t.carbonOffsetValue ??
            t.marketplaceItemCarbonOffset ??
            0
          ),
          status: t.status,
          date: t.createdAt || t.date || "",
        }));
      })
      .catch(() => [])
      .then((data) => setTransactions(data))
      .finally(() => setLoading(false));
  }, [navigate]);

  const normalizeStatus = (status) => {
    const value = (status || "Confirmed").toString().trim().toLowerCase();
    if (value === "in progress") return "in-progress";
    return value;
  };

  const getDisplayStatus = (status) => {
    const normalized = normalizeStatus(status);
    return normalized === "pending" ? "Pending" : "Completed";
  };

  const getDisplayStatusClass = (status) => {
    const normalized = normalizeStatus(status);
    return normalized === "pending" ? "pending" : "completed";
  };

  const pendingCount = useMemo(
    () => transactions.filter((t) => normalizeStatus(t.status) === "pending").length,
    [transactions]
  );

  const completedCount = useMemo(
    () =>
      transactions.filter((t) => {
        const normalized = normalizeStatus(t.status);
        return normalized === "completed" || normalized === "confirmed";
      }).length,
    [transactions]
  );

  const FILTER_OPTIONS = useMemo(
    () => [
      { key: "all", label: "All", count: transactions.length },
      { key: "pending", label: "Pending", count: pendingCount },
      { key: "completed", label: "Completed", count: completedCount },
    ],
    [transactions.length, pendingCount, completedCount]
  );

  const formatDate = (dateStr) =>
    dateStr
      ? new Date(dateStr).toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })
      : "—";

  const filteredTransactions = useMemo(() => {
    const q = query.trim().toLowerCase();
    const base = transactions.filter((t) => {
      const normalized = normalizeStatus(t.status);
      const matchesStatus =
        statusFilter === "all"
          ? true
          : statusFilter === "completed"
            ? normalized === "completed" || normalized === "confirmed"
            : normalized === "pending";
      const matchesQuery =
        !q ||
        (t.itemName || "").toLowerCase().includes(q) ||
        (t.type || "").toLowerCase().includes(q) ||
        (t.status || "").toLowerCase().includes(q);
      return matchesStatus && matchesQuery;
    });
    const sorted = [...base];
    switch (sortBy) {
      case "oldest":
        sorted.sort((a, b) => new Date(a.date) - new Date(b.date));
        break;
      case "amount-high":
        sorted.sort((a, b) => (b.amount || 0) - (a.amount || 0));
        break;
      case "amount-low":
        sorted.sort((a, b) => (a.amount || 0) - (b.amount || 0));
        break;
      default: // newest
        sorted.sort((a, b) => new Date(b.date) - new Date(a.date));
    }
    return sorted;
  }, [transactions, query, statusFilter, sortBy]);

  const totalSpent = filteredTransactions.reduce((s, t) => s + (t.amount || 0), 0);
  const totalOffset = filteredTransactions.reduce((s, t) => s + (t.carbonOffset || 0), 0);

  return (
    <AppLayout>
      <div className="tx-page">
        <div className="tx-header">
          <div className="tx-title-wrap">
            <h1 className="tx-title">💳 Transactions</h1>
            <p className="tx-subtitle">
              View your marketplace purchases and track their status.
            </p>
          </div>

          <div className="tx-stats">
            <div className="tx-stat">
              <span className="tx-stat-value">{filteredTransactions.length}</span>
              <span className="tx-stat-label">Transactions</span>
            </div>
            <div className="tx-stat">
              <span className="tx-stat-value">₹{totalSpent.toLocaleString("en-IN")}</span>
              <span className="tx-stat-label">Total Spent</span>
            </div>
            <div className="tx-stat">
              <span className="tx-stat-value">{totalOffset.toLocaleString()} kg</span>
              <span className="tx-stat-label">CO₂ Offset</span>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="tx-loading card">
            <div className="tx-spinner" />
            <p>Loading transactions…</p>
          </div>
        ) : (
          <section className="tx-main card">
            <div className="tx-toolbar">
              <div className="tx-search-wrap">
                <span className="tx-search-icon" aria-hidden>🔎</span>
                <input
                  type="text"
                  className="tx-search"
                  placeholder="Search by item, type, or status…"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>
              <div className="tx-sort-wrap">
                <span className="tx-sort-label">Sort:</span>
                <select
                  className="tx-sort-select"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="newest">Newest first</option>
                  <option value="oldest">Oldest first</option>
                  <option value="amount-high">Amount: High to Low</option>
                  <option value="amount-low">Amount: Low to High</option>
                </select>
              </div>
            </div>

            <div className="tx-filters">
              {FILTER_OPTIONS.map((opt) => (
                <button
                  key={opt.key}
                  type="button"
                  className={`tx-filter-btn ${statusFilter === opt.key ? "active" : ""}`}
                  onClick={() => setStatusFilter(opt.key)}
                >
                  {opt.label}
                  <span className="tx-filter-count">{opt.count}</span>
                </button>
              ))}
            </div>

            {filteredTransactions.length === 0 ? (
              <div className="tx-empty">
                <span className="tx-empty-icon">🧾</span>
                <h3 className="tx-empty-title">No transactions found</h3>
                <p className="tx-empty-desc">
                  Try a different search or status filter.
                </p>
              </div>
            ) : (
              <div className="tx-table-wrap">
                <table className="tx-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Item</th>
                      <th>Type</th>
                      <th>Qty</th>
                      <th>Amount</th>
                      <th>CO₂ Offset</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTransactions.map((txn) => {
                      const normalized = getDisplayStatusClass(txn.status);
                      return (
                        <tr key={txn.id || `${txn.itemName}-${txn.date}`}>
                          <td>{formatDate(txn.date)}</td>
                          <td><strong>{txn.itemName || "—"}</strong></td>
                          <td>{txn.type || "—"}</td>
                          <td>{txn.quantity ?? "—"}</td>
                          <td className="tx-amount">₹{(txn.amount || 0).toLocaleString("en-IN")}</td>
                          <td>{(txn.carbonOffset || 0).toLocaleString()} kg</td>
                          <td>
                            <span className={`tx-status ${normalized}`}>
                              {getDisplayStatus(txn.status)}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}
      </div>
    </AppLayout>
  );
}

export default Transactions;

