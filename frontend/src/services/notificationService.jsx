import { apiFetch } from "../utils/api";

export const getNotifications = async () => {
  try {
    const data = await apiFetch('/api/notifications');
    if (!data || data.length === 0) return DUMMY_NOTIFICATIONS;
    return data;
  } catch (error) {
    console.warn("Using dummy notification data due to error:");
    return DUMMY_NOTIFICATIONS;
  }
};

export const markNotificationAsRead = async (id) => {
  return await apiFetch(`/api/notifications/${id}/read`, { method: 'POST' });
};

const DUMMY_NOTIFICATIONS = [
  {
    id: 1,
    title: "Goal Achieved!",
    message: "Congratulations! You've reached your 10% reduction goal for transportation this week.",
    isRead: false,
    createdAt: new Date().toISOString(),
    type: "SUCCESS"
  },
  {
    id: 2,
    title: "New Badge Unlocked",
    message: "You've earned the 'Green Traveler' badge for using public transport 5 days in a row.",
    isRead: false,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    type: "BADGE"
  },
  {
    id: 3,
    title: "Marketplace Update",
    message: "New eco-friendly actions are available in the marketplace. Check them out!",
    isRead: true,
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    type: "INFO"
  }
];
