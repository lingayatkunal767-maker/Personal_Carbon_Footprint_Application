import React, { useEffect, useState, useRef } from 'react';

const ProfileCard = ({ profile, onSave, className }) => {
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

  const avatarImage = previewImage || userDetails?.profilePicture || null;
  const isGoogleAccount = userDetails?.provider === 'google';

  const getJoinDate = () => {
    if (userDetails?.createdAt) {
      const date = new Date(userDetails.createdAt);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
    return profile.memberSince || 'Recently';
  };

  const getProviderBadge = () => {
    if (isGoogleAccount) {
      return (
        <span className="provider-badge provider-badge-google">
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
      <span className="provider-badge provider-badge-email">
        <span>📧</span>
        Email Account
      </span>
    );
  };

  return (
    <div className={`card${className ? ` ${className}` : ''}`}>
      <div className="card-title">
        My Profile
        <button type="button" className="card-action" onClick={() => setIsEditing((prev) => !prev)}>
          {isEditing ? 'Close' : 'Edit ✏️'}
        </button>
      </div>
      <div className="profile">
        <div className={`avatar profile-avatar ${avatarImage ? 'avatar-has-image' : ''}`}>
          {avatarImage ? (
            <img className="avatar-image" src={avatarImage} alt="Profile" />
          ) : (
            <span className="avatar-fallback">{profile.name ? profile.name.charAt(0).toUpperCase() : '👤'}</span>
          )}
          {isEditing && (
            <button type="button" className="avatar-change-overlay" onClick={() => fileInputRef.current?.click()}>
              📷 Change
            </button>
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
                className="profile-hidden-input"
              />
              
              {/* Image Upload Section */}
              <div className="profile-upload-box">
                <div className="profile-upload-title">
                  Profile Picture
                </div>
                <div className="profile-upload-actions">
                  <button 
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="profile-upload-btn"
                  >
                    📷 Upload Photo
                  </button>
                  {avatarImage && (
                    <button 
                      type="button"
                      onClick={handleRemoveImage}
                      className="profile-upload-btn profile-upload-btn-remove"
                    >
                      🗑️ Remove
                    </button>
                  )}
                </div>
                <small className="profile-upload-help">
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
                  disabled={isGoogleAccount}
                  className={isGoogleAccount ? 'profile-input-disabled' : ''}
                />
                {isGoogleAccount && (
                  <small className="profile-input-note">
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
              <div className="modal-footer profile-edit-actions">
                <button type="button" className="btn-cancel" onClick={handleCancel}>Cancel</button>
                <button type="button" className="btn-save" onClick={handleSave}>Save Profile</button>
              </div>
            </>
          ) : (
            <>
              <p className="profile-welcome">👋 Welcome back!</p>
              <h2 className="profile-name">{profile.name}</h2>
              <p className="profile-email">
                {profile.email}
              </p>
              {getProviderBadge()}
              <p className="profile-joined">
                <strong className="profile-joined-label">📅 Joined:</strong> {getJoinDate()}
              </p>
              <div className="tags profile-tags">
                {profile.tags?.map((tag) => (
                  <span key={tag} className="tag">{tag}</span>
                ))}
              </div>
              
              {/* Additional Account Info */}
              <div className="profile-account-info">
                <div className="profile-account-row">
                  <span>🌟</span>
                  <strong>Account Status:</strong> Active & Verified
                </div>
                <div className="profile-account-row">
                  <span>🔐</span>
                  <strong>Security:</strong> {isGoogleAccount ? 'Protected by Google' : 'Password Protected'}
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
