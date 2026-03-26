import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import confetti from "canvas-confetti";
import {
  ChevronLeft, Award, Car, Zap, Leaf, TreePine,
  Sparkles, X, ShieldCheck, Globe, Target, Shield, Lock,
  Bike, Recycle, Sun, Droplets, Trophy
} from "lucide-react";

const ICON_MAP = {
  Sparkles, Car, Zap, Leaf, TreePine, Award, ShieldCheck,
  Globe, Target, Shield, Lock, Bike, Recycle, Sun, Droplets,
};

function getIcon(iconName) {
  return ICON_MAP[iconName] || Award;
}

const AchievementPopup = ({ badgeName, onClose }) => {
  useEffect(() => {
    confetti({ 
      particleCount: 150, 
      spread: 70, 
      origin: { y: 0.6 }, 
      colors: ["#059669", "#10b981", "#34d399"] 
    });
  }, []);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md">
      <div className="relative bg-white rounded-[40px] p-8 shadow-2xl max-w-sm w-full border border-slate-200 text-center animate-fade-up">
        <button onClick={onClose} className="absolute top-4 right-4 p-2 hover:bg-slate-100 rounded-full transition-colors">
          <X size={20} className="text-slate-400" />
        </button>
        <div className="w-24 h-24 bg-emerald-100 rounded-3xl flex items-center justify-center mx-auto mb-5 animate-bounce shadow-lg shadow-emerald-500/20">
          <Trophy className="w-12 h-12 text-emerald-600" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900">New Badge Unlocked!</h2>
        <div className="mt-2 inline-block px-4 py-1 rounded-full bg-emerald-100 text-emerald-700 font-bold text-sm">
          {badgeName}
        </div>
        <p className="text-slate-500 text-sm font-medium mt-3 leading-relaxed">
          Your commitment to a greener Earth has earned you a new milestone in the Sustainable League!
        </p>
        <button onClick={onClose} className="mt-6 w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 rounded-2xl shadow-lg transition-all">
          COLLECT BADGE
        </button>
      </div>
    </div>
  );
};

function EcoBadges() {
  const location = useLocation();
  const navigate = useNavigate();
  const [showPopup, setShowPopup] = useState(false);
  const [newlyEarnedName, setNewlyEarnedName] = useState("");
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [fetchError, setFetchError] = useState("");

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
        const res = await fetch("http://localhost:8080/api/badges/current", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setBadges(Array.isArray(data) ? data : []);
        } else {
          setFetchError(`Server error ${res.status}`);
        }
      } catch (err) {
        setFetchError("Cannot reach backend server.");
      } finally {
        setLoading(false);
      }
    };
    fetchBadges();
  }, []);

  const earnedBadges = badges.filter(b => b.earned);
  const lockedBadges = badges.filter(b => !b.earned);
  const displayed = activeTab === "earned" ? earnedBadges
                  : activeTab === "inprogress" ? lockedBadges
                  : badges;

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="relative min-h-screen bg-slate-50 text-slate-900 font-sans pb-20">
      {showPopup && <AchievementPopup badgeName={newlyEarnedName} onClose={() => setShowPopup(false)} />}

      <div className="relative mx-auto max-w-5xl px-6 py-10">
        
        {/* Header - Matches Leaderboard Style */}
        <header className="space-y-6 mb-10">
          <button onClick={() => navigate("/dashboard")}
            className="flex items-center gap-2 text-sm text-slate-500 hover:text-emerald-600 transition font-medium">
            <ChevronLeft className="h-4 w-4" /> Back to Dashboard
          </button>

          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-lg shadow-emerald-500/30">
                <Award className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.35em] text-emerald-700">Milestones</p>
                <p className="text-sm text-slate-600">Eco Achievement Gallery</p>
              </div>
            </div>
            
            {/* Tab Switcher - Matches Leaderboard Switcher */}
            <div className="inline-flex items-center gap-1 rounded-full bg-white border border-slate-200 p-1 shadow-sm">
              {["all", "earned", "inprogress"].map(t => (
                <button key={t} onClick={() => setActiveTab(t)}
                  className={`rounded-full px-5 py-2 text-xs font-bold transition uppercase ${
                    activeTab === t ? "bg-slate-900 text-white shadow" : "text-slate-500 hover:bg-slate-50"
                  }`}>
                  {t === "inprogress" ? "In Progress" : t}
                </button>
              ))}
            </div>
          </div>

          <h1 className="text-4xl font-bold tracking-tight text-slate-900">Your Green Impact</h1>
        </header>

        {/* Stats Card - Matches Leaderboard StatCard Style */}
        <div className="grid gap-6 sm:grid-cols-2 mb-10">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm flex items-center gap-6">
            <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center">
              <Trophy className="w-8 h-8 text-emerald-600" />
            </div>
            <div>
              <p className="text-3xl font-bold text-slate-900">{earnedBadges.length} <span className="text-lg font-normal text-slate-400">/ {badges.length}</span></p>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Badges Unlocked</p>
            </div>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col justify-center">
            <div className="flex justify-between items-end mb-2">
              <p className="text-xs font-bold text-emerald-700 uppercase">Gallery Completion</p>
              <p className="text-sm font-bold text-slate-900">{badges.length > 0 ? Math.round((earnedBadges.length / badges.length)*100) : 0}%</p>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 transition-all duration-700"
                style={{ width: `${badges.length > 0 ? (earnedBadges.length / badges.length)*100 : 0}%` }} />
            </div>
          </div>
        </div>

        {/* Badge Grid - Matches Leaderboard List Style */}
        {displayed.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {displayed.map((badge, i) => {
              const Icon = getIcon(badge.iconName);
              return (
                <div key={i}
                  className={`group relative flex items-start gap-5 p-5 rounded-[24px] border transition-all duration-300 ${
                    badge.earned 
                    ? "bg-white border-slate-200 shadow-sm hover:border-emerald-300" 
                    : "bg-slate-50/50 border-transparent border-dashed border-slate-200"
                  }`}>
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-105 ${
                    badge.earned ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-400"
                  }`}>
                    <Icon size={28} />
                    {!badge.earned && <Lock size={12} className="absolute -bottom-1 -right-1 text-slate-400 bg-white rounded-full p-0.5" />}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <h3 className={`font-bold text-base ${badge.earned ? "text-slate-900" : "text-slate-400"}`}>
                        {badge.name}
                      </h3>
                      {badge.earned && <Sparkles size={14} className="text-emerald-400" />}
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed mt-1">{badge.description}</p>
                    
                    {badge.earned ? (
                      <div className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-[10px] font-bold text-emerald-700 uppercase tracking-tight">
                        <ShieldCheck size={12} /> Milestone Reached
                      </div>
                    ) : badge.target > 0 && (
                      <div className="mt-4">
                        <div className="flex justify-between text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-tighter">
                          <span>Progress: {badge.current} / {badge.target}</span>
                          <span>{badge.progress}%</span>
                        </div>
                        <div className="h-1.5 bg-slate-200/50 rounded-full overflow-hidden">
                          <div className="h-full bg-slate-300 rounded-full" style={{ width: `${badge.progress}%` }} />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-slate-300 p-20 text-center">
            <Award className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 font-medium">No badges found in this category.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default EcoBadges;