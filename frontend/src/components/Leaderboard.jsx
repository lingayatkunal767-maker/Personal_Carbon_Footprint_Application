import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Trophy, Medal, Award, Users, Leaf, Sparkles,
  TrendingUp, Calendar, ArrowUpRight, ChevronLeft
} from "lucide-react";
import axios from "axios";

function formatScore(score) { return Number(score).toFixed(1); }

function rankIcon(rank) {
  if (rank === 1) return <Trophy className="h-4 w-4 text-amber-500" />;
  if (rank === 2) return <Medal className="h-4 w-4 text-slate-500" />;
  if (rank === 3) return <Award className="h-4 w-4 text-orange-500" />;
  return <span className="text-xs font-semibold text-slate-600">#{rank}</span>;
}

function ChangePill({ isCurrentUser }) {
  if (!isCurrentUser) return null;
  return (
    <span className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-semibold bg-emerald-100 text-emerald-700">
      You
    </span>
  );
}

function LeaderboardSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-slate-50 px-3 py-3 animate-pulse">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-white" />
            <div className="space-y-2">
              <div className="h-3 w-32 rounded bg-white" />
              <div className="h-2 w-20 rounded bg-white" />
            </div>
          </div>
          <div className="h-4 w-16 rounded bg-white" />
        </div>
      ))}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, helper }) {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white/90 p-4 shadow-sm">
      <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
        <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
          <Icon className="h-4 w-4" />
        </span>
        {label}
      </div>
      <div className="mt-3 text-2xl font-semibold text-slate-900">{value}</div>
      <div className="text-xs text-emerald-600">{helper}</div>
    </div>
  );
}

