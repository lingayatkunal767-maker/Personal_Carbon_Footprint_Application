import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import AppLayout from "../components/AppLayout";
import "./Marketplace.css";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:8080";

/* ── Category meta (icon, banner class, label) ────────── */
const CATEGORY_META = {
  "Carbon Offset":       { icon: "🌳", banner: "carbon-offset",       emoji: "🌳" },
  "Renewable Energy":    { icon: "☀️", banner: "renewable-energy",    emoji: "☀️" },
  "Environmental":       { icon: "🌍", banner: "environmental",       emoji: "🌍" },
  "Sustainable Living":  { icon: "♻️", banner: "sustainable-living",  emoji: "♻️" },
};

/* ── Static fallback data (used until backend is ready) ── */
const FALLBACK_ITEMS = [
  {
    id: 1,
    name: "Plant 10 Trees",
    description: "Support reforestation by planting 10 native trees in deforested regions. Each tree absorbs approximately 22 kg of CO₂ per year.",
    type: "Carbon Offset",
    price: 2099,
    carbonOffset: 220,
    rating: 4.9,
    badge: "popular",
    impactLevel: 85,
  },
  {
    id: 2,
    name: "Solar Panel Micro-Investment",
    description: "Contribute to community solar panel installations in rural areas. Support clean energy generation and reduce fossil fuel dependency.",
    type: "Renewable Energy",
    price: 4199,
    carbonOffset: 480,
    rating: 4.7,
    badge: "popular",
    impactLevel: 92,
  },
  {
    id: 3,
    name: "Carbon Credit – 1 Tonne",
    description: "Purchase verified carbon credits that fund environmental projects worldwide, directly offsetting 1 tonne of your carbon emissions.",
    type: "Environmental",
    price: 2899,
    carbonOffset: 1000,
    rating: 4.8,
    badge: null,
    impactLevel: 100,
  },
  {
    id: 4,
    name: "Ocean Cleanup Support",
    description: "Fund ocean plastic removal projects. Every contribution helps remove 5 kg of plastic from oceans and coastal areas.",
    type: "Environmental",
    price: 1699,
    carbonOffset: 150,
    rating: 4.6,
    badge: "new",
    impactLevel: 65,
  },
  {
    id: 5,
    name: "Wind Energy Certificate",
    description: "Support wind farm development by purchasing renewable energy certificates. Promote clean energy infrastructure growth.",
    type: "Renewable Energy",
    price: 3299,
    carbonOffset: 350,
    rating: 4.5,
    badge: null,
    impactLevel: 78,
  },
  {
    id: 6,
    name: "Bamboo Forest Planting",
    description: "Help plant fast-growing bamboo forests that absorb up to 12 tonnes of CO₂ per hectare per year. Bamboo is one of the most effective carbon sinks.",
    type: "Carbon Offset",
    price: 2499,
    carbonOffset: 300,
    rating: 4.8,
    badge: "new",
    impactLevel: 88,
  },
  {
    id: 7,
    name: "Eco-Friendly Cookstove",
    description: "Provide clean cookstoves to communities in developing regions. Reduces indoor pollution and cuts fuel wood consumption by 60%.",
    type: "Sustainable Living",
    price: 3749,
    carbonOffset: 400,
    rating: 4.4,
    badge: null,
    impactLevel: 72,
  },
  {
    id: 8,
    name: "Mangrove Restoration",
    description: "Support mangrove planting in coastal areas. Mangroves store 3–5x more carbon than tropical forests and protect shores from erosion.",
    type: "Carbon Offset",
    price: 2349,
    carbonOffset: 260,
    rating: 4.9,
    badge: "limited",
    impactLevel: 90,
  },
  {
    id: 9,
    name: "Green Commute Pass",
    description: "Offset your monthly commute emissions by supporting electric bus networks and bike-sharing infrastructure in urban areas.",
    type: "Sustainable Living",
    price: 1249,
    carbonOffset: 120,
    rating: 4.3,
    badge: null,
    impactLevel: 55,
  },
];

const SORT_OPTIONS = [
  { value: "popular",      label: "Most Popular" },
  { value: "price-low",    label: "Price: Low → High" },
  { value: "price-high",   label: "Price: High → Low" },
  { value: "offset-high",  label: "Highest Offset" },
  { value: "rating",       label: "Top Rated" },
];

const CATEGORIES = ["All", ...Object.keys(CATEGORY_META)];

/* ─────────────────────────────────────────────────────────
   MARKETPLACE COMPONENT
   ───────────────────────────────────────────────────────── */
