import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Car, Utensils, Zap, ChevronRight, Loader2, 
  Plane, ShoppingBag, Leaf, History, LayoutDashboard
} from "lucide-react";

const LifestyleSurvey = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // State mapped to all available DB columns
  const [formData, setFormData] = useState({
    transportMode: "",
    dailyDistance: "",
    dietType: "omnivore",
    mealsPerDay: 3,
    monthlyElectricity: "",
    renewableEnergy: false,
    shortFlights: 0,
    longFlights: 0,
    buysLocal: false,
    buysSecondHand: false,
    meatMealsPerWeek: 7
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  
  const handleSubmit = async (e) => {
  e.preventDefault();
  setIsSubmitting(true);
  const token = localStorage.getItem("token");

  const payload = {
    // ... your existing payload mapping
    primaryTransport: formData.transportMode,
    weeklyDrivingKm: (parseFloat(formData.dailyDistance) || 0) * 7,
    carType: formData.transportMode === 'ev' ? 'electric' : 'gasoline',
    monthlyElectricityKwh: parseFloat(formData.monthlyElectricity) || 0,
    hasRenewableEnergy: formData.renewableEnergy,
    dietType: formData.dietType,
    meatMealsPerWeek: parseInt(formData.meatMealsPerWeek),
    buysLocalFood: formData.buysLocal,
    buysSecondHand: formData.buysSecondHand,
    shortFlightsPerYear: parseInt(formData.shortFlights) || 0,
    longFlightsPerYear: parseInt(formData.longFlights) || 0,
    homeHeating: "electric", 
    shoppingHabits: formData.buysSecondHand ? "sustainable" : "regular"
  };

  try {
    const response = await fetch("http://localhost:8080/api/survey", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      const result = await response.json();
      
      // Check if a badge was earned (e.g., "Eco Starter")
      if (result.newBadge) {
        // Navigate to the Gallery and pass the badge name in the state
        navigate("/badges", { state: { newlyEarned: result.newBadge } });
      } else {
        navigate("/dashboard");
      }
    } else {
      console.error("Submission error");
    }
  } catch (error) {
    console.error("Network error:", error);
  } finally {
    setIsSubmitting(false);
  }
};

  return (
    <div className="flex min-h-screen bg-[#F8FAF9] font-sans text-slate-700">
      <main className="flex-1 pb-20">
        <div className="p-8 max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded">Comprehensive Assessment</span>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">- Full Profile Sync</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-800">Lifestyle Assessment</h1>
            <p className="text-gray-500 mt-1">Fill this out to calibrate your EcoTrack dashboard and set your baseline.</p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            
            {/* 1. Transport */}
            <SurveyCard icon={Car} title="Transport & Mobility" subtitle="Daily commuting and vehicle details">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputGroup label="Primary Mode of Travel">
                  <select name="transportMode" className="survey-input" value={formData.transportMode} onChange={handleInputChange} required>
                    <option value="">Select mode...</option>
                    <option value="car">Car (Gasoline)</option>
                    <option value="ev">Electric Vehicle</option>
                    <option value="public">Public Transport</option>
                    <option value="bike">Bicycle / Walking</option>
                  </select>
                </InputGroup>
                <InputGroup label="Average Daily Distance (km)">
                  <div className="relative">
                    <input type="number" name="dailyDistance" value={formData.dailyDistance} className="survey-input pr-12" onChange={handleInputChange} required />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-gray-400">KM</span>
                  </div>
                </InputGroup>
              </div>
            </SurveyCard>

            {/* 2. Diet */}
            <SurveyCard icon={Utensils} title="Food & Diet" subtitle="Mapping your nutritional footprint">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputGroup label="Dietary Preference">
                  <select name="dietType" className="survey-input" value={formData.dietType} onChange={handleInputChange}>
                    <option value="omnivore">Omnivore</option>
                    <option value="vegetarian">Vegetarian</option>
                    <option value="vegan">Vegan</option>
                    <option value="pescatarian">Pescatarian</option>
                  </select>
                </InputGroup>
                <InputGroup label="Meat Meals per Week">
                  <input type="number" name="meatMealsPerWeek" value={formData.meatMealsPerWeek} className="survey-input" onChange={handleInputChange} />
                </InputGroup>
              </div>
            </SurveyCard>

            {/* 3. Energy */}
            <SurveyCard icon={Zap} title="Home Energy" subtitle="Utility consumption and green sources">
              <div className="space-y-4">
                <InputGroup label="Monthly Electricity Consumption">
                  <div className="relative">
                    <input type="number" name="monthlyElectricity" value={formData.monthlyElectricity} placeholder="e.g. 250" className="survey-input pr-12" onChange={handleInputChange} required />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-gray-400">kWh</span>
                  </div>
                </InputGroup>
                <div className="flex items-center justify-between p-4 bg-gray-50/50 border border-gray-100 rounded-xl">
                  <div>
                    <p className="text-sm font-bold text-gray-800">Renewable Energy</p>
                    <p className="text-[11px] text-gray-400">Do you have solar panels or a green tariff?</p>
                  </div>
                  <ToggleButton name="renewableEnergy" checked={formData.renewableEnergy} onChange={handleInputChange} />
                </div>
              </div>
            </SurveyCard>

            {/* 4. Travel (New Section for DB Columns) */}
            <SurveyCard icon={Plane} title="Air Travel" subtitle="Annual flight frequency">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputGroup label="Short Flights (<3h) per Year">
                  <input type="number" name="shortFlights" value={formData.shortFlights} className="survey-input" onChange={handleInputChange} />
                </InputGroup>
                <InputGroup label="Long Flights (>3h) per Year">
                  <input type="number" name="longFlights" value={formData.longFlights} className="survey-input" onChange={handleInputChange} />
                </InputGroup>
              </div>
            </SurveyCard>

            {/* 5. Consumption (New Section for DB Columns) */}
            <SurveyCard icon={ShoppingBag} title="Consumption Habits" subtitle="Sustainable shopping choices">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50/50 border border-gray-100 rounded-xl">
                  <div>
                    <p className="text-sm font-bold text-gray-800">Prioritize Local Food</p>
                    <p className="text-[11px] text-gray-400">Reduces transport emissions for groceries</p>
                  </div>
                  <ToggleButton name="buysLocal" checked={formData.buysLocal} onChange={handleInputChange} />
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50/50 border border-gray-100 rounded-xl">
                  <div>
                    <p className="text-sm font-bold text-gray-800">Second-Hand Enthusiast</p>
                    <p className="text-[11px] text-gray-400">Purchasing pre-loved items instead of new</p>
                  </div>
                  <ToggleButton name="buysSecondHand" checked={formData.buysSecondHand} onChange={handleInputChange} />
                </div>
              </div>
            </SurveyCard>

            {/* Footer Actions */}
            <div className="flex items-center justify-end gap-4 pt-4">
              <button type="button" onClick={() => navigate("/dashboard")} className="text-sm font-bold text-gray-400 hover:text-gray-600">Skip for now</button>
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="flex items-center gap-2 bg-emerald-500 text-white px-10 py-4 rounded-2xl font-bold text-sm shadow-xl shadow-emerald-100 hover:bg-emerald-600 transition-all disabled:opacity-50"
              >
                {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : "Finalize & Calculate"}
                {!isSubmitting && <ChevronRight size={18} />}
              </button>
            </div>
          </form>
        </div>
      </main>

      {/* Reusable Styles */}
      <style dangerouslySetInnerHTML={{ __html: `
        .survey-input {
          width: 100%;
          background-color: white;
          border: 1px solid #e2e8f0;
          border-radius: 1rem;
          padding: 0.875rem 1.25rem;
          font-size: 0.875rem;
          outline: none;
          transition: border-color 0.2s;
        }
        .survey-input:focus { border-color: #10b981; }
      `}} />
    </div>
  );
};

// --- SUB-COMPONENTS ---

const SurveyCard = ({ icon: Icon, title, subtitle, children }) => (
  <div className="bg-white border border-gray-100 rounded-[32px] p-8 shadow-sm">
    <div className="flex items-center gap-4 mb-8">
      <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl"><Icon size={24} /></div>
      <div>
        <h3 className="font-bold text-gray-800 text-lg">{title}</h3>
        <p className="text-xs text-gray-400">{subtitle}</p>
      </div>
    </div>
    {children}
  </div>
);

const InputGroup = ({ label, children }) => (
  <div className="flex flex-col gap-2">
    <label className="text-xs font-bold text-gray-500 ml-1 uppercase tracking-tight">{label}</label>
    {children}
  </div>
);

const ToggleButton = ({ name, checked, onChange }) => (
  <label className="relative inline-flex items-center cursor-pointer">
    <input type="checkbox" name={name} checked={checked} className="sr-only peer" onChange={onChange} />
    <div className="w-12 h-6 bg-gray-200 rounded-full peer peer-checked:bg-emerald-500 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-6"></div>
  </label>
);


const handleSurveySubmit = async (data) => {
    const response = await fetch("/api/survey", { 
        method: "POST", 
        body: JSON.stringify(data) 
    });
    const result = await response.json();

    // THIS IS THE TRIGGER:
    if (result.newBadge === "Eco Starter") {
        setNewlyEarnedName(result.newBadge);
        setShowPopup(true); 
    }
};
export default LifestyleSurvey;