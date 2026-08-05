// Notification service (contract §4.8). Notifications are SYSTEM-GENERATED
// only — POST /notifications is 405 by design; there is no create path here.
// Rows carry incident_id for navigation; there is no human-readable INC-ref
// anywhere in the API, and the incident title is already inside `message`.
import { api } from './api';

function adaptNotification(n) {
  return {
    id: n.id,
    incidentId: n.incident_id,
    message: n.message,
    read: n.is_read,
    createdAt: n.created_at,
  };
}

export async function listNotifications(params = {}) {
  const { data, pagination } = await api.getList('/notifications', params);
  return { notifications: data.map(adaptNotification), pagination };
}

export async function getUnreadCount() {
  const res = await api.get('/notifications/unread-count');
  return res?.unread ?? 0;
}

// Idempotent; returns the updated NotificationOut.
export async function markNotificationRead(id) {
  return adaptNotification(await api.post(`/notifications/${id}/read`));
}

// Returns { marked_read, unread: 0 } — marked_read feeds the "N marked as
// read" confirmation; a repeat call reports 0.
export async function markAllNotificationsRead() {
  const res = await api.post('/notifications/read-all');
  return { markedRead: res?.marked_read ?? 0, unread: res?.unread ?? 0 };
}
