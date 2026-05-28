'use client';

import { AdminUrlPagination, type AdminUrlPaginationProps } from '@/components/ui/admin-pagination';

type AuditLogsPaginationProps = Omit<AdminUrlPaginationProps, 'pageSize'> & {
  limit: number;
};

export function AuditLogsPagination({ limit, ...props }: AuditLogsPaginationProps) {
  return <AdminUrlPagination pageSize={limit} pageSizeOptions={[25, 50, 100]} {...props} />;
}
