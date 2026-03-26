import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { History, ArrowLeft, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const TransactionHistory = () => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    
    // Retrieve user from localStorage
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    useEffect(() => {
        if (user.id) {
            axios.get(`http://localhost:8080/api/marketplace/history/${user.id}`)
                .then(res => {
                    setTransactions(res.data);
                    setLoading(false);
                })
                .catch(err => {
                    console.error("Error fetching history", err);
                    setLoading(false);
                });
        }
    }, [user.id]);

    // Helper to render status badges based on backend Status strings
    const getStatusBadge = (status) => {
        const styles = {
            COMPLETED: "bg-emerald-100 text-emerald-700 border-emerald-200",
            PENDING: "bg-amber-100 text-amber-700 border-amber-200",
            UNSUCCESSFUL: "bg-red-100 text-red-700 border-red-200"
        };
        
        const icons = {
            COMPLETED: <CheckCircle size={14} />,
            PENDING: <Clock size={14} />,
            UNSUCCESSFUL: <XCircle size={14} />
        };

        // Normalize status to handle potential nulls from old records
        const currentStatus = status || 'COMPLETED'; 

        return (
            <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold border ${styles[currentStatus] || styles.PENDING}`}>
                {icons[currentStatus] || <AlertCircle size={14} />} 
                {currentStatus}
            </span>
        );
    };

    // Calculate quick stats for the header
    const successfulCount = transactions.filter(t => t.status === 'COMPLETED').length;
    const failedCount = transactions.filter(t => t.status === 'UNSUCCESSFUL').length;

    return (
        <div className="p-8 max-w-6xl mx-auto">
            {/* Header Navigation */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <button 
                        onClick={() => navigate('/marketplace')}
                        className="flex items-center gap-2 text-gray-500 hover:text-emerald-600 font-medium mb-2 transition-colors"
                    >
                        <ArrowLeft size={18} /> Back to Marketplace
                    </button>
                    <h2 className="text-3xl font-bold flex items-center gap-3">
                        <History className="text-emerald-600" size={28} /> Transaction History
                    </h2>
                </div>

                {/* Status Summary Cards */}
                <div className="flex gap-4">
                    <div className="bg-emerald-50 border border-emerald-100 p-3 rounded-xl text-center min-w-[100px]">
                        <p className="text-xs text-emerald-600 font-bold uppercase">Success</p>
                        <p className="text-xl font-black text-emerald-700">{successfulCount}</p>
                    </div>
                    <div className="bg-red-50 border border-red-100 p-3 rounded-xl text-center min-w-[100px]">
                        <p className="text-xs text-red-600 font-bold uppercase">Failed</p>
                        <p className="text-xl font-black text-red-700">{failedCount}</p>
                    </div>
                </div>
            </div>

            {/* Transactions Table */}
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-bold border-b border-gray-100">
                        <tr>
                            <th className="px-6 py-4">Initiative</th>
                            <th className="px-6 py-4">Date & Time</th>
                            <th className="px-6 py-4">Amount</th>
                            <th className="px-6 py-4 text-center">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {loading ? (
                            <tr>
                                <td colSpan="4" className="px-6 py-12 text-center text-gray-400">Loading your history...</td>
                            </tr>
                        ) : transactions.length === 0 ? (
                            <tr>
                                <td colSpan="4" className="px-6 py-12 text-center text-gray-400">
                                    No transactions found. Start supporting eco-initiatives!
                                </td>
                            </tr>
                        ) : (
                            transactions.map((t) => (
                                <tr key={t.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <p className="font-bold text-gray-800">{t.itemName || "Eco Initiative"}</p>
                                        <p className="text-[10px] text-gray-400">ID: #{t.id}</p>
                                    </td>
                                    <td className="px-6 py-4 text-gray-600 text-sm">
                                        {new Date(t.transactionDate).toLocaleDateString(undefined, { 
                                            day: 'numeric', 
                                            month: 'short', 
                                            year: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </td>
                                    <td className={`px-6 py-4 font-black ${t.status === 'UNSUCCESSFUL' ? 'text-gray-400 line-through' : 'text-emerald-600'}`}>
                                        {t.amountPaid} Credits
                                    </td>
                                    <td className="px-6 py-4 flex justify-center">
                                        {getStatusBadge(t.status)}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default TransactionHistory;