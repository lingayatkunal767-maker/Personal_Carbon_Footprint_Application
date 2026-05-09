import React from 'react';

const EcoTips = ({ tips = [], onRefresh, meta }) => {
  const safeTips = Array.isArray(tips) ? tips : [];

  return (
    <div className="card tips-card">
      <div className="card-title">
        💡 Eco Tips For You
        <button className="card-action" onClick={onRefresh}>Refresh ↻</button>
      </div>
      <small style={{ color: 'var(--muted)' }}>
        {meta?.datasetConnected
          ? `Powered by ${meta.datasetRecords || 0} dataset records`
          : 'Dataset insights unavailable'}
      </small>
      <div className="tips-list">
        {safeTips.length === 0 ? (
          <div className="card-empty">
            Complete the lifestyle survey to unlock dataset-backed eco tips.
          </div>
        ) : (
          safeTips.map((tip) => (
            <div key={tip.id} className="tip-card">
              <div className="tip-icon" style={{ background: tip.bg }}>{tip.icon}</div>
              <div className="tip-body">
                <p>{tip.title}</p>
                <small>{tip.description}</small>
                <span className="tip-save">{tip.savings}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default EcoTips;
