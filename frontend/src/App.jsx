import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import LifestyleSurvey from "./pages/LifestyleSurvey";
import CarbonHistory from "./pages/CarbonHistory";
import CreateGoal from "./pages/CreateGoal";
import Layout from "./Layout";
import GoalDetails from "./pages/GoalDetails";
import Badges from "./pages/Badges";
import Leaderboard from "./pages/Leaderboard";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Protected / Layout Routes */}
        <Route element={<Layout />}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="lifestyle-survey" element={<LifestyleSurvey />} />
          <Route path="carbon-history" element={<CarbonHistory />} />
          <Route path="create-goal" element={<CreateGoal />} />
          <Route path="badges" element={<Badges />} />
          <Route path="leaderboard" element={<Leaderboard />} />
          <Route path="goal-details/:id" element={<GoalDetails />} />
        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;