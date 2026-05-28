import Link from 'next/link';
import {
  Button,
  PageHeader as OdsPageHeader,
  ShortcutHint,
  PageHeaderActions,
  PageHeaderDescription,
  PageHeaderTabs,
  PageHeaderTitle,
  type PageHeaderProps as OdsPageHeaderProps,
} from '@shared-ui';

export {
  OdsPageHeader as PageHeader,
  PageHeaderActions,
  PageHeaderDescription,
  PageHeaderTabs,
  PageHeaderTitle,
};

export type PageHeaderAction = {
  label: string;
  href: string;
  variant?: 'primary' | 'secondary';
  /** Show ODS shortcut hint (e.g. `n` for create). */
  shortcut?: string;
};

export type AdminPageHeaderProps = OdsPageHeaderProps & {
  /** @deprecated Use `actions` with `PageHeaderActionLink` or custom buttons. */
  action?: PageHeaderAction;
};

export function PageHeaderActionLink({ label, href, variant = 'primary', shortcut }: PageHeaderAction) {
  return (
    <span className="inline-flex items-center gap-2">
      <Button asChild variant={variant === 'secondary' ? 'outline' : 'default'}>
        <Link href={href}>{label}</Link>
      </Button>
      {shortcut ? <ShortcutHint combo={shortcut} /> : null}
    </span>
  );
}

/** Admin page header with legacy `action` prop support. */
export function AdminPageHeader({ action, actions, ...props }: AdminPageHeaderProps) {
  const resolvedActions = actions ?? (action ? <PageHeaderActionLink {...action} /> : undefined);
  return <OdsPageHeader {...props} actions={resolvedActions} />;
}
