import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'

const TYPE_ICON = {
  'Carbon Offset': '🌳',
  'Renewable Energy': '⚡',
  'Environmental Contribution': '🌍',
  'Tree Plantation': '🌱',
}

function ItemCard({ item, onBuy }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col gap-3 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <span className="text-3xl">{TYPE_ICON[item.itemType] ?? '♻️'}</span>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-green-50 text-green-700">{item.itemType}</span>
      </div>
      <div>
        <h3 className="text-sm font-bold text-gray-900">{item.itemName}</h3>
        <p className="text-xs text-gray-400 mt-1 leading-relaxed">{item.description}</p>
      </div>
      <div className="flex items-center justify-between text-xs text-gray-500 border-t border-gray-50 pt-3">
        <span>Offsets <span className="font-semibold text-green-600">{item.carbonOffsetValue} kg CO₂</span></span>
        <span className="text-base font-bold text-gray-900">₹{item.price}</span>
      </div>
      <button
        onClick={() => onBuy(item)}
        className="w-full bg-green-500 hover:bg-green-600 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors"
      >
        Buy Now
      </button>
    </div>
  )
}

function ConfirmModal({ item, onConfirm, onCancel, loading }) {
  if (!item) return null
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full">
        <div className="text-center mb-4">
          <span className="text-4xl block mb-2">{TYPE_ICON[item.itemType] ?? '♻️'}</span>
          <h2 className="text-base font-bold text-gray-900">Confirm Purchase</h2>
          <p className="text-sm text-gray-500 mt-1">{item.itemName}</p>
        </div>
        <div className="bg-gray-50 rounded-xl p-4 mb-4 space-y-2 text-sm">
          <div className="flex justify-between"><span className="text-gray-500">Amount</span><span className="font-bold text-gray-900">₹{item.price}</span></div>
          <div className="flex justify-between"><span className="text-gray-500">CO₂ Offset</span><span className="font-semibold text-green-600">{item.carbonOffsetValue} kg</span></div>
        </div>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50">Cancel</button>
          <button onClick={onConfirm} disabled={loading}
            className="flex-1 py-2.5 bg-green-500 hover:bg-green-600 text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-60">
            {loading ? 'Processing...' : 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  )
}

function SuccessModal({ tx, onClose }) {
  if (!tx) return null
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full text-center">
        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-green-500 mx-auto mb-4">
          <span className="text-white text-2xl">✓</span>
        </div>
        <h2 className="text-base font-bold text-gray-900 mb-1">Purchase Successful!</h2>
        <p className="text-sm text-gray-500 mb-4">Thank you for supporting sustainability.</p>
        <div className="bg-green-50 rounded-xl p-4 mb-4 space-y-1 text-sm text-left">
          <div className="flex justify-between"><span className="text-gray-500">Item</span><span className="font-semibold text-gray-800">{tx.itemName}</span></div>
          <div className="flex justify-between"><span className="text-gray-500">Amount</span><span className="font-bold text-gray-900">₹{tx.amount}</span></div>
          <div className="flex justify-between"><span className="text-gray-500">CO₂ Offset</span><span className="font-semibold text-green-600">{tx.carbonOffsetValue} kg</span></div>
        </div>
        <button onClick={onClose} className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2.5 rounded-xl transition-colors">
          Continue Shopping
        </button>
      </div>
    </div>
  )
}

export default function Marketplace() {
  const navigate = useNavigate()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedItem, setSelectedItem] = useState(null)
  const [buying, setBuying] = useState(false)
  const [successTx, setSuccessTx] = useState(null)
  const [filter, setFilter] = useState('All')

  useEffect(() => {
    api.get('/api/marketplace')
      .then(r => setItems(r.data || []))
      .finally(() => setLoading(false))
  }, [])

  const types = ['All', ...new Set(items.map(i => i.itemType))]
  const filtered = filter === 'All' ? items : items.filter(i => i.itemType === filter)

  const handleBuy = async () => {
    if (!selectedItem) return
    setBuying(true)
    try {
      const res = await api.post(`/api/transactions/${selectedItem.id}`)
      setSuccessTx(res.data)
      setSelectedItem(null)
    } catch {
      alert('Purchase failed. Please try again.')
    } finally {
      setBuying(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-8 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Eco Marketplace</h1>
          <p className="text-xs text-gray-400 mt-0.5">Offset your carbon footprint through eco-friendly actions.</p>
        </div>
        <button onClick={() => navigate('/transactions')}
          className="px-4 py-2 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
          My Purchases
        </button>
      </div>

      <div className="p-6 max-w-6xl mx-auto">
        {/* Filter tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {types.map(t => (
            <button key={t} onClick={() => setFilter(t)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-colors ${filter === t ? 'bg-green-500 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-green-300'}`}>
              {t}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-9 w-9 border-4 border-green-500 border-t-transparent" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <span className="text-5xl block mb-3">🌿</span>
            <p className="font-medium">No items available yet.</p>
            <p className="text-sm mt-1">Check back soon for eco-friendly actions.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(item => (
              <ItemCard key={item.id} item={item} onBuy={setSelectedItem} />
            ))}
          </div>
        )}
      </div>

      <ConfirmModal item={selectedItem} onConfirm={handleBuy} onCancel={() => setSelectedItem(null)} loading={buying} />
      <SuccessModal tx={successTx} onClose={() => setSuccessTx(null)} />
    </div>
  )
}
