import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiFetch } from "../utils/api";

const TRANSPORT_MODES = ["Car", "Bike", "Public Transport", "Walk", "WFH"];
const FUEL_TYPES = ["Petrol", "Diesel", "Electric", "Hybrid"];
const DIET_TYPES = ["Vegetarian", "Non-Vegetarian", "Vegan"];
const EATING_FREQUENCIES = ["Daily", "3-4 times a week", "Once a week", "Rarely"];

export default function LifestyleSurvey() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    primaryMode: "",
    averageDailyDistance: "",
    fuelType: "Petrol",
    dietType: "",
    mealsPerDay: "3",
    eatingFrequency: "",
    monthlyElectricity: "",
    renewableEnergy: false,
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateTransport() || !validateDiet() || !validateEnergy()) return;

    setError("");
    setLoading(true);

    try {
      await apiFetch("/api/survey", {
        method: "POST",
        body: JSON.stringify({
          transportMode: formData.primaryMode,
          distance: parseFloat(formData.averageDailyDistance),
          fuelType: formData.primaryMode === 'Car' ? formData.fuelType : 'N/A',
          dietType: formData.dietType,
          mealsPerDay: parseInt(formData.mealsPerDay),
          monthlyKwh: parseFloat(formData.monthlyElectricity),
          renewable: formData.renewableEnergy
        })
      });

      navigate("/dashboard");

} catch (err) {
  if (err.status === 401) navigate("/login");
  else {
    const detail = err.message || "An unexpected error occurred.";
    setError(detail + " Please check your inputs or try again later.");
    console.error("Survey submission failure:", err);
  }
} finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#d4edda] via-[#b5dfca] to-[#5cb578] pb-10 pt-6 flex flex-col">
     
      <div className="w-full max-w-[1400px] mx-auto px-4 md:px-6">
        {/* Page Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-green-900">
            Lifestyle Assessment
          </h1>
          <p className="text-green-800/70 mt-2 text-base">
            Help us calculate your personal carbon footprint by answering a few
            questions about your daily habits.
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-lg max-w-4xl mx-auto">
            <p className="text-red-700 font-medium text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 items-stretch">
          {/* TRANSPORT INFORMATION */}
            <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-8 xl:p-10 h-full flex flex-col">
              <div className="flex items-center gap-3 mb-8 border-b border-gray-100 pb-5">
                <div className="text-3xl">🚗</div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">
                    Transport Info
                  </h2>
                </div>
              </div>

              <div className="space-y-7 flex-1">
                {/* Primary Mode */}
                <div>
                  <label className="block text-base font-semibold text-gray-700 mb-3">
                    Primary Mode
                  </label>
                  <select
                    name="primaryMode"
                    value={formData.primaryMode}
                    onChange={handleChange}
                    className="w-full px-5 py-4 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition bg-white text-lg"
                  >
                    <option value="">Select mode...</option>
                    {TRANSPORT_MODES.map((mode) => (
                      <option key={mode} value={mode}>
                        {mode}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Fuel Type (Conditional) */}
                {formData.primaryMode === "Car" && (
                  <div className="animate-in fade-in slide-in-from-top-2">
                    <label className="block text-base font-semibold text-gray-700 mb-3 text-left">
                      Fuel Type
                    </label>
                    <select
                      name="fuelType"
                      value={formData.fuelType}
                      onChange={handleChange}
                      className="w-full px-5 py-4 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition bg-white text-lg"
                    >
                      {FUEL_TYPES.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Average Daily Distance */}
                <div>
                  <label className="block text-base font-semibold text-gray-700 mb-3 text-left">
                    Average Daily Distance
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      name="averageDailyDistance"
                      value={formData.averageDailyDistance}
                      onChange={handleChange}
                      placeholder="e.g. 15"
                      className="w-full px-5 py-4 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition text-lg pr-14"
                    />
                    <span className="absolute right-5 top-4 text-gray-500 text-base font-medium">
                      km
                    </span>
                  </div>
                </div>
              </div>

            </div>

          {/* FOOD & DIET INFORMATION */}
            <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-8 xl:p-10 h-full flex flex-col">
              <div className="flex items-center gap-3 mb-8 border-b border-gray-100 pb-5">
                <div className="text-3xl">🥗</div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">
                    Food & Diet
                  </h2>
                </div>
              </div>

              <div className="space-y-7 flex-1">
                {/* Diet Type */}
                <div>
                  <label className="block text-base font-semibold text-gray-700 mb-3">
                    Diet Type
                  </label>
                  <select
                    name="dietType"
                    value={formData.dietType}
                    onChange={handleChange}
                    className="w-full px-5 py-4 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition bg-white text-lg"
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
                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label className="block text-base font-semibold text-gray-700 mb-3">
                      Meals Per Day
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        name="mealsPerDay"
                        value={formData.mealsPerDay}
                        onChange={handleChange}
                        placeholder="3"
                        className="w-full px-5 py-4 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition text-lg"
                      />
                    </div>
                  </div>

                  {/* Eating Frequency */}
                  <div>
                    <label className="block text-base font-semibold text-gray-700 mb-3">
                      Eating Out freq.
                    </label>
                    <select
                      name="eatingFrequency"
                      value={formData.eatingFrequency}
                      onChange={handleChange}
                      className="w-full px-5 py-4 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition bg-white text-lg"
                    >
                      <option value="">Select...</option>
                      {EATING_FREQUENCIES.map((freq) => (
                        <option key={freq} value={freq}>
                          {freq}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

            </div>

          {/* HOME ENERGY USAGE */}
            <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-8 xl:p-10 h-full flex flex-col">
              <div className="flex items-center gap-3 mb-8 border-b border-gray-100 pb-5">
                <div className="text-3xl">⚡</div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">
                    Home Energy
                  </h2>
                </div>
              </div>

              <div className="space-y-7 flex-1 flex flex-col justify-between">
                {/* Monthly Electricity */}
                <div>
                  <label className="block text-base font-semibold text-gray-700 mb-3">
                    Monthly Electricity
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      name="monthlyElectricity"
                      value={formData.monthlyElectricity}
                      onChange={handleChange}
                      placeholder="e.g. 250"
                      className="w-full px-5 py-4 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition text-lg pr-14"
                    />
                    <span className="absolute right-5 top-4 text-gray-500 text-base font-medium">
                      kWh
                    </span>
                  </div>
                </div>

                {/* Renewable Energy Toggle */}
                <div className="flex items-center justify-between p-5 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border-2 border-green-200 mt-4">
                  <div>
                    <p className="font-semibold text-gray-800 text-base">
                      Renewable Energy
                    </p>
                    <p className="text-sm text-gray-600 mt-1.5">
                      Do you use solar / green energy?
                    </p>
                  </div>
                  <div className="relative">
                    <input
                      type="checkbox"
                      name="renewableEnergy"
                      checked={formData.renewableEnergy}
                      onChange={handleChange}
                      className="w-7 h-7 cursor-pointer accent-green-600"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-5 justify-center max-w-[800px] mx-auto w-full mt-6">
            <button
              type="button"
              onClick={handleCancel}
              disabled={loading}
              className="w-1/3 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-4 rounded-xl transition disabled:opacity-50 text-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="w-2/3 bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-xl transition disabled:opacity-50 flex items-center justify-center gap-2 text-lg shadow-md"
            >
              {loading ? (
                <>
                  <span className="inline-block w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin"></span>
                  Calculating...
                </>
              ) : (
                "Calculate Footprint 🌱"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