function Marketplace() {
  const navigate = useNavigate();

  // ── State ──
  const [items, setItems]               = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [search, setSearch]             = useState("");
  const [category, setCategory]         = useState("All");
  const [sortBy, setSortBy]             = useState("popular");
  const [selectedItem, setSelectedItem] = useState(null);
  const [quantity, setQuantity]         = useState(1);
  const [purchasing, setPurchasing]     = useState(false);
  const [toast, setToast]               = useState(null);
  const [showHistory, setShowHistory]   = useState(false);

  // ── Fetch marketplace items ──
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { navigate("/login"); return; }

    const headers = { Authorization: `Bearer ${token}` };

    // Try fetching from backend; fall back to static data
    const fetchItems = axios.get(`${API_BASE}/api/marketplace/items`, { headers })
      .then((res) => Array.isArray(res.data) ? res.data : FALLBACK_ITEMS)
      .catch(() => FALLBACK_ITEMS);

    const fetchTxns = axios.get(`${API_BASE}/api/marketplace/transactions`, { headers })
      .then((res) => Array.isArray(res.data) ? res.data : [])
      .catch(() => []);

    Promise.all([fetchItems, fetchTxns])
      .then(([itemsData, txnData]) => {
        setItems(itemsData);
        setTransactions(txnData);
      })
      .finally(() => setLoading(false));
  }, [navigate]);

  // ── Derived values ──
  const totalOffset = transactions.reduce((s, t) => s + (t.carbonOffset || 0), 0);
  const totalSpent  = transactions.reduce((s, t) => s + (t.amount || 0), 0);

  // ── Filtering + Sorting ──
  const filteredItems = useCallback(() => {
    let result = [...items];

    // Category filter
    if (category !== "All") {
      result = result.filter((item) => item.type === category);
    }

    // Search filter
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((item) =>
        item.name.toLowerCase().includes(q) ||
        (item.description || "").toLowerCase().includes(q) ||
        (item.type || "").toLowerCase().includes(q)
      );
    }

    // Sort
    switch (sortBy) {
      case "price-low":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        result.sort((a, b) => b.price - a.price);
        break;
      case "offset-high":
        result.sort((a, b) => b.carbonOffset - a.carbonOffset);
        break;
      case "rating":
        result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      default: // popular – badges first, then rating
        result.sort((a, b) => {
          if (a.badge === "popular" && b.badge !== "popular") return -1;
          if (b.badge === "popular" && a.badge !== "popular") return 1;
          return (b.rating || 0) - (a.rating || 0);
        });
    }

    return result;
  }, [items, category, search, sortBy]);

  const displayedItems = filteredItems();

  // Category counts
  const categoryCounts = items.reduce((acc, item) => {
    acc[item.type] = (acc[item.type] || 0) + 1;
    return acc;
  }, {});

  // ── Handlers ──
  const openPurchaseModal = (item) => {
    setSelectedItem(item);
    setQuantity(1);
  };

  const closePurchaseModal = () => {
    setSelectedItem(null);
    setQuantity(1);
  };

  const handlePurchase = async () => {
    if (!selectedItem) return;
    setPurchasing(true);

    const token = localStorage.getItem("token");
    const headers = { Authorization: `Bearer ${token}` };

    try {
      await axios.post(`${API_BASE}/api/marketplace/purchase`, {
        itemId: selectedItem.id,
        quantity,
      }, { headers });

      // Add to local transaction list
      const newTxn = {
        id: Date.now(),
        itemName: selectedItem.name,
        type: selectedItem.type,
        quantity,
        amount: selectedItem.price * quantity,
        carbonOffset: selectedItem.carbonOffset * quantity,
        date: new Date().toISOString(),
        status: "Confirmed",
      };
      setTransactions((prev) => [newTxn, ...prev]);

      setToast(`🎉 Successfully purchased ${quantity}× ${selectedItem.name}!`);
      closePurchaseModal();
    } catch {
      // Even if backend isn't ready, simulate success for demo
      const newTxn = {
        id: Date.now(),
        itemName: selectedItem.name,
        type: selectedItem.type,
        quantity,
        amount: selectedItem.price * quantity,
        carbonOffset: selectedItem.carbonOffset * quantity,
        date: new Date().toISOString(),
        status: "Confirmed",
      };
      setTransactions((prev) => [newTxn, ...prev]);

      setToast(`🎉 Successfully purchased ${quantity}× ${selectedItem.name}!`);
      closePurchaseModal();
    } finally {
      setPurchasing(false);
    }
  };

  // Auto-dismiss toast
  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(t);
    }
  }, [toast]);

  const formatDate = (dateStr) =>
    dateStr
      ? new Date(dateStr).toLocaleDateString("en-IN", {
          day: "numeric", month: "short", year: "numeric",
        })
      : "—";

  const maxOffset = Math.max(...items.map((i) => i.carbonOffset || 0), 1);

  // ── Render ──
  return (
    <AppLayout>
      <div className="marketplace-page">

        {/* ══ Header ══ */}
        <div className="marketplace-header">
          <div className="marketplace-title-wrap">
            <h1 className="marketplace-title">🛒 Eco Marketplace</h1>
            <p className="marketplace-subtitle">
              Offset your carbon footprint by supporting verified environmental initiatives. Every purchase makes a real impact.
            </p>
          </div>

          <div className="marketplace-stats">
            <div className="marketplace-stat-chip">
              <span className="marketplace-stat-value">{items.length}</span>
              <span className="marketplace-stat-label">Products</span>
            </div>
            <div className="marketplace-stat-chip">
              <span className="marketplace-stat-value">{totalOffset.toLocaleString()}</span>
              <span className="marketplace-stat-label">kg CO₂ Offset</span>
            </div>
            <div className="marketplace-stat-chip">
              <span className="marketplace-stat-value">₹{totalSpent.toLocaleString("en-IN")}</span>
              <span className="marketplace-stat-label">Total Invested</span>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="marketplace-loading">
            <div className="marketplace-spinner" />
            <p>Loading marketplace…</p>
          </div>
        ) : (
          <>
            {/* ══ Toolbar ══ */}
            <div className="marketplace-toolbar">
              <div className="marketplace-search-wrap">
                <span className="marketplace-search-icon" aria-hidden>🔍</span>
                <input
                  id="marketplace-search"
                  type="text"
                  className="marketplace-search"
                  placeholder="Search eco initiatives…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              <div className="marketplace-category-chips">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    className={`marketplace-chip ${category === cat ? "active" : ""}`}
                    onClick={() => setCategory(cat)}
                  >
                    {cat !== "All" && <span>{CATEGORY_META[cat]?.emoji}</span>}
                    {cat}
                    <span className="marketplace-chip-count">
                      {cat === "All" ? items.length : (categoryCounts[cat] || 0)}
                    </span>
                  </button>
                ))}
              </div>

              <div className="marketplace-sort-wrap">
                <span className="marketplace-sort-label">Sort:</span>
                <select
                  id="marketplace-sort"
                  className="marketplace-sort-select"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  {SORT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* ══ Product Grid ══ */}
            {displayedItems.length === 0 ? (
              <div className="marketplace-empty">
                <span className="marketplace-empty-icon">🔎</span>
                <h3 className="marketplace-empty-title">No items found</h3>
                <p className="marketplace-empty-desc">
                  Try adjusting your search or category filter.
                </p>
              </div>
            ) : (
              <div className="marketplace-grid">
                {displayedItems.map((item) => {
                  const meta = CATEGORY_META[item.type] || { icon: "🌿", banner: "carbon-offset", emoji: "🌿" };
                  return (
                    <div
                      key={item.id}
                      className="marketplace-card"
                      onClick={() => openPurchaseModal(item)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => e.key === "Enter" && openPurchaseModal(item)}
                    >
                      {/* Banner */}
                      <div className={`marketplace-card-banner ${meta.banner}`}>
                        {meta.icon}
                        {item.badge && (
                          <span className={`marketplace-card-badge ${item.badge}`}>
                            {item.badge}
                          </span>
                        )}
                      </div>

                      {/* Body */}
                      <div className="marketplace-card-body">
                        <span className="marketplace-card-type">{meta.emoji} {item.type}</span>
                        <h3 className="marketplace-card-name">{item.name}</h3>
                        <p className="marketplace-card-desc">{item.description}</p>

                        {/* Impact bar */}
                        <div className="marketplace-card-impact">
                          <div className="marketplace-card-impact-bar-wrap">
                            <div
                              className="marketplace-card-impact-bar"
                              style={{ width: `${Math.round((item.carbonOffset / maxOffset) * 100)}%` }}
                            />
                          </div>
                          <span className="marketplace-card-impact-label">
                            {item.carbonOffset} kg
                          </span>
                        </div>

                        <div className="marketplace-card-meta">
                          <span className="marketplace-card-offset">
                            <span className="marketplace-card-offset-icon">🍃</span>
                            {item.carbonOffset} kg CO₂
                          </span>
                          {item.rating && (
                            <span className="marketplace-card-rating">
                              ⭐ {item.rating}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Footer */}
                      <div className="marketplace-card-footer">
                        <span className="marketplace-card-price">
                          ₹{item.price.toLocaleString("en-IN")}
                          <span className="marketplace-card-price-unit"> /unit</span>
                        </span>
                        <button
                          className="marketplace-card-buy-btn"
                          onClick={(e) => { e.stopPropagation(); openPurchaseModal(item); }}
                        >
                          Purchase
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* ══ Transaction History ══ */}
            <section className="marketplace-history-section card">
              <div className="marketplace-history-header">
                <h2 className="marketplace-history-title">
                  💳 Purchase History ({transactions.length})
                </h2>
                {transactions.length > 0 && (
                  <button
                    type="button"
                    className="marketplace-history-toggle"
                    onClick={() => setShowHistory((v) => !v)}
                  >
                    {showHistory ? "Hide" : "Show"} history
                  </button>
                )}
              </div>

              {showHistory && (
                transactions.length === 0 ? (
                  <p className="marketplace-history-empty">
                    No purchases yet. Start offsetting your carbon footprint today!
                  </p>
                ) : (
                  <div className="marketplace-history-table-wrap">
                    <table className="marketplace-history-table">
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
                        {transactions.map((txn) => (
                          <tr key={txn.id}>
                            <td>{formatDate(txn.date)}</td>
                            <td><strong>{txn.itemName}</strong></td>
                            <td>{txn.type}</td>
                            <td>{txn.quantity}</td>
                            <td className="marketplace-history-amount">
                              ₹{(txn.amount || 0).toLocaleString("en-IN")}
                            </td>
                            <td>{(txn.carbonOffset || 0).toLocaleString()} kg</td>
                            <td>
                              <span className={`marketplace-history-status ${(txn.status || "confirmed").toLowerCase()}`}>
                                {txn.status || "Confirmed"}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )
              )}
            </section>
          </>
        )}

        {/* ══ Purchase Modal ══ */}
        {selectedItem && (
          <div
            className="marketplace-modal-overlay"
            onClick={closePurchaseModal}
            role="dialog"
            aria-modal="true"
            aria-label={`Purchase ${selectedItem.name}`}
          >
            <div className="marketplace-modal" onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                className="marketplace-modal-close"
                onClick={closePurchaseModal}
                aria-label="Close"
              >
                ×
              </button>

              <div className={`marketplace-modal-banner ${(CATEGORY_META[selectedItem.type] || {}).banner || "carbon-offset"}`}>
                {(CATEGORY_META[selectedItem.type] || {}).icon || "🌿"}
              </div>

              <div className="marketplace-modal-body">
                <p className="marketplace-modal-type">
                  {(CATEGORY_META[selectedItem.type] || {}).emoji} {selectedItem.type}
                </p>
                <h2 className="marketplace-modal-name">{selectedItem.name}</h2>
                <p className="marketplace-modal-desc">{selectedItem.description}</p>

                <div className="marketplace-modal-details">
                  <div className="marketplace-modal-detail">
                    <span className="marketplace-modal-detail-label">Price per unit</span>
                    <span className="marketplace-modal-detail-value">₹{selectedItem.price.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="marketplace-modal-detail">
                    <span className="marketplace-modal-detail-label">CO₂ Offset per unit</span>
                    <span className="marketplace-modal-detail-value green">
                      {selectedItem.carbonOffset} kg
                    </span>
                  </div>
                  {selectedItem.rating && (
                    <div className="marketplace-modal-detail">
                      <span className="marketplace-modal-detail-label">Rating</span>
                      <span className="marketplace-modal-detail-value">⭐ {selectedItem.rating}</span>
                    </div>
                  )}
                  <div className="marketplace-modal-detail">
                    <span className="marketplace-modal-detail-label">Total Offset</span>
                    <span className="marketplace-modal-detail-value green">
                      {(selectedItem.carbonOffset * quantity).toLocaleString()} kg
                    </span>
                  </div>
                </div>

                {/* Quantity */}
                <div className="marketplace-modal-qty">
                  <span className="marketplace-modal-qty-label">Quantity:</span>
                  <div className="marketplace-modal-qty-controls">
                    <button
                      type="button"
                      className="marketplace-modal-qty-btn"
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      disabled={quantity <= 1}
                    >
                      −
                    </button>
                    <span className="marketplace-modal-qty-value">{quantity}</span>
                    <button
                      type="button"
                      className="marketplace-modal-qty-btn"
                      onClick={() => setQuantity((q) => q + 1)}
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Total */}
                <div className="marketplace-modal-total">
                  <span className="marketplace-modal-total-label">Total Amount</span>
                  <span className="marketplace-modal-total-value">
                    ₹{(selectedItem.price * quantity).toLocaleString("en-IN")}
                  </span>
                </div>

                {/* Actions */}
                <div className="marketplace-modal-actions">
                  <button
                    type="button"
                    className="marketplace-modal-buy"
                    onClick={handlePurchase}
                    disabled={purchasing}
                  >
                    {purchasing ? "Processing…" : "🌿 Confirm Purchase"}
                  </button>
                  <button
                    type="button"
                    className="marketplace-modal-cancel"
                    onClick={closePurchaseModal}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ══ Toast ══ */}
        {toast && (
          <div className="marketplace-toast" role="alert">
            <span className="marketplace-toast-icon">✅</span>
            {toast}
          </div>
        )}
      </div>
    </AppLayout>
  );
}

export default Marketplace;
