import { apiFetch } from "../utils/api";

export const getNotifications = async () => {
  return await apiFetch('/api/notifications');
};

export const markNotificationAsRead = async (id) => {
  return await apiFetch(`/api/notifications/${id}/read`, { method: 'POST' });
};

export const markAllNotificationsAsRead = async () => {
  return await apiFetch('/api/notifications/read-all', { method: 'POST' });
};

export const clearReadNotifications = async () => {
  return await apiFetch('/api/notifications/read', { method: 'DELETE' });
};
