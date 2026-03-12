import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LogOut, Leaf, LayoutDashboard, ClipboardList, History, 
  Settings, Search, Bell, Car, Utensils, Zap, ChevronRight
} from "lucide-react";

const LifestyleSurvey = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    transportMode: "",
    dailyDistance: "",
    dietType: "",
    mealsPerDay: 3,
    eatOutFrequency: "",
    monthlyElectricity: "",
    renewableEnergy: false
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <div className="flex min-h-screen bg-[#F8FAF9] font-sans text-slate-700">
      
      

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1">
        

        <div className="p-8 max-w-4xl mx-auto">
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-2">
                <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded">Step 1 of 1</span>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">- Setup Profile</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-800">Lifestyle Assessment</h1>
            <p className="text-gray-500 mt-1">Help us calculate your personal carbon footprint by answering a few questions about your daily habits.</p>
          </div>

          <form className="space-y-6">
            {/* Transport Section */}
            <SurveyCard icon={Car} title="Transport Information" subtitle="How do you get around on a daily basis?">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputGroup label="Primary Mode">
                  <select name="transportMode" className="survey-input" onChange={handleInputChange}>
                    <option value="">Select mode...</option>
                    <option value="car">Car (Gasoline)</option>
                    <option value="ev">Electric Vehicle</option>
                    <option value="public">Public Transport</option>
                    <option value="bike">Bicycle / Walking</option>
                  </select>
                </InputGroup>
                <InputGroup label="Average Daily Distance (km)" tip="Tip: Include your commute and errands.">
                  <div className="relative">
                    <input type="number" name="dailyDistance" placeholder="e.g. 15" className="survey-input pr-12" onChange={handleInputChange} />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-gray-400">KM</span>
                  </div>
                </InputGroup>
              </div>
            </SurveyCard>

            {/* Food Section */}
            <SurveyCard icon={Utensils} title="Food & Diet Information" subtitle="What does your typical plate look like?">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputGroup label="Diet Type">
                  <select name="dietType" className="survey-input" onChange={handleInputChange}>
                    <option value="">Select diet...</option>
                    <option value="omnivore">Omnivore</option>
                    <option value="vegetarian">Vegetarian</option>
                    <option value="vegan">Vegan</option>
                    <option value="pescatarian">Pescatarian</option>
                  </select>
                </InputGroup>
                <InputGroup label="Meals Per Day">
                  <input type="number" name="mealsPerDay" value={formData.mealsPerDay} className="survey-input" onChange={handleInputChange} />
                </InputGroup>
                <div className="md:col-span-2">
                  <InputGroup label="How often do you eat outside?">
                    <select name="eatOutFrequency" className="survey-input" onChange={handleInputChange}>
                      <option value="">Select frequency...</option>
                      <option value="never">Rarely / Never</option>
                      <option value="weekly">1-2 times a week</option>
                      <option value="daily">Daily</option>
                    </select>
                  </InputGroup>
                </div>
              </div>
            </SurveyCard>

            {/* Energy Section */}
            <SurveyCard icon={Zap} title="Home Energy Usage" subtitle="Understanding your utility footprint.">
              <div className="space-y-6">
                <InputGroup label="Monthly Electricity (kWh)">
                  <div className="relative">
                    <input type="number" name="monthlyElectricity" placeholder="e.g. 250" className="survey-input pr-12" onChange={handleInputChange} />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-gray-400">kWh</span>
                  </div>
                </InputGroup>
                
                <div className="flex items-center justify-between p-4 bg-gray-50/50 border border-gray-100 rounded-xl">
                  <div>
                    <p className="text-sm font-bold text-gray-800">Renewable Energy Source</p>
                    <p className="text-[11px] text-gray-400">Do you use solar panels or a green energy provider?</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" name="renewableEnergy" className="sr-only peer" onChange={handleInputChange} />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                  </label>
                </div>
              </div>
            </SurveyCard>

            <div className="flex items-center justify-end gap-4 pt-4 pb-12">
              <button type="button" className="text-sm font-bold text-gray-400 hover:text-gray-600 transition-colors">Cancel</button>
              <button type="button" className="flex items-center gap-2 bg-emerald-500 text-white px-8 py-3 rounded-xl font-bold text-sm shadow-lg shadow-emerald-100 hover:bg-emerald-600 transition-all">
                Calculate Footprint <ChevronRight size={16} />
              </button>
            </div>
          </form>
        </div>
      </main>
      
      {/* Global CSS for inputs */}
      <style dangerouslySetInnerHTML={{ __html: `
        .survey-input {
          width: 100%;
          background-color: white;
          border: 1px solid #f1f5f9;
          border-radius: 0.75rem;
          padding: 0.75rem 1rem;
          font-size: 0.875rem;
          outline: none;
          transition: all 0.2s;
        }
        .survey-input:focus {
          border-color: #10b981;
          box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.05);
        }
      `}} />
    </div>
  );
};

// --- HELPER COMPONENTS ---

const SidebarItem = ({ icon: Icon, label, active, onClick, color = "text-gray-500" }) => (
  <button onClick={onClick} className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all font-semibold text-sm ${
    active ? "bg-emerald-500 text-white shadow-lg shadow-emerald-100" : `hover:bg-gray-50 ${color}`
  }`}>
    <Icon size={18} /> {label}
  </button>
);

const SurveyCard = ({ icon: Icon, title, subtitle, children }) => (
  <div className="bg-white border border-gray-100 rounded-[24px] p-8 shadow-sm">
    <div className="flex items-center gap-4 mb-8">
      <div className="p-3 bg-emerald-50 text-emerald-500 rounded-2xl">
        <Icon size={24} />
      </div>
      <div>
        <h3 className="font-bold text-gray-800">{title}</h3>
        <p className="text-xs text-gray-400">{subtitle}</p>
      </div>
    </div>
    {children}
  </div>
);

const InputGroup = ({ label, children, tip }) => (
  <div className="flex flex-col gap-2">
    <label className="text-xs font-bold text-gray-600 ml-1">{label}</label>
    {children}
    {tip && <p className="text-[10px] text-gray-400 ml-1 italic">{tip}</p>}
  </div>
);

export default LifestyleSurvey;