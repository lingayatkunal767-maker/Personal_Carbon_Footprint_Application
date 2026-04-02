import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import confetti from 'canvas-confetti'
import api from '../services/api'

const RARITY_STYLES = {
  EPIC:   { label: 'Epic',   bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-300', glow: 'shadow-purple-200' },
  RARE:   { label: 'Rare',   bg: 'bg-blue-100',   text: 'text-blue-700',   border: 'border-blue-300',   glow: 'shadow-blue-200'   },
  COMMON: { label: 'Common', bg: 'bg-gray-100',   text: 'text-gray-600',   border: 'border-gray-200',   glow: ''                  },
}

const FILTERS = ['All', 'Claimed', 'Unclaimed', 'Locked']

function RarityBadge({ rarity }) {
  const s = RARITY_STYLES[rarity] || RARITY_STYLES.COMMON
  return (
    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${s.bg} ${s.text}`}>
      {s.label}
    </span>
  )
}

function ClaimModal({ badge, onClose, onClaim }) {
  const [claiming, setClaiming] = useState(false)
  const [claimed, setClaimed] = useState(false)
  const [error, setError] = useState(null)

  const handleClaim = async () => {
    setClaiming(true)
    setError(null)
    try {
      await api.post(`/api/badges/${badge.id}/claim`)
      setClaimed(true)
      // Fire confetti
      confetti({ particleCount: 120, spread: 80, origin: { y: 0.55 }, colors: ['#22c55e', '#facc15', '#3b82f6', '#a855f7'] })
      setTimeout(() => confetti({ particleCount: 60, angle: 60,  spread: 55, origin: { x: 0 } }), 200)
      setTimeout(() => confetti({ particleCount: 60, angle: 120, spread: 55, origin: { x: 1 } }), 400)
      // Notify parent to refresh earned list
      onClaim()
    } catch (err) {
      const msg = err?.response?.data?.error || err?.message || 'Failed to claim badge'
      setError(msg)
      console.error('Claim failed', err)
    } finally {
      setClaiming(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full mx-4 text-center relative" onClick={e => e.stopPropagation()}>
        {!claimed ? (
          <>
            <div className={`flex items-center justify-center w-20 h-20 rounded-2xl ${badge.bgColor || 'bg-gray-50'} mx-auto mb-4 text-5xl shadow-lg`}>
              {badge.icon || '🎖️'}
            </div>
            <RarityBadge rarity={badge.rarity || 'COMMON'} />
            <h2 className="text-xl font-bold text-gray-900 mt-3 mb-1">{badge.badgeName}</h2>
            <p className="text-sm text-gray-500 mb-4">{badge.description}</p>
            <div className="flex items-center justify-center gap-2 bg-yellow-50 rounded-xl px-4 py-2 mb-6">
              <span className="text-lg">⭐</span>
              <span className="text-sm font-bold text-yellow-700">+{badge.rewardPoints || 50} Eco Points</span>
            </div>
            <button onClick={handleClaim} disabled={claiming}
              className="w-full bg-green-500 hover:bg-green-600 disabled:opacity-60 text-white font-bold py-3 rounded-xl transition-colors text-sm">
              {claiming ? 'Claiming...' : '✨ Claim Badge'}
            </button>
            {error && (
              <p className="mt-2 text-xs text-red-500 bg-red-50 rounded-lg px-3 py-2">{error}</p>
            )}
            <button onClick={onClose} className="mt-3 text-xs text-gray-400 hover:text-gray-600 w-full">Cancel</button>
          </>
        ) : (
          <>
            <div className="text-6xl mb-4 animate-bounce">{badge.icon || '🎖️'}</div>
            <h2 className="text-2xl font-black text-gray-900 mb-2">Congratulations!</h2>
            <p className="text-base font-semibold text-green-600 mb-1">You unlocked</p>
            <p className="text-xl font-bold text-gray-800 mb-3">"{badge.badgeName}"</p>
            <div className="flex items-center justify-center gap-2 bg-yellow-50 rounded-xl px-4 py-2 mb-6">
              <span className="text-lg">⭐</span>
              <span className="text-sm font-bold text-yellow-700">+{badge.rewardPoints || 50} Eco Points earned!</span>
            </div>
            <button onClick={onClose}
              className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-xl transition-colors text-sm">
              Awesome! 🎉
            </button>
          </>
        )}
      </div>
    </div>
  )
}

function BadgeCard({ def, earnedBadge, onClaimClick }) {
  // Determine state: LOCKED | UNLOCKED | CLAIMED
  const state = !earnedBadge ? 'LOCKED' : earnedBadge.isClaimed ? 'CLAIMED' : 'UNLOCKED'
  const rarity = def.rarity || earnedBadge?.rarity || 'COMMON'
  const rarityStyle = RARITY_STYLES[rarity] || RARITY_STYLES.COMMON

  const cardStyle = {
    LOCKED:   'border-gray-100 bg-white opacity-60',
    UNLOCKED: `border-2 ${rarityStyle.border} bg-white shadow-md ${rarityStyle.glow}`,
    CLAIMED:  'border-blue-100 bg-blue-50/40 shadow-sm',
  }[state]

  return (
    <div className={`rounded-2xl border p-5 text-center transition-all hover:shadow-lg relative ${cardStyle}`}>
      {/* State badge top-right */}
      <div className="absolute top-3 right-3">
        {state === 'LOCKED'   && <span className="text-gray-300 text-lg">🔒</span>}
        {state === 'UNLOCKED' && <span className="text-lg animate-pulse">✨</span>}
        {state === 'CLAIMED'  && <span className="text-lg">✅</span>}
      </div>

      {/* Rarity top-left */}
      {state !== 'LOCKED' && (
        <div className="absolute top-3 left-3">
          <RarityBadge rarity={rarity} />
        </div>
      )}

      {/* Icon */}
      <div className={`flex items-center justify-center w-16 h-16 rounded-2xl mx-auto mt-4 mb-3 text-3xl
        ${state === 'LOCKED' ? 'bg-gray-100 grayscale' : def.bgColor || 'bg-gray-50'}
        ${state === 'UNLOCKED' ? 'shadow-lg' : ''}`}>
        {state === 'LOCKED' ? '🔒' : (def.icon || '🎖️')}
      </div>

      <div className="h-5 mb-1 overflow-hidden">
        <h3 className="text-sm font-bold text-gray-900 line-clamp-1">{def.badgeName}</h3>
      </div>
      <div className="h-12 mb-3 overflow-hidden">
        <p className="text-xs text-gray-400 leading-relaxed line-clamp-3">{def.description}</p>
      </div>

      {/* Points */}
      {state !== 'LOCKED' && (
        <p className="text-xs font-semibold text-yellow-600 mb-2">⭐ {def.rewardPoints || 50} pts</p>
      )}

      {/* Progress bar for locked */}
      {state === 'LOCKED' && (
        <div className="mt-2">
          <p className="text-xs text-gray-400 bg-gray-50 rounded-lg px-2 py-1">{def.requirement}</p>
          <div className="w-full bg-gray-100 rounded-full h-1.5 mt-2">
            <div className="h-1.5 rounded-full bg-gray-300" style={{ width: '0%' }} />
          </div>
        </div>
      )}

      {/* Claim button for UNLOCKED */}
      {state === 'UNLOCKED' && (
        <button onClick={() => onClaimClick({ ...def, ...earnedBadge, id: earnedBadge.id })}
          className="mt-2 w-full bg-green-500 hover:bg-green-600 text-white text-xs font-bold py-2 rounded-xl transition-colors">
          ✨ Claim Reward
        </button>
      )}

      {/* Claimed date */}
      {state === 'CLAIMED' && earnedBadge?.claimedAt && (
        <p className="text-xs text-blue-500 font-semibold mt-1">
          Claimed {new Date(earnedBadge.claimedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </p>
      )}
      {state === 'CLAIMED' && !earnedBadge?.claimedAt && (
        <p className="text-xs text-blue-500 font-semibold mt-1">✅ Claimed</p>
      )}
    </div>
  )
}

export default function Badges() {
  const navigate = useNavigate()
  const [definitions, setDefinitions] = useState([])
  const [earned, setEarned] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('All')
  const [claimTarget, setClaimTarget] = useState(null) // badge to show in modal

  const fetchData = () =>
    Promise.all([
      api.get('/api/badges/definitions'),
      api.get('/api/badges'),
    ]).then(([defsRes, earnedRes]) => {
      setDefinitions(defsRes.data || [])
      setEarned(earnedRes.data || [])
    }).finally(() => setLoading(false))

  useEffect(() => { fetchData() }, [])

  const earnedMap = Object.fromEntries(earned.map(b => [b.badgeName, b]))

  const claimedCount  = earned.filter(b => b.isClaimed).length
  const unclaimedCount = earned.filter(b => !b.isClaimed).length
  const totalEcoPoints = earned.filter(b => b.isClaimed).reduce((s, b) => s + (b.rewardPoints || 50), 0)

  const filtered = definitions.filter(def => {
    const e = earnedMap[def.badgeName]
    if (filter === 'Claimed')   return e && e.isClaimed
    if (filter === 'Unclaimed') return e && !e.isClaimed
    if (filter === 'Locked')    return !e
    return true
  })

  const handleClaim = async () => {
    // Refresh earned list so card updates to CLAIMED state
    const res = await api.get('/api/badges')
    setEarned(res.data || [])
  }

  const nextBadge = definitions.find(d => !earnedMap[d.badgeName])

  return (
    <div style={{ width: '100%', background: '#f9fafb' }}>
      {claimTarget && (
        <ClaimModal
          badge={claimTarget}
          onClose={() => setClaimTarget(null)}
          onClaim={handleClaim}
        />
      )}

      {/* ── Header bar ── */}
      <div className="bg-white border-b border-gray-100 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wider mb-0.5">Achievements</p>
            <h1 className="text-xl font-bold text-gray-900">Badges Gallery</h1>
            <p className="text-xs text-gray-400 mt-0.5">
              {earned.length} of {definitions.length} unlocked · {claimedCount} claimed
            </p>
          </div>
          <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
            {FILTERS.map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  filter === f ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}>
                {f}
                {f === 'Unclaimed' && unclaimedCount > 0 && (
                  <span className="ml-1 bg-green-500 text-white text-xs rounded-full px-1.5">{unclaimedCount}</span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Body: full-width two-column grid ── */}
      <div style={{ width: '100%', padding: '24px 24px', boxSizing: 'border-box' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 320px',
          gap: '24px',
          alignItems: 'start',
          width: '100%',
        }}>

          {/* ── LEFT: Badge Grid ── */}
          <div style={{ minWidth: 0, width: '100%' }}>

            {filter === 'All' && unclaimedCount > 0 && (
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl px-5 py-3 mb-5 flex items-center gap-3">
                <span className="text-2xl">✨</span>
                <div className="flex-1">
                  <p className="text-sm font-bold text-green-800">
                    {unclaimedCount} badge{unclaimedCount > 1 ? 's' : ''} ready to claim!
                  </p>
                  <p className="text-xs text-green-600">Click "Claim Reward" on any glowing card below.</p>
                </div>
                <button onClick={() => setFilter('Unclaimed')}
                  className="text-xs font-semibold text-green-700 bg-green-100 hover:bg-green-200 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap">
                  View All →
                </button>
              </div>
            )}

            {loading ? (
              <div className="flex items-center justify-center py-24">
                <div className="animate-spin rounded-full h-9 w-9 border-4 border-green-500 border-t-transparent" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 text-center">
                <span className="text-5xl block mb-3">🔍</span>
                <p className="text-gray-500 text-sm">No badges found for this filter.</p>
              </div>
            ) : (
              <>
                {/* Badge cards — auto-fill fills full left column width */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                  gap: '16px',
                  width: '100%',
                  marginBottom: '20px',
                }}>
                  {filtered.map(def => (
                    <BadgeCard
                      key={def.id ?? def.badgeName}
                      def={def}
                      earnedBadge={earnedMap[def.badgeName] || null}
                      onClaimClick={setClaimTarget}
                    />
                  ))}
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div>
                    <h3 className="text-sm font-bold text-gray-900">Ready to earn your next badge?</h3>
                    <p className="text-xs text-gray-400 mt-0.5">Submit surveys and set goals to unlock more.</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <button onClick={() => navigate('/goals')}
                      className="bg-green-500 hover:bg-green-600 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-colors">
                      Add New Goal
                    </button>
                    <button onClick={() => navigate('/survey')}
                      className="px-5 py-2.5 border border-gray-200 text-gray-600 text-xs font-medium rounded-xl hover:bg-gray-50 transition-colors">
                      Take Survey
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* ── RIGHT: Sidebar (sticky) ── */}
          <div style={{ width: '320px', position: 'sticky', top: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h3 className="text-sm font-bold text-gray-900 mb-4">Your Progress</h3>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div className="bg-green-50 rounded-xl p-3 text-center">
                  <p className="text-2xl font-black text-green-600">{claimedCount}</p>
                  <p className="text-xs text-gray-500 mt-0.5">Claimed</p>
                </div>
                <div className="bg-yellow-50 rounded-xl p-3 text-center">
                  <p className="text-2xl font-black text-yellow-600">{totalEcoPoints}</p>
                  <p className="text-xs text-gray-500 mt-0.5">Eco Points</p>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs text-gray-400 mb-1">
                  <span>Overall</span>
                  <span>{earned.length}/{definitions.length}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div className="h-2 rounded-full bg-green-500 transition-all duration-700"
                    style={{ width: definitions.length > 0 ? `${(earned.length / definitions.length) * 100}%` : '0%' }} />
                </div>
              </div>
              {unclaimedCount > 0 && (
                <div className="bg-emerald-50 rounded-xl p-3 text-center mt-3">
                  <p className="text-sm font-bold text-emerald-600">✨ {unclaimedCount} ready to claim</p>
                </div>
              )}
            </div>

            {nextBadge && (
              <div className="bg-gradient-to-br from-green-50 to-teal-50 rounded-2xl border border-green-100 shadow-sm p-5">
                <h3 className="text-sm font-bold text-green-800 mb-3">🎯 Next Badge</h3>
                <div className={`flex items-center justify-center w-12 h-12 rounded-xl ${nextBadge.bgColor || 'bg-white'} mb-2 text-2xl shadow-sm`}>
                  {nextBadge.icon || '🎖️'}
                </div>
                <p className="text-sm font-bold text-gray-900">{nextBadge.badgeName}</p>
                <p className="text-xs text-gray-500 mt-0.5 mb-2">{nextBadge.description}</p>
                <div className="flex flex-wrap gap-1.5">
                  <span className="text-xs font-semibold text-green-700 bg-green-100 rounded-lg px-2 py-1">{nextBadge.requirement}</span>
                  {nextBadge.rarity && <RarityBadge rarity={nextBadge.rarity} />}
                </div>
                <p className="text-xs text-yellow-600 font-semibold mt-2">⭐ +{nextBadge.rewardPoints || 50} pts on claim</p>
              </div>
            )}

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h3 className="text-sm font-bold text-gray-900 mb-3">How it Works</h3>
              <div className="space-y-3">
                {[
                  { step: '1', icon: '📝', text: 'Submit surveys to unlock badges automatically.' },
                  { step: '2', icon: '✨', text: 'Unlocked badges show a "Claim" button.' },
                  { step: '3', icon: '⭐', text: 'Claim to earn eco points!' },
                ].map(({ step, icon, text }) => (
                  <div key={step} className="flex gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-green-100 text-green-700 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">{step}</span>
                    <p className="text-xs text-gray-600">{icon} {text}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h3 className="text-sm font-bold text-gray-900 mb-3">Rarity Tiers</h3>
              <div className="space-y-2">
                {Object.entries(RARITY_STYLES).map(([key, s]) => (
                  <div key={key} className="flex items-center justify-between">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${s.bg} ${s.text}`}>{s.label}</span>
                    <span className="text-xs text-gray-400">
                      {key === 'EPIC' ? '350–500 pts' : key === 'RARE' ? '100–200 pts' : '50–75 pts'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}


