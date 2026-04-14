import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI, extractApiErrorMessage } from '../services/api';

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    console.log('🔐 Auth Callback - Processing authentication...');
    console.log('   Current URL:', window.location.href);
    console.log('   Hash:', window.location.hash);
    
    // Handle OAuth redirect callback.
    const hash = window.location.hash;

    if (hash.includes('id_token')) {
      try {
        const params = new URLSearchParams(hash.substring(1));
        const idToken = params.get('id_token');

        if (idToken) {
          authAPI.googleAuth({ idToken })
            .then((data) => {
              const session = {
                id: data.userId,
                name: data.name,
                email: data.email,
                profilePicture: data.profilePicture,
                role: data.role || 'USER',
                active: data.active !== false,
              };

              localStorage.setItem('current_user', JSON.stringify(session));
              localStorage.setItem('auth_token', 'authenticated');

              const target = (session.role || '').toUpperCase() === 'ADMIN' ? '/admin/home' : '/home';
              navigate(target);
            })
            .catch(error => {
              console.error('❌ Authentication error:', error);
              alert(`Authentication failed: ${extractApiErrorMessage(error, 'Google login failed')}`);
              navigate('/login');
            });
        } else {
          console.error('❌ No ID token found in URL');
          alert('Authentication failed: No ID token received. Please try again.');
          navigate('/login');
        }
      } catch (error) {
        console.error('❌ Authentication error:', error);
        alert('Authentication failed: ' + error.message);
        navigate('/login');
      }
    } else if (hash.includes('access_token')) {
      alert('Google redirect flow returned only access token. Please use the main Google Sign-In button again.');
      navigate('/login');
    } else if (hash.includes('error')) {
      // Handle OAuth errors
      const params = new URLSearchParams(hash.substring(1));
      const error = params.get('error');
      const errorDescription = params.get('error_description');
      
      console.error('❌ OAuth Error:', error, errorDescription);
      alert(`Google Sign-In Error: ${errorDescription || error || 'Unknown error'}\n\nPlease check:\n1. Redirect URI is configured in Google Cloud Console\n2. Using correct Google account\n3. See GOOGLE_AUTH_SETUP.md for setup instructions`);
      navigate('/login');
    } else {
      // No access token or error found, redirect to login
      console.warn('⚠️ No authentication data found in URL, redirecting to login');
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

        @media (orientation: landscape) and (max-height: 430px) and (max-width: 900px) {
          .auth-callback-container {
            padding: 0.75rem 1rem;
          }

          .spinner-large {
            width: 36px;
            height: 36px;
            border-width: 3px;
            margin-bottom: 0.6rem;
          }

          .auth-icon {
            font-size: 1.6rem;
            margin-bottom: 0.35rem;
          }

          .auth-message {
            font-size: 0.8rem;
          }
        }

        @media (max-width: 560px) {
          .auth-callback-container {
            padding: 1rem;
          }

          .spinner-large {
            width: 48px;
            height: 48px;
            margin-bottom: 1.2rem;
          }

          .auth-icon {
            font-size: 2.4rem;
            margin-bottom: 0.75rem;
          }

          .auth-message {
            font-size: 1rem;
          }
        }

        @media (max-width: 375px) {
          .spinner-large {
            width: 42px;
            height: 42px;
            border-width: 3px;
          }

          .auth-icon {
            font-size: 2rem;
          }

          .auth-message {
            font-size: 0.88rem;
          }
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