export default function Leaderboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("alltime");
  const [data, setData]           = useState([]);
  const [myRank, setMyRank]       = useState(0);
  const [myTotal, setMyTotal]     = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError]         = useState("");

  useEffect(() => {
    setIsLoading(true);
    const token = localStorage.getItem("token");
    axios.get("http://localhost:8080/api/leaderboard", {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        const mapped = res.data.entries.map(e => ({
          rank: e.rank,
          name: e.userName,
          score: Number(e.totalCarbonKg),
          isCurrentUser: e.isCurrentUser,
          change: 0,
        }));
        setData(mapped);
        setMyRank(res.data.currentUserRank || 0);
        setMyTotal(res.data.currentUserTotal || 0);
      })
      .catch(err => setError("Failed to load leaderboard"))
      .finally(() => setIsLoading(false));
  }, []);

  const formattedTab = { weekly: "Weekly", monthly: "Monthly", alltime: "All time" }[activeTab];
  const topThree  = useMemo(() => data.slice(0, 3), [data]);
  const spotlight = topThree[0];
  const maxScore  = data[0]?.score ?? 1;
  const totalCo2  = data.reduce((s, d) => s + d.score, 0);

  const stats = [
    { icon: Users,     label: "Total users",    value: data.length, helper: "carbon trackers" },
    { icon: TrendingUp,label: "Community CO₂",  value: `${totalCo2.toFixed(1)}`, helper: "kg total logged" },
    { icon: Sparkles,  label: "Your rank",       value: myRank > 0 ? `#${myRank}` : "—", helper: `${myTotal} kg CO₂e` },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-50 text-slate-900">
      <div className="page-bg" />
      <div className="relative mx-auto max-w-6xl px-6 py-10 lg:px-10">

        {/* Back button */}
        <button onClick={() => navigate("/dashboard")}
          className="flex items-center gap-2 text-sm text-slate-500 hover:text-emerald-600 transition mb-6 font-medium">
          <ChevronLeft className="h-4 w-4" /> Back to Dashboard
        </button>

        <header className="space-y-8 animate-fade-up">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-lg shadow-emerald-500/30">
                <Leaf className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.35em] text-emerald-700">Sustainable League</p>
                <p className="text-sm text-slate-600">Impact Intelligence</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                <span className="h-2 w-2 rounded-full bg-emerald-500" /> Live
              </div>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
            <div>
              <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">Eco LeaderBoard</h1>
              <p className="mt-3 text-sm text-slate-600 sm:text-base">
                Track the users making the biggest environmental impact. Lower emissions = better rank.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {stats.map(stat => <StatCard key={stat.label} {...stat} />)}
            </div>
          </div>

          {/* Tab switcher */}
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/60 bg-white/80 p-2 shadow-sm">
            <div className="flex items-center gap-2 px-3 text-xs font-semibold text-slate-600">
              <Calendar className="h-4 w-4 text-emerald-600" /> {formattedTab} view
            </div>
            <div className="inline-flex items-center gap-1 rounded-full bg-slate-100 p-1">
              {["weekly", "monthly", "alltime"].map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  className={`rounded-full px-4 py-2 text-xs font-semibold transition focus:outline-none ${
                    activeTab === tab ? "bg-slate-900 text-white shadow" : "text-slate-600 hover:bg-white"
                  }`}>
                  {tab}
                </button>
              ))}
            </div>
          </div>
        </header>

        {error && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-600 text-sm text-center">
            {error} — Make sure the backend is running at localhost:8080
          </div>
        )}

        <main className="mt-8 grid gap-6 lg:grid-cols-[1.05fr_1.7fr]">
          {/* Top performers card */}
          <section className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-xl animate-fade-up-2">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Top performers</h2>
                <p className="mt-1 text-sm text-slate-500">Leading carbon savers this period.</p>
              </div>
            </div>

            <div className="mt-5 grid gap-3">
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-20 rounded-2xl border border-slate-100 bg-slate-50 animate-pulse" />
                ))
              ) : (
                topThree.map(person => (
                  <div key={person.rank}
                    className={`flex items-center justify-between gap-3 rounded-2xl border p-4 transition ${
                      person.isCurrentUser
                        ? "border-emerald-300 bg-emerald-50/70 shadow-sm"
                        : person.rank === 1
                        ? "border-emerald-200 bg-emerald-50/40"
                        : "border-slate-200 bg-white"
                    }`}>
                    <div className="flex items-center gap-3">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                        person.rank === 1 ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-700"
                      }`}>
                        {rankIcon(person.rank)}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{person.name}</p>
                        {person.isCurrentUser && <p className="text-xs text-emerald-600 font-medium">That's you!</p>}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold text-slate-900">{formatScore(person.score)}</p>
                      <p className="text-xs text-slate-500">kg CO₂e</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Spotlight */}
            <div className="mt-6 rounded-2xl bg-slate-900 p-5 text-white shadow-lg">
              <div className="flex items-center justify-between">
                <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-200">
                  <Sparkles className="h-4 w-4" /> Spotlight
                </div>
              </div>
              <h3 className="mt-4 text-2xl font-bold">
                {spotlight ? spotlight.name : isLoading ? "Loading..." : "No data yet"}
              </h3>
              <p className="mt-2 text-sm text-slate-300">
                {spotlight ? `Leading with ${formatScore(spotlight.score)} kg CO₂e tracked` : "Complete the survey to join the leaderboard"}
              </p>
              <button onClick={() => navigate("/history")}
                className="mt-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-semibold text-white transition hover:bg-white/20">
                View Carbon History <ArrowUpRight className="h-4 w-4" />
              </button>
            </div>
          </section>

          {/* Full leaderboard */}
          <section className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-xl animate-fade-up-3">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Full leaderboard</h2>
                <p className="mt-1 text-sm text-slate-500">Ranked by total carbon emissions tracked (lower = better habits).</p>
              </div>
            </div>

            <div className="mt-6">
              {isLoading ? <LeaderboardSkeleton /> : data.length > 0 ? (
                <div className="space-y-2">
                  {data.map(person => (
                    <div key={person.rank}
                      className={`flex flex-wrap items-center justify-between gap-3 rounded-2xl border px-3 py-3 transition ${
                        person.isCurrentUser
                          ? "border-emerald-200 bg-emerald-50/60"
                          : "border-transparent hover:border-slate-200 hover:bg-slate-50"
                      }`}>
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
                          {rankIcon(person.rank)}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-900">{person.name}</p>
                          {person.isCurrentUser && <p className="text-xs text-emerald-600">You</p>}
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-sm font-semibold text-slate-900">{formatScore(person.score)}</p>
                          <p className="text-xs text-slate-500">kg CO₂e</p>
                        </div>
                        <div className="hidden w-28 sm:block">
                          <div className="h-1.5 rounded-full bg-slate-100">
                            <div className="h-full rounded-full bg-emerald-500/80"
                              style={{ width: `${Math.min(100, (person.score / maxScore) * 100)}%` }} />
                          </div>
                        </div>
                        <ChangePill isCurrentUser={person.isCurrentUser} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-16 text-center">
                  <Leaf className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500 text-sm">No users yet. Complete the survey to appear here!</p>
                  <button onClick={() => navigate("/survey")}
                    className="mt-3 px-4 py-2 bg-emerald-600 text-white rounded-full text-sm font-medium hover:bg-emerald-700 transition">
                    Take Survey
                  </button>
                </div>
              )}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
