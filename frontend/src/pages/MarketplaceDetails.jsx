import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getMarketplaceItem } from '../services/marketplaceService';
import { purchaseItem } from '../services/transactionService';
import LoadingSpinner from '../components/LoadingSpinner';

const MarketplaceDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const data = await getMarketplaceItem(id);
        setItem(data);
      } catch (err) {
        setError(err.message || "Failed to load item details.");
      } finally {
        setLoading(false);
      }
    };
    fetchItem();
  }, [id]);

  const handlePurchase = async () => {
    setPurchasing(true);
    try {
      const result = await purchaseItem(id);
      navigate('/purchase-success', { state: { item, transaction: result } });
    } catch (err) {
      setError(err.message || "Purchase failed. Please try again.");
      setPurchasing(false);
    }
  };

  if (loading) return <LoadingSpinner message="Fetching eco-action details..." />;

  if (!item && !error) return (
    <div className="text-center py-20">
      <p className="text-gray-500 italic">Item not found.</p>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      {error && !purchasing && (
        <div className="bg-red-50 border-red-200 border p-4 rounded-xl mb-6 text-red-700 text-sm font-medium">
          {error}
        </div>
      )}

      <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-green-50">
        <div className="bg-gradient-to-r from-green-600 to-green-800 p-8 text-white">
          <div className="flex justify-between items-center mb-4">
            <button 
              onClick={() => navigate('/marketplace')}
              className="text-white/80 hover:text-white flex items-center gap-1 text-sm font-medium group"
            >
              <span className="group-hover:-translate-x-1 transition-transform">←</span> Back to Marketplace
            </button>
            <span className="bg-white/20 backdrop-blur-sm text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">
              Verified Project
            </span>
          </div>
          <h1 className="text-4xl font-bold uppercase tracking-tight">{item.name}</h1>
        </div>

        <div className="p-8 md:p-12">
          <div className="grid md:grid-cols-3 gap-12">
            <div className="md:col-span-2 space-y-8">
              <section>
                <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">About this Action</h2>
                <p className="text-gray-800 leading-relaxed text-lg">
                  {item.description || "Learn how this action contributes to a greener planet. Detailed information coming soon."}
                </p>
              </section>

              <div className="grid grid-cols-2 gap-6 pt-6 border-t border-gray-100">
                <div className="p-4 bg-green-50 rounded-2xl border border-green-100">
                  <p className="text-[10px] font-bold text-green-600 uppercase mb-1">Impact</p>
                  <p className="text-2xl font-black text-green-900">{item.carbonOffset} <span className="text-sm font-medium">kg CO₂</span></p>
                </div>
                <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100">
                  <p className="text-[10px] font-bold text-blue-600 uppercase mb-1">Price</p>
                  <p className="text-2xl font-black text-blue-900">₹{item.price}</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col justify-center">
              <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100 shadow-inner text-center space-y-6">
                <div className="text-green-800 font-medium text-sm leading-snug">
                  By purchasing this, you directly fund sustainable initiatives.
                </div>
                {purchasing ? (
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mb-2" />
                    <p className="text-xs font-bold text-green-700 animate-pulse">Processing Transaction...</p>
                  </div>
                ) : (
                  <button 
                    onClick={handlePurchase}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-black py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 active:scale-95 text-lg"
                  >
                    CONFIRM PURCHASE
                  </button>
                )}
                <p className="text-[10px] text-gray-400 font-medium">
                  Secure transaction powered by CarbonCalc
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketplaceDetails;
