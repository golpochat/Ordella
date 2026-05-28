import { NavSection, type NavSectionProps } from './nav-section';

export type SidebarSectionProps = NavSectionProps;

/** @deprecated Use `NavSection` — kept for backward compatibility. */
export function SidebarSection(props: SidebarSectionProps) {
  return <NavSection {...props} />;
}
