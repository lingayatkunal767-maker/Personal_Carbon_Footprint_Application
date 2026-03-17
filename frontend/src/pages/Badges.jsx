import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiFetch } from "../utils/api";

const BADGE_ICONS = {
  "First Step": "🌱",
  "Green Starter": "🌿",
  "Eco Warrior": "⚔️",
  "Carbon Cutter": "✂️",
  "Tree Hugger": "🌳",
  "Cycle Champion": "🚲",
  "Energy Saver": "💡",
  "Waste Reducer": "♻️",
  "Clean Commuter": "🚌",
  "Solar Pioneer": "☀️",
  "Water Guardian": "💧",
  "Zero Waste Hero": "🏆",
  "Planet Protector": "🛡️",
  "Sustainability Star": "⭐",
  "Green Leader": "👑",
};

const BADGE_COLORS = [
  { bg: "from-green-400 to-emerald-500", ring: "ring-green-300", shadow: "shadow-green-200" },
  { bg: "from-blue-400 to-cyan-500", ring: "ring-blue-300", shadow: "shadow-blue-200" },
  { bg: "from-purple-400 to-violet-500", ring: "ring-purple-300", shadow: "shadow-purple-200" },
  { bg: "from-amber-400 to-orange-500", ring: "ring-amber-300", shadow: "shadow-amber-200" },
  { bg: "from-rose-400 to-pink-500", ring: "ring-rose-300", shadow: "shadow-rose-200" },
  { bg: "from-teal-400 to-cyan-500", ring: "ring-teal-300", shadow: "shadow-teal-200" },
];

