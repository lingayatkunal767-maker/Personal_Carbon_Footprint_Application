import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TopBar from '../components/TopBar';
import HeroBanner from '../components/HeroBanner';
import StatSummaryRow from '../components/StatSummaryRow';
import ProfileCard from '../components/ProfileCard';
import GoalsCard from '../components/GoalsCard';
import CarbonFootprintLog from '../components/CarbonFootprintLog';
import EmissionsBreakdown from '../components/EmissionsBreakdown';
import MonthlyComparison from '../components/MonthlyComparison';
import RecentActivity from '../components/RecentActivity';
import EcoTips from '../components/EcoTips';
import LeaderboardCard from '../components/LeaderboardCard';
import EcoBadgesCard from '../components/EcoBadgesCard';
import NotificationsPanel from '../components/NotificationsPanel';
import LogActivityModal from '../components/LogActivityModal';
import '../styles/Dashboard.css';

const DEFAULT_TAGS = ['🌿 Eco Hero', '🚗 Transport Pro', '⚡ Energy Saver'];

const DEFAULT_GOALS = [
  { id: 'goal-1', name: 'Reduce Monthly Emissions by 20%', progress: 40, color: 'linear-gradient(90deg,var(--g-mid),var(--g-light))' },
  { id: 'goal-2', name: 'Switch to Renewable Energy', progress: 65, color: 'linear-gradient(90deg,#4a90d9,#81c784)' },
  { id: 'goal-3', name: 'Plant 50 Trees This Year', progress: 28, color: 'linear-gradient(90deg,var(--gold),#f4c844)' }
];

const DEFAULT_ACTIVITIES = [
  { id: 'act-1', icon: '🚌', name: 'Took the bus to work', time: 'Today, 8:45 AM', deltaKg: -2.4, isPositive: true },
  { id: 'act-2', icon: '✈️', name: 'Short-haul flight', time: 'Yesterday, 3:20 PM', deltaKg: 86, isPositive: false },
  { id: 'act-3', icon: '🌱', name: 'Planted 2 trees', time: '2 days ago', deltaKg: -11, isPositive: true },
  { id: 'act-4', icon: '🥗', name: 'Plant-based meal day', time: '3 days ago', deltaKg: -3.8, isPositive: true },
  { id: 'act-5', icon: '🚲', name: 'Cycled to grocery store', time: '4 days ago', deltaKg: -1.2, isPositive: true }
];

const DEFAULT_TIPS = [
  {
    id: 'tip-1',
    icon: '🚲',
    bg: '#d4edda',
    title: 'Cycle to work twice a week',
    description: 'Replaces short car trips under 5 km',
    savings: 'Save ~18 kg CO₂/month'
  },
  {
    id: 'tip-2',
    icon: '🌡️',
    bg: '#fef3d4',
    title: 'Lower thermostat by 2°C',
    description: 'Small change, big impact on heating bills',
    savings: 'Save ~12 kg CO₂/month'
  },
  {
    id: 'tip-3',
    icon: '🥦',
    bg: '#dceefb',
    title: 'Try 3 meat-free days per week',
    description: 'Significantly cuts food-related emissions',
    savings: 'Save ~22 kg CO₂/month'
  },
  {
    id: 'tip-4',
    icon: '🛁',
    bg: '#fde8e8',
    title: 'Switch baths to 5-min showers',
    description: 'Reduces water heating energy by up to 70%',
    savings: 'Save ~8 kg CO₂/month'
  }
];

const DEFAULT_NOTIFICATIONS = [
  { id: 'notif-1', type: 'alert', icon: '⚠️', text: 'Emissions up 12% this week!', detail: 'Try reducing transport to hit your goal.', isRead: false },
  { id: 'notif-2', type: 'warn', icon: '🎯', text: 'Goal is 40% complete!', detail: "You're halfway to reducing monthly emissions.", isRead: false },
  { id: 'notif-3', type: '', icon: '🏆', text: 'Team Green crossed 800 pts!', detail: 'Leaderboard updated 2 hours ago.', isRead: true },
  { id: 'notif-4', type: '', icon: '🌱', text: 'New personalised Eco Tips ready', detail: 'Check the tips section for new recommendations.', isRead: true },
  { id: 'notif-5', type: '', icon: '🏅', text: '"Transport Pro" badge earned!', detail: 'Congratulations on your 21-day streak!', isRead: true }
];

