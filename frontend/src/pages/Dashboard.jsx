import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell
} from 'recharts'
import { Plus, Target, TrendingUp, Car, Utensils, Zap, CheckCircle } from '../components/Icons'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'

function CustomTooltip({ active, payload, label }) {
  if (active && payload?.length) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl shadow-lg px-3 py-2 text-xs">
        <p className="font-semibold text-gray-700 mb-0.5">{label}</p>
        <p className="text-green-600">{payload[0].value} kg CO₂</p>
      </div>
    )
  }
  return null
}

const TRANSPORT_LABEL = { car: 'Car', bus: 'Bus', bike: 'Bike', walk: 'Walk', wfh: 'WFH', public_transport: 'Public Transport' }
const FOOD_LABEL = { vegetarian: 'Vegetarian', 'non-vegetarian': 'Non-veg', vegan: 'Vegan' }
const CAT_COLOR = { Transport: 'bg-green-100 text-green-700', Food: 'bg-pink-100 text-pink-700', Energy: 'bg-yellow-100 text-yellow-700' }

export default function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [history, setHistory] = useState([])
  const [goals, setGoals] = useState([])
  const [earnedBadges, setEarnedBadges] = useState([])
  const [badgeDefs, setBadgeDefs] = useState([])
  const [loading, setLoading] = useState(true)
  const [timePeriod, setTimePeriod] = useState('Weekly')

  useEffect(() => {
    Promise.all([
      api.get('/api/dashboard'),
      api.get('/api/carbon/history'),
      api.get('/api/goals').catch(() => ({ data: [] })),
      api.get('/api/badges').catch(() => ({ data: [] })),
      api.get('/api/badges/definitions').catch(() => ({ data: [] })),
    ])
      .then(([d, h, g, b, bd]) => {
        setData(d.data)
        setHistory(h.data || [])
        setGoals(g.data || [])
        setEarnedBadges(b.data || [])
        setBadgeDefs(bd.data || [])
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="animate-spin rounded-full h-9 w-9 border-4 border-green-500 border-t-transparent" />
    </div>
  )

  const displayName = user?.name?.split(' ')[0] || user?.email?.split('@')[0] || 'there'
  const totalCarbon = data?.totalCarbon ?? 0
  const activeGoal  = goals.find(g => g.status === 'ACTIVE')
  const earnedNames = new Set(earnedBadges.map(b => b.badgeName))

  // Sort history oldest→newest for slicing
  const sortedHistory = [...history].sort((a, b) => new Date(a.date) - new Date(b.date))

  // Filter surveys to the selected time window
  const periodDays = timePeriod === 'Daily' ? 1 : timePeriod === 'Weekly' ? 7 : 30
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - periodDays)
  const periodSurveys = sortedHistory.filter(r => new Date(r.date) >= cutoff)

  // Previous period for comparison
  const prevCutoff = new Date(cutoff)
  prevCutoff.setDate(prevCutoff.getDate() - periodDays)
  const prevSurveys = sortedHistory.filter(r => new Date(r.date) >= prevCutoff && new Date(r.date) < cutoff)

  // Sum helper
  const sumKey = (arr, key) => arr.reduce((s, r) => s + (r[key] ?? 0), 0)

  // Current period category totals
  const transportTotal = sumKey(periodSurveys, 'transportEmission')
  const foodTotal      = sumKey(periodSurveys, 'foodEmission')
  const energyTotal    = sumKey(periodSurveys, 'energyEmission')
  const catTotal       = transportTotal + foodTotal + energyTotal || 1

  // Previous period totals for trend
  const prevTransport = sumKey(prevSurveys, 'transportEmission')
  const prevFood      = sumKey(prevSurveys, 'foodEmission')
  const prevEnergy    = sumKey(prevSurveys, 'energyEmission')

  // Trend: % change vs previous period (lower is better for emissions)
  const calcTrend = (curr, prev) => {
    if (prev === 0 && curr === 0) return null
    if (prev === 0) return null  // no previous data to compare
    return ((curr - prev) / prev) * 100
  }
  const transportTrend = calcTrend(transportTotal, prevTransport)
  const foodTrend      = calcTrend(foodTotal, prevFood)
  const energyTrend    = calcTrend(energyTotal, prevEnergy)

  const periodLabel = timePeriod === 'Daily' ? 'yesterday' : timePeriod === 'Weekly' ? 'last week' : 'last month'

  const trendLabel = (t) => {
    if (t === null) return { text: 'No prior period', positive: true }
    const sign = t > 0 ? '+' : ''
    // negative change = emissions went down = good (green), positive = went up = bad (red)
    return { text: `${sign}${t.toFixed(1)}% vs ${periodLabel}`, positive: t <= 0 }
  }

  // Chart data: surveys in selected period
  const chartData = periodSurveys.map(r => ({
    date: new Date(r.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    carbon: parseFloat((r.carbonScore ?? 0).toFixed(2)),
  }))

  // Category split for the right panel
  const categoryBreakdown = [
    { name: 'Transport', value: transportTotal, pct: Math.round((transportTotal / catTotal) * 100), fill: '#ef4444' },
    { name: 'Food',      value: foodTotal,      pct: Math.round((foodTotal / catTotal) * 100),      fill: '#f59e0b' },
    { name: 'Energy',    value: energyTotal,    pct: Math.round((energyTotal / catTotal) * 100),    fill: '#3b82f6' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <div className="bg-white border-b border-gray-100 px-8 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Welcome back, <span className="capitalize">{displayName}</span>!</h1>
          <p className="text-xs text-gray-400 mt-0.5">Here's your environmental impact summary.</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/carbon-history')}
            className="px-4 py-2 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
            View History
          </button>
          <button onClick={() => navigate('/goals')}
            className="flex items-center gap-1.5 bg-green-500 hover:bg-green-600 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors">
            <Plus size={15} /> New Goal
          </button>
        </div>
      </div>

      <div className="p-6 max-w-7xl mx-auto">
        {/* Row 1: Total footprint + Quick Actions + Active Goal */}
        <div className="grid grid-cols-3 gap-4 mb-5">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-green-50">
                <TrendingUp size={16} className="text-green-600" />
              </div>
              <span className="text-xs font-semibold text-gray-500 bg-gray-50 px-2 py-0.5 rounded-full">{history.length} surveys</span>
            </div>
            <p className="text-xs text-gray-400 mt-3 mb-1">Total Footprint</p>
            <p className="text-2xl font-bold text-gray-900">{totalCarbon.toFixed(1)} <span className="text-sm font-normal text-gray-400">kg CO₂</span></p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <p className="text-sm font-semibold text-gray-700 mb-4">Quick Actions</p>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => navigate('/survey')}
                className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 rounded-xl text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                <Plus size={12} /> Add Survey
              </button>
              <button onClick={() => navigate('/goals')}
                className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 rounded-xl text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                <Target size={12} /> New Goal
              </button>
              <button onClick={() => navigate('/badges')}
                className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 rounded-xl text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                🏆 Badges
              </button>
              <button onClick={() => navigate('/leaderboard')}
                className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 rounded-xl text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                📊 Rank
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            {activeGoal ? (
              <>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-green-600 uppercase tracking-wide">Active Goal</span>
                  <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">{activeGoal.progressPct?.toFixed(0) ?? 0}%</span>
                </div>
                <p className="text-sm font-semibold text-gray-800 mb-3">{activeGoal.goalTitle}</p>
                <div className="w-full bg-gray-100 rounded-full h-2 mb-3">
                  <div className="h-2 rounded-full bg-green-500 transition-all" style={{ width: `${Math.min(100, activeGoal.progressPct ?? 0)}%` }} />
                </div>
                <div className="flex justify-between text-xs text-gray-400 mb-2">
                  <span>Current: {activeGoal.currentEmission?.toFixed(1)} kg</span>
                  <span>Target: {activeGoal.targetEmission} kg</span>
                </div>
                <button onClick={() => navigate('/goals')} className="text-xs text-green-600 font-semibold hover:underline">Manage Goals →</button>
              </>
            ) : (
              <>
                <p className="text-xs font-bold text-green-600 uppercase tracking-wide mb-2">Active Goal</p>
                <p className="text-sm text-gray-400 mb-3">No active goal yet.</p>
                <button onClick={() => navigate('/goals')} className="text-xs text-green-600 font-semibold hover:underline">Create a Goal →</button>
              </>
            )}
          </div>
        </div>

        {/* Category Breakdown — real data with bar chart */}
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-base font-bold text-gray-900">Category Breakdown</h2>
          <div className="flex items-center gap-1">
            {['Daily', 'Weekly', 'Monthly'].map(t => (
              <button key={t} onClick={() => setTimePeriod(t)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${timePeriod === t ? 'bg-green-500 text-white' : 'text-gray-500 hover:bg-gray-100'}`}>{t}</button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-5">
          {[
            { title: 'Transport', value: transportTotal, trend: transportTrend, icon: Car, fill: '#ef4444', bg: 'bg-red-50' },
            { title: 'Food & Diet', value: foodTotal,    trend: foodTrend,      icon: Utensils, fill: '#f59e0b', bg: 'bg-yellow-50' },
            { title: 'Energy',    value: energyTotal,   trend: energyTrend,    icon: Zap, fill: '#3b82f6', bg: 'bg-blue-50' },
          ].map(({ title, value, trend, icon: Icon, fill, bg }) => {
            const { text, positive } = trendLabel(trend)
            const pct = catTotal > 1 ? Math.round((value / catTotal) * 100) : 0
            return (
              <div key={title} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className={`flex items-center justify-center w-7 h-7 rounded-lg ${bg}`}>
                      <Icon size={14} style={{ color: fill }} />
                    </div>
                    <span className="text-sm font-medium text-gray-700">{title}</span>
                  </div>
                  <span className={`text-xs font-semibold px-1.5 py-0.5 rounded ${positive ? 'text-green-600 bg-green-50' : 'text-red-500 bg-red-50'}`}>
                    {text}
                  </span>
                </div>
                <p className="text-2xl font-bold text-gray-900">{value.toFixed(1)} <span className="text-sm font-normal text-gray-400">kg</span></p>
                <p className="text-xs text-gray-400 mt-1">
                  {periodSurveys.length === 0
                    ? `No surveys in this ${timePeriod.toLowerCase()}`
                    : `${pct}% of ${timePeriod.toLowerCase()} total · ${periodSurveys.length} survey${periodSurveys.length !== 1 ? 's' : ''}`}
                </p>
              </div>
            )
          })}
        </div>

        {/* Emission Trend + Category Pie */}
        <div className="grid grid-cols-3 gap-4 mb-5">
          {/* Chart */}
          <div className="col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-1">
              <div>
                <h2 className="text-sm font-bold text-gray-900">Emission Trend</h2>
                <p className="text-xs text-gray-400">Carbon output over {timePeriod.toLowerCase()} period</p>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-green-600">
                <span className="w-2 h-2 rounded-full bg-green-500 inline-block" /> Current Range
              </div>
            </div>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={chartData} margin={{ top: 10, right: 5, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="greenGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22c55e" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="carbon" stroke="#22c55e" strokeWidth={2.5}
                    fill="url(#greenGrad)" dot={false} activeDot={{ r: 5, fill: '#22c55e' }} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-48 text-gray-300">
                <TrendingUp size={36} className="mb-2" />
                <p className="text-sm">Submit a survey to see trends</p>
              </div>
            )}
          </div>

          {/* Category bar chart — period data */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h2 className="text-sm font-bold text-gray-900 mb-1">Category Split</h2>
            <p className="text-xs text-gray-400 mb-4">{timePeriod} emission breakdown</p>
            {catTotal > 1 ? (
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={categoryBreakdown} layout="vertical" margin={{ top: 0, right: 20, left: 0, bottom: 0 }}>
                  <XAxis type="number" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} unit=" kg" />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} width={55} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb', fontSize: '12px' }} formatter={v => [`${v.toFixed(1)} kg`, 'Emission']} />
                  <Bar dataKey="value" radius={[0,4,4,0]}>
                    {categoryBreakdown.map((d,i) => <Cell key={i} fill={d.fill} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-40 text-gray-300">
                <p className="text-sm">No data yet</p>
              </div>
            )}
            <div className="mt-3 space-y-1.5">
              {categoryBreakdown.map(c => (
                <div key={c.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: c.fill }} />
                    <span className="text-gray-600">{c.name}</span>
                  </div>
                  <span className="font-semibold text-gray-800">{c.pct}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Badges from DB + Recent Activity */}
        <div className="grid grid-cols-3 gap-4 mb-5">
          {/* Eco Badges — from real badge definitions */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-gray-900">Eco Badges</h2>
              <button onClick={() => navigate('/badges')} className="text-xs text-green-600 font-semibold hover:underline">View All ↗</button>
            </div>
            {badgeDefs.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-4">No badges defined yet.</p>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {badgeDefs.slice(0, 4).map(def => {
                  const isEarned = earnedNames.has(def.badgeName)
                  return (
                    <div key={def.badgeName} className={`rounded-xl p-3 ${isEarned ? (def.bgColor || 'bg-green-50') : 'bg-gray-50'} ${!isEarned ? 'opacity-50' : ''}`}>
                      <span className="text-xl block mb-1">{def.icon || '🎖️'}</span>
                      <p className={`text-xs font-bold leading-tight ${isEarned ? 'text-gray-800' : 'text-gray-400'}`}>{def.badgeName}</p>
                      <p className="text-xs text-gray-400 mt-0.5 leading-tight">{def.requirement}</p>
                    </div>
                  )
                })}
              </div>
            )}
            <p className="text-xs text-gray-400 text-center mt-4 italic border-t border-gray-100 pt-3">
              {earnedNames.size} of {badgeDefs.length} badges earned
            </p>
          </div>

          {/* Recent Activity — spans 2 cols */}
          <div className="col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-bold text-gray-900">Recent Activity</h2>
                <p className="text-xs text-gray-400">Your latest carbon footprint entries.</p>
              </div>
              <button onClick={() => navigate('/carbon-history')} className="text-xs text-green-600 font-semibold hover:underline">View All</button>
            </div>
            {history.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-gray-300">
                <CheckCircle size={36} className="mb-2" />
                <p className="text-sm">No activity yet. Submit your first survey.</p>
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    {['Date', 'Category', 'Activity', 'Emission'].map((h, i) => (
                      <th key={h} className={`py-2.5 text-xs font-semibold text-gray-400 uppercase tracking-wider ${i === 3 ? 'text-right' : 'text-left'}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {history.slice(0, 5).map((r, i) => {
                    const dateStr = new Date(r.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                    const transport = TRANSPORT_LABEL[r.transport] ?? r.transport
                    const food = FOOD_LABEL[r.food] ?? r.food
                    const primaryCat = r.transportEmission > 0 ? 'Transport' : r.foodEmission > 0 ? 'Food' : 'Energy'
                    return (
                      <tr key={r.id ?? i} className="border-b border-gray-50 hover:bg-gray-50/60 transition-colors">
                        <td className="py-3 text-gray-600 text-xs">{dateStr}</td>
                        <td className="py-3">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${CAT_COLOR[primaryCat] ?? 'bg-gray-100 text-gray-600'}`}>{primaryCat}</span>
                        </td>
                        <td className="py-3 text-gray-700 text-xs">{transport} · {food}</td>
                        <td className="py-3 text-right font-bold text-gray-900 text-xs">{(r.carbonScore ?? 0).toFixed(1)} kg</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
