import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Dashboard.css";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:8080";

function Dashboard() {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/");
      return;
    }

    const fetchProtectedData = async () => {
      try {
        const response = await axios.get(
          `${API_BASE}/api/auth/api/test`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        console.log("Protected API Response:", response.data);

      } catch (error) {
        console.log("Unauthorized or Token expired");
        localStorage.removeItem("token");
        navigate("/");
      }
    };

    fetchProtectedData();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <div className="dashboard-container">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <span className="sidebar-logo-icon">🍃</span>
          <span className="sidebar-logo-text">CarbonCalc</span>
        </div>
        <nav className="sidebar-nav">
          <a href="#dashboard" className="nav-item active">
            <span className="nav-icon">◉</span>
            <span>Dashboard</span>
          </a>
          <a href="#emissions" className="nav-item">
            <span className="nav-icon">📊</span>
            <span>My Emissions</span>
          </a>
          <a href="#reports" className="nav-item">
            <span className="nav-icon">📈</span>
            <span>Reports</span>
          </a>
          <a href="#settings" className="nav-item">
            <span className="nav-icon">⚙</span>
            <span>Settings</span>
          </a>
        </nav>
      </aside>

      <main className="main-content">
        <header className="dashboard-header">
          <div className="header-left">
            <h1 className="welcome-title">Welcome back</h1>
            <p className="welcome-subtitle">Track and reduce your carbon footprint</p>
          </div>
          <button type="button" className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </header>

        <section className="stats-grid">
          <div className="stat-card stat-card-total">
            <div className="stat-icon">🌍</div>
            <div className="stat-body">
              <span className="stat-label">Total CO₂</span>
              <span className="stat-value">120 kg</span>
            </div>
          </div>
          <div className="stat-card stat-card-month">
            <div className="stat-icon">📅</div>
            <div className="stat-body">
              <span className="stat-label">This month</span>
              <span className="stat-value">30 kg</span>
            </div>
          </div>
          <div className="stat-card stat-card-goal">
            <div className="stat-icon">🎯</div>
            <div className="stat-body">
              <span className="stat-label">Goal progress</span>
              <span className="stat-value">65%</span>
            </div>
          </div>
        </section>

        <section className="add-emission-section">
          <h2 className="section-title">Add new emission</h2>
          <form className="add-emission-form">
            <input type="text" placeholder="Activity (e.g. car trip, flight)" className="form-input" />
            <input type="number" placeholder="CO₂ (kg)" className="form-input" min="0" step="0.1" />
            <button type="submit" className="form-submit">Add</button>
          </form>
        </section>

        <section className="quick-tips">
          <h2 className="section-title">Quick tips</h2>
          <ul className="tips-list">
            <li>Walk or cycle for short trips to cut transport emissions.</li>
            <li>Lower heating by 1°C to save energy and CO₂.</li>
            <li>Choose local produce to reduce food miles.</li>
          </ul>
        </section>
      </main>
    </div>
  );
}

export default Dashboard;
