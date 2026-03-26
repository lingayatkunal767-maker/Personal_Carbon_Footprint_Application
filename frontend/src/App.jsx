import { Routes, Route, useLocation } from "react-router-dom";
import axios from "axios";
import Layout from "./components/Layout";

import LoginPage         from "./components/Login";
import RegisterPage      from "./components/RegisterPage";
import Dashboard         from "./components/Dashboard";
import OAuthSuccess      from "./components/OAuthSuccessPage";
import PrivacyPolicy     from "./pages/PrivacyPolicy";
import TermsAndConditions from "./pages/TermsAndConditions";
import OtpVerification from "./pages/OtpVerification";
import ForgotPassword  from "./components/ForgotPassword";
import ResetPassword   from "./components/ResetPassword";
import CarbonHistory   from "./components/CarbonHistory";
import LifestyleSurvey from "./components/LifeStyleSurvey";
import EcoBadgePage from "./components/EcoBadgePage";
import GoalPage from "./components/GoalPage";
import EcoMarketplace from "./components/EcoMarketplace";
import TransactionHistory from './components/TransactionHistory';
import AdminDashboard from "./components/AdminDashboard";
import Leaderboard from "./components/Leaderboard";
// Attach JWT token to every axios request automatically
axios.interceptors.request.use(config => {
  const token = localStorage.getItem("token");
  if (token) config.headers["Authorization"] = `Bearer ${token}`;
  return config;
});

// If any request returns 401, clear storage and redirect to login
axios.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/";
    }
    return Promise.reject(err);
  }
);

function VerifiedBanner() {
  const location = useLocation();
  if (location.state?.verified) {
    return (
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 px-6 py-3 bg-emerald-600 text-white rounded-2xl shadow-xl font-semibold text-sm">
        ✅ Email verified! Please login.
      </div>
    );
  }
  return null;
}

function App() {
  return (
    <Routes>
      {/* ── Auth pages (no Layout/sidebar) ── */}
      <Route path="/"                element={<><VerifiedBanner /><LoginPage /></>} />
      <Route path="/signup"          element={<RegisterPage />} />
      <Route path="/verify-otp"      element={<OtpVerification />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password"  element={<ResetPassword />} />
      <Route path="/oauth-success"   element={<OAuthSuccess />} />

      {/* ── Admin (no Layout — full screen) ── */}
      <Route path="/admin-dashboard" element={<AdminDashboard />} />



      {/* ── Authenticated pages (with Layout/sidebar) ── */}
      <Route element={<Layout />}>
      
      <Route path="/oauth-success" element={<OAuthSuccess />} />
      <Route path="/dashboard" element={<Dashboard />} />

      <Route path="/goals" element={<GoalPage />} />
      
        <Route path="/badges" element={<EcoBadgePage />} /> 
        <Route path="/badges/:type" element={<EcoBadgePage />} /> 
        
      <Route path="/history" element={<CarbonHistory />} />
      <Route path="/survey" element={<LifestyleSurvey />} />
      
      <Route path="/leaderboard"     element={<Leaderboard />} />

      <Route path="/marketplace" element={<EcoMarketplace />} />
      <Route path="/transhistory" element={<TransactionHistory />} />

      </Route>

      {/* ── Legal ── */}
      <Route path="/privacy-policy"  element={<PrivacyPolicy />} />
      <Route path="/terms"           element={<TermsAndConditions />} />

      {/* ── 404 ── */}
      <Route path="*" element={
        <div className="flex h-screen items-center justify-center font-bold text-slate-600">
          404 - Page Not Found
        </div>
      } />
    </Routes>
  );
}

export default App;
