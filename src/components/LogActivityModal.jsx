import React, { useState, useEffect } from 'react';

const LogActivityModal = ({ isOpen, onClose }) => {
  const [category, setCategory] = useState('40');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('');
  const [preview, setPreview] = useState('—');

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    setDate(today);
  }, []);

  useEffect(() => {
    if (amount && !isNaN(amount) && parseFloat(amount) > 0) {
      const factor = parseFloat(category);
      const kg = (factor * parseFloat(amount) / 100).toFixed(1);
      const sign = kg > 0 ? '+' : '';
      setPreview(`${sign}${kg} kg CO₂`);
    } else {
      setPreview('—');
    }
  }, [category, amount]);

  const handleClose = () => {
    setAmount('');
    setPreview('—');
    onClose();
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  const getPreviewColor = () => {
    if (preview === '—') return 'var(--g-dark)';
    return parseFloat(preview) > 0 ? 'var(--red)' : 'var(--g-mid)';
  };

  return (
    <div className={`modal-overlay ${isOpen ? 'open' : ''}`} onClick={handleOverlayClick}>
      <div className="modal">
        <h3>Log an Activity</h3>
        <div className="form-row">
          <div className="form-group">
            <label>Category</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="40">🚗 Transport</option>
              <option value="25">⚡ Energy</option>
              <option value="18">🍔 Food & Diet</option>
              <option value="10">🛍️ Shopping</option>
              <option value="-15">🌳 Offset (Trees)</option>
            </select>
          </div>
          <div className="form-group">
            <label>Activity Type</label>
            <select>
              <option>Car ride (petrol)</option>
              <option>Bus / Public transit</option>
              <option>Bicycle</option>
              <option>Short-haul flight</option>
              <option>Work from home</option>
            </select>
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Distance / Amount</label>
            <input
              type="number"
              placeholder="e.g. 25 km"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
        </div>
        <div className="emission-preview">
          <span>Estimated CO₂ Impact</span>
          <strong style={{ color: getPreviewColor() }}>{preview}</strong>
        </div>
        <div className="form-group">
          <label>Notes (optional)</label>
          <input type="text" placeholder="e.g. commute to office" />
        </div>
        <div className="modal-footer">
          <button className="btn-cancel" onClick={handleClose}>Cancel</button>
          <button className="btn-save" onClick={handleClose}>💾 Save Activity</button>
        </div>
      </div>
    </div>
  );
};

export default LogActivityModal;
