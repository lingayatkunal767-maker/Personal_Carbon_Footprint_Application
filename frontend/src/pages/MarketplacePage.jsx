import React, { useEffect, useState } from 'react';
import { ShoppingCart } from 'lucide-react';
import { getMarketplaceItems } from '../services/marketplaceService';
import { purchaseItem, getUserMarketplaceStats } from '../services/transactionService';
import { apiFetch } from '../utils/api';
import MarketplaceCard from '../components/MarketplaceCard';
import LoadingSpinner from '../components/LoadingSpinner';

const MarketplacePage = () => {
  const [items, setItems] = useState([]);
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({ totalProducts: 0, totalInvested: 0, totalOffset: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [purchaseLoading, setPurchaseLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const categories = ["All", "Carbon Offset", "Renewable Energy", "Environmental", "Sustainable Living"];

  const loadData = async () => {
    try {
      setLoading(true);
      const currentUser = await apiFetch("/api/users/me");
      setUser(currentUser);
      
      const [marketItems, userStats] = await Promise.all([
        getMarketplaceItems(),
        getUserMarketplaceStats(currentUser.id).catch(() => ({ totalProducts: 0, totalInvested: 0, totalOffset: 0 }))
      ]);
      
      setItems(marketItems || []);
      setStats(userStats);
    } catch (err) {
      if (err.status === 401) window.location.href = "/login";
      setError(err.message || "Failed to load marketplace.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handlePurchase = async (item) => {
    if (!user || purchaseLoading) return;
    try {
      setPurchaseLoading(true);
      const amount = item.itemPrice || item.price;
      await purchaseItem(user.id, item.id, amount);
      // Refresh stats
      const newStats = await getUserMarketplaceStats(user.id);
      setStats(newStats);
      // Optional: Add a toast notification here
      alert(`Successfully purchased ${item.itemName}!`);
    } catch (err) {
      alert("Failed to purchase item: " + (err.message || "Unknown error"));
    } finally {
      setPurchaseLoading(false);
    }
  };

  const filteredItems = items.filter(item => {
    const matchesSearch = item.itemName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === "All" || 
                            (item.category && item.category.toUpperCase() === activeCategory.toUpperCase());
    return matchesSearch && matchesCategory;
  }).sort((a, b) => a.itemName.localeCompare(b.itemName));

  if (loading) return <LoadingSpinner message="Browsing the eco marketplace..." />;

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      {/* Premium Header */}
      <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 mb-8 border border-gray-100 shadow-sm flex flex-col lg:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-green-50 rounded-2xl">
            <ShoppingCart className="w-8 h-8 text-green-600" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900">Eco Marketplace</h1>
            <p className="text-gray-500 mt-1">Offset your carbon footprint by supporting verified initiatives.</p>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-4 justify-center">
          <div className="bg-white border border-gray-100 rounded-2xl px-6 py-4 text-center shadow-sm w-36">
            <div className="text-2xl font-black text-gray-900">{stats.totalProducts}</div>
            <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Products</div>
          </div>
          <div className="bg-white border border-gray-100 rounded-2xl px-6 py-4 text-center shadow-sm w-44">
            <div className="text-2xl font-black text-green-600">{stats.totalOffset}</div>
            <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">KG CO₂ Offset</div>
          </div>
          <div className="bg-white border border-gray-100 rounded-2xl px-6 py-4 text-center shadow-sm w-44">
            <div className="text-2xl font-black text-blue-600">₹{stats.totalInvested}</div>
            <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Total Invested</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-4 mb-8">
        <input 
          type="text" 
          placeholder="Search eco initiatives..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full lg:w-1/3 px-6 py-4 rounded-full border-2 border-gray-100 bg-white focus:outline-none focus:border-green-500 transition-colors text-gray-700 font-medium shadow-sm"
        />
        <div className="flex gap-3 overflow-x-auto w-full lg:w-auto pb-2 lg:pb-0 hide-scrollbar">
          {categories.map(cat => (
            <button 
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-5 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all duration-200 ${
                activeCategory === cat 
                  ? 'bg-green-700 text-white shadow-md scale-105' 
                  : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {error ? (
        <div className="bg-red-50 text-red-700 p-4 rounded-xl text-center shadow-sm border border-red-100">{error}</div>
      ) : filteredItems.length === 0 ? (
        <div className="text-center py-20 bg-white/50 rounded-3xl border-2 border-dashed border-gray-200">
          <p className="text-gray-500 font-medium">No marketplace items found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredItems.map(item => (
            <MarketplaceCard key={item.id} item={item} onPurchase={handlePurchase} />
          ))}
        </div>
      )}
    </div>
  );
};

export default MarketplacePage;
