import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'

function Avatar({ name, size = 'md', highlight = false }) {
  const initials = (name ?? 'U').slice(0, 2).toUpperCase()
  const sz = size === 'lg' ? 'w-12 h-12 text-sm' : 'w-9 h-9 text-xs'
  const color = highlight ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600'
  return (
    <div className={`flex items-center justify-center rounded-full font-bold shrink-0 ${sz} ${color}`}>
      {initials}
    </div>
  )
}

function RankBadge({ rank }) {
  if (rank === 1) return <span className="text-2xl" title="Gold">🥇</span>
  if (rank === 2) return <span className="text-2xl" title="Silver">🥈</span>
  if (rank === 3) return <span className="text-2xl" title="Bronze">🥉</span>
  return <span className="w-8 text-center text-sm font-bold text-gray-500">#{rank}</span>
}

const TOP3_ROW = [
  'bg-yellow-50 border-yellow-200',
  'bg-gray-50  border-gray-200',
  'bg-orange-50 border-orange-200',
]

export default function Leaderboard() {
  const navigate = useNavigate()
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')

  useEffect(() => {
    api.get('/api/leaderboard')
      .then(r => setEntries(r.data || []))
      .catch(() => setError('Failed to load leaderboard.'))
      .finally(() => setLoading(false))
  }, [])

  const me = entries.find(e => e.currentUser || e.isCurrentUser)
  const top3 = entries.slice(0, 3)
  const rest = entries.slice(3)

  const avgReduction = entries.length
    ? (entries.reduce((s, e) => s + (e.reductionPct ?? 0), 0) / entries.length).toFixed(1)
    : '0.0'
  const totalParticipants = entries.length

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wider mb-0.5">Community Rankings</p>
            <h1 className="text-2xl font-bold text-gray-900">Eco Leaderboard</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Ranked by composite score: emissions (50%) + reduction (30%) + goals (20%)
            </p>
          </div>
          <button onClick={() => navigate('/survey')}
            className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors shadow-sm">
            ↑ Submit Survey
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-5 py-4 mb-5 text-sm">{error}</div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-9 w-9 border-4 border-green-500 border-t-transparent" />
          </div>
        ) : entries.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 text-center">
            <span className="text-5xl block mb-4">🏆</span>
            <p className="text-gray-500 font-medium">No rankings yet</p>
            <p className="text-sm text-gray-400 mt-1">Submit surveys to appear on the leaderboard.</p>
          </div>
        ) : (
          <>
            {/* My rank hero */}
            {me && (
              <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-2xl p-5 mb-5 flex items-center gap-4 shadow-md">
                <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-white/20 shrink-0">
                  <span className="text-2xl font-black">#{me.rank}</span>
                </div>
                <Avatar name={me.username} size="lg" highlight={false} />
                <div className="flex-1 min-w-0">
                  <p className="text-base font-bold">{me.username} (You)</p>
                  <p className="text-xs text-green-100 mt-0.5">
                    Top {Math.round((me.rank / entries.length) * 100)}% of eco savers
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs text-green-200 uppercase tracking-wide">Score</p>
                  <p className="text-2xl font-black">{(me.score ?? 0).toFixed(1)}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs text-green-200 uppercase tracking-wide">Reduction</p>
                  <p className="text-2xl font-black">{(me.reductionPct ?? 0).toFixed(1)}%</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs text-green-200 uppercase tracking-wide">Goals</p>
                  <p className="text-2xl font-black">{me.goalsCompleted ?? 0}</p>
                </div>
              </div>
            )}

            {/* Top 3 podium cards */}
            {top3.length > 0 && (
              <div className="grid grid-cols-3 gap-3 mb-5">
                {top3.map((e, i) => {
                  const isMe = e.currentUser || e.isCurrentUser
                  return (
                    <div key={e.userId}
                      className={`rounded-2xl border-2 p-4 text-center transition-all hover:shadow-md ${isMe ? 'border-green-300 bg-green-50' : TOP3_ROW[i]}`}>
                      <RankBadge rank={e.rank} />
                      <Avatar name={e.username} size="lg" highlight={isMe} />
                      <p className={`text-sm font-bold mt-2 truncate ${isMe ? 'text-green-700' : 'text-gray-800'}`}>
                        {e.username}{isMe ? ' (You)' : ''}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">{(e.totalEmissions ?? e.score ?? 0).toFixed(2)} kg avg</p>
                      <div className="mt-2 flex justify-center gap-2 flex-wrap">
                        <span className="text-xs bg-green-100 text-green-700 font-semibold px-2 py-0.5 rounded-full">
                          {(e.reductionPct ?? 0).toFixed(1)}% ↓
                        </span>
                        <span className="text-xs bg-blue-100 text-blue-700 font-semibold px-2 py-0.5 rounded-full">
                          {e.goalsCompleted ?? 0} goals
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {/* Full table */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-5">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-gray-900">All Rankings</h2>
                  <p className="text-xs text-gray-400 mt-0.5">{entries.length} participants</p>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-gray-400">
                  <span className="w-2 h-2 rounded-full bg-green-400 inline-block" />
                  <span>Composite score (higher = better)</span>
                </div>
              </div>

              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider w-16">Rank</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">User</th>
                    <th className="text-right px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Avg Emissions</th>
                    <th className="text-right px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Reduction %</th>
                    <th className="text-right px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Goals</th>
                    <th className="text-right px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Score</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map(e => {
                    const isMe = e.currentUser || e.isCurrentUser
                    const isTop3 = e.rank <= 3
                    return (
                      <tr key={e.userId}
                        className={`border-b border-gray-50 transition-colors
                          ${isMe ? 'bg-green-50/80' : isTop3 ? 'bg-yellow-50/40' : 'hover:bg-gray-50'}`}>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center justify-center w-8">
                            <RankBadge rank={e.rank} />
                          </div>
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <Avatar name={e.username} highlight={isMe} />
                            <div>
                              <p className={`text-sm font-semibold ${isMe ? 'text-green-700' : 'text-gray-800'}`}>
                                {e.username}{isMe && ' (You)'}
                              </p>
                              {isTop3 && !isMe && (
                                <p className="text-xs text-yellow-600 font-medium">Top performer</p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <span className={`text-sm font-bold ${(e.totalEmissions ?? 0) < 5 ? 'text-green-600' : (e.totalEmissions ?? 0) < 15 ? 'text-yellow-600' : 'text-red-500'}`}>
                            {(e.totalEmissions ?? e.score ?? 0).toFixed(2)} kg
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <span className={`text-sm font-bold ${(e.reductionPct ?? 0) > 0 ? 'text-green-600' : 'text-gray-400'}`}>
                            {(e.reductionPct ?? 0) > 0 ? `${e.reductionPct?.toFixed(1)}%` : '—'}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700">
                            🎯 {e.goalsCompleted ?? 0}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <div className="w-16 bg-gray-100 rounded-full h-1.5">
                              <div className="h-1.5 rounded-full bg-green-500 transition-all"
                                style={{ width: `${Math.min(100, e.score ?? 0)}%` }} />
                            </div>
                            <span className="text-xs font-bold text-gray-700 w-10 text-right">
                              {(e.score ?? 0).toFixed(1)}
                            </span>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Bottom stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 text-center">
                <p className="text-3xl font-bold text-green-600">{avgReduction}%</p>
                <p className="text-xs text-gray-500 mt-1">Avg Community Reduction</p>
              </div>
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 text-center">
                <p className="text-3xl font-bold text-blue-600">{totalParticipants}</p>
                <p className="text-xs text-gray-500 mt-1">Total Participants</p>
              </div>
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 text-center">
                <p className="text-3xl font-bold text-purple-600">
                  {entries.reduce((s, e) => s + (e.goalsCompleted ?? 0), 0)}
                </p>
                <p className="text-xs text-gray-500 mt-1">Goals Completed (Total)</p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
