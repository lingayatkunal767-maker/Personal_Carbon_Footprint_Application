import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import LifestyleSurvey from "./pages/LifestyleSurvey";
import CarbonHistory from "./pages/CarbonHistory";
import CarbonLogDetails from "./pages/CarbonLogDetails";
import Profile from "./pages/Profile";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import OAuth2RedirectHandler from "./pages/OAuth2RedirectHandler";
import Badges from "./pages/Badges";
import Leaderboard from "./pages/Leaderboard";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/survey" element={<LifestyleSurvey />} />
        <Route path="/lifestyle-survey" element={<Navigate to="/survey" replace />} />
        <Route path="/carbon-history" element={<CarbonHistory />} />
        <Route path="/carbon-details/:id" element={<CarbonLogDetails />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/badges" element={<Badges />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/oauth2/redirect" element={<OAuth2RedirectHandler />} />
      </Routes>
    </Router>
  );
}

export default App;
