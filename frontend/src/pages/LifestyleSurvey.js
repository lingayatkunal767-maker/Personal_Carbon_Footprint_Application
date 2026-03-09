import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import AppLayout from "../components/AppLayout";
import "./LifestyleSurvey.css";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:8080";

const TRANSPORT_OPTIONS = [
  { value: "car", label: "Car" },
  { value: "bike", label: "Bike" },
  { value: "public", label: "Public Transport" },
  { value: "walk", label: "Walk" },
  { value: "wfh", label: "Work from home" },
];

const FUEL_OPTIONS = [
  { value: "petrol", label: "Petrol" },
  { value: "diesel", label: "Diesel" },
  { value: "electric", label: "Electric" },
  { value: "hybrid", label: "Hybrid" },
];

const DIET_OPTIONS = [
  { value: "vegetarian", label: "Vegetarian" },
  { value: "non-vegetarian", label: "Non-Vegetarian" },
  { value: "vegan", label: "Vegan" },
];

const EAT_OUTSIDE_OPTIONS = [
  { value: "rarely", label: "Rarely" },
  { value: "weekly", label: "1–2 times per week" },
  { value: "often", label: "Several times per week" },
  { value: "daily", label: "Daily" },
];

const initialForm = {
  primaryMode: "",
  dailyDistanceKm: "",
  fuelType: "",
  dietType: "",
  mealsPerDay: "",
  eatOutside: "",
  monthlyElectricityKwh: "",
  renewableEnergy: false,
};

