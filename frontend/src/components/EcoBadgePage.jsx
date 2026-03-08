import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  Award,
  Car,
  Zap,
  Leaf,
  TreePine,
  Wind,
  Globe,
  Sparkles,
  X
} from "lucide-react";

import { FaLeaf, FaEarthAmericas, FaSmog } from "react-icons/fa6";
import { GiFootprint } from "react-icons/gi";

// --- THE ANIMATED POPUP COMPONENT ---
const AchievementPopup = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-emerald-900/40 backdrop-blur-md animate-in fade-in duration-500">
      <div className="relative bg-white rounded-[40px] p-8 shadow-2xl max-w-sm w-full border-4 border-emerald-500/20 text-center animate-in zoom-in slide-in-from-bottom-10 duration-700">
        
        {/* Close Button */}
        <button onClick={onClose} className="absolute top-4 right-4 p-2 hover:bg-slate-100 rounded-full transition-colors">
          <X size={20} className="text-slate-400" />
        </button>

        {/* The Animated Nature Guardian Character */}
        <div className="relative w-40 h-40 mx-auto mb-6">
          <div className="absolute inset-0 bg-emerald-100 rounded-full animate-pulse" />
          
          <div className="relative z-10 w-full h-full flex items-center justify-center animate-bounce duration-[3000ms]">
            <div className="relative">
              {/* Earth/Core */}
              <Globe className="w-24 h-24 text-emerald-600 opacity-90" />
              
              {/* Guardian Features (Leaf Wings) */}
              <Leaf className="absolute -top-3 -left-4 w-12 h-12 text-emerald-500 -rotate-45 animate-pulse" />
              <Leaf className="absolute -top-3 -right-4 w-12 h-12 text-emerald-500 rotate-45 animate-pulse" />
              
              {/* The "Eco Badge" being presented */}
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-yellow-400 p-2 rounded-xl shadow-lg border-2 border-white rotate-6">
                <Award className="w-8 h-8 text-emerald-900" />
              </div>
            </div>
          </div>
          <Sparkles className="absolute top-0 right-0 text-yellow-400 animate-ping" size={20} />
        </div>

        {/* Popup Text */}
        <h2 className="text-2xl font-black text-emerald-900 tracking-tight">Eco Milestones!</h2>
        <p className="text-slate-500 text-sm font-medium mt-2 leading-relaxed">
          Your journey to a greener Earth is being rewarded. Check out your new badges!
        </p>

        <button 
          onClick={onClose}
          className="mt-6 w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-4 rounded-2xl shadow-lg shadow-emerald-200 transition-all active:scale-95"
        >
          VIEW ACHIEVEMENTS
        </button>
      </div>
    </div>
  );
};

