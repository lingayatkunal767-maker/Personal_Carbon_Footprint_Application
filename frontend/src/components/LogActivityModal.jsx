import React, { useState } from 'react';
import { X, Leaf, Bike, Trash2, Car } from 'lucide-react';

const LogActivityModal = ({ isOpen, onClose, onRefresh }) => {
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

  const presets = [
    { label: "Used Public Transport", value: 1.5, icon: <Leaf size={16}/> },
    { label: "Cycled to Work/College", value: 2.4, icon: <Bike size={16}/> },
    { label: "Composted Waste", value: 0.5, icon: <Trash2 size={16}/> }
  ];

  const handleSubmit = async (value) => {
    const valToSubmit = value || parseFloat(amount);
    if (!valToSubmit) return alert("Please enter a valid amount");

    setLoading(true);
    const token = localStorage.getItem("token");

    try {
      const response = await fetch("http://localhost:8080/api/goals/active/increment", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ progress: valToSubmit })
      });

      if (response.ok) {
        onRefresh(); // Updates the Progress Bar immediately
        onClose();
        setAmount("");
      }
    } catch (err) {
      console.error("Logging error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-[32px] p-8 w-full max-w-md shadow-2xl relative">
        <button onClick={onClose} className="absolute right-6 top-6 text-gray-400"><X size={20}/></button>
        
        <h2 className="text-xl font-bold mb-2 text-gray-800">Log Eco Activity</h2>
        <p className="text-sm text-gray-400 mb-6">How much CO2 did you save today?</p>

        <div className="space-y-3 mb-6">
          {presets.map((p) => (
            <button key={p.label} onClick={() => handleSubmit(p.value)}
              className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-emerald-50 rounded-2xl transition-colors group">
              <div className="flex items-center gap-3">
                <div className="text-emerald-500">{p.icon}</div>
                <span className="text-sm font-bold text-gray-600 group-hover:text-emerald-700">{p.label}</span>
              </div>
              <span className="text-xs font-black text-emerald-600">+{p.value}kg</span>
            </button>
          ))}
        </div>

        <div className="relative flex items-center gap-2">
          <input 
            type="number" placeholder="Enter custom kg..." className="survey-input flex-1"
            value={amount} onChange={(e) => setAmount(e.target.value)}
          />
          <button 
            disabled={loading} onClick={() => handleSubmit()}
            className="bg-gray-800 text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-black disabled:opacity-50">
            {loading ? "..." : "Log"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LogActivityModal;