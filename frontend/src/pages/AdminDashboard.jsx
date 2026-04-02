import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, AreaChart, Area
} from 'recharts'
import api from '../services/api'

// ─── Design tokens ────────────────────────────────────────────────────────────
const C = {
  green:  '#16a34a',
  greenL: '#dcfce7',
  blue:   '#2563eb',
  blueL:  '#dbeafe',
  amber:  '#d97706',
  amberL: '#fef3c7',
  purple: '#7c3aed',
  purpleL:'#ede9fe',
  rose:   '#e11d48',
  roseL:  '#ffe4e6',
  teal:   '#0d9488',
  tealL:  '#ccfbf1',
  text:   '#111827',
  muted:  '#6b7280',
  border: '#e5e7eb',
  bg:     '#f9fafb',
  card:   '#ffffff',
}

const CHART_COLORS = [C.green, C.blue, C.amber, C.purple, C.rose, C.teal]

// Colored icon components matching the reference sidebar style
const Icon = {
  Overview:      () => <svg viewBox="0 0 24 24" fill="none" className="w-[18px] h-[18px]"><rect x="3" y="3" width="7" height="7" rx="1.5" fill="#6366f1"/><rect x="14" y="3" width="7" height="7" rx="1.5" fill="#6366f1" opacity=".6"/><rect x="3" y="14" width="7" height="7" rx="1.5" fill="#6366f1" opacity=".6"/><rect x="14" y="14" width="7" height="7" rx="1.5" fill="#6366f1" opacity=".3"/></svg>,
  Users:         () => <svg viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" className="w-[18px] h-[18px]"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  Leaderboard:   () => <svg viewBox="0 0 24 24" fill="none" className="w-[18px] h-[18px]"><rect x="2" y="14" width="5" height="8" rx="1" fill="#16a34a"/><rect x="9.5" y="9" width="5" height="13" rx="1" fill="#16a34a" opacity=".8"/><rect x="17" y="5" width="5" height="17" rx="1" fill="#16a34a" opacity=".5"/></svg>,
  Surveys:       () => <svg viewBox="0 0 24 24" fill="none" className="w-[18px] h-[18px]"><rect x="5" y="2" width="14" height="20" rx="2" fill="#f97316" opacity=".15" stroke="#f97316" strokeWidth="1.5"/><path d="M9 7h6M9 11h6M9 15h4" stroke="#f97316" strokeWidth="1.5" strokeLinecap="round"/></svg>,
  Goals:         () => <svg viewBox="0 0 24 24" fill="none" className="w-[18px] h-[18px]"><circle cx="12" cy="12" r="10" stroke="#e11d48" strokeWidth="1.5" fill="#ffe4e6"/><circle cx="12" cy="12" r="6" stroke="#e11d48" strokeWidth="1.5" fill="none"/><circle cx="12" cy="12" r="2.5" fill="#e11d48"/><path d="M19 5l-2 2" stroke="#e11d48" strokeWidth="1.5" strokeLinecap="round"/></svg>,
  Marketplace:   () => <svg viewBox="0 0 24 24" fill="none" className="w-[18px] h-[18px]"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" fill="#0d9488" opacity=".15" stroke="#0d9488" strokeWidth="1.5"/><line x1="3" y1="6" x2="21" y2="6" stroke="#0d9488" strokeWidth="1.5"/><path d="M16 10a4 4 0 0 1-8 0" stroke="#0d9488" strokeWidth="1.5"/></svg>,
  Transactions:  () => <svg viewBox="0 0 24 24" fill="none" className="w-[18px] h-[18px]"><rect x="2" y="5" width="20" height="14" rx="2" fill="#2563eb" opacity=".15" stroke="#2563eb" strokeWidth="1.5"/><path d="M2 10h20" stroke="#2563eb" strokeWidth="1.5"/><rect x="5" y="14" width="4" height="2" rx="0.5" fill="#2563eb"/></svg>,
  Badges:        () => <svg viewBox="0 0 24 24" fill="none" className="w-[18px] h-[18px]"><circle cx="12" cy="8" r="5" fill="#f59e0b" opacity=".2" stroke="#f59e0b" strokeWidth="1.5"/><path d="M8.5 13.5 7 22l5-3 5 3-1.5-8.5" stroke="#f59e0b" strokeWidth="1.5" strokeLinejoin="round"/></svg>,
  Notifications: () => <svg viewBox="0 0 24 24" fill="none" className="w-[18px] h-[18px]"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" fill="#f59e0b" opacity=".2" stroke="#f59e0b" strokeWidth="1.5"/><path d="M13.73 21a2 2 0 0 1-3.46 0" stroke="#f59e0b" strokeWidth="1.5"/></svg>,
  Analytics:     () => <svg viewBox="0 0 24 24" fill="none" className="w-[18px] h-[18px]"><path d="M3 17l5-5 4 4 5-6 4 3" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M3 17l5-5 4 4 5-6 4 3" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity=".3" fill="#7c3aed"/></svg>,
}

const TABS = [
  { id: 'overview',      label: 'Overview',      Ico: Icon.Overview },
  { id: 'users',         label: 'Users',         Ico: Icon.Users },
  { id: 'leaderboard',   label: 'Leaderboard',   Ico: Icon.Leaderboard },
  { id: 'surveys',       label: 'Surveys',       Ico: Icon.Surveys },
  { id: 'goals',         label: 'Goals',         Ico: Icon.Goals },
  { id: 'marketplace',   label: 'Marketplace',   Ico: Icon.Marketplace },
  { id: 'transactions',  label: 'Transactions',  Ico: Icon.Transactions },
  { id: 'badges',        label: 'Badges',        Ico: Icon.Badges },
  { id: 'notifications', label: 'Notifications', Ico: Icon.Notifications },
  { id: 'analytics',     label: 'Analytics',     Ico: Icon.Analytics },
]

// ─── Shared primitives ────────────────────────────────────────────────────────
function Card({ children, className = '' }) {
  return (
    <div className={`bg-white rounded-2xl border border-gray-100 shadow-sm ${className}`}>
      {children}
    </div>
  )
}

