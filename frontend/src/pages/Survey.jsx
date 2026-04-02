import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Car, ClipboardList, Zap, CheckCircle, AlertCircle } from '../components/Icons'
import api from '../services/api'

const INITIAL = {
  transport: '', distanceKm: '', fuelType: '',
  food: '', mealsPerDay: 3, eatingOutFrequency: '',
  energy: '', renewableEnergy: false,
}

const TRANSPORT_OPTS = [
  { value: 'car', label: '🚗 Car' },
  { value: 'bus', label: '🚌 Bus' },
  { value: 'public_transport', label: '🚇 Public Transport' },
  { value: 'bike', label: '🚲 Bike' },
  { value: 'walk', label: '🚶 Walk' },
  { value: 'wfh', label: '🏠 Work From Home' },
]
const FUEL_OPTS = [
  { value: 'petrol', label: '⛽ Petrol' },
  { value: 'diesel', label: '🛢️ Diesel' },
  { value: 'electric', label: '⚡ Electric' },
  { value: 'hybrid', label: '🔋 Hybrid' },
]
const FOOD_OPTS = [
  { value: 'vegan', label: '🥦 Vegan' },
  { value: 'vegetarian', label: '🥗 Vegetarian' },
  { value: 'non-vegetarian', label: '🍖 Non-Vegetarian' },
]
const EATING_OUT_OPTS = [
  { value: 'never', label: 'Never' },
  { value: 'rarely', label: 'Rarely (1-2x/month)' },
  { value: 'sometimes', label: 'Sometimes (1-2x/week)' },
  { value: 'often', label: 'Often (3-4x/week)' },
  { value: 'daily', label: 'Daily' },
]

const TIPS = [
  { icon: '🚲', text: 'Cycling or walking for short trips can cut transport emissions by up to 100%.' },
  { icon: '🥦', text: 'A plant-based diet produces ~50% less CO₂ than a meat-heavy diet.' },
  { icon: '💡', text: 'Switching to LED bulbs and energy-efficient appliances reduces home energy use significantly.' },
  { icon: '☀️', text: 'Renewable energy sources like solar can eliminate your home energy carbon footprint.' },
  { icon: '🚌', text: 'Using public transport instead of a car reduces per-person emissions by up to 70%.' },
]

const selectCls = "w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent"
const inputCls  = "w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent"

function Field({ label, hint, children }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">{label}</label>
      {children}
      {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
    </div>
  )
}

function SectionHeader({ icon, title, subtitle }) {
  return (
    <div className="flex items-center gap-3 mb-5 pb-4 border-b border-gray-100">
      <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-green-50 shrink-0">
        {icon}
      </div>
      <div>
        <h2 className="text-sm font-bold text-gray-800">{title}</h2>
        <p className="text-xs text-gray-400">{subtitle}</p>
      </div>
    </div>
  )
}

