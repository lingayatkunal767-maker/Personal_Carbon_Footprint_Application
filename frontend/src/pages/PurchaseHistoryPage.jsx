import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import '../styles/Marketplace.css';
import '../styles/Dashboard.css';

const PurchaseHistoryPage = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBill, setSelectedBill] = useState(null);

  const sessionRaw = localStorage.getItem('current_user');
  const userId = sessionRaw ? JSON.parse(sessionRaw).id : 1;

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const data = await api.marketplace.getUserOrders(userId);
      setOrders(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to load orders:', error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Cancel this order?')) {
      return;
    }

    try {
      await api.marketplace.cancelOrder(orderId);
      alert('Order cancelled successfully.');
      loadOrders();
    } catch (error) {
      console.error('Failed to cancel order:', error);
      alert(error.message || 'Failed to cancel order.');
    }
  };

  const formatDate = (value) => {
    if (!value) return '-';
    return new Date(value).toLocaleString();
  };

  return (
    <div className="dashboard-page marketplace-page">
      <div className="topbar">
        <div className="logo" onClick={() => navigate('/home')} style={{ cursor: 'pointer' }}>
          <svg width="30" height="30" viewBox="0 0 40 40" fill="none">
            <circle cx="20" cy="20" r="20" fill="#d4edda" />
            <path d="M20 8C14 8 10 13 10 18c0 6 5 10 10 14 5-4 10-8 10-14 0-5-4-10-10-10z" fill="#2d7a4f" />
            <path d="M20 16v12M20 22c-2-2-5-2-6-4M20 20c2-2 5-2 6-4" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
          <span className="logo-text">Carbon<em>Calc</em></span>
        </div>
        <div className="topbar-right">
          <button className="btn-history" onClick={() => navigate('/marketplace')}>Back to Marketplace</button>
        </div>
      </div>

      <div className="marketplace-container">
        <header className="marketplace-header purchase-header">
          <h1>Purchase History</h1>
          <p>All successful payments and bills are stored here from PostgreSQL orders.</p>
        </header>

        {loading ? (
          <div className="loading-skeleton">Loading your purchases...</div>
        ) : orders.length === 0 ? (
          <div className="loading-skeleton">No purchases found.</div>
        ) : (
          <div className="products-grid purchase-orders-grid">
            {orders.map((order) => (
              <div key={order.id} className="product-card purchase-order-card">
                <div className="purchase-order-head">
                  <strong>Order #{order.orderNumber}</strong>
                  <strong>{order.status}</strong>
                </div>

                <div className="purchase-order-meta">
                  <div><strong>Date:</strong> {formatDate(order.createdAt)}</div>
                  <div><strong>Total Paid:</strong> ₹ {order.totalAmount}</div>
                  <div><strong>Discount (Eco Points):</strong> {order.ecoPointsUsed || 0}</div>
                  <div><strong>Payment Method:</strong> {order.paymentMethod || '-'}</div>
                  <div><strong>Address:</strong> {order.shippingAddress || '-'}</div>
                  <div><strong>Phone:</strong> {order.contactPhone || '-'}</div>
                </div>

                <div className="purchase-order-actions">
                  <button className="btn-primary" onClick={() => setSelectedBill(order)}>View Bill</button>
                  {order.status === 'PENDING' || order.status === 'CONFIRMED' ? (
                    <button
                      className="btn-secondary purchase-cancel-btn"
                      onClick={() => handleCancelOrder(order.id)}
                    >
                      Cancel Order
                    </button>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedBill ? (
        <div className="checkout-overlay">
          <div className="checkout-modal">
            <h2>Invoice / Bill</h2>
            <p className="checkout-subtitle">Order #{selectedBill.orderNumber}</p>

            <div className="bill-preview purchase-bill-info">
              <div><span>Order Date</span><strong>{formatDate(selectedBill.createdAt)}</strong></div>
              <div><span>Payment Mode</span><strong>{selectedBill.paymentMethod || '-'}</strong></div>
              <div><span>Shipping Address</span><strong>{selectedBill.shippingAddress || '-'}</strong></div>
              <div><span>Contact Phone</span><strong>{selectedBill.contactPhone || '-'}</strong></div>
            </div>

            <div className="purchase-bill-table-wrap">
              <table className="purchase-bill-table">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Qty</th>
                    <th>Unit Price</th>
                    <th>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {(selectedBill.items || []).map((item) => (
                    <tr key={item.id}>
                      <td data-label="Item">{item.productName || 'Product'}</td>
                      <td data-label="Qty">{item.quantity}</td>
                      <td data-label="Unit Price">₹ {item.unitPrice}</td>
                      <td data-label="Subtotal">₹ {item.subtotal}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="bill-preview">
              <div><span>Gross & Notes</span><strong>{selectedBill.notes || '-'}</strong></div>
              <div><span>Eco Points Used</span><strong>{selectedBill.ecoPointsUsed || 0}</strong></div>
              <div className="bill-total"><span>Final Paid Amount</span><strong>₹ {selectedBill.totalAmount}</strong></div>
            </div>

            <div className="checkout-actions purchase-checkout-actions">
              <button className="btn-primary" onClick={() => setSelectedBill(null)}>Close</button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default PurchaseHistoryPage;
