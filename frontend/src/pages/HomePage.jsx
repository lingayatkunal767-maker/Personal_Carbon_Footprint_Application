import React, { useEffect, useMemo, useState, useCallback, useRef } from 'react';
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
import CarbonCalculatorWidget from '../components/CarbonCalculatorWidget';
import NotificationsPanel from '../components/NotificationsPanel';
import LogActivityModal from '../components/LogActivityModal';
import {
  activityAPI,
  adminAPI,
  badgeAPI,
  fetchAPI,
  goalAPI,
  leaderboardAPI,
  statsAPI,
  surveyAPI,
  userAPI,
} from '../services/api';
import '../styles/Dashboard.css';

// ─── helpers ──────────────────────────────────────────────────────────────────
const DEFAULT_TAGS = [];

const BADGE_HEX_CLASSES = ['bh1', 'bh2', 'bh3', 'bh4', 'bh5'];

const CATEGORY_COLORS = {
  transport: '#2d7a4f',
  energy:    '#5aaa72',
  food:      '#e8a624',
  shopping:  '#4a90d9',
  waste:     '#4a90d9',
  offset:    '#81c784',
  other:     '#9e9e9e',
};

const CATEGORY_ICONS = {
  transport: '🚗',
  energy:    '⚡',
  food:      '🍔',
  shopping:  '🛍️',
  waste:     '🛍️',
  offset:    '🌳',
  other:     '📋',
};

const NOTIFICATION_ICONS = {
  BADGE_EARNED: '🏅',
  GOAL_PROGRESS: '🎯',
  GOAL_COMPLETED: '🎉',
  HIGH_EMISSIONS: '⚠️',
  REMINDER: '💡',
  MARKETPLACE: '📦',
};

const POPUP_NOTIFICATION_TYPES = new Set(['BADGE_EARNED', 'GOAL_COMPLETED', 'MARKETPLACE']);

const GOAL_COLORS = [
  'linear-gradient(90deg,var(--g-mid),var(--g-light))',
  'linear-gradient(90deg,#4a90d9,#81c784)',
  'linear-gradient(90deg,var(--gold),#f4c844)',
  'linear-gradient(90deg,#e05c5c,#f4a261)',
];

function resolveBadgeIcon(badgeType, badgeName = '') {
  const type = (badgeType || '').toLowerCase();
  const name = (badgeName || '').toLowerCase();

  if (type.includes('transport') || name.includes('transport') || name.includes('bike')) return '🚗';
  if (type.includes('energy') || name.includes('energy') || name.includes('solar')) return '⚡';
  if (type.includes('food') || name.includes('food') || name.includes('veg')) return '🥦';
  if (type.includes('offset') || name.includes('tree') || name.includes('carbon')) return '🌳';
  if (type.includes('milestone') || type.includes('achievement')) return '🏅';
  return '🏅';
}

function normalizeBadgeName(value = '') {
  return value.trim().replace(/\s+/g, ' ').toLowerCase();
}

function buildBadgeCards(earnedBadges, badgeDefinitions) {
  const safeEarnedBadges = Array.isArray(earnedBadges) ? earnedBadges : [];
  const safeBadgeDefinitions = Array.isArray(badgeDefinitions) ? badgeDefinitions : [];

  const earnedBadgeNames = new Set(
    safeEarnedBadges
      .map((badge) => normalizeBadgeName(badge.badgeName || ''))
      .filter(Boolean)
  );

  if (safeBadgeDefinitions.length > 0) {
    const definitionCards = safeBadgeDefinitions.map((definition, index) => {
      const badgeName = definition.badgeName || `Badge ${index + 1}`;
      const isEarned = earnedBadgeNames.has(normalizeBadgeName(badgeName));
      const threshold = Number(definition.thresholdPercent);
      const hasThreshold = Number.isFinite(threshold);
      return {
        id: `badge-definition-${definition.id ?? index}`,
        icon: isEarned ? resolveBadgeIcon(definition.badgeType, badgeName) : '🔒',
        label: badgeName,
        pts: isEarned
          ? 'Earned'
          : hasThreshold
            ? `${Math.round(threshold)}% target`
            : 'Locked',
        hexClass: isEarned ? BADGE_HEX_CLASSES[index % BADGE_HEX_CLASSES.length] : 'bhL',
        locked: !isEarned,
      };
    });

    const definitionNames = new Set(
      safeBadgeDefinitions
        .map((definition) => normalizeBadgeName(definition.badgeName || ''))
        .filter(Boolean)
    );

    const unmatchedEarnedCards = safeEarnedBadges
      .filter((badge) => !definitionNames.has(normalizeBadgeName(badge.badgeName || '')))
      .map((badge, index) => ({
        id: `badge-earned-extra-${badge.id ?? index}`,
        icon: resolveBadgeIcon(badge.badgeType, badge.badgeName),
        label: badge.badgeName || 'Earned Badge',
        pts: 'Earned',
        hexClass: BADGE_HEX_CLASSES[index % BADGE_HEX_CLASSES.length],
        locked: false,
      }));

    return [...definitionCards, ...unmatchedEarnedCards];
  }

  return safeEarnedBadges.map((badge, index) => ({
    id: `badge-earned-${badge.id ?? index}`,
    icon: resolveBadgeIcon(badge.badgeType, badge.badgeName),
    label: badge.badgeName || 'Earned Badge',
    pts: 'Earned',
    hexClass: BADGE_HEX_CLASSES[index % BADGE_HEX_CLASSES.length],
    locked: false,
  }));
}

