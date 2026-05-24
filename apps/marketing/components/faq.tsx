import { FaqAccordion, type FaqItem } from './faq-accordion';
import { SectionHeader } from './section-header';
import { cn } from '@/lib/cn';

type FaqProps = {
  items: FaqItem[];
  title?: string;
  subtitle?: string;
  className?: string;
};

export function Faq({ items, title = 'Frequently asked questions', subtitle, className }: FaqProps) {
  return (
    <div className={cn('mx-auto w-full max-w-3xl', className)}>
      <SectionHeader title={title} subtitle={subtitle} align="center" titleAs="h2" />
      <FaqAccordion items={items} />
    </div>
  );
}
