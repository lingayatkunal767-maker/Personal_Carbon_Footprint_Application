import React from 'react';

const ProfileCard = ({ userName, userEmail, memberSince }) => {
  return (
    <div className="card">
      <div className="card-title">My Profile <a>Edit ✏️</a></div>
      <div className="profile">
        <div className="avatar">👤</div>
        <div className="profile-info">
          <h2>{userName}</h2>
          <p>{userEmail}</p>
          <p style={{ marginTop: '.2rem', fontSize: '.8rem', color: 'var(--muted)' }}>
            <strong style={{ color: 'var(--text)' }}>Member Since:</strong> {memberSince}
          </p>
          <div className="tags">
            <span className="tag">🌿 Eco Hero</span>
            <span className="tag">🚗 Transport Pro</span>
            <span className="tag">⚡ Energy Saver</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;
