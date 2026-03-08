import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";

import LoginPage from "./components/Login";
import RegisterPage from "./components/RegisterPage";
import Dashboard from "./components/Dashboard";
import OAuthSuccess from "./components/OAuthSuccessPage";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsAndConditions from "./pages/TermsAndConditions";
import OtpVerification from "./pages/OtpVerification";

import ForgotPassword from "./components/ForgotPassword";
import ResetPassword from "./components/ResetPassword";

import CarbonHistory from "./components/CarbonHistory";
import LifestyleSurvey from "./components/LifeStyleSurvey";

import EcoBadgePage from "./components/EcoBadgePage";
import GoalPage from "./components/GoalPage";

import axios from 'axios';

// Important for session-based OAuth or cookies if your backend uses them
axios.defaults.withCredentials = true; 

function App() {
  return (
    <Routes>
      {/* Auth Core */}
      <Route path="/" element={<LoginPage />} />
      <Route path="/signup" element={<RegisterPage />} />
      <Route path="/verify-otp" element={<OtpVerification />} />
      
      {/* Password Recovery */}
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* Post-Auth */}
      <Route element={<Layout />}>
      
      <Route path="/oauth-success" element={<OAuthSuccess />} />
      <Route path="/dashboard" element={<Dashboard />} />

      <Route path="/goals" element={<GoalPage />} />

      <Route path="/badges/:type" element={<EcoBadgePage />} />
      <Route path="/history" element={<CarbonHistory />} />
      <Route path="/survey" element={<LifestyleSurvey />} />

      </Route>

      {/* Legal & Static */}
      <Route path="/privacy-policy" element={<PrivacyPolicy />} />
      <Route path="/terms" element={<TermsAndConditions />} />

      {/* 404 Catch-all */}
      <Route path="*" element={<div className="flex h-screen items-center justify-center font-bold text-slate-600">404 - Page Not Found</div>} />
    </Routes>
  );
}

export default App;