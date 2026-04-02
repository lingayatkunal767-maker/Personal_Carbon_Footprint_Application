import React, { useEffect, useState } from 'react';
import { CreditCard, Search } from 'lucide-react';
import { apiFetch } from '../utils/api';
import { getUserMarketplaceStats } from '../services/transactionService';
import LoadingSpinner from '../components/LoadingSpinner';

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [stats, setStats] = useState({ totalProducts: 0, totalInvested: 0, totalOffset: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        const user = await apiFetch('/api/users/me');
        if (!user || !user.id) throw new Error("Please log in to view transactions.");

        const [txData, stData] = await Promise.all([
          apiFetch(`/api/transactions/user/${user.id}`),
          getUserMarketplaceStats(user.id).catch(() => ({ totalProducts: 0, totalInvested: 0, totalOffset: 0 }))
        ]);

        setTransactions(txData || []);
        // The stats endpoint provides totalProducts instead of 'TRANSACTIONS' count, but we can also just use txData.length
        setStats({
          totalProducts: txData?.length || stData.totalProducts,
          totalInvested: stData.totalInvested || 0,
          totalOffset: stData.totalOffset || 0
        });
      } catch (err) {
        if (err.status === 401) window.location.href = "/login";
        setError(err.message || 'Failed to load transaction history.');
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: 'numeric', month: 'short', year: 'numeric'
    });
  };

  const getStatusStyle = (status) => {
    switch (status?.toUpperCase()) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-700';
      case 'PENDING':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const filteredTransactions = transactions.filter(tx => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = (tx.itemName?.toLowerCase().includes(term)) || 
                          (tx.category?.toLowerCase().includes(term)) || 
                          (tx.status?.toLowerCase().includes(term));
    const matchesFilter = filter === 'All' || tx.status?.toUpperCase() === filter.toUpperCase();
    return matchesSearch && matchesFilter;
  });

  const allCount = transactions.length;
  const pendingCount = transactions.filter(t => t.status?.toUpperCase() === 'PENDING').length;
  const completedCount = transactions.filter(t => t.status?.toUpperCase() === 'COMPLETED').length;

  if (loading) return <LoadingSpinner message="Loading your transaction history..." />;

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-50 rounded-xl">
            <CreditCard className="w-8 h-8 text-blue-500" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900">Transactions</h1>
            <p className="text-gray-500 mt-1">View your marketplace purchases and track their status.</p>
          </div>
        </div>

        {/* Stats Panel */}
        <div className="flex flex-wrap gap-4">
          <div className="bg-white border text-center border-gray-100 shadow-sm rounded-xl px-6 py-3 min-w-[140px]">
            <div className="text-xl font-black text-gray-900">{stats.totalProducts}</div>
            <div className="text-[10px] font-black tracking-widest text-gray-400 mt-1 uppercase">Transactions</div>
          </div>
          <div className="bg-white border text-center border-gray-100 shadow-sm rounded-xl px-6 py-3 min-w-[140px]">
            <div className="text-xl font-black text-green-700">₹{stats.totalInvested}</div>
            <div className="text-[10px] font-black tracking-widest text-gray-400 mt-1 uppercase">Total Spent</div>
          </div>
          <div className="bg-white border text-center border-gray-100 shadow-sm rounded-xl px-6 py-3 min-w-[140px]">
            <div className="text-xl font-black text-green-700">{stats.totalOffset} kg</div>
            <div className="text-[10px] font-black tracking-widest text-gray-400 mt-1 uppercase">CO₂ Offset</div>
          </div>
        </div>
      </div>

      {error ? (
        <div className="bg-red-50 text-red-700 p-4 rounded-xl shadow-sm">{error}</div>
      ) : (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          
          {/* Controls Bar */}
          <div className="p-6 border-b border-gray-100 bg-gray-50/50">
            <div className="flex flex-col lg:flex-row gap-6 justify-between items-start lg:items-center">
              
              {/* Search */}
              <div className="relative w-full lg:w-96 text-gray-400 focus-within:text-green-600">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none" />
                <input 
                  type="text" 
                  placeholder="Search by item, type, or status..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-full border border-gray-200 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 text-sm font-medium text-gray-700 transition shadow-sm"
                />
              </div>

              {/* Status Pills */}
              <div className="flex gap-3 overflow-x-auto w-full lg:w-auto hide-scrollbar pb-2 lg:pb-0">
                <button 
                  onClick={() => setFilter('All')} 
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition whitespace-nowrap border ${
                    filter === 'All' ? 'bg-green-700 text-white border-green-700 shadow-md' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  All
                  <span className={`px-2 py-0.5 rounded-full text-xs font-black ${
                    filter === 'All' ? 'bg-white/20' : 'bg-gray-100 text-gray-500'
                  }`}>{allCount}</span>
                </button>
                <button 
                  onClick={() => setFilter('Pending')} 
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition whitespace-nowrap border ${
                    filter === 'Pending' ? 'bg-green-700 text-white border-green-700 shadow-md' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  Pending
                  <span className={`px-2 py-0.5 rounded-full text-xs font-black ${
                    filter === 'Pending' ? 'bg-white/20' : 'bg-gray-100 text-gray-500'
                  }`}>{pendingCount}</span>
                </button>
                <button 
                  onClick={() => setFilter('Completed')} 
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition whitespace-nowrap border ${
                    filter === 'Completed' ? 'bg-green-700 text-white border-green-700 shadow-md' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  Completed
                  <span className={`px-2 py-0.5 rounded-full text-xs font-black ${
                    filter === 'Completed' ? 'bg-white/20' : 'bg-gray-100 text-gray-500'
                  }`}>{completedCount}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            {filteredTransactions.length === 0 ? (
              <div className="text-center py-24">
                <span className="text-5xl block mb-4">💳</span>
                <p className="text-gray-500 font-medium">No transactions found matching your criteria.</p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="py-4 px-6 text-xs font-black tracking-widest uppercase text-gray-400">Date</th>
                    <th className="py-4 px-6 text-xs font-black tracking-widest uppercase text-gray-400">Item</th>
                    <th className="py-4 px-6 text-xs font-black tracking-widest uppercase text-gray-400">Type</th>
                    <th className="py-4 px-6 text-xs font-black tracking-widest uppercase text-gray-400">Qty</th>
                    <th className="py-4 px-6 text-xs font-black tracking-widest uppercase text-gray-400">Amount</th>
                    <th className="py-4 px-6 text-xs font-black tracking-widest uppercase text-gray-400">CO₂ Offset</th>
                    <th className="py-4 px-6 text-xs font-black tracking-widest uppercase text-gray-400">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 bg-white">
                  {filteredTransactions.map(tx => (
                    <tr key={tx.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-4 px-6 text-sm font-medium text-gray-600 whitespace-nowrap">
                        {formatDate(tx.createdAt)}
                      </td>
                      <td className="py-4 px-6 text-sm font-black text-gray-900 whitespace-nowrap min-w-[200px]">
                        {tx.itemName}
                      </td>
                      <td className="py-4 px-6 text-sm font-medium text-gray-600 whitespace-nowrap">
                        {tx.category || "General"}
                      </td>
                      <td className="py-4 px-6 text-sm font-medium text-gray-700">
                        {tx.quantity || 1}
                      </td>
                      <td className="py-4 px-6 text-sm font-black text-gray-900">
                        ₹{tx.amount}
                      </td>
                      <td className="py-4 px-6 text-sm font-medium text-gray-600">
                        {tx.carbonOffset || 0} kg
                      </td>
                      <td className="py-4 px-6 whitespace-nowrap">
                        <span className={`px-3 py-1 text-xs font-black rounded-full inline-flex tracking-wide ${getStatusStyle(tx.status)}`}>
                          {tx.status || 'UNKNOWN'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Transactions;
