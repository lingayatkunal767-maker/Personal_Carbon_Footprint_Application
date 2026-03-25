import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Download, UserRoundPen, Calendar, Filter,
  Table as TableIcon, LineChart as ChartIcon,
  ChevronLeft, ChevronRight, Leaf, Plus, X, Loader2
} from "lucide-react";

// ── Real SVG line chart — fixes the "just a line" issue ──
const SmoothLineChart = ({ data }) => {
  if (!data || data.length === 0) return null;

  const W = 600, H = 200;
  const padL = 40, padR = 20, padT = 20, padB = 40;
  const innerW = W - padL - padR;
  const innerH = H - padT - padB;

  const values   = data.map(d => d.value);
  const minVal   = Math.min(...values);
  const maxVal   = Math.max(...values);
  const valRange = maxVal - minVal || 1;

  const toX = (i)   => padL + (i / (data.length - 1)) * innerW;
  const toY = (val) => padT + (1 - (val - minVal) / valRange) * innerH;

  const points = data.map((d, i) => ({ x: toX(i), y: toY(d.value) }));

  // Smooth cubic bezier path
  const linePath = points.reduce((acc, pt, i, arr) => {
    if (i === 0) return `M ${pt.x},${pt.y}`;
    const prev = arr[i - 1];
    const cx   = (prev.x + pt.x) / 2;
    return `${acc} C ${cx},${prev.y} ${cx},${pt.y} ${pt.x},${pt.y}`;
  }, "");

  // Closed area path for gradient fill
  const areaPath = `${linePath} L ${points[points.length - 1].x},${padT + innerH} L ${points[0].x},${padT + innerH} Z`;

  // Y-axis grid values
  const gridLines = 4;
  const yTicks = Array.from({ length: gridLines + 1 }, (_, i) =>
    minVal + (valRange * (gridLines - i)) / gridLines
  );

  return (
    <div style={{ width: "100%", overflowX: "auto" }}>
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet"
        style={{ width: "100%", height: "auto", display: "block" }}>
        <defs>
          <linearGradient id="lineChartGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#10b981" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0.02" />
          </linearGradient>
        </defs>

        {/* Grid lines + Y labels */}
        {yTicks.map((tick, i) => {
          const y = padT + (i / gridLines) * innerH;
          return (
            <g key={i}>
              <line x1={padL} y1={y} x2={padL + innerW} y2={y}
                stroke="#f1f5f9" strokeWidth="1" />
              <text x={padL - 6} y={y + 4} textAnchor="end"
                fontSize="9" fill="#94a3b8" fontFamily="sans-serif">
                {Math.round(tick)}
              </text>
            </g>
          );
        })}

        {/* X axis base line */}
        <line x1={padL} y1={padT + innerH} x2={padL + innerW} y2={padT + innerH}
          stroke="#e2e8f0" strokeWidth="1" />

        {/* Area fill */}
        <path d={areaPath} fill="url(#lineChartGrad)" />

        {/* Line */}
        <path d={linePath} fill="none" stroke="#10b981" strokeWidth="2.5"
          strokeLinecap="round" strokeLinejoin="round" />

        {/* Data points + value labels + X labels */}
        {points.map((pt, i) => (
          <g key={i}>
            {/* Value label above point */}
            <text x={pt.x} y={pt.y - 10} textAnchor="middle"
              fontSize="9" fontWeight="700" fill="#374151" fontFamily="sans-serif">
              {data[i].value}
            </text>
            {/* Dot */}
            <circle cx={pt.x} cy={pt.y} r="4" fill="#10b981" stroke="white" strokeWidth="2" />
            {/* X axis month label */}
            <text x={pt.x} y={padT + innerH + 16} textAnchor="middle"
              fontSize="9" fill="#94a3b8" fontFamily="sans-serif">
              {data[i].month}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
};

const CarbonHistory = () => {
  const navigate = useNavigate();
  const [viewMode, setViewMode]   = useState("table");
  const [activeFilter, setActiveFilter] = useState("all");
  const [entries, setEntries]     = useState([]);
  const [loading, setLoading]     = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving]       = useState(false);
  const [form, setForm]           = useState({
    category: "transport", activity: "", amount: "",
    unit: "kg CO2", notes: "", date: new Date().toISOString().split("T")[0],
  });
  const PAGE_SIZE = 7;

  const fetchEntries = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:8080/api/carbon", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setEntries(await res.json());
    } catch (err) {
      console.error("Failed to fetch carbon entries:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchEntries(); }, []);

  const filtered = activeFilter === "all"
    ? entries
    : entries.filter(e => e.category?.toLowerCase() === activeFilter);

  // Group by date for table
  const grouped = filtered.reduce((acc, e) => {
    if (!acc[e.date]) acc[e.date] = { date: e.date, transport: 0, food: 0, energy: 0, shopping: 0, other: 0, total: 0 };
    const cat = e.category?.toLowerCase() || "other";
    if (["transport","food","energy","shopping"].includes(cat)) acc[e.date][cat] += e.amount;
    else acc[e.date].other += e.amount;
    acc[e.date].total += e.amount;
    return acc;
  }, {});
  const rows = Object.values(grouped).sort((a, b) => b.date.localeCompare(a.date));
  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const pageRows   = rows.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  // Monthly chart data
  const monthly = entries.reduce((acc, e) => {
    const m = e.date?.slice(0, 7) || "";
    if (m) acc[m] = (acc[m] || 0) + e.amount;
    return acc;
  }, {});
  const chartData = Object.entries(monthly)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, value]) => ({
      month: new Date(month + "-01").toLocaleString("default", { month: "short", year: "2-digit" }),
      value: Math.round(value * 10) / 10,
    }));
  const maxChartVal = Math.max(...chartData.map(d => d.value), 1);

  const totalKg   = entries.reduce((s, e) => s + (e.amount || 0), 0);
  const avgMonthly = chartData.length > 0 ? (totalKg / chartData.length).toFixed(1) : 0;

  const handleAdd = async () => {
    if (!form.activity.trim()) { alert("Activity description required"); return; }
    if (!form.amount || parseFloat(form.amount) <= 0) { alert("Amount must be > 0"); return; }
    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:8080/api/carbon", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...form, amount: parseFloat(form.amount) }),
      });
      if (res.ok) {
        setShowModal(false);
        setForm({ category:"transport", activity:"", amount:"", unit:"kg CO2", notes:"", date: new Date().toISOString().split("T")[0] });
        fetchEntries();
      }
    } catch (err) { console.error(err); }
    finally { setSaving(false); }
  };

  const handleDelete = async (date) => {
    if (!confirm(`Delete all entries for ${date}?`)) return;
    const toDelete = entries.filter(e => e.date === date);
    const token = localStorage.getItem("token");
    await Promise.all(toDelete.map(e =>
      fetch(`http://localhost:8080/api/carbon/${e.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })
    ));
    fetchEntries();
  };

  return (
    <div className="flex min-h-screen bg-[#F8FAF9] font-sans text-slate-700">
      <main className="flex-1 p-8 max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 tracking-tight">Carbon History</h1>
            <p className="text-gray-500 mt-1">Analyze your environmental progress and historical log data.</p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition shadow-md">
              <Plus size={16} /> Add Entry
            </button>
            <button onClick={() => navigate("/survey")}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-50 transition shadow-sm">
              <UserRoundPen size={16} /> Update Survey
            </button>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: "Total CO₂e", value: `${totalKg.toFixed(1)} kg`, sub: "all time" },
            { label: "Avg Monthly",  value: `${avgMonthly} kg`,        sub: "per month" },
            { label: "Total Entries",value: entries.length,            sub: "logged" },
          ].map((s, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">{s.label}</p>
              <p className="text-2xl font-black text-gray-800 mt-1">{s.value}</p>
              <p className="text-xs text-emerald-600 font-medium">{s.sub}</p>
            </div>
          ))}
        </div>

        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-gray-100 shadow-sm">
            {["all","transport","food","energy","shopping"].map(f => (
              <button key={f} onClick={() => { setActiveFilter(f); setCurrentPage(1); }}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all capitalize ${
                  activeFilter === f ? "bg-emerald-600 text-white shadow-sm" : "text-gray-400 hover:text-gray-600"
                }`}>
                {f === "all" ? "All Categories" : f}
              </button>
            ))}
          </div>
          <div className="flex bg-white border border-gray-100 p-1 rounded-xl shadow-sm">
            <button onClick={() => setViewMode("table")}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${viewMode === "table" ? "bg-emerald-50 text-emerald-700" : "text-gray-400"}`}>
              <TableIcon size={14} /> Table View
            </button>
            <button onClick={() => setViewMode("chart")}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${viewMode === "chart" ? "bg-emerald-50 text-emerald-700" : "text-gray-400"}`}>
              <ChartIcon size={14} /> Trend Chart
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : viewMode === "table" ? (
          <div className="bg-white border border-gray-100 rounded-[32px] p-8 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-gray-800">Detailed Logs</h3>
              <span className="text-xs text-emerald-600 font-bold">{rows.length} date records · {filtered.length} entries</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-gray-400 text-[10px] uppercase tracking-widest border-b border-gray-50">
                    <th className="pb-4 font-bold">Date</th>
                    <th className="pb-4 font-bold text-center">Transport (kg)</th>
                    <th className="pb-4 font-bold text-center">Food (kg)</th>
                    <th className="pb-4 font-bold text-center">Energy (kg)</th>
                    <th className="pb-4 font-bold text-center">Total (kg)</th>
                    <th className="pb-4 font-bold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {pageRows.length > 0 ? pageRows.map((row, i) => (
                    <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-4 text-sm font-semibold text-gray-700">{row.date}</td>
                      <td className="py-4 text-sm text-center text-gray-600">{row.transport > 0 ? row.transport.toFixed(2) : <span className="text-gray-300">—</span>}</td>
                      <td className="py-4 text-sm text-center text-gray-600">{row.food     > 0 ? row.food.toFixed(2)      : <span className="text-gray-300">—</span>}</td>
                      <td className="py-4 text-sm text-center text-gray-600">{row.energy   > 0 ? row.energy.toFixed(2)    : <span className="text-gray-300">—</span>}</td>
                      <td className="py-4 text-center"><span className="font-black text-gray-800">{row.total.toFixed(2)}</span></td>
                      <td className="py-4 text-right">
                        <button onClick={() => handleDelete(row.date)} className="text-xs text-red-400 hover:text-red-600 font-bold">Delete</button>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="6" className="py-16 text-center">
                        <Leaf className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                        <p className="text-gray-400 text-sm italic">No entries yet.</p>
                        <button onClick={() => setShowModal(true)} className="mt-2 text-emerald-600 text-xs font-bold hover:underline">Add your first entry →</button>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-50">
                <p className="text-xs text-gray-400">Page {currentPage} of {totalPages}</p>
                <div className="flex gap-2">
                  <button onClick={() => setCurrentPage(p => Math.max(1, p-1))} disabled={currentPage===1}
                    className="p-2 rounded-xl border border-gray-100 hover:bg-gray-50 disabled:opacity-40 transition">
                    <ChevronLeft size={14} />
                  </button>
                  <button onClick={() => setCurrentPage(p => Math.min(totalPages, p+1))} disabled={currentPage===totalPages}
                    className="p-2 rounded-xl border border-gray-100 hover:bg-gray-50 disabled:opacity-40 transition">
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Trend Chart — proper SVG line graph */
          <div className="bg-white border border-gray-100 rounded-[32px] p-8 shadow-sm">
            <h3 className="font-bold text-gray-800 mb-1">Monthly Emission Trend</h3>
            <p className="text-xs text-gray-400 mb-6">Total carbon logged per month (kg CO₂e)</p>
            {chartData.length > 0 ? (
              <SmoothLineChart data={chartData} />
            ) : (
              <div className="py-16 text-center">
                <Leaf className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                <p className="text-gray-400 text-sm">No data yet. Log some carbon entries first!</p>
                <button onClick={() => navigate("/survey")} className="mt-3 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700">Take Survey</button>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Add Entry Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-gray-800">Add Carbon Entry</h3>
              <button onClick={() => setShowModal(false)} className="p-1.5 hover:bg-gray-100 rounded-xl">
                <X size={18} className="text-gray-400" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1 uppercase tracking-wide">Category</label>
                <select value={form.category} onChange={e => setForm(f=>({...f,category:e.target.value}))}
                  className="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-gray-50 outline-none focus:border-emerald-500 text-sm">
                  {["transport","food","energy","shopping","other"].map(c =>
                    <option key={c} value={c}>{c.charAt(0).toUpperCase()+c.slice(1)}</option>
                  )}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1 uppercase tracking-wide">Activity Description</label>
                <input value={form.activity} onChange={e => setForm(f=>({...f,activity:e.target.value}))}
                  placeholder="e.g. Daily commute by car"
                  className="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-gray-50 outline-none focus:border-emerald-500 text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1 uppercase tracking-wide">Amount (kg CO₂e)</label>
                  <input type="number" min="0" step="0.01" value={form.amount}
                    onChange={e => setForm(f=>({...f,amount:e.target.value}))}
                    placeholder="0.00"
                    className="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-gray-50 outline-none focus:border-emerald-500 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1 uppercase tracking-wide">Date</label>
                  <input type="date" value={form.date} onChange={e => setForm(f=>({...f,date:e.target.value}))}
                    className="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-gray-50 outline-none focus:border-emerald-500 text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1 uppercase tracking-wide">Notes (optional)</label>
                <input value={form.notes} onChange={e => setForm(f=>({...f,notes:e.target.value}))}
                  placeholder="Any additional details..."
                  className="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-gray-50 outline-none focus:border-emerald-500 text-sm" />
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowModal(false)}
                  className="flex-1 py-3 border border-gray-200 text-gray-600 rounded-2xl text-sm font-semibold hover:bg-gray-50">
                  Cancel
                </button>
                <button onClick={handleAdd} disabled={saving}
                  className="flex-1 py-3 bg-emerald-600 text-white rounded-2xl text-sm font-semibold hover:bg-emerald-700 disabled:opacity-60 flex items-center justify-center gap-2">
                  {saving ? <><Loader2 className="w-4 h-4 animate-spin" />Saving...</> : "Save Entry"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CarbonHistory;
