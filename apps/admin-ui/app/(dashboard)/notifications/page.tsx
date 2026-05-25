import { PageHeader } from '@/components/ui/page-header';
import { NotificationsPanel } from '@/components/notifications/notifications-panel';

export default function NotificationsPage() {
  return (
    <>
      <PageHeader
        title="Notifications"
        description="Manage email, SMS, and push notification preferences and delivery history."
      />
      <NotificationsPanel />
    </>
  );
}
