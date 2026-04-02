import { useEffect, useState } from 'react'
import { Plus } from '../components/Icons'
import api from '../services/api'

const CATEGORIES = [
  { key: 'transport',   label: 'Transport',   icon: '🚗' },
  { key: 'food',        label: 'Food & Diet', icon: '🍽️' },
  { key: 'home_energy', label: 'Home Energy', icon: '⚡' },
  { key: 'waste',       label: 'Waste',       icon: '🗑️' },
  { key: 'global',      label: 'Global',      icon: '🌐' },
]
const RECURRENCE = ['daily', 'weekly', 'monthly', 'one time']

const CAT_META = {
  transport:   { icon: '🚗', label: 'Transport',   light: '#fff7ed', text: '#c2410c', solid: '#f97316' },
  food:        { icon: '🍽️', label: 'Food & Diet', light: '#fdf2f8', text: '#be185d', solid: '#ec4899' },
  home_energy: { icon: '⚡', label: 'Home Energy', light: '#fefce8', text: '#a16207', solid: '#eab308' },
  waste:       { icon: '🗑️', label: 'Waste',       light: '#f8fafc', text: '#475569', solid: '#64748b' },
  global:      { icon: '🌐', label: 'Global',      light: '#eff6ff', text: '#1d4ed8', solid: '#3b82f6' },
}
const DEFAULT_META = { icon: '🎯', label: 'General', light: '#f0fdf4', text: '#15803d', solid: '#22c55e' }

const resolveCat = c  => (c && CAT_META[c.toLowerCase()]) ? c.toLowerCase() : 'global'
const resolveTf  = tf => (!tf || tf === 'Not set' || tf === 'Not specified') ? null : tf
const resolveRec = r  => (!r  || r  === 'Not set' || r  === 'Not specified') ? null : r

const INIT_FORM = {
  goalTitle: '', category: 'transport', reductionTarget: 15,
  timeframe: 'Next 30 Days', recurrence: 'weekly', description: '', targetEmission: ''
}

