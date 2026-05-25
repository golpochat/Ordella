import { PageHeader } from '@/components/ui/page-header';
import { StaffManagementPanel } from '@/components/staff/staff-management-panel';

export default function StaffPage() {
  return (
    <>
      <PageHeader
        title="Staff"
        description="Manage business staff, roles, permissions, and location access."
      />
      <StaffManagementPanel />
    </>
  );
}
