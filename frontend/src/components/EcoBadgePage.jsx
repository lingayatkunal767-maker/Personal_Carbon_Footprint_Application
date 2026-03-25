import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import confetti from "canvas-confetti";
import {
  ChevronLeft, Award, Car, Zap, Leaf, TreePine,
  Sparkles, X, ShieldCheck, Globe, Target, Shield, Lock,
  Bike, Recycle, Sun, Droplets,
} from "lucide-react";

// Icon map — matches ALL iconName values returned by backend (built-in + admin-created)
const ICON_MAP = {
  Sparkles, Car, Zap, Leaf, TreePine, Award, ShieldCheck,
  Globe, Target, Shield, Lock, Bike, Recycle, Sun, Droplets,
};

function getIcon(iconName) {
  return ICON_MAP[iconName] || Award;
}

// Achievement popup with confetti
const AchievementPopup = ({ badgeName, onClose }) => {
  useEffect(() => {
    confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 }, colors: ["#10b981","#34d399","#facc15"] });
  }, []);
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-emerald-900/40 backdrop-blur-md">
      <div className="relative bg-white rounded-[40px] p-8 shadow-2xl max-w-sm w-full border-4 border-emerald-500/20 text-center">
        <button onClick={onClose} className="absolute top-4 right-4 p-2 hover:bg-slate-100 rounded-full transition-colors">
          <X size={20} className="text-slate-400" />
        </button>
        <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-5 animate-bounce">
          <Award className="w-12 h-12 text-emerald-600" />
        </div>
        <h2 className="text-2xl font-black text-emerald-900">New Badge Unlocked!</h2>
        <div className="mt-2 inline-block px-4 py-1 rounded-full bg-emerald-100 text-emerald-700 font-bold text-sm">{badgeName}</div>
        <p className="text-slate-500 text-sm font-medium mt-3 leading-relaxed">
          Your commitment to a greener Earth has earned you a new milestone!
        </p>
        <button onClick={onClose} className="mt-6 w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-4 rounded-2xl shadow-lg transition-all">
          COLLECT BADGE
        </button>
      </div>
    </div>
  );
};

