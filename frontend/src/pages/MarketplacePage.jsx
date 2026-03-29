import React, { useEffect, useState } from 'react';
import { getMarketplaceItems } from '../services/marketplaceService';
import MarketplaceCard from '../components/MarketplaceCard';
import LoadingSpinner from '../components/LoadingSpinner';

const MarketplacePage = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const data = await getMarketplaceItems();
        setItems(data || []);
      } catch (err) {
        setError(err.message || "Failed to load marketplace items.");
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
  }, []);

  if (loading) return <LoadingSpinner message="Browsing the eco marketplace..." />;

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-extrabold text-green-900 sm:text-5xl">
          Eco Marketplace
        </h1>
        <p className="mt-4 text-xl text-green-700 max-w-2xl mx-auto">
          Support verified sustainable projects and offset your carbon footprint with just a few clicks.
        </p>
      </div>

      {error ? (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-xl shadow-sm max-w-lg mx-auto">
          <div className="flex">
            <div className="flex-shrink-0">
              <span className="text-red-400 text-xl">⚠️</span>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700 font-medium">{error}</p>
            </div>
          </div>
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-20 bg-white/50 rounded-3xl border-2 border-dashed border-green-200">
          <span className="text-6xl block mb-4">🍃</span>
          <p className="text-green-800 text-lg font-medium">The marketplace is currently quiet. Check back soon for new actions!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {items.map(item => (
            <MarketplaceCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
};

export default MarketplacePage;
