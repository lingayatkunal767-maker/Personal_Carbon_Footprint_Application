import { useEffect, useRef, useState, useCallback } from 'react';
import { api } from '../lib/api';
import type { DashboardDto, CarbonEntryDto } from '../lib/api';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import {
  TrendingUp, TrendingDown, Leaf, Zap, Car, Utensils,
  Plus, ChevronRight, MoreHorizontal
} from 'lucide-react';
import type { User as UserType, View } from '../App';

interface DashboardProps {
  user: NonNullable<UserType>;
  onNavigate: (view: View) => void;
}

type Period = 'daily' | 'weekly' | 'monthly';

export function Dashboard({ user, onNavigate }: DashboardProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const [period, setPeriod] = useState<Period>('monthly');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [data, setData] = useState<DashboardDto | null>(null);
  const [recentLogs, setRecentLogs] = useState<CarbonEntryDto[]>([]);

  const load = useCallback((p: Period) => {
    setIsLoading(true);
    setError('');
    Promise.all([
      api.dashboard.get(p).then(setData),
      api.carbon.getAll().then(entries => setRecentLogs(entries.slice(0, 5))).catch(() => {})
    ]).catch(e => setError(e.message)).finally(() => setIsLoading(false));
  }, []);

  useEffect(() => { load(period); }, [period]);

  useEffect(() => {
    if (isLoading) return;
    const obs = new IntersectionObserver(
      es => es.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); }),
      { threshold: 0.1, rootMargin: '0px 0px -10% 0px' }
    );
    sectionRef.current?.querySelectorAll('.scroll-reveal').forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, [isLoading]);

  const trendData = (data?.weeklyTrend ?? []).map(d => ({ date: d.date, value: d.amount }));
  const transportBars = [65, 80, 55, 90, 70, 85, 60];
  const foodBars      = [40, 55, 70, 45, 60, 50, 65];
  const energyBars    = [80, 70, 90, 75, 85, 60, 95];

  const catColorMap: Record<string, string> = {
    transport: 'bg-blue-100 text-blue-700',
    energy:    'bg-yellow-100 text-yellow-700',
    food:      'bg-green-100 text-green-700',
    shopping:  'bg-purple-100 text-purple-700',
  };

  const recentActivity = Object.entries(data?.categoryBreakdown ?? {})
    .sort(([, a], [, b]) => b - a)
    .map(([cat, val]) => ({
      category:      cat.charAt(0).toUpperCase() + cat.slice(1),
      categoryColor: catColorMap[cat.toLowerCase()] ?? 'bg-gray-100 text-gray-700',
      description:   `Total ${cat} emissions this month`,
      emission:      Number(val.toFixed(1)),
    }));

  const badges = [
    { name: 'Transport Pro', icon: Car,        color: 'text-red-600',    bgGrad: 'from-red-50 to-red-100' },
    { name: 'Energy Saver',  icon: Zap,        color: 'text-green-600',  bgGrad: 'from-green-50 to-green-100' },
    { name: 'Tree Planter',  icon: Leaf,       color: 'text-blue-600',   bgGrad: 'from-blue-50 to-blue-100' },
    { name: 'Eco Monitor',   icon: TrendingUp, color: 'text-orange-600', bgGrad: 'from-orange-50 to-orange-100' },
  ];

  const firstName   = (data?.userName ?? user?.name ?? 'User').split(' ')[0];
  const changePct   = data?.monthlyChangePercent ?? 0;
  const periodKg    = data?.periodCarbonKg ?? 0;
  const periodLabel = data?.periodLabel ?? 'This Month';

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload?.length)
      return <div className="bg-eco-forest text-white text-xs px-3 py-1.5 rounded-lg shadow-lg"><p>{`${payload[0].value} kg CO₂e`}</p></div>;
    return null;
  };

  if (isLoading) return (
    <section className="min-h-screen bg-eco-bg pt-20 flex items-center justify-center">
      <div className="animate-spin w-8 h-8 border-4 border-eco-green border-t-transparent rounded-full" />
    </section>
  );

  if (error) return (
    <section className="min-h-screen bg-eco-bg pt-20 px-4">
      <div className="max-w-2xl mx-auto pt-12">
        <div className="eco-card p-8 text-center border-l-4 border-eco-error">
          <p className="text-eco-forest font-semibold text-lg mb-2">⚠️ Cannot connect to backend</p>
          <p className="text-eco-sage text-sm mb-2">{error}</p>
          <p className="text-eco-sage text-sm">Make sure Spring Boot is running at <code className="bg-eco-bg-alt px-2 py-0.5 rounded">localhost:8080</code></p>
        </div>
      </div>
    </section>
  );

  return (
    <section ref={sectionRef} className="min-h-screen bg-eco-bg pt-20 pb-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="mb-6 scroll-reveal">
          <h1 className="text-2xl sm:text-3xl font-heading font-bold text-eco-forest">
            Welcome back, {firstName}!
          </h1>
          <p className="text-sm text-eco-sage mt-1">Here's your environmental impact summary.</p>
        </div>

        {/* ── Row 1: Carbon Summary Card (with time filter) + Quick Actions + Goals ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6 scroll-reveal">

          {/* Carbon Summary Card — milestone requirement */}
          <div className="eco-card p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-eco-sage font-medium uppercase tracking-wide">Carbon Emission</p>
              {/* Time filter: Daily / Weekly / Monthly */}
              <div className="flex rounded-lg overflow-hidden border border-[rgba(61,139,93,0.15)]">
                {(['daily', 'weekly', 'monthly'] as Period[]).map(p => (
                  <button key={p} onClick={() => setPeriod(p)}
                    className={`px-2.5 py-1 text-xs font-medium transition-colors ${period === p ? 'bg-eco-green text-white' : 'text-eco-sage hover:bg-eco-bg-alt'}`}>
                    {p.charAt(0).toUpperCase() + p.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <span className="text-3xl font-heading font-bold text-eco-forest">{periodKg}</span>
                <span className="text-sm text-eco-sage ml-1">kg CO₂e</span>
              </div>
              <div className="w-12 h-12 bg-eco-green/10 rounded-xl flex items-center justify-center">
                <Leaf className="w-6 h-6 text-eco-green" />
              </div>
            </div>
            <p className="text-xs text-eco-sage mt-1 mb-2">{periodLabel}</p>
            <div className="flex items-center gap-1 text-sm">
              {changePct > 0
                ? <><TrendingUp className="w-3.5 h-3.5 text-eco-error" /><span className="text-eco-error font-medium">+{Math.abs(changePct)}%</span></>
                : <><TrendingDown className="w-3.5 h-3.5 text-eco-success" /><span className="text-eco-success font-medium">{changePct}%</span></>}
              <span className="text-eco-sage ml-1">vs last month</span>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="eco-card p-5">
            <p className="text-xs text-eco-sage font-medium uppercase tracking-wide mb-3">Quick Actions</p>
            <div className="flex gap-3">
              <button onClick={() => onNavigate('carbonlog')}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-eco-bg rounded-xl text-sm font-medium text-eco-forest hover:bg-eco-bg-alt transition-colors">
                <Plus className="w-4 h-4" /> Add Log
              </button>
              <button onClick={() => onNavigate('survey')}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-eco-bg rounded-xl text-sm font-medium text-eco-forest hover:bg-eco-bg-alt transition-colors">
                <Plus className="w-4 h-4" /> Survey
              </button>
            </div>
            {/* Show total carbon prominently */}
            <div className="mt-3 pt-3 border-t border-eco-bg-alt">
              <div className="flex items-center justify-between">
                <span className="text-xs text-eco-sage">Total logged</span>
                <span className="text-sm font-bold text-eco-forest">{data?.totalCarbonKg ?? 0} kg CO₂e</span>
              </div>
            </div>
          </div>

          {/* Goals */}
          <div className="eco-card p-5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-eco-sage font-medium uppercase tracking-wide">Goals</p>
              <span className="text-sm font-bold text-eco-green">{data?.activeGoals ?? 0} active</span>
            </div>
            <p className="text-sm text-eco-forest font-medium mb-1">{data?.completedGoals ?? 0} completed</p>
            <div className="h-2 bg-eco-bg-alt rounded-full overflow-hidden mb-3">
              <div className="h-full bg-eco-green rounded-full transition-all duration-500"
                style={{ width: `${Math.min(((data?.completedGoals ?? 0) / Math.max(((data?.activeGoals ?? 0) + (data?.completedGoals ?? 0)), 1)) * 100, 100)}%` }} />
            </div>
            <button onClick={() => onNavigate('goals')}
              className="text-sm font-medium text-eco-green hover:text-eco-forest transition-colors">
              Manage Goals →
            </button>
          </div>
        </div>

        {/* ── Row 2: Category-wise Breakdown (milestone requirement) ── */}
        <div className="mb-6 scroll-reveal">
          <h2 className="text-lg font-heading font-bold text-eco-forest mb-4">Category-wise Breakdown</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { label: 'Transport', Icon: Car,      bars: transportBars, barColor: 'bg-red-400',   key: 'transport' },
              { label: 'Food & Diet', Icon: Utensils, bars: foodBars,   barColor: 'bg-green-400', key: 'food' },
              { label: 'Energy',    Icon: Zap,      bars: energyBars,   barColor: 'bg-yellow-400', key: 'energy' },
            ].map(cat => (
              <div key={cat.key} className="eco-card p-5">
                <div className="flex items-center gap-2 mb-3">
                  <cat.Icon className="w-5 h-5 text-eco-sage" />
                  <span className="text-sm text-eco-sage font-medium">{cat.label}</span>
                </div>
                <p className="text-2xl font-heading font-bold text-eco-forest mb-3">
                  {((data?.categoryBreakdown?.[cat.key] ?? 0)).toFixed(1)} <span className="text-sm font-normal text-eco-sage">kg CO₂e</span>
                </p>
                <div className="flex items-end gap-1 h-10">
                  {cat.bars.map((h, i) => (
                    <div key={i} className={`flex-1 ${cat.barColor} rounded-t-sm opacity-70`} style={{ height: `${h}%` }} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Row 3: Emission Trend Chart (milestone requirement) + Eco Badges ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">

          {/* Emission Trend Line Chart */}
          <div className="lg:col-span-2 eco-card p-5 scroll-reveal">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-heading font-bold text-eco-forest">Emission Trend</h3>
                <p className="text-xs text-eco-sage">Daily carbon emissions — last 7 days</p>
              </div>
              <button onClick={() => onNavigate('carbonlog')}
                className="text-xs text-eco-green font-medium hover:underline">
                View Full History →
              </button>
            </div>
            <div className="h-56 w-full">
              {trendData.some(d => d.value > 0) ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="emissionGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3D8B5D" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#3D8B5D" stopOpacity={0.05} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E9F3EB" />
                    <XAxis dataKey="date" axisLine={false} tickLine={false}
                      tick={{ fill: '#6B8A76', fontSize: 11 }} dy={10} />
                    <YAxis axisLine={false} tickLine={false}
                      tick={{ fill: '#6B8A76', fontSize: 11 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="value" stroke="#3D8B5D" strokeWidth={2}
                      fill="url(#emissionGrad)" dot={false}
                      activeDot={{ r: 4, fill: '#3D8B5D', stroke: '#fff', strokeWidth: 2 }} />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex flex-col items-center justify-center gap-3 text-eco-sage">
                  <p className="text-sm">No emissions logged yet.</p>
                  <div className="flex gap-2">
                    <button onClick={() => onNavigate('survey')}
                      className="eco-button px-4 py-2 text-sm">Complete Survey</button>
                    <button onClick={() => onNavigate('carbonlog')}
                      className="eco-button-outline px-4 py-2 text-sm">Add Entry</button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Eco Badges */}
          <div className="eco-card p-5 scroll-reveal">
            <h3 className="text-lg font-heading font-bold text-eco-forest mb-1">Eco Badges</h3>
            <p className="text-xs text-eco-sage mb-4">Your environmental achievements.</p>
            <div className="grid grid-cols-2 gap-3">
              {badges.map((b, i) => (
                <button key={i} onClick={() => onNavigate('badges')}
                  className={`flex flex-col items-center gap-2 p-3 rounded-xl bg-gradient-to-b ${b.bgGrad} hover:shadow-md transition-all`}>
                  <b.icon className={`w-5 h-5 ${b.color}`} />
                  <span className="text-xs font-medium text-eco-forest text-center leading-tight">{b.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Lifestyle Survey Estimated Footprint (shows after survey completion) ── */}
        {data?.estimatedAnnualFootprint != null && data.estimatedAnnualFootprint > 0 && (
          <div className="eco-card p-5 mb-6 scroll-reveal border-l-4 border-eco-green">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-xs text-eco-sage font-medium uppercase tracking-wide mb-0.5">
                  Estimated Annual Footprint
                </p>
                <p className="text-xs text-eco-sage">Calculated from your lifestyle survey</p>
              </div>
              <button onClick={() => onNavigate('survey')}
                className="text-xs text-eco-green hover:underline font-medium">
                Update Survey
              </button>
            </div>
            <div className="flex items-center gap-6">
              <div>
                <span className="text-3xl font-heading font-bold text-eco-forest">
                  {data.estimatedAnnualFootprint.toLocaleString()}
                </span>
                <span className="text-sm text-eco-sage ml-1">kg CO₂e / year</span>
              </div>
              <div className="flex-1">
                <div className="flex justify-between text-xs text-eco-sage mb-1">
                  <span>Your footprint</span>
                  <span>Global avg: 4,000 kg</span>
                </div>
                <div className="h-2.5 bg-eco-bg-alt rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${Math.min((data.estimatedAnnualFootprint / 8000) * 100, 100)}%`,
                      backgroundColor: data.estimatedAnnualFootprint < 2000 ? '#3D8B5D'
                        : data.estimatedAnnualFootprint < 4000 ? '#f59e0b' : '#ef4444'
                    }} />
                </div>
                <p className="text-xs mt-1 font-medium" style={{
                  color: data.estimatedAnnualFootprint < 2000 ? '#3D8B5D'
                    : data.estimatedAnnualFootprint < 4000 ? '#f59e0b' : '#ef4444'
                }}>
                  {data.estimatedAnnualFootprint < 2000 ? '🌿 Excellent — well below global average!'
                    : data.estimatedAnnualFootprint < 4000 ? '🌱 Good — near the global average'
                    : '⚠️ Above global average — set goals to reduce!'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ── Recent Carbon Logs Table (milestone requirement) ── */}
        <div className="eco-card p-5 scroll-reveal">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-heading font-bold text-eco-forest">Recent Carbon Logs</h3>
              <p className="text-xs text-eco-sage">Latest 5 emission entries — date, category, total.</p>
            </div>
            <button onClick={() => onNavigate('carbonlog')}
              className="flex items-center gap-1 text-sm text-eco-green hover:text-eco-forest transition-colors font-medium">
              View All Logs <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-eco-bg-alt">
                  <th className="text-left py-3 px-3 text-xs font-semibold text-eco-sage uppercase tracking-wide">Date</th>
                  <th className="text-left py-3 px-3 text-xs font-semibold text-eco-sage uppercase tracking-wide">Category</th>
                  <th className="text-left py-3 px-3 text-xs font-semibold text-eco-sage uppercase tracking-wide">Activity</th>
                  <th className="text-right py-3 px-3 text-xs font-semibold text-eco-sage uppercase tracking-wide">kg CO₂e</th>
                  <th className="text-right py-3 px-3 text-xs font-semibold text-eco-sage uppercase tracking-wide">Action</th>
                </tr>
              </thead>
              <tbody>
                {recentLogs.length > 0 ? recentLogs.map((entry) => (
                  <tr key={entry.id} className="border-b border-eco-bg-alt/50 hover:bg-eco-bg/50 transition-colors">
                    <td className="py-3.5 px-3 text-sm text-eco-forest font-medium whitespace-nowrap">{entry.date}</td>
                    <td className="py-3.5 px-3">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${catColorMap[entry.category.toLowerCase()] ?? 'bg-gray-100 text-gray-700'}`}>
                        {entry.category.charAt(0).toUpperCase() + entry.category.slice(1)}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-sm text-eco-forest max-w-[180px] truncate">{entry.activity}</td>
                    <td className="py-3.5 px-3 text-sm font-bold text-eco-forest text-right">{entry.amount.toFixed(2)}</td>
                    <td className="py-3.5 px-3 text-right">
                      <button onClick={() => onNavigate('carbonlog')}
                        className="text-xs text-eco-green hover:underline font-medium">
                        View Details
                      </button>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={5} className="py-10 text-center text-eco-sage text-sm">
                      No logs yet.{' '}
                      <button onClick={() => onNavigate('survey')} className="text-eco-green font-semibold hover:underline">
                        Complete lifestyle survey to auto-generate logs →
                      </button>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </section>
  );
}
