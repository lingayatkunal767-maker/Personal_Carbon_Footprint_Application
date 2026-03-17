import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import confetti from 'canvas-confetti';
import { useNavigate } from "react-router-dom";
import {
  ChevronLeft, Award, Car, Zap, Leaf, TreePine, Wind, Globe, Sparkles, X, ShieldCheck
} from "lucide-react";

import { FaLeaf, FaEarthAmericas, FaSmog } from "react-icons/fa6";
import { GiFootprint } from "react-icons/gi";

const AchievementPopup = ({ badgeName, onClose }) => {
  useEffect(() => {
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#10b981', '#34d399', '#facc15']
    });
  }, []);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-emerald-900/40 backdrop-blur-md animate-in fade-in duration-500">
      <div className="relative bg-white rounded-[40px] p-8 shadow-2xl max-w-sm w-full border-4 border-emerald-500/20 text-center animate-in zoom-in slide-in-from-bottom-10 duration-700">
        
        <button onClick={onClose} className="absolute top-4 right-4 p-2 hover:bg-slate-100 rounded-full transition-colors">
          <X size={20} className="text-slate-400" />
        </button>

        <div className="relative w-40 h-40 mx-auto mb-6">
          <div className="absolute inset-0 bg-emerald-100 rounded-full animate-pulse" />
          <div className="relative z-10 w-full h-full flex items-center justify-center animate-bounce duration-[3000ms]">
            <div className="relative">
              <Globe className="w-24 h-24 text-emerald-600 opacity-90" />
              <Leaf className="absolute -top-3 -left-4 w-12 h-12 text-emerald-500 -rotate-45 animate-pulse" />
              <Leaf className="absolute -top-3 -right-4 w-12 h-12 text-emerald-500 rotate-45 animate-pulse" />
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-yellow-400 p-2 rounded-xl shadow-lg border-2 border-white rotate-6">
                <Award className="w-8 h-8 text-emerald-900" />
              </div>
            </div>
          </div>
          <Sparkles className="absolute top-0 right-0 text-yellow-400 animate-ping" size={20} />
        </div>

        <h2 className="text-2xl font-black text-emerald-900 tracking-tight">New Badge Unlocked!</h2>
        <div className="mt-2 inline-block px-4 py-1 rounded-full bg-emerald-100 text-emerald-700 font-bold text-sm">
          {badgeName || "Eco Achievement"}
        </div>
        <p className="text-slate-500 text-sm font-medium mt-3 leading-relaxed">
          The Nature Guardian is impressed! Your commitment to a greener Earth has earned you a new milestone.
        </p>

        <button 
          onClick={onClose}
          className="mt-6 w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-4 rounded-2xl shadow-lg transition-all active:scale-95"
        >
          COLLECT BADGE
        </button>
      </div>
    </div>
  );
};

export function EcoBadges() {
  const location = useLocation();
  const [showPopup, setShowPopup] = useState(false);
  const [newlyEarnedName, setNewlyEarnedName] = useState("");
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  
  
  const iconMap = {
    "Eco Starter": Sparkles,
    "Transport Pro": Car,
    "Energy Saver": Zap,
    "Tree Planter": Leaf,
    "Nature Guardian": TreePine,
    "Eco Master": ShieldCheck,
    "Goal Crusher": Award 
  };
  useEffect(() => {
    if (location.state?.newlyEarned) {
      setNewlyEarnedName(location.state.newlyEarned);
      setShowPopup(true);

      window.history.replaceState({}, document.title);
    }
  }, [location]);
  


  useEffect(() => {
    const fetchBadges = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch("http://localhost:8080/api/badges/current", {
            headers: { "Authorization": `Bearer ${token}` }
        }); 
        const data = await response.json();
        setBadges(data);
      } catch (err) {
        console.error("Error fetching badges:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBadges();
  }, []);

  const earnedCount = badges.filter((b) => b.earned).length;

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-emerald-200 via-green-100 to-sky-200 font-sans">
      
      {showPopup && (
        <AchievementPopup 
          badgeName={newlyEarnedName} 
          onClose={() => setShowPopup(false)} 
        />
      )}

      <FaLeaf className="absolute text-emerald-300 text-9xl top-10 left-10 opacity-20 rotate-12" />
      <FaEarthAmericas className="absolute text-green-400 text-8xl bottom-10 right-16 opacity-20" />

      <section className="relative z-10 max-w-4xl w-full px-6 py-12">
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => navigate("/dashboard")} className="p-2 hover:bg-white/50 rounded-lg transition-colors">
            <ChevronLeft className="w-6 h-6 text-emerald-800" />
          </button>
          <div>
            <h1 className="text-3xl font-black text-emerald-900 leading-none">My Eco Gallery</h1>
            <p className="text-sm text-slate-600 mt-1">Real-time milestones from your green actions</p>
          </div>
        </div>

        <div className="backdrop-blur-lg bg-white/80 border border-white/40 shadow-xl p-8 rounded-[32px] mb-6">
          <div className="flex items-center gap-8">
            <div className="w-20 h-20 bg-emerald-600 rounded-[20px] flex items-center justify-center shadow-lg rotate-3">
              <Award className="w-10 h-10 text-white" />
            </div>
            <div>
              <h2 className="text-4xl font-black text-emerald-900">
                {earnedCount} <span className="text-xl font-normal text-emerald-800/30">/ {badges.length}</span>
              </h2>
              <p className="text-slate-600 font-bold uppercase tracking-widest text-xs mt-1">
                Badges Unlocked 🌍
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {badges.map((badge, index) => {
            const Icon = iconMap[badge.iconName] || Award;
            return (
              <div
                key={index}
                className={`backdrop-blur-lg border border-white/40 shadow-xl p-6 rounded-3xl transition-all duration-300 ${badge.earned ? 'bg-white/80' : 'bg-white/30 grayscale opacity-70'}`}
              >
                <div className="flex gap-5 items-start">
                  <div className={`w-14 h-14 ${badge.earned ? badge.bgColor : 'bg-slate-200'} rounded-xl flex items-center justify-center`}>
                    <Icon className={`w-7 h-7 ${badge.earned ? badge.color.replace("bg-", "text-") : 'text-slate-400'}`} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-emerald-900 text-lg">{badge.name}</h3>
                    <p className="text-sm text-slate-600 line-clamp-2 leading-snug">{badge.description}</p>
                    {badge.earned ? (
                      <p className="text-[10px] font-black text-green-600 mt-2 uppercase tracking-tighter bg-green-50 inline-block px-2 py-0.5 rounded">
                        Earned on {badge.date}
                      </p>
                    ) : (
                      <p className="text-[10px] font-black text-slate-400 mt-2 uppercase tracking-tighter bg-slate-50 inline-block px-2 py-0.5 rounded">
                        Keep going to unlock
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

export default EcoBadges;