import React, { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
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

function CarbonLogDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  const validId = id != null && id !== "" && !Number.isNaN(Number(id)) && Number(id) > 0;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [log, setLog] = useState(null);
  const [form, setForm] = useState({
    date: "",
    transportEmission: "",
    foodEmission: "",
    energyEmission: "",
    totalEmission: "",
    // lifestyle snapshot
    primaryMode: "",
    dailyDistanceKm: "",
    fuelType: "",
    dietType: "",
    mealsPerDay: "",
    eatOutside: "",
    monthlyElectricityKwh: "",
    renewableEnergy: false,
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/");
      return;
    }
    if (!validId) {
      setError("Invalid log ID.");
      setLoading(false);
      return;
    }
    const fetchLog = async () => {
      try {
        const res = await axios.get(`${API_BASE}/api/carbon/logs/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = res.data;
        setLog(data);
        setForm({
          date: data.date || "",
          transportEmission: data.transportEmission != null ? String(data.transportEmission) : "",
          foodEmission: data.foodEmission != null ? String(data.foodEmission) : "",
          energyEmission: data.energyEmission != null ? String(data.energyEmission) : "",
          totalEmission: data.totalEmission != null ? String(data.totalEmission) : "",
          primaryMode: (data.transportMode || "").toLowerCase(),
          dailyDistanceKm: data.distancePerDay != null ? String(data.distancePerDay) : "",
          fuelType: (data.fuelType || "").toLowerCase(),
          dietType:
            data.dietType === "VEG"
              ? "vegetarian"
              : data.dietType === "NON_VEG"
              ? "non-vegetarian"
              : data.dietType === "VEGAN"
              ? "vegan"
              : "",
          mealsPerDay: data.mealsPerDay != null ? String(data.mealsPerDay) : "",
          eatOutside: (data.eatingOutFrequency || "").toLowerCase(),
          monthlyElectricityKwh: data.monthlyElectricity != null ? String(data.monthlyElectricity) : "",
          renewableEnergy: Boolean(data.renewable),
        });
      } catch (err) {
        if (err.response?.status === 401) {
          localStorage.removeItem("token");
          navigate("/");
          return;
        }
        setError(err.response?.status === 404 ? "Log not found. It may have been deleted or the link may be incorrect. Open a log from Carbon History." : "Failed to load log.");
      } finally {
        setLoading(false);
      }
    };
    fetchLog();
  }, [id, navigate, validId]);

  const num = (v) => (v !== "" && v != null ? Number(v) : 0);

  const showFuelType = form.primaryMode === "car";
  const noTravel = form.primaryMode === "wfh";

  // local recomputation of emissions using same logic as backend
  const recomputeEmissions = (nextForm) => {
    // transport
    let factor = 0;
    const mode = nextForm.primaryMode?.toUpperCase();
    if (mode === "CAR") {
      const fuel = nextForm.fuelType?.toUpperCase();
      if (fuel === "PETROL") factor = 0.21;
      else if (fuel === "DIESEL") factor = 0.18;
      else if (fuel === "ELECTRIC") factor = 0.05;
      else factor = 0.15;
    } else if (mode === "PUBLIC") {
      factor = 0.1;
    } else if (mode === "BIKE") {
      factor = 0.02;
    } else if (mode === "WALK" || mode === "WFH") {
      factor = 0;
    }
    const distance = nextForm.dailyDistanceKm !== ""
      ? Number.parseFloat(nextForm.dailyDistanceKm)
      : 0;
    const transportEmission = (distance || 0) * factor;

    // food
    let base = 0;
    const dietCode =
      nextForm.dietType === "vegetarian"
        ? "VEG"
        : nextForm.dietType === "non-vegetarian"
        ? "NON_VEG"
        : nextForm.dietType === "vegan"
        ? "VEGAN"
        : null;
    if (dietCode === "VEG") base = 2;
    else if (dietCode === "NON_VEG") base = 5;
    else if (dietCode === "VEGAN") base = 1.5;
    const meals =
      nextForm.mealsPerDay !== ""
        ? Number.parseInt(nextForm.mealsPerDay, 10)
        : 0;
    const foodEmission = base * (meals || 0);

    // energy
    const electricity =
      nextForm.monthlyElectricityKwh !== ""
        ? Number.parseFloat(nextForm.monthlyElectricityKwh)
        : 0;
    let energyEmission = (electricity || 0) * 0.82;
    if (nextForm.renewableEnergy) {
      energyEmission *= 0.6;
    }

    const totalEmission = transportEmission + foodEmission + energyEmission;

    setForm((prev) => ({
      ...prev,
      transportEmission: transportEmission.toFixed(2),
      foodEmission: foodEmission.toFixed(2),
      energyEmission: energyEmission.toFixed(2),
      totalEmission: totalEmission.toFixed(2),
    }));
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => {
      const next = {
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      };
      if (
        name === "primaryMode" ||
        name === "dailyDistanceKm" ||
        name === "fuelType" ||
        name === "dietType" ||
        name === "mealsPerDay" ||
        name === "eatOutside" ||
        name === "monthlyElectricityKwh" ||
        name === "renewableEnergy"
      ) {
        recomputeEmissions(next);
      }
      return next;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await axios.put(
        `${API_BASE}/api/carbon/logs/${id}`,
        {
          transportEmission: num(form.transportEmission),
          foodEmission: num(form.foodEmission),
          energyEmission: num(form.energyEmission),
          totalEmission: num(form.totalEmission),
          transportMode: form.primaryMode ? form.primaryMode.toUpperCase() : null,
          distancePerDay:
            form.dailyDistanceKm !== ""
              ? Number.parseFloat(form.dailyDistanceKm)
              : null,
          fuelType: form.fuelType ? form.fuelType.toUpperCase() : null,
          dietType:
            form.dietType === "vegetarian"
              ? "VEG"
              : form.dietType === "non-vegetarian"
              ? "NON_VEG"
              : form.dietType === "vegan"
              ? "VEGAN"
              : null,
          mealsPerDay:
            form.mealsPerDay !== ""
              ? Number.parseInt(form.mealsPerDay, 10)
              : null,
          eatingOutFrequency: form.eatOutside
            ? form.eatOutside.toUpperCase()
            : null,
          monthlyElectricity:
            form.monthlyElectricityKwh !== ""
              ? Number.parseFloat(form.monthlyElectricityKwh)
              : null,
          renewable: form.renewableEnergy,
        },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      navigate("/carbon-history");
    } catch (err) {
      setError(err.response?.status === 404 ? "Log not found." : "Failed to save changes.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="survey-page">
          <p className="carbon-details-loading">Loading…</p>
        </div>
      </AppLayout>
    );
  }

  if (error && !log) {
    return (
      <AppLayout>
        <div className="survey-page">
          <div className="carbon-details-error-card card">
            <h2 className="carbon-details-error-title">Log not found</h2>
            <p className="carbon-details-error-text">{error}</p>
            <p className="carbon-details-error-hint">Open a log from the Carbon History table by clicking &quot;View Details&quot; on a row.</p>
            <Link to="/carbon-history" className="carbon-details-btn carbon-details-btn-primary">Go to Carbon History</Link>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
        <div className="survey-page">
        <div className="survey-breadcrumb">Edit log → {form.date || "Unknown date"}</div>
        <h1 className="survey-title">Edit Carbon Log</h1>
        <p className="survey-desc">Adjust your lifestyle selections and emissions for this day. Changes will update your history and charts.</p>

        <form className="survey-form card" onSubmit={handleSubmit}>
          {/* Transport section: mode + distance + fuel + emission */}
          <section className="survey-section">
            <div className="survey-section-header survey-section-transport">
              <span className="survey-section-icon">🚗</span>
              <div>
                <h2 className="survey-section-title">Transport</h2>
                <p className="survey-section-desc">How you travelled on this date.</p>
              </div>
            </div>
            <div className="survey-fields">
              <label className="survey-label">
                Primary transport mode
                <select
                  name="primaryMode"
                  value={form.primaryMode}
                  onChange={handleChange}
                  className="survey-input survey-select"
                >
                  <option value="">Select mode...</option>
                  {TRANSPORT_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="survey-label">
                Distance travelled (km)
                <input
                  type="number"
                  name="dailyDistanceKm"
                  value={form.dailyDistanceKm}
                  onChange={handleChange}
                  placeholder={noTravel ? "0 or leave empty" : "e.g. 10"}
                  className="survey-input"
                  min="0"
                  step="0.1"
                />
              </label>
              {showFuelType && (
                <label className="survey-label">
                  Fuel type
                  <select
                    name="fuelType"
                    value={form.fuelType}
                    onChange={handleChange}
                    className="survey-input survey-select"
                  >
                    <option value="">Select fuel type...</option>
                    {FUEL_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </label>
              )}
              <label className="survey-label">
                Transport emission
                <div className="survey-input-wrap">
                  <input
                    type="number"
                    name="transportEmission"
                    value={form.transportEmission}
                    readOnly
                    className="survey-input"
                    aria-readonly="true"
                  />
                  <span className="survey-unit">kg CO₂e</span>
                </div>
              </label>
            </div>
          </section>

          {/* Food section */}
          <section className="survey-section">
            <div className="survey-section-header survey-section-food">
              <span className="survey-section-icon">🍽</span>
              <div>
                <h2 className="survey-section-title">Food & diet</h2>
                <p className="survey-section-desc">Eating pattern that contributed to this day's food emissions.</p>
              </div>
            </div>
            <div className="survey-fields">
              <label className="survey-label">
                Diet type
                <select
                  name="dietType"
                  value={form.dietType}
                  onChange={handleChange}
                  className="survey-input survey-select"
                >
                  <option value="">Select diet...</option>
                  {DIET_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
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
                />
              </label>
              <label className="survey-label">
                Eating out frequency
                <select
                  name="eatOutside"
                  value={form.eatOutside}
                  onChange={handleChange}
                  className="survey-input survey-select"
                >
                  <option value="">Select frequency...</option>
                  {EAT_OUTSIDE_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="survey-label">
                Food emission
                <div className="survey-input-wrap">
                  <input
                    type="number"
                    name="foodEmission"
                    value={form.foodEmission}
                    readOnly
                    className="survey-input"
                    aria-readonly="true"
                  />
                  <span className="survey-unit">kg CO₂e</span>
                </div>
              </label>
            </div>
          </section>

          {/* Energy section */}
          <section className="survey-section">
            <div className="survey-section-header survey-section-energy">
              <span className="survey-section-icon">⚡</span>
              <div>
                <h2 className="survey-section-title">Home energy</h2>
                <p className="survey-section-desc">Energy usage that fed into this day's emissions.</p>
              </div>
            </div>
            <div className="survey-fields">
              <label className="survey-label">
                Electricity usage (kWh)
                <input
                  type="number"
                  name="monthlyElectricityKwh"
                  value={form.monthlyElectricityKwh}
                  onChange={handleChange}
                  placeholder="e.g. 250"
                  className="survey-input"
                  min="0"
                  step="1"
                />
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
                  onClick={() =>
                    setForm((p) => ({ ...p, renewableEnergy: !p.renewableEnergy }))
                  }
                >
                  <span className="survey-toggle-thumb" />
                </button>
              </label>
              <label className="survey-label">
                Energy emission
                <div className="survey-input-wrap">
                  <input
                    type="number"
                    name="energyEmission"
                    value={form.energyEmission}
                    readOnly
                    className="survey-input"
                    aria-readonly="true"
                  />
                  <span className="survey-unit">kg CO₂e</span>
                </div>
              </label>
            </div>
          </section>

          <section className="survey-section">
            <div className="survey-section-header">
              <span className="survey-section-icon">📊</span>
              <div>
                <h2 className="survey-section-title">Total for this date</h2>
                <p className="survey-section-desc">Automatically calculated from the three categories above.</p>
              </div>
            </div>
            <div className="survey-fields">
              <label className="survey-label">
                Total emission
                <div className="survey-input-wrap">
                  <input
                    type="text"
                    name="totalEmission"
                    value={form.totalEmission}
                    readOnly
                    className="survey-input"
                    aria-readonly="true"
                  />
                  <span className="survey-unit">kg CO₂e</span>
                </div>
                <span className="survey-hint">Total = Transport + Food + Energy. Edit the values above to change this.</span>
              </label>
            </div>
          </section>

          {error && (
            <div className="survey-error survey-error-block" role="alert">
              {error}
            </div>
          )}

          <div className="survey-actions">
            <Link to="/carbon-history" className="btn btn-ghost" disabled={saving ? "disabled" : undefined}>
              Cancel
            </Link>
            <button type="submit" className="btn btn-primary btn-submit" disabled={saving}>
              {saving ? "Saving…" : "Save changes"}
            </button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}

export default CarbonLogDetails;
