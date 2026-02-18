import React from 'react';

const EcoBadgesCard = () => {
  const badges = [
    { icon: '🚗', label: 'Transport Pro', pts: '+200 pts', hexClass: 'bh1', locked: false },
    { icon: '⚡', label: 'Energy Saver', pts: '+150 pts', hexClass: 'bh2', locked: false },
    { icon: '🌳', label: 'Tree Planter', pts: '+180 pts', hexClass: 'bh3', locked: false },
    { icon: '🏃', label: 'Tree Runner', pts: '+120 pts', hexClass: 'bh4', locked: false },
    { icon: '🥦', label: 'Green Eater', pts: '+90 pts', hexClass: 'bh5', locked: false },
    { icon: '🔒', label: 'Solar Champ', pts: 'Locked', hexClass: 'bhL', locked: true },
    { icon: '🔒', label: 'Zero Waste', pts: 'Locked', hexClass: 'bhL', locked: true },
    { icon: '🔒', label: 'Bike Legend', pts: 'Locked', hexClass: 'bhL', locked: true }
  ];

  return (
    <div className="card">
      <div className="card-title">🏅 Eco Badges <a>5 / 8 earned</a></div>
      <div className="badges-grid">
        {badges.map((badge, index) => (
          <div key={index} className="badge-item" style={{ opacity: badge.locked ? '.38' : '1' }}>
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
