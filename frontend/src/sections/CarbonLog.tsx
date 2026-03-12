import { useState, useEffect, useRef } from 'react';
import { api } from '../lib/api';
import type { CarbonEntryDto, CarbonEntryReq } from '../lib/api';
import {
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area
} from 'recharts';
import type { TooltipProps } from 'recharts';
import type { ValueType, NameType } from 'recharts/types/component/DefaultTooltipContent';
import {
  Download, UserCog, Calendar, Filter, Table2, BarChart3,
  ChevronLeft, ChevronRight, Leaf, Utensils, MoreVertical, Plus, X, Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import type { View } from '../App';

// ── Row type for grouped table ──────────────────────────────────────────────
interface DateRow {
  date: string;
  transport: number;
  food: number;
  energy: number;
  shopping: number;
  other: number;
  total: number;
}

interface CarbonLogProps {
  onNavigate: (view: View) => void;
}

const CATEGORIES = ['transport', 'energy', 'food', 'shopping', 'other'] as const;
const PAGE_SIZE = 5;

function groupByDate(entries: CarbonEntryDto[]): DateRow[] {
  const map: Record<string, DateRow> = {};
  for (const e of entries) {
    if (!map[e.date]) {
      map[e.date] = { date: e.date, transport: 0, food: 0, energy: 0, shopping: 0, other: 0, total: 0 };
    }
    const cat = (e.category?.toLowerCase() ?? 'other') as keyof DateRow;
    if (cat !== 'date' && cat !== 'total' && cat in map[e.date]) {
      (map[e.date][cat] as number) += e.amount;
    }
    map[e.date].total += e.amount;
  }
  return Object.values(map).sort((a, b) => b.date.localeCompare(a.date));
}

function groupByMonth(entries: CarbonEntryDto[]): { month: string; value: number }[] {
  const map: Record<string, number> = {};
  for (const e of entries) {
    const month = e.date?.slice(0, 7) ?? '';
    if (!month) continue;
    map[month] = (map[month] || 0) + e.amount;
  }
  return Object.entries(map)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, value]) => ({
      month: new Date(month + '-01').toLocaleString('default', { month: 'short', year: '2-digit' }),
      value: Number(value.toFixed(1)),
    }));
}

// Typed recharts tooltip — no `any`
function CustomTooltip({ active, payload }: TooltipProps<ValueType, NameType>) {
  if (active && payload?.length) {
    return (
      <div className="bg-eco-forest text-white text-xs px-3 py-1.5 rounded-lg shadow-lg">
        <p>{`${payload[0].value} kg CO₂e`}</p>
      </div>
    );
  }
  return null;
}

