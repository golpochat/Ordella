import { createBrowserApiClient } from './browser';

export type NotificationHistoryItem = {
  id: string;
  tenantId: string;
  type: string;
  channel: 'email' | 'sms' | 'push' | 'whatsapp' | 'in_app';
  userId: string | null;
  recipient: string | null;
  payload: Record<string, unknown>;
  status: string;
  sentAt: string | null;
  createdAt: string;
};

export type NotificationPreference = {
  id: string;
  tenantId: string;
  userId: string;
  emailEnabled: boolean;
  smsEnabled: boolean;
  pushEnabled: boolean;
  categories: string[];
};

export async function listNotificationHistory(): Promise<NotificationHistoryItem[]> {
  return createBrowserApiClient().getData<NotificationHistoryItem[]>('notifications/history');
}

export async function getNotificationPreferences(): Promise<NotificationPreference> {
  return createBrowserApiClient().getData<NotificationPreference>('notifications/preferences');
}

export async function updateNotificationPreferences(body: {
  emailEnabled?: boolean;
  smsEnabled?: boolean;
  pushEnabled?: boolean;
  categories?: string[];
}): Promise<NotificationPreference> {
  return createBrowserApiClient().postData<NotificationPreference>(
    'notifications/preferences/update',
    body,
  );
}

export async function sendNotification(body: {
  type: string;
  channel: 'email' | 'sms' | 'push';
  recipient?: string;
  payload: Record<string, unknown>;
}): Promise<NotificationHistoryItem> {
  return createBrowserApiClient().postData<NotificationHistoryItem>('notifications/send', body);
}
