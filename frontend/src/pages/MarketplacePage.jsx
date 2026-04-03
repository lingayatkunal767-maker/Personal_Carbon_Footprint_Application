import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import '../styles/Marketplace.css';
import '../styles/Dashboard.css';

const CATEGORY_OPTIONS = [
  { id: null, name: 'All Items' },
  { id: 'REUSABLE', name: 'Reusable' },
  { id: 'ENERGY_EFFICIENT', name: 'Energy Efficient' },
  { id: 'SUSTAINABLE_FASHION', name: 'Sustainable Fashion' },
  { id: 'ORGANIC_FOOD', name: 'Organic Food' },
  { id: 'ECO_TRANSPORT', name: 'Eco Transport' },
  { id: 'HOME_GARDEN', name: 'Home & Garden' },
];

const MarketplacePage = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState(null);
  const [checkoutProduct, setCheckoutProduct] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [processingPayment, setProcessingPayment] = useState(false);
  const [userPoints, setUserPoints] = useState(0);

  const sessionRaw = localStorage.getItem('current_user');
  const user = sessionRaw ? JSON.parse(sessionRaw) : { id: 1, name: 'Customer' };
  const userId = user.id;

  const [checkoutForm, setCheckoutForm] = useState({
    fullName: user?.name || '',
    phone: '',
    address: '',
    pincode: '',
    quantity: 1,
    upiId: '',
    ecoPointsToRedeem: 0,
  });

  useEffect(() => {
    loadProducts(activeCategory);
  }, [activeCategory]);

  useEffect(() => {
    api.stats.getUserStats(userId)
      .then((stats) => setUserPoints(stats?.ecoPoints || 0))
      .catch(() => setUserPoints(0));
  }, [userId]);

  const loadProducts = async (category) => {
    setLoading(true);
    try {
      const data = category
        ? await api.marketplace.getProductsByCategory(category)
        : await api.marketplace.getProducts();
      setProducts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to load products:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const saleableProducts = useMemo(
    () => products.filter((product) => product.isActive && product.stockQuantity > 0),
    [products],
  );

  const openCheckout = (product) => {
    setCheckoutProduct(product);
    setPaymentMethod('UPI');
    setCheckoutForm({
      fullName: user?.name || '',
      phone: '',
      address: '',
      pincode: '',
      quantity: 1,
      upiId: '',
      ecoPointsToRedeem: 0,
    });
  };

  const closeCheckout = () => {
    setCheckoutProduct(null);
    setProcessingPayment(false);
  };

  const onCheckoutChange = (field, value) => {
    setCheckoutForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const quantity = Math.max(1, Number(checkoutForm.quantity) || 1);
  const grossAmount = checkoutProduct ? checkoutProduct.price * quantity : 0;
  const maxRedeemablePointsByRule = Math.floor(grossAmount * 5);
  const requestedPoints = Math.max(0, Number(checkoutForm.ecoPointsToRedeem) || 0);
  const redeemablePoints = Math.min(requestedPoints, userPoints, maxRedeemablePointsByRule);
  const discountInInr = Math.floor(redeemablePoints / 10);
  const finalPayableAmount = Math.max(0, grossAmount - discountInInr);

  const handlePurchaseSubmit = async (event) => {
    event.preventDefault();

    if (!checkoutProduct) {
      return;
    }

    if (!checkoutForm.fullName.trim()) {
      alert('Please enter full name');
      return;
    }

    if (!/^\+?[0-9]{10,15}$/.test(checkoutForm.phone.trim())) {
      alert('Please enter a valid phone number');
      return;
    }

    if (!checkoutForm.address.trim()) {
      alert('Please enter address');
      return;
    }

    if (!/^\d{6}$/.test(checkoutForm.pincode.trim())) {
      alert('Please enter a valid 6-digit pincode');
      return;
    }

    if (paymentMethod === 'UPI' && !checkoutForm.upiId.includes('@')) {
      alert('Please enter a valid UPI ID (example: name@bank)');
      return;
    }

    setProcessingPayment(true);

    try {
      const orderPayload = {
        userId,
        items: {
          [checkoutProduct.id]: quantity,
        },
        shippingAddress: `${checkoutForm.address.trim()}, ${checkoutForm.pincode.trim()}`,
        contactPhone: checkoutForm.phone.trim(),
        paymentMethod,
        ecoPointsUsed: redeemablePoints,
        paymentReference: paymentMethod === 'UPI' ? checkoutForm.upiId.trim() : null,
        notes: `Customer=${checkoutForm.fullName.trim()}`,
      };

      const order = await api.marketplace.createOrder(orderPayload);

      alert(
        `Payment successful!\nOrder: ${order.orderNumber}\nPaid: ₹ ${order.totalAmount}\nBill has been saved in Purchase History.`,
      );

      closeCheckout();
      loadProducts(activeCategory);
      navigate('/purchase-history');
    } catch (error) {
      console.error('Payment failed:', error);
      alert(error.message || 'Payment failed. Please check required fields and try again.');
    } finally {
      setProcessingPayment(false);
    }
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
          <button className="btn-history" onClick={() => navigate('/purchase-history')}>Purchase History</button>
          <button className="btn-history" onClick={() => navigate('/home')}>Back Home</button>
        </div>
      </div>

      <div className="marketplace-container">
        <header className="marketplace-header">
          <h1>Eco Store</h1>
          <p>Pay in Indian Rupees and use eco-points for discount. 10 eco-points = ₹1 discount, up to 50%.</p>
        </header>

        <div className="category-filters">
          {CATEGORY_OPTIONS.map((category) => (
            <button
              key={category.id || 'all'}
              className={`filter-btn ${activeCategory === category.id ? 'active' : ''}`}
              onClick={() => setActiveCategory(category.id)}
            >
              {category.name}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="products-grid">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="loading-card">Loading...</div>
            ))}
          </div>
        ) : saleableProducts.length === 0 ? (
          <div className="empty-state">No in-stock products found in this category.</div>
        ) : (
          <div className="products-grid">
            {saleableProducts.map((product) => (
              <div key={product.id} className="product-card">
                <div className="product-image-placeholder">
                  {product.imageUrl ? (
                    <img src={product.imageUrl} alt={product.name} className="product-img" />
                  ) : (
                    <span>{product.name.charAt(0)}</span>
                  )}
                </div>
                <div className="product-info">
                  <span className="product-category">{product.category}</span>
                  <h3 className="product-title">{product.name}</h3>
                  <p className="product-desc">{product.description}</p>
                  <div className="product-footer">
                    <div className="product-price">₹ {product.price}</div>
                    <button className="btn-primary buy-btn" onClick={() => openCheckout(product)}>
                      Buy Now
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {checkoutProduct && (
        <div className="checkout-overlay">
          <div className="checkout-modal">
            <h2>Checkout</h2>
            <p className="checkout-subtitle">{checkoutProduct.name}</p>

            <form onSubmit={handlePurchaseSubmit} className="checkout-form">
              <div className="checkout-grid">
                <div className="checkout-field">
                  <label>Full Name</label>
                  <input
                    type="text"
                    value={checkoutForm.fullName}
                    onChange={(event) => onCheckoutChange('fullName', event.target.value)}
                    required
                  />
                </div>
                <div className="checkout-field">
                  <label>Phone Number</label>
                  <input
                    type="text"
                    value={checkoutForm.phone}
                    onChange={(event) => onCheckoutChange('phone', event.target.value)}
                    placeholder="10-digit mobile"
                    required
                  />
                </div>
              </div>

              <div className="checkout-field">
                <label>Delivery Address</label>
                <textarea
                  rows="2"
                  value={checkoutForm.address}
                  onChange={(event) => onCheckoutChange('address', event.target.value)}
                  required
                />
              </div>

              <div className="checkout-grid">
                <div className="checkout-field">
                  <label>Pincode</label>
                  <input
                    type="text"
                    value={checkoutForm.pincode}
                    onChange={(event) => onCheckoutChange('pincode', event.target.value)}
                    placeholder="6 digits"
                    required
                  />
                </div>
                <div className="checkout-field">
                  <label>Quantity</label>
                  <input
                    type="number"
                    min="1"
                    max={checkoutProduct.stockQuantity}
                    value={quantity}
                    onChange={(event) => onCheckoutChange('quantity', event.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="checkout-grid">
                <div className="checkout-field">
                  <label>Payment Method</label>
                  <select
                    value={paymentMethod}
                    onChange={(event) => setPaymentMethod(event.target.value)}
                  >
                    <option value="UPI">UPI</option>
                    <option value="CARD">Card</option>
                    <option value="CASH_ON_DELIVERY">Cash On Delivery</option>
                  </select>
                </div>
                <div className="checkout-field">
                  <label>Eco Points to Redeem (Available: {userPoints})</label>
                  <input
                    type="number"
                    min="0"
                    max={Math.min(userPoints, maxRedeemablePointsByRule)}
                    value={requestedPoints}
                    onChange={(event) => onCheckoutChange('ecoPointsToRedeem', event.target.value)}
                  />
                </div>
              </div>

              {paymentMethod === 'UPI' && (
                <div className="checkout-field">
                  <label>UPI ID</label>
                  <input
                    type="text"
                    value={checkoutForm.upiId}
                    onChange={(event) => onCheckoutChange('upiId', event.target.value)}
                    placeholder="example@upi"
                    required
                  />
                </div>
              )}

              <div className="bill-preview">
                <div><span>Gross Amount</span><strong>₹ {grossAmount}</strong></div>
                <div><span>Discount ({redeemablePoints} eco points)</span><strong>- ₹ {discountInInr}</strong></div>
                <div className="bill-total"><span>Total Payable</span><strong>₹ {finalPayableAmount}</strong></div>
              </div>

              <div className="checkout-actions">
                <button type="button" className="btn-secondary" onClick={closeCheckout} disabled={processingPayment}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={processingPayment}>
                  {processingPayment ? 'Processing...' : 'Pay & Place Order'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MarketplacePage;
