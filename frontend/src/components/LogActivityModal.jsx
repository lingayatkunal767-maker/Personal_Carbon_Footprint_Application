import React, { useState, useEffect } from 'react';

const CATEGORY_OPTIONS = [
  { key: 'transport', label: '🚗 Transport', factor: 40, icon: '🚗' },
  { key: 'energy', label: '⚡ Energy', factor: 25, icon: '⚡' },
  { key: 'food', label: '🍔 Food & Diet', factor: 18, icon: '🍔' },
  { key: 'shopping', label: '🛍️ Shopping', factor: 10, icon: '🛍️' },
  { key: 'offset', label: '🌳 Offset (Trees)', factor: -15, icon: '🌳' }
];

const ACTIVITY_TYPES = [
  'Car ride (petrol)',
  'Bus / Public transit',
  'Bicycle',
  'Short-haul flight',
  'Work from home'
];

const LogActivityModal = ({ isOpen, onClose, onSave }) => {
  const [category, setCategory] = useState(CATEGORY_OPTIONS[0]);
  const [activityType, setActivityType] = useState(ACTIVITY_TYPES[0]);
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('');
  const [notes, setNotes] = useState('');
  const [preview, setPreview] = useState('—');
  const [error, setError] = useState('');

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    setDate(today);
  }, []);

  useEffect(() => {
    if (amount && !isNaN(amount) && parseFloat(amount) > 0) {
      const factor = category.factor;
      const kg = (factor * parseFloat(amount) / 100).toFixed(1);
      const sign = kg > 0 ? '+' : '';
      setPreview(`${sign}${kg} kg CO₂`);
    } else {
      setPreview('—');
    }
  }, [category, amount]);

  const handleClose = () => {
    setAmount('');
    setNotes('');
    setCategory(CATEGORY_OPTIONS[0]);
    setActivityType(ACTIVITY_TYPES[0]);
    setPreview('—');
    setError('');
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

  const handleSave = () => {
    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
      setError('Please enter a valid distance or amount.');
      return;
    }

    const factor = category.factor;
    const deltaKg = (factor * parseFloat(amount)) / 100;
    const formattedDate = date ? new Date(date).toLocaleDateString() : 'Today';
    const activity = {
      id: `act-${Date.now()}`,
      icon: category.icon,
      name: `${activityType}${notes ? ` • ${notes}` : ''}`,
      time: formattedDate,
      deltaKg: Number(deltaKg.toFixed(1)),
      isPositive: deltaKg < 0,
      categoryKey: category.key
    };

    onSave(activity);
    handleClose();
  };

  return (
    <div className={`modal-overlay ${isOpen ? 'open' : ''}`} onClick={handleOverlayClick}>
      <div className="modal">
        <h3>Log an Activity</h3>
        <div className="form-row">
          <div className="form-group">
            <label>Category</label>
            <select
              value={category.key}
              onChange={(e) => {
                const selected = CATEGORY_OPTIONS.find((option) => option.key === e.target.value);
                setCategory(selected || CATEGORY_OPTIONS[0]);
              }}
            >
              {CATEGORY_OPTIONS.map((option) => (
                <option key={option.key} value={option.key}>{option.label}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Activity Type</label>
            <select value={activityType} onChange={(e) => setActivityType(e.target.value)}>
              {ACTIVITY_TYPES.map((option) => (
                <option key={option}>{option}</option>
              ))}
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
        {error && (
          <div className="emission-preview" style={{ background: '#fde8e8', borderLeft: '3px solid var(--red)' }}>
            <span>{error}</span>
          </div>
        )}
        <div className="form-group">
          <label>Notes (optional)</label>
          <input
            type="text"
            placeholder="e.g. commute to office"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>
        <div className="modal-footer">
          <button className="btn-cancel" onClick={handleClose}>Cancel</button>
          <button className="btn-save" onClick={handleSave}>💾 Save Activity</button>
        </div>
      </div>
    </div>
  );
};

export default LogActivityModal;