function formatRelativeDate(dateStr) {
  if (!dateStr) return 'Today';
  const d = new Date(dateStr);
  const now = new Date();
  const diff = Math.floor((now - d) / 86400000);
  if (diff === 0) return `Today, ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  if (diff === 1) return 'Yesterday';
  if (diff < 7) return `${diff} days ago`;
  return d.toLocaleDateString();
}

function mapActivityToUI(a, index) {
  const type = (a.activityType || 'other').toLowerCase();
  return {
    id: a.id,
    icon: CATEGORY_ICONS[type] || '📋',
    name: a.activityName,
    time: formatRelativeDate(a.activityDate),
    deltaKg: Number(a.carbonAmount),
    isPositive: Number(a.carbonAmount) < 0,
    categoryKey: type,
    _dbId: a.id,
  };
}

function mapGoalToUI(g, index) {
  const target = Number(g.targetValue) || 100;
  const current = Number(g.currentValue) || 0;
  const progress = target > 0 ? Math.min(100, Math.round((current / target) * 100)) : current;
  return {
    id: g.id,
    name: g.goalType,
    progress,
    color: GOAL_COLORS[index % GOAL_COLORS.length],
    _dbId: g.id,
    targetValue: target,
    currentValue: current,
    deadline: g.deadline || null,
  };
}

function buildFootprintFromActivities(activities) {
  const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const today = new Date();

  // Last 7 days
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (6 - i));
    return d;
  });
  const dayData = days.map(d => {
    const dayStr = d.toISOString().split('T')[0];
    const total = activities
      .filter(a => a.activityDate === dayStr && Number(a.carbonAmount) > 0)
      .reduce((sum, a) => sum + Number(a.carbonAmount), 0);
    return Math.round(total * 10) / 10;
  });

  // Last 4 weeks (weekly totals, oldest → newest)
  const weekData = Array.from({ length: 4 }, (_, i) => {
    const weekEnd = new Date(today);
    weekEnd.setDate(today.getDate() - i * 7);
    const weekStart = new Date(weekEnd);
    weekStart.setDate(weekEnd.getDate() - 6);
    const endStr   = weekEnd.toISOString().split('T')[0];
    const startStr = weekStart.toISOString().split('T')[0];
    const total = activities
      .filter(a => a.activityDate >= startStr && a.activityDate <= endStr && Number(a.carbonAmount) > 0)
      .reduce((sum, a) => sum + Number(a.carbonAmount), 0);
    return Math.round(total * 10) / 10;
  }).reverse();

  // Last 12 calendar months
  const monthLabels = Array.from({ length: 12 }, (_, i) => {
    const d = new Date(today.getFullYear(), today.getMonth() - (11 - i), 1);
    return d.toLocaleString('default', { month: 'short' });
  });
  const monthData = Array.from({ length: 12 }, (_, i) => {
    const d = new Date(today.getFullYear(), today.getMonth() - (11 - i), 1);
    const prefix = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const total = activities
      .filter(a => a.activityDate && a.activityDate.startsWith(prefix) && Number(a.carbonAmount) > 0)
      .reduce((sum, a) => sum + Number(a.carbonAmount), 0);
    return Math.round(total * 10) / 10;
  });

  return {
    week:  { labels: days.map(d => DAY_LABELS[d.getDay()]), data: dayData },
    month: { labels: ['Wk 1', 'Wk 2', 'Wk 3', 'Wk 4'], data: weekData },
    year:  { labels: monthLabels, data: monthData },
  };
}

function mapLeaderboardToUI(entry) {
  return {
    id: entry.id,
    name: entry.name || 'Unknown',
    rank: entry.rank || 999,
    score: Math.round(Number(entry.totalCarbonSaved) || 0),
    profilePicture: entry.profilePicture || null,
    badgeCount: entry.badgeCount || 0,
  };
}

function buildMonthlyChartData(monthlyStats) {
  if (!monthlyStats || monthlyStats.length === 0) {
    return {
      labels: [],
      datasets: [{ label: 'Emissions (kg)', data: [], backgroundColor: '#2d7a4f' }],
    };
  }
  const labels = monthlyStats.map(m => {
    const [year, month] = m.month.split('-');
    return new Date(year, month - 1).toLocaleString('default', { month: 'short', year: '2-digit' });
  });
  return {
    labels,
    datasets: [{ label: 'Emissions (kg CO₂)', data: monthlyStats.map(m => Number(m.total)), backgroundColor: '#2d7a4f' }],
  };
}

function buildBreakdownFromAPI(breakdown) {
  if (!breakdown || breakdown.length === 0) return [];
  return breakdown.map(b => {
    const type = (b.activityType || b.type || 'other').toLowerCase();
    const value = Number(b.totalCarbon || b.total || 0);
    return {
      key: type,
      icon: CATEGORY_ICONS[type] || '📋',
      label: type.charAt(0).toUpperCase() + type.slice(1),
      value: Number.isFinite(value) ? Number(value.toFixed(2)) : 0,
      color: CATEGORY_COLORS[type] || '#9e9e9e',
    };
  });
}

function notificationClass(notificationType, priority) {
  const normalizedPriority = (priority || '').toUpperCase();
  const normalizedType = (notificationType || '').toUpperCase();

  if (normalizedPriority === 'HIGH' || normalizedPriority === 'URGENT' || normalizedType === 'HIGH_EMISSIONS') {
    return 'alert';
  }

  if (normalizedType === 'REMINDER' || normalizedType === 'GOAL_PROGRESS') {
    return 'warn';
  }

  return '';
}

function sanitizeNotificationTitle(notificationType, rawTitle) {
  const title = String(rawTitle || '').trim();

  if (!title) {
    if (notificationType === 'MARKETPLACE') return 'Order Update';
    return 'Notification';
  }

  const withoutLeadingSymbols = title
    .replace(/^[^\p{L}\p{N}]+/u, '')
    .trim();

  if (notificationType === 'MARKETPLACE') {
    if (/order\s+cancelled/i.test(withoutLeadingSymbols)) return 'Order Cancelled';
    if (/order\s+confirmed/i.test(withoutLeadingSymbols)) return 'Order Confirmed';
  }

  if (notificationType === 'BADGE_EARNED') {
    if (/badge\s+(assigned|earned)/i.test(withoutLeadingSymbols)) return 'Badge Earned';
  }

  return withoutLeadingSymbols || title;
}

function mapNotificationToUI(notification) {
  const type = (notification.notificationType || '').toUpperCase();
  const title = sanitizeNotificationTitle(type, notification.title);
  return {
    id: `api-${notification.id}`,
    serverId: notification.id,
    icon: NOTIFICATION_ICONS[type] || '🔔',
    text: title,
    detail: notification.message || '',
    type: notificationClass(type, notification.priority),
    notificationType: type,
    isRead: !!notification.isRead,
    createdAt: notification.createdAt || null,
    localOnly: false,
  };
}

function popupVariantByType(notificationType) {
  if (notificationType === 'GOAL_COMPLETED') return 'goal';
  if (notificationType === 'BADGE_EARNED') return 'badge';
  if (notificationType === 'MARKETPLACE') return 'marketplace';
  return 'default';
}

function shouldTriggerPopup(notification) {
  if (!notification?.serverId) return false;
  if (!POPUP_NOTIFICATION_TYPES.has(notification.notificationType)) return false;

  if (notification.notificationType === 'MARKETPLACE') {
    const text = `${notification.text || ''} ${notification.detail || ''}`.toLowerCase();
    return text.includes('cancel');
  }

  return true;
}

function buildBreakdownFromActivities(rawActivities) {
  const totals = {};
  rawActivities.forEach(a => {
    if (!a.activityDate || Number(a.carbonAmount) <= 0) return;
    const type = (a.activityType || 'other').toLowerCase();
    totals[type] = (totals[type] || 0) + Number(a.carbonAmount);
  });
  return Object.entries(totals)
    .filter(([, v]) => v > 0)
    .map(([type, value]) => ({
      key: type,
      icon: CATEGORY_ICONS[type] || '📋',
      label: type.charAt(0).toUpperCase() + type.slice(1),
      value: Math.round(value * 10) / 10,
      color: CATEGORY_COLORS[type] || '#9e9e9e',
    }));
}

function buildMonthlyComparisonFromActivities(rawActivities) {
  const today = new Date();
  const currentYear = today.getFullYear();
  const prevYear = currentYear - 1;
  const MONTH_LABELS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const curData = Array(12).fill(0);
  const preData = Array(12).fill(0);
  rawActivities.forEach(a => {
    if (!a.activityDate || Number(a.carbonAmount) <= 0) return;
    const parts = a.activityDate.split('-');
    if (parts.length < 2) return;
    const yr = parseInt(parts[0], 10);
    const mo = parseInt(parts[1], 10) - 1;
    if (yr === currentYear) curData[mo] += Number(a.carbonAmount);
    else if (yr === prevYear) preData[mo] += Number(a.carbonAmount);
  });
  return {
    labels: MONTH_LABELS,
    prevYear,
    currentYear,
    datasets: [
      { label: String(prevYear), data: preData.map(v => Math.round(v * 10) / 10), backgroundColor: '#81c784' },
      { label: String(currentYear), data: curData.map(v => Math.round(v * 10) / 10), backgroundColor: '#2d7a4f' },
    ],
  };
}

async function fetchUserBadges(userId) {
  try {
    const primaryData = await badgeAPI.getUserBadges(userId);
    if (Array.isArray(primaryData)) {
      return primaryData;
    }
  } catch {
    // Try fallback route below.
  }

  try {
    const fallbackData = await fetchAPI(`/badges/${userId}`);
    if (Array.isArray(fallbackData)) {
      return fallbackData;
    }
    if (Array.isArray(fallbackData?.data)) {
      return fallbackData.data;
    }
  } catch {
    return [];
  }

  return [];
}

// ─── component ────────────────────────────────────────────────────────────────
export default function HomePage() {
  const navigate = useNavigate();
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);

  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const [profile, setProfile] = useState({ name: '', email: '', memberSince: '', tags: DEFAULT_TAGS, profilePicture: null });
  const [goals, setGoals] = useState([]);
  const [activities, setActivities] = useState([]);
  const [tips, setTips] = useState([]);
  const [tipsMeta, setTipsMeta] = useState({ datasetConnected: false, datasetRecords: 0 });
  const [notifications, setNotifications] = useState([]);
  const [notificationPopups, setNotificationPopups] = useState([]);
  const [activeNotificationPopup, setActiveNotificationPopup] = useState(null);
  const [footprintData, setFootprintData] = useState({ week: { labels: [], data: [] }, month: { labels: [], data: [] }, year: { labels: [], data: [] } });
  const [breakdown, setBreakdown] = useState([]);
  const [monthlyComparison, setMonthlyComparison] = useState({ labels: [], datasets: [] });
  const [badges, setBadges] = useState([]);
  const [leaderboardEntries, setLeaderboardEntries] = useState([]);
  const [leaderboardLoading, setLeaderboardLoading] = useState(false);

  const [weeklyEmissions, setWeeklyEmissions] = useState(0);
  const [co2Saved, setCo2Saved] = useState(0);
  const [ecoPoints, setEcoPoints] = useState(0);
  const [streakDays, setStreakDays] = useState(0);
  const seenServerNotificationIdsRef = useRef(new Set());
  const hasInitializedNotificationsRef = useRef(false);
  const popupTimerRef = useRef(null);

  const queueNotificationPopup = useCallback((notification) => {
    if (!shouldTriggerPopup(notification)) {
      return;
    }

    setNotificationPopups((prev) => {
      if (prev.some((queued) => queued.serverId === notification.serverId)) {
        return prev;
      }
      return [...prev, notification];
    });
  }, []);

  useEffect(() => {
    if (activeNotificationPopup || notificationPopups.length === 0) {
      return;
    }

    const [nextPopup, ...remaining] = notificationPopups;
    setActiveNotificationPopup(nextPopup);
    setNotificationPopups(remaining);
  }, [activeNotificationPopup, notificationPopups]);

  useEffect(() => {
    if (!activeNotificationPopup) {
      return;
    }

    if (popupTimerRef.current) {
      window.clearTimeout(popupTimerRef.current);
    }

    popupTimerRef.current = window.setTimeout(() => {
      setActiveNotificationPopup(null);
      popupTimerRef.current = null;
    }, 4200);

    return () => {
      if (popupTimerRef.current) {
        window.clearTimeout(popupTimerRef.current);
      }
    };
  }, [activeNotificationPopup]);

  useEffect(() => {
    return () => {
      if (popupTimerRef.current) {
        window.clearTimeout(popupTimerRef.current);
      }
    };
  }, []);

  const refreshNotifications = useCallback(async () => {
    if (!userId) return;

    try {
      const data = await fetchAPI(`/notifications/user/${userId}`);
      if (!Array.isArray(data)) return;

      const mapped = data.map(mapNotificationToUI);

      if (!hasInitializedNotificationsRef.current) {
        mapped.forEach((item) => {
          if (item.serverId) {
            seenServerNotificationIdsRef.current.add(item.serverId);
          }
        });
        hasInitializedNotificationsRef.current = true;
      } else {
        mapped.forEach((item) => {
          if (!item.serverId) return;
          if (seenServerNotificationIdsRef.current.has(item.serverId)) return;

          seenServerNotificationIdsRef.current.add(item.serverId);
          queueNotificationPopup(item);
        });
      }

      setNotifications((prev) => {
        const localOnly = prev.filter((item) => item.localOnly);
        return [...mapped, ...localOnly];
      });
    } catch (err) {
      console.error('Failed to load notifications:', err);
    }
  }, [queueNotificationPopup, userId]);

  const refreshBadgesAndNotifications = useCallback(async () => {
    if (!userId) return;

    try {
      const [badgesRes, badgeDefinitionsRes] = await Promise.allSettled([
        fetchUserBadges(userId),
        adminAPI.getBadgeDefinitions(),
      ]);

      const earnedBadges = badgesRes.status === 'fulfilled' && Array.isArray(badgesRes.value)
        ? badgesRes.value
        : [];
      const badgeDefinitions = badgeDefinitionsRes.status === 'fulfilled' && Array.isArray(badgeDefinitionsRes.value)
        ? badgeDefinitionsRes.value
        : [];

      setBadges(buildBadgeCards(earnedBadges, badgeDefinitions));

      const earnedTags = earnedBadges
        .slice(0, 3)
        .map((badge) => `🏅 ${badge.badgeName}`)
        .filter((tag) => tag !== '🏅 undefined');
      setProfile((prev) => ({ ...prev, tags: earnedTags.length ? earnedTags : prev.tags }));
    } catch (err) {
      console.error('Failed to refresh badges:', err);
    }

    await refreshNotifications();
  }, [refreshNotifications, userId]);

  // ── Auth guard + initial data load ────────────────────────────────────────
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    const stored = localStorage.getItem('current_user');
    if (!token || !stored) { navigate('/login', { replace: true }); return; }

    let user;
    try { user = JSON.parse(stored); } catch { navigate('/login', { replace: true }); return; }

    setProfile(prev => ({
      ...prev,
      name: user.name || '',
      email: user.email || '',
      profilePicture: user.profilePicture || null,
      memberSince: user.memberSince || 'Recently joined',
    }));

    const parsedSessionId = Number(user.id);
    if (Number.isFinite(parsedSessionId) && parsedSessionId > 0) {
      setUserId(parsedSessionId);
    } else {
      // No id stored — try fetching from backend by email
      userAPI.getUserByEmail(user.email)
        .then(data => {
          const parsedFetchedId = Number(data?.id);
          if (Number.isFinite(parsedFetchedId) && parsedFetchedId > 0) {
            const updated = { ...user, id: parsedFetchedId };
            localStorage.setItem('current_user', JSON.stringify(updated));
            setUserId(parsedFetchedId);
          } else {
            setLoading(false);
          }
        })
        .catch(() => setLoading(false));
    }
  }, [navigate]);

  // ── Load all dashboard data once userId is available ──────────────────────
  useEffect(() => {
    if (!userId) return;

    const loadAll = async () => {
      setLoading(true);
      try {
        const [
          activitiesRes,
          goalsRes,
          statsRes,
          breakdownRes,
          monthlyRes,
          badgesRes,
          badgeDefinitionsRes,
          leaderboardRes,
          tipsRes,
        ] =
          await Promise.allSettled([
            activityAPI.getUserActivities(userId),
            goalAPI.getUserGoals(userId),
            statsAPI.getUserStats(userId),
            statsAPI.getEmissionsBreakdown(userId),
            statsAPI.getMonthlyComparison(userId, 6),
            fetchUserBadges(userId),
            adminAPI.getBadgeDefinitions(),
            leaderboardAPI.getLeaderboard(10),
            surveyAPI.getDatasetInsights(userId),
          ]);

        // Activities
        if (activitiesRes.status === 'fulfilled' && Array.isArray(activitiesRes.value)) {
          const uiActivities = activitiesRes.value.map(mapActivityToUI);
          setActivities(uiActivities);
          setFootprintData(buildFootprintFromActivities(activitiesRes.value));
        }

        // Goals
        if (goalsRes.status === 'fulfilled' && Array.isArray(goalsRes.value)) {
          setGoals(goalsRes.value.map(mapGoalToUI));
        }

        // Stats
        if (statsRes.status === 'fulfilled' && statsRes.value) {
          const s = statsRes.value;
          setWeeklyEmissions(Number(s.weeklyEmissions) || 0);
          setCo2Saved(Number(s.totalOffset) || 0);
          setEcoPoints(Number(s.ecoPoints) || 0);
          setStreakDays(Number(s.streakDays) || 0);
        }

        // Breakdown
        if (breakdownRes.status === 'fulfilled' && Array.isArray(breakdownRes.value) && breakdownRes.value.length > 0) {
          setBreakdown(buildBreakdownFromAPI(breakdownRes.value));
        } else if (activitiesRes.status === 'fulfilled' && Array.isArray(activitiesRes.value)) {
          // Fallback when breakdown API has no historical survey data.
          setBreakdown(buildBreakdownFromActivities(activitiesRes.value));
        }

        // Monthly
        if (activitiesRes.status === 'fulfilled' && Array.isArray(activitiesRes.value)) {
          // Build year-over-year comparison from raw activities
          setMonthlyComparison(buildMonthlyComparisonFromActivities(activitiesRes.value));
        } else if (monthlyRes.status === 'fulfilled' && Array.isArray(monthlyRes.value) && monthlyRes.value.length > 0) {
          setMonthlyComparison(buildMonthlyChartData(monthlyRes.value));
        }

        // Dataset-backed tips
        if (tipsRes.status === 'fulfilled' && tipsRes.value && Array.isArray(tipsRes.value.tips)) {
          setTips(tipsRes.value.tips);
          setTipsMeta({
            datasetConnected: !!tipsRes.value.datasetConnected,
            datasetRecords: Number(tipsRes.value.datasetRecords) || 0,
          });
        } else {
          setTips([]);
          setTipsMeta({ datasetConnected: false, datasetRecords: 0 });
        }

        // Badges (definitions + earned instances)
        const earnedBadges = badgesRes.status === 'fulfilled' && Array.isArray(badgesRes.value)
          ? badgesRes.value
          : [];
        const badgeDefinitions = badgeDefinitionsRes.status === 'fulfilled' && Array.isArray(badgeDefinitionsRes.value)
          ? badgeDefinitionsRes.value
          : [];

        setBadges(buildBadgeCards(earnedBadges, badgeDefinitions));

        const earnedTags = earnedBadges
          .slice(0, 3)
          .map((badge) => `🏅 ${badge.badgeName}`)
          .filter((tag) => tag !== '🏅 undefined');
        setProfile((prev) => ({ ...prev, tags: earnedTags.length ? earnedTags : prev.tags }));

        // Leaderboard
        if (leaderboardRes.status === 'fulfilled' && Array.isArray(leaderboardRes.value)) {
          setLeaderboardEntries(leaderboardRes.value.map(mapLeaderboardToUI));
        }

        await refreshNotifications();
      } catch (err) {
        console.error('Error loading dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadAll();
  }, [userId, refreshNotifications]);

  useEffect(() => {
    if (!userId) return;

    const refreshAllSignals = () => {
      refreshBadgesAndNotifications();
    };

    const pollingId = window.setInterval(refreshAllSignals, 30000);
    window.addEventListener('focus', refreshAllSignals);
    window.addEventListener('carbon-log-updated', refreshAllSignals);

    return () => {
      window.clearInterval(pollingId);
      window.removeEventListener('focus', refreshAllSignals);
      window.removeEventListener('carbon-log-updated', refreshAllSignals);
    };
  }, [refreshBadgesAndNotifications, userId]);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('current_user');
    navigate('/login', { replace: true });
  };

  const handleProfileSave = async (updatedProfile) => {
    setProfile(updatedProfile);
    const stored = JSON.parse(localStorage.getItem('current_user') || '{}');
    const merged = {
      ...stored,
      name: updatedProfile.name,
      email: updatedProfile.email,
      profilePicture: updatedProfile.profilePicture,
      role: stored.role || 'USER',
      active: stored.active !== false,
    };
    localStorage.setItem('current_user', JSON.stringify(merged));

    if (userId) {
      try {
        await fetchAPI(`/users/${userId}/profile`, {
          method: 'PATCH',
          body: JSON.stringify({ name: updatedProfile.name, profilePicture: updatedProfile.profilePicture }),
          parseAs: 'none',
        });
      } catch (err) {
        console.error('Profile save error:', err);
      }
    }
  };

  const handleActivitySave = async (activity) => {
    // Optimistically add to UI immediately
    const tempId = `temp-${Date.now()}`;
    const uiActivity = { ...activity, id: tempId };
    setActivities(prev => [uiActivity, ...prev]);
    updateStatsFromActivity(activity.deltaKg);

    // Notification
    if (activity.deltaKg > 20) {
      addNotification('alert', '⚠️', 'High emission activity logged', `${activity.name} added ${activity.deltaKg.toFixed(1)} kg CO₂`);
    } else if (activity.deltaKg < 0) {
      addNotification('', '🌿', 'Nice work! You offset emissions', `${Math.abs(activity.deltaKg).toFixed(1)} kg CO₂ saved`);
    }

    // Save to backend
    if (!userId) return;
    try {
      const today = new Date().toISOString().split('T')[0];
      const payload = {
        userId,
        activityType: activity.categoryKey || 'other',
        activityName: activity.name,
        carbonAmount: activity.deltaKg,
        activityDate: today,
        description: '',
      };
      const saved = await activityAPI.createActivity(payload);
      if (saved) {
        // Replace temp entry with real DB entry
        setActivities(prev => prev.map(a => a.id === tempId ? mapActivityToUI(saved) : a));
        // Update footprint chart with latest activities
        const freshActivities = await activityAPI.getUserActivities(userId);
        if (Array.isArray(freshActivities)) {
          setFootprintData(buildFootprintFromActivities(freshActivities));
          setBreakdown(buildBreakdownFromActivities(freshActivities));
          setMonthlyComparison(buildMonthlyComparisonFromActivities(freshActivities));
        }
      }
    } catch (err) {
      console.error('Save activity error:', err);
    }
  };

  const handleRemoveActivity = async (activityId) => {
    setActivities(prev => prev.filter(a => a.id !== activityId));
    // Delete from backend (only if it's a real DB id — not temp)
    if (userId && typeof activityId === 'number') {
      try {
        await activityAPI.deleteActivity(activityId);
        const freshActivities = await activityAPI.getUserActivities(userId);
        if (Array.isArray(freshActivities)) {
          setBreakdown(buildBreakdownFromActivities(freshActivities));
          setMonthlyComparison(buildMonthlyComparisonFromActivities(freshActivities));
          setFootprintData(buildFootprintFromActivities(freshActivities));
        }
      } catch (err) {
        console.error('Delete activity error:', err);
      }
    }
  };

  const handleAddGoal = async (goal) => {
    if (!userId) { setGoals(prev => [...prev, goal]); return; }
    try {
      const payload = {
        userId,
        goalType: goal.name,
        targetValue: goal.targetValue || 100,
        currentValue: goal.currentValue || 0,
        deadline: goal.deadline || null,
        status: 'active',
      };
      const saved = await goalAPI.createGoal(payload);
      if (saved) {
        setGoals(prev => [...prev, mapGoalToUI({ ...saved, deadline: goal.deadline }, prev.length)]);
      } else {
        setGoals(prev => [...prev, goal]);
      }
    } catch (err) {
      console.error('Add goal error:', err);
      setGoals(prev => [...prev, goal]);
    }
  };

  const handleUpdateGoal = async (goalId, updates) => {
    setGoals(prev => prev.map(g => {
      if (g.id !== goalId) return g;
      const merged = { ...g, ...updates };
      if (updates.currentValue !== undefined && merged.targetValue) {
        merged.progress = Math.min(100, Math.round((updates.currentValue / merged.targetValue) * 100));
      }
      return merged;
    }));
    if (!userId || typeof goalId !== 'number') return;
    try {
      const goal = goals.find(g => g.id === goalId);
      if (!goal) return;
      const newCurrentValue = updates.currentValue !== undefined ? updates.currentValue : (goal.currentValue || 0);
      const newProgress = Math.min(100, Math.round((newCurrentValue / (goal.targetValue || 100)) * 100));
      const payload = {
        userId,
        goalType: goal.name,
        targetValue: goal.targetValue || 100,
        currentValue: newCurrentValue,
        status: newProgress >= 100 ? 'completed' : 'active',
      };
      await goalAPI.updateGoal(goalId, payload);

      await refreshBadgesAndNotifications();
    } catch (err) {
      console.error('Update goal error:', err);
    }
  };

  const handleRemoveGoal = async (goalId) => {
    setGoals(prev => prev.filter(g => g.id !== goalId));
    if (!userId || typeof goalId !== 'number') return;
    try {
      await goalAPI.deleteGoal(goalId);
    } catch (err) {
      console.error('Delete goal error:', err);
    }
  };

  const updateStatsFromActivity = (deltaKg) => {
    if (deltaKg > 0) {
      setWeeklyEmissions(prev => prev + deltaKg);
      setEcoPoints(prev => Math.max(0, prev - Math.round(deltaKg)));
    } else {
      setCo2Saved(prev => prev + Math.abs(deltaKg));
      setEcoPoints(prev => prev + Math.max(1, Math.round(Math.abs(deltaKg) * 2)));
    }
    setBreakdown(prev => {
      const key = 'transport'; // will be refreshed from API
      return prev;
    });
  };

  const addNotification = (type, icon, text, detail) => {
    setNotifications(prev => [{
      id: `notif-${Date.now()}`,
      type, icon, text, detail, isRead: false, localOnly: true,
    }, ...prev]);
  };

  const handleRefreshTips = async () => {
    if (!userId) return;
    try {
      const data = await surveyAPI.getDatasetInsights(userId);
      if (Array.isArray(data?.tips)) {
        setTips(data.tips);
        setTipsMeta({
          datasetConnected: !!data.datasetConnected,
          datasetRecords: Number(data.datasetRecords) || 0,
        });
      }
    } catch (err) {
      console.error('Refresh tips error:', err);
    }
  };
  const handleToggleNotifications = async () => {
    const next = !notificationsOpen;
    setNotificationsOpen(next);
    if (next) {
      await refreshNotifications();
    }
  };
  const handleCloseNotifications  = () => setNotificationsOpen(false);
  const handleDismissNotification  = async (id) => {
    const target = notifications.find((n) => n.id === id);
    if (!target) return;

    if (!target.localOnly && target.serverId && userId) {
      try {
        await fetchAPI(`/notifications/${target.serverId}/read`, { method: 'PUT', parseAs: 'none' });
      } catch (err) {
        console.error('Failed to mark notification as read:', err);
      }
    }

    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const handleMarkAllRead = async () => {
    if (userId) {
      try {
        await fetchAPI(`/notifications/user/${userId}/read-all`, { method: 'PUT', parseAs: 'none' });
        await refreshNotifications();
      } catch (err) {
        console.error('Failed to mark all notifications as read:', err);
      }
    }

    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };
  const handleCloseNotificationPopup = () => {
    if (popupTimerRef.current) {
      window.clearTimeout(popupTimerRef.current);
      popupTimerRef.current = null;
    }
    setActiveNotificationPopup(null);
  };

  const handleViewBadgeFromPopup = async () => {
    setNotificationsOpen(true);
    await refreshNotifications();
    handleCloseNotificationPopup();
  };

  const handleOpenModal  = () => setModalOpen(true);
  const handleCloseModal = () => setModalOpen(false);

  const handleRefreshLeaderboard = async () => {
    setLeaderboardLoading(true);
    try {
      const data = await leaderboardAPI.getLeaderboard(10);
      if (Array.isArray(data)) setLeaderboardEntries(data.map(mapLeaderboardToUI));
    } catch (err) {
      console.error('Refresh leaderboard error:', err);
    } finally {
      setLeaderboardLoading(false);
    }
  };

  // ── Derived stats ──────────────────────────────────────────────────────────
  const unreadNotifications = useMemo(
    () => notifications.filter(n => !n.isRead).length,
    [notifications],
  );

  const weeklyTrend = useMemo(() => {
    const data = footprintData.week?.data || [];
    if (data.length < 2) return '— no data yet';
    const last = data[data.length - 1] || 0;
    const prev = data[data.length - 2] || last;
    if (prev === 0 && last === 0) return '— no data yet';
    const delta = last - prev;
    const pct = prev === 0 ? 100 : Math.round((delta / prev) * 100);
    return `${delta >= 0 ? '▲' : '▼'} ${Math.abs(pct)}% vs yesterday`;
  }, [footprintData]);

  const stats = useMemo(() => ([
    { icon: '🌿', iconClass: 'si-g', value: weeklyEmissions.toFixed(1), unit: 'kg', label: 'Weekly Emissions', change: weeklyTrend, changeClass: weeklyTrend.includes('▲') ? 'up' : 'dn' },
    { icon: '🔥', iconClass: 'si-o', value: streakDays.toString(),       unit: 'days', label: 'Active Days (30d)', change: `${streakDays} distinct days logged`, changeClass: 'dn' },
    { icon: '🌳', iconClass: 'si-b', value: co2Saved.toFixed(1),         unit: 'kg', label: 'CO₂ Saved',     change: `≈ ${Math.max(1, Math.round(co2Saved / 6))} trees offset`, changeClass: 'dn' },
    { icon: '⚡', iconClass: 'si-r', value: ecoPoints.toLocaleString(),  unit: '',   label: 'Eco Points',   change: `${badges.filter(b => !b.locked).length} badges earned`, changeClass: 'dn' },
  ]), [weeklyEmissions, weeklyTrend, streakDays, co2Saved, ecoPoints, badges]);

  // ── Render ─────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="dashboard-loading-icon">🌿</div>
        <p>Loading your dashboard…</p>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <TopBar
        onLogout={handleLogout}
        onOpenModal={handleOpenModal}
        onOpenNotifications={handleToggleNotifications}
        unreadCount={unreadNotifications}
      />
      <HeroBanner userName={profile.name} />
      <StatSummaryRow stats={stats} />

      <div className="grid">
        {/* Row 1: Profile welcome card – full width */}
        <ProfileCard profile={profile} onSave={handleProfileSave} className="full" />

        {/* Row 2: Carbon Footprint Log + Goals */}
        <CarbonFootprintLog data={footprintData} weeklyTotal={weeklyEmissions} trendLabel={weeklyTrend} />
        <GoalsCard goals={goals} onAddGoal={handleAddGoal} onUpdateGoal={handleUpdateGoal} onRemoveGoal={handleRemoveGoal} />

        {/* Row 3: Emissions Breakdown + Recent Activity */}
        <EmissionsBreakdown breakdown={breakdown} />
        <RecentActivity activities={activities} onRemove={handleRemoveActivity} />

        {/* Row 4: Monthly Comparison + Eco Tips */}
        <MonthlyComparison data={monthlyComparison} />
        <EcoTips tips={tips} onRefresh={handleRefreshTips} meta={tipsMeta} />

        {/* Row 5: Leaderboard+Badges (stacked) + Carbon Calculator */}
        <div className="dashboard-stack">
          <LeaderboardCard
            entries={leaderboardEntries}
            currentUserId={userId}
            loading={leaderboardLoading}
            onRefresh={handleRefreshLeaderboard}
          />
          <EcoBadgesCard badges={badges} />
        </div>
        <CarbonCalculatorWidget userId={userId} />
      </div>

      <NotificationsPanel isOpen={notificationsOpen} onClose={handleCloseNotifications} notifications={notifications} onDismiss={handleDismissNotification} onMarkAllRead={handleMarkAllRead} />

      {activeNotificationPopup && (
        <div
          className={`dashboard-toast dashboard-toast--${popupVariantByType(activeNotificationPopup.notificationType)}`}
          role="status"
          aria-live="polite"
        >
          <div className="dashboard-toast__icon">{activeNotificationPopup.icon || '🔔'}</div>
          <div className="dashboard-toast__content">
            <p>{activeNotificationPopup.text}</p>
            <small>{activeNotificationPopup.detail}</small>
            {activeNotificationPopup.notificationType === 'BADGE_EARNED' && (
              <button
                type="button"
                className="dashboard-toast__action"
                onClick={handleViewBadgeFromPopup}
              >
                View badge
              </button>
            )}
          </div>
          <button className="dashboard-toast__close" onClick={handleCloseNotificationPopup} aria-label="Close notification">
            ×
          </button>
        </div>
      )}

      <LogActivityModal isOpen={modalOpen} onClose={handleCloseModal} onSave={handleActivitySave} />
    </div>
  );
}
