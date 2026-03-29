import React from 'react';
import { Link } from 'react-router-dom';

const MarketplaceCard = ({ item }) => {
  return (
    <div className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col h-full border border-green-50">
      <div className="p-6 flex-grow">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-bold text-green-900">{item.name}</h3>
          <span className="bg-green-100 text-green-700 text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
            Eco-Action
          </span>
        </div>
        <p className="text-gray-600 text-sm mb-6 line-clamp-3">
          {item.description}
        </p>
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500 font-medium">Offset Value:</span>
            <span className="text-green-600 font-bold">{item.carbonOffset} kg CO₂</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500 font-medium">Price:</span>
            <span className="text-blue-600 font-bold">₹{item.price}</span>
          </div>
        </div>
      </div>
      <div className="p-4 bg-gray-50 border-t border-gray-100 flex gap-2">
        <Link 
          to={`/marketplace/${item.id}`}
          className="flex-1 bg-white hover:bg-gray-100 text-green-700 font-semibold py-2 rounded-xl border border-green-200 text-center transition text-sm"
        >
          Details
        </Link>
        <Link 
          to={`/marketplace/${item.id}`}
          className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-xl text-center transition shadow-sm text-sm"
        >
          Buy Now
        </Link>
      </div>
    </div>
  );
};

export default MarketplaceCard;