const DEFAULT_FOOTPRINT = {
  week: { labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], data: [260, 278, 305, 295, 330, 320, 348] },
  month: { labels: ['Wk 1', 'Wk 2', 'Wk 3', 'Wk 4'], data: [1100, 1250, 1180, 1380] },
  year: { labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'], data: [4200, 4050, 3900, 4100, 3800, 3600, 3700, 3850, 3500, 3400, 3600, 3480] }
};

const DEFAULT_BREAKDOWN = [
  { key: 'transport', icon: '🚗', label: 'Transport', value: 142, color: '#2d7a4f' },
  { key: 'energy', icon: '⚡', label: 'Energy', value: 98, color: '#5aaa72' },
  { key: 'food', icon: '🍔', label: 'Food', value: 72, color: '#e8a624' },
  { key: 'shopping', icon: '🛍️', label: 'Shopping', value: 36, color: '#4a90d9' }
];

const DEFAULT_MONTHLY = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
  datasets: [
    { label: '2024', data: [420, 410, 390, 430, 380, 360], backgroundColor: '#d4edda' },
    { label: '2025', data: [390, 370, 350, 400, 340, 320], backgroundColor: '#2d7a4f' }
  ]
};

const DEFAULT_LEADERBOARD = [
  { rank: '🥇', icon: '🌿', name: 'Team Green', score: 845, barWidth: '100%', bg: '#2d7a4f' },
  { rank: '🥈', icon: '🌍', name: 'Team Earth', score: 720, barWidth: '85%', bg: '#e8a624' },
  { rank: '🥉', icon: '♻️', name: 'Team Eco', score: 690, barWidth: '82%', bg: '#5aaa72' }
];

const DEFAULT_BADGES = [
  { id: 'badge-1', icon: '🚗', label: 'Transport Pro', pts: '+200 pts', hexClass: 'bh1', locked: false },
  { id: 'badge-2', icon: '⚡', label: 'Energy Saver', pts: '+150 pts', hexClass: 'bh2', locked: false },
  { id: 'badge-3', icon: '🌳', label: 'Tree Planter', pts: '+180 pts', hexClass: 'bh3', locked: false },
  { id: 'badge-4', icon: '🏃', label: 'Tree Runner', pts: '+120 pts', hexClass: 'bh4', locked: false },
  { id: 'badge-5', icon: '🥦', label: 'Green Eater', pts: '+90 pts', hexClass: 'bh5', locked: false },
  { id: 'badge-6', icon: '🔒', label: 'Solar Champ', pts: 'Locked', hexClass: 'bhL', locked: true },
  { id: 'badge-7', icon: '🔒', label: 'Zero Waste', pts: 'Locked', hexClass: 'bhL', locked: true },
  { id: 'badge-8', icon: '🔒', label: 'Bike Legend', pts: 'Locked', hexClass: 'bhL', locked: true }
];

