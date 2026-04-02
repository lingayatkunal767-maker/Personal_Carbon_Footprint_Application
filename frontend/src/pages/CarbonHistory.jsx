import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { History, Zap, TrendingDown, TrendingUp, ClipboardCheck, Plus } from '../components/Icons'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import api from '../services/api'

const CATEGORIES = ['All Categories', 'Transport', 'Food', 'Energy']

function DownloadIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
    </svg>
  )
}
function TableIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M3 15h18M9 3v18"/>
    </svg>
  )
}
function ChartIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/>
    </svg>
  )
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-lg px-4 py-3 text-xs">
      <p className="font-semibold text-gray-700 mb-2">{label}</p>
      {payload.map(p => (
        <p key={p.name} style={{ color: p.color }} className="mb-0.5">{p.name}: {p.value} kg</p>
      ))}
    </div>
  )
}

export default function CarbonHistory() {
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [page, setPage] = useState(1)
  const [activeCategory, setActiveCategory] = useState('All Categories')
  const [view, setView] = useState('table')
  const [selectedRecord, setSelectedRecord] = useState(null)
  const [detailRecord, setDetailRecord] = useState(null)
  const PER_PAGE = 5
  const navigate = useNavigate()

  const fetchData = () => {
    setLoading(true)
    setError('')
    const params = {}
    if (from) params.from = from
    if (to) params.to = to
    
    console.log('[CarbonHistory] Fetching data with params:', params)
    
    api.get('/api/carbon/logs', { params })
      .then(res => { 
        console.log('[CarbonHistory] Received data:', res.data)
        setRecords(res.data || [])
        setPage(1)
      })
      .catch(err => {
        console.error('[CarbonHistory] Error fetching data:', err)
        const msg = err.response?.data?.message || err.message || 'Failed to load history.'
        setError(msg)
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchData() }, [])

  const totalCarbon = records.reduce((s, r) => s + (r.carbonScore ?? 0), 0)
  const avgMonthly = records.length > 0 ? totalCarbon / Math.max(1, Math.ceil(records.length / 30)) : 0
  const avg = records.length > 0 ? totalCarbon / records.length : 0

  const bestCat = (() => {
    if (!records.length) return '—'
    const t = records.reduce((s, r) => s + (r.transportEmission ?? 0), 0)
    const f = records.reduce((s, r) => s + (r.foodEmission ?? 0), 0)
    const e = records.reduce((s, r) => s + (r.energyEmission ?? 0), 0)
    const min = Math.min(t, f, e)
    if (min === t) return 'Transport'
    if (min === f) return 'Food & Diet'
    return 'Energy'
  })()

  const totalPages = Math.ceil(records.length / PER_PAGE)
  const paged = records.slice((page - 1) * PER_PAGE, page * PER_PAGE)

  // Chart data — filtered by activeCategory, last 14 entries reversed to chronological
  const chartData = [...records].reverse().slice(-14).map(r => ({
    date: new Date(r.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    Transport: parseFloat((r.transportEmission ?? 0).toFixed(2)),
    Food: parseFloat((r.foodEmission ?? 0).toFixed(2)),
    Energy: parseFloat((r.energyEmission ?? 0).toFixed(2)),
  }))

  const exportCSV = () => {
    const header = 'Date,Transport (kg),Food (kg),Energy (kg),Total (kg)'
    const rows = records.map(r =>
      `${new Date(r.date).toISOString().split('T')[0]},${(r.transportEmission ?? 0).toFixed(2)},${(r.foodEmission ?? 0).toFixed(2)},${(r.energyEmission ?? 0).toFixed(2)},${(r.carbonScore ?? 0).toFixed(2)}`
    )
    const blob = new Blob([[header, ...rows].join('\n')], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = 'carbon-history.csv'; a.click()
    URL.revokeObjectURL(url)
  }

  // Pagination page numbers with ellipsis
  const getPageNums = () => {
    if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1)
    if (page <= 3) return [1, 2, 3, '...', totalPages]
    if (page >= totalPages - 2) return [1, '...', totalPages - 2, totalPages - 1, totalPages]
    return [1, '...', page, '...', totalPages]
  }

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="flex flex-col items-center gap-3">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-green-500 border-t-transparent" />
        <p className="text-sm text-gray-400">Loading history...</p>
      </div>
    </div>
  )

  return (
    <div className="p-6 max-w-6xl mx-auto">

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Carbon History</h1>
          <p className="text-sm text-gray-500 mt-0.5">Analyze your environmental progress and historical log data.</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={exportCSV}
            className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 bg-white text-gray-600 text-sm font-medium rounded-xl hover:bg-gray-50 transition-colors shadow-sm">
            <DownloadIcon /> Export CSV
          </button>
          <button onClick={() => navigate('/survey')}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors shadow-sm">
            <Plus size={14} /> Update Profile
          </button>
        </div>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-5 py-4 mb-5 text-sm">{error}</div>}

      {/* Filter bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div className="flex flex-wrap items-center gap-2">
          {/* Date range */}
          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm shadow-sm">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            <input type="date" value={from} onChange={e => setFrom(e.target.value)}
              className="text-sm text-gray-600 outline-none bg-transparent w-32" />
            <span className="text-gray-300">–</span>
            <input type="date" value={to} onChange={e => setTo(e.target.value)}
              className="text-sm text-gray-600 outline-none bg-transparent w-32" />
          </div>

          {/* Category chips */}
          <div className="flex items-center gap-1.5">
            {CATEGORIES.map(cat => (
              <button key={cat} onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  activeCategory === cat
                    ? 'bg-green-600 text-white shadow-sm'
                    : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}>
                {cat}
              </button>
            ))}
          </div>

          {(from || to) && (
            <button onClick={() => { setFrom(''); setTo(''); setTimeout(fetchData, 0) }}
              className="text-xs text-gray-400 hover:text-gray-600 px-2 py-1.5">
              ✕ Clear
            </button>
          )}
          <button onClick={fetchData}
            className="bg-green-600 text-white text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-green-700 transition-colors">
            Apply
          </button>
        </div>

        {/* View toggle */}
        <div className="flex items-center bg-white border border-gray-200 rounded-xl p-1 shadow-sm">
          <button onClick={() => setView('table')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${view === 'table' ? 'bg-green-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
            <TableIcon /> Table View
          </button>
          <button onClick={() => setView('chart')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${view === 'chart' ? 'bg-green-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
            <ChartIcon /> Trend Chart
          </button>
        </div>
      </div>

      {/* Empty state */}
      {records.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 text-center mb-5">
          <ClipboardCheck size={48} className="mx-auto mb-4 text-gray-200" />
          <p className="text-gray-500 font-medium">No records found</p>
          <p className="text-sm text-gray-400 mt-1 mb-5">Submit your first survey to start tracking.</p>
          <button onClick={() => navigate('/survey')}
            className="inline-flex items-center gap-2 bg-green-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-green-700 transition-colors">
            <Plus size={14} /> Take Survey
          </button>
        </div>
      ) : view === 'chart' ? (
        /* Trend Chart View */
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-1">Emission Trend</h2>
          <p className="text-xs text-gray-400 mb-5">Category breakdown over the last 14 entries.</p>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={chartData} margin={{ top: 5, right: 10, left: -15, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 12, paddingTop: 12 }} />
              {(activeCategory === 'All Categories' || activeCategory === 'Transport') && (
                <Line type="monotone" dataKey="Transport" stroke="#f97316" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
              )}
              {(activeCategory === 'All Categories' || activeCategory === 'Food') && (
                <Line type="monotone" dataKey="Food" stroke="#ec4899" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
              )}
              {(activeCategory === 'All Categories' || activeCategory === 'Energy') && (
                <Line type="monotone" dataKey="Energy" stroke="#eab308" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : (
        /* Table View */
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-5">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-gray-700">Detailed Logs</h2>
              <p className="text-xs text-gray-400 mt-0.5">Showing {paged.length} of {records.length} total records</p>
            </div>
            <span className="text-xs text-green-600 font-semibold bg-green-50 px-3 py-1 rounded-full">
              Efficiency: +{((1 - avg / (totalCarbon || 1)) * 100).toFixed(1)}% vs last month
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wider">Date</th>
                  <th className="text-right px-6 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wider">Transport (kg)</th>
                  <th className="text-right px-6 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wider">Food (kg)</th>
                  <th className="text-right px-6 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wider">Energy (kg)</th>
                  <th className="text-right px-6 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wider">Total (kg)</th>
                  <th className="text-right px-6 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paged.map((r, i) => {
                  const isHigh = (r.carbonScore ?? 0) > avg * 1.1
                  const dateStr = (() => {
                    try { return new Date(r.date).toISOString().split('T')[0] } catch { return r.date }
                  })()
                  const hlTransport = activeCategory === 'Transport'
                  const hlFood = activeCategory === 'Food'
                  const hlEnergy = activeCategory === 'Energy'
                  return (
                    <tr key={r.id ?? i} className="border-b border-gray-50 hover:bg-gray-50/70 transition-colors">
                      <td className="px-6 py-4 text-gray-700 font-medium">{dateStr}</td>
                      <td className={`px-6 py-4 text-right ${hlTransport ? 'bg-orange-50' : ''}`}>
                        <span className="inline-flex items-center justify-end gap-1">
                          <span className="w-2 h-2 rounded-full bg-orange-400 inline-block" />
                          <span className={`${hlTransport ? 'font-bold text-orange-600' : 'text-gray-600'}`}>{(r.transportEmission ?? 0).toFixed(2)}</span>
                        </span>
                      </td>
                      <td className={`px-6 py-4 text-right ${hlFood ? 'bg-pink-50' : ''}`}>
                        <span className="inline-flex items-center justify-end gap-1">
                          <span className="w-2 h-2 rounded-full bg-pink-400 inline-block" />
                          <span className={`${hlFood ? 'font-bold text-pink-600' : 'text-gray-600'}`}>{(r.foodEmission ?? 0).toFixed(2)}</span>
                        </span>
                      </td>
                      <td className={`px-6 py-4 text-right ${hlEnergy ? 'bg-yellow-50' : ''}`}>
                        <span className="inline-flex items-center justify-end gap-1">
                          <span className="w-2 h-2 rounded-full bg-yellow-400 inline-block" />
                          <span className={`${hlEnergy ? 'font-bold text-yellow-600' : 'text-gray-600'}`}>{(r.energyEmission ?? 0).toFixed(2)}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className={`font-bold ${isHigh ? 'text-red-600' : 'text-gray-800'}`}>
                          {(r.carbonScore ?? 0).toFixed(2)}
                        </span>
                        {isHigh && <span className="ml-1 text-red-500 text-xs">●</span>}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button onClick={() => setDetailRecord(r)} className="text-xs text-green-600 hover:text-green-700 font-semibold hover:underline">
                          View Details
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
            <span className="text-gray-400 text-xs">
              Showing {records.length === 0 ? 0 : (page - 1) * PER_PAGE + 1}–{Math.min(page * PER_PAGE, records.length)} of {records.length} entries
            </span>
            {totalPages > 1 && (
              <div className="flex items-center gap-1">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                  className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 text-sm">‹</button>
                {getPageNums().map((n, i) =>
                  n === '...'
                    ? <span key={`e${i}`} className="w-8 h-8 flex items-center justify-center text-gray-400 text-sm">…</span>
                    : <button key={n} onClick={() => setPage(n)}
                        className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${page === n ? 'bg-green-600 text-white shadow-sm' : 'border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                        {n}
                      </button>
                )}
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                  className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 text-sm">›</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Summary cards */}
      {records.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-green-50 shrink-0">
              <Zap size={18} className="text-green-600" />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide">Average Monthly</p>
              <p className="text-xl font-bold text-gray-800 mt-0.5">{avgMonthly.toFixed(0)} <span className="text-sm font-normal text-gray-400">kg CO₂e</span></p>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-blue-50 shrink-0">
              <TrendingDown size={18} className="text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide">Best Category</p>
              <p className="text-xl font-bold text-gray-800 mt-0.5">{bestCat}</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-purple-50 shrink-0">
              <TrendingUp size={18} className="text-purple-600" />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide">Total Audited</p>
              <p className="text-xl font-bold text-gray-800 mt-0.5">{totalCarbon.toFixed(0)} <span className="text-sm font-normal text-gray-400">kg</span></p>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <p className="text-center text-xs text-gray-400 mt-8">© 2026 CarbonCalc • Environmentally Conscious Tracking</p>

      {/* Detail Modal */}
      {detailRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setDetailRecord(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-bold text-gray-900">Log Details</h3>
              <button onClick={() => setDetailRecord(null)} className="text-gray-400 hover:text-gray-600 text-xl leading-none">✕</button>
            </div>
            <p className="text-xs text-gray-400 mb-4">
              {(() => { try { return new Date(detailRecord.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) } catch { return detailRecord.date } })()}
            </p>
            <div className="space-y-3 mb-5">
              {[
                { label: 'Transport Emission', value: detailRecord.transportEmission, color: 'bg-orange-100 text-orange-700', barColor: '#fb923c' },
                { label: 'Food Emission',      value: detailRecord.foodEmission,      color: 'bg-pink-100 text-pink-700',     barColor: '#f472b6' },
                { label: 'Energy Emission',    value: detailRecord.energyEmission,    color: 'bg-yellow-100 text-yellow-700', barColor: '#facc15' },
              ].map(({ label, value, color, barColor }) => {
                const total = (detailRecord.carbonScore ?? 0) || 1
                const pct = Math.round(((value ?? 0) / total) * 100)
                return (
                  <div key={label}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: barColor }} />
                        <span className="text-xs font-medium text-gray-600">{label}</span>
                      </div>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${color}`}>{(value ?? 0).toFixed(2)} kg</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5">
                      <div className="h-1.5 rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: barColor }} />
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5 text-right">{pct}% of total</p>
                  </div>
                )
              })}
            </div>
            <div className="border-t border-gray-100 pt-4 flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-700">Total Carbon Score</span>
              <span className="text-lg font-black text-gray-900">{(detailRecord.carbonScore ?? 0).toFixed(2)} <span className="text-sm font-normal text-gray-400">kg CO₂e</span></span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
