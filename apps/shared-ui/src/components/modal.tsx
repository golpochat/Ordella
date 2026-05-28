import * as React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { cva, type VariantProps } from 'class-variance-authority';
import { X } from 'lucide-react';
import { cn } from '../lib/utils';
import {
  odsModalContent,
  odsModalContentDesktop,
  odsModalContentMobile,
  odsModalOverlay,
} from '../lib/motion';
import { IconButton } from './icon-button';
import { Flex } from './layout/flex';

const Modal = DialogPrimitive.Root;
const ModalTrigger = DialogPrimitive.Trigger;
const ModalPortal = DialogPrimitive.Portal;
const ModalClose = DialogPrimitive.Close;

const ModalOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      cn('fixed inset-0 z-50 bg-foreground/40', odsModalOverlay),
      className,
    )}
    {...props}
  />
));
ModalOverlay.displayName = DialogPrimitive.Overlay.displayName;

const modalContentVariants = cva(
  [
    'fixed z-50 flex w-[calc(100%-2rem)] max-h-[min(90vh,calc(100dvh-2rem))] flex-col overflow-hidden rounded-lg border border-border-default bg-card p-0 shadow-lg data-[ods-elevation=lg]:shadow-lg',
    odsModalContent,
    'max-[480px]:inset-x-0 max-[480px]:bottom-0 max-[480px]:top-auto max-[480px]:max-h-[92dvh] max-[480px]:w-full max-[480px]:translate-x-0 max-[480px]:translate-y-0 max-[480px]:rounded-t-lg',
    'min-[481px]:left-1/2 min-[481px]:top-1/2 min-[481px]:-translate-x-1/2 min-[481px]:-translate-y-1/2 min-[481px]:rounded-lg',
    odsModalContentMobile,
    odsModalContentDesktop,
  ].join(' '),
  {
    variants: {
      size: {
        sm: 'min-[481px]:max-w-sm',
        md: 'min-[481px]:max-w-lg',
        lg: 'min-[481px]:max-w-3xl',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  },
);

export interface ModalContentProps
  extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>,
    VariantProps<typeof modalContentVariants> {
  closeOnOverlayClick?: boolean;
  showClose?: boolean;
}

const ModalContent = React.forwardRef<React.ElementRef<typeof DialogPrimitive.Content>, ModalContentProps>(
  ({ className, children, size, closeOnOverlayClick = true, showClose = true, ...props }, ref) => (
    <ModalPortal>
      <ModalOverlay />
      <DialogPrimitive.Content
        ref={ref}
        aria-modal="true"
        data-ods-elevation="lg"
        className={cn(modalContentVariants({ size }), className)}
        onPointerDownOutside={(event) => {
          if (!closeOnOverlayClick) {
            event.preventDefault();
          }
        }}
        onEscapeKeyDown={(event) => {
          if (!closeOnOverlayClick) {
            event.preventDefault();
          }
        }}
        {...props}
      >
        {children}
        {showClose ? (
          <ModalClose asChild>
            <IconButton
              aria-label="Close"
              size="sm"
              className="absolute right-4 top-4 z-10"
            >
              <X className="h-4 w-4" />
            </IconButton>
          </ModalClose>
        ) : null}
      </DialogPrimitive.Content>
    </ModalPortal>
  ),
);
ModalContent.displayName = DialogPrimitive.Content.displayName;

const ModalHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn('flex shrink-0 flex-col gap-2 border-b border-border-subtle p-6 pr-14 text-left', className)}
    {...props}
  />
);
ModalHeader.displayName = 'ModalHeader';

const ModalBody = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('min-h-0 flex-1 overflow-y-auto p-6', className)} {...props} />
);
ModalBody.displayName = 'ModalBody';

const ModalFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      'flex shrink-0 flex-wrap items-center justify-end gap-2 border-t border-border-subtle bg-background p-6',
      className,
    )}
    {...props}
  />
);
ModalFooter.displayName = 'ModalFooter';

const ModalTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn('text-lg font-semibold leading-none tracking-tight text-foreground', className)}
    {...props}
  />
));
ModalTitle.displayName = DialogPrimitive.Title.displayName;

const ModalDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn('text-sm text-muted-foreground', className)}
    {...props}
  />
));
ModalDescription.displayName = DialogPrimitive.Description.displayName;

export type DialogFooterActionsProps = {
  children: React.ReactNode;
  className?: string;
};

/** End-aligned footer actions — secondary before primary. */
export function DialogFooterActions({ children, className }: DialogFooterActionsProps) {
  return (
    <Flex gap="sm" wrap align="center" justify="end" className={cn('w-full', className)}>
      {children}
    </Flex>
  );
}

export {
  Modal,
  ModalPortal,
  ModalOverlay,
  ModalTrigger,
  ModalClose,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalTitle,
  ModalDescription,
  modalContentVariants,
};
