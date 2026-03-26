import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, History, CheckCircle2, ShoppingCart, AlertCircle, Loader2 } from 'lucide-react';

const EcoMarketplace = () => {
    const navigate = useNavigate();
    const [items, setItems] = useState([]);
    const [showPopup, setShowPopup] = useState(false);
    const [purchasedItem, setPurchasedItem] = useState(null);
    const [processingId, setProcessingId] = useState(null); // Tracking "Pending" state

    const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
    const userId = storedUser.id || 1;

    useEffect(() => {
        axios.get('http://localhost:8080/api/marketplace/items')
            .then(res => setItems(res.data))
            .catch(err => console.error("Error fetching items", err));
    }, []);

    const handlePurchase = (item) => {
        setProcessingId(item.id); // Set to Pending
        
        axios.post(`http://localhost:8080/api/marketplace/purchase?userId=${userId}&itemId=${item.id}`)
            .then(() => {
                setPurchasedItem(item);
                setShowPopup(true);
                setProcessingId(null);
            })
            .catch((err) => {
                setProcessingId(null);
                // In a real app, you'd send a "FAILED" status to your backend here
                alert("Transaction Unsuccessful: Check your credit balance.");
            });
    };

    return (
        <div className="p-8 relative">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-2xl font-bold flex items-center gap-2">
                    <ShoppingBag className="text-emerald-600" /> Eco Marketplace
                </h1>
                <button 
                    onClick={() => navigate('/transhistory')}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:text-emerald-600 transition-all shadow-sm"
                >
                    <History size={18} /> View History
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {items.map(item => (
                    <div key={item.id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden">
                        <h3 className="font-bold text-lg">{item.name}</h3>
                        <p className="text-gray-500 text-sm my-3">{item.description}</p>
                        
                        <div className="flex justify-between text-sm font-bold text-emerald-700 bg-emerald-50 p-3 rounded-lg mb-4">
                            <span>Cost: {item.cost}</span>
                            <span>Offset: -{item.offsetValue}kg</span>
                        </div>

                        <button 
                            disabled={processingId === item.id}
                            onClick={() => handlePurchase(item)}
                            className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                                processingId === item.id 
                                ? "bg-amber-100 text-amber-600 cursor-wait" 
                                : "bg-emerald-600 text-white hover:bg-emerald-700"
                            }`}
                        >
                            {processingId === item.id ? (
                                <><Loader2 className="animate-spin" size={18}/> Processing...</>
                            ) : (
                                <><ShoppingCart size={18}/> Purchase Action</>
                            )}
                        </button>
                    </div>
                ))}
            </div>

            {/* Success Popup Remains the same */}
            {showPopup && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
                    <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl">
                        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle2 className="text-emerald-600 w-12 h-12" />
                        </div>
                        <h2 className="text-2xl font-bold">Purchase Completed!</h2>
                        <p className="text-gray-500 mt-2 mb-6">Supported: {purchasedItem?.name}</p>
                        <button onClick={() => setShowPopup(false)} className="w-full py-3 bg-gray-900 text-white rounded-xl font-bold">Close</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EcoMarketplace;