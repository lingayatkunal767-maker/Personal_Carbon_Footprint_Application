import { useState, useEffect, useRef } from 'react';
import { api } from '../lib/api';
import type { AdminAnalyticsDto, AdminUserDto, BadgeDto, BadgeReq } from '../lib/api';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';
import {
  Users, Leaf, Target, Award, Plus, X, Loader2,
  TrendingUp, Shield, Trash2, Edit2, CheckCircle, AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';
import type { User as UserType, View } from '../App';

interface AdminDashboardProps {
  user: NonNullable<UserType>;
  onNavigate: (view: View) => void;
}

const ICON_OPTIONS = ['Leaf','Car','Zap','TreePine','Bike','Recycle','Sun','Droplets','Wind','Award','Target','Shield'];
const COLOR_OPTIONS = [
  { label: 'Green',  color: 'text-green-600',  bg: 'bg-green-100' },
  { label: 'Blue',   color: 'text-blue-600',   bg: 'bg-blue-100' },
  { label: 'Yellow', color: 'text-yellow-600', bg: 'bg-yellow-100' },
  { label: 'Red',    color: 'text-red-600',    bg: 'bg-red-100' },
  { label: 'Purple', color: 'text-purple-600', bg: 'bg-purple-100' },
  { label: 'Orange', color: 'text-orange-600', bg: 'bg-orange-100' },
  { label: 'Cyan',   color: 'text-cyan-600',   bg: 'bg-cyan-100' },
];
const PIE_COLORS = ['#3D8B5D','#f59e0b','#3b82f6','#8b5cf6','#ef4444'];

const emptyBadge: BadgeReq = {
  name: '', description: '', icon: 'Leaf', category: 'general',
  thresholdKg: 0, color: 'text-green-600', bgColor: 'bg-green-100', active: true,
};

export function AdminDashboard({ user, onNavigate }: AdminDashboardProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const [activeTab, setActiveTab]       = useState<'overview' | 'users' | 'badges' | 'goals'>('overview');
  const [analytics, setAnalytics]       = useState<AdminAnalyticsDto | null>(null);
  const [users, setUsers]               = useState<AdminUserDto[]>([]);
  const [badges, setBadges]             = useState<BadgeDto[]>([]);
  const [loading, setLoading]           = useState(true);
  const [showBadgeModal, setShowBadgeModal] = useState(false);
  const [editingBadge, setEditingBadge] = useState<BadgeDto | null>(null);
  const [badgeForm, setBadgeForm]       = useState<BadgeReq>(emptyBadge);
  const [saving, setSaving]             = useState(false);
  const [goalForm, setGoalForm]         = useState({
    title: '', description: '', category: 'transport',
    targetAmount: '', deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  });
  const [postingGoal, setPostingGoal]   = useState(false);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [a, u, b] = await Promise.all([
        api.admin.getAnalytics(),
        api.admin.getUsers(),
        api.admin.getBadges(),
      ]);
      setAnalytics(a);
      setUsers(u);
      setBadges(b);
    } catch (e: any) {
      toast.error('Failed to load admin data: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadAll(); }, []);

  useEffect(() => {
    const obs = new IntersectionObserver(
      es => es.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); }),
      { threshold: 0.05 }
    );
    sectionRef.current?.querySelectorAll('.scroll-reveal').forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, [loading, activeTab]);

  const openCreateBadge = () => {
    setEditingBadge(null);
    setBadgeForm(emptyBadge);
    setShowBadgeModal(true);
  };

  const openEditBadge = (badge: BadgeDto) => {
    setEditingBadge(badge);
    setBadgeForm({
      name: badge.name, description: badge.description, icon: badge.icon,
      category: badge.category, thresholdKg: badge.thresholdKg,
      color: badge.color, bgColor: badge.bgColor, active: badge.active,
    });
    setShowBadgeModal(true);
  };

  const handleSaveBadge = async () => {
    if (!badgeForm.name.trim()) { toast.error('Badge name is required'); return; }
    if (!badgeForm.description.trim()) { toast.error('Description is required'); return; }
    setSaving(true);
    try {
      if (editingBadge) {
        await api.admin.updateBadge(editingBadge.id, badgeForm);
        toast.success('Badge updated!');
      } else {
        await api.admin.createBadge(badgeForm);
        toast.success('Badge created!');
      }
      setShowBadgeModal(false);
      loadAll();
    } catch (e: any) {
      toast.error(e.message || 'Failed to save badge');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteBadge = async (id: number) => {
    if (!confirm('Delete this badge?')) return;
    try {
      await api.admin.deleteBadge(id);
      toast.success('Badge deleted');
      loadAll();
    } catch (e: any) {
      toast.error(e.message || 'Failed to delete');
    }
  };

  const handleChangeRole = async (userId: number, currentRole: string) => {
    const newRole = currentRole === 'ADMIN' ? 'USER' : 'ADMIN';
    if (!confirm(`Change role to ${newRole}?`)) return;
    try {
      await api.admin.changeRole(userId, newRole);
      toast.success(`Role changed to ${newRole}`);
      loadAll();
    } catch (e: any) {
      toast.error(e.message || 'Failed to change role');
    }
  };

  const handlePostGoal = async () => {
    if (!goalForm.title.trim()) { toast.error('Title is required'); return; }
    if (!goalForm.targetAmount) { toast.error('Target is required'); return; }
    setPostingGoal(true);
    try {
      await api.admin.createGlobalGoal({
        ...goalForm,
        targetAmount: parseFloat(goalForm.targetAmount),
      });
      toast.success('Community goal posted!');
      setGoalForm({ title: '', description: '', category: 'transport', targetAmount: '',
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] });
    } catch (e: any) {
      toast.error(e.message || 'Failed to post goal');
    } finally {
      setPostingGoal(false);
    }
  };

  const pieData = Object.entries(analytics?.categoryBreakdown ?? {}).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1), value,
  }));

  if (loading) return (
    <section className="min-h-screen bg-eco-bg pt-20 flex items-center justify-center">
      <div className="animate-spin w-8 h-8 border-4 border-eco-green border-t-transparent rounded-full" />
    </section>
  );

  return (
    <section ref={sectionRef} className="min-h-screen bg-eco-bg pt-20 pb-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="mb-6 scroll-reveal">
          <div className="flex items-center gap-3 mb-1">
            <Shield className="w-7 h-7 text-eco-green" />
            <h1 className="text-2xl sm:text-3xl font-heading font-bold text-eco-forest">Admin Dashboard</h1>
          </div>
          <p className="text-sm text-eco-sage">Community management & aggregate analytics</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 scroll-reveal flex-wrap">
          {(['overview', 'users', 'badges', 'goals'] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 rounded-xl text-sm font-medium transition-colors ${
                activeTab === tab ? 'bg-eco-green text-white' : 'bg-white text-eco-sage hover:bg-eco-green/10'
              }`}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* ── OVERVIEW TAB ── */}
        {activeTab === 'overview' && (
          <div className="space-y-6">

            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 scroll-reveal">
              {[
                { label: 'Total Users',       value: analytics?.totalUsers ?? 0,          icon: Users,      color: 'bg-blue-100 text-blue-600' },
                { label: 'Total CO₂e (kg)',   value: analytics?.totalCarbonKg ?? 0,        icon: Leaf,       color: 'bg-green-100 text-green-600' },
                { label: 'Avg per User (kg)', value: analytics?.avgCarbonPerUser ?? 0,     icon: TrendingUp, color: 'bg-yellow-100 text-yellow-600' },
                { label: 'Goals Created',     value: analytics?.totalGoals ?? 0,           icon: Target,     color: 'bg-purple-100 text-purple-600' },
              ].map((kpi, i) => (
                <div key={i} className="eco-card p-5">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${kpi.color}`}>
                    <kpi.icon className="w-5 h-5" />
                  </div>
                  <p className="text-2xl font-heading font-bold text-eco-forest">{kpi.value}</p>
                  <p className="text-xs text-eco-sage mt-0.5">{kpi.label}</p>
                </div>
              ))}
            </div>

            {/* Category Pie Chart + Top Users */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 scroll-reveal">

              {/* Category Breakdown Pie */}
              <div className="eco-card p-5">
                <h3 className="text-lg font-heading font-bold text-eco-forest mb-1">Category Popularity</h3>
                <p className="text-xs text-eco-sage mb-4">Which categories are most logged system-wide</p>
                {pieData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" outerRadius={80}
                        dataKey="value" nameKey="name" label={({ name, percent }) =>
                          `${name} ${(percent * 100).toFixed(0)}%`}>
                        {pieData.map((_, i) => (
                          <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v: any) => `${v} kg`} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-52 flex items-center justify-center text-eco-sage text-sm">
                    No data yet — users need to log entries
                  </div>
                )}
              </div>

              {/* Community Stats */}
              <div className="eco-card p-5">
                <h3 className="text-lg font-heading font-bold text-eco-forest mb-4">Community Stats</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-eco-bg rounded-xl">
                    <span className="text-sm text-eco-forest">Total Community CO₂e</span>
                    <span className="font-bold text-eco-forest">{analytics?.totalCarbonKg ?? 0} kg</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-eco-bg rounded-xl">
                    <span className="text-sm text-eco-forest">Average Footprint / User</span>
                    <span className="font-bold text-eco-forest">{analytics?.avgCarbonPerUser ?? 0} kg</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-eco-bg rounded-xl">
                    <span className="text-sm text-eco-forest">Global Average</span>
                    <span className="font-bold text-eco-sage">4,000 kg / year</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-eco-bg rounded-xl">
                    <span className="text-sm text-eco-forest">Goals Completed</span>
                    <span className="font-bold text-eco-green">{analytics?.completedGoals ?? 0} / {analytics?.totalGoals ?? 0}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-eco-bg rounded-xl">
                    <span className="text-sm text-eco-forest">Active Trackers</span>
                    <span className="font-bold text-eco-forest">{analytics?.activeUsers ?? 0} users</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Top Users Table */}
            <div className="eco-card p-5 scroll-reveal">
              <h3 className="text-lg font-heading font-bold text-eco-forest mb-4">Top Carbon Loggers</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-eco-bg-alt">
                      <th className="text-left py-3 px-3 text-xs font-semibold text-eco-sage uppercase">#</th>
                      <th className="text-left py-3 px-3 text-xs font-semibold text-eco-sage uppercase">Name</th>
                      <th className="text-left py-3 px-3 text-xs font-semibold text-eco-sage uppercase">Email</th>
                      <th className="text-right py-3 px-3 text-xs font-semibold text-eco-sage uppercase">Total kg CO₂e</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(analytics?.topUsers ?? []).map((u, i) => (
                      <tr key={u.id} className="border-b border-eco-bg-alt/50 hover:bg-eco-bg/50 transition-colors">
                        <td className="py-3 px-3 text-sm font-bold text-eco-sage">{i + 1}</td>
                        <td className="py-3 px-3 text-sm font-medium text-eco-forest">{u.name}</td>
                        <td className="py-3 px-3 text-sm text-eco-sage">{u.email}</td>
                        <td className="py-3 px-3 text-sm font-bold text-eco-forest text-right">{u.totalKg}</td>
                      </tr>
                    ))}
                    {(analytics?.topUsers ?? []).length === 0 && (
                      <tr><td colSpan={4} className="py-8 text-center text-eco-sage text-sm">No data yet</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ── USERS TAB ── */}
        {activeTab === 'users' && (
          <div className="eco-card p-5 scroll-reveal">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-heading font-bold text-eco-forest">All Users ({users.length})</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-eco-bg-alt">
                    <th className="text-left py-3 px-3 text-xs font-semibold text-eco-sage uppercase">Name</th>
                    <th className="text-left py-3 px-3 text-xs font-semibold text-eco-sage uppercase">Email</th>
                    <th className="text-center py-3 px-3 text-xs font-semibold text-eco-sage uppercase">Role</th>
                    <th className="text-center py-3 px-3 text-xs font-semibold text-eco-sage uppercase">Status</th>
                    <th className="text-right py-3 px-3 text-xs font-semibold text-eco-sage uppercase">Total kg</th>
                    <th className="text-right py-3 px-3 text-xs font-semibold text-eco-sage uppercase">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id} className="border-b border-eco-bg-alt/50 hover:bg-eco-bg/50 transition-colors">
                      <td className="py-3 px-3 text-sm font-medium text-eco-forest">{u.name}</td>
                      <td className="py-3 px-3 text-sm text-eco-sage">{u.email}</td>
                      <td className="py-3 px-3 text-center">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          u.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                        }`}>{u.role}</span>
                      </td>
                      <td className="py-3 px-3 text-center">
                        {u.enabled
                          ? <CheckCircle className="w-4 h-4 text-eco-success mx-auto" />
                          : <AlertCircle className="w-4 h-4 text-eco-error mx-auto" />}
                      </td>
                      <td className="py-3 px-3 text-sm font-bold text-eco-forest text-right">{u.totalKg}</td>
                      <td className="py-3 px-3 text-right">
                        <button onClick={() => handleChangeRole(u.id, u.role)}
                          className="text-xs text-eco-green hover:underline font-medium">
                          {u.role === 'ADMIN' ? 'Remove Admin' : 'Make Admin'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── BADGES TAB ── */}
        {activeTab === 'badges' && (
          <div className="scroll-reveal">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-heading font-bold text-eco-forest">Badge Management</h3>
              <button onClick={openCreateBadge}
                className="flex items-center gap-2 px-4 py-2 bg-eco-green text-white rounded-xl text-sm font-medium hover:bg-[#2d6b47] transition-all">
                <Plus className="w-4 h-4" /> New Badge
              </button>
            </div>

            {badges.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {badges.map(badge => (
                  <div key={badge.id} className="eco-card p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className={`w-12 h-12 rounded-xl ${badge.bgColor || 'bg-green-100'} flex items-center justify-center`}>
                        <Award className={`w-6 h-6 ${badge.color || 'text-green-600'}`} />
                      </div>
                      <div className="flex gap-1">
                        <button onClick={() => openEditBadge(badge)}
                          className="p-1.5 hover:bg-eco-bg-alt rounded-lg transition-colors">
                          <Edit2 className="w-4 h-4 text-eco-sage" />
                        </button>
                        <button onClick={() => handleDeleteBadge(badge.id)}
                          className="p-1.5 hover:bg-red-50 rounded-lg transition-colors">
                          <Trash2 className="w-4 h-4 text-red-400" />
                        </button>
                      </div>
                    </div>
                    <p className="font-semibold text-eco-forest mb-1">{badge.name}</p>
                    <p className="text-xs text-eco-sage mb-2">{badge.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-eco-sage capitalize">{badge.category}</span>
                      <span className="text-xs font-medium text-eco-forest">{badge.thresholdKg} kg threshold</span>
                    </div>
                    <span className={`inline-block mt-2 text-xs px-2 py-0.5 rounded-full ${
                      badge.active ? 'bg-eco-green/10 text-eco-green' : 'bg-gray-100 text-gray-500'
                    }`}>{badge.active ? 'Active' : 'Inactive'}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="eco-card p-10 text-center">
                <Award className="w-12 h-12 text-eco-sage/30 mx-auto mb-3" />
                <p className="text-eco-sage text-sm mb-4">No badges created yet. Create your first badge!</p>
                <button onClick={openCreateBadge} className="eco-button px-6 py-2.5 text-sm">
                  Create First Badge
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── GOALS TAB ── */}
        {activeTab === 'goals' && (
          <div className="scroll-reveal">
            <div className="eco-card p-6 max-w-2xl">
              <h3 className="text-lg font-heading font-bold text-eco-forest mb-2">Post Community Challenge</h3>
              <p className="text-sm text-eco-sage mb-5">
                Create a global sustainability goal that will be visible to all users as a community challenge.
              </p>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-eco-forest mb-1.5">Goal Title *</label>
                  <input type="text" value={goalForm.title}
                    onChange={e => setGoalForm(f => ({ ...f, title: e.target.value }))}
                    placeholder="e.g. Community Transport Challenge — Reduce by 20%" className="eco-input" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-eco-forest mb-1.5">Description</label>
                  <textarea value={goalForm.description}
                    onChange={e => setGoalForm(f => ({ ...f, description: e.target.value }))}
                    placeholder="Describe the community challenge and how users can participate..."
                    className="eco-input min-h-[80px] resize-none" />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-eco-forest mb-1.5">Category</label>
                    <select value={goalForm.category}
                      onChange={e => setGoalForm(f => ({ ...f, category: e.target.value }))}
                      className="eco-input appearance-none">
                      <option value="transport">Transport</option>
                      <option value="energy">Energy</option>
                      <option value="food">Food</option>
                      <option value="shopping">Shopping</option>
                      <option value="general">General</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-eco-forest mb-1.5">Target (kg CO₂e) *</label>
                    <input type="number" min="1" value={goalForm.targetAmount}
                      onChange={e => setGoalForm(f => ({ ...f, targetAmount: e.target.value }))}
                      placeholder="e.g. 500" className="eco-input" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-eco-forest mb-1.5">Deadline *</label>
                    <input type="date" value={goalForm.deadline}
                      onChange={e => setGoalForm(f => ({ ...f, deadline: e.target.value }))}
                      className="eco-input" />
                  </div>
                </div>
                <button onClick={handlePostGoal} disabled={postingGoal}
                  className="eco-button w-full py-3 text-sm disabled:opacity-70 flex items-center justify-center gap-2">
                  {postingGoal
                    ? <><Loader2 className="w-4 h-4 animate-spin" /> Posting...</>
                    : <><Plus className="w-4 h-4" /> Post Community Goal</>}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Badge Modal */}
      {showBadgeModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="eco-card p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-heading font-bold text-eco-forest">
                {editingBadge ? 'Edit Badge' : 'Create New Badge'}
              </h3>
              <button onClick={() => setShowBadgeModal(false)}
                className="p-1 hover:bg-eco-bg-alt rounded-lg transition-colors">
                <X className="w-5 h-5 text-eco-sage" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-eco-forest mb-1.5">Badge Name *</label>
                <input type="text" value={badgeForm.name}
                  onChange={e => setBadgeForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. Tree Planter" className="eco-input" />
              </div>
              <div>
                <label className="block text-sm font-medium text-eco-forest mb-1.5">Description *</label>
                <input type="text" value={badgeForm.description}
                  onChange={e => setBadgeForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="e.g. Save 50 kg CO₂e through transport choices" className="eco-input" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-eco-forest mb-1.5">Category</label>
                  <select value={badgeForm.category}
                    onChange={e => setBadgeForm(f => ({ ...f, category: e.target.value }))}
                    className="eco-input appearance-none">
                    <option value="transport">Transport</option>
                    <option value="energy">Energy</option>
                    <option value="food">Food</option>
                    <option value="general">General</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-eco-forest mb-1.5">Threshold (kg CO₂e)</label>
                  <input type="number" min="0" value={badgeForm.thresholdKg}
                    onChange={e => setBadgeForm(f => ({ ...f, thresholdKg: parseFloat(e.target.value) || 0 }))}
                    placeholder="50" className="eco-input" />
                </div>
              </div>

              {/* Icon picker */}
              <div>
                <label className="block text-sm font-medium text-eco-forest mb-1.5">Icon</label>
                <div className="flex flex-wrap gap-2">
                  {ICON_OPTIONS.map(icon => (
                    <button key={icon} type="button"
                      onClick={() => setBadgeForm(f => ({ ...f, icon }))}
                      className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${
                        badgeForm.icon === icon
                          ? 'border-eco-green bg-eco-green/10 text-eco-green font-medium'
                          : 'border-eco-bg-alt text-eco-sage hover:border-eco-green/30'
                      }`}>
                      {icon}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color picker */}
              <div>
                <label className="block text-sm font-medium text-eco-forest mb-1.5">Color</label>
                <div className="flex flex-wrap gap-2">
                  {COLOR_OPTIONS.map(opt => (
                    <button key={opt.label} type="button"
                      onClick={() => setBadgeForm(f => ({ ...f, color: opt.color, bgColor: opt.bg }))}
                      className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg border transition-colors ${
                        badgeForm.color === opt.color
                          ? 'border-eco-green bg-eco-green/10 font-medium text-eco-green'
                          : 'border-eco-bg-alt text-eco-sage hover:border-eco-green/30'
                      }`}>
                      <span className={`w-3 h-3 rounded-full ${opt.bg}`} />
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Preview */}
              <div className="p-4 bg-eco-bg rounded-xl">
                <p className="text-xs text-eco-sage mb-2">Preview:</p>
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-xl ${badgeForm.bgColor} flex items-center justify-center`}>
                    <Award className={`w-6 h-6 ${badgeForm.color}`} />
                  </div>
                  <div>
                    <p className="font-semibold text-eco-forest text-sm">{badgeForm.name || 'Badge Name'}</p>
                    <p className="text-xs text-eco-sage">{badgeForm.description || 'Badge description'}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={badgeForm.active}
                    onChange={e => setBadgeForm(f => ({ ...f, active: e.target.checked }))}
                    className="w-4 h-4 accent-eco-green" />
                  <span className="text-sm text-eco-forest">Active (visible to users)</span>
                </label>
              </div>

              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowBadgeModal(false)}
                  className="eco-button-outline flex-1 py-2.5 text-sm">Cancel</button>
                <button onClick={handleSaveBadge} disabled={saving}
                  className="eco-button flex-1 py-2.5 text-sm disabled:opacity-70">
                  {saving
                    ? <><Loader2 className="w-4 h-4 animate-spin inline mr-1" />Saving...</>
                    : editingBadge ? 'Update Badge' : 'Create Badge'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
