import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import '../styles/Marketplace.css';

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
        <header className="marketplace-header" style={{ padding: '1.6rem' }}>
          <h1>Purchase History</h1>
          <p>All successful payments and bills are stored here from PostgreSQL orders.</p>
        </header>

        {loading ? (
          <div className="loading-skeleton">Loading your purchases...</div>
        ) : orders.length === 0 ? (
          <div className="loading-skeleton">No purchases found.</div>
        ) : (
          <div className="products-grid" style={{ gridTemplateColumns: '1fr' }}>
            {orders.map((order) => (
              <div key={order.id} className="product-card" style={{ padding: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
                  <strong>Order #{order.orderNumber}</strong>
                  <strong>{order.status}</strong>
                </div>

                <div style={{ marginTop: '0.75rem', lineHeight: 1.7 }}>
                  <div><strong>Date:</strong> {formatDate(order.createdAt)}</div>
                  <div><strong>Total Paid:</strong> ₹ {order.totalAmount}</div>
                  <div><strong>Discount (Eco Points):</strong> {order.ecoPointsUsed || 0}</div>
                  <div><strong>Payment Method:</strong> {order.paymentMethod || '-'}</div>
                  <div><strong>Address:</strong> {order.shippingAddress || '-'}</div>
                  <div><strong>Phone:</strong> {order.contactPhone || '-'}</div>
                </div>

                <div style={{ marginTop: '0.9rem', display: 'flex', gap: '0.6rem' }}>
                  <button className="btn-primary" onClick={() => setSelectedBill(order)}>View Bill</button>
                  {order.status === 'PENDING' || order.status === 'CONFIRMED' ? (
                    <button
                      className="btn-secondary"
                      onClick={() => handleCancelOrder(order.id)}
                      style={{ borderColor: '#d9534f', color: '#d9534f' }}
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

            <div className="bill-preview" style={{ marginBottom: '0.8rem' }}>
              <div><span>Order Date</span><strong>{formatDate(selectedBill.createdAt)}</strong></div>
              <div><span>Payment Mode</span><strong>{selectedBill.paymentMethod || '-'}</strong></div>
              <div><span>Shipping Address</span><strong>{selectedBill.shippingAddress || '-'}</strong></div>
              <div><span>Contact Phone</span><strong>{selectedBill.contactPhone || '-'}</strong></div>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '1rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', textAlign: 'left' }}>
                  <th style={{ padding: '8px' }}>Item</th>
                  <th style={{ padding: '8px' }}>Qty</th>
                  <th style={{ padding: '8px' }}>Unit Price</th>
                  <th style={{ padding: '8px' }}>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {(selectedBill.items || []).map((item) => (
                  <tr key={item.id} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '8px' }}>{item.productName || 'Product'}</td>
                    <td style={{ padding: '8px' }}>{item.quantity}</td>
                    <td style={{ padding: '8px' }}>₹ {item.unitPrice}</td>
                    <td style={{ padding: '8px' }}>₹ {item.subtotal}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="bill-preview">
              <div><span>Gross & Notes</span><strong>{selectedBill.notes || '-'}</strong></div>
              <div><span>Eco Points Used</span><strong>{selectedBill.ecoPointsUsed || 0}</strong></div>
              <div className="bill-total"><span>Final Paid Amount</span><strong>₹ {selectedBill.totalAmount}</strong></div>
            </div>

            <div className="checkout-actions" style={{ marginTop: '1rem' }}>
              <button className="btn-primary" onClick={() => setSelectedBill(null)}>Close</button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default PurchaseHistoryPage;