export function CarbonLog({ onNavigate }: CarbonLogProps) {
  const sectionRef              = useRef<HTMLElement>(null);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'table' | 'chart'>('table');
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError]         = useState('');
  const [entries, setEntries]     = useState<CarbonEntryDto[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving]       = useState(false);
  const [form, setForm]           = useState<CarbonEntryReq>({
    category: 'transport', activity: '', amount: 0,
    unit: 'kg CO2', notes: '', date: new Date().toISOString().split('T')[0],
  });

  const load = () => {
    setIsLoading(true);
    setError('');
    api.carbon.getAll()
      .then(data => setEntries(Array.isArray(data) ? data : []))
      .catch((e: Error) => setError(e.message || 'Failed to load entries'))
      .finally(() => setIsLoading(false));
  };

  useEffect(load, []);

  // Re-run IntersectionObserver whenever view or loading changes
  // so scroll-reveal elements always get `visible` after a view switch
  useEffect(() => {
    const els = sectionRef.current?.querySelectorAll('.scroll-reveal');
    if (!els) return;
    // Immediately mark already-visible elements
    els.forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight) el.classList.add('visible');
    });
    const obs = new IntersectionObserver(
      es => es.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); }),
      { threshold: 0.05 }
    );
    els.forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, [isLoading, viewMode]); // <-- viewMode added so switching views re-applies visible

  const filteredEntries = activeCategory === 'all'
    ? entries
    : entries.filter(e => e.category?.toLowerCase() === activeCategory);

  const groupedRows = groupByDate(filteredEntries);
  const trendData   = groupByMonth(entries);
  const totalPages  = Math.max(1, Math.ceil(groupedRows.length / PAGE_SIZE));
  const pageRows    = groupedRows.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const totalKg      = entries.reduce((s, e) => s + (e.amount ?? 0), 0);
  const avgMonthly   = trendData.length > 0
    ? Math.round(trendData.reduce((s, d) => s + d.value, 0) / trendData.length)
    : 0;
  const catTotals    = entries.reduce<Record<string, number>>((acc, e) => {
    const c = e.category ?? 'other';
    acc[c] = (acc[c] || 0) + e.amount;
    return acc;
  }, {});
  const bestCategory = Object.entries(catTotals).sort(([, a], [, b]) => a - b)[0]?.[0] ?? '—';

  const handleAdd = async () => {
    if (!form.activity.trim()) { toast.error('Activity description is required'); return; }
    if (!form.amount || form.amount <= 0) { toast.error('Amount must be greater than 0'); return; }
    setSaving(true);
    try {
      await api.carbon.create(form);
      toast.success('Entry added!');
      setShowModal(false);
      setForm({ category: 'transport', activity: '', amount: 0, unit: 'kg CO2', notes: '', date: new Date().toISOString().split('T')[0] });
      load();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Failed to add entry');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteRow = async (date: string) => {
    const dayEntries = entries.filter(e => e.date === date);
    if (!confirm(`Delete all ${dayEntries.length} entr${dayEntries.length === 1 ? 'y' : 'ies'} for ${date}?`)) return;
    try {
      await Promise.all(dayEntries.map(e => api.carbon.delete(e.id)));
      toast.success('Deleted');
      load();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Failed to delete');
    }
  };

  const getPageNumbers = (): (number | string)[] => {
    if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1);
    return [1, 2, 3, '...', totalPages];
  };

  return (
    <section ref={sectionRef} className="min-h-screen bg-eco-bg pt-20 pb-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6 scroll-reveal">
          <div>
            <h1 className="text-2xl sm:text-3xl font-heading font-bold text-eco-forest">Carbon History</h1>
            <p className="text-sm text-eco-sage mt-1">Analyze your environmental progress and historical log data.</p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <button onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-eco-green text-white rounded-xl text-sm font-medium hover:bg-[#2d6b47] transition-all">
              <Plus className="w-4 h-4" /> Add Entry
            </button>
            <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-[rgba(61,139,93,0.22)] rounded-xl text-sm font-medium text-eco-forest hover:shadow-md transition-all">
              <Download className="w-4 h-4" /> Export CSV
            </button>
            <button onClick={() => onNavigate('survey')}
              className="flex items-center gap-2 px-4 py-2.5 bg-white border border-[rgba(61,139,93,0.22)] rounded-xl text-sm font-medium text-eco-forest hover:shadow-md transition-all">
              <UserCog className="w-4 h-4" /> Update Profile
            </button>
          </div>
        </div>

        {/* Error banner */}
        {error && (
          <div className="eco-card p-4 mb-6 border-l-4 border-red-400">
            <p className="text-eco-forest font-medium">⚠️ {error}</p>
            <p className="text-eco-sage text-sm mt-1">
              Make sure Spring Boot is running at{' '}
              <code className="bg-eco-bg-alt px-1 rounded">localhost:8080</code>
            </p>
          </div>
        )}

        {/* Filter Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6 scroll-reveal">
          <div className="flex items-center gap-3 flex-wrap">
            <button className="flex items-center gap-2 px-3.5 py-2 bg-white border border-[rgba(61,139,93,0.15)] rounded-xl text-sm text-eco-forest">
              <Calendar className="w-4 h-4 text-eco-sage" /> All Time
            </button>
            <div className="flex items-center gap-1 flex-wrap">
              <Filter className="w-4 h-4 text-eco-sage mr-1" />
              {(['all', ...CATEGORIES] as string[]).map(cat => (
                <button key={cat} onClick={() => { setActiveCategory(cat); setCurrentPage(1); }}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${activeCategory === cat ? 'bg-eco-green text-white' : 'text-eco-sage hover:bg-eco-bg-alt'}`}>
                  {cat === 'all' ? 'All' : cat.charAt(0).toUpperCase() + cat.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center rounded-xl border border-[rgba(61,139,93,0.15)] overflow-hidden bg-white">
            <button onClick={() => setViewMode('table')}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium transition-colors ${viewMode === 'table' ? 'bg-eco-green text-white' : 'text-eco-sage hover:bg-eco-bg-alt'}`}>
              <Table2 className="w-3.5 h-3.5" /> Table View
            </button>
            <button onClick={() => setViewMode('chart')}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium transition-colors ${viewMode === 'chart' ? 'bg-eco-green text-white' : 'text-eco-sage hover:bg-eco-bg-alt'}`}>
              <BarChart3 className="w-3.5 h-3.5" /> Trend Chart
            </button>
          </div>
        </div>

        {/* ── Table View ── always rendered when viewMode=table */}
        {viewMode === 'table' && (
          <div className="eco-card p-5 mb-6 scroll-reveal">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-heading font-bold text-eco-forest">Detailed Logs</h3>
                <p className="text-xs text-eco-sage">
                  {isLoading ? 'Loading...' : `${groupedRows.length} date records · ${entries.length} total entries`}
                </p>
              </div>
              <span className="text-sm font-medium text-eco-green">Total: {totalKg.toFixed(1)} kg CO₂e</span>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-7 h-7 animate-spin text-eco-green" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-eco-bg-alt">
                      <th className="text-left   py-3 px-3 text-xs font-semibold text-eco-sage uppercase tracking-wide">Date</th>
                      <th className="text-center py-3 px-3 text-xs font-semibold text-eco-sage uppercase tracking-wide">Transport (kg)</th>
                      <th className="text-center py-3 px-3 text-xs font-semibold text-eco-sage uppercase tracking-wide">Food (kg)</th>
                      <th className="text-center py-3 px-3 text-xs font-semibold text-eco-sage uppercase tracking-wide">Energy (kg)</th>
                      <th className="text-center py-3 px-3 text-xs font-semibold text-eco-sage uppercase tracking-wide">Total (kg)</th>
                      <th className="text-right  py-3 px-3 text-xs font-semibold text-eco-sage uppercase tracking-wide">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pageRows.length > 0 ? pageRows.map((row, i) => (
                      <tr key={i} className="border-b border-eco-bg-alt/50 hover:bg-eco-bg/50 transition-colors">
                        <td className="py-4 px-3 text-sm text-eco-forest font-medium">{row.date}</td>
                        <td className="py-4 px-3 text-sm text-eco-forest text-center">
                          {row.transport > 0 ? row.transport.toFixed(2) : <span className="text-eco-sage/40">—</span>}
                        </td>
                        <td className="py-4 px-3 text-sm text-eco-forest text-center">
                          {row.food > 0 ? row.food.toFixed(2) : <span className="text-eco-sage/40">—</span>}
                        </td>
                        <td className="py-4 px-3 text-sm text-eco-forest text-center">
                          {row.energy > 0 ? row.energy.toFixed(2) : <span className="text-eco-sage/40">—</span>}
                        </td>
                        <td className="py-4 px-3 text-center">
                          <span className="text-sm font-bold text-eco-forest">{row.total.toFixed(2)}</span>
                        </td>
                        <td className="py-4 px-3 text-right">
                          <button onClick={() => handleDeleteRow(row.date)}
                            className="text-xs text-red-500 hover:text-red-700 font-medium transition-colors">
                            Delete
                          </button>
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={6} className="py-14 text-center">
                          <div className="flex flex-col items-center gap-3">
                            <Leaf className="w-10 h-10 text-eco-sage/30" />
                            <p className="text-eco-sage text-sm">No entries yet.</p>
                            <div className="flex gap-2">
                              <button onClick={() => onNavigate('survey')} className="eco-button px-4 py-2 text-sm">
                                Complete Survey
                              </button>
                              <button onClick={() => setShowModal(true)} className="eco-button-outline px-4 py-2 text-sm">
                                Add Entry
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {!isLoading && groupedRows.length > PAGE_SIZE && (
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-eco-bg-alt">
                <p className="text-xs text-eco-sage">Showing {pageRows.length} of {groupedRows.length} entries</p>
                <div className="flex items-center gap-1">
                  <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    className="p-1.5 rounded-lg hover:bg-eco-bg-alt transition-colors text-eco-sage">
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  {getPageNumbers().map((page, index) => (
                    <button key={index} onClick={() => typeof page === 'number' && setCurrentPage(page)}
                      className={`min-w-[32px] h-8 rounded-lg text-xs font-medium transition-colors ${
                        page === currentPage
                          ? 'bg-eco-green text-white'
                          : typeof page === 'number'
                            ? 'text-eco-sage hover:bg-eco-bg-alt'
                            : 'text-eco-sage cursor-default'
                      }`}>
                      {page}
                    </button>
                  ))}
                  <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    className="p-1.5 rounded-lg hover:bg-eco-bg-alt transition-colors text-eco-sage">
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Trend Chart View ── always rendered when viewMode=chart */}
        {viewMode === 'chart' && (
          <div className="eco-card p-5 mb-6 scroll-reveal">
            <h3 className="text-lg font-heading font-bold text-eco-forest mb-1">Emission Trend</h3>
            <p className="text-xs text-eco-sage mb-4">Monthly total emissions over time</p>
            <div className="h-72 w-full">
              {isLoading ? (
                <div className="h-full flex items-center justify-center">
                  <Loader2 className="w-7 h-7 animate-spin text-eco-green" />
                </div>
              ) : trendData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="historyGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="#3D8B5D" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#3D8B5D" stopOpacity={0.05} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E9F3EB" />
                    <XAxis dataKey="month" axisLine={false} tickLine={false}
                      tick={{ fill: '#6B8A76', fontSize: 12 }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B8A76', fontSize: 12 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="value" stroke="#3D8B5D" strokeWidth={2}
                      fill="url(#historyGradient)"
                      dot={{ r: 4, fill: '#3D8B5D', strokeWidth: 2, stroke: '#fff' }}
                      activeDot={{ r: 6, fill: '#3D8B5D', strokeWidth: 2, stroke: '#fff' }} />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex flex-col items-center justify-center gap-3 text-eco-sage">
                  <BarChart3 className="w-10 h-10 opacity-30" />
                  <p className="text-sm text-center">No data yet — complete your survey or add entries to see trends.</p>
                  <div className="flex gap-2">
                    <button onClick={() => onNavigate('survey')} className="eco-button px-4 py-2 text-sm">
                      Complete Survey
                    </button>
                    <button onClick={() => { setViewMode('table'); setShowModal(true); }}
                      className="eco-button-outline px-4 py-2 text-sm">
                      Add Entry
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 scroll-reveal">
          <div className="eco-card p-5 flex items-center gap-4">
            <div className="w-11 h-11 bg-eco-green/10 rounded-xl flex items-center justify-center flex-shrink-0">
              <Leaf className="w-5 h-5 text-eco-green" />
            </div>
            <div>
              <p className="text-xs text-eco-sage font-medium uppercase tracking-wide">Average Monthly</p>
              <p className="text-xl font-heading font-bold text-eco-forest">{avgMonthly} kg CO₂e</p>
            </div>
          </div>
          <div className="eco-card p-5 flex items-center gap-4">
            <div className="w-11 h-11 bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <Utensils className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-xs text-eco-sage font-medium uppercase tracking-wide">Top Category</p>
              <p className="text-xl font-heading font-bold text-eco-forest capitalize">{bestCategory}</p>
            </div>
          </div>
          <div className="eco-card p-5 flex items-center gap-4">
            <div className="w-11 h-11 bg-eco-bg-alt rounded-xl flex items-center justify-center flex-shrink-0">
              <MoreVertical className="w-5 h-5 text-eco-sage" />
            </div>
            <div>
              <p className="text-xs text-eco-sage font-medium uppercase tracking-wide">Total Audited</p>
              <p className="text-xl font-heading font-bold text-eco-forest">{totalKg.toFixed(1)} kg</p>
            </div>
          </div>
        </div>
      </div>

      {/* Add Entry Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="eco-card p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-heading font-bold text-eco-forest">Add Carbon Entry</h3>
              <button type="button" onClick={() => setShowModal(false)}
                className="p-1 hover:bg-eco-bg-alt rounded-lg transition-colors">
                <X className="w-5 h-5 text-eco-sage" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-eco-forest mb-1.5">Category</label>
                <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                  className="eco-input">
                  {CATEGORIES.map(c => (
                    <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-eco-forest mb-1.5">Activity Description</label>
                <input type="text" value={form.activity}
                  onChange={e => setForm(f => ({ ...f, activity: e.target.value }))}
                  placeholder="e.g. Daily commute by car" className="eco-input" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-eco-forest mb-1.5">Amount (kg CO₂e)</label>
                  <input type="number" min="0" step="0.01" value={form.amount || ''}
                    onChange={e => setForm(f => ({ ...f, amount: parseFloat(e.target.value) || 0 }))}
                    placeholder="0.00" className="eco-input" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-eco-forest mb-1.5">Date</label>
                  <input type="date" value={form.date}
                    onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                    className="eco-input" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-eco-forest mb-1.5">Notes (optional)</label>
                <input type="text" value={form.notes || ''}
                  onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                  placeholder="Any additional details..." className="eco-input" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)}
                  className="eco-button-outline flex-1 py-2.5 text-sm">Cancel</button>
                <button type="button" onClick={handleAdd} disabled={saving}
                  className="eco-button flex-1 py-2.5 text-sm disabled:opacity-70">
                  {saving ? 'Saving...' : 'Save Entry'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
