'use client';

import * as React from 'react';
import { useRef } from 'react';
import {
  Button,
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Flex,
  Stack,
  type DialogContentProps,
} from '@shared-ui';
import { useShortcutModalLock } from '@/components/ui/admin-shortcuts';
import { useTranslation } from '@/components/ui/admin-i18n';

export {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  type DialogContentProps,
};

/** @deprecated Use `Dialog` compound components. */
export {
  Modal,
  ModalBody,
  ModalContent,
  ModalDescription,
  ModalFooter,
  ModalHeader,
  ModalTitle,
  ModalTrigger,
} from '@shared-ui';

export type AdminDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  size?: DialogContentProps['size'];
  closeOnOverlayClick?: boolean;
  showClose?: boolean;
  destructive?: boolean;
  trigger?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
};

/** Standard ODS dialog — header, scrollable body, footer; mobile sheet on narrow viewports. */
export function AdminDialog({
  open,
  onOpenChange,
  title,
  description,
  size = 'md',
  closeOnOverlayClick = true,
  showClose = true,
  destructive = false,
  trigger,
  children,
  footer,
  className,
}: AdminDialogProps) {
  const allowDismiss = closeOnOverlayClick && !destructive;
  useShortcutModalLock(open);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger ? <DialogTrigger asChild>{trigger}</DialogTrigger> : null}
      <DialogContent
        size={size}
        closeOnOverlayClick={allowDismiss}
        showClose={showClose && allowDismiss}
        className={className}
      >
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description ? <DialogDescription>{description}</DialogDescription> : null}
        </DialogHeader>
        <DialogBody>{children}</DialogBody>
        {footer ? <DialogFooter>{footer}</DialogFooter> : null}
      </DialogContent>
    </Dialog>
  );
}

export type DialogFooterActionsProps = {
  children: React.ReactNode;
};

/** Footer action row — secondary left of primary, end-aligned. */
export function DialogFooterActions({ children }: DialogFooterActionsProps) {
  return (
    <Flex gap="sm" wrap align="center" justify="end" className="w-full">
      {children}
    </Flex>
  );
}

export type ConfirmDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  loading?: boolean;
  onConfirm: () => void | Promise<void>;
  children?: React.ReactNode;
  size?: DialogContentProps['size'];
};

/** Confirmation dialog — destructive variant blocks backdrop/ESC and focuses cancel. */
export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  cancelLabel,
  destructive = true,
  loading = false,
  onConfirm,
  children,
  size = 'sm',
}: ConfirmDialogProps) {
  const { t } = useTranslation();
  const resolvedConfirm = confirmLabel ?? t('common.confirm');
  const resolvedCancel = cancelLabel ?? t('common.cancel');
  const cancelRef = useRef<HTMLButtonElement>(null);
  useShortcutModalLock(open);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        size={size}
        closeOnOverlayClick={!destructive}
        showClose={!destructive}
        onOpenAutoFocus={(event) => {
          if (destructive) {
            event.preventDefault();
            cancelRef.current?.focus();
          }
        }}
      >
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description ? <DialogDescription>{description}</DialogDescription> : null}
        </DialogHeader>
        {children ? (
          <DialogBody>
            <Stack gap="sm">{children}</Stack>
          </DialogBody>
        ) : null}
        <DialogFooter>
          <DialogFooterActions>
            <Button
              ref={cancelRef}
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              {resolvedCancel}
            </Button>
            <Button
              type="button"
              variant={destructive ? 'destructive' : 'default'}
              isLoading={loading}
              loadingLabel={t('common.working')}
              onClick={() => void onConfirm()}
            >
              {resolvedConfirm}
            </Button>
          </DialogFooterActions>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export type DeleteConfirmDialogProps = Omit<ConfirmDialogProps, 'destructive' | 'confirmLabel'> & {
  confirmLabel?: string;
  itemName?: string;
};

/** Delete confirmation — destructive, non-dismissible overlay. */
export function DeleteConfirmDialog({
  title,
  description,
  confirmLabel,
  itemName,
  ...props
}: DeleteConfirmDialogProps) {
  const { t } = useTranslation();
  const resolvedTitle =
    title ??
    (itemName
      ? t('dialog.deleteTitleNamed', { name: itemName })
      : t('dialog.deleteTitle'));

  return (
    <ConfirmDialog
      {...props}
      title={resolvedTitle}
      description={description ?? t('dialog.deleteDescription')}
      confirmLabel={confirmLabel ?? t('common.delete')}
      destructive
    />
  );
}

export type DisableConfirmDialogProps = Omit<ConfirmDialogProps, 'destructive' | 'confirmLabel'> & {
  itemName?: string;
};

/** Disable / deactivate confirmation. */
export function DisableConfirmDialog({
  title,
  description,
  itemName,
  ...props
}: DisableConfirmDialogProps) {
  const { t } = useTranslation();
  const resolvedTitle =
    title ??
    (itemName
      ? t('dialog.disableTitleNamed', { name: itemName })
      : t('dialog.disableTitle'));

  return (
    <ConfirmDialog
      {...props}
      title={resolvedTitle}
      description={description ?? t('dialog.disableDescription')}
      confirmLabel={confirmLabel ?? t('common.disable')}
      destructive
    />
  );
}

export type IrreversibleConfirmDialogProps = Omit<ConfirmDialogProps, 'destructive'>;

/** Irreversible workflow confirmation (publish, archive, purge). */
export function IrreversibleConfirmDialog({
  description,
  confirmLabel,
  ...props
}: IrreversibleConfirmDialogProps) {
  const { t } = useTranslation();
  return (
    <ConfirmDialog
      {...props}
      description={description ?? t('dialog.irreversibleDescription')}
      confirmLabel={confirmLabel ?? t('common.continue')}
      destructive
    />
  );
}

export type ConfirmModalProps = ConfirmDialogProps;

/** @deprecated Use `ConfirmDialog`. */
export const ConfirmModal = ConfirmDialog;

/** @deprecated Use `AdminDialog`. */
export const AdminModal = AdminDialog;

export type FormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  footer: React.ReactNode;
  trigger?: React.ReactNode;
  size?: DialogContentProps['size'];
  closeOnOverlayClick?: boolean;
  className?: string;
};

/** Form dialog with scrollable body. */
export function FormDialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  trigger,
  size = 'md',
  closeOnOverlayClick = true,
  className,
}: FormDialogProps) {
  return (
    <AdminDialog
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description={description}
      size={size}
      closeOnOverlayClick={closeOnOverlayClick}
      trigger={trigger}
      footer={<DialogFooterActions>{footer}</DialogFooterActions>}
      className={className}
    >
      {children}
    </AdminDialog>
  );
}

export type FormModalProps = FormDialogProps;

/** @deprecated Use `FormDialog`. */
export const FormModal = FormDialog;

export type UseConfirmActionOptions<T> = {
  onConfirm: (payload: T) => void | Promise<void>;
};

/** Hook for open/loading/payload state on confirmation dialogs. */
export function useConfirmAction<T>() {
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [payload, setPayload] = React.useState<T | null>(null);

  function request(next: T) {
    setPayload(next);
    setOpen(true);
  }

  function dismiss() {
    setOpen(false);
    setPayload(null);
  }

  return {
    open,
    loading,
    payload,
    request,
    dismiss,
    setOpen,
    setLoading,
    setPayload,
  };
}
