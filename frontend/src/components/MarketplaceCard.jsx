import React from 'react';
import { Recycle, Leaf } from 'lucide-react';

const MarketplaceCard = ({ item, onPurchase }) => {
  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col h-full group">
      {/* Top Banner with Gradient & Icon */}
      <div className="h-40 bg-gradient-to-b from-indigo-100 to-purple-100 flex items-center justify-center relative">
        <div className="p-4 bg-white/50 backdrop-blur-sm rounded-full shadow-sm group-hover:scale-110 transition-transform duration-300">
          <Recycle className="w-10 h-10 text-green-500" strokeWidth={2.5} />
        </div>
      </div>

      <div className="p-6 flex flex-col flex-grow">
        {/* Category */}
        <div className="flex items-center gap-1 text-xs font-bold text-green-700 uppercase tracking-widest mb-2">
          <Leaf className="w-3.5 h-3.5" />
          {item.category || "SUSTAINABLE LIVING"}
        </div>

        {/* Title & Description */}
        <h3 className="text-xl font-extrabold text-gray-900 mb-2 leading-tight">
          {item.itemName || item.name}
        </h3>
        <p className="text-sm text-gray-500 mb-6 flex-grow">
          {item.description}
        </p>

        {/* Progress Display */}
        <div className="mb-4">
          <div className="flex justify-end text-xs font-semibold text-gray-700 mb-1">
            {item.carbonOffset} kg
          </div>
          <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
            <div className="bg-green-500 h-1.5 rounded-full w-full"></div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-auto">
          <div className="flex flex-col">
            <div className="flex items-center gap-1 text-green-700 font-bold text-sm mb-1">
              <Leaf className="w-4 h-4" />
              {item.carbonOffset} kg CO₂
            </div>
            <div className="text-lg font-extrabold text-gray-900">
              ₹{item.itemPrice || item.price} <span className="text-xs font-medium text-gray-500">/unit</span>
            </div>
          </div>
          <button 
            onClick={() => onPurchase(item)}
            className="bg-green-700 hover:bg-green-800 text-white font-bold py-2.5 px-5 rounded-full transition-colors shadow-sm text-sm"
          >
            Purchase
          </button>
        </div>
      </div>
    </div>
  );
};

export default MarketplaceCard;