export default function HomePage() {
  const navigate = useNavigate();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [profile, setProfile] = useState({
    name: 'John',
    email: '',
    memberSince: 'Jan 12, 2022',
    tags: DEFAULT_TAGS
  });
  const [goals, setGoals] = useState(DEFAULT_GOALS);
  const [activities, setActivities] = useState(DEFAULT_ACTIVITIES);
  const [tips, setTips] = useState(DEFAULT_TIPS);
  const [notifications, setNotifications] = useState(DEFAULT_NOTIFICATIONS);
  const [footprintData, setFootprintData] = useState(DEFAULT_FOOTPRINT);
  const [breakdown, setBreakdown] = useState(DEFAULT_BREAKDOWN);
  const [monthlyComparison, setMonthlyComparison] = useState(DEFAULT_MONTHLY);
  const [leaderboard] = useState(DEFAULT_LEADERBOARD);
  const [badges, setBadges] = useState(DEFAULT_BADGES);
  const [weeklyEmissions, setWeeklyEmissions] = useState(348);
  const [co2Saved, setCo2Saved] = useState(84);
  const [ecoPoints, setEcoPoints] = useState(1240);
  const [streakDays, setStreakDays] = useState(21);

  // Authentication guard - check if user is logged in
  useEffect(() => {
    const authToken = localStorage.getItem('auth_token');
    const currentUser = localStorage.getItem('current_user');
    
    if (!authToken || !currentUser) {
      navigate('/login', { replace: true });
      return;
    }
    
    try {
      const user = JSON.parse(currentUser);
      setProfile((prev) => ({
        ...prev,
        name: user.name || 'John',
        email: user.email || '',
        memberSince: user.memberSince || prev.memberSince
      }));
    } catch (err) {
      console.error('Error parsing user data:', err);
      navigate('/login', { replace: true });
    }
  }, [navigate]);

  const handleLogout = () => {
    // Clear authentication data
    localStorage.removeItem('auth_token');
    localStorage.removeItem('current_user');
    
    // Redirect to login page
    navigate('/login', { replace: true });
  };

  const handleProfileSave = (updatedProfile) => {
    setProfile(updatedProfile);
    const currentUser = JSON.parse(localStorage.getItem('current_user') || '{}');
    const mergedUser = { ...currentUser, name: updatedProfile.name, email: updatedProfile.email, memberSince: updatedProfile.memberSince };
    localStorage.setItem('current_user', JSON.stringify(mergedUser));

    const existingUsers = JSON.parse(localStorage.getItem('registered_users') || '[]');
    const updatedUsers = existingUsers.map((user) => {
      if (user.email?.toLowerCase() === currentUser.email?.toLowerCase()) {
        return { ...user, name: updatedProfile.name, email: updatedProfile.email, memberSince: updatedProfile.memberSince };
      }
      return user;
    });
    localStorage.setItem('registered_users', JSON.stringify(updatedUsers));
  };

  const handleOpenModal = () => {
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  const handleToggleNotifications = () => {
    setNotificationsOpen(!notificationsOpen);
  };

  const handleCloseNotifications = () => {
    setNotificationsOpen(false);
  };

  const handleDismissNotification = (notifId) => {
    setNotifications((prev) => prev.filter((notif) => notif.id !== notifId));
  };

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((notif) => ({ ...notif, isRead: true })));
  };

  const handleRefreshTips = () => {
    setTips((prev) => [...prev].sort(() => Math.random() - 0.5));
  };

  const handleAddGoal = (goal) => {
    setGoals((prev) => [...prev, goal]);
  };

  const handleUpdateGoal = (goalId, updates) => {
    setGoals((prev) => prev.map((goal) => (goal.id === goalId ? { ...goal, ...updates } : goal)));
  };

  const handleRemoveGoal = (goalId) => {
    setGoals((prev) => prev.filter((goal) => goal.id !== goalId));
  };

  const handleRemoveActivity = (activityId) => {
    setActivities((prev) => prev.filter((activity) => activity.id !== activityId));
  };

  const handleActivitySave = (activity) => {
    setActivities((prev) => [activity, ...prev]);

    setWeeklyEmissions((prev) => Math.max(0, prev + activity.deltaKg));
    if (activity.deltaKg < 0) {
      setCo2Saved((prev) => Math.max(0, prev + Math.abs(activity.deltaKg)));
      setEcoPoints((prev) => prev + Math.max(1, Math.round(Math.abs(activity.deltaKg) * 2)));
    } else {
      setEcoPoints((prev) => Math.max(0, prev - Math.round(activity.deltaKg)));
    }

    if (activity.categoryKey && activity.deltaKg > 0) {
      setBreakdown((prev) => prev.map((item) => (
        item.key === activity.categoryKey
          ? { ...item, value: Math.max(0, item.value + activity.deltaKg) }
          : item
      )));
    }

    setFootprintData((prev) => {
      const updateSeries = (series) => {
        const updated = [...series.data];
        updated[updated.length - 1] = Math.max(0, updated[updated.length - 1] + activity.deltaKg);
        return { ...series, data: updated };
      };

      return {
        week: updateSeries(prev.week),
        month: updateSeries(prev.month),
        year: updateSeries(prev.year)
      };
    });

    if (activity.deltaKg > 20) {
      setNotifications((prev) => [
        {
          id: `notif-${Date.now()}`,
          type: 'alert',
          icon: '⚠️',
          text: 'High emission activity logged',
          detail: `${activity.name} added ${activity.deltaKg.toFixed(1)} kg CO₂`,
          isRead: false
        },
        ...prev
      ]);
    }

    if (activity.deltaKg < 0) {
      setNotifications((prev) => [
        {
          id: `notif-${Date.now()}-offset`,
          type: '',
          icon: '🌿',
          text: 'Nice work! You offset emissions',
          detail: `${Math.abs(activity.deltaKg).toFixed(1)} kg CO₂ saved`,
          isRead: false
        },
        ...prev
      ]);
    }
  };

  useEffect(() => {
    if (ecoPoints >= 1500) {
      setBadges((prev) => prev.map((badge) => (
        badge.id === 'badge-6' ? { ...badge, locked: false, icon: '☀️', pts: '+220 pts', hexClass: 'bh2' } : badge
      )));
    }
  }, [ecoPoints]);

  const unreadNotifications = useMemo(
    () => notifications.filter((notif) => !notif.isRead).length,
    [notifications]
  );

  const weeklyTrend = useMemo(() => {
    const data = footprintData.week.data;
    const last = data[data.length - 1] || 0;
    const prev = data[data.length - 2] || last;
    const delta = last - prev;
    const pct = prev === 0 ? 0 : Math.round((delta / prev) * 100);
    const sign = delta >= 0 ? '▲' : '▼';
    return `${sign} ${Math.abs(pct)}% vs last week`;
  }, [footprintData]);

  const stats = useMemo(() => ([
    {
      icon: '🌿',
      iconClass: 'si-g',
      value: Math.round(weeklyEmissions).toString(),
      unit: 'kg',
      label: 'Weekly Emissions',
      change: weeklyTrend,
      changeClass: weeklyTrend.includes('▲') ? 'up' : 'dn'
    },
    {
      icon: '🔥',
      iconClass: 'si-o',
      value: streakDays.toString(),
      unit: 'days',
      label: 'Current Streak',
      change: `▲ +${Math.min(3, streakDays)} this month`,
      changeClass: 'dn'
    },
    {
      icon: '🌳',
      iconClass: 'si-b',
      value: Math.round(co2Saved).toString(),
      unit: 'kg',
      label: 'CO₂ Saved',
      change: `≈ ${Math.max(1, Math.round(co2Saved / 6))} trees offset`,
      changeClass: 'dn'
    },
    {
      icon: '⚡',
      iconClass: 'si-r',
      value: ecoPoints.toLocaleString(),
      unit: '',
      label: 'Eco Points',
      change: `▲ ${Math.round(ecoPoints / 7)} pts this week`,
      changeClass: 'dn'
    }
  ]), [weeklyEmissions, weeklyTrend, streakDays, co2Saved, ecoPoints]);

  return (
    <div>
      {/* Top Navigation Bar */}
      <TopBar 
        onLogout={handleLogout} 
        onOpenModal={handleOpenModal}
        onOpenNotifications={handleToggleNotifications}
        unreadCount={unreadNotifications}
      />
      
      {/* Hero Banner */}
      <HeroBanner userName={profile.name} />
      
      {/* Statistics Summary Row */}
      <StatSummaryRow stats={stats} />
      
      {/* Main 2-Column Grid */}
      <div className="grid">
        {/* Left Column - Profile */}
        <ProfileCard 
          profile={profile}
          onSave={handleProfileSave}
        />
        
        {/* Right Column - Goals */}
        <GoalsCard
          goals={goals}
          onAddGoal={handleAddGoal}
          onUpdateGoal={handleUpdateGoal}
          onRemoveGoal={handleRemoveGoal}
        />
        
        {/* Left Column - Carbon Footprint Log */}
        <CarbonFootprintLog
          data={footprintData}
          weeklyTotal={weeklyEmissions}
          trendLabel={weeklyTrend}
        />
        
        {/* Right Column - Emissions Breakdown */}
        <EmissionsBreakdown
          breakdown={breakdown}
        />
        
        {/* Left Column - Monthly Comparison */}
        <MonthlyComparison
          data={monthlyComparison}
        />
        
        {/* Right Column - Recent Activity */}
        <RecentActivity
          activities={activities}
          onRemove={handleRemoveActivity}
        />
        
        {/* Left Column - Eco Tips */}
        <EcoTips
          tips={tips}
          onRefresh={handleRefreshTips}
        />
        
        {/* Right Column - Leaderboard + Badges */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          <LeaderboardCard />
          <EcoBadgesCard badges={badges} />
        </div>
      </div>
      
      {/* Notifications Panel */}
      <NotificationsPanel 
        isOpen={notificationsOpen}
        onClose={handleCloseNotifications}
        notifications={notifications}
        onDismiss={handleDismissNotification}
        onMarkAllRead={handleMarkAllRead}
      />
      
      {/* Log Activity Modal */}
      <LogActivityModal 
        isOpen={modalOpen}
        onClose={handleCloseModal}
        onSave={handleActivitySave}
      />
    </div>
  );
}
