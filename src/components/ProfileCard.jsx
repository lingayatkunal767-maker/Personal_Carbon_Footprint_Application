import React, { useEffect, useState } from 'react';

const ProfileCard = ({ profile, onSave }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState(profile);

  useEffect(() => {
    setForm(profile);
  }, [profile]);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleCancel = () => {
    setForm(profile);
    setIsEditing(false);
  };

  const handleSave = () => {
    if (!form.name.trim() || !form.email.trim()) {
      return;
    }
    onSave({ ...form, name: form.name.trim(), email: form.email.trim() });
    setIsEditing(false);
  };

  return (
    <div className="card">
      <div className="card-title">
        My Profile
        <button className="card-action" onClick={() => setIsEditing((prev) => !prev)}>
          {isEditing ? 'Close' : 'Edit ✏️'}
        </button>
      </div>
      <div className="profile">
        <div className="avatar">👤</div>
        <div className="profile-info">
          {isEditing ? (
            <>
              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Member Since</label>
                <input
                  type="text"
                  value={form.memberSince}
                  onChange={(e) => handleChange('memberSince', e.target.value)}
                />
              </div>
              <div className="modal-footer" style={{ marginTop: '.6rem' }}>
                <button className="btn-cancel" onClick={handleCancel}>Cancel</button>
                <button className="btn-save" onClick={handleSave}>Save Profile</button>
              </div>
            </>
          ) : (
            <>
              <h2>{profile.name}</h2>
              <p>{profile.email}</p>
              <p style={{ marginTop: '.2rem', fontSize: '.8rem', color: 'var(--muted)' }}>
                <strong style={{ color: 'var(--text)' }}>Member Since:</strong> {profile.memberSince}
              </p>
              <div className="tags">
                {profile.tags?.map((tag) => (
                  <span key={tag} className="tag">{tag}</span>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;
