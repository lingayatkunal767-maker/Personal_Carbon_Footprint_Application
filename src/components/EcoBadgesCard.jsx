import React from 'react';

const EcoBadgesCard = ({ badges }) => {
  const earnedCount = badges.filter((badge) => !badge.locked).length;

  return (
    <div className="card">
      <div className="card-title">🏅 Eco Badges <a>{earnedCount} / {badges.length} earned</a></div>
      <div className="badges-grid">
        {badges.map((badge) => (
          <div key={badge.id} className="badge-item" style={{ opacity: badge.locked ? '.38' : '1' }}>
            <div className={`badge-hex ${badge.hexClass}`}>{badge.icon}</div>
            <span className="badge-label">{badge.label}</span>
            <span className="badge-pts">{badge.pts}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EcoBadgesCard;
