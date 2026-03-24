import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiFetch } from "../utils/api";

const MEDAL_EMOJIS = ["🥇", "🥈", "🥉"];
const PODIUM_COLORS = [
    { bg: "from-yellow-400 to-amber-500", border: "border-yellow-400", shadow: "shadow-yellow-200" },
    { bg: "from-gray-300 to-slate-400", border: "border-gray-400", shadow: "shadow-gray-200" },
    { bg: "from-amber-600 to-orange-700", border: "border-amber-600", shadow: "shadow-amber-200" },
];

export default function Leaderboard() {
    const navigate = useNavigate();
    const [leaderboard, setLeaderboard] = useState([]);
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

    // Fetch leaderboard
    useEffect(() => {
        let mounted = true;
        const loadLeaderboard = async () => {
            const token = localStorage.getItem("token");
            if (!token) {
                navigate("/login");
                return;
            }
            setLoading(true);
            try {
                const data = await apiFetch("/api/leaderboard");
                if (mounted) {
                    if (data && data.length > 0) {
                        setLeaderboard(data);
                    } else {
                        // Dummy Data Fallback
                        setLeaderboard([
                            { id: "d1", userName: "Aadii", teamName: "Eco Warriors", score: 8500, updatedAt: new Date().toISOString() },
                            { id: "d2", userName: "Satyam", teamName: "Green Giants", score: 7200, updatedAt: new Date().toISOString() },
                            { id: "d3", userName: "Anuj", teamName: "Planet Protectors", score: 6800, updatedAt: new Date().toISOString() },
                            { id: "d4", userName: "Sanskruti", teamName: "Eco Warriors", score: 5400, updatedAt: new Date().toISOString() },
                            { id: "d5", userName: "Aviraaj", teamName: "Green Giants", score: 4900, updatedAt: new Date().toISOString() },
                            { id: "d6", userName: "Nancy", teamName: "None", score: 4100, updatedAt: new Date().toISOString() },
                        ]);
                    }
                }
            } catch (err) {
                if (err.status === 401) navigate("/login");
                else setError(err.message || "Could not load leaderboard.");
            } finally {
                if (mounted) setLoading(false);
            }
        };
        loadLeaderboard();
        return () => { mounted = false; };
    }, [navigate]);

    // Logout
    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate("/login");
    };

    // Format date
    const formatDate = (dateStr) => {
        if (!dateStr) return "N/A";
        const date = new Date(dateStr);
        return date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        });
    };

    // Sort by score descending
    const sorted = [...leaderboard].sort(
        (a, b) => parseFloat(b.score || 0) - parseFloat(a.score || 0)
    );
    const top3 = sorted.slice(0, 3);
    const totalParticipants = sorted.length;
    const topScore = sorted.length > 0 ? parseFloat(sorted[0].score || 0) : 0;
    const currentUserEntry = user ? sorted.find(e => e.userId === user.id) : null;
    const currentUserRank = currentUserEntry
        ? sorted.findIndex(e => e.userId === user.id) + 1
        : null;

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#d4edda] via-[#b5dfca] to-[#5cb578]">

            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Page Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-green-900">Leaderboard 🏆</h1>
                    <p className="text-green-800/70 mt-1">
                        See who's leading the charge in reducing carbon emissions.
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
                        <p className="text-white font-semibold">Loading leaderboard...</p>
                    </div>
                ) : (
                    <>
                        {/* Summary Cards */}
                        <div className="grid sm:grid-cols-3 gap-5 mb-8">
                            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-md p-5 border-l-4 border-green-500">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                            Total Participants
                                        </p>
                                        <p className="text-2xl font-bold text-gray-800 mt-1">
                                            {totalParticipants}
                                            <span className="text-sm font-normal text-gray-500 ml-1">users</span>
                                        </p>
                                    </div>
                                    <div className="w-11 h-11 bg-green-100 rounded-xl flex items-center justify-center">
                                        <span className="text-xl">👥</span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-md p-5 border-l-4 border-amber-500">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                            Top Score
                                        </p>
                                        <p className="text-2xl font-bold text-amber-700 mt-1">
                                            {topScore.toFixed(0)}
                                            <span className="text-sm font-normal text-gray-500 ml-1">points</span>
                                        </p>
                                    </div>
                                    <div className="w-11 h-11 bg-amber-100 rounded-xl flex items-center justify-center">
                                        <span className="text-xl">🏆</span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-md p-5 border-l-4 border-blue-500">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                            Your Rank
                                        </p>
                                        <p className="text-2xl font-bold text-blue-700 mt-1">
                                            {currentUserRank ? `#${currentUserRank}` : "N/A"}
                                        </p>
                                    </div>
                                    <div className="w-11 h-11 bg-blue-100 rounded-xl flex items-center justify-center">
                                        <span className="text-xl">📊</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Top 3 Podium */}
                        {top3.length > 0 && (
                            <div className="mb-8">
                                <h2 className="text-lg font-bold text-green-900 mb-4 flex items-center gap-2">
                                    <span>🏅</span> Top Performers
                                </h2>
                                <div className="grid sm:grid-cols-3 gap-5">
                                    {top3.map((entry, index) => {
                                        const podium = PODIUM_COLORS[index];
                                        return (
                                            <div
                                                key={entry.id}
                                                className={`bg-white/90 backdrop-blur-sm rounded-2xl shadow-md ${podium.shadow} hover:shadow-lg transition-all duration-300 hover:-translate-y-1 overflow-hidden ${user && entry.userId === user.id ? "ring-2 ring-green-500" : ""
                                                    }`}
                                            >
                                                {/* Podium Header */}
                                                <div className={`bg-gradient-to-r ${podium.bg} p-5 text-center`}>
                                                    <div className="text-4xl mb-2">{MEDAL_EMOJIS[index]}</div>
                                                    <div className="inline-flex items-center justify-center w-12 h-12 bg-white/30 backdrop-blur-sm rounded-full mb-2">
                                                        <span className="text-xl font-bold text-white">
                                                            {(entry.userName || "U").charAt(0).toUpperCase()}
                                                        </span>
                                                    </div>
                                                    <h3 className="text-lg font-bold text-white drop-shadow-sm">
                                                        {entry.userName || "Anonymous"}
                                                    </h3>
                                                    {entry.teamName && (
                                                        <p className="text-white/80 text-xs mt-0.5">{entry.teamName}</p>
                                                    )}
                                                </div>

                                                {/* Podium Body */}
                                                <div className="p-4 text-center">
                                                    <p className="text-2xl font-bold text-gray-800">
                                                        {parseFloat(entry.score || 0).toFixed(0)}
                                                    </p>
                                                    <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">
                                                        Points
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Full Ranking Table */}
                        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-md p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-bold text-green-900 flex items-center gap-2">
                                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                                    </svg>
                                    Full Rankings
                                </h2>
                                <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full font-medium">
                                    {totalParticipants} participant{totalParticipants !== 1 ? "s" : ""}
                                </span>
                            </div>

                            {sorted.length === 0 ? (
                                <div className="text-center py-12">
                                    <div className="text-5xl mb-3">🌍</div>
                                    <p className="text-gray-500 font-medium">No leaderboard data yet.</p>
                                    <p className="text-gray-400 text-sm mt-1">
                                        Start reducing your carbon footprint to appear on the leaderboard!
                                    </p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full">
                                        <thead>
                                            <tr className="bg-green-50/80">
                                                <th className="py-3 px-4 text-left text-xs font-semibold text-green-800 uppercase tracking-wide rounded-tl-lg">
                                                    Rank
                                                </th>
                                                <th className="py-3 px-4 text-left text-xs font-semibold text-green-800 uppercase tracking-wide">
                                                    User
                                                </th>
                                                <th className="py-3 px-4 text-left text-xs font-semibold text-green-800 uppercase tracking-wide">
                                                    Team
                                                </th>
                                                <th className="py-3 px-4 text-left text-xs font-semibold text-green-800 uppercase tracking-wide">
                                                    Score
                                                </th>
                                                <th className="py-3 px-4 text-left text-xs font-semibold text-green-800 uppercase tracking-wide rounded-tr-lg">
                                                    Last Updated
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {sorted.map((entry, index) => {
                                                const isCurrentUser = user && entry.userId === user.id;
                                                return (
                                                    <tr
                                                        key={entry.id}
                                                        className={`border-t border-gray-100 transition ${isCurrentUser
                                                            ? "bg-green-50 hover:bg-green-100/60"
                                                            : "hover:bg-green-50/40"
                                                            }`}
                                                    >
                                                        <td className="py-3 px-4">
                                                            <div className="flex items-center gap-2">
                                                                {index < 3 ? (
                                                                    <span className="text-lg">{MEDAL_EMOJIS[index]}</span>
                                                                ) : (
                                                                    <span className="text-sm font-bold text-gray-500 w-7 text-center">
                                                                        {index + 1}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td className="py-3 px-4">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                                                    {(entry.userName || "U").charAt(0).toUpperCase()}
                                                                </div>
                                                                <div>
                                                                    <p className="text-sm font-semibold text-gray-800">
                                                                        {entry.userName || "Anonymous"}
                                                                        {isCurrentUser && (
                                                                            <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                                                                                You
                                                                            </span>
                                                                        )}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="py-3 px-4">
                                                            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-100 text-blue-700">
                                                                {entry.teamName || "No Team"}
                                                            </span>
                                                        </td>
                                                        <td className="py-3 px-4 text-sm font-bold text-gray-800">
                                                            {parseFloat(entry.score || 0).toFixed(0)} pts
                                                        </td>
                                                        <td className="py-3 px-4 text-sm text-gray-500">
                                                            {formatDate(entry.updatedAt)}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
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
