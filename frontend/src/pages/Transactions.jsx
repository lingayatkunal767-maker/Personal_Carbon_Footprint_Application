import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'

const TYPE_ICON = {
  'Carbon Offset': '🌳',
  'Renewable Energy': '⚡',
  'Environmental Contribution': '🌍',
  'Tree Plantation': '🌱',
}

export default function Transactions() {
  const navigate = useNavigate()
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    api.get('/api/transactions/my')
      .then(r => setTransactions(r.data || []))
      .catch(err => {
        console.error('Transactions fetch failed:', err)
        setError('Failed to load transactions. Please try again.')
      })
      .finally(() => setLoading(false))
  }, [])

  const totalOffset = transactions.reduce((sum, t) => sum + (t.carbonOffsetValue ?? 0), 0)
  const totalSpent = transactions.reduce((sum, t) => sum + (t.amount ?? 0), 0)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100 px-8 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">My Purchases</h1>
          <p className="text-xs text-gray-400 mt-0.5">Your eco contribution history.</p>
        </div>
        <button onClick={() => navigate('/marketplace')}
          className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white text-sm font-semibold rounded-xl transition-colors">
          Browse Marketplace
        </button>
      </div>

      <div className="p-6 max-w-4xl mx-auto">
        {/* Summary cards */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <p className="text-xs text-gray-400 mb-1">Total CO₂ Offset</p>
            <p className="text-2xl font-bold text-green-600">{totalOffset.toFixed(1)} <span className="text-sm font-normal text-gray-400">kg</span></p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <p className="text-xs text-gray-400 mb-1">Total Contributed</p>
            <p className="text-2xl font-bold text-gray-900">₹{totalSpent.toFixed(0)}</p>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-5 py-4 mb-5 text-sm">{error}</div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-9 w-9 border-4 border-green-500 border-t-transparent" />
          </div>
        ) : transactions.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 text-center">
            <span className="text-5xl block mb-3">🛒</span>
            <p className="font-medium text-gray-500">No purchases yet.</p>
            <p className="text-sm text-gray-400 mt-1 mb-5">Visit the marketplace to offset your carbon footprint.</p>
            <button onClick={() => navigate('/marketplace')}
              className="bg-green-500 text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-green-600 transition-colors">
              Go to Marketplace
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead className="border-b border-gray-100">
                <tr>
                  {['Item', 'Type', 'CO₂ Offset', 'Amount', 'Date', 'Status'].map((h, i) => (
                    <th key={h} className={`py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider ${i >= 2 ? 'text-right' : 'text-left'}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {transactions.map(t => (
                  <tr key={t.id} className="border-b border-gray-50 hover:bg-gray-50/60 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span>{TYPE_ICON[t.itemType] ?? '♻️'}</span>
                        <span className="font-medium text-gray-800">{t.itemName}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-green-50 text-green-700 font-medium">{t.itemType}</span>
                    </td>
                    <td className="py-3 px-4 text-right font-semibold text-green-600">{t.carbonOffsetValue} kg</td>
                    <td className="py-3 px-4 text-right font-bold text-gray-900">₹{t.amount}</td>
                    <td className="py-3 px-4 text-right text-gray-400 text-xs">
                      {new Date(t.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 font-medium">{t.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