// --- MAIN BADGES PAGE ---
export function EcoBadges() {
  const [showPopup, setShowPopup] = useState(true);
  const sectionRef = useRef(null);
  const navigate = useNavigate();

  // Auto-close popup after 5 seconds if user doesn't click
  useEffect(() => {
    const timer = setTimeout(() => setShowPopup(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  const badges = [
    { type: "transport", name: "Transport Pro", icon: Car, description: "Reduced transport emissions by 50%", earned: true, date: "Jan 5, 2026", color: "bg-blue-500", bgColor: "bg-blue-100" },
    { type: "energy", name: "Energy Saver", icon: Zap, description: "Saved 100 kWh of electricity", earned: true, date: "Dec 28, 2025", color: "bg-yellow-500", bgColor: "bg-yellow-100" },
    { type: "tree", name: "Tree Planter", icon: TreePine, description: "Offset 1000 kg of CO₂", earned: true, date: "Dec 15, 2025", color: "bg-green-500", bgColor: "bg-green-100" },
    { type: "tree", name: "Tree Ranger", icon: Leaf, description: "Offset 5000 kg of CO₂", earned: false, color: "bg-emerald-500", bgColor: "bg-emerald-100" }
  ];

  const earnedCount = badges.filter((b) => b.earned).length;

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-emerald-200 via-green-100 to-sky-200 font-sans">
      
      {/* Intro Pop-up Overlay */}
      {showPopup && <AchievementPopup onClose={() => setShowPopup(false)} />}

      {/* Floating Background Icons */}
      <FaLeaf className="absolute text-emerald-300 text-9xl top-10 left-10 opacity-20 rotate-12" />
      <FaEarthAmericas className="absolute text-green-400 text-8xl bottom-10 right-16 opacity-20" />
      <FaSmog className="absolute text-slate-400 text-7xl bottom-24 left-20 opacity-10" />
      <GiFootprint className="absolute text-emerald-500 text-8xl top-1/3 right-10 opacity-10 rotate-45" />

      <section ref={sectionRef} className="relative z-10 max-w-4xl w-full px-6 py-12">

        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => navigate("/dashboard")} className="p-2 hover:bg-white/50 rounded-lg transition-colors">
            <ChevronLeft className="w-6 h-6 text-emerald-800" />
          </button>
          <div>
            <h1 className="text-3xl font-black text-emerald-900 leading-none">Eco Badges</h1>
            <p className="text-sm text-slate-600 mt-1">Complete challenges to unlock milestones</p>
          </div>
        </div>

        {/* Progress Summary Card */}
        <div className="backdrop-blur-lg bg-white/80 border border-white/40 shadow-xl p-8 rounded-[32px] mb-6">
          <div className="flex items-center gap-8">
            <div className="w-20 h-20 bg-emerald-600 rounded-[20px] flex items-center justify-center shadow-lg shadow-emerald-200 rotate-3 animate-in zoom-in duration-1000">
              <Award className="w-10 h-10 text-white" />
            </div>
            <div>
              <h2 className="text-4xl font-black text-emerald-900">
                {earnedCount} <span className="text-xl font-normal text-emerald-800/30">/ {badges.length}</span>
              </h2>
              <p className="text-slate-600 font-bold uppercase tracking-widest text-xs mt-1">
                Badges Earned 🌍
              </p>
            </div>
          </div>
        </div>

        {/* Badge Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {badges.map((badge, index) => {
            const Icon = badge.icon;
            return (
              <div
                key={index}
                onClick={() => navigate(`/badges/${badge.type}`)}
                className={`backdrop-blur-lg border border-white/40 shadow-xl p-6 rounded-3xl cursor-pointer hover:scale-[1.03] active:scale-95 transition-all duration-300 ${badge.earned ? 'bg-white/80' : 'bg-white/40 grayscale-[0.3]'}`}
              >
                <div className="flex gap-5 items-start">
                  <div className={`w-14 h-14 ${badge.bgColor} rounded-xl flex items-center justify-center shadow-sm`}>
                    <Icon className={`w-7 h-7 ${badge.color.replace("bg-", "text-")}`} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-emerald-900 text-lg">{badge.name}</h3>
                    <p className="text-sm text-slate-600 line-clamp-2 leading-snug">{badge.description}</p>
                    {badge.earned ? (
                      <p className="text-[10px] font-black text-green-600 mt-2 uppercase tracking-tighter bg-green-50 inline-block px-2 py-0.5 rounded">
                        Unlocked {badge.date}
                      </p>
                    ) : (
                      <p className="text-[10px] font-black text-slate-400 mt-2 uppercase tracking-tighter bg-slate-50 inline-block px-2 py-0.5 rounded">
                        Locked
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* More Badges Note */}
        <div className="backdrop-blur-lg bg-white/40 border border-white/20 p-6 rounded-[28px] mt-8 flex gap-5 items-center">
          <Wind className="text-emerald-700 w-6 h-6" />
          <p className="text-sm text-emerald-900/60 font-bold">
            Stay tuned for more eco challenges coming soon! 🌱
          </p>
        </div>

      </section>
    </div>
  );
}

export default EcoBadges;