export default function Survey() {
  const [form, setForm] = useState(INITIAL)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(null)
  const navigate = useNavigate()

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const validate = () => {
    if (!form.transport) return 'Please select a transport mode.'
    if (form.transport === 'car' && !form.fuelType) return 'Please select a fuel type for car.'
    if (!form.food) return 'Please select a diet type.'
    if (!form.eatingOutFrequency) return 'Please select eating out frequency.'
    if (!form.energy || parseFloat(form.energy) < 0) return 'Please enter a valid energy usage.'
    return null
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const err = validate()
    if (err) { setError(err); return }
    setLoading(true); setError('')
    try {
      const payload = {
        transport: form.transport,
        distanceKm: form.distanceKm ? parseFloat(form.distanceKm) : null,
        fuelType: form.transport === 'car' ? form.fuelType : null,
        food: form.food,
        mealsPerDay: parseInt(form.mealsPerDay),
        eatingOutFrequency: form.eatingOutFrequency,
        energy: parseFloat(form.energy),
        renewableEnergy: form.renewableEnergy,
      }
      const res = await api.post('/api/survey', payload)
      setSuccess(res.data)
      setForm(INITIAL)
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data || 'Submission failed.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-2xl border border-green-200 shadow-sm p-10 text-center">
            <div className="flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mx-auto mb-5">
              <CheckCircle size={40} className="text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Footprint Calculated!</h2>
            <p className="text-gray-500 text-sm mb-8">Your carbon footprint has been recorded successfully.</p>
            <div className="grid grid-cols-3 gap-4 mb-6">
              {[
                { label: 'Transport', value: success.transportEmission, color: 'bg-orange-50 text-orange-700', icon: '🚗' },
                { label: 'Food', value: success.foodEmission, color: 'bg-rose-50 text-rose-700', icon: '🍽️' },
                { label: 'Energy', value: success.energyEmission, color: 'bg-yellow-50 text-yellow-700', icon: '⚡' },
              ].map(({ label, value, color, icon }) => (
                <div key={label} className={`rounded-2xl p-5 ${color}`}>
                  <p className="text-2xl mb-2">{icon}</p>
                  <p className="text-xs font-semibold mb-1 uppercase tracking-wide">{label}</p>
                  <p className="text-2xl font-bold">{value?.toFixed(2)}</p>
                  <p className="text-xs mt-0.5">kg CO₂</p>
                </div>
              ))}
            </div>
            <div className="bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-2xl p-6 mb-8">
              <p className="text-sm font-medium mb-1 opacity-80">Total Carbon Score</p>
              <p className="text-4xl font-bold">{success.carbonScore?.toFixed(2)} <span className="text-lg font-normal opacity-80">kg CO₂</span></p>
            </div>
            <div className="flex gap-3 justify-center">
              <button onClick={() => setSuccess(null)} className="px-8 py-3 border border-gray-200 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors">
                Add Another
              </button>
              <button onClick={() => navigate('/goals')} className="px-8 py-3 border border-green-200 text-green-700 rounded-xl text-sm font-semibold hover:bg-green-50 transition-colors">
                View Goals
              </button>
              <button onClick={() => navigate('/dashboard')} className="px-8 py-3 bg-green-600 text-white rounded-xl text-sm font-semibold hover:bg-green-700 transition-colors">
                View Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Lifestyle Assessment</h1>
        <p className="text-sm text-gray-500 mt-1">Answer a few questions about your daily habits to calculate your personal carbon footprint.</p>
      </div>

      {error && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 mb-5 text-sm">
          <AlertCircle size={16} className="shrink-0" /> {error}
        </div>
      )}

      <div className="grid grid-cols-3 gap-6">
        {/* Main Form — 2 columns wide */}
        <div className="col-span-2">
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Transport */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <SectionHeader
                icon={<Car size={20} className="text-green-600" />}
                title="Transport Information"
                subtitle="How do you get around on a daily basis?"
              />
              <div className="grid grid-cols-2 gap-4">
                <Field label="Primary Mode of Transport">
                  <select value={form.transport} onChange={e => set('transport', e.target.value)} className={selectCls}>
                    <option value="">Select mode...</option>
                    {TRANSPORT_OPTS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </Field>
                <Field label="Average Daily Distance" hint="Leave blank to use default (10 km)">
                  <div className="relative">
                    <input type="number" min="0" step="0.1" placeholder="e.g. 15" value={form.distanceKm}
                      onChange={e => set('distanceKm', e.target.value)} className={inputCls + ' pr-12'} />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-gray-400">km</span>
                  </div>
                </Field>
                {form.transport === 'car' && (
                  <Field label="Fuel Type">
                    <select value={form.fuelType} onChange={e => set('fuelType', e.target.value)} className={selectCls}>
                      <option value="">Select fuel...</option>
                      {FUEL_OPTS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                    </select>
                  </Field>
                )}
              </div>
            </div>

            {/* Food */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <SectionHeader
                icon={<ClipboardList size={20} className="text-green-600" />}
                title="Food & Diet Information"
                subtitle="What does your typical plate look like?"
              />
              <div className="grid grid-cols-2 gap-4">
                <Field label="Diet Type">
                  <select value={form.food} onChange={e => set('food', e.target.value)} className={selectCls}>
                    <option value="">Select diet...</option>
                    {FOOD_OPTS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </Field>
                <Field label="Meals Per Day">
                  <input type="number" min="1" max="10" value={form.mealsPerDay}
                    onChange={e => set('mealsPerDay', e.target.value)} className={inputCls} />
                </Field>
                <Field label="How Often Do You Eat Outside?" className="col-span-2">
                  <select value={form.eatingOutFrequency} onChange={e => set('eatingOutFrequency', e.target.value)} className={selectCls}>
                    <option value="">Select frequency...</option>
                    {EATING_OUT_OPTS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </Field>
              </div>
            </div>

            {/* Energy */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <SectionHeader
                icon={<Zap size={20} className="text-green-600" />}
                title="Home Energy Usage"
                subtitle="Understanding your utility footprint."
              />
              <div className="grid grid-cols-2 gap-4">
                <Field label="Monthly Electricity Usage">
                  <div className="relative">
                    <input type="number" min="0" step="1" placeholder="e.g. 220" value={form.energy}
                      onChange={e => set('energy', e.target.value)} className={inputCls + ' pr-14'} />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-gray-400">kWh</span>
                  </div>
                </Field>
                <Field label="Renewable Energy Source" hint="Solar panels or green energy provider?">
                  <div className="flex items-center gap-3 mt-1">
                    <button type="button" onClick={() => set('renewableEnergy', !form.renewableEnergy)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${form.renewableEnergy ? 'bg-green-600' : 'bg-gray-200'}`}>
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${form.renewableEnergy ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                    <span className="text-sm text-gray-600">{form.renewableEnergy ? '✅ Yes, I use renewable energy' : 'No'}</span>
                  </div>
                </Field>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <button type="button" onClick={() => navigate('/dashboard')}
                className="px-5 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              <button type="submit" disabled={loading}
                className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white font-semibold py-2.5 px-6 rounded-xl transition-all hover:-translate-y-0.5 hover:shadow-md text-sm">
                {loading
                  ? <><div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" /> Calculating...</>
                  : <><CheckCircle size={15} /> Calculate My Carbon Footprint</>}
              </button>
            </div>
          </form>
        </div>

        {/* Right Panel */}
        <div className="space-y-5">
          {/* Emission Categories */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="text-sm font-bold text-gray-900 mb-4">What We Measure</h3>
            <div className="space-y-3">
              {[
                { icon: '🚗', label: 'Transport', desc: 'Vehicle type, distance, fuel', color: 'bg-orange-50 text-orange-600' },
                { icon: '🍽️', label: 'Food & Diet', desc: 'Diet type, meals, eating habits', color: 'bg-rose-50 text-rose-600' },
                { icon: '⚡', label: 'Home Energy', desc: 'Electricity usage, renewables', color: 'bg-yellow-50 text-yellow-600' },
              ].map(({ icon, label, desc, color }) => (
                <div key={label} className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg shrink-0 ${color}`}>{icon}</div>
                  <div>
                    <p className="text-xs font-semibold text-gray-800">{label}</p>
                    <p className="text-xs text-gray-400">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Eco Tips */}
          <div className="bg-green-50 rounded-2xl border border-green-100 p-5">
            <h3 className="text-sm font-bold text-green-800 mb-3">💡 Eco Tips</h3>
            <div className="space-y-3">
              {TIPS.map((tip, i) => (
                <div key={i} className="flex gap-2.5">
                  <span className="text-base shrink-0">{tip.icon}</span>
                  <p className="text-xs text-green-700 leading-relaxed">{tip.text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Average Benchmarks */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="text-sm font-bold text-gray-900 mb-3">🌍 Global Benchmarks</h3>
            <div className="space-y-2.5">
              {[
                { label: 'World Average', value: '4,800 kg/yr', bar: 80, color: 'bg-red-400' },
                { label: 'India Average', value: '1,900 kg/yr', bar: 32, color: 'bg-yellow-400' },
                { label: 'Sustainable Target', value: '2,000 kg/yr', bar: 33, color: 'bg-green-500' },
              ].map(({ label, value, bar, color }) => (
                <div key={label}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-600">{label}</span>
                    <span className="font-semibold text-gray-800">{value}</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-1.5">
                    <div className={`h-1.5 rounded-full ${color}`} style={{ width: `${bar}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
