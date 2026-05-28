import { FormErrorAlert } from '@/components/ui/admin-form-validation';

/** Page- or section-level API error — ODS Alert error variant. */
export function ApiErrorBanner({ message, title }: { message: string; title?: string }) {
  return <FormErrorAlert message={message} title={title ?? 'Something went wrong'} className="mb-4" />;
}
