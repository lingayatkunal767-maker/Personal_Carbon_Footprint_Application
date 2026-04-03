import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { surveyAPI } from '../services/api';
import '../styles/Survey.css';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

const EATING_OUT_NON_VEG_RATIO = {
  Never: 0.35,
  Rarely: 0.4,
  Sometimes: 0.5,
  Often: 0.6,
  Daily: 0.7,
};

async function resolveUserIdFromSession() {
  const normalizeUserId = (candidate) => {
    const parsed = Number(candidate);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
  };

  const stored = localStorage.getItem('current_user');

  if (stored) {
    try {
      const session = JSON.parse(stored);
      const normalizedSessionId = normalizeUserId(session?.id);
      if (normalizedSessionId) {
        return normalizedSessionId;
      }

      if (session?.email) {
        const response = await fetch(`${API_BASE}/users/email/${encodeURIComponent(session.email)}`);
        if (response.ok) {
          const data = await response.json();
          const normalizedFetchedId = normalizeUserId(data?.id);
          if (normalizedFetchedId) {
            const merged = { ...session, id: normalizedFetchedId };
            localStorage.setItem('current_user', JSON.stringify(merged));
            return normalizedFetchedId;
          }
        }
      }
    } catch {
      // Fall back to legacy key if session parsing fails
    }
  }

  throw new Error('Unable to identify current user. Please login again.');
}

function getMealsSplit(dietType, mealsPerWeek, eatingOutFrequency) {
  if (dietType === 'Vegetarian' || dietType === 'Vegan') {
    return { mealsVegPerWeek: mealsPerWeek, mealsNonVegPerWeek: 0 };
  }

  if (dietType === 'Non-Vegetarian') {
    const ratio = EATING_OUT_NON_VEG_RATIO[eatingOutFrequency] ?? 0.45;
    const mealsNonVegPerWeek = Math.round(mealsPerWeek * ratio);
    return {
      mealsNonVegPerWeek,
      mealsVegPerWeek: Math.max(0, mealsPerWeek - mealsNonVegPerWeek),
    };
  }

  return {
    mealsVegPerWeek: Math.round(mealsPerWeek * 0.5),
    mealsNonVegPerWeek: Math.round(mealsPerWeek * 0.5),
  };
}

const SurveyPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    // Transport section
    transportMode: '',
    distanceKmPerDay: '',
    fuelType: '',
    
    // Food section
    dietType: '',
    mealsPerDay: '',
    eatingOutFrequency: '',
    
    // Energy section
    electricityKwhPerMonth: '',
    cookingGasCylindersPerMonth: '',
    renewableEnergy: '',
    renewableUsagePct: '',

    // Behavior section (dataset-aligned)
    screenTimeHours: '',
    wasteGeneratedKg: '',
    ecoActions: '',
  });

  // Field errors
  const [fieldErrors, setFieldErrors] = useState({});

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    const updates = {
      [name]: value
    };

    // Keep a sensible default renewable percentage when user selects Yes/No.
    if (name === 'renewableEnergy') {
      updates.renewableUsagePct = value === 'Yes' ? '75' : '0';
    }

    setFormData(prev => ({
      ...prev,
      ...updates
    }));
    
    // Clear field error when user types
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    setError('');
  };

  // Validate form
  const validateForm = () => {
    const errors = {};

    // Transport validation
    if (!formData.transportMode) {
      errors.transportMode = 'Transport mode is required';
    }
    
    if (!formData.distanceKmPerDay) {
      errors.distanceKmPerDay = 'Distance per day is required';
    } else if (parseFloat(formData.distanceKmPerDay) <= 0) {
      errors.distanceKmPerDay = 'Distance must be positive';
    }

    // Fuel type required if transport mode is Car
    if (formData.transportMode === 'Car' && !formData.fuelType) {
      errors.fuelType = 'Fuel type is required for car transport';
    }

    // Food validation
    if (!formData.dietType) {
      errors.dietType = 'Diet type is required';
    }

    if (!formData.mealsPerDay) {
      errors.mealsPerDay = 'Meals per day is required';
    } else if (parseInt(formData.mealsPerDay) <= 0) {
      errors.mealsPerDay = 'Meals per day must be positive';
    } else if (parseInt(formData.mealsPerDay) > 10) {
      errors.mealsPerDay = 'Meals per day must be realistic (max 10)';
    }

    if (!formData.eatingOutFrequency) {
      errors.eatingOutFrequency = 'Eating out frequency is required';
    }

    // Energy validation
    if (!formData.electricityKwhPerMonth) {
      errors.electricityKwhPerMonth = 'Monthly electricity usage is required';
    } else if (parseFloat(formData.electricityKwhPerMonth) <= 0) {
      errors.electricityKwhPerMonth = 'Electricity usage must be positive';
    }

    if (formData.cookingGasCylindersPerMonth === '') {
      errors.cookingGasCylindersPerMonth = 'Monthly cooking gas usage is required';
    } else if (parseFloat(formData.cookingGasCylindersPerMonth) < 0) {
      errors.cookingGasCylindersPerMonth = 'Cooking gas usage must be non-negative';
    }

    if (!formData.renewableEnergy) {
      errors.renewableEnergy = 'Renewable energy usage is required';
    }

    if (!formData.renewableUsagePct) {
      errors.renewableUsagePct = 'Renewable usage percentage is required';
    } else if (parseFloat(formData.renewableUsagePct) < 0 || parseFloat(formData.renewableUsagePct) > 100) {
      errors.renewableUsagePct = 'Renewable usage must be between 0 and 100';
    }

    if (!formData.screenTimeHours) {
      errors.screenTimeHours = 'Screen time is required';
    } else if (parseFloat(formData.screenTimeHours) < 0 || parseFloat(formData.screenTimeHours) > 24) {
      errors.screenTimeHours = 'Screen time must be between 0 and 24 hours';
    }

    if (!formData.wasteGeneratedKg) {
      errors.wasteGeneratedKg = 'Waste generated is required';
    } else if (parseFloat(formData.wasteGeneratedKg) < 0) {
      errors.wasteGeneratedKg = 'Waste generated must be non-negative';
    }

    if (formData.ecoActions === '') {
      errors.ecoActions = 'Eco actions count is required';
    } else if (parseInt(formData.ecoActions, 10) < 0 || parseInt(formData.ecoActions, 10) > 10) {
      errors.ecoActions = 'Eco actions must be between 0 and 10';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Map frontend values to backend enum values
  const mapTransportMode = (mode) => {
    const mapping = {
      'Car': 'CAR',
      'Bike': 'BIKE',
      'Bicycle': 'BIKE',
      'Bus': 'BUS',
      'Train': 'TRAIN',
      'Metro': 'METRO',
      'Auto': 'AUTO',
      'Walk': 'WALK'
    };
    return mapping[mode] || 'CAR';
  };

  const mapFuelType = (fuel) => {
    const mapping = {
      'Petrol': 'PETROL',
      'Diesel': 'DIESEL',
      'Electric': 'EV',
      'Hybrid': 'EV', // Map hybrid to EV
      'CNG': 'DIESEL', // Map CNG to Diesel as fallback
      'None': 'NA'
    };
    return mapping[fuel] || 'PETROL';
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setResult(null);

    // Validate form
    if (!validateForm()) {
      setError('Please fix the errors in the form');
      return;
    }

    try {
      setLoading(true);

      const userId = await resolveUserIdFromSession();

      const mealsPerWeek = parseInt(formData.mealsPerDay) * 7;
      const { mealsVegPerWeek, mealsNonVegPerWeek } = getMealsSplit(
        formData.dietType,
        mealsPerWeek,
        formData.eatingOutFrequency
      );

      // Determine fuel type based on transport mode
      let actualFuelType = 'NA';
      const mappedTransportMode = mapTransportMode(formData.transportMode);
      
      if (mappedTransportMode === 'CAR') {
        actualFuelType = mapFuelType(formData.fuelType || 'Petrol');
      } else if (mappedTransportMode === 'AUTO') {
        actualFuelType = 'DIESEL';
      } else if (mappedTransportMode === 'BUS' || mappedTransportMode === 'BIKE' || mappedTransportMode === 'WALK') {
        actualFuelType = 'NA';
      } else if (mappedTransportMode === 'TRAIN' || mappedTransportMode === 'METRO') {
        actualFuelType = 'NA';
      }

      // Prepare survey request
      const surveyRequest = {
        userId,
        surveyDate: new Date().toISOString().split('T')[0],
        transportMode: mappedTransportMode,
        distanceKmPerDay: parseFloat(formData.distanceKmPerDay),
        fuelType: actualFuelType,
        mealsVegPerWeek: mealsVegPerWeek,
        mealsNonVegPerWeek: mealsNonVegPerWeek,
        electricityKwhPerMonth: parseFloat(formData.electricityKwhPerMonth),
        cookingGasCylindersPerMonth: parseFloat(formData.cookingGasCylindersPerMonth),
        renewableUsagePct: parseFloat(formData.renewableUsagePct),
        screenTimeHours: parseFloat(formData.screenTimeHours),
        wasteGeneratedKg: parseFloat(formData.wasteGeneratedKg),
        ecoActions: parseInt(formData.ecoActions, 10)
      };

      // Submit survey
      const response = await surveyAPI.submitSurvey(surveyRequest);

      // Show success message
      setResult(response);
      const latestSnapshot = {
        userId,
        logDate: response?.logDate || surveyRequest.surveyDate,
        transportEmission: Number(response?.transportEmission || 0),
        foodEmission: Number(response?.foodEmission || 0),
        energyEmission: Number(response?.energyEmission || 0),
        totalEmission: Number(response?.totalEmission || 0),
        updatedAt: new Date().toISOString(),
      };
      localStorage.setItem('latest_carbon_calculation', JSON.stringify(latestSnapshot));
      window.dispatchEvent(new CustomEvent('carbon-log-updated', { detail: latestSnapshot }));
      setShowSuccess(true);
      setLoading(false);

      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        navigate('/home');
      }, 2000);

    } catch (err) {
      console.error('Survey submission error:', err);
      setError(err.message || 'Failed to submit survey. Please try again.');
      setLoading(false);
    }
  };

  // Check if transport mode requires fuel type
  const requiresFuelType = formData.transportMode === 'Car';
  const formatKg = (value) => Number(value || 0).toFixed(2);

  return (
    <div className="survey-container">
      <div className="survey-wrapper">
        {/* Header */}
        <div className="survey-header">
          <h1 className="survey-title">
            🌱 Lifestyle Survey
          </h1>
          <p className="survey-subtitle">
            Help us calculate your carbon footprint and get personalized recommendations
          </p>
        </div>

        <div className="survey-quick-nav">
          <button type="button" className="quick-nav-btn" onClick={() => navigate('/home')}>
            ← Dashboard
          </button>
          <button type="button" className="quick-nav-btn" onClick={() => navigate('/history')}>
            📜 Carbon History
          </button>
        </div>

        {/* Success Message */}
        {showSuccess && (
          <div className="alert alert-success">
            <span className="alert-icon">✅</span>
            <div className="alert-content">
              <h3>Survey Submitted Successfully!</h3>
              {result && (
                <>
                  <p>
                    Daily emission: <strong>{formatKg(result.totalEmission)} kg CO2e</strong>
                    {' '}| Customized emission: <strong>{formatKg(result.customizedTotalEmission)} kg CO2e</strong>
                  </p>
                  <p>
                    Transport: <strong>{formatKg(result.transportEmission)} kg CO2e</strong>
                    {' '}| Food: <strong>{formatKg(result.foodEmission)} kg CO2e</strong>
                    {' '}| Energy: <strong>{formatKg(result.energyEmission)} kg CO2e</strong>
                  </p>
                  <p>
                    Dataset prediction: <strong>{formatKg(result.datasetPredictedFootprint)} kg CO2e</strong>
                    {' '}| Impact level: <strong>{result.carbonImpactLevel || 'Medium'}</strong>
                  </p>
                  <p>
                    Saved to carbon history on <strong>{result.logDate}</strong>.
                  </p>
                </>
              )}
              <p>Calculation complete. Redirecting to dashboard.</p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="alert alert-error">
            <span className="alert-icon">❌</span>
            <div className="alert-content">
              <h3>Submission Error</h3>
              <p>{error}</p>
            </div>
          </div>
        )}

        {/* Survey Form */}
        <div className="survey-card">
          <form onSubmit={handleSubmit}>
            
            {/* Transport Section */}
            <div className="form-section">
              <div className="section-header">
                <span className="section-icon">🚗</span>
                <h2 className="section-title">Transport Information</h2>
              </div>
              
              <div className="section-grid">
                {/* Transport Mode */}
                <div className="form-group">
                  <label className="form-label">
                    Primary Transport Mode <span className="required">*</span>
                  </label>
                  <select
                    name="transportMode"
                    value={formData.transportMode}
                    onChange={handleChange}
                    className={`form-select ${fieldErrors.transportMode ? 'error' : ''}`}
                  >
                    <option value="">-- Select Transport Mode --</option>
                    <option value="Car">🚗 Car</option>
                    <option value="Bike">🚴 Bike</option>
                    <option value="Bus">🚌 Bus</option>
                    <option value="Train">🚂 Train</option>
                    <option value="Metro">🚇 Metro</option>
                    <option value="Auto">🛺 Auto Rickshaw</option>
                    <option value="Walk">🚶 Walk</option>
                  </select>
                  {fieldErrors.transportMode && (
                    <p className="error-message">{fieldErrors.transportMode}</p>
                  )}
                </div>

                {/* Distance per day */}
                <div className="form-group">
                  <label className="form-label">
                    Average Distance Per Day (km) <span className="required">*</span>
                  </label>
                  <input
                    type="number"
                    name="distanceKmPerDay"
                    value={formData.distanceKmPerDay}
                    onChange={handleChange}
                    min="0"
                    step="0.1"
                    placeholder="e.g., 15.5"
                    className={`form-input ${fieldErrors.distanceKmPerDay ? 'error' : ''}`}
                  />
                  {fieldErrors.distanceKmPerDay && (
                    <p className="error-message">{fieldErrors.distanceKmPerDay}</p>
                  )}
                </div>

                {/* Fuel Type (conditional) */}
                {requiresFuelType && (
                  <div className="form-group conditional-field">
                    <label className="form-label">
                      Fuel Type <span className="required">*</span>
                    </label>
                    <select
                      name="fuelType"
                      value={formData.fuelType}
                      onChange={handleChange}
                      className={`form-select ${fieldErrors.fuelType ? 'error' : ''}`}
                    >
                      <option value="">-- Select Fuel Type --</option>
                      <option value="Petrol">⛽ Petrol</option>
                      <option value="Diesel">⛽ Diesel</option>
                      <option value="Electric">🔋 Electric / Hybrid</option>
                    </select>
                    {fieldErrors.fuelType && (
                      <p className="error-message">{fieldErrors.fuelType}</p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Food Section */}
            <div className="form-section">
              <div className="section-header">
                <span className="section-icon">🍽️</span>
                <h2 className="section-title">Food & Diet Information</h2>
              </div>
              
              <div className="section-grid">
                {/* Diet Type */}
                <div className="form-group">
                  <label className="form-label">
                    Diet Type <span className="required">*</span>
                  </label>
                  <select
                    name="dietType"
                    value={formData.dietType}
                    onChange={handleChange}
                    className={`form-select ${fieldErrors.dietType ? 'error' : ''}`}
                  >
                    <option value="">-- Select Diet Type --</option>
                    <option value="Vegetarian">🥗 Vegetarian</option>
                    <option value="Non-Vegetarian">🍖 Non-Vegetarian</option>
                    <option value="Vegan">🥦 Vegan</option>
                  </select>
                  {fieldErrors.dietType && (
                    <p className="error-message">{fieldErrors.dietType}</p>
                  )}
                </div>

                {/* Meals per day */}
                <div className="form-group">
                  <label className="form-label">
                    Meals Per Day <span className="required">*</span>
                  </label>
                  <input
                    type="number"
                    name="mealsPerDay"
                    value={formData.mealsPerDay}
                    onChange={handleChange}
                    min="1"
                    max="10"
                    placeholder="e.g., 3"
                    className={`form-input ${fieldErrors.mealsPerDay ? 'error' : ''}`}
                  />
                  {fieldErrors.mealsPerDay && (
                    <p className="error-message">{fieldErrors.mealsPerDay}</p>
                  )}
                </div>

                {/* Eating out frequency */}
                <div className="form-group">
                  <label className="form-label">
                    Frequency of Eating Outside <span className="required">*</span>
                  </label>
                  <select
                    name="eatingOutFrequency"
                    value={formData.eatingOutFrequency}
                    onChange={handleChange}
                    className={`form-select ${fieldErrors.eatingOutFrequency ? 'error' : ''}`}
                  >
                    <option value="">-- Select Frequency --</option>
                    <option value="Never">🚫 Never</option>
                    <option value="Rarely">🔵 Rarely (1-2 times/month)</option>
                    <option value="Sometimes">🟡 Sometimes (1-2 times/week)</option>
                    <option value="Often">🟠 Often (3-4 times/week)</option>
                    <option value="Daily">🔴 Daily</option>
                  </select>
                  {fieldErrors.eatingOutFrequency && (
                    <p className="error-message">{fieldErrors.eatingOutFrequency}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Energy Section */}
            <div className="form-section">
              <div className="section-header">
                <span className="section-icon">⚡</span>
                <h2 className="section-title">Home Energy Usage</h2>
              </div>
              
              <div className="section-grid">
                {/* Monthly electricity */}
                <div className="form-group">
                  <label className="form-label">
                    Monthly Electricity Usage (kWh) <span className="required">*</span>
                  </label>
                  <input
                    type="number"
                    name="electricityKwhPerMonth"
                    value={formData.electricityKwhPerMonth}
                    onChange={handleChange}
                    min="0"
                    step="0.1"
                    placeholder="e.g., 250"
                    className={`form-input ${fieldErrors.electricityKwhPerMonth ? 'error' : ''}`}
                  />
                  {fieldErrors.electricityKwhPerMonth && (
                    <p className="error-message">{fieldErrors.electricityKwhPerMonth}</p>
                  )}
                  <p className="helper-text">
                    Check your electricity bill for this information
                  </p>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Cooking Gas Cylinders Per Month <span className="required">*</span>
                  </label>
                  <input
                    type="number"
                    name="cookingGasCylindersPerMonth"
                    value={formData.cookingGasCylindersPerMonth}
                    onChange={handleChange}
                    min="0"
                    step="0.1"
                    placeholder="e.g., 1"
                    className={`form-input ${fieldErrors.cookingGasCylindersPerMonth ? 'error' : ''}`}
                  />
                  {fieldErrors.cookingGasCylindersPerMonth && (
                    <p className="error-message">{fieldErrors.cookingGasCylindersPerMonth}</p>
                  )}
                </div>

                {/* Renewable energy */}
                <div className="form-group">
                  <label className="form-label">
                    Do you use renewable energy? <span className="required">*</span>
                  </label>
                  <div className="radio-group">
                    <label className="radio-label">
                      <input
                        type="radio"
                        name="renewableEnergy"
                        value="Yes"
                        checked={formData.renewableEnergy === 'Yes'}
                        onChange={handleChange}
                        className="radio-input"
                      />
                      <span>☀️ Yes (Solar/Wind)</span>
                    </label>
                    <label className="radio-label">
                      <input
                        type="radio"
                        name="renewableEnergy"
                        value="No"
                        checked={formData.renewableEnergy === 'No'}
                        onChange={handleChange}
                        className="radio-input"
                      />
                      <span>🚫 No</span>
                    </label>
                  </div>
                  {fieldErrors.renewableEnergy && (
                    <p className="error-message">{fieldErrors.renewableEnergy}</p>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Renewable Usage Percentage (%) <span className="required">*</span>
                  </label>
                  <input
                    type="number"
                    name="renewableUsagePct"
                    value={formData.renewableUsagePct}
                    onChange={handleChange}
                    min="0"
                    max="100"
                    step="1"
                    placeholder="e.g., 75"
                    className={`form-input ${fieldErrors.renewableUsagePct ? 'error' : ''}`}
                  />
                  {fieldErrors.renewableUsagePct && (
                    <p className="error-message">{fieldErrors.renewableUsagePct}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Behavior Section */}
            <div className="form-section">
              <div className="section-header">
                <span className="section-icon">📈</span>
                <h2 className="section-title">Behavior Data Inputs</h2>
              </div>

              <div className="section-grid">
                <div className="form-group">
                  <label className="form-label">
                    Screen Time (hours/day) <span className="required">*</span>
                  </label>
                  <input
                    type="number"
                    name="screenTimeHours"
                    value={formData.screenTimeHours}
                    onChange={handleChange}
                    min="0"
                    max="24"
                    step="0.1"
                    placeholder="e.g., 5.5"
                    className={`form-input ${fieldErrors.screenTimeHours ? 'error' : ''}`}
                  />
                  {fieldErrors.screenTimeHours && (
                    <p className="error-message">{fieldErrors.screenTimeHours}</p>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Waste Generated (kg/day) <span className="required">*</span>
                  </label>
                  <input
                    type="number"
                    name="wasteGeneratedKg"
                    value={formData.wasteGeneratedKg}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    placeholder="e.g., 0.75"
                    className={`form-input ${fieldErrors.wasteGeneratedKg ? 'error' : ''}`}
                  />
                  {fieldErrors.wasteGeneratedKg && (
                    <p className="error-message">{fieldErrors.wasteGeneratedKg}</p>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Eco Actions Taken Today (0-10) <span className="required">*</span>
                  </label>
                  <input
                    type="number"
                    name="ecoActions"
                    value={formData.ecoActions}
                    onChange={handleChange}
                    min="0"
                    max="10"
                    step="1"
                    placeholder="e.g., 2"
                    className={`form-input ${fieldErrors.ecoActions ? 'error' : ''}`}
                  />
                  {fieldErrors.ecoActions && (
                    <p className="error-message">{fieldErrors.ecoActions}</p>
                  )}
                  <p className="helper-text">
                    Include actions like cycling, reusing bottles, composting, or public transport.
                  </p>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="submit-section">
              <button
                type="submit"
                disabled={loading || showSuccess}
                className="submit-button"
              >
                <span className="button-content">
                  {loading ? (
                    <>
                      <div className="spinner"></div>
                      Calculating Carbon Footprint...
                    </>
                  ) : showSuccess ? (
                    <>
                      ✅ Submitted Successfully
                    </>
                  ) : (
                    <>
                      📊 Calculate My Carbon Footprint
                    </>
                  )}
                </span>
              </button>
            </div>

            {/* Info Note */}
            <div className="info-note">
              <p className="info-note-content">
                <span className="info-note-icon">📝 Note:</span> This information helps us calculate your 
                carbon footprint accurately. Your data is securely stored and will be used to provide 
                personalized recommendations for reducing emissions.
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SurveyPage;