function MetricCard({ icon, iconBg, iconColor, label, value, sub }) {
  return (
    <Card className="p-5 flex items-start gap-4">
      <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-lg" style={{ background: iconBg, color: iconColor }}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium text-gray-500 mb-0.5">{label}</p>
        <p className="text-2xl font-bold text-gray-900 leading-none">{value ?? '—'}</p>
        {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
      </div>
    </Card>
  )
}

function SectionHeader({ title, sub, action }) {
  return (
    <div className="flex items-center justify-between mb-5">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
        {sub && <p className="text-sm text-gray-500 mt-0.5">{sub}</p>}
      </div>
      {action}
    </div>
  )
}

function Badge({ children, color = 'gray' }) {
  const map = {
    green:  'bg-green-50 text-green-700',
    blue:   'bg-blue-50 text-blue-700',
    red:    'bg-red-50 text-red-600',
    amber:  'bg-amber-50 text-amber-700',
    purple: 'bg-purple-50 text-purple-700',
    gray:   'bg-gray-100 text-gray-600',
  }
  return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${map[color]}`}>{children}</span>
}

function Spinner() {
  return <div className="flex justify-center py-16"><div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin" /></div>
}

function Empty({ icon, text }) {
  return <div className="text-center py-14 text-gray-400"><div className="text-4xl mb-2">{icon}</div><p className="text-sm">{text}</p></div>
}

const tooltipStyle = { borderRadius: '10px', border: '1px solid #e5e7eb', fontSize: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)' }

// ─── Overview Tab ─────────────────────────────────────────────────────────────
function OverviewTab({ stats }) {
  const [recentSurveys, setRecentSurveys] = useState([])
  useEffect(() => {
    api.get('/api/admin/surveys').then(r => {
      setRecentSurveys((r.data || []).sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 6))
    }).catch(() => {})
  }, [])

  const metrics = [
    { icon: '👤', iconBg: C.blueL,   iconColor: C.blue,   label: 'Total Users',     value: stats.totalUsers,    sub: `${stats.activeUsers ?? 0} active` },
    { icon: '📋', iconBg: C.purpleL, iconColor: C.purple, label: 'Total Surveys',   value: stats.totalSurveys,  sub: `${stats.totalUsers ? (stats.totalSurveys / stats.totalUsers).toFixed(1) : 0} per user` },
    { icon: '🎯', iconBg: C.amberL,  iconColor: C.amber,  label: 'Goals Achieved',  value: stats.achievedGoals, sub: `of ${stats.totalGoals ?? 0} total` },
    { icon: '🏅', iconBg: C.roseL,   iconColor: C.rose,   label: 'Badges Awarded',  value: stats.totalBadges,   sub: `${stats.totalUsers ? (stats.totalBadges / stats.totalUsers).toFixed(1) : 0} per user` },
    { icon: '🌿', iconBg: C.tealL,   iconColor: C.teal,   label: 'Total Emissions', value: stats.totalEmissions != null ? `${stats.totalEmissions} kg` : '—', sub: 'CO₂ tracked' },
  ]

  const activePct = stats.totalUsers ? Math.round((stats.activeUsers / stats.totalUsers) * 100) : 0
  const goalPct   = stats.totalGoals  ? Math.round((stats.achievedGoals / stats.totalGoals) * 100) : 0
  const engagePct = stats.totalUsers  ? Math.min(100, Math.round((stats.totalSurveys / stats.totalUsers) * 10)) : 0

  const pieData = stats.totalUsers > 0 ? [
    { name: 'Active',   value: stats.activeUsers ?? 0 },
    { name: 'Inactive', value: (stats.totalUsers ?? 0) - (stats.activeUsers ?? 0) },
  ] : []

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900">Welcome back, Admin</h1>
        <p className="text-sm text-gray-500 mt-0.5">Here's what's happening on your platform today.</p>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-5 gap-4 mb-6">
        {metrics.map(m => <MetricCard key={m.label} {...m} />)}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {/* User status donut */}
        <Card className="p-5">
          <p className="text-sm font-semibold text-gray-800 mb-1">User Status</p>
          <p className="text-xs text-gray-400 mb-3">Active vs inactive accounts</p>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={150}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={42} outerRadius={62} paddingAngle={3} dataKey="value">
                  <Cell fill={C.green} /><Cell fill="#e5e7eb" />
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          ) : <div className="h-36 flex items-center justify-center text-gray-300 text-sm">No data</div>}
        </Card>

        {/* Platform Health — bar chart */}
        <Card className="p-5 col-span-2">
          <p className="text-sm font-semibold text-gray-800 mb-1">Platform Health</p>
          <p className="text-xs text-gray-400 mb-4">Key engagement metrics across the platform</p>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart
              data={[
                { metric: 'Activation', value: activePct, fill: '#16a34a' },
                { metric: 'Goal Rate',  value: goalPct,   fill: '#d97706' },
                { metric: 'Engagement', value: engagePct, fill: '#2563eb' },
              ]}
              margin={{ top: 16, right: 8, left: -20, bottom: 0 }}
              barSize={48}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
              <XAxis dataKey="metric" tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#d1d5db' }} axisLine={false} tickLine={false} unit="%" domain={[0, 100]} />
              <Tooltip contentStyle={tooltipStyle} formatter={v => [`${v}%`, 'Rate']} />
              <Bar dataKey="value" radius={[6, 6, 0, 0]} label={{ position: 'top', fontSize: 12, fontWeight: 700, fill: '#374151', formatter: v => `${v}%` }}>
                <Cell fill="#16a34a" /><Cell fill="#d97706" /><Cell fill="#2563eb" />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-gray-100 text-center">
            {[
              { label: 'Active Users',    value: `${stats.activeUsers ?? 0}/${stats.totalUsers ?? 0}`,  color: 'text-green-600' },
              { label: 'Goals Achieved',  value: `${stats.achievedGoals ?? 0}/${stats.totalGoals ?? 0}`, color: 'text-amber-600' },
              { label: 'Surveys / User',  value: stats.totalUsers ? (stats.totalSurveys / stats.totalUsers).toFixed(1) : '0', color: 'text-blue-600' },
            ].map(s => (
              <div key={s.label}>
                <p className={`text-lg font-bold ${s.color}`}>{s.value}</p>
                <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Recent activity */}
      <Card>
        <div className="px-5 py-4 border-b border-gray-100">
          <p className="text-sm font-semibold text-gray-800">Recent Activity</p>
          <p className="text-xs text-gray-400 mt-0.5">Latest survey submissions across the platform</p>
        </div>
        {recentSurveys.length === 0 ? (
          <div className="py-10 text-center text-sm text-gray-400">No recent activity</div>
        ) : (
          <div className="divide-y divide-gray-50">
            {recentSurveys.map(s => (
              <div key={s.id} className="flex items-center gap-3 px-5 py-3">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-700 text-xs font-bold shrink-0">
                  {(s.userName ?? '?').slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{s.userName}</p>
                  <p className="text-xs text-gray-400">Transport {s.transportEmission?.toFixed(1) ?? 0} · Food {s.foodEmission?.toFixed(1) ?? 0} · Energy {s.energyEmission?.toFixed(1) ?? 0} kg</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-semibold text-gray-900">{s.carbonScore?.toFixed(1) ?? 0} kg</p>
                  <p className="text-xs text-gray-400">{s.date ? new Date(s.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '—'}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}

// ─── Analytics Tab ────────────────────────────────────────────────────────────
function AnalyticsTab({ stats, users }) {
  const [txs, setTxs] = useState([])
  const [surveys, setSurveys] = useState([])
  const [leaderboard, setLeaderboard] = useState([])

  useEffect(() => {
    api.get('/api/admin/transactions').then(r => setTxs(r.data || [])).catch(() => {})
    api.get('/api/admin/surveys').then(r => setSurveys(r.data || [])).catch(() => {})
    api.get('/api/leaderboard').then(r => setLeaderboard((r.data ?? []).slice(0, 6))).catch(() => {})
  }, [])

  const avgEmission  = users.length ? (users.reduce((s, u) => s + (u.totalEmission ?? 0), 0) / users.length).toFixed(1) : 0
  const totalRevenue = txs.reduce((s, t) => s + (t.amount ?? 0), 0)
  const avgT = surveys.length ? surveys.reduce((s, x) => s + (x.transportEmission ?? 0), 0) / surveys.length : 0
  const avgF = surveys.length ? surveys.reduce((s, x) => s + (x.foodEmission ?? 0), 0) / surveys.length : 0
  const avgE = surveys.length ? surveys.reduce((s, x) => s + (x.energyEmission ?? 0), 0) / surveys.length : 0

  const emissionByUser = [...users].sort((a, b) => (b.totalEmission ?? 0) - (a.totalEmission ?? 0)).slice(0, 6)
    .map(u => ({ name: (u.name ?? u.email ?? '?').split(' ')[0], value: u.totalEmission ?? 0 }))

  const leaderData = leaderboard.map(e => ({ name: (e.username ?? '?').split(' ')[0], score: parseFloat((e.score ?? 0).toFixed(1)) }))

  const trendMap = {}
  surveys.forEach(s => {
    if (!s.date) return
    const m = s.date.slice(0, 7)
    if (!trendMap[m]) trendMap[m] = { month: m, total: 0, count: 0 }
    trendMap[m].total += s.carbonScore ?? 0; trendMap[m].count++
  })
  const trendData = Object.values(trendMap).sort((a, b) => a.month.localeCompare(b.month)).slice(-6)
    .map(d => ({ month: d.month.slice(5), avg: parseFloat((d.total / d.count).toFixed(2)) }))

  const buckets = { '0–5': 0, '5–10': 0, '10–20': 0, '20+': 0 }
  users.forEach(u => {
    const e = u.totalEmission ?? 0
    if (e <= 5) buckets['0–5']++; else if (e <= 10) buckets['5–10']++; else if (e <= 20) buckets['10–20']++; else buckets['20+']++
  })
  const distData = Object.entries(buckets).map(([name, value]) => ({ name, value }))

  const kpis = [
    { icon: '👤', iconBg: C.blueL,   iconColor: C.blue,   label: 'Total Users',          value: stats.totalUsers ?? 0 },
    { icon: '🌿', iconBg: C.greenL,  iconColor: C.green,  label: 'Avg. Emissions',        value: `${avgEmission} kg` },
    { icon: '💰', iconBg: C.amberL,  iconColor: C.amber,  label: 'Marketplace Revenue',   value: `₹${totalRevenue.toFixed(0)}` },
    { icon: '🎯', iconBg: C.purpleL, iconColor: C.purple, label: 'Goals Completed',       value: stats.achievedGoals ?? 0 },
    { icon: '📋', iconBg: C.tealL,   iconColor: C.teal,   label: 'Total Surveys',         value: stats.totalSurveys ?? 0 },
  ]

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Analytics</h2>
        <p className="text-sm text-gray-500 mt-0.5">Overview of system performance and user engagement.</p>
      </div>

      <div className="grid grid-cols-5 gap-4 mb-6">
        {kpis.map(k => <MetricCard key={k.label} {...k} />)}
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <Card className="p-5">
          <p className="text-sm font-semibold text-gray-800 mb-1">Emissions by User</p>
          <p className="text-xs text-gray-400 mb-4">Total CO₂ per user (kg)</p>
          {emissionByUser.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={emissionByUser} margin={{ top: 14, right: 4, left: -20, bottom: 0 }} barSize={28}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: C.muted }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#d1d5db' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} formatter={v => [`${v} kg`, 'Emissions']} />
                <Bar dataKey="value" fill={C.green} radius={[4, 4, 0, 0]} label={{ position: 'top', fontSize: 10, fill: C.muted, fontWeight: 600 }} />
              </BarChart>
            </ResponsiveContainer>
          ) : <Empty icon="📊" text="No data yet" />}
        </Card>

        <Card className="p-5">
          <p className="text-sm font-semibold text-gray-800 mb-1">Leaderboard Scores</p>
          <p className="text-xs text-gray-400 mb-4">Avg CO₂ score per top user</p>
          {leaderData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={leaderData} margin={{ top: 14, right: 4, left: -20, bottom: 0 }} barSize={28}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: C.muted }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#d1d5db' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} formatter={v => [`${v} kg`, 'Score']} />
                <Bar dataKey="score" fill={C.blue} radius={[4, 4, 0, 0]} label={{ position: 'top', fontSize: 10, fill: C.muted, fontWeight: 600 }} />
              </BarChart>
            </ResponsiveContainer>
          ) : <Empty icon="🏆" text="No data yet" />}
        </Card>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-4">
        <Card className="p-5 col-span-2">
          <p className="text-sm font-semibold text-gray-800 mb-1">Carbon Trend</p>
          <p className="text-xs text-gray-400 mb-4">Avg CO₂ per survey — last 6 months</p>
          {trendData.length > 0 ? (
            <ResponsiveContainer width="100%" height={160}>
              <AreaChart data={trendData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="aGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={C.green} stopOpacity={0.15} />
                    <stop offset="95%" stopColor={C.green} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: C.muted }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#d1d5db' }} axisLine={false} tickLine={false} unit=" kg" />
                <Tooltip contentStyle={tooltipStyle} formatter={v => [`${v} kg`, 'Avg CO₂']} />
                <Area type="monotone" dataKey="avg" stroke={C.green} strokeWidth={2} fill="url(#aGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : <Empty icon="📈" text="No survey data yet" />}
        </Card>

        <Card className="p-5">
          <p className="text-sm font-semibold text-gray-800 mb-1">Emission by Category</p>
          <p className="text-xs text-gray-400 mb-4">Avg kg CO₂ — Transport / Food / Energy</p>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart
              data={[
                { name: 'Transport', value: parseFloat(avgT.toFixed(2)) },
                { name: 'Food',      value: parseFloat(avgF.toFixed(2)) },
                { name: 'Energy',    value: parseFloat(avgE.toFixed(2)) },
              ]}
              margin={{ top: 16, right: 4, left: -20, bottom: 0 }}
              barSize={36}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: C.muted }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#d1d5db' }} axisLine={false} tickLine={false} unit=" kg" />
              <Tooltip contentStyle={tooltipStyle} formatter={v => [`${v} kg`, 'Avg']} />
              <Bar dataKey="value" radius={[6, 6, 0, 0]} label={{ position: 'top', fontSize: 11, fontWeight: 700, fill: '#374151' }}>
                <Cell fill="#f87171" /><Cell fill="#fbbf24" /><Cell fill="#60a5fa" />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  )
}

// ─── Users Tab ────────────────────────────────────────────────────────────────
function UsersTab({ users, onRefresh }) {
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(null)
  const [togglingId, setTogglingId] = useState(null)

  const filtered = users.filter(u =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  )

  const toggleActive = async (u) => {
    setTogglingId(u.id)
    try {
      await api.put(u.isActive ? `/api/admin/users/${u.id}/deactivate` : `/api/admin/users/${u.id}/activate`)
      onRefresh()
      if (selected?.id === u.id) setSelected(p => ({ ...p, isActive: !p.isActive }))
    } catch { alert('Failed to update user status.') }
    finally { setTogglingId(null) }
  }

  return (
    <div>
      <SectionHeader
        title="Users"
        sub={`${users.length} registered users`}
        action={
          <input type="text" placeholder="Search by name or email…" value={search} onChange={e => setSearch(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-400 w-64 bg-white" />
        }
      />
      <Card className="overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              {['User', 'Email', 'Surveys', 'Goals', 'Badges', 'CO₂', 'Status', ''].map((h, i) => (
                <th key={i} className={`py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide ${i >= 2 ? 'text-center' : 'text-left'}`}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.map(u => (
              <tr key={u.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-700 text-xs font-bold shrink-0">
                      {(u.name ?? u.email ?? '?').slice(0, 2).toUpperCase()}
                    </div>
                    <span className="font-medium text-gray-800 capitalize">{u.name ?? '—'}</span>
                  </div>
                </td>
                <td className="py-3 px-4 text-gray-500 text-xs">{u.email}</td>
                <td className="py-3 px-4 text-center text-gray-700 font-medium">{u.surveyCount}</td>
                <td className="py-3 px-4 text-center text-gray-700 font-medium">{u.goalsCompleted}</td>
                <td className="py-3 px-4 text-center text-gray-700 font-medium">{u.badgesEarned}</td>
                <td className="py-3 px-4 text-center font-semibold text-green-700">{u.totalEmission} kg</td>
                <td className="py-3 px-4 text-center">
                  <Badge color={u.isActive ? 'green' : 'red'}>{u.isActive ? 'Active' : 'Inactive'}</Badge>
                </td>
                <td className="py-3 px-4 text-center">
                  <div className="flex items-center justify-center gap-1.5">
                    <button onClick={() => setSelected(u)} className="text-xs font-medium px-3 py-1.5 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors">View</button>
                    <button onClick={() => toggleActive(u)} disabled={togglingId === u.id}
                      className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-colors disabled:opacity-40 ${u.isActive ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-green-50 text-green-700 hover:bg-green-100'}`}>
                      {togglingId === u.id ? '…' : u.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <Empty icon="👤" text="No users found" />}
      </Card>

      {selected && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <Card className="p-6 max-w-sm w-full shadow-xl">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-700 text-lg font-bold">
                {(selected.name ?? selected.email ?? '?').slice(0, 2).toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-gray-900 capitalize">{selected.name}</p>
                <p className="text-sm text-gray-500">{selected.email}</p>
                <Badge color={selected.isActive ? 'green' : 'red'}>{selected.isActive ? 'Active' : 'Inactive'}</Badge>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-5">
              {[
                { label: 'Surveys', value: selected.surveyCount, bg: 'bg-purple-50', text: 'text-purple-700' },
                { label: 'Goals Done', value: selected.goalsCompleted, bg: 'bg-amber-50', text: 'text-amber-700' },
                { label: 'Badges', value: selected.badgesEarned, bg: 'bg-rose-50', text: 'text-rose-700' },
                { label: 'Total CO₂', value: `${selected.totalEmission} kg`, bg: 'bg-teal-50', text: 'text-teal-700' },
              ].map(s => (
                <div key={s.label} className={`${s.bg} rounded-xl p-3 text-center`}>
                  <p className={`text-lg font-bold ${s.text}`}>{s.value}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <button onClick={() => toggleActive(selected)} disabled={togglingId === selected.id}
                className={`flex-1 py-2.5 text-sm font-semibold rounded-xl transition-colors disabled:opacity-40 ${selected.isActive ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-green-50 text-green-700 hover:bg-green-100'}`}>
                {togglingId === selected.id ? '…' : selected.isActive ? 'Deactivate' : 'Activate'}
              </button>
              <button onClick={() => setSelected(null)} className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl text-sm">Close</button>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}

// ─── Leaderboard Tab ──────────────────────────────────────────────────────────
function LeaderboardTab() {
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  useEffect(() => { api.get('/api/leaderboard').then(r => setEntries(r.data ?? [])).catch(() => {}).finally(() => setLoading(false)) }, [])

  const medal = r => r === 1 ? '🥇' : r === 2 ? '🥈' : r === 3 ? '🥉' : `#${r}`
  const chartData = entries.slice(0, 8).map(e => ({ name: (e.username ?? '?').split(' ')[0], reduction: parseFloat((e.reductionPct ?? 0).toFixed(1)), goals: e.goalsCompleted ?? 0 }))

  return (
    <div>
      <SectionHeader title="Leaderboard" sub="Rankings by emission reduction and goals completed" />
      <div className="grid grid-cols-3 gap-4 mb-5">
        {[
          { label: 'Participants', value: entries.length, bg: 'bg-green-50', text: 'text-green-700' },
          { label: 'Avg Reduction', value: `${entries.length > 0 ? (entries.reduce((s, e) => s + (e.reductionPct ?? 0), 0) / entries.length).toFixed(1) : 0}%`, bg: 'bg-blue-50', text: 'text-blue-700' },
          { label: 'Total Goals Done', value: entries.reduce((s, e) => s + (e.goalsCompleted ?? 0), 0), bg: 'bg-purple-50', text: 'text-purple-700' },
        ].map(c => (
          <Card key={c.label} className="p-4 text-center">
            <p className={`text-2xl font-bold ${c.text}`}>{c.value}</p>
            <p className="text-xs text-gray-500 mt-1">{c.label}</p>
          </Card>
        ))}
      </div>

      {loading ? <Spinner /> : entries.length === 0 ? <Empty icon="🏆" text="No leaderboard data yet" /> : (
        <>
          <div className="grid grid-cols-2 gap-4 mb-5">
            <Card className="p-5">
              <p className="text-sm font-semibold text-gray-800 mb-1">Emission Reduction %</p>
              <p className="text-xs text-gray-400 mb-4">Top 8 users</p>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={chartData} margin={{ top: 14, right: 4, left: -20, bottom: 0 }} barSize={22}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: C.muted }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#d1d5db' }} axisLine={false} tickLine={false} unit="%" />
                  <Tooltip contentStyle={tooltipStyle} formatter={v => [`${v}%`, 'Reduction']} />
                  <Bar dataKey="reduction" radius={[4, 4, 0, 0]}>
                    {chartData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Card>
            <Card className="p-5">
              <p className="text-sm font-semibold text-gray-800 mb-1">Goals Completed</p>
              <p className="text-xs text-gray-400 mb-4">Per user</p>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={chartData} margin={{ top: 14, right: 4, left: -20, bottom: 0 }} barSize={22}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: C.muted }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#d1d5db' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={tooltipStyle} formatter={v => [v, 'Goals']} />
                  <Bar dataKey="goals" fill={C.purple} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </div>
          <Card className="overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-100">
              <p className="text-sm font-semibold text-gray-800">Full Rankings</p>
            </div>
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['Rank', 'User', 'Avg Score', 'Goals', 'Reduction'].map((h, i) => (
                    <th key={h} className={`py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide ${i === 0 || i >= 2 ? 'text-center' : 'text-left'}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {entries.map(e => (
                  <tr key={e.userId} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-3 px-4 text-center font-bold text-base">{medal(e.rank)}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-green-100 flex items-center justify-center text-green-700 text-xs font-bold shrink-0">{(e.username ?? '?').slice(0, 2).toUpperCase()}</div>
                        <span className="font-medium text-gray-800">{e.username ?? '—'}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center font-semibold text-green-700">{e.score?.toFixed(2) ?? '—'} kg</td>
                    <td className="py-3 px-4 text-center"><Badge color="purple">✓ {e.goalsCompleted ?? 0}</Badge></td>
                    <td className="py-3 px-4 text-center"><Badge color={(e.reductionPct ?? 0) > 0 ? 'green' : 'gray'}>{e.reductionPct != null ? `${e.reductionPct.toFixed(1)}%` : '—'}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </>
      )}
    </div>
  )
}

// ─── Surveys Tab ──────────────────────────────────────────────────────────────
function SurveysTab() {
  const [surveys, setSurveys] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')

  useEffect(() => {
    api.get('/api/admin/surveys')
      .then(r => setSurveys(r.data || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  // Parse survey date — handles ISO strings and Jackson LocalDateTime arrays
  const parseDate = (d) => {
    if (!d) return null
    if (Array.isArray(d)) return new Date(d[0], d[1] - 1, d[2], d[3] ?? 0, d[4] ?? 0, d[5] ?? 0)
    return new Date(d)
  }

  const filtered = surveys.filter(s => {
    if (search) {
      const q = search.toLowerCase()
      if (!s.userName?.toLowerCase().includes(q) && !s.userEmail?.toLowerCase().includes(q)) return false
    }
    const sd = parseDate(s.date)
    if (fromDate && sd) {
      const from = new Date(fromDate); from.setHours(0, 0, 0, 0)
      if (sd < from) return false
    }
    if (toDate && sd) {
      const to = new Date(toDate); to.setHours(23, 59, 59, 999)
      if (sd > to) return false
    }
    return true
  }).sort((a, b) => (parseDate(b.date) ?? 0) - (parseDate(a.date) ?? 0))

  const clearFilters = () => { setSearch(''); setFromDate(''); setToDate('') }
  const hasFilter = !!(search || fromDate || toDate)

  const avgT = surveys.length ? surveys.reduce((s, x) => s + (x.transportEmission ?? 0), 0) / surveys.length : 0
  const avgF = surveys.length ? surveys.reduce((s, x) => s + (x.foodEmission ?? 0), 0) / surveys.length : 0
  const avgE = surveys.length ? surveys.reduce((s, x) => s + (x.energyEmission ?? 0), 0) / surveys.length : 0

  const fmtDate = (d) => {
    const dt = parseDate(d)
    if (!dt || isNaN(dt)) return '—'
    return dt.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  return (
    <div>
      <div className="flex items-start justify-between mb-5">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Surveys</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            {hasFilter ? `${filtered.length} of ${surveys.length} surveys` : `${surveys.length} total submissions`}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap justify-end">
          {/* Search input */}
          <div className="relative">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2"
              style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              type="text"
              placeholder="Search by user…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-8 pr-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-400 bg-white text-gray-800 placeholder-gray-400"
              style={{ width: 180 }}
            />
          </div>

          {/* Date range */}
          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" style={{ flexShrink: 0 }}>
              <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            <input
              type="date"
              value={fromDate}
              onChange={e => setFromDate(e.target.value)}
              className="text-sm text-gray-700 outline-none bg-transparent border-none"
              style={{ width: 130 }}
            />
            <span className="text-gray-300 text-sm select-none">–</span>
            <input
              type="date"
              value={toDate}
              onChange={e => setToDate(e.target.value)}
              className="text-sm text-gray-700 outline-none bg-transparent border-none"
              style={{ width: 130 }}
            />
          </div>

          {hasFilter && (
            <button
              onClick={clearFilters}
              className="px-3 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-5">
        <MetricCard icon="📋" iconBg={C.blueL}  iconColor={C.blue}  label="Total Surveys" value={surveys.length} sub={hasFilter ? `${filtered.length} matching` : undefined} />
        <MetricCard icon="🚗" iconBg={C.roseL}  iconColor={C.rose}  label="Avg Transport" value={`${avgT.toFixed(2)} kg`} />
        <MetricCard icon="🍽" iconBg={C.amberL} iconColor={C.amber} label="Avg Food"      value={`${avgF.toFixed(2)} kg`} />
        <MetricCard icon="⚡" iconBg={C.blueL}  iconColor={C.blue}  label="Avg Energy"    value={`${avgE.toFixed(2)} kg`} />
      </div>

      {surveys.length > 0 && (
        <Card className="p-5 mb-5">
          <p className="text-sm font-semibold text-gray-800 mb-1">Avg Emission by Category</p>
          <p className="text-xs text-gray-400 mb-4">Real averages from all survey data in the database</p>
          <ResponsiveContainer width="100%" height={140}>
            <BarChart data={[{ name: 'Transport', value: parseFloat(avgT.toFixed(2)) }, { name: 'Food', value: parseFloat(avgF.toFixed(2)) }, { name: 'Energy', value: parseFloat(avgE.toFixed(2)) }]}
              margin={{ top: 16, right: 8, left: -20, bottom: 0 }} barSize={52}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: C.muted }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#d1d5db' }} axisLine={false} tickLine={false} unit=" kg" />
              <Tooltip contentStyle={tooltipStyle} formatter={v => [`${v} kg`, 'Avg Emission']} />
              <Bar dataKey="value" radius={[6, 6, 0, 0]} label={{ position: 'top', fontSize: 12, fontWeight: 700, fill: '#374151' }}>
                <Cell fill="#f87171" /><Cell fill="#fbbf24" /><Cell fill="#60a5fa" />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>
      )}

      <Card className="overflow-hidden">
        {loading ? <Spinner /> : (
          <>
            <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
              <p className="text-sm font-semibold text-gray-700">
                {hasFilter ? `Showing ${filtered.length} filtered results` : `All ${surveys.length} surveys`}
              </p>
              {hasFilter && <span className="text-xs text-green-600 bg-green-50 px-2.5 py-1 rounded-full font-medium">Filtered</span>}
            </div>
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['#', 'User', 'Transport', 'Food', 'Energy', 'Total CO₂', 'Date'].map((h, i) => (
                    <th key={h} className={`py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide ${i >= 2 ? 'text-center' : 'text-left'}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((s, i) => (
                  <tr key={s.id ?? i} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-3 px-4 text-gray-400 text-xs">{i + 1}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 text-xs font-bold shrink-0">
                          {(s.userName ?? '?').slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-800">{s.userName ?? '—'}</p>
                          <p className="text-xs text-gray-400">{s.userEmail ?? ''}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center text-sm font-medium text-red-500">{s.transportEmission?.toFixed(2) ?? '—'} kg</td>
                    <td className="py-3 px-4 text-center text-sm font-medium text-amber-600">{s.foodEmission?.toFixed(2) ?? '—'} kg</td>
                    <td className="py-3 px-4 text-center text-sm font-medium text-blue-500">{s.energyEmission?.toFixed(2) ?? '—'} kg</td>
                    <td className="py-3 px-4 text-center"><Badge color="green">{s.carbonScore?.toFixed(2) ?? '—'} kg</Badge></td>
                    <td className="py-3 px-4 text-sm text-gray-500">{fmtDate(s.date)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && <Empty icon="📋" text={hasFilter ? 'No surveys match your filters' : 'No surveys found'} />}
          </>
        )}
      </Card>
    </div>
  )
}


// ─── Goals Tab ────────────────────────────────────────────────────────────────
function GoalsTab() {
  const [goals, setGoals] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('ALL')
  useEffect(() => { api.get('/api/admin/goals').then(r => setGoals(r.data || [])).catch(() => {}).finally(() => setLoading(false)) }, [])

  const active   = goals.filter(g => g.status === 'ACTIVE')
  const achieved = goals.filter(g => g.status === 'ACHIEVED')
  const filtered = filter === 'ALL' ? goals : goals.filter(g => g.status === filter)

  const closest = [...active].map(g => {
    const pct = (g.currentEmission ?? 0) > 0 ? Math.min(99, Math.round(((g.targetEmission ?? 1) / (g.currentEmission ?? 1)) * 100)) : 0
    return { ...g, pct }
  }).sort((a, b) => b.pct - a.pct).slice(0, 5)

  return (
    <div>
      <SectionHeader title="Goals Overview" sub={`${goals.length} total goals`}
        action={
          <div className="flex gap-1.5">
            {['ALL', 'ACTIVE', 'ACHIEVED'].map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${filter === f ? 'bg-green-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>{f}</button>
            ))}
          </div>
        }
      />

      <div className="grid grid-cols-3 gap-4 mb-5">
        <Card className="p-5">
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-blue-50 rounded-xl p-3 text-center"><p className="text-2xl font-bold text-blue-700">{active.length}</p><p className="text-xs text-gray-500 mt-0.5">Active</p></div>
            <div className="bg-green-50 rounded-xl p-3 text-center"><p className="text-2xl font-bold text-green-700">{achieved.length}</p><p className="text-xs text-gray-500 mt-0.5">Achieved</p></div>
          </div>
          {goals.length > 0 && (
            <ResponsiveContainer width="100%" height={110}>
              <PieChart>
                <Pie data={[{ name: 'Active', value: active.length }, { name: 'Achieved', value: achieved.length }].filter(d => d.value > 0)}
                  cx="50%" cy="50%" innerRadius={28} outerRadius={46} paddingAngle={3} dataKey="value">
                  <Cell fill={C.blue} /><Cell fill={C.green} />
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </Card>

        <Card className="p-5 col-span-2">
          <p className="text-sm font-semibold text-gray-800 mb-1">Closest to Completing</p>
          <p className="text-xs text-gray-400 mb-4">Active goals with highest progress</p>
          {closest.length === 0 ? <div className="h-24 flex items-center justify-center text-gray-300 text-sm">No active goals</div> : (
            <div className="space-y-3">
              {closest.map(g => (
                <div key={g.id}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-700 font-medium truncate max-w-[65%]">{g.userName} — {g.goalTitle}</span>
                    <span className="font-bold text-gray-800 shrink-0">{g.pct}%</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-green-500" style={{ width: `${g.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <Card className="overflow-hidden">
        {loading ? <Spinner /> : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['#', 'User', 'Goal', 'Category', 'Target', 'Current', 'Status', 'Created'].map((h, i) => (
                  <th key={h} className={`py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide ${i >= 4 ? 'text-center' : 'text-left'}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((g, i) => (
                <tr key={g.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="py-3 px-4 text-gray-400 text-xs">{i + 1}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 text-xs font-bold shrink-0">{(g.userName ?? '?').slice(0, 2).toUpperCase()}</div>
                      <span className="font-medium text-gray-800">{g.userName}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-700 font-medium max-w-[140px] truncate">{g.goalTitle}</td>
                  <td className="py-3 px-4 text-gray-500 capitalize text-xs">{g.category ?? '—'}</td>
                  <td className="py-3 px-4 text-center font-semibold text-gray-700">{g.targetEmission} kg</td>
                  <td className="py-3 px-4 text-center font-semibold text-green-700">{g.currentEmission?.toFixed(2) ?? '—'} kg</td>
                  <td className="py-3 px-4 text-center"><Badge color={g.status === 'ACHIEVED' ? 'green' : 'blue'}>{g.status}</Badge></td>
                  <td className="py-3 px-4 text-sm text-gray-400">{g.createdAt ? new Date(g.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {!loading && filtered.length === 0 && <Empty icon="🎯" text="No goals found" />}
      </Card>
    </div>
  )
}

// ─── Marketplace Tab ──────────────────────────────────────────────────────────
const ITEM_TYPES = ['Carbon Offset', 'Renewable Energy', 'Environmental Contribution', 'Tree Plantation']
const TYPE_COLOR = { 'Carbon Offset': { bg: 'bg-green-100', text: 'text-green-700', icon: '🌳' }, 'Renewable Energy': { bg: 'bg-blue-100', text: 'text-blue-700', icon: '⚡' }, 'Environmental Contribution': { bg: 'bg-teal-100', text: 'text-teal-700', icon: '🌍' }, 'Tree Plantation': { bg: 'bg-emerald-100', text: 'text-emerald-700', icon: '🌱' } }

function MarketplaceTab() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState({ itemName: '', itemType: ITEM_TYPES[0], price: '', description: '', carbonOffsetValue: '' })
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState(null)

  const load = useCallback(() => { setLoading(true); api.get('/api/marketplace').then(r => setItems(r.data || [])).finally(() => setLoading(false)) }, [])
  useEffect(() => { load() }, [load])

  const openAdd  = () => { setForm({ itemName: '', itemType: ITEM_TYPES[0], price: '', description: '', carbonOffsetValue: '' }); setModal('add') }
  const openEdit = item => { setForm({ itemName: item.itemName, itemType: item.itemType, price: item.price, description: item.description, carbonOffsetValue: item.carbonOffsetValue }); setModal(item) }

  const handleSave = async () => {
    setSaving(true)
    try {
      const p = { ...form, price: parseFloat(form.price), carbonOffsetValue: parseFloat(form.carbonOffsetValue) }
      if (modal === 'add') await api.post('/api/admin/marketplace', p); else await api.put(`/api/admin/marketplace/${modal.id}`, p)
      setModal(null); load()
    } catch { alert('Failed to save.') } finally { setSaving(false) }
  }

  const handleDelete = async id => {
    if (!window.confirm('Delete this item?')) return
    setDeletingId(id)
    try { await api.delete(`/api/admin/marketplace/${id}`); load() } catch { alert('Failed to delete.') } finally { setDeletingId(null) }
  }

  const tc = t => TYPE_COLOR[t] ?? { bg: 'bg-gray-100', text: 'text-gray-700', icon: '♻️' }

  return (
    <div>
      <SectionHeader title="Marketplace" sub={`${items.length} items listed`}
        action={<button onClick={openAdd} className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-xl transition-colors">+ Add Item</button>} />
      {loading ? <Spinner /> : (
        <div className="grid grid-cols-3 gap-4">
          {items.map(item => {
            const t = tc(item.itemType)
            return (
              <Card key={item.id} className="p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-3 mb-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0 ${t.bg}`}>{t.icon}</div>
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900 text-sm truncate">{item.itemName}</p>
                    <Badge color={item.itemType === 'Carbon Offset' ? 'green' : item.itemType === 'Renewable Energy' ? 'blue' : 'gray'}>{item.itemType}</Badge>
                  </div>
                </div>
                <p className="text-xs text-gray-400 mb-3 leading-relaxed line-clamp-2">{item.description}</p>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs text-gray-500">Offsets <span className="font-semibold text-green-700">{item.carbonOffsetValue} kg</span></span>
                  <span className="text-lg font-bold text-gray-900">₹{item.price}</span>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => openEdit(item)} className="flex-1 py-2 bg-gray-100 text-gray-700 text-xs font-semibold rounded-xl hover:bg-gray-200 transition-colors">Edit</button>
                  <button onClick={() => handleDelete(item.id)} disabled={deletingId === item.id} className="flex-1 py-2 bg-red-50 text-red-600 text-xs font-semibold rounded-xl hover:bg-red-100 transition-colors disabled:opacity-40">
                    {deletingId === item.id ? '…' : 'Delete'}
                  </button>
                </div>
              </Card>
            )
          })}
        </div>
      )}
      {modal !== null && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <Card className="p-6 max-w-md w-full shadow-xl">
            <p className="text-base font-semibold text-gray-900 mb-5">{modal === 'add' ? 'Add New Item' : 'Edit Item'}</p>
            <div className="space-y-3">
              {[['Item Name', 'itemName', 'text', 'e.g. Solar Panel Kit'], ['Price (₹)', 'price', 'number', ''], ['CO₂ Offset (kg)', 'carbonOffsetValue', 'number', '']].map(([label, key, type, ph]) => (
                <div key={key}><label className="text-xs font-semibold text-gray-600 block mb-1">{label}</label>
                  <input type={type} value={form[key]} placeholder={ph} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-400" /></div>
              ))}
              <div><label className="text-xs font-semibold text-gray-600 block mb-1">Type</label>
                <select value={form.itemType} onChange={e => setForm(f => ({ ...f, itemType: e.target.value }))} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-400">
                  {ITEM_TYPES.map(t => <option key={t}>{t}</option>)}</select></div>
              <div><label className="text-xs font-semibold text-gray-600 block mb-1">Description</label>
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-400 resize-none" /></div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setModal(null)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="flex-1 py-2.5 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-xl disabled:opacity-40">{saving ? 'Saving…' : 'Save'}</button>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}

// ─── Transactions Tab ─────────────────────────────────────────────────────────
function TransactionsTab() {
  const [txs, setTxs] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  useEffect(() => { api.get('/api/admin/transactions').then(r => setTxs(r.data || [])).finally(() => setLoading(false)) }, [])

  const filtered = txs.filter(t => t.userName?.toLowerCase().includes(search.toLowerCase()) || t.itemName?.toLowerCase().includes(search.toLowerCase()))
  const totalRevenue = txs.reduce((s, t) => s + (t.amount ?? 0), 0)
  const totalOffset  = txs.reduce((s, t) => s + (t.carbonOffsetValue ?? 0), 0)

  const byType = txs.reduce((acc, t) => { acc[t.itemType] = (acc[t.itemType] ?? 0) + 1; return acc }, {})
  const pieData = Object.entries(byType).map(([name, value]) => ({ name, value }))
  const barData = Object.entries(txs.reduce((acc, t) => { acc[t.itemType] = (acc[t.itemType] ?? 0) + (t.amount ?? 0); return acc }, {}))
    .map(([name, value]) => ({ name: name.split(' ')[0], value: Math.round(value) }))

  return (
    <div>
      <SectionHeader title="Transactions" sub={`${txs.length} total transactions`}
        action={
          <div className="flex gap-2">
            <input type="text" placeholder="Search user or item…" value={search} onChange={e => setSearch(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-400 w-52 bg-white" />
            {search && (
              <button onClick={() => setSearch('')} className="px-3 py-2 text-sm text-gray-500 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">Clear</button>
            )}
          </div>
        } />

      <div className="grid grid-cols-3 gap-4 mb-5">
        <MetricCard icon="⇄" iconBg={C.greenL}  iconColor={C.green}  label="Total Transactions" value={txs.length} />
        <MetricCard icon="₹" iconBg={C.blueL}   iconColor={C.blue}   label="Total Revenue"      value={`₹${totalRevenue.toFixed(0)}`} />
        <MetricCard icon="🌿" iconBg={C.purpleL} iconColor={C.purple} label="CO₂ Offset Sold"    value={`${totalOffset.toFixed(1)} kg`} />
      </div>

      {txs.length > 0 && (
        <div className="grid grid-cols-2 gap-4 mb-5">
          <Card className="p-5">
            <p className="text-sm font-semibold text-gray-800 mb-1">Purchases by Category</p>
            <p className="text-xs text-gray-400 mb-4">Transaction count per type</p>
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={40} outerRadius={62} paddingAngle={3} dataKey="value">
                  {pieData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          </Card>
          <Card className="p-5">
            <p className="text-sm font-semibold text-gray-800 mb-1">Revenue by Category</p>
            <p className="text-xs text-gray-400 mb-4">Total ₹ per item type</p>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={barData} margin={{ top: 14, right: 4, left: -10, bottom: 0 }} barSize={30}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: C.muted }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#d1d5db' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} formatter={v => [`₹${v}`, 'Revenue']} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]} label={{ position: 'top', fontSize: 10, fill: C.muted, fontWeight: 600 }}>
                  {barData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>
      )}

      <Card className="overflow-hidden">
        {loading ? <Spinner /> : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['#', 'User', 'Item', 'Type', 'CO₂ Offset', 'Amount', 'Date'].map((h, i) => (
                  <th key={h} className={`py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide ${i >= 4 ? 'text-center' : 'text-left'}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((t, i) => (
                <tr key={t.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="py-3 px-4 text-gray-400 text-xs">{i + 1}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-xs font-bold shrink-0">{(t.userName ?? '?').slice(0, 2).toUpperCase()}</div>
                      <span className="font-medium text-gray-800">{t.userName}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-700 font-medium">{t.itemName}</td>
                  <td className="py-3 px-4"><Badge color="green">{t.itemType}</Badge></td>
                  <td className="py-3 px-4 text-center font-semibold text-green-700">{t.carbonOffsetValue} kg</td>
                  <td className="py-3 px-4 text-center font-bold text-gray-900">₹{t.amount}</td>
                  <td className="py-3 px-4 text-sm text-gray-400">{t.createdAt ? new Date(t.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {!loading && filtered.length === 0 && <Empty icon="💳" text="No transactions found" />}
      </Card>
    </div>
  )
}

// ─── Badges Tab ───────────────────────────────────────────────────────────────
const EMPTY_BADGE = { badgeName: '', description: '', icon: '', requirement: '', bgColor: 'bg-gray-50', rarity: 'COMMON', rewardPoints: 50 }
const BG_OPTIONS = ['bg-blue-50','bg-green-50','bg-yellow-50','bg-purple-50','bg-teal-50','bg-orange-50','bg-rose-50','bg-indigo-50','bg-cyan-50','bg-emerald-50','bg-gray-50']
const RARITY_OPTIONS = ['COMMON', 'RARE', 'EPIC', 'LEGENDARY']

function BadgesTab() {
  const [defs, setDefs] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState(EMPTY_BADGE)
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState(null)

  const load = () => { setLoading(true); api.get('/api/badges/definitions').then(r => setDefs(r.data || [])).finally(() => setLoading(false)) }
  useEffect(() => { load() }, [])

  const handleSave = async () => {
    if (!form.badgeName.trim()) { alert('Badge name is required.'); return }
    setSaving(true)
    try { await api.post('/api/admin/badges', form); setModal(false); setForm(EMPTY_BADGE); load() }
    catch (e) { alert(e.response?.data?.message || 'Failed to create badge.') } finally { setSaving(false) }
  }

  const handleDelete = async id => {
    if (!window.confirm('Delete this badge?')) return
    setDeletingId(id)
    try { await api.delete(`/api/admin/badges/${id}`); load() } catch { alert('Failed to delete.') } finally { setDeletingId(null) }
  }

  return (
    <div>
      <SectionHeader title="Badges" sub={`${defs.length} badge definitions`}
        action={<button onClick={() => { setForm(EMPTY_BADGE); setModal(true) }} className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-xl transition-colors">+ Add Badge</button>} />
      {loading ? <Spinner /> : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {defs.map(d => (
            <Card key={d.id} className="p-5 text-center hover:shadow-md transition-shadow">
              <div className={`w-14 h-14 rounded-2xl ${d.bgColor || 'bg-gray-50'} flex items-center justify-center text-3xl mx-auto mb-3`}>{d.icon || '🎖️'}</div>
              <p className="text-sm font-semibold text-gray-900 mb-1">{d.badgeName}</p>
              <p className="text-xs text-gray-400 mb-2 leading-relaxed">{d.description}</p>
              <p className="text-xs text-green-700 bg-green-50 rounded-lg px-2 py-1 mb-3 inline-block">{d.requirement}</p>
              <button onClick={() => handleDelete(d.id)} disabled={deletingId === d.id} className="w-full py-2 bg-red-50 text-red-600 text-xs font-semibold rounded-xl hover:bg-red-100 transition-colors disabled:opacity-40">
                {deletingId === d.id ? '…' : 'Delete'}
              </button>
            </Card>
          ))}
          {defs.length === 0 && <div className="col-span-4"><Empty icon="🎖️" text="No badge definitions yet" /></div>}
        </div>
      )}
      {modal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <Card className="p-6 max-w-md w-full shadow-xl">
            <p className="text-base font-semibold text-gray-900 mb-5">Create New Badge</p>
            <div className="space-y-3">
              {[['Badge Name *', 'badgeName', 'e.g. Ocean Protector'], ['Icon (emoji)', 'icon', '🌊'], ['Description', 'description', 'e.g. Completed 10 eco actions'], ['Requirement', 'requirement', 'e.g. Submit 10 surveys']].map(([label, key, ph]) => (
                <div key={key}><label className="text-xs font-semibold text-gray-600 block mb-1">{label}</label>
                  <input value={form[key]} placeholder={ph} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-400" /></div>
              ))}
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs font-semibold text-gray-600 block mb-1">Rarity</label>
                  <select value={form.rarity} onChange={e => setForm(f => ({ ...f, rarity: e.target.value }))} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-400 bg-white">
                    {RARITY_OPTIONS.map(r => <option key={r} value={r}>{r}</option>)}</select></div>
                <div><label className="text-xs font-semibold text-gray-600 block mb-1">Reward Points</label>
                  <input type="number" min="0" value={form.rewardPoints} onChange={e => setForm(f => ({ ...f, rewardPoints: parseInt(e.target.value) || 0 }))} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-400" /></div>
              </div>
              <div><label className="text-xs font-semibold text-gray-600 block mb-1">Background</label>
                <select value={form.bgColor} onChange={e => setForm(f => ({ ...f, bgColor: e.target.value }))} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-400">
                  {BG_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setModal(false)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="flex-1 py-2.5 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-xl disabled:opacity-40">{saving ? 'Creating…' : 'Create'}</button>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}

// ─── Notifications Tab ────────────────────────────────────────────────────────
function NotificationsTab({ users }) {
  const [form, setForm] = useState({ targetUserId: 'all', title: '', message: '', type: 'INFO' })
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSend = async () => {
    if (!form.title.trim() || !form.message.trim()) { alert('Title and message are required.'); return }
    setSending(true)
    try {
      await api.post('/api/admin/notifications/send', form)
      setSent(true); setForm(f => ({ ...f, title: '', message: '' }))
      setTimeout(() => setSent(false), 3000)
    } catch { alert('Failed to send.') } finally { setSending(false) }
  }

  return (
    <div>
      <SectionHeader title="Notifications" sub="Send messages to users" />
      <div className="grid grid-cols-2 gap-6">
        <Card className="p-6 space-y-4">
          <div><label className="text-sm font-semibold text-gray-700 block mb-1.5">Target</label>
            <select value={form.targetUserId} onChange={e => setForm(f => ({ ...f, targetUserId: e.target.value }))} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-400">
              <option value="all">All Users</option>
              {users.map(u => <option key={u.id} value={u.id}>{u.name ?? u.email}</option>)}
            </select></div>
          <div><label className="text-sm font-semibold text-gray-700 block mb-1.5">Type</label>
            <div className="flex gap-2">
              {['INFO', 'SUCCESS', 'WARNING', 'ALERT'].map(t => (
                <button key={t} onClick={() => setForm(f => ({ ...f, type: t }))}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${form.type === t ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{t}</button>
              ))}</div></div>
          <div><label className="text-sm font-semibold text-gray-700 block mb-1.5">Title</label>
            <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Notification title…" className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-400" /></div>
          <div><label className="text-sm font-semibold text-gray-700 block mb-1.5">Message</label>
            <textarea value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} rows={4} placeholder="Write your message…" className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-400 resize-none" /></div>
          <button onClick={handleSend} disabled={sending} className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl transition-colors disabled:opacity-40 text-sm">
            {sending ? 'Sending…' : 'Send Notification'}</button>
          {sent && <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-sm text-green-700 font-medium">✓ Notification sent successfully!</div>}
        </Card>
        <div className="space-y-4">
          <Card className="p-5">
            <p className="text-sm font-semibold text-gray-800 mb-3">Notification Types</p>
            <div className="space-y-3">
              {[
                { type: 'INFO',    color: 'blue',  desc: 'General information or updates.' },
                { type: 'SUCCESS', color: 'green', desc: 'Positive feedback like goal completions.' },
                { type: 'WARNING', color: 'amber', desc: 'Alerts about high emissions or inactivity.' },
                { type: 'ALERT',   color: 'red',   desc: 'Urgent messages requiring attention.' },
              ].map(({ type, color, desc }) => (
                <div key={type} className="flex items-start gap-2.5">
                  <Badge color={color}>{type}</Badge>
                  <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
                </div>
              ))}
            </div>
          </Card>
          <Card className="p-5">
            <p className="text-sm font-semibold text-gray-800 mb-2">Tips</p>
            <ul className="space-y-1.5 text-sm text-gray-500">
              <li>• Select "All Users" to broadcast to everyone.</li>
              <li>• Pick a specific user for targeted messages.</li>
              <li>• Keep titles under 60 characters.</li>
              <li>• Notifications appear instantly in the user panel.</li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────
function AdminDashboard() {
  const { logout } = useAuth()
  const navigate = useNavigate()

  // Persist active tab in URL hash so browser refresh stays on same tab
  const VALID_TABS = TABS.map(t => t.id)
  const hashTab = window.location.hash.replace('#', '')
  const [tab, setTab] = useState(VALID_TABS.includes(hashTab) ? hashTab : 'overview')

  const changeTab = (id) => {
    setTab(id)
    window.history.replaceState(null, '', `#${id}`)
  }

  // Sync tab if user navigates with browser back/forward
  useEffect(() => {
    const onHashChange = () => {
      const h = window.location.hash.replace('#', '')
      if (VALID_TABS.includes(h)) setTab(h)
    }
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  const [stats, setStats] = useState({})
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [sRes, uRes] = await Promise.all([api.get('/api/admin/stats'), api.get('/api/admin/users')])
      setStats(sRes.data ?? {})
      setUsers(uRes.data ?? [])
    } catch { /* ignore */ } finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const handleLogout = () => { logout(); navigate('/', { replace: true }) }

  const tabContent = {
    overview:      <OverviewTab stats={stats} />,
    users:         <UsersTab users={users} onRefresh={fetchData} />,
    leaderboard:   <LeaderboardTab />,
    surveys:       <SurveysTab />,
    goals:         <GoalsTab />,
    marketplace:   <MarketplaceTab />,
    transactions:  <TransactionsTab />,
    badges:        <BadgesTab />,
    notifications: <NotificationsTab users={users} />,
    analytics:     <AnalyticsTab stats={stats} users={users} />,
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-500">Loading dashboard…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-56 bg-white border-r border-gray-100 flex flex-col shrink-0">
        {/* Logo */}
        <div className="px-5 py-5 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-green-600 flex items-center justify-center text-white text-sm font-bold shrink-0">C</div>
            <div>
              <p className="text-sm font-semibold text-gray-900 leading-none">CarbonCalc</p>
              <p className="text-xs text-gray-400 mt-0.5">Admin Panel</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => changeTab(t.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors text-left ${
                tab === t.id
                  ? 'bg-green-50 text-green-700 font-semibold'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 font-medium'
              }`}
            >
              <span className="w-4 h-4 shrink-0"><t.Ico /></span>
              <span>{t.label}</span>
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-3 py-3 border-t border-gray-100">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-colors"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 shrink-0"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto px-6 py-6">
          {tabContent[tab]}
        </div>
      </main>
    </div>
  )
}

export default AdminDashboard