function EcoBadges() {
  const location = useLocation();
  const navigate  = useNavigate();
  const [showPopup, setShowPopup]         = useState(false);
  const [newlyEarnedName, setNewlyEarnedName] = useState("");
  const [badges, setBadges]               = useState([]);
  const [loading, setLoading]             = useState(true);
  const [activeTab, setActiveTab]         = useState("all");
  const [fetchError, setFetchError]       = useState("");

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
        const res   = await fetch("http://localhost:8080/api/badges/current", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          // Backend returns array with earned/locked badges including admin-created ones
          setBadges(Array.isArray(data) ? data : []);
        } else {
          const body = await res.json().catch(() => ({}));
          setFetchError(body.error || `Server error ${res.status}`);
        }
      } catch (err) {
        setFetchError("Cannot reach backend. Make sure it is running at localhost:8080.");
        console.error("Error fetching badges:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBadges();
  }, []);

  const earnedBadges     = badges.filter(b => b.earned);
  const lockedBadges     = badges.filter(b => !b.earned);
  const displayed = activeTab === "earned" ? earnedBadges
                  : activeTab === "inprogress" ? lockedBadges
                  : badges;

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-200 via-green-100 to-sky-200">
      <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-emerald-200 via-green-100 to-sky-200 font-sans">
      {showPopup && <AchievementPopup badgeName={newlyEarnedName} onClose={() => setShowPopup(false)} />}

      <Leaf className="absolute text-emerald-300 w-40 h-40 top-10 left-10 opacity-20 rotate-12" />
      <Globe className="absolute text-green-400 w-32 h-32 bottom-10 right-16 opacity-20" />

      <section className="relative z-10 max-w-4xl w-full mx-auto px-6 py-12">

        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button onClick={() => navigate("/dashboard")} className="p-2 hover:bg-white/50 rounded-lg transition-colors">
            <ChevronLeft className="w-6 h-6 text-emerald-800" />
          </button>
          <div className="flex-1">
            <h1 className="text-3xl font-black text-emerald-900 leading-none">My Eco Gallery</h1>
            <p className="text-sm text-slate-600 mt-1">Real-time milestones from your green actions</p>
          </div>
          {/* All / Earned / In Progress tabs */}
          <div className="flex gap-1 bg-white/60 rounded-2xl p-1">
            {["all","earned","inprogress"].map(t => (
              <button key={t} onClick={() => setActiveTab(t)}
                className={`px-4 py-2 rounded-xl text-xs font-black uppercase transition-all ${
                  activeTab === t ? "bg-emerald-600 text-white shadow" : "text-emerald-800 hover:bg-white/50"
                }`}>
                {t === "inprogress" ? "In Progress" : t}
              </button>
            ))}
          </div>
        </div>

        {/* Error banner */}
        {fetchError && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-sm font-medium">
            ⚠️ {fetchError}
          </div>
        )}

        {/* Stats card */}
        <div className="backdrop-blur-lg bg-white/80 border border-white/40 shadow-xl p-6 rounded-[32px] mb-6">
          <div className="flex items-center gap-8">
            <div className="w-20 h-20 bg-emerald-600 rounded-[20px] flex items-center justify-center shadow-lg rotate-3">
              <Award className="w-10 h-10 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-4xl font-black text-emerald-900">
                {earnedBadges.length} <span className="text-xl font-normal text-emerald-800/30">/ {badges.length}</span>
              </h2>
              <p className="text-slate-600 font-bold uppercase tracking-widest text-xs mt-1">Badges Unlocked 🌍</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-black text-emerald-600">{earnedBadges.length * 50}</p>
              <p className="text-xs text-slate-500 font-semibold">Eco Points</p>
            </div>
          </div>
          {/* Overall progress bar */}
          <div className="mt-4">
            <div className="flex justify-between text-xs text-slate-500 mb-1">
              <span>Overall Progress</span>
              <span>{badges.length > 0 ? Math.round((earnedBadges.length / badges.length)*100) : 0}%</span>
            </div>
            <div className="h-2 bg-emerald-100 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full transition-all duration-700"
                style={{ width: `${badges.length > 0 ? (earnedBadges.length / badges.length)*100 : 0}%` }} />
            </div>
          </div>
        </div>

        {/* Badge grid */}
        {displayed.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {displayed.map((badge, i) => {
              const Icon = getIcon(badge.iconName);
              return (
                <div key={i}
                  className={`backdrop-blur-lg border border-white/40 shadow-xl p-6 rounded-3xl transition-all duration-300 ${
                    badge.earned ? "bg-white/80" : "bg-white/30"
                  }`}>
                  <div className="flex gap-5 items-start">
                    <div className={`w-14 h-14 ${badge.earned ? badge.bgColor || "bg-emerald-100" : "bg-slate-200"} rounded-xl flex items-center justify-center relative flex-shrink-0`}>
                      <Icon className={`w-7 h-7 ${badge.earned ? badge.color || "text-emerald-600" : "text-slate-400"}`} />
                      {!badge.earned && (
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-slate-300 rounded-full flex items-center justify-center">
                          <Lock className="w-3 h-3 text-slate-500" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-emerald-900 text-base leading-tight">{badge.name}</h3>
                      <p className="text-xs text-slate-600 leading-snug mt-0.5">{badge.description}</p>

                      {badge.earned ? (
                        <span className="mt-2 inline-block text-[10px] font-black text-green-600 bg-green-50 px-2 py-0.5 rounded uppercase tracking-tighter">
                          ✓ Earned
                        </span>
                      ) : badge.target > 0 ? (
                        <div className="mt-2">
                          <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                            <span>{badge.current} / {badge.target}</span>
                            <span>{badge.progress}%</span>
                          </div>
                          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-400/60 rounded-full"
                              style={{ width: `${badge.progress}%` }} />
                          </div>
                        </div>
                      ) : (
                        <span className="mt-2 inline-block text-[10px] font-black text-slate-400 bg-slate-50 px-2 py-0.5 rounded uppercase tracking-tighter">
                          Complete survey to unlock
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="backdrop-blur-lg bg-white/60 rounded-3xl p-12 text-center">
            <Award className="w-12 h-12 text-emerald-300 mx-auto mb-3" />
            <p className="text-emerald-800 font-bold">
              {activeTab === "earned" ? "No badges earned yet — keep going!" : "All badges unlocked! 🎉"}
            </p>
            {activeTab === "earned" && (
              <button onClick={() => navigate("/survey")}
                className="mt-3 px-5 py-2 bg-emerald-600 text-white rounded-2xl text-sm font-bold hover:bg-emerald-700">
                Take Survey to Start Earning
              </button>
            )}
          </div>
        )}
      </section>
    </div>
  );
}

export default EcoBadges;
