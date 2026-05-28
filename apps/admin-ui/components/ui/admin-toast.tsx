'use client';

import {
  Toast,
  ToastCloseButton,
  ToastContainer,
  ToastDescription,
  ToastIcon,
  ToastProvider,
  ToastTitle,
  useToast,
  type ToastInput,
  type ToastVariant,
} from '@shared-ui';

export {
  Toast,
  ToastCloseButton,
  ToastContainer,
  ToastDescription,
  ToastIcon,
  ToastProvider,
  ToastTitle,
  useToast,
};
export type { ToastInput, ToastVariant };

/** Infer toast variant from feedback copy (errors vs warnings vs success). */
export function inferToastVariant(message: string): ToastVariant {
  const lower = message.toLowerCase();
  if (/(^|\s)(fail|failed|error|unable|invalid|denied|rejected)(\s|$)/.test(lower)) return 'error';
  if (/(warn|warning|partial|retry)/.test(lower)) return 'warning';
  return 'success';
}

/** Admin toast helpers — semantic variants + standard durations. */
export function useAdminToast() {
  const { toast, dismiss } = useToast();

  return {
    toast,
    dismiss,
    success: (description: string, title?: string) =>
      toast({ variant: 'success', description, title }),
    error: (description: string, title?: string) =>
      toast({ variant: 'error', description, title }),
    warning: (description: string, title?: string) =>
      toast({ variant: 'warning', description, title }),
    info: (description: string, title?: string) => toast({ variant: 'info', description, title }),
    notify: (description: string, title?: string) =>
      toast({ variant: inferToastVariant(description), description, title }),
  };
}