export default function Badges() {
  const navigate = useNavigate();
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [user, setUser] = useState(null);

  // Fetch current user
  useEffect(() => {
    async function loadUser() {
      try {
        const res = await fetch("http://localhost:9599/api/users/me", {
          credentials: "include",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        if (res.ok) {
          const data = await res.json();
          setUser(data);
        }
      } catch (err) {
        console.log("User not logged in");
      }
    }
    loadUser();
  }, []);

  // Fetch badges when user is loaded
  useEffect(() => {
    if (!user?.id) return;
    let mounted = true;
    const loadBadges = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }
      setLoading(true);
      try {
        const data = await apiFetch(`/api/badges/user/${user.id}`);
        if (mounted) {
          if (data && data.length > 0) {
            setBadges(data);
          } else {
            // Dummy Data Fallback
            setBadges([
              { id: "dummy-1", badgeName: "First Step", description: "Logged your first activity!", awardedAt: new Date(Date.now() - 86400000 * 5).toISOString() },
              { id: "dummy-2", badgeName: "Cycle Champion", description: "Cycled 50km this month.", awardedAt: new Date(Date.now() - 86400000 * 3).toISOString() },
              { id: "dummy-3", badgeName: "Tree Hugger", description: "Planted a virtual tree.", awardedAt: new Date(Date.now() - 86400000 * 2).toISOString() },
              { id: "dummy-4", badgeName: "Energy Saver", description: "Reduced electricity by 10%.", awardedAt: new Date(Date.now() - 86400000 * 1).toISOString() },
              { id: "dummy-5", badgeName: "Sustainability Star", description: "Reached 5 eco-goals.", awardedAt: new Date().toISOString() },
            ]);
          }
        }
      } catch (err) {
        if (err.status === 401) navigate("/login");
        else setError(err.message || "Could not load badges.");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    loadBadges();
    return () => { mounted = false; };
  }, [user, navigate]);

  // Logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  // Get badge icon
  const getBadgeIcon = (badgeName) => {
    return BADGE_ICONS[badgeName] || "🏅";
  };

  // Get color scheme by index
  const getColorScheme = (index) => {
    return BADGE_COLORS[index % BADGE_COLORS.length];
  };

  // Format date
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Stats
  const totalBadges = badges.length;
  const latestBadge = badges.length > 0
    ? badges.reduce((a, b) => new Date(a.awardedAt) > new Date(b.awardedAt) ? a : b)
    : null;
  const uniqueTypes = new Set(badges.map(b => b.badgeName)).size;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#d4edda] via-[#b5dfca] to-[#5cb578]">
      {/* Navbar */}
      <nav className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-2">
            <span className="text-2xl font-bold text-green-800">CarbonCalc</span>
            <span className="text-xl">🌱</span>
          </Link>
          <div className="flex items-center gap-6">
            <div className="flex gap-6">
              <Link to="/dashboard" className="text-sm text-green-800 hover:text-green-900 font-semibold transition">
                Dashboard
              </Link>
              <span className="text-sm text-green-800 font-semibold border-b-2 border-green-600 pb-0.5">
                Badges
              </span>
              <Link to="/leaderboard" className="text-sm text-green-800 hover:text-green-900 font-semibold transition">
                Leaderboard
              </Link>
              <Link to="/carbon-history" className="text-sm text-green-800 hover:text-green-900 font-semibold transition">
                Carbon History
              </Link>
            </div>
            <button
              onClick={handleLogout}
              className="ml-2 bg-green-800 hover:bg-green-900 text-white text-sm px-4 py-2 rounded-lg transition font-medium"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-green-900">Your Badges 🏅</h1>
          <p className="text-green-800/70 mt-1">
            Track your achievements and milestones in reducing carbon emissions.
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
            <p className="text-red-700 font-medium text-sm">{error}</p>
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div className="text-center py-16">
            <div className="inline-block w-12 h-12 border-4 border-white border-t-green-700 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-white font-semibold">Loading your badges...</p>
          </div>
        ) : (
          <>
            {/* Summary Cards */}
            <div className="grid sm:grid-cols-3 gap-5 mb-8">
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-md p-5 border-l-4 border-green-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Total Badges
                    </p>
                    <p className="text-2xl font-bold text-gray-800 mt-1">
                      {totalBadges}
                      <span className="text-sm font-normal text-gray-500 ml-1">earned</span>
                    </p>
                  </div>
                  <div className="w-11 h-11 bg-green-100 rounded-xl flex items-center justify-center">
                    <span className="text-xl">🏅</span>
                  </div>
                </div>
              </div>

              <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-md p-5 border-l-4 border-purple-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Unique Badges
                    </p>
                    <p className="text-2xl font-bold text-purple-700 mt-1">
                      {uniqueTypes}
                      <span className="text-sm font-normal text-gray-500 ml-1">types</span>
                    </p>
                  </div>
                  <div className="w-11 h-11 bg-purple-100 rounded-xl flex items-center justify-center">
                    <span className="text-xl">⭐</span>
                  </div>
                </div>
              </div>

              <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-md p-5 border-l-4 border-amber-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Latest Badge
                    </p>
                    <p className="text-lg font-bold text-amber-700 mt-1 truncate">
                      {latestBadge ? latestBadge.badgeName : "None yet"}
                    </p>
                  </div>
                  <div className="w-11 h-11 bg-amber-100 rounded-xl flex items-center justify-center">
                    <span className="text-xl">🆕</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Badge Grid */}
            {badges.length === 0 ? (
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-md p-12 text-center">
                <div className="text-6xl mb-4">🌍</div>
                <h3 className="text-xl font-bold text-gray-700 mb-2">
                  No Badges Yet
                </h3>
                <p className="text-gray-500 max-w-md mx-auto">
                  Start tracking and reducing your carbon emissions to earn badges!
                  Complete goals, log activities, and make sustainable choices.
                </p>
                <Link
                  to="/lifestyle-survey"
                  className="mt-6 inline-block bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-3 rounded-lg shadow-md transition"
                >
                  Start Your Journey 🚀
                </Link>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {badges.map((badge, index) => {
                  const colors = getColorScheme(index);
                  return (
                    <div
                      key={badge.id}
                      className={`bg-white/90 backdrop-blur-sm rounded-2xl shadow-md ${colors.shadow} hover:shadow-lg transition-all duration-300 hover:-translate-y-1 overflow-hidden`}
                    >
                      {/* Badge Header Gradient */}
                      <div className={`bg-gradient-to-r ${colors.bg} p-6 text-center`}>
                        <div className={`inline-flex items-center justify-center w-16 h-16 bg-white/30 backdrop-blur-sm rounded-full ring-4 ${colors.ring} mb-3`}>
                          <span className="text-3xl">{getBadgeIcon(badge.badgeName)}</span>
                        </div>
                        <h3 className="text-lg font-bold text-white drop-shadow-sm">
                          {badge.badgeName}
                        </h3>
                      </div>

                      {/* Badge Body */}
                      <div className="p-5">
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                          {badge.description || "Achievement unlocked for eco-friendly actions!"}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-gray-400">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span>Earned on {formatDate(badge.awardedAt)}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer */}
      <footer className="text-center py-6 mt-12 text-white/80 text-sm">
        © 2024 CarbonCalc · Environmentally Conscious Tracking
      </footer>
    </div>
  );
}
