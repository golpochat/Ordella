import { PageLoader } from '@/components/ui/admin-loader';

/** Route-level skeleton while dashboard segments load (perceived performance). */
export default function DashboardLoading() {
  return <PageLoader label="Loading page" />;
}
