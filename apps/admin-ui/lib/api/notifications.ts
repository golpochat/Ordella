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

export type TenantNotificationSettings = {
  emailEnabled: boolean;
  smsEnabled: boolean;
  pushEnabled: boolean;
  fromName: string;
  fromEmail: string;
};

export type NotificationTemplate = {
  id: string;
  tenantId: string;
  name: string;
  channel: 'email' | 'sms' | 'push' | 'whatsapp' | 'in_app';
  subject: string | null;
  content: Record<string, unknown>;
  version: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string | null;
};

export type NotificationLog = {
  id: string;
  tenantId: string;
  notificationId: string;
  channelId: string | null;
  status: 'sent' | 'delivered' | 'failed' | 'bounced';
  providerResponse: Record<string, unknown>;
  errorMessage: string | null;
  createdAt: string;
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

export async function getTenantNotificationSettings(): Promise<TenantNotificationSettings> {
  return createBrowserApiClient().getData<TenantNotificationSettings>('notifications/settings');
}

export async function updateTenantNotificationSettings(body: Partial<TenantNotificationSettings>): Promise<TenantNotificationSettings> {
  return createBrowserApiClient().postData<TenantNotificationSettings>('notifications/settings/update', body);
}

export async function listNotificationTemplates(): Promise<NotificationTemplate[]> {
  return createBrowserApiClient().getData<NotificationTemplate[]>('notification-templates');
}

export async function saveNotificationTemplate(body: {
  id?: string;
  name: string;
  channel: NotificationTemplate['channel'];
  subject?: string | null;
  content: Record<string, unknown>;
  isActive?: boolean;
}): Promise<NotificationTemplate> {
  const api = createBrowserApiClient();
  if (body.id) {
    return api.patch<{ success: boolean; data: NotificationTemplate }>(`notification-templates/${body.id}`, {
      subject: body.subject,
      content: body.content,
      isActive: body.isActive,
    }).then((response) => response.data);
  }
  return api.postData<NotificationTemplate>('notification-templates', body);
}

export async function previewNotificationTemplate(body: {
  name: string;
  channel: NotificationTemplate['channel'];
  subject?: string | null;
  content: Record<string, unknown>;
  variables: Record<string, unknown>;
}): Promise<{ subject: string; text: string; html: string }> {
  return createBrowserApiClient().postData<{ subject: string; text: string; html: string }>('notification-templates/preview', body);
}

export async function testSendNotificationTemplate(body: {
  name: string;
  channel: NotificationTemplate['channel'];
  subject?: string | null;
  content: Record<string, unknown>;
  variables: Record<string, unknown>;
  recipient: string;
}): Promise<NotificationHistoryItem> {
  return createBrowserApiClient().postData<NotificationHistoryItem>('notification-templates/test-send', body);
}

export async function listNotificationLogs(): Promise<NotificationLog[]> {
  return createBrowserApiClient().getData<NotificationLog[]>('notifications/logs');
}

export async function sendNotification(body: {
  type: string;
  channel: 'email' | 'sms' | 'push';
  recipient?: string;
  payload: Record<string, unknown>;
}): Promise<NotificationHistoryItem> {
  return createBrowserApiClient().postData<NotificationHistoryItem>('notifications/send', body);
}
