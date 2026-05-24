import { FeatureCard } from './feature-card';
import type { FeatureGridItem } from '@/lib/features-data';
import { cn } from '@/lib/cn';

type FeatureGridProps = {
  items: FeatureGridItem[];
  compact?: boolean;
  columns?: 2 | 3 | 4;
  className?: string;
};

const columnClasses = {
  2: 'sm:grid-cols-2',
  3: 'sm:grid-cols-2 lg:grid-cols-3',
  4: 'sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
};

export function FeatureGrid({
  items,
  compact = false,
  columns = 4,
  className,
}: FeatureGridProps) {
  return (
    <ul className={cn('grid auto-rows-fr gap-4 sm:gap-5', columnClasses[columns], className)}>
      {items.map((item) => (
        <li key={item.title} className="min-h-0">
          <FeatureCard
            title={item.title}
            description={item.description}
            icon={item.icon}
            compact={compact}
          />
        </li>
      ))}
    </ul>
  );
}
