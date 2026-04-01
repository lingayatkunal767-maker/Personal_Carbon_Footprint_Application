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

const CATEGORIES = ["All", ...Object.keys(CATEGORY_META)];

function normalizeTypeToSupported(rawType) {
  const raw = String(rawType || "").trim();
  const compact = raw.toLowerCase().replace(/[_\s-]+/g, "");
  if (compact === "carbonoffset") return "Carbon Offset";
  if (compact === "renewableenergy") return "Renewable Energy";
  if (compact === "environmental") return "Environmental";
  if (compact === "sustainableliving") return "Sustainable Living";
  return "Carbon Offset";
}

/** Map API DTO (itemName, itemType, …) to card shape used by this page */
function normalizeMarketplaceItem(raw) {
  if (!raw || typeof raw !== "object") return null;
  const price = raw.price != null ? Number(raw.price) : 0;
  const co =
    raw.carbonOffsetValue != null
      ? Number(raw.carbonOffsetValue)
      : raw.carbonOffset != null
        ? Number(raw.carbonOffset)
        : 0;
  const name = raw.itemName ?? raw.name ?? "Untitled";
  const type = normalizeTypeToSupported(raw.itemType ?? raw.type ?? "Carbon Offset");
  let rating = null;
  if (raw.rating != null && raw.rating !== "") {
    const r = Number(raw.rating);
    if (!Number.isNaN(r)) rating = r;
  }
  const badgeStr = raw.badge != null && String(raw.badge).trim() !== ""
    ? String(raw.badge).toLowerCase()
    : null;
  let ipp = null;
  if (raw.impactProgressPercent != null && raw.impactProgressPercent !== "") {
    const n = Number(raw.impactProgressPercent);
    if (!Number.isNaN(n)) ipp = Math.min(100, Math.max(0, Math.round(n)));
  }
  return {
    id: raw.id,
    name,
    type,
    description: raw.description ?? "",
    price,
    carbonOffset: co,
    rating,
    badge: badgeStr,
    impactProgressPercent: ipp,
    priceUnit: raw.priceUnit && String(raw.priceUnit).trim() ? String(raw.priceUnit).trim() : "unit",
    headerIcon: raw.headerIcon && String(raw.headerIcon).trim() ? String(raw.headerIcon).trim() : null,
    bannerKey: null,
  };
}

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
  const [selectedItem, setSelectedItem] = useState(null);
  const [quantity, setQuantity]         = useState(1);
  const [purchasing, setPurchasing]     = useState(false);
  const [toast, setToast]               = useState(null);

  // ── Fetch marketplace items ──
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { navigate("/login"); return; }

    const headers = { Authorization: `Bearer ${token}` };

    // Backend: /api/marketplace/items or /api/marketplace
    const fetchItems = axios
      .get(`${API_BASE}/api/marketplace/items`, { headers })
      .catch(() => axios.get(`${API_BASE}/api/marketplace`, { headers }))
      .then((res) => {
        const arr = Array.isArray(res.data) ? res.data : [];
        return arr.map(normalizeMarketplaceItem).filter(Boolean);
      })
      .catch(() => []);

    const fetchTxns = axios
      .get(`${API_BASE}/api/auth/me`, { headers })
      .then((meRes) => meRes.data?.id)
      .then((userId) => {
        if (!userId) throw new Error("User ID not found.");
        return axios.get(`${API_BASE}/api/transactions/user/${userId}`, { headers });
      })
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

  // ── Filtering ──
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

    return result;
  }, [items, category, search]);

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
      // Fetch current user to get userId
      const meRes = await axios.get(`${API_BASE}/api/auth/me`, { headers });
      const userId = meRes.data?.id;
      if (!userId) {
        throw new Error("User ID not found for purchase.");
      }

      // Create transaction in backend (which will also trigger a purchase notification)
      await axios.post(
        `${API_BASE}/api/transactions`,
        {
          userId,
          marketplaceItemId: selectedItem.id,
        },
        { headers }
      );

      setToast(`🎉 Successfully purchased ${quantity}× ${selectedItem.name}!`);
      closePurchaseModal();
    } catch (err) {
      console.error("Purchase failed", err);
      setToast("Purchase failed. Please try again.");
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
                  const bannerClass = item.bannerKey || meta.banner;
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
                      <div className={`marketplace-card-banner ${bannerClass}`}>
                        {item.headerIcon || meta.icon}
                      </div>

                      {/* Body */}
                      <div className="marketplace-card-body">
                        <span className="marketplace-card-type">{meta.emoji} {item.type}</span>
                        <h3 className="marketplace-card-name">{item.name}</h3>
                        <p className="marketplace-card-desc">{item.description}</p>

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
                          <span className="marketplace-card-price-unit">
                            {" "}
                            /{item.priceUnit || "unit"}
                          </span>
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

              <div
                className={`marketplace-modal-banner ${
                  selectedItem.bannerKey || (CATEGORY_META[selectedItem.type] || {}).banner || "carbon-offset"
                }`}
              >
                {selectedItem.headerIcon || (CATEGORY_META[selectedItem.type] || {}).icon || "🌿"}
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