// ─── Goal Card ────────────────────────────────────────────────────────────────
function GoalCard({ goal, onDelete, onEdit }) {
  const isAchieved = goal.status === 'ACHIEVED'
  const pct  = Math.min(100, Math.max(0, goal.progressPct ?? 0))
  const cat  = resolveCat(goal.category)
  const meta = CAT_META[cat] ?? DEFAULT_META
  const tf   = resolveTf(goal.timeframe)
  const date = goal.createdAt
    ? new Date(goal.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : '—'

  return (
    <div className={`bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border ${isAchieved ? 'border-green-200' : 'border-gray-100'} flex flex-col group`}>
      <div className="p-6 flex flex-col gap-4 flex-1">

        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-4 min-w-0">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0 transition-transform duration-500 group-hover:scale-110 ${
              isAchieved ? 'bg-green-100 shadow-inner' : 'bg-gray-50'
            }`}>
              {isAchieved ? '🏆' : meta.icon}
            </div>
            <div className="min-w-0 flex-1">
              <div className="min-h-[48px] flex flex-col justify-center">
                <h3 className="text-sm font-black text-gray-900 leading-snug line-clamp-2 group-hover:text-green-700 transition-colors uppercase tracking-tight">{goal.goalTitle}</h3>
                <p className="text-[10px] font-bold text-gray-400 mt-0.5 tracking-wider">ESTABLISHED {date.toUpperCase()}</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
            {!isAchieved && (
              <button onClick={() => onEdit(goal)}
                className="w-8 h-8 flex items-center justify-center rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-500 hover:text-white transition-all shadow-sm"
                title="Edit Configuration">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
              </button>
            )}
            <button onClick={() => onDelete(goal.id)}
              className="w-8 h-8 flex items-center justify-center rounded-xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-sm"
              title="Terminate Goal">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                <path d="M10 11v6M14 11v6"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Status + tags */}
        <div className="flex items-center gap-2 flex-wrap min-h-[48px] content-start">
          <span className={`inline-flex items-center gap-1.5 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${
            isAchieved ? 'bg-green-100 text-green-700 shadow-sm' : 'bg-amber-100 text-amber-700 border border-amber-200'
          }`}>
            <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
            {isAchieved ? 'Goal Achieved' : 'Active Target'}
          </span>
          <span className="inline-flex items-center gap-1.5 text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-widest border border-transparent shadow-sm"
            style={{ background: meta.light, color: meta.text, borderColor: meta.solid + '20' }}>
            {meta.icon} {meta.label}
          </span>
          {tf && (
            <span className="inline-flex items-center gap-1.5 text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-widest bg-purple-50 text-purple-700 border border-purple-100 shadow-sm">
              📅 {tf}
            </span>
          )}
        </div>

        {/* Emission stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gray-50/80 rounded-2xl p-4 text-center border border-gray-100 shadow-inner group-hover:bg-white transition-colors">
            <p className="text-[10px] font-bold text-gray-400 mb-1 uppercase tracking-widest">Current</p>
            <p className="text-2xl font-black text-gray-900">{(goal.currentEmission ?? 0).toFixed(1)}</p>
            <p className="text-[10px] font-bold text-gray-400 mt-0.5 tracking-tighter">kg CO₂</p>
          </div>
          <div className="bg-gray-50/80 rounded-2xl p-4 text-center border border-gray-100 shadow-inner group-hover:bg-white transition-colors">
            <p className="text-[10px] font-bold text-gray-400 mb-1 uppercase tracking-widest">Target</p>
            <p className="text-2xl font-black text-gray-900">{(goal.targetEmission ?? 0).toFixed(1)}</p>
            <p className="text-[10px] font-bold text-gray-400 mt-0.5 tracking-tighter">kg CO₂</p>
          </div>
        </div>

        {/* Progress */}
        <div className="mt-2">
          <div className="flex justify-between text-[11px] mb-2 font-black uppercase tracking-widest">
            <span className="text-gray-400">Progression</span>
            <span style={{ color: isAchieved ? '#16a34a' : meta.solid }}>{pct.toFixed(0)}%</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden shadow-inner p-0.5 border border-gray-200">
            <div className={`h-full rounded-full transition-all duration-1000 ease-out shadow-sm ${isAchieved ? 'animate-pulse' : ''}`}
              style={{ width: `${pct}%`, background: isAchieved ? 'linear-gradient(90deg, #22c55e, #4ade80)' : `linear-gradient(90deg, ${meta.solid}, ${meta.solid}dd)` }} />
          </div>
          {isAchieved && (
            <p className="text-[11px] text-green-600 font-black text-center mt-3 uppercase tracking-tighter animate-bounce">✨ Milestone Accomplished! ✨</p>
          )}
        </div>

        {/* Action buttons (Mobile/Fallback) */}
        <div className="flex gap-2 mt-auto pt-4 sm:hidden">
          {!isAchieved && (
            <button onClick={() => onEdit(goal)}
              className="flex-1 flex items-center justify-center gap-1.5 py-3 rounded-2xl bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest hover:bg-blue-100 transition-colors border border-blue-100">
              Edit
            </button>
          )}
          <button onClick={() => onDelete(goal.id)}
            className={`${isAchieved ? 'flex-1' : ''} flex items-center justify-center gap-1.5 py-3 px-4 rounded-2xl bg-red-50 text-red-500 text-[10px] font-black uppercase tracking-widest hover:bg-red-100 transition-colors border border-red-100`}>
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Create / Edit Modal ──────────────────────────────────────────────────────
function GoalModal({ editGoal, onClose, onSaved }) {
  const isEdit = !!editGoal
  const [form, setForm] = useState(isEdit ? {
    goalTitle:       editGoal.goalTitle ?? '',
    category:        resolveCat(editGoal.category),
    reductionTarget: editGoal.reductionTarget ?? 15,
    timeframe:       resolveTf(editGoal.timeframe) ?? 'Next 30 Days',
    recurrence:      resolveRec(editGoal.recurrence) ?? 'weekly',
    description:     editGoal.description ?? '',
    targetEmission:  String(editGoal.targetEmission ?? ''),
  } : INIT_FORM)
  const [saving, setSaving] = useState(false)
  const [error, setError]   = useState('')
  const meta = CAT_META[form.category] ?? DEFAULT_META

  const handleSave = async (e) => {
    e.preventDefault(); setError('')
    if (!form.goalTitle.trim()) return setError('Goal title is required.')
    const target = parseFloat(form.targetEmission)
    if (isNaN(target) || target < 0) return setError('Enter a valid target emission (≥ 0).')
    setSaving(true)
    try {
      const payload = {
        goalTitle: form.goalTitle.trim(), targetEmission: target,
        category: form.category, reductionTarget: form.reductionTarget,
        timeframe: form.timeframe, recurrence: form.recurrence,
        description: form.description.trim() || null,
      }
      if (isEdit) await api.put(`/api/goals/${editGoal.id}`, payload)
      else        await api.post('/api/goals', payload)
      onSaved(); onClose()
    } catch { setError(`Failed to ${isEdit ? 'update' : 'create'} goal.`) }
    finally { setSaving(false) }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={onClose}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[92vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className={`px-6 py-5 rounded-t-3xl ${isEdit ? 'bg-blue-500' : 'bg-green-600'}`}>
          <div className="flex items-center justify-between">
            <div className="text-white">
              <p className="text-base font-bold">{isEdit ? '✏️ Edit Goal' : '🎯 Create New Goal'}</p>
              <p className="text-xs opacity-80 mt-0.5">
                {isEdit ? 'Update your sustainability target' : 'Define a clear emission reduction target'}
              </p>
            </div>
            <button onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-xl bg-white/20 hover:bg-white/30 text-white transition-colors text-lg">
              ✕
            </button>
          </div>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-5">
          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Goal Title *</label>
            <input type="text" placeholder="e.g., Bike to work 3 times a week"
              value={form.goalTitle} onChange={e => setForm(f => ({ ...f, goalTitle: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-200 rounded-2xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-400 bg-gray-50" />
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Category</label>
            <div className="flex gap-2 flex-wrap">
              {CATEGORIES.map(c => (
                <button key={c.key} type="button" onClick={() => setForm(f => ({ ...f, category: c.key }))}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-semibold transition-all ${
                    form.category === c.key
                      ? 'border-green-500 bg-green-50 text-green-700 shadow-sm'
                      : 'border-gray-200 text-gray-500 hover:border-gray-300 bg-white'
                  }`}>
                  <span>{c.icon}</span>{c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Target + Timeframe */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Target (kg CO₂)</label>
              <input type="number" min="0" step="0.01" placeholder="e.g. 5.00"
                value={form.targetEmission} onChange={e => setForm(f => ({ ...f, targetEmission: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-200 rounded-2xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-400 bg-gray-50" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Timeframe</label>
              <select value={form.timeframe} onChange={e => setForm(f => ({ ...f, timeframe: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-200 rounded-2xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-400 bg-gray-50">
                {['Next 7 Days', 'Next 30 Days', 'Next 90 Days', 'Next 6 Months'].map(t => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Reduction slider */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Reduction Target</label>
              <span className="text-sm font-black text-green-600">{form.reductionTarget}%</span>
            </div>
            <input type="range" min="1" max="100" value={form.reductionTarget}
              onChange={e => setForm(f => ({ ...f, reductionTarget: parseInt(e.target.value) }))}
              className="w-full accent-green-500" />
            <div className="flex justify-between text-xs text-gray-300 mt-1"><span>1%</span><span>100%</span></div>
          </div>

          {/* Recurrence */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Recurrence</label>
            <div className="flex gap-2 flex-wrap">
              {RECURRENCE.map(r => (
                <button key={r} type="button" onClick={() => setForm(f => ({ ...f, recurrence: r }))}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all capitalize ${
                    form.recurrence === r
                      ? 'bg-green-500 text-white shadow-sm'
                      : 'border border-gray-200 text-gray-500 hover:border-gray-300 bg-white'
                  }`}>
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
              Description <span className="text-gray-300 font-normal normal-case">(optional)</span>
            </label>
            <textarea rows={2} placeholder="Detail the specific actions you'll take..."
              value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-200 rounded-2xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-400 resize-none bg-gray-50" />
          </div>

          {/* Live preview */}
          {form.goalTitle && (
            <div className="flex items-center gap-3 p-4 rounded-2xl border"
              style={{ background: meta.light, borderColor: meta.solid + '40' }}>
              <span className="text-2xl">{meta.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold truncate" style={{ color: meta.text }}>{form.goalTitle}</p>
                <p className="text-xs mt-0.5" style={{ color: meta.text, opacity: 0.7 }}>
                  {form.targetEmission || '—'} kg · {form.timeframe} · {form.reductionTarget}% reduction
                </p>
              </div>
            </div>
          )}

          {error && (
            <p className="text-xs text-red-600 bg-red-50 px-4 py-3 rounded-2xl border border-red-100">{error}</p>
          )}

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 py-3 border border-gray-200 text-gray-600 text-sm font-semibold rounded-2xl hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={saving}
              className={`flex-1 py-3 text-white text-sm font-bold rounded-2xl transition-all disabled:opacity-60 shadow-sm ${
                isEdit ? 'bg-blue-500 hover:bg-blue-600' : 'bg-green-600 hover:bg-green-700'
              }`}>
              {saving ? (isEdit ? 'Saving…' : 'Creating…') : (isEdit ? 'Save Changes' : 'Create Goal')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Main Goals Page ──────────────────────────────────────────────────────────
export default function Goals() {
  const [goals, setGoals]             = useState([])
  const [loading, setLoading]         = useState(true)
  const [filter, setFilter]           = useState('all')
  const [showModal, setShowModal]     = useState(false)
  const [editingGoal, setEditingGoal] = useState(null)

  const fetchGoals = () => {
    setLoading(true)
    api.get('/api/goals').then(r => setGoals(r.data || [])).finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchGoals()
    const onFocus = () => fetchGoals()
    window.addEventListener('focus', onFocus)
    return () => window.removeEventListener('focus', onFocus)
  }, [])

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this goal?')) return
    try { await api.delete(`/api/goals/${id}`); setGoals(p => p.filter(g => g.id !== id)) }
    catch { alert('Failed to delete goal.') }
  }

  const openEdit   = (goal) => { setEditingGoal(goal); setShowModal(true) }
  const openCreate = ()     => { setEditingGoal(null); setShowModal(true) }
  const closeModal = ()     => { setShowModal(false); setEditingGoal(null) }

  const active      = goals.filter(g => g.status === 'ACTIVE')
  const achieved    = goals.filter(g => g.status === 'ACHIEVED')
  const filtered    = filter === 'active' ? active : filter === 'achieved' ? achieved : goals
  const achievedPct = goals.length > 0 ? Math.round((achieved.length / goals.length) * 100) : 0

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Clean white header ── */}
      <div className="bg-white border-b border-gray-100 px-6 py-5">
        <div className="max-w-6xl mx-auto">

          {/* Title + button */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">My Goals</h1>
              <p className="text-sm text-gray-400 mt-0.5">Track your emission reduction targets</p>
            </div>
            <button onClick={openCreate}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold text-sm px-5 py-2.5 rounded-xl shadow-sm transition-colors">
              <Plus size={15} /> New Goal
            </button>
          </div>

          {/* Stat cards — centered text */}
          {goals.length > 0 && (
            <div className="grid grid-cols-4 gap-3">
              {[
                { label: 'Total Goals',  value: goals.length,      icon: '🎯', bg: 'bg-gray-50',   num: 'text-gray-800'  },
                { label: 'Active',       value: active.length,     icon: '⏳', bg: 'bg-amber-50',  num: 'text-amber-700' },
                { label: 'Achieved',     value: achieved.length,   icon: '✅', bg: 'bg-green-50',  num: 'text-green-700' },
                { label: 'Success Rate', value: `${achievedPct}%`, icon: '📈', bg: 'bg-blue-50',   num: 'text-blue-700'  },
              ].map(s => (
                <div key={s.label}
                  className={`${s.bg} rounded-2xl px-4 py-4 flex flex-col items-center justify-center text-center gap-1`}>
                  <span className="text-2xl">{s.icon}</span>
                  <p className={`text-2xl font-black leading-none ${s.num}`}>{s.value}</p>
                  <p className="text-xs text-gray-500">{s.label}</p>
                </div>
              ))}
            </div>
          )}

          {/* Filter tabs */}
          {goals.length > 0 && (
            <div className="flex items-center gap-1 mt-4 bg-gray-100 rounded-xl p-1 w-fit">
              {[
                { key: 'all',      label: 'All',      count: goals.length },
                { key: 'active',   label: 'Active',   count: active.length },
                { key: 'achieved', label: 'Achieved', count: achieved.length },
              ].map(t => (
                <button key={t.key} onClick={() => setFilter(t.key)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                    filter === t.key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                  }`}>
                  {t.label}
                  <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${
                    filter === t.key ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'
                  }`}>{t.count}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Body ── */}
      <div className="max-w-6xl mx-auto px-6 py-6">

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-green-500 border-t-transparent" />
            <p className="text-sm text-gray-400">Loading your goals…</p>
          </div>

        ) : goals.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-green-50 border border-green-100 rounded-3xl flex items-center justify-center mx-auto mb-5">
              <span className="text-4xl">🎯</span>
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">No goals yet</h2>
            <p className="text-gray-400 text-sm max-w-sm mx-auto mb-7 leading-relaxed">
              Start your sustainability journey by setting your first emission reduction goal.
            </p>
            <button onClick={openCreate}
              className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold px-7 py-3 rounded-xl shadow-sm transition-colors">
              <Plus size={15} /> Create Your First Goal
            </button>
            <div className="grid grid-cols-3 gap-4 mt-10 max-w-xl mx-auto">
              {[
                { icon: '🚗', title: 'Transport Goal', desc: 'Reduce car usage by switching to cycling or public transit', bg: 'bg-orange-50', border: 'border-orange-100' },
                { icon: '🍽️', title: 'Food Goal',      desc: 'Cut food emissions with more plant-based meals each week',  bg: 'bg-pink-50',   border: 'border-pink-100' },
                { icon: '⚡', title: 'Energy Goal',    desc: 'Lower home energy use with smart habits and renewables',    bg: 'bg-yellow-50', border: 'border-yellow-100' },
              ].map(c => (
                <div key={c.title}
                  className={`${c.bg} border ${c.border} rounded-2xl p-4 text-center cursor-pointer hover:shadow-md transition-all`}
                  onClick={openCreate}>
                  <span className="text-3xl block mb-2">{c.icon}</span>
                  <p className="text-xs font-bold text-gray-700 mb-1">{c.title}</p>
                  <p className="text-xs text-gray-500 leading-relaxed">{c.desc}</p>
                </div>
              ))}
            </div>
          </div>

        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <span className="text-4xl block mb-3">🔍</span>
            <p className="text-gray-500 font-semibold text-sm">No goals in this filter</p>
            <button onClick={() => setFilter('all')} className="mt-3 text-sm text-green-600 font-bold hover:underline">
              Show all goals
            </button>
          </div>

        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map(goal => (
                <GoalCard
                  key={goal.id}
                  goal={goal}
                  onDelete={handleDelete}
                  onEdit={openEdit}
                />
              ))}
            </div>

          </>
        )}

        {/* Eco tips */}
        {goals.length > 0 && (
          <div className="mt-6 grid grid-cols-3 gap-3">
            {[
              { icon: '🚗', bg: 'bg-orange-50', border: 'border-orange-100', tc: 'text-orange-700', tip: 'Switching to public transit can cut transport emissions by up to 70%.' },
              { icon: '🍽️', bg: 'bg-pink-50',   border: 'border-pink-100',   tc: 'text-pink-700',   tip: 'One plant-based meal per day saves ~180 kg CO₂ over a year.' },
              { icon: '⚡', bg: 'bg-yellow-50', border: 'border-yellow-100', tc: 'text-yellow-700', tip: 'LED bulbs and unplugging idle devices reduce home energy by 10–15%.' },
            ].map((t, i) => (
              <div key={i} className={`${t.bg} border ${t.border} rounded-2xl p-4 text-center`}>
                <span className="text-2xl block mb-2">{t.icon}</span>
                <p className="text-xs text-gray-600 leading-relaxed">
                  <span className={`font-bold ${t.tc}`}>Tip: </span>{t.tip}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <GoalModal editGoal={editingGoal} onClose={closeModal} onSaved={fetchGoals} />
      )}
    </div>
  )
}
