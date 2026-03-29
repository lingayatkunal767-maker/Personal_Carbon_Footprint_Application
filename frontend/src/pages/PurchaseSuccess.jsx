import React from 'react';
import { useLocation, Link, Navigate } from 'react-router-dom';

const PurchaseSuccess = () => {
  const location = useLocation();
  const { item } = location.state || {};

  if (!item) return <Navigate to="/marketplace" replace />;

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="max-w-xl w-full bg-white rounded-[40px] shadow-2xl p-10 text-center border-4 border-green-50 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-green-100 rounded-full blur-3xl opacity-50" />
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-blue-100 rounded-full blur-3xl opacity-50" />
        
        <div className="relative z-10">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner ring-8 ring-green-50">
            <span className="text-5xl">✅</span>
          </div>

          <h1 className="text-4xl font-black text-green-900 mb-2">Purchase Successful!</h1>
          <p className="text-green-700 font-medium mb-8">You're making a real difference today.</p>

          <div className="bg-gray-50 rounded-3xl p-6 mb-8 border border-gray-100 space-y-4">
            <div className="flex justify-between items-center text-sm border-b border-gray-100 pb-3">
              <span className="text-gray-500 font-medium uppercase tracking-wider text-[10px]">Item Purchased</span>
              <span className="text-gray-900 font-bold">{item.name}</span>
            </div>
            <div className="flex justify-between items-center text-sm border-b border-gray-100 pb-3">
              <span className="text-gray-500 font-medium uppercase tracking-wider text-[10px]">Amount Paid</span>
              <span className="text-blue-600 font-black">₹{item.price}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-500 font-medium uppercase tracking-wider text-[10px]">Carbon Offset</span>
              <span className="text-green-600 font-black">-{item.carbonOffset} kg CO₂</span>
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-gray-500 text-sm italic">
              Thank you for supporting sustainability through verified eco-action projects.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link 
                to="/dashboard"
                className="flex-1 bg-green-800 hover:bg-green-900 text-white font-bold py-4 rounded-2xl transition shadow-lg"
              >
                Go to Dashboard
              </Link>
              <Link 
                to="/marketplace"
                className="flex-1 bg-white hover:bg-gray-50 text-green-800 font-bold py-4 rounded-2xl border-2 border-green-100 transition"
              >
                Back to Market
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PurchaseSuccess;
