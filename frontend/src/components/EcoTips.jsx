import React from 'react';

const EcoTips = ({ tips, onRefresh }) => {
  return (
    <div className="card">
      <div className="card-title">
        💡 Eco Tips For You
        <button className="card-action" onClick={onRefresh}>Refresh ↻</button>
      </div>
      <div className="tips-list">
        {tips.map((tip) => (
          <div key={tip.id} className="tip-card">
            <div className="tip-icon" style={{ background: tip.bg }}>{tip.icon}</div>
            <div className="tip-body">
              <p>{tip.title}</p>
              <small>{tip.description}</small>
              <span className="tip-save">{tip.savings}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EcoTips;