function LifestyleSurvey() {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const showFuelType = form.primaryMode === "car";

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/");
      return;
    }
    const check = async () => {
      try {
        await axios.get(`${API_BASE}/api/auth/api/test`, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch {
        localStorage.removeItem("token");
        navigate("/");
      }
    };
    check();
  }, [navigate]);

  useEffect(() => {
    if (form.primaryMode !== "car") {
      setForm((p) => ({ ...p, fuelType: "" }));
    }
  }, [form.primaryMode]);

  const noTravel = form.primaryMode === "wfh";

  const validate = () => {
    const next = {};
    if (!form.primaryMode.trim()) next.primaryMode = "Required.";
    const dist = parseFloat(form.dailyDistanceKm, 10);
    if (noTravel) {
      if (form.dailyDistanceKm !== "" && !isNaN(dist) && dist < 0) {
        next.dailyDistanceKm = "Enter 0 or leave empty if you don't travel.";
      }
    } else {
      if (form.dailyDistanceKm === "" || isNaN(dist) || dist < 0) {
        next.dailyDistanceKm = "Enter distance in km (0 or more).";
      }
    }
    if (showFuelType && !form.fuelType.trim()) next.fuelType = "Required when transport is Car.";
    if (!form.dietType.trim()) next.dietType = "Required.";
    const meals = parseInt(form.mealsPerDay, 10);
    if (form.mealsPerDay === "" || isNaN(meals) || meals < 1 || meals > 6) {
      next.mealsPerDay = "Enter between 1 and 6 (typical meals per day).";
    }
    if (!form.eatOutside.trim()) next.eatOutside = "Required.";
    const kwh = parseFloat(form.monthlyElectricityKwh, 10);
    if (form.monthlyElectricityKwh === "" || isNaN(kwh) || kwh < 0) {
      next.monthlyElectricityKwh = "Enter your monthly usage in kWh (0 if off-grid or unknown).";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setErrors({});
    try {
 await axios.post(
  `${API_BASE}/api/survey`,
  {
    transportMode: form.primaryMode.toUpperCase(),
    distancePerDay: parseFloat(form.dailyDistanceKm || 0),
    fuelType: form.fuelType ? form.fuelType.toUpperCase() : null,

    dietType:
      form.dietType === "vegetarian"
        ? "VEG"
        : form.dietType === "non-vegetarian"
        ? "NON_VEG"
        : "VEGAN",

    mealsPerDay: parseInt(form.mealsPerDay),

    eatingOutFrequency: form.eatOutside.toUpperCase(),

    monthlyElectricity: parseFloat(form.monthlyElectricityKwh),

    renewable: form.renewableEnergy,
  },
  {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  }
);

  setSuccess(true);
  setTimeout(() => navigate("/dashboard"), 2000);

} catch (err) {
  setErrors({ submit: "Submission failed. Please try again." });
}
  };

  const handleCancel = () => navigate("/dashboard");

  if (success) {
    return (
      <AppLayout>
        <div className="survey-page">
          <div className="survey-success card">
            <span className="survey-success-icon">✓</span>
            <h2 className="survey-success-title">Footprint calculated</h2>
            <p className="survey-success-text">Your carbon footprint has been saved. Redirecting to dashboard…</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="survey-page">
        <div className="survey-breadcrumb">Step 1 of 1 → Setup Profile</div>
        <h1 className="survey-title">Lifestyle Survey</h1>

        <form className="survey-form card" onSubmit={handleSubmit}>
          {/* Transport */}
          <section className="survey-section">
            <div className="survey-section-header survey-section-transport">
              <span className="survey-section-icon">🚗</span>
              <h2 className="survey-section-title">Transport</h2>
            </div>
            <div className="survey-fields">
              <label className="survey-label">
                Primary transport mode
                <select
                  name="primaryMode"
                  value={form.primaryMode}
                  onChange={handleChange}
                  className="survey-input survey-select"
                  aria-invalid={!!errors.primaryMode}
                >
                  <option value="">Select mode...</option>
                  {TRANSPORT_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
                {errors.primaryMode && <span className="survey-error">{errors.primaryMode}</span>}
              </label>
              <label className="survey-label">
                Average distance per day (km) {noTravel && <span className="survey-label-optional">— optional if you don’t travel</span>}
                <input
                  type="number"
                  name="dailyDistanceKm"
                  value={form.dailyDistanceKm}
                  onChange={handleChange}
                  placeholder={noTravel ? "0 or leave empty" : "e.g. 10"}
                  className="survey-input"
                  min="0"
                  step="0.1"
                  aria-invalid={!!errors.dailyDistanceKm}
                />
                {errors.dailyDistanceKm && <span className="survey-error">{errors.dailyDistanceKm}</span>}
              </label>
              {showFuelType && (
                <label className="survey-label">
                  Fuel type
                  <select
                    name="fuelType"
                    value={form.fuelType}
                    onChange={handleChange}
                    className="survey-input survey-select"
                    aria-invalid={!!errors.fuelType}
                  >
                    <option value="">Select fuel type...</option>
                    {FUEL_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                  {errors.fuelType && <span className="survey-error">{errors.fuelType}</span>}
                </label>
              )}
            </div>
          </section>

          {/* Food */}
          <section className="survey-section">
            <div className="survey-section-header survey-section-food">
              <span className="survey-section-icon">🍽</span>
              <h2 className="survey-section-title">Food & diet</h2>
            </div>
            <div className="survey-fields">
              <label className="survey-label">
                Diet type
                <select
                  name="dietType"
                  value={form.dietType}
                  onChange={handleChange}
                  className="survey-input survey-select"
                  aria-invalid={!!errors.dietType}
                >
                  <option value="">Select diet...</option>
                  {DIET_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
                {errors.dietType && <span className="survey-error">{errors.dietType}</span>}
              </label>
              <label className="survey-label">
                Meals per day
                <input
                  type="number"
                  name="mealsPerDay"
                  value={form.mealsPerDay}
                  onChange={handleChange}
                  placeholder="e.g. 3"
                  min="1"
                  max="6"
                  className="survey-input"
                  aria-invalid={!!errors.mealsPerDay}
                />
                {errors.mealsPerDay && <span className="survey-error">{errors.mealsPerDay}</span>}
              </label>
              <label className="survey-label">
                How often do you eat outside (restaurants, takeaways)?
                <select
                  name="eatOutside"
                  value={form.eatOutside}
                  onChange={handleChange}
                  className="survey-input survey-select"
                  aria-invalid={!!errors.eatOutside}
                >
                  <option value="">Select frequency...</option>
                  {EAT_OUTSIDE_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
                {errors.eatOutside && <span className="survey-error">{errors.eatOutside}</span>}
              </label>
            </div>
          </section>

          {/* Energy */}
          <section className="survey-section">
            <div className="survey-section-header survey-section-energy">
              <span className="survey-section-icon">⚡</span>
              <h2 className="survey-section-title">Home energy</h2>
            </div>
            <div className="survey-fields">
              <label className="survey-label">
                Monthly electricity usage (kWh per month)
                <input
                  type="number"
                  name="monthlyElectricityKwh"
                  value={form.monthlyElectricityKwh}
                  onChange={handleChange}
                  placeholder="e.g. 250"
                  className="survey-input"
                  min="0"
                  step="1"
                  aria-invalid={!!errors.monthlyElectricityKwh}
                />
                {errors.monthlyElectricityKwh && <span className="survey-error">{errors.monthlyElectricityKwh}</span>}
              </label>
              <label className="survey-label survey-toggle-wrap">
                <div>
                  <span className="survey-toggle-label">Renewable energy usage</span>
                  <span className="survey-toggle-desc">Yes / No</span>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={form.renewableEnergy}
                  className={`survey-toggle ${form.renewableEnergy ? "on" : ""}`}
                  onClick={() => setForm((p) => ({ ...p, renewableEnergy: !p.renewableEnergy }))}
                >
                  <span className="survey-toggle-thumb" />
                </button>
              </label>
            </div>
          </section>

          {errors.submit && <div className="survey-error survey-error-block" role="alert">{errors.submit}</div>}

          <div className="survey-actions">
            <button type="button" className="btn btn-ghost" onClick={handleCancel} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary btn-submit" disabled={loading}>
              {loading ? (
                <>
                  <span className="survey-spinner" aria-hidden /> Calculating…
                </>
              ) : (
                <>Calculate Footprint →</>
              )}
            </button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}

export default LifestyleSurvey;
