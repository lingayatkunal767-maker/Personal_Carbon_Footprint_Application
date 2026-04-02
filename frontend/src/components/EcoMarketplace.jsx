import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ShoppingBag, History, CheckCircle2, ShoppingCart, Loader2, Leaf, Package } from "lucide-react";
import axios from "axios";

function authHdr() {
  return { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } };
}

// CSS confetti burst — no extra package, pure DOM
function launchConfetti() {
  const colors = ["#059669","#10b981","#34d399","#fbbf24","#60a5fa","#f472b6"];
  const sheet = document.createElement("style");
  sheet.textContent = `
    @keyframes confFall {
      0%   { transform: translateY(-10px) rotate(0deg);   opacity:1; }
      100% { transform: translateY(110vh) rotate(720deg); opacity:0; }
    }
    .conf-piece { position:fixed; pointer-events:none; z-index:9999;
      animation: confFall linear forwards; }
  `;
  document.head.appendChild(sheet);

  for (let i = 0; i < 70; i++) {
    const el = document.createElement("div");
    const size = 6 + Math.random() * 8;
    el.className = "conf-piece";
    el.style.cssText = [
      `left:${Math.random() * 100}vw`,
      `top:-${Math.random() * 20 + 10}px`,
      `width:${size}px`,
      `height:${size}px`,
      `background:${colors[i % colors.length]}`,
      `border-radius:${Math.random() > 0.5 ? "50%" : "2px"}`,
      `animation-duration:${1.0 + Math.random() * 1.0}s`,
      `animation-delay:${Math.random() * 0.6}s`,
    ].join(";");
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 2500);
  }
  setTimeout(() => sheet.remove(), 3000);
}

const EcoMarketplace = () => {
  const navigate = useNavigate();
  const [items,        setItems]        = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState("");
  const [processingId, setProcessingId] = useState(null);
  const [purchased,    setPurchased]    = useState(null);

  const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
  const userId     = storedUser.id;

  useEffect(() => {
    axios.get("http://localhost:8080/api/marketplace/items")
      .then(res => setItems(Array.isArray(res.data) ? res.data : []))
      .catch(() => setError("Could not load items. Is the backend running?"))
      .finally(() => setLoading(false));
  }, []);

  const handlePurchase = async (item) => {
    if (!userId) { alert("Please log in to make a purchase."); return; }
    setProcessingId(item.id);
    try {
      await axios.post(
        `http://localhost:8080/api/marketplace/purchase?userId=${userId}&itemId=${item.id}`,
        {}, authHdr()
      );
      setPurchased(item);
      launchConfetti();          // 🎉 sprinkle effect
    } catch (e) {
      const msg = e.response?.data?.error || "Purchase failed. Please try again.";
      alert(msg);
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="p-4 sm:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-start gap-3 mb-6 sm:mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <ShoppingBag className="text-emerald-600 w-6 h-6" /> Eco Marketplace
          </h1>
          <p className="text-gray-500 mt-1 text-sm">Offset your carbon footprint through verified eco-actions.</p>
        </div>
        <button onClick={() => navigate("/transhistory")}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:text-emerald-600 hover:border-emerald-200 transition shadow-sm">
          <History size={16} /> View History
        </button>
      </div>

      {error && <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-sm">⚠️ {error}</div>}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
        </div>
      ) : items.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-gray-200 py-20 text-center">
          <Package className="w-12 h-12 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-400 font-semibold">No marketplace items yet.</p>
          <p className="text-gray-400 text-sm mt-1">Ask your admin to add eco-action products.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {items.map(item => (
            <div key={item.id}
              className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all">
              {item.category && (
                <span className="inline-block text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full uppercase tracking-wide mb-3">
                  {item.category}
                </span>
              )}
              <div className="w-11 h-11 bg-emerald-50 rounded-2xl flex items-center justify-center mb-3">
                <Leaf className="w-6 h-6 text-emerald-600" />
              </div>
              <h3 className="font-bold text-lg text-gray-800 mb-1">{item.name}</h3>
              <p className="text-gray-500 text-sm mb-4 leading-relaxed">{item.description}</p>
              <div className="flex justify-between text-sm font-bold text-emerald-700 bg-emerald-50 p-3 rounded-xl mb-4">
                <span>Cost: {item.cost} credits</span>
                <span>−{item.offsetValue} kg CO₂</span>
              </div>
              <button
                disabled={processingId === item.id}
                onClick={() => handlePurchase(item)}
                className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                  processingId === item.id
                    ? "bg-amber-100 text-amber-600 cursor-wait"
                    : "bg-emerald-600 text-white hover:bg-emerald-700 active:scale-95"
                }`}>
                {processingId === item.id
                  ? <><Loader2 className="animate-spin" size={18} /> Processing…</>
                  : <><ShoppingCart size={18} /> Purchase Action</>}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* ── Success popup with confetti ── */}
      {purchased && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-[32px] p-8 max-w-sm w-full text-center shadow-2xl">
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-5">
              <CheckCircle2 className="text-emerald-600 w-11 h-11" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Purchase Completed! 🌍</h2>
            <p className="text-gray-500 mt-2">
              You supported: <strong className="text-emerald-600">{purchased.name}</strong>
            </p>
            {purchased.offsetValue > 0 && (
              <p className="text-sm text-emerald-600 font-bold mt-1">−{purchased.offsetValue} kg CO₂ offset</p>
            )}
            <p className="text-xs text-gray-400 mt-3">A confirmation notification has been sent to you.</p>
            <div className="flex gap-3 mt-6">
              <button onClick={() => { setPurchased(null); navigate("/transhistory"); }}
                className="flex-1 py-3 border border-gray-200 text-gray-600 rounded-xl font-bold hover:bg-gray-50 transition">
                View History
              </button>
              <button onClick={() => setPurchased(null)}
                className="flex-1 py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 transition">
                Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EcoMarketplace;
