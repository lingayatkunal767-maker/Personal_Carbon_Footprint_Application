import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiFetch } from "../utils/api";

const TRANSPORT_MODES = [
  "Car",
  "Public Transit",
  "Bicycle",
  "Walk",
  "Mixed Mode",
];

const DIET_TYPES = [
  "Vegan",
  "Vegetarian",
  "Pescatarian",
  "Mixed (Occasional Meat)",
  "Regular Meat Eater",
  "High Meat Consumption",
];

const EATING_FREQUENCIES = [
  "Daily",
  "3-4 times a week",
  "2-3 times a week",
  "Once a week",
  "Less frequently",
];

export default function LifestyleSurvey() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    primaryMode: "",
    averageDailyDistance: "",
    dietType: "",
    mealsPerDay: "",
    eatingFrequency: "",
    monthlyElectricity: "",
    renewableEnergy: false,
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState("transport");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    setError("");
  };

  const validateTransport = () => {
    if (!formData.primaryMode) {
      setError("Please select a primary transport mode");
      return false;
    }
    if (!formData.averageDailyDistance || formData.averageDailyDistance <= 0) {
      setError("Please enter valid average daily distance");
      return false;
    }
    return true;
  };

  const validateDiet = () => {
    if (!formData.dietType) {
      setError("Please select a diet type");
      return false;
    }
    if (!formData.mealsPerDay || formData.mealsPerDay <= 0) {
      setError("Please enter valid meals per day");
      return false;
    }
    if (!formData.eatingFrequency) {
      setError("Please select eating frequency");
      return false;
    }
    return true;
  };

  const validateEnergy = () => {
    if (!formData.monthlyElectricity || formData.monthlyElectricity <= 0) {
      setError("Please enter valid monthly electricity usage");
      return false;
    }
    return true;
  };

  const handleNextStep = (nextStep) => {
    const currentStep = step;
    if (currentStep === "transport" && !validateTransport()) return;
    if (currentStep === "diet" && !validateDiet()) return;
    setStep(nextStep);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateEnergy()) return;

    setError("");
    setLoading(true);

    try {

  await apiFetch("/api/survey", {
    method: "POST",
    body: JSON.stringify({
      transportMode: formData.primaryMode,
      distance: parseInt(formData.averageDailyDistance),
      fuelType: "Petrol",
      dietType: formData.dietType,
      mealsPerDay: parseInt(formData.mealsPerDay),
      monthlyKwh: parseInt(formData.monthlyElectricity),
      renewable: formData.renewableEnergy
    })
  });

  navigate("/dashboard");

} catch (err) {
  if (err.status === 401) navigate("/login");
  else setError(err.message || "Failed to calculate footprint.");
} finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#d4edda] via-[#b5dfca] to-[#5cb578]">
      {/* Navbar */}
      <nav className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl font-bold text-green-800">CarbonCalc</span>
            <span className="text-xl">🌱</span>
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-green-800 font-semibold">
              Lifestyle Assessment
            </span>
            <button
              onClick={() => navigate("/dashboard")}
              className="ml-2 bg-green-800 hover:bg-green-900 text-white text-sm px-4 py-2 rounded-lg transition font-medium"
            >
              Dashboard
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-green-900">
            Lifestyle Assessment
          </h1>
          <p className="text-green-800/70 mt-1">
            Help us calculate your personal carbon footprint by answering a few
            questions about your daily habits.
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
            <p className="text-red-700 font-medium text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* TRANSPORT INFORMATION */}
          {(step === "transport" || step === "diet" || step === "energy") && (
            <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-8">
              <div className="flex items-start gap-3 mb-6">
                <div className="text-2xl">🚗</div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800">
                    Transport Information
                  </h2>
                  <p className="text-gray-600 text-sm mt-1">
                    How do you get around on a daily basis?
                  </p>
                </div>
              </div>

              <div className="space-y-5">
                {/* Primary Mode */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Primary Mode
                  </label>
                  <select
                    name="primaryMode"
                    value={formData.primaryMode}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition bg-white"
                  >
                    <option value="">Select mode...</option>
                    {TRANSPORT_MODES.map((mode) => (
                      <option key={mode} value={mode}>
                        {mode}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Average Daily Distance */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Average Daily Distance (km)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      name="averageDailyDistance"
                      value={formData.averageDailyDistance}
                      onChange={handleChange}
                      placeholder="e.g. 15"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition"
                    />
                    <span className="absolute right-4 top-3.5 text-gray-500 text-sm font-medium">
                      km
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    For mixed journeys, calculate combined distance
                  </p>
                </div>
              </div>

              {step === "transport" && (
                <button
                  type="button"
                  onClick={() => handleNextStep("diet")}
                  className="w-full mt-8 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg transition"
                >
                  Next: Food & Diet →
                </button>
              )}
            </div>
          )}

          {/* FOOD & DIET INFORMATION */}
          {(step === "diet" || step === "energy") && (
            <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-8">
              <div className="flex items-start gap-3 mb-6">
                <div className="text-2xl">🥗</div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800">
                    Food & Diet Information
                  </h2>
                  <p className="text-gray-600 text-sm mt-1">
                    What does your typical plate look like?
                  </p>
                </div>
              </div>

              <div className="space-y-5">
                {/* Diet Type */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Diet Type
                  </label>
                  <select
                    name="dietType"
                    value={formData.dietType}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition bg-white"
                  >
                    <option value="">Select diet...</option>
                    {DIET_TYPES.map((diet) => (
                      <option key={diet} value={diet}>
                        {diet}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Meals Per Day */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Meals Per Day
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        name="mealsPerDay"
                        value={formData.mealsPerDay}
                        onChange={handleChange}
                        placeholder="3"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition"
                      />
                    </div>
                  </div>

                  {/* Eating Frequency */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Outside Eating Frequency
                    </label>
                    <select
                      name="eatingFrequency"
                      value={formData.eatingFrequency}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition bg-white"
                    >
                      <option value="">Select frequency...</option>
                      {EATING_FREQUENCIES.map((freq) => (
                        <option key={freq} value={freq}>
                          {freq}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {step === "diet" && (
                <div className="flex gap-4 mt-8">
                  <button
                    type="button"
                    onClick={() => setStep("transport")}
                    className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-3 rounded-lg transition"
                  >
                    ← Back
                  </button>
                  <button
                    type="button"
                    onClick={() => handleNextStep("energy")}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg transition"
                  >
                    Next: Energy →
                  </button>
                </div>
              )}
            </div>
          )}

          {/* HOME ENERGY USAGE */}
          {(step === "energy") && (
            <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-8">
              <div className="flex items-start gap-3 mb-6">
                <div className="text-2xl">⚡</div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800">
                    Home Energy Usage
                  </h2>
                  <p className="text-gray-600 text-sm mt-1">
                    Understanding your utility footprint
                  </p>
                </div>
              </div>

              <div className="space-y-5">
                {/* Monthly Electricity */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Monthly Electricity (kWh)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      name="monthlyElectricity"
                      value={formData.monthlyElectricity}
                      onChange={handleChange}
                      placeholder="e.g. 250"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition"
                    />
                    <span className="absolute right-4 top-3.5 text-gray-500 text-sm font-medium">
                      kWh
                    </span>
                  </div>
                </div>

                {/* Renewable Energy Toggle */}
                <div className="flex items-center justify-between p-5 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border-2 border-green-200">
                  <div>
                    <p className="font-semibold text-gray-800">
                      Renewable Energy Source
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      Do you use solar panels or a green energy provider?
                    </p>
                  </div>
                  <div className="relative">
                    <input
                      type="checkbox"
                      name="renewableEnergy"
                      checked={formData.renewableEnergy}
                      onChange={handleChange}
                      className="w-6 h-6 cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 mt-8">
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={loading}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-3 rounded-lg transition disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      Calculating...
                    </>
                  ) : (
                    "Calculate Footprint 🌱"
                  )}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
