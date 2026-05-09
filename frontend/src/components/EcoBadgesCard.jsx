import React from 'react';

const EcoBadgesCard = ({ badges = [] }) => {
  const badgeList = Array.isArray(badges) ? badges : [];
  const earnedCount = badgeList.filter((badge) => !badge.locked).length;

  return (
    <div className="card">
      <div className="card-title">🏅 Eco Badges <a>{earnedCount} / {badgeList.length} earned</a></div>
      {badgeList.length === 0 ? (
        <div className="card-empty">No badge definitions available yet.</div>
      ) : (
        <div className="badges-grid">
          {badgeList.map((badge) => (
            <div key={badge.id} className="badge-item" style={{ opacity: badge.locked ? '.38' : '1' }}>
              <div className={`badge-hex ${badge.hexClass}`}>{badge.icon}</div>
              <span className="badge-label">{badge.label}</span>
              <span className="badge-pts">{badge.pts}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EcoBadgesCard;
