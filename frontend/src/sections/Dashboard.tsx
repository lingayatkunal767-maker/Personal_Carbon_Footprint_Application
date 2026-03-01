import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Leaf,
  Zap,
  Car,
  Utensils,
  Plus,
  ChevronRight,
  MoreHorizontal
} from 'lucide-react';
import type { User as UserType, View } from '../App';

interface DashboardProps {
  user: NonNullable<UserType>;
  onNavigate: (view: View) => void;
}

export function Dashboard({ user, onNavigate }: DashboardProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const [goalPeriod, setGoalPeriod] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<{
    totalFootprint: number;
    footprintChange: number;
    monthlyGoal: { title: string; progress: number; description: string };
    categoryBreakdown: { transport: number; food: number; energy: number };
    emissionTrend: { date: string; value: number }[];
    recentActivity: { date: string; category: string; categoryColor: string; description: string; emission: number }[];
    badges: { name: string; icon: string; color: string; bgGrad: string }[];
  } | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }
      try {
        const res = await axios.get(`http://localhost:5000/api/dashboard/${user.id}`);
        setDashboardData(res.data);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
        // Development fallback: use mock data when backend is unavailable
        setDashboardData({
          totalFootprint: 450.5,
          footprintChange: 1,
          monthlyGoal: { title: 'Reduce transport emission by 25%', progress: 69, description: "You've used 846 rides so far. Keep using public transit!" },
          categoryBreakdown: { transport: 142, food: 98, energy: 210 },
          emissionTrend: [
            { date: '01', value: 35 }, { date: '03', value: 42 }, { date: '05', value: 38 },
            { date: '07', value: 45 }, { date: '09', value: 40 }, { date: '11', value: 55 },
            { date: '13', value: 48 }, { date: '15', value: 52 }, { date: '17', value: 44 },
            { date: '19', value: 50 }, { date: '21', value: 46 }, { date: '23', value: 42 },
            { date: '25', value: 56 }, { date: '27', value: 48 }, { date: '29', value: 44 },
            { date: '31', value: 40 },
          ],
          recentActivity: [
            { date: 'May 12, 2024', category: 'Transport', categoryColor: 'bg-blue-100 text-blue-700', description: 'Commute to Office', emission: 12.4 },
            { date: 'May 11, 2024', category: 'Energy', categoryColor: 'bg-yellow-100 text-yellow-700', description: 'Monthly Electricity Bill', emission: 85.0 },
            { date: 'May 10, 2024', category: 'Food', categoryColor: 'bg-green-100 text-green-700', description: 'Grocery Shopping', emission: 4.2 },
            { date: 'May 09, 2024', category: 'Transport', categoryColor: 'bg-blue-100 text-blue-700', description: 'Weekend Road Trip', emission: 45.8 },
            { date: 'May 08, 2024', category: 'Food', categoryColor: 'bg-green-100 text-green-700', description: 'Dining Out', emission: 6.1 },
          ],
          badges: [
            { name: 'Transport Pro', icon: 'Car', color: 'bg-red-100 text-red-600', bgGrad: 'from-red-50 to-red-100' },
            { name: 'Energy Saver', icon: 'Zap', color: 'bg-green-100 text-green-600', bgGrad: 'from-green-50 to-green-100' },
            { name: 'Tree Planter', icon: 'Leaf', color: 'bg-blue-100 text-blue-600', bgGrad: 'from-blue-50 to-blue-100' },
            { name: 'Eco Monitor', icon: 'TrendingUp', color: 'bg-orange-100 text-orange-600', bgGrad: 'from-orange-50 to-orange-100' },
          ],
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  useEffect(() => {
    if (isLoading) return;

    const elements = sectionRef.current?.querySelectorAll('.scroll-reveal');
    if (!elements?.length) return;

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

    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [isLoading]);

  const emissionTrendData = dashboardData?.emissionTrend || [];
  const transportBars = [65, 80, 55, 90, 70, 85, 60];
  const foodBars = [40, 55, 70, 45, 60, 50, 65];
  const energyBars = [80, 70, 90, 75, 85, 60, 95];
  const recentActivity = dashboardData?.recentActivity || [];

  const badges = [
    { name: 'Transport Pro', icon: Car, color: 'bg-red-100 text-red-600', bgGrad: 'from-red-50 to-red-100' },
    { name: 'Energy Saver', icon: Zap, color: 'bg-green-100 text-green-600', bgGrad: 'from-green-50 to-green-100' },
    { name: 'Tree Planter', icon: Leaf, color: 'bg-blue-100 text-blue-600', bgGrad: 'from-blue-50 to-blue-100' },
    { name: 'Eco Monitor', icon: TrendingUp, color: 'bg-orange-100 text-orange-600', bgGrad: 'from-orange-50 to-orange-100' },
  ];

  const firstName = (
    user?.name?.trim() ||
    user?.email?.split('@')[0] ||
    'User'
  ).split(' ')[0];

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

  return (
    <section
      ref={sectionRef}
      className="min-h-screen bg-eco-bg pt-20 pb-8 px-4 sm:px-6 lg:px-8"
    >
      {isLoading ? (
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin w-8 h-8 border-4 border-eco-green border-t-transparent rounded-full"></div>
        </div>
      ) : (
      <div className="max-w-6xl mx-auto">
        {/* Welcome Header */}
        <div className="mb-6 scroll-reveal">
          <h1 className="text-2xl sm:text-3xl font-heading font-bold text-eco-forest">
            Welcome back, {firstName}!
          </h1>
          <p className="text-sm text-eco-sage mt-1">Here's your environmental impact summary for this week.</p>
        </div>

        {/* Row 1: Stats + Quick Actions + Goal */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6 scroll-reveal">
          {/* Total Footprint */}
          <div className="eco-card p-5">
            <p className="text-xs text-eco-sage font-medium uppercase tracking-wide mb-1">Total Footprint</p>
            <div className="flex items-center justify-between">
              <div>
                <span className="text-3xl font-heading font-bold text-eco-forest">{dashboardData?.totalFootprint || 450.5}</span>
                <span className="text-sm text-eco-sage ml-1">kg CO2e</span>
              </div>
              <div className="w-12 h-12 bg-eco-green/10 rounded-xl flex items-center justify-center">
                <Leaf className="w-6 h-6 text-eco-green" />
              </div>
            </div>
            <div className="flex items-center gap-1 mt-2 text-sm">
              <TrendingUp className="w-3.5 h-3.5 text-eco-error" />
              <span className="text-eco-error font-medium">+{dashboardData?.footprintChange || 1}%</span>
              <span className="text-eco-sage">from previous week</span>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="eco-card p-5">
            <p className="text-xs text-eco-sage font-medium uppercase tracking-wide mb-3">Quick Actions</p>
            <div className="flex gap-3">
              <button
                onClick={() => onNavigate('carbonlog')}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-eco-bg rounded-xl text-sm font-medium text-eco-forest hover:bg-eco-bg-alt transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Log
              </button>
              <button
                onClick={() => onNavigate('goals')}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-eco-bg rounded-xl text-sm font-medium text-eco-forest hover:bg-eco-bg-alt transition-colors"
              >
                <Plus className="w-4 h-4" />
                New Goal
              </button>
            </div>
          </div>

          {/* Monthly Goal */}
          <div className="eco-card p-5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-eco-sage font-medium uppercase tracking-wide">Monthly Goal</p>
              <div className="flex items-center gap-1">
                <span className="text-sm font-bold text-eco-green">{dashboardData?.monthlyGoal?.progress || 69}%</span>
              </div>
            </div>
            <p className="text-sm text-eco-forest font-medium mb-1">{dashboardData?.monthlyGoal?.title || 'Reduce transport emission by 25%'}</p>
            <div className="h-2 bg-eco-bg-alt rounded-full overflow-hidden mb-2">
              <div className="h-full bg-eco-green rounded-full transition-all duration-500" style={{ width: `${dashboardData?.monthlyGoal?.progress || 69}%` }} />
            </div>
            <p className="text-xs text-eco-sage mb-3">{dashboardData?.monthlyGoal?.description || "You've used 846 rides so far. Keep using public transit!"}</p>
            <div className="flex items-center justify-between">
              <button
                onClick={() => onNavigate('goals')}
                className="text-sm font-medium text-eco-green hover:text-eco-forest transition-colors"
              >
                Manage Goals
              </button>
              <div className="flex rounded-lg overflow-hidden border border-[rgba(61,139,93,0.15)]">
                {(['daily', 'weekly', 'monthly'] as const).map((p) => (
                  <button
                    key={p}
                    onClick={() => setGoalPeriod(p)}
                    className={`px-2.5 py-1 text-xs font-medium transition-colors ${goalPeriod === p
                      ? 'bg-eco-green text-white'
                      : 'text-eco-sage hover:bg-eco-bg-alt'
                      }`}
                  >
                    {p.charAt(0).toUpperCase() + p.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Row 2: Category Breakdown */}
        <div className="mb-6 scroll-reveal">
          <h2 className="text-lg font-heading font-bold text-eco-forest mb-4">Category Breakdown</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Transport */}
            <div className="eco-card p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Car className="w-5 h-5 text-blue-600" />
                  <span className="text-sm text-eco-sage">Transport</span>
                </div>
                <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-600 font-medium">Mon ↑</span>
              </div>
              <p className="text-2xl font-heading font-bold text-eco-forest mb-3">{dashboardData?.categoryBreakdown?.transport || 142} kg</p>
              <div className="flex items-end gap-1 h-10">
                {transportBars.map((h, i) => (
                  <div
                    key={i}
                    className="flex-1 bg-red-400 rounded-t-sm transition-all duration-300"
                    style={{ height: `${h}%` }}
                  />
                ))}
              </div>
            </div>

            {/* Food & Diet */}
            <div className="eco-card p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Utensils className="w-5 h-5 text-green-600" />
                  <span className="text-sm text-eco-sage">Food & Diet</span>
                </div>
                <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-600 font-medium flex items-center gap-0.5">
                  <TrendingDown className="w-3 h-3" />
                  4.8%
                </span>
              </div>
              <p className="text-2xl font-heading font-bold text-eco-forest mb-3">{dashboardData?.categoryBreakdown?.food || 98} kg</p>
              <div className="flex items-end gap-1 h-10">
                {foodBars.map((h, i) => (
                  <div
                    key={i}
                    className="flex-1 bg-green-400 rounded-t-sm transition-all duration-300"
                    style={{ height: `${h}%` }}
                  />
                ))}
              </div>
            </div>

            {/* Energy Usage */}
            <div className="eco-card p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-yellow-600" />
                  <span className="text-sm text-eco-sage">Energy Usage</span>
                </div>
                <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-600 font-medium">Low ↑</span>
              </div>
              <p className="text-2xl font-heading font-bold text-eco-forest mb-3">{dashboardData?.categoryBreakdown?.energy || 210} kg</p>
              <div className="flex items-end gap-1 h-10">
                {energyBars.map((h, i) => (
                  <div
                    key={i}
                    className="flex-1 bg-red-400 rounded-t-sm transition-all duration-300"
                    style={{ height: `${h}%` }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Row 3: Emission Trend + Eco Badges */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
          {/* Emission Trend */}
          <div className="lg:col-span-2 eco-card p-5 scroll-reveal">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-heading font-bold text-eco-forest">Emission Trend</h3>
                <p className="text-xs text-eco-sage">Monitoring your carbon impact over the last 7 days</p>
              </div>
              <div className="flex items-center gap-2 text-xs text-eco-sage">
                <span className="w-3 h-3 bg-eco-green/30 rounded-sm inline-block border border-eco-green"></span>
                Current Range
              </div>
            </div>
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={emissionTrendData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="emissionGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3D8B5D" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3D8B5D" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E9F3EB" />
                  <XAxis
                    dataKey="date"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#6B8A76', fontSize: 11 }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#6B8A76', fontSize: 11 }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#3D8B5D"
                    strokeWidth={2}
                    fill="url(#emissionGradient)"
                    dot={false}
                    activeDot={{ r: 4, fill: '#3D8B5D', strokeWidth: 2, stroke: '#fff' }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Eco Badges */}
          <div className="eco-card p-5 scroll-reveal">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-lg font-heading font-bold text-eco-forest">Eco Badges</h3>
            </div>
            <p className="text-xs text-eco-sage mb-4">Your environmental achievements.</p>
            <div className="grid grid-cols-2 gap-3">
              {badges.map((badge, index) => (
                <button
                  key={index}
                  onClick={() => onNavigate('badges')}
                  className={`flex flex-col items-center gap-2 p-3 rounded-xl bg-gradient-to-b ${badge.bgGrad} hover:shadow-md transition-all`}
                >
                  <badge.icon className={`w-5 h-5 ${badge.color.split(' ')[1]}`} />
                  <span className="text-xs font-medium text-eco-forest text-center leading-tight">{badge.name}</span>
                </button>
              ))}
            </div>
            <p className="text-xs text-eco-sage mt-4 text-center italic">
              "The greatest threat to our planet is the belief that someone else will save it."
            </p>
          </div>
        </div>

        {/* Row 4: Recent Activity */}
        <div className="eco-card p-5 scroll-reveal">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-heading font-bold text-eco-forest">Recent Activity</h3>
              <p className="text-xs text-eco-sage">Your latest carbon footprint entries across all categories.</p>
            </div>
            <button
              onClick={() => onNavigate('carbonlog')}
              className="flex items-center gap-1 text-sm text-eco-green hover:text-eco-forest transition-colors font-medium"
            >
              View All History
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-eco-bg-alt">
                  <th className="text-left py-3 px-3 text-xs font-semibold text-eco-sage uppercase tracking-wide">Date</th>
                  <th className="text-left py-3 px-3 text-xs font-semibold text-eco-sage uppercase tracking-wide">Category</th>
                  <th className="text-left py-3 px-3 text-xs font-semibold text-eco-sage uppercase tracking-wide">Activity Description</th>
                  <th className="text-right py-3 px-3 text-xs font-semibold text-eco-sage uppercase tracking-wide">Emission</th>
                  <th className="w-10"></th>
                </tr>
              </thead>
              <tbody>
                {recentActivity.map((entry, index) => (
                  <tr key={index} className="border-b border-eco-bg-alt/50 hover:bg-eco-bg/50 transition-colors">
                    <td className="py-3.5 px-3 text-sm text-eco-forest">{entry.date}</td>
                    <td className="py-3.5 px-3">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${entry.categoryColor}`}>
                        {entry.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-sm text-eco-forest">{entry.description}</td>
                    <td className="py-3.5 px-3 text-sm font-bold text-eco-forest text-right">{entry.emission} kg</td>
                    <td className="py-3.5 px-1">
                      <button className="p-1 rounded hover:bg-eco-bg-alt transition-colors">
                        <MoreHorizontal className="w-4 h-4 text-eco-sage" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      )}
    </section>
  );
}
