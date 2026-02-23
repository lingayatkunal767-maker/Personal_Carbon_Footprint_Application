import React, { useEffect, useState, useRef } from 'react';

const ProfileCard = ({ profile, onSave }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState(profile);
  const [userDetails, setUserDetails] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    setForm(profile);
    setPreviewImage(null);
    
    // Get full user details from localStorage
    const currentUser = localStorage.getItem('current_user');
    const registeredUsers = localStorage.getItem('registered_users');
    
    if (currentUser) {
      try {
        const user = JSON.parse(currentUser);
        const allUsers = registeredUsers ? JSON.parse(registeredUsers) : [];
        const fullUserData = allUsers.find(u => u.email?.toLowerCase() === user.email?.toLowerCase());
        
        setUserDetails({
          ...user,
          provider: fullUserData?.provider || 'email',
          profilePicture: fullUserData?.profilePicture || user.profilePicture,
          createdAt: fullUserData?.createdAt,
          googleId: fullUserData?.googleId
        });
      } catch (err) {
        console.error('Error loading user details:', err);
      }
    }
  }, [profile]);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }
      
      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        alert('Image size should be less than 2MB');
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
        setForm((prev) => ({ ...prev, profilePicture: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setPreviewImage(null);
    setForm((prev) => ({ ...prev, profilePicture: null }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCancel = () => {
    setForm(profile);
    setPreviewImage(null);
    setIsEditing(false);
  };

  const handleSave = () => {
    if (!form.name.trim() || !form.email.trim()) {
      return;
    }
    
    // Include profile picture in save
    const updatedProfile = {
      ...form,
      name: form.name.trim(),
      email: form.email.trim(),
      profilePicture: previewImage || userDetails?.profilePicture || form.profilePicture
    };
    
    onSave(updatedProfile);
    setIsEditing(false);
    setPreviewImage(null);
  };

  const getJoinDate = () => {
    if (userDetails?.createdAt) {
      const date = new Date(userDetails.createdAt);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
    return profile.memberSince || 'Recently';
  };

  const getProviderBadge = () => {
    if (userDetails?.provider === 'google') {
      return (
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
          padding: '4px 10px',
          background: 'linear-gradient(135deg, #4285f4 0%, #34a853 100%)',
          color: 'white',
          borderRadius: '12px',
          fontSize: '0.7rem',
          fontWeight: '600',
          marginTop: '8px'
        }}>
          <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
            <path d="M19.6 10.227c0-.709-.064-1.39-.182-2.045H10v3.868h5.382a4.6 4.6 0 01-1.996 3.018v2.51h3.232c1.891-1.742 2.982-4.305 2.982-7.35z" fill="#fff"/>
            <path d="M10 20c2.7 0 4.964-.895 6.618-2.423l-3.232-2.509c-.895.6-2.04.955-3.386.955-2.605 0-4.81-1.76-5.595-4.123H1.064v2.59A9.996 9.996 0 0010 20z" fill="#fff"/>
            <path d="M4.405 11.9c-.2-.6-.314-1.24-.314-1.9 0-.66.114-1.3.314-1.9V5.51H1.064A9.996 9.996 0 000 10c0 1.614.386 3.14 1.064 4.49L4.405 11.9z" fill="#fff"/>
            <path d="M10 3.977c1.468 0 2.786.505 3.823 1.496l2.868-2.868C14.959.99 12.695 0 10 0 6.09 0 2.71 2.24 1.064 5.51l3.34 2.59C5.192 5.737 7.396 3.977 10 3.977z" fill="#fff"/>
          </svg>
          Google Account
        </span>
      );
    }
    return (
      <span style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        padding: '4px 10px',
        background: 'linear-gradient(135deg, #2d7a4f 0%, #5aaa72 100%)',
        color: 'white',
        borderRadius: '12px',
        fontSize: '0.7rem',
        fontWeight: '600',
        marginTop: '8px'
      }}>
        <span>📧</span>
        Email Account
      </span>
    );
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
        <div className="avatar" style={{
          background: (previewImage || userDetails?.profilePicture)
            ? `url(${previewImage || userDetails.profilePicture}) center/cover` 
            : 'linear-gradient(135deg, #2d7a4f 0%, #5aaa72 100%)',
          fontSize: (previewImage || userDetails?.profilePicture) ? '0' : '2.5rem',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          position: 'relative'
        }}>
          {!(previewImage || userDetails?.profilePicture) && (profile.name ? profile.name.charAt(0).toUpperCase() : '👤')}
          {isEditing && (
            <div style={{
              position: 'absolute',
              bottom: '0',
              left: '0',
              right: '0',
              background: 'rgba(0,0,0,0.7)',
              color: 'white',
              padding: '8px',
              fontSize: '0.7rem',
              textAlign: 'center',
              cursor: 'pointer'
            }} onClick={() => fileInputRef.current?.click()}>
              📷 Change
            </div>
          )}
        </div>
        <div className="profile-info">
          {isEditing ? (
            <>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                style={{ display: 'none' }}
              />
              
              {/* Image Upload Section */}
              <div style={{ 
                marginBottom: '16px',
                padding: '12px',
                background: '#f8f9fa',
                borderRadius: '8px',
                border: '2px dashed #dee2e6'
              }}>
                <div style={{ 
                  fontSize: '0.85rem',
                  color: '#495057',
                  marginBottom: '8px',
                  fontWeight: '600'
                }}>
                  Profile Picture
                </div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <button 
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      padding: '6px 12px',
                      background: 'linear-gradient(135deg, #2d7a4f 0%, #5aaa72 100%)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '0.8rem',
                      fontWeight: '600'
                    }}
                  >
                    📷 Upload Photo
                  </button>
                  {(previewImage || userDetails?.profilePicture) && (
                    <button 
                      type="button"
                      onClick={handleRemoveImage}
                      style={{
                        padding: '6px 12px',
                        background: '#dc3545',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '0.8rem',
                        fontWeight: '600'
                      }}
                    >
                      🗑️ Remove
                    </button>
                  )}
                </div>
                <small style={{ 
                  display: 'block',
                  marginTop: '6px',
                  fontSize: '0.7rem',
                  color: '#6c757d'
                }}>
                  Max size: 2MB • Formats: JPG, PNG, GIF
                </small>
              </div>

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
                  disabled={userDetails?.provider === 'google'}
                  style={{
                    opacity: userDetails?.provider === 'google' ? 0.6 : 1,
                    cursor: userDetails?.provider === 'google' ? 'not-allowed' : 'text'
                  }}
                />
                {userDetails?.provider === 'google' && (
                  <small style={{ fontSize: '0.7rem', color: '#666', marginTop: '4px', display: 'block' }}>
                    Email cannot be changed for Google accounts
                  </small>
                )}
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
              <h2 style={{ marginBottom: '4px' }}>{profile.name}</h2>
              <p style={{ 
                fontSize: '0.9rem', 
                color: '#666',
                marginBottom: '2px',
                wordBreak: 'break-word'
              }}>
                {profile.email}
              </p>
              {getProviderBadge()}
              <p style={{ 
                marginTop: '12px', 
                fontSize: '0.8rem', 
                color: 'var(--muted)',
                padding: '8px 12px',
                background: '#f5f5f5',
                borderRadius: '8px',
                display: 'inline-block'
              }}>
                <strong style={{ color: 'var(--text)' }}>📅 Joined:</strong> {getJoinDate()}
              </p>
              <div className="tags" style={{ marginTop: '12px' }}>
                {profile.tags?.map((tag) => (
                  <span key={tag} className="tag">{tag}</span>
                ))}
              </div>
              
              {/* Additional Account Info */}
              <div style={{ 
                marginTop: '16px', 
                padding: '12px', 
                background: 'linear-gradient(135deg, #f0f9f4 0%, #e8f5e9 100%)',
                borderRadius: '10px',
                fontSize: '0.75rem',
                color: '#2d7a4f'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                  <span>🌟</span>
                  <strong>Account Status:</strong> Active & Verified
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>🔐</span>
                  <strong>Security:</strong> {userDetails?.provider === 'google' ? 'Protected by Google' : 'Password Protected'}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;
