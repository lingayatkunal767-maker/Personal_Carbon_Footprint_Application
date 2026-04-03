import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import HomePage from './pages/HomePage';
import SurveyPage from './pages/SurveyPage';
import AuthCallback from './pages/AuthCallback';
import CarbonHistoryPage from './pages/CarbonHistoryPage';
import MarketplacePage from './pages/MarketplacePage';
import PurchaseHistoryPage from './pages/PurchaseHistoryPage';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminSignUpPage from './pages/AdminSignUpPage';
import AdminHomePage from './pages/AdminHomePage';

const USER_ROLE = 'USER';
const ADMIN_ROLE = 'ADMIN';

function readSession() {
  const token = localStorage.getItem('auth_token');
  const raw = localStorage.getItem('current_user');

  if (!token || !raw) return null;

  try {
    const session = JSON.parse(raw);
    if (!session || session.active === false) return null;
    return session;
  } catch {
    return null;
  }
}

function roleFromSession(session) {
  return (session?.role || USER_ROLE).toUpperCase();
}

function homePathForSession(session) {
  return roleFromSession(session) === ADMIN_ROLE ? '/admin/home' : '/home';
}

function RootRedirect() {
  const session = readSession();
  return <Navigate to={session ? homePathForSession(session) : '/login'} replace />;
}

function PublicOnlyRoute({ children }) {
  const session = readSession();
  if (session) {
    return <Navigate to={homePathForSession(session)} replace />;
  }
  return children;
}

function ProtectedRoute({ children, requiredRole }) {
  const session = readSession();

  if (!session) {
    const loginPath = requiredRole === ADMIN_ROLE ? '/admin/login' : '/login';
    return <Navigate to={loginPath} replace />;
  }

  const currentRole = roleFromSession(session);
  if (requiredRole && currentRole !== requiredRole) {
    return <Navigate to={homePathForSession(session)} replace />;
  }

  return children;
}

function App() {
  return (
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <Routes>
        {/* Redirect root based on session */}
        <Route path="/" element={<RootRedirect />} />
        
        {/* Login page */}
        <Route path="/login" element={<PublicOnlyRoute><LoginPage /></PublicOnlyRoute>} />

        {/* Admin login page */}
        <Route path="/admin/login" element={<PublicOnlyRoute><AdminLoginPage /></PublicOnlyRoute>} />
        
        {/* Sign up page */}
        <Route path="/signup" element={<PublicOnlyRoute><SignUpPage /></PublicOnlyRoute>} />

        {/* Admin sign up page */}
        <Route path="/admin/signup" element={<PublicOnlyRoute><AdminSignUpPage /></PublicOnlyRoute>} />
        
        {/* Dashboard/Home page (after login) */}
        <Route
          path="/home"
          element={
            <ProtectedRoute requiredRole={USER_ROLE}>
              <HomePage />
            </ProtectedRoute>
          }
        />

        {/* Admin dashboard/home */}
        <Route
          path="/admin/home"
          element={
            <ProtectedRoute requiredRole={ADMIN_ROLE}>
              <AdminHomePage />
            </ProtectedRoute>
          }
        />

        {/* Carbon History page */}
        <Route path="/history" element={<CarbonHistoryPage />} />
        
        {/* Lifestyle Survey page */}
        <Route path="/survey" element={<SurveyPage />} />

        {/* Marketplace page */}
        <Route
          path="/marketplace"
          element={
            <ProtectedRoute requiredRole={USER_ROLE}>
              <MarketplacePage />
            </ProtectedRoute>
          }
        />

        {/* Purchase History page */}
        <Route
          path="/purchase-history"
          element={
            <ProtectedRoute requiredRole={USER_ROLE}>
              <PurchaseHistoryPage />
            </ProtectedRoute>
          }
        />

        {/* OAuth callback handler */}
        <Route path="/auth/callback" element={<AuthCallback />} />
        
        {/* Catch all - redirect to login */}
        <Route path="*" element={<RootRedirect />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
