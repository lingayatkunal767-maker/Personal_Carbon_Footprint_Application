import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    // Handle OAuth redirect (when Google One Tap is skipped)
    const hash = window.location.hash;
    
    if (hash.includes('access_token')) {
      try {
        // Extract access token from URL hash
        const params = new URLSearchParams(hash.substring(1));
        const accessToken = params.get('access_token');
        
        if (accessToken) {
          // Store token (in production, send to backend for validation)
          localStorage.setItem('auth_token', accessToken);
          
          // Fetch user info from Google
          fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
            headers: {
              'Authorization': `Bearer ${accessToken}`
            }
          })
            .then(res => res.json())
            .then(userInfo => {
              // Store user info
              localStorage.setItem('user_info', JSON.stringify(userInfo));
              
              // Redirect to home
              navigate('/home');
            })
            .catch(error => {
              console.error('Error fetching user info:', error);
              navigate('/login');
            });
        } else {
          navigate('/login');
        }
      } catch (error) {
        console.error('Authentication error:', error);
        navigate('/login');
      }
    } else {
      // No access token found, redirect to login
      navigate('/login');
    }
  }, [navigate]);

  return (
    <>
      <style>{`
        .auth-callback-container {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #1a3d2b 0%, #2e5e42 100%);
          font-family: 'DM Sans', sans-serif;
        }

        .spinner-large {
          width: 60px;
          height: 60px;
          border: 4px solid rgba(137, 187, 151, 0.3);
          border-top-color: #89bb97;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
          margin-bottom: 2rem;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .auth-message {
          font-size: 1.3rem;
          color: #c8dece;
          font-weight: 300;
          text-align: center;
        }

        .auth-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
        }
      `}</style>

      <div className="auth-callback-container">
        <div className="auth-icon">🌿</div>
        <div className="spinner-large"></div>
        <div className="auth-message">Authenticating your account...</div>
      </div>
    </>
  );
}
