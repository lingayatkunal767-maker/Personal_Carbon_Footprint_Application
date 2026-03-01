import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import {
  Download,
  UserCog,
  Calendar,
  Filter,
  Table2,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Leaf,
  Utensils,
  MoreVertical
} from 'lucide-react';
import type { User as UserType, View } from '../App';

interface CarbonLogProps {
  user: NonNullable<UserType>;
  onNavigate: (view: View) => void;
}

export function CarbonLog({ user, onNavigate }: CarbonLogProps) {
  const [activeCategory, setActiveCategory] = useState<'all' | 'transport' | 'energy'>('all');
  const [viewMode, setViewMode] = useState<'table' | 'chart'>('table');
  const [currentPage, setCurrentPage] = useState(1);
  const sectionRef = useRef<HTMLElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [logEntries, setLogEntries] = useState<{ date: string; transport: number; food: number; energy: number; total: number; flagged?: boolean }[]>([]);
  const [trendData, setTrendData] = useState<{ month: string; value: number }[]>([]);
  const [totalPages, setTotalPages] = useState(26);
  const [totalRecords, setTotalRecords] = useState(128);
  const [summaryStats, setSummaryStats] = useState({ avgMonthly: 356, bestCategory: 'Food & Diet', totalAudited: 2481 });

  useEffect(() => {
    const fetchCarbonLogData = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/carbonlog/${user.id}`, {
          params: { page: currentPage, category: activeCategory }
        });
        setLogEntries(res.data.entries || []);
        setTrendData(res.data.trendData || []);
        setTotalPages(res.data.totalPages || 26);
        setTotalRecords(res.data.totalRecords || 128);
        setSummaryStats(res.data.summaryStats || { avgMonthly: 356, bestCategory: 'Food & Diet', totalAudited: 2481 });
      } catch {
        // Development fallback: use mock data when backend is unavailable
        setLogEntries([
          { date: '2024-05-12', transport: 120, food: 85, energy: 143, total: 348 },
          { date: '2024-05-05', transport: 145, food: 92, energy: 138, total: 375, flagged: true },
          { date: '2024-04-28', transport: 110, food: 80, energy: 150, total: 340 },
          { date: '2024-04-21', transport: 135, food: 88, energy: 142, total: 365 },
          { date: '2024-04-14', transport: 125, food: 90, energy: 140, total: 355 },
        ]);
        setTrendData([
          { month: 'Jan', value: 320 },
          { month: 'Feb', value: 345 },
          { month: 'Mar', value: 360 },
          { month: 'Apr', value: 340 },
          { month: 'May', value: 348 },
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCarbonLogData();
  }, [user.id, currentPage, activeCategory]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -10% 0px' }
    );

    const elements = sectionRef.current?.querySelectorAll('.scroll-reveal');
    elements?.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-eco-forest text-white text-xs px-3 py-1.5 rounded-lg shadow-lg">
          <p>{`${payload[0].value} kg CO₂e`}</p>
        </div>
      );
    }
    return null;
  };

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1, 2, 3, '...', totalPages);
    }
    return pages;
  };

  return (
    <section
      ref={sectionRef}
      className="min-h-screen bg-eco-bg pt-20 pb-8 px-4 sm:px-6 lg:px-8"
    >
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6 scroll-reveal">
          <div>
            <h1 className="text-2xl sm:text-3xl font-heading font-bold text-eco-forest">
              Carbon History
            </h1>
            <p className="text-sm text-eco-sage mt-1">Analyze your environmental progress and historical log data.</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-[rgba(61,139,93,0.22)] rounded-xl text-sm font-medium text-eco-forest hover:shadow-md transition-all">
              <Download className="w-4 h-4" />
              Export CSV
            </button>
            <button
              onClick={() => onNavigate('survey')}
              className="flex items-center gap-2 px-4 py-2.5 bg-eco-green text-white rounded-xl text-sm font-medium hover:bg-[#2d6b47] transition-all"
            >
              <UserCog className="w-4 h-4" />
              Update Profile
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6 scroll-reveal">
          <div className="flex items-center gap-3 flex-wrap">
            {/* Date Range */}
            <button className="flex items-center gap-2 px-3.5 py-2 bg-white border border-[rgba(61,139,93,0.15)] rounded-xl text-sm text-eco-forest hover:border-eco-green/30 transition-colors">
              <Calendar className="w-4 h-4 text-eco-sage" />
              Feb 1, 2026 - Mar 1, 2026
            </button>

            {/* Category Filters */}
            <div className="flex items-center gap-1">
              <Filter className="w-4 h-4 text-eco-sage mr-1" />
              {(['all', 'transport', 'energy'] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${activeCategory === cat
                    ? 'bg-eco-green text-white'
                    : 'text-eco-sage hover:bg-eco-bg-alt'
                    }`}
                >
                  {cat === 'all' ? 'All Categories' : cat.charAt(0).toUpperCase() + cat.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* View Toggle */}
          <div className="flex items-center rounded-xl border border-[rgba(61,139,93,0.15)] overflow-hidden bg-white">
            <button
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium transition-colors ${viewMode === 'table' ? 'bg-eco-green text-white' : 'text-eco-sage hover:bg-eco-bg-alt'
                }`}
            >
              <Table2 className="w-3.5 h-3.5" />
              Table View
            </button>
            <button
              onClick={() => setViewMode('chart')}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium transition-colors ${viewMode === 'chart' ? 'bg-eco-green text-white' : 'text-eco-sage hover:bg-eco-bg-alt'
                }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              Trend Chart
            </button>
          </div>
        </div>

        {/* Main Content */}
        {viewMode === 'table' ? (
          <div className="eco-card p-5 mb-6 scroll-reveal">
            {/* Table Header */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-heading font-bold text-eco-forest">Detailed Logs</h3>
                <p className="text-xs text-eco-sage">Showing 5 of {totalRecords} total records</p>
              </div>
              <span className="text-sm font-medium text-eco-green">Efficiency: +12.4% vs last month</span>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-eco-bg-alt">
                    <th className="text-left py-3 px-3 text-xs font-semibold text-eco-sage uppercase tracking-wide">Date</th>
                    <th className="text-center py-3 px-3 text-xs font-semibold text-eco-sage uppercase tracking-wide">Transport (kg)</th>
                    <th className="text-center py-3 px-3 text-xs font-semibold text-eco-sage uppercase tracking-wide">Food (kg)</th>
                    <th className="text-center py-3 px-3 text-xs font-semibold text-eco-sage uppercase tracking-wide">Energy (kg)</th>
                    <th className="text-center py-3 px-3 text-xs font-semibold text-eco-sage uppercase tracking-wide">Total (kg)</th>
                    <th className="text-right py-3 px-3 text-xs font-semibold text-eco-sage uppercase tracking-wide">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {logEntries.map((entry, index) => (
                    <tr key={index} className="border-b border-eco-bg-alt/50 hover:bg-eco-bg/50 transition-colors">
                      <td className="py-4 px-3 text-sm text-eco-forest font-medium">{entry.date}</td>
                      <td className="py-4 px-3 text-sm text-eco-forest text-center">{entry.transport}</td>
                      <td className="py-4 px-3 text-sm text-eco-forest text-center">{entry.food}</td>
                      <td className="py-4 px-3 text-sm text-eco-forest text-center">{entry.energy}</td>
                      <td className="py-4 px-3 text-center">
                        <span className="text-sm font-bold text-eco-forest">
                          {entry.total}
                        </span>
                        {entry.flagged && (
                          <span className="text-red-500 ml-1 text-xs">★</span>
                        )}
                      </td>
                      <td className="py-4 px-3 text-right">
                        <button className="text-sm text-eco-green hover:text-eco-forest font-medium transition-colors">
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-eco-bg-alt">
              <p className="text-xs text-eco-sage">Showing 1-5 of {totalRecords} entries</p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  className="p-1.5 rounded-lg hover:bg-eco-bg-alt transition-colors text-eco-sage"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                {getPageNumbers().map((page, index) => (
                  <button
                    key={index}
                    onClick={() => typeof page === 'number' && setCurrentPage(page)}
                    className={`min-w-[32px] h-8 rounded-lg text-xs font-medium transition-colors ${page === currentPage
                      ? 'bg-eco-green text-white'
                      : typeof page === 'number'
                        ? 'text-eco-sage hover:bg-eco-bg-alt'
                        : 'text-eco-sage cursor-default'
                      }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  className="p-1.5 rounded-lg hover:bg-eco-bg-alt transition-colors text-eco-sage"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Trend Chart View */
          <div className="eco-card p-5 mb-6 scroll-reveal">
            <h3 className="text-lg font-heading font-bold text-eco-forest mb-1">Emission Trend</h3>
            <p className="text-xs text-eco-sage mb-4">Monthly emission trend over time</p>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="historyGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3D8B5D" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3D8B5D" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E9F3EB" />
                  <XAxis
                    dataKey="month"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#6B8A76', fontSize: 12 }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#6B8A76', fontSize: 12 }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#3D8B5D"
                    strokeWidth={2}
                    fill="url(#historyGradient)"
                    dot={{ r: 4, fill: '#3D8B5D', strokeWidth: 2, stroke: '#fff' }}
                    activeDot={{ r: 6, fill: '#3D8B5D', strokeWidth: 2, stroke: '#fff' }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Summary Stats Footer */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 scroll-reveal">
          <div className="eco-card p-5 flex items-center gap-4">
            <div className="w-11 h-11 bg-eco-green/10 rounded-xl flex items-center justify-center flex-shrink-0">
              <Leaf className="w-5 h-5 text-eco-green" />
            </div>
            <div>
              <p className="text-xs text-eco-sage font-medium uppercase tracking-wide">Average Monthly</p>
              <p className="text-xl font-heading font-bold text-eco-forest">{summaryStats.avgMonthly} kg CO2e</p>
            </div>
          </div>

          <div className="eco-card p-5 flex items-center gap-4">
            <div className="w-11 h-11 bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <Utensils className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-xs text-eco-sage font-medium uppercase tracking-wide">Best Category</p>
              <p className="text-xl font-heading font-bold text-eco-forest">{summaryStats.bestCategory}</p>
            </div>
          </div>

          <div className="eco-card p-5 flex items-center gap-4">
            <div className="w-11 h-11 bg-eco-bg-alt rounded-xl flex items-center justify-center flex-shrink-0">
              <MoreVertical className="w-5 h-5 text-eco-sage" />
            </div>
            <div>
              <p className="text-xs text-eco-sage font-medium uppercase tracking-wide">Total Audited</p>
              <p className="text-xl font-heading font-bold text-eco-forest">{summaryStats.totalAudited.toLocaleString()} kg</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}