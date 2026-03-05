import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import LifestyleSurvey from "./pages/LifestyleSurvey";
import CarbonHistory from "./pages/CarbonHistory";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Landing page */}
        <Route path="/" element={<Home />} />

        {/* Auth Routes */}
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Dashboard */}
        <Route path="/dashboard" element={<Dashboard />} />

        {/* Lifestyle Survey */}
        <Route path="/lifestyle-survey" element={<LifestyleSurvey />} />

        {/* Carbon History */}
        <Route path="/carbon-history" element={<CarbonHistory />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
