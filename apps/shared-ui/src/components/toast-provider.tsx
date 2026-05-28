'use client';

import * as React from 'react';
import { ToastContainer, TOAST_DURATIONS, type ToastVariant } from './toast';

export const TOAST_LIMIT = 3;

export type ToastInput = {
  variant?: ToastVariant;
  title?: string;
  description: string;
  duration?: number | null;
};

type ToastRecord = ToastInput & {
  id: string;
  variant: ToastVariant;
};

type ToastContextValue = {
  toast: (input: ToastInput) => string;
  dismiss: (id: string) => void;
};

const ToastContext = React.createContext<ToastContextValue | null>(null);

function createToastId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `toast-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export interface ToastProviderProps {
  children: React.ReactNode;
}

export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = React.useState<ToastRecord[]>([]);

  const dismiss = React.useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const toast = React.useCallback((input: ToastInput) => {
    const id = createToastId();
    const variant = input.variant ?? 'info';
    const duration = input.duration === undefined ? TOAST_DURATIONS[variant] : input.duration;

    setToasts((current) => [{ ...input, id, variant, duration }, ...current].slice(0, TOAST_LIMIT));
    return id;
  }, []);

  const value = React.useMemo(() => ({ toast, dismiss }), [toast, dismiss]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer
        toasts={toasts.map(({ id, variant, title, description, duration }) => ({
          id,
          variant,
          title,
          description,
          duration,
        }))}
        onDismiss={dismiss}
      />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
}
