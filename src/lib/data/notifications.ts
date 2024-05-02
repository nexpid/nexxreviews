import { APINotification } from "../types";

const notifs = new Map<string, APINotification[]>();

export function getUserNotifications(userId: string) {
  return notifs.get(userId) ?? [];
}

export function clearUserNotifications(userId: string) {
  return notifs.delete(userId);
}

export async function sendNotification(
  userId: string,
  notification: APINotification
) {
  if (!notifs.get(userId)) notifs.set(userId, []);
  notifs.get(userId)?.unshift(notification);
}